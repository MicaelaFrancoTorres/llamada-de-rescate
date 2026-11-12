// Lógica pura del invento: no toca el DOM, por eso se puede testear con Node.

// Un diálogo es un array de turnos { quien, texto }: empieza "llama" y alterna con "vos"
const armarDialogo = (...textos) => textos.map((texto, posicion) => ({ quien: posicion % 2 === 0 ? "llama" : "vos", texto }));

// Array de objetos: cada lugar es una entidad con sus atributos (clase 8).
// `voz` es el tono y la velocidad de quien llama; `dialogos` tiene un diálogo por nivel
// (0 = suave, 1 = medio, 2 = extremo). Cada respuesta de "vos" contesta lo que dijo quien llama.
const LUGARES = [
  { id: "cumple", nombre: "🎂 Cumpleaños", quien: "Mamá", voz: { tono: 1.2, velocidad: 1 }, avatar: "👩", dialogos: [
    armarDialogo("Hola, nena, escuchame un segundo: ¿pasás por la panadería cuando vuelvas?",
      "Hola, ma. Sí, dale, ahora voy y paso por la panadería.",
      "Traeme medio kilo de pan y unas medialunas, ¿sí?",
      "Dale, medio kilo de pan y medialunas. Ya salgo.",
      "Perfecto, te espero con el mate. Un beso."),
    armarDialogo("Nena, no te asustes, pero el perro quedó encerrado en el baño y no para de ladrar.",
      "¿Cómo que el perro quedó encerrado en el baño? Ya voy para allá, ma.",
      "Rasguñó toda la puerta, che. ¿Cuánto tardás en llegar?",
      "Aguantá veinte minutos, ma, ya salgo.",
      "Dale, apurate que se pone cada vez más nervioso."),
    armarDialogo("¡Nena, se rompió un caño y la cocina es una pileta!",
      "¿¡Se inundó la cocina!? ¡Cerrá la llave de paso, ma, salgo ahora mismo!",
      "¡No sé dónde está la llave y el agua ya llega al living!",
      "¡Está abajo de la mesada, ma! ¡Llego en cinco minutos!",
      "¡Dale, dale, apurate!")] },
  { id: "familia", nombre: "👵 Reunión familiar", quien: "Vecina Marta", voz: { tono: 1.3, velocidad: 0.9 }, avatar: "👵", dialogos: [
    armarDialogo("Hola, querida, soy Marta. Escuchame, te llegó un paquete y lo recibí yo.",
      "Hola, Marta. ¿Un paquete para mí? Dale, ahora voy a buscarlo.",
      "Es una caja grande, che. No corras, pasá cuando puedas.",
      "Gracias, Marta. Paso en un rato, no te hagas problema.",
      "De nada, nena. Acá lo tengo guardado."),
    armarDialogo("Hola, querida, soy Marta. Escuchame, siento olor a quemado en tu departamento.",
      "¿Dejé la plancha enchufada? Ay, no, ya voy corriendo, Marta.",
      "No sé si es la plancha, pero sale un poco de humo por abajo de la puerta.",
      "Gracias por avisarme, Marta. ¿Podés quedarte cerca hasta que llegue?",
      "Dale, no me muevo de acá. Apurate."),
    armarDialogo("¡Querida, soy Marta! ¡Hay un hombre parado en tu balcón!",
      "¿¡Hay alguien en mi balcón!? ¡No toques nada, Marta, voy ya!",
      "¡Está mirando para adentro, che! ¿Llamo a la policía?",
      "¡Sí, llamá a la policía y no abras la puerta! ¡Llego en diez minutos!",
      "¡Dale, ya la llamo! ¡Apurate, por favor!")] },
  { id: "cita", nombre: "💔 Cita", quien: "Mejor amiga", voz: { tono: 1.4, velocidad: 1.1 }, avatar: "👯", dialogos: [
    armarDialogo("Amiga, escuchame: ¿te acordás de que hoy me mudo? ¿Me das una mano?",
      "Che, es verdad, la mudanza. Dale, te ayudo, dame un rato y voy.",
      "Gracias, sos lo más. Está todo en cajas y no tengo manos.",
      "Quedate tranquila, termino acá y salgo para tu casa.",
      "Genial, te espero con unas pizzas."),
    armarDialogo("Amiga, escuchame, me quedé afuera de casa sin llaves.",
      "¿Te quedaste afuera sin llaves? Ay, no. Salgo ya para allá.",
      "Y encima mi celu casi no tiene batería, che. ¿Cuánto tardás?",
      "Veinte minutos. Quedate ahí, no te muevas.",
      "Dale, acá te espero. Gracias, sos mi salvación."),
    armarDialogo("¡Amiga, urgente! ¡Mi gato se tragó un arito!",
      "¿¡Tu gato se tragó un arito!? ¡Quedate tranquila, te paso a buscar!",
      "¡Está raro, che, y no para de toser! ¿Lo llevamos al veterinario?",
      "¡Sí, vamos ya al veterinario! ¡Salgo corriendo y en diez minutos llego!",
      "¡Dale, dale, te espero abajo!")] },
  { id: "trabajo", nombre: "💼 Trabajo", quien: "Soporte Técnico", voz: { tono: 0.7, velocidad: 1 }, avatar: "🧑‍💻", dialogos: [
    armarDialogo("Buenas tardes, te llamo de Soporte Técnico. Tenemos una verificación pendiente de tu usuario.",
      "Buenas, dale. Tengo que confirmar unos datos, así que ya vuelvo y lo vemos.",
      "Perfecto. Necesitamos que confirmes tu usuario antes de las seis.",
      "Entendido, antes de las seis lo resuelvo.",
      "Gracias, quedamos a la espera."),
    armarDialogo("Hola, te habla Soporte Técnico. Se cayó el sistema de facturación.",
      "¿Se cayó el sistema y solo yo tengo acceso? Dale, me conecto ahora.",
      "Exacto, sos la única persona con permisos para reiniciarlo.",
      "Entendido. Dame diez minutos y lo reinicio desde mi compu.",
      "Gracias, te necesitamos urgente."),
    armarDialogo("¡Escuchame, se cayó todo y el servidor está largando humo!",
      "¿¡El servidor echa humo!? ¡No lo toquen, me desconecto y salgo ya!",
      "¡Y se perdieron datos de clientes! ¿Podés venir?",
      "¡Sí, voy para allá! ¡No lo apaguen hasta que llegue!",
      "¡Dale, rápido, por favor!")] },
  { id: "clase", nombre: "📚 Clase aburrida", quien: "Hermano/a", voz: { tono: 1.1, velocidad: 1.15 }, avatar: "🧒", dialogos: [
    armarDialogo("Che, soy yo. Escuchame, me olvidé los apuntes de mate en casa.",
      "Dale, no pasa nada. Ya te llevo los apuntes, esperame un rato.",
      "Los necesito antes de la próxima clase, ¿llegás?",
      "Sí, llego. Salgo ahora.",
      "Gracias, sos lo más."),
    armarDialogo("Che, escuchame, me olvidé las llaves de casa y no hay nadie.",
      "¿Te olvidaste las llaves de casa? Bueno, dale, ya te las llevo.",
      "Hace frío acá afuera, apurate un poco.",
      "Aguantá, en veinte minutos estoy ahí.",
      "Dale, te espero en la puerta."),
    armarDialogo("¡Che, se prendió fuego la sartén y no hay nadie en casa!",
      "¿¡Se prendió fuego la sartén!? ¡Corto y voy volando!",
      "¡Sale mucho humo y no sé qué hacer!",
      "¡Tapala con una tapa y salí de la cocina! ¡Ya llego!",
      "¡Dale, apurate, por favor!")] },
  { id: "asado", nombre: "🍖 Asado eterno", quien: "Abuela", voz: { tono: 1.3, velocidad: 0.8 }, avatar: "🧓", dialogos: [
    armarDialogo("Hola, mi vida, escuchame. Te guardé un tupper de ravioles.",
      "Hola, abuela. Gracias, dale, paso a buscarlo ahora.",
      "Pasá antes de la noche, nena, que se enfrían.",
      "Sí, abuela, salgo para allá enseguida.",
      "Ay, qué lindo. Te espero con el mate."),
    armarDialogo("Mi vida, escuchame, se cortó la luz y no veo nada.",
      "¿Se te cortó la luz, abuela? Quedate tranquila, ya voy.",
      "Tengo miedo de tropezar con el gato, che.",
      "No te muevas, abuela. Quedate sentada que ya salgo.",
      "Dale, mi vida, te espero sentada."),
    armarDialogo("¡Mi vida, me caí en el patio y no me puedo levantar!",
      "¿¡Te caíste, abuela!? ¡No te muevas, voy corriendo!",
      "Me duele mucho la pierna, nena. Vení rápido.",
      "¡Llamo a la ambulancia y salgo ya!",
      "¡Dale, apurate, por favor!")] },
  { id: "consorcio", nombre: "🏢 Reunión de consorcio", quien: "Cerrajero", voz: { tono: 0.6, velocidad: 0.95 }, avatar: "🔑", dialogos: [
    armarDialogo("Buenas tardes, soy el cerrajero. Tenía un turno hoy para cambiar la cerradura.",
      "Ah, sí, el turno del cerrajero. Perdone, ya me acerco.",
      "Estoy en la puerta de su casa, sin apuro.",
      "Perfecto, en media hora estoy ahí.",
      "Dale, lo espero."),
    armarDialogo("Buenas, soy el cerrajero. Su vecino me llamó porque la puerta no abre.",
      "¿La puerta quedó trabada con las llaves adentro? Voy para allá.",
      "Eso me dijeron, che. ¿Cuánto tarda en llegar?",
      "Veinte minutos. Espéreme ahí, por favor.",
      "Dale, empiezo a prepararme."),
    armarDialogo("¡Escuche, estoy abriendo la puerta de un departamento y me dijeron que era una emergencia!",
      "¿¡Está forzando mi puerta!? ¡Pare, que ya voy!",
      "Ya casi la abro, ¿es suya o no?",
      "¡Sí, es mía! ¡Espere, no rompa nada, salgo ahora!",
      "Bueno, lo espero un minuto nomás.")] },
  { id: "sala", nombre: "🩺 Sala de espera", quien: "Trabajo", voz: { tono: 0.8, velocidad: 1.05 }, avatar: "💼", dialogos: [
    armarDialogo("Hola, te llamo de la oficina. Escuchame, necesitamos que firmes un papel.",
      "Hola, dale. Sí, claro, ahora paso por la oficina.",
      "No es urgente, pero que sea antes de las seis.",
      "Perfecto, antes de las seis llego.",
      "Gracias, te esperamos."),
    armarDialogo("Hola, escuchame, se cayó el sistema y te necesitamos.",
      "¿Se cayó el sistema otra vez? Dale, ya me conecto.",
      "Los clientes están esperando y no podemos facturar, che.",
      "Entiendo. Salgo ahora, en media hora estoy.",
      "Gracias, no tardes."),
    armarDialogo("¡Escuchame, se rompió un caño en la oficina y hay agua por todos lados!",
      "¿¡Hay una inundación en la oficina!? ¡Salgo ya!",
      "¡Se están mojando los servidores!",
      "¡No toquen nada, desenchufen todo y voy volando!",
      "¡Dale, rápido, por favor!")] },
];

