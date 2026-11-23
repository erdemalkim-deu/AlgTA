# Algoritma Analizi ve Tasarımı — Etkileşimli Türkçe Slaytlar

14 haftalık (haftada 4 saat) ders için reveal.js slaytları. Her algoritma tarayıcıda derlenip çalıştırılabilen C programlarıyla verilir; her konunun sonunda çözümlü örnekler bulunur. Gösterim CLRS'yi (4. baskı) izler.

## Kaynaklar ve atıflar

İçeriğin oluşturulmasında genel olarak **Ian Parberry'nin ders notları** takip edilmiş; konu sırası, tanımlar, ispatlar ve örneklerin omurgası bu notlardan Türkçeye çevrilerek genişletilmiştir. Bunlara ek olarak aşağıdaki kaynaklardan faydalanılmıştır. CLRS ve Katz'dan alınan örnekler birebir çeviri değildir; kendi anlatımımızla yeniden yazılmış ve slaytlarda kaynak etiketiyle (`CLRS x.y`, `Katz, Ders N`) belirtilmiştir.

### Temel kaynaklar

1. **I. Parberry**, *Lecture Notes on Algorithm Analysis and Computational Complexity*, 4. baskı, University of North Texas, 2001. — Dersin ana kaynağı; 21 bölümün tamamı çevrilmiştir.
2. **I. Parberry ve W. Gasarch**, *Problems on Algorithms*, 2. baskı, 2002 (1. baskı: Prentice-Hall, 1994). — Her konunun sonundaki çözümlü örnekler (POA); kitabın errata listesi uygulanmış, W. Gasarch'ın *Supplementary Problems* bölümünden ek alıştırmalar alınmıştır. Kitapta çözümü bulunmayan problemlerin çözümleri ders için yazılmıştır ("Ek çözüm" etiketi).
3. **T. H. Cormen, C. E. Leiserson, R. L. Rivest, C. Stein**, *Introduction to Algorithms*, 4. baskı, MIT Press, 2022 (3. baskı: 2009). — Tüm gösterim (yalancı kod biçimi, yordam adları, `lg`, ana teorem vb.) ve her haftadaki "CLRS'den Örnekler" bölümleri. Bölüm numaraları 4. baskıya göredir, 3. baskı numarası parantez içinde verilmiştir. Ders notlarındaki "CLR" atıfları (1. baskı) korunmuştur.
4. **J. Katz**, *CMSC 451: Design and Analysis of Computer Algorithms*, University of Maryland, Güz 2021, ders slaytları (Ders 1–19 ve 25–35). https://www.cs.umd.edu/~jkatz/451/f21/lectures.html — Her haftadaki "Katz'ın Derslerinden Örnekler" bölümleri.
5. **J. Kleinberg ve É. Tardos**, *Algorithm Design*, Pearson, 2005. — Katz'ın dersinin izlediği kitap; kararlı eşleşme, aralık çizelgeleme, kümeleme, dizi hizalama, PSPACE (Böl. 9) gibi konulara atıf.
6. **GeeksforGeeks** (geeksforgeeks.org) — Vize hazırlık sayfasındaki klasik algoritma örneklerinden bazıları (ör. seçmeli sıralama).

### Hafta – kaynak eşlemesi

| Hafta | Konu | Parberry ders notu | POA | CLRS (4. bs.) | Katz |
|---|---|---|---|---|---|
| 1 | Giriş ve tümevarım | Introduction; Mathematical Induction | Önsöz, Böl. 1–2 | Böl. 1, 2.1, Ek A | 1–2 |
| 2 | Doğruluk; asimptotik gösterim | Algorithm Correctness; Algorithm Analysis 1 | Böl. 5 | Böl. 2 | 2–3 |
| 3 | Asimptotik gösterim örnekleri; yinelemeli analiz, yığınlar | Algorithm Analysis 1–2 | Böl. 3; 6.1, 11.1 | Böl. 2.2, 3, 6 | 2–4, 10 |
| 4 | Yineleme bağıntıları | Algorithm Analysis 3 | Böl. 4, 6.2–6.3 | Böl. 4.3–4.7 | 11 |
| 5 | Böl ve fethet 1; quicksort, alt sınır | Divide and Conquer 1–2 | 7.1–7.3 | Böl. 4.1–4.2, 9.1 (3. bs. 4.1) | 12–14 |
| 6 | Quicksort örnekleri; seçme, ikili arama, Hanoi | Divide and Conquer 2–3 | 7.5, 13.1–13.2 | Böl. 7, 8, 9, 2.3 | 12, 35 |
| 7 | Böl ve fethet çözümlü örnekleri; dinamik programlama 1–2 | Divide and Conquer 3; Dynamic Programming 1–2 | 7.4–7.8; 8.1–8.2, 8.5 | Böl. 14.1–14.3 | 14–16 |
| 8 | Dinamik programlama 3–4 | Dynamic Programming 3–4 | 8.3–8.6 | Böl. 12, 14.4–14.5, 22.1, 23 | 17–19 |
| 9 | Açgözlü 1–2 | Greedy Algorithms 1–2 | 9.1–9.2, 9.5 | Böl. 15, 22.3 | 8–9 |
| 10 | Açgözlü 3 (ayrık kümeler, MST, Borůvka) | Greedy Algorithms 3 | 9.3–9.5, 11.4 | Böl. 19, 21 | 10–11 |
| 11 | Geri izleme 1–2; dal ve sınır | Backtracking 1–2 | 10.1, 10.2, 10.5 | Böl. 20.3–20.4, 35.5 | — |
| 12 | Geri izleme 3–4; BFS, güçlü bağlantılı bileşenler | Backtracking 3–4 | 10.3, 10.4, 10.6 | Böl. 20.2, 20.5, 35.1 | 5–7, 30 |
| 13 | NP-tamlık 1–2 | NP Completeness 1–2 | — | Böl. 34 | 25–29 |
| 14 | Yaklaşık algoritmalar, NP-tamlık örnekleri, PSPACE, dönem özeti | NP Completeness 2 | Böl. 12 | Böl. 35 | 31–34 |

