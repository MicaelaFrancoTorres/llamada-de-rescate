// Lógica pura del invento: no toca el DOM, por eso se puede testear con Node.

// Un diálogo es un array de turnos { quien, texto }: empieza "llama" y alterna con "vos"
const buildDialogue = (...texts) => texts.map((text, position) => ({ who: position % 2 === 0 ? "llama" : "vos", text }));

// Array de objetos: cada lugar es una entidad con sus atributos (clase 8).
// `voz` es el tono y la velocidad de quien llama; `dialogos` tiene un diálogo por nivel
// (0 = suave, 1 = medio, 2 = extremo). Cada respuesta de "vos" contesta lo que dijo quien llama.
const PLACES = [
  { id: "cumple", name: "🎂 Cumpleaños", who: "Mamá", voice: { pitch: 1.2, rate: 1 }, avatar: "👩", dialogues: [
    buildDialogue("Hola, nena, escuchame un segundo: ¿pasás por la panadería cuando vuelvas?",
      "Hola, ma. Sí, dale, ahora voy y paso por la panadería.",
      "Traeme medio kilo de pan y unas medialunas, ¿sí?",
      "Dale, medio kilo de pan y medialunas. Ya salgo.",
      "Perfecto, te espero con el mate. Un beso."),
    buildDialogue("Nena, no te asustes, pero el perro quedó encerrado en el baño y no para de ladrar.",
      "¿Cómo que el perro quedó encerrado en el baño? Ya voy para allá, ma.",
      "Rasguñó toda la puerta, che. ¿Cuánto tardás en llegar?",
      "Aguantá veinte minutos, ma, ya salgo.",
      "Dale, apurate que se pone cada vez más nervioso."),
    buildDialogue("¡Nena, se rompió un caño y la cocina es una pileta!",
      "¿¡Se inundó la cocina!? ¡Cerrá la llave de paso, ma, salgo ahora mismo!",
      "¡No sé dónde está la llave y el agua ya llega al living!",
      "¡Está abajo de la mesada, ma! ¡Llego en cinco minutos!",
      "¡Dale, dale, apurate!")] },
  { id: "familia", name: "👵 Reunión familiar", who: "Vecina Marta", voice: { pitch: 1.3, rate: 0.9 }, avatar: "👵", dialogues: [
    buildDialogue("Hola, querida, soy Marta. Escuchame, te llegó un paquete y lo recibí yo.",
      "Hola, Marta. ¿Un paquete para mí? Dale, ahora voy a buscarlo.",
      "Es una caja grande, che. No corras, pasá cuando puedas.",
      "Gracias, Marta. Paso en un rato, no te hagas problema.",
      "De nada, nena. Acá lo tengo guardado."),
    buildDialogue("Hola, querida, soy Marta. Escuchame, siento olor a quemado en tu departamento.",
      "¿Dejé la plancha enchufada? Ay, no, ya voy corriendo, Marta.",
      "No sé si es la plancha, pero sale un poco de humo por abajo de la puerta.",
      "Gracias por avisarme, Marta. ¿Podés quedarte cerca hasta que llegue?",
      "Dale, no me muevo de acá. Apurate."),
    buildDialogue("¡Querida, soy Marta! ¡Hay un hombre parado en tu balcón!",
      "¿¡Hay alguien en mi balcón!? ¡No toques nada, Marta, voy ya!",
      "¡Está mirando para adentro, che! ¿Llamo a la policía?",
      "¡Sí, llamá a la policía y no abras la puerta! ¡Llego en diez minutos!",
      "¡Dale, ya la llamo! ¡Apurate, por favor!")] },
  { id: "cita", name: "💔 Cita", who: "Mejor amiga", voice: { pitch: 1.4, rate: 1.1 }, avatar: "👯", dialogues: [
    buildDialogue("Amiga, escuchame: ¿te acordás de que hoy me mudo? ¿Me das una mano?",
      "Che, es verdad, la mudanza. Dale, te ayudo, dame un rato y voy.",
      "Gracias, sos lo más. Está todo en cajas y no tengo manos.",
      "Quedate tranquila, termino acá y salgo para tu casa.",
      "Genial, te espero con unas pizzas."),
    buildDialogue("Amiga, escuchame, me quedé afuera de casa sin llaves.",
      "¿Te quedaste afuera sin llaves? Ay, no. Salgo ya para allá.",
      "Y encima mi celu casi no tiene batería, che. ¿Cuánto tardás?",
      "Veinte minutos. Quedate ahí, no te muevas.",
      "Dale, acá te espero. Gracias, sos mi salvación."),
    buildDialogue("¡Amiga, urgente! ¡Mi gato se tragó un arito!",
      "¿¡Tu gato se tragó un arito!? ¡Quedate tranquila, te paso a buscar!",
      "¡Está raro, che, y no para de toser! ¿Lo llevamos al veterinario?",
      "¡Sí, vamos ya al veterinario! ¡Salgo corriendo y en diez minutos llego!",
      "¡Dale, dale, te espero abajo!")] },
  { id: "trabajo", name: "💼 Trabajo", who: "Soporte Técnico", voice: { pitch: 0.7, rate: 1 }, avatar: "🧑‍💻", dialogues: [
    buildDialogue("Buenas tardes, te llamo de Soporte Técnico. Tenemos una verificación pendiente de tu usuario.",
      "Buenas, dale. Tengo que confirmar unos datos, así que ya vuelvo y lo vemos.",
      "Perfecto. Necesitamos que confirmes tu usuario antes de las seis.",
      "Entendido, antes de las seis lo resuelvo.",
      "Gracias, quedamos a la espera."),
    buildDialogue("Hola, te habla Soporte Técnico. Se cayó el sistema de facturación.",
      "¿Se cayó el sistema y solo yo tengo acceso? Dale, me conecto ahora.",
      "Exacto, sos la única persona con permisos para reiniciarlo.",
      "Entendido. Dame diez minutos y lo reinicio desde mi compu.",
      "Gracias, te necesitamos urgente."),
    buildDialogue("¡Escuchame, se cayó todo y el servidor está largando humo!",
      "¿¡El servidor echa humo!? ¡No lo toquen, me desconecto y salgo ya!",
      "¡Y se perdieron datos de clientes! ¿Podés venir?",
      "¡Sí, voy para allá! ¡No lo apaguen hasta que llegue!",
      "¡Dale, rápido, por favor!")] },
  { id: "clase", name: "📚 Clase aburrida", who: "Hermano/a", voice: { pitch: 1.1, rate: 1.15 }, avatar: "🧒", dialogues: [
    buildDialogue("Che, soy yo. Escuchame, me olvidé los apuntes de mate en casa.",
      "Dale, no pasa nada. Ya te llevo los apuntes, esperame un rato.",
      "Los necesito antes de la próxima clase, ¿llegás?",
      "Sí, llego. Salgo ahora.",
      "Gracias, sos lo más."),
    buildDialogue("Che, escuchame, me olvidé las llaves de casa y no hay nadie.",
      "¿Te olvidaste las llaves de casa? Bueno, dale, ya te las llevo.",
      "Hace frío acá afuera, apurate un poco.",
      "Aguantá, en veinte minutos estoy ahí.",
      "Dale, te espero en la puerta."),
    buildDialogue("¡Che, se prendió fuego la sartén y no hay nadie en casa!",
      "¿¡Se prendió fuego la sartén!? ¡Corto y voy volando!",
      "¡Sale mucho humo y no sé qué hacer!",
      "¡Tapala con una tapa y salí de la cocina! ¡Ya llego!",
      "¡Dale, apurate, por favor!")] },
  { id: "asado", name: "🍖 Asado eterno", who: "Abuela", voice: { pitch: 1.3, rate: 0.8 }, avatar: "🧓", dialogues: [
    buildDialogue("Hola, mi vida, escuchame. Te guardé un tupper de ravioles.",
      "Hola, abuela. Gracias, dale, paso a buscarlo ahora.",
      "Pasá antes de la noche, nena, que se enfrían.",
      "Sí, abuela, salgo para allá enseguida.",
      "Ay, qué lindo. Te espero con el mate."),
    buildDialogue("Mi vida, escuchame, se cortó la luz y no veo nada.",
      "¿Se te cortó la luz, abuela? Quedate tranquila, ya voy.",
      "Tengo miedo de tropezar con el gato, che.",
      "No te muevas, abuela. Quedate sentada que ya salgo.",
      "Dale, mi vida, te espero sentada."),
    buildDialogue("¡Mi vida, me caí en el patio y no me puedo levantar!",
      "¿¡Te caíste, abuela!? ¡No te muevas, voy corriendo!",
      "Me duele mucho la pierna, nena. Vení rápido.",
      "¡Llamo a la ambulancia y salgo ya!",
      "¡Dale, apurate, por favor!")] },
  { id: "consorcio", name: "🏢 Reunión de consorcio", who: "Cerrajero", voice: { pitch: 0.6, rate: 0.95 }, avatar: "🔑", dialogues: [
    buildDialogue("Buenas tardes, soy el cerrajero. Tenía un turno hoy para cambiar la cerradura.",
      "Ah, sí, el turno del cerrajero. Perdone, ya me acerco.",
      "Estoy en la puerta de su casa, sin apuro.",
      "Perfecto, en media hora estoy ahí.",
      "Dale, lo espero."),
    buildDialogue("Buenas, soy el cerrajero. Su vecino me llamó porque la puerta no abre.",
      "¿La puerta quedó trabada con las llaves adentro? Voy para allá.",
      "Eso me dijeron, che. ¿Cuánto tarda en llegar?",
      "Veinte minutos. Espéreme ahí, por favor.",
      "Dale, empiezo a prepararme."),
    buildDialogue("¡Escuche, estoy abriendo la puerta de un departamento y me dijeron que era una emergencia!",
      "¿¡Está forzando mi puerta!? ¡Pare, que ya voy!",
      "Ya casi la abro, ¿es suya o no?",
      "¡Sí, es mía! ¡Espere, no rompa nada, salgo ahora!",
      "Bueno, lo espero un minuto nomás.")] },
  { id: "sala", name: "🩺 Sala de espera", who: "Trabajo", voice: { pitch: 0.8, rate: 1.05 }, avatar: "💼", dialogues: [
    buildDialogue("Hola, te llamo de la oficina. Escuchame, necesitamos que firmes un papel.",
      "Hola, dale. Sí, claro, ahora paso por la oficina.",
      "No es urgente, pero que sea antes de las seis.",
      "Perfecto, antes de las seis llego.",
      "Gracias, te esperamos."),
    buildDialogue("Hola, escuchame, se cayó el sistema y te necesitamos.",
      "¿Se cayó el sistema otra vez? Dale, ya me conecto.",
      "Los clientes están esperando y no podemos facturar, che.",
      "Entiendo. Salgo ahora, en media hora estoy.",
      "Gracias, no tardes."),
    buildDialogue("¡Escuchame, se rompió un caño en la oficina y hay agua por todos lados!",
      "¿¡Hay una inundación en la oficina!? ¡Salgo ya!",
      "¡Se están mojando los servidores!",
      "¡No toquen nada, desenchufen todo y voy volando!",
      "¡Dale, rápido, por favor!")] },
];

