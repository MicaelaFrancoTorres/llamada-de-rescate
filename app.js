// Interfaz: los datos viven en `estado` y `render()` dibuja la pantalla (clase 6)

const HISTORY_KEY = "rescate-historial";

// localStorage puede estar bloqueado o tener datos rotos: en ese caso se arranca en 0
function readHistory() {
  try {
    // el formato guardado conserva la clave "rechazos" para no perder historiales ya existentes
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return normalizeHistory({ escapes: saved?.escapes, rejections: saved?.rechazos });
  } catch {
    return normalizeHistory(null);
  }
}

function record(result) {
  state.history = recordResult(state.history, result);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify({ escapes: state.history.escapes, rechazos: state.history.rejections }));
  } catch {
    // sin almacenamiento: el contador sigue en memoria
  }
}

const state = {
  screen: "inicio", place: null, desire: 5, rescue: null, seconds: 0, notice: "",
  endEmoji: "", endMessage: "",
  turns: 0,          // cuántos turnos del diálogo ya se revelaron
  finished: false,   // la conversación llegó al último turno
  delay: 0,          // segundos antes de que suene (0 = ya)
  countdown: 0,          // segundos que faltan en la cuenta regresiva
  history: readHistory(),
  name: "",         // nombre de contacto opcional
};

// Transiciones válidas (spec, sección 6). Cualquier otra se ignora.
const TRANSITIONS = {
  inicio: ["esperando", "sonando"],
  esperando: ["sonando"],
  sonando: ["en-llamada", "fin"],
  "en-llamada": ["fin"],
  fin: ["inicio"],
};

const STATE_TEXTS = { sonando: "Llamada entrante...", "en-llamada": "En llamada", fin: "Llamada finalizada" };
const FACES = ["😐", "😐", "🙂", "😕", "😕", "😩", "😩", "😱", "😱", "🔥"];
const hasVoice = "speechSynthesis" in window;

let audio = null;
let ringtoneId = null;
let clockId = null;
let countdownId = null;
let pauseId = null;
let session = 0;          // cambia al cortar: ignora los avisos viejos de la voz
let drawnTurns = 0; // el chat solo agrega burbujas nuevas, así el lector de pantalla no relee todo

const query = (selector) => document.querySelector(selector);

// Solo escribe si el texto cambió, para no molestar a las regiones aria-live
function setText(selector, text) {
  const element = query(selector);
  if (element.textContent !== text) element.textContent = text;
}

const formatClock = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const buildBubble = ({ who, text }) =>
  `<li class="burbuja ${who}">${who === "vos" ? '<span aria-hidden="true">💬</span> Decí: ' : ""}${text}</li>`;

function goTo(screen) {
  if (!TRANSITIONS[state.screen].includes(screen)) return;
  state.screen = screen;
  render();
}

function render() {
  const { screen, rescue } = state;
  const onStart = screen === "inicio" || screen === "esperando";
  query("#inicio").hidden = !onStart;
  query("#llamada").hidden = onStart;
  query("#btnRescate").disabled = screen === "esperando";
  setText("#ganasNumero", `${state.desire}/10`);
  setText("#ganasCara", FACES[state.desire - 1]);
  setText("#aviso", state.notice);
  setText("#escapes", String(state.history.escapes));
  setText("#rechazos", String(state.history.rejections));

  if (!rescue) return;
  const ringing = screen === "sonando";
  const onCall = screen === "en-llamada";
  setText("#avatar", rescue.avatar);
  setText("#quien", rescue.who);
  setText("#estado", STATE_TEXTS[screen] ?? "");
  setText("#reloj", formatClock(state.seconds));
  query("#llamada").classList.toggle("sonando", ringing);
  query("#btnRechazar").hidden = !ringing;
  query("#btnAtender").hidden = !ringing;
  query("#reloj").hidden = !onCall;
  query("#guion").hidden = !onCall;
  query("#escape").hidden = !state.finished;
  query("#btnCortar").hidden = !onCall || !state.finished;
  query("#mensajeFin").hidden = screen !== "fin";
  query("#btnVolver").hidden = screen !== "fin";

  if (state.turns < drawnTurns) {
    query("#chat").innerHTML = "";
    drawnTurns = 0;
  }
  rescue.dialogue
    .slice(drawnTurns, state.turns)
    .forEach((turn) => query("#chat").insertAdjacentHTML("beforeend", buildBubble(turn)));
  drawnTurns = state.turns;

  query("#pasos").innerHTML = rescue.steps.map((step) => `<li>${step}</li>`).join("");
  setText("#dato", `Credibilidad: ${rescue.credibility}% · Escape en ${rescue.seconds} s`);
  setText("#emojiFin", state.endEmoji);
  setText("#textoFin", state.endMessage);
}

// Sonido generado con el navegador, sin archivos de audio
function playRingtone() {
  const playTone = () => {
    const oscillator = audio.createOscillator();
    oscillator.frequency.value = 880;
    oscillator.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.4);
  };
  playTone();
  ringtoneId = setInterval(playTone, 1500);
}

