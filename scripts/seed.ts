/**
 * Mevcut `src/content.ts` ve `src/content-home.ts` literal'lerini veritabani
 * agacina (`HomeDoc` / `CvDoc`) donusturur.
 *
 * Donusum BOLUM BOLUM ELLE yazildi. Genel amacli bir "walker" cazip gorunuyor
 * ama `Stat.value` (sayi), `Card.tech` (iki dilde ayni dizi) ve
 * `cv.skills[].items` (" · " ile birlestirilmis string) gibi alanlari sessizce
 * bozardi.
 *
 * Calistirma:
 *   npm run seed          -> dogrular + src/lib/content/seed/*.json yazar
 *   npm run seed -- --db  -> ayrica veritabanina upsert eder (SUPABASE_SECRET_KEY gerekir)
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import "dotenv/config";
import { config as dotenvConfig } from "dotenv";

import { getGallery } from "./galeri-kaynak";
import { content, links } from "../src/content";
import { home } from "../src/content-home";
import { localizeCv, localizeHome } from "../src/lib/content/localize";
import type { Ceviri, CeviriOgesi, CvDoc, EntryDoc, HomeDoc } from "../src/lib/content/types";

const KOK = process.cwd();
const CIKTI = path.join(KOK, "src", "lib", "content", "seed");

// Next.js .env.local'i kendisi okur; duz bir tsx scriptinde elle yuklemek gerek.
dotenvConfig({ path: path.join(KOK, ".env.local"), override: true, quiet: true });

// ------------------------------------------------------------- yardimcilar

const z = (tr: string, en: string): Ceviri => ({ tr, en });

/**
 * Iki dilin dizilerini uzunluk kontroluyle eslestirir. Bugun TR ve EN
 * dizileri yalnizca index ile eslesiyor; kaymis bir dizi buradan sessizce
 * gecerse veritabanina yanlis ceviri yazilir. Bu yuzden hata firlatiyor.
 */
function ziple<A, B, R>(ad: string, tr: A[], en: B[], f: (a: A, b: B, i: number) => R): R[] {
  assert.equal(tr.length, en.length, `${ad}: TR ${tr.length} oge, EN ${en.length} oge — diziler kaymis`);
  return tr.map((a, i) => f(a, en[i], i));
}

/** Duz string dizilerini kimlikli ceviri listesine cevirir. */
function ogeler(ad: string, onek: string, tr: string[] | undefined, en: string[] | undefined): CeviriOgesi[] {
  const a = tr ?? [];
  const b = en ?? [];
  return ziple(ad, a, b, (x, y, i) => ({ id: `${onek}-${i + 1}`, value: z(x, y) }));
}

// ------------------------------------------------------------- ana sayfa

