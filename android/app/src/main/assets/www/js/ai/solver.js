/* ============================================================================
 * SipSaviya AI · solver.js
 * A step-by-step computation engine: exact fraction arithmetic, equations,
 * geometry, statistics, unit conversion and physics/chemistry formulas.
 * Everything runs on the phone, offline.
 * ==========================================================================*/
window.SipAI = window.SipAI || {};
(function (root) {
  "use strict";

  /* ------------------------------------------------------------ rationals */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function R(n, d) { d = d === undefined ? 1 : d; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return { n: n / g, d: d / g, f: false }; }
  function toFloat(x) { return x.f ? x.n : x.n / x.d; }
  function fromFloat(v) { return { n: v, d: 1, f: true }; }
  function add(a, b) { return a.f || b.f ? fromFloat(toFloat(a) + toFloat(b)) : R(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return a.f || b.f ? fromFloat(toFloat(a) - toFloat(b)) : R(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return a.f || b.f ? fromFloat(toFloat(a) * toFloat(b)) : R(a.n * b.n, a.d * b.d); }
  function div(a, b) {
    if (toFloat(b) === 0) throw new Error("බිංදුවෙන් බෙදිය නොහැක (division by zero)");
    return a.f || b.f ? fromFloat(toFloat(a) / toFloat(b)) : R(a.n * b.d, a.d * b.n);
  }
  function dec(v) {
    var f = toFloat(v);
    if (Math.abs(f - Math.round(f)) < 1e-10) return String(Math.round(f));
    return String(Math.round(f * 1e6) / 1e6);
  }
  function frac(v) {
    if (v.f) return dec(v);
    return v.d === 1 ? String(v.n) : v.n + "/" + v.d;
  }
  /** Exact rational from a decimal literal, so 1/2 + 1/3 stays 5/6. */
  function numFrom(raw) {
    var t = String(raw);
    if (/^-?\d+$/.test(t)) return R(parseInt(t, 10));
    var m = t.match(/^(-?)(\d*)\.(\d+)$/);
    if (m) {
      var sign = m[1] === "-" ? -1 : 1;
      var whole = parseInt(m[2] || "0", 10);
      var fracPart = m[3];
      var den = Math.pow(10, fracPart.length);
      return R(sign * (whole * den + parseInt(fracPart, 10)), den);
    }
    return fromFloat(parseFloat(t));
  }

  function nice(v) {
    var f = frac(v);
    if (v.f || v.d === 1) return f;
    return f + "  (= " + dec(v) + ")";
  }

  /* ------------------------------------------------------- expression parser */
  function lex(src) {
    var s = String(src)
      .replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/[−–—‒－]/g, "-")
      .replace(/√/g, "sqrt").replace(/π/g, "pi")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4");
    var i = 0, out = [];
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        var j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        var raw = s.slice(i, j);
        out.push({ t: "num", v: parseFloat(raw), raw: raw });
        i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        var k = i;
        while (k < s.length && /[a-zA-Z]/.test(s[k])) k++;
        out.push({ t: "id", v: s.slice(i, k).toLowerCase() });
        i = k; continue;
      }
      if ("+-*/^%()!,".indexOf(c) >= 0) { out.push({ t: c }); i++; continue; }
      if (c === "=") { out.push({ t: "=" }); i++; continue; }
      i++; // ignore unknown glyphs (Sinhala words around the expression)
    }
    return out;
  }

  var FUNCS = {
    sqrt: function (x) {
      var f = toFloat(x);
      if (f < 0) throw new Error("සෘණ සංඛ්‍යාවක වර්ගමූලය සැබෑ සංඛ්‍යාවක් නොවේ");
      var r = Math.sqrt(f), ri = Math.round(r);
      return Math.abs(r - ri) < 1e-10 ? R(ri) : fromFloat(r);
    },
    abs: function (x) { return fromFloat(Math.abs(toFloat(x))); },
    round: function (x) { return R(Math.round(toFloat(x))); },
    floor: function (x) { return R(Math.floor(toFloat(x))); },
    sin: function (x) { return fromFloat(Math.sin(toFloat(x) * Math.PI / 180)); },
    cos: function (x) { return fromFloat(Math.cos(toFloat(x) * Math.PI / 180)); },
    tan: function (x) { return fromFloat(Math.tan(toFloat(x) * Math.PI / 180)); },
    asin: function (x) { return fromFloat(Math.asin(toFloat(x)) * 180 / Math.PI); },
    acos: function (x) { return fromFloat(Math.acos(toFloat(x)) * 180 / Math.PI); },
    atan: function (x) { return fromFloat(Math.atan(toFloat(x)) * 180 / Math.PI); },
    log: function (x) { return fromFloat(Math.log10(toFloat(x))); },
    ln: function (x) { return fromFloat(Math.log(toFloat(x))); },
    exp: function (x) { return fromFloat(Math.exp(toFloat(x))); },
    pow: function (x, y) { return fromFloat(Math.pow(toFloat(x), toFloat(y))); },
    fact: function (x) { var n = Math.round(toFloat(x)), r = 1; for (var i = 2; i <= n; i++) r *= i; return R(r); }
  };

  /**
   * Evaluate an arithmetic expression exactly (fractions stay fractions).
   * @returns {{value:Object, display:string, fraction:string, steps:string[]}}
   */
  function evaluate(src) {
    var toks = lex(src), pos = 0, steps = [];
    function peek() { return toks[pos]; }
    function next() { return toks[pos++]; }
    function expect(t) { if (!peek() || peek().t !== t) return null; return next(); }

    function primary() {
      var tk = peek();
      if (!tk) throw new Error("ප්‍රකාශනය අසම්පූර්ණයි");
      if (tk.t === "num") { next(); return numFrom(tk.raw != null ? tk.raw : tk.v); }
      if (tk.t === "(") { next(); var e = expr(); expect(")"); return e; }
      if (tk.t === "id") {
        next();
        if (tk.v === "pi") return fromFloat(Math.PI);
        if (tk.v === "e" && (!peek() || peek().t !== "(")) return fromFloat(Math.E);
        var args = [];
        if (peek() && peek().t === "(") {
          next();
          if (peek() && peek().t !== ")") {
            args.push(expr());
            while (peek() && peek().t === ",") { next(); args.push(expr()); }
          }
          expect(")");
        }
        var fn = FUNCS[tk.v];
        if (!fn) throw new Error("නොදන්නා ශ්‍රිතය: " + tk.v);
        return fn.apply(null, args.length ? args : [R(0)]);
      }
      if (tk.t === "-") { next(); return mul(R(-1), primary()); }
      throw new Error("විග්‍රහ කළ නොහැකි ප්‍රකාශනයක්");
    }
    function power() {
      var base = primary();
      if (peek() && peek().t === "^") { next(); var ex = power(); return fromFloat(Math.pow(toFloat(base), toFloat(ex))); }
      return base;
    }
    function unary() {
      if (peek() && peek().t === "-") { next(); return mul(R(-1), unary()); }
      return power();
    }
    function postfix() {
      var v = unary();
      while (peek() && peek().t === "!") { next(); v = FUNCS.fact(v); }
      if (peek() && peek().t === "%" ) { next(); v = div(v, R(100)); }
      return v;
    }
    function term() {
      var v = postfix();
      while (peek() && (peek().t === "*" || peek().t === "/")) {
        var op = next().t;
        // support implicit parenthesis continuation: 2(3+4)
        var r = postfix();
        v = op === "*" ? mul(v, r) : div(v, r);
      }
      // implicit multiplication: 2(3+4), 3pi, 2sqrt(9)
      while (peek() && (peek().t === "(" || peek().t === "id")) {
        var r2 = postfix();
        v = mul(v, r2);
      }
      return v;
    }
    function expr() {
      var v = term();
      while (peek() && (peek().t === "+" || peek().t === "-")) {
        var op = next().t;
        var r = term();
        v = op === "+" ? add(v, r) : sub(v, r);
      }
      return v;
    }

    var val = expr();
    if (peek()) {
      if (peek().t === "=") throw new Error("__EQUATION__");
      // leftover tokens: the text contained an equation or junk
    }
    return { value: val, display: dec(val), fraction: frac(val), steps: steps };
  }

  /** Pretty, school-style display that keeps exact fractions. */
  function evalAnswer(src) {
    var r = evaluate(src);
    return { value: r.value, text: nice(r.value), exact: r.fraction, decimal: dec(r.value) };
  }

  /* ------------------------------------------------------------- equations */
  /** Move everything to one side and read off the coefficients (linear/quadratic). */
  function parsePolynomial(lhs, rhs) {
    // returns {a2, a1, a0} for  a2·x² + a1·x + a0 = 0
    var a2 = 0, a1 = 0, a0 = 0;
    var s = (lhs + " - (" + rhs + ")").replace(/\s+/g, "");
    s = s.replace(/[×·]/g, "*").replace(/[−–—‒－]/g, "-")
      .replace(/²/g, "^2").replace(/³/g, "^3");
    // ( 15 ) → 15 , ( -3 ) → -3  (keeps the sign logic below simple)
    s = s.replace(/\((-?[\d.]+)\)/g, "$1").replace(/\(\((-?[\d.]+)\)\)/g, "$1");
    if (/[a-wyzA-WYZ]/.test(s.replace(/(sqrt|pi|sin|cos|tan|log|ln|exp|pow|abs|round|floor|fact)/g, ""))) return null;
    // insert '*' before x tokens: 2x → 2*x ; x2 → x^2
    s = s.replace(/(\d)x/g, "$1*x").replace(/x(\d)/g, "x^$1");
    var terms = splitTerms(s);
    if (!terms) return null;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i].str, sign = terms[i].sign;
      if (t === "") continue;
      var m;
      if ((m = t.match(/^(-?[\d.]*)\*?x\^2$/))) a2 += sign * (m[1] === "" || m[1] === "-" ? (m[1] === "-" ? -1 : 1) : parseFloat(m[1]));
      else if ((m = t.match(/^(-?[\d.]*)\*?x$/))) a1 += sign * (m[1] === "" || m[1] === "-" ? (m[1] === "-" ? -1 : 1) : parseFloat(m[1]));
      else if ((m = t.match(/^-?[\d.]+$/))) a0 += sign * parseFloat(t);
      else return null;
    }
    return { a2: a2, a1: a1, a0: a0 };
  }

  function splitTerms(s) {
    var out = [], sign = 1, buf = "";
    var depth = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "(") depth++;
      if (c === ")") depth--;
      if (depth === 0 && (c === "+" || c === "-") && buf !== "" && !/[*/^(]$/.test(buf.slice(-1))) {
        out.push({ sign: sign, str: buf });
        sign = c === "-" ? -1 : 1;
        buf = "";
        continue;
      }
      if (depth === 0 && (c === "+" || c === "-") && buf === "") {
        if (c === "-") { sign = -sign; }
        continue;
      }
      buf += c;
    }
    if (buf !== "") out.push({ sign: sign, str: buf });
    return out.length ? out : null;
  }

  function solveLinear(a1, a0, varName) {
    var v = varName || "x";
    var steps = ["සමීකරණය සම්මත ආකාරයට ගන්න: " + fmtCoef(a1, v) + " = " + fmt(-a0),
      "දෙපැත්තම " + fmt(a1) + " න් බෙදන්න",
      v + " = " + fmt(-a0) + " ÷ " + fmt(a1)];
    var ans = -a0 / a1;
    steps.push(v + " = " + round(ans));
    return { title: "රේඛීය සමීකරණය විසඳීම", formula: v + " = " + fmt(-a0) + " ÷ " + fmt(a1), steps: steps, answer: round(ans), varName: v };
  }

  function solveQuadratic(a, b, c) {
    var steps = [], disc = b * b - 4 * a * c;
    steps.push("a = " + fmt(a) + ", b = " + fmt(b) + ", c = " + fmt(c));
    steps.push("විචාරකය Δ = b² − 4ac = " + fmt(b) + "² − 4×" + fmt(a) + "×" + fmt(c) + " = " + round(disc));
    var answer, kind;
    if (disc > 0) {
      var r = Math.sqrt(disc);
      var x1 = (-b + r) / (2 * a), x2 = (-b - r) / (2 * a);
      kind = "සැබෑ හා වෙනස් මූල දෙකක් ඇත (Δ > 0)";
      steps.push(kind);
      steps.push("x = [−b ± √Δ] / 2a = [" + fmt(-b) + " ± " + round(r) + "] / " + fmt(2 * a));
      answer = "x₁ = " + round(x1) + " ,  x₂ = " + round(x2);
    } else if (Math.abs(disc) < 1e-12) {
      kind = "සමාන මූල දෙකක් ඇත (Δ = 0)";
      steps.push(kind);
      answer = "x = " + round(-b / (2 * a));
    } else {
      var re = -b / (2 * a), im = Math.sqrt(-disc) / (2 * a);
      kind = "සැබෑ මූල නොමැත; සංකීර්ණ මූල (Δ < 0)";
      steps.push(kind);
      answer = "x = " + round(re) + " ± " + round(Math.abs(im)) + "i";
    }
    var sum = -b / a, prod = c / a;
    steps.push("මූල එකතුව = −b/a = " + round(sum) + " , මූල ගුණිතය = c/a = " + round(prod));
    return { title: "ද්විතීයික සමීකරණය විසඳීම", formula: "x = [−b ± √(b²−4ac)] / 2a", steps: steps, answer: answer, note: kind };
  }

  function solveSimultaneous(eq1, eq2) {
    var p1 = parsePolynomial2(eq1), p2 = parsePolynomial2(eq2);
    if (!p1 || !p2) return null;
    // a1x + b1y = c1 ; a2x + b2y = c2
    var D = p1.a * p2.b - p2.a * p1.b;
    if (Math.abs(D) < 1e-12) return { title: "සමගාමී සමීකරණ", steps: ["නිර්ණායකය 0 නිසා අනන්‍ය විසඳුමක් නොමැත"], answer: "විසඳුමක් නොමැත / අනන්ත විසඳුම්" };
    var Dx = p1.c * p2.b - p2.c * p1.b, Dy = p1.a * p2.c - p2.a * p1.c;
    var x = Dx / D, y = Dy / D;
    return {
      title: "සමගාමී සමීකරණ විසඳීම (ක්‍රේමර් නියමය)",
      formula: "D = a₁b₂ − a₂b₁ , x = Dx/D , y = Dy/D",
      steps: ["D = (" + fmt(p1.a) + ")(" + fmt(p2.b) + ") − (" + fmt(p2.a) + ")(" + fmt(p1.b) + ") = " + round(D),
        "Dx = (" + fmt(p1.c) + ")(" + fmt(p2.b) + ") − (" + fmt(p2.c) + ")(" + fmt(p1.b) + ") = " + round(Dx),
        "Dy = (" + fmt(p1.a) + ")(" + fmt(p2.c) + ") − (" + fmt(p2.a) + ")(" + fmt(p1.c) + ") = " + round(Dy),
        "x = " + round(Dx) + " ÷ " + round(D) + " = " + round(x),
        "y = " + round(Dy) + " ÷ " + round(D) + " = " + round(y)],
      answer: "x = " + round(x) + " , y = " + round(y)
    };
  }

  function parsePolynomial2(eq) {
    // supports x + y = c style with coefficients
    var parts = String(eq).split("=");
    if (parts.length !== 2) return null;
    var s = parts[0].replace(/\s+/g, "");
    var c = parseFloat(parts[1]);
    if (isNaN(c)) return null;
    var a = 0, b = 0, terms = splitTerms(s.replace(/-/g, "+-"));
    if (!terms) return null;
    var sign = 1, ok = true;
    // simpler: tokenise manually
    var str = s.replace(/-/g, "+-");
    var arr = str.split("+").filter(Boolean);
    for (var i = 0; i < arr.length; i++) {
      var t = arr[i];
      if (t.indexOf("x") >= 0 && t.indexOf("y") < 0) {
        var vx = t.replace("x", "");
        a += vx === "" ? 1 : vx === "-" ? -1 : parseFloat(vx);
      } else if (t.indexOf("y") >= 0 && t.indexOf("x") < 0) {
        var vy = t.replace("y", "");
        b += vy === "" ? 1 : vy === "-" ? -1 : parseFloat(vy);
      } else ok = false;
    }
    void sign;
    if (!ok || (!a && !b)) return null;
    return { a: a, b: b, c: c };
  }

  function fmt(n) { return String(Math.round(n * 1e6) / 1e6); }
  function round(n) { return Math.round(n * 1e4) / 1e4; }
  function fmtCoef(n, v) { return (n === 1 ? "" : n === -1 ? "−" : fmt(n)) + v; }

  /* ------------------------------------------------- labelled numbers (physics) */
  var LABELS = [
    { key: "M", words: ["මවුලික ස්කන්ධය", "මවුලික ස්කන්ධ", "molar mass"], units: [/g\/mol/] },
    { key: "rho", words: ["ඝනත්වය", "density"], units: [/kg\/m3/, /kg\/m³/, /g\/cm3/] },
    { key: "c", words: ["විශිෂ්ට තාප ධාරිතාව", "විශිෂ්ට තාපය", "specific heat"], units: [/j\/kg/] },
    { key: "dtheta", words: ["උෂ්ණත්ව වෙනස", "උෂ්ණත්වය", "temperature"], units: [/°c/, /℃/, /\bk\b/] },
    { key: "lam", words: ["තරංග ආයාමය", "wavelength"], units: [/λ/] },
    { key: "n", words: ["මවුල ගණන", "මවුල", "mole"], units: [/\bmol\b/] },
    { key: "f", words: ["සංඛ්‍යාතය", "frequency"], units: [/hz/, /හර්ට්ස්/] },
    { key: "a", words: ["ත්වරණය", "ත්වරණ", "acceleration"], units: [/m\/s2?/, /m s-2/, /m\/s²/] },
    { key: "F", words: ["බලය", "force"], units: [/\bn\b/, /නිව්ටන්/] },
    { key: "v", words: ["ප්‍රවේගය", "වේගය", "velocity", "speed"], units: [/m\/s/, /km\/h/] },
    { key: "u", words: ["ආරම්භක", "ප්‍රාථමික", "initial"], units: [] },
    { key: "h", words: ["උස", "height"], units: [] },
    { key: "s", words: ["දුර", "විස්ථාපනය", "distance", "displacement"], units: [/\bm\b/, /\bkm\b/, /මීටර/] },
    { key: "t", words: ["කාලය", "කාල", "time"], units: [/\bs\b/, /තත්පර/, /මිනිත්තු/, /විනාඩි/] },
    { key: "V", words: ["වෝල්ටීයතාව", "වෝල්ට", "voltage", "potential difference"], units: [/\bv\b/] },
    { key: "I", words: ["ධාරාව", "current"], units: [/\ba\b/, /ඇම්පියර්/] },
    { key: "R", words: ["ප්‍රතිරෝධය", "ප්‍රතිරෝධ", "resistance"], units: [/Ω/, /ohm/] },
    { key: "P", words: ["වොට්", "බල ප්‍රමාණය", "power"], units: [/\bw\b/, /වොට්/] },
    { key: "W", words: ["කාර්යය", "work"], units: [/\bj\b/, /ජූල්/] },
    { key: "Q", words: ["තාපය", "heat"], units: [/\bj\b/, /ජූල්/, /kj/] },
    { key: "A", words: ["වර්ගඵලය", "ක්ෂේත්‍රඵලය", "area"], units: [/cm2/, /cm²/, /m2/, /m²/] },
    { key: "r", words: ["අරය", "radius"], units: [] },
    { key: "m", words: ["ස්කන්ධය", "ස්කන්ධ", "mass"], units: [/kg/, /\bg\b/] }
  ];

  /** Find numbers together with the quantity they most likely belong to. */
  function labelledNumbers(text) {
    var t = String(text);
    var res = [];
    var re = /(-?\d+(?:[.,]\d+)?)\s*([^\s,;]*)/g, m;
    var prevEnd = 0;
    while ((m = re.exec(t))) {
      var value = parseFloat(m[1].replace(",", "."));
      if (isNaN(value)) continue;
      var tail = m[2] || "";
      // only the words between the previous number and this one can label it
      var head = t.slice(prevEnd, m.index).slice(-20);
      prevEnd = m.index + m[0].length;
      var label = null, unit = null;
      for (var i = 0; i < LABELS.length; i++) {
        var L = LABELS[i];
        for (var j = 0; j < L.units.length; j++) if (L.units[j].test(tail)) { label = L.key; unit = tail; }
        if (!label) for (var k = 0; k < L.words.length; k++) {
          if (head.toLowerCase().indexOf(L.words[k].toLowerCase()) >= 0) { label = L.key; break; }
        }
        if (label) break;
      }
      res.push({ value: value, label: label, unit: unit, raw: m[0] });
    }
    return res;
  }

  function pick(nums, key) {
    for (var i = 0; i < nums.length; i++) if (nums[i].label === key) return nums[i];
    return null;
  }
  function pickAny(nums, keys) {
    for (var i = 0; i < nums.length; i++) if (keys.indexOf(nums[i].label) >= 0) return nums[i];
    return null;
  }

  /* --------------------------------------------------------------- formulas */
  function physics(text) {
    var low = text.toLowerCase();
    var nums = labelledNumbers(text);
    if (!nums.length) return null;
    var has = function (arr) { return arr.some(function (w) { return low.indexOf(w) >= 0; }); };

    var m, a, F, v, u, s, t, V, I, R, P, W, rho, Q, c, dt, n, M, f, lam, A, r, h;

    /* F = ma */
    if (has(["බලය", "force", "නිව්ටන්", "ත්වරණ"])) {
      m = pick(nums, "m"); a = pick(nums, "a"); F = pick(nums, "F");
      if (m && a && !F) return phys("F = m × a", "F", m.value * a.value, "N",
        ["m = " + m.value + " kg , a = " + a.value + " m/s²", "F = " + m.value + " × " + a.value, "F = " + round(m.value * a.value) + " N"]);
      if (F && a && !m) return phys("m = F ÷ a", "m", F.value / a.value, "kg",
        ["F = " + F.value + " N , a = " + a.value + " m/s²", "m = " + F.value + " ÷ " + a.value, "m = " + round(F.value / a.value) + " kg"]);
      if (F && m && !a) return phys("a = F ÷ m", "a", F.value / m.value, "m/s²",
        ["F = " + F.value + " N , m = " + m.value + " kg", "a = " + F.value + " ÷ " + m.value, "a = " + round(F.value / m.value) + " m/s²"]);
    }
    /* v = u + at */
    if (has(["චලිත", "motion", "ප්‍රවේග", "ත්වරණ", "වේග"])) {
      u = pick(nums, "u"); a = pick(nums, "a"); t = pick(nums, "t"); v = pick(nums, "v"); s = pick(nums, "s");
      if (u && a && t && !v) return phys("v = u + at", "v", u.value + a.value * t.value, "m/s",
        ["u = " + u.value + " m/s , a = " + a.value + " m/s² , t = " + t.value + " s",
          "v = " + u.value + " + (" + a.value + " × " + t.value + ")", "v = " + round(u.value + a.value * t.value) + " m/s"]);
      if (v && u && t && !a) return phys("a = (v − u) / t", "a", (v.value - u.value) / t.value, "m/s²",
        ["v = " + v.value + " , u = " + u.value + " , t = " + t.value,
          "a = (" + v.value + " − " + u.value + ") ÷ " + t.value, "a = " + round((v.value - u.value) / t.value) + " m/s²"]);
      if (v && a && t && !s && u === null) {
        // assume starts from rest when not given
        s = v.value * t.value - 0.5 * a.value * t.value * t.value;
        return phys("s = vt − ½at²", "s", s, "m",
          ["v = " + v.value + " m/s , a = " + a.value + " m/s² , t = " + t.value + " s (u = 0 ලෙස උපකල්පනය)",
            "s = " + v.value + "×" + t.value + " − ½×" + a.value + "×" + t.value + "²", "s = " + round(s) + " m"]);
      }
    }
    /* V = IR */
    if (has(["ඕම්", "ohm", "වෝල්ට", "ප්‍රතිරෝධ", "ධාරාව"])) {
      V = pick(nums, "V"); I = pick(nums, "I"); R = pick(nums, "R");
      if (I && R && !V) return phys("V = I × R", "V", I.value * R.value, "V",
        ["I = " + I.value + " A , R = " + R.value + " Ω", "V = " + I.value + " × " + R.value, "V = " + round(I.value * R.value) + " V"]);
      if (V && R && !I) return phys("I = V ÷ R", "I", V.value / R.value, "A",
        ["V = " + V.value + " V , R = " + R.value + " Ω", "I = " + V.value + " ÷ " + R.value, "I = " + round(V.value / R.value) + " A"]);
      if (V && I && !R) return phys("R = V ÷ I", "R", V.value / I.value, "Ω",
        ["V = " + V.value + " V , I = " + I.value + " A", "R = " + V.value + " ÷ " + I.value, "R = " + round(V.value / I.value) + " Ω"]);
      if (V && I && !has(["ප්‍රතිරෝධ"])) return phys("P = V × I", "P", V.value * I.value, "W",
        ["V = " + V.value + " V , I = " + I.value + " A", "P = " + V.value + " × " + I.value, "P = " + round(V.value * I.value) + " W"]);
    }
    /* density */
    if (has(["ඝනත්ව", "density"])) {
      m = pick(nums, "m"); rho = pick(nums, "rho");
      var vol = nums.filter(function (x) { return /cm3|cm³|m3|m³|පරිමාව/.test(x.unit || "") || /පරිමාව/.test(text); })[0] || pick(nums, "s");
      if (m && vol && !rho) return phys("ρ = m ÷ V", "ρ", m.value / vol.value, "kg/m³",
        ["m = " + m.value + " , V = " + vol.value, "ρ = " + m.value + " ÷ " + vol.value, "ρ = " + round(m.value / vol.value)]);
    }
    /* work & energy */
    if (has(["කාර්යය", "work", "ශක්තිය", "energy", "ජූල්", "විභව", "චාලක", "උසට"])) {
      F = pick(nums, "F"); s = pick(nums, "s"); m = pick(nums, "m"); v = pick(nums, "v");
      h = pick(nums, "h") || (has(["උස", "height", "නගින", "නැගී", "උසට"]) ? s : null);
      if (m && h && has(["විභව", "උස", "height", "නගින", "නැගී", "උසට", "potential"])) {
        var g0 = 9.8, ep = m.value * g0 * h.value;
        return phys("Ep = mgh (g = 9.8 m/s²)", "Ep", ep, "J",
          ["m = " + m.value + " kg , h = " + h.value + " m", "Ep = " + m.value + " × 9.8 × " + h.value, "Ep = " + round(ep) + " J"]);
      }
      if (F && s) return phys("W = F × d", "W", F.value * s.value, "J",
        ["F = " + F.value + " N , d = " + s.value + " m", "W = " + F.value + " × " + s.value, "W = " + round(F.value * s.value) + " J"]);
      if (m && v) return phys("Ek = ½mv²", "Ek", 0.5 * m.value * v.value * v.value, "J",
        ["m = " + m.value + " kg , v = " + v.value + " m/s", "Ek = ½ × " + m.value + " × " + v.value + "²", "Ek = " + round(0.5 * m.value * v.value * v.value) + " J"]);
    }
    /* heat */
    if (has(["තාපය", "heat", "රත්", "උෂ්ණ"])) {
      m = pick(nums, "m"); c = pick(nums, "c"); dt = pick(nums, "dtheta"); Q = pick(nums, "Q");
      if (m && dt) {
        var cc = c ? c.value : 4200;
        return phys("Q = mcΔθ", "Q", m.value * cc * dt.value, "J",
          ["m = " + m.value + " kg , c = " + cc + " J/kg·K , Δθ = " + dt.value + " °C",
            "Q = " + m.value + " × " + cc + " × " + dt.value, "Q = " + round(m.value * cc * dt.value) + " J"]);
      }
    }
    /* mole */
    if (has(["මවුල", "mole", "mol"])) {
      m = pick(nums, "m"); M = pick(nums, "M");
      var rest = nums.filter(function (x) { return x !== m && x !== M && !x.label; });
      var mass = m || rest[0] || nums[0];
      var mm = M || rest.filter(function (x) { return x !== mass; })[0] || nums[1];
      if (mass && mm) return phys("n = m ÷ M", "n", mass.value / mm.value, "mol",
        ["m = " + mass.value + " g , M = " + mm.value + " g/mol", "n = " + mass.value + " ÷ " + mm.value, "n = " + round(mass.value / mm.value) + " mol"]);
    }
    /* wave */
    if (has(["තරංග", "wave", "සංඛ්‍යාත"])) {
      f = pick(nums, "f") || nums[0]; lam = pick(nums, "lam") || nums[1];
      if (f && lam) return phys("v = f × λ", "v", f.value * lam.value, "m/s",
        ["f = " + f.value + " Hz , λ = " + lam.value + " m", "v = " + f.value + " × " + lam.value, "v = " + round(f.value * lam.value) + " m/s"]);
    }
    /* speed / pressure */
    if (has(["වේගය", "speed"]) && !has(["ත්වරණ"])) {
      s = pick(nums, "s") || nums[0]; t = pick(nums, "t") || nums[1];
      if (s && t) return phys("v = d ÷ t", "v", s.value / t.value, "m/s",
        ["d = " + s.value + " m , t = " + t.value + " s", "v = " + s.value + " ÷ " + t.value, "v = " + round(s.value / t.value) + " m/s"]);
    }
    if (has(["පීඩනය", "pressure"])) {
      F = pick(nums, "F") || nums[0]; A = pick(nums, "A") || nums[1];
      if (F && A) return phys("P = F ÷ A", "P", F.value / A.value, "Pa",
        ["F = " + F.value + " N , A = " + A.value + " m²", "P = " + F.value + " ÷ " + A.value, "P = " + round(F.value / A.value) + " Pa"]);
    }
    void r; void P;
    return null;
  }

  function phys(formula, subject, value, unit, steps) {
    return {
      kind: "physics", title: "භෞතික විද්‍යා ගණනය", formula: formula,
      steps: steps, answer: round(value) + " " + unit, note: subject + " සොයා ගැනීම"
    };
  }

  /* --------------------------------------------------------------- geometry */
  function geometry(text) {
    var low = text.toLowerCase();
    var nums = labelledNumbers(text).map(function (x) { return x.value; });
    if (!nums.length) return null;
    var PI = Math.PI;
    function g(title, formula, steps, answer) { return { kind: "geometry", title: title, formula: formula, steps: steps, answer: answer }; }

    if (/වෘත්ත|circle|ගෝල|sphere|සිලින්ඩර|cylinder|කේතු|cone/.test(low)) {
      var r = pickNum(text, ["අරය", "විෂ්කම්භය", "radius", "diameter"]) || nums[0];
      var isDiameter = /විෂ්කම්භය|diameter/.test(low);
      if (isDiameter) { nums[0] = nums[0] / 2; r = r / 2; }
      var rr = r;
      if (/ක්ෂේත්‍රඵල|වර්ගඵල|area|වර්ගඵලය/.test(low)) {
        return g("වෘත්තයක ක්ෂේත්‍රඵලය", "A = πr²",
          ["අරය r = " + rr, "A = π × " + rr + "² = " + round(PI) + " × " + round(rr * rr), "A = " + round(PI * rr * rr) + " (ඒකක²)"],
          round(PI * rr * rr) + " වර්ග ඒකක");
      }
      if (/පරිධිය|පරිමිති|වට ප්‍රමාණය|circumference|perimeter/.test(low)) {
        return g("වෘත්තයක පරිධිය", "C = 2πr",
          ["r = " + rr, "C = 2 × " + round(PI) + " × " + rr, "C = " + round(2 * PI * rr) + " (ඒකක)"],
          round(2 * PI * rr) + " ඒකක");
      }
      if (/පරිමාව|volume/.test(low)) {
        if (/ගෝල|sphere/.test(low)) return g("ගෝලයක පරිමාව", "V = (4/3)πr³",
          ["r = " + rr, "V = (4/3) × " + round(PI) + " × " + round(rr ** 3), "V = " + round(4 / 3 * PI * rr ** 3)],
          round(4 / 3 * PI * rr ** 3) + " ඝන ඒකක");
        var h = pickNum(text, ["උස", "height"]) || nums[1] || rr;
        if (/කේතු|cone/.test(low)) return g("කේතුවක පරිමාව", "V = (1/3)πr²h",
          ["r = " + rr + " , h = " + h, "V = (1/3) × " + round(PI) + " × " + round(rr * rr) + " × " + h, "V = " + round(PI * rr * rr * h / 3)],
          round(PI * rr * rr * h / 3) + " ඝන ඒකක");
        return g("සිලින්ඩරයක පරිමාව", "V = πr²h",
          ["r = " + rr + " , h = " + h, "V = " + round(PI) + " × " + round(rr * rr) + " × " + h, "V = " + round(PI * rr * rr * h)],
          round(PI * rr * rr * h) + " ඝන ඒකක");
      }
      if (/නොමැත/.test(low)) return null;
    }
    if (/ත්‍රිකෝණ|triangle/.test(low) && /ක්ෂේත්‍රඵල|වර්ගඵල|area|වර්ගඵලය/.test(low)) {
      var b = pickNum(text, ["පාදය", "base"]) || nums[0];
      var hh = pickNum(text, ["උස", "height"]) || nums[1];
      if (b && hh) return g("ත්‍රිකෝණයක ක්ෂේත්‍රඵලය", "A = ½ × පාදය × උස",
        ["පාදය = " + b + " , උස = " + hh, "A = ½ × " + b + " × " + hh, "A = " + round(0.5 * b * hh)],
        round(0.5 * b * hh) + " වර්ග ඒකක");
    }
    if (/පයිතගරස්|pythagoras|කර්ණය|hypotenuse|ලම්බකෝණ/.test(low)) {
      var sides = nums.slice(0, 2);
      if (sides.length === 2) {
        var hyp = Math.sqrt(sides[0] * sides[0] + sides[1] * sides[1]);
        return g("පයිතගරස් ප්‍රමේයය", "c² = a² + b²",
          ["a = " + sides[0] + " , b = " + sides[1], "c² = " + round(sides[0] ** 2) + " + " + round(sides[1] ** 2) + " = " + round(sides[0] ** 2 + sides[1] ** 2),
            "c = √" + round(sides[0] ** 2 + sides[1] ** 2) + " = " + round(hyp)],
          "කර්ණය = " + round(hyp));
      }
    }
    if (/සෘජුකෝණාස්‍ර|rectangle|සමචතුරස්‍ර|square/.test(low)) {
      var x = pickNum(text, ["පළල", "width"]) || nums[0];
      var y = pickNum(text, ["දිග", "length"]) || nums[1] || nums[0];
      if (/පරිමාව|volume/.test(low) && nums.length >= 3) {
        var z = nums[2];
        return g("සෘජුකෝණාස්‍රාකාර ඝනයක පරිමාව", "V = දිග × පළල × උස",
          ["V = " + x + " × " + y + " × " + z, "V = " + round(x * y * z)], round(x * y * z) + " ඝන ඒකක");
      }
      if (/පරිමිතිය|perimeter|වට ප්‍රමාණය/.test(low)) {
        return g("පරිමිතිය", "P = 2 × (දිග + පළල)",
          ["P = 2 × (" + y + " + " + x + ")", "P = " + round(2 * (x + y))], round(2 * (x + y)) + " ඒකක");
      }
      return g("සෘජුකෝණාස්‍රයක ක්ෂේත්‍රඵලය", "A = දිග × පළල",
        ["A = " + y + " × " + x, "A = " + round(x * y)], round(x * y) + " වර්ග ඒකක");
    }
    return null;
  }

  function pickNum(text, words) {
    var t = text;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var re = new RegExp("([-0-9.]+)\\s*(?:cm|m|km|mm)?\\s*[^0-9]{0,12}" + w + "|" + w + "\\s*(?:=|:|is|යනු)?\\s*([-0-9.]+)");
      var m = re.exec(t.toLowerCase());
      if (m) return parseFloat(m[1] || m[2]);
    }
    return null;
  }

  /* -------------------------------------------------------------- statistics */
  function statistics(text) {
    var nums = (text.match(/-?\d+(\.\d+)?/g) || []).map(parseFloat);
    if (nums.length < 3) return null;
    var low = text.toLowerCase();
    if (!/මධ්‍යය|මධ්‍යගත|ප්‍රකාරය|mean|median|mode|පරාසය|range|සම්මත|අපගමන/.test(low)) return null;
    var sorted = nums.slice().sort(function (a, b) { return a - b; });
    var n = nums.length, sum = nums.reduce(function (a, b) { return a + b; }, 0);
    var mean = sum / n;
    var median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    var counts = {}, mode = sorted[0], best = 0;
    nums.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; if (counts[x] > best) { best = counts[x]; mode = x; } });
    var variance = nums.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / n;
    return {
      kind: "statistics", title: "දත්ත සමූහයේ මධ්‍ය ප්‍රවණතාව",
      formula: "x̄ = Σx/n , මධ්‍යගතය = මැද අගය , ප්‍රකාරය = වැඩිපුරම ඇති අගය",
      steps: ["දත්ත: " + nums.join(", "), "එකතුව Σx = " + round(sum) + " , n = " + n,
        "මධ්‍යය x̄ = " + round(sum) + " ÷ " + n + " = " + round(mean),
        "පිළිවෙළට තැබූ විට: " + sorted.join(", ") + " ⇒ මධ්‍යගතය = " + round(median),
        "ප්‍රකාරය = " + round(mode) + " , පරාසය = " + round(sorted[n - 1] - sorted[0]),
        "විචලනය σ² = " + round(variance) + " , සම්මත අපගමනය σ = " + round(Math.sqrt(variance))],
      answer: "මධ්‍යය = " + round(mean) + " , මධ්‍යගතය = " + round(median) + " , ප්‍රකාරය = " + round(mode)
    };
  }

  /* ------------------------------------------------------------ unit convert */
  var UNITS = [
    ["km", "m", 1000], ["m", "cm", 100], ["cm", "mm", 10], ["m", "mm", 1000],
    ["kg", "g", 1000], ["g", "mg", 1000], ["t", "kg", 1000],
    ["l", "ml", 1000], ["l", "cm3", 1000], ["m3", "l", 1000],
    ["hour", "min", 60], ["h", "min", 60], ["min", "s", 60], ["h", "s", 3600],
    ["m2", "cm2", 10000], ["m3", "cm3", 1e6], ["km2", "m2", 1e6]
  ];
  /* Sinhala unit words → symbols, so "මිනිත්තු 90 බවට පැය" works too. */
  var SI_UNITS = [
    ["කිලෝමීටර", "km"], ["සෙන්ටිමීටර", "cm"], ["මිලිමීටර", "mm"], ["මීටර", "m"],
    ["කිලෝග්‍රෑම", "kg"], ["කිලෝග්‍රෑම්", "kg"], ["මිලිග්‍රෑම", "mg"], ["ග්‍රෑම", "g"],
    ["මිලිලීටර", "ml"], ["ලීටර", "l"], ["මිනිත්තු", " min "], ["විනාඩි", " min "],
    ["පැය", " h "], ["තත්පර", " s "], ["ටොන්", "t"]
  ].sort(function (a, b) { return b[0].length - a[0].length; });   // longest word first
  function sinhalaUnits(txt) {
    var out = txt;
    for (var i = 0; i < SI_UNITS.length; i++) out = out.split(SI_UNITS[i][0]).join(" " + SI_UNITS[i][1] + " ");
    return out;
  }

  function convert(text) {
    var low = sinhalaUnits(String(text).toLowerCase());
    if (!/පරිවර්තනය|convert|කීයද|බවට|ලෙස|→|->|to /.test(urlSafe(low))) return null;

    /* temperature */
    var p = low.match(/(-?\d+(?:[.,]\d+)?)\s*°?\s*(c|f|k)\b[^a-z0-9]{1,16}?(c|f|k)\b/);
    if (p) {
      var v = parseFloat(p[1].replace(",", ".")), from = p[2], to = p[3], out = null, f = "";
      if (from === "c" && to === "f") { out = v * 9 / 5 + 32; f = "°F = (°C × 9/5) + 32"; }
      else if (from === "f" && to === "c") { out = (v - 32) * 5 / 9; f = "°C = (°F − 32) × 5/9"; }
      else if (from === "c" && to === "k") { out = v + 273.15; f = "K = °C + 273.15"; }
      else if (from === "k" && to === "c") { out = v - 273.15; f = "°C = K − 273.15"; }
      if (out !== null) {
        return {
          kind: "convert", title: "උෂ්ණත්ව පරිවර්තනය", formula: f,
          steps: [v + " " + from.toUpperCase() + " → " + to.toUpperCase(), f, "පිළිතුර = " + round(out) + " " + to.toUpperCase()],
          answer: round(out) + " " + to.toUpperCase()
        };
      }
    }

    /* speed: km/h ↔ m/s */
    var sp = low.match(/(-?\d+(?:[.,]\d+)?)\s*(km\/h|kmph|km·h-1|m\/s|ms-1|mps)/g);
    if (sp && /km\/h|kmph|km·h-1/.test(low) && /m\/s|ms-1|mps/.test(low)) {
      var kmh = parseFloat(sp[0].replace(/[^0-9.,]/g, "").replace(",", "."));
      if (!isNaN(kmh)) {
        return {
          kind: "convert", title: "වේග ඒකක පරිවර්තනය", formula: "m/s = km/h × 1000 ÷ 3600  (හෝ ÷ 3.6)",
          steps: [kmh + " km/h → m/s", kmh + " × 1000 ÷ 3600", "= " + round(kmh * 1000 / 3600) + " m/s"],
          answer: round(kmh * 1000 / 3600) + " m/s"
        };
      }
    }

    /* generic single-step unit pairs (first unit = from, second = to) */
    // "500g", "2 km" and the Sinhala order "මිනිත්තු 90" are all understood
    var unitRe = /(?:(\d+(?:[.,]\d+)?)\s*|(?:^|[^A-Za-z0-9\u0D80-\u0DFF]))(km3|km2|cm3|cm2|m3|m2|km|cm|mm|kg|mg|ml|min|hours|hrs|h|s|m|l|g|t)\b(?:\s*(\d+(?:[.,]\d+)?))?/g;
    var found = [], mm;
    while ((mm = unitRe.exec(low))) {
      var rawVal = mm[1] !== undefined ? mm[1] : mm[3];
      found.push({
        v: rawVal === undefined ? null : parseFloat(rawVal.replace(",", ".")),
        u: mm[2], at: mm.index
      });
    }
    if (found.length >= 2) {
      var srcEnt = null;
      for (var si = 0; si < found.length; si++) if (found[si].v !== null) { srcEnt = found[si]; break; }
      if (!srcEnt) {
        // the value stood apart from both units ("කිලෝග්‍රෑම් 2 බවට ග්‍රෑම්")
        var lonely = (String(text).match(/\d+(?:[.,]\d+)?/g) || []).map(function (x) { return parseFloat(x.replace(",", ".")); });
        if (lonely.length === 1) { srcEnt = found[0]; srcEnt.v = lonely[0]; }
      }
      if (srcEnt) for (var i = 0; i < found.length; i++) {
        for (var j = 0; j < found.length; j++) {
          if (i === j || found[i] !== srcEnt) continue;
          var a = /^(hours|hrs)$/.test(found[i].u) ? "h" : found[i].u;
          var b = /^(hours|hrs)$/.test(found[j].u) ? "h" : found[j].u;
          var fwd = UNITS.filter(function (u) { return u[0] === a && u[1] === b; })[0];
          var rev = UNITS.filter(function (u) { return u[0] === b && u[1] === a; })[0];
          var val = found[i].v;
          if (fwd) {
            return {
              kind: "convert", title: "ඒකක පරිවර්තනය", formula: val + " " + a + " = ? " + b,
              steps: [val + " " + a + " → " + b, val + " × " + fwd[2] + " = " + round(val * fwd[2]) + " " + b],
              answer: round(val * fwd[2]) + " " + b
            };
          }
          if (rev) {
            return {
              kind: "convert", title: "ඒකක පරිවර්තනය", formula: val + " " + a + " = ? " + b,
              steps: [val + " " + a + " → " + b, val + " ÷ " + rev[2] + " = " + round(val / rev[2]) + " " + b],
              answer: round(val / rev[2]) + " " + b
            };
          }
        }
      }
    }
    return null;
  }

  function urlSafe(x) { return x; }

  /* ----------------------------------------------------------- number theory */
  function numberTools(text) {
    var low = text.toLowerCase();
    var nums = (text.match(/\d+/g) || []).map(Number);
    if (!nums.length) return null;
    if (/ල.ස.ගු|ම.ස.ස|සා.පො.ගු|lcm|හ.සා.ගු|gcd|hcf/.test(low) && nums.length >= 2) {
      var l = 1, g = 0;
      nums.forEach(function (n) { g = gcd(g, n); l = l * n / gcd(l, n); });
      return { kind: "number", title: "ල.ස.ගු හා ම.ස.ස", formula: "ම.ස.ස(a,b) = a·b ÷ ල.ස.ගු(a,b)",
        steps: ["සංඛ්‍යා: " + nums.join(", "), "ම.ස.ස = " + g, "ල.ස.ගු = " + l],
        answer: "ම.ස.ස = " + g + " , ල.ස.ගු = " + l };
    }
    if (/ප්‍රථමක|prime/.test(low)) {
      var v = nums[0], isPrime = v > 1;
      for (var i = 2; i * i <= v; i++) if (v % i === 0) { isPrime = false; break; }
      return { kind: "number", title: "ප්‍රථමක සංඛ්‍යා පරීක්ෂාව", formula: "ප්‍රථමකයකට බෙදිය හැක්කේ 1 සහ එයම පමණි",
        steps: [v + " හි බෙදිය හැකි සංඛ්‍යා පරීක්ෂා කරන්න", "√" + v + " ≈ " + round(Math.sqrt(v)) + " දක්වා පමණක් පරීක්ෂා කිරීම ප්‍රමාණවත්"],
        answer: v + (isPrime ? " ප්‍රථමක සංඛ්‍යාවකි" : " ප්‍රථමක සංඛ්‍යාවක් නොවේ") };
    }
    if (/ගුණ|times|multipl/.test(low) && nums.length >= 2) {
      var m1 = nums[0], m2 = nums[1];
      return { kind: "calc", title: "ගුණ කිරීම", formula: m1 + " × " + m2 + " = " + (m1 * m2),
        steps: [m1 + " × " + m2, "= " + (m1 * m2)], answer: String(m1 * m2) };
    }
    if (/ගුණාකාර|multiples|වගුව|table/.test(low)) {
      var x = nums[0], lim = nums[1] || 10, list = [];
      for (var k = 1; k <= Math.min(lim, 20); k++) list.push(x + " × " + k + " = " + x * k);
      return { kind: "number", title: x + " හි ගුණාකාර", formula: "පොදු අනුපාතය = " + x, steps: list, answer: list.join(" | ") };
    }
    if (/කාරක|factor/.test(low)) {
      var nf = nums[0], fs = [];
      for (var d = 1; d <= nf; d++) if (nf % d === 0) fs.push(d);
      return { kind: "number", title: nf + " හි සාධක", formula: "සාධක = බෙදිය හැකි සියලු සංඛ්‍යා",
        steps: [nf + " ÷ d ඉතිරි නොමැතිව බෙදෙන d සොයන්න", "සාධක: " + fs.join(", ")], answer: fs.join(", ") };
    }
    return null;
  }

  /* --------------------------------------------------------------- percentage */
  function percentage(text) {
    var low = text.toLowerCase();
    if (!/%|ප්‍රතිශත/.test(low)) return null;
    var nums = (text.match(/\d+(\.\d+)?/g) || []).map(parseFloat);
    if (!nums.length) return null;
    var p = nums[0], rest = nums.slice(1);
    if (/වැඩි|increase|එකතු/.test(low) && nums.length >= 2) {
      var base = nums[0], pc = nums[1], res = base + base * pc / 100;
      return { kind: "calc", title: "ප්‍රතිශතයකින් වැඩි කිරීම", formula: "නව අගය = මුල් අගය × (1 + p/100)",
        steps: ["මුල් අගය = " + base + " , ප්‍රතිශතය = " + pc + "%", "වැඩිවීම = " + base + " × " + pc + "/100 = " + round(base * pc / 100),
          "නව අගය = " + round(base + base * pc / 100)], answer: round(res) };
    }
    if (/අඩු|decrease|වට්ටම|discount/.test(low) && nums.length >= 2) {
      var b2 = nums[0], p2 = nums[1], r2 = b2 - b2 * p2 / 100;
      return { kind: "calc", title: "ප්‍රතිශතයකින් අඩු කිරීම / වට්ටම", formula: "නව අගය = මුල් අගය × (1 − p/100)",
        steps: ["මුල් අගය = " + b2 + " , ප්‍රතිශතය = " + p2 + "%", "වට්ටම = " + b2 + " × " + p2 + "/100 = " + round(b2 * p2 / 100),
          "ගෙවිය යුතු මුදල = " + round(r2)], answer: round(r2) };
    }
    if (/හි\s*%|කීයද|of /.test(low) && nums.length >= 2) {
      var val = nums[0], whole = nums[1];
      var kk = whole * val / 100;
      return { kind: "calc", title: "ප්‍රතිශතයක් ගණනය කිරීම", formula: "අගය = (ප්‍රතිශතය ÷ 100) × මුළුව",
        steps: [whole + " හි " + val + "% = " + whole + " × " + val + " ÷ 100", "= " + round(kk)], answer: round(kk) };
    }
    if (/%ක්|කී ප්‍රතිශතයක්|percent of/.test(low) && nums.length >= 2) {
      var part = nums[0], tot = nums[1], pct = part / tot * 100;
      return { kind: "calc", title: "ප්‍රතිශතය සොයා ගැනීම", formula: "ප්‍රතිශතය = (කොටස ÷ මුළුව) × 100",
        steps: [part + " ÷ " + tot + " = " + round(part / tot), round(part / tot) + " × 100 = " + round(pct) + "%"],
        answer: round(pct) + "%" };
    }
    if (nums.length === 1 && /භාග|දශම|fraction|decimal/.test(low)) {
      var one = nums[0];
      return { kind: "calc", title: "ප්‍රතිශතය භාගයක් හා දශමයක් ලෙස", formula: "p% = p/100",
        steps: [one + "% = " + one + "/100", "සරල කළ භාගය = " + frac(R(one, 100)), "දශමය = " + round(one / 100)],
        answer: frac(R(one, 100)) + " හෝ " + round(one / 100) };
    }
    void rest; void p;
    return null;
  }

  /* ------------------------------------------------------------ interest etc */
  function finance(text) {
    var low = text.toLowerCase();
    var nums = (text.match(/\d+(\.\d+)?/g) || []).map(parseFloat);
    if (/සරල පොලිය|simple interest/.test(low) && nums.length >= 3) {
      var P = nums[0], Rr = nums[1], T = nums[2], I = P * Rr * T / 100;
      return { kind: "calc", title: "සරල පොලිය", formula: "I = PRT / 100",
        steps: ["P = " + P + " , R = " + Rr + "% , T = " + T + " වසර", "I = " + P + " × " + Rr + " × " + T + " ÷ 100", "I = " + round(I)],
        answer: "පොලිය = රු. " + round(I) + " , මුළු මුදල = රු. " + round(P + I) };
    }
    if (/චක්‍ර|compound/.test(low) && nums.length >= 3) {
      var P2 = nums[0], R2 = nums[1], T2 = nums[2], A = P2 * Math.pow(1 + R2 / 100, T2);
      return { kind: "calc", title: "චක්‍ර පොලිය", formula: "A = P(1 + r/100)ⁿ",
        steps: ["P = " + P2 + " , r = " + R2 + "% , n = " + T2, "A = " + P2 + " × (1 + " + R2 + "/100)^" + T2,
          "A = " + round(A), "පොලිය = " + round(A - P2)], answer: "මුළු මුදල = රු. " + round(A) };
    }
    if (/ලාභ|අලාභ|profit|loss/.test(low) && nums.length >= 2) {
      var cost = nums[0], sell = nums[1], prof = sell - cost, pct = prof / cost * 100;
      return { kind: "calc", title: prof >= 0 ? "ලාභය හා ලාභ ප්‍රතිශතය" : "අලාභය හා අලාභ ප්‍රතිශතය",
        formula: "ලාභය = විකුණුම් මිල − පිරිවැය ; ප්‍රතිශතය = (ලාභය ÷ පිරිවැය) × 100",
        steps: ["පිරිවැය = " + cost + " , විකුණුම් මිල = " + sell, "ලාභය = " + sell + " − " + cost + " = " + round(prof),
          "ප්‍රතිශතය = " + round(prof) + " ÷ " + cost + " × 100 = " + round(pct) + "%"],
        answer: (prof >= 0 ? "ලාභය " : "අලාභය ") + "රු. " + round(Math.abs(prof)) + " (" + round(Math.abs(pct)) + "%)" };
    }
    return null;
  }

  /* ================================================================= entry */
  /**
   * Try every solver in order of specificity.
   * @returns {null|object} solver result, or null when nothing matched.
   */
  function solve(text) {
    var t = String(text || "");
    if (!t.trim()) return null;
    var out = null;
    try { out = physics(t); } catch (e) { out = null; }
    if (!out) { try { out = geometry(t); } catch (e) { out = null; } }
    if (!out) { try { out = statistics(t); } catch (e) { out = null; } }
    if (!out) { try { out = convert(t); } catch (e) { out = null; } }
    if (!out) { try { out = finance(t); } catch (e) { out = null; } }
    if (!out) { try { out = numberTools(t); } catch (e) { out = null; } }
    if (!out) { try { out = percentage(t); } catch (e) { out = null; } }

    /* equations:  ... = ...  containing a variable */
    if (!out) {
      var cleaned = t.replace(/විසඳන්න|විසඳ|සොයා දෙන්න|සොයන්න|solve|find x|අගය|කීයද/g, "").trim();
      if (cleaned.indexOf("=") > 0) {
        // two equations joined by "සහ" / "හා" / "and" / "," / ";" → simultaneous
        var all = cleaned.split(/\s*(?:සහ|හා|and|,|;|\n)\s*/).filter(function (x) {
          return x.indexOf("=") > 0 && /[xy]/.test(x);
        });
        if (all.length >= 2) {
          var sim = null;
          try { sim = solveSimultaneous(all[0], all[1]); } catch (e) { sim = null; }
          if (sim) out = sim;
        }
        if (!out) {
          var eq = cleaned.split("=");
          if (eq.length === 2) {
            var poly = null;
            try { poly = parsePolynomial(eq[0], eq[1]); } catch (e) { poly = null; }
            if (poly) {
              if (Math.abs(poly.a2) > 1e-12) out = solveQuadratic(poly.a2, poly.a1, poly.a0);
              else if (Math.abs(poly.a1) > 1e-12) out = solveLinear(poly.a1, poly.a0, guessVar(cleaned));
            }
          }
        }
      }
    }

    /* "5000 x 3" / "12 x 8" — x between two numbers means multiply */
    if (!out && t.indexOf("=") < 0) {
      var mx = t.match(/(\d+(?:\.\d+)?)\s*[xX×*]\s*(\d+(?:\.\d+)?)/);
      if (mx) {
        var p1 = parseFloat(mx[1]), p2 = parseFloat(mx[2]), prod = p1 * p2;
        out = {
          kind: "calc", title: "ගුණ කිරීම", formula: p1 + " × " + p2 + " = " + round(prod),
          steps: [p1 + " × " + p2, "= " + round(prod)], answer: String(round(prod))
        };
      }
    }

    /* plain arithmetic expression */
    if (!out) {
      var m = t.match(/[0-9π(][0-9\s+\-*/^().,%√π!×÷]*[0-9)%√π!]?/);
      if (m && m[0] && /[+\-*/^×÷%√!]/.test(m[0])) {
        var expr = m[0].replace(/\s+/g, " ").trim();
        if (expr.length >= 3) {
          try {
            var r = evalAnswer(expr);
            out = {
              kind: "calc", title: "ගණනය කිරීම", formula: expr + " = " + r.exact,
              steps: [expr, "= " + r.text], answer: r.text
            };
          } catch (e) { out = null; }
        }
      }
    }
    return out;
  }

  function guessVar(text) {
    var m = text.match(/[a-z](?![a-z])/i);
    return m ? m[0] : "x";
  }

  root.Solver = {
    solve: solve, evaluate: evaluate, evalAnswer: evalAnswer,
    physics: physics, geometry: geometry, statistics: statistics, convert: convert,
    percentage: percentage, finance: finance, numberTools: numberTools,
    solveQuadratic: solveQuadratic, solveLinear: solveLinear, solveSimultaneous: solveSimultaneous,
    labelledNumbers: labelledNumbers
  };
})(window.SipAI);
