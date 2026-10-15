/* ============================================================================
 * SipSaviya · app.js — application shell, router and every screen.
 * ==========================================================================*/
(function () {
  "use strict";

  var bridge = window.SipAndroid || null;
  var AI = window.SipAI;
  var NLP = window.SipNLP;

  var PKEY = "sipsaviya.profile.v1";
  var CKEY = "sipsaviya.chat.v1";
  var DKEY = "sipsaviya.plan.done.v1";

  var S = {
    view: "home",
    theme: "dark",
    profile: { name: "", grade: 10, medium: "si", exam: "ol" },
    books: { grade: 10, medium: "si", q: "" },
    papers: { exam: "ol", stream: "science", medium: "si" },
    quiz: null,
    chat: [],
    plan: null,
    sheetOpen: false
  };

  /* ------------------------------------------------------------------ utils */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
  function uid() { return Math.random().toString(36).slice(2, 9); }

  function toast(msg, ms) {
    var old = $(".toast"); if (old) old.remove();
    var d = document.createElement("div");
    d.className = "toast"; d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, ms || 2400);
  }

  function openLink(url) {
    if (!url) return;
    if (bridge && bridge.openExternal) bridge.openExternal(url);
    else window.open(url, "_blank");
  }

  // Storage is best-effort: some WebView builds refuse DOM storage on file://
  // URLs, and the app must still work (progress simply won't persist).
  function lsGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) { } }
  function loadObj(key, def) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; } catch (e) { return def; }
  }

  var DAYS = ["ඉරිදා", "සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්පතින්දා", "සිකුරාදා", "සෙනසුරාදා"];
  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return DAYS[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1);
  }

  /* ------------------------------------------------------------ data helpers */
  function subjectsForGrade(g) {
    return (window.SIP_SUBJECTS || []).filter(function (s) { return s.grades.indexOf(g) >= 0; });
  }
  function subjectById(id) {
    var all = (window.SIP_SUBJECTS || []).concat(window.SIP_EXTRA_EXAM_SUBJECTS || []);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function sName(id, medium) {
    var s = subjectById(id);
    if (!s) return id;
    if (medium === "ta" && s.ta) return s.ta;
    if (medium === "en") return s.en;
    return s.si;
  }
  function sIcon(id) { var s = subjectById(id); return s ? (s.icon || "📘") : "📘"; }

  /* Official, free sources. Textbooks: Educational Publications Department (EPD).
     Past papers: Department of Examinations. Lessons: e-Thaksalawa (MoE). */
  var SRC = {
    epd: "http://www.edupub.gov.lk/",
    epdBooks: "http://www.edupub.gov.lk/BooksDownload.php",
    thaksalawa: "https://e-thaksalawa.moe.gov.lk/",
    doenets: "https://www.doenets.lk/pastpapers",
    doenetsHome: "https://www.doenets.lk/",
    nie: "https://www.nie.ac.lk/",
    channelnie: "https://channelnie.nie.ac.lk/",
    online: "https://www.onlineexambd.lk/" // placeholder-free: replaced below
  };
  SRC.online = "https://doenets.lk/";

  function gsearch(q) { return "https://www.google.com/search?q=" + encodeURIComponent(q); }

  /* ------------------------------------------------------------------ router */
  var VIEWS = {};
  function go(view, params) {
    S.view = view;
    if (params) for (var k in params) S[k] = params[k];
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    var main = $("#main");
    var fn = VIEWS[S.view] || VIEWS.home;
    main.innerHTML = fn();
    $$("#tabs button").forEach(function (b) {
      var map = { home: "home", tutor: "tutor", books: "books", papers: "papers", quiz: "quiz", plan: "home", more: "home" };
      b.classList.toggle("on", map[S.view] === b.dataset.v);
    });
    if (S.view === "tutor") {
      var box = $("#chatScroll");
      if (box) box.scrollTop = box.scrollHeight;
    }
    updateThemeUI();
  }
  function updateThemeUI() {
    document.documentElement.setAttribute("data-theme", S.theme);
    var b = $("#themeBtn");
    if (b) b.textContent = S.theme === "dark" ? "🌙" : "☀️";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", S.theme === "dark" ? "#0B1220" : "#F4F7FC");
    if (bridge && bridge.setSystemBars) {
      try { bridge.setSystemBars(S.theme === "dark" ? "#0B1220" : "#F4F7FC", S.theme !== "dark"); } catch (e) { }
    }
  }

  /* --------------------------------------------------------------------- sheet */
  function sheet(title, html) {
    closeSheet();
    var back = document.createElement("div");
    back.className = "sheet-back";
    back.innerHTML = '<div class="sheet"><div class="row spread"><h3>' + esc(title) + '</h3>' +
      '<button class="icon-btn" data-close="1">✕</button></div>' + html + "</div>";
    back.addEventListener("click", function (e) {
      if (e.target === back || e.target.dataset.close) closeSheet();
    });
    document.body.appendChild(back);
    S.sheetOpen = true;
  }
  function closeSheet() {
    var b = $(".sheet-back"); if (b) b.remove();
    S.sheetOpen = false;
  }

  /* =========================================================== HOME screen */
  VIEWS.home = function () {
    var p = S.profile;
    var st = AI.Study.stats();
    var streak = AI.Study.streak();
    var weak = AI.Study.weakSubjects(3);
    var plan = S.plan || AI.Study.state().plan;
    var today = new Date().toISOString().slice(0, 10);
    var done = loadObj(DKEY, {});
    var todayBlocks = [];
    if (plan && plan.days) {
      for (var i = 0; i < plan.days.length; i++) if (plan.days[i].date === today) todayBlocks = plan.days[i].blocks;
    }
    var greet = p.name ? ("හෙලෝ " + esc(p.name) + "! 👋") : "හෙලෝ! 👋";
    var hour = new Date().getHours();
    var timeGreet = hour < 12 ? "සුබ උදෑසනක්" : hour < 17 ? "සුබ දවසක්" : "සුබ සැන්දෑවක්";

    return '<div class="view">' +
      '<div class="hero">' +
      '<h2>' + greet + '</h2>' +
      '<p>' + timeGreet + ' · ' + esc(S.profile.grade) + ' ශ්‍රේණිය · ' +
      (p.exam === "al" ? "උසස් පෙළ" : p.exam === "grade5" ? "ශිෂ්‍යත්වය" : "සාමාන්‍ය පෙළ") + '</p>' +
      '<div class="row" style="margin-top:14px;gap:8px">' +
      '<button class="btn primary grow" data-go="tutor">🤖 AI ගුරුවරයාගෙන් අහන්න</button>' +
      '</div>' +
      '<div class="row" style="margin-top:10px;gap:14px">' +
      '<span class="pill">🔥 ' + streak + ' දින පෙළක්</span>' +
      '<span class="pill ' + (st.accuracy >= 60 ? "ok" : "warn") + '">🎯 නිරවද්‍යතාව ' + st.accuracy + '%</span>' +
      '<span class="pill">✅ ' + st.n + ' ප්‍රශ්න</span>' +
      '</div></div>' +

      '<div class="grid2">' +
      tile("tutor", "🤖", "AI ගුරුවරයා", "පියවරෙන් පියවර පිළිතුරු") +
      tile("books", "📚", "පාසල් පොත්", "1–13 ශ්‍රේණි · නොමිලේ") +
      tile("papers", "📝", "පසුගිය ප්‍රශ්න", "ශිෂ්‍යත්ව · සා.පෙ. · උ.පෙ.") +
      tile("quiz", "🎯", "පුහුණු ප්‍රශ්න", "MCQ + ෆ්ලෑෂ් කාඩ්") +
      '</div>' +

      (todayBlocks.length ? '<div class="card"><div class="row spread"><h2>📅 අද කාලසටහන</h2>' +
        '<span class="muted">' + todayBlocks.length + ' කොටස්</span></div>' +
        todayBlocks.map(function (b, i) {
          var k = today + "#" + i;
          return '<div class="list-item"><span class="ic">' + (done[k] ? "✅" : "⏳") + '</span><div class="grow">' +
            '<b>' + esc(b.topic) + '</b><small>' + (b.subject === "—" ? "" : esc(sName(b.subject, p.medium)) + " · ") + b.minutes + " min</small></div>" +
            '<button class="chip" data-plan-tick="' + k + '">' + (done[k] ? "නැවත" : "කළා") + '</button></div>';
        }).join("") + '</div>' : "") +

      '<div class="card"><div class="row spread"><h2>🧠 දිනපතා ප්‍රශ්නය</h2>' +
      '<button class="btn sm ghost" data-go="quiz">තව ➜</button></div>' +
      dailyQuestion() + '</div>' +

      (weak.length ? '<div class="card"><h2>📉 වැඩි අවධානය අවශ්‍ය</h2>' +
        weak.map(function (w) {
          return '<div class="list-item"><span class="ic">' + sIcon(w.subject) + '</span><div class="grow"><b>' +
            esc(sName(w.subject, p.medium)) + '</b><small>නිරවද්‍යතාව ' + w.accuracy + '% (' + w.n + ' ප්‍රශ්න)</small></div>' +
            '<button class="chip" data-practice="' + w.subject + '">පුහුණු වෙන්න</button></div>';
        }).join("") + '</div>' : "") +

      '<div class="card"><h2>⚡ ඉක්මන් ක්‍රියා</h2><div class="chips">' +
      '<span class="chip" data-ask="රු. 5000ට 10% සරල පොලිය වසර 2කට කීයද?">💰 පොලී ගණනය</span>' +
      '<span class="chip" data-ask="x²−5x+6=0 විසඳන්න">🧮 සමීකරණය විසඳන්න</span>' +
      '<span class="chip" data-ask="ප්‍රකාශ සංශ්ලේෂණය යනු කුමක්ද?">🔬 විද්‍යාව</span>' +
      '<span class="chip" data-ask="Passive voice කියන්නේ මොකද්ද?">🔤 ඉංග්‍රීසි</span>' +
      '<span class="chip" data-go="plan">📅 කාලසටහන හදන්න</span>' +
      '<span class="chip" data-go="more">ℹ️ ගැන / සැකසුම්</span>' +
      '</div></div>' +
      '</div>';
  };

  function tile(view, ic, title, sub) {
    return '<button class="tile" data-go="' + view + '"><span class="ic">' + ic + '</span>' +
      '<b>' + esc(title) + '</b><span>' + esc(sub) + '</span></button>';
  }

  function dailyQuestion() {
    var quiz = window.SIP_QUIZ || [];
    var seed = new Date().getDate() + new Date().getMonth() * 31;
    var item = quiz[seed % quiz.length];
    if (!item) return '<p class="muted">ප්‍රශ්න තවම ලෝඩ් වී නැහැ.</p>';
    return '<p style="margin:6px 0 0">' + esc(item[2]) + '</p>' +
      '<div class="chips">' + item[3].map(function (o, i) {
        return '<span class="chip" data-daily="' + esc(o) + '" data-dq="' + seed % quiz.length + '" data-di="' + i + '">' + esc(o) + '</span>';
      }).join("") + '</div>';
  }

  /* ========================================================== TUTOR screen */
  VIEWS.tutor = function () {
    var msgs = S.chat.length ? S.chat : [{
      role: "ai", answer: {
        lang: "si", title: "සිප්සවිය AI ගුරුවරයා 🤖",
        lead: "මම ඔබගේ offline ගුරුවරයා. ගණිතය, විද්‍යාව, ඉංග්‍රීසි, ICT ඕනෑම පාඩමක් අහන්න — නැත්නම් ගණනය කරන්න ඕන ප්‍රශ්නයක් මෙහි ලියන්න. මම පියවරෙන් පියවර පැහැදිලි කරන්නම්.",
        blocks: [{ h: "මට පුළුවන් දේවල්", list: ["සමීකරණ, භාග, ප්‍රතිශත, ත්‍රිකෝණමිති විසඳීම", "භෞතික/රසායන/ජීව සූත්‍ර ගණනය", "පාඩම් පැහැදිලි කිරීම හා උදාහරණ", "ප්‍රශ්න අහලා ඔබව ටෙස්ට් කිරීම", "පාඩම් කාලසටහන් සැකසීම"] }],
        chips: ["🧮 x²−5x+6=0 විසඳන්න", "🔬 ප්‍රකාශ සංශ්ලේෂණය යනු කුමක්ද?", "📝 පුහුණු ප්‍රශ්නයක් දෙන්න"]
      }
    }];
    return '<div class="view"><div class="chat-wrap" id="chatScroll">' +
      msgs.map(renderMsg).join("") +
      '</div></div>' +
      '<div class="composer"><div class="inner">' +
      '<textarea id="qbox" rows="1" placeholder="ඔබගේ ප්‍රශ්නය මෙහි ලියන්න…"></textarea>' +
      '<button class="send" id="sendBtn">➤</button></div></div>';
  };

  function renderMsg(m) {
    if (m.role === "me") return '<div class="bubble me">' + esc(m.text) + '</div>';
    var a = m.answer || {};
    var html = '<div class="bubble ai">';
    if (a.title) html += "<h4>" + esc(a.title) + "</h4>";
    if (a.lead) html += '<div class="lead">' + esc(a.lead) + "</div>";
    (a.blocks || []).forEach(function (b) {
      html += '<div class="blk">';
      if (b.h) html += '<div class="bh">' + esc(b.h) + "</div>";
      if (b.text) html += (b.formula ? '<div class="formula">' + esc(b.text) + "</div>" : "<div>" + esc(b.text) + "</div>");
      if (b.list) html += "<ul>" + b.list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
      if (b.big) html += '<div class="bigans">' + esc(b.big) + "</div>";
      html += "</div>";
    });
    if (a.kind === "quiz") {
      var q = AI.Study.pick({ subject: m.quizSubject, count: 1 })[0];
      if (q) {
        m.widget = q;
        html += '<div class="blk"><div class="bh">ප්‍රශ්නය</div><div>' + esc(q.question) + "</div>" +
          q.options.map(function (o, i) {
            return '<div class="opt" data-inline-q="' + q.index + '" data-inline-i="' + i + '" data-inline-a="' + q.answer + '">' +
              '<span class="k">' + "ABCD"[i] + "</span><span>" + esc(o) + "</span></div>";
          }).join("") + '<div class="muted" id="inlineExp" style="margin-top:8px"></div></div>';
      }
    }
    if ((a.related || []).length) {
      html += '<div class="blk"><div class="bh">අදාළ පාඩම්</div><div class="chips">' +
        a.related.map(function (r) {
          return '<span class="chip" data-ask="' + esc(r.title) + ' යනු කුමක්ද?">' + sIcon(r.subject) + " " + esc(r.title) + "</span>";
        }).join("") + "</div></div>";
    }
    if ((a.chips || []).length) {
      html += '<div class="blk"><div class="chips">' + a.chips.map(function (c) {
        return '<span class="chip" data-ask="' + esc(c.replace(/^[^\w\u0D80-\u0DFF]+/, "")) + '">' + esc(c) + "</span>";
      }).join("") + "</div></div>";
    }
    html += "</div>";
    return html;
  }

  function askTutor(text) {
    if (!text || !text.trim()) return;
    S.chat.push({ role: "me", text: text });
    var typing = { role: "ai", typing: true, answer: {} };
    S.chat.push(typing);
    paintChat();
    setTimeout(function () {
      var ans = AI.Brain.ask(text, { subject: NLP.subjectOf(text), grades: AI.Study.gradeBand(S.profile.exam) });
      S.chat.pop();
      S.chat.push({ role: "ai", answer: ans });
      save(CKEY, S.chat.slice(-24));
      paintChat();
    }, 260);
  }

  function paintChat() {
    var box = $("#chatScroll");
    if (!box) return;
    box.innerHTML = S.chat.map(function (m) {
      if (m.typing) return '<div class="bubble ai"><div class="typing"><span></span><span></span><span></span></div></div>';
      return renderMsg(m);
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  /* ========================================================== BOOKS screen */
  VIEWS.books = function () {
    var b = S.books;
    var subs = subjectsForGrade(b.grade);
    if (b.q) {
      var q = b.q.toLowerCase();
      subs = subs.filter(function (s) {
        return (s.si + " " + s.en + " " + (s.ta || "")).toLowerCase().indexOf(q) >= 0;
      });
    }
    return '<div class="view">' +
      '<div class="card"><h2>📚 පාසල් පෙළපොත් — නොමිලේ</h2>' +
      '<p class="muted">ශ්‍රී ලංකා අධ්‍යාපන ප්‍රකාශන දෙපාර්තමේන්තුව (EPD) නිකුත් කරන සියලුම රජයේ පෙළපොත් සිංහල, දෙමළ හා ඉංග්‍රීසි මාධ්‍යවලින් නොමිලේ බාගත කළ හැක. පොතේ PDF එක නිල වෙබ් අඩවියෙන් ලබාගන්න — මෙය 100% නොමිලේ.</p>' +
      '<label class="fld"><span>ශ්‍රේණිය</span><div class="chips">' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(function (g) {
        return '<span class="chip ' + (g === b.grade ? "on" : "") + '" data-grade="' + g + '">' + g + '</span>';
      }).join("") + "</div></label>" +
      '<label class="fld"><span>මාධ්‍යය</span><div class="chips">' +
      [["si", "සිංහල"], ["ta", "දෙමළ"], ["en", "English"]].map(function (m) {
        return '<span class="chip ' + (m[0] === b.medium ? "on" : "") + '" data-medium="' + m[0] + '">' + m[1] + "</span>";
      }).join("") + "</div></label>" +
      '<input type="text" id="bookQ" placeholder="විෂය සොයන්න… (උදා: ගණිතය)" value="' + esc(b.q) + '" />' +
      '</div>' +

      '<div class="card"><div class="row spread"><h2 id="bookCount">' + b.grade + " ශ්‍රේණිය · පොත් " + subs.length + "ක්</h2>" +
      '<button class="btn sm ghost" id="epdBtn">EPD වෙබ් අඩවිය ↗</button></div><div id="bookList">' +
      (subs.length ? subs.map(bookRow).join("") : '<p class="muted">මේ ශ්‍රේණියට පොත් හමු නොවීය. ඉහළින් EPD වෙබ් අඩවියෙන් බලන්න.</p>') +
      "</div></div>" +

      '<div class="card"><h2>🔗 නිල නොමිලේ මූලාශ්‍ර</h2>' +
      linkRow("🏛️", "අධ්‍යාපන ප්‍රකාශන දෙපාර්තමේන්තුව", "සියලු පෙළපොත් PDF", SRC.epd) +
      linkRow("📖", "e-Thaksalawa", "පාඩම්, වීඩියෝ හා ක්‍රියාකාරකම්", SRC.thaksalawa) +
      linkRow("📺", "Channel NIE", "විෂය නිර්දේශ පාඩම් විකාශ", SRC.channelnie) +
      linkRow("🎓", "ජාතික අධ්‍යාපන ආයතනය (NIE)", "විෂය නිර්දේශ හා ගුරු අත්පොත්", SRC.nie) +
      "</div></div>";
  };

  function linkRow(ic, title, sub, url) {
    return '<div class="list-item" data-link="' + esc(url) + '"><span class="ic">' + ic + "</span>" +
      '<div class="grow"><b>' + esc(title) + "</b><small>" + esc(sub) + "</small></div><span>↗</span></div>";
  }

  function bookSheet(subjectId) {
    var s = subjectById(subjectId), b = S.books;
    if (!s) return;
    var title = (b.medium === "en" ? s.en : b.medium === "ta" && s.ta ? s.ta : s.si);
    var q = s.en + " grade " + b.grade + " " + (b.medium === "si" ? "sinhala" : b.medium === "ta" ? "tamil" : "english") + " textbook pdf edupub";
    sheet(title + " · " + b.grade + " ශ්‍රේණිය", 
      '<p class="muted">පොත බාගත කිරීමට පහත නිල මූලාශ්‍රය භාවිත කරන්න. සියල්ල නොමිලේ.</p>' +
      '<button class="btn primary block" data-link="' + SRC.epd + '" style="margin-top:10px">🏛️ EPD නිල වෙබ් අඩවිය (PDF බාගැනීම)</button>' +
      '<button class="btn block" data-link="' + SRC.epdBooks + '" style="margin-top:8px">📥 පොත් බාගැනීමේ පිටුව</button>' +
      '<button class="btn block" data-link="' + SRC.thaksalawa + '" style="margin-top:8px">📖 e-Thaksalawa පාඩම්</button>' +
      '<button class="btn block" data-link="' + gsearch(q) + '" style="margin-top:8px">🔍 මේ පොත සොයන්න (Google)</button>' +
      '<hr/><p class="muted">යෝජනාව: PDF එක බාගත කර ඔබගේ දුරකථනයේ “Files” ෆෝල්ඩරයේ තබාගන්න — පසුව අන්තර්ජාලය නොමැතිවත් කියවිය හැක.</p>');
  }

  /* ========================================================= PAPERS screen */
  VIEWS.papers = function () {
    var P = S.papers;
    var exam = window.SIP_EXAMS[P.exam] || window.SIP_EXAMS.ol;
    var subjectIds;
    if (P.exam === "al") subjectIds = (exam.streams[P.stream] || {}).subjects || [];
    else if (P.exam === "grade5") subjectIds = ["maths", "sinhala", "english", "civics"];
    else subjectIds = (exam.mandatory || []).concat(exam.optional || []);
    var seen = {}, ids = subjectIds.filter(function (x) { if (seen[x]) return false; seen[x] = true; return true; });

    return '<div class="view">' +
      '<div class="card"><h2>📝 පසුගිය ප්‍රශ්න පත්‍ර — නොමිලේ</h2>' +
      '<p class="muted">නිල ප්‍රශ්න පත්‍ර ලංකා විභාග දෙපාර්තමේන්තුවේ (doenets.lk) වෙබ් අඩවියෙන් නොමිලේ බාගත කළ හැක. විෂයයක් තෝරා වර්ෂය අනුව ලබාගන්න.</p>' +
      '<label class="fld"><span>විභාගය</span><div class="chips">' +
      [["grade5", "5 ශ්‍රේණිය ශිෂ්‍යත්වය"], ["ol", "සා.පෙ. (O/L)"], ["al", "උ.පෙ. (A/L)"], ["common", "පොදු පරීක්ෂණය"]].map(function (e) {
        return '<span class="chip ' + (P.exam === e[0] ? "on" : "") + '" data-exam="' + e[0] + '">' + e[1] + "</span>";
      }).join("") + "</div></label>" +
      (P.exam === "al" ? '<label class="fld"><span>විෂය ධාරාව</span><div class="chips">' +
        Object.keys(exam.streams).map(function (k) {
          return '<span class="chip ' + (P.stream === k ? "on" : "") + '" data-stream="' + k + '">' + exam.streams[k].si + "</span>";
        }).join("") + "</div></label>" : "") +
      '<label class="fld"><span>මාධ්‍යය</span><div class="chips">' +
      [["si", "සිංහල"], ["ta", "දෙමළ"], ["en", "English"]].map(function (m) {
        return '<span class="chip ' + (P.medium === m[0] ? "on" : "") + '" data-pmedium="' + m[0] + '">' + m[1] + "</span>";
      }).join("") + "</div></label></div>" +

      '<div class="card"><div class="row spread"><h2>විෂයය තෝරන්න</h2>' +
      '<button class="btn sm ghost" id="doeBtn">doenets.lk ↗</button></div>' +
      ids.map(function (id) {
        return '<div class="list-item" data-paper="' + id + '"><span class="ic">' + sIcon(id) + '</span>' +
          '<div class="grow"><b>' + esc(sName(id, P.medium)) + '</b><small>' + esc((subjectById(id) || {}).en || "") + "</small></div>" +
          '<button class="chip">වර්ෂ ➜</button></div>';
      }).join("") + "</div>" +

      '<div class="card"><h2>💡 පසුගිය ප්‍රශ්නවලින් උපරිම ප්‍රයෝජනය</h2><ul>' +
      "<li>පළමුව විනාඩි 5ක් මුළු පත්‍රය කියවන්න — ප්‍රශ්න කීයක්ද, කොයි කොටස ලේසිද බලන්න.</li>" +
      "<li>කාලසීමාව නැවතුවෙන් (timer) එකක් තියාගෙන කරන්න. විභාගයේ කාලයට හුරු වෙන්න.</li>" +
      "<li>පිළිතුරු ලියා අවසන් වූ පසු ප්‍රතිචාර පත්‍රය (marking scheme) සමඟ පරීක්ෂා කරන්න.</li>" +
      "<li>වැරදුන ප්‍රශ්න මට අහන්න — මම පියවරෙන් විසඳන්නම්. 🤖</li></ul></div></div>";
  };

  function paperSheet(subjectId) {
    var P = S.papers;
    var exam = window.SIP_EXAMS[P.exam] || window.SIP_EXAMS.ol;
    var name = sName(subjectId, P.medium);
    var years = exam.years || [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    var examName = P.exam === "al" ? "A/L" : P.exam === "ol" ? "O/L" : P.exam === "grade5" ? "Grade 5 Scholarship" : "Common General Test";
    var subjEn = (subjectById(subjectId) || {}).en || subjectId;
    var rows = years.slice().reverse().map(function (y) {
      var q = examName + " " + y + " " + subjEn + " past paper " + (P.medium === "si" ? "sinhala" : P.medium === "ta" ? "tamil" : "english") + " pdf doenets";
      var ms = examName + " " + y + " " + subjEn + " marking scheme pdf";
      return '<div class="list-item"><div class="grow"><b>' + y + '</b><small>ප්‍රශ්න පත්‍රය + ප්‍රතිචාර පත්‍රය</small></div>' +
        '<button class="chip" data-link="' + SRC.doenets + '">නිල පිටුව</button>' +
        '<button class="chip" data-link="' + gsearch(q) + '">පත්‍රය</button>' +
        '<button class="chip" data-link="' + gsearch(ms) + '">පිළිතුරු</button></div>';
    }).join("");
    sheet(name + " — පසුගිය ප්‍රශ්න", 
      '<p class="muted">විභාග දෙපාර්තමේන්තුවේ නිල පිටුවෙන් ප්‍රශ්න පත්‍ර නොමිලේ ලබාගන්න. නිශ්චිත වර්ෂයක් සොයන්නත් පුළුවන්.</p>' +
      '<button class="btn primary block" data-link="' + SRC.doenets + '">📄 doenets.lk පසුගිය ප්‍රශ්න</button>' + rows);
  }

  /* =========================================================== QUIZ screen */
  VIEWS.quiz = function () {
    var q = S.quiz;
    if (!q) {
      var subs = subjectsForGrade(S.profile.grade);
      return '<div class="view">' +
        '<div class="card"><h2>🎯 පුහුණු ප්‍රශ්න (MCQ)</h2>' +
        '<p class="muted">ඔබගේ දුර්වල කොටස් හඳුනාගෙන මම ප්‍රශ්න තෝරනවා. පිළිතුරට පසුව පැහැදිලි කිරීමත් ලැබේ.</p>' +
        '<div class="grid2" style="margin-top:12px">' +
        '<button class="btn primary" id="startQuiz" data-subject="' + S.profile.exam + '">📝 ප්‍රශ්න 5ක් පටන් ගන්න</button>' +
        '<button class="btn" id="startFlash">🃏 ෆ්ලෑෂ් කාඩ් (SRS)</button>' +
        '</div></div>' +
        '<div class="card"><h2>විෂයයක් තෝරන්න</h2>' +
        subs.map(function (s) {
          var st = AI.Study.bySubject()[s.id];
          return '<div class="list-item" data-start-subject="' + s.id + '"><span class="ic">' + s.icon + '</span>' +
            '<div class="grow"><b>' + esc(sName(s.id, S.profile.medium)) + '</b>' +
            '<small>' + (st ? ("නිරවද්‍යතාව " + st.accuracy + "%") : "තවම පුහුණු වී නැහැ") + "</small></div>" +
            '<span class="pill">' + (st ? st.n + " ප්‍රශ්න" : "නව") + "</span></div>";
        }).join("") + "</div>" +
        '<div class="card"><h2>🃏 ෆ්ලෑෂ් කාඩ් — නැවත මතක් කිරීම</h2>' +
        '<p class="muted">දිනකට කාඩ් 10ක් පමණක් නැවත බැලීමෙන් දිගු කාලීන මතකය ශක්තිමත් වේ (Spaced Repetition).</p>' +
        '<button class="btn block" id="flashBtn" style="margin-top:10px">අද කාඩ් පෙන්වන්න</button></div></div>';
    }

    if (q.mode === "flash") return flashView(q);

    var item = q.items[q.i];
    if (!item) return quizResult();
    return '<div class="view">' +
      '<div class="card"><div class="row spread"><span class="pill">ප්‍රශ්නය ' + (q.i + 1) + " / " + q.items.length + '</span>' +
      '<span class="pill">ලකුණු ' + q.score + '</span></div>' +
      '<div class="progressbar" style="margin:10px 0 4px"><i style="width:' + Math.round(q.i / q.items.length * 100) + '%"></i></div>' +
      "<h2 style=\"margin-top:12px\">" + esc(item.question) + "</h2>" +
      item.options.map(function (o, i) {
        var cls = "";
        if (q.answered) {
          if (i === item.answer) cls = "correct";
          else if (i === q.picked) cls = "wrong";
        }
        return '<div class="opt ' + cls + '" data-opt="' + i + '"><span class="k">' + "ABCD"[i] + "</span><span>" + esc(o) + "</span></div>";
      }).join("") +
      (q.answered ? '<div class="blk"><div class="bh">පැහැදිලි කිරීම</div><div>' + esc(item.explain) + '</div></div>' +
        '<button class="btn primary block" id="nextQ" style="margin-top:12px">' + (q.i + 1 >= q.items.length ? "ප්‍රතිඵල බලන්න →" : "ඊළඟ ප්‍රශ්නය →") + "</button>" : "") +
      "</div>" +
      '<div class="row"><button class="btn ghost grow" data-ask="' + esc(item.question) + ' පැහැදිලි කරන්න">🤖 AI ගුරුවරයාගෙන් අහන්න</button>' +
      '<button class="btn ghost" id="quitQuiz">✕</button></div>' +
      "</div>";
  };

  function quizResult() {
    var q = S.quiz, pct = Math.round(q.score / q.items.length * 100);
    var msg = pct >= 80 ? "සුපිරි! 🎉 දිගටම මේ විදියට." : pct >= 50 ? "හොඳයි! 👍 තව ටිකක් පුහුණු වුණොත් ලේසියි." : "කමක් නැහැ 💪 වැරදුන ඒවා දැන් බලමු.";
    return '<div class="view"><div class="card center"><h2>ප්‍රතිඵලය</h2>' +
      '<div style="font-size:44px;font-weight:700;margin:6px 0">' + pct + "%</div>" +
      '<p class="muted">' + q.score + " / " + q.items.length + " නිවැරදි · " + esc(msg) + "</p></div>" +
      '<div class="card"><h2>ඔබ ලියූ පිළිතුරු</h2>' +
      q.items.map(function (it, i) {
        var picked = q.answers[i];
        var ok = picked === it.answer;
        return '<div class="list-item"><span class="ic">' + (ok ? "✅" : "❌") + '</span><div class="grow"><b>' + esc(it.question) + '</b>' +
          "<small>නිවැරදි: " + esc(it.options[it.answer]) + (ok ? "" : " · ඔබ: " + esc(it.options[picked] == null ? "—" : it.options[picked])) + "</small></div>" +
          '<button class="chip" data-ask="' + esc(it.question) + '">පැහැදිලි කරන්න</button></div>';
      }).join("") + "</div>" +
      '<div class="row"><button class="btn primary grow" id="retryQuiz">නැවත පුහුණු වෙන්න</button>' +
      '<button class="btn grow" data-go="tutor">🤖 AI ගුරුවරයා</button></div></div>';
  }

  function flashView(q) {
    var card = q.cards[q.i];
    if (!card) {
      return '<div class="view"><div class="card center"><h2>අද කාඩ් ඉවරයි! 🎉</h2>' +
        '<p class="muted">හෙට නැවත එන්න — නැවත මතක් කිරීමේ පද්ධතිය ඔබට කල් දෙනවා.</p>' +
        '<button class="btn primary block" data-go="quiz" style="margin-top:12px">ආපසු</button></div></div>';
    }
    return '<div class="view"><div class="card center">' +
      '<span class="pill">කාඩ් ' + (q.i + 1) + " / " + q.cards.length + '</span>' +
      '<h2 style="margin-top:14px">' + esc(card.front) + "</h2>" +
      (q.flipped ? '<div class="bigans">' + esc(card.back) + "</div>" : '<p class="muted">පිළිතුර මතක් කරගන්න 🧠</p>') +
      (q.flipped
        ? '<div class="chips" style="justify-content:center;margin-top:16px">' +
        '<span class="chip" data-fq="0">😕 නැවත</span><span class="chip" data-fq="1">🙂 දැනගත්තා</span><span class="chip" data-fq="2">😎 ලේසි</span></div>'
        : '<button class="btn primary block" id="flipCard" style="margin-top:16px">පිළිතුර බලන්න</button>') +
      "</div>" +
      '<div class="row"><span class="pill">' + esc(sName(card.subject, S.profile.medium)) + '</span>' +
      '<button class="btn ghost grow" id="quitQuiz">අවසන් කරන්න</button></div></div>';
  }

  /* =========================================================== PLAN screen */
  VIEWS.plan = function () {
    var p = S.profile;
    var plan = S.plan;
    var done = loadObj(DKEY, {});
    var html = '<div class="view">' +
      '<div class="card"><h2>📅 පාඩම් කාලසටහන හදමු</h2>' +
      '<p class="muted">ඔබගේ විභාග දිනය හා දිනකට පාඩම් කළ හැකි කාලය දෙන්න. මම විෂය නිර්දේශය දින අනුව බෙදලා, දිනපතා කළ යුතු දේ ලිස්ට් එකක් හදනවා.</p>' +
      '<label class="fld"><span>විභාගය</span><div class="chips">' +
      [["grade5", "5 ශ්‍රේණිය"], ["ol", "සා.පෙ. (O/L)"], ["al", "උ.පෙ. (A/L)"]].map(function (e) {
        return '<span class="chip ' + (p.exam === e[0] ? "on" : "") + '" data-plan-exam="' + e[0] + '">' + e[1] + "</span>";
      }).join("") + "</div></label>" +
      '<label class="fld"><span>විභාගයේ දිනය</span><input type="date" id="examDate" value="' + esc(plan ? plan.examDate : "") + '" /></label>' +
      '<label class="fld"><span>දිනකට පාඩම් කළ හැකි විනාඩි ගණන: <b id="mpdVal">' + (plan ? plan.minutesPerDay : 120) + '</b></span>' +
      '<input type="range" id="mpd" min="40" max="480" step="20" value="' + (plan ? plan.minutesPerDay : 120) + '" style="width:100%" /></label>' +
      '<label class="fld"><span>විෂයයන්</span><div class="chips" id="subjChips">' +
      subjectsForGrade(p.exam === "al" ? 12 : p.exam === "grade5" ? 5 : 10).map(function (s) {
        var sel = plan ? plan.subjects.indexOf(s.id) >= 0 : ["maths", "science", "sinhala", "english"].indexOf(s.id) >= 0;
        return '<span class="chip ' + (sel ? "on" : "") + '" data-plan-subject="' + s.id + '">' + s.icon + " " + esc(sName(s.id, p.medium)) + "</span>";
      }).join("") + "</div></label>" +
      '<button class="btn primary block" id="makePlan" style="margin-top:12px">🗓️ කාලසටහන හදන්න</button>' +
      "</div>";

    if (plan) {
      var todayIso = new Date().toISOString().slice(0, 10);
      html += '<div class="card"><div class="row spread"><h2>ඔබගේ කාලසටහන</h2>' +
        '<span class="pill">' + esc(plan.examDate) + " දක්වා</span></div>" +
        '<p class="muted">' + esc(plan.summary) + "</p></div>";
      plan.days.slice(0, 45).forEach(function (d) {
        var total = d.blocks.length, doneN = d.blocks.filter(function (b, i) { return done[d.date + "#" + i]; }).length;
        html += '<div class="card tight"><div class="row spread"><b>' + esc(fmtDate(d.date)) +
          (d.date === todayIso ? ' <span class="pill ok">අද</span>' : "") + "</b>" +
          '<span class="muted">' + doneN + "/" + total + " · " + d.minutes + " min</span></div>" +
          d.blocks.map(function (b, i) {
            var k = d.date + "#" + i;
            return '<div class="list-item"><span class="ic">' + (done[k] ? "✅" : b.stage === "paper" ? "📝" : b.stage === "revise" ? "🔁" : sIcon(b.subject)) + '</span>' +
              '<div class="grow"><b>' + esc(b.topic) + '</b><small>' + (b.subject === "—" ? "" : esc(sName(b.subject, p.medium)) + " · ") + b.minutes + " min" + "</small></div>" +
              '<button class="chip" data-plan-tick="' + k + '">' + (done[k] ? "↺" : "✔") + "</button></div>";
          }).join("") + "</div>";
      });
    }
    return html + "</div>";
  };

  /* =========================================================== MORE screen */
  VIEWS.more = function () {
    var st = AI.Study.stats();
    var ai = AI.Brain.stats();
    return '<div class="view">' +
      '<div class="card"><h2>👤 මගේ තොරතුරු</h2>' +
      '<label class="fld"><span>නම</span><input type="text" id="pName" value="' + esc(S.profile.name) + '" placeholder="ඔබගේ නම" /></label>' +
      '<label class="fld"><span>ශ්‍රේණිය</span><div class="chips">' +
      [5, 6, 7, 8, 9, 10, 11, 12, 13].map(function (g) {
        return '<span class="chip ' + (g === S.profile.grade ? "on" : "") + '" data-pgrade="' + g + '">' + g + '</span>';
      }).join("") + "</div></label>" +
      '<label class="fld"><span>මාධ්‍යය</span><div class="chips">' +
      [["si", "සිංහල"], ["ta", "දෙමළ"], ["en", "English"]].map(function (m) {
        return '<span class="chip ' + (m[0] === S.profile.medium ? "on" : "") + '" data-pmedium="' + m[0] + '">' + m[1] + "</span>";
      }).join("") + "</div></label>" +
      '<button class="btn primary block" id="saveProfile">සුරකින්න</button></div>' +

      '<div class="card"><h2>📊 ඔබගේ ප්‍රගතිය</h2>' +
      '<div class="row spread"><span>නිරවද්‍යතාව</span><b>' + st.accuracy + '%</b></div>' +
      '<div class="progressbar" style="margin:6px 0 10px"><i style="width:' + st.accuracy + '%"></i></div>' +
      '<div class="row spread"><span>පිළිතුරු දුන් ප්‍රශ්න</span><b>' + st.n + '</b></div>' +
      '<div class="row spread"><span>දින පෙළක් (streak)</span><b>🔥 ' + AI.Study.streak() + '</b></div>' +
      Object.keys(AI.Study.bySubject()).map(function (k) {
        var v = AI.Study.bySubject()[k];
        return '<div class="row spread" style="margin-top:8px"><span>' + sIcon(k) + " " + esc(sName(k, S.profile.medium)) + "</span>" +
          '<span class="pill ' + (v.accuracy >= 60 ? "ok" : "bad") + '">' + v.accuracy + "% (" + v.n + ")</span></div>";
      }).join("") + "</div>" +

      '<div class="card"><h2>🤖 AI ගුරුවරයා ගැන</h2>' +
      '<p class="muted">සිප්සවියේ AI ගුරුවරයා සම්පූර්ණයෙන්ම ඔබගේ දුරකථනය තුළ ක්‍රියා කරයි — අන්තර්ජාලය අවශ්‍ය නැහැ, දත්ත කිසිවක් පිටතට යවන්නේ නැහැ.</p>' +
      '<ul class="muted" style="padding-left:20px">' +
      "<li>දැනුම් පත් " + ai.documents + "ක් (KB + ප්‍රශ්න + ෆ්ලෑෂ් කාඩ්)</li>" +
      "<li>පද මාලාව " + ai.vocabulary + "ක් · ලේටන්ට් මාන " + ai.latentDimensions + "ක්</li>" +
      "<li>TF-IDF + LSA (ත්‍රිමාණ කැපූ SVD) අර්ථ සෙවීම + BM25 මිශ්‍රණය</li>" +
      "<li>හරියටම ගණනය කරන විසඳුම් එන්ජිම: සමීකරණ, භාග, ජ්‍යාමිතිය, භෞතික/රසායන සූත්‍ර</li>" +
      "</ul></div>" +

      '<div class="card"><h2>🎨 පෙනුම</h2><div class="chips">' +
      '<span class="chip ' + (S.theme === "dark" ? "on" : "") + '" data-theme="dark">🌙 අඳුරු</span>' +
      '<span class="chip ' + (S.theme === "light" ? "on" : "") + '" data-theme="light">☀️ එළි</span></div></div>' +

      '<div class="card"><h2>📤 මිතුරන් සමඟ බෙදාගන්න</h2>' +
      '<p class="muted">සිප්සවිය සම්පූර්ණයෙන්ම නොමිලේ. ඔබගේ මිතුරන්ටත් APK එක බෙදාගන්න.</p>' +
      '<div class="row" style="margin-top:10px"><button class="btn primary grow" id="shareApp">APK ලින්ක් බෙදාගන්න</button>' +
      '<button class="btn grow" data-link="https://github.com/Rusindu12/1234">GitHub ↗</button></div></div>' +

      '<div class="card"><h2>ℹ️ ගැන</h2>' +
      '<p class="muted">සිප්සවිය (SipSaviya) v1.0 — ශ්‍රී ලංකාවේ සිසුන් සඳහා නොමිලේ නිර්මාණය කළ අධ්‍යාපන යෙදුමක්.</p>' +
      '<p class="muted">පොත් හා ප්‍රශ්න පත්‍ර ලබා දෙන්නේ අධ්‍යාපන ප්‍රකාශන දෙපාර්තමේන්තුව හා විභාග දෙපාර්තමේන්තුව වැනි නිල මූලාශ්‍රවලිනි — ඒවා සියල්ල නොමිලේ. අපි ඒ ගොනු පිටපත් නොකර, නිල මූලාශ්‍රයට යොමු කරමු.</p>' +
      '<p class="muted">' + (bridge ? "Android " + esc(bridge.platform ? bridge.platform() : "") + " · v" + esc(bridge.appVersion ? bridge.appVersion() : "1.0") : "බ්‍රවුසරයේ ක්‍රියාත්මක වේ") + "</p>" +
      "</div></div>";
  };

  /* ================================================================= binding */
  // All interaction is delegated from the document, so re-rendering a view
  // never stacks duplicate listeners.
  var bound = false;

  function bindAll() {
    if (bound) return;
    bound = true;
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-go],[data-ask],[data-link],[data-grade],[data-medium],[data-book]," +
        "[data-exam],[data-stream],[data-paper],[data-start-subject],[data-opt],[data-plan-tick],[data-plan-subject]," +
        "[data-plan-exam],[data-pmedium],[data-pgrade],[data-theme],[data-practice],[data-daily],[data-fq],[data-inline-q]");
      // Guard: everything must live inside the current view or an open sheet.
      // (Without this, closest() walks up to <html data-theme> and every tap
      // would look like a theme switch.)
      if (!t || t === document.documentElement) return;
      if (!t.closest("#main") && !t.closest(".sheet-back")) return;
      var d = t.dataset;

      if (d.go) { closeSheet(); go(d.go); return; }
      if (d.ask) { closeSheet(); go("tutor"); askTutor(d.ask); return; }
      if (d.link) { openLink(d.link); return; }
      if (d.practice) { startQuiz(d.practice); return; }
      if (d.daily) { checkDaily(t); return; }
      if (d.theme) { S.theme = d.theme; save("sipsaviya.theme", S.theme); updateThemeUI(); render(); return; }

      switch (true) {
        case d.grade !== undefined:
          S.books.grade = parseInt(d.grade, 10); render(); break;
        case d.medium !== undefined:
          S.books.medium = d.medium; render(); break;
        case d.book !== undefined:
          bookSheet(d.book); break;
        case d.exam !== undefined:
          S.papers.exam = d.exam; render(); break;
        case d.stream !== undefined:
          S.papers.stream = d.stream; render(); break;
        case d.paper !== undefined:
          paperSheet(d.paper); break;
        case d.pmedium !== undefined:
          if (S.view === "papers") { S.papers.medium = d.pmedium; render(); }
          else { S.profile.medium = d.pmedium; save(PKEY, S.profile); render(); }
          break;
        case d.pgrade !== undefined:
          S.profile.grade = parseInt(d.pgrade, 10); save(PKEY, S.profile); render(); break;
        case d.startSubject !== undefined:
          startQuiz(d.startSubject); break;
        case d.opt !== undefined:
          answerQuiz(parseInt(d.opt, 10)); break;
        case d.planTick !== undefined:
          tickPlan(d.planTick); break;
        case d.planSubject !== undefined:
          t.classList.toggle("on"); break;
        case d.planExam !== undefined:
          S.profile.exam = d.planExam; save(PKEY, S.profile); render(); break;
        case d.fq !== undefined:
          flashQuality(parseInt(d.fq, 10)); break;
        case d.inlineQ !== undefined:
          answerInline(t);
          break;
      }
    });

    document.addEventListener("click", function (e) {
      var id = e.target.id;
      switch (id) {
        case "sendBtn": sendChat(); break;
        case "startQuiz": startQuiz(); break;
        case "startFlash":
        case "flashBtn": startFlash(); break;
        case "nextQ": nextQuestion(); break;
        case "retryQuiz": startQuiz(S.quiz && S.quiz.subject); break;
        case "quitQuiz": S.quiz = null; render(); break;
        case "flipCard": S.quiz.flipped = true; render(); break;
        case "makePlan": makePlan(); break;
        case "epdBtn": openLink(SRC.epd); break;
        case "doeBtn": openLink(SRC.doenets); break;
        case "moreBtn": go("more"); break;
        case "themeBtn":
          S.theme = S.theme === "dark" ? "light" : "dark";
          save("sipsaviya.theme", S.theme); updateThemeUI();
          break;
        case "saveProfile":
          var nm = $("#pName");
          if (nm) S.profile.name = nm.value.trim();
          save(PKEY, S.profile); toast("සුරැකුණා ✅"); break;
        case "shareApp":
          var link = "https://github.com/Rusindu12/1234/releases/latest/download/SipSaviya.apk";
          if (bridge && bridge.share) bridge.share("සිප්සවිය — නොමිලේ පාසල් පොත්, ප්‍රශ්න පත්‍ර හා AI ගුරුවරයා 📚🤖\n" + link);
          else if (navigator.share) navigator.share({ text: link });
          else { openLink(link); }
          break;
      }
    });

    document.addEventListener("input", function (e) {
      if (e.target.id === "bookQ") {
        S.books.q = e.target.value;
        filterBookList();
      }
      if (e.target.id === "mpd") {
        var v = $("#mpdVal"); if (v) v.textContent = e.target.value;
      }
      if (e.target.id === "qbox") {
        e.target.style.height = "auto";
        e.target.style.height = Math.min(110, e.target.scrollHeight) + "px";
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.target.id === "qbox" && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); sendChat();
      }
      if (e.key === "Escape") closeSheet();
    });

    document.addEventListener("click", function (e) {
      var tab = e.target.closest && e.target.closest("#tabs button[data-v]");
      if (tab) { closeSheet(); go(tab.dataset.v); }
    });

    // Plan checkboxes + date input live-update
    document.addEventListener("change", function (e) {
      if (e.target.id === "examDate") { S._examDate = e.target.value; }
    });
  }

  /** Rebuild only the book list while typing, so the input keeps focus. */
  function filterBookList() {
    var box = document.getElementById("bookList");
    if (!box) return;
    var q = (S.books.q || "").toLowerCase();
    var subs = subjectsForGrade(S.books.grade).filter(function (s) {
      return !q || (s.si + " " + s.en + " " + (s.ta || "")).toLowerCase().indexOf(q) >= 0;
    });
    if (!subs.length) {
      box.innerHTML = '<p class="muted">ගැලපෙන පොතක් හමු නොවීය.</p>';
    } else {
      box.innerHTML = subs.map(bookRow).join("");
    }
    var count = document.getElementById("bookCount");
    if (count) count.textContent = S.books.grade + " ශ්‍රේණිය · පොත් " + subs.length + "ක්";
  }

  /** One row in the book list (shared by the full render and the live filter). */
  function bookRow(s) {
    var med = S.books.medium;
    var title = med === "en" ? s.en : (med === "ta" && s.ta) ? s.ta : s.si;
    return '<div class="list-item" data-book="' + s.id + '">' +
      '<span class="ic">' + s.icon + '</span>' +
      '<div class="grow"><b>' + esc(title) + '</b><small>' + esc(s.en) + '</small></div>' +
      '<span class="chip">බාගත කරන්න ↗</span></div>';
  }

  function sendChat() {
    var box = $("#qbox");
    if (!box) return;
    var text = box.value.trim();
    if (!text) return;
    box.value = "";
    box.style.height = "auto";
    askTutor(text);
  }

  /* ------------------------------------------------------------ quiz engine */
  function startQuiz(subject) {
    subject = subject === "ol" || subject === "al" ? null : subject;
    var items = AI.Study.pick({ exam: S.profile.exam, subject: subject, count: 5 });
    if (!items.length) { toast("මේ විෂයයට ප්‍රශ්න තවම නැහැ 🙏"); return; }
    S.quiz = { mode: "mcq", items: items, i: 0, score: 0, answered: false, picked: null, answers: [], subject: subject };
    go("quiz");
  }
  function answerQuiz(i) {
    var q = S.quiz;
    if (!q || q.answered) return;
    var item = q.items[q.i];
    q.picked = i;
    q.answered = true;
    q.answers[q.i] = i;
    if (i === item.answer) q.score++;
    AI.Study.record(item.index, i === item.answer, item.subject);
    render();
  }
  function nextQuestion() {
    var q = S.quiz;
    if (!q) return;
    q.i++;
    q.answered = false;
    q.picked = null;
    render();
  }
  function startFlash() {
    var cards = AI.Study.dueFlashcards(10);
    if (!cards.length) { toast("අද නැවත බැලිය යුතු කාඩ් නැහැ 🎉"); return; }
    S.quiz = { mode: "flash", cards: cards, i: 0, flipped: false };
    go("quiz");
  }
  function flashQuality(quality) {
    var q = S.quiz;
    if (!q) return;
    AI.Study.reviewFlash(q.cards[q.i].index, quality);
    q.i++;
    q.flipped = false;
    render();
  }
  function answerInline(el) {
    var idx = parseInt(el.dataset.inlineQ, 10);
    var picked = parseInt(el.dataset.inlineI, 10);
    var correct = parseInt(el.dataset.inlineA, 10);
    var item = (window.SIP_QUIZ || [])[idx];
    var opts = el.parentNode.querySelectorAll(".opt");
    Array.prototype.forEach.call(opts, function (o) {
      var i = parseInt(o.dataset.inlineI, 10);
      if (i === correct) o.classList.add("correct");
      else if (i === picked) o.classList.add("wrong");
    });
    var exp = $("#inlineExp");
    if (exp) exp.textContent = (picked === correct ? "✅ නිවැරදි! " : "❌ තව උත්සාහ කරන්න. ") + (item ? item[5] : "");
    AI.Study.record(idx, picked === correct, item ? item[0] : null);
  }
  function checkDaily(el) {
    var idx = parseInt(el.dataset.dq, 10);
    var picked = parseInt(el.dataset.di, 10);
    var item = (window.SIP_QUIZ || [])[idx];
    if (!item) return;
    var ok = picked === item.answer;
    el.classList.add(ok ? "on" : "bad");
    toast((ok ? "✅ නිවැරදි! " : "❌ නිවැරදි පිළිතුර: " + item[3][item.answer] + " · ") + item[5], 4200);
    AI.Study.record(idx, ok, item[0]);
    render();
  }
  function tickPlan(key) {
    var done = loadObj(DKEY, {});
    if (done[key]) delete done[key]; else done[key] = 1;
    save(DKEY, done);
    render();
  }
  function makePlan() {
    var chips = $$("#subjChips .chip.on").map(function (c) { return c.dataset.planSubject; });
    var dateEl = $("#examDate"), mpdEl = $("#mpd");
    if (!dateEl || !dateEl.value) { toast("විභාගයේ දිනය තෝරන්න 📅"); return; }
    if (!chips.length) { toast("අඩුම තරමින් විෂයයක් තෝරන්න"); return; }
    S.plan = AI.Study.buildPlan({
      exam: S.profile.exam, examDate: dateEl.value,
      minutesPerDay: parseInt(mpdEl.value, 10), subjects: chips
    });
    toast("කාලසටහන සාදන ලදී ✅");
    render();
  }

  /* ------------------------------------------------------------- boot */
  function boot() {
    S.profile = loadObj(PKEY, S.profile);
    S.theme = lsGet("sipsaviya.theme") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    S.chat = loadObj(CKEY, []);
    S.plan = AI.Study.state().plan || null;
    S.books.grade = S.profile.grade;
    S.books.medium = S.profile.medium;

    bindAll();
    updateThemeUI();
    render();

    // Warm up the on-device AI model in the background so the first
    // question is answered instantly.
    setTimeout(function () {
      try {
        var t0 = Date.now();
        AI.Brain.init();
        console.log("[SipSaviya] AI ready in " + (Date.now() - t0) + " ms");
      } catch (e) {
        console.error("AI init failed", e);
      }
    }, 300);
  }

  /* Native back button support */
  window.SipApp = {
    nativeBack: function () {
      if (S.sheetOpen) { closeSheet(); return true; }
      if (S.view !== "home") { go("home"); return true; }
      return false;
    },
    go: go,
    ask: askTutor,
    version: "1.0.0"
  };

  function start() {
    try {
      boot();
    } catch (e) {
      // Never leave the student with a blank screen.
      var host = document.getElementById("main") || document.body;
      host.innerHTML = '<div class="view"><div class="card"><h2>⚠️ යෙදුම පූරණය නොවුණි</h2>' +
        '<p class="muted">යෙදුම නැවත විවෘත කරන්න. දිගටම මෙය පෙනුණොත් අලුත් APK එකක් බාගන්න.</p>' +
        '<p class="muted"><small>' + String(e && e.message || e) + '</small></p></div></div>';
      if (window.console && console.error) console.error("[SipSaviya] boot failed", e);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
