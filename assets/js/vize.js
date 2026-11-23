/*
 * Vize hazırlık — rastgele soru üreteçleri
 * Her <section class="vize-slayt" data-uretici="..."> bir görevdir. "Yeni soru" düğmesi tohumlu
 * rastgele sayı üreteciyle yeni bir örnek üretir; çözüm adımları reveal.js fragmanlarıdır.
 * Aynı "soru no" her zaman aynı soruyu üretir.
 */
(function () {
  "use strict";

  /* ======================= Yardımcılar ======================= */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function Rng(seed) {
    var r = mulberry32(seed);
    var o = {
      f: r,
      int: function (a, b) { return a + Math.floor(r() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(r() * arr.length)]; },
      shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
      },
      sample: function (arr, k) { return o.shuffle(arr).slice(0, k); },
      distinct: function (k, lo, hi) { var p = []; for (var v = lo; v <= hi; v++) p.push(v); return o.sample(p, k); }
    };
    return o;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function m(tex) { return "\\(" + tex + "\\)"; }
  function M(tex) { return "\\[" + tex + "\\]"; }

  /* CLRS biçiminde numaralı yalancı kod. satirlar: [girinti, metin] veya "" */
  function kod(baslik, satirlar) {
    var s = esc(baslik) + "\n", no = 0;
    satirlar.forEach(function (x) {
      no++;
      var g = x[0], t = x[1];
      s += (no < 10 ? " " : "") + no + "  " + "    ".repeat(g) + esc(t) + "\n";
    });
    return '<pre class="yalanci-kod"><code class="nohighlight">' + s.replace(/\n$/, "") + "</code></pre>";
  }
  var adimNo = 0;
  function adim(baslik, govde) {
    adimNo++;
    return '<div class="vize-adim fragment"><div class="vize-adim-b"><span class="vize-adim-no">' + adimNo + "</span>" + baslik + "</div>" + govde + "</div>";
  }
  function tablo(basliklar, satirlar, sinif) {
    var h = '<table class="vize-tablo ' + (sinif || "") + '"><tr>' + basliklar.map(function (b) { return "<th>" + b + "</th>"; }).join("") + "</tr>";
    satirlar.forEach(function (r) {
      var cls = r.sinif ? ' class="' + r.sinif + '"' : "";
      var hucreler = r.hucreler || r;
      h += "<tr" + cls + ">" + hucreler.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
    });
    return h + "</table>";
  }
  function dizi(a, vurgu) {   // dizi gösterimi; vurgu: {indis: sınıf}
    vurgu = vurgu || {};
    return '<span class="vize-dizi">' + a.map(function (v, i) {
      return '<span class="' + (vurgu[i] || "") + '">' + v + "</span>";
    }).join("") + "</span>";
  }
  function cEditor(ad, kodMetni, girdi, yukseklik) {
    return '<div class="c-editor" data-ad="' + ad + '" data-yukseklik="' + (yukseklik || 360) +
      '" data-bayrak="-O2 -std=c11 -Wall -lm"><script type="text/x-c">' + kodMetni.replace(/<\/script/gi, "<\\/script") +
      "</" + "script>" + (girdi ? '<script type="text/x-girdi">' + girdi + "</" + "script>" : "") + "</div>";
  }

  /* --- Kesirler ve polinomlar (tümevarım üreteci için) --- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function Fr(n, d) {
    d = d === undefined ? 1 : d;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d);
    return { n: n / g, d: d / g };
  }
  function fAdd(a, b) { return Fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fMul(a, b) { return Fr(a.n * b.n, a.d * b.d); }
  function fTex(a) { return a.d === 1 ? String(a.n) : (a.n < 0 ? "-" : "") + "\\frac{" + Math.abs(a.n) + "}{" + a.d + "}"; }
  function polyTex(c, x) {        // c[k]: x^k katsayısı (kesir); büyük dereceden başla
    x = x || "n"; var s = "";
    for (var k = c.length - 1; k >= 0; k--) {
      var a = c[k]; if (!a || a.n === 0) continue;
      var neg = a.n < 0, ab = Fr(Math.abs(a.n), a.d);
      var kat = (ab.n === 1 && ab.d === 1 && k > 0) ? "" : fTex(ab);
      var terim = kat + (k === 0 ? "" : (k === 1 ? x : x + "^{" + k + "}"));
      s += (s === "" ? (neg ? "-" : "") : (neg ? " - " : " + ")) + terim;
    }
    return s || "0";
  }
  function polyEval(c, x) { var v = 0; for (var k = c.length - 1; k >= 0; k--) v = v * x + (c[k] ? c[k].n / c[k].d : 0); return v; }
  function polyAdd(a, b) { var r = []; for (var k = 0; k < Math.max(a.length, b.length); k++) r[k] = fAdd(a[k] || Fr(0), b[k] || Fr(0)); return r; }
  function polyMul(a, b) {
    var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r[i] = Fr(0);
    a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] = fAdd(r[i + j], fMul(x, y)); }); });
    return r;
  }
  function polyShift(c) {          // p(x) -> p(x+1)
    var r = [Fr(0)];
    for (var k = c.length - 1; k >= 0; k--) r = polyAdd(polyMul(r, [Fr(1), Fr(1)]), [c[k] || Fr(0)]);
    return r;
  }
  function binom(n, k) { if (k < 0 || k > n) return 0; var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }

  /* ======================= 1. DOĞRULUK İSPATI ======================= */
  function izTablo(bas, satir) { return tablo(bas, satir, "kucuk-tablo"); }

  var DOGRULUK = [
    {
      ad: "INSERTION-SORT", kaynak: "CLRS 2.1", tur: "dongu",
      kod: function () {
        return kod("INSERTION-SORT(A, n)", [[0, "for i = 2 to n"], [1, "key = A[i]"], [1, "j = i − 1"], [1, "while j > 0 and A[j] > key"],
          [2, "A[j + 1] = A[j]"], [2, "j = j − 1"], [1, "A[j + 1] = key"]]);
      },
      gorev: "Algoritmanın <strong>A[1 : n]</strong> dizisini artan sırada sıraladığını kanıtlayın.",
      hipotez: "1–7. satırlardaki <strong>for</strong> döngüsünün her yinelemesinin başında, " + m("A[1 : i-1]") + " altdizisi başlangıçta " + m("A[1 : i-1]") + "'de bulunan elemanlardan oluşur ve <strong>sıralıdır</strong>.",
      adimlar: [
        ["Başlatma", m("i = 2") + ": " + m("A[1 : 1]") + " tek elemanlıdır; tek elemanlı dizi sıralıdır ve özgün elemandır."],
        ["Sürdürme", "Gövde " + m("key = A[i]") + "'yi alır; 4–6. satırlar " + m("A[i-1], A[i-2], \\dots") + " içinden " + m("key") + "'den büyük olanları birer sağa kaydırır ve 7. satır " + m("key") + "'i boşalan doğru yere koyar. Böylece " + m("A[1 : i]") + " özgün ilk " + m("i") + " elemandan oluşur ve sıralıdır. " + m("i") + " bir artınca değişmez yeniden sağlanır. <span class='kucuk'>(Tam titizlik için iç <strong>while</strong> döngüsüne de bir değişmez yazılır.)</span>"],
        ["Sonlanma", "Döngü " + m("i = n + 1") + " olunca biter. Değişmezde " + m("i = n+1") + " koyarsak " + m("A[1 : n]") + " özgün elemanlardan oluşur ve sıralıdır ⇒ algoritma doğrudur."]
      ],
      iz: function (R) {
        var A = R.distinct(R.int(5, 7), 1, 30), satir = [], a = A.slice();
        for (var i = 1; i < a.length; i++) {
          var vur = {}; for (var t = 0; t < i; t++) vur[t] = "v-sirali";
          satir.push([m("i=" + (i + 1)), dizi(a, vur)]);
          var key = a[i], j = i - 1; while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; } a[j + 1] = key;
        }
        var v2 = {}; a.forEach(function (_, t) { v2[t] = "v-sirali"; });
        satir.push([m("i=" + (a.length + 1)), dizi(a, v2)]);
        return { girdi: "A = ⟨" + A.join(", ") + "⟩", tablo: izTablo(["döngü başı", "A (yeşil: " + m("A[1:i-1]") + " — sıralı)"], satir) };
      }
    },
    {
      ad: "MAXIMUM", kaynak: "Parberry, Algorithm Correctness / POA 5.1.3", tur: "dongu",
      kod: function () { return kod("MAXIMUM(A, n)", [[0, "m = A[1]"], [0, "for i = 2 to n"], [1, "if A[i] > m"], [2, "m = A[i]"], [0, "return m"]]); },
      gorev: "MAXIMUM'un " + m("\\max\\{A[1], \\dots, A[n]\\}") + " döndürdüğünü kanıtlayın.",
      hipotez: "2–4. satırlardaki döngünün her yinelemesinin başında " + m("m = \\max A[1 : i-1]") + ".",
      adimlar: [
        ["Başlatma", m("i=2") + ": 1. satırdan sonra " + m("m = A[1] = \\max A[1:1]") + "."],
        ["Sürdürme", m("m = \\max A[1:i-1]") + " olsun. " + m("A[i] > m") + " ise " + m("m") + " " + m("A[i]") + " olur; değilse değişmez. Her iki durumda " + m("m = \\max(\\max A[1:i-1], A[i]) = \\max A[1:i]") + "."],
        ["Sonlanma", "Döngü " + m("i = n+1") + " ile biter: " + m("m = \\max A[1:n]") + " ve 5. satır bunu döndürür. Döngü " + m("n-1") + " kez döner, dolayısıyla sonlanır."]
      ],
      iz: function (R) {
        var A = R.distinct(R.int(6, 8), 1, 50), mm = A[0], s = [];
        for (var i = 1; i < A.length; i++) { s.push([m("i=" + (i + 1)), m("m=" + mm), m("\\max A[1:" + i + "] = " + Math.max.apply(null, A.slice(0, i))), "✓"]); if (A[i] > mm) mm = A[i]; }
        s.push([m("i=" + (A.length + 1)), m("m=" + mm), m("\\max A[1:n] = " + Math.max.apply(null, A)), "✓"]);
        return { girdi: "A = ⟨" + A.join(", ") + "⟩", tablo: izTablo(["döngü başı", "m", "beklenen", ""], s) };
      }
    },
    {
      ad: "HORNER", kaynak: "CLRS Problem 2-3", tur: "dongu",
      kod: function () { return kod("HORNER(a, n, x)", [[0, "y = 0"], [0, "for i = n downto 0"], [1, "y = a[i] + x · y"], [0, "return y"]]); },
      gorev: "HORNER'ın " + m("P(x)=\\sum_{k=0}^{n} a_k x^k") + " değerini hesapladığını kanıtlayın.",
      hipotez: "2–3. satırlardaki döngünün her yinelemesinin başında " + m("y = \\sum_{k=0}^{n-(i+1)} a_{k+i+1}\\, x^{k}") + ".",
      adimlar: [
        ["Başlatma", m("i = n") + ": toplamın üst sınırı " + m("-1") + "; boş toplam " + m("0") + " ve 1. satırda " + m("y=0") + "."],
        ["Sürdürme", "3. satırdan sonra " + m("y' = a_i + x\\sum_{k=0}^{n-i-1} a_{k+i+1}x^k = a_i + \\sum_{k=1}^{n-i} a_{k+i}x^{k} = \\sum_{k=0}^{n-i} a_{k+i}x^k") + ". Bu, " + m("i") + " yerine " + m("i-1") + " yazılmış değişmezdir."],
        ["Sonlanma", m("i = -1") + " olunca: " + m("y=\\sum_{k=0}^{n} a_k x^k = P(x)") + ". ✓"]
      ],
      iz: function (R) {
        var n = R.int(3, 4), a = [], x = R.int(2, 3);
        for (var k = 0; k <= n; k++) a.push(R.int(-3, 5));
        if (a[n] === 0) a[n] = 1;
        var y = 0, s = [];
        for (var i = n; i >= 0; i--) {
          var bek = 0; for (var k2 = 0; k2 <= n - (i + 1); k2++) bek += a[k2 + i + 1] * Math.pow(x, k2);
          s.push([m("i=" + i), m("y=" + y), m(String(bek)), "✓"]); y = a[i] + x * y;
        }
        s.push([m("i=-1"), m("y=" + y), m("P(" + x + ")=" + y), "✓"]);
        return { girdi: m("a = \\langle " + a.join(", ") + "\\rangle") + " (" + m("a_0") + "'dan " + m("a_" + n) + "'e), " + m("x=" + x), tablo: izTablo(["döngü başı", "y", "değişmezin sağ tarafı", ""], s) };
      }
    },
    {
      ad: "FIB", kaynak: "Parberry, Algorithm Correctness", tur: "dongu",
      kod: function () { return kod("FIB(n)", [[0, "if n == 0"], [1, "return 0"], [0, "a = 0"], [0, "b = 1"], [0, "for i = 2 to n"], [1, "c = a + b"], [1, "a = b"], [1, "b = c"], [0, "return b"]]); },
      gorev: "Her " + m("n \\ge 0") + " için FIB(n)'in " + m("F_n") + " (" + m("F_0=0,\\ F_1=1,\\ F_n=F_{n-1}+F_{n-2}") + ") döndürdüğünü kanıtlayın.",
      hipotez: "5–8. satırlardaki döngünün her yinelemesinin başında " + m("a = F_{i-2}") + " ve " + m("b = F_{i-1}") + ".",
      adimlar: [
        ["Başlatma", m("i=2") + ": 3–4. satırlardan " + m("a = 0 = F_0") + ", " + m("b = 1 = F_1") + "."],
        ["Sürdürme", m("c = F_{i-2}+F_{i-1} = F_i") + ", sonra " + m("a = F_{i-1}") + ", " + m("b = F_i") + ": " + m("i+1") + " için değişmez."],
        ["Sonlanma", m("n \\ge 1") + " ise döngü " + m("i = n+1") + " ile biter: " + m("b = F_n") + ". (" + m("n=1") + ": döngü hiç dönmez, " + m("b = 1 = F_1") + "; " + m("n=0") + " ayrıca 1–2. satırlarda.) ✓"]
      ],
      iz: function (R) {
        var n = R.int(6, 10), a = 0, b = 1, s = [], F = [0, 1];
        for (var t = 2; t <= n + 1; t++) F[t] = F[t - 1] + F[t - 2];
        for (var i = 2; i <= n; i++) { s.push([m("i=" + i), m("a=" + a), m("b=" + b), m("F_{" + (i - 2) + "}=" + F[i - 2] + ",\\ F_{" + (i - 1) + "}=" + F[i - 1])]); var c = a + b; a = b; b = c; }
        s.push([m("i=" + (n + 1)), m("a=" + a), m("b=" + b), m("F_{" + n + "}=" + F[n])]);
        return { girdi: m("n = " + n), tablo: izTablo(["döngü başı", "a", "b", "beklenen"], s) };
      }
    },
    {
      ad: "MULTIPLY", kaynak: "Parberry, Algorithm Correctness (Rus köylü çarpması)", tur: "dongu",
      kod: function () { return kod("MULTIPLY(y, z)", [[0, "x = 0"], [0, "while z > 0"], [1, "if z is odd"], [2, "x = x + y"], [1, "y = 2y"], [1, "z = ⌊z/2⌋"], [0, "return x"]]); },
      gorev: m("y, z \\in \\mathbb{N}") + " için MULTIPLY(y, z)'nin " + m("yz") + " döndürdüğünü kanıtlayın.",
      hipotez: m("y_0, z_0") + " başlangıç değerleri, " + m("x_j, y_j, z_j") + " ise " + m("j") + ". yinelemeden sonraki değerler olsun. Her " + m("j \\ge 0") + " için " + m("y_j z_j + x_j = y_0 z_0") + ".",
      adimlar: [
        ["Başlatma (" + m("j=0") + ")", m("x_0 = 0") + " olduğundan " + m("y_0 z_0 + 0 = y_0z_0") + "."],
        ["Sürdürme", "<strong>" + m("z_j") + " çift:</strong> " + m("y_{j+1}z_{j+1} + x_{j+1} = 2y_j\\cdot z_j/2 + x_j = y_jz_j + x_j") + ".<br><strong>" + m("z_j") + " tek:</strong> " + m("2y_j\\cdot (z_j-1)/2 + x_j + y_j = y_jz_j + x_j") + ". İki durumda da " + m("= y_0z_0") + "."],
        ["Sonlanma", m("z") + " her turda kesin azalır (" + m("\\lfloor z/2 \\rfloor < z") + ", " + m("z>0") + ") ve doğal sayıdır; döngü biter. Bittiğinde " + m("z = 0") + ": " + m("x = y_0 z_0") + ". ✓"]
      ],
      iz: function (R) {
        var y = R.int(3, 25), z = R.int(5, 45), y0 = y, z0 = z, x = 0, j = 0, s = [];
        s.push([m(j), m(x), m(y), m(z), m(y * z + x)]);
        while (z > 0) { if (z % 2) x += y; y *= 2; z = Math.floor(z / 2); j++; s.push([m(j), m(x), m(y), m(z), m(y * z + x)]); }
        return { girdi: m("y_0=" + y0 + ",\\ z_0=" + z0 + ",\\ y_0z_0=" + (y0 * z0)), tablo: izTablo(["j", "x", "y", "z", m("yz+x")], s) };
      }
    },
    {
      ad: "EUCLID", kaynak: "CLRS 31.2 / POA 5", tur: "dongu",
      kod: function () { return kod("EUCLID(a, b)", [[0, "while b ≠ 0"], [1, "t = b"], [1, "b = a mod b"], [1, "a = t"], [0, "return a"]]); },
      gorev: m("a \\ge b \\ge 0") + ", " + m("a > 0") + " tam sayılar için EUCLID'in " + m("\\gcd(a,b)") + " döndürdüğünü kanıtlayın.",
      hipotez: "Döngünün her yinelemesinin başında " + m("\\gcd(a, b) = \\gcd(a_0, b_0)") + ".",
      adimlar: [
        ["Yardımcı olgu", m("b>0") + " için " + m("\\gcd(a, b) = \\gcd(b, a \\bmod b)") + ": " + m("a = qb + r") + " olduğundan " + m("a") + " ve " + m("b") + "'nin ortak bölenleri ile " + m("b") + " ve " + m("r") + "'nin ortak bölenleri aynıdır."],
        ["Başlatma", "Döngüden önce " + m("a=a_0, b=b_0") + ". ✓"],
        ["Sürdürme", "Bir tur " + m("(a,b)") + " çiftini " + m("(b, a \\bmod b)") + " yapar; yardımcı olguyla gcd korunur."],
        ["Sonlanma", m("b") + " negatif olmayan bir tam sayıdır ve her turda kesin azalır (" + m("a \\bmod b < b") + ") ⇒ döngü biter. Bittiğinde " + m("b = 0") + " ve " + m("\\gcd(a, 0) = a") + ": dönen değer " + m("\\gcd(a_0,b_0)") + ". ✓"]
      ],
      iz: function (R) {
        var g = R.int(2, 9), a = g * R.int(5, 30), b = g * R.int(2, 15); if (b > a) { var t0 = a; a = b; b = t0; }
        var a0 = a, b0 = b, s = [];
        function G(x, y) { while (y) { var t = y; y = x % y; x = t; } return x; }
        while (true) { s.push([m(a), m(b), m("\\gcd=" + G(a, b))]); if (b === 0) break; var t = b; b = a % b; a = t; }
        return { girdi: m("a_0=" + a0 + ",\\ b_0=" + b0), tablo: izTablo(["a", "b", m("\\gcd(a,b)")], s) };
      }
    },
    {
      ad: "BINARY-SEARCH", kaynak: "CLRS Alıştırma 2.3-6", tur: "dongu",
      kod: function () {
        return kod("BINARY-SEARCH(A, n, x)", [[0, "lo = 1"], [0, "hi = n"], [0, "while lo ≤ hi"], [1, "mid = ⌊(lo + hi)/2⌋"], [1, "if A[mid] == x"],
          [2, "return mid"], [1, "elseif A[mid] < x"], [2, "lo = mid + 1"], [1, "else hi = mid − 1"], [0, "return NIL"]]);
      },
      gorev: m("A[1:n]") + " sıralı iken BINARY-SEARCH'ün, " + m("x") + " dizide varsa onun bir indisini, yoksa NIL döndürdüğünü kanıtlayın.",
      hipotez: "Döngünün her yinelemesinin başında: " + m("x") + " " + m("A[1:n]") + "'de varsa, " + m("x \\in A[lo : hi]") + ".",
      adimlar: [
        ["Başlatma", m("lo=1, hi=n") + ": " + m("A[lo:hi] = A[1:n]") + ". ✓"],
        ["Sürdürme", m("A[mid] = x") + " ise doğru indis döner. " + m("A[mid] < x") + " ise dizi sıralı olduğundan " + m("A[lo:mid]") + "'deki her eleman " + m("< x") + "; " + m("x") + " varsa " + m("A[mid+1 : hi]") + "'dedir. " + m("A[mid] > x") + " durumu simetrik."],
        ["Sonlanma", m("hi - lo + 1") + " her turda en az 1 azalır ⇒ döngü biter. " + m("lo > hi") + " ile biterse " + m("A[lo:hi]") + " boştur; değişmezden " + m("x") + " dizide yoktur ve NIL doğru yanıttır. ✓"]
      ],
      iz: function (R) {
        var n = R.int(8, 11), A = R.distinct(n, 1, 60).sort(function (p, q) { return p - q; });
        var x = R.f() < 0.6 ? A[R.int(0, n - 1)] : R.int(1, 60);
        var lo = 1, hi = n, s = [], son = "NIL";
        while (lo <= hi) {
          var mid = Math.floor((lo + hi) / 2), vur = {};
          for (var t = lo - 1; t < hi; t++) vur[t] = "v-aralik"; vur[mid - 1] = "v-pivot";
          s.push([m(lo), m(hi), m(mid), dizi(A, vur)]);
          if (A[mid - 1] === x) { son = mid; break; } else if (A[mid - 1] < x) lo = mid + 1; else hi = mid - 1;
        }
        if (son === "NIL") s.push([m(lo), m(hi), "—", "boş aralık"]);
        return { girdi: "A = ⟨" + A.join(", ") + "⟩, " + m("x=" + x) + " → sonuç: " + son, tablo: izTablo(["lo", "hi", "mid", "A (mavi: " + m("A[lo:hi]") + ", turuncu: mid)"], s) };
      }
    },
    {
      ad: "FAST-POWER", kaynak: "Katz, Ders 14 (hızlı üs alma)", tur: "dongu",
      kod: function () { return kod("FAST-POWER(x, n)", [[0, "r = 1"], [0, "b = x"], [0, "e = n"], [0, "while e > 0"], [1, "if e is odd"], [2, "r = r · b"], [1, "b = b · b"], [1, "e = ⌊e/2⌋"], [0, "return r"]]); },
      gorev: m("n \\ge 0") + " için FAST-POWER(x, n)'nin " + m("x^n") + " döndürdüğünü ve " + m("O(\\lg n)") + " turda bittiğini kanıtlayın.",
      hipotez: "Döngünün her yinelemesinin başında " + m("r \\cdot b^{e} = x^{n}") + ".",
      adimlar: [
        ["Başlatma", m("r=1, b=x, e=n") + ": " + m("1\\cdot x^n = x^n") + ". ✓"],
        ["Sürdürme", "<strong>" + m("e") + " çift:</strong> " + m("r (b^2)^{e/2} = r b^e") + ". <strong>" + m("e") + " tek:</strong> " + m("(rb)(b^2)^{(e-1)/2} = r b^{e}") + ". Her iki durumda değişmez korunur."],
        ["Sonlanma", m("e") + " her turda yarıya iner ⇒ en çok " + m("\\lfloor \\lg n \\rfloor + 1") + " tur. Bittiğinde " + m("e=0") + ": " + m("r = x^n") + ". ✓"]
      ],
      iz: function (R) {
        var x = R.int(2, 3), n = R.int(9, 25), r = 1n, b = BigInt(x), e = n, s = [], X = BigInt(x);
        function P(v, k) { var p = 1n; for (var i = 0; i < k; i++) p *= v; return p; }
        while (true) { s.push([m(String(r)), m(String(b)), m(e), m(String(r * P(b, e)))]); if (e === 0) break; if (e % 2) r *= b; b *= b; e = Math.floor(e / 2); }
        return { girdi: m("x=" + x + ",\\ n=" + n + ",\\ x^n=" + String(P(X, n))), tablo: izTablo(["r", "b", "e", m("r\\cdot b^e")], s) };
      }
    },
    {
      ad: "SELECTION-SORT", kaynak: "CLRS Alıştırma 2.2-2 / GeeksforGeeks", tur: "dongu",
      kod: function () {
        return kod("SELECTION-SORT(A, n)", [[0, "for i = 1 to n − 1"], [1, "min = i"], [1, "for j = i + 1 to n"], [2, "if A[j] < A[min]"], [3, "min = j"], [1, "exchange A[i] with A[min]"]]);
      },
      gorev: "SELECTION-SORT'un " + m("A[1:n]") + "'yi sıraladığını kanıtlayın.",
      hipotez: "<strong>Dış döngü:</strong> her yinelemenin başında " + m("A[1:i-1]") + " dizinin en küçük " + m("i-1") + " elemanını sıralı olarak içerir. <strong>İç döngü:</strong> her yinelemenin başında " + m("A[min] = \\min A[i : j-1]") + ".",
      adimlar: [
        ["İç döngü", "Başlatma: " + m("j=i+1") + ", " + m("min=i") + " ⇒ " + m("A[min]=\\min A[i:i]") + ". Sürdürme: 4–5. satırlar daha küçük bir eleman görünce " + m("min") + "'i günceller. Sonlanma: " + m("j=n+1") + " ⇒ " + m("A[min]=\\min A[i:n]") + "."],
        ["Dış döngü — başlatma", m("i=1") + ": " + m("A[1:0]") + " boştur. ✓"],
        ["Dış döngü — sürdürme", "İç döngüden " + m("A[min] = \\min A[i:n]") + "; 6. satır onu " + m("A[i]") + "'ye koyar. " + m("A[i:n]") + "'deki her eleman " + m("A[1:i-1]") + "'dekilerden küçük değildir (değişmez); dolayısıyla " + m("A[1:i]") + " en küçük " + m("i") + " elemanı sıralı içerir."],
        ["Sonlanma", m("i = n") + ": " + m("A[1:n-1]") + " en küçük " + m("n-1") + " eleman, sıralı; " + m("A[n]") + " kalan en büyük eleman ⇒ tüm dizi sıralı. ✓"]
      ],
      iz: function (R) {
        var A = R.distinct(R.int(6, 7), 1, 40), a = A.slice(), s = [];
        for (var i = 0; i < a.length - 1; i++) {
          var mn = i; for (var j = i + 1; j < a.length; j++) if (a[j] < a[mn]) mn = j;
          var vur = {}; for (var t = 0; t < i; t++) vur[t] = "v-sirali"; vur[mn] = "v-pivot";
          s.push([m("i=" + (i + 1)), m("min=" + (mn + 1)), dizi(a, vur)]);
          var tt = a[i]; a[i] = a[mn]; a[mn] = tt;
        }
        var v2 = {}; a.forEach(function (_, t) { v2[t] = "v-sirali"; });
        s.push([m("i=" + a.length), "", dizi(a, v2)]);
        return { girdi: "A = ⟨" + A.join(", ") + "⟩", tablo: izTablo(["dış tur", "bulunan min", "A (yeşil: " + m("A[1:i-1]") + ", turuncu: min)"], s) };
      }
    },
    {
      ad: "PARTITION", kaynak: "CLRS 7.1 (Lomuto)", tur: "dongu",
      kod: function () {
        return kod("PARTITION(A, p, r)", [[0, "x = A[r]"], [0, "i = p − 1"], [0, "for j = p to r − 1"], [1, "if A[j] ≤ x"], [2, "i = i + 1"], [2, "exchange A[i] with A[j]"],
          [0, "exchange A[i + 1] with A[r]"], [0, "return i + 1"]]);
      },
      gorev: "PARTITION'ın döndürdüğü " + m("q") + " için " + m("A[p:q-1] \\le A[q] < A[q+1:r]") + " olduğunu kanıtlayın.",
      hipotez: "3–6. satırlardaki döngünün her yinelemesinin başında, her " + m("k") + " için: (1) " + m("p \\le k \\le i \\Rightarrow A[k] \\le x") + "; (2) " + m("i+1 \\le k \\le j-1 \\Rightarrow A[k] > x") + "; (3) " + m("k = r \\Rightarrow A[k] = x") + ".",
      adimlar: [
        ["Başlatma", m("i = p-1, j = p") + ": (1) ve (2)'deki aralıklar boştur; (3) 1. satırdan. ✓"],
        ["Sürdürme", m("A[j] > x") + " ise yalnızca " + m("j") + " artar; " + m("A[j]") + " (2). bölgeye katılır. " + m("A[j] \\le x") + " ise " + m("i") + " artar, " + m("A[i]") + " (büyükler bölgesinin ilk elemanı) ile " + m("A[j]") + " yer değiştirir: küçük eleman (1). bölgeye, büyük eleman (2). bölgenin sonuna geçer."],
        ["Sonlanma", m("j = r") + ": her eleman üç bölgeden birindedir. 7. satır pivotu iki bölgenin arasına koyar ⇒ " + m("A[p:i] \\le x = A[i+1] < A[i+2:r]") + "; " + m("q=i+1") + " döner. ✓"]
      ],
      iz: function (R) {
        var A = R.distinct(R.int(7, 8), 1, 40), a = A.slice(), r = a.length - 1, x = a[r], i = -1, s = [];
        function v(jj) { var o = {}; for (var k = 0; k <= i; k++) o[k] = "v-sirali"; for (var k2 = i + 1; k2 < jj; k2++) o[k2] = "v-buyuk"; o[r] = "v-pivot"; return o; }
        for (var j = 0; j < r; j++) { s.push([m("j=" + (j + 1)), m("i=" + (i + 1)), dizi(a, v(j))]); if (a[j] <= x) { i++; var t = a[i]; a[i] = a[j]; a[j] = t; } }
        s.push([m("j=" + (r + 1)), m("i=" + (i + 1)), dizi(a, v(r))]);
        var t2 = a[i + 1]; a[i + 1] = a[r]; a[r] = t2;
        var o2 = {}; for (var k = 0; k < a.length; k++) o2[k] = k < i + 1 ? "v-sirali" : (k === i + 1 ? "v-pivot" : "v-buyuk");
        s.push(["7. satır", m("q=" + (i + 2)), dizi(a, o2)]);
        return { girdi: "A = ⟨" + A.join(", ") + "⟩, " + m("p=1, r=" + A.length) + ", pivot " + m("x=" + x), tablo: izTablo(["döngü başı", "i", "A (yeşil: ≤ x, kırmızı: > x, turuncu: pivot)"], s) };
      }
    },
    {
      ad: "POWER-REC", kaynak: "POA 5.2.1", tur: "ozyineleme",
      kod: function () {
        return kod("POWER-REC(x, n)", [[0, "if n == 0"], [1, "return 1"], [0, "if n is even"], [1, "y = POWER-REC(x, n/2)"], [1, "return y · y"], [0, "else return x · POWER-REC(x, n − 1)"]]);
      },
      gorev: "Her " + m("n \\ge 0") + " için POWER-REC(x, n)'nin " + m("x^n") + " döndürdüğünü kanıtlayın.",
      hipotez: "<strong>İddia</strong> " + m("P(n)") + ": POWER-REC(x, n) " + m("x^n") + " döndürür. " + m("n") + " üzerinde <strong>güçlü tümevarım</strong> kullanacağız (özyinelemeli çağrı " + m("n/2") + " ya da " + m("n-1") + " ile yapılır).",
      adimlar: [
        ["Taban", m("n = 0") + ": 2. satır " + m("1 = x^0") + " döndürür. ✓"],
        ["Tümevarım hipotezi", "Her " + m("0 \\le m < n") + " için POWER-REC(x, m) = " + m("x^m") + "."],
        ["Tümevarım adımı", m("n") + " çift ve " + m("n>0") + ": " + m("n/2 < n") + ", hipotezden " + m("y = x^{n/2}") + " ve " + m("y\\cdot y = x^n") + ". " + m("n") + " tek: " + m("n-1 < n") + ", " + m("x \\cdot x^{n-1} = x^n") + ". ✓"],
        ["Sonlanma", "Her çağrıda ikinci argüman kesin azalan bir doğal sayıdır ⇒ özyineleme biter (derinlik " + m("O(\\lg n)") + ")."]
      ],
      iz: function (R) {
        var x = R.int(2, 3), n = R.int(10, 27), s = [];
        function P(nn, dd) {
          var satir = [m(dd), "POWER-REC(" + x + ", " + nn + ")", "", m(x + "^{" + nn + "}")], sonuc;
          s.push(satir);
          if (nn === 0) sonuc = 1n; else if (nn % 2 === 0) { var y = P(nn / 2, dd + 1); sonuc = y * y; } else sonuc = BigInt(x) * P(nn - 1, dd + 1);
          satir[2] = m(String(sonuc)); return sonuc;
        }
        P(n, 0);
        return { girdi: m("x=" + x + ",\\ n=" + n), tablo: izTablo(["derinlik", "çağrı", "dönen değer", "beklenen"], s) };
      }
    },
    {
      ad: "REC-MAX", kaynak: "Parberry, Algorithm Correctness", tur: "ozyineleme",
      kod: function () { return kod("REC-MAX(A, n)", [[0, "if n == 1"], [1, "return A[1]"], [0, "m = REC-MAX(A, n − 1)"], [0, "if A[n] > m"], [1, "return A[n]"], [0, "else return m"]]); },
      gorev: "Her " + m("n \\ge 1") + " için REC-MAX(A, n)'nin " + m("\\max A[1:n]") + " döndürdüğünü kanıtlayın.",
      hipotez: "<strong>İddia</strong> " + m("P(n)") + ": REC-MAX(A, n) = " + m("\\max A[1:n]") + ". " + m("n") + " üzerinde tümevarım.",
      adimlar: [
        ["Taban", m("n=1") + ": " + m("A[1] = \\max A[1:1]") + ". ✓"],
        ["Tümevarım hipotezi", "REC-MAX(A, n−1) = " + m("\\max A[1:n-1]") + " (" + m("n \\ge 2") + ")."],
        ["Tümevarım adımı", "3. satırda " + m("m = \\max A[1:n-1]") + "; 4–6. satırlar " + m("\\max(m, A[n]) = \\max A[1:n]") + " döndürür. ✓"],
        ["Sonlanma", "Her çağrı " + m("n") + "'yi 1 azaltır; " + m("n = 1") + "'de durur."]
      ],
      iz: function (R) {
        var A = R.distinct(R.int(6, 8), 1, 50), s = [];
        for (var k = 1; k <= A.length; k++) s.push([m("n=" + k), m(Math.max.apply(null, A.slice(0, k))), k === 1 ? "taban" : "max(" + Math.max.apply(null, A.slice(0, k - 1)) + ", " + A[k - 1] + ")"]);
        return { girdi: "A = ⟨" + A.join(", ") + "⟩ (çağrılar " + m("n") + "'den 1'e iner, dönüşler 1'den " + m("n") + "'ye çıkar)", tablo: izTablo(["çağrı", "dönen değer", "hesap"], s) };
      }
    },
    {
      ad: "LINEAR-SEARCH", kaynak: "CLRS Alıştırma 2.1-4", tur: "dongu",
      kod: function () { return kod("LINEAR-SEARCH(A, n, x)", [[0, "for i = 1 to n"], [1, "if A[i] == x"], [2, "return i"], [0, "return NIL"]]); },
      gorev: "LINEAR-SEARCH'ün " + m("x") + " varsa ilk geçtiği indisi, yoksa NIL döndürdüğünü kanıtlayın.",
      hipotez: "Döngünün her yinelemesinin başında " + m("x \\notin A[1 : i-1]") + ".",
      adimlar: [
        ["Başlatma", m("i=1") + ": " + m("A[1:0]") + " boş. ✓"],
        ["Sürdürme", m("A[i] = x") + " ise " + m("i") + " döner; bu, ilk geçiş yeridir çünkü " + m("x \\notin A[1:i-1]") + ". Değilse " + m("x \\notin A[1:i]") + " ve " + m("i") + " artar."],
        ["Sonlanma", "Döngü " + m("i = n+1") + " ile biterse " + m("x \\notin A[1:n]") + " ⇒ NIL doğrudur. ✓"]
      ],
      iz: function (R) {
        var A = []; for (var k = 0; k < R.int(7, 9); k++) A.push(R.int(1, 12));
        var x = R.f() < 0.6 ? A[R.int(2, A.length - 1)] : 13, s = [];
        for (var i = 0; i < A.length; i++) { var vur = {}; for (var t = 0; t < i; t++) vur[t] = "v-sirali"; vur[i] = "v-pivot"; s.push([m("i=" + (i + 1)), dizi(A, vur), A[i] === x ? "bulundu → " + (i + 1) : ""]); if (A[i] === x) break; }
        if (A.indexOf(x) < 0) s.push([m("i=" + (A.length + 1)), "", "NIL"]);
        return { girdi: "A = ⟨" + A.join(", ") + "⟩, " + m("x=" + x), tablo: izTablo(["döngü başı", "A (yeşil: " + m("x") + " olmadığı bilinen kısım)", ""], s) };
      }
    }
  ];

  function uretDogruluk(R) {
    var it = R.pick(DOGRULUK), iz = it.iz(R);
    var soru = '<p class="vize-kaynak"><span class="etiket">' + esc(it.kaynak) + "</span></p>" + it.kod() +
      '<div class="kutu soru"><span class="kutu-baslik">Görev</span>' + it.gorev + "</div>" +
      '<p class="kucuk">İpucu: ' + (it.tur === "dongu" ? "bir <strong>döngü değişmezi</strong> (hipotez) yazın; başlatma, sürdürme, sonlanma." : "<strong>tümevarım</strong> iddiası yazın; taban, hipotez, adım, sonlanma.") + "</p>";
    var c = adim("Hipotez " + (it.tur === "dongu" ? "(döngü değişmezi)" : "(tümevarım iddiası)"), '<div class="kutu teorem">' + it.hipotez + "</div>");
    it.adimlar.forEach(function (a) { c += adim(a[0], "<p>" + a[1] + "</p>"); });
    c += adim("Sayısal izleme: hipotez rastgele bir girdide", "<p>Girdi: " + iz.girdi + "</p>" + iz.tablo);
    return { soru: soru, cozum: c, baslik: it.ad };
  }

  window.VIZE = window.VIZE || {};
  var V = window.VIZE;
  V._yard = { Rng: Rng, esc: esc, m: m, M: M, kod: kod, adim: adim, tablo: tablo, dizi: dizi, cEditor: cEditor, Fr: Fr, fAdd: fAdd, fMul: fMul, fTex: fTex,
    polyTex: polyTex, polyEval: polyEval, polyAdd: polyAdd, polyMul: polyMul, polyShift: polyShift, binom: binom, gcd: gcd,
    sifirla: function () { adimNo = 0; } };
  V.uretec = V.uretec || {};
  V.hatalar = [];
  V.uretec.dogruluk = uretDogruluk;
})();

