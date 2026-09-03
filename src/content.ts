export type Lang = "tr" | "en";

type Entry = { title: string; org: string; date: string; items?: string[]; note?: string };
export type SkillGroup = { label: string; items: string };
type Project = { title: string; kind: string; tech: string; note: string; items: string[]; url: string; urlLabel: string };

export type Dict = {
  nav: { about: string; experience: string; research: string; projects: string; skills: string; contact: string };
  hero: { tagline: string; intro: string; cv: string; cvFile: string; email: string };
  sections: { experience: string; communities: string; research: string; projects: string; otherRepos: string; skills: string; personal: string; education: string; languages: string; contact: string };
  experience: Entry[];
  communities: Entry[];
  research: { title: string; org: string; date: string; topic: string; items: string[] };
  projects: Project[];
  otherReposNote: string;
  skills: SkillGroup[];
  personal: string[];
  education: { degree: string; school: string; date: string; meta: string };
  languages: string[];
  contact: { text: string };
  footer: string;
  updated: string;
};

export const content: Record<Lang, Dict> = {
  tr: {
    nav: { about: "Hakkımda", experience: "Deneyim", research: "Araştırma", projects: "Projeler", skills: "Yetkinlikler", contact: "İletişim" },
    hero: {
      tagline: "Yönetim Bilişim Sistemleri Öğrencisi · Işık Üniversitesi",
      intro:
        "Spring Boot ve React ile web uygulamaları geliştiriyorum; TÜBİTAK 2209-A destekli bir araştırma projesinin yürütücüsüyüm. İki yıllık kulüp başkanlığı ve kurumsal etkinlik organizasyonu deneyimiyle teknik bilgiyi iletişim, ekip koordinasyonu ve organizasyon becerisiyle birleştiriyorum.",
      cv: "CV (PDF)",
      cvFile: "/cv/Tolga_Olguner_CV_TR.pdf",
      email: "E-posta",
    },
    sections: {
      experience: "Deneyim",
      communities: "Öğrenci Toplulukları",
      research: "Araştırma",
      projects: "Seçili Projeler",
      otherRepos: "Diğer Depolar",
      skills: "Teknik Yetkinlikler",
      personal: "Kişisel Yetkinlikler",
      education: "Eğitim",
      languages: "Diller",
      contact: "İletişim",
    },
    experience: [
      {
        title: "Çalışma Burslu Öğrenci",
        org: "Kurumsal İletişim Daire Başkanlığı, Işık Üniversitesi",
        date: "May 2025 – Ağu 2026",
        items: [
          "Üniversitenin kurumsal organizasyonlarında görev aldı ve görevli öğrenci ekibinin koordinasyonunu yürüttü",
          "2025 ve 2026 Tercih ve Tanıtım Günleri'nde Tanıtım Ekibi bünyesinde çalıştı; ekibin ve organizasyonun yürütülmesinden sorumlu oldu",
        ],
      },
      {
        title: "Üniversite Pazarlama Temsilcisi",
        org: "Unicourse",
        date: "Eki 2025 – Tem 2026",
        items: ["Kampüs temsilcisi olarak öğrenci topluluğuna yönelik pazarlama ve tanıtım faaliyetlerini yürüttü", "Firmanın ihtiyaç duyduğu eğitim materyallerinin organizasyonunu üstlendi"],
      },
    ],
    communities: [
      { title: "Kulüp Başkanı", org: "IT&MIS Kulübü, Işık Üniversitesi", date: "Oca 2024 – Haz 2026", note: "Söyleşi, zirve, hackathon, kariyer fuarı, şirket gezisi ve mülakat simülasyonu organizasyonları" },
      { title: "Kurucu Yönetim Kurulu Üyesi", org: "Işık Run Club, Işık Üniversitesi", date: "Nis 2026 – Haz 2026", note: "Koşu, trekking ve sosyal etkinliklerin planlanması" },
    ],
    research: {
      title: "Proje Yürütücüsü",
      org: "TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri Destekleme Programı · Başvuru No 1919B012534181",
      date: "2026 – devam ediyor",
      topic:
        "Üniversite Öğrencilerinin Dijital Davranışlarının Akademik Başarıları Üzerinde Etkisi: Ekran Süresi, Uyku, Stres ve Farkındalığın Rolünün Veri Bilimi Yaklaşımıyla İncelenmesi",
      items: [
        "TÜBİTAK tarafından kabul edildi ve 2209-A programı kapsamında hibe desteği almaya hak kazandı; şu an veri toplama aşamasında",
        "PSQI, PSS-10 ve MAAS ölçekleri ile ekran süresi ve not ortalaması verisinin çoklu regresyon ve aracılık/moderasyon analiziyle incelenmesi; çıktı olarak “Farkındalık Gösterge Paneli” prototipi",
        "Dört kişilik ekip · danışman Dr. Habibe Aktay",
      ],
    },
    projects: [
      {
        title: "Işık CampusOS",
        kind: "Bitirme projesi · 2026",
        tech: "Java · Spring Boot · React · Apache Kafka · PostgreSQL · Docker",
        note: "Kampüs yaşamının dağınık süreçlerini — kulüp ve etkinlikler, tesis rezervasyonu, yemek siparişi, paylaşımlı yolculuk — öğrencinin tek hesapla kullandığı bir platformda birleştirmeyi amaçlar.",
        items: ["Mikroservis mimarisi: API Gateway'de merkezi JWT doğrulama, Kafka ile olay güdümlü servis iletişimi, servis başına ayrı veritabanı"],
        url: "https://github.com/tolguner/IsikCampusOS",
        urlLabel: "github.com/tolguner/IsikCampusOS",
      },
      {
        title: "Veteriner Yönetim Sistemi",
        kind: "Ekip projesi · proje koordinatörü · 2025",
        tech: "Spring Boot · React · MySQL · JWT",
        note: "Bir veteriner kliniğinin hasta, randevu ve tedavi kayıtlarını tek sistemde yönetmesini sağlar.",
        items: ["Beş kişilik ekipte proje koordinatörü; JWT korumalı REST API ve React arayüzü"],
        url: "https://github.com/tolguner/Veterinary-Management-System",
        urlLabel: "github.com/tolguner/Veterinary-Management-System",
      },
      {
        title: "Şans Oyunlarında Hızlı Kazanç Algısı ve Emek İlişkisi: İstatistiksel Bir Analiz ve Modelleme",
        kind: "Veri bilimi dönem projesi · 2025",
        tech: "Python · pandas · statsmodels · Jupyter",
        note: "Hızlı kazanç algısının emek inancıyla ilişkisini inceleyen anket temelli istatistiksel çalışma.",
        items: ["153 katılımcılı veride güvenilirlik, regresyon ve aracılık analizi; dört kişilik ekip, 44 sayfalık araştırma raporu"],
        url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
        urlLabel: "github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
      },
      {
        title: "tolguner.me",
        kind: "Kişisel portfolyo sitesi · 2026",
        tech: "Next.js · TypeScript · Three.js · GSAP · GitHub Pages",
        note: "Bu site. Statik export ile GitHub Pages'te yayınlanıyor; depo listesi build sırasında GitHub API'den çekiliyor.",
        items: [],
        url: "https://github.com/tolguner/tolguner.github.io",
        urlLabel: "github.com/tolguner/tolguner.github.io",
      },
    ],
    otherReposNote: "GitHub'daki diğer herkese açık depolar — çoğu ders projesi, o dönemki öğrenme seviyemi yansıtıyor.",
    skills: [
      { label: "Diller", items: "Java · TypeScript · Python · SQL" },
      { label: "Backend", items: "Spring Boot · REST API · JWT · Kafka" },
      { label: "Frontend", items: "React · Next.js · Tailwind CSS · JavaFX" },
      { label: "Veri ve analiz", items: "pandas · statsmodels · scikit-learn · Jupyter" },
      { label: "Veritabanı", items: "PostgreSQL · MySQL · Prisma" },
      { label: "Araçlar", items: "Docker · Git ve GitHub · Maven" },
    ],
    personal: ["Ekip liderliği ve koordinasyon", "Etkinlik ve organizasyon yönetimi", "İletişim ve sunum", "Proje planlama"],
    education: { degree: "Yönetim Bilişim Sistemleri, Lisans", school: "Işık Üniversitesi, İstanbul", date: "2021 – 2026", meta: "Genel not ortalaması 3,43 / 4,00" },
    languages: ["Türkçe — anadil", "İngilizce — orta-ileri (B2)", "Almanca — başlangıç (A1)"],
    contact: { text: "İş birliği, staj ve iş fırsatları için e-posta ya da LinkedIn üzerinden ulaşabilirsiniz." },
    footer: "İstanbul / Bursa",
    updated: "Son güncelleme",
  },
  en: {
    nav: { about: "About", experience: "Experience", research: "Research", projects: "Projects", skills: "Skills", contact: "Contact" },
    hero: {
      tagline: "Management Information Systems Student · Işık University",
      intro:
        "I build web applications with Spring Boot and React and lead a TÜBİTAK 2209-A funded research project. Two years as a club president and hands-on corporate event organization combine technical skills with communication, team coordination and organizational ability.",
      cv: "CV (PDF)",
      cvFile: "/cv/Tolga_Olguner_CV_EN.pdf",
      email: "Email",
    },
    sections: {
      experience: "Experience",
      communities: "Student Organizations",
      research: "Research",
      projects: "Selected Projects",
      otherRepos: "Other Repositories",
      skills: "Technical Skills",
      personal: "Personal Skills",
      education: "Education",
      languages: "Languages",
      contact: "Contact",
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
      { title: "Club President", org: "IT&MIS Club, Işık University", date: "Jan 2024 – Jun 2026", note: "Talks, summits, hackathons, career fairs, company visits and mock interviews" },
      { title: "Founding Board Member", org: "Işık Run Club, Işık University", date: "Apr 2026 – Jun 2026", note: "Planning runs, trekking and social events" },
    ],
    research: {
      title: "Project Lead",
      org: "TÜBİTAK 2209-A Undergraduate Research Projects Support Program · Application No 1919B012534181",
      date: "2026 – ongoing",
      topic:
        "The Effect of University Students' Digital Behaviors on Academic Achievement: Examining the Role of Screen Time, Sleep, Stress and Awareness through a Data Science Approach",
      items: [
        "Accepted by TÜBİTAK and awarded a grant under the 2209-A programme; currently in the data collection phase",
        "Screen-time, GPA and PSQI, PSS-10, MAAS scale data to be analysed with multiple regression and mediation/moderation analysis, delivering an “Awareness Dashboard” prototype",
        "Four-person team · advisor Dr. Habibe Aktay",
      ],
    },
    projects: [
      {
        title: "Işık CampusOS",
        kind: "Capstone project · 2026",
        tech: "Java · Spring Boot · React · Apache Kafka · PostgreSQL · Docker",
        note: "Aims to bring the scattered parts of campus life — clubs and events, facility booking, food ordering, ride sharing — into one platform students use with a single account.",
        items: ["Microservice architecture: centralized JWT validation at the API gateway, event-driven service communication via Kafka, database per service"],
        url: "https://github.com/tolguner/IsikCampusOS",
        urlLabel: "github.com/tolguner/IsikCampusOS",
      },
      {
        title: "Veterinary Management System",
        kind: "Team project · project coordinator · 2025",
        tech: "Spring Boot · React · MySQL · JWT",
        note: "Lets a veterinary clinic manage patient, appointment and treatment records in one system.",
        items: ["Project coordinator in a five-person team; JWT-secured REST API and React interface"],
        url: "https://github.com/tolguner/Veterinary-Management-System",
        urlLabel: "github.com/tolguner/Veterinary-Management-System",
      },
      {
        title: "Quick-Gain Perception and Effort in Games of Chance: A Statistical Analysis and Modelling",
        kind: "Data science term project · 2025",
        tech: "Python · pandas · statsmodels · Jupyter",
        note: "Survey-based statistical study of how perceived quick gains relate to belief in effort.",
        items: ["Reliability, regression and mediation analysis on data from 153 participants; four-person team, 44-page research report"],
        url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
        urlLabel: "github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
      },
      {
        title: "tolguner.me",
        kind: "Personal portfolio site · 2026",
        tech: "Next.js · TypeScript · Three.js · GSAP · GitHub Pages",
        note: "This site. Statically exported to GitHub Pages; the repository list is fetched from the GitHub API at build time.",
        items: [],
        url: "https://github.com/tolguner/tolguner.github.io",
        urlLabel: "github.com/tolguner/tolguner.github.io",
      },
    ],
    otherReposNote: "Other public repositories on GitHub — mostly course projects reflecting what I knew at the time. Most READMEs are in Turkish.",
    skills: [
      { label: "Languages", items: "Java · TypeScript · Python · SQL" },
      { label: "Backend", items: "Spring Boot · REST APIs · JWT · Kafka" },
      { label: "Frontend", items: "React · Next.js · Tailwind CSS · JavaFX" },
      { label: "Data & analysis", items: "pandas · statsmodels · scikit-learn · Jupyter" },
      { label: "Databases", items: "PostgreSQL · MySQL · Prisma" },
      { label: "Tools", items: "Docker · Git & GitHub · Maven" },
    ],
    personal: ["Team leadership and coordination", "Event and organization management", "Communication and presentation", "Project planning"],
    education: { degree: "B.A. Management Information Systems", school: "Işık University, Istanbul", date: "2021 – 2026", meta: "GPA 3.43 / 4.00" },
    languages: ["Turkish — native", "English — upper-intermediate (B2)", "German — beginner (A1)"],
    contact: { text: "Reach out by email or LinkedIn for collaboration, internship and job opportunities." },
    footer: "Istanbul / Bursa, Türkiye",
    updated: "Last updated",
  },
};

export const links = {
  email: "tolgaolguner1@gmail.com",
  github: "https://github.com/tolguner",
  linkedin: "https://www.linkedin.com/in/tolguner/",
};
