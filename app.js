// Interfaz: los datos viven en `estado` y `render()` dibuja la pantalla (clase 6)

const estado = { pantalla: "inicio", lugar: null, ganas: 5, rescate: null, segundos: 0, aviso: "", mensajeFin: "" };

// Transiciones válidas (spec, sección 6). Cualquier otra se ignora.
const TRANSICIONES = {
  inicio: ["sonando"],
  sonando: ["en-llamada", "fin"],
  "en-llamada": ["fin"],
  fin: ["inicio"],
};

const $ = (selector) => document.querySelector(selector);
const CARAS = ["😐", "😐", "🙂", "😕", "😕", "😩", "😩", "😱", "😱", "🔥"];
let timbre = null;
let reloj = null;

function irA(pantalla) {
  if (!TRANSICIONES[estado.pantalla].includes(pantalla)) return;
  estado.pantalla = pantalla;
  render();
}

function render() {
  const { pantalla, rescate } = estado;
  $("#inicio").hidden = pantalla !== "inicio";
  $("#llamada").hidden = pantalla === "inicio";
  $("#ganasTxt").textContent = `${estado.ganas}/10 ${CARAS[estado.ganas - 1]}`;
  $("#aviso").textContent = estado.aviso;

  if (!rescate) return;
  $("#avatar").textContent = rescate.avatar;
  $("#quien").textContent = rescate.quien;
  $("#llamada").classList.toggle("sonando", pantalla === "sonando");
  $("#entrante").hidden = pantalla !== "sonando";
  $("#guion").hidden = pantalla !== "en-llamada";
  $("#btnCortar").hidden = pantalla !== "en-llamada";
  $("#fin").hidden = pantalla !== "fin";

  const textosEstado = { sonando: "Llamada entrante...", "en-llamada": `00:${String(estado.segundos).padStart(2, "0")}`, fin: "Llamada finalizada" };
  $("#estado").textContent = textosEstado[pantalla] ?? "";

  $("#decir").textContent = `🗣️ Decí: "${rescate.decir}"`;
  $("#pasos").innerHTML = rescate.pasos.map((paso) => `<li>${paso}</li>`).join("");
  $("#dato").textContent = `Credibilidad: ${rescate.credibilidad}% · Escape en ${rescate.segundos} s`;
  $("#mensajeFin").textContent = estado.mensajeFin;
}

// Sonido generado con el navegador, sin archivos de audio
function sonarTimbre() {
  const audio = new AudioContext();
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

function cortarTodo() {
  clearInterval(timbre);
  clearInterval(reloj);
}

// ===== Eventos =====
document.querySelectorAll("input[name=lugar]").forEach((radio) => {
  radio.addEventListener("change", () => {
    estado.lugar = radio.value;
    estado.aviso = "";
    render();
  });
});

$("#ganas").addEventListener("input", (e) => {
  estado.ganas = Number(e.target.value);
  render();
});

$("#btnRescate").addEventListener("click", () => {
  const rescate = armarRescate(estado.lugar, estado.ganas);
  if (!rescate) {
    estado.aviso = "⚠️ Primero elegí dónde estás";
    return render();
  }
  estado.rescate = rescate;
  estado.segundos = 0;
  sonarTimbre();
  irA("sonando");
});

$("#btnAtender").addEventListener("click", () => {
  clearInterval(timbre);
  reloj = setInterval(() => {
    estado.segundos++;
    render();
  }, 1000);
  irA("en-llamada");
});

$("#btnRechazar").addEventListener("click", () => {
  cortarTodo();
  estado.mensajeFin = "😶 Rechazaste tu propio rescate. Te quedás.";
  irA("fin");
});

$("#btnCortar").addEventListener("click", () => {
  cortarTodo();
  estado.mensajeFin = "🏃 ¡Escapaste con éxito! Nadie sospechó nada.";
  irA("fin");
});

$("#btnVolver").addEventListener("click", () => irA("inicio"));

render();