function anaSayfaDoc(): HomeDoc {
  const t = home.tr;
  const e = home.en;

  const nav = Object.fromEntries(
    (Object.keys(t.nav) as (keyof typeof t.nav)[]).map((k) => [k, z(t.nav[k], e.nav[k])]),
  ) as HomeDoc["nav"];

  const hero = Object.fromEntries(
    (Object.keys(t.hero) as (keyof typeof t.hero)[]).map((k) => [k, z(t.hero[k], e.hero[k])]),
  ) as HomeDoc["hero"];

  const contact = Object.fromEntries(
    (Object.keys(t.contact) as (keyof typeof t.contact)[]).map((k) => [k, z(t.contact[k], e.contact[k])]),
  ) as HomeDoc["contact"];

  return {
    nav,
    hero,
    contact,
    stats: ziple("stats", t.stats, e.stats, (a, b, i) => {
      // Sayisal alanlar cevrilmiyor; iki tarafta ayni olmalari beklenir.
      assert.equal(a.value, b.value, `stats[${i}].value TR/EN farkli`);
      assert.equal(a.decimals, b.decimals, `stats[${i}].decimals TR/EN farkli`);
      assert.equal(a.suffix, b.suffix, `stats[${i}].suffix TR/EN farkli`);
      assert.equal(a.key, b.key, `stats[${i}].key TR/EN farkli`);
      const s: HomeDoc["stats"][number] = { id: `stat-${i + 1}`, value: a.value, label: z(a.label, b.label) };
      if (a.suffix !== undefined) s.suffix = a.suffix;
      if (a.decimals !== undefined) s.decimals = a.decimals;
      if (a.key !== undefined) s.key = a.key;
      return s;
    }),
    about: {
      title: z(t.about.title, e.about.title),
      p1: z(t.about.p1, e.about.p1),
      p2: z(t.about.p2, e.about.p2),
      facts: ziple("about.facts", t.about.facts, e.about.facts, (a, b, i) => ({
        id: `fact-${i + 1}`,
        k: z(a.k, b.k),
        v: z(a.v, b.v),
      })),
      badges: ziple("about.badges", t.about.badges, e.about.badges, (a, b, i) => ({
        id: `badge-${i + 1}`,
        k: z(a.k, b.k),
        v: z(a.v, b.v),
      })),
    },
    journey: {
      title: z(t.journey.title, e.journey.title),
      rangeLabel: z(t.journey.rangeLabel, e.journey.rangeLabel),
      galleryLabel: z(t.journey.galleryLabel, e.journey.galleryLabel),
      stops: ziple("journey.stops", t.journey.stops, e.journey.stops, (a, b, i) => {
        assert.equal(a.year, b.year, `stops[${i}].year TR/EN farkli`);
        assert.equal(!!a.featured, !!b.featured, `stops[${i}].featured TR/EN farkli`);
        const s: HomeDoc["journey"]["stops"][number] = {
          id: `stop-${i + 1}`,
          year: a.year,
          period: z(a.period, b.period),
          tag: z(a.tag, b.tag),
          title: z(a.title, b.title),
          text: z(a.text, b.text),
          details: ogeler(`stops[${i}].details`, `stop-${i + 1}-d`, a.details, b.details),
        };
        if (a.featured !== undefined) s.featured = a.featured;
        return s;
      }),
    },
    projects: {
      title: z(t.projects.title, e.projects.title),
      sub: z(t.projects.sub, e.projects.sub),
      othersTitle: z(t.projects.othersTitle, e.projects.othersTitle),
      othersSub: z(t.projects.othersSub, e.projects.othersSub),
      cards: ziple("projects.cards", t.projects.cards, e.projects.cards, (a, b, i) => {
        assert.equal(a.statusKind, b.statusKind, `cards[${i}].statusKind TR/EN farkli`);
        assert.equal(a.period, b.period, `cards[${i}].period TR/EN farkli`);
        assert.equal(a.url, b.url, `cards[${i}].url TR/EN farkli`);
        assert.deepEqual(a.tech, b.tech, `cards[${i}].tech TR/EN farkli`);
        return {
          id: `card-${i + 1}`,
          statusKind: a.statusKind,
          period: a.period,
          url: a.url,
          tech: [...a.tech],
          title: z(a.title, b.title),
          status: z(a.status, b.status),
          text: z(a.text, b.text),
        };
      }),
    },
    research: {
      title: z(t.research.title, e.research.title),
      kicker: z(t.research.kicker, e.research.kicker),
      headline: z(t.research.headline, e.research.headline),
      quote: z(t.research.quote, e.research.quote),
      text: z(t.research.text, e.research.text),
      highlight: {
        title: z(t.research.highlight.title, e.research.highlight.title),
        label: z(t.research.highlight.label, e.research.highlight.label),
      },
      org: z(t.research.org, e.research.org),
      steps: ziple("research.steps", t.research.steps, e.research.steps, (a, b, i) => {
        assert.equal(a.n, b.n, `steps[${i}].n TR/EN farkli`);
        return { id: `step-${i + 1}`, n: a.n, title: z(a.title, b.title), text: z(a.text, b.text) };
      }),
    },
    skills: {
      title: z(t.skills.title, e.skills.title),
      sub: z(t.skills.sub, e.skills.sub),
      techLabel: z(t.skills.techLabel, e.skills.techLabel),
      humanLabel: z(t.skills.humanLabel, e.skills.humanLabel),
      groups: ziple("skills.groups", t.skills.groups, e.skills.groups, (a, b, i) => ({
        id: `sgroup-${i + 1}`,
        label: z(a.label, b.label),
        items: ogeler(`skills.groups[${i}].items`, `sgroup-${i + 1}-i`, a.items, b.items),
      })),
      human: ziple("skills.human", t.skills.human, e.skills.human, (a, b, i) => ({
        id: `human-${i + 1}`,
        title: z(a.title, b.title),
        text: z(a.text, b.text),
      })),
    },
    footer: { rights: z(t.footer.rights, e.footer.rights), built: z(t.footer.built, e.footer.built) },
  };
}

// -------------------------------------------------------------------- cv

