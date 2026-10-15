#!/usr/bin/env node
/* ============================================================================
 * SipSaviya · UI smoke test
 * Loads the real assets/www/index.html inside jsdom and drives the app the way
 * a student would: switching tabs, opening sheets, answering a quiz, sending a
 * question to the AI tutor, generating a study plan and toggling the theme.
 *
 *   npm install        # once, to get jsdom
 *   node tools/ui_test.js
 * ==========================================================================*/
/* UI smoke test: loads the real index.html in jsdom and drives the app. */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const WWW = path.join(__dirname, "..", "android", "app", "src", "main", "assets", "www");
const html = fs.readFileSync(path.join(WWW, "index.html"), "utf8")
  .replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    const code = fs.readFileSync(path.join(WWW, src), "utf8");
    return `<script>${code.replace(/<\/script>/g, "<\\/script>")}</script>`;
  });

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => { if (!/scrollTo|Not implemented/.test(e.message)) errors.push("jsdomError: " + e.message); });
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole: vc, url: "http://localhost/index.html", pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;
window.matchMedia = window.matchMedia || (() => ({ matches: false }));

function q(sel) { return doc.querySelector(sel); }
function text() { return q("#main").textContent.replace(/\s+/g, " ").trim(); }
function click(el) { if (!el) throw new Error("no element to click"); el.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); }

setTimeout(() => {
  const results = [];
  function check(name, cond, extra) { results.push([cond ? "PASS" : "FAIL", name, extra || ""]); }

  check("home renders", text().includes("AI ගුරුවරයා"), text().slice(0, 60));
  check("no boot errors", errors.length === 0, errors.join(" | ").slice(0, 200));

  // tab navigation
  click(q('#tabs button[data-v="books"]'));
  check("books view", text().includes("පෙළපොත්"), text().slice(0, 50));
  const gradeChip = doc.querySelector('[data-grade="11"]');
  click(gradeChip);
  check("grade switch works", text().includes("11 ශ්‍රේණිය"));
  click(doc.querySelector('[data-book]'));
  check("book sheet opens", !!q(".sheet-back") && q(".sheet").textContent.includes("EPD"));
  click(q('[data-close]'));

  click(q('#tabs button[data-v="papers"]'));
  check("papers view", text().includes("පසුගිය ප්‍රශ්න"));
  click(doc.querySelector('[data-paper]'));
  check("paper sheet opens", !!q(".sheet-back"));
  click(q('[data-close]'));

  click(q('#tabs button[data-v="quiz"]'));
  check("quiz view", text().includes("පුහුණු ප්‍රශ්න"));
  click(q("#startQuiz"));
  check("quiz started", text().includes("ප්‍රශ්නය 1 / 5"), text().slice(0, 60));
  const opt = doc.querySelector('[data-opt="0"]');
  click(opt);
  check("answering shows explanation", text().includes("පැහැදිලි කිරීම"));
  click(q("#nextQ"));
  check("advances", text().includes("ප්‍රශ්නය 2 / 5"));

  // flash cards (quit the running quiz first)
  var quit = q("#quitQuiz"); if (quit) click(quit);
  click(q('#tabs button[data-v="quiz"]'));
  var startF = q("#startFlash") || q("#flashBtn");
  click(startF);
  check("flash view", text().includes("කාඩ් 1 /"), text().slice(0, 60));
  click(q("#flipCard"));
  check("flash flips", !!doc.querySelector('[data-fq="1"]'));
  click(doc.querySelector('[data-fq="1"]'));
  check("next card", text().includes("කාඩ් 2 /"));

  // tutor chat
  click(q('#tabs button[data-v="tutor"]'));
  check("tutor view", !!q("#qbox"));
  q("#qbox").value = "x² − 5x + 6 = 0 විසඳන්න";
  click(q("#sendBtn"));
  setTimeout(() => {
    const t = text();
    check("ai answers in chat", t.includes("x₁") && t.includes("ද්විතීයික"), t.slice(-200));

    // planner
    window.SipApp.go("plan");
    check("plan view", text().includes("කාලසටහන"));
    const chips = doc.querySelectorAll("#subjChips .chip");
    if (chips.length >= 3) { click(chips[0]); click(chips[1]); }
    q("#examDate").value = new Date(Date.now() + 40 * 864e5).toISOString().slice(0, 10);
    click(q("#makePlan"));
    check("plan generated", text().includes("ඔබගේ කාලසටහන"), text().slice(0, 80));

    // more screen + theme
    click(q("#moreBtn"));
    check("more view", text().includes("ගැන") && text().includes("AI ගුරුවරයා ගැන"));
    check("ai stats shown", /\d+ක්/.test(text()));
    click(doc.querySelector('[data-theme="light"]'));
    check("light theme", doc.documentElement.getAttribute("data-theme") === "light");

    // back button bridge: from a sub-screen back must land on home
    window.SipApp.go("books");
    const backOk = window.SipApp.nativeBack() === true;
    check("native back returns home", backOk && text().includes("හෙලෝ"));

    check("no runtime errors", errors.length === 0, errors.join(" | ").slice(0, 300));
    const failed = results.filter(r => r[0] === "FAIL");
    results.forEach(r => console.log(`${r[0] === "PASS" ? "✅" : "❌"} ${r[1]}${r[2] ? "  — " + r[2] : ""}`));
    console.log(`\n${results.length - failed.length}/${results.length} UI checks passed`);
    process.exit(failed.length ? 1 : 0);
  }, 900);
}, 900);
