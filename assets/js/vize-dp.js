/* Vize hazırlık — özyinelemeden dinamik programlamaya dönüşüm ve algoritma izleme üreteçleri */
(function () {
  "use strict";
  var V = window.VIZE, Y = V._yard, m = Y.m, M = Y.M, kod = Y.kod, adim = Y.adim, tablo = Y.tablo;
  var SINIR = 20000000;

  function tablo1(ad, n, degerler, ilkSabit) {      // 1B tablo; her hücre bir fragman (taban hücreleri hariç)
    var h = '<table class="vize-tablo dp-tablo"><tr><th>' + m("i") + "</th>";
    for (var i = 0; i <= n; i++) h += "<th>" + i + "</th>";
    h += "</tr><tr><th>" + m(ad + "[i]") + "</th>";
    for (var j = 0; j <= n; j++) h += "<td>" + (j < ilkSabit ? '<span class="dp-taban">' + degerler[j] + "</span>" : '<span class="fragment dp-yeni">' + degerler[j] + "</span>") + "</td>";
    return h + "</tr></table>";
  }
  function tablo2(ad, satirEt, sutunEt, T, tabanSatir, fmt) {   // 2B tablo; satır satır fragman
    fmt = fmt || function (v) { return v === null || v === undefined ? "" : v; };
    var h = '<table class="vize-tablo dp-tablo"><tr><th>' + ad + "</th>" + sutunEt.map(function (s) { return "<th>" + s + "</th>"; }).join("") + "</tr>";
    T.forEach(function (row, i) {
      h += "<tr" + (i < tabanSatir ? ' class="dp-taban-satir"' : ' class="fragment"') + "><th>" + satirEt[i] + "</th>" + row.map(function (v) { return "<td>" + fmt(v) + "</td>"; }).join("") + "</tr>";
    });
    return h + "</table>";
  }
  function donusumKurali() {
    return "<ol class='kucuk'><li><strong>Parametreler → tablo indisleri:</strong> özyinelemeli yordamın değişen parametreleri tablonun boyutlarıdır.</li>" +
      "<li><strong>Taban durumları → ilk değerler.</strong></li><li><strong>Özyinelemeli çağrı → tablo okuma:</strong> " + m("F(\\dots)") + " yerine " + m("f[\\dots]") + ".</li>" +
      "<li><strong>Sıra:</strong> bir hücrenin okuduğu hücreler ondan <em>önce</em> dolmalı.</li><li><strong>Dönüş:</strong> özgün çağrının hücresi.</li></ol>";
  }

  /* ---------------- Problem türleri ---------------- */
  var TURLER = [
    function genFib(R) {
      var p = R.int(1, 3), q = R.int(1, 2), g0 = R.int(0, 2), g1 = R.int(1, 3), N = R.int(8, 11);
      var g = [g0, g1]; for (var i = 2; i <= N; i++) g[i] = p * g[i - 1] + q * g[i - 2];
      var cagri = 0; (function G(n) { cagri++; if (n > 1) { G(n - 1); G(n - 2); } })(N);
      var P = p === 1 ? "" : p + " · ", Q = q === 1 ? "" : q + " · ";
      var k = R.int(2, N);
      return {
        ad: "Genelleştirilmiş Fibonacci", tanim: m("G(0)=" + g0 + ",\\ G(1)=" + g1 + ",\\ G(n)=" + (p === 1 ? "" : p) + "G(n-1)+" + (q === 1 ? "" : q) + "G(n-2)") + ". " + m("G(" + N + ")") + " isteniyor.",
        rek: kod("G(n)", [[0, "if n == 0"], [1, "return " + g0], [0, "if n == 1"], [1, "return " + g1], [0, "return " + P + "G(n − 1) + " + Q + "G(n − 2)"]]),
        dp: kod("G-DP(n)", [[0, "let g[0 : n] be a new array"], [0, "g[0] = " + g0], [0, "g[1] = " + g1], [0, "for i = 2 to n"], [1, "g[i] = " + P + "g[i − 1] + " + Q + "g[i − 2]"], [0, "return g[n]"]]),
        param: "Tek parametre " + m("n") + " ⇒ 1 boyutlu tablo " + m("g[0:" + N + "]") + ". " + m("g[i]") + " yalnızca " + m("g[i-1], g[i-2]") + "'ye bağlı ⇒ " + m("i") + " artan sırada doldur.",
        tablo: tablo1("g", N, g, 2), ornek: m("g[" + k + "] = " + (p === 1 ? "" : p + "\\cdot ") + "g[" + (k - 1) + "] + " + (q === 1 ? "" : q + "\\cdot ") + "g[" + (k - 2) + "] = " + (p === 1 ? "" : p + "\\cdot ") + g[k - 1] + " + " + (q === 1 ? "" : q + "\\cdot ") + g[k - 2] + " = " + g[k]),
        cevap: m("G(" + N + ") = " + g[N]), cagri: cagri, alt: N + 1,
        kar: "Özyinelemeli: " + m("\\Theta(\\phi^n)") + " çağrı (" + m("\\phi\\approx1.618") + "); DP: " + m("\\Theta(n)") + " zaman ve bellek.",
        c: "/* Ek örnek (kitapta yok): vize hazırlık üreteci, genelleştirilmiş Fibonacci */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\nint64_t cagri = 0;\n\nint64_t G(int32_t n)\n{\n    cagri++;\n    if (n == 0) return " + g0 + ";\n    if (n == 1) return " + g1 + ";\n    return " + p + " * G(n - 1) + " + q + " * G(n - 2);\n}\n\nint64_t G_dp(int32_t n)\n{\n    int64_t g[64];\n    g[0] = " + g0 + ";\n    g[1] = " + g1 + ";\n    for (int32_t i = 2; i <= n; i++)\n        g[i] = " + p + " * g[i - 1] + " + q + " * g[i - 2];\n    return g[n];\n}\n\nint main(void)\n{\n    int32_t n = " + N + ";\n    int64_t r = G(n);\n    printf(\"ozyinelemeli: %\" PRId64 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId64 \" (%\" PRId32 \" hucre)\\n\", G_dp(n), n + 1);\n    return 0;\n}\n",
        kontrol: g[N]
      };
    },
    function merdiven(R) {
      var S = R.sample([1, 2, 3, 4], R.int(2, 3)).sort(), N = R.int(7, 11);
      if (S.indexOf(1) < 0 && R.f() < 0.6) { S[0] = 1; S.sort(); }
      var w = [1]; for (var i = 1; i <= N; i++) { w[i] = 0; S.forEach(function (s) { if (s <= i) w[i] += w[i - s]; }); }
      var cagri = 0; (function W(n) { cagri++; if (n === 0) return; S.forEach(function (s) { if (s <= n) W(n - s); }); })(N);
      var Sm = "\\{" + S.join(", ") + "\\}", k = R.int(Math.max(1, S[S.length - 1]), N);
      return {
        ad: "Merdiven problemi", tanim: m(N) + " basamaklı merdiveni her adımda " + m(Sm) + " kümesinden bir sayı kadar basamak çıkarak kaç farklı yoldan çıkabiliriz? (Sıra önemli.)",
        rek: kod("WAYS(n)", [[0, "if n == 0"], [1, "return 1"], [0, "t = 0"], [0, "for each s in {" + S.join(", ") + "}"], [1, "if s ≤ n"], [2, "t = t + WAYS(n − s)"], [0, "return t"]]),
        dp: kod("WAYS-DP(n)", [[0, "let w[0 : n] be a new array"], [0, "w[0] = 1"], [0, "for i = 1 to n"], [1, "w[i] = 0"], [1, "for each s in {" + S.join(", ") + "}"], [2, "if s ≤ i"], [3, "w[i] = w[i] + w[i − s]"], [0, "return w[n]"]]),
        param: "Tek parametre " + m("n") + " (kalan basamak) ⇒ " + m("w[0:" + N + "]") + ". " + m("w[i]") + ", " + m("w[i-s]") + " (" + m("s\\in" + Sm) + ") hücrelerine bağlı ⇒ artan " + m("i") + ".",
        tablo: tablo1("w", N, w, 1),
        ornek: m("w[" + k + "] = " + S.filter(function (s) { return s <= k; }).map(function (s) { return "w[" + (k - s) + "]"; }).join("+") + " = " + S.filter(function (s) { return s <= k; }).map(function (s) { return w[k - s]; }).join("+") + " = " + w[k]),
        cevap: m("WAYS(" + N + ") = " + w[N]) + " yol.", cagri: cagri, alt: N + 1,
        kar: "Özyinelemeli: üstel çağrı; DP: " + m("\\Theta(n\\cdot|S|)") + " zaman, " + m("\\Theta(n)") + " bellek.",
        c: "/* Ek örnek (kitapta yok): vize hazırlık üreteci, merdiven problemi */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\nint32_t S[] = {" + S.join(", ") + "}, k = " + S.length + ";\nint64_t cagri = 0;\n\nint64_t ways(int32_t n)\n{\n    cagri++;\n    if (n == 0) return 1;\n    int64_t t = 0;\n    for (int32_t a = 0; a < k; a++)\n        if (S[a] <= n) t += ways(n - S[a]);\n    return t;\n}\n\nint64_t ways_dp(int32_t n)\n{\n    int64_t w[64] = {1};\n    for (int32_t i = 1; i <= n; i++) {\n        w[i] = 0;\n        for (int32_t a = 0; a < k; a++)\n            if (S[a] <= i) w[i] += w[i - S[a]];\n    }\n    return w[n];\n}\n\nint main(void)\n{\n    int32_t n = " + N + ";\n    int64_t r = ways(n);\n    printf(\"ozyinelemeli: %\" PRId64 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId64 \"\\n\", ways_dp(n));\n    return 0;\n}\n",
        kontrol: w[N]
      };
    },
    function binom(R) {
      var n = R.int(6, 8), k = R.int(2, n - 2), T = [], sat = [], sut = [];
      for (var i = 0; i <= n; i++) { T[i] = []; sat.push(m("i=" + i)); for (var j = 0; j <= k; j++) T[i][j] = j > i ? null : (j === 0 || j === i ? 1 : T[i - 1][j - 1] + T[i - 1][j]); }
      for (var j2 = 0; j2 <= k; j2++) sut.push(m("j=" + j2));
      var cagri = 2 * T[n][k] - 1, ri = R.int(2, n), rj = Math.max(1, Math.min(k, ri - 1, R.int(1, k)));
      return {
        ad: "Binom katsayısı", tanim: m("\\binom{n}{k}=\\binom{n-1}{k-1}+\\binom{n-1}{k}") + ", " + m("\\binom{n}{0}=\\binom{n}{n}=1") + ". " + m("\\binom{" + n + "}{" + k + "}") + " isteniyor (Pascal üçgeni).",
        rek: kod("CHOOSE(n, k)", [[0, "if k == 0 or k == n"], [1, "return 1"], [0, "return CHOOSE(n − 1, k − 1) + CHOOSE(n − 1, k)"]]),
        dp: kod("CHOOSE-DP(n, k)", [[0, "let c[0 : n, 0 : k] be a new table"], [0, "for i = 0 to n"], [1, "for j = 0 to min(i, k)"], [2, "if j == 0 or j == i"], [3, "c[i, j] = 1"], [2, "else c[i, j] = c[i − 1, j − 1] + c[i − 1, j]"], [0, "return c[n, k]"]]),
        param: "İki parametre " + m("(n,k)") + " ⇒ 2 boyutlu tablo " + m("c[0:" + n + ", 0:" + k + "]") + ". " + m("c[i,j]") + " bir önceki satıra bağlı ⇒ satır satır (artan " + m("i") + ").",
        tablo: tablo2(m("c[i,j]"), sat, sut, T, 1),
        ornek: m("c[" + ri + "," + rj + "] = c[" + (ri - 1) + "," + (rj - 1) + "] + c[" + (ri - 1) + "," + rj + "] = " + T[ri - 1][rj - 1] + " + " + (T[ri - 1][rj] || 0) + " = " + T[ri][rj]),
        cevap: m("\\binom{" + n + "}{" + k + "} = " + T[n][k]), cagri: cagri, alt: "(n+1)(k+1) = " + (n + 1) * (k + 1),
        kar: "Özyinelemeli: tam " + m("2\\binom{n}{k}-1") + " çağrı; DP: " + m("\\Theta(nk)") + ".",
        c: "/* Kaynak: CLRS 4. bs. Ek C.1 (binom katsayıları, Pascal özdeşliği); vize hazırlık üreteci */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\nint64_t cagri = 0;\n\nint64_t choose(int32_t n, int32_t k)\n{\n    cagri++;\n    if (k == 0 || k == n) return 1;\n    return choose(n - 1, k - 1) + choose(n - 1, k);\n}\n\nint64_t choose_dp(int32_t n, int32_t k)\n{\n    int64_t c[64][64];\n    for (int32_t i = 0; i <= n; i++)\n        for (int32_t j = 0; j <= (i < k ? i : k); j++)\n            c[i][j] = (j == 0 || j == i) ? 1 : c[i - 1][j - 1] + c[i - 1][j];\n    return c[n][k];\n}\n\nint main(void)\n{\n    int32_t n = " + n + ", k = " + k + ";\n    int64_t r = choose(n, k);\n    printf(\"ozyinelemeli: %\" PRId64 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId64 \"\\n\", choose_dp(n, k));\n    return 0;\n}\n",
        kontrol: T[n][k]
      };
    },
    function izgara(R) {
      var r = R.int(4, 5), c = 5, B, T, deneme = 0;
      do {
        B = []; for (var i = 0; i < r; i++) { B[i] = []; for (var j = 0; j < c; j++) B[i][j] = false; }
        var eng = R.int(2, 4); for (var e = 0; e < eng; e++) { var a = R.int(0, r - 1), b = R.int(0, c - 1); if (!(a === 0 && b === 0) && !(a === r - 1 && b === c - 1)) B[a][b] = true; }
        T = []; for (var i2 = 0; i2 < r; i2++) { T[i2] = []; for (var j2 = 0; j2 < c; j2++) T[i2][j2] = B[i2][j2] ? 0 : (i2 === 0 && j2 === 0 ? 1 : (i2 ? T[i2 - 1][j2] : 0) + (j2 ? T[i2][j2 - 1] : 0)); }
      } while (T[r - 1][c - 1] === 0 && ++deneme < 50);
      var cagri = 0; (function P(i, j) { cagri++; if (i < 0 || j < 0 || B[i][j]) return; if (i === 0 && j === 0) return; P(i - 1, j); P(i, j - 1); })(r - 1, c - 1);
      var engel = []; B.forEach(function (row, i) { row.forEach(function (v, j) { if (v) engel.push("(" + (i + 1) + "," + (j + 1) + ")"); }); });
      var sat = [], sut = []; for (var i3 = 0; i3 < r; i3++) sat.push(m("i=" + (i3 + 1))); for (var j3 = 0; j3 < c; j3++) sut.push(m("j=" + (j3 + 1)));
      var fmt = function (v) { return v; };
      var T2 = T.map(function (row, i) { return row.map(function (v, j) { return B[i][j] ? "■" : v; }); });
      var ri, rj; do { ri = R.int(1, r - 1); rj = R.int(1, c - 1); } while (B[ri][rj]);
      return {
        ad: "Engelli ızgarada yollar", tanim: m(r + "\\times" + c) + " ızgarada " + m("(1,1)") + "'den " + m("(" + r + "," + c + ")") + "'e yalnızca <strong>sağa</strong> ve <strong>aşağı</strong> giderek kaç yol vardır? Engelli hücreler (■): " + engel.join(", ") + ".",
        rek: kod("PATHS(i, j)", [[0, "if i < 1 or j < 1 or B[i, j]"], [1, "return 0"], [0, "if i == 1 and j == 1"], [1, "return 1"], [0, "return PATHS(i − 1, j) + PATHS(i, j − 1)"]]),
        dp: kod("PATHS-DP(r, c)", [[0, "let P[1 : r, 1 : c] be a new table"], [0, "for i = 1 to r"], [1, "for j = 1 to c"], [2, "if B[i, j]"], [3, "P[i, j] = 0"], [2, "elseif i == 1 and j == 1"], [3, "P[i, j] = 1"],
          [2, "else P[i, j] = (i > 1 ? P[i − 1, j] : 0) + (j > 1 ? P[i, j − 1] : 0)"], [0, "return P[r, c]"]]),
        param: "İki parametre " + m("(i,j)") + " ⇒ " + m("P[1:" + r + ", 1:" + c + "]") + ". " + m("P[i,j]") + " üst ve sol komşuya bağlı ⇒ satır satır, soldan sağa.",
        tablo: tablo2(m("P[i,j]"), sat, sut, T2, 0, fmt),
        ornek: m("P[" + (ri + 1) + "," + (rj + 1) + "] = P[" + ri + "," + (rj + 1) + "] + P[" + (ri + 1) + "," + rj + "] = " + T[ri - 1][rj] + " + " + T[ri][rj - 1] + " = " + T[ri][rj]),
        cevap: m("PATHS(" + r + "," + c + ") = " + T[r - 1][c - 1]) + " yol.", cagri: cagri, alt: r * c,
        kar: "Özyinelemeli: " + m("O(2^{r+c})") + " çağrı; DP: " + m("\\Theta(rc)") + ".",
        c: "/* Ek örnek (kitapta yok): vize hazırlık üreteci, engelli ızgarada yollar */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\n#define R " + r + "\n#define C " + c + "\nint32_t B[R + 1][C + 1] = {0};\nint64_t cagri = 0;\n\nint64_t paths(int32_t i, int32_t j)\n{\n    cagri++;\n    if (i < 1 || j < 1 || B[i][j]) return 0;\n    if (i == 1 && j == 1) return 1;\n    return paths(i - 1, j) + paths(i, j - 1);\n}\n\nint64_t paths_dp(void)\n{\n    int64_t P[R + 1][C + 1] = {{0}};\n    for (int32_t i = 1; i <= R; i++)\n        for (int32_t j = 1; j <= C; j++)\n            if (B[i][j]) P[i][j] = 0;\n            else if (i == 1 && j == 1) P[i][j] = 1;\n            else P[i][j] = P[i - 1][j] + P[i][j - 1];\n    return P[R][C];\n}\n\nint main(void)\n{\n" +
          engel.map(function (s) { return "    B" + s.replace("(", "[").replace(",", "][").replace(")", "]") + " = 1;\n"; }).join("") +
          "    int64_t r = paths(R, C);\n    printf(\"ozyinelemeli: %\" PRId64 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId64 \"\\n\", paths_dp());\n    return 0;\n}\n",
        kontrol: T[r - 1][c - 1]
      };
    },
    function sirtCantasi(R) {
      var n = 4, W = R.int(6, 10), w = [], v = [], K = [];
      for (var i = 0; i < n; i++) { w.push(R.int(1, 5)); v.push(R.int(2, 12)); }
      for (var a = 0; a <= n; a++) { K[a] = []; for (var b = 0; b <= W; b++) K[a][b] = (a === 0 || b === 0) ? 0 : (w[a - 1] > b ? K[a - 1][b] : Math.max(K[a - 1][b], v[a - 1] + K[a - 1][b - w[a - 1]])); }
      var cagri = 0; (function KN(i, ww) { cagri++; if (i === 0 || ww === 0) return; if (w[i - 1] > ww) KN(i - 1, ww); else { KN(i - 1, ww); KN(i - 1, ww - w[i - 1]); } })(n, W);
      var sec = [], ww = W; for (var t = n; t >= 1; t--) if (K[t][ww] !== K[t - 1][ww]) { sec.unshift(t); ww -= w[t - 1]; }
      var sat = [], sut = []; for (var s1 = 0; s1 <= n; s1++) sat.push(m("i=" + s1)); for (var s2 = 0; s2 <= W; s2++) sut.push(s2);
      var ri = R.int(2, n), rw = R.int(w[ri - 1], W);
      return {
        ad: "0-1 sırt çantası", tanim: "Kapasite " + m("W=" + W) + "; öğeler (" + m("w_i, v_i") + "): " + w.map(function (x, i) { return m("(" + x + "," + v[i] + ")"); }).join(", ") + ". Toplam ağırlık " + m("\\le W") + " olacak biçimde en büyük değer?",
        rek: kod("KNAP(i, w)", [[0, "if i == 0 or w == 0"], [1, "return 0"], [0, "if w_i > w"], [1, "return KNAP(i − 1, w)"], [0, "return max(KNAP(i − 1, w), v_i + KNAP(i − 1, w − w_i))"]]),
        dp: kod("KNAP-DP(n, W)", [[0, "let K[0 : n, 0 : W] be a new table"], [0, "for w = 0 to W"], [1, "K[0, w] = 0"], [0, "for i = 1 to n"], [1, "for w = 0 to W"], [2, "if w == 0 or w_i > w"], [3, "K[i, w] = K[i − 1, w]"], [2, "else K[i, w] = max(K[i − 1, w], v_i + K[i − 1, w − w_i])"], [0, "return K[n, W]"]]),
        param: "Parametreler " + m("(i, w)") + ": ilk " + m("i") + " öğe ve kalan kapasite ⇒ " + m("K[0:" + n + ", 0:" + W + "]") + ". " + m("K[i,\\cdot]") + " yalnızca " + m("K[i-1,\\cdot]") + "'e bağlı ⇒ satır satır.",
        tablo: tablo2(m("i \\backslash w"), sat, sut, K, 1),
        ornek: m("K[" + ri + "," + rw + "] = \\max(K[" + (ri - 1) + "," + rw + "],\\ " + v[ri - 1] + "+K[" + (ri - 1) + "," + (rw - w[ri - 1]) + "]) = \\max(" + K[ri - 1][rw] + ", " + (v[ri - 1] + K[ri - 1][rw - w[ri - 1]]) + ") = " + K[ri][rw]),
        cevap: "En büyük değer " + m(K[n][W]) + "; seçilen öğeler (geri izleme: " + m("K[i,w]\\ne K[i-1,w]") + " ise " + m("i") + " seçilmiştir): " + (sec.length ? sec.map(function (x) { return m(x); }).join(", ") : "yok") + ".",
        cagri: cagri, alt: (n + 1) * (W + 1),
        kar: "Özyinelemeli: en kötü " + m("O(2^n)") + "; DP: " + m("\\Theta(nW)") + " (sözde polinom).",
        c: "/* Kaynak: 0-1 sırt çantası, CLRS 4. bs. Al. 15.2-2 (3. bs. 16.2-2); vize hazırlık üreteci */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\nint32_t n = " + n + ", W = " + W + ";\nint32_t w[] = {0, " + w.join(", ") + "}, v[] = {0, " + v.join(", ") + "};\nint64_t cagri = 0;\n\nint32_t max(int32_t a, int32_t b) { return a > b ? a : b; }\n\nint32_t knap(int32_t i, int32_t c)\n{\n    cagri++;\n    if (i == 0 || c == 0) return 0;\n    if (w[i] > c) return knap(i - 1, c);\n    return max(knap(i - 1, c), v[i] + knap(i - 1, c - w[i]));\n}\n\nint32_t knap_dp(void)\n{\n    int32_t K[16][64] = {{0}};\n    for (int32_t i = 1; i <= n; i++)\n        for (int32_t c = 0; c <= W; c++)\n            K[i][c] = (c == 0 || w[i] > c) ? K[i - 1][c]\n                    : max(K[i - 1][c], v[i] + K[i - 1][c - w[i]]);\n    return K[n][W];\n}\n\nint main(void)\n{\n    int32_t r = knap(n, W);\n    printf(\"ozyinelemeli: %\" PRId32 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId32 \"\\n\", knap_dp());\n    return 0;\n}\n",
        kontrol: K[n][W]
      };
    },
    function lcs(R) {
      var abc = ["A", "B", "C", "D"].slice(0, R.int(3, 4)), m1 = R.int(5, 6), n1 = R.int(5, 6), X = "", Yy = "", C = [];
      for (var i = 0; i < m1; i++) X += R.pick(abc); for (var j = 0; j < n1; j++) Yy += R.pick(abc);
      for (var a = 0; a <= m1; a++) { C[a] = []; for (var b = 0; b <= n1; b++) C[a][b] = (a === 0 || b === 0) ? 0 : (X[a - 1] === Yy[b - 1] ? C[a - 1][b - 1] + 1 : Math.max(C[a - 1][b], C[a][b - 1])); }
      var cagri = 0; (function L(i, j) { cagri++; if (cagri > SINIR || i === 0 || j === 0) return; if (X[i - 1] === Yy[j - 1]) L(i - 1, j - 1); else { L(i - 1, j); L(i, j - 1); } })(m1, n1);
      var s = "", i2 = m1, j2 = n1; while (i2 > 0 && j2 > 0) { if (X[i2 - 1] === Yy[j2 - 1]) { s = X[i2 - 1] + s; i2--; j2--; } else if (C[i2 - 1][j2] >= C[i2][j2 - 1]) i2--; else j2--; }
      var sat = [m("\\epsilon")], sut = [m("\\epsilon")]; for (var t = 0; t < m1; t++) sat.push(m("x_" + (t + 1)) + "=" + X[t]); for (var u = 0; u < n1; u++) sut.push(m("y_" + (u + 1)) + "=" + Yy[u]);
      var ri = R.int(1, m1), rj = R.int(1, n1);
      var orn = X[ri - 1] === Yy[rj - 1] ? m("x_" + ri + "=y_" + rj + "=\\text{" + X[ri - 1] + "} \\Rightarrow c[" + ri + "," + rj + "]=c[" + (ri - 1) + "," + (rj - 1) + "]+1=" + C[ri][rj]) :
        m("x_" + ri + "\\ne y_" + rj + " \\Rightarrow c[" + ri + "," + rj + "]=\\max(c[" + (ri - 1) + "," + rj + "], c[" + ri + "," + (rj - 1) + "])=\\max(" + C[ri - 1][rj] + "," + C[ri][rj - 1] + ")=" + C[ri][rj]);
      return {
        ad: "En uzun ortak altdizi (LCS)", tanim: m("X=\\text{" + X + "}") + ", " + m("Y=\\text{" + Yy + "}") + ". En uzun ortak altdizinin uzunluğu ve bir örneği?",
        rek: kod("LCS-REC(i, j)", [[0, "if i == 0 or j == 0"], [1, "return 0"], [0, "if x_i == y_j"], [1, "return LCS-REC(i − 1, j − 1) + 1"], [0, "return max(LCS-REC(i − 1, j), LCS-REC(i, j − 1))"]]),
        dp: kod("LCS-LENGTH(X, Y, m, n)", [[0, "let c[0 : m, 0 : n] be a new table"], [0, "for i = 0 to m"], [1, "c[i, 0] = 0"], [0, "for j = 0 to n"], [1, "c[0, j] = 0"], [0, "for i = 1 to m"], [1, "for j = 1 to n"], [2, "if x_i == y_j"], [3, "c[i, j] = c[i − 1, j − 1] + 1"], [2, "else c[i, j] = max(c[i − 1, j], c[i, j − 1])"], [0, "return c[m, n]"]]),
        param: "Parametreler " + m("(i,j)") + " (önekler " + m("X_i, Y_j") + ") ⇒ " + m("c[0:" + m1 + ", 0:" + n1 + "]") + ". Hücre üst, sol ve sol-üst komşuya bağlı ⇒ satır satır.",
        tablo: tablo2(m("c[i,j]"), sat, sut, C, 1), ornek: orn,
        cevap: "LCS uzunluğu " + m(C[m1][n1]) + "; bir LCS: <strong>" + (s || "(boş)") + "</strong> (sağ alt köşeden geri izleme).",
        cagri: cagri > SINIR ? "> " + SINIR : cagri, alt: (m1 + 1) * (n1 + 1),
        kar: "Özyinelemeli: en kötü " + m("O(2^{m+n})") + "; DP (CLRS 14.4): " + m("\\Theta(mn)") + ".",
        c: "/* Kaynak: CLRS 4. bs. §14.4 (3. bs. §15.4), LCS-LENGTH; vize hazırlık üreteci */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n#include <string.h>\n\nconst char *X = \"" + X + "\", *Y = \"" + Yy + "\";\nint64_t cagri = 0;\n\nint32_t max(int32_t a, int32_t b) { return a > b ? a : b; }\n\nint32_t lcs(int32_t i, int32_t j)\n{\n    cagri++;\n    if (i == 0 || j == 0) return 0;\n    if (X[i - 1] == Y[j - 1]) return lcs(i - 1, j - 1) + 1;\n    return max(lcs(i - 1, j), lcs(i, j - 1));\n}\n\nint32_t lcs_dp(int32_t m, int32_t n)\n{\n    int32_t c[16][16] = {{0}};\n    for (int32_t i = 1; i <= m; i++)\n        for (int32_t j = 1; j <= n; j++)\n            c[i][j] = X[i - 1] == Y[j - 1] ? c[i - 1][j - 1] + 1\n                    : max(c[i - 1][j], c[i][j - 1]);\n    return c[m][n];\n}\n\nint main(void)\n{\n    int32_t m = strlen(X), n = strlen(Y);\n    int32_t r = lcs(m, n);\n    printf(\"ozyinelemeli: %\" PRId32 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId32 \"\\n\", lcs_dp(m, n));\n    return 0;\n}\n",
        kontrol: C[m1][n1]
      };
    },
    function cubuk(R) {
      var n = R.int(6, 8), p = [0];
      for (var i = 1; i <= n; i++) p[i] = Math.max(p[i - 1] + R.int(0, 2), R.int(i, Math.floor(2.6 * i)));
      var r = [0], s = [0];
      for (var j = 1; j <= n; j++) { var q = -1; for (var t = 1; t <= j; t++) if (p[t] + r[j - t] > q) { q = p[t] + r[j - t]; s[j] = t; } r[j] = q; }
      var cagri = Math.pow(2, n), parca = [], kk = n; while (kk > 0) { parca.push(s[kk]); kk -= s[kk]; }
      var k = R.int(2, n);
      var aday = []; for (var t2 = 1; t2 <= k; t2++) aday.push(p[t2] + r[k - t2]);
      return {
        ad: "Çubuk kesme (CLRS 14.1)", tanim: "Uzunluğu " + m(n) + " olan çubuk; fiyatlar " + m("p_1..p_{" + n + "}") + " = ⟨" + p.slice(1).join(", ") + "⟩. Kesip satarak en büyük gelir " + m("r_" + n) + "?",
        rek: kod("CUT-ROD(p, n)", [[0, "if n == 0"], [1, "return 0"], [0, "q = −∞"], [0, "for i = 1 to n"], [1, "q = max(q, p[i] + CUT-ROD(p, n − i))"], [0, "return q"]]),
        dp: kod("BOTTOM-UP-CUT-ROD(p, n)", [[0, "let r[0 : n] be a new array"], [0, "r[0] = 0"], [0, "for j = 1 to n"], [1, "q = −∞"], [1, "for i = 1 to j"], [2, "q = max(q, p[i] + r[j − i])"], [1, "r[j] = q"], [0, "return r[n]"]]),
        param: "Tek parametre: kalan uzunluk ⇒ " + m("r[0:" + n + "]") + ". " + m("r[j]") + " tüm " + m("r[j-i]") + " (" + m("i\\ge1") + ") hücrelerine bağlı ⇒ artan " + m("j") + ".",
        tablo: tablo1("r", n, r, 1),
        ornek: m("r[" + k + "] = \\max_{1\\le i\\le " + k + "}(p_i + r[" + k + "-i]) = \\max(" + aday.join(",") + ") = " + r[k]),
        cevap: m("r_{" + n + "} = " + r[n]) + "; parçalar (her adımda en iyi ilk kesim " + m("s[j]") + " izlenerek): " + parca.join(" + ") + ".",
        cagri: cagri, alt: n + 1,
        kar: "CUT-ROD tam " + m("2^n") + " çağrı yapar (CLRS); DP: " + m("\\Theta(n^2)") + ".",
        c: "/* Kaynak: CLRS 4. bs. §14.1 (3. bs. §15.1), CUT-ROD; vize hazırlık üreteci */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\nint32_t p[] = {0, " + p.slice(1).join(", ") + "};\nint64_t cagri = 0;\n\nint32_t cut_rod(int32_t n)\n{\n    cagri++;\n    if (n == 0) return 0;\n    int32_t q = -1;\n    for (int32_t i = 1; i <= n; i++) {\n        int32_t t = p[i] + cut_rod(n - i);\n        if (t > q) q = t;\n    }\n    return q;\n}\n\nint32_t bottom_up(int32_t n)\n{\n    int32_t r[32] = {0};\n    for (int32_t j = 1; j <= n; j++) {\n        int32_t q = -1;\n        for (int32_t i = 1; i <= j; i++)\n            if (p[i] + r[j - i] > q) q = p[i] + r[j - i];\n        r[j] = q;\n    }\n    return r[n];\n}\n\nint main(void)\n{\n    int32_t n = " + n + ";\n    int32_t r = cut_rod(n);\n    printf(\"ozyinelemeli: %\" PRId32 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId32 \"\\n\", bottom_up(n));\n    return 0;\n}\n",
        kontrol: r[n]
      };
    },
    function madeniPara(R) {
      var a = R.int(3, 5), b = R.int(a + 2, 9), S = [1, a, b], N = R.int(10, 15), INF = 1e9, d = [0];
      for (var v = 1; v <= N; v++) { d[v] = INF; S.forEach(function (c) { if (c <= v && d[v - c] + 1 < d[v]) d[v] = d[v - c] + 1; }); }
      var cagri = 0; (function MC(v) { cagri++; if (cagri > SINIR || v === 0) return; S.forEach(function (c) { if (c <= v) MC(v - c); }); })(N);
      var k = R.int(b, N);
      var parca = [], vv = N; while (vv > 0) { for (var t = S.length - 1; t >= 0; t--) if (S[t] <= vv && d[vv - S[t]] === d[vv] - 1) { parca.push(S[t]); vv -= S[t]; break; } }
      return {
        ad: "En az madeni para", tanim: "Bozuk para değerleri " + m("\\{1, " + a + ", " + b + "\\}") + ". " + m(N) + " tutarını <strong>en az</strong> kaç parayla öderiz?",
        rek: kod("MIN-COINS(v)", [[0, "if v == 0"], [1, "return 0"], [0, "best = ∞"], [0, "for each c in {1, " + a + ", " + b + "}"], [1, "if c ≤ v"], [2, "best = min(best, 1 + MIN-COINS(v − c))"], [0, "return best"]]),
        dp: kod("MIN-COINS-DP(N)", [[0, "let d[0 : N] be a new array"], [0, "d[0] = 0"], [0, "for v = 1 to N"], [1, "d[v] = ∞"], [1, "for each c in {1, " + a + ", " + b + "}"], [2, "if c ≤ v"], [3, "d[v] = min(d[v], 1 + d[v − c])"], [0, "return d[N]"]]),
        param: "Tek parametre (kalan tutar) ⇒ " + m("d[0:" + N + "]") + "; artan " + m("v") + ".",
        tablo: tablo1("d", N, d, 1),
        ornek: m("d[" + k + "] = 1+\\min(" + S.filter(function (c) { return c <= k; }).map(function (c) { return "d[" + (k - c) + "]"; }).join(",") + ") = 1+\\min(" + S.filter(function (c) { return c <= k; }).map(function (c) { return d[k - c]; }).join(",") + ") = " + d[k]),
        cevap: m("d[" + N + "] = " + d[N]) + " para: " + parca.join(" + ") + "." + (function () { var g = 0, x = N, gr = []; [b, a, 1].forEach(function (c) { while (x >= c) { x -= c; g++; gr.push(c); } }); return g > d[N] ? ' <span class="vurgu">Açgözlü (en büyük önce) ' + g + " para verirdi (" + gr.join("+") + ") — açgözlü burada optimal değil!</span>" : ""; })(),
        cagri: cagri > SINIR ? "> " + SINIR : cagri, alt: N + 1,
        kar: "Özyinelemeli: üstel; DP: " + m("\\Theta(N\\cdot k)") + ", " + m("k") + " para türü sayısı.",
        c: "/* Ek örnek (kitapta yok): vize hazırlık üreteci, en az madeni para */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\nint32_t S[] = {1, " + a + ", " + b + "};\nint64_t cagri = 0;\n\nint32_t min_coins(int32_t v)\n{\n    cagri++;\n    if (v == 0) return 0;\n    int32_t best = 1000000;\n    for (int32_t t = 0; t < 3; t++)\n        if (S[t] <= v) {\n            int32_t x = 1 + min_coins(v - S[t]);\n            if (x < best) best = x;\n        }\n    return best;\n}\n\nint32_t min_coins_dp(int32_t N)\n{\n    int32_t d[64];\n    d[0] = 0;\n    for (int32_t v = 1; v <= N; v++) {\n        d[v] = 1000000;\n        for (int32_t t = 0; t < 3; t++)\n            if (S[t] <= v && 1 + d[v - S[t]] < d[v]) d[v] = 1 + d[v - S[t]];\n    }\n    return d[N];\n}\n\nint main(void)\n{\n    int32_t N = " + N + ";\n    int32_t r = min_coins(N);\n    printf(\"ozyinelemeli: %\" PRId32 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId32 \"\\n\", min_coins_dp(N));\n    return 0;\n}\n",
        kontrol: d[N]
      };
    },
    function minYol(R) {
      var r = 4, c = R.int(4, 5), A = [], Mm = [];
      for (var i = 0; i < r; i++) { A[i] = []; for (var j = 0; j < c; j++) A[i][j] = R.int(1, 9); }
      for (var i2 = 0; i2 < r; i2++) { Mm[i2] = []; for (var j2 = 0; j2 < c; j2++) Mm[i2][j2] = A[i2][j2] + (i2 === 0 && j2 === 0 ? 0 : Math.min(i2 ? Mm[i2 - 1][j2] : Infinity, j2 ? Mm[i2][j2 - 1] : Infinity)); }
      var cagri = 0; (function P(i, j) { cagri++; if (i === 0 && j === 0) return; if (i > 0) P(i - 1, j); if (j > 0) P(i, j - 1); })(r - 1, c - 1);
      var sat = [], sut = []; for (var s1 = 0; s1 < r; s1++) sat.push(m("i=" + (s1 + 1))); for (var s2 = 0; s2 < c; s2++) sut.push(m("j=" + (s2 + 1)));
      var ri = R.int(1, r - 1), rj = R.int(1, c - 1);
      return {
        ad: "Izgarada en ucuz yol", tanim: "Maliyet ızgarası (sağa/aşağı hareket; uğranan hücrelerin toplamı en az olsun):" + tablo([""].concat(sut), A.map(function (row, i) { return [sat[i]].concat(row); }), "kucuk-tablo"),
        rek: kod("MINPATH(i, j)", [[0, "if i == 1 and j == 1"], [1, "return a[1, 1]"], [0, "if i == 1"], [1, "return a[1, j] + MINPATH(1, j − 1)"], [0, "if j == 1"], [1, "return a[i, 1] + MINPATH(i − 1, 1)"], [0, "return a[i, j] + min(MINPATH(i − 1, j), MINPATH(i, j − 1))"]]),
        dp: kod("MINPATH-DP(r, c)", [[0, "let M[1 : r, 1 : c] be a new table"], [0, "for i = 1 to r"], [1, "for j = 1 to c"], [2, "if i == 1 and j == 1"], [3, "M[i, j] = a[1, 1]"], [2, "elseif i == 1"], [3, "M[i, j] = a[i, j] + M[i, j − 1]"], [2, "elseif j == 1"], [3, "M[i, j] = a[i, j] + M[i − 1, j]"], [2, "else M[i, j] = a[i, j] + min(M[i − 1, j], M[i, j − 1])"], [0, "return M[r, c]"]]),
        param: "İki parametre " + m("(i,j)") + " ⇒ " + m("M[1:" + r + ", 1:" + c + "]") + "; satır satır, soldan sağa.",
        tablo: tablo2(m("M[i,j]"), sat, sut, Mm, 0),
        ornek: m("M[" + (ri + 1) + "," + (rj + 1) + "] = a[" + (ri + 1) + "," + (rj + 1) + "] + \\min(M[" + ri + "," + (rj + 1) + "], M[" + (ri + 1) + "," + rj + "]) = " + A[ri][rj] + "+\\min(" + Mm[ri - 1][rj] + "," + Mm[ri][rj - 1] + ") = " + Mm[ri][rj]),
        cevap: "En ucuz yolun maliyeti " + m(Mm[r - 1][c - 1]) + ".", cagri: cagri, alt: r * c,
        kar: "Özyinelemeli: üstel; DP: " + m("\\Theta(rc)") + ".",
        c: "/* Ek örnek (kitapta yok): vize hazırlık üreteci, ızgarada en ucuz yol */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\n#define R " + r + "\n#define C " + c + "\nint32_t a[R][C] = {" + A.map(function (row) { return "{" + row.join(", ") + "}"; }).join(", ") + "};\nint64_t cagri = 0;\n\nint32_t min(int32_t x, int32_t y) { return x < y ? x : y; }\n\nint32_t minpath(int32_t i, int32_t j)       /* 0-tabanlı */\n{\n    cagri++;\n    if (i == 0 && j == 0) return a[0][0];\n    if (i == 0) return a[0][j] + minpath(0, j - 1);\n    if (j == 0) return a[i][0] + minpath(i - 1, 0);\n    return a[i][j] + min(minpath(i - 1, j), minpath(i, j - 1));\n}\n\nint32_t minpath_dp(void)\n{\n    int32_t M[R][C];\n    for (int32_t i = 0; i < R; i++)\n        for (int32_t j = 0; j < C; j++)\n            if (i == 0 && j == 0) M[i][j] = a[0][0];\n            else if (i == 0) M[i][j] = a[i][j] + M[i][j - 1];\n            else if (j == 0) M[i][j] = a[i][j] + M[i - 1][j];\n            else M[i][j] = a[i][j] + min(M[i - 1][j], M[i][j - 1]);\n    return M[R - 1][C - 1];\n}\n\nint main(void)\n{\n    int32_t r = minpath(R - 1, C - 1);\n    printf(\"ozyinelemeli: %\" PRId32 \" (%\" PRId64 \" cagri)\\n\", r, cagri);\n    printf(\"DP          : %\" PRId32 \"\\n\", minpath_dp());\n    return 0;\n}\n",
        kontrol: Mm[r - 1][c - 1]
      };
    }
  ];

  function uretDP(R) {
    var t = R.pick(TURLER)(R);
    var soru = '<p><strong>' + t.ad + "</strong></p><p>" + t.tanim + "</p>" + t.rek +
      '<div class="kutu soru"><span class="kutu-baslik">Görev</span>Bu özyinelemeli yordamı <strong>doğrudan</strong> aşağıdan yukarı bir dinamik programlama algoritmasına çevirin, tabloyu doldurun ve sonucu bulun.</div>';
    var c = adim("Neden DP? Örtüşen alt problemler", "Bu girdi için özyinelemeli yordam <strong>" + t.cagri + "</strong> çağrı yapar, oysa yalnızca <strong>" + t.alt + "</strong> farklı alt problem vardır. Aynı alt problemler defalarca çözülüyor.");
    c += adim("Alt problem ve tablo", "<p>" + t.param + "</p>");
    c += adim("Doğrudan dönüşüm kuralı", donusumKurali());
    c += adim("DP yalancı kodu", t.dp);
    c += adim("Tabloyu doldur (her tıklama bir adım)", t.tablo);
    c += adim("Örnek hücre", "<p>" + t.ornek + "</p>");
    c += adim("Sonuç", '<div class="kutu teorem">' + t.cevap + "</div>");
    c += adim("Karmaşıklık", "<p>" + t.kar + "</p>");
    c += adim("C ile deneyin (özyinelemeli ve DP)", Y.cEditor("dp.c", t.c, "", 320));
    return { soru: soru, cozum: c, baslik: t.ad, kontrol: t.kontrol, cKod: t.c };
  }

  /* ======================= 7. ALGORİTMA İZLEME ======================= */
  function uretIzleme(R) {
    var tur = R.pick(["PARTITION", "BUILD-MAX-HEAP", "MERGE", "INSERTION-SORT"]), soru, c = "", satirlar = [];
    function tr(hucreler) { return '<tr class="fragment">' + hucreler.map(function (h) { return "<td>" + h + "</td>"; }).join("") + "</tr>"; }
    function tbl(bas, govde) { return '<table class="vize-tablo kucuk-tablo"><tr>' + bas.map(function (b) { return "<th>" + b + "</th>"; }).join("") + "</tr>" + govde + "</table>"; }
    if (tur === "PARTITION") {
      var A = R.distinct(R.int(7, 8), 1, 40), a = A.slice(), r = a.length - 1, x = a[r], i = -1, g = "";
      soru = kod("PARTITION(A, p, r)", [[0, "x = A[r]"], [0, "i = p − 1"], [0, "for j = p to r − 1"], [1, "if A[j] ≤ x"], [2, "i = i + 1"], [2, "exchange A[i] with A[j]"], [0, "exchange A[i + 1] with A[r]"], [0, "return i + 1"]]) +
        '<div class="kutu soru"><span class="kutu-baslik">Görev</span>' + m("A=\\langle " + A.join(", ") + "\\rangle") + ", " + m("p=1, r=" + A.length) + " için PARTITION'ı adım adım izleyin.</div>";
      for (var j = 0; j < r; j++) {
        var not = a[j] <= x ? m(a[j] + "\\le" + x) + ": " + m("i=" + (i + 2)) + ", takas " + m("A[" + (i + 2) + "]\\leftrightarrow A[" + (j + 1) + "]") : m(a[j] + ">" + x) + ": değişiklik yok";
        if (a[j] <= x) { i++; var t = a[i]; a[i] = a[j]; a[j] = t; }
        var v = {}; for (var k = 0; k <= i; k++) v[k] = "v-sirali"; for (var k2 = i + 1; k2 <= j; k2++) v[k2] = "v-buyuk"; v[r] = "v-pivot";
        g += tr([m("j=" + (j + 1)), not, Y.dizi(a, v)]);
      }
      var t2 = a[i + 1]; a[i + 1] = a[r]; a[r] = t2;
      var v2 = {}; for (var k3 = 0; k3 < a.length; k3++) v2[k3] = k3 < i + 1 ? "v-sirali" : k3 === i + 1 ? "v-pivot" : "v-buyuk";
      g += tr(["7. satır", "pivotu yerine koy: " + m("q=" + (i + 2)), Y.dizi(a, v2)]);
      c += adim("Pivot", m("x = A[r] = " + x) + ". Yeşil: " + m("\\le x") + " bölgesi, kırmızı: " + m("> x") + " bölgesi.");
      c += adim("İzleme", tbl(["j", "işlem", "A"], g));
      c += adim("Sonuç", m("q = " + (i + 2)) + "; " + m("A[1:" + (i + 1) + "] \\le " + x + " < A[" + (i + 3) + ":" + a.length + "]") + ".");
    } else if (tur === "BUILD-MAX-HEAP") {
      var B = R.distinct(R.int(7, 9), 1, 40), b = B.slice(), n = b.length, g2 = "";
      soru = kod("BUILD-MAX-HEAP(A, n)", [[0, "A.heap-size = n"], [0, "for i = ⌊n/2⌋ downto 1"], [1, "MAX-HEAPIFY(A, i)"]]) +
        kod("MAX-HEAPIFY(A, i)", [[0, "l = LEFT(i); r = RIGHT(i)"], [0, "if l ≤ A.heap-size and A[l] > A[i]"], [1, "largest = l"], [0, "else largest = i"], [0, "if r ≤ A.heap-size and A[r] > A[largest]"], [1, "largest = r"], [0, "if largest ≠ i"], [1, "exchange A[i] with A[largest]"], [1, "MAX-HEAPIFY(A, largest)"]]) +
        '<div class="kutu soru"><span class="kutu-baslik">Görev</span>' + m("A=\\langle " + B.join(", ") + "\\rangle") + " üzerinde BUILD-MAX-HEAP'i izleyin.</div>";
      for (var ii = Math.floor(n / 2); ii >= 1; ii--) {
        var takas = [], cur = ii;
        while (true) {
          var l = 2 * cur, rr = 2 * cur + 1, lg = cur;
          if (l <= n && b[l - 1] > b[lg - 1]) lg = l; if (rr <= n && b[rr - 1] > b[lg - 1]) lg = rr;
          if (lg === cur) break;
          takas.push(m("A[" + cur + "]\\leftrightarrow A[" + lg + "]")); var t3 = b[cur - 1]; b[cur - 1] = b[lg - 1]; b[lg - 1] = t3; cur = lg;
        }
        var v3 = {}; v3[ii - 1] = "v-pivot";
        g2 += tr([m("i=" + ii), takas.length ? takas.join(", ") : "takas yok", Y.dizi(b, v3)]);
      }
      c += adim("Başlangıç", "Yapraklar (" + m("i > \\lfloor n/2\\rfloor = " + Math.floor(n / 2)) + ") zaten tek elemanlı yığınlardır; " + m("i=" + Math.floor(n / 2)) + "'den 1'e iniyoruz.");
      c += adim("İzleme", tbl(["i", "MAX-HEAPIFY takasları", "A (turuncu: i)"], g2));
      var ok = true; for (var q = 2; q <= n; q++) if (b[Math.floor(q / 2) - 1] < b[q - 1]) ok = false;
      if (!ok) V.hatalar.push("heap izleme hatası");
      c += adim("Sonuç ve denetim", m("\\langle " + b.join(", ") + "\\rangle") + ": her " + m("i \\ge 2") + " için " + m("A[\\mathrm{PARENT}(i)] \\ge A[i]") + " ✓ (max-yığın).");
    } else if (tur === "MERGE") {
      var L = R.distinct(R.int(3, 4), 1, 40).sort(function (p, q2) { return p - q2; }), Rr = R.distinct(R.int(3, 4), 1, 40).sort(function (p, q2) { return p - q2; });
      soru = kod("MERGE(A, p, q, r)", [[0, "// L = A[p : q], R = A[q + 1 : r] kopyalanmıştır"], [0, "i = 1; j = 1; k = p"], [0, "while i ≤ n_L and j ≤ n_R"], [1, "if L[i] ≤ R[j]"], [2, "A[k] = L[i]; i = i + 1"], [1, "else A[k] = R[j]; j = j + 1"], [1, "k = k + 1"], [0, "kalan elemanları kopyala"]]) +
        '<div class="kutu soru"><span class="kutu-baslik">Görev</span>' + m("L=\\langle " + L.join(", ") + "\\rangle") + " ve " + m("R=\\langle " + Rr.join(", ") + "\\rangle") + " dizilerini MERGE ile birleştirin.</div>";
      var ia = 0, ja = 0, out = [], g3 = "";
      while (ia < L.length && ja < Rr.length) {
        if (L[ia] <= Rr[ja]) { g3 += tr([m("k=" + (out.length + 1)), m("L[" + (ia + 1) + "]=" + L[ia] + "\\le R[" + (ja + 1) + "]=" + Rr[ja]), m(L[ia])]); out.push(L[ia++]); }
        else { g3 += tr([m("k=" + (out.length + 1)), m("L[" + (ia + 1) + "]=" + L[ia] + "> R[" + (ja + 1) + "]=" + Rr[ja]), m(Rr[ja])]); out.push(Rr[ja++]); }
      }
      while (ia < L.length) { g3 += tr([m("k=" + (out.length + 1)), "R bitti, L'den kopyala", m(L[ia])]); out.push(L[ia++]); }
      while (ja < Rr.length) { g3 += tr([m("k=" + (out.length + 1)), "L bitti, R'den kopyala", m(Rr[ja])]); out.push(Rr[ja++]); }
      c += adim("İzleme", tbl(["k", "karşılaştırma", "A[k]"], g3));
      c += adim("Sonuç", m("A=\\langle " + out.join(", ") + "\\rangle") + "; en çok " + m("n_L+n_R-1") + " karşılaştırma.");
    } else {
      var D = R.distinct(R.int(6, 7), 1, 40), d = D.slice(), g4 = "";
      soru = kod("INSERTION-SORT(A, n)", [[0, "for i = 2 to n"], [1, "key = A[i]"], [1, "j = i − 1"], [1, "while j > 0 and A[j] > key"], [2, "A[j + 1] = A[j]"], [2, "j = j − 1"], [1, "A[j + 1] = key"]]) +
        '<div class="kutu soru"><span class="kutu-baslik">Görev</span>' + m("A=\\langle " + D.join(", ") + "\\rangle") + " üzerinde INSERTION-SORT'u izleyin; her turda kaç kaydırma yapıldığını yazın.</div>";
      var top = 0;
      for (var i4 = 1; i4 < d.length; i4++) {
        var key = d[i4], j4 = i4 - 1, kay = 0; while (j4 >= 0 && d[j4] > key) { d[j4 + 1] = d[j4]; j4--; kay++; } d[j4 + 1] = key; top += kay;
        var v4 = {}; for (var t4 = 0; t4 <= i4; t4++) v4[t4] = "v-sirali"; v4[j4 + 1] = "v-pivot";
        g4 += tr([m("i=" + (i4 + 1)), m("key=" + key), m(kay), Y.dizi(d, v4)]);
      }
      c += adim("İzleme", tbl(["i", "key", "kaydırma", "A (turuncu: key'in yeri)"], g4));
      c += adim("Sonuç", "Toplam kaydırma " + m(top) + " = dizideki <strong>ters çift</strong> sayısı (her kaydırma bir ters çifti düzeltir).");
    }
    return { soru: soru, cozum: c, baslik: tur };
  }

  V.uretec.dp = uretDP;
  V.uretec.izleme = uretIzleme;
  V._dpTurler = TURLER;
})();

