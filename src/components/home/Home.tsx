"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { home } from "@/content-home";
import { links, type Lang } from "@/content";
import type { Repo } from "@/components/Site";

const NodeSphere = dynamic(() => import("./NodeSphere"), { ssr: false });

const STATUS: Record<string, string> = {
  capstone: "border-sky-400/40 text-sky-300",
  team: "border-emerald-400/40 text-emerald-300",
  research: "border-amber-400/40 text-amber-300",
  live: "border-fuchsia-400/40 text-fuchsia-300",
};

function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
          <span className="hero-word inline-block">{w}&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

export default function Home({ repos, repoCount }: { repos: Repo[]; repoCount?: number }) {
  const [lang, setLang] = useState<Lang>("tr");
  const [mounted, setMounted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const t = home[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "tr" || saved === "en") setLang(saved);
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang]);

  useEffect(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Menü bağlantıları Lenis üzerinden kaysın (pinlenmiş bölümlerde doğru hedef)
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href") || "");
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.2 });
    };
    document.addEventListener("click", onAnchor);

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // Giriş
      if (!reduce) {
        gsap.from(".hero-word", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.05, delay: 0.15 });
        gsap.from(".hero-fade", { y: 18, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.7 });
      }
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => { progress.current = self.progress; },
      });
      gsap.to(".hero-content", { yPercent: -18, opacity: 0.15, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true } });

      // Genel açılışlar
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: reduce ? 0 : 36, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%" } });
      });

      // Sayaçlar
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = parseFloat(el.dataset.count || "0");
        const dec = parseInt(el.dataset.decimals || "0", 10);
        const suffix = el.dataset.suffix || "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: to, duration: 1.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => { el.textContent = obj.v.toFixed(dec).replace(".", lang === "tr" ? "," : ".") + suffix; },
        });
      });

      // Yolculuk — masaüstünde yatay pinli kaydırma
      mm.add("(min-width: 900px)", () => {
        const track = trackRef.current;
        const sec = journeyRef.current;
        if (!track || !sec) return;
        const dist = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
        });
        gsap.to(".journey-line", { scaleX: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + dist(), scrub: 1 } });
      });

      // Araştırma büyük sayı
      gsap.from(".research-big", { scale: 0.8, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".research-big", start: "top 85%" } });
    }, root);

    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      mm.revert();
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [mounted, lang]);

  const tilt = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 6}deg`);
    el.style.setProperty("--ry", `${x * 8}deg`);
  };
  const untilt = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <div ref={root} className="home relative min-h-screen overflow-x-clip bg-[#070b12] text-[#c9d3e0]">
      {/* Üst çubuk */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-[#070b12]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#top" className="font-display text-lg font-semibold text-white">Tolga Olguner</a>
          <nav className="hidden gap-7 text-[13px] text-white/60 md:flex">
            <a href="#about" className="transition hover:text-white">{t.nav.about}</a>
            <a href="#journey" className="transition hover:text-white">{t.nav.journey}</a>
            <a href="#projects" className="transition hover:text-white">{t.nav.projects}</a>
            <a href="#research" className="transition hover:text-white">{t.nav.research}</a>
            <a href="#contact" className="transition hover:text-white">{t.nav.contact}</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-full border border-white/10 text-[11.5px] font-semibold">
              {(["tr", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`px-3 py-1.5 uppercase transition ${lang === l ? "bg-white text-[#070b12]" : "text-white/60 hover:text-white"}`}>{l}</button>
              ))}
            </div>
            <a href="/cv/" className="rounded-full bg-[#4f7cff] px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-[#6a90ff]">{t.nav.cv}</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" ref={heroRef} className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.22)_0%,rgba(79,124,255,0.06)_40%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#070b12_100%)]" />
        </div>
        <div className="absolute inset-0 opacity-90 md:left-[38%]">{mounted && <NodeSphere progress={progress} />}</div>
        <div className="hero-content relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8">
          <p className="hero-fade mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8fb0ff]">{t.hero.kicker}</p>
          <h1 className="font-display max-w-4xl text-[clamp(2.4rem,6.2vw,5.2rem)] font-medium leading-[1.02] tracking-tight text-white">
            <Words text={t.hero.line1} />
            <br />
            <Words text={t.hero.line2} className="text-white/85" />
          </h1>
          <p className="hero-fade mt-7 max-w-xl text-[15.5px] leading-relaxed text-white/60 sm:text-[17px]">{t.hero.sub}</p>
          <div className="hero-fade mt-9 flex flex-wrap gap-3">
            <a href="#projects" className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#070b12] transition hover:bg-[#dfe7ff]">{t.hero.ctaProjects}</a>
            <a href="/cv/" className="rounded-full border border-white/20 px-6 py-3 text-[14px] font-semibold text-white transition hover:border-white/50">{t.hero.ctaCv}</a>
          </div>
        </div>
        <div aria-hidden className="hero-fade absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <span className="block h-16 w-px animate-pulse bg-gradient-to-b from-white/55 to-transparent" />
        </div>
      </section>

      {/* İstatistikler */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {t.stats.map((s) => (
            <div key={s.label} className="bg-[#0b1119] px-6 py-7" data-reveal>
              <div className="font-display text-[38px] font-medium leading-none text-white">
                <span data-count={s.key === "repos" && repoCount ? repoCount : s.value} data-decimals={s.decimals ?? 0} data-suffix={s.suffix ?? ""}>0</span>
              </div>
              <div className="mt-2 text-[12.5px] uppercase tracking-wider text-white/45">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hakkımda */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-32 sm:px-8">
        <div className="grid gap-14 md:grid-cols-[1.15fr_0.85fr] md:items-start">
          <div>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight text-white" data-reveal>{t.about.title}</h2>
            <p className="mt-7 text-[17px] leading-relaxed text-white/70" data-reveal>{t.about.p1}</p>
            <p className="mt-5 text-[17px] leading-relaxed text-white/70" data-reveal>{t.about.p2}</p>
            <dl className="mt-10 grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-2">
              {t.about.facts.map((f) => (
                <div key={f.k} data-reveal>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fb0ff]">{f.k}</dt>
                  <dd className="mt-1.5 text-[15px] text-white/85">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:mt-4" data-reveal>
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(79,124,255,0.35),transparent_60%)] blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/portre.jpg" alt="Tolga Olguner" width={900} height={1200} className="relative aspect-[3/4] w-full rounded-3xl border border-white/10 object-cover" />
            {t.about.badges.map((b, i) => (
              <div key={b.k} className={`absolute rounded-xl border border-white/10 bg-[#0b1119]/90 px-4 py-3 shadow-2xl backdrop-blur ${i === 0 ? "-right-4 top-8" : "-left-4 bottom-10"}`}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{b.k}</div>
                <div className="mt-0.5 text-[14px] font-semibold text-white">{b.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Yolculuk */}
      <section id="journey" ref={journeyRef} className="relative mt-32 scroll-mt-24 md:flex md:h-screen md:flex-col md:overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8 md:pt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight text-white" data-reveal>{t.journey.title}</h2>
              <p className="mt-2 text-[14px] text-white/45" data-reveal>{t.journey.sub}</p>
            </div>
            <div className="hidden text-right md:block" data-reveal>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{t.journey.rangeLabel}</div>
              <div className="font-display text-[34px] leading-none text-white/80">2021 — 2026</div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 md:mt-10 md:flex md:flex-1 md:items-center">
          <div ref={trackRef} className="flex flex-col gap-6 px-5 sm:px-8 md:w-max md:flex-row md:items-stretch md:gap-6 md:pl-[max(1.25rem,calc((100vw-72rem)/2+2rem))] md:pr-[14vw]">
            {t.journey.stops.map((s, i) => (
              <article key={i} className={`group relative flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border p-7 transition-colors md:aspect-[3/4] md:w-[25rem] md:p-8 ${s.featured ? "border-[#4f7cff]/45 bg-gradient-to-b from-[#111d33] to-[#0b1119] hover:border-[#4f7cff]/70" : "border-white/10 bg-[#0b1119] hover:border-white/25"}`} data-reveal>
                {s.featured && <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.28),transparent_65%)]" />}
                <span aria-hidden className={`font-display pointer-events-none absolute -right-3 -top-6 select-none text-[9rem] font-medium leading-none md:text-[11rem] ${s.featured ? "text-[#4f7cff]/[0.09]" : "text-white/[0.035]"}`}>{s.year}</span>
                <div className="relative flex items-center gap-3">
                  <span className="font-display text-[26px] leading-none text-[#8fb0ff]">{s.year}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-wider ${s.featured ? "border-[#4f7cff]/50 bg-[#4f7cff]/10 text-[#a9c4ff]" : "border-white/10 text-white/55"}`}>{s.tag}</span>
                </div>
                <div className="relative mt-1.5 text-[12px] text-white/40">{s.period}</div>
                <h3 className="font-display relative mt-6 text-[26px] font-medium leading-tight text-white">{s.title}</h3>
                <p className="relative mt-3 text-[14.5px] leading-relaxed text-white/60">{s.text}</p>
                {s.details?.length ? (
                  <ul className="relative mt-5 space-y-1.5 border-t border-white/10 pt-4 text-[13px] leading-snug text-white/65">
                    {s.details.map((d) => (
                      <li key={d} className="relative pl-3.5 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-[#8fb0ff]">{d}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="relative mt-auto hidden pt-6 text-[11px] uppercase tracking-[0.2em] text-white/30 md:block">{String(i + 1).padStart(2, "0")} / {String(t.journey.stops.length).padStart(2, "0")}</div>
              </article>
            ))}
          </div>
        </div>

        {/* İlerleme çubuğu */}
        <div className="mx-auto hidden w-full max-w-6xl px-5 pb-10 sm:px-8 md:block">
          <div className="relative h-px w-full bg-white/10">
            <div className="journey-line absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gradient-to-r from-[#4f7cff] to-[#8fb0ff]" />
          </div>
          <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.18em] text-white/35">
            {["2021", "2022", "2023", "2024", "2025", "2026"].map((y) => <span key={y}>{y}</span>)}
          </div>
        </div>
      </section>

      {/* Projeler */}
      <section id="projects" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-32 sm:px-8">
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight text-white" data-reveal>{t.projects.title}</h2>
        <p className="mt-3 max-w-xl text-[15px] text-white/50" data-reveal>{t.projects.sub}</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {t.projects.cards.map((c) => (
            <a
              key={c.title}
              href={c.url}
              onMouseMove={tilt}
              onMouseLeave={untilt}
              data-reveal
              className="group relative rounded-2xl border border-white/10 bg-[#0b1119] p-7 transition-transform duration-200 [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:border-white/25"
            >
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(79,124,255,0.12),transparent_55%)] opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider ${STATUS[c.statusKind]}`}>{c.status}</span>
                  <span className="text-[12px] text-white/40">{c.period}</span>
                </div>
                <h3 className="font-display mt-6 text-[26px] font-medium leading-tight text-white">{c.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-white/60">{c.text}</p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {c.tech.map((x) => (
                    <span key={x} className="rounded-md bg-white/5 px-2 py-1 text-[11.5px] text-white/65">{x}</span>
                  ))}
                </div>
                <div className="mt-6 text-[13px] font-semibold text-[#8fb0ff] transition group-hover:translate-x-1">GitHub →</div>
              </div>
            </a>
          ))}
        </div>

        {repos.length > 0 && (
          <div className="mt-14" data-reveal>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold text-white">{t.projects.othersTitle}</h3>
              <span className="text-[12.5px] text-white/40">{t.projects.othersSub}</span>
            </div>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {repos.map((r) => (
                <li key={r.name}>
                  <a href={r.url} className="block rounded-xl border border-white/10 px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.03]">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13.5px] font-semibold text-white/90">{r.name}</span>
                      {r.language && <span className="shrink-0 text-[11px] text-white/40">{r.language}</span>}
                    </div>
                    {r.description && <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-white/50">{r.description}</p>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Araştırma */}
      <section id="research" className="relative mt-32 scroll-mt-24 overflow-hidden border-y border-white/10 bg-[#0b1119] py-28">
        <div className="pointer-events-none absolute -right-40 top-1/2 h-[60rem] w-[60rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.14),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8fb0ff]" data-reveal>{t.research.kicker}</p>
            <h2 className="font-display mt-5 text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.1] tracking-tight text-white" data-reveal>{t.research.headline}</h2>
            <p className="mt-6 text-[16px] leading-relaxed text-white/65" data-reveal>{t.research.text}</p>
            <p className="mt-4 text-[12.5px] text-white/40" data-reveal>{t.research.org}</p>
            <div className="research-big mt-12 inline-flex flex-col gap-2 rounded-2xl border border-[#4f7cff]/40 bg-[#4f7cff]/[0.07] px-8 py-7">
              <span className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-medium leading-none text-white">{t.research.highlight.title}</span>
              <span className="text-[12.5px] uppercase tracking-[0.2em] text-[#8fb0ff]">{t.research.highlight.label}</span>
            </div>
          </div>
          <ol className="grid gap-6 self-center sm:grid-cols-2">
            {t.research.steps.map((s) => (
              <li key={s.n} className="rounded-2xl border border-white/10 bg-[#070b12] p-6" data-reveal>
                <div className="font-display text-[22px] text-[#8fb0ff]">{s.n}</div>
                <div className="mt-3 text-[16px] font-semibold text-white">{s.title}</div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Yetkinlikler */}
      <section className="mx-auto max-w-6xl px-5 pt-32 sm:px-8">
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight text-white" data-reveal>{t.skills.title}</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {[{ label: t.skills.techLabel, items: t.skills.tech }, { label: t.skills.humanLabel, items: t.skills.human }].map((g) => (
            <div key={g.label} data-reveal>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fb0ff]">{g.label}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <span key={s} className="rounded-full border border-white/10 px-3.5 py-1.5 text-[13.5px] text-white/80 transition hover:border-[#4f7cff]/60 hover:text-white">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* İletişim */}
      <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16 pt-36 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1119] px-7 py-16 text-center sm:px-12 sm:py-24" data-reveal>
          <div className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.22),transparent_60%)]" />
          <h2 className="font-display relative text-[clamp(2.4rem,6vw,4.6rem)] font-medium tracking-tight text-white">{t.contact.title}</h2>
          <p className="relative mt-5 text-[16px] text-white/60">{t.contact.text}</p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <a href={`mailto:${links.email}`} className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#070b12] transition hover:bg-[#dfe7ff]">{t.contact.email}</a>
            <a href="/cv/" className="rounded-full border border-white/20 px-6 py-3 text-[14px] font-semibold text-white transition hover:border-white/50">{t.contact.cv}</a>
          </div>
          <div className="relative mt-10 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[13.5px] text-white/50">
            <a href={`mailto:${links.email}`} className="hover:text-white">{links.email}</a>
            <a href={links.linkedin} className="hover:text-white">linkedin.com/in/tolguner</a>
            <a href={links.github} className="hover:text-white">github.com/tolguner</a>
          </div>
        </div>
        <footer className="mt-10 flex flex-wrap justify-between gap-2 text-[12px] text-white/35">
          <span>© {new Date().getFullYear()} {t.footer.rights}</span>
          <span>{t.footer.built}</span>
        </footer>
      </section>
    </div>
  );
}
