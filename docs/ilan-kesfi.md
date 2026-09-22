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
- **Konum:** İstanbul veya Bursa; ya da her yerden uzaktan / hibrit. İş yerinde, hibrit ve
  uzaktan üçü de kabul (22.09.2026, cevap bankasında onaylı). Başka şehre taşınmıyor.
- **Müsaitlik:** haftada 5 gün, 6 ay ve üzeri — uzun dönem programların hepsine uygun.

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
| Bursa (tek sorgu) | `(intern OR stajyer OR "management trainee" OR "yeni mezun")`, `location=Bursa%2C%20T%C3%BCrkiye` |

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
Bursa için ayrıca `/is-ilanlari/bursa?kw=uzun%20dönem%20stajyer` (tek sorgu).
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

**22.09.2026'da Tolga'nın onayıyla değişti** (career-ops modelinin uyarlaması). Eski 0–100
puan, ağırlık tablosu (30/20/30/10/10), "konum şartı → en fazla 45" ve "kalıp ilan → −20"
kuralları **kaldırıldı**; bu kurallar Tolga'ya onaylatılmadan eklenmişti. Bu bölümdeki bir
kuralı değiştirmek (yeni ceza, tavan, eşik, eleme) **Tolga'nın açık onayını ister**; turdan
çıkan "ders" belgeye doğrudan girmez, raporda öneri olarak sunulur.

İki aşamalı, sayfa yükünü düşük tutmak için:

1. **Ön eleme (yalnızca liste kartı):** başlık + şirket + konum. Açıkça dışarıda kalanları
   hiç açma (liste 22.09.2026'da Tolga onayladı): satış, muhasebe, hukuk, İK · makine /
   elektrik / inşaat mühendisliği · pazarlama / sosyal medya · "3+ yıl deneyim" · İstanbul
   ve Bursa dışında iş yerinde.
2. **Ayrıntı (ilan sayfası):** kalanların metnini oku; aşağıdaki alanları doldur.

### Genel puan — `fit` (1–5, tek ondalık)

Formül **yok**: iki boyuta ve kırmızı bayraklara bakarak bütünsel ver. 72 ile 68 arasındaki
farkı kanıt taşımıyordu; 1–5 ölçeği bu yüzden seçildi.

| `fit` | Anlamı |
| --- | --- |
| 4,5 ve üstü | Güçlü uyum — hemen başvurmaya değer |
| 4,0–4,4 | İyi uyum — başvurmaya değer |
| 3,5–3,9 | Orta — ancak özel bir sebep varsa |
| 3,5 altı | Önerilmez |

### Boyutlar (1–5 tam sayı)

**`fit_cv` — CV uyumu:** ilanın istediği yetkinlik ve deneyim CV'de ne kadar karşılanıyor.
5 = temel şartların hepsi CV'de kanıtlı · 3 = yaklaşık yarısı · 1 = neredeyse hiçbiri.

**`fit_goal` — hedef uyumu:** alan (dört hedef alan), tür (uzun dönem / zorunlu staj ya da yeni
mezun / MT) ve müsaitlik. 5 = hedef alanın tam içinde, uzun dönem staj ya da MT · 3 = alan
komşu ya da tür belirsiz · 1 = hedef dışı (kısa dönem yaz stajı, part-time). Konum bu
boyuta girmez; konumla ilgili sorunlar aşağıda uyarıdır.

**CV'deki yetkinlikler (veritabanındaki CV'den, 22.09.2026):** Java, TypeScript, Python ·
Spring Boot, REST API, JWT, Kafka · React, Next.js, Tailwind CSS · pandas, Jupyter ·
PostgreSQL, MySQL, MSSQL · Docker, Git/GitHub, Maven. Değişmiş olabilir; şüphede
`content_documents` → `cv` → `skills`'i oku. **Listede olmayan bir beceriyi Tolga'da varmış
gibi sayma** (ör. Power BI, SAP, Tableau) — CV bilinçli olarak abartısız tutuluyor.

### Kırmızı bayraklar — `red_flags` (genel puanı düşürür)