Vize 7. haftadan sonradır; vize hazırlık sayfası (`vize-hazirlik.html`) 1–7. haftaların konularını kapsar.

Katz'ın ağ akışı (Ders 19–24'ün akış kısmı), rastgele algoritmaların ileri konuları, karma tabloları ve paralel algoritmalar dersleri kapsam dışında bırakılmıştır.

### Slaytlarda anılan diğer çalışmalar

Aşağıdakiler slaytlarda tarihsel not, "güncel durum" ya da ispatsız verilen sonuç olarak anılmıştır:

- **Böl ve fethet ve matris çarpımı:** A. Karatsuba ve Y. Ofman (1962, tamsayı çarpımı); V. Strassen (1969, matris çarpımı); A. L. Toom ve S. A. Cook (Toom–Cook çarpımı); J. D. Laderman (1976, 3×3 matrisler için 23 çarpma); M. Bläser (2003, 3×3 için 19 çarpmalık alt sınır); D. Harvey ve J. van der Hoeven (2019/2021, O(n lg n) tamsayı çarpımı); matris çarpımı üssünün güncel değeri (ω < 2,372).
- **Seçme ve yinelemeler:** M. Blum, R. W. Floyd, V. Pratt, R. L. Rivest, R. E. Tarjan (1973, doğrusal zamanda seçme — medyanların medyanı); M. Akra ve L. Bazzi (1998, Akra–Bazzi yöntemi).
- **Dinamik programlama:** D. E. Knuth (optimal ikili arama ağaçları için Θ(n²) iyileştirmesi); E. Horowitz ve S. Sahni, *Fundamentals of Computer Algorithms* (optimal BST sayısal örneği); V. I. Levenshtein (düzenleme uzaklığı).
- **Açgözlü ve çizge algoritmaları:** D. Gale ve L. S. Shapley (1962, kararlı eşleşme); D. A. Huffman (1952, Huffman kodları); E. W. Dijkstra (1959); J. B. Kruskal (1956); R. C. Prim (1957); R. W. Floyd ve S. Warshall (1962); R. Bellman ve L. R. Ford; R. E. Tarjan (1975, ayrık küme ormanlarının α(n) çözümlemesi); M. L. Fredman ve R. E. Tarjan (Fibonacci yığınları); J. Kadane (en büyük altdizi).
- **Sıralama:** C. A. R. Hoare (quicksort ve Hoare bölmesi); N. Lomuto (Lomuto bölmesi).
- **Karmaşıklık:** S. A. Cook (1971) ve L. Levin (Cook–Levin teoremi); R. M. Karp (1972, indirgemeler); G. S. Tseitin (CNF'ye dönüşüm); L. Stockmeyer ve A. R. Meyer (1973, QSAT'ın PSPACE-tamlığı); W. J. Savitch (1970, Savitch teoremi); M. R. Garey ve D. S. Johnson, *Computers and Intractability* (1979).
- **Giriş haftası:** J. R. Searle (1980, "Çin Odası"); G. A. Miller (1956, "yedi artı-eksi iki"); Stirling formülü.
- **Ramsey kuramı:** R. L. Graham, B. L. Rothschild, J. H. Spencer, *Ramsey Theory* (1990) ve R. L. Graham, J. H. Spencer, "Ramsey Theory", *Scientific American* 263(1), 1990 (ders notlarındaki "Further Reading").
- **Genişletilen haftalar (10–14):** D. E. Knuth, *The Art of Computer Programming*, Cilt 4A (permütasyon ve kombinasyon üretimi, §7.2.1.2–7.2.1.3); E. Horowitz, S. Sahni, S. Rajasekaran, *Fundamentals of Computer Algorithms* (geri izleme, dal ve sınır, çizge boyama); E. Horowitz ve S. Sahni (1974, ortada buluşma); R. Schroeppel ve A. Shamir (1981); A. H. Land ve A. G. Doig (1960); J. D. C. Little ve diğ. (1963); M. Held ve R. M. Karp (1962); O. Borůvka (1926); V. Jarník (1930); J. E. Hopcroft ve J. D. Ullman (1973); R. E. Tarjan ve J. van Leeuwen (1984); B. A. Galler ve M. J. Fischer (1964); M. L. Fredman ve M. E. Saks (1989); B. Chazelle (2000); S. Pettie ve V. Ramachandran (2002); D. R. Karger, P. N. Klein, R. E. Tarjan (1995); J. Komlós (1985); V. King (1997); C. Bron ve J. Kerbosch (1973); J. W. Moon ve L. Moser (1965); E. Tomita, A. Tanaka, H. Takahashi (2006); D. Eppstein, M. Löffler, D. Strash (2010); B. Aspvall, M. F. Plass, R. E. Tarjan (1979, 2-SAT); S. R. Kosaraju; M. Sharir (1981); R. E. Tarjan (1972); R. E. Tarjan ve A. E. Trojanowski (1977); F. V. Fomin ve D. Kratsch, *Exact Exponential Algorithms* (2010); D. J. A. Welsh ve M. B. Powell (1967); G. D. Birkhoff (1912); K. Appel ve W. Haken (1977); M. Sipser, *Introduction to the Theory of Computation* (Cook–Levin tablo ispatı); M. R. Garey ve D. S. Johnson (1978, güçlü NP-tamlık); L. Stockmeyer (1973); D. Zuckerman (2007); T. Baker, J. Gill, R. Solovay (1975); A. Razborov ve S. Rudich (1997); S. Aaronson ve A. Wigderson (2009); R. E. Ladner (1975); L. Babai (2016); V. V. Vazirani, *Approximation Algorithms* (2001); D. P. Williamson ve D. B. Shmoys, *The Design of Approximation Algorithms* (2011); R. L. Graham (1966, 1969); D. S. Johnson (1974); L. Lovász (1975); V. Chvátal (1979); O. H. Ibarra ve C. E. Kim (1975); N. Christofides (1976); J. Håstad (2001); U. Feige (1998); M. X. Goemans ve D. P. Williamson (1995); S. Arora ve S. Safra, S. Arora ve diğ. (1998, PCP teoremi). Bu atıfların ayrıntıları (dergi, cilt) yayından önce denetlenmelidir.
- 1\. haftadaki "Faydalı kitaplar" listesi (Aho–Hopcroft–Ullman, Bentley, Graham–Knuth–Patashnik, Knuth, Manber, Sedgewick, Wilf vb.) POA Bölüm 1.4'ün çevirisidir; kaynakçanın tamamı için POA'ya bakınız.

