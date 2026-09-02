# tolguner.me

Kişisel portfolyo sitem — [tolguner.me](https://tolguner.me). CV'deki bilgilerin web hâli:
deneyim, TÜBİTAK 2209-A araştırma projesi, seçili projeler ve GitHub'daki diğer depolar.

## Teknolojiler

- **Next.js 15** (App Router, statik export) · **TypeScript** · **Tailwind CSS 4**
- Türkçe / İngilizce dil değiştirici (tarayıcıda hatırlanır)
- "Diğer Depolar" bölümü build sırasında GitHub API'den çekilir
- **GitHub Pages** üzerinde yayın; `main` dalına her push'ta GitHub Actions ile otomatik deploy

## Yerelde çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statik çıktı: out/
```

`GITHUB_TOKEN` ortam değişkeni verilirse depo listesi oran sınırına takılmadan çekilir; verilmezse
istek başarısız olursa bölüm boş kalır, site yine de derlenir.

## Yapı

```
src/app/         layout, sayfa, global stiller
src/content.ts   tüm metinler (tr / en)
src/components/  Site.tsx — sayfanın tamamı
public/          fotoğraf, CV PDF'leri, CNAME
```

## Lisans

Kod MIT lisanslıdır. Metinler, fotoğraf ve CV dosyaları bana aittir; izinsiz kullanılamaz.
