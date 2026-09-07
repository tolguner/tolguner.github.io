"use client";

import { useEffect, useState } from "react";
import { content, links, type Lang } from "@/content";
import TemaDugmesi from "@/components/TemaDugmesi";
import DilDugmesi from "@/components/DilDugmesi";

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
  const [menuAcik, setMenuAcik] = useState(false);

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

  // Menu acikken arkadaki sayfa kaymasin
  useEffect(() => {
    document.body.style.overflow = menuAcik ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuAcik]);

  const t = content[lang];

  // Menudeki baglantilar: "Hakkimda" sayfanin en basi, digerleri bolum capasi
  const menuOgeleri: [string, string][] = [
    ["#top", t.nav.about],
    ["#experience", t.nav.experience],
    ["#research", t.nav.research],
    ["#projects", t.nav.projects],
    ["#skills", t.nav.skills],
  ];

  return (
    <>
      {/* Üst çubuk — ana sayfadakiyle ayni geometri: tam genislikte serit,
          icinde max-w-6xl kapsayici. Boylece sayfa degistiginde logo, dil
          secici, tema dugmesi ve birincil buton yerinden oynamiyor. */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-paper/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="/" className="font-display shrink-0 whitespace-nowrap text-lg font-semibold text-ink">Tolga Olguner</a>
          <nav className="nav-display hidden gap-3.5 text-[12px] text-ink-soft lg:flex lg:gap-7 lg:text-[13px]">
            <a
              href="#top"
              onClick={(ev) => {
                ev.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="transition hover:text-ink"
            >
              {t.nav.about}
            </a>
            <a href="#experience" className="transition hover:text-ink">{t.nav.experience}</a>
            <a href="#research" className="transition hover:text-ink">{t.nav.research}</a>
            <a href="#projects" className="transition hover:text-ink">{t.nav.projects}</a>
            <a href="#skills" className="transition hover:text-ink">{t.nav.skills}</a>
          </nav>
          <div className="flex items-center gap-3">
            <DilDugmesi
              lang={lang}
              setLang={setLang}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition hover:text-ink"
            />
            <TemaDugmesi
              etiket={{ light: t.nav.temaAcik, dark: t.nav.temaKoyu }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition hover:text-ink"
            />
            {/* Genis ekranda hap, altinda 36px ikon: ana sayfada ayni yuvada
                hamburger var, ayni genislikte kalinca dil ve tema dugmesi
                sayfa degisiminde yerinden oynamiyor. */}
            <a
              href="/"
              className="hidden min-w-[92px] justify-center whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:opacity-90 lg:inline-flex"
            >
              {t.nav.portfolio}
            </a>
            <button
              type="button"
              onClick={() => setMenuAcik((a) => !a)}
              aria-expanded={menuAcik}
              aria-controls="mobil-menu"
              aria-label={menuAcik ? t.nav.menuClose : t.nav.menu}
              className="relative h-9 w-9 rounded-full border border-line text-ink transition hover:border-ink/40 lg:hidden"
            >
              <span aria-hidden className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition-transform duration-300 ${menuAcik ? "rotate-45" : "-translate-y-1.5"}`} />
              <span aria-hidden className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition-opacity duration-200 ${menuAcik ? "opacity-0" : "opacity-100"}`} />
              <span aria-hidden className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition-transform duration-300 ${menuAcik ? "-rotate-45" : "translate-y-1.5"}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobil menü — ana sayfadakiyle ayni yapi, belge paletiyle */}
      <div
        id="mobil-menu"
        className={`fixed inset-0 z-20 flex flex-col justify-center bg-paper/97 px-8 pt-14 backdrop-blur-lg transition-[opacity,visibility] duration-300 lg:hidden ${menuAcik ? "visible opacity-100" : "invisible opacity-0"}`}
        onClick={() => setMenuAcik(false)}
      >
        <nav className="flex flex-col gap-1">
          {menuOgeleri.map(([href, etiket], i) => (
            <a
              key={href}
              href={href}
              tabIndex={menuAcik ? 0 : -1}
              onClick={(ev) => {
                if (href !== "#top") return;
                ev.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ transitionDelay: menuAcik ? `${80 + i * 45}ms` : "0ms" }}
              className={`font-display border-b border-ink/5 py-4 text-[28px] font-medium tracking-tight text-ink max-[400px]:py-3 max-[400px]:text-[23px] [@media(max-height:700px)]:py-3 [@media(max-height:700px)]:text-[23px] transition-[opacity,transform] duration-500 ${menuAcik ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
              {etiket}
            </a>
          ))}
        </nav>
        <a
          href="/"
          tabIndex={menuAcik ? 0 : -1}
          style={{ transitionDelay: menuAcik ? "305ms" : "0ms" }}
          className={`mt-10 rounded-full bg-accent py-3.5 text-center text-[15px] max-[400px]:mt-6 [@media(max-height:700px)]:mt-6 font-semibold text-white transition-[opacity,transform] duration-500 ${menuAcik ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        >
          {t.nav.portfolio}
        </a>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8">
      {/* Giriş */}
      <section id="top" className="flex flex-col-reverse items-start gap-8 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-[40px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[46px]">Tolga Olguner</h1>
          <p className="mt-2 text-[16px] text-muted">{t.hero.tagline}</p>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed">{t.hero.intro}</p>
          <div className="mt-6 flex flex-wrap gap-2.5 text-[13.5px] font-semibold">
            <a href={t.hero.cvFile} className="rounded-full bg-ink px-4 py-2 text-paper transition hover:opacity-90">{t.hero.cv}</a>
            <a href={links.github} className="rounded-full border border-line px-4 py-2 text-ink transition hover:bg-paper-2">GitHub</a>
            <a href={links.linkedin} className="rounded-full border border-line px-4 py-2 text-ink transition hover:bg-paper-2">LinkedIn</a>
            <a href={`mailto:${links.email}`} className="rounded-full border border-line px-4 py-2 text-ink transition hover:bg-paper-2">{t.hero.email}</a>
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
    </>
  );
}