function startRinging() {
  playRingtone();
  goTo("sonando");
}

// ===== Conversación: un turno por vez, con voz o con espera =====
function waitThen(milliseconds, action) {
  clearTimeout(pauseId);
  pauseId = setTimeout(action, milliseconds);
}

// Quien llama suena con la voz de su personaje; vos, siempre con una voz distinta
function voiceSettings(who) {
  const { caller, you, replyAdjustment } = pickVoices(speechSynthesis.getVoices());
  if (who === "llama") return { voice: caller, ...state.rescue.voice };
  return { voice: you ?? caller, ...replyAdjustment };
}

function readAloud(text, { voice, pitch, rate }, onFinish) {
  const mySession = session;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? "es-AR"; // sin voz en español: la voz por defecto, en es-AR
  if (voice) utterance.voice = voice;
  utterance.pitch = pitch;
  utterance.rate = rate;

  let done = false;
  const finish = () => {
    if (done || mySession !== session) return;
    done = true;
    onFinish();
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  speechSynthesis.speak(utterance);
  waitThen(15000, finish); // red de seguridad si el navegador nunca avisa que terminó
}

function nextTurn() {
  const { dialogue } = state.rescue;
  if (state.turns >= dialogue.length) {
    state.finished = true; // aparecen los pasos y el botón Cortar
    return render();
  }
  const { who, text } = dialogue[state.turns];
  state.turns++;
  render();

  const proceed = () => waitThen(hasVoice ? 500 : who === "llama" ? 2500 : 3000, nextTurn);
  if (hasVoice) readAloud(text, voiceSettings(who), proceed);
  else proceed();
}

function stopAll() {
  clearInterval(ringtoneId);
  clearInterval(clockId);
  clearInterval(countdownId);
  clearTimeout(pauseId);
  session++;
  if (hasVoice) speechSynthesis.cancel();
}

function endCall(result, emoji, message) {
  stopAll();
  record(result);
  state.endEmoji = emoji;
  state.endMessage = message;
  goTo("fin");
}

// ===== Rescate =====
function rescueNow() {
  const rescue = buildRescue(state.place, state.desire, state.name);
  if (!rescue) {
    state.notice = "⚠️ Primero elegí dónde estás";
    return render();
  }
  state.rescue = rescue;
  state.seconds = 0;
  audio ??= new AudioContext();
  audio.resume(); // el navegador pide un gesto del usuario: se habilita ahora y suena después
  if (state.delay === 0) return startRinging();

  state.countdown = state.delay;
  state.notice = `⏳ Sonando en ${state.countdown} s...`;
  goTo("esperando");
  countdownId = setInterval(() => {
    state.countdown--;
    if (state.countdown > 0) {
      state.notice = `⏳ Sonando en ${state.countdown} s...`;
      return render();
    }
    clearInterval(countdownId);
    state.notice = "";
    startRinging();
  }, 1000);
}

// ===== Eventos =====
document.querySelectorAll("input[name=lugar]").forEach((radio) => {
  radio.addEventListener("change", () => {
    state.place = radio.value;
    if (state.screen === "inicio") state.notice = "";
    render();
  });
});

document.querySelectorAll("input[name=demora]").forEach((radio) => {
  radio.addEventListener("change", () => {
    state.delay = Number(radio.value);
  });
});

query("#ganas").addEventListener("input", (event) => {
  state.desire = Number(event.target.value);
  render();
});

query("#nombre").addEventListener("input", (event) => {
  state.name = event.target.value;
});

query("#btnRescate").addEventListener("click", rescueNow);

// Atajo secreto: la tecla R dispara el rescate (sin lugar elegido usa "cumple")
document.addEventListener("keydown", (event) => {
  const typing = event.target.matches("input[type=text], textarea, select");
  if (event.key.toLowerCase() !== "r" || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  if (typing || state.screen !== "inicio") return;
  if (!state.place) {
    state.place = "cumple";
    query("input[name=lugar][value=cumple]").checked = true;
  }
  rescueNow();
});

query("#btnAtender").addEventListener("click", () => {
  clearInterval(ringtoneId);
  state.turns = 0;
  state.finished = false;
  if (hasVoice) speechSynthesis.cancel(); // se habla directo en este clic, sin esperar voiceschanged
  clockId = setInterval(() => {
    state.seconds++;
    render();
  }, 1000);
  goTo("en-llamada");
  nextTurn();
});

query("#btnRechazar").addEventListener("click", () => {
  endCall("rechazo", "😶", "Rechazaste tu propio rescate. Te quedás.");
});

query("#btnCortar").addEventListener("click", () => {
  endCall("escape", "🏃", "¡Escapaste con éxito! Nadie sospechó nada.");
});

query("#btnVolver").addEventListener("click", () => goTo("inicio"));

render();