Yalnızca **ilanın açıkça yazdığı** ve Tolga'nın karşılamadığı bir şart: "ileri / akıcı
İngilizce şart" (CV'de B1), Almanca şartı, belirli bölüm / diploma şartı, 1–2 yıl deneyim
şartı, uymayan mezuniyet tarihi şartı. Her madde somut: "Akıcı İngilizce şart; CV'de B1".
Tahmine dayalı bir şey ("muhtemelen deneyimli aday isterler") kırmızı bayrak **olamaz**.

### Uyarılar — `warnings` (puanı ETKİLEMEZ, Tolga'ya gösterilir)

- **Konum / ikamet şartı karşılanmıyor.** Platformun konum alanına güvenme, metindeki ikamet /
  çalışma yeri şartını oku. Örnek: Türk Tuborg Kariyer.net'te "İstanbul" görünüyordu, metinde
  İzmir'de ikamet şartı vardı → `"İzmir'de ikamet şartı"`.
- **Kalıp / toplu ilan şüphesi.** Aynı metin birden fazla firmada çıkıyorsa firmaları yaz:
  `"Aynı metin 3 firmada (Software Persona, Sca Social, Arch of Sigma)"`. Meşru açıklaması
  olabilir (aynı grup, ajans); karar Tolga'nın.
- **Eski ilan.** Yayın tarihi 60 günden eskiyse: `"63 gündür yayında"`.

Aynı ilan birden fazla platformda çıkarsa (Toyota programı hem LinkedIn'de hem Youthall'da)
tek kayıt tut; son başvuru tarihini hangi platform veriyorsa oradan al.

`score_reasons` 2–3 madde, somut ve dürüst:
"İlan SQL ve Python istiyor, ikisi de CV'de" · "Uzun dönem staj, haftada 3 gün". Genel övgü
yazma; kırmızı bayrak ve uyarıyı burada tekrarlama.

Son başvuru tarihi geçmiş ilanı yazma.

### Şart tablosu — `requirements` (yalnızca `listede` ilanlarda)

Keşif görevi **yazmaz**. Tolga bir ilanı "Listeye al" dedikten sonra, sohbette istenince ya da
ön yazıdan / başvurudan önce çıkarılır; ilan metninin tamamı okunur ve `fit` gerekirse tazelenir.

Her satır: `sart` · `onem` · `kaynak` · `alinti` · `eslesme` · `not`.

| `onem` | Anlamı |
| --- | --- |
| `kritik` | Açık şart, başlıkta geçiyor ya da her gün yapılacak temel iş |
| `yuksek` | Merkezi şart, mülakatta sorulması muhtemel |
| `anlamli` | Gerçek şart ama belirleyici değil |
| `tercih` | "Tercih sebebi", "artı" |
| `dusuk` | Kalıp, sinyal taşımayan ifade |

| `kaynak` | Anlamı | Gerektirir |
| --- | --- | --- |
| `acik` | İlan açıkça şart diyor ("aranan nitelikler", "zorunlu", başlık) | `alinti`: ilandan **birebir** |
| `yapisal` | Şart denmemiş ama ilanın yapısı ağırlık veriyor (hangi başlık altında, tekrar) | ilan metninden denetlenebilir olmalı |
| `tahmin` | Bu tür rollerin nasıl elendiğine dair bilgi | — |

**Kapı:** `tahmin` kaynaklı bir satır `kritik` ya da `yuksek` **olamaz** (betik reddeder).
Şişirilmiş önem "başvurma" sonucu üretir; bu, yapılması gereken bir başvuruyu kaybettirir.
`eslesme`: `var` / `kismi` / `yok` — yalnızca CV'ye ve cevap bankasının onaylı cevaplarına
dayanır. `kritik` ya da `yuksek` olup `var` olmayan her satırın `not`'unda **mülakat riski +
karşı hamle** yazılır (ör. "Power BI sorulabilir → pandas ile yaptığın raporlamayı anlat").

## Yazma

```bash
python scripts/ilan-kesif.py yaz ilanlar.json --kuru   # önce kuru
python scripts/ilan-kesif.py yaz ilanlar.json
python scripts/ilan-kesif.py esle                      # başvuru senkronundan sonra
python scripts/ilan-kesif.py sartlar sartlar.json      # yalnızca listede ilanlar, sohbette
```

Betik başvurulmuş ilanı yazmaz, Tolga'nın karar verdiği ilana (`listede`,
`ilgilenmiyorum`, `basvuruldu`) dokunmaz; `ilgilenmiyorum` bir daha öne çıkmaz.
Alan listesi dışındaki `areas` değerlerini reddeder.

