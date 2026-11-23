/*
 * Algoritma Analizi ve Tasarımı — ortak slayt altyapısı
 *  - reveal.js başlatma
 *  - KaTeX ile matematik:  \( ... \) satır içi,  \[ ... \] blok
 *  - .c-editor öğelerini CodeMirror 6 editörüne dönüştürme
 *  - Compiler Explorer (godbolt.org) API ile derleme / çalıştırma / assembly
 *
 * Editör kullanımı (slayt içinde):
 *   <div class="c-editor" data-ad="ornek.c" data-yukseklik="400" data-bayrak="-O2 -std=c11 -Wall">
 *   <script type="text/x-c">
 *   #include <stdio.h>
 *   int main(void) { printf("Merhaba\n"); return 0; }
 *   </script>
 *   <script type="text/x-girdi">5 3 1</script>   (isteğe bağlı: standart girdi)
 *   </div>
 */
(function () {
  "use strict";

  var CE_API = "https://godbolt.org/api/compiler/";
  var DERLEYICILER = [
    { id: "cg142", ad: "GCC 14.2" },
    { id: "cclang1910", ad: "Clang 19.1" }
  ];
  var VARSAYILAN_BAYRAK = "-O2 -std=c11 -Wall";
  var ZAMAN_ASIMI_MS = 45000;

  function guvenliOku(anahtar) { try { return localStorage.getItem(anahtar); } catch (e) { return null; } }
  function guvenliYaz(anahtar, deger) { try { if (deger === null) localStorage.removeItem(anahtar); else localStorage.setItem(anahtar, deger); } catch (e) { /* yok say */ } }

  function girintiKaldir(metin) {
    var satirlar = metin.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
    while (satirlar.length && !satirlar[0].trim()) satirlar.shift();
    while (satirlar.length && !satirlar[satirlar.length - 1].trim()) satirlar.pop();
    var min = Infinity;
    satirlar.forEach(function (s) { if (s.trim()) min = Math.min(min, s.match(/^ */)[0].length); });
    if (!isFinite(min)) min = 0;
    return satirlar.map(function (s) { return s.slice(min); }).join("\n");
  }

  function ozet(metin) { // kısa, kararlı bir özet (değişen kaynak kodu algılamak için)
    var h = 5381;
    for (var i = 0; i < metin.length; i++) h = ((h << 5) + h + metin.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function ansiTemizle(s) { return s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, ""); }
  function satirlar(dizi) { return (dizi || []).map(function (x) { return ansiTemizle(x.text); }).join("\n"); }

  function el(etiket, sinif, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin !== undefined) e.textContent = metin;
    return e;
  }

  function utf8Base64(metin) {
    var bayt = new TextEncoder().encode(metin), ikili = "";
    for (var i = 0; i < bayt.length; i++) ikili += String.fromCharCode(bayt[i]);
    return btoa(ikili);
  }

  var editorler = [];
  var buyukKatman = null;

  function editorKur(kap, sira) {
    var kaynakEl = kap.querySelector('script[type="text/x-c"]');
    var girdiEl = kap.querySelector('script[type="text/x-girdi"]');
    var orijinal = girintiKaldir(kaynakEl ? kaynakEl.textContent : "");
    var orijinalGirdi = girdiEl ? girintiKaldir(girdiEl.textContent) : (kap.getAttribute("data-girdi") || "");
    var ad = kap.getAttribute("data-ad") || "program.c";
    var bayrak = kap.getAttribute("data-bayrak") || VARSAYILAN_BAYRAK;
    var yukseklik = kap.getAttribute("data-yukseklik");
    var anahtar = "aat:" + location.pathname + ":" + sira + ":" + ad;
    var kOzet = ozet(orijinal);

    var kayitli = null;
    try { kayitli = JSON.parse(guvenliOku(anahtar) || "null"); } catch (e) { kayitli = null; }
    var baslangic = (kayitli && kayitli.h === kOzet && typeof kayitli.kod === "string") ? kayitli.kod : orijinal;

    kap.innerHTML = "";
    var kutu = el("div", "c-kutu");
    if (yukseklik) kutu.style.setProperty("--c-yukseklik", parseInt(yukseklik, 10) + "px");

    // Araç çubuğu
    var arac = el("div", "c-arac");
    var adEl = el("span", "c-ad", ad);
    var derleyiciSec = el("select");
    derleyiciSec.title = "Derleyici";
    var secili = guvenliOku("aat:derleyici") || DERLEYICILER[0].id;
    DERLEYICILER.forEach(function (d) {
      var o = el("option", null, d.ad); o.value = d.id; if (d.id === secili) o.selected = true; derleyiciSec.appendChild(o);
    });
    derleyiciSec.addEventListener("change", function () { guvenliYaz("aat:derleyici", derleyiciSec.value); });
    var bayrakEl = el("input"); bayrakEl.value = bayrak; bayrakEl.title = "Derleyici seçenekleri"; bayrakEl.spellcheck = false;
    var calistirBtn = el("button", "c-calistir", "▶ Derle ve Çalıştır"); calistirBtn.title = "Ctrl+Enter";
    var asmBtn = el("button", null, "Assembly");
    var girdiBtn = el("button", null, "Girdi");
    var ceBtn = el("button", null, "CE'de Aç"); ceBtn.title = "Compiler Explorer'da yeni sekmede aç";
    var sifirBtn = el("button", null, "Sıfırla"); sifirBtn.title = "Kodu orijinal hâline döndür";
    var buyutBtn = el("button", null, "⛶"); buyutBtn.title = "Tam ekran editör";
    [adEl, derleyiciSec, bayrakEl, calistirBtn, asmBtn, girdiBtn, ceBtn, sifirBtn, buyutBtn].forEach(function (x) { arac.appendChild(x); });

    // Gövde
    var govde = el("div", "c-govde");
    var kodAlan = el("div", "c-kod");
    var yan = el("div", "c-yan");
    var girdiBaslik = el("div", "c-girdi-baslik"); girdiBaslik.appendChild(el("span", null, "Standart girdi (stdin)"));
    var girdi = el("textarea", "c-girdi"); girdi.value = orijinalGirdi; girdi.spellcheck = false;
    var ciktiBaslik = el("div", "c-cikti-baslik");
    var ciktiAd = el("span", null, "Çıktı");
    var kapatYan = el("button", "c-kapat-yan", "✕"); kapatYan.title = "Çıktı panelini kapat";
    ciktiBaslik.appendChild(ciktiAd); ciktiBaslik.appendChild(kapatYan);
    var cikti = el("pre", "c-cikti");
    yan.appendChild(girdiBaslik); yan.appendChild(girdi); yan.appendChild(ciktiBaslik); yan.appendChild(cikti);
    // Kod ile girdi/çıktı paneli arasında fareyle sürüklenebilir ayırıcı
    var ayirac = el("div", "c-ayirac"); ayirac.title = "Sürükleyerek paneli genişletin; çift tıklama varsayılana döndürür";
    govde.appendChild(kodAlan); govde.appendChild(ayirac); govde.appendChild(yan);
    ayirac.addEventListener("pointerdown", function (e) {
      e.preventDefault(); e.stopPropagation();
      try { ayirac.setPointerCapture(e.pointerId); } catch (hata) { /* yok say */ }
      var x0 = e.clientX, w0 = yan.offsetWidth;
      var olcek = kutu.getBoundingClientRect().width / kutu.offsetWidth || 1;   // slayt ölçeği
      ayirac.classList.add("surukleniyor");
      var hareket = function (ev) {
        var w = w0 - (ev.clientX - x0) / olcek;
        w = Math.max(140, Math.min(kutu.offsetWidth - 160, w));
        yan.style.flexBasis = w + "px";
      };
      var birak = function () {
        ayirac.classList.remove("surukleniyor");
        ayirac.removeEventListener("pointermove", hareket);
        ayirac.removeEventListener("pointerup", birak);
        ayirac.removeEventListener("pointercancel", birak);
        view.requestMeasure();
      };
      ayirac.addEventListener("pointermove", hareket);
      ayirac.addEventListener("pointerup", birak);
      ayirac.addEventListener("pointercancel", birak);
    });
    ayirac.addEventListener("dblclick", function () { yan.style.flexBasis = ""; view.requestMeasure(); });
    kutu.appendChild(arac); kutu.appendChild(govde);
    kap.appendChild(kutu);
    if (!orijinalGirdi) { girdiBaslik.style.display = "none"; girdi.style.display = "none"; }

    var kaydetZamanlayici = null;
    var view = new CM.EditorView({
      parent: kodAlan,
      state: CM.EditorState.create({
        doc: baslangic,
        extensions: [
          CM.basicSetup,
          CM.cpp(),
          CM.oneDark,
          CM.EditorState.tabSize.of(4),
          CM.keymap.of([
            CM.indentWithTab,
            { key: "Mod-Enter", run: function () { calistir(); return true; } },
            { key: "Escape", run: function () { if (buyukKatman && buyukKatman.contains(kutu)) { kucult(); return true; } view.contentDOM.blur(); return true; } }
          ]),
          CM.EditorView.updateListener.of(function (u) {
            if (!u.docChanged) return;
            clearTimeout(kaydetZamanlayici);
            kaydetZamanlayici = setTimeout(function () {
              var kod = view.state.doc.toString();
              guvenliYaz(anahtar, kod === orijinal ? null : JSON.stringify({ h: kOzet, kod: kod }));
            }, 400);
          })
        ]
      })
    });

    function yanAc() { kutu.classList.add("cikti-acik"); }
    function yaz(metin, sinif) {
      var s = el("span", sinif || null, metin); cikti.appendChild(s);
    }

    function istek(yurut) {
      var kod = view.state.doc.toString();
      var govdeJson = {
        source: kod,
        lang: "c",
        allowStoreCodeDebug: false,
        options: {
          userArguments: bayrakEl.value,
          executeParameters: { args: [], stdin: girdi.value },
          compilerOptions: { executorRequest: !!yurut, skipAsm: !!yurut },
          filters: yurut ? { execute: true } : { binary: false, labels: true, directives: true, commentOnly: true, demangle: true, intel: true, libraryCode: true, trim: true },
          tools: [],
          libraries: []
        }
      };
      var kontrol = new AbortController();
      var zaman = setTimeout(function () { kontrol.abort(); }, ZAMAN_ASIMI_MS);
      return fetch(CE_API + encodeURIComponent(derleyiciSec.value) + "/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(govdeJson),
        signal: kontrol.signal
      }).then(function (r) {
        clearTimeout(zaman);
        if (!r.ok) throw new Error("Sunucu yanıtı: HTTP " + r.status);
        return r.json();
      }, function (e) { clearTimeout(zaman); throw e; });
    }

    function mesgul(durum, metin) {
      calistirBtn.disabled = asmBtn.disabled = durum;
      if (durum) { cikti.textContent = ""; yaz(metin + "\n", "bilgi"); }
    }

    function hataGoster(e) {
      cikti.textContent = "";
      yaz(e && e.name === "AbortError" ? "İstek zaman aşımına uğradı." : "Derleme sunucusuna ulaşılamadı: " + (e && e.message ? e.message : e), "hata");
      yaz("\n(İnternet bağlantısını kontrol edin; godbolt.org erişilebilir olmalı.)", "bilgi");
    }

    function calistir() {
      yanAc(); ciktiAd.textContent = "Çıktı";
      mesgul(true, "Derleniyor ve çalıştırılıyor…");
      istek(true).then(function (y) {
        cikti.textContent = "";
        var b = y.buildResult || {};
        var derlemeHata = satirlar(b.stderr);
        if (derlemeHata) yaz(derlemeHata + "\n", b.code === 0 ? "uyari-m" : "hata");
        if (!y.didExecute) {
          yaz("Derleme başarısız" + (b.code !== undefined ? " (kod " + b.code + ")" : "") + ".\n", "hata");
          if (y.execResult && y.execResult.stderr) yaz(satirlar(y.execResult.stderr), "hata");
          return;
        }
        var out = satirlar(y.stdout), err = satirlar(y.stderr);
        if (out) yaz(out + "\n");
        if (err) yaz(err + "\n", "hata");
        if (y.timedOut) yaz("Program zaman aşımına uğradı.\n", "hata");
        if (y.truncated) yaz("(çıktı kısaltıldı)\n", "bilgi");
        yaz("— çıkış kodu: " + y.code + (y.execTime ? " · süre: " + y.execTime + " ms" : "") + " —", y.code === 0 ? "basari" : "hata");
      }).catch(hataGoster).then(function () { mesgul(false); });
    }

    function assembly() {
      yanAc(); ciktiAd.textContent = "Assembly (Intel sözdizimi)";
      mesgul(true, "Assembly üretiliyor…");
      istek(false).then(function (y) {
        cikti.textContent = "";
        var hata = satirlar(y.stderr);
        if (hata) yaz(hata + "\n", y.code === 0 ? "uyari-m" : "hata");
        var asm = (y.asm || []).map(function (x) { return x.text; }).join("\n");
        yaz(asm || "(assembly çıktısı yok)");
      }).catch(hataGoster).then(function () { mesgul(false); });
    }

    function ceAc() {
      var durum = {
        sessions: [{
          id: 1, language: "c", source: view.state.doc.toString(),
          compilers: [{ id: derleyiciSec.value, options: bayrakEl.value }],
          executors: [{ arguments: "", compiler: { id: derleyiciSec.value, libs: [], options: bayrakEl.value }, stdin: girdi.value, stdinVisible: true }]
        }]
      };
      window.open("https://godbolt.org/clientstate/" + encodeURIComponent(utf8Base64(JSON.stringify(durum))), "_blank", "noopener");
    }

    function sifirla() {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: orijinal } });
      girdi.value = orijinalGirdi;
      cikti.textContent = "";
      guvenliYaz(anahtar, null);
    }

    var yerTutucu = null;
    function buyut() {
      if (!buyukKatman) {
        buyukKatman = el("div"); buyukKatman.id = "c-buyuk-katman";
        buyukKatman.addEventListener("keydown", function (e) { e.stopPropagation(); });
        document.body.appendChild(buyukKatman);
      }
      if (buyukKatman.contains(kutu)) { kucult(); return; }
      yerTutucu = el("div"); yerTutucu.style.height = kutu.offsetHeight + "px";
      kutu.parentNode.replaceChild(yerTutucu, kutu);
      buyukKatman.innerHTML = ""; buyukKatman.appendChild(kutu); buyukKatman.classList.add("acik");
      buyutBtn.textContent = "✕ Kapat";
      girdiBaslik.style.display = ""; girdi.style.display = "";
      view.requestMeasure(); view.focus();
    }
    function kucult() {
      if (!yerTutucu) return;
      yerTutucu.parentNode.replaceChild(kutu, yerTutucu); yerTutucu = null;
      buyukKatman.classList.remove("acik");
      buyutBtn.textContent = "⛶";
      if (!girdi.value) { girdiBaslik.style.display = "none"; girdi.style.display = "none"; }
      view.requestMeasure();
    }

    calistirBtn.addEventListener("click", calistir);
    asmBtn.addEventListener("click", assembly);
    ceBtn.addEventListener("click", ceAc);
    sifirBtn.addEventListener("click", sifirla);
    buyutBtn.addEventListener("click", buyut);
    kapatYan.addEventListener("click", function () { kutu.classList.remove("cikti-acik"); });
    girdiBtn.addEventListener("click", function () {
      yanAc(); girdiBaslik.style.display = ""; girdi.style.display = ""; girdi.focus();
    });
    // Slayt gezintisinin editör içindeki tuşları yakalamasını engelle
    [girdi, bayrakEl].forEach(function (x) { x.addEventListener("keydown", function (e) { e.stopPropagation(); }); });
    view.dom.addEventListener("keydown", function (e) {
      // Sunum kumandası (PageDown/PageUp) editör odaktayken de slayt değiştirsin
      if ((e.key === "PageDown" || e.key === "PageUp") && !(buyukKatman && buyukKatman.contains(kutu))) {
        e.preventDefault();
        view.contentDOM.blur();
        if (e.key === "PageDown") Reveal.next(); else Reveal.prev();
      }
      e.stopPropagation();
    });
    // Tıklanan düğme odakta kalmasın; yoksa kumandanın Boşluk/Enter tuşu düğmeye yeniden basar
    Array.prototype.forEach.call(arac.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { b.blur(); });
    });
    kapatYan.addEventListener("click", function () { kapatYan.blur(); });

    editorler.push({ kap: kap, view: view });
  }

  function matematik(kok) {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(kok, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option", "select"],
      ignoredClasses: ["c-editor", "c-kutu", "no-math"],
      throwOnError: false,
      // Formül içinde kademeli gösterim için yalnızca \htmlClass{fragment}{...} gibi sınıf eklemeye izin ver
      trust: function (ctx) { return ctx.command === "\\htmlClass"; },
      strict: false,
      macros: {
        "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\R": "\\mathbb{R}",
        "\\floor": "\\left\\lfloor #1 \\right\\rfloor",
        "\\ceil": "\\left\\lceil #1 \\right\\rceil"
      }
    });
  }

  // CLRS yordam adları: "INSERTION-SORT" -> "Insertion-Sort" (small caps ile CLRS görünümü)
  function yordamAdlari(kok) {
    Array.prototype.forEach.call(kok.querySelectorAll(".yordam"), function (e) {
      e.setAttribute("lang", "en");   // Türkçe büyük harf kuralı i -> İ yapmasın
      if (e.children.length) return;
      e.textContent = e.textContent.toLowerCase().replace(/(^|[-\s(])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
    });
  }

  // Her slaytın içeriğini bir iç kaba (.slayt-ic) al; otomatik ölçek bu kaba uygulanır.
  // Kendi düzeni olan slaytlar (vize üreteçleri, kaydırmalı slaytlar) hariç.
  function slaytlariSar(kok) {
    Array.prototype.forEach.call(kok.children, function (s) {
      if (s.tagName !== "SECTION" || s.classList.contains("vize-slayt") || s.classList.contains("kaydir")) return;
      if (s.querySelector(":scope > .slayt-ic")) return;
      var ic = document.createElement("div");
      ic.className = "slayt-ic";
      while (s.firstChild) ic.appendChild(s.firstChild);
      s.appendChild(ic);
    });
  }

  // Yüksek kontrast modu (K tuşu / düğme); seçim tarayıcıda hatırlanır
  function kontrastUygula(acik) {
    document.documentElement.classList.toggle("yuksek-kontrast", acik);
    guvenliYaz("aat:kontrast", acik ? "1" : null);
    var d = document.querySelector(".ders-ust .kontrast-dugme");
    if (d) d.textContent = acik ? "◑ Normal görünüm (K)" : "◐ Yüksek kontrast (K)";
  }
  function kontrastDegistir() { kontrastUygula(!document.documentElement.classList.contains("yuksek-kontrast")); }
  function kontrastKur() {
    var ust = document.querySelector(".ders-ust");
    if (ust && !ust.querySelector(".kontrast-dugme")) {
      var d = el("button", "kontrast-dugme");
      d.type = "button";
      d.addEventListener("click", function () { d.blur(); kontrastDegistir(); });
      ust.appendChild(d);
    }
    kontrastUygula(guvenliOku("aat:kontrast") === "1");
  }

  // Destenin sonuna "Haftanın sonu" slaytı: ana sayfa, önceki ve sonraki hafta bağlantıları (kumandayla ileri gidince buraya varılır)
  function sonSlayt(kok) {
    if (kok.querySelector(".son-slayt")) return;
    var m = /hafta-(\d\d)\.html/.exec(location.pathname), n = m ? parseInt(m[1], 10) : 0;
    var ad = function (k) { return "hafta-" + (k < 10 ? "0" : "") + k + ".html"; };
    var vize = /vize-hazirlik\.html/.test(location.pathname);
    var bag = [];
    if (n > 1) bag.push('<a class="son-bag" href="' + ad(n - 1) + '">← Hafta ' + (n - 1) + "</a>");
    bag.push('<a class="son-bag ana" href="index.html">⌂ Ders ana sayfası</a>');
    if (n === 7) bag.push('<a class="son-bag" href="vize-hazirlik.html">Vize hazırlık →</a>');
    else if (n && n < 14) bag.push('<a class="son-bag" href="' + ad(n + 1) + '">Hafta ' + (n + 1) + " →</a>");
    if (vize) bag.push('<a class="son-bag" href="hafta-08.html">Hafta 8 →</a>');
    var s = document.createElement("section");
    s.className = "son-slayt";
    s.innerHTML = "<h2>" + (vize ? "Vize hazırlığın sonu" : n ? "Hafta " + n + " sonu" : "Sunumun sonu") + "</h2>" +
      '<div class="son-baglar">' + bag.join("") + "</div>";
    kok.appendChild(s);
  }

  function basla() {
    var kok = document.querySelector(".reveal .slides");
    sonSlayt(kok);
    kontrastKur();
    slaytlariSar(kok);
    yordamAdlari(kok);
    matematik(kok);
    Array.prototype.forEach.call(document.querySelectorAll(".c-editor"), editorKur);
    // Dinamik içerik (ör. vize hazırlık soru üreteçleri) için dışa açılan yardımcılar
    window.AAT = {
      editorKur: function (kap, anahtar) { editorKur(kap, anahtar || ("d" + Date.now())); },
      matematik: matematik,
      yordamAdlari: yordamAdlari
    };
    // Ortak kanca (KURALLAR §7): sonradan açılan/eklenen içerik normal slayt metni gibi işlenir
    window.dersIsle = function (el) {
      yordamAdlari(el); matematik(el);
      Array.prototype.forEach.call(el.querySelectorAll(".c-editor"), function (k) {
        if (!k.querySelector(".cm-editor")) editorKur(k, "d" + Date.now());
      });
      if (window.formulleriSigdir) window.formulleriSigdir();
    };

    var eklentiler = [];
    if (window.RevealNotes) eklentiler.push(RevealNotes);
    if (window.RevealSearch) eklentiler.push(RevealSearch);
    if (window.RevealZoom) eklentiler.push(RevealZoom);
    if (window.RevealHighlight) eklentiler.push(RevealHighlight);

    Reveal.initialize({
      hash: true,
      slideNumber: "c/t",
      showSlideNumber: "all",
      width: 1280,
      height: 800,
      margin: 0.04,
      center: false,
      transition: "slide",
      transitionSpeed: "fast",
      controlsTutorial: false,
      // Tek yönlü (doğrusal) gezinme: sunum kumandası için tüm "ileri" tuşları sonraki
      // slayta/fragmana, tüm "geri" tuşları öncekine gider.
      navigationMode: "linear",
      keyboard: {
        32: "next",   // Boşluk
        34: "next",   // Page Down (çoğu sunum kumandası)
        39: "next",   // Sağ ok
        40: "next",   // Aşağı ok
        13: "next",   // Enter
        33: "prev",   // Page Up
        37: "prev",   // Sol ok
        38: "prev",   // Yukarı ok
        8: "prev",    // Geri silme
        75: kontrastDegistir  // K: yüksek kontrast modu
      },
      pdfMaxPagesPerSlide: 2,
      plugins: eklentiler
    }).then(function () {
      var yenile = function () { editorler.forEach(function (e) { e.view.requestMeasure(); }); };
      // Kutusuna sığmayan blok formülleri (okunur bir sınıra kadar) küçült
      var sigdir = function (slayt) {
        var s = (slayt && slayt.nodeType === 1) ? slayt : Reveal.getCurrentSlide();
        if (!s) return;
        Array.prototype.forEach.call(s.querySelectorAll(".katex-display"), function (e) {
          e.style.fontSize = "";
          var w = e.clientWidth, k = e.scrollWidth;
          if (w > 0 && k > w + 1) e.style.fontSize = Math.max(0.55, (w - 8) / k) * 100 + "%";
        });
      };
      // Otomatik ölçek: içeriği tuvale sığdıran en büyük ölçeği (ENAZ..ENCOK) ikili aramayla bul.
      // Az içerikli slaytlar büyür (projeksiyonda okunurluk), taşan slaytlar biraz küçülür.
      var ENAZ = 0.8, ENCOK = 1.45, DOLULUK = 0.95;
      var slaytSigdir = function (slayt) {
        var s = (slayt && slayt.nodeType === 1) ? slayt : Reveal.getCurrentSlide();
        if (!s) return 1;
        var ic = s.querySelector(":scope > .slayt-ic");
        if (!ic) { sigdir(s); return 1; }
        var W = Reveal.getConfig().width, H = Reveal.getConfig().height * DOLULUK;
        var sigar = function (f) {
          ic.style.width = (W / f) + "px";
          sigdir(s);
          var formulTasar = Array.prototype.some.call(s.querySelectorAll(".katex-display"), function (e) {
            return e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1;
          });
          return !formulTasar && ic.offsetHeight * f <= H && ic.scrollWidth <= W / f + 2;
        };
        var f;
        if (sigar(ENCOK)) f = ENCOK;
        else if (!sigar(ENAZ)) f = ENAZ;
        else {
          var a = ENAZ, b = ENCOK;
          for (var t = 0; t < 7; t++) { var o = (a + b) / 2; if (sigar(o)) a = o; else b = o; }
          f = a;
        }
        sigar(f);
        ic.style.transform = "scale(" + f + ")";
        s.setAttribute("data-olcek", f.toFixed(3));
        return f;
      };
      var yazdirma = /print-pdf/.test(location.search);
      Reveal.on("slidechanged", function () { slaytSigdir(); });
      Reveal.on("resize", function () { slaytSigdir(); });
      window.formulleriSigdir = slaytSigdir;
      // Denetim aracı için: ölçek uygulandıktan sonra slaytın görünen boyutu
      window.slaytOlcu = function (s) {
        var f = slaytSigdir(s), ic = s.querySelector(":scope > .slayt-ic");
        return ic ? { h: ic.offsetHeight * f, w: ic.scrollWidth * f } : { h: s.scrollHeight, w: s.scrollWidth };
      };
      if (yazdirma) Reveal.getSlides().forEach(function (x) { slaytSigdir(x); });
      slaytSigdir();
      Reveal.on("slidechanged", yenile);
      Reveal.on("resize", yenile);
      yenile();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla);
  else basla();
})();

