# Galeri fotoğrafları

Yolculuk bölümünün altındaki akan şeritte görünecek fotoğraflar bu klasöre konur.

## Kural: dosya adı = alt başlık

Fotoğrafın alt başlığı, dosya adının kendisidir. Uzantı ve baştaki sıra öneki
atılır, gerisi olduğu gibi yazılır:

```
01-IT&MIS Hackathon 2025.jpg        ->  IT&MIS Hackathon 2025
02-Kariyer Fuarı — tanıtım standı.jpg  ->  Kariyer Fuarı — tanıtım standı
```

- **Sıralama** dosya adına göredir; `01-`, `02-` gibi ön ek verin.
- **Biçim:** `.jpg`, `.jpeg`, `.png`, `.webp` veya `.avif`.
- **Oran:** 4:3 yatay. Uzun kenarı 1600 piksel yeterlidir.
- Windows dosya adlarında `\ / : * ? " < > |` karakterleri kullanılamaz;
  bu karakterlere ihtiyaç duyarsan alt başlığı `src/galeri.json` içinden ver.

## İngilizce alt başlık (isteğe bağlı)

`src/galeri.json` içine dosya adıyla eşleşen bir kayıt eklenirse dosya adının
yerine o kullanılır:

```json
{
  "01-IT&MIS Hackathon 2025.jpg": {
    "tr": "IT&MIS Hackathon 2025 — organizasyon ekibi",
    "en": "IT&MIS Hackathon 2025 — organizing team"
  }
}
```

Kayıt yoksa İngilizce sürümde de Türkçe alt başlık görünür.

Klasör boşsa şerit hiç render edilmez, sayfa normal çalışmaya devam eder.
