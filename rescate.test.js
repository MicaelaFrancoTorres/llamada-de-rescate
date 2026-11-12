// Tests de la función central. Se corren con: node --test
const { test } = require("node:test");
const assert = require("node:assert");
const { armarRescate, nivelDeGanas } = require("./rescate.js");

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