## Ön yazı

Başvuru listesindeki (`decision = 'listede'`) ilanlar için taslak, sohbette "ön yazıları
hazırla" denince yazılır; zamanlanmış görev yazmaz.

```bash
python scripts/ilan-kesif.py onyazi onyazilar.json   # [{platform, external_id, lang, metin}]
```

Taslak onaysız kaydedilir; Tolga Keşfet › Başvuru listem'de okur, düzenler, onaylar.
Betik **onaylı** ön yazının üzerine yazmaz (`--uzerine-yaz` verilmedikçe).

Yazım kuralları:

- **Kaynak yalnızca:** veritabanındaki CV (`content_documents` › `cv` › `projects`,
  `experience`, `research`, `communities`) + cevap bankasındaki **onaylı** cevaplar + ilanın
  kendi metni. Önce ilanı oku; okumadan yazma.
- **İlanın istediği ama CV'de olmayan şeyi yazma** (Excel pivot, HubSpot, "otomotiv
  tutkusu", "FPS oyuncusuyum", ileri İngilizce). Duygu ve ilgi iddialarını en aza indir;
  kalanları Tolga'ya ayrıca göster, onları o doğrular.
- **Eksikliği savunma da yapma:** B1 İngilizce ya da bilinmeyen teknoloji için özür
  cümlesi kurma. Tek istisna: programın özü o teknolojiyi öğretmekse (Commencis .NET)
  "henüz kullanmadım, bu yüzden istiyorum" dürüst ve güçlü bir cümle.
- **Dil ilanın dili:** İngilizce ilana İngilizce, Türkçe ilana Türkçe.
- **120–190 kelime,** üç paragraf: (1) hangi pozisyon + müsaitlik (son sınıf, dersler
  bitti, zorunlu staj, hemen başlar, haftada 5 gün, 6 ay+ — ilanın istediği gün/süreyi
  karşıladığını açıkça söyle), (2) ilanın gereksinimine denk gelen 1–2 somut kanıt,
  (3) tek cümlelik, ilana özgü kapanış. Selamlama + "Saygılarımla / Kind regards,
  Tolga Olguner"; iletişim bilgisi yazma (form zaten istiyor).
- İlan bir **eğitim programıysa** (staj değilse) mektup buna göre yazılır ve Tolga'ya
  zorunlu stajın yerine geçmediği hatırlatılır.
