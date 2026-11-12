// Tests de la función central. Se corren con: node --test
const { test } = require("node:test");
const assert = require("node:assert");
const { buildRescue, levelFromDesire, PLACES, recordResult, cleanName, pickVoices } = require("./rescate.js");

test("R1: desire determines the level (1-3 mild, 4-7 medium, 8-10 extreme)", () => {
  assert.strictEqual(levelFromDesire(1), 0);
  assert.strictEqual(levelFromDesire(3), 0);
  assert.strictEqual(levelFromDesire(4), 1);
  assert.strictEqual(levelFromDesire(7), 1);
  assert.strictEqual(levelFromDesire(8), 2);
  assert.strictEqual(levelFromDesire(10), 2);
});

test("R2: each place has its own caller", () => {
  assert.strictEqual(buildRescue("cumple", 5).who, "Mamá");
  assert.strictEqual(buildRescue("trabajo", 5).who, "Soporte Técnico");
  assert.strictEqual(buildRescue("clase", 5).who, "Hermano/a");
  assert.strictEqual(buildRescue("asado", 5).who, "Abuela");
  assert.strictEqual(buildRescue("consorcio", 5).who, "Cerrajero");
  assert.strictEqual(buildRescue("sala", 5).who, "Trabajo");
});

test("R2: there are 8 places and all have dialogues for the 3 levels", () => {
  assert.strictEqual(PLACES.length, 8);
  for (const place of PLACES) assert.strictEqual(place.dialogues.length, 3, place.id);
});

test("R3: more desire = less credibility but faster escape", () => {
  const mild = buildRescue("cita", 2);
  const extreme = buildRescue("cita", 9);
  assert.strictEqual(mild.credibility, 92);
  assert.strictEqual(extreme.credibility, 43);
  assert.ok(extreme.seconds < mild.seconds);
});

test("R4: invalid input returns null", () => {
  assert.strictEqual(buildRescue(null, 5), null);
  assert.strictEqual(buildRescue("playa", 5), null);
  assert.strictEqual(buildRescue("cita", 0), null);
  assert.strictEqual(buildRescue("cita", 11), null);
});

test("R5: every place and level has a 5-turn dialogue that starts with 'llama' and alternates", () => {
  for (const { id } of PLACES) {
    for (const desire of [2, 5, 9]) {
      const { dialogue } = buildRescue(id, desire);
      assert.strictEqual(dialogue.length, 5);
      dialogue.forEach(({ who, text }, position) => {
        assert.strictEqual(who, position % 2 === 0 ? "llama" : "vos");
        assert.ok(typeof text === "string" && text.length > 0);
      });
    }
  }
});

test("R5: the excuse is the first 'vos' turn and the dialogue changes with the level", () => {
  const extreme = buildRescue("cita", 9);
  assert.strictEqual(extreme.say, extreme.dialogue[1].text);
  assert.match(extreme.say, /arito/);
  assert.notDeepStrictEqual(buildRescue("cita", 2).dialogue, extreme.dialogue);
});

test("R9: cleanName trims spaces and limits to 20 characters", () => {
  assert.strictEqual(cleanName("  Tía Rosa  "), "Tía Rosa");
  assert.strictEqual(cleanName("   "), "");
  assert.strictEqual(cleanName(undefined), "");
  assert.strictEqual(cleanName("a".repeat(25)), "a".repeat(20));
  assert.strictEqual([..."🎉".repeat(25)].length, 25);
  assert.strictEqual([...cleanName("🎉".repeat(25))].length, 20);
});

test("R9: a custom name replaces the caller and, if empty, the place caller is used", () => {
  assert.strictEqual(buildRescue("cumple", 5, "  Tía Rosa ").who, "Tía Rosa");
  assert.strictEqual(buildRescue("cumple", 5, "").who, "Mamá");
  assert.strictEqual(buildRescue("cumple", 5, "   ").who, "Mamá");
  assert.strictEqual(buildRescue("cumple", 5).who, "Mamá");
  assert.strictEqual(buildRescue("playa", 5, "Tía Rosa"), null);
});

