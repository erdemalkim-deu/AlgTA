/* Vize hazırlık — analiz üreteçleri: döngü sayımı, özyinelemeli karmaşıklık, tümevarım, asimptotik sıralama */
(function () {
  "use strict";
  var V = window.VIZE, Y = V._yard, m = Y.m, M = Y.M, kod = Y.kod, adim = Y.adim, tablo = Y.tablo, Fr = Y.Fr;

  function ilog(n, c) { var k = 0, p = 1; while (p * c <= n) { p *= c; k++; } return k; }   // ⌊log_c n⌋ (n ≥ 1)
  function ns(s) { return s === 0 ? "n" : "n-" + s; }
  function kapaliDogrula(sablon, nler) {     // simülasyon ile formülü karşılaştır
    var satir = [], hata = false;
    nler.forEach(function (n) {
      var a = sablon.say(n), b = sablon.f(n);
      if (Math.abs(a - b) > 1e-9 * Math.max(1, Math.abs(a))) hata = true;
      satir.push([m(n), m(a), m(b), a === b ? "✓" : (Math.abs(a - b) < 1e-6 ? "✓" : "✗")]);
    });
    if (hata) V.hatalar.push("döngü: " + sablon.ad + " formül ≠ simülasyon");
    return tablo(["n", "sayım (çalıştırarak)", "kapalı form", ""], satir, "kucuk-tablo");
  }
  function cSayim(ad, govde, formulC, nler, yardim) {
    return "/* Ek örnek (kitapta yok): vize hazırlık üreteci, döngü sayımı */\n#include <stdio.h>\n#include <math.h>\n#include <stdint.h>\n#include <inttypes.h>\n\n" + (yardim || "") +
      "/* x = x + 1 satırının kaç kez çalıştığını sayar */\nint64_t say(int64_t n)\n{\n    int64_t x = 0;\n" + govde + "    return x;\n}\n\n" +
      "int main(void)\n{\n    int64_t nler[] = {" + nler.join(", ") + "};\n" +
      "    printf(\"%8s %14s %14s\\n\", \"n\", \"sayim\", \"kapali form\");\n" +
      "    for (int32_t t = 0; t < " + nler.length + "; t++) {\n        int64_t n = nler[t];\n" +
      "        printf(\"%8\" PRId64 \" %14\" PRId64 \" %14.0f\\n\", n, say(n), (double)(" + formulC + "));\n    }\n    return 0;\n}\n";
  }
  var ILOG_C = "int64_t ilog(int64_t n, int64_t c)   /* floor(log_c n) */\n{\n    int64_t k = 0, p = 1;\n    while (p * c <= n) { p *= c; k++; }\n    return k;\n}\n\n";

  /* ======================= 2. DÖNGÜLÜ KOD: KAPALI FORM VE Θ ======================= */
  var DONGU = [
    function (R) {           // iki iç içe, kaydırılmış başlangıç
      var s = R.int(0, 2), js = s === 0 ? "i" : "i + " + s;
      return {
        ad: "iki iç içe döngü", kod: [[0, "x = 0"], [0, "for i = 1 to n"], [1, "for j = " + js + " to n"], [2, "x = x + 1"]],
        say: function (n) { var x = 0; for (var i = 1; i <= n; i++) for (var j = i + s; j <= n; j++) x++; return x; },
        f: function (n) { return n < s ? 0 : (n - s) * (n - s + 1) / 2; },
        fTex: s === 0 ? "\\frac{n(n+1)}{2}" : "\\frac{(" + ns(s) + ")(" + ns(s - 1).replace("n-0", "n") + ")}{2}",
        theta: "\\Theta(n^2)",
        adimlar: [
          ["Sayımı toplam olarak yaz", M("C(n)=\\sum_{i=1}^{n}\\ \\sum_{j=" + js.replace(" + ", "+") + "}^{n} 1")],
          ["İç toplam", "Sabit " + m("i") + " için iç döngü " + m("j=" + js.replace(" + ", "+")) + "'den " + m("n") + "'ye: " + m("\\max(0,\\ n-i" + (s ? "-" + s : "") + "+1)") + " kez." + (s ? " Bu yalnızca " + m("i \\le " + ns(s)) + " için pozitiftir." : "")],
          ["Dış toplam", M("C(n)=\\sum_{i=1}^{" + ns(s) + "}(" + ns(s) + "-i+1)=\\sum_{t=1}^{" + ns(s) + "} t=" + (s === 0 ? "\\frac{n(n+1)}{2}" : "\\frac{(" + ns(s) + ")(" + (s === 1 ? "n" : "n-" + (s - 1)) + ")}{2}")) + '<p class="kucuk">' + m("t = " + ns(s) + "-i+1") + " değişken değişimi; aritmetik seri.</p>"]
        ],
        nler: [s + 1, 5, 10, 20, 50], cGovde: "    for (int64_t i = 1; i <= n; i++)\n        for (int64_t j = i" + (s ? " + " + s : "") + "; j <= n; j++)\n            x = x + 1;\n",
        cF: "n < " + s + " ? 0 : (n - " + s + ") * (n - " + s + " + 1) / 2"
      };
    },
    function (R) {           // üç iç içe
      var v = R.int(0, 1), kb = v === 0 ? "j" : "i";
      return {
        ad: "üç iç içe döngü", kod: [[0, "x = 0"], [0, "for i = 1 to n"], [1, "for j = 1 to i"], [2, "for k = 1 to " + kb], [3, "x = x + 1"]],
        say: function (n) { var x = 0; for (var i = 1; i <= n; i++) for (var j = 1; j <= i; j++) for (var k = 1; k <= (v ? i : j); k++) x++; return x; },
        f: function (n) { return v === 0 ? n * (n + 1) * (n + 2) / 6 : n * (n + 1) * (2 * n + 1) / 6; },
        fTex: v === 0 ? "\\frac{n(n+1)(n+2)}{6}" : "\\frac{n(n+1)(2n+1)}{6}", theta: "\\Theta(n^3)",
        adimlar: [
          ["Sayımı toplam olarak yaz", M("C(n)=\\sum_{i=1}^{n}\\sum_{j=1}^{i}\\sum_{k=1}^{" + kb + "} 1")],
          ["En içteki toplam", M("\\sum_{k=1}^{" + kb + "}1=" + kb)],
          ["Ortadaki toplam", v === 0 ? M("\\sum_{j=1}^{i} j = \\frac{i(i+1)}{2}") : M("\\sum_{j=1}^{i} i = i^2")],
          ["Dış toplam", v === 0 ? M("C(n)=\\frac12\\sum_{i=1}^{n}(i^2+i)=\\frac12\\Big(\\frac{n(n+1)(2n+1)}{6}+\\frac{n(n+1)}{2}\\Big)=\\frac{n(n+1)(n+2)}{6}") : M("C(n)=\\sum_{i=1}^{n} i^2=\\frac{n(n+1)(2n+1)}{6}")]
        ],
        nler: [1, 3, 6, 10, 30], cGovde: "    for (int64_t i = 1; i <= n; i++)\n        for (int64_t j = 1; j <= i; j++)\n            for (int64_t k = 1; k <= " + kb + "; k++)\n                x = x + 1;\n",
        cF: v === 0 ? "n * (n + 1) * (n + 2) / 6" : "n * (n + 1) * (2 * n + 1) / 6"
      };
    },
    function (R) {           // çarpımsal while
      var c = R.int(2, 4), mm = R.int(1, 4), satir = [[0, "x = 0"], [0, "i = 1"], [0, "while i ≤ n"]];
      if (mm > 1) { satir.push([1, "for j = 1 to " + mm]); satir.push([2, "x = x + 1"]); } else satir.push([1, "x = x + 1"]);
      satir.push([1, "i = " + c + " · i"]);
      var K = mm > 1 ? mm : "";
      return {
        ad: "çarpımsal artan sayaç", kod: satir,
        say: function (n) { var x = 0, i = 1; while (i <= n) { for (var j = 1; j <= mm; j++) x++; i *= c; } return x; },
        f: function (n) { return mm * (ilog(n, c) + 1); },
        fTex: K + (K ? "\\left(" : "") + "\\lfloor \\log_{" + c + "} n\\rfloor+1" + (K ? "\\right)" : ""), theta: "\\Theta(\\lg n)",
        adimlar: [
          ["Sayacın değerleri", m("t") + " turdan sonra " + m("i = " + c + "^t") + ". Döngü " + m(c + "^t \\le n") + " olduğu sürece döner."],
          ["Tur sayısı", m(c + "^t \\le n \\iff t \\le \\log_{" + c + "} n") + "; " + m("t = 0, 1, \\dots, \\lfloor \\log_{" + c + "} n\\rfloor") + " ⇒ " + m("\\lfloor \\log_{" + c + "} n\\rfloor + 1") + " tur."],
          ["Kapalı form", (mm > 1 ? "Her turda iç döngü " + m(mm) + " kez: " : "") + M("C(n)=" + K + (K ? "\\left(" : "") + "\\lfloor \\log_{" + c + "} n\\rfloor+1" + (K ? "\\right)" : "")) + '<p class="kucuk">' + m("\\log_{" + c + "} n = \\lg n/\\lg " + c) + ": taban yalnızca sabit çarpan.</p>"]
        ],
        nler: [1, c, c * c - 1, Math.pow(c, 3), 1000], cGovde: "    int64_t i = 1;\n    while (i <= n) {\n" + (mm > 1 ? "        for (int32_t j = 1; j <= " + mm + "; j++)\n            x = x + 1;\n" : "        x = x + 1;\n") + "        i = " + c + " * i;\n    }\n",
        cF: mm + " * (ilog(n, " + c + ") + 1)", yardim: ILOG_C
      };
    },
    function (R) {           // dış for, iç çarpımsal while
      var c = R.int(2, 3), ust = R.pick(["n", "i"]);
      return {
        ad: "doğrusal × logaritmik", kod: [[0, "x = 0"], [0, "for i = 1 to n"], [1, "j = 1"], [1, "while j ≤ " + ust], [2, "x = x + 1"], [2, "j = " + c + " · j"]],
        say: function (n) { var x = 0; for (var i = 1; i <= n; i++) { var j = 1; while (j <= (ust === "n" ? n : i)) { x++; j *= c; } } return x; },
        f: function (n) { var k = ilog(n, c); return ust === "n" ? n * (k + 1) : n + k * (n + 1) - (Math.pow(c, k + 1) - c) / (c - 1); },
        fTex: ust === "n" ? "n\\left(\\lfloor\\log_{" + c + "} n\\rfloor+1\\right)" : "n + k(n+1) - \\frac{" + c + "^{k+1}-" + c + "}{" + (c - 1) + "},\\ k=\\lfloor\\log_{" + c + "} n\\rfloor",
        theta: "\\Theta(n\\lg n)",
        adimlar: ust === "n" ? [
          ["İç döngü", "İç döngü " + m("i") + "'den bağımsızdır: " + m("\\lfloor \\log_{" + c + "} n\\rfloor + 1") + " tur (çarpımsal sayaç)."],
          ["Toplam", M("C(n)=\\sum_{i=1}^{n}\\left(\\lfloor\\log_{" + c + "} n\\rfloor+1\\right)=n\\left(\\lfloor\\log_{" + c + "} n\\rfloor+1\\right)")]
        ] : [
          ["İç döngü", "Sabit " + m("i") + " için iç döngü " + m("\\lfloor \\log_{" + c + "} i\\rfloor + 1") + " kez döner."],
          ["Toplamı yaz", M("C(n)=\\sum_{i=1}^{n}\\left(\\lfloor\\log_{" + c + "} i\\rfloor+1\\right) = n + \\sum_{i=1}^{n}\\lfloor\\log_{" + c + "} i\\rfloor")],
          ["Sayma hilesi", m("k=\\lfloor\\log_{" + c + "} n\\rfloor") + ". " + m("\\lfloor\\log_{" + c + "} i\\rfloor = \\sum_{t=1}^{k}[\\,i \\ge " + c + "^t\\,]") + " olduğundan sırayı değiştirelim: " + M("\\sum_{i=1}^{n}\\lfloor\\log_{" + c + "} i\\rfloor=\\sum_{t=1}^{k}(n-" + c + "^t+1)=k(n+1)-\\frac{" + c + "^{k+1}-" + c + "}{" + (c - 1) + "}")],
          ["Θ", m(c + "^{k} \\le n") + " olduğundan çıkan terim " + m("O(n)") + "; baskın terim " + m("k\\,n = \\Theta(n\\lg n)") + "."]
        ],
        nler: [1, 5, 10, 27, 100], cGovde: "    for (int64_t i = 1; i <= n; i++) {\n        int64_t j = 1;\n        while (j <= " + ust + ") {\n            x = x + 1;\n            j = " + c + " * j;\n        }\n    }\n",
        cF: ust === "n" ? "n * (ilog(n, " + c + ") + 1)" : "n + ilog(n, " + c + ") * (n + 1) - (pow(" + c + ", ilog(n, " + c + ") + 1) - " + c + ") / " + (c - 1), yardim: ILOG_C
      };
    },
    function (R) {           // yarılanan dış, doğrusal iç
      var c = R.int(2, 3);
      return {
        ad: "geometrik azalan iş", kod: [[0, "x = 0"], [0, "i = n"], [0, "while i ≥ 1"], [1, "for j = 1 to i"], [2, "x = x + 1"], [1, "i = ⌊i / " + c + "⌋"]],
        say: function (n) { var x = 0, i = n; while (i >= 1) { x += i; i = Math.floor(i / c); } return x; },
        f: function (n) { return (c * n - 1) / (c - 1); }, nKuvvet: c,
        fTex: "\\frac{" + c + "n-1}{" + (c - 1) + "}\\quad(n = " + c + "^k)", theta: "\\Theta(n)",
        adimlar: [
          ["İç döngünün sayıları", m("i") + " sırasıyla " + m("n, \\lfloor n/" + c + "\\rfloor, \\lfloor n/" + c + "^2\\rfloor, \\dots, 1") + " değerlerini alır; her turda iç döngü " + m("i") + " kez döner."],
          ["Toplam", m("n=" + c + "^k") + " için " + M("C(n)=\\sum_{t=0}^{k}\\frac{n}{" + c + "^t}=n\\cdot\\frac{1-(1/" + c + ")^{k+1}}{1-1/" + c + "}=\\frac{" + c + "n-1}{" + (c - 1) + "}")],
          ["Θ (her n için)", M("n \\le C(n) \\le \\sum_{t=0}^{\\infty}\\frac{n}{" + c + "^t}=\\frac{" + c + "}{" + (c - 1) + "}\\,n") + "Geometrik seri: iş, ilk terimin sabit katı ⇒ " + m("\\Theta(n)") + ". (İç içe döngü görünse de ikinci derece değildir!)"]
        ],
        nler: [1, c, c * c, Math.pow(c, 4), Math.pow(c, 6)], cGovde: "    int64_t i = n;\n    while (i >= 1) {\n        for (int64_t j = 1; j <= i; j++)\n            x = x + 1;\n        i = i / " + c + ";\n    }\n",
        cF: "(" + c + " * n - 1) / " + (c - 1) + ".0"
      };
    },
    function (R) {           // adımlı dış döngü
      var s = R.int(2, 4);
      return {
        ad: "adımlı dış döngü", kod: [[0, "x = 0"], [0, "i = 1"], [0, "while i ≤ n"], [1, "for j = 1 to n"], [2, "x = x + 1"], [1, "i = i + " + s]],
        say: function (n) { var x = 0; for (var i = 1; i <= n; i += s) x += n; return x; },
        f: function (n) { return Math.ceil(n / s) * n; }, fTex: "n\\left\\lceil \\frac{n}{" + s + "}\\right\\rceil", theta: "\\Theta(n^2)",
        adimlar: [
          ["Dış tur sayısı", m("i = 1, 1+" + s + ", 1+2\\cdot" + s + ", \\dots \\le n") + ": " + m("1 + t\\cdot " + s + " \\le n \\iff t \\le (n-1)/" + s) + " ⇒ " + m("\\lfloor (n-1)/" + s + "\\rfloor + 1 = \\lceil n/" + s + "\\rceil") + " tur."],
          ["Toplam", "Her turda iç döngü " + m("n") + " kez: " + M("C(n) = n\\left\\lceil \\frac{n}{" + s + "}\\right\\rceil")],
          ["Θ", m("\\frac{n^2}{" + s + "} \\le C(n) \\le \\frac{n^2}{" + s + "}+n") + " ⇒ " + m("\\Theta(n^2)") + ". Adım " + m(s) + " yalnızca sabit çarpanı değiştirir."]
        ],
        nler: [1, s + 1, 10, 25, 100], cGovde: "    for (int64_t i = 1; i <= n; i = i + " + s + ")\n        for (int64_t j = 1; j <= n; j++)\n            x = x + 1;\n",
        cF: "((n + " + (s - 1) + ") / " + s + ") * n"
      };
    },
    function (R) {           // ardışık iki parça
      var p = R.int(2, 6);
      return {
        ad: "ardışık iki parça", kod: [[0, "x = 0"], [0, "for i = 1 to " + p + "n"], [1, "x = x + 1"], [0, "for i = 1 to n"], [1, "for j = 1 to i"], [2, "x = x + 1"]],
        say: function (n) { var x = p * n; for (var i = 1; i <= n; i++) x += i; return x; },
        f: function (n) { return p * n + n * (n + 1) / 2; }, fTex: p + "n+\\frac{n(n+1)}{2}=\\frac{n^2+" + (2 * p + 1) + "n}{2}", theta: "\\Theta(n^2)",
        adimlar: [
          ["Birinci parça", m(p + "n") + " kez."],
          ["İkinci parça", M("\\sum_{i=1}^{n} i=\\frac{n(n+1)}{2}")],
          ["Toplam kuralı", M("C(n)=" + p + "n+\\frac{n(n+1)}{2}=\\frac{n^2+" + (2 * p + 1) + "n}{2}") + "Ardışık parçalarda süreler toplanır; " + m("O(f)+O(g)=O(\\max(f,g))") + " ⇒ " + m("\\Theta(n^2)") + "."]
        ],
        nler: [1, 4, 10, 30, 100], cGovde: "    for (int64_t i = 1; i <= " + p + " * n; i++)\n        x = x + 1;\n    for (int64_t i = 1; i <= n; i++)\n        for (int64_t j = 1; j <= i; j++)\n            x = x + 1;\n",
        cF: p + " * n + n * (n + 1) / 2"
      };
    },
    function (R) {           // iç sınır i^2
      return {
        ad: "karesel iç sınır", kod: [[0, "x = 0"], [0, "for i = 1 to n"], [1, "for j = 1 to i · i"], [2, "x = x + 1"]],
        say: function (n) { var x = 0; for (var i = 1; i <= n; i++) x += i * i; return x; },
        f: function (n) { return n * (n + 1) * (2 * n + 1) / 6; }, fTex: "\\frac{n(n+1)(2n+1)}{6}", theta: "\\Theta(n^3)",
        adimlar: [
          ["Toplamı yaz", M("C(n)=\\sum_{i=1}^{n}\\sum_{j=1}^{i^2}1=\\sum_{i=1}^{n} i^2")],
          ["Kareler toplamı", M("\\sum_{i=1}^{n} i^2=\\frac{n(n+1)(2n+1)}{6}") + '<p class="kucuk">(Hafta 1: tümevarımla kanıtlanmıştı.)</p>'],
          ["Θ", "Baskın terim " + m("n^3/3") + " ⇒ " + m("\\Theta(n^3)") + ". İki döngü olmasına rağmen kübik!"]
        ],
        nler: [1, 3, 7, 20, 50], cGovde: "    for (int64_t i = 1; i <= n; i++)\n        for (int64_t j = 1; j <= i * i; j++)\n            x = x + 1;\n",
        cF: "n * (n + 1) * (2 * n + 1) / 6"
      };
    },
    function (R) {           // k = i .. j
      return {
        ad: "aralık döngüsü", kod: [[0, "x = 0"], [0, "for i = 1 to n"], [1, "for j = i to n"], [2, "for k = i to j"], [3, "x = x + 1"]],
        say: function (n) { var x = 0; for (var i = 1; i <= n; i++) for (var j = i; j <= n; j++) x += j - i + 1; return x; },
        f: function (n) { return n * (n + 1) * (n + 2) / 6; }, fTex: "\\frac{n(n+1)(n+2)}{6}=\\binom{n+2}{3}", theta: "\\Theta(n^3)",
        adimlar: [
          ["En içteki", M("\\sum_{k=i}^{j}1=j-i+1")],
          ["Ortadaki", m("t = j - i + 1") + " ile " + M("\\sum_{j=i}^{n}(j-i+1)=\\sum_{t=1}^{n-i+1}t=\\frac{(n-i+1)(n-i+2)}{2}")],
          ["Dış", m("u = n-i+1") + " ile " + M("C(n)=\\sum_{u=1}^{n}\\frac{u(u+1)}{2}=\\frac{n(n+1)(n+2)}{6}") + '<p class="kucuk">Yorum: ' + m("1\\le i\\le k\\le j\\le n") + " koşulunu sağlayan üçlülerin sayısı " + m("\\binom{n+2}{3}") + ".</p>"]
        ],
        nler: [1, 2, 5, 10, 40], cGovde: "    for (int64_t i = 1; i <= n; i++)\n        for (int64_t j = i; j <= n; j++)\n            for (int64_t k = i; k <= j; k++)\n                x = x + 1;\n",
        cF: "n * (n + 1) * (n + 2) / 6"
      };
    },
    function (R) {           // iki çarpımsal döngü
      var c = R.int(2, 3), d = R.int(2, 4);
      return {
        ad: "iç içe iki logaritmik döngü", kod: [[0, "x = 0"], [0, "i = 1"], [0, "while i ≤ n"], [1, "j = 1"], [1, "while j ≤ n"], [2, "x = x + 1"], [2, "j = " + d + " · j"], [1, "i = " + c + " · i"]],
        say: function (n) { var x = 0; for (var i = 1; i <= n; i *= c) for (var j = 1; j <= n; j *= d) x++; return x; },
        f: function (n) { return (ilog(n, c) + 1) * (ilog(n, d) + 1); },
        fTex: "\\left(\\lfloor\\log_{" + c + "} n\\rfloor+1\\right)\\left(\\lfloor\\log_{" + d + "} n\\rfloor+1\\right)", theta: "\\Theta(\\lg^2 n)",
        adimlar: [
          ["Dış döngü", m("\\lfloor \\log_{" + c + "} n\\rfloor+1") + " tur."],
          ["İç döngü", m("i") + "'den bağımsız: " + m("\\lfloor \\log_{" + d + "} n\\rfloor+1") + " tur."],
          ["Çarpım", M("C(n)=\\left(\\lfloor\\log_{" + c + "} n\\rfloor+1\\right)\\left(\\lfloor\\log_{" + d + "} n\\rfloor+1\\right)=\\Theta(\\lg^2 n)")]
        ],
        nler: [1, 8, 81, 1000, 100000], cGovde: "    for (int64_t i = 1; i <= n; i = " + c + " * i)\n        for (int64_t j = 1; j <= n; j = " + d + " * j)\n            x = x + 1;\n",
        cF: "(ilog(n, " + c + ") + 1) * (ilog(n, " + d + ") + 1)", yardim: ILOG_C
      };
    }
  ];

  function uretDongu(R) {
    var s = R.pick(DONGU)(R);
    var soru = kod("LOOP(n)", s.kod) +
      '<div class="kutu soru"><span class="kutu-baslik">Görev</span>' + m("x = x + 1") + " satırının kaç kez çalıştığını " + m("n") + "'nin <strong>kapalı formu</strong> olarak bulun ve çalışma süresini " + m("\\Theta") + " ile verin.</div>";
    var c = "";
    s.adimlar.forEach(function (a) { c += adim(a[0], "<div>" + a[1] + "</div>"); });
    c += adim("Sonuç", '<div class="kutu teorem">' + M("C(n)=" + s.fTex) + "<p>Çalışma süresi: " + m(s.theta) + ".</p></div>");
    c += adim("Doğrulama: kodu çalıştırarak say", kapaliDogrula(s, s.nler));
    c += adim("C ile deneyin", Y.cEditor("dongu.c", cSayim(s.ad, s.cGovde, s.cF, s.nler, s.yardim), "", 300));
    return { soru: soru, cozum: c, baslik: s.ad };
  }

  /* ======================= 3. ÖZYİNELEMELİ KOD: YİNELEME, ANA TEOREM ======================= */
  function nPowTex(p, b, a) {      // n^{log_b a} metni
    var k = Math.round(Math.log(a) / Math.log(b));
    if (Math.pow(b, k) === a) return k === 0 ? "1" : (k === 1 ? "n" : "n^{" + k + "}");
    return "n^{\\log_{" + b + "} " + a + "}";
  }
  function terimTex(kat, govde) {  // kat: Fr; govde: tex
    if (kat.n === 0) return "";
    if (govde === "1") return Y.fTex(kat);
    var k = (kat.n === 1 && kat.d === 1) ? "" : (kat.n === -1 && kat.d === 1 ? "-" : Y.fTex(kat));
    return k + govde;
  }
  function birlestir(t1, t2) { if (!t1) return t2 || "0"; if (!t2) return t1; return t2.charAt(0) === "-" ? t1 + " " + t2 : t1 + " + " + t2; }

  function uretOzyineleme(R) {
    var c = R.int(1, 3), e = R.int(1, 2), satirlar = [], cozum = "", sonucTex, thetaTex, tablo2 = [], cKod;
    var bolme = R.f() < 0.72;
    var tabanSatir = e === 1 ? [[1, "x = x + 1"]] : [[1, "for t = 1 to " + e], [2, "x = x + 1"]];
    if (bolme) {
      var a = R.pick([1, 2, 3, 4, 7, 8, 9]), b = R.pick([2, 3, 4]), d = R.pick([0, 1, 1, 2]);
      if (b === 4 && d === 2 && a > 9) a = 9;
      var bd = Math.pow(b, d), p = Math.log(a) / Math.log(b);
      satirlar = [[0, "if n ≤ 1"]].concat(tabanSatir).concat([[1, "return"]]);
      if (d === 0) satirlar = satirlar.concat(c === 1 ? [[0, "x = x + 1"]] : [[0, "for t = 1 to " + c], [1, "x = x + 1"]]);
      else if (d === 1) satirlar = satirlar.concat([[0, "for i = 1 to " + (c === 1 ? "" : c) + "n"], [1, "x = x + 1"]]);
      else satirlar = satirlar.concat([[0, "for i = 1 to n"], [1, "for j = 1 to " + (c === 1 ? "" : c) + "n"], [2, "x = x + 1"]]);
      satirlar = satirlar.concat(a === 1 ? [[0, "REC(n / " + b + ")"]] : [[0, "for t = 1 to " + a], [1, "REC(n / " + b + ")"]]);
      var fTex = (c === 1 ? "" : c) + (d === 0 ? (c === 1 ? "1" : "") : (d === 1 ? "n" : "n^2"));
      var NP = nPowTex(p, b, a), durum;
      cozum += adim("Yineleme bağıntısı", "Taban: " + m("T(1)=" + e) + ". Gövde: " + m(c + "n^{" + d + "}") + " kez " + m("x=x+1") + " ve " + m(a) + " özyinelemeli çağrı, her biri " + m("n/" + b) + " boyutunda:" + M("T(n)=" + (a === 1 ? "" : a) + "T(n/" + b + ")+" + fTex + ",\\qquad T(1)=" + e));
      cozum += adim("Parametreler", m("a=" + a + ",\\ b=" + b + ",\\ f(n)=" + fTex + "=\\Theta(n^{" + d + "})") + ". Havza fonksiyonu " + m("n^{\\log_b a}=" + NP + (Math.pow(b, Math.round(p)) === a ? "" : "\\approx n^{" + p.toFixed(3) + "}")) + "; karşılaştırma: " + m("a=" + a) + " ile " + m("b^d=" + b + "^{" + d + "}=" + bd) + ".");
      var r = Fr(a, bd);
      cozum += adim("Özyineleme ağacı", "Düzey " + m("j") + ": " + m(a + "^j") + " düğüm × " + m(c + "(n/" + b + "^j)^{" + d + "}") + " = " + m(c + "n^{" + d + "}\\cdot r^j") + ", " + m("r=a/b^d=" + Y.fTex(r)) + ". " +
        (a < bd ? "Oran " + m("<1") + ": düzey toplamları <strong>azalır</strong>, kök baskın." : a === bd ? "Oran " + m("=1") + ": her düzey eşit, " + m("\\log_" + b + " n") + " düzey." : "Oran " + m(">1") + ": düzey toplamları <strong>artar</strong>, yapraklar baskın."));
      if (a > bd) { durum = "CLRS ana teorem durum 1: " + m("f(n)=O(n^{\\log_b a-\\epsilon})"); thetaTex = "\\Theta(" + NP + ")"; }
      else if (a === bd) { durum = "CLRS ana teorem durum 2 (" + m("k=0") + "): " + m("f(n)=\\Theta(n^{\\log_b a})"); thetaTex = "\\Theta(" + (d === 0 ? "\\lg n" : (d === 1 ? "n\\lg n" : "n^2\\lg n")) + ")"; }
      else { durum = "CLRS ana teorem durum 3: " + m("f(n)=\\Omega(n^{\\log_b a+\\epsilon})") + ", düzenlilik: " + m("a f(n/b) = " + Y.fTex(r) + "\\,f(n)") + " ve " + m(Y.fTex(r) + "<1"); thetaTex = "\\Theta(" + (d === 0 ? "1" : d === 1 ? "n" : "n^2") + ")"; }
      cozum += adim("Ana teorem", m(a + (a > bd ? ">" : a === bd ? "=" : "<") + bd) + " ⇒ " + durum + "." + M("T(n)=" + thetaTex));
      // kesin form
      var formul;
      if (a === bd) {
        sonucTex = birlestir(terimTex(Fr(e), d === 0 ? "1" : d === 1 ? "n" : "n^2"), terimTex(Fr(c), (d === 0 ? "" : d === 1 ? "n" : "n^2") + "\\log_{" + b + "} n"));
        formul = function (k) { var n = Math.pow(b, k); return e * Math.pow(n, d) + c * Math.pow(n, d) * k; };
        cozum += adim("Kesin kapalı form (" + m("n=" + b + "^k") + ")", "Eşit durumda her düzey " + m(c + "n^{" + d + "}") + ", " + m("k=\\log_" + b + " n") + " düzey ve yapraklar " + m(e + "\\,a^k=" + e + "n^{" + d + "}") + ":" + M("T(n)=" + sonucTex));
      } else {
        var B = Fr(c * bd, a - bd), eB = Y.fAdd(Fr(e), B), mB = Fr(-B.n, B.d);
        sonucTex = birlestir(terimTex(eB, NP === "1" ? "1" : NP), terimTex(mB, d === 0 ? "1" : d === 1 ? "n" : "n^2"));
        formul = function (k) { var n = Math.pow(b, k); return (eB.n / eB.d) * Math.pow(a, k) - (B.n / B.d) * Math.pow(n, d); };
        cozum += adim("Kesin kapalı form (" + m("n=" + b + "^k") + ")", "Hafta 4: " + m("T(n)=(e+B)\\,n^{\\log_b a}-B\\,n^d") + ", " + m("B=\\frac{c\\,b^d}{a-b^d}=\\frac{" + c + "\\cdot" + bd + "}{" + a + "-" + bd + "}=" + Y.fTex(B)) + ":" + M("T(n)=" + sonucTex) + '<p class="kucuk">(' + m("n^{\\log_b a}=a^k") + " olduğundan tablo bunu kullanır.)</p>");
      }
      var tt = e, hata = false;
      for (var k = 0; k <= 7; k++) {
        if (k > 0) tt = a * tt + c * Math.pow(Math.pow(b, k), d);
        var nn = Math.pow(b, k); if (nn > 5e7) break;
        var fv = formul(k); if (Math.abs(fv - tt) > 1e-6 * Math.max(1, tt)) hata = true;
        tablo2.push([m(k), m(nn), m(tt), m(+fv.toFixed(4)), Math.abs(fv - tt) < 1e-6 * Math.max(1, tt) ? "✓" : "✗"]);
      }
      if (hata) V.hatalar.push("özyineleme: a=" + a + " b=" + b + " d=" + d + " formül hatalı");
      cozum += adim("Doğrulama", tablo(["k", m("n=" + b + "^k"), "T(n) (yinelemeden)", "kapalı form", ""], tablo2, "kucuk-tablo"));
      var govde = d === 0 ? "    for (int32_t t = 1; t <= " + c + "; t++) x++;\n" : d === 1 ? "    for (int64_t i = 1; i <= " + c + " * n; i++) x++;\n" : "    for (int64_t i = 1; i <= n; i++)\n        for (int64_t j = 1; j <= " + c + " * n; j++) x++;\n";
      cKod = "/* Ek örnek (kitapta yok): vize hazırlık üreteci, böl-ve-yönet yinelemesi */\n#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\n\nint64_t x = 0;\n\nvoid rec(int64_t n)\n{\n    if (n <= 1) {\n        x += " + e + ";\n        return;\n    }\n" + govde +
        "    for (int32_t t = 1; t <= " + a + "; t++)\n        rec(n / " + b + ");\n}\n\nint main(void)\n{\n    int64_t n = 1;\n    for (int32_t k = 0; k <= 6; k++, n *= " + b + ") {\n" +
        "        x = 0;\n        rec(n);\n        printf(\"k=%\" PRId32 \"  n=%\" PRId64 \"  T(n)=%\" PRId64 \"\\n\", k, n, x);\n    }\n    return 0;\n}\n";
      return { soru: kod("REC(n)", satirlar) + gorevMetni(), cozum: cozum + adim("C ile deneyin", Y.cEditor("ozyineleme.c", cKod, "", 300)), baslik: "bölen yineleme" };
    }
    // çıkarmalı yineleme
    var a2 = R.pick([1, 1, 2, 3]), d2 = a2 === 1 ? R.int(0, 1) : 0;
    satirlar = [[0, "if n ≤ 1"]].concat(tabanSatir).concat([[1, "return"]]);
    satirlar = satirlar.concat(d2 === 0 ? (c === 1 ? [[0, "x = x + 1"]] : [[0, "for t = 1 to " + c], [1, "x = x + 1"]]) : [[0, "for i = 1 to " + (c === 1 ? "" : c) + "n"], [1, "x = x + 1"]]);
    satirlar = satirlar.concat(a2 === 1 ? [[0, "REC(n − 1)"]] : [[0, "for t = 1 to " + a2], [1, "REC(n − 1)"]]);
    var f2 = d2 === 0 ? String(c) : (c === 1 ? "" : c) + "n", F;
    cozum += adim("Yineleme bağıntısı", M("T(n)=" + (a2 === 1 ? "" : a2) + "T(n-1)+" + f2 + ",\\qquad T(1)=" + e));
    cozum += adim("Ana teorem uygulanabilir mi?", "Hayır: alt problem " + m("n/b") + " değil " + m("n-1") + " boyutunda (<em>çıkarmalı</em> yineleme). <strong>Tekrarlı yerine koyma</strong> kullanalım.");
    if (a2 === 1 && d2 === 0) {
      cozum += adim("Açılım", M("T(n)=T(n-1)+" + c + "=T(n-2)+2\\cdot" + c + "=\\cdots=T(1)+" + c + "(n-1)"));
      sonucTex = e + "+" + c + "(n-1)"; thetaTex = "\\Theta(n)"; F = function (n) { return e + c * (n - 1); };
    } else if (a2 === 1) {
      cozum += adim("Açılım", M("T(n)=T(n-1)+" + f2 + "=T(1)+" + (c === 1 ? "" : c) + "\\sum_{i=2}^{n} i=" + e + "+" + (c === 1 ? "" : c) + "\\Big(\\frac{n(n+1)}{2}-1\\Big)"));
      sonucTex = e + "+" + (c === 1 ? "" : c) + "\\left(\\frac{n(n+1)}{2}-1\\right)"; thetaTex = "\\Theta(n^2)"; F = function (n) { return e + c * (n * (n + 1) / 2 - 1); };
    } else {
      cozum += adim("Açılım", M("T(n)=" + a2 + "T(n-1)+" + c + "=" + a2 + "^2T(n-2)+" + c + "(1+" + a2 + ")=\\cdots=" + a2 + "^{n-1}T(1)+" + c + "\\sum_{j=0}^{n-2}" + a2 + "^j"));
      var kes = function (pay) { return a2 - 1 === 1 ? "(" + pay + ")" : "\\frac{" + pay + "}{" + (a2 - 1) + "}"; };
      cozum += adim("Geometrik toplam", M("\\sum_{j=0}^{n-2}" + a2 + "^j=" + kes(a2 + "^{n-1}-1").replace(/^\((.*)\)$/, "$1")));
      sonucTex = (e === 1 ? "" : e + "\\cdot ") + a2 + "^{n-1}+" + (c === 1 ? "" : c) + kes(a2 + "^{n-1}-1"); thetaTex = "\\Theta(" + a2 + "^n)";
      F = function (n) { return e * Math.pow(a2, n - 1) + c * (Math.pow(a2, n - 1) - 1) / (a2 - 1); };
    }
    cozum += adim("Sonuç", '<div class="kutu teorem">' + M("T(n)=" + sonucTex + "=" + thetaTex) + "</div>" + (a2 > 1 ? '<p class="kucuk">Uyarı: her çağrı ' + a2 + " özyinelemeli çağrı yapar ve boyut yalnızca 1 azalır ⇒ üstel!</p>" : ""));
    var t = e, h2 = false;
    for (var n = 1; n <= 8; n++) { if (n > 1) t = a2 * t + (d2 === 0 ? c : c * n); var fv2 = F(n); if (Math.abs(fv2 - t) > 1e-9) h2 = true; tablo2.push([m(n), m(t), m(fv2), fv2 === t ? "✓" : "✗"]); }
    if (h2) V.hatalar.push("özyineleme (çıkarmalı) formül hatalı a=" + a2 + " d=" + d2);
    cozum += adim("Doğrulama", tablo(["n", "T(n) (yinelemeden)", "kapalı form", ""], tablo2, "kucuk-tablo"));
    return { soru: kod("REC(n)", satirlar) + gorevMetni(), cozum: cozum, baslik: "çıkarmalı yineleme" };
  }
  function gorevMetni() {
    return '<div class="kutu soru"><span class="kutu-baslik">Görev</span>(1) ' + m("x = x + 1") + " satırının toplam çalışma sayısı " + m("T(n)") + " için yineleme bağıntısını yazın. (2) " + m("\\Theta") + " sınıfını bulun. (3) Kesin kapalı formu çıkarın.</div>";
  }

  /* ======================= 5. TÜMEVARIMLA TOPLAM FORMÜLÜ ======================= */
  function uretTumevarim(R) {
    var cozum = "", soru;
    if (R.f() < 0.7) {
      var p = R.int(0, 3), q = R.int(-2, 4), r = R.int(-3, 5);
      if (p === 0 && q === 0) q = R.int(1, 4);
      var f = [Fr(r), Fr(q), Fr(p)];
      // S(n) = p n(n+1)(2n+1)/6 + q n(n+1)/2 + r n
      var S = Y.polyAdd(Y.polyAdd(Y.polyMul([Fr(p, 6)], [Fr(0), Fr(1), Fr(3), Fr(2)]), Y.polyMul([Fr(q, 2)], [Fr(0), Fr(1), Fr(1)])), [Fr(0), Fr(r)]);
      var fTex = Y.polyTex(f, "i"), STex = Y.polyTex(S, "n");
      var sol = Y.polyAdd(S, Y.polyShift(f)), sag = Y.polyShift(S), solTex = Y.polyTex(sol, "k"), sagTex = Y.polyTex(sag, "k");
      if (solTex !== sagTex) V.hatalar.push("tümevarım: polinomlar eşit değil");
      soru = '<div class="kutu soru"><span class="kutu-baslik">Görev</span>Her ' + m("n \\ge 1") + " için" + M("\\sum_{i=1}^{n}\\left(" + fTex + "\\right) = " + STex) + "olduğunu tümevarımla kanıtlayın.</div>" +
        '<p class="kucuk">İsterseniz önce formülün nereden geldiğini bulun: ' + m("\\sum i = \\frac{n(n+1)}{2}") + ", " + m("\\sum i^2 = \\frac{n(n+1)(2n+1)}{6}") + ".</p>";
      cozum += adim("Formül nereden geliyor?", "Doğrusallık: " + M("\\sum_{i=1}^{n}(" + fTex + ")=" + (p ? p + "\\cdot\\frac{n(n+1)(2n+1)}{6}" : "") + (q ? (p ? "+" : "") + (q === 1 ? "" : q) + "\\cdot\\frac{n(n+1)}{2}" : "") + (r ? (r > 0 ? "+" : "") + r + "n" : "") + "=" + STex));
      cozum += adim("Hipotez", m("P(n)") + ": " + m("\\sum_{i=1}^{n}(" + fTex + ") = " + STex) + ".");
      var f1 = Y.polyEval(f, 1), s1 = Y.polyEval(S, 1);
      if (Math.abs(f1 - s1) > 1e-9) V.hatalar.push("tümevarım taban hatası");
      cozum += adim("Taban (" + m("n=1") + ")", "Sol: " + m("f(1)=" + f1) + ". Sağ: " + m("S(1)=" + s1) + ". Eşit ✓");
      cozum += adim("Tümevarım hipotezi", "Bir " + m("k\\ge1") + " için " + m("\\sum_{i=1}^{k}(" + fTex + ") = " + Y.polyTex(S, "k")) + ".");
      cozum += adim("Tümevarım adımı", M("\\sum_{i=1}^{k+1}(\\cdots)=\\underbrace{" + Y.polyTex(S, "k") + "}_{\\text{hipotez}}+\\underbrace{" + Y.polyTex(Y.polyShift(f), "k") + "}_{f(k+1)}=" + solTex) +
        "Öte yandan formülde " + m("n=k+1") + " koyarsak:" + M("S(k+1)=" + sagTex) + "İki ifade aynı ⇒ " + m("P(k+1)") + " doğru. ✓");
      var sat = []; var top = 0;
      for (var n = 1; n <= 6; n++) { top += Y.polyEval(f, n); sat.push([m(n), m(top), m(Y.polyEval(S, n))]); }
      cozum += adim("Sayısal denetim", tablo(["n", "toplam (doğrudan)", "formül"], sat, "kucuk-tablo"));
    } else {
      var aa = R.int(1, 5), bb = R.int(2, 4);
      soru = '<div class="kutu soru"><span class="kutu-baslik">Görev</span>Her ' + m("n \\ge 0") + " için" + M("\\sum_{i=0}^{n}" + (aa === 1 ? "" : aa + "\\cdot ") + bb + "^{i} = \\frac{" + (aa === 1 ? "" : aa) + "(" + bb + "^{n+1}-1)}{" + (bb - 1) + "}") + "olduğunu tümevarımla kanıtlayın.</div>";
      var Sg = function (n) { return aa * (Math.pow(bb, n + 1) - 1) / (bb - 1); };
      cozum += adim("Hipotez", m("P(n)") + ": " + m("\\sum_{i=0}^{n}" + aa + "\\cdot" + bb + "^i = \\frac{" + aa + "(" + bb + "^{n+1}-1)}{" + (bb - 1) + "}") + ".");
      cozum += adim("Taban (" + m("n=0") + ")", "Sol: " + m(aa + "\\cdot" + bb + "^0=" + aa) + ". Sağ: " + m("\\frac{" + aa + "(" + bb + "-1)}{" + (bb - 1) + "}=" + aa) + " ✓");
      cozum += adim("Tümevarım hipotezi", "Bir " + m("k \\ge 0") + " için " + m("\\sum_{i=0}^{k}" + aa + "\\cdot" + bb + "^i = \\frac{" + aa + "(" + bb + "^{k+1}-1)}{" + (bb - 1) + "}") + ".");
      cozum += adim("Tümevarım adımı", M("\\begin{aligned}\\sum_{i=0}^{k+1}" + aa + "\\cdot" + bb + "^i &= \\frac{" + aa + "(" + bb + "^{k+1}-1)}{" + (bb - 1) + "}+" + aa + "\\cdot" + bb + "^{k+1}\\\\ &= \\frac{" + aa + "\\big(" + bb + "^{k+1}-1+" + (bb - 1) + "\\cdot" + bb + "^{k+1}\\big)}{" + (bb - 1) + "}\\\\ &= \\frac{" + aa + "(" + bb + "^{k+2}-1)}{" + (bb - 1) + "}\\end{aligned}") + "Bu, " + m("P(k+1)") + "'dir. ✓ <span class='kucuk'>(" + m("1+" + (bb - 1) + "=" + bb) + " olduğundan " + m(bb + "^{k+1}+" + (bb - 1) + "\\cdot" + bb + "^{k+1}=" + bb + "^{k+2}") + ".)</span>");
      var sat2 = [], top2 = 0;
      for (var n2 = 0; n2 <= 5; n2++) { top2 += aa * Math.pow(bb, n2); sat2.push([m(n2), m(top2), m(Sg(n2))]); if (top2 !== Sg(n2)) V.hatalar.push("geometrik toplam hatası"); }
      cozum += adim("Sayısal denetim", tablo(["n", "toplam", "formül"], sat2, "kucuk-tablo"));
    }
    return { soru: soru, cozum: cozum, baslik: "tümevarım" };
  }

  /* ======================= 6. ASİMPTOTİK SIRALAMA ======================= */
  // anahtar: [sınıf, x1, x2, x3]; sınıf 0: n^{x1} lg^{x2} n (lglg n)^{x3}; 0.5: n^{lg lg n}; 1: x1^n n^{x2}; 2: faktöriyel; 3: n^n; 4: çift üstel
  var HAVUZ = [
    ["\\lg^* n", [-1, 0, 0, 0], "\\lg^* n", "yinelenmiş logaritma; her \\(\\lg\\lg n\\)'den yavaş"],
    ["2^{10}", [0, 0, 0, 0], "\\Theta(1)", "sabit"],
    ["\\lg\\lg n", [0, 0, 0, 1], "\\lg\\lg n", ""],
    ["\\sqrt{\\lg n}", [0, 0, 0.5, 0], "(\\lg n)^{1/2}", ""],
    ["\\lg n", [0, 0, 1, 0], "\\lg n", ""],
    ["\\ln n", [0, 0, 1, 0], "\\Theta(\\lg n)", "\\(\\ln n = \\lg n/\\lg e\\): sabit çarpan"],
    ["\\lg(n^3)", [0, 0, 1, 0], "3\\lg n", "\\(\\lg(n^3)=3\\lg n\\)"],
    ["(\\lg n)^2", [0, 0, 2, 0], "\\lg^2 n", ""],
    ["2^{\\sqrt{2\\lg n}}", [0, 0, 1000, 0], "n^{o(1)}", "her \\(\\lg^k n\\)'den hızlı, her \\(n^{\\epsilon}\\)'dan yavaş"],
    ["n^{1/3}", [0, 1 / 3, 0, 0], "n^{1/3}", ""],
    ["\\sqrt n", [0, 0.5, 0, 0], "n^{1/2}", ""],
    ["(\\sqrt 2)^{\\lg n}", [0, 0.5, 0, 0], "n^{1/2}", "\\((\\sqrt2)^{\\lg n}=2^{\\frac12\\lg n}=\\sqrt n\\)"],
    ["n", [0, 1, 0, 0], "n", ""],
    ["2^{\\lg n}", [0, 1, 0, 0], "n", "\\(2^{\\lg n}=n\\)"],
    ["n\\lg n", [0, 1, 1, 0], "n\\lg n", ""],
    ["\\lg(n!)", [0, 1, 1, 0], "\\Theta(n\\lg n)", "Stirling: \\(\\lg(n!)=\\Theta(n\\lg n)\\)"],
    ["n^2", [0, 2, 0, 0], "n^2", ""],
    ["4^{\\lg n}", [0, 2, 0, 0], "n^2", "\\(4^{\\lg n}=2^{2\\lg n}=n^2\\)"],
    ["n^2\\lg n", [0, 2, 1, 0], "n^2\\lg n", ""],
    ["n^{\\lg 7}", [0, 2.807, 0, 0], "n^{2.807}", "\\(\\lg 7\\approx 2.807\\)"],
    ["n^3", [0, 3, 0, 0], "n^3", ""],
    ["n^{\\lg\\lg n}", [0.5, 0, 0, 0], "n^{\\lg\\lg n}", "üssü büyüyen polinom: her \\(n^k\\)'den hızlı, her \\(c^n\\)'den yavaş"],
    ["(\\lg n)^{\\lg n}", [0.5, 0, 0, 0], "n^{\\lg\\lg n}", "\\((\\lg n)^{\\lg n}=2^{\\lg n\\cdot\\lg\\lg n}=n^{\\lg\\lg n}\\)"],
    ["(3/2)^n", [1, 1.5, 0, 0], "1.5^n", ""],
    ["2^n", [1, 2, 0, 0], "2^n", ""],
    ["2^{n+1}", [1, 2, 0, 0], "2\\cdot 2^n", "\\(2^{n+1}=2\\cdot2^n\\): sabit çarpan"],
    ["n\\,2^n", [1, 2, 1, 0], "n\\,2^n", ""],
    ["e^n", [1, 2.718, 0, 0], "e^n", ""],
    ["3^n", [1, 3, 0, 0], "3^n", ""],
    ["n!", [2, 0, 0, 0], "n!", "Stirling: \\(n!\\approx\\sqrt{2\\pi n}(n/e)^n\\)"],
    ["(n+1)!", [2, 1, 0, 0], "(n+1)\\,n!", ""],
    ["n^n", [3, 0, 0, 0], "n^n", ""],
    ["2^{2^n}", [4, 0, 0, 0], "2^{2^n}", ""]
  ];
  function karsilastir(a, b) { for (var i = 0; i < 4; i++) { if (a[i] < b[i] - 1e-12) return -1; if (a[i] > b[i] + 1e-12) return 1; } return 0; }
  function gerekce(A, B) {      // A ≺ B
    var a = A[1], b = B[1];
    if (a[0] !== b[0]) {
      var ad = { "-1": "yinelenmiş log", "0": "polilog/polinom", "0.5": "süperpolinom", "1": "üstel", "2": "faktöriyel", "3": "\\(n^n\\)", "4": "çift üstel" };
      return ad[a[0]] + " ≺ " + ad[b[0]] + (a[0] === 0 && b[0] === 0.5 ? " (\\(n^{\\lg\\lg n}\\) üssü sınırsız büyür)" : a[0] === 0.5 && b[0] === 1 ? " (\\(\\lg\\lg n\\cdot\\lg n = o(n)\\))" : a[0] === 1 && b[0] === 2 ? " (Stirling: \\(c^n/n!\\to0\\))" : a[0] === 2 && b[0] === 3 ? " (\\(n!/n^n \\to 0\\))" : a[0] === -1 ? " (\\(\\lg^*\\) neredeyse sabit)" : "");
    }
    if (a[0] === 0) {
      if (a[1] !== b[1]) return a[1] === 0 ? "her polilogaritma her \\(n^{\\epsilon}\\)'dan yavaştır" : "\\(n^{" + +a[1].toFixed(3) + "}/n^{" + +b[1].toFixed(3) + "}\\to 0\\) (polinom üssü)";
      if (a[2] !== b[2]) return b[2] === 1000 ? "\\(2^{\\sqrt{2\\lg n}}\\) her \\(\\lg^k n\\)'den hızlıdır" : "aynı polinom kısmı; \\(\\lg\\) kuvveti " + +a[2].toFixed(2) + " < " + +b[2].toFixed(2);
      return "\\(\\lg\\lg n\\) kuvveti küçük";
    }
    if (a[0] === 1) return a[1] !== b[1] ? "\\((" + a[1] + "/" + b[1] + ")^n \\to 0\\) (taban)" : "aynı taban; ek \\(n\\) çarpanı";
    return "ek çarpan büyür";
  }
  function uretSiralama(R) {
    var sec = [], denek = 0;
    while (sec.length < 6 && denek++ < 200) { var x = R.pick(HAVUZ); if (sec.indexOf(x) < 0) sec.push(x); }
    // en az bir eşit çift olsun (çoğunlukla)
    if (R.f() < 0.7) {
      var es = HAVUZ.filter(function (h) { return sec.indexOf(h) < 0 && sec.some(function (s2) { return karsilastir(s2[1], h[1]) === 0; }); });
      if (es.length) sec[R.int(0, 5)] = R.pick(es);
      var uniq = []; sec.forEach(function (s3) { if (uniq.indexOf(s3) < 0) uniq.push(s3); }); sec = uniq;
    }
    sec = R.shuffle(sec);
    var harf = "ABCDEFG";
    var soru = '<div class="kutu soru"><span class="kutu-baslik">Görev</span>Aşağıdaki fonksiyonları büyüme hızına göre <strong>küçükten büyüğe</strong> sıralayın; aynı ' + m("\\Theta") + " sınıfında olanları belirtin.</div>" +
      tablo(["", "fonksiyon"], sec.map(function (s4, i) { return [m("f_" + (i + 1)), m(s4[0])]; }), "kucuk-tablo");
    var cozum = adim("Her fonksiyonu sadeleştir", tablo(["", "fonksiyon", "kanonik biçim", "not"], sec.map(function (s5, i) { return [m("f_" + (i + 1)), m(s5[0]), m(s5[2]), s5[3]]; }), "kucuk-tablo"));
    var sirali = sec.map(function (s6, i) { return { s: s6, i: i }; }).sort(function (p, q) { return karsilastir(p.s[1], q.s[1]); });
    var zincir = "";
    sirali.forEach(function (o, j) {
      if (j > 0) zincir += karsilastir(sirali[j - 1].s[1], o.s[1]) === 0 ? " = " : " \\prec ";
      zincir += "f_" + (o.i + 1);
    });
    cozum += adim("Sıralama", M(zincir) + '<p class="kucuk">' + m("\\prec") + ": küçük-o (" + m("f=o(g)") + "); " + m("=") + ": aynı " + m("\\Theta") + " sınıfı.</p>");
    var g = [];
    for (var j = 1; j < sirali.length; j++) {
      var A = sirali[j - 1], B = sirali[j];
      g.push([m("f_" + (A.i + 1)) + (karsilastir(A.s[1], B.s[1]) === 0 ? " = " : " ≺ ") + m("f_" + (B.i + 1)), karsilastir(A.s[1], B.s[1]) === 0 ? "aynı kanonik biçim" : gerekce(A.s, B.s)]);
    }
    cozum += adim("Komşu çiftlerin gerekçesi", tablo(["çift", "gerekçe"], g, "kucuk-tablo sol"));
    cozum += adim("Yöntem hatırlatması", "<ul><li>" + m("\\lim f/g = 0 \\Rightarrow f=o(g)") + "; sabit " + m(">0") + " ⇒ " + m("\\Theta") + ".</li><li>Üstel/logaritmik ifadeleri " + m("2^{\\cdots}") + " biçiminde yazıp üsleri karşılaştırın.</li><li>" + m("\\lg^k n \\prec n^{\\epsilon} \\prec c^n \\prec n! \\prec n^n") + ".</li></ul>");
    return { soru: soru, cozum: cozum, baslik: "asimptotik sıralama" };
  }

  V.uretec.dongu = uretDongu;
  V.uretec.ozyineleme = uretOzyineleme;
  V.uretec.tumevarim = uretTumevarim;
  V.uretec.siralama = uretSiralama;
})();

