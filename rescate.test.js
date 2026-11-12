// Tests de la función central. Se corren con: node --test
const { test } = require("node:test");
const assert = require("node:assert");
const { armarRescate, nivelDeGanas, LUGARES, registrarResultado, limpiarNombre, elegirVoces } = require("./rescate.js");

test("R1: las ganas definen el nivel (1-3 suave, 4-7 medio, 8-10 extremo)", () => {
  assert.strictEqual(nivelDeGanas(1), 0);
  assert.strictEqual(nivelDeGanas(3), 0);
  assert.strictEqual(nivelDeGanas(4), 1);
  assert.strictEqual(nivelDeGanas(7), 1);
  assert.strictEqual(nivelDeGanas(8), 2);
  assert.strictEqual(nivelDeGanas(10), 2);
});

test("R2: cada lugar tiene su propio llamador", () => {
  assert.strictEqual(armarRescate("cumple", 5).quien, "Mamá");
  assert.strictEqual(armarRescate("trabajo", 5).quien, "Soporte Técnico");
  assert.strictEqual(armarRescate("clase", 5).quien, "Hermano/a");
  assert.strictEqual(armarRescate("asado", 5).quien, "Abuela");
  assert.strictEqual(armarRescate("consorcio", 5).quien, "Cerrajero");
  assert.strictEqual(armarRescate("sala", 5).quien, "Trabajo");
});

test("R2: hay 8 lugares y todos tienen diálogo para los 3 niveles", () => {
  assert.strictEqual(LUGARES.length, 8);
  for (const lugar of LUGARES) assert.strictEqual(lugar.dialogos.length, 3, lugar.id);
});

test("R3: más ganas = menos credibilidad pero escape más rápido", () => {
  const suave = armarRescate("cita", 2);
  const extremo = armarRescate("cita", 9);
  assert.strictEqual(suave.credibilidad, 92);
  assert.strictEqual(extremo.credibilidad, 43);
  assert.ok(extremo.segundos < suave.segundos);
});

test("R4: entradas inválidas devuelven null", () => {
  assert.strictEqual(armarRescate(null, 5), null);
  assert.strictEqual(armarRescate("playa", 5), null);
  assert.strictEqual(armarRescate("cita", 0), null);
  assert.strictEqual(armarRescate("cita", 11), null);
});

test("R5: cada lugar y nivel tiene un diálogo de 5 turnos que empieza con 'llama' y alterna", () => {
  for (const { id } of LUGARES) {
    for (const ganas of [2, 5, 9]) {
      const { dialogo } = armarRescate(id, ganas);
      assert.strictEqual(dialogo.length, 5);
      dialogo.forEach(({ quien, texto }, posicion) => {
        assert.strictEqual(quien, posicion % 2 === 0 ? "llama" : "vos");
        assert.ok(typeof texto === "string" && texto.length > 0);
      });
    }
  }
});

test("R5: la excusa es el primer turno de 'vos' y el diálogo cambia con el nivel", () => {
  const extremo = armarRescate("cita", 9);
  assert.strictEqual(extremo.decir, extremo.dialogo[1].texto);
  assert.match(extremo.decir, /arito/);
  assert.notDeepStrictEqual(armarRescate("cita", 2).dialogo, extremo.dialogo);
});

test("R9: limpiarNombre recorta espacios y limita a 20 caracteres", () => {
  assert.strictEqual(limpiarNombre("  Tía Rosa  "), "Tía Rosa");
  assert.strictEqual(limpiarNombre("   "), "");
  assert.strictEqual(limpiarNombre(undefined), "");
  assert.strictEqual(limpiarNombre("a".repeat(25)), "a".repeat(20));
  assert.strictEqual([..."🎉".repeat(25)].length, 25);
  assert.strictEqual([...limpiarNombre("🎉".repeat(25))].length, 20);
});

test("R9: el nombre personalizado reemplaza al llamador y, si está vacío, vale el del lugar", () => {
  assert.strictEqual(armarRescate("cumple", 5, "  Tía Rosa ").quien, "Tía Rosa");
  assert.strictEqual(armarRescate("cumple", 5, "").quien, "Mamá");
  assert.strictEqual(armarRescate("cumple", 5, "   ").quien, "Mamá");
  assert.strictEqual(armarRescate("cumple", 5).quien, "Mamá");
  assert.strictEqual(armarRescate("playa", 5, "Tía Rosa"), null);
});

