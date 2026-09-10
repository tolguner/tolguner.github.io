/**
 * Alan grafigi — panelin ne cizecegini anlatan VERI.
 *
 * Zod semasindan turetilmiyor: otomatik uretilen formlar demoda guzel gorunur,
 * icerik duzenlemede berbattir. Bolum gruplamasi, textarea/input ayrimi ve
 * TR/EN yerlesimi otomatik cikarimla kaybolur. Burada 60 bespoke bilesen
 * yazmadan, ~1 dosyalik veriyle ayni sonucu aliyoruz.
 */

import type { Ceviri } from "./types";

export type Alan =
  /** Cevrilebilir tek satir. */
  | { tur: "metin"; yol: string; etiket: string }
  /** Cevrilebilir cok satir. */
  | { tur: "paragraf"; yol: string; etiket: string; satir?: number }
  /** Cevrilmeyen skaler — panelde "ortak" rozetiyle ayrisir. */
  | { tur: "duz"; yol: string; etiket: string; girdi?: "metin" | "sayi" | "url" }
  /** Cevrilebilir madde listesi ({id, value:{tr,en}}[]). */
  | { tur: "liste"; yol: string; etiket: string; tekil: string }
  /** Cevrilmeyen duz string dizisi (Card.tech gibi). */
  | { tur: "duzListe"; yol: string; etiket: string; tekil: string }
  /** Kimlikli nesne listesi; her oge katlanabilir kart. */
  | {
      tur: "nesneListesi";
      yol: string;
      etiket: string;
      tekil: string;
      /** Kart basliginda gorunen ozet (kapaliyken ne oldugunu anlamak icin). */
      ozet: (oge: Record<string, unknown>) => string;
      alanlar: Alan[];
      yeni: () => Record<string, unknown>;
    }
  | { tur: "grup"; baslik: string; aciklama?: string; alanlar: Alan[] };

const bos = (): Ceviri => ({ tr: "", en: "" });
const kimlik = () => crypto.randomUUID();
const ogeler = (n: number) => Array.from({ length: n }, () => ({ id: kimlik(), value: bos() }));

/** Ozet metni: cevrilebilir bir yapragin TR degeri, yoksa yer tutucu. */
function tr(oge: Record<string, unknown>, anahtar: string, varsayilan = "(başlıksız)") {
  const v = oge[anahtar] as Ceviri | undefined;
  return v?.tr?.trim() || varsayilan;
}

// --------------------------------------------------------------------- cv

