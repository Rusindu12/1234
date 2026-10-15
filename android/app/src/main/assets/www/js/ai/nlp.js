/* ============================================================================
 * SipSaviya AI · nlp.js
 * Language layer: Sinhala / Tamil / English aware tokenisation, stemming,
 * number & intent extraction. Written for the Sinhala script, which behaves
 * very differently from Latin text, so no generic library is used.
 * ==========================================================================*/
(function (root) {
  "use strict";

  // Sinhala zero-width joiner / non-joiner: they change spelling but not
  // meaning, so every string is normalised without them before matching.
  var ZW = /[\u200B-\u200D\uFEFF]/g;

  var SINHALA = /[\u0D80-\u0DFF]/;
  var TAMIL = /[\u0B80-\u0BFF]/;

  /* Sinhala particles/suffixes that can be safely stripped when stemming. */
  var SI_SUFFIXES = [
    "වලින්", "යෙන්", "වලට", "යට", "වල", "ගේ", "ට", "ය", "ව", "ක්", "ක", "ත්", "ද", "ම", "නම්", "යි", "යින්"
  ];
  /* Sinhala question/stop words — used for intent detection, not for dropping. */
  var STOP = {
    si: ["මොකද", "මොනවද", "කුමක්ද", "කියන්නේ", "මම", "මට", "අපි", "ඔබ", "එය", "මේ", "ඒ", "සහ", "හා", "නම්", "කරන්නේ",
      "කරන්න", "කොහොමද", "කෙසේද", "පැහැදිලි", "කරන්නේ", "කීයද", "ගණනය", "අගය", "සොයන්න", "ගැන", "තියෙන", "ඇති",
      "එක", "එකක්", "වගේ", "නැද්ද", "දෙන්න", "පොඩ්ඩක්", "help", "please", "the", "a", "an", "of", "is", "are", "what",
      "how", "why", "explain", "tell", "me", "about", "and", "or", "in", "on", "to", "for", "with"],
    ta: ["என்ன", "எப்படி", "ஏன்", "என்றால்", "ஒரு", "அது", "இது", "மற்றும்", "சொல்லுங்கள்"]
  };

  var INTENTS = [
    { id: "solve", si: ["විසඳන්න", "විසඳ", "ගණනය", "සොයන්න", "ගණනය කරන්න", "පිළිතුර", "solve", "calculate", "compute", "find"],
      en: ["solve", "calculate", "compute", "what is the value", "evaluate"] },
    { id: "steps", si: ["පියවර", "පියවරෙන්", "ක්‍රමය", "කොහොමද", "කෙසේද", "ආකාරය", "step", "how"],
      en: ["steps", "how to", "in steps", "method", "procedure"] },
    { id: "define", si: ["යනු", "කියන්නේ", "අර්ථය", "නිර්වචනය", "හැඳින්වීම", "මොකද"],
      en: ["what is", "define", "definition", "meaning of", "explain"] },
    { id: "quiz", si: ["ප්‍රශ්න", "ප්‍රශ්නයක්", "පරීක්ෂා", "පුහුණු", "ක්විස්", "අභ්‍යාස", "ටෙස්ට්"],
      en: ["quiz", "question", "practice", "test me", "mcq", "exercise"] },
    { id: "plan", si: ["කාලසටහන", "සැලසුම", "පිළිවෙළ", "ටයිම්", "විභාගයට", "පාඩම් සැලසුම"],
      en: ["timetable", "plan", "schedule", "study plan", "revision"] },
    { id: "formula", si: ["සූත්‍රය", "සූත්‍ර", "සමීකරණය", "නියමය"], en: ["formula", "equation", "law"] },
    { id: "papers", si: ["පසුගිය", "ප්‍රශ්න පත්‍ර", "විභාග", "පේපර්"], en: ["past paper", "paper", "exam paper"] },
    { id: "books", si: ["පොත", "පෙළපොත", "පොත්", "බුක්"], en: ["book", "textbook"] },
    { id: "motivate", si: ["කම්මැලි", "බැරි", "අමාරු", "කරන්න බෑ", "හිතන්න", "බය"], en: ["hard", "difficult", "lazy", "can't", "afraid"] }
  ];

  var SUBJ_HINTS = [
    { id: "maths", w: ["ගණිත", "ගණිතය", "math", "maths", "mathematics", "වීජ", "ජ්‍යාමිති", "ත්‍රිකෝණමිති", "අවකලන", "අනුකලන", "භාග", "ප්‍රතිශත", "algebra", "geometry", "trigonometry", "calculus"] },
    { id: "science", w: ["විද්‍යාව", "science", "භෞතික", "රසායන", "ජීව", "physics", "chemistry", "biology", "සෛල", "පරමාණු", "ශ්වසන", "ප්‍රකාශ සංශ්ලේෂණ"] },
    { id: "english", w: ["ඉංග්‍රීසි", "english", "grammar", "tense", "essay", "vowel", "passive", "preposition"] },
    { id: "ict", w: ["ict", "පරිගණක", "computer", "programming", "python", "database", "sql", "ද්විමය", "binary", "network"] },
    { id: "bas", w: ["ගිණුම්", "accounting", "ව්‍යාපාර", "business", "debit", "credit", "ලාභ", "ශේෂ පත්‍ර"] },
    { id: "economics", w: ["ආර්ථික", "economics", "ඉල්ලුම", "සැපයුම", "gdp", "උද්ධමන"] },
    { id: "geography", w: ["භූගෝල", "geography", "දේශගුණ", "මෝසම්", "සිතියම"] },
    { id: "history", w: ["ඉතිහාස", "history", "රාජධානි", "අනුරාධපුර"] },
    { id: "sinhala", w: ["සිංහල", "sinhala", "ව්‍යාකරණ", "ව්‍යුත්පත්ති", "ඡන්දස්"] },
    { id: "buddhism", w: ["බුද්ධ", "buddhism", "අෂ්ටාංගික", "ධර්ම"] },
    { id: "health", w: ["සෞඛ්‍ය", "health", "පෝෂණ", "රෝග", "ආහාර"] },
    { id: "agriculture", w: ["කෘෂි", "agriculture", "පස", "පොහොර", "වගා"] },
    { id: "tamil", w: ["දෙමළ", "tamil"] }
  ];

  /** Detect the language a question is written in. */
  function detectLang(text) {
    var si = (text.match(/[\u0D80-\u0DFF]/g) || []).length;
    var ta = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
    var latin = (text.match(/[A-Za-z]/g) || []).length;
    if (ta > si && ta > 0) return "ta";
    if (si > 0 && si >= latin * 0.3) return "si";
    return latin > 0 ? "en" : "si";
  }

  /** Remove zero-width joiners and collapse whitespace. */
  function normalize(text) {
    return String(text == null ? "" : text)
      .replace(ZW, "")
      .replace(/[\u0D82\u0D83]/g, "")     // anusvara / visarga add noise when matching
      .replace(/[!?.,;:"'“”‘’()\[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Tokenise Sinhala/Tamil/Latin text.
   * Sinhala is agglutinative with heavy suffix use, so a light suffix-stripper
   * is applied in addition to keeping the raw token.
   */
  function tokenize(text) {
    var t = normalize(text).toLowerCase();
    var raw = t.split(/[\s/\-–—+*=<>|]+/).filter(Boolean);
    var out = [];
    var seen = Object.create(null);
    function add(tok) {
      if (!tok || tok.length < 2 || seen[tok]) return;
      seen[tok] = 1;
      out.push(tok);
    }
    for (var i = 0; i < raw.length; i++) {
      var w = raw[i];
      add(w);
      if (SINHALA.test(w)) {
        add(stemSi(w));
        // split long Sinhala compounds so "ගණිතයේ" also matches "ගණිත"
        var parts = w.split(/[^\u0D80-\u0DFFa-z0-9]+/);
        if (parts.length > 1) for (var j = 0; j < parts.length; j++) add(stemSi(parts[j]));
      } else if (TAMIL.test(w)) {
        add(w.replace(/(இல்|ஆல்|க்கு|ஐ|உடன்)$/u, ""));
      } else {
        add(w.replace(/(ing|ed|es|s)$/, ""));
      }
    }
    return out;
  }

  function stemSi(w) {
    for (var i = 0; i < SI_SUFFIXES.length; i++) {
      var s = SI_SUFFIXES[i];
      if (w.length > s.length + 2 && w.slice(-s.length) === s) return w.slice(0, -s.length);
    }
    return w;
  }

  /** Pull every number out of a question (handles Sinhala text between). */
  function numbers(text) {
    var cleaned = String(text).replace(/[,\u066B\u066C]/g, "").replace(/\u0DEF/g, ""); // Sinhala 'රු.' digit noise
    var m = cleaned.match(/-?\d+(\.\d+)?(\s*\/\s*-?\d+(\.\d+)?)?/g) || [];
    return m.map(function (s) {
      s = s.replace(/\s+/g, "");
      if (s.indexOf("/") > 0) {
        var p = s.split("/");
        var a = parseFloat(p[0]), b = parseFloat(p[1]);
        return b ? a / b : a;
      }
      return parseFloat(s);
    }).filter(function (n) { return !isNaN(n); });
  }

  /** Classify the intent of a question. */
  function intent(text) {
    var t = " " + normalize(text).toLowerCase() + " ";
    var hasMath = /[0-9]/.test(text) && /[+\-*/^=×÷√]/.test(text);
    var best = null, bestScore = 0;
    INTENTS.forEach(function (it) {
      var score = 0;
      it.si.concat(it.en).forEach(function (w) {
        if (t.indexOf(normalize(w).toLowerCase()) >= 0) score += w.length > 4 ? 2 : 1;
      });
      if (it.id === "solve" && hasMath) score += 3;
      if (score > bestScore) { bestScore = score; best = it.id; }
    });
    if (!best && hasMath) best = "solve";
    return { id: best || "chat", score: bestScore };
  }

  /** Guess the subject of a question (used to bias retrieval). */
  function subjectOf(text) {
    var t = normalize(text).toLowerCase();
    var scores = {};
    SUBJ_HINTS.forEach(function (s) {
      var sc = 0;
      s.w.forEach(function (w) { if (t.indexOf(normalize(w).toLowerCase()) >= 0) sc += w.length; });
      if (sc) scores[s.id] = sc;
    });
    var best = null, bv = 0;
    for (var k in scores) if (scores[k] > bv) { bv = scores[k]; best = k; }
    return best;
  }

  /** Should the reply be written in Sinhala? */
  function replyLang(text) {
    var l = detectLang(text);
    if (l === "si" || l === "ta") return "si";
    return "en";
  }

  root.SipNLP = {
    normalize: normalize, tokenize: tokenize, stem: stemSi, numbers: numbers,
    intent: intent, subjectOf: subjectOf, detectLang: detectLang, replyLang: replyLang,
    isSinhala: function (s) { return SINHALA.test(s); },
    STOP: STOP
  };
})(window);
