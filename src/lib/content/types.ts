/**
 * Veritabaninda tutulan icerik agacinin tipleri.
 *
 * Kod tarafindaki `HomeDict` / `Dict` iki paralel agac (`{tr: {...}, en: {...}}`)
 * ve TR/EN dizileri yalnizca INDEX ile eslesiyor. Editorde iki literal yan
 * yanayken bu idare edilebilir; CMS'te tehlikeli: `stops[3]`u silip EN tarafini
 * aynalamayi kacirirsan sonraki tum kayitlar bir kayar ve hicbir tip kontrolu
 * bunu yakalamaz.
 *
 * Bu yuzden depolamada **tek agac** var: cevrilebilir her yaprak `{tr, en}`
 * (bkz. `Ceviri`), her dizi ogesinde kalici bir `id`. Yaprak seviyesindeki
 * `{tr, en}` ayrica panelde "TR ve EN yan yana duzenleme" gereksinimiyle birebir
 * ortusuyor: form satiri dogrudan depolama dugumu oluyor.
 */

/** Cevrilebilir yaprak. */
export type Ceviri = { tr: string; en: string };

/** Kimlikli dizi ogesi: silme/siralama guvenli, React key'leri kararli. */
export type Kimlikli = { id: string };

/** Tek cevrilebilir degerden ibaret liste ogesi (madde, dil, yetkinlik...). */
export type CeviriOgesi = Kimlikli & { value: Ceviri };

// --------------------------------------------------------------- ana sayfa

export type StatDoc = Kimlikli & {
  value: number;
  suffix?: string;
  decimals?: number;
  /** "repos" ise deger calisma aninda GitHub'dan gelen sayiyla degistirilir. */
  key?: "repos";
  label: Ceviri;
};

export type StopDoc = Kimlikli & {
  /** Iki dilde de ayni; cevrilmiyor. */
  year: string;
  period: Ceviri;
  tag: Ceviri;
  featured?: boolean;
  title: Ceviri;
  text: Ceviri;
  details: CeviriOgesi[];
};

export type CardDoc = Kimlikli & {
  statusKind: "capstone" | "team" | "research" | "live";
  period: string;
  url: string;
  tech: string[];
  title: Ceviri;
  status: Ceviri;
  text: Ceviri;
};

export type StepDoc = Kimlikli & { n: string; title: Ceviri; text: Ceviri };

export type SkillGroupDoc = Kimlikli & { label: Ceviri; items: CeviriOgesi[] };

export type SoftSkillDoc = Kimlikli & { title: Ceviri; text: Ceviri };

export type CiftDoc = Kimlikli & { k: Ceviri; v: Ceviri };

export type HomeDoc = {
  nav: Record<
    "about" | "journey" | "projects" | "research" | "skills" | "contact" | "cv" | "menu" | "menuClose" | "skipIntro" | "temaAcik" | "temaKoyu",
    Ceviri
  >;
  hero: Record<"kicker" | "line1" | "line2" | "sub" | "ctaProjects" | "ctaCv", Ceviri>;
  stats: StatDoc[];
  about: { title: Ceviri; p1: Ceviri; p2: Ceviri; facts: CiftDoc[]; badges: CiftDoc[] };
  journey: { title: Ceviri; rangeLabel: Ceviri; galleryLabel: Ceviri; stops: StopDoc[] };
  projects: { title: Ceviri; sub: Ceviri; othersTitle: Ceviri; othersSub: Ceviri; cards: CardDoc[] };
  research: {
    title: Ceviri;
    kicker: Ceviri;
    headline: Ceviri;
    quote: Ceviri;
    text: Ceviri;
    highlight: { title: Ceviri; label: Ceviri };
    org: Ceviri;
    steps: StepDoc[];
  };
  skills: { title: Ceviri; sub: Ceviri; techLabel: Ceviri; humanLabel: Ceviri; groups: SkillGroupDoc[]; human: SoftSkillDoc[] };
  contact: Record<"title" | "text" | "email" | "cv", Ceviri>;
  footer: { rights: Ceviri; built: Ceviri };
};

// ---------------------------------------------------------------------- cv

export type EntryDoc = Kimlikli & {
  title: Ceviri;
  org: Ceviri;
  date: Ceviri;
  /** Deneyim maddeleri; gonullu deneyimde bos, yerine `note` kullaniliyor. */
  items: CeviriOgesi[];
  note?: Ceviri;
};

export type CvProjectDoc = Kimlikli & {
  url: string;
  urlLabel: string;
  title: Ceviri;
  kind: Ceviri;
  tech: Ceviri;
  note: Ceviri;
  items: CeviriOgesi[];
};

/**
 * Sayfada `items` " · " ile birlestirilmis tek string olarak gorunuyor.
 * Panelde gercek liste duzenlensin diye burada dizi tutuluyor; birlestirme
 * `localizeCv` icinde yapiliyor.
 */
export type CvSkillGroupDoc = Kimlikli & { label: Ceviri; items: CeviriOgesi[] };

export type CvDoc = {
  nav: Record<"about" | "experience" | "research" | "projects" | "skills" | "portfolio" | "menu" | "menuClose" | "temaAcik" | "temaKoyu", Ceviri>;
  /** `cvFile` burada YOK: PDF yolu `media_assets` tablosundan cozuluyor. */
  hero: Record<"tagline" | "intro" | "cv" | "email", Ceviri>;
  sections: Record<"experience" | "communities" | "research" | "projects" | "skills" | "technical" | "personal" | "education" | "languages", Ceviri>;
  experience: EntryDoc[];
  communities: EntryDoc[];
  research: { title: Ceviri; role: Ceviri; org: Ceviri; date: Ceviri; topic: Ceviri; items: CeviriOgesi[] };
  projects: CvProjectDoc[];
  skills: CvSkillGroupDoc[];
  personal: CeviriOgesi[];
  education: { degree: Ceviri; school: Ceviri; date: Ceviri; meta: Ceviri };
  languages: CeviriOgesi[];
  footer: Ceviri;
  updated: Ceviri;
  links: { email: string; github: string; linkedin: string };
};

/** Galeri fotografi — `gallery_photos` tablosunun okuma sekli. */
export type PhotoRow = {
  id: string;
  storage_path: string;
  caption_tr: string;
  caption_en: string;
  width: number | null;
  height: number | null;
  sort_order: number;
};

/** `media_assets` anahtarlari. */
export type AssetKey = "cv_tr" | "cv_en";

/** Sayfada gorunen galeri fotografi. */
export type Photo = { src: string; tr: string; en: string };
