/* ============================================================================
 * SipSaviya AI · study.js
 * Adaptive practice: question selection, spaced-repetition flashcards,
 * progress analytics and automatic study-plan generation.
 * ==========================================================================*/
window.SipAI = window.SipAI || {};
(function (root) {
  "use strict";

  var KEY = "sipsaviya.progress.v1";
  var state = null;

  function load() {
    if (state) return state;
    try { state = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { state = null; }
    if (!state) state = { attempts: {}, cards: {}, days: {}, streak: 0, lastDay: null, plan: null };
    return state;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full — ignore */ }
  }

  /* ------------------------------------------------------------- questions */
  function gradeBand(exam) {
    if (exam === "al") return [12, 13];
    if (exam === "ol") return [10, 11];
    return [6, 7, 8, 9, 10, 11];
  }

  function pool(opts) {
    opts = opts || {};
    var band = opts.grades || gradeBand(opts.exam);
    var out = [];
    var quiz = window.SIP_QUIZ || [];
    for (var i = 0; i < quiz.length; i++) {
      var it = quiz[i];
      if (opts.subject && it[0] !== opts.subject) continue;
      if (it[1].some(function (g) { return band.indexOf(g) >= 0; })) out.push({ index: i, item: it });
    }
    return out;
  }

  /** Pick N questions, preferring subjects where the student is weakest. */
  function pick(opts) {
    opts = opts || {};
    var n = opts.count || 5;
    var list = pool(opts);
    if (!list.length) return [];
    var st = load();
    // weight: unseen questions and weak subjects first
    list.forEach(function (q) {
      var a = st.attempts["q" + q.index];
      var subj = stats(q.item[0]);
      var w = 1;
      if (!a) w += 0.6;                              // unseen
      else if (a.ok / a.n < 0.6) w += 0.9;           // getting it wrong
      if (subj.n > 2 && subj.ok / subj.n < 0.6) w += 0.5;
      q.weight = w * (0.7 + Math.random() * 0.6);
    });
    list.sort(function (a, b) { return b.weight - a.weight; });
    return list.slice(0, n).map(function (q) {
      return { index: q.index, subject: q.item[0], grades: q.item[1], question: q.item[2], options: q.item[3], answer: q.item[4], explain: q.item[5] };
    });
  }

  function record(index, correct, subject) {
    var st = load();
    var k = "q" + index;
    var a = st.attempts[k] || { n: 0, ok: 0 };
    a.n++; if (correct) a.ok++;
    a.subject = subject;
    a.last = Date.now();
    st.attempts[k] = a;
    touchDay();
    save();
  }

  function touchDay() {
    var st = load();
    var today = new Date().toISOString().slice(0, 10);
    if (st.lastDay !== today) {
      var y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      st.streak = st.lastDay === y ? (st.streak || 0) + 1 : 1;
      st.lastDay = today;
    }
    st.days[today] = (st.days[today] || 0) + 1;
    save();
  }

  function stats(subject) {
    var st = load();
    var n = 0, ok = 0;
    for (var k in st.attempts) {
      var a = st.attempts[k];
      if (subject && a.subject !== subject) continue;
      n += a.n; ok += a.ok;
    }
    return { n: n, ok: ok, accuracy: n ? Math.round(ok / n * 100) : 0, subjects: bySubject() };
  }

  function bySubject() {
    var st = load(), res = {};
    for (var k in st.attempts) {
      var a = st.attempts[k];
      if (!a.subject) continue;
      res[a.subject] = res[a.subject] || { n: 0, ok: 0 };
      res[a.subject].n += a.n; res[a.subject].ok += a.ok;
    }
    for (var s in res) res[s].accuracy = Math.round(res[s].ok / res[s].n * 100);
    return res;
  }

  function weakSubjects(limit) {
    var bs = bySubject(), list = [];
    for (var s in bs) if (bs[s].n >= 2) list.push({ subject: s, accuracy: bs[s].accuracy, n: bs[s].n });
    list.sort(function (a, b) { return a.accuracy - b.accuracy; });
    return list.slice(0, limit || 3);
  }

  function streak() { load(); return state.streak || 0; }

  /* ---------------------------------------------------- spaced repetition */
  /** Cards due today, using a light SM-2 style schedule. */
  function dueFlashcards(limit) {
    var st = load();
    var now = Date.now();
    var cards = [];
    var flash = window.SIP_FLASH || [];
    for (var i = 0; i < flash.length; i++) {
      var rec = st.cards["f" + i] || { box: 0, due: 0, seen: 0 };
      if (rec.due <= now) cards.push({ index: i, subject: flash[i][0], front: flash[i][1], back: flash[i][2], rec: rec });
    }
    cards.sort(function (a, b) { return a.rec.due - b.rec.due; });
    return cards.slice(0, limit || 10);
  }

  function reviewFlash(index, quality) {
    // quality: 0 = again, 1 = good, 2 = easy
    var st = load();
    var key = "f" + index;
    var rec = st.cards[key] || { box: 0, due: 0, seen: 0 };
    rec.seen++;
    if (quality === 0) rec.box = 0;
    else rec.box = Math.min(6, (rec.box || 0) + (quality === 2 ? 2 : 1));
    var days = [0, 1, 2, 4, 8, 16, 32, 60][rec.box] || 1;
    rec.due = Date.now() + days * 864e5;
    rec.lastQuality = quality;
    st.cards[key] = rec;
    touchDay();
    save();
    return { box: rec.box, nextInDays: days };
  }

  /* --------------------------------------------------------------- planner */
  var BANDS = { "1-5": [1, 2, 3, 4, 5], "6-9": [6, 7, 8, 9], "10-11": [10, 11], "12-13": [12, 13] };

  function unitsFor(subjectId, grades) {
    var subs = window.SIP_SUBJECTS || [];
    for (var i = 0; i < subs.length; i++) {
      var s = subs[i];
      if (s.id !== subjectId) continue;
      var picked = [];
      for (var band in s.units) {
        if (BANDS[band] && grades.some(function (g) { return BANDS[band].indexOf(g) >= 0; })) {
          picked = picked.concat(s.units[band]);
        }
      }
      return picked.length ? picked : (s.units["6-9"] || s.units["12-13"] || []);
    }
    return [];
  }

  /**
   * Build a day-by-day plan that fits the syllabus into the days left.
   * @param {{exam:string, subjects:string[], examDate:string, minutesPerDay:number, startDate?:string}} cfg
   */
  function buildPlan(cfg) {
    cfg = cfg || {};
    var grades = gradeBand(cfg.exam);
    var start = cfg.startDate ? new Date(cfg.startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    var exam = new Date(cfg.examDate || Date.now() + 60 * 864e5);
    exam.setHours(0, 0, 0, 0);
    var daysLeft = Math.max(1, Math.round((exam - start) / 864e5));
    var minutes = cfg.minutesPerDay || 120;
    var subjects = (cfg.subjects && cfg.subjects.length ? cfg.subjects : defaultSubjects(cfg.exam));

    // Build the queue of work items
    var queue = [];
    subjects.forEach(function (sid) {
      unitsFor(sid, grades).forEach(function (u) { queue.push({ subject: sid, topic: u, stage: "learn" }); });
      queue.push({ subject: sid, topic: "පසුගිය ප්‍රශ්න පත්‍රයක් කාලසීමාව තුළ කරන්න", stage: "paper" });
      queue.push({ subject: sid, topic: "සාරාංශ සටහන් + අමාරු කරුණු නැවත බැලීම", stage: "revise" });
    });
    if (!queue.length) return { days: [], summary: "විෂය තෝරන්න — මම කාලසටහන හදන්නම්." };

    // Interleave subjects so a day is never one single subject
    var bySubject = {};
    queue.forEach(function (q) { (bySubject[q.subject] = bySubject[q.subject] || []).push(q); });
    var interleaved = [], more = true, idx = 0;
    while (more) {
      more = false;
      subjects.forEach(function (sid) {
        var arr = bySubject[sid] || [];
        if (arr[idx]) { interleaved.push(arr[idx]); more = true; }
      });
      idx++;
      if (idx > 500) break;
    }

    var perDay = Math.max(1, Math.round(minutes / 40));   // 40-minute blocks
    var days = [], cursor = 0;
    var totalDays = daysLeft;
    for (var d = 0; d < totalDays; d++) {
      var date = new Date(start.getTime() + d * 864e5);
      var isSunday = date.getDay() === 0;
      var isLast = d >= totalDays - 5;
      var blocks = [];
      if (isLast) {
        blocks.push({ subject: "—", topic: "🎯 විභාගයට කලින්: මුළු නිබන්ධනයම ප්‍රශ්න පත්‍ර හා නැවත බැලීම", minutes: minutes, stage: "paper" });
      } else {
        var n = isSunday ? Math.max(1, perDay - 1) : perDay;
        for (var b = 0; b < n; b++) {
          var item = interleaved[cursor % interleaved.length];
          cursor++;
          if (item) blocks.push({ subject: item.subject, topic: item.topic, minutes: 40, stage: item.stage });
        }
        if (isSunday) blocks.push({ subject: "—", topic: "🗓️ කාලසීමාව තුළ මුළු විෂයයටම ප්‍රශ්න පත්‍රයක් කරන්න (පැය 1)", minutes: 60, stage: "paper" });
      }
      days.push({
        date: date.toISOString().slice(0, 10), day: date.getDay(), isSunday: isSunday,
        blocks: blocks, minutes: blocks.reduce(function (a, x) { return a + x.minutes; }, 0)
      });
    }

    var plan = {
      exam: cfg.exam || "ol", examDate: exam.toISOString().slice(0, 10), subjects: subjects,
      minutesPerDay: minutes, days: days, createdAt: Date.now(),
      summary: "දින " + totalDays + "ක් තිස්සේ දිනකට විනාඩි " + minutes + "ක් — මුළු පැය " +
        Math.round(totalDays * minutes / 60) + "ක්. විෂය " + subjects.length + "ක් ආවරණය වේ."
    };
    var st = load();
    st.plan = plan;
    save();
    return plan;
  }

  function defaultSubjects(exam) {
    if (exam === "al") return ["combmaths", "physics", "chemistry", "biology"];
    if (exam === "grade5") return ["maths", "sinhala", "english"];
    return ["maths", "science", "sinhala", "english", "history"];
  }

  root.Study = {
    pick: pick, record: record, stats: stats, bySubject: bySubject, weakSubjects: weakSubjects,
    streak: streak, dueFlashcards: dueFlashcards, reviewFlash: reviewFlash,
    buildPlan: buildPlan, unitsFor: unitsFor, gradeBand: gradeBand,
    state: load
  };
})(window.SipAI);
