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
  { id: "clase", nombre: "📚 Clase aburrida", quien: "Hermano/a", avatar: "🧒", dialogos: [
    armarDialogo("Hola, soy yo. Me olvidé los apuntes de mate en casa.",
      "Bueno, ya te llevo los apuntes, esperame un rato.",
      "Dale, los necesito antes de la siguiente clase.",
      "Quedate tranquilo/a, salgo ahora.",
      "Gracias, sos lo más."),
    armarDialogo("Hola, me olvidé las llaves de casa y no hay nadie.",
      "¿Te olvidaste las llaves de casa? Bueno, ya te las llevo.",
      "Tengo frío acá afuera, apurate un poco.",
      "Aguantá, en veinte minutos estoy ahí.",
      "Dale, te espero en la puerta."),
    armarDialogo("¡Se prendió fuego la sartén y no hay nadie en casa!",
      "¿¡Se prendió fuego la sartén!? ¡Corto y voy volando!",
      "¡Hay mucho humo y no sé qué hacer!",
      "¡Tapala con una tapa y salí de la cocina, ya llego!",
      "¡Apurate, por favor!")] },
  { id: "asado", nombre: "🍖 Asado eterno", quien: "Abuela", avatar: "🧓", dialogos: [
    armarDialogo("Hola, mi vida. Te guardé un tupper de ravioles.",
      "Gracias, abuela, paso a buscarlo ahora.",
      "Pasá antes de la noche, que se enfrían.",
      "Sí, abuela, salgo para allá.",
      "Ay, qué lindo, te espero con el mate."),
    armarDialogo("Hola, mi vida, se cortó la luz y no veo nada.",
      "¿Se te cortó la luz, abuela? Quedate tranquila, ya voy.",
      "Tengo miedo de tropezar con el gato.",
      "No te muevas, busco una linterna y salgo.",
      "Gracias, te espero sentada."),
    armarDialogo("¡Hola, mi vida, me caí en el patio y no me puedo levantar!",
      "¿¡Te caíste, abuela!? ¡No te muevas, voy corriendo!",
      "Me duele la pierna, pero estoy bien. Vení.",
      "¡Llamo a una ambulancia y salgo ya!",
      "¡Apurate, por favor!")] },
  { id: "consorcio", nombre: "🏢 Reunión de consorcio", quien: "Cerrajero", avatar: "🔑", dialogos: [
    armarDialogo("Buenas tardes, soy el cerrajero. Tenía un turno para cambiar la cerradura.",
      "Ah, sí, el turno del cerrajero. Ya me acerco.",
      "Estoy en la puerta de su casa, sin apuro.",
      "Perfecto, en media hora estoy ahí.",
      "Dale, lo espero."),
    armarDialogo("Hola, soy el cerrajero. Su vecino me llamó porque la puerta no abre.",
      "¿La puerta quedó trabada con las llaves adentro? Voy para allá.",
      "Sí, dicen que las llaves quedaron adentro.",
      "Quédese ahí, llego en veinte minutos.",
      "Listo, empiezo a prepararme."),
    armarDialogo("¡Buenas! Estoy abriendo la puerta de un departamento, ¿es suyo?",
      "¿¡Está forzando mi puerta!? ¡Pare, que ya voy!",
      "Me dijeron que había una emergencia, ya casi la abro.",
      "¡Espere, no rompa nada, salgo ahora!",
      "Ok, lo espero un minuto nomás.")] },
  { id: "sala", nombre: "🩺 Sala de espera", quien: "Trabajo", avatar: "💼", dialogos: [
    armarDialogo("Hola, te llamo de la oficina. Necesitamos que firmes un papel.",
      "Sí, claro, ahora paso por la oficina.",
      "No es urgente, pero que sea antes de las seis.",
      "Perfecto, en un rato llego.",
      "Gracias, te esperamos."),
    armarDialogo("Hola, se cayó el sistema y te necesitamos.",
      "¿Se cayó el sistema otra vez? Ya me conecto.",
      "Los clientes están esperando, no podemos facturar.",
      "Salgo ahora, en media hora estoy.",
      "Gracias, no tardes."),
    armarDialogo("¡Hola! ¡Se rompió un caño en la oficina y hay agua por todos lados!",
      "¿¡Hay una inundación en la oficina!? ¡Salgo ya!",
      "¡Se están mojando los servidores!",
      "¡No toquen nada, voy volando!",
      "¡Rápido, por favor!")] },
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