### Yazılım

- **reveal.js** 6 (H. El Hattab, MIT lisansı) — sunum altyapısı.
- **KaTeX** 0.19 (MIT lisansı) — matematik dizgisi.
- **CodeMirror** 6 (M. Haverbeke, MIT lisansı) — C kod editörü; yerel paket esbuild ile oluşturulmuştur.
- **Compiler Explorer** (M. Godbolt, https://godbolt.org) — C programlarının tarayıcıdan derlenip çalıştırılması için genel API.
- **Claude** (Anthropic; Claude Code ile, Claude Opus 5.5 modeli) — Slaytların Türkçeye çevrilmesi ve genişletilmesi, CLRS gösterimine dönüştürülmesi, CLRS ve Katz örneklerinin uyarlanması, C programları, SVG şekiller, vize hazırlık soru üreteçleri ve sunum altyapısı (CodeMirror + Compiler Explorer entegrasyonu, denetim araçları) yapay zekâ desteğiyle, ders sorumlusunun yönlendirmesi ve denetimi altında hazırlanmıştır. Üretilen içerik otomatik denetimlerden (derleme/çalıştırma, KaTeX, taşma) geçirilmiştir; ancak matematiksel ispatlar, kitap bölüm/teorem numaraları ve tarihsel bilgiler yayımlanmadan önce insan tarafından gözden geçirilmelidir.

## Çalıştırma

Sunucu gerekmez: `index.html` dosyasını çift tıklayarak tarayıcıda açın (ya da klasörü olduğu gibi herhangi bir statik web barındırma hizmetine yükleyin).

- Slaytlar, matematik (KaTeX) ve editör (CodeMirror 6) tamamen düz HTML/CSS/JS'dir; tüm kütüphaneler `assets/vendor/` altındadır.
- **Derle ve Çalıştır / Assembly** düğmeleri kodu doğrudan tarayıcıdan `godbolt.org` (Compiler Explorer) API'sine gönderir; yalnızca bunun için internet gerekir.
- Gezinme tek yönlüdür (dikey alt slayt yok): Boşluk, →, ↓, PageDown, Enter ileri; ←, ↑, PageUp, Geri silme geri gider. İki tuşlu sunum kumandalarıyla uyumludur.
- Slaytlar içeriğe göre otomatik ölçeklenir (az içerikli slaytlar büyütülür, kalabalık olanlar hafifçe küçültülür); yazılar projeksiyon için koyu ve kalın tutulmuştur.
- `K` tuşu (ya da sol alttaki düğme) **yüksek kontrast modunu** açar/kapatır: koyu zemin, açık yazı. Seçim tarayıcıda hatırlanır.
- Konuşmacı notları: `S` tuşu. PDF: `hafta-01.html?print-pdf` → Chrome'da yazdır.

## Yapı

| Yol | İçerik |
|---|---|
| `index.html` | Ders ana sayfası (hafta listesi) |
| `hafta-01.html` … `hafta-14.html` | Haftalık slaytlar |
| `vize-hazirlik.html` | Vize hazırlık: tohumlu rastgele soru üreteçleri, adım adım çözümler (`assets/js/vize*.js`); her sorunun soru kodu vardır (`BIL3015-dp-4242`), `vize-hazirlik.html?soru=BIL3015-dp-4242` o soruyu açar |
| `_sablon.html` | Yeni slayt dosyası için şablon / bileşen örnekleri |
| `.araclar/` | Geliştirme araçları (denetim, ekran görüntüsü); gizli klasör, yayımlanmaz |
| `assets/js/ders.js` | reveal.js başlatma, KaTeX, C editörü + Compiler Explorer entegrasyonu |
| `assets/css/ders.css` | Ortak stiller (kutular, editör, tablolar) |
| `assets/vendor/` | reveal.js 6, KaTeX 0.19, CodeMirror 6 (yerel paket) |
| `assets/css/ortak.css`, `assets/js/tohum.js` | Ortak ders temelinden kopyalar (renkler, tohumlu soru kodu); elle düzenlenmez |

## C editörü

```html
<div class="c-editor" data-ad="ornek.c" data-yukseklik="420" data-bayrak="-O2 -std=c11 -Wall">
<script type="text/x-c">
/* Ek örnek (kitapta yok) */
#include <stdio.h>
#include <stdint.h>
#include <inttypes.h>
int main(void) { int32_t n = 3; printf("n = %" PRId32 "\n", n); return 0; }
</script>
<script type="text/x-girdi">isteğe bağlı stdin</script>
</div>
```

C kuralları (bütün programlar): ilk satır kaynağı yazar (`/* Kaynak: … */` ya da `/* Ek örnek (kitapta yok) */`); yalnız C11 standart kütüphanesi (POSIX yok); tam sayılar `stdint.h` tipleri, biçimler `inttypes.h` makroları (`PRId64`); `gcc -std=c11 -O2 -Wall -Wextra` ile uyarısız; `scanf` dönüşü denetlenir; zaman ölçümü `clock()`. Denetim: `python3 .araclar/kontrol.py hafta-01.html` (yerel gcc; `--ce` Compiler Explorer).

Araç çubuğu: derleyici (GCC 14.2 / Clang 19.1), seçenekler, Derle ve Çalıştır (`Ctrl+Enter`), Assembly, Girdi, Compiler Explorer'da aç, Sıfırla, tam ekran. Öğrencinin değişiklikleri tarayıcıda (localStorage) saklanır.

## Lisans ve telif uyarısı

- Parberry'nin ders notları ile Parberry & Gasarch'ın *Problems on Algorithms* kitabının lisansı, eserin herhangi bir bölümünün yazarların yazılı izni olmadan **herkese açık bir ortamda (web sayfası vb.) yayımlanmasını yasaklar**; sınıf içi kullanıma izin verir. Bu slaytlar söz konusu eserlerin çevirisini içerdiğinden, herkese açık bir sunucuya koymadan önce yazarlardan izin alınmalıdır. Lisans: http://hercule.csci.unt.edu/ian/books/free/license.html
- CLRS ve Katz'ın ders slaytları telif hakkıyla korunan eserlerdir; bu slaytlarda onlardan birebir alıntı ya da çeviri yapılmamış, örnekler kendi anlatımımızla ve kaynak gösterilerek uyarlanmıştır.
