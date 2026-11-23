/* =====================================================================
   DERS ORTAK TEMELİ — tohumlu rastgele soru üretimi ve soru kodu
   Asıl dosya: ~/.claude/ders-tasarim/tohum.js
   Derslerdeki kopyaları uygula.py yazar; kopyada değişiklik yapmayın.

   Amaç: aynı tohum her zaman aynı soruyu üretir. Öğrenci gördüğü sorunun
   KODUNU (ör. SD-fsm-48213 ya da sürümlü SD-fsm.2-48213) hocaya iletir;
   hoca kodu aynı alıştırmanın "Soru no" kutusuna yazıp soruyu birebir açar.

   Kullanım:
     TOHUM.Rng(t)            → {f, int(a,b), pick, shuffle, sample, distinct}  (AaT ile aynı)
     TOHUM.ile(t, fn)        → fn'i Math.random tohumlanmış hâldeyken çalıştırır
                               (Math.random kullanan eski üreticiler için; sonra eski hâline döner)
     TOHUM.yeni()            → 1..99999 arası rastgele tohum
     TOHUM.kod(tur, t, s)    → "SD-fsm-48213" (s > 1 ise "SD-fsm.2-48213")
     TOHUM.coz("SD-fsm-48213") → {ders, tur, surum, tohum}  ya da yalnız sayı yazıldıysa {tohum}
     TOHUM.numaradan(no, odev) → öğrenci numarasından (ve ödev adından) türetilen tohum
     TOHUM.url(tur)          → ?soru=SD-fsm-48213 bağlantısında bu türün tohumu (yoksa null)
     TOHUM.arac(host, {tur, surum, tohum, yenile}) → "Soru kodu" araç çubuğu (yenile(t) çağırır)

   Ders kısaltması BÜYÜK harftir: <meta name="ders-kod" content="SD"> ya da TOHUM.ders = "SD".
   Tür adı küçük harfle başlar (Türkçe harf ve tire olabilir): "fsm", "dp", "sıralama".
   Üretici değiştiğinde eski kodlar başka soru üretir: üreticiyi değiştirince
   sürümünü artırın (data-surum="2" ya da arac(..., {surum: 2})).
   ===================================================================== */
