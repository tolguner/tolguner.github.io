export type Lang = "tr" | "en";

type Entry = { title: string; org: string; date: string; items?: string[]; note?: string };
export type SkillGroup = { label: string; items: string };
type Project = { title: string; kind: string; tech: string; note: string; items: string[]; url: string; urlLabel: string };

export type Dict = {
  nav: { about: string; experience: string; research: string; projects: string; skills: string; portfolio: string; menu: string; menuClose: string; temaAcik: string; temaKoyu: string };
  hero: { tagline: string; intro: string; cv: string; cvFile: string; email: string };
  sections: { experience: string; communities: string; research: string; projects: string; skills: string; technical: string; personal: string; education: string; languages: string };
  experience: Entry[];
  communities: Entry[];
  research: { title: string; role: string; org: string; date: string; topic: string; items: string[] };
  projects: Project[];
  skills: SkillGroup[];
  personal: string[];
  education: { degree: string; school: string; date: string; meta: string };
  languages: string[];
  footer: string;
  updated: string;
  /** Duz adresler; iki dilde ayni. */
  links: { email: string; github: string; linkedin: string; portfolyo: string };
};

export const content: Record<Lang, Dict> = {
  tr: {
    nav: { about: "Hakkımda", experience: "Deneyim", research: "Araştırma", projects: "Projeler", skills: "Yetkinlikler", portfolio: "Portfolyo", menu: "Menüyü aç", menuClose: "Menüyü kapat", temaAcik: "Açık temaya geç", temaKoyu: "Koyu temaya geç" },
    hero: {
      tagline: "Yönetim Bilişim Sistemleri Öğrencisi · Işık Üniversitesi",
      intro:
        "Spring Boot ve React ile web uygulamaları geliştiriyorum; TÜBİTAK 2209-A destekli bir araştırma projesinin yürütücüsüyüm. Üç yıllık kulüp başkanlığı ve kurumsal etkinlik organizasyonu deneyimiyle teknik bilgiyi iletişim, ekip koordinasyonu ve organizasyon becerisiyle birleştiriyorum.",
      cv: "CV (PDF)",
      cvFile: "/cv/Tolga_Olguner_CV_TR.pdf",
      email: "E-posta",
    },
    sections: {
      experience: "Deneyim",
      communities: "Gönüllü Deneyim",
      research: "Araştırma",
      projects: "Seçili Projeler",
      skills: "Yetkinlikler",
      technical: "Teknik Yetkinlikler",
      personal: "Kişisel Yetkinlikler",
      education: "Eğitim",
      languages: "Diller",
    },
    experience: [
      {
        title: "Çalışma Burslu Öğrenci",
        org: "Kurumsal İletişim Daire Başkanlığı, Işık Üniversitesi",
        date: "May 2025 – Ağu 2026",
        items: [
          "Üniversitenin kurumsal organizasyonlarında görev aldım ve görevli öğrenci ekibinin koordinasyonunu yürüttüm",
          "2025 ve 2026 Tercih ve Tanıtım Günleri'nde Tanıtım Ekibi bünyesinde çalıştım; ekibin ve organizasyonun yürütülmesinden sorumlu oldum",
        ],
      },
      {
        title: "Üniversite Pazarlama Temsilcisi",
        org: "Unicourse",
        date: "Eki 2025 – Tem 2026",
        items: ["Kampüs temsilcisi olarak öğrenci topluluğuna yönelik pazarlama ve tanıtım faaliyetlerini yürüttüm", "Firmanın ihtiyaç duyduğu eğitim materyallerinin organizasyonunu üstlendim"],
      },
    ],
    communities: [
      { title: "Kulüp Başkanı", org: "IT&MIS Kulübü, Işık Üniversitesi", date: "Eki 2023 – Haz 2026", note: "Söyleşi, zirve, hackathon, kariyer fuarı, şirket gezisi ve mülakat simülasyonları düzenledim" },
      { title: "Kurucu Yönetim Kurulu Üyesi", org: "Işık Run Club, Işık Üniversitesi", date: "Nis 2026 – Haz 2026", note: "Koşu, trekking, doğa sporları ve sosyal etkinlikler organize ettim" },
    ],
    research: {
      title: "TÜBİTAK 2209-A Araştırma Projesi",
      role: "Proje Yürütücüsü · 4 Kişilik Ekip",
      org: "Üniversite Öğrencilerinin Dijital Davranışlarının Akademik Başarıları Üzerinde Etkisi: Ekran Süresi, Uyku, Stres ve Farkındalığın Rolünün Veri Bilimi Yaklaşımıyla İncelenmesi · Başvuru No 1919B012534181",
      date: "2026 – devam ediyor",
      topic:
        "Üniversite Öğrencilerinin Dijital Davranışlarının Akademik Başarıları Üzerinde Etkisi: Ekran Süresi, Uyku, Stres ve Farkındalığın Rolünün Veri Bilimi Yaklaşımıyla İncelenmesi",
      items: [
        "TÜBİTAK tarafından kabul edildi ve 2209-A programı kapsamında hibe desteği almaya hak kazandı; şu an veri toplama aşamasında",
        "PSQI, PSS-10 ve MAAS ölçekleriyle toplanan ekran süresi ve not ortalaması verisini çoklu regresyon ve aracılık/moderasyon analiziyle inceliyor, çıktı olarak “Farkındalık Gösterge Paneli” prototipini hedefliyor",
        "Danışman: Dr. Habibe Aktay",
      ],
    },
    projects: [
      {
        title: "Işık CampusOS",
        kind: "Bitirme Projesi · 2026",
        tech: "Java · Spring Boot · React · Apache Kafka · PostgreSQL · Docker",
        note: "Kampüs yaşamının dağınık süreçlerini — kulüp ve etkinlikler, tesis rezervasyonu, yemek siparişi, paylaşımlı yolculuk — öğrencinin tek hesapla kullandığı bir platformda birleştirmeyi amaçlar.",
        items: ["Mikroservis mimarisi: API Gateway'de merkezi JWT doğrulama, Kafka ile olay güdümlü servis iletişimi, servis başına ayrı veritabanı"],
        url: "https://github.com/tolguner/IsikCampusOS",
        urlLabel: "github.com/tolguner/IsikCampusOS",
      },
      {
        title: "tolguner.me",
        kind: "Kişisel Portfolyo Sitesi · 2026",
        tech: "Next.js · TypeScript · PostgreSQL · Supabase · Three.js · Vercel",
        note: "Kişisel geçmişimi, projelerimi ve araştırmamı scroll'a bağlı 3B bir deneyimle anlatır. İçerik Postgres'te tutulur ve giriş gerektiren bir panelden düzenlenir; site kod değişmeden güncellenir.",
        items: [
          "Three.js tabanlı özel 3B sahne ve GSAP ScrollTrigger ile senaryolu geçiş animasyonları",
          "Satır düzeyi güvenlik (RLS) ve TOTP iki adımlı doğrulama ile korunan yönetim paneli; taslak → yayımla akışı, revizyon geçmişi ve geri alma",
        ],
        url: "https://github.com/tolguner/tolguner.github.io",
        urlLabel: "github.com/tolguner/tolguner.github.io",
      },
      {
        title: "Veteriner Yönetim Sistemi",
        kind: "Proje Yürütücüsü · 5 Kişilik Ekip · 2025",
        tech: "Spring Boot · React · MySQL · JWT",
        note: "Bir veteriner kliniğinin hasta, randevu ve tedavi kayıtlarını tek sistemde yönetmesini sağlar.",
        items: ["JWT korumalı REST API ve React arayüzü"],
        url: "https://github.com/tolguner/Veterinary-Management-System",
        urlLabel: "github.com/tolguner/Veterinary-Management-System",
      },
      {
        title: "Şans Oyunlarında Hızlı Kazanç Algısı ve Emek İlişkisi: İstatistiksel Bir Analiz ve Modelleme",
        kind: "Proje Yürütücüsü · 4 Kişilik Ekip · 2025",
        tech: "Python · pandas · statsmodels · Jupyter",
        note: "Hızlı kazanç algısının emek inancıyla ilişkisini anket temelli istatistiksel yöntemlerle inceler.",
        items: ["153 katılımcılı veride güvenilirlik, regresyon ve aracılık analizi"],
        url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
        urlLabel: "github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
      },
    ],
    skills: [
      { label: "Diller", items: "Java · TypeScript · Python · Move" },
      { label: "Backend", items: "Spring Boot · REST API · JWT · Kafka" },
      { label: "Frontend", items: "React · Next.js · Tailwind CSS · JavaFX" },
      { label: "Veri ve analiz", items: "pandas · NumPy · statsmodels · Jupyter" },
      { label: "Veritabanı", items: "PostgreSQL · MySQL · MSSQL" },
      { label: "Araçlar", items: "Docker · Git ve GitHub · Maven" },
    ],
    personal: ["Ekip liderliği ve koordinasyon", "Etkinlik ve organizasyon yönetimi", "İletişim ve sunum", "Proje planlama"],
    education: { degree: "Yönetim Bilişim Sistemleri, Lisans", school: "Işık Üniversitesi, İstanbul", date: "2021 – 2026", meta: "Genel not ortalaması 3,43 / 4,00 · %100 burslu" },
    languages: ["Türkçe — anadil", "İngilizce — orta-ileri (B2)", "Almanca — başlangıç (A1)"],
    footer: "İstanbul / Bursa, Türkiye",
    updated: "Son güncelleme",
    links: {
      email: "tolgaolguner@gmail.com",
      github: "https://github.com/tolguner",
      linkedin: "https://www.linkedin.com/in/tolguner/",
      portfolyo: "/",
    },
  },
  en: {
    nav: { about: "About", experience: "Experience", research: "Research", projects: "Projects", skills: "Skills", portfolio: "Portfolio", menu: "Open menu", menuClose: "Close menu", temaAcik: "Switch to light theme", temaKoyu: "Switch to dark theme" },
    hero: {
      tagline: "Management Information Systems Student · Işık University",
      intro:
        "I build web applications with Spring Boot and React and lead a TÜBİTAK 2209-A funded research project. Three years as a club president and hands-on corporate event organization combine technical skills with communication, team coordination and organizational ability.",
      cv: "CV (PDF)",
      cvFile: "/cv/Tolga_Olguner_CV_EN.pdf",
      email: "Email",
    },
    sections: {
      experience: "Experience",
      communities: "Volunteer Experience",
      research: "Research",
      projects: "Selected Projects",
      skills: "Skills",
      technical: "Technical Skills",
      personal: "Personal Skills",
      education: "Education",
      languages: "Languages",
    },
    experience: [
      {
        title: "Work-Study Student",
        org: "Corporate Communications Directorate, Işık University",
        date: "May 2025 – Aug 2026",
        items: [
          "Took part in the university's corporate events and coordinated the student staff team",
          "Worked on the Promotion Team during the 2025 and 2026 Preference and Promotion Days; responsible for running the team and the event",
        ],
      },
      {
        title: "University Marketing Representative",
        org: "Unicourse",
        date: "Oct 2025 – Jul 2026",
        items: ["Ran on-campus marketing and outreach activities targeting the student community as campus representative", "Organized the training materials the company needed"],
      },
    ],
    communities: [
      { title: "Club President", org: "IT&MIS Club, Işık University", date: "Oct 2023 – Jun 2026", note: "Organized talks, summits, hackathons, career fairs, company visits and mock interviews" },
      { title: "Founding Board Member", org: "Işık Run Club, Işık University", date: "Apr 2026 – Jun 2026", note: "Planned runs, trekking, outdoor sports and social events" },
    ],
    research: {
      title: "TÜBİTAK 2209-A Research Project",
      role: "Project Lead · 4-Person Team",
      org: "The Effect of University Students' Digital Behaviors on Academic Achievement: Examining the Role of Screen Time, Sleep, Stress and Awareness through a Data Science Approach · Application No 1919B012534181",
      date: "2026 – ongoing",
      topic:
        "The Effect of University Students' Digital Behaviors on Academic Achievement: Examining the Role of Screen Time, Sleep, Stress and Awareness through a Data Science Approach",
      items: [
        "Accepted by TÜBİTAK and awarded a grant under the 2209-A programme; currently in the data collection phase",
        "Examines screen-time and GPA data collected via the PSQI, PSS-10 and MAAS scales through multiple regression and mediation/moderation analysis, targeting an “Awareness Dashboard” prototype as output",
        "Advisor: Dr. Habibe Aktay",
      ],
    },
    projects: [
      {
        title: "Işık CampusOS",
        kind: "Capstone Project · 2026",
        tech: "Java · Spring Boot · React · Apache Kafka · PostgreSQL · Docker",
        note: "Aims to bring the scattered parts of campus life — clubs and events, facility booking, food ordering, ride sharing — into one platform students use with a single account.",
        items: ["Microservice architecture: centralized JWT validation at the API gateway, event-driven service communication via Kafka, database per service"],
        url: "https://github.com/tolguner/IsikCampusOS",
        urlLabel: "github.com/tolguner/IsikCampusOS",
      },
      {
        title: "tolguner.me",
        kind: "Personal Portfolio Site · 2026",
        tech: "Next.js · TypeScript · PostgreSQL · Supabase · Three.js · Vercel",
        note: "Presents my background, projects and research through a scroll-driven 3D experience. Content lives in Postgres and is edited through a login-protected admin panel; the site is updated without code changes.",
        items: [
          "Custom Three.js scene with GSAP ScrollTrigger-driven transition animations",
          "Admin panel protected by row-level security and TOTP two-factor authentication; draft-to-publish flow, revision history and rollback",
        ],
        url: "https://github.com/tolguner/tolguner.github.io",
        urlLabel: "github.com/tolguner/tolguner.github.io",
      },
      {
        title: "Veterinary Management System",
        kind: "Project Lead · 5-Person Team · 2025",
        tech: "Spring Boot · React · MySQL · JWT",
        note: "Lets a veterinary clinic manage patient, appointment and treatment records in one system.",
        items: ["JWT-secured REST API and React interface"],
        url: "https://github.com/tolguner/Veterinary-Management-System",
        urlLabel: "github.com/tolguner/Veterinary-Management-System",
      },
      {
        title: "Quick-Gain Perception and Effort in Games of Chance: A Statistical Analysis and Modelling",
        kind: "Project Lead · 4-Person Team · 2025",
        tech: "Python · pandas · statsmodels · Jupyter",
        note: "Examines the relationship between perceived quick gains and belief in effort using survey-based statistical methods.",
        items: ["Reliability, regression and mediation analysis on data from 153 participants"],
        url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
        urlLabel: "github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
      },
    ],
    skills: [
      { label: "Languages", items: "Java · TypeScript · Python · Move" },
      { label: "Backend", items: "Spring Boot · REST APIs · JWT · Kafka" },
      { label: "Frontend", items: "React · Next.js · Tailwind CSS · JavaFX" },
      { label: "Data & analysis", items: "pandas · NumPy · statsmodels · Jupyter" },
      { label: "Databases", items: "PostgreSQL · MySQL · MSSQL" },
      { label: "Tools", items: "Docker · Git & GitHub · Maven" },
    ],
    personal: ["Team leadership and coordination", "Event and organization management", "Communication and presentation", "Project planning"],
    education: { degree: "B.A. Management Information Systems", school: "Işık University, Istanbul", date: "2021 – 2026", meta: "GPA 3.43 / 4.00 · Full scholarship (100%)" },
    languages: ["Turkish — native", "English — upper-intermediate (B2)", "German — beginner (A1)"],
    footer: "Istanbul / Bursa, Turkey",
    updated: "Last updated",
    links: {
      email: "tolgaolguner@gmail.com",
      github: "https://github.com/tolguner",
      linkedin: "https://www.linkedin.com/in/tolguner/",
      portfolyo: "/",
    },
  },
};
