# İlan keşfi

`/admin/kesfet` sayfası, Tolga'ya uygun olabilecek ama henüz başvurmadığı ilanları gösterir.
Günlük keşif görevi platformlardan aday ilan toplar, CV'ye göre puanlar ve `job_postings`
tablosuna yazar. Tolga panelde her ilan için **Listeye al** ya da **İlgilenmiyorum** der.

## Sınırlar — önce bunlar

- **Keşif hiçbir şey göndermez.** Bu görev yalnızca okur ve puanlar. Başvuru formu açmaz,
  doldurmaz, göndermez; "Kaydet", "Başvur", "Takip et" gibi hiçbir düğmeye basmaz.
- **Gönderim yalnızca sohbette, Tolga'nın açık onayıyla.** Panelde "Listeye al" bir niyet
  işaretidir, onay değildir. Başvuru ayrı bir etkileşimli oturumda yapılır (aşağıda).
- **Düşük hacim.** Günde en fazla ~10 liste sayfası ve ~15 ilan ayrıntısı. Hızlı ve toplu
  gezinti, LinkedIn Kullanıcı Sözleşmesi'nin (8.2) otomasyon yasağına daha çok yaklaşır ve
  riske giren iş aranan hesabın kendisi.
- **Oturum açılmaz, şifre girilmez, CAPTCHA çözülmez.** Oturum kapalıysa o platform atlanır.
- Ilan metni kopyalanmaz: `summary` 2–3 cümlelik, kendi sözlerinle yazılmış özet.

## Hedef (22.09.2026'da Tolga'yla belirlendi)

- **Alanlar:** veri / BI / analitik · ürün / proje yönetimi · yazılım / IT · ERP / iş analizi
  (`areas`: `veri`, `urun`, `yazilim`, `erp`)
- **Tür:** zorunlu **uzun dönem** staj (mezuniyet için 2 staj / 40 iş günü kaldı) ve
  **yeni mezun / MT** programları. Part-time ve kısa dönem yaz stajı hedef değil.
- **Konum:** İstanbul; ya da her yerden uzaktan / hibrit.

## Kaynaklar ve sorgular

Önce her platform için bilinen kimlikleri al; ayrıntısı daha önce okunmuş ilanı tekrar açma:

```bash
python scripts/ilan-kesif.py bilinen linkedin     # kariyernet, youthall
```

### LinkedIn — dört sorgu

```
https://www.linkedin.com/jobs/search/?keywords=<SORGU>&location=Istanbul%2C%20T%C3%BCrkiye&f_E=1%2C2&f_TPR=r86400
```

`f_E=1,2` staj + giriş seviyesi, `f_TPR=r86400` son 24 saat. LinkedIn arama kutusu
`OR` / `AND` / tırnak kabul ediyor:

| Alan | `keywords` |
| --- | --- |
| veri | `(data OR veri OR "business intelligence" OR analytics OR analist)` |
| urun | `(product OR project OR ürün OR proje OR "management trainee" OR MT)` |
| yazilim | `(software OR yazılım OR developer OR backend OR "full stack" OR QA)` |
| erp | `(ERP OR SAP OR "business analyst" OR "iş analisti" OR süreç)` |

**Sorgular gevşek eşleşiyor.** 22.09.2026 ilk turunda "veri" sorgusunun 25 sonucunun çoğu
pazarlama ve satıştı; `AND (intern OR stajyer OR junior)` eklenen yazılım sorgusu çok daha
isabetliydi. Ön eleme bu gürültüyü atıyor, ama sorguya bu eki koymak sayfa yükünü azaltır.

Liste tembel yükleniyor; sonuç kabını kaydırıp kartları oku (sayfa ~25 ilan). Sayfa
değişince `window` sıfırlanıyor, çıkarıcıyı her sayfada yeniden tanımla:

