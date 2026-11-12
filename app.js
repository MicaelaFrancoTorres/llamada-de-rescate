// Interfaz: los datos viven en `estado` y `render()` dibuja la pantalla (clase 6)

const CLAVE_HISTORIAL = "rescate-historial";

// localStorage puede estar bloqueado o tener datos rotos: en ese caso se arranca en 0
function leerHistorial() {
  try {
    return normalizarHistorial(JSON.parse(localStorage.getItem(CLAVE_HISTORIAL)));
  } catch {
    return normalizarHistorial(null);
  }
}

function registrar(resultado) {
  estado.historial = registrarResultado(estado.historial, resultado);
  try {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(estado.historial));
  } catch {
    // sin almacenamiento: el contador sigue en memoria
  }
}

const estado = {
  pantalla: "inicio", lugar: null, ganas: 5, rescate: null, segundos: 0, aviso: "", mensajeFin: "",
  turnos: 0,          // cuántos turnos del diálogo ya se revelaron
  terminado: false,   // la conversación llegó al último turno
  practica: false,    // modo práctica: también se leen tus frases
  demora: 0,          // segundos antes de que suene (0 = ya)
  espera: 0,          // segundos que faltan en la cuenta regresiva
  historial: leerHistorial(),
};

// Transiciones válidas (spec, sección 6). Cualquier otra se ignora.
const TRANSICIONES = {
  inicio: ["esperando", "sonando"],
  esperando: ["sonando"],
  sonando: ["en-llamada", "fin"],
  "en-llamada": ["fin"],
  fin: ["inicio"],
};

const $ = (selector) => document.querySelector(selector);
const CARAS = ["😐", "😐", "🙂", "😕", "😕", "😩", "😩", "😱", "😱", "🔥"];
const hayVoz = "speechSynthesis" in window;
let audio = null;
let timbre = null;
let reloj = null;
let cuenta = null;
let pausa = null;
let sesion = 0; // cambia al cortar: ignora callbacks viejos de la voz

function irA(pantalla) {
  if (!TRANSICIONES[estado.pantalla].includes(pantalla)) return;
  estado.pantalla = pantalla;
  render();
}

function render() {
  const { pantalla, rescate } = estado;
  const enInicio = pantalla === "inicio" || pantalla === "esperando";
  $("#inicio").hidden = !enInicio;
  $("#llamada").hidden = enInicio;
  $("#btnRescate").disabled = pantalla === "esperando";
  $("#ganasTxt").textContent = `${estado.ganas}/10 ${CARAS[estado.ganas - 1]}`;
  $("#aviso").textContent = estado.aviso;
  $("#historial").textContent = `🏃 Escapes exitosos: ${estado.historial.escapes} · 😶 Rechazados: ${estado.historial.rechazos}`;

  if (!rescate) return;
  $("#avatar").textContent = rescate.avatar;
  $("#quien").textContent = rescate.quien;
  $("#llamada").classList.toggle("sonando", pantalla === "sonando");
  $("#entrante").hidden = pantalla !== "sonando";
  $("#guion").hidden = pantalla !== "en-llamada";
  $("#escape").hidden = !estado.terminado;
  $("#btnCortar").hidden = pantalla !== "en-llamada" || !estado.terminado;
  $("#fin").hidden = pantalla !== "fin";

  const textosEstado = { sonando: "Llamada entrante...", "en-llamada": `00:${String(estado.segundos).padStart(2, "0")}`, fin: "Llamada finalizada" };
  $("#estado").textContent = textosEstado[pantalla] ?? "";

  $("#chat").innerHTML = rescate.dialogo
    .slice(0, estado.turnos)
    .map(({ quien, texto }) => `<p class="burbuja ${quien}">${quien === "vos" ? "💬 Decí: " : ""}${texto}</p>`)
    .join("");
  $("#pasos").innerHTML = rescate.pasos.map((paso) => `<li>${paso}</li>`).join("");
  $("#dato").textContent = `Credibilidad: ${rescate.credibilidad}% · Escape en ${rescate.segundos} s`;
  $("#mensajeFin").textContent = estado.mensajeFin;
}

// Sonido generado con el navegador, sin archivos de audio
function sonarTimbre() {
  const tono = () => {
    const oscilador = audio.createOscillator();
    oscilador.frequency.value = 880;
    oscilador.connect(audio.destination);
    oscilador.start();
    oscilador.stop(audio.currentTime + 0.4);
  };
  tono();
  timbre = setInterval(tono, 1500);
}