// Un elemento por nivel: 0 = suave, 1 = medio, 2 = extremo
const LEVELS = [
  { credibility: 94, seconds: 120, steps: ["Poné cara de \"qué macana\".", "Decí \"perdón, me tengo que ir\".", "Salí tranquilo/a."] },
  { credibility: 78, seconds: 45, steps: ["Tapate la boca al hablar.", "Agarrá tus cosas sin cortar.", "Decí \"una urgencia, después les cuento\"."] },
  { credibility: 52, seconds: 12, steps: ["Gritá \"¿¡QUÉ!?\" para que te escuchen.", "Agarrá la campera sin cortar.", "\"¡PERDÓN, EMERGENCIA!\" y corré."] },
];

const levelFromDesire = (desire) => (desire <= 3 ? 0 : desire <= 7 ? 1 : 2);

// Nombre opcional de quien llama: sin espacios en los extremos y de hasta 20 caracteres
const cleanName = (text) => [...String(text ?? "").trim()].slice(0, 20).join("").trim();

// FUNCIÓN CENTRAL: recibe lugar, ganas y un nombre opcional; devuelve el rescate o null si la entrada es inválida
function buildRescue(placeId, desire, name) {
  const place = PLACES.find((candidate) => candidate.id === placeId);
  if (!place || !Number.isInteger(desire) || desire < 1 || desire > 10) return null;

  const level = levelFromDesire(desire);
  const { credibility, seconds, steps } = LEVELS[level];
  const dialogue = place.dialogues[level];
  return {
    who: cleanName(name) || place.who,
    avatar: place.avatar,
    voice: place.voice, // tono y velocidad de quien llama
    say: dialogue.find((turn) => turn.who === "vos").text, // la excusa es el primer turno de "vos"
    dialogue,
    steps,
    credibility: credibility - desire, // más desesperación = menos creíble
    seconds,                           // pero salís más rápido
  };
}

