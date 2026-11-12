// Lógica pura del invento: no toca el DOM, por eso se puede testear con Node.

// Array de objetos: cada lugar es una entidad con sus atributos (clase 8)
const LUGARES = [
  { id: "cumple", nombre: "🎂 Cumpleaños", quien: "Mamá", avatar: "👩", excusas: [
    "Sí, ahora voy. No me olvido del pan.",
    "¿Cómo que el perro quedó encerrado en el baño? ¡Voy!",
    "¿¡Se inundó la cocina!? ¡Salgo ahora mismo!"] },
  { id: "familia", nombre: "👵 Reunión familiar", quien: "Vecina Marta", avatar: "👵", excusas: [
    "¿Un paquete para mí? Bueno, voy a buscarlo.",
    "¿Dejé la plancha enchufada? ¡Voy corriendo!",
    "¿¡Hay alguien en mi balcón!? ¡No toques nada, voy!"] },
  { id: "cita", nombre: "💔 Cita", quien: "Mejor amiga", avatar: "👯", excusas: [
    "¿Te ayudo con la mudanza hoy? Dame un rato y voy.",
    "¿Te quedaste afuera sin llaves? Salgo ya.",
    "¿¡Tu gato se tragó un arito!? ¡Te paso a buscar!"] },
  { id: "trabajo", nombre: "💼 Trabajo", quien: "Soporte Técnico", avatar: "🧑‍💻", excusas: [
    "Tengo que confirmar unos datos, ya vuelvo.",
    "¿Se cayó el sistema y solo yo tengo acceso? Voy.",
    "¿¡El servidor echa humo!? ¡Me desconecto ya!"] },
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
  return {
    quien: lugar.quien,
    avatar: lugar.avatar,
    decir: lugar.excusas[nivel],
    pasos,
    credibilidad: credibilidad - ganas, // más desesperación = menos creíble
    segundos,                           // pero salís más rápido
  };
}

// Permite importar desde Node para los tests; en el navegador se ignora
if (typeof module !== "undefined") module.exports = { armarRescate, nivelDeGanas, LUGARES };