```js
window.__li = () => {
  const gorulen = new Set(), out = [];
  for (const k of document.querySelectorAll("[data-job-id]")) {
    const id = k.getAttribute("data-job-id");
    if (!id || gorulen.has(id)) continue;
    gorulen.add(id);
    const s = (k.innerText || "").split("\n").map(x => x.trim()).filter(Boolean)
      .filter(x => !/ logosu$|^Gizli$/.test(x));   // gizli firmalarda ilk satır "Gizli logosu"
    if (!s.length) continue;
    // Başlık ikinci kez basılıyor; doğrulanmış ilanlarda "... with verification" ekiyle.
    const i = s[1] && s[1].startsWith(s[0]) ? 2 : 1;
    const konum = s[i + 1] || "";
    const mod = (konum.match(/\((İş yerinde|Hibrit|Uzaktan)\)/) || [])[1] || null;
    out.push({ id, pozisyon: s[0], sirket: s[i], konum: konum.replace(/\s*\([^)]*\)\s*$/, ""),
               mod, kolay: s.includes("Kolay Başvuru") });
  }
  return out;
};
```

Ayrıntı: `https://www.linkedin.com/jobs/view/<id>/`. Açıklama bölümleri **kaydırılınca**
yükleniyor; birkaç kez `window.scrollBy(0, 700)` sonra `main.innerText` içinde
`"İş ilanı hakkında"` sonrasını oku. Üst kartta "Stajyer" / "Giriş seviyesi", başvuru sayısı ve
LinkedIn'in kendi "x/y yetenek eşleşmesi" bilgisi var. Arama sayfasının sağ panelindeki
ayrıntı metne dökülmüyor, ilanın kendi sayfasını aç.

### Kariyer.net — üç sorgu

```
https://www.kariyer.net/is-ilanlari/istanbul?kw=<SORGU>
```