function cvDoc(): CvDoc {
  const t = content.tr;
  const e = content.en;

  const nav = Object.fromEntries(
    (Object.keys(t.nav) as (keyof typeof t.nav)[]).map((k) => [k, z(t.nav[k], e.nav[k])]),
  ) as CvDoc["nav"];

  const sections = Object.fromEntries(
    (Object.keys(t.sections) as (keyof typeof t.sections)[]).map((k) => [k, z(t.sections[k], e.sections[k])]),
  ) as CvDoc["sections"];

  const girdiler = (ad: string, onek: string, tr: typeof t.experience, en: typeof e.experience): EntryDoc[] =>
    ziple(ad, tr, en, (a, b, i) => {
      const g: EntryDoc = {
        id: `${onek}-${i + 1}`,
        title: z(a.title, b.title),
        org: z(a.org, b.org),
        date: z(a.date, b.date),
        items: ogeler(`${ad}[${i}].items`, `${onek}-${i + 1}-i`, a.items, b.items),
      };
      if (a.note !== undefined || b.note !== undefined) {
        assert.ok(a.note && b.note, `${ad}[${i}].note yalnizca bir dilde var`);
        g.note = z(a.note, b.note);
      }
      return g;
    });

  return {
    nav,
    sections,
    // cvFile bilerek disarida: PDF adresi media_assets'ten cozuluyor.
    hero: {
      tagline: z(t.hero.tagline, e.hero.tagline),
      intro: z(t.hero.intro, e.hero.intro),
      cv: z(t.hero.cv, e.hero.cv),
      email: z(t.hero.email, e.hero.email),
    },
    experience: girdiler("experience", "exp", t.experience, e.experience),
    communities: girdiler("communities", "com", t.communities, e.communities),
    research: {
      title: z(t.research.title, e.research.title),
      role: z(t.research.role, e.research.role),
      org: z(t.research.org, e.research.org),
      date: z(t.research.date, e.research.date),
      topic: z(t.research.topic, e.research.topic),
      items: ogeler("research.items", "res-i", t.research.items, e.research.items),
    },
    projects: ziple("projects", t.projects, e.projects, (a, b, i) => {
      assert.equal(a.url, b.url, `projects[${i}].url TR/EN farkli`);
      assert.equal(a.urlLabel, b.urlLabel, `projects[${i}].urlLabel TR/EN farkli`);
      return {
        id: `proj-${i + 1}`,
        url: a.url,
        urlLabel: a.urlLabel,
        title: z(a.title, b.title),
        kind: z(a.kind, b.kind),
        tech: z(a.tech, b.tech),
        note: z(a.note, b.note),
        items: ogeler(`projects[${i}].items`, `proj-${i + 1}-i`, a.items, b.items),
      };
    }),
    // " · " ile birlestirilmis string panelde gercek liste olsun diye bolunuyor.
    skills: ziple("skills", t.skills, e.skills, (a, b, i) => ({
      id: `cvskill-${i + 1}`,
      label: z(a.label, b.label),
      items: ogeler(`skills[${i}].items`, `cvskill-${i + 1}-i`, a.items.split(" · "), b.items.split(" · ")),
    })),
    personal: ogeler("personal", "personal", t.personal, e.personal),
    education: {
      degree: z(t.education.degree, e.education.degree),
      school: z(t.education.school, e.education.school),
      date: z(t.education.date, e.education.date),
      meta: z(t.education.meta, e.education.meta),
    },
    languages: ogeler("languages", "lang", t.languages, e.languages),
    footer: z(t.footer, e.footer),
    updated: z(t.updated, e.updated),
    links: { ...links },
  };
}

// ------------------------------------------------------------- dogrulama

/**
 * Migrasyonun tek gercek testi: agactan geri uretilen sozluk, bugun sayfalarin
 * kullandigi literal'in BIREBIR aynisi olmali.
 */
function dogrula(hd: HomeDoc, cd: CvDoc) {
  for (const lang of ["tr", "en"] as const) {
    assert.deepStrictEqual(localizeHome(hd, lang), home[lang], `localizeHome(${lang}) orijinalden farkli`);
    assert.deepStrictEqual(localizeCv(cd, lang), content[lang], `localizeCv(${lang}) orijinalden farkli`);
  }
}

// ------------------------------------------------------------------ ana

async function main() {
  const hd = anaSayfaDoc();
  const cd = cvDoc();

  dogrula(hd, cd);
  console.log("✓ dogrulama: iki dokuman, iki dil — sifir fark");

  fs.mkdirSync(CIKTI, { recursive: true });
  fs.writeFileSync(path.join(CIKTI, "home.json"), JSON.stringify(hd, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(CIKTI, "cv.json"), JSON.stringify(cd, null, 2) + "\n", "utf8");
  // Galeri yedegi: Supabase duraklarsa fotograflar public/galeri'den sunulur,
  // yolculuk bolumu bos kalmaz.
  fs.writeFileSync(path.join(CIKTI, "galeri.json"), JSON.stringify(getGallery(), null, 2) + "\n", "utf8");
  console.log(`✓ yedek yazildi: ${path.relative(KOK, CIKTI)}/{home,cv,galeri}.json`);

  if (!process.argv.includes("--db")) {
    console.log("  (veritabanina yazmak icin: npm run seed -- --db)");
    return;
  }

  const { upsertDocs } = await import("./seed-db");
  await upsertDocs(hd, cd);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
