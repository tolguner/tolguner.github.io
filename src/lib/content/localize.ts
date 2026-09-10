/**
 * Depolama agacindan (`HomeDoc` / `CvDoc`) sayfalarin bugun bekledigi
 * `HomeDict` / `Dict` tiplerini yeniden uretir.
 *
 * Bu dosyanin varlik sebebi: `Home.tsx` 848 satir ve GSAP zaman cizelgeleriyle
 * dolu. Sozlesmeyi aynen koruyunca o dosyada tek satir degisiyor
 * (`const t = home[lang]` -> `props.home[lang]`), 3B sahne ve scroll
 * animasyonlarina hic dokunulmuyor.
 */

import type { Dict, Lang, SkillGroup as CvSkillGroup } from "@/content";
import type { Card, HomeDict, SkillGroup, SoftSkill, Stat, Step, Stop } from "@/content-home";
import type { Ceviri, CeviriOgesi, CvDoc, HomeDoc } from "./types";

const c = (v: Ceviri, lang: Lang) => v[lang];
const liste = (v: CeviriOgesi[], lang: Lang) => v.map((x) => x.value[lang]);

/**
 * `undefined` degerli anahtarlari siler.
 *
 * `Stat.suffix`, `Stop.featured` ve `Entry.items` istege bagli alanlar; orijinal
 * literal'de yoklarsa anahtar hic yazilmamis oluyor. `assert.deepStrictEqual`
 * icin `{a:1}` ile `{a:1, b:undefined}` ESIT DEGIL — dogrulama testinin
 * gecmesi bu temizlige bagli.
 */
function temizle<T extends object>(o: T): T {
  for (const k of Object.keys(o) as (keyof T)[]) if (o[k] === undefined) delete o[k];
  return o;
}

export function localizeHome(doc: HomeDoc, lang: Lang): HomeDict {
  const ceviriMap = <T extends Record<string, Ceviri>>(o: T) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v[lang]])) as { [K in keyof T]: string };

  return {
    nav: ceviriMap(doc.nav),
    hero: ceviriMap(doc.hero),
    stats: doc.stats.map(
      (s): Stat =>
        temizle({
          value: s.value,
          suffix: s.suffix,
          decimals: s.decimals,
          label: c(s.label, lang),
          key: s.key,
        }),
    ),
    about: {
      title: c(doc.about.title, lang),
      p1: c(doc.about.p1, lang),
      p2: c(doc.about.p2, lang),
      facts: doc.about.facts.map((f) => ({ k: c(f.k, lang), v: c(f.v, lang) })),
      badges: doc.about.badges.map((b) => ({ k: c(b.k, lang), v: c(b.v, lang) })),
    },
    journey: {
      title: c(doc.journey.title, lang),
      rangeLabel: c(doc.journey.rangeLabel, lang),
      galleryLabel: c(doc.journey.galleryLabel, lang),
      stops: doc.journey.stops.map(
        (s): Stop =>
          temizle({
            year: s.year,
            period: c(s.period, lang),
            title: c(s.title, lang),
            text: c(s.text, lang),
            tag: c(s.tag, lang),
            details: s.details.length ? liste(s.details, lang) : undefined,
            featured: s.featured,
          }),
      ),
    },
    projects: {
      title: c(doc.projects.title, lang),
      sub: c(doc.projects.sub, lang),
      cards: doc.projects.cards.map(
        (k): Card => ({
          title: c(k.title, lang),
          status: c(k.status, lang),
          statusKind: k.statusKind,
          period: k.period,
          text: c(k.text, lang),
          tech: [...k.tech],
          url: k.url,
        }),
      ),
      othersTitle: c(doc.projects.othersTitle, lang),
      othersSub: c(doc.projects.othersSub, lang),
    },
    research: {
      title: c(doc.research.title, lang),
      kicker: c(doc.research.kicker, lang),
      headline: c(doc.research.headline, lang),
      quote: c(doc.research.quote, lang),
      text: c(doc.research.text, lang),
      highlight: { title: c(doc.research.highlight.title, lang), label: c(doc.research.highlight.label, lang) },
      steps: doc.research.steps.map((s): Step => ({ n: s.n, title: c(s.title, lang), text: c(s.text, lang) })),
      org: c(doc.research.org, lang),
    },
    skills: {
      title: c(doc.skills.title, lang),
      sub: c(doc.skills.sub, lang),
      techLabel: c(doc.skills.techLabel, lang),
      humanLabel: c(doc.skills.humanLabel, lang),
      groups: doc.skills.groups.map((g): SkillGroup => ({ label: c(g.label, lang), items: liste(g.items, lang) })),
      human: doc.skills.human.map((h): SoftSkill => ({ title: c(h.title, lang), text: c(h.text, lang) })),
    },
    contact: ceviriMap(doc.contact),
    footer: { rights: c(doc.footer.rights, lang), built: c(doc.footer.built, lang) },
  };
}

/** CV yetkinlik satirlarinda sayfada gorunen ayrac. */
export const CV_AYRAC = " · ";

/**
 * @param cvDosyalari `media_assets`ten cozulen PDF adresleri. Verilmezse
 *   bugunku statik yollar kullanilir (Faz D'ye kadar gecerli davranis).
 */
export function localizeCv(doc: CvDoc, lang: Lang, cvDosyalari?: Record<Lang, string>): Dict {
  const ceviriMap = <T extends Record<string, Ceviri>>(o: T) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v[lang]])) as { [K in keyof T]: string };

  const varsayilan: Record<Lang, string> = {
    tr: "/cv/Tolga_Olguner_CV_TR.pdf",
    en: "/cv/Tolga_Olguner_CV_EN.pdf",
  };

  const entry = (e: (typeof doc.experience)[number]) =>
    temizle({
      title: c(e.title, lang),
      org: c(e.org, lang),
      date: c(e.date, lang),
      items: e.items.length ? liste(e.items, lang) : undefined,
      note: e.note ? c(e.note, lang) : undefined,
    });

  return {
    nav: ceviriMap(doc.nav),
    hero: {
      ...ceviriMap(doc.hero),
      cvFile: (cvDosyalari ?? varsayilan)[lang],
    } as Dict["hero"],
    sections: ceviriMap(doc.sections),
    experience: doc.experience.map(entry),
    communities: doc.communities.map(entry),
    research: {
      title: c(doc.research.title, lang),
      role: c(doc.research.role, lang),
      org: c(doc.research.org, lang),
      date: c(doc.research.date, lang),
      topic: c(doc.research.topic, lang),
      items: liste(doc.research.items, lang),
    },
    projects: doc.projects.map((p) => ({
      title: c(p.title, lang),
      kind: c(p.kind, lang),
      tech: c(p.tech, lang),
      note: c(p.note, lang),
      items: liste(p.items, lang),
      url: p.url,
      urlLabel: p.urlLabel,
    })),
    skills: doc.skills.map((g): CvSkillGroup => ({ label: c(g.label, lang), items: liste(g.items, lang).join(CV_AYRAC) })),
    personal: liste(doc.personal, lang),
    education: {
      degree: c(doc.education.degree, lang),
      school: c(doc.education.school, lang),
      date: c(doc.education.date, lang),
      meta: c(doc.education.meta, lang),
    },
    languages: liste(doc.languages, lang),
    footer: c(doc.footer, lang),
    updated: c(doc.updated, lang),
  };
}