function empezarASonar() {
  sonarTimbre();
  irA("sonando");
}

// ===== Conversación: un turno por vez, con voz o con espera =====
function esperar(ms, accion) {
  clearTimeout(pausa);
  pausa = setTimeout(accion, ms);
}

function leer(texto, pitch, alTerminar) {
  const miSesion = sesion;
  const voces = speechSynthesis.getVoices();
  const voz = voces.find((v) => v.lang.replace("_", "-") === "es-AR") ?? voces.find((v) => v.lang.startsWith("es-ES"));
  const lectura = new SpeechSynthesisUtterance(texto);
  lectura.lang = voz?.lang ?? "es-AR";
  if (voz) lectura.voice = voz;
  lectura.pitch = pitch;

  let listo = false;
  const fin = () => {
    if (listo || miSesion !== sesion) return;
    listo = true;
    alTerminar();
  };
  lectura.onend = fin;
  lectura.onerror = fin;
  speechSynthesis.speak(lectura);
  esperar(15000, fin); // red de seguridad si el navegador nunca avisa que terminó
}

function siguienteTurno() {
  const { dialogo } = estado.rescate;
  if (estado.turnos >= dialogo.length) {
    estado.terminado = true; // aparecen los pasos y el botón Cortar
    return render();
  }
  const { quien, texto } = dialogo[estado.turnos];
  estado.turnos++;
  render();

  const seguir = () => esperar(quien === "llama" ? (hayVoz ? 500 : 2500) : 3000, siguienteTurno);
  if (hayVoz && (quien === "llama" || estado.practica)) leer(texto, quien === "llama" ? 1 : 0.8, seguir);
  else seguir();
}

function cortarTodo() {
  clearInterval(timbre);
  clearInterval(reloj);
  clearInterval(cuenta);
  clearTimeout(pausa);
  sesion++;
  if (hayVoz) speechSynthesis.cancel();
}

// ===== Eventos =====
document.querySelectorAll("input[name=lugar]").forEach((radio) => {
  radio.addEventListener("change", () => {
    estado.lugar = radio.value;
    if (estado.pantalla === "inicio") estado.aviso = "";
    render();
  });
});

document.querySelectorAll("input[name=demora]").forEach((radio) => {
  radio.addEventListener("change", () => {
    estado.demora = Number(radio.value);
  });
});

$("#ganas").addEventListener("input", (e) => {
  estado.ganas = Number(e.target.value);
  render();
});

$("#practica").addEventListener("change", (e) => {
  estado.practica = e.target.checked;
});

$("#btnRescate").addEventListener("click", () => {
  const rescate = armarRescate(estado.lugar, estado.ganas);
  if (!rescate) {
    estado.aviso = "⚠️ Primero elegí dónde estás";
    return render();
  }
  estado.rescate = rescate;
  estado.segundos = 0;
  audio ??= new AudioContext();
  audio.resume(); // el navegador pide un gesto del usuario: se habilita ahora y suena después
  if (estado.demora === 0) return empezarASonar();

  estado.espera = estado.demora;
  estado.aviso = `⏳ Sonando en ${estado.espera} s...`;
  irA("esperando");
  cuenta = setInterval(() => {
    estado.espera--;
    if (estado.espera > 0) {
      estado.aviso = `⏳ Sonando en ${estado.espera} s...`;
      return render();
    }
    clearInterval(cuenta);
    estado.aviso = "";
    empezarASonar();
  }, 1000);
});

$("#btnAtender").addEventListener("click", () => {
  clearInterval(timbre);
  estado.turnos = 0;
  estado.terminado = false;
  reloj = setInterval(() => {
    estado.segundos++;
    render();
  }, 1000);
  irA("en-llamada");
  siguienteTurno();
});

$("#btnRechazar").addEventListener("click", () => {
  cortarTodo();
  registrar("rechazo");
  estado.mensajeFin = "😶 Rechazaste tu propio rescate. Te quedás.";
  irA("fin");
});

$("#btnCortar").addEventListener("click", () => {
  cortarTodo();
  registrar("escape");
  estado.mensajeFin = "🏃 ¡Escapaste con éxito! Nadie sospechó nada.";
  irA("fin");
});

$("#btnVolver").addEventListener("click", () => irA("inicio"));

render();
