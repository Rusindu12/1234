#!/usr/bin/env node
/* ============================================================================
 * SipSaviya · content + AI self-test (runs in CI and on any dev machine)
 *
 *   node tools/verify_content.js            → validate + smoke-test the AI
 *   node tools/verify_content.js --dump     → also print example answers
 *
 * It loads the exact files that ship inside the APK into a sandbox, so a
 * broken knowledge card or a broken retrieval step fails the build.
 * ==========================================================================*/
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const WWW = path.join(__dirname, "..", "android", "app", "src", "main", "assets", "www");
const dump = process.argv.indexOf("--dump") > 0;

const FILES = [
  "data/subjects.js",
  "data/kb-maths.js",
  "data/kb-science.js",
  "data/kb-lang.js",
  "data/kb-other.js",
  "data/quiz.js",
  "js/ai/nlp.js",
  "js/ai/embed.js",
  "js/ai/solver.js",
  "js/ai/study.js",
  "js/ai/brain.js"
];

const statsOnly = process.argv.indexOf("--stats-json") > 0;
let errors = [];
let warnings = [];

/* --- sandbox: the app scripts expect a browser-ish global named `window` ---- */
const store = {};
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  Date,
  Math,
  JSON,
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  },
  navigator: { share: null },
  matchMedia: () => ({ matches: false })
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const rel of FILES) {
  const abs = path.join(WWW, rel);
  if (!fs.existsSync(abs)) { errors.push(`missing file: ${rel}`); continue; }
  const code = fs.readFileSync(abs, "utf8");
  try {
    vm.runInContext(code, sandbox, { filename: rel });
  } catch (e) {
    errors.push(`syntax/runtime error in ${rel}: ${e.message}`);
  }
}

if (statsOnly) {
  console.log(JSON.stringify({
    subjects: (sandbox.SIP_SUBJECTS || []).length,
    cards: (sandbox.SIP_KB || []).length,
    questions: (sandbox.SIP_QUIZ || []).length,
    flashcards: (sandbox.SIP_FLASH || []).length
  }));
  process.exit(0);
}

const KB = sandbox.SIP_KB || [];
const QUIZ = sandbox.SIP_QUIZ || [];
const FLASH = sandbox.SIP_FLASH || [];
const SUBJECTS = sandbox.SIP_SUBJECTS || [];
const NLP = sandbox.SipNLP;
const Solver = sandbox.SipAI && sandbox.SipAI.Solver;
const Brain = sandbox.SipAI && sandbox.SipAI.Brain;
const Study = sandbox.SipAI && sandbox.SipAI.Study;

console.log("── content ───────────────────────────────");
console.log(`knowledge cards : ${KB.length}`);
console.log(`mcq questions   : ${QUIZ.length}`);
console.log(`flashcards      : ${FLASH.length}`);
console.log(`subjects        : ${SUBJECTS.length}`);

if (KB.length < 60) errors.push(`knowledge base too small (${KB.length} cards)`);
if (QUIZ.length < 25) errors.push(`quiz bank too small (${QUIZ.length} questions)`);
if (SUBJECTS.length < 20) errors.push(`subject catalogue too small (${SUBJECTS.length})`);

/* --- field checks -------------------------------------------------------- */
const seenTitles = new Map();
const VALID_SUBJECTS = new Set(SUBJECTS.map((s) => s.id)
  .concat((sandbox.SIP_EXTRA_EXAM_SUBJECTS || []).map((s) => s.id)));

KB.forEach((c, i) => {
  if (!c.s) errors.push(`card ${i} has no subject`);
  else if (!VALID_SUBJECTS.has(c.s)) errors.push(`card ${i} ("${c.t}") unknown subject "${c.s}"`);
  if (!c.t) errors.push(`card ${i} has no title`);
  if (!c.d || c.d.length < 15) warnings.push(`card ${i} ("${c.t}") has a very short definition`);
  if (!c.k || c.k.length < 8) warnings.push(`card ${i} ("${c.t}") has weak keywords`);
  if (!Array.isArray(c.g) || !c.g.length) warnings.push(`card ${i} ("${c.t}") has no grades`);
  if (seenTitles.has(c.t)) warnings.push(`duplicate card title: "${c.t}"`);
  seenTitles.set(c.t, i);
  const blob = JSON.stringify(c);
  if (/undefined|NaN/.test(blob)) errors.push(`card ${i} ("${c.t}") contains undefined/NaN`);
});

QUIZ.forEach((q, i) => {
  if (!Array.isArray(q) || q.length !== 6) { errors.push(`question ${i} malformed`); return; }
  if (!Array.isArray(q[3]) || q[3].length !== 4) errors.push(`question ${i} needs 4 options`);
  if (typeof q[4] !== "number" || q[4] < 0 || q[4] > 3) errors.push(`question ${i} has a bad answer index`);
  if (!q[5] || q[5].length < 5) warnings.push(`question ${i} has no explanation`);
});

/* --- AI smoke tests ------------------------------------------------------ */
function ask(q) { return Brain.ask(q, {}); }