test("R10: cada personaje tiene su tono y su velocidad", () => {
  const esperadas = {
    cumple: [1.2, 1], familia: [1.3, 0.9], cita: [1.4, 1.1], trabajo: [0.7, 1],
    clase: [1.1, 1.15], asado: [1.3, 0.8], consorcio: [0.6, 0.95], sala: [0.8, 1.05],
  };
  for (const { id } of LUGARES) {
    const { tono, velocidad } = armarRescate(id, 5).voz;
    assert.deepStrictEqual([tono, velocidad], esperadas[id], id);
  }
});

test("R10: el nombre personalizado no cambia la voz del lugar", () => {
  assert.deepStrictEqual(armarRescate("asado", 5, "Tía Rosa").voz, { tono: 1.3, velocidad: 0.8 });
});

test("R11: sin voces en español no se elige ninguna y vos usa tono 0.9 y velocidad 1.05", () => {
  const voces = elegirVoces([{ lang: "en-US", name: "Inglesa" }]);
  assert.strictEqual(voces.llama, null);
  assert.strictEqual(voces.vos, null);
  assert.deepStrictEqual(voces.ajusteVos, { tono: 0.9, velocidad: 1.05 });
  assert.strictEqual(elegirVoces([]).llama, null);
});

test("R11: con una sola voz en español vos usa la misma voz con otro ajuste", () => {
  const unica = { lang: "es_ES", name: "Unica" };
  const voces = elegirVoces([{ lang: "en-US", name: "Inglesa" }, unica]);
  assert.strictEqual(voces.llama, unica);
  assert.strictEqual(voces.vos, null);
  assert.deepStrictEqual(voces.ajusteVos, { tono: 0.9, velocidad: 1.05 });
});

test("R11: con varias voces en español vos usa otra distinta y quien llama prefiere es-AR", () => {
  const espana = { lang: "es-ES", name: "Espana" };
  const argentina = { lang: "es_AR", name: "Argentina" };
  const voces = elegirVoces([espana, argentina]);
  assert.strictEqual(voces.llama, argentina);
  assert.strictEqual(voces.vos, espana);
  assert.notStrictEqual(voces.llama, voces.vos);
  assert.deepStrictEqual(voces.ajusteVos, { tono: 1, velocidad: 1 });
});

test("R12: los diálogos usan voseo rioplatense y no tienen malas palabras ni tuteo", () => {
  const prohibidas = /\b(mierda|carajo|boludo|boluda|pelotud[oa]|puta|puto)\b/i;
  const tuteo = /\b(tú|tienes|puedes|quieres|vienes|pasas|llegas)\b/i;
  const rioplatense = /\b(escuchame|escuche|dale|nena|che)\b/i;
  for (const lugar of LUGARES) {
    const textos = lugar.dialogos.flat().map((turno) => turno.texto);
    for (const texto of textos) {
      assert.doesNotMatch(texto, prohibidas, texto);
      assert.doesNotMatch(texto, tuteo, texto);
    }
    assert.ok(textos.some((texto) => rioplatense.test(texto)), `${lugar.id} sin expresiones rioplatenses`);
  }
});

test("R12: cuando quien llama pregunta cuánto tardás, la respuesta de vos da un tiempo", () => {
  const { dialogo } = armarRescate("cumple", 5);
  assert.match(dialogo[2].texto, /Cuánto tardás/);
  assert.match(dialogo[3].texto, /veinte minutos/i);
});

test("R7: registrarResultado suma un escape o un rechazo", () => {
  const vacio = { escapes: 0, rechazos: 0 };
  assert.deepStrictEqual(registrarResultado(vacio, "escape"), { escapes: 1, rechazos: 0 });
  assert.deepStrictEqual(registrarResultado({ escapes: 2, rechazos: 3 }, "rechazo"), { escapes: 2, rechazos: 4 });
});

test("R7: registrarResultado devuelve un objeto nuevo y no muta el original", () => {
  const original = Object.freeze({ escapes: 1, rechazos: 1 });
  const nuevo = registrarResultado(original, "escape");
  assert.notStrictEqual(nuevo, original);
  assert.deepStrictEqual(original, { escapes: 1, rechazos: 1 });
  assert.notStrictEqual(registrarResultado(original, "otra-cosa"), original);
  assert.deepStrictEqual(registrarResultado(original, "otra-cosa"), original);
});

test("R7: un historial inválido cuenta como cero", () => {
  assert.deepStrictEqual(registrarResultado(null, "escape"), { escapes: 1, rechazos: 0 });
  assert.deepStrictEqual(registrarResultado(undefined, "rechazo"), { escapes: 0, rechazos: 1 });
  assert.deepStrictEqual(registrarResultado({ escapes: "x", rechazos: -4 }, "escape"), { escapes: 1, rechazos: 0 });
});
