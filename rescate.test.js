// Tests de la función central. Se corren con: node --test
const { test } = require("node:test");
const assert = require("node:assert");
const { armarRescate, nivelDeGanas, LUGARES } = require("./rescate.js");

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
      dialogo.forEach(({ quien, texto }, i) => {
        assert.strictEqual(quien, i % 2 === 0 ? "llama" : "vos");
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