export const CV_ALANLARI: Alan[] = [
  {
    tur: "grup",
    baslik: "Üst bilgi",
    alanlar: [
      { tur: "metin", yol: "hero.tagline", etiket: "Unvan satırı" },
      { tur: "paragraf", yol: "hero.intro", etiket: "Özet paragraf", satir: 5 },
      { tur: "metin", yol: "hero.cv", etiket: "CV düğmesi yazısı" },
      { tur: "metin", yol: "hero.email", etiket: "E-posta düğmesi yazısı" },
      { tur: "metin", yol: "footer", etiket: "Alt bilgi (konum)" },
      { tur: "metin", yol: "updated", etiket: "“Son güncelleme” etiketi" },
    ],
  },
  {
    tur: "grup",
    baslik: "Bağlantılar",
    aciklama: "İki dilde de aynı; çevrilmez.",
    alanlar: [
      { tur: "duz", yol: "links.email", etiket: "E-posta" },
      { tur: "duz", yol: "links.github", etiket: "GitHub", girdi: "url" },
      { tur: "duz", yol: "links.linkedin", etiket: "LinkedIn", girdi: "url" },
      { tur: "duz", yol: "links.portfolyo", etiket: "“Portfolyo” düğmesinin hedefi" },
    ],
  },
  {
    tur: "grup",
    baslik: "Eğitim",
    alanlar: [
      { tur: "metin", yol: "education.degree", etiket: "Program" },
      { tur: "metin", yol: "education.school", etiket: "Kurum" },
      { tur: "metin", yol: "education.date", etiket: "Tarih" },
      { tur: "metin", yol: "education.meta", etiket: "Alt satır (not ortalaması, burs)" },
    ],
  },
  {
    tur: "grup",
    baslik: "Deneyim",
    alanlar: [
      {
        tur: "nesneListesi",
        yol: "experience",
        etiket: "Deneyim kayıtları",
        tekil: "deneyim",
        ozet: (o) => `${tr(o, "title")} · ${tr(o, "org", "")}`,
        yeni: () => ({ id: kimlik(), title: bos(), org: bos(), date: bos(), items: ogeler(1) }),
        alanlar: [
          { tur: "metin", yol: "title", etiket: "Pozisyon" },
          { tur: "metin", yol: "org", etiket: "Kurum" },
          { tur: "metin", yol: "date", etiket: "Tarih" },
          { tur: "liste", yol: "items", etiket: "Maddeler", tekil: "madde" },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "Gönüllü Deneyim",
    alanlar: [
      {
        tur: "nesneListesi",
        yol: "communities",
        etiket: "Gönüllü deneyim kayıtları",
        tekil: "kayıt",
        ozet: (o) => `${tr(o, "title")} · ${tr(o, "org", "")}`,
        yeni: () => ({ id: kimlik(), title: bos(), org: bos(), date: bos(), items: [], note: bos() }),
        alanlar: [
          { tur: "metin", yol: "title", etiket: "Rol" },
          { tur: "metin", yol: "org", etiket: "Kurum" },
          { tur: "metin", yol: "date", etiket: "Tarih" },
          { tur: "paragraf", yol: "note", etiket: "Açıklama", satir: 2 },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "Araştırma",
    alanlar: [
      { tur: "metin", yol: "research.title", etiket: "Başlık" },
      { tur: "metin", yol: "research.role", etiket: "Rol / ekip" },
      { tur: "metin", yol: "research.date", etiket: "Tarih" },
      { tur: "paragraf", yol: "research.org", etiket: "Alt satır (proje adı · başvuru no)", satir: 3 },
      { tur: "paragraf", yol: "research.topic", etiket: "Konu (yalnızca meta veride kullanılır)", satir: 3 },
      { tur: "liste", yol: "research.items", etiket: "Maddeler", tekil: "madde" },
    ],
  },
  {
    tur: "grup",
    baslik: "Seçili Projeler",
    alanlar: [
      {
        tur: "nesneListesi",
        yol: "projects",
        etiket: "Projeler",
        tekil: "proje",
        ozet: (o) => `${tr(o, "title")} · ${tr(o, "kind", "")}`,
        yeni: () => ({
          id: kimlik(),
          url: "",
          urlLabel: "",
          title: bos(),
          kind: bos(),
          tech: bos(),
          note: bos(),
          items: ogeler(1),
        }),
        alanlar: [
          { tur: "metin", yol: "title", etiket: "Proje adı" },
          { tur: "metin", yol: "kind", etiket: "Tür / rol · yıl" },
          { tur: "metin", yol: "tech", etiket: "Teknolojiler (· ile ayrılmış)" },
          { tur: "paragraf", yol: "note", etiket: "Açıklama", satir: 3 },
          { tur: "liste", yol: "items", etiket: "Teknik maddeler", tekil: "madde" },
          { tur: "duz", yol: "url", etiket: "Bağlantı", girdi: "url" },
          { tur: "duz", yol: "urlLabel", etiket: "Bağlantı yazısı" },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "Yetkinlikler",
    alanlar: [
      {
        tur: "nesneListesi",
        yol: "skills",
        etiket: "Teknik yetkinlik satırları",
        tekil: "satır",
        ozet: (o) => tr(o, "label"),
        yeni: () => ({ id: kimlik(), label: bos(), items: ogeler(1) }),
        alanlar: [
          { tur: "metin", yol: "label", etiket: "Kategori" },
          { tur: "liste", yol: "items", etiket: "Öğeler", tekil: "öğe" },
        ],
      },
      { tur: "liste", yol: "personal", etiket: "Kişisel yetkinlikler", tekil: "yetkinlik" },
      { tur: "liste", yol: "languages", etiket: "Diller", tekil: "dil" },
    ],
  },
  {
    tur: "grup",
    baslik: "Bölüm başlıkları",
    aciklama: "Sayfadaki büyük harfli bölüm adları.",
    alanlar: [
      { tur: "metin", yol: "sections.education", etiket: "Eğitim" },
      { tur: "metin", yol: "sections.experience", etiket: "Deneyim" },
      { tur: "metin", yol: "sections.communities", etiket: "Gönüllü Deneyim" },
      { tur: "metin", yol: "sections.research", etiket: "Araştırma" },
      { tur: "metin", yol: "sections.projects", etiket: "Projeler" },
      { tur: "metin", yol: "sections.skills", etiket: "Yetkinlikler" },
      { tur: "metin", yol: "sections.technical", etiket: "Teknik Yetkinlikler" },
      { tur: "metin", yol: "sections.personal", etiket: "Kişisel Yetkinlikler" },
      { tur: "metin", yol: "sections.languages", etiket: "Diller" },
    ],
  },
  {
    tur: "grup",
    baslik: "Menü ve düğme yazıları",
    alanlar: [
      { tur: "metin", yol: "nav.about", etiket: "Hakkımda" },
      { tur: "metin", yol: "nav.experience", etiket: "Deneyim" },
      { tur: "metin", yol: "nav.research", etiket: "Araştırma" },
      { tur: "metin", yol: "nav.projects", etiket: "Projeler" },
      { tur: "metin", yol: "nav.skills", etiket: "Yetkinlikler" },
      { tur: "metin", yol: "nav.portfolio", etiket: "Portfolyo düğmesi" },
      { tur: "metin", yol: "nav.menu", etiket: "Menüyü aç" },
      { tur: "metin", yol: "nav.menuClose", etiket: "Menüyü kapat" },
      { tur: "metin", yol: "nav.temaAcik", etiket: "Açık temaya geç" },
      { tur: "metin", yol: "nav.temaKoyu", etiket: "Koyu temaya geç" },
    ],
  },
];

// -------------------------------------------------------------- ana sayfa

export const HOME_ALANLARI: Alan[] = [
  {
    tur: "grup",
    baslik: "Giriş",
    alanlar: [
      { tur: "metin", yol: "hero.kicker", etiket: "Üst etiket" },
      { tur: "metin", yol: "hero.line1", etiket: "Başlık — 1. satır" },
      { tur: "metin", yol: "hero.line2", etiket: "Başlık — 2. satır" },
      { tur: "paragraf", yol: "hero.sub", etiket: "Alt paragraf", satir: 5 },
      { tur: "metin", yol: "hero.ctaProjects", etiket: "Birincil düğme" },
      { tur: "metin", yol: "hero.ctaCv", etiket: "İkincil düğme" },
    ],
  },
  {
    tur: "grup",
    baslik: "Sayaçlar",
    aciklama: "“GitHub deposu” satırının değeri çalışma anında GitHub’dan gelir; buradaki sayı yalnızca yedektir.",
    alanlar: [
      {
        tur: "nesneListesi",
        yol: "stats",
        etiket: "Sayaçlar",
        tekil: "sayaç",
        ozet: (o) => `${o.value ?? ""} — ${tr(o, "label")}`,
        yeni: () => ({ id: kimlik(), value: 0, label: bos() }),
        alanlar: [
          { tur: "duz", yol: "value", etiket: "Değer", girdi: "sayi" },
          { tur: "duz", yol: "decimals", etiket: "Ondalık basamak", girdi: "sayi" },
          { tur: "duz", yol: "suffix", etiket: "Son ek" },
          { tur: "metin", yol: "label", etiket: "Etiket" },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "Hakkımda",
    alanlar: [
      { tur: "metin", yol: "about.title", etiket: "Bölüm başlığı" },
      { tur: "paragraf", yol: "about.p1", etiket: "1. paragraf", satir: 5 },
      { tur: "paragraf", yol: "about.p2", etiket: "2. paragraf", satir: 6 },
      {
        tur: "nesneListesi",
        yol: "about.facts",
        etiket: "Künye satırları",
        tekil: "satır",
        ozet: (o) => `${tr(o, "k")}: ${tr(o, "v", "")}`,
        yeni: () => ({ id: kimlik(), k: bos(), v: bos() }),
        alanlar: [
          { tur: "metin", yol: "k", etiket: "Etiket" },
          { tur: "metin", yol: "v", etiket: "Değer" },
        ],
      },
      {
        tur: "nesneListesi",
        yol: "about.badges",
        etiket: "Rozetler",
        tekil: "rozet",
        ozet: (o) => `${tr(o, "k")} — ${tr(o, "v", "")}`,
        yeni: () => ({ id: kimlik(), k: bos(), v: bos() }),
        alanlar: [
          { tur: "metin", yol: "k", etiket: "Üst satır" },
          { tur: "metin", yol: "v", etiket: "Alt satır" },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "Yolculuk",
    alanlar: [
      { tur: "metin", yol: "journey.title", etiket: "Bölüm başlığı" },
      { tur: "metin", yol: "journey.rangeLabel", etiket: "Zaman aralığı etiketi" },
      { tur: "metin", yol: "journey.galleryLabel", etiket: "Galeri şeridi etiketi" },
      {
        tur: "nesneListesi",
        yol: "journey.stops",
        etiket: "Duraklar",
        tekil: "durak",
        ozet: (o) => `${o.year ?? ""} · ${tr(o, "title")}`,
        yeni: () => ({ id: kimlik(), year: "", period: bos(), tag: bos(), title: bos(), text: bos(), details: ogeler(1) }),
        alanlar: [
          { tur: "duz", yol: "year", etiket: "Yıl (iki dilde ortak)" },
          { tur: "metin", yol: "period", etiket: "Dönem" },
          { tur: "metin", yol: "tag", etiket: "Etiket" },
          { tur: "metin", yol: "title", etiket: "Başlık" },
          { tur: "paragraf", yol: "text", etiket: "Metin", satir: 4 },
          { tur: "liste", yol: "details", etiket: "Dipnot maddeleri", tekil: "madde" },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "Projeler",
    alanlar: [
      { tur: "metin", yol: "projects.title", etiket: "Bölüm başlığı" },
      { tur: "paragraf", yol: "projects.sub", etiket: "Alt başlık", satir: 2 },
      {
        tur: "nesneListesi",
        yol: "projects.cards",
        etiket: "Öne çıkan projeler",
        tekil: "proje",
        ozet: (o) => `${tr(o, "title")} · ${o.period ?? ""}`,
        yeni: () => ({
          id: kimlik(),
          statusKind: "team",
          period: "",
          url: "",
          tech: [],
          title: bos(),
          status: bos(),
          text: bos(),
        }),
        alanlar: [
          { tur: "metin", yol: "title", etiket: "Proje adı" },
          { tur: "metin", yol: "status", etiket: "Durum yazısı" },
          { tur: "duz", yol: "statusKind", etiket: "Durum rengi (capstone / team / research / live)" },
          { tur: "duz", yol: "period", etiket: "Yıl" },
          { tur: "paragraf", yol: "text", etiket: "Açıklama", satir: 5 },
          { tur: "duzListe", yol: "tech", etiket: "Teknolojiler", tekil: "teknoloji" },
          { tur: "duz", yol: "url", etiket: "Bağlantı", girdi: "url" },
        ],
      },
      { tur: "metin", yol: "projects.othersTitle", etiket: "“Diğer depolar” başlığı" },
      { tur: "metin", yol: "projects.othersSub", etiket: "“Diğer depolar” alt başlığı" },
    ],
  },
  {
    tur: "grup",
    baslik: "Araştırma",
    alanlar: [
      { tur: "metin", yol: "research.title", etiket: "Bölüm başlığı" },
      { tur: "metin", yol: "research.kicker", etiket: "Üst etiket" },
      { tur: "paragraf", yol: "research.headline", etiket: "Vurgu sorusu", satir: 3 },
      { tur: "paragraf", yol: "research.quote", etiket: "Proje adı (alıntı)", satir: 4 },
      { tur: "paragraf", yol: "research.text", etiket: "Açıklama", satir: 6 },
      { tur: "metin", yol: "research.highlight.title", etiket: "Rozet — başlık" },
      { tur: "metin", yol: "research.highlight.label", etiket: "Rozet — alt satır" },
      { tur: "metin", yol: "research.org", etiket: "Alt bilgi (başvuru no · tarih)" },
      {
        tur: "nesneListesi",
        yol: "research.steps",
        etiket: "Adımlar",
        tekil: "adım",
        ozet: (o) => `${o.n ?? ""} ${tr(o, "title")}`,
        yeni: () => ({ id: kimlik(), n: "", title: bos(), text: bos() }),
        alanlar: [
          { tur: "duz", yol: "n", etiket: "Numara" },
          { tur: "metin", yol: "title", etiket: "Başlık" },
          { tur: "paragraf", yol: "text", etiket: "Metin", satir: 3 },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "Yetkinlikler",
    alanlar: [
      { tur: "metin", yol: "skills.title", etiket: "Bölüm başlığı" },
      { tur: "paragraf", yol: "skills.sub", etiket: "Alt başlık", satir: 2 },
      { tur: "metin", yol: "skills.techLabel", etiket: "Teknik sütun başlığı" },
      { tur: "metin", yol: "skills.humanLabel", etiket: "İnsan tarafı sütun başlığı" },
      {
        tur: "nesneListesi",
        yol: "skills.groups",
        etiket: "Teknik gruplar",
        tekil: "grup",
        ozet: (o) => tr(o, "label"),
        yeni: () => ({ id: kimlik(), label: bos(), items: ogeler(1) }),
        alanlar: [
          { tur: "metin", yol: "label", etiket: "Kategori" },
          { tur: "liste", yol: "items", etiket: "Öğeler", tekil: "öğe" },
        ],
      },
      {
        tur: "nesneListesi",
        yol: "skills.human",
        etiket: "İnsan tarafı",
        tekil: "yetkinlik",
        ozet: (o) => tr(o, "title"),
        yeni: () => ({ id: kimlik(), title: bos(), text: bos() }),
        alanlar: [
          { tur: "metin", yol: "title", etiket: "Başlık" },
          { tur: "paragraf", yol: "text", etiket: "Metin", satir: 3 },
        ],
      },
    ],
  },
  {
    tur: "grup",
    baslik: "İletişim ve alt bilgi",
    alanlar: [
      { tur: "metin", yol: "contact.title", etiket: "Başlık" },
      { tur: "paragraf", yol: "contact.text", etiket: "Metin", satir: 2 },
      { tur: "metin", yol: "contact.email", etiket: "E-posta düğmesi" },
      { tur: "metin", yol: "contact.cv", etiket: "CV düğmesi" },
      { tur: "metin", yol: "footer.rights", etiket: "Alt bilgi — ad" },
      { tur: "metin", yol: "footer.built", etiket: "Alt bilgi — teknoloji" },
    ],
  },
  {
    tur: "grup",
    baslik: "Bağlantılar",
    aciklama:
      "İki dilde de aynı; çevrilmez. Menü çapaları (#about, #journey…) burada yok — işaretlemedeki bölüm id’leriyle eşleşmek zorundalar.",
    alanlar: [
      { tur: "duz", yol: "baglantilar.heroProjeler", etiket: "Giriş — birincil düğmenin hedefi" },
      { tur: "duz", yol: "baglantilar.heroCv", etiket: "Giriş — CV düğmesinin hedefi" },
      { tur: "duz", yol: "baglantilar.iletisimCv", etiket: "İletişim — CV düğmesinin hedefi" },
      { tur: "duz", yol: "baglantilar.email", etiket: "E-posta adresi (mailto: kod tarafında eklenir)" },
      { tur: "duz", yol: "baglantilar.github", etiket: "GitHub adresi", girdi: "url" },
      { tur: "duz", yol: "baglantilar.githubEtiket", etiket: "GitHub — görünen yazı" },
      { tur: "duz", yol: "baglantilar.linkedin", etiket: "LinkedIn adresi", girdi: "url" },
      { tur: "duz", yol: "baglantilar.linkedinEtiket", etiket: "LinkedIn — görünen yazı" },
    ],
  },
  {
    tur: "grup",
    baslik: "Menü ve düğme yazıları",
    alanlar: [
      { tur: "metin", yol: "nav.about", etiket: "Hakkımda" },
      { tur: "metin", yol: "nav.journey", etiket: "Yolculuk" },
      { tur: "metin", yol: "nav.projects", etiket: "Projeler" },
      { tur: "metin", yol: "nav.research", etiket: "Araştırma" },
      { tur: "metin", yol: "nav.skills", etiket: "Yetkinlikler" },
      { tur: "metin", yol: "nav.contact", etiket: "İletişim" },
      { tur: "metin", yol: "nav.cv", etiket: "CV" },
      { tur: "metin", yol: "nav.menu", etiket: "Menüyü aç" },
      { tur: "metin", yol: "nav.menuClose", etiket: "Menüyü kapat" },
      { tur: "metin", yol: "nav.skipIntro", etiket: "Açılışı geç" },
      { tur: "metin", yol: "nav.temaAcik", etiket: "Açık temaya geç" },
      { tur: "metin", yol: "nav.temaKoyu", etiket: "Koyu temaya geç" },
    ],
  },
];

export const ALANLAR: Record<"home" | "cv", Alan[]> = { home: HOME_ALANLARI, cv: CV_ALANLARI };
