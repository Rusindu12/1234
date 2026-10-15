/* ============================================================================
 * SipSaviya AI · embed.js — on-device semantic search
 *
 * A real (small) information-retrieval model that runs offline:
 *   1. TF-IDF weighting of every knowledge-card / question in the corpus.
 *   2. Latent Semantic Analysis: the truncated SVD  A ≈ U Σ Vᵀ  is computed
 *      with power iteration + deflation on the (tiny) Gram matrix A·Aᵀ.
 *   3. A question is projected into the same latent space and compared with
 *      cosine similarity; the result is blended with BM25-style lexical
 *      scoring so exact formula/term matches never get lost.
 *
 * Everything is pure JavaScript — no library, no network, no server.
 * ==========================================================================*/
window.SipAI = window.SipAI || {};
(function (root, NLP) {
  "use strict";

  var K_COMPONENTS = 24;      // latent dimensions
  var POWER_ITERS = 22;       // iterations per component
  var LEX_W = 0.38, SEM_W = 0.62;

  var docs = [], vocab = Object.create(null), terms = [], df = [], N = 0;
  var sparse = [];            // sparse[] [i] = [termIdx, weight, termIdx, weight…]
  var U = [], sigma = [], docEmb = [], trained = false;
  var cacheKey = "sipai.lsa.v1";

  /* Small thesaurus so different phrasings of the same idea meet in the middle. */
  var SYN = [
    ["ක්ෂේත්‍රඵලය", "වර්ගඵලය වර්ගප්‍රමාණය area"],
    ["පරිමාව", "volume ghanapramana"],
    ["ත්වරණය", "acceleration"],
    ["ප්‍රවේගය", "velocity speed"],
    ["කර්ණය", "hypotenuse"],
    ["අරය", "radius"],
    ["විෂ්කම්භය", "diameter"],
    ["සමීකරණය", "equation"],
    ["මූල", "roots"],
    ["අගය", "value"],
    ["සංඛ්‍යාව", "number"],
    ["බලය", "power force"],
    ["ශක්තිය", "energy"],
    ["ධාරාව", "current"],
    ["ප්‍රතිරෝධය", "resistance"],
    ["උෂ්ණත්වය", "temperature"],
    ["ප්‍රතිශතය", "percentage percent"],
    ["ද්‍රව්‍යය", "mass matter"],
    ["වර්ණදේහය", "chromosome"],
    ["සෛලය", "cell"],
    ["ආම්ලික", "acid"],
    ["මවුලය", "mole"],
    ["ව්‍යාකරණය", "grammar"],
    ["රචනා", "essay"],
    ["විභාගය", "exam"],
    ["ප්‍රශ්නය", "question"]
  ];

  function expandTokens(tokens) {
    var out = tokens.slice();
    var joined = tokens.join(" ");
    SYN.forEach(function (pair) {
      var hits = pair.some(function (w) {
        return joined.indexOf(NLP.normalize(w).toLowerCase()) >= 0;
      });
      if (hits) pair.forEach(function (w) {
        NLP.tokenize(w).forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); });
      });
    });
    return out;
  }

  function docText(d) {
    return [d.title || "", d.keywords || "", d.text || ""].join(" \n ");
  }

  /* ------------------------------------------------------------------ build */
  function index(corpus) {
    docs = corpus || [];
    N = docs.length;
    vocab = Object.create(null); terms = []; df = []; sparse = [];
    if (!N) return;
    var raw = [];
    for (var i = 0; i < N; i++) {
      var toks = expandTokens(NLP.tokenize(docText(docs[i])));
      var tf = Object.create(null), order = [];
      for (var j = 0; j < toks.length; j++) {
        var t = toks[j];
        if (!tf[t]) { tf[t] = 0; order.push(t); }
        tf[t]++;
      }
      raw.push({ tf: tf, order: order });
    }
    for (var d = 0; d < N; d++) {
      for (var k = 0; k < raw[d].order.length; k++) {
        var term = raw[d].order[k];
        if (!(term in vocab)) { vocab[term] = terms.length; terms.push(term); df.push(0); }
        df[vocab[term]]++;
      }
    }
    for (var m = 0; m < N; m++) {
      var row = raw[m], vec = [];
      for (var o = 0; o < row.order.length; o++) {
        var tt = row.order[o], idx = vocab[tt];
        var idf = Math.log((N + 1) / (df[idx] + 1)) + 1;
        var w = (1 + Math.log(row.tf[tt])) * idf;
        vec.push(idx, w);
      }
      sparse.push(vec);
    }
    normalizeRows();
  }

  function normalizeRows() {
    for (var i = 0; i < N; i++) {
      var v = sparse[i], s = 0;
      for (var j = 1; j < v.length; j += 2) s += v[j] * v[j];
      s = Math.sqrt(s) || 1;
      for (var q = 1; q < v.length; q += 2) v[q] /= s;
    }
  }

  function idfOf(termIdx) { return Math.log((N + 1) / (df[termIdx] + 1)) + 1; }

  /* ------------------------------------------------------------------ train */
  function train() {
    if (trained || !N) return;
    var k = Math.min(K_COMPONENTS, N - 1);
    if (k < 2) { trained = true; return; }

    // --- Gram matrix G = A·Aᵀ (sparse accumulation via the inverted index)
    var G = [];
    for (var i = 0; i < N; i++) G.push(new Float64Array(N));
    var inv = [];
    for (var i2 = 0; i2 < N; i2++) {
      var v = sparse[i2];
      for (var p = 0; p < v.length; p += 2) {
        var t = v[p];
        if (!inv[t]) inv[t] = [];
        inv[t].push(i2, v[p + 1]);
      }
    }
    for (var t2 = 0; t2 < inv.length; t2++) {
      var list = inv[t2];
      if (!list) continue;
      for (var a = 0; a < list.length; a += 2) {
        var ia = list[a], wa = list[a + 1];
        for (var b = a; b < list.length; b += 2) {
          var ib = list[b], wb = list[b + 1];
          var prod = wa * wb;
          G[ia][ib] += prod;
          if (ia !== ib) G[ib][ia] += prod;
        }
      }
    }

    // --- power iteration with deflation
    U = []; sigma = [];
    var tmp = new Float64Array(N);
    for (var c = 0; c < k; c++) {
      var vec = new Float64Array(N);
      for (var r = 0; r < N; r++) vec[r] = Math.random() + 0.1;
      var lambda = 0;
      for (var it = 0; it < POWER_ITERS; it++) {
        for (var r2 = 0; r2 < N; r2++) {
          var sum = 0, g = G[r2];
          for (var r3 = 0; r3 < N; r3++) sum += g[r3] * vec[r3];
          tmp[r2] = sum;
        }
        // orthogonalise against already-found components (deflation)
        for (var pc = 0; pc < U.length; pc++) {
          var dot = 0, up = U[pc];
          for (var r4 = 0; r4 < N; r4++) dot += up[r4] * tmp[r4];
          for (var r5 = 0; r5 < N; r5++) tmp[r5] -= dot * up[r5];
        }
        var norm = 0;
        for (var r6 = 0; r6 < N; r6++) norm += tmp[r6] * tmp[r6];
        norm = Math.sqrt(norm);
        lambda = norm;
        if (norm < 1e-9) break;
        for (var r7 = 0; r7 < N; r7++) vec[r7] = tmp[r7] / norm;
      }
      if (lambda < 1e-7) break;
      U.push(Array.prototype.slice.call(vec));
      sigma.push(lambda);
    }

    // --- document embeddings: U · Σ
    docEmb = [];
    for (var d = 0; d < N; d++) {
      var e = new Float64Array(U.length);
      for (var cc = 0; cc < U.length; cc++) e[cc] = U[cc][d] * sigma[cc];
      docEmb.push(e);
    }
    trained = true;
  }

  /* -------------------------------------------------------------- inference */
  function queryVector(text) {
    var toks = expandTokens(NLP.tokenize(text));
    var tf = Object.create(null);
    toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
    var q = new Float64Array(terms.length);
    var norm = 0;
    for (var t in tf) {
      var idx = vocab[t];
      if (idx === undefined) continue;
      var w = (1 + Math.log(tf[t])) * idfOf(idx);
      q[idx] = w;
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (var i = 0; i < q.length; i++) q[i] /= norm;

    // t = A·q  (N long), then emb = Uᵀ·t / σ   ⇒ qᵀV in latent space
    var t = new Float64Array(N);
    for (var d = 0; d < N; d++) {
      var v = sparse[d], s = 0;
      for (var p = 0; p < v.length; p += 2) s += v[p + 1] * q[v[p]];
      t[d] = s;
    }
    var emb = new Float64Array(U.length);
    for (var c = 0; c < U.length; c++) {
      var dot = 0, up = U[c];
      for (var r = 0; r < N; r++) dot += up[r] * t[r];
      emb[c] = sigma[c] > 1e-9 ? dot / sigma[c] : 0;
    }
    return { emb: emb, tf: tf, terms: toks };
  }

  function cosine(a, b) {
    var dot = 0, na = 0, nb = 0;
    for (var i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    if (!na || !nb) return 0;
    return dot / Math.sqrt(na * nb);
  }

  /** BM25-flavoured lexical score, kept in 0…1 for blending. */
  function lexical(qtf, docIdx) {
    var avg = 0, score = 0;
    var v = sparse[docIdx];
    var weights = Object.create(null);
    for (var p = 0; p < v.length; p += 2) weights[v[p]] = v[p + 1];
    var hits = 0, total = 0;
    for (var t in qtf) {
      total++;
      var idx = vocab[t];
      if (idx === undefined) continue;
      if (weights[idx] !== undefined) { hits += Math.min(1, qtf[t]) * weights[idx]; }
      else {
        // partial-prefix match helps with Sinhala inflections
        for (var q in vocab) {
          if (q.length > 3 && (q.indexOf(t) === 0 || t.indexOf(q) === 0) && weights[vocab[q]] !== undefined) {
            hits += 0.5 * weights[vocab[q]];
            break;
          }
        }
      }
    }
    if (!total) return 0;
    score = hits / Math.sqrt(total);
    return Math.min(1, score * 3.2);
  }

  /**
   * Hybrid search.
   * @param {string} text question
   * @param {{subject?:string, limit?:number, minScore?:number}} opts
   */
  function search(text, opts) {
    opts = opts || {};
    if (!N) return [];
    train();
    var limit = opts.limit || 5;
    var qv = queryVector(text);
    var out = [];
    for (var i = 0; i < N; i++) {
      var sem = qv.emb.length ? cosine(qv.emb, docEmb[i]) : 0;
      if (sem < 0) sem = 0;
      var lex = lexical(qv.tf, i);
      var score = SEM_W * sem + LEX_W * lex;
      var subj = docs[i].subject;
      if (opts.subject && subj && subj === opts.subject) score *= 1.18;
      if (score > 0.001) out.push({ doc: docs[i], index: i, score: score, semantic: sem, lexical: lex });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    if (opts.minScore) out = out.filter(function (r) { return r.score >= opts.minScore; });
    return out.slice(0, limit);
  }

  /** Related cards for a card the student is already reading. */
  function similar(index, limit) {
    if (!trained || !docEmb[index]) return [];
    var out = [];
    for (var i = 0; i < N; i++) {
      if (i === index) continue;
      var s = cosine(docEmb[index], docEmb[i]);
      if (s > 0.05) out.push({ doc: docs[i], index: i, score: s });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, limit || 4);
  }

  function stats() {
    return { documents: N, vocabulary: terms.length, latentDimensions: sigma.length, trained: trained };
  }

  root.Embed = { index: index, train: train, search: search, similar: similar, stats: stats, cosine: cosine };
})(window.SipAI, window.SipNLP);