- **Çelişki varsa yazma, sor:** ilanın şartı cevap bankasıyla çelişiyorsa (Türk Tuborg:
  İzmir'de ikamet ↔ taşınma: hayır) taslak yazılmaz.

## Başvuru (Faz 3 — etkileşimli oturum, zamanlanmış görev DEĞİL)

Tolga sohbette "listemdeki ilanlara başvuralım" dediğinde:

1. `decision = 'listede'` ilanları ona göster.
2. Yalnızca **onaylı ön yazısı olan** ilanlara geç (ön yazı alanı yoksa da onaylı olmalı —
   Tolga'nın ilanı gözden geçirdiğinin işareti). Her ilan için Chrome'da platformun **kendi** formunu aç. Hesap açtıran firma sistemleri
   (Workday, SuccessFactors...) için form doldurulmaz: hesap açmak ve şifre girmek yasak.
   Onlarda ön yazı + cevapları hazırla, gönderimi Tolga yapar.
3. Formu **cevap bankasından** doldur (`application_answers`, panelde `/admin/cevaplar`):
   - Yalnızca `confirmed = true` cevaplar kullanılır. Bankada olmayan, boş ya da onaysız
     soru gelirse **dur ve sor**; aldığın cevabı panele kaydetmesini öner, sen uydurma.
   - `sensitive = true` alanları (telefon, ikamet, askerlik, doğum yılı, referans) onaylı
     olsa bile yazmadan önce "şunu giriyorum" diye söyle.
   - İngilizce ilanda `answer_en`; boşsa Türkçesini çevirme, sor.
   - Referans iletişim bilgisi hocaların onayı alınmadan hiçbir forma girilmez.
4. **LinkedIn:** son adımda dur; "Gönder"e Tolga basar (22.09.2026 kararı).
   **Diğerleri:** formun özetini göster, açık "evet" gelince gönder.
5. Gönderilen ilan ertesi günkü başvuru senkronuyla `job_applications`'a düşer;
   `ilan-kesif.py esle` onu burada `basvuruldu` yapar.

### Platform notları (22.09.2026 ilk başvuru turu, 7 ilan)

**Genel**
- Chrome sekmesi **görünür** olmalı. Arka plandaki sekmede (`visibilityState: hidden`)
  düğmeye `ref` ile basmak çalışıyor ama koordinatlı tıklama ve yazma boşa gidiyor;
  açılır pencereler kapanıyor. Yazmaya başlamadan önce Tolga'dan sekmeyi öne almasını iste.
- Metin alanlarında `ctrl+a` kullanma: bazı formlar (Kula) seçmek yerine "a" yazıyor.
  Seçmek için `triple_click`.
- İlanın bulunduğu platform ile başvurunun yapıldığı yer farklı olabilir (LinkedIn
  ilanı → Youthall / Kula / Lever / firma sitesi). O zaman `ilan-kesif.py esle`
  eşleştiremez: `job_applications` kaydını gerçek başvuru yerine göre elle ekle ve ilanı
  `basvuruldu` yap.
- Onaylı ön yazı çoğu formda **kullanılmıyor** (Youthall, Lever, LinkedIn Kolay Başvuru
  alan vermiyor). Kula dosya olarak istiyor: onaylı metni `python-docx` ile .docx yap.

**LinkedIn Kolay Başvuru** — pencere kapalı bir gölge DOM içinde; `querySelector` göremiyor,
ekran görüntüsü + koordinatla çalış. Dosya yükleme yerel dosya seçici açıyor, **yapılamaz**;
kayıtlı CV'lerden seçilir. E-posta açılır listesi yalnızca LinkedIn hesabındaki adresler
(`tolgaolguner1`, okul adresi). Sayısal tanımlı sorular düz metin görünür ama yalnızca
rakam kabul eder ("Ocak 2027" → "Geçersiz giriş", "2027" geçer). Son "Gönder"e Tolga basar.

**LinkedIn dış başvuru** — "Başvur" bağlantısının `url` parametresinden hedefi oku,
tıklamadan: Toyota → Youthall, Massive Bio → `careers.kula.ai`, Şişecam →
`careers.sisecam.com` (SAP SuccessFactors).

**Youthall** — "Hemen Başvur" `/tr/internship/<n>/apply/`'a gider; `checkCVStatus` yalnızca
profil eksiklerine bakar, göndermez. Sayfada firma soruları + **"Cevapları Gönder"**.
Bazı ilanlarda bu adres firmanın kendi sitesine yönlendiriyor (Commencis → Lever).

**Kariyer.net** — "Başvur" `/basvuru-tamamlama/<ilan>`'a gider: Özgeçmiş → Ön yazı →
Şirket soruları → "Başvurunu Tamamla". Adımlar sırayla açılıyor. **Ön yazı düzenleyicisine
otomasyonla girilen metin kaydedilmedi** ("Ön yazı eklerken bir hata oluştu", yalnızca
`OPTIONS /coverletters` görünüyor). Aynı metni Tolga elle ekleyince **kaydedildi** — sorun içerik
değil, otomasyon algılaması. Ön yazıyı Tolga elle ekler; şirket sorularından devam edilir.

**Lever** (`jobs.lever.co`) — hesap yok. CV yüklenince ad/e-posta/telefon/konum/şirket
CV'den doluyor; kontrol et. **hCaptcha** var → gönderimi Tolga yapar.

**Kula** (`careers.kula.ai`) — hesap yok, dosya girişleri erişilebilir (`file_upload`
çalışıyor). Telefonun ülke seçicisi ayrı: yalnızca rakam yaz, "+90" yazma. Üstteki
"Autofill from resume" kutusu adres gibi alanları kendiliğinden dolduruyor. **reCAPTCHA**
var. Chrome'un sayfa çevirisi açılıp kapanınca sayfa yenilenip form boşaldı.

**SAP SuccessFactors** (Şişecam) — aday hesabı istiyor. **Hesap açılmaz, şifre girilmez**;
Tolga girişi yapar, sonra form doldurulabilir.