// Un elemento por nivel: 0 = suave, 1 = medio, 2 = extremo
const NIVELES = [
  { credibilidad: 94, segundos: 120, pasos: ["Poné cara de \"qué macana\".", "Decí \"perdón, me tengo que ir\".", "Salí tranquilo/a."] },
  { credibilidad: 78, segundos: 45, pasos: ["Tapate la boca al hablar.", "Agarrá tus cosas sin cortar.", "Decí \"una urgencia, después les cuento\"."] },
  { credibilidad: 52, segundos: 12, pasos: ["Gritá \"¿¡QUÉ!?\" para que te escuchen.", "Agarrá la campera sin cortar.", "\"¡PERDÓN, EMERGENCIA!\" y corré."] },
];

const nivelDeGanas = (ganas) => (ganas <= 3 ? 0 : ganas <= 7 ? 1 : 2);

// Nombre opcional de quien llama: sin espacios en los extremos y de hasta 20 caracteres
const limpiarNombre = (texto) => [...String(texto ?? "").trim()].slice(0, 20).join("").trim();

// FUNCIÓN CENTRAL: recibe lugar, ganas y un nombre opcional; devuelve el rescate o null si la entrada es inválida
function armarRescate(lugarId, ganas, nombre) {
  const lugar = LUGARES.find((candidato) => candidato.id === lugarId);
  if (!lugar || !Number.isInteger(ganas) || ganas < 1 || ganas > 10) return null;

  const nivel = nivelDeGanas(ganas);
  const { credibilidad, segundos, pasos } = NIVELES[nivel];
  const dialogo = lugar.dialogos[nivel];
  return {
    quien: limpiarNombre(nombre) || lugar.quien,
    avatar: lugar.avatar,
    voz: lugar.voz, // tono y velocidad de quien llama
    decir: dialogo.find((turno) => turno.quien === "vos").texto, // la excusa es el primer turno de "vos"
    dialogo,
    pasos,
    credibilidad: credibilidad - ganas, // más desesperación = menos creíble
    segundos,                           // pero salís más rápido
  };
}