Şehir yol ile veriliyor (`/istanbul` → `ct=34,82`'ye yönleniyor). Arama boolean değil, kısa
sorgular kullan: `uzun dönem stajyer`, `yeni mezun`, `management trainee`. Sayfa ~50 ilan.
Kartlar `a[href*="/is-ilani/"]`; satırlar `Pozisyon / Şirket / Konum / Çalışma şekli`.
"Sponsorlu İlan" satırını ve logo yerine basılan **tek harfli** satırları ("C", "B") atla.
Başvuruların senkronunda olduğu gibi kartın Vue prop'ları da okunabilir
(`__vueParentComponent`); `isRedirect: true` ilan firmanın sitesine yönlendiriyor demek →
`easy_apply: false`.

### Youthall — iki sayfa

```
https://www.youthall.com/tr/is-ilanlari/stajyer/
https://www.youthall.com/tr/is-ilanlari/tam-zamanli/
```

İlan bağlantıları `/tr/<firma>/<ilan>_<n>/` biçiminde; `external_id` olarak bu yolu kullan
(`tchibo/e-ticaret-stajyeri_124`) — `_n` eki firma bazında tekrar ediyor. Kart metni:
`Pozisyon | kısa tanıtım | tür | son başvuru (GG.AA.YYYY) | şehir`. Son başvuru tarihini
`deadline` alanına yaz. `?page=2` boş döndü (22.09.2026); ilk sayfa yetiyor.
Tam zamanlı sayfası 22.09.2026'da yalnızca MYO / meslek lisesi ilanları içeriyordu.

### İlan uyarısı e-postaları

Tolga platformlarda iş uyarısı kurduysa bunlar da kaynak (`source: "uyari_eposta"`):
LinkedIn `from:jobalerts-noreply@linkedin.com` (`tolgaolguner1` kutusu, Chrome'dan),
Kariyer.net "Sana uygun ilanlar" (`tolgaolguner1`), Youthall (`tolgaolguner`, Gmail
bağlayıcısı). 22.09.2026'da hiçbiri kurulu değildi; Kariyer.net uyarıları eski perakende
profiline göre geliyordu (komi, servis) — onlar puanlamada zaten elenir.

## Puanlama

İki aşamalı, sayfa yükünü düşük tutmak için:

1. **Ön eleme (yalnızca liste kartı):** başlık + şirket + konum. Açıkça dışarıda kalanları
   hiç açma: satış danışmanı, muhasebe, hukuk, makine/elektrik/inşaat mühendisliği, İK,
   pazarlama/sosyal medya, "3+ yıl deneyim", İstanbul dışında iş yerinde.
2. **Ayrıntı (ilan sayfası):** kalanların metnini okuyup 0–100 puan ver.

| Ölçüt | Puan | Not |
| --- | --- | --- |
| Alan uyumu | 0–30 | Dört hedef alandan birine net giriyor mu |
| Tür uyumu | 0–20 | Uzun dönem / zorunlu staj ya da yeni mezun / MT → tam; kısa dönem yaz stajı → düşük |
| Yetkinlik uyumu | 0–30 | İlanın istedikleri CV'de var mı (aşağıda) |
| Konum / çalışma | 0–10 | İstanbul ya da uzaktan / hibrit → tam |
| Dil | 0–10 | İngilizce **B1**. "İleri / akıcı İngilizce şart" → düşür; Almanca şartı → düşük |

**CV'deki yetkinlikler (veritabanındaki CV'den, 22.09.2026):** Java, TypeScript, Python ·
Spring Boot, REST API, JWT, Kafka · React, Next.js, Tailwind CSS · pandas, Jupyter ·
PostgreSQL, MySQL, MSSQL · Docker, Git/GitHub, Maven. Değişmiş olabilir; şüphede
`content_documents` → `cv` → `skills`'i oku. **Listede olmayan bir beceriyi Tolga'da varmış
gibi sayma** (ör. Power BI, SAP, Tableau) — CV bilinçli olarak abartısız tutuluyor.

İlk turdan iki düzeltme:

- **Konum şartı karşılanmıyorsa puan en fazla 45.** Türk Tuborg ilanı Kariyer.net'te
  "İstanbul" görünüyordu ama metinde İzmir'de ikamet şartı vardı; tablo tek başına ona 66
  veriyordu. Platformun konum alanına güvenme, metindeki ikamet / çalışma yeri şartını oku.
- **Kalıp / toplu ilan şüphesi → −20.** Software Persona, Sca Social ve Arch of Sigma
  kelimesi kelimesine aynı metni kullanıyordu ("Balkan veya Avrupa'da kariyer hedeflemek"
  dahil). Aynı metni birden fazla firmada görürsen gerekçeye yaz.

Aynı ilan birden fazla platformda çıkarsa (Toyota programı hem LinkedIn'de hem Youthall'da)
tek kayıt tut; son başvuru tarihini hangi platform veriyorsa oradan al.

`score_reasons` 2–3 madde, somut ve dürüst:
"İlan SQL ve Python istiyor, ikisi de CV'de" · "Uzun dönem staj, haftada 3 gün" ·
"İleri İngilizce şart; CV'de B1". Genel övgü yazma.

Son başvuru tarihi geçmiş ilanı yazma.

## Yazma

```bash
python scripts/ilan-kesif.py yaz ilanlar.json --kuru   # önce kuru
python scripts/ilan-kesif.py yaz ilanlar.json
python scripts/ilan-kesif.py esle                      # başvuru senkronundan sonra
```

Betik başvurulmuş ilanı yazmaz, Tolga'nın karar verdiği ilana (`listede`,
`ilgilenmiyorum`, `basvuruldu`) dokunmaz; `ilgilenmiyorum` bir daha öne çıkmaz.
Alan listesi dışındaki `areas` değerlerini reddeder.

## Başvuru (Faz 3 — etkileşimli oturum, zamanlanmış görev DEĞİL)

Tolga sohbette "listemdeki ilanlara başvuralım" dediğinde:

1. `decision = 'listede'` ilanları ona göster.
2. Her ilan için Chrome'da platformun **kendi** formunu aç. Hesap açtıran firma sistemleri
   (Workday, SuccessFactors...) için form doldurulmaz: hesap açmak ve şifre girmek yasak.
   Onlarda ön yazı + cevapları hazırla, gönderimi Tolga yapar.
3. Formu doldur. Kişisel veri girmeden önce hangi bilgilerin gireceğini söyle.
   Tarama sorularında **uydurma**: onaylı cevap bankasında yoksa dur ve sor.
4. **LinkedIn:** son adımda dur; "Gönder"e Tolga basar (22.09.2026 kararı).
   **Diğerleri:** formun özetini göster, açık "evet" gelince gönder.
5. Gönderilen ilan ertesi günkü başvuru senkronuyla `job_applications`'a düşer;
   `ilan-kesif.py esle` onu burada `basvuruldu` yapar.
