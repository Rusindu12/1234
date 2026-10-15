/* ============================================================================
 * SipSaviya AI · brain.js
 * The tutor itself: takes a student question, decides what kind of help is
 * needed (calculation, explanation, quiz, plan, encouragement) and composes a
 * structured, Sinhala-first answer out of the solver + semantic retrieval.
 * ==========================================================================*/
window.SipAI = window.SipAI || {};
(function (root) {
  "use strict";

  var Embed = root.Embed, Solver = root.Solver, NLP = window.SipNLP, Study = null;
  var corpus = [], ready = false;

  /* ------------------------------------------------------------------ setup */
  function buildCorpus() {
    corpus = [];
    var kb = window.SIP_KB || [];
    for (var i = 0; i < kb.length; i++) {
      var c = kb[i];
      corpus.push({
        id: "kb:" + i, kind: "kb", ref: i, subject: c.s,
        title: c.t, keywords: c.k || "", grades: c.g || [],
        text: [c.t, c.k, c.d, (c.f || []).join(" "), (c.st || []).join(" "), c.ex || ""].join(" \n ")
      });
    }
    var quiz = window.SIP_QUIZ || [];
    for (var q = 0; q < quiz.length; q++) {
      var it = quiz[q];
      corpus.push({
        id: "quiz:" + q, kind: "quiz", ref: q, subject: it[0], title: it[2],
        keywords: it[3].join(" "), grades: it[1],
        text: [it[2], it[3].join(" "), it[5], it[0]].join(" \n ")
      });
    }
    var flash = window.SIP_FLASH || [];
    for (var f = 0; f < flash.length; f++) {
      corpus.push({
        id: "flash:" + f, kind: "flash", ref: f, subject: flash[f][0], title: flash[f][1],
        keywords: flash[f][1], text: flash[f][1] + " " + flash[f][2]
      });
    }
    Embed.index(corpus);
  }

  function init(forced) {
    if (ready && !forced) return;
    var t0 = Date.now();
    buildCorpus();
    Embed.train();
    ready = true;
    if (window.console && console.log) {
      console.log("[SipAI] ready in " + (Date.now() - t0) + "ms", Embed.stats());
    }
  }

  /* ------------------------------------------------------------------ helpers */
  function kb(i) { return (window.SIP_KB || [])[i]; }
  function subjectName(id, lang) {
    var list = window.SIP_SUBJECTS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return lang === "en" ? (list[i].en || list[i].si) : list[i].si;
    }
    for (var j = 0; j < window.SIP_EXTRA_EXAM_SUBJECTS.length; j++) {
      var e = window.SIP_EXTRA_EXAM_SUBJECTS[j];
      if (e.id === id) return lang === "en" ? e.en : e.si;
    }
    return id;
  }

  var GREET = {
    si: ["හෙලෝ! 👋 මම සිප්සවිය AI ගුරුවරයා. ගණිතය, විද්‍යාව, ඉංග්‍රීසි, ICT වගේ ඕනෑම පාඩමක් ගැන අහන්න — නැත්නම් ගණනය කරන්න ඕන ප්‍රශ්නයක් ලියන්න.",
      "ආයුබෝවන්! 🙏 මොන විෂයයද අද ඉගෙන ගන්න ඕන? ‘ප්‍රතිශතය කියන්නේ මොකද්ද’ වගේ අහන්නත් පුළුවන්."],
    en: ["Hello! 👋 I am the SipSaviya AI tutor. Ask me any school topic, or type a calculation to solve step by step."]
  };

  function pickGreet(lang) {
    var arr = GREET[lang] || GREET.si;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  var MOTIV = [
    "මතක තබාගන්න: දිනකට විනාඩි 40ක් වුණත් නිතර නිතර කරන පාඩම් කිරීම, එක දිනක පැය 5ක් එකවර කරන වැඩට වඩා ගොඩක් ප්‍රතිඵල දෙනවා. 💪",
    "අමාරු පාඩමක් දැනුණොත් ඒක කොටස් 3කට බෙදන්න. එක් කොටසක් අද, අනිත් එක හෙට. මොළයට කුඩා කොටස් ලේසි. 🧠",
    "ඔබ තනියම නෙවෙයි — ලංකාවේ ලක්ෂ ගණන් සිසුන් මේ දේම කරනවා. දිගටම කරගෙන යන්න! 🇱🇰"
  ];

  /* ------------------------------------------------------------------ compose */
  /**
   * Main entry point.
   * @param {string} question
   * @param {{subject?:string, grades?:number[]}} [ctx]
   */
  function ask(question, ctx) {
    ctx = ctx || {};
    init();
    var q = String(question || "").trim();
    var lang = NLP.replyLang(q) === "en" ? "en" : "si";
    var out = {
      lang: lang, question: q, title: "", lead: "", solved: null,
      blocks: [], cards: [], related: [], chips: [], confidence: 0, kind: "chat"
    };
    if (!q) {
      out.lead = pickGreet("si");
      out.chips = defaultChips("si");
      return out;
    }

    /* small talk */
    var low = q.toLowerCase();
    if (/^(hi|hello|hai|hey|ayubowan|ආයුබෝ|හෙලෝ|හායි|kohomada|කොහොමද)/.test(low) && q.length < 18) {
      out.lead = pickGreet(lang);
      out.chips = defaultChips(lang);
      return out;
    }
    if (/thank|ස්තූති|බොහොම ස්තූතියි|ස්තුති/.test(low)) {
      out.lead = lang === "en" ? "You are welcome! 🙌 Ask me anything else." : "සතුටින්ම! 🙌 තව ප්‍රශ්නයක් අහන්න.";
      out.chips = defaultChips(lang);
      return out;
    }

    var intent = NLP.intent(q).id;
    var subject = ctx.subject || NLP.subjectOf(q);

    /* 1 — calculation / equation / physics / geometry */
    var solved = null;
    try { solved = Solver.solve(q); } catch (e) { solved = null; }

    /* 2 — semantic retrieval over the whole knowledge base + question bank */
    var hits = Embed.search(q, { subject: subject, limit: 5 });
    var top = hits[0];

    if (solved) {
      out.kind = "solved";
      out.solved = solved;
      out.title = solved.title || "ගණනය";
      out.lead = lang === "en"
        ? "Here is the full working, step by step:"
        : "හරි! පියවරෙන් පියවර විසඳුම මෙන්න 👇";
      out.blocks.push({ h: lang === "en" ? "Method / formula" : "සූත්‍රය", text: solved.formula });
      out.blocks.push({ h: lang === "en" ? "Steps" : "පියවර", list: solved.steps });
      out.blocks.push({ h: lang === "en" ? "Answer" : "පිළිතුර", big: solved.answer });
      if (solved.note) out.blocks.push({ h: lang === "en" ? "Note" : "සටහන", text: solved.note });
      if (top && top.score > 0.16) addCard(out, top, lang, true);
      out.confidence = 0.9;
      out.chips = chipsFor(lang, top ? top.doc.subject : subject);
      return out;
    }

    /* 3 — quiz request */
    if (intent === "quiz" || /ප්‍රශ්නයක් දෙන්න|test me/.test(low)) {
      out.kind = "quiz";
      out.title = lang === "en" ? "Practice question" : "පුහුණු ප්‍රශ්නයක්";
      out.lead = lang === "en" ? "Try this one — I will explain after you answer."
        : "මේ ප්‍රශ්නය උත්සාහ කරන්න. ඔබ පිළිතුර දුන් පසු මම පැහැදිලි කරනවා 👇";
      out.chips = chipsFor(lang, subject);
      out.confidence = 0.8;
      return out;
    }

    /* 4 — study plan */
    if (intent === "plan") {
      out.kind = "plan";
      out.title = lang === "en" ? "Study plan" : "පාඩම් කාලසටහන හදමු";
      out.lead = lang === "en"
        ? "Open the Planner tab and I will build a day-by-day timetable around your exam date."
        : "කාලසටහන ටැබ් එකේ ඔබගේ විභාගයේ දිනය දුන්නොත්, මම දිනපතා පාඩම් කළ යුතු දේ ලිස්ට් එකක් හදලා දෙන්නම්. 📅";
      out.blocks.push({ h: lang === "en" ? "How it works" : "කොහොමද වැඩ කරන්නේ",
        list: lang === "en"
          ? ["Pick your exam and exam date", "Choose how many hours a day you can study",
            "I spread the syllabus units across the days", "Tick off what you finish — the plan adjusts"]
          : ["විභාගය හා දිනය තෝරන්න", "දිනකට පාඩම් කළ හැකි පැය ගණන දෙන්න",
            "මම විෂය නිර්දේශය දින අනුව බෙදලා දෙනවා", "ඉවර කළ දේ ටික් කරන්න — කාලසටහන ඒ අනුව වෙනස් වෙනවා"] });
      out.chips = ["📅 කාලසටහන හදන්න", "📚 පෙළපොත්", "📝 පසුගිය ප්‍රශ්න"];
      out.confidence = 0.7;
      return out;
    }

    /* 5 — motivated / emotional support */
    if (intent === "motivate") {
      out.kind = "advice";
      out.title = lang === "en" ? "You can do this" : "ඔබට පුළුවන්! 💚";
      out.lead = MOTIV[Math.floor(Math.random() * MOTIV.length)];
      out.blocks.push({ h: "අද කරන්න", list: ["පාඩමක් විනාඩි 25ක් තියාගෙන කියවන්න", "පසුගිය ප්‍රශ්න පත්‍රයක් බලන්න", "අමාරු කොටස මට අහන්න — මම පියවරෙන් පැහැදිලි කරන්නම්"] });
      out.chips = defaultChips(lang);
      out.confidence = 0.6;
      return out;
    }

    /* 6 — knowledge explanation (the main path) */
    if (top && top.score > 0.14) {
      out.kind = "explain";
      addCard(out, top, lang, false);
      out.lead = lang === "en"
        ? "Here is the explanation, with formulas and the method:"
        : "මේ ගැන පැහැදිලි කරන්නම් " + (top.score > 0.32 ? "👇" : "(හොඳම ගැලපීම මෙයයි) 👇");
      out.confidence = Math.min(0.95, 0.55 + top.score);
      for (var r = 1; r < Math.min(3, hits.length); r++) {
        if (hits[r].score > 0.12) out.related.push({ subject: hits[r].doc.subject, title: hits[r].doc.title, doc: hits[r].doc });
      }
      out.chips = chipsFor(lang, top.doc.subject);
      return out;
    }

    /* 7 — nothing confident: be honest and helpful */
    out.kind = "chat";
    out.title = lang === "en" ? "Let me help you find it" : "මට මේක හරියටම හම්බුණේ නැහැ 🤔";
    out.lead = lang === "en"
      ? "I could not match your question to a card yet. Try naming the subject and the exact thing: e.g. \"සමීකරණය විසඳන්න x²−5x+6=0\" or \"ප්‍රකාශ සංශ්ලේෂණය යනු කුමක්ද?\". You can also browse the Books, Papers and Quiz tabs."
      : "ඔබගේ ප්‍රශ්නය මට තවම හරියටම හඳුනාගන්න බැරි වුණා. විෂයය හා අවශ්‍ය දේ ලියන්න — උදා: “x²−5x+6=0 විසඳන්න”, “ප්‍රකාශ සංශ්ලේෂණය යනු කුමක්ද?”, “රු. 5000ට 10% සරල පොලිය වසර 2කට”. පොත්, ප්‍රශ්න පත්‍ර හා Quiz ටැබ් එකෙනුත් බලන්න පුළුවන්.";
    out.blocks.push({ h: lang === "en" ? "Things I am very good at" : "මම හොඳටම දන්නා දේවල්",
      list: ["ගණිතය — සමීකරණ, භාග, ප්‍රතිශත, ත්‍රිකෝණමිති, අවකලනය", "විද්‍යාව — භෞතික, රසායන, ජීව විද්‍යා සූත්‍ර හා ගණනය",
        "ඉංග්‍රීසි ව්‍යාකරණය හා රචනා", "ICT — ද්විමය, තර්ක ද්වාර, පයිතන්, දත්ත සමුදාය",
        "පසුගිය ප්‍රශ්න පත්‍ර + පෙළපොත් ලින්ක්"] });
    out.chips = defaultChips(lang);
    out.confidence = 0.2;
    return out;
  }

  function defaultChips(lang) {
    return lang === "en"
      ? ["🧮 Solve x²−5x+6=0", "🔬 What is photosynthesis?", "📝 Give me a practice question", "📅 Build a study plan"]
      : ["🧮 x²−5x+6=0 විසඳන්න", "🔬 ප්‍රකාශ සංශ්ලේෂණය යනු කුමක්ද?", "📝 පුහුණු ප්‍රශ්නයක් දෙන්න", "📅 පාඩම් කාලසටහනක් හදන්න"];
  }

  function chipsFor(lang, subject) {
    var s = subject ? subjectName(subject, lang) : "";
    if (lang === "en") {
      return ["📝 " + s + " practice question", "📄 " + s + " past papers", "🔁 Quiz me on " + s, "📅 Study plan"];
    }
    return ["📝 " + (s || "මේ විෂයෙන්") + " ප්‍රශ්නයක් අහන්න", "🧮 තව ගණනයක්", "🔁 මම ලෑස්තිද කියලා ටෙස්ට් කරන්න", "📚 මේ පාඩමට පොත"];
  }

  /** Turn a retrieved card into ready-to-render blocks. */
  function addCard(out, hit, lang, brief) {
    var c = hit.doc.kind === "kb" ? kb(hit.doc.ref) : null;
    if (!c) {
      // knowledge came from the question bank — answer it directly
      var item = (window.SIP_QUIZ || [])[hit.doc.ref];
      if (item) {
        out.cards.push({ subject: item[0], title: item[2], question: item[2], options: item[3], answer: item[4], explain: item[5], id: "quiz:" + hit.doc.ref });
        out.blocks.push({ h: lang === "en" ? "Answer" : "පිළිතුර", big: item[3][item[4]] });
        out.blocks.push({ h: lang === "en" ? "Why" : "පැහැදිලි කිරීම", text: item[5] });
        return;
      }
      return;
    }
    var card = {
      id: hit.doc.id, subject: c.s, title: c.t, definition: c.d,
      formulas: c.f || [], steps: c.st || [], example: c.ex || "", grades: c.g || []
    };
    out.cards.push(card);
    out.title = out.title || c.t;
    out.blocks.push({ h: lang === "en" ? "What it is" : "අර්ථය", text: c.d });
    if (c.f && c.f.length) out.blocks.push({ h: lang === "en" ? "Formulas" : "සූත්‍ර", list: c.f });
    if (!brief && c.st && c.st.length) out.blocks.push({ h: lang === "en" ? "How to do it (steps)" : "කරන ආකාරය (පියවර)", list: c.st });
    if (!brief && c.ex) out.blocks.push({ h: lang === "en" ? "Worked example" : "උදාහරණය", text: c.ex });
    out.blocks.push({ h: lang === "en" ? "Subject / grade" : "විෂය / ශ්‍රේණිය", text: subjectName(c.s, lang) + " · " + (c.g && c.g.length ? c.g.join(", ") : "") });
  }

  /** Related concept cards for a knowledge card (used by the UI). */
  function relatedTo(cardId, limit) {
    init();
    for (var i = 0; i < corpus.length; i++) {
      if (corpus[i].id === cardId) {
        return Embed.similar(i, limit || 4).map(function (r) {
          return { id: r.doc.id, title: r.doc.title, subject: r.doc.subject, score: r.score };
        });
      }
    }
    return [];
  }

  function searchCards(text, limit, subject) {
    init();
    return Embed.search(text, { limit: limit || 8, subject: subject });
  }

  root.Brain = {
    init: init, ask: ask, relatedTo: relatedTo, searchCards: searchCards,
    stats: function () { return Embed.stats(); },
    setStudy: function (s) { Study = s; },
    getStudy: function () { return Study; }
  };
})(window.SipAI);
