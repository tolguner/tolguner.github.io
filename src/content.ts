export type Lang = "tr" | "en";

type Entry = { title: string; org: string; date: string; items?: string[]; note?: string };
export type SkillGroup = { label: string; items: string };
type Project = { title: string; kind: string; tech: string; note: string; items: string[]; url: string; urlLabel: string };

export type Dict = {
  nav: { about: string; experience: string; research: string; projects: string; skills: string; portfolio: string };
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
};

export const content: Record<Lang, Dict> = {
  tr: {
    nav: { about: "Hakkımda", experience: "Deneyim", research: "Araştırma", projects: "Projeler", skills: "Yetkinlikler", portfolio: "Portfolyo" },
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
      { title: "IT&MIS Kulübü, Işık Üniversitesi", org: "Kulüp Başkanı", date: "Oca 2024 – Haz 2026", note: "Söyleşi, zirve, hackathon, kariyer fuarı, şirket gezisi ve mülakat simülasyonu organizasyonları" },
      { title: "Işık Run Club, Işık Üniversitesi", org: "Kurucu Yönetim Kurulu Üyesi", date: "Nis 2026 – Haz 2026", note: "Koşu, trekking, SUP board ve sosyal etkinliklerin planlanması" },
    ],
    research: {
      title: "TÜBİTAK 2209-A Araştırma Projesi",
      role: "Proje Yürütücüsü",
      org: "Üniversite Öğrencilerinin Dijital Davranışlarının Akademik Başarıları Üzerinde Etkisi: Ekran Süresi, Uyku, Stres ve Farkındalığın Rolünün Veri Bilimi Yaklaşımıyla İncelenmesi · Başvuru No 1919B012534181",
      date: "2026 – devam ediyor",
      topic:
        "Üniversite Öğrencilerinin Dijital Davranışlarının Akademik Başarıları Üzerinde Etkisi: Ekran Süresi, Uyku, Stres ve Farkındalığın Rolünün Veri Bilimi Yaklaşımıyla İncelenmesi",
      items: [
        "TÜBİTAK tarafından kabul edildi ve 2209-A programı kapsamında hibe desteği almaya hak kazandı; şu an veri toplama aşamasında",
        "PSQI, PSS-10 ve MAAS ölçekleri ile ekran süresi ve not ortalaması verisinin çoklu regresyon ve aracılık/moderasyon analiziyle incelenmesi; çıktı olarak “Farkındalık Gösterge Paneli” prototipi",
        "4 Kişilik Ekip Projesi · Proje Yürütücüsü",
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
        tech: "Next.js · TypeScript · Three.js · GSAP · GitHub Pages",
        note: "Scroll'a bağlı 3B bir deneyimle kişisel geçmişimi, projelerimi ve araştırmamı anlatan portfolyo sitesi; GitHub Pages'te statik export olarak yayınlanıyor, depo listesi build sırasında GitHub API'den çekiliyor.",
        items: [],
        url: "https://github.com/tolguner/tolguner.github.io",
        urlLabel: "github.com/tolguner/tolguner.github.io",
      },
      {
        title: "Veteriner Yönetim Sistemi",
        kind: "Proje Koordinatörü · 2025",
        tech: "Spring Boot · React · MySQL · JWT",
        note: "Bir veteriner kliniğinin hasta, randevu ve tedavi kayıtlarını tek sistemde yönetmesini sağlar.",
        items: ["5 Kişilik Ekip Projesi · Proje Koordinatörü", "JWT korumalı REST API ve React arayüzü"],
        url: "https://github.com/tolguner/Veterinary-Management-System",
        urlLabel: "github.com/tolguner/Veterinary-Management-System",
      },
      {
        title: "Şans Oyunlarında Hızlı Kazanç Algısı ve Emek İlişkisi: İstatistiksel Bir Analiz ve Modelleme",
        kind: "Proje Yürütücüsü · 2025",
        tech: "Python · pandas · statsmodels · Jupyter",
        note: "Hızlı kazanç algısının emek inancıyla ilişkisini inceleyen anket temelli istatistiksel çalışma.",
        items: ["153 katılımcılı veride güvenilirlik, regresyon ve aracılık analizi", "4 Kişilik Ekip Projesi · Proje Yürütücüsü"],
        url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
        urlLabel: "github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
      },
    ],
    skills: [
      { label: "Backend", items: "Spring Boot · REST API · JWT · Kafka" },
      { label: "Frontend", items: "React · Next.js · Tailwind CSS · JavaFX" },
      { label: "Veri ve analiz", items: "pandas · statsmodels · scikit-learn · Jupyter" },
      { label: "Diller", items: "Java · TypeScript · Python · SQL" },
      { label: "Veritabanı", items: "PostgreSQL · MySQL · Prisma" },
      { label: "Araçlar", items: "Docker · Git ve GitHub · Maven" },
    ],
    personal: ["Ekip liderliği ve koordinasyon", "Etkinlik ve organizasyon yönetimi", "İletişim ve sunum", "Proje planlama"],
    education: { degree: "Yönetim Bilişim Sistemleri, Lisans", school: "Işık Üniversitesi, İstanbul", date: "2021 – 2026", meta: "Genel not ortalaması 3,43 / 4,00" },
    languages: ["Türkçe — anadil", "İngilizce — orta-ileri (B2)", "Almanca — başlangıç (A1)"],
    footer: "İstanbul / Bursa",
    updated: "Son güncelleme",
  },
  en: {
    nav: { about: "About", experience: "Experience", research: "Research", projects: "Projects", skills: "Skills", portfolio: "Portfolio" },
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
      { title: "IT&MIS Club, Işık University", org: "Club President", date: "Jan 2024 – Jun 2026", note: "Talks, summits, hackathons, career fairs, company visits and mock interviews" },
      { title: "Işık Run Club, Işık University", org: "Founding Board Member", date: "Apr 2026 – Jun 2026", note: "Planning runs, trekking, SUP boarding and social events" },
    ],
    research: {
      title: "TÜBİTAK 2209-A Research Project",
      role: "Project Lead",
      org: "The Effect of University Students' Digital Behaviors on Academic Achievement: Examining the Role of Screen Time, Sleep, Stress and Awareness through a Data Science Approach · Application No 1919B012534181",
      date: "2026 – ongoing",
      topic:
        "The Effect of University Students' Digital Behaviors on Academic Achievement: Examining the Role of Screen Time, Sleep, Stress and Awareness through a Data Science Approach",
      items: [
        "Accepted by TÜBİTAK and awarded a grant under the 2209-A programme; currently in the data collection phase",
        "Screen-time, GPA and PSQI, PSS-10, MAAS scale data to be analysed with multiple regression and mediation/moderation analysis, delivering an “Awareness Dashboard” prototype",
        "4-Person Team Project · Project Lead",
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
        tech: "Next.js · TypeScript · Three.js · GSAP · GitHub Pages",
        note: "Portfolio site presenting my background, projects and research through a scroll-driven 3D experience; statically exported and hosted on GitHub Pages, with the repository list fetched from the GitHub API at build time.",
        items: [],
        url: "https://github.com/tolguner/tolguner.github.io",
        urlLabel: "github.com/tolguner/tolguner.github.io",
      },
      {
        title: "Veterinary Management System",
        kind: "Project Coordinator · 2025",
        tech: "Spring Boot · React · MySQL · JWT",
        note: "Lets a veterinary clinic manage patient, appointment and treatment records in one system.",
        items: ["5-Person Team Project · Project Coordinator", "JWT-secured REST API and React interface"],
        url: "https://github.com/tolguner/Veterinary-Management-System",
        urlLabel: "github.com/tolguner/Veterinary-Management-System",
      },
      {
        title: "Quick-Gain Perception and Effort in Games of Chance: A Statistical Analysis and Modelling",
        kind: "Project Lead · 2025",
        tech: "Python · pandas · statsmodels · Jupyter",
        note: "Survey-based statistical study of how perceived quick gains relate to belief in effort.",
        items: ["Reliability, regression and mediation analysis on data from 153 participants", "4-Person Team Project · Project Lead"],
        url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
        urlLabel: "github.com/tolguner/Hizli-Kazanc-Algisi-Analizi",
      },
    ],
    skills: [
      { label: "Backend", items: "Spring Boot · REST APIs · JWT · Kafka" },
      { label: "Frontend", items: "React · Next.js · Tailwind CSS · JavaFX" },
      { label: "Data & analysis", items: "pandas · statsmodels · scikit-learn · Jupyter" },
      { label: "Languages", items: "Java · TypeScript · Python · SQL" },
      { label: "Databases", items: "PostgreSQL · MySQL · Prisma" },
      { label: "Tools", items: "Docker · Git & GitHub · Maven" },
    ],
    personal: ["Team leadership and coordination", "Event and organization management", "Communication and presentation", "Project planning"],
    education: { degree: "B.A. Management Information Systems", school: "Işık University, Istanbul", date: "2021 – 2026", meta: "GPA 3.43 / 4.00" },
    languages: ["Turkish — native", "English — upper-intermediate (B2)", "German — beginner (A1)"],
    footer: "Istanbul / Bursa, Türkiye",
    updated: "Last updated",
  },
};

export const links = {
  email: "tolgaolguner@gmail.com",
  github: "https://github.com/tolguner",
  linkedin: "https://www.linkedin.com/in/tolguner/",
};
