import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-display", axes: ["opsz"] });
const body = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL("https://tolguner.me"),
  title: "Tolga Olguner",
  description:
    "Yönetim Bilişim Sistemleri öğrencisi. Spring Boot ve React ile web uygulamaları; TÜBİTAK 2209-A araştırma projesi yürütücüsü.",
  openGraph: {
    title: "Tolga Olguner",
    description: "Yönetim Bilişim Sistemleri öğrencisi · Işık Üniversitesi",
    url: "https://tolguner.me",
    siteName: "tolguner.me",
    images: [{ url: "/foto.jpg", width: 600, height: 800 }],
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* Boyamadan önce çalışır: açılış perdesi oynayacaksa hero'yu gizler.
            JS kapalıysa sınıf hiç eklenmez, sayfa normal görünür. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!sessionStorage.getItem('giris')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('giris-perde')}}catch(e){}",
          }}
        />
        {/* Kayitli tema secimini ilk boyamadan once uygular; aksi halde
            sayfa bir kare yanlis temada gorunup zipliyor. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('tema');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