// Historial: cuenta escapes y rechazos. Los valores inválidos cuentan como 0
const normalizarHistorial = (historial) => {
  const contar = (numero) => (Number.isInteger(numero) && numero >= 0 ? numero : 0);
  return { escapes: contar(historial?.escapes), rechazos: contar(historial?.rechazos) };
};

// Función pura: devuelve un objeto NUEVO, nunca modifica el que recibe
function registrarResultado(historial, resultado) {
  const { escapes, rechazos } = normalizarHistorial(historial);
  if (resultado === "escape") return { escapes: escapes + 1, rechazos };
  if (resultado === "rechazo") return { escapes, rechazos: rechazos + 1 };
  return { escapes, rechazos };
}

// Voces: una para quien llama (es-AR si hay) y otra, distinta, para tus respuestas
const AJUSTE_VOS_CON_UNA_VOZ = { tono: 0.9, velocidad: 1.05 };
const normalizarIdioma = (voz) => String(voz.lang ?? "").replace("_", "-").toLowerCase();

function elegirVoces(voces) {
  const espanolas = voces.filter((voz) => normalizarIdioma(voz).startsWith("es"));
  const llama = espanolas.find((voz) => normalizarIdioma(voz) === "es-ar") ?? espanolas[0] ?? null;
  const vos = espanolas.find((voz) => voz !== llama) ?? null;
  return { llama, vos, ajusteVos: vos ? { tono: 1, velocidad: 1 } : AJUSTE_VOS_CON_UNA_VOZ };
}

// Permite importar desde Node para los tests; en el navegador se ignora
if (typeof module !== "undefined") module.exports = { armarRescate, nivelDeGanas, LUGARES, registrarResultado, normalizarHistorial, limpiarNombre, elegirVoces };
