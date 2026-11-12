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
  pantalla: "inicio", lugar: null, ganas: 5, rescate: null, segundos: 0, aviso: "",
  emojiFin: "", mensajeFin: "",
  turnos: 0,          // cuántos turnos del diálogo ya se revelaron
  terminado: false,   // la conversación llegó al último turno
  demora: 0,          // segundos antes de que suene (0 = ya)
  espera: 0,          // segundos que faltan en la cuenta regresiva
  historial: leerHistorial(),
  nombre: "",         // nombre de contacto opcional
};

// Transiciones válidas (spec, sección 6). Cualquier otra se ignora.
const TRANSICIONES = {
  inicio: ["esperando", "sonando"],
  esperando: ["sonando"],
  sonando: ["en-llamada", "fin"],
  "en-llamada": ["fin"],
  fin: ["inicio"],
};

const TEXTOS_ESTADO = { sonando: "Llamada entrante...", "en-llamada": "En llamada", fin: "Llamada finalizada" };
const CARAS = ["😐", "😐", "🙂", "😕", "😕", "😩", "😩", "😱", "😱", "🔥"];
const hayVoz = "speechSynthesis" in window;

let audio = null;
let idTimbre = null;
let idReloj = null;
let idCuenta = null;
let idPausa = null;
let sesion = 0;          // cambia al cortar: ignora los avisos viejos de la voz
let turnosDibujados = 0; // el chat solo agrega burbujas nuevas, así el lector de pantalla no relee todo

const buscar = (selector) => document.querySelector(selector);

// Solo escribe si el texto cambió, para no molestar a las regiones aria-live
function escribir(selector, texto) {
  const elemento = buscar(selector);
  if (elemento.textContent !== texto) elemento.textContent = texto;
}