test("R10: each character has its own pitch and rate", () => {
  const expected = {
    cumple: [1.2, 1], familia: [1.3, 0.9], cita: [1.4, 1.1], trabajo: [0.7, 1],
    clase: [1.1, 1.15], asado: [1.3, 0.8], consorcio: [0.6, 0.95], sala: [0.8, 1.05],
  };
  for (const { id } of PLACES) {
    const { pitch, rate } = buildRescue(id, 5).voice;
    assert.deepStrictEqual([pitch, rate], expected[id], id);
  }
});

test("R10: a custom name does not change the place voice", () => {
  assert.deepStrictEqual(buildRescue("asado", 5, "Tía Rosa").voice, { pitch: 1.3, rate: 0.8 });
});

test("R11: with no Spanish voices none is picked and replies use pitch 0.9 and rate 1.05", () => {
  const voices = pickVoices([{ lang: "en-US", name: "Inglesa" }]);
  assert.strictEqual(voices.caller, null);
  assert.strictEqual(voices.you, null);
  assert.deepStrictEqual(voices.replyAdjustment, { pitch: 0.9, rate: 1.05 });
  assert.strictEqual(pickVoices([]).caller, null);
});

test("R11: with a single Spanish voice replies use the same voice with a different adjustment", () => {
  const single = { lang: "es_ES", name: "Unica" };
  const voices = pickVoices([{ lang: "en-US", name: "Inglesa" }, single]);
  assert.strictEqual(voices.caller, single);
  assert.strictEqual(voices.you, null);
  assert.deepStrictEqual(voices.replyAdjustment, { pitch: 0.9, rate: 1.05 });
});

test("R11: with several Spanish voices replies use a different one and the caller prefers es-AR", () => {
  const spain = { lang: "es-ES", name: "Espana" };
  const argentina = { lang: "es_AR", name: "Argentina" };
  const voices = pickVoices([spain, argentina]);
  assert.strictEqual(voices.caller, argentina);
  assert.strictEqual(voices.you, spain);
  assert.notStrictEqual(voices.caller, voices.you);
  assert.deepStrictEqual(voices.replyAdjustment, { pitch: 1, rate: 1 });
});

test("R12: dialogues use Rioplatense voseo with no bad words or informal tu", () => {
  const forbidden = /\b(mierda|carajo|boludo|boluda|pelotud[oa]|puta|puto)\b/i;
  const informalTu = /\b(tú|tienes|puedes|quieres|vienes|pasas|llegas)\b/i;
  const regional = /\b(escuchame|escuche|dale|nena|che)\b/i;
  for (const place of PLACES) {
    const texts = place.dialogues.flat().map((turn) => turn.text);
    for (const text of texts) {
      assert.doesNotMatch(text, forbidden, text);
      assert.doesNotMatch(text, informalTu, text);
    }
    assert.ok(texts.some((text) => regional.test(text)), `${place.id} lacks regional expressions`);
  }
});

test("R12: when the caller asks how long you will take, the reply gives a time", () => {
  const { dialogue } = buildRescue("cumple", 5);
  assert.match(dialogue[2].text, /Cuánto tardás/);
  assert.match(dialogue[3].text, /veinte minutos/i);
});

test("R7: recordResult adds an escape or a rejection", () => {
  const empty = { escapes: 0, rejections: 0 };
  assert.deepStrictEqual(recordResult(empty, "escape"), { escapes: 1, rejections: 0 });
  assert.deepStrictEqual(recordResult({ escapes: 2, rejections: 3 }, "rechazo"), { escapes: 2, rejections: 4 });
});

test("R7: recordResult returns a new object and does not mutate the original", () => {
  const original = Object.freeze({ escapes: 1, rejections: 1 });
  const updated = recordResult(original, "escape");
  assert.notStrictEqual(updated, original);
  assert.deepStrictEqual(original, { escapes: 1, rejections: 1 });
  assert.notStrictEqual(recordResult(original, "otra-cosa"), original);
  assert.deepStrictEqual(recordResult(original, "otra-cosa"), original);
});

test("R7: an invalid history counts as zero", () => {
  assert.deepStrictEqual(recordResult(null, "escape"), { escapes: 1, rejections: 0 });
  assert.deepStrictEqual(recordResult(undefined, "rechazo"), { escapes: 0, rejections: 1 });
  assert.deepStrictEqual(recordResult({ escapes: "x", rejections: -4 }, "escape"), { escapes: 1, rejections: 0 });
});