(function () {
  "use strict";
  if (window.TOHUM) return;

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function Rng(tohum) {
    var r = mulberry32(tohum >>> 0);
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

  var asilRandom = Math.random, derinlik = 0;
  function ile(tohum, fn) {
    var eski = Math.random;
    Math.random = mulberry32(tohum >>> 0);
    derinlik++;
    try { return fn(); }
    finally { derinlik--; Math.random = derinlik ? eski : asilRandom; }
  }

  function yeni() {
    try {
      var u = new Uint32Array(1); crypto.getRandomValues(u);
      return 1 + (u[0] % 99999);
    } catch (e) { return 1 + Math.floor(asilRandom() * 99999); }
  }

  /* FNV-1a 32 bit: öğrenci numarasından tohum (gizli değildir; amaç her öğrenciye
     farklı ama tekrar üretilebilir soru vermek) */
  function fnv(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }
  function numaradan(numara, odev) {
    var n = String(numara).replace(/\s+/g, "");
    return 1 + (fnv((odev || "") + "|" + n) % 999999);
  }

  function dersKodu() {
    if (T.ders) return T.ders;
    var m = document.querySelector('meta[name="ders-kod"]');
    return m ? m.getAttribute("content") : "";
  }

  function kod(tur, tohum, surum) {
    var d = dersKodu();
    return (d ? d + "-" : "") + tur + (surum > 1 ? "." + surum : "") + "-" + tohum;
  }

  function coz(metin) {
    var s = String(metin || "").trim();
    if (/^\d+$/.test(s)) return { tohum: parseInt(s, 10) };
    // Ders kodu BÜYÜK harf (SD, AAT); tür adı küçük harfle başlar, Türkçe harf ve tire içerebilir
    var m = /^(?:([A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9]*)-)?([a-zçğıöşü0-9][a-zçğıöşü0-9_-]*?)(?:\.(\d+))?-(\d+)$/.exec(s);
    if (!m) return null;
    return { ders: m[1] || "", tur: m[2], surum: m[3] ? parseInt(m[3], 10) : 1, tohum: parseInt(m[4], 10) };
  }

  function url(tur) {
    var m = /[?&]soru=([^&#]+)/.exec(location.search);
    if (!m) return null;
    var c = coz(decodeURIComponent(m[1]));
    return c && c.tur === tur ? c.tohum : null;
  }

  function el(ad, sinif, metin) {
    var e = document.createElement(ad);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    return e;
  }

  /* "Soru kodu" araç çubuğu. secenek: {tur, surum, tohum, yenile(t)} */
  function arac(host, sec) {
    var kutu = el("div", "tohum-arac");
    var etiket = el("span", "tohum-etiket", "Soru kodu");
    var kodEl = el("code", "tohum-kod", kod(sec.tur, sec.tohum, sec.surum || 1));
    kodEl.title = "Bu soruyu hocanıza sorarken bu kodu iletin";
    var kopya = el("button", "link tohum-kopya", "kopyala");
    kopya.type = "button";
    kopya.addEventListener("click", function () {
      var t = kodEl.textContent;
      var olmadi = function () { kopya.textContent = t; };   // pano izni yoksa kodu göster
      try { navigator.clipboard.writeText(t).then(function () { kopya.textContent = "kopyalandı"; }, olmadi); }
      catch (e) { olmadi(); }
      setTimeout(function () { kopya.textContent = "kopyala"; }, 1500);
    });
    var girdi = el("input", "tohum-girdi");
    girdi.type = "text"; girdi.placeholder = "kod ya da no"; girdi.autocomplete = "off"; girdi.spellcheck = false;
    girdi.setAttribute("aria-label", "Soru kodu ya da numarası");
    var ac = el("button", "link tohum-ac", "Aç");
    ac.type = "button";
    var msg = el("span", "tohum-mesaj");
    function dene() {
      var c = coz(girdi.value);
      if (!c) { msg.textContent = "Kod tanınmadı"; return; }
      if (c.tur && c.tur !== sec.tur) { msg.textContent = "Bu kod başka bir alıştırmanın (" + c.tur + ")"; return; }
      if (c.tur && (c.surum || 1) !== (sec.surum || 1)) msg.textContent = "Uyarı: kod üreticinin başka sürümünden; soru farklı olabilir";
      else msg.textContent = "";
      sec.yenile(c.tohum);
    }
    girdi.addEventListener("keydown", function (e) {
      e.stopPropagation();                 // reveal.js kısayolları çalışmasın
      if (e.key === "Enter") dene();
    });
    ac.addEventListener("click", dene);
    kutu.append(etiket, kodEl, kopya, girdi, ac, msg);
    host.append(kutu);
    return kutu;
  }

  /* Bir kez: araç çubuğu stili (ortak değişkenleri kullanır) */
  (function stil() {
    var s = document.createElement("style");
    s.textContent =
      ".tohum-arac{display:flex;flex-wrap:wrap;align-items:center;gap:.35em .6em;flex-basis:100%;width:100%;font-size:.8em;margin:.35em 0 .1em;color:var(--muted,#444)}" +
      ".tohum-kod{font-weight:600;color:var(--ink,#111);background:var(--panel,#f3f3f3);padding:0 .35em;border-radius:3px;user-select:all}" +
      ".tohum-girdi{width:9em;font:inherit;padding:.05em .3em;border:1px solid var(--rule,#999);border-radius:3px;background:var(--bg,#fff);color:var(--ink,#111)}" +
      ".tohum-arac button.link{font:inherit;background:none;border:0;padding:0;color:var(--accent,#0645ad);text-decoration:underline;cursor:pointer}" +
      ".tohum-mesaj{color:var(--err,#b00020)}";
    (document.head || document.documentElement).appendChild(s);
  })();

  var T = window.TOHUM = {
    ders: "",
    mulberry32: mulberry32, Rng: Rng, ile: ile, yeni: yeni,
    numaradan: numaradan, kod: kod, coz: coz, url: url, arac: arac
  };
})();