const formatearReloj = (segundos) =>
  `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

const armarBurbuja = ({ quien, texto }) =>
  `<li class="burbuja ${quien}">${quien === "vos" ? '<span aria-hidden="true">💬</span> Decí: ' : ""}${texto}</li>`;

function irA(pantalla) {
  if (!TRANSICIONES[estado.pantalla].includes(pantalla)) return;
  estado.pantalla = pantalla;
  render();
}

function render() {
  const { pantalla, rescate } = estado;
  const enInicio = pantalla === "inicio" || pantalla === "esperando";
  buscar("#inicio").hidden = !enInicio;
  buscar("#llamada").hidden = enInicio;
  buscar("#btnRescate").disabled = pantalla === "esperando";
  escribir("#ganasNumero", `${estado.ganas}/10`);
  escribir("#ganasCara", CARAS[estado.ganas - 1]);
  escribir("#aviso", estado.aviso);
  escribir("#escapes", String(estado.historial.escapes));
  escribir("#rechazos", String(estado.historial.rechazos));

  if (!rescate) return;
  const sonando = pantalla === "sonando";
  const enLlamada = pantalla === "en-llamada";
  escribir("#avatar", rescate.avatar);
  escribir("#quien", rescate.quien);
  escribir("#estado", TEXTOS_ESTADO[pantalla] ?? "");
  escribir("#reloj", formatearReloj(estado.segundos));
  buscar("#llamada").classList.toggle("sonando", sonando);
  buscar("#btnRechazar").hidden = !sonando;
  buscar("#btnAtender").hidden = !sonando;
  buscar("#reloj").hidden = !enLlamada;
  buscar("#guion").hidden = !enLlamada;
  buscar("#escape").hidden = !estado.terminado;
  buscar("#btnCortar").hidden = !enLlamada || !estado.terminado;
  buscar("#mensajeFin").hidden = pantalla !== "fin";
  buscar("#btnVolver").hidden = pantalla !== "fin";

  if (estado.turnos < turnosDibujados) {
    buscar("#chat").innerHTML = "";
    turnosDibujados = 0;
  }
  rescate.dialogo
    .slice(turnosDibujados, estado.turnos)
    .forEach((turno) => buscar("#chat").insertAdjacentHTML("beforeend", armarBurbuja(turno)));
  turnosDibujados = estado.turnos;

  buscar("#pasos").innerHTML = rescate.pasos.map((paso) => `<li>${paso}</li>`).join("");
  escribir("#dato", `Credibilidad: ${rescate.credibilidad}% · Escape en ${rescate.segundos} s`);
  escribir("#emojiFin", estado.emojiFin);
  escribir("#textoFin", estado.mensajeFin);
}

// Sonido generado con el navegador, sin archivos de audio
function sonarTimbre() {
  const sonarTono = () => {
    const oscilador = audio.createOscillator();
    oscilador.frequency.value = 880;
    oscilador.connect(audio.destination);
    oscilador.start();
    oscilador.stop(audio.currentTime + 0.4);
  };
  sonarTono();
  idTimbre = setInterval(sonarTono, 1500);
}

function empezarASonar() {
  sonarTimbre();
  irA("sonando");
}

// ===== Conversación: un turno por vez, con voz o con espera =====
function esperar(milisegundos, accion) {
  clearTimeout(idPausa);
  idPausa = setTimeout(accion, milisegundos);
}

// Quien llama suena con la voz de su personaje; vos, siempre con una voz distinta
function ajusteDeVoz(quien) {
  const { llama, vos, ajusteVos } = elegirVoces(speechSynthesis.getVoices());
  if (quien === "llama") return { voz: llama, ...estado.rescate.voz };
  return { voz: vos ?? llama, ...ajusteVos };
}

function leer(texto, { voz, tono, velocidad }, alTerminar) {
  const miSesion = sesion;
  const lectura = new SpeechSynthesisUtterance(texto);
  lectura.lang = voz?.lang ?? "es-AR"; // sin voz en español: la voz por defecto, en es-AR
  if (voz) lectura.voice = voz;
  lectura.pitch = tono;
  lectura.rate = velocidad;

  let listo = false;
  const terminar = () => {
    if (listo || miSesion !== sesion) return;
    listo = true;
    alTerminar();
  };
  lectura.onend = terminar;
  lectura.onerror = terminar;
  speechSynthesis.speak(lectura);
  esperar(15000, terminar); // red de seguridad si el navegador nunca avisa que terminó
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

  const seguir = () => esperar(hayVoz ? 500 : quien === "llama" ? 2500 : 3000, siguienteTurno);
  if (hayVoz) leer(texto, ajusteDeVoz(quien), seguir);
  else seguir();
}

function cortarTodo() {
  clearInterval(idTimbre);
  clearInterval(idReloj);
  clearInterval(idCuenta);
  clearTimeout(idPausa);
  sesion++;
  if (hayVoz) speechSynthesis.cancel();
}

function terminarLlamada(resultado, emoji, mensaje) {
  cortarTodo();
  registrar(resultado);
  estado.emojiFin = emoji;
  estado.mensajeFin = mensaje;
  irA("fin");
}

// ===== Rescate =====
function rescatar() {
  const rescate = armarRescate(estado.lugar, estado.ganas, estado.nombre);
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
  idCuenta = setInterval(() => {
    estado.espera--;
    if (estado.espera > 0) {
      estado.aviso = `⏳ Sonando en ${estado.espera} s...`;
      return render();
    }
    clearInterval(idCuenta);
    estado.aviso = "";
    empezarASonar();
  }, 1000);
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

buscar("#ganas").addEventListener("input", (evento) => {
  estado.ganas = Number(evento.target.value);
  render();
});

buscar("#nombre").addEventListener("input", (evento) => {
  estado.nombre = evento.target.value;
});

buscar("#btnRescate").addEventListener("click", rescatar);

// Atajo secreto: la tecla R dispara el rescate (sin lugar elegido usa "cumple")
document.addEventListener("keydown", (evento) => {
  const escribiendo = evento.target.matches("input[type=text], textarea, select");
  if (evento.key.toLowerCase() !== "r" || evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat) return;
  if (escribiendo || estado.pantalla !== "inicio") return;
  if (!estado.lugar) {
    estado.lugar = "cumple";
    buscar("input[name=lugar][value=cumple]").checked = true;
  }
  rescatar();
});

buscar("#btnAtender").addEventListener("click", () => {
  clearInterval(idTimbre);
  estado.turnos = 0;
  estado.terminado = false;
  if (hayVoz) speechSynthesis.cancel(); // se habla directo en este clic, sin esperar voiceschanged
  idReloj = setInterval(() => {
    estado.segundos++;
    render();
  }, 1000);
  irA("en-llamada");
  siguienteTurno();
});

buscar("#btnRechazar").addEventListener("click", () => {
  terminarLlamada("rechazo", "😶", "Rechazaste tu propio rescate. Te quedás.");
});

buscar("#btnCortar").addEventListener("click", () => {
  terminarLlamada("escape", "🏃", "¡Escapaste con éxito! Nadie sospechó nada.");
});

buscar("#btnVolver").addEventListener("click", () => irA("inicio"));

render();
