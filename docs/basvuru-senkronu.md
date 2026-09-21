# Başvuru senkronu

`/admin/basvurular` sayfasındaki kayıtlar üç platformun **kendi arayüzünden** çıkarılır.
API kullanılmıyor: Tolga'nın Chrome oturumları açık, sayfalar oradan okunuyor.

> **Sınır:** Gözetimsiz otomatik *başvuru* botu yazılmıyor. LinkedIn Kullanıcı Sözleşmesi
> 8.2 bot/scraping yasaklıyor ve riske giren, iş aranan hesabın kendisi. Burada yapılan
> şey yalnızca **kendi başvuru listesini okumak**.

## Akış

1. Chrome'da ilgili sayfayı aç (`mcp__claude-in-chrome__navigate`).
2. Aşağıdaki çıkarma tarifini `javascript_tool` ile çalıştır.
3. Kayıtları JSON dosyasına yaz, sonra:

```bash
python scripts/basvuru-senkron.py <kayitlar.json> <platform> [status] [posting_status]
```

Dosya biçimi: `[external_id, job_url, position, company, location, work_mode, applied_at]`.
`on_conflict=platform,external_id` sayesinde tekrar çalıştırmak güvenli — aynı ilan
ikinci kez eklenmez, mevcut satır güncellenir.

`javascript_tool` çıktısı ~1200 karakterde kesiliyor; kayıtları 5–7'lik parçalar hâlinde al.

## LinkedIn

`https://www.linkedin.com/jobs-tracker/`

Üstteki haplar sekme değil **filtre**. "Devam Ediyor" hapı bir alt seçim kutusu açıyor:

| hap | URL |
| --- | --- |
| Başvuruldu | `?stage=applied` |
| Devam Ediyor › Taslak | `?stage=draft` |
| Devam Ediyor › Başvur'u tıkladı | `?stage=clicked_apply` |

Kutudaki radyo düğmesine ve ardından **"Seç"** düğmesine koordinatla tıklamak gerekiyor;
`label.click()` ve `input.click()` çalışmıyor (React kontrollü).

Kart metnini `innerText`'ten satır satır oku. Satır düzeni:
`Pozisyon` / `Şirket · Konum (Çalışma şekli)` / `N gün önce yayınlandı`.

- `İş yerinde` / `Hibrit` / `Uzaktan` eşleşmesinde `/i` bayrağı **çalışmıyor** —
  "İş yerinde" ile "iş yerinde" Türkçe'de farklı harfler. Açık alternatif yaz.
- İlan kimliği `a[href*="/jobs/view/"]` içinden: `/jobs\/view\/(\d+)/`.
- "Başvuru görüntülendi" → `status: goruntulendi`,
  "Artık başvuru kabul etmiyor" → `posting_status: kapali`.

## Kariyer.net

`https://www.kariyer.net/tum-basvurular`

Sayfa Nuxt/Vue. **DOM metnini kazıma** — uzun başlıklar iki parçaya bölünüyor
("B" + "-Korupark Avm…"). Bunun yerine kartın Vue prop'larını oku:

```js
window.__kn = () => [...document.querySelectorAll('a[href*="/is-ilani/"]')].map(a => {
  let n = a, c = null;
  for (let i = 0; i < 5 && n && !c; i++) { c = n.__vue__ || n.__vueParentComponent; n = n.parentElement; }
  const p = c && (c.props || c.$props);
  if (!p) return null;
  const d = p.appliedDetail ? JSON.stringify(p.appliedDetail).match(/(\d{2})\.(\d{2})\.(\d{4})/) : null;
  return {
    external_id: String(p.jobId),
    job_url: "https://www.kariyer.net" + p.url,
    position: (p.title || "").replace(/^-/, "").trim() || p.positionName,
    company: p.subTitle,
    location: p.location,
    reviewed: !!p.reviewed,                      // true ise status: goruntulendi
    applied_at: d ? `${d[3]}-${d[2]}-${d[1]}` : null,
  };
}).filter(Boolean);
```

İki tuzak:

- `workModel` alanına **güvenme**: `2` değeri hibrit demek, uzaktan değil. Çalışma şeklini
  kartın DOM etiketinden (`İş Yerinde|Hibrit|Uzaktan`) oku.
- Başvuruların bir kısmında tarih sayfada **hiç yok** (21.09.2026'da 27 kaydın 14'ü).
  `applied_at` boş bırakılır. Komşu kartın tarihini almaya çalışma — kartlar aynı kapsayıcının
  doğrudan çocukları olduğu için kardeş/ebeveyn araması yanlış tarihi yakalıyor.

## Youthall

`https://www.youthall.com/tr/me/<kullanıcı>/applied`

Kartlar `.c-applications__card`. Satırlar: `ŞİRKET` / `Pozisyon` / `İlan yayında` / `06 Sep 2026`.
Tarih İngilizce ay kısaltmasıyla geliyor, çevirmek gerekiyor.

Bağlantı sonundaki `_N` eki **firma bazında tekrar ediyor** (iki ayrı ilan da `_4` olabilir),
bu yüzden `external_id` olarak URL yolunu kullan: `tchibo/e-ticaret-stajyeri_124`.

"İlan yayında" → `posting_status: acik`.

## Diğer

Firmaların kendi kariyer sayfalarından yapılan başvurular panelden elle eklenir;
`external_id` olarak `elle-<uuid>` üretilir ve senkron bunlara **dokunmaz**.

## Veritabanı notu

Supabase MCP'nin `list_projects` çıktısı bu projeyi **göstermiyor**, ama proje ref'i
(`ecspngpnvotpmvyotnsw`) doğrudan verilince `execute_sql` / `apply_migration` çalışıyor.
Yazma için `scripts/basvuru-senkron.py` yeterli; o `.env.local` içindeki
`SUPABASE_SECRET_KEY` ile REST üzerinden gidiyor (anahtar Vercel'e konmaz).
