"use client";

import { useEffect, useState } from "react";
import { content, links, type Lang } from "@/content";

const BUILD_DATE = new Date().toISOString().slice(0, 10);

function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 mb-5 scroll-mt-24 border-b-2 border-ink pb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
      {children}
    </h2>
  );
}

function Row({ title, right, sub }: { title: React.ReactNode; right?: string; sub?: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5">
        <div className="text-[15px] font-bold text-ink">{title}</div>
        {right && <div className="text-[12.5px] tabular-nums text-muted">{right}</div>}
      </div>
      {sub && <div className="text-[13.5px] text-muted">{sub}</div>}
    </div>
  );
}

function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed">
      {items.map((t) => (
        <li key={t} className="relative pl-4 before:absolute before:left-0 before:top-[0.62em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-ink/75">
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function Site() {
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "tr" || saved === "en") setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang]);

  const t = content[lang];

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 pt-6 sm:px-8">
      {/* Üst çubuk */}
      <header className="sticky top-0 z-10 -mx-5 mb-8 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <a href="#top" className="font-serif text-lg font-bold text-ink">Tolga Olguner</a>
        <nav className="hidden gap-5 text-[13px] text-muted sm:flex">
          <a href="#about" className="hover:text-ink">{t.nav.about}</a>
          <a href="#experience" className="hover:text-ink">{t.nav.experience}</a>
          <a href="#research" className="hover:text-ink">{t.nav.research}</a>
          <a href="#projects" className="hover:text-ink">{t.nav.projects}</a>
          <a href="#skills" className="hover:text-ink">{t.nav.skills}</a>
        </nav>
        <div className="flex overflow-hidden rounded border border-line text-[12px] font-semibold">
          {(["tr", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-2.5 py-1 uppercase transition ${lang === l ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* Giriş */}
      <section id="top" className="flex flex-col-reverse items-start gap-8 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-[40px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[46px]">Tolga Olguner</h1>
          <p className="mt-2 text-[16px] text-muted">{t.hero.tagline}</p>
          <p id="about" className="mt-5 max-w-xl scroll-mt-24 text-[15.5px] leading-relaxed">{t.hero.intro}</p>
          <div className="mt-6 flex flex-wrap gap-2.5 text-[13.5px] font-semibold">
            <a href={t.hero.cvFile} className="rounded bg-ink px-3.5 py-2 text-paper transition hover:opacity-90">{t.hero.cv}</a>
            <a href={links.github} className="rounded border border-line px-3.5 py-2 text-ink transition hover:bg-paper-2">GitHub</a>
            <a href={links.linkedin} className="rounded border border-line px-3.5 py-2 text-ink transition hover:bg-paper-2">LinkedIn</a>
            <a href={`mailto:${links.email}`} className="rounded border border-line px-3.5 py-2 text-ink transition hover:bg-paper-2">{t.hero.email}</a>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/foto.jpg" alt="Tolga Olguner" width={600} height={800} className="h-40 w-[7.5rem] shrink-0 rounded-lg border border-line object-cover sm:h-48 sm:w-36" />
      </section>

      {/* Eğitim */}
      <SectionTitle>{t.sections.education}</SectionTitle>
      <Row title={t.education.degree} right={t.education.date} sub={<>{t.education.school} · {t.education.meta}</>} />

      {/* Deneyim */}
      <SectionTitle id="experience">{t.sections.experience}</SectionTitle>
      <div className="space-y-7">
        {t.experience.map((e) => (
          <div key={e.title}>
            <Row title={e.title} right={e.date} sub={e.org} />
            <Bullets items={e.items} />
          </div>
        ))}
      </div>

      <SectionTitle>{t.sections.communities}</SectionTitle>
      <div className="space-y-3">
        {t.communities.map((c) => (
          <div key={c.title}>
            <Row title={<>{c.title} <span className="ml-1.5 text-[13.5px] font-normal text-muted">{c.org}</span></>} right={c.date} />
            {c.note && <p className="mt-0.5 text-[13.5px] text-ink-soft">{c.note}</p>}
          </div>
        ))}
      </div>

      {/* Araştırma */}
      <SectionTitle id="research">{t.sections.research}</SectionTitle>
      <Row title={<>{t.research.title} <span className="ml-1.5 text-[13.5px] font-normal text-muted">{t.research.role}</span></>} right={t.research.date} sub={t.research.org} />
      <Bullets items={t.research.items} />

      {/* Projeler */}
      <SectionTitle id="projects">{t.sections.projects}</SectionTitle>
      <div className="space-y-8">
        {t.projects.map((p) => (
          <div key={p.title}>
            <Row title={<>{p.title} <span className="ml-1.5 text-[13.5px] font-normal text-muted">{p.kind}</span></>} />
            <div className="text-[13px] text-muted">{p.tech}</div>
            <a href={p.url} className="text-[13px] text-accent hover:underline">{p.urlLabel}</a>
            <p className="mt-1.5 text-[14.5px] leading-relaxed">{p.note}</p>
            <Bullets items={p.items} />
          </div>
        ))}
      </div>

      {/* Yetkinlikler */}
      <SectionTitle id="skills">{t.sections.skills}</SectionTitle>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t.sections.technical}</div>
          <div className="space-y-1.5">
          {t.skills.map((g) => (
            <div key={g.label} className="flex gap-3 text-[13.5px] leading-snug">
              <span className="w-[5.5rem] shrink-0 text-muted">{g.label}</span>
              <span className="text-ink">{g.items}</span>
            </div>
          ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t.sections.personal}</div>
          <Bullets items={t.personal} />
        </div>
      </div>

      <SectionTitle>{t.sections.languages}</SectionTitle>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
        {t.languages.map((l) => {
          const [name, level] = l.split(" — ");
          return (
            <div key={l}>
              <div className="text-[14px] font-bold text-ink">{name}</div>
              <div className="mt-0.5 text-[13px] text-muted">{level}</div>
            </div>
          );
        })}
      </div>

      <footer className="mt-16 flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-[12px] text-muted">
        <span>© {new Date().getFullYear()} Tolga Olguner · {t.footer}</span>
        <span>{t.updated}: {BUILD_DATE}</span>
      </footer>
    </div>
  );
}
