// Lógica pura del invento: no toca el DOM, por eso se puede testear con Node.

// Un diálogo es un array de turnos { quien, texto }: empieza "llama" y alterna con "vos"
const armarDialogo = (...textos) => textos.map((texto, i) => ({ quien: i % 2 === 0 ? "llama" : "vos", texto }));

// Array de objetos: cada lugar es una entidad con sus atributos (clase 8).
// `dialogos` tiene un diálogo por nivel (0 = suave, 1 = medio, 2 = extremo)
const LUGARES = [
  { id: "cumple", nombre: "🎂 Cumpleaños", quien: "Mamá", avatar: "👩", dialogos: [
    armarDialogo("Hola, ¿cómo andás? Te llamo rápido: ¿pasás por la panadería cuando vuelvas?",
      "Sí, ahora voy. No me olvido del pan.",
      "Dale, traé también medialunas. Y no te olvides, ¿eh?",
      "Quedate tranquila, ya salgo para allá.",
      "Perfecto, te espero. Un beso, cuidate."),
    armarDialogo("Hola, no quiero alarmarte, pero el perro quedó encerrado en el baño.",
      "¿Cómo que el perro quedó encerrado en el baño? ¡Voy!",
      "Está ladrando y rasguñó la puerta. Vení cuando puedas.",
      "Tranqui, ma, en un rato estoy ahí.",
      "Dale, apurate que se pone nervioso."),
    armarDialogo("¡Hola! ¡Se rompió un caño y hay agua por toda la cocina!",
      "¿¡Se inundó la cocina!? ¡Salgo ahora mismo!",
      "¡Ya llega al living! ¡Corré!",
      "¡No toques nada, ma, llego en cinco minutos!",
      "¡Apurate, apurate!")] },
  { id: "familia", nombre: "👵 Reunión familiar", quien: "Vecina Marta", avatar: "👵", dialogos: [
    armarDialogo("Hola, soy Marta. Te llegó un paquete y lo recibí yo.",
      "¿Un paquete para mí? Bueno, voy a buscarlo.",
      "Sí, es una caja grande. No corras, pasá cuando puedas.",
      "Gracias, Marta, en un rato paso.",
      "De nada. Acá lo tengo."),
    armarDialogo("Hola, soy Marta. Siento olor a quemado que viene de tu departamento.",
      "¿Dejé la plancha enchufada? ¡Voy corriendo!",
      "No sé, pero sale un poco de humo por debajo de la puerta.",
      "Gracias por avisarme, Marta. Ya salgo para allá.",
      "Dale, yo me quedo mirando por las dudas."),
    armarDialogo("¡Hola, soy Marta! ¡Hay un hombre trepado en tu balcón!",
      "¿¡Hay alguien en mi balcón!? ¡No toques nada, voy!",
      "¡Está mirando para adentro, me da miedo! ¿Llamo a la policía?",
      "Esperá, Marta, no hagas nada, llego en diez minutos.",
      "¡Apurate, por favor!")] },
  { id: "cita", nombre: "💔 Cita", quien: "Mejor amiga", avatar: "👯", dialogos: [
    armarDialogo("Amiga, ¿cómo estás? Che, ¿te acordás que hoy me mudo?",
      "¿Te ayudo con la mudanza hoy? Dame un rato y voy.",
      "¡Sí, por favor! Está todo en cajas, necesito manos.",
      "Dale, termino lo que estoy haciendo y voy.",
      "Genial, sos lo más. Te espero."),
    armarDialogo("Amiga, ¡me quedé afuera de casa sin llaves!",
      "¿Te quedaste afuera sin llaves? Salgo ya.",
      "Sí, y tengo el teléfono casi sin batería. ¿Podés venir?",
      "Quedate ahí, en veinte minutos estoy con vos.",
      "Gracias, sos mi salvación."),
    armarDialogo("¡Amiga, urgente! ¡Mi gato se tragó un arito!",
      "¿¡Tu gato se tragó un arito!? ¡Te paso a buscar!",
      "¡Sí, y está raro! ¡Hay que llevarlo al veterinario ya!",
      "Quedate tranquila, salgo corriendo y lo llevamos.",
      "¡Dale, dale, apurate!")] },
  { id: "trabajo", nombre: "💼 Trabajo", quien: "Soporte Técnico", avatar: "🧑‍💻", dialogos: [
    armarDialogo("Buenas, te llamamos de Soporte Técnico por una verificación pendiente.",
      "Tengo que confirmar unos datos, ya vuelvo.",
      "Perfecto, necesitamos que confirmes tu usuario cuando puedas.",
      "Entendido, en unos minutos lo resuelvo.",
      "Gracias, quedamos a la espera."),
    armarDialogo("Hola, acá Soporte Técnico. Se cayó el sistema de facturación.",
      "¿Se cayó el sistema y solo yo tengo acceso? Voy.",
      "Sí, sos la única persona con permisos para reiniciarlo.",
      "Entendido, me conecto ahora mismo.",
      "Gracias, te necesitamos urgente."),
    armarDialogo("¡Alerta! ¡Se cayó todo y el servidor está largando humo!",
      "¿¡El servidor echa humo!? ¡Me desconecto ya!",
      "¡Y se perdieron datos de clientes! ¡Hace falta que vengas!",
      "¡No lo apaguen hasta que llegue, salgo ahora!",
      "¡Dale, rápido!")] },
];

// Un elemento por nivel: 0 = suave, 1 = medio, 2 = extremo
const NIVELES = [
  { credibilidad: 94, segundos: 120, pasos: ["Poné cara de \"qué macana\".", "Decí \"perdón, me tengo que ir\".", "Salí tranquilo/a."] },
  { credibilidad: 78, segundos: 45, pasos: ["Tapate la boca al hablar.", "Agarrá tus cosas sin cortar.", "Decí \"una urgencia, después les cuento\"."] },
  { credibilidad: 52, segundos: 12, pasos: ["Gritá \"¿¡QUÉ!?\" para que te escuchen.", "Agarrá la campera sin cortar.", "\"¡PERDÓN, EMERGENCIA!\" y corré."] },
];

const nivelDeGanas = (ganas) => (ganas <= 3 ? 0 : ganas <= 7 ? 1 : 2);

// FUNCIÓN CENTRAL: recibe lugar y ganas, devuelve el rescate o null si la entrada es inválida
function armarRescate(lugarId, ganas) {
  const lugar = LUGARES.find((l) => l.id === lugarId);
  if (!lugar || !Number.isInteger(ganas) || ganas < 1 || ganas > 10) return null;

  const nivel = nivelDeGanas(ganas);
  const { credibilidad, segundos, pasos } = NIVELES[nivel];
  const dialogo = lugar.dialogos[nivel];
  return {
    quien: lugar.quien,
    avatar: lugar.avatar,
    decir: dialogo.find((turno) => turno.quien === "vos").texto, // la excusa es el primer turno de "vos"
    dialogo,
    pasos,
    credibilidad: credibilidad - ganas, // más desesperación = menos creíble
    segundos,                           // pero salís más rápido
  };
}

// Permite importar desde Node para los tests; en el navegador se ignora
if (typeof module !== "undefined") module.exports = { armarRescate, nivelDeGanas, LUGARES };