const CASES = [
  { q: "1/2 + 1/3 කීයද?", expect: "5/6", where: "solved.answer" },
  { q: "x² − 5x + 6 = 0 විසඳන්න", expect: "3", where: "solved.answer" },
  { q: "2x + 5 = 15 විසඳන්න", expect: "5", where: "solved.answer" },
  { q: "ස්කන්ධය 10kg ත්වරණය 2 m/s² බලය කීයද", expect: "20", where: "solved.answer" },
  { q: "වෝල්ටීයතාව 12V ප්‍රතිරෝධය 4Ω ධාරාව කීයද", expect: "3", where: "solved.answer" },
  { q: "අරය 7cm වෘත්තයක ක්ෂේත්‍රඵලය කීයද", expect: "15", where: "solved.answer" },
  { q: "සංඛ්‍යාතය 500Hz තරංග ආයාමය 0.68m වේගය කීයද", expect: "340", where: "solved.answer" },
  { q: "දත්ත 4, 7, 9, 11, 14 මධ්‍යය කීයද", expect: "9", where: "solved.answer" },
  { q: "රු. 5000ට 10% සරල පොලිය වසර 2කට කීයද", expect: "1000", where: "solved.answer" },
  { q: "72 km/h බවට m/s පරිවර්තනය කරන්න", expect: "20", where: "solved.answer" },
  { q: "ප්‍රකාශ සංශ්ලේෂණය යනු කුමක්ද?", expect: "ක්ලෝරොෆිල්", where: "text" },
  { q: "ප්‍රතිශතය කියන්නේ මොකද්ද?", expect: "100", where: "text" },
  { q: "ඉල්ලුම හා සැපයුම ගැන කියන්න", expect: "ඉල්ලුම", where: "text" },
  { q: "passive voice", expect: "passive", where: "text" },
  { q: "ද්විමය සංඛ්‍යා පද්ධතිය", expect: "ද්විමය", where: "text" },
  { q: "අෂ්ටාංගික මාර්ගය", expect: "සම්මා", where: "text" }
];

let passed = 0, failed = 0;
console.log("\n── AI smoke tests ────────────────────────");

let aiMs = 0;
try {
  const t0 = Date.now();
  Brain.init();
  aiMs = Date.now() - t0;
  const st = Brain.stats();
  console.log(`model ready in ${aiMs} ms · docs ${st.documents} · vocab ${st.vocabulary} · latent ${st.latentDimensions}`);
  if (!st.trained) errors.push("LSA model was not trained");
  if (st.documents < 60) errors.push("corpus too small");
} catch (e) {
  errors.push("AI init failed: " + e.message);
}

for (const c of CASES) {
  let ans = null, text = "", ok = false;
  try {
    ans = ask(c.q);
    text = c.where === "solved.answer"
      ? (ans.solved ? String(ans.solved.answer) : "")
      : JSON.stringify(ans).replace(/\\u[0-9a-f]{4}/gi, " ");
    ok = text.indexOf(c.expect) >= 0;
  } catch (e) {
    text = "EXCEPTION " + e.message;
  }
  if (ok) { passed++; console.log(`  ✅ ${c.q}  →  ${text.slice(0, 70)}`); }
  else { failed++; console.log(`  ❌ ${c.q}\n       want “${c.expect}” in ${c.where}, got: ${text.slice(0, 160)}`); }
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 2) errors.push(`${failed} AI smoke tests failed`);

/* --- planner sanity ------------------------------------------------------ */
try {
  const plan = Study.buildPlan({ exam: "ol", examDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10), minutesPerDay: 120, subjects: ["maths", "science"] });
  console.log(`\n── planner ───────────────────────────────\n${plan.days.length} days · ${plan.days[0].blocks.length} blocks on day 1`);
  if (plan.days.length < 5) errors.push("planner produced too few days");
  if (!plan.days[0].blocks.length) errors.push("planner produced empty days");
} catch (e) {
  errors.push("planner failed: " + e.message);
}

if (dump) {
  console.log("\n── example answers ───────────────────────");
  ["x²−5x+6=0 විසඳන්න", "ප්‍රකාශ සංශ්ලේෂණය යනු කුමක්ද?", "රු. 5000ට 10% සරල පොලිය"].forEach((q) => {
    const a = ask(q);
    console.log("\nQ: " + q);
    console.log("   " + (a.title || "") + " | " + (a.lead || ""));
    (a.blocks || []).forEach((b) => {
      console.log("   · " + (b.h || "") + ": " + (b.text || b.big || (b.list || []).join(" / ")).slice(0, 150));
    });
  });
}

if (warnings.length) {
  console.log("\n── warnings ──────────────────────────────");
  warnings.slice(0, 25).forEach((w) => console.log("  ⚠ " + w));
  if (warnings.length > 25) console.log(`  … ${warnings.length - 25} more`);
}

if (errors.length) {
  console.log("\n── ERRORS ────────────────────────────────");
  errors.forEach((e) => console.log("  ✖ " + e));
  process.exit(1);
}
console.log("\n✅ content + AI checks passed");