// Historial: cuenta escapes y rechazos. Los valores inválidos cuentan como 0
const normalizeHistory = (history) => {
  const count = (number) => (Number.isInteger(number) && number >= 0 ? number : 0);
  return { escapes: count(history?.escapes), rejections: count(history?.rejections) };
};

// Función pura: devuelve un objeto NUEVO, nunca modifica el que recibe
function recordResult(history, result) {
  const { escapes, rejections } = normalizeHistory(history);
  if (result === "escape") return { escapes: escapes + 1, rejections };
  if (result === "rechazo") return { escapes, rejections: rejections + 1 };
  return { escapes, rejections };
}

// Voces: una para quien llama (es-AR si hay) y otra, distinta, para tus respuestas
const SINGLE_VOICE_REPLY_ADJUSTMENT = { pitch: 0.9, rate: 1.05 };
const normalizeLanguage = (voice) => String(voice.lang ?? "").replace("_", "-").toLowerCase();

function pickVoices(voices) {
  const spanishVoices = voices.filter((voice) => normalizeLanguage(voice).startsWith("es"));
  const caller = spanishVoices.find((voice) => normalizeLanguage(voice) === "es-ar") ?? spanishVoices[0] ?? null;
  const you = spanishVoices.find((voice) => voice !== caller) ?? null;
  return { caller, you, replyAdjustment: you ? { pitch: 1, rate: 1 } : SINGLE_VOICE_REPLY_ADJUSTMENT };
}

// Permite importar desde Node para los tests; en el navegador se ignora
if (typeof module !== "undefined") module.exports = { buildRescue, levelFromDesire, PLACES, recordResult, normalizeHistory, cleanName, pickVoices };
