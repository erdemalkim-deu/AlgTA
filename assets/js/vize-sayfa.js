/* Vize hazırlık — slayt yöneticisi: araç çubuğu, tohumlu soru üretimi, çözüm adımlarının kumandayla gösterimi */
(function () {
  "use strict";
  var V = window.VIZE, Y = V._yard, T = window.TOHUM;
  var RNG = T ? T.Rng : Y.Rng;          // ortak tohum.js ile aynı üretici (mulberry32)

  function rastgeleTohum() { return T ? T.yeni() : 1 + Math.floor(Math.random() * 99999); }
  function kodu(tip, t) { return T ? T.kod(tip, t, 1) : tip + "-" + t; }
  /* ?soru=BIL3015-dp-48213 yalnız o türün slaytına; eski ?tohum=48213 bütün slaytlara uygulanır */
  function urlTohum(tip) {
    var s = T && T.url(tip); if (s) return s;
    var m = /[?&]tohum=(\d+)/.exec(location.search); return m ? parseInt(m[1], 10) : null;
  }

  function uret(sec, tohum) {
    var tip = sec.getAttribute("data-uretici"), res;
    Y.sifirla();
    V.hatalar = [];
    try { res = V.uretec[tip](RNG(tohum)); }
    catch (e) { res = { soru: '<p class="vurgu">Üretim hatası: ' + Y.esc(e.message) + "</p>", cozum: "", baslik: "hata" }; console.error(e); }
    sec.querySelector(".vize-soru").innerHTML = res.soru;
    sec.querySelector(".vize-cozum").innerHTML = res.cozum;
    sec.querySelector(".vize-no").value = "";
    sec.querySelector(".vize-kod").textContent = kodu(tip, tohum);
    sec.querySelector(".vize-mesaj").textContent = "";
    var alt = sec.querySelector(".vize-alt"); if (alt) alt.textContent = res.baslik ? "— " + res.baslik : "";
    sec.setAttribute("data-tohum", tohum);
    if (V.hatalar.length) console.warn("VIZE iç denetim:", tip, tohum, V.hatalar);
    return res;
  }

  function yenidenIsle(sec) {     // Reveal hazır olduktan sonra yapılan üretimlerde
    if (!window.AAT) return;
    AAT.yordamAdlari(sec); AAT.matematik(sec);
    Array.prototype.forEach.call(sec.querySelectorAll(".c-editor"), function (el) { AAT.editorKur(el, "vize-" + sec.getAttribute("data-uretici")); });
    if (window.Reveal && Reveal.isReady()) {
      Reveal.sync();
      var idx = Reveal.getIndices(sec);
      if (Reveal.getCurrentSlide() === sec) Reveal.slide(idx.h, idx.v || 0, -1);
    }
    sec.querySelector(".vize-cozum").scrollTop = 0;
    sec.querySelector(".vize-soru").scrollTop = 0;
  }

  function kur(sec) {
    var arac = sec.querySelector(".vize-arac");
    arac.innerHTML = '<button class="vize-yeni" title="Yeni rastgele soru">🎲 Yeni soru</button>' +
      '<span class="vize-etiket">Soru kodu</span><code class="vize-kod" title="Bu soruyu hocanıza sorarken bu kodu iletin"></code>' +
      '<button class="vize-kopya" title="Soru kodunu kopyala">kopyala</button>' +
      '<input class="vize-no" type="text" placeholder="kod ya da no" autocomplete="off" spellcheck="false" aria-label="Soru kodu ya da numarası"><button class="vize-git">Aç</button>' +
      '<button class="vize-hepsi" title="Tüm çözüm adımlarını göster">Tüm adımlar</button><button class="vize-gizle" title="Çözümü gizle">Çözümü gizle</button>';
    var no = arac.querySelector(".vize-no");
    no.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") arac.querySelector(".vize-git").click(); });
    function tazele(t) { uret(sec, t); yenidenIsle(sec); }
    arac.querySelector(".vize-yeni").addEventListener("click", function (e) { e.currentTarget.blur(); tazele(rastgeleTohum()); });
    var tip = sec.getAttribute("data-uretici"), mesaj = document.createElement("span");
    mesaj.className = "vize-mesaj"; arac.appendChild(mesaj);
    arac.querySelector(".vize-git").addEventListener("click", function (e) {
      e.currentTarget.blur();
      var s = no.value.trim(), c = T ? T.coz(s) : (/^\d+$/.test(s) ? { tohum: parseInt(s, 10) } : null);
      if (!c || !(c.tohum > 0)) { mesaj.textContent = "Kod tanınmadı"; return; }
      if (c.tur && c.tur !== tip) { mesaj.textContent = "Bu kod başka bir soru türünün (" + c.tur + ")"; return; }
      tazele(c.tohum);
    });
    arac.querySelector(".vize-kopya").addEventListener("click", function (e) {
      var b = e.currentTarget, k = sec.querySelector(".vize-kod").textContent; b.blur();
      var olmadi = function () { mesaj.textContent = k; };
      try { navigator.clipboard.writeText(k).then(function () { b.textContent = "kopyalandı"; }, olmadi); } catch (x) { olmadi(); }
      setTimeout(function () { b.textContent = "kopyala"; }, 1500);
    });
    arac.querySelector(".vize-hepsi").addEventListener("click", function (e) {
      e.currentTarget.blur();
      var idx = Reveal.getIndices(sec), n = sec.querySelectorAll(".fragment").length;
      Reveal.slide(idx.h, idx.v || 0, n - 1);
    });
    arac.querySelector(".vize-gizle").addEventListener("click", function (e) {
      e.currentTarget.blur();
      var idx = Reveal.getIndices(sec); Reveal.slide(idx.h, idx.v || 0, -1);
      sec.querySelector(".vize-cozum").scrollTop = 0;
    });
    uret(sec, urlTohum(tip) || rastgeleTohum());
  }

  function kaydir(e) {     // gösterilen adımı çözüm panelinde görünür yap
    var f = e.fragment, p = f && f.closest(".vize-cozum");
    if (!p) return;
    var hedef = f.classList.contains("vize-adim") ? f : (f.closest(".vize-adim") || f);
    var ust = hedef.offsetTop, alt = ust + hedef.offsetHeight;
    if (e.type === "fragmentshown") {
      if (f !== hedef) { ust = f.offsetTop + (f.offsetParent === p ? 0 : 0); }
      if (alt > p.scrollTop + p.clientHeight || ust < p.scrollTop) p.scrollTo({ top: Math.max(0, Math.min(ust - 8, alt - p.clientHeight + 8)), behavior: "smooth" });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll(".vize-slayt"), kur);
    var bekle = function () {
      if (!window.Reveal || !Reveal.isReady || !Reveal.isReady()) return setTimeout(bekle, 100);
      Reveal.on("fragmentshown", kaydir);
      Reveal.on("fragmenthidden", function (e) {
        var p = e.fragment.closest(".vize-cozum"); if (!p) return;
        var onceki = Array.prototype.filter.call(p.querySelectorAll(".vize-adim.visible"), function () { return true; }).pop();
        p.scrollTo({ top: onceki ? Math.max(0, onceki.offsetTop - 8) : 0, behavior: "smooth" });
      });
    };
    bekle();
  });

  /* ---- Test modu: VIZE.test(n) her üreteci n tohumla çalıştırır, KaTeX ve iç denetim hatalarını toplar ---- */
  V.test = function (n) {
    var sonuc = { hata: [], c: [] }, tipler = Object.keys(V.uretec);
    tipler.forEach(function (tip) {
      for (var t = 1; t <= n; t++) {
        Y.sifirla(); V.hatalar = [];
        var r;
        try { r = V.uretec[tip](RNG(t)); } catch (e) { sonuc.hata.push(tip + "#" + t + ": istisna " + e.message); continue; }
        V.hatalar.forEach(function (h) { sonuc.hata.push(tip + "#" + t + ": " + h); });
        var html = r.soru + r.cozum, re = /\\\((.+?)\\\)|\\\[(.+?)\\\]/gs, mt;
        while ((mt = re.exec(html))) {
          var tex = (mt[1] !== undefined ? mt[1] : mt[2]).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
          try { katex.renderToString(tex, { throwOnError: true, displayMode: mt[2] !== undefined, strict: false, trust: function (c) { return c.command === "\\htmlClass"; },
            macros: { "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\R": "\\mathbb{R}" } }); }
          catch (e2) { sonuc.hata.push(tip + "#" + t + ": KaTeX " + e2.message.slice(0, 120) + " :: " + tex.slice(0, 80)); }
        }
        var cm = /<script type="text\/x-c">([\s\S]*?)<\/script>/.exec(html);
        if (cm && t <= 40) sonuc.c.push({ ad: tip + "#" + t, kod: cm[1] });
      }
    });
    return sonuc;
  };
})();

