"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { home } from "@/content-home";
import { links, type Lang } from "@/content";
import type { Repo } from "@/components/Site";
import type { Photo } from "@/lib/gallery";
import PhotoMarquee from "./PhotoMarquee";
import Intro from "./Intro";

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

export default function Home({ repos, repoCount, photos = [] }: { repos: Repo[]; repoCount?: number; photos?: Photo[] }) {
  const [lang, setLang] = useState<Lang>("tr");
  const [mounted, setMounted] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);
  /** yok: karar verilmedi · yazi: daktilo · ucus: kürenin yörüngesi · bitti */
  const [giris, setGiris] = useState<"yok" | "yazi" | "ucus" | "bitti">("yok");
  const [perde, setPerde] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const journeyBodyRef = useRef<HTMLDivElement>(null);
  const journeyTitleRef = useRef<HTMLDivElement>(null);
  const cardZoneRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);
  /** 0 = kamera kürenin içinde, 1 = yerleşik konum. */
  const girisIlerleme = useRef(0);
  const girisRef = useRef<"yok" | "yazi" | "ucus" | "bitti">("yok");
  girisRef.current = giris;
  const isiltiRef = useRef<HTMLDivElement>(null);
  const t = home[lang];

  // Sayfanın en arkasında fareyi izleyen mavi ışıltı — kartların ve metnin
  // gerisinde kalır (kartlar zaten opak arka plana sahip), yalnızca boşluklarda
  // görünür. Hafif gecikmeyle takip ederek kayan bir ışık hissi verir.
  useEffect(() => {
    const el = isiltiRef.current;
    if (!el) return;
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hedef = { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };
    const su = { x: hedef.x, y: hedef.y };

    const onMove = (e: PointerEvent) => {
      hedef.x = e.clientX;
      hedef.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    if (azalt) {
      el.style.setProperty("--gx", `${hedef.x}px`);
      el.style.setProperty("--gy", `${hedef.y}px`);
      return () => window.removeEventListener("pointermove", onMove);
    }

    let kare = 0;
    const adim = () => {
      su.x += (hedef.x - su.x) * 0.055;
      su.y += (hedef.y - su.y) * 0.055;
      el.style.setProperty("--gx", `${su.x}px`);
      el.style.setProperty("--gy", `${su.y}px`);
      kare = requestAnimationFrame(adim);
    };
    kare = requestAnimationFrame(adim);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(kare);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "tr" || saved === "en") setLang(saved);
    } catch {}
    setMounted(true);

    // Açılış yalnızca oturumun ilk ziyaretinde ve hareket kısıtlaması yokken oynar.
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let gorulmus = false;
    try { gorulmus = sessionStorage.getItem("giris") === "1"; } catch {}
    if (azalt || gorulmus) {
      girisIlerleme.current = 1;
      setGiris("bitti");
      setPerde(false);
      heroAc(0.15);
    } else {
      window.scrollTo(0, 0);
      setGiris("yazi");
    }
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
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Menü bağlantıları Lenis üzerinden kaysın (pinlenmiş bölümlerde doğru hedef).
    // Bölümlerin üst iç boşluğu büyük olduğu için ham bölüm üstüne gitmek başlığı
    // ekranın çok altında bırakıyor; iç boşluğu düşüp başlığı sabit barın hemen
    // altına oturtuyoruz. Pinlenen Yolculuk bölümü ise tam tepeye yaslanmalı.
    const barYuksekligi = () => document.querySelector("header")?.getBoundingClientRect().height ?? 56;
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hedefId = a.getAttribute("href") || "";
      const el = document.querySelector(hedefId) as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      if (hedefId === "#top") {
        lenis.start();
        lenis.scrollTo(0, { duration: 1.2 });
        return;
      }
      kaydir(el);
    };

    // Bölüm hedefini sabit barın altına dengeli oturtur.
    const kaydir = (el: HTMLElement, sure = 1.2) => {
      // Mobil menü açıkken Lenis durdurulmuş olabilir; menüden gelen tıklamada
      // kaydırmanın çalışması için önce yeniden başlatıyoruz.
      lenis.start();
      // Tek ekrana kurgulanan bolumler (Hakkimda, pinlenen Yolculuk) tepeye yaslanir;
      // digerlerinde hedefin ust ic boslugu dusulup baslik barin altina oturtulur.
      const tamEkran = el.dataset.fit === "screen" && window.matchMedia("(min-width: 768px)").matches;
      const icBosluk = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const ofset = tamEkran ? 0 : icBosluk - barYuksekligi() - 20;
      lenis.scrollTo(el, { offset: ofset, duration: sure });
    };

    // Adres çubuğundan #bolum ile gelindiğinde de aynı hizalama uygulansın
    if (window.location.hash) {
      const hedef = document.querySelector(window.location.hash) as HTMLElement | null;
      if (hedef) requestAnimationFrame(() => kaydir(hedef, 0));
    }
    document.addEventListener("click", onAnchor);

    let gozlemci: IntersectionObserver | null = null;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => { progress.current = self.progress; },
      });
      gsap.to(".hero-content", { yPercent: -18, opacity: 0.15, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true } });

      // Genel açılışlar — aynı anda ekrana giren kartlar sırayla yukarı kayar.
      // ScrollTrigger yerine IntersectionObserver: pinlenen Yolculuk bölümü
      // yüzünden konumlar kayıp kartlar ekrana gelmeden açılmasın diye.
      if (reduce) {
        gsap.set("[data-reveal]", { opacity: 1, y: 0 });
      } else {
        const ogeler = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.set(ogeler, { opacity: 0, y: 44 });
        gozlemci = new IntersectionObserver(
          (girisler) => {
            const gelenler = girisler.filter((g) => g.isIntersecting).map((g) => g.target as HTMLElement);
            if (!gelenler.length) return;
            gelenler.forEach((el) => gozlemci?.unobserve(el));
            gsap.to(gelenler, { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", stagger: 0.07, overwrite: true });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        );
        ogeler.forEach((el) => gozlemci?.observe(el));
      }

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
      mm.add("(min-width: 768px)", () => {
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

      // Yolculuk — mobilde kart alanı (pencere) sabit kalır, galeri altında hep
      // görünür; kartlar desktop'taki gibi arka arkaya dizilip tek bir şerit
      // (track) halinde yukarı kayar — film şeridi gibi, iki kart asla aynı anda
      // aynı çerçevede görünmez.
      mm.add("(max-width: 767.98px)", () => {
        const wrap = journeyBodyRef.current;
        const zone = cardZoneRef.current;
        const track = trackRef.current;
        const cards = gsap.utils.toArray<HTMLElement>(".journey-card");
        if (!wrap || !zone || !track || !cards.length) return;
        // Kartlar artık tek bir şeritte art arda dizili; genel reveal gözlemcisi
        // bunları kontrol etmesin, şerit kaydırma tamamen scrub'a bağlı.
        cards.forEach((card) => gozlemci?.unobserve(card));
        // Genel reveal başlangıç durumu (opacity:0, y:44) burada geçersiz kılınıyor —
        // aksi halde gözlemci hiç tetiklenmediği için kartlar görünmez kalır.
        gsap.set(cards, { opacity: 1, x: 0, y: 0 });

        if (reduce) {
          gsap.set(zone, { height: "auto", overflow: "visible" });
          gsap.set(track, { y: 0 });
          gsap.set(cards, { position: "relative", height: "auto", marginBottom: "1rem", boxShadow: "none" });
          return;
        }

        // "Yolculuk" başlığı da (top-16, 64px) sabit kalıyor; pinlenen alan
        // başlığın hemen altından başlamalı ki üst üste binmesin.
        const barOfset = () => 64 + (journeyTitleRef.current?.getBoundingClientRect().height ?? 0);
        const dist = () => track.scrollHeight - zone.offsetHeight;

        gsap.set(track, { y: 0 });

        gsap.to(track, {
          y: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: () => "top " + barOfset(),
            end: () => "+=" + dist(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });

      // Araştırma mührü — ekrana damga vurulur gibi
      if (reduce) {
        gsap.set(".stamp", { opacity: 1 });
      } else {
        gsap.set(".stamp", { opacity: 0 });
        // Masaustunde bolum tek ekrani kapladigi icin tetigi bolume bagliyoruz:
        // damga, alan gercekten ekrana yerlestiginde vurulur. Mobilde bolum uzun
        // oldugundan damganin kendisi tetikler.
        const masaustu = window.matchMedia("(min-width: 768px)").matches;
        gsap
          .timeline({
            delay: 0.2,
            scrollTrigger: masaustu
              ? { trigger: "#research", start: "top 25%", once: true }
              : { trigger: ".stamp", start: "top 85%", once: true },
          })
          .fromTo(
            ".stamp",
            { scale: 2.9, opacity: 0, rotate: -26, filter: "blur(4px)" },
            { scale: 1.06, opacity: 1, rotate: -7, filter: "blur(0px)", duration: 0.42, ease: "power4.in" }
          )
          .to(".stamp", { scale: 1, rotate: -8, duration: 0.2, ease: "power2.out" })
          .to(".stamp", { rotate: -8.7, duration: 0.07, yoyo: true, repeat: 1 });
      }
    }, root);

    ScrollTrigger.refresh();
    return () => {
      gozlemci?.disconnect();
      ctx.revert();
      mm.revert();
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [mounted, lang]);

  /** Hero yazılarının açılışı — perde kalktıktan sonra oynar. */
  const heroAc = useCallback((gecikme: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // fromTo: iki kez çağrılırsa "mevcut değer" 0 olarak okunup yazılar görünmez kalmasın
    gsap.fromTo(".hero-word", { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.05, delay: gecikme, overwrite: true });
    gsap.fromTo(
      ".hero-fade",
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: gecikme + 0.35, overwrite: true }
    );
  }, []);

  const bitir = useCallback(() => {
    try { sessionStorage.setItem("giris", "1"); } catch {}
    setGiris("bitti");
    setTimeout(() => setPerde(false), 800);
  }, []);

  /** Perdeyi atla: kamerayı yerine koy, hero'yu aç. */
  const atla = useCallback(() => {
    gsap.killTweensOf(girisIlerleme);
    girisIlerleme.current = 1;
    heroAc(0.1);
    bitir();
  }, [heroAc, bitir]);

  /**
   * Perde açılırken kamera kürenin içinden dışarı çekilir: noktalar hızla
   * yanımızdan geçer, görüş açısı daralır ve küre hero'daki yerine oturur.
   */
  const ucur = useCallback(() => {
    setGiris("ucus");
    gsap.to(girisIlerleme, {
      current: 1,
      duration: 1.7,
      ease: "power2.inOut",
      onComplete: bitir,
    });
    heroAc(0.95);
  }, [bitir, heroAc]);

  // Dil değişiminde hero yazıları yeniden belirir (ilk yüklemede değil).
  const ilkDil = useRef(true);
  useEffect(() => {
    if (ilkDil.current) { ilkDil.current = false; return; }
    if (girisRef.current === "bitti") heroAc(0.1);
  }, [lang, heroAc]);

  // Perde devreye girene kadar hero'yu gizleyen sınıf, açılış başlayınca kalkar.
  useEffect(() => {
    if (giris === "ucus" || giris === "bitti") document.documentElement.classList.remove("giris-perde");
  }, [giris]);

  useEffect(() => {
    if (menuAcik || giris !== "bitti") lenisRef.current?.stop();
    else lenisRef.current?.start();
    const kapat = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuAcik(false); };
    window.addEventListener("keydown", kapat);
    return () => window.removeEventListener("keydown", kapat);
    // lang/mounted: dil degisince Lenis yeniden kuruluyor, menu acikken tekrar durdurulmali
  }, [menuAcik, giris, lang, mounted]);

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
    <div ref={root} className="home relative z-0 min-h-screen overflow-x-clip bg-[#030a16] text-[#c9d3e0]">
      {/* Fareyi izleyen ışıltı — en arka katman; kartlar ve metin (normal akış,
          bu elemandan sonra çiziliyor) hep önünde kalır. */}
      <div
        ref={isiltiRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1] opacity-70 md:opacity-90"
        style={{
          background:
            "radial-gradient(38rem circle at var(--gx, 50%) var(--gy, 40%), rgba(79,124,255,0.16), rgba(79,124,255,0.05) 42%, transparent 68%)",
        }}
      />
      {/* Açılış perdesi */}
      {perde && giris !== "yok" && (
        <Intro onYazimBitti={ucur} kapaniyor={giris !== "yazi"} atlaEtiketi={t.nav.skipIntro} onAtla={atla} />
      )}

      {/* Üst çubuk */}
      <header className="giris-gizle fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-[#030a16]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#top" className="font-display text-lg font-semibold text-white">Tolga Olguner</a>
          <nav className="hidden gap-5 text-[12.5px] text-white/60 md:flex lg:gap-7 lg:text-[13px]">
            <a href="#about" className="transition hover:text-white">{t.nav.about}</a>
            <a href="#journey" className="transition hover:text-white">{t.nav.journey}</a>
            <a href="#projects" className="transition hover:text-white">{t.nav.projects}</a>
            <a href="#research" className="transition hover:text-white">{t.nav.research}</a>
            <a href="#skills" className="transition hover:text-white">{t.nav.skills}</a>
            <a href="#contact" className="transition hover:text-white">{t.nav.contact}</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-full border border-white/10 text-[11.5px] font-semibold">
              {(["tr", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`px-3 py-1.5 uppercase transition ${lang === l ? "bg-white text-[#030a16]" : "text-white/60 hover:text-white"}`}>{l}</button>
              ))}
            </div>
            <a href="/cv/" className="hidden rounded-full bg-[#4f7cff] px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-[#6a90ff] md:inline-block">{t.nav.cv}</a>
            <button
              type="button"
              onClick={() => setMenuAcik((a) => !a)}
              aria-expanded={menuAcik}
              aria-controls="mobil-menu"
              aria-label={menuAcik ? t.nav.menuClose : t.nav.menu}
              className="relative h-9 w-9 rounded-full border border-white/15 text-white transition hover:border-white/40 md:hidden"
            >
              <span aria-hidden className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition-transform duration-300 ${menuAcik ? "rotate-45" : "-translate-y-1.5"}`} />
              <span aria-hidden className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition-opacity duration-200 ${menuAcik ? "opacity-0" : "opacity-100"}`} />
              <span aria-hidden className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition-transform duration-300 ${menuAcik ? "-rotate-45" : "translate-y-1.5"}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobil menü */}
      <div
        id="mobil-menu"
        className={`fixed inset-0 z-20 flex flex-col justify-center bg-[#030a16]/97 px-8 pt-14 backdrop-blur-lg transition-[opacity,visibility] duration-300 md:hidden ${menuAcik ? "visible opacity-100" : "invisible opacity-0"}`}
        onClick={() => setMenuAcik(false)}
      >
        <nav className="flex flex-col gap-1">
          {([
            ["#about", t.nav.about],
            ["#journey", t.nav.journey],
            ["#projects", t.nav.projects],
            ["#research", t.nav.research],
            ["#skills", t.nav.skills],
            ["#contact", t.nav.contact],
          ] as const).map(([href, etiket], i) => (
            <a
              key={href}
              href={href}
              tabIndex={menuAcik ? 0 : -1}
              style={{ transitionDelay: menuAcik ? `${80 + i * 45}ms` : "0ms" }}
              className={`font-display border-b border-white/5 py-4 text-[28px] font-medium tracking-tight text-white/85 max-[400px]:py-3 max-[400px]:text-[23px] [@media(max-height:700px)]:py-3 [@media(max-height:700px)]:text-[23px] transition-[opacity,transform] duration-500 active:text-white ${menuAcik ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
              {etiket}
            </a>
          ))}
        </nav>
        <a
          href="/cv/"
          tabIndex={menuAcik ? 0 : -1}
          style={{ transitionDelay: menuAcik ? "360ms" : "0ms" }}
          className={`mt-10 rounded-full bg-[#4f7cff] py-3.5 text-center text-[15px] max-[400px]:mt-6 [@media(max-height:700px)]:mt-6 font-semibold text-white transition-[opacity,transform] duration-500 ${menuAcik ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        >
          {t.nav.cv}
        </a>
      </div>

      {/* Hero */}
      <section id="top" ref={heroRef} className="giris-gizle relative flex min-h-[100svh] items-center overflow-hidden">
        {/* Ortadaki mavi parıltı kürenin sol yarısının arkasına düşüp noktaların
            kontrastını düşürüyordu; küre orada bitiyormuş gibi görünüyordu. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,rgba(3,10,22,0.55)_100%)]" />
        {/* Tuval tüm ekranı kaplar; kürenin sahnedeki yatay yeri NodeSphere içinde
            ayarlanır, böylece açılışta sol kenardan kesilmez. */}
        <div className="absolute inset-0 opacity-[0.7] md:opacity-90">
          {mounted && <NodeSphere progress={progress} giris={girisIlerleme} />}
        </div>
        <div className="hero-content relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8">
          <p className="hero-fade mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8fb0ff]">{t.hero.kicker}</p>
          <h1 className="font-display max-w-4xl text-[clamp(2.4rem,6.2vw,5.2rem)] font-medium leading-[1.02] tracking-tight text-white">
            <Words text={t.hero.line1} />
            <br />
            <Words text={t.hero.line2} className="text-white/85" />
          </h1>
          <p className="hero-fade mt-7 max-w-xl text-[15.5px] leading-relaxed text-white/60 sm:text-[17px]">{t.hero.sub}</p>
          <div className="hero-fade mt-9 flex flex-wrap gap-3">
            <a href="#projects" className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#030a16] transition hover:bg-[#dfe7ff]">{t.hero.ctaProjects}</a>
            <a href="/cv/" className="rounded-full border border-white/20 px-6 py-3 text-[14px] font-semibold text-white transition hover:border-white/50">{t.hero.ctaCv}</a>
          </div>
        </div>
        <div aria-hidden className="hero-fade absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <span className="block h-16 w-px animate-pulse bg-gradient-to-b from-white/55 to-transparent" />
        </div>
      </section>

      {/* Hakkımda */}
      <section id="about" data-fit="screen" className="relative mx-auto flex max-w-6xl flex-col justify-center px-5 pt-32 sm:px-8 md:min-h-screen md:pb-[6vh] md:pt-[10vh] md:[@media(max-height:820px)]:pb-[4vh] md:[@media(max-height:820px)]:pt-[7vh]">
        {/* Hero'nun taban geçişi tam olarak burada (Hero'nun bittiği pikselde)
            %55 alfa'ya ulaşıyor; bu katman AYNI renk ve alfa ile buradan
            devam edip söner. Sınırda iki taraf da aynı değerde buluştuğu
            için mause-ışıltısı ansızın tam güce sıçramıyor. Hero'nun kendi
            kutusuna taşmıyor (üst boşluk yok) — üst üste binip bir önceki
            denemedeki gibi ayrı bir şerit oluşturmuyor. */}
        {/* Bölüm mx-auto max-w-6xl ile kendi içeriğine daralıyor; "inset-x-0"
            burada yalnızca o dar kutuyu kaplardı ve gradyan kenarlara
            yaslanmazdı. left-1/2 + w-screen ile gerçek ekran genişliğine
            taşıyoruz. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-screen -translate-x-1/2 md:h-56"
          style={{ background: "linear-gradient(to bottom, rgba(3,10,22,0.55), transparent)" }}
        />
        <div className="grid gap-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:sikisik:gap-10">
          <div>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight text-white" data-reveal>{t.about.title}</h2>
            <p className="mt-7 text-[17px] leading-relaxed text-white/70 md:sikisik:mt-5 md:sikisik:text-[15.5px] md:[@media(max-height:820px)]:text-[14.5px]" data-reveal>{t.about.p1}</p>
            <p className="mt-5 text-[17px] leading-relaxed text-white/70 md:sikisik:mt-4 md:sikisik:text-[15.5px] md:[@media(max-height:820px)]:text-[14.5px]" data-reveal>{t.about.p2}</p>
            <dl className="mt-10 grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-2 md:sikisik:mt-6 md:sikisik:gap-4 md:sikisik:pt-5 md:[@media(max-height:820px)]:mt-5 md:[@media(max-height:820px)]:gap-3 md:[@media(max-height:820px)]:pt-4">
              {t.about.facts.map((f) => (
                <div key={f.k} data-reveal>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fb0ff]">{f.k}</dt>
                  <dd className="mt-1.5 text-[15px] text-white/85">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:sikisik:max-w-[19rem] md:[@media(max-height:820px)]:max-w-[17rem]" data-reveal>
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(79,124,255,0.35),transparent_60%)] blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/portre.jpg" alt="Tolga Olguner" width={900} height={1200} className="relative aspect-[3/4] w-full rounded-3xl border border-white/10 object-cover" />
            {t.about.badges.map((b, i) => (
              <div key={b.k} className={`absolute rounded-xl border border-white/10 bg-[#06111f]/90 px-4 py-3 shadow-2xl backdrop-blur ${i === 0 ? "-right-4 top-8" : "-left-4 bottom-10"}`}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{b.k}</div>
                <div className="mt-0.5 text-[14px] font-semibold text-white">{b.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rakamlarla — hakkımda metnini karşılayan şerit */}
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:mt-[5vh] md:[@media(max-height:820px)]:mt-[3.5vh] md:grid-cols-4">
          {t.stats.map((s) => (
            <div key={s.label} className="bg-[#06111f] px-6 py-7 md:sikisik:py-5 md:[@media(max-height:820px)]:py-3.5" data-reveal>
              <div className="font-display text-[38px] font-medium leading-none text-white md:sikisik:text-[32px]">
                <span data-count={s.key === "repos" && repoCount ? repoCount : s.value} data-decimals={s.decimals ?? 0} data-suffix={s.suffix ?? ""}>0</span>
              </div>
              <div className="mt-2 text-[12.5px] uppercase tracking-wider text-white/45">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Yolculuk */}
      <section id="journey" data-fit="screen" ref={journeyRef} className="relative mt-32 md:flex md:h-screen md:flex-col md:overflow-hidden">
        <div ref={journeyTitleRef} className="sticky top-16 z-10 pb-2 md:static md:pb-0">
        <div className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8 md:px-0 md:pt-[10vh]">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight text-white" data-reveal>{t.journey.title}</h2>
            </div>
            <div className="hidden text-right md:block">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{t.journey.rangeLabel}</div>
              <div className="font-display text-[34px] leading-none text-white/80">2021 — 2026</div>
            </div>
          </div>
        </div>
        </div>

        <div ref={journeyBodyRef} className="relative mt-8 md:mt-4 md:flex md:min-w-0 md:flex-1 md:flex-col md:justify-center md:gap-[3vh]">
          <div
            ref={cardZoneRef}
            className="relative h-[50vh] overflow-hidden px-5 sm:px-8 md:h-auto md:overflow-visible md:contents"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 44px, black calc(100% - 44px), transparent 100%)",
              maskImage: "linear-gradient(to bottom, transparent 0, black 44px, black calc(100% - 44px), transparent 100%)",
            }}
          >
            <div ref={trackRef} className="flex flex-col gap-4 md:flex md:h-auto md:w-max md:flex-row md:items-stretch md:gap-6 md:pl-[max(1.25rem,calc((100vw-72rem)/2+2rem))] md:pr-[14vw]">
              {t.journey.stops.map((s, i) => (
                <article key={i} className={`journey-card group relative h-[50vh] shrink-0 md:inset-auto flex w-full flex-col overflow-hidden rounded-3xl border p-7 shadow-2xl shadow-black/50 transition-colors md:aspect-[3/4] md:w-auto md:p-8 md:sikisik:p-6 md:[@media(max-height:820px)]:aspect-auto md:[@media(max-height:820px)]:w-[23rem] ${photos.length ? "md:h-[min(50vh,31rem)] md:[@media(max-height:820px)]:h-[43vh]" : "md:h-[min(58vh,33rem)]"} ${s.featured ? "border-[#4f7cff]/45 bg-gradient-to-b from-[#061736] to-[#06111f] hover:border-[#4f7cff]/70" : "border-white/10 bg-[#06111f] hover:border-white/25"}`} data-reveal>
                  {s.featured && <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.28),transparent_65%)]" />}
                  <span aria-hidden className={`font-display pointer-events-none absolute -right-3 -top-6 select-none text-[9rem] font-medium leading-none md:text-[11rem] ${s.featured ? "text-[#4f7cff]/[0.09]" : "text-white/[0.035]"}`}>{s.year}</span>
                  <div className="relative flex items-center gap-3">
                    <span className="font-display text-[26px] leading-none text-[#8fb0ff]">{s.year}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10.5px] uppercase tracking-wider ${s.featured ? "border-[#4f7cff]/50 bg-[#4f7cff]/10 text-[#a9c4ff]" : "border-white/10 text-white/55"}`}>{s.tag}</span>
                  </div>
                  <div className="relative mt-1.5 text-[12px] text-white/40">{s.period}</div>
                  <h3 className="font-display relative mt-6 text-[26px] font-medium leading-tight text-white md:sikisik:mt-4 md:sikisik:text-[22px]">{s.title}</h3>
                  <p className="relative mt-3 text-[14.5px] leading-relaxed text-white/60 md:sikisik:mt-2 md:sikisik:text-[13px] md:sikisik:leading-snug">{s.text}</p>
                  {s.details?.length ? (
                    <ul className="relative mt-5 space-y-1.5 border-t border-white/10 pt-4 text-[13px] leading-snug text-white/65 md:sikisik:mt-3 md:sikisik:space-y-1 md:sikisik:pt-3 md:sikisik:text-[12px]">
                      {s.details.map((d) => (
                        <li key={d} className="relative pl-3.5 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-[#8fb0ff]">{d}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="relative mt-auto hidden pt-6 md:sikisik:pt-3 text-[11px] uppercase tracking-[0.2em] text-white/30 md:block">{String(i + 1).padStart(2, "0")} / {String(t.journey.stops.length).padStart(2, "0")}</div>
                </article>
              ))}
            </div>
          </div>

          {photos.length > 0 && (
            <div className="mt-5 md:mt-0">
              <div className="mx-auto mb-2 flex max-w-6xl items-center gap-3 px-5 sm:px-8">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/35">{t.journey.galleryLabel}</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <PhotoMarquee photos={photos} lang={lang} />
            </div>
          )}
        </div>

        {/* İlerleme çubuğu */}
        <div className="mx-auto hidden w-full max-w-6xl px-5 pb-5 sm:px-8 md:block">
          <div className="relative h-px w-full bg-white/10">
            <div className="journey-line absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gradient-to-r from-[#4f7cff] to-[#8fb0ff]" />
          </div>
          <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.18em] text-white/35">
            {["2021", "2022", "2023", "2024", "2025", "2026"].map((y) => <span key={y}>{y}</span>)}
          </div>
        </div>
      </section>

      {/* Projeler */}
      <section id="projects" className="mx-auto max-w-6xl px-5 pt-32 sm:px-8">
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
              className="group relative rounded-2xl border border-white/10 bg-[#06111f] p-7 transition-transform duration-200 [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:border-white/25"
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
      <section id="research" data-fit="screen" className="relative mt-32 flex flex-col justify-center overflow-hidden py-28 md:min-h-screen md:sikisik:py-16 md:[@media(max-height:820px)]:pt-24 md:[@media(max-height:820px)]:pb-10">
        {/* Yarı saydam lacivert film: paylaşılan mause ışıltısı altından hafifçe
            sızar (hue kendiliğinden research'ün rengine kayar), kenarlarda
            saydamlığa dönerek komşu bölümlerle sert bir kesim oluşturmaz. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,17,31,0) 0%, rgba(6,17,31,0.82) 12%, rgba(6,17,31,0.82) 88%, rgba(6,17,31,0) 100%)",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 sm:px-8 md:grid-cols-[1fr_1fr] md:sikisik:gap-10">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8fb0ff]" data-reveal>{t.research.kicker}</p>
            <h2 className="font-display mt-5 text-[clamp(1.9rem,4vw,3rem)] md:[@media(max-height:820px)]:text-[2.3rem] font-medium leading-[1.1] tracking-tight text-white" data-reveal>{t.research.headline}</h2>
            <p className="mt-6 border-l-2 border-[#4f7cff]/50 pl-4 text-[14.5px] italic leading-relaxed text-white/70 md:sikisik:mt-5 md:[@media(max-height:820px)]:text-[13.5px]" data-reveal>“{t.research.quote}”</p>
            <p className="mt-6 text-[16px] leading-relaxed text-white/65 md:sikisik:mt-5 md:[@media(max-height:820px)]:text-[15px]" data-reveal>{t.research.text}</p>
            <p className="mt-4 text-[12.5px] text-white/40" data-reveal>{t.research.org}</p>
            <div className="mt-[4.5rem] flex justify-center md:justify-start md:sikisik:mt-12 md:[@media(max-height:820px)]:mt-7">
              <div className="stamp relative inline-flex rotate-[-8deg] flex-col items-center gap-2 rounded-lg border-[3px] border-[#6f9bff]/85 px-9 py-5 sikisik:px-7 sikisik:py-4 max-[400px]:px-5 max-[400px]:py-3.5 text-center">
                <span aria-hidden className="pointer-events-none absolute inset-[4px] rounded-[5px] border border-[#6f9bff]/55" />
                <span className="font-display text-[clamp(1.9rem,4.4vw,2.7rem)] max-[400px]:text-[1.45rem] font-semibold uppercase leading-none tracking-[0.1em] whitespace-nowrap text-[#9dbcff]">{t.research.highlight.title}</span>
                <span className="text-[10.5px] max-[400px]:text-[9px] font-semibold uppercase tracking-[0.3em] whitespace-nowrap text-[#9dbcff]/80 sikisik:tracking-[0.22em] max-[400px]:tracking-[0.16em]">{t.research.highlight.label}</span>
              </div>
            </div>
          </div>
          <ol className="grid gap-6 self-center lg:grid-cols-2">
            {t.research.steps.map((s) => (
              <li key={s.n} className="rounded-2xl border border-white/10 bg-[#030a16] p-6 md:[@media(max-height:820px)]:p-4" data-reveal>
                <div className="font-display text-[22px] text-[#8fb0ff]">{s.n}</div>
                <div className="mt-3 text-[16px] font-semibold text-white">{s.title}</div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Yetkinlikler */}
      <section id="skills" className="mx-auto max-w-6xl px-5 pt-32 sm:px-8">
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight text-white" data-reveal>{t.skills.title}</h2>
        <p className="mt-3 max-w-xl text-[15px] text-white/50" data-reveal>{t.skills.sub}</p>

        <div className="mt-12 flex items-center gap-4" data-reveal>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fb0ff]">{t.skills.techLabel}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-[#4f7cff]/40 to-transparent" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.skills.groups.map((g) => (
            <div key={g.label} className="rounded-2xl border border-white/10 bg-[#06111f] p-5 transition-colors hover:border-white/25" data-reveal>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{g.label}</div>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span key={s} className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12.5px] text-white/85">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex items-center gap-4" data-reveal>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8fb0ff]">{t.skills.humanLabel}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-[#4f7cff]/40 to-transparent" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {t.skills.human.map((s) => (
            <div key={s.title} className="relative rounded-2xl border border-white/10 p-5 pl-6 transition-colors hover:border-white/25" data-reveal>
              <span aria-hidden className="absolute left-0 top-5 h-8 w-0.5 rounded-full bg-[#4f7cff]/70" />
              <div className="text-[15.5px] font-semibold text-white">{s.title}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* İletişim */}
      <section id="contact" className="mx-auto max-w-6xl px-5 pb-16 pt-36 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#06111f] px-7 py-16 text-center sm:px-12 sm:py-24" data-reveal>
          <div className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.22),transparent_60%)]" />
          <h2 className="font-display relative text-[clamp(2.4rem,6vw,4.6rem)] font-medium tracking-tight text-white">{t.contact.title}</h2>
          <p className="relative mt-5 text-[16px] text-white/60">{t.contact.text}</p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <a href={`mailto:${links.email}`} className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#030a16] transition hover:bg-[#dfe7ff]">{t.contact.email}</a>
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
