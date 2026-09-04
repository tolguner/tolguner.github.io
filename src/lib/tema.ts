"use client";

import { useEffect, useState } from "react";

export type Tema = "light" | "dark";

const ANAHTAR = "tema";

function sistemTemasi(): Tema {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function kayitliTema(): Tema | null {
  try {
    const v = localStorage.getItem(ANAHTAR);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function okunanTema(): Tema {
  const secim = document.documentElement.getAttribute("data-theme");
  if (secim === "light" || secim === "dark") return secim;
  return sistemTemasi();
}

/**
 * O an gecerli olan temayi canli izler: hem <html data-theme> degisimini
 * (manuel secim) hem de isletim sistemi tercihini dinler. Boylece ayni
 * sayfadaki tum bilesenler (dugme ikonu, 3B kure) senkron kalir.
 */
export function useEtkinTema(): { tema: Tema; hazir: boolean } {
  // Sunucu ciktisiyla ilk istemci karesi ayni olsun diye "dark" ile basliyoruz;
  // gercek deger ilk effect'te oturuyor.
  const [tema, setTema] = useState<Tema>("dark");
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    const guncelle = () => setTema(okunanTema());
    guncelle();
    setHazir(true);

    const gozlemci = new MutationObserver(guncelle);
    gozlemci.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", guncelle);

    return () => {
      gozlemci.disconnect();
      mq.removeEventListener("change", guncelle);
    };
  }, []);

  return { tema, hazir };
}

/** Tema secimi: <html data-theme> ile uygulanir, localStorage'da saklanir. */
export function useTema() {
  const { tema, hazir } = useEtkinTema();

  const setTema = (t: Tema) => {
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(ANAHTAR, t);
    } catch {}
  };

  // Yonu React durumundan degil DOM'dan okuyoruz: hidrasyon tamamlanmadan
  // once tiklanirsa durum hala baslangic degerinde olabilir ve tema yanlis
  // yone doner.
  const degistir = () => setTema(okunanTema() === "dark" ? "light" : "dark");

  return { tema, setTema, degistir, hazir, kayitliTema };
}
