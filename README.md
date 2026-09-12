# tolguner.me

Kişisel portfolyo sitem — [tolguner.me](https://tolguner.me). Ana sayfa scroll'a bağlı bir
anlatı; `/cv` aynı içeriğin özgeçmiş düzenindeki hâli. İçerik veritabanında tutulur ve giriş
gerektiren bir yönetim panelinden düzenlenir — metin değiştirmek için kod düzenlemek gerekmez.

## Teknolojiler

- **Next.js 15** (App Router, sunucu tarafı) · **TypeScript** · **Tailwind CSS 4**
- **Three.js** (React Three Fiber) ve **GSAP ScrollTrigger** — giriş sahnesi ve scroll anlatısı
- **Supabase** — Postgres (RLS), Storage, Auth
- **Vercel** — `main` dalına her push'ta dağıtım

## Mimari

İçerik iki JSONB dokümanında (`home`, `cv`) tutulur; galeri ve medya normalize tablolarda.
Depolama şeklinde çevrilebilir her yaprak `{tr, en}` ve dizi öğelerinin kalıcı `id`'si var —
TR/EN'i yalnızca dizi indeksiyle eşleştirmek, bir öğe silindiğinde sessizce kayar ve hiçbir tip
kontrolü bunu yakalamaz.

Okuma yolunda iki savunma katmanı var:

1. `unstable_cache` — her istekte veritabanına gidilmez.
2. **Commit'li JSON yedeği** — Supabase ücretsiz katmanı 7 gün hareketsizlikte projeyi
   duraklatır. Okuma hata alırsa site `src/lib/content/seed/*.json` ile ayakta kalır. Ayrıca
   günlük bir cron (`/api/canli/`) veritabanına dokunarak duraklamayı önler.

## Yönetim paneli (`/admin`)

- İçerik düzenleme: TR/EN yan yana, taslak → yayımla akışı, önizleme (Next Draft Mode)
- Revizyon geçmişi ve tek tıkla geri dönme
- Galeri: kırpma ekranı (4:3 oran, çözünürlük korunur), taslak/yayımda ayrımı,
  sürükleyerek sıralama, geri alınabilir silme
- Dosyalar: CV PDF'lerini yükleme, sürüm geçmişi, istenen sürüme dönme

**Yetkilendirme `authenticated` rolüne değil `admin_users` üyeliğine bağlı** — Supabase'te public
signup varsayılan açık ve yeniden açılabilen bir kutu. Yazma yetkisi veren `is_admin()` ayrıca
oturumun ikinci adımı geçmiş olmasını (TOTP, `aal2`) şart koşar: parolayı ele geçiren biri bu
sitenin arayüzünü hiç kullanmaz, doğrudan veritabanı API'sine bağlanır — arayüzdeki kapı o
yoldan geçmez.

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # değerleri doldur
npm run dev                  # http://localhost:3000
```

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | `src/content*.ts` literal'lerinden JSON yedeğini üretir ve doğrular |
| `npm run seed -- --db` | Ayrıca veritabanına yazar (`SUPABASE_SECRET_KEY` ister, yalnızca yerel) |
| `python scripts/ikon-uret.py` | Site ikonunu üretir (SVG + PNG + ICO, tek geometriden) |

`GH_TOKEN` verilmezse GitHub API saatte 60 istekle sınırlıdır ve aşılırsa "Diğer Depolar"
bölümü **sessizce boşalır**; derleme hata vermez, bu yüzden `repos.ts` uyarı log'u basar.

`SUPABASE_SECRET_KEY` RLS'i tamamen atlar ve **Vercel'e hiç konmaz**; panel, giriş yapmış
kullanıcı olarak RLS altında yazar.

## Yapı

```
src/app/               layout, sayfalar, /admin rotaları, /api/canli
src/components/home/   Home.tsx (scroll anlatısı), NodeSphere, PhotoMarquee
src/components/admin/  panel bileşenleri
src/lib/content/       types (depolama ağacı) · localize · read (önbellek + yedek) · alanlar
src/lib/supabase/      tarayıcı / sunucu / anonim istemciler
src/content*.ts        tip tanımları ve seed kaynağı — CANLI İÇERİK DEĞİL
supabase/migrations/   şema, RLS politikaları, RPC'ler
scripts/               seed, ikon üretimi
```

> `src/content.ts` ve `src/content-home.ts` düzenlemek siteyi **değiştirmez**. Canlı içerik
> veritabanındadır; bu dosyalar yalnızca tip tanımı ve ilk yükleme kaynağıdır.

## Lisans

Kod MIT lisanslıdır. Metinler, fotoğraflar ve CV dosyaları bana aittir; izinsiz kullanılamaz.
