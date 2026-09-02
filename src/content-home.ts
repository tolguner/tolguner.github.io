import type { Lang } from "@/content";

export type Stat = { value: number; suffix?: string; decimals?: number; label: string };
export type Stop = { year: string; title: string; text: string; tag: string };
export type Card = { title: string; status: string; statusKind: "capstone" | "team" | "research" | "live"; period: string; text: string; tech: string[]; url: string };
export type Step = { n: string; title: string; text: string };

export type HomeDict = {
  nav: { about: string; journey: string; projects: string; research: string; contact: string; cv: string };
  hero: { kicker: string; line1: string; line2: string; sub: string; ctaProjects: string; ctaCv: string; scroll: string };
  stats: Stat[];
  about: { title: string; p1: string; p2: string; facts: { k: string; v: string }[]; badges: { k: string; v: string }[] };
  journey: { title: string; sub: string; stops: Stop[] };
  projects: { title: string; sub: string; cards: Card[]; othersTitle: string; othersSub: string };
  research: { title: string; kicker: string; headline: string; text: string; big: { value: number; label: string }; steps: Step[]; org: string };
  skills: { title: string; tech: string[]; human: string[]; techLabel: string; humanLabel: string };
  contact: { title: string; text: string; email: string; cv: string };
  footer: { rights: string; built: string };
};

export const home: Record<Lang, HomeDict> = {
  tr: {
    nav: { about: "Hakkımda", journey: "Yolculuk", projects: "Projeler", research: "Araştırma", contact: "İletişim", cv: "CV" },
    hero: {
      kicker: "Yönetim Bilişim Sistemleri · Işık Üniversitesi",
      line1: "Teknik bilgiyi insanlarla",
      line2: "buluşturan sistemler kuruyorum.",
      sub: "Spring Boot ve React ile web uygulamaları geliştiriyorum; TÜBİTAK 2209-A destekli bir araştırma projesini yürütüyorum. Kulüp başkanlığı ve kurumsal etkinlik organizasyonu bana kodun dışında da bir şey öğretti: insanları aynı hedefte tutmak.",
      ctaProjects: "Projelere bak",
      ctaCv: "CV'yi aç",
      scroll: "Aşağı kaydır",
    },
    stats: [
      { value: 3.43, decimals: 2, label: "Genel not ortalaması / 4" },
      { value: 2, suffix: "+", label: "Yıl kulüp başkanlığı" },
      { value: 500, label: "Katılımcılı TÜBİTAK araştırması" },
      { value: 9, label: "Herkese açık GitHub deposu" },
    ],
    about: {
      title: "Hakkımda",
      p1: "Işık Üniversitesi Yönetim Bilişim Sistemleri son sınıf öğrencisiyim. Bitirme projemde dokuz mikroservisli bir kampüs platformu kurdum; ekip projelerinde koordinasyonu üstlendim; iki yıl IT&MIS Kulübü'nü yönettim.",
      p2: "Kurumsal İletişim'de fuar, tören ve mezuniyet organizasyonlarında görevli öğrenci ekibini koordine ettim. Bugün TÜBİTAK 2209-A destekli bir araştırma projesinin yürütücüsüyüm. Kod yazmayı ve insanlarla çalışmayı ayrı işler olarak görmüyorum.",
      facts: [
        { k: "Odak", v: "Spring Boot · React · veri bilimi" },
        { k: "Şu an", v: "TÜBİTAK 2209-A projesi ve staj dönemi" },
        { k: "Konum", v: "İstanbul / Bursa" },
        { k: "Diller", v: "Türkçe · İngilizce (B2) · Almanca (A1)" },
      ],
      badges: [
        { k: "TÜBİTAK 2209-A", v: "Proje Yürütücüsü" },
        { k: "IT&MIS Kulübü", v: "Başkan · 2024–2026" },
      ],
    },
    journey: {
      title: "Yolculuk",
      sub: "2021'den bugüne — kaydırarak ilerle",
      stops: [
        { year: "2021", title: "Işık Üniversitesi", text: "Yönetim Bilişim Sistemleri'ne giriş; bir yıl İngilizce hazırlık.", tag: "Eğitim" },
        { year: "2024", title: "IT&MIS Kulübü Başkanı", text: "İki yıl boyunca kulübün yönetimi, etkinlik planlaması ve üye koordinasyonu.", tag: "Liderlik" },
        { year: "2025", title: "Kurumsal İletişim", text: "Çalışma burslu öğrenci: fuar, tören, mezuniyet ve tanıtım günlerinde görevli ekibin koordinasyonu.", tag: "Deneyim" },
        { year: "2025", title: "Veteriner Yönetim Sistemi", text: "Beş kişilik ekipte proje koordinatörü; Spring Boot REST API ve React arayüzü.", tag: "Ekip projesi" },
        { year: "2025", title: "Veri bilimi", text: "153 katılımcılı anket verisinde regresyon ve aracılık analizi; 44 sayfalık rapor.", tag: "Araştırma" },
        { year: "2026", title: "Işık CampusOS", text: "Dokuz mikroservis, Kafka, API Gateway — bitirme projesi.", tag: "Bitirme" },
        { year: "2026", title: "TÜBİTAK 2209-A", text: "Dijital davranış ve akademik başarı üzerine 500 katılımcılı araştırmanın yürütücüsü.", tag: "Araştırma" },
        { year: "2026", title: "Mezuniyet", text: "Dersler tamamlandı; staj dönemi ve sektöre geçiş.", tag: "Sırada" },
      ],
    },
    projects: {
      title: "Projeler",
      sub: "Ders projelerinden bitirme projesine — her biri o dönemki seviyemi dürüstçe yansıtıyor.",
      cards: [
        { title: "Işık CampusOS", status: "Bitirme projesi", statusKind: "capstone", period: "2026", text: "Kulüp ve etkinlikler, tesis rezervasyonu, yemek siparişi ve paylaşımlı yolculuğu tek kimlik altında toplayan mikroservis tabanlı kampüs platformu. API Gateway'de merkezi JWT, Kafka ile olay güdümlü servisler, servis başına veritabanı.", tech: ["Java", "Spring Boot", "React", "Kafka", "PostgreSQL", "Docker"], url: "https://github.com/tolguner/IsikCampusOS" },
        { title: "Veteriner Yönetim Sistemi", status: "Ekip projesi · koordinatör", statusKind: "team", period: "2025", text: "Bir veteriner kliniğinin hasta, randevu ve tedavi kayıtlarını tek sistemde yönetmesini sağlar. Beş kişilik ekipte proje koordinatörü.", tech: ["Spring Boot", "React", "MySQL", "JWT"], url: "https://github.com/tolguner/Veterinary-Management-System" },
        { title: "Hızlı Kazanç Algısı ve Emek İlişkisi", status: "Veri bilimi", statusKind: "research", period: "2025", text: "Şans oyunlarında hızlı kazanç algısının emek inancıyla ilişkisi: 153 katılımcılı veride güvenilirlik, regresyon ve aracılık analizi.", tech: ["Python", "pandas", "statsmodels", "Jupyter"], url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi" },
        { title: "tolguner.me", status: "Canlı", statusKind: "live", period: "2026", text: "Bu site. Next.js, Three.js ve GSAP ile scroll'a bağlı bir deneyim; GitHub Pages'te statik yayın.", tech: ["Next.js", "Three.js", "GSAP", "Tailwind"], url: "https://github.com/tolguner/tolguner.github.io" },
      ],
      othersTitle: "Diğer depolar",
      othersSub: "GitHub'daki diğer herkese açık çalışmalar",
    },
    research: {
      title: "Araştırma",
      kicker: "TÜBİTAK 2209-A · Proje Yürütücüsü",
      headline: "Ekran süresi, uyku, stres ve farkındalık akademik başarıyı nasıl etkiliyor?",
      text: "Üniversite öğrencilerinin dijital davranışlarının akademik başarı üzerindeki etkisini veri bilimi yaklaşımıyla inceleyen, TÜBİTAK 2209-A programınca desteklenen araştırma. Dört kişilik ekip, danışman Dr. Habibe Aktay.",
      big: { value: 500, label: "katılımcı" },
      steps: [
        { n: "01", title: "Ölçüm", text: "PSQI, PSS-10 ve MAAS ölçekleri, cihaz ekran süresi raporları ve not ortalaması." },
        { n: "02", title: "Model", text: "Uyku ve stres aracı, farkındalık düzenleyici değişken; sekiz hipotez." },
        { n: "03", title: "Analiz", text: "Çoklu regresyon ve aracılık/moderasyon analizi." },
        { n: "04", title: "Çıktı", text: "Öğrencilerin kendi dijital alışkanlıklarını izlediği “Farkındalık Gösterge Paneli” prototipi." },
      ],
      org: "Başvuru No 1919B012534181 · 2026 – devam ediyor",
    },
    skills: {
      title: "Yetkinlikler",
      techLabel: "Teknik",
      humanLabel: "İnsan",
      tech: ["Java", "Spring Boot", "React", "Next.js", "TypeScript", "PostgreSQL", "MySQL", "Python", "pandas", "Docker", "Git"],
      human: ["Ekip liderliği", "Etkinlik organizasyonu", "Koordinasyon", "Sunum", "Proje planlama", "İletişim"],
    },
    contact: {
      title: "Birlikte çalışalım.",
      text: "Staj, iş ve iş birliği fırsatları için bir e-posta yeter.",
      email: "E-posta gönder",
      cv: "CV'yi görüntüle",
    },
    footer: { rights: "Tolga Olguner", built: "Next.js · Three.js · GSAP ile yapıldı" },
  },
  en: {
    nav: { about: "About", journey: "Journey", projects: "Projects", research: "Research", contact: "Contact", cv: "CV" },
    hero: {
      kicker: "Management Information Systems · Işık University",
      line1: "I build systems that bring",
      line2: "technology and people together.",
      sub: "I develop web applications with Spring Boot and React and lead a TÜBİTAK 2209-A funded research project. Running a student club and organizing corporate events taught me something beyond code: keeping people aligned on one goal.",
      ctaProjects: "See projects",
      ctaCv: "Open CV",
      scroll: "Scroll",
    },
    stats: [
      { value: 3.43, decimals: 2, label: "GPA / 4" },
      { value: 2, suffix: "+", label: "Years as club president" },
      { value: 500, label: "Participants in TÜBİTAK research" },
      { value: 9, label: "Public GitHub repositories" },
    ],
    about: {
      title: "About",
      p1: "Final-year Management Information Systems student at Işık University. For my capstone I built a nine-microservice campus platform; I coordinated team projects; I ran the IT&MIS Club for two years.",
      p2: "At Corporate Communications I coordinated the student staff team at fairs, ceremonies and graduation. Today I lead a TÜBİTAK 2209-A funded research project. I don't treat writing code and working with people as separate jobs.",
      facts: [
        { k: "Focus", v: "Spring Boot · React · data science" },
        { k: "Now", v: "TÜBİTAK 2209-A project and internships" },
        { k: "Location", v: "Istanbul / Bursa, Türkiye" },
        { k: "Languages", v: "Turkish · English (B2) · German (A1)" },
      ],
      badges: [
        { k: "TÜBİTAK 2209-A", v: "Project Lead" },
        { k: "IT&MIS Club", v: "President · 2024–2026" },
      ],
    },
    journey: {
      title: "Journey",
      sub: "2021 to today — scroll to move",
      stops: [
        { year: "2021", title: "Işık University", text: "Started Management Information Systems; one year of English prep.", tag: "Education" },
        { year: "2024", title: "IT&MIS Club President", text: "Two years of running the club: management, event planning, member coordination.", tag: "Leadership" },
        { year: "2025", title: "Corporate Communications", text: "Work-study student coordinating the staff team at fairs, ceremonies, graduation and promotion days.", tag: "Experience" },
        { year: "2025", title: "Veterinary Management System", text: "Project coordinator in a five-person team; Spring Boot REST API and React front end.", tag: "Team project" },
        { year: "2025", title: "Data science", text: "Regression and mediation analysis on survey data from 153 participants; 44-page report.", tag: "Research" },
        { year: "2026", title: "Işık CampusOS", text: "Nine microservices, Kafka, API Gateway — the capstone project.", tag: "Capstone" },
        { year: "2026", title: "TÜBİTAK 2209-A", text: "Leading a 500-participant study on digital behavior and academic achievement.", tag: "Research" },
        { year: "2026", title: "Graduation", text: "Coursework complete; internships and the move into industry.", tag: "Next" },
      ],
    },
    projects: {
      title: "Projects",
      sub: "From course work to capstone — each one honestly reflects where I was at the time.",
      cards: [
        { title: "Işık CampusOS", status: "Capstone", statusKind: "capstone", period: "2026", text: "Microservice-based campus platform unifying clubs and events, facility booking, food ordering and ride sharing under one identity. Central JWT at the API gateway, event-driven services over Kafka, database per service.", tech: ["Java", "Spring Boot", "React", "Kafka", "PostgreSQL", "Docker"], url: "https://github.com/tolguner/IsikCampusOS" },
        { title: "Veterinary Management System", status: "Team · coordinator", statusKind: "team", period: "2025", text: "Lets a veterinary clinic manage patient, appointment and treatment records in one system. Project coordinator in a five-person team.", tech: ["Spring Boot", "React", "MySQL", "JWT"], url: "https://github.com/tolguner/Veterinary-Management-System" },
        { title: "Quick-Gain Perception and Effort", status: "Data science", statusKind: "research", period: "2025", text: "How perceived quick gains in games of chance relate to belief in effort: reliability, regression and mediation analysis on 153 participants.", tech: ["Python", "pandas", "statsmodels", "Jupyter"], url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi" },
        { title: "tolguner.me", status: "Live", statusKind: "live", period: "2026", text: "This site. A scroll-driven experience built with Next.js, Three.js and GSAP; statically hosted on GitHub Pages.", tech: ["Next.js", "Three.js", "GSAP", "Tailwind"], url: "https://github.com/tolguner/tolguner.github.io" },
      ],
      othersTitle: "Other repositories",
      othersSub: "More public work on GitHub",
    },
    research: {
      title: "Research",
      kicker: "TÜBİTAK 2209-A · Project Lead",
      headline: "How do screen time, sleep, stress and awareness shape academic achievement?",
      text: "A TÜBİTAK 2209-A funded study examining the effect of university students' digital behaviors on academic achievement through a data science approach. Four-person team, advisor Dr. Habibe Aktay.",
      big: { value: 500, label: "participants" },
      steps: [
        { n: "01", title: "Measure", text: "PSQI, PSS-10 and MAAS scales, device screen-time reports and GPA." },
        { n: "02", title: "Model", text: "Sleep and stress as mediators, awareness as moderator; eight hypotheses." },
        { n: "03", title: "Analyse", text: "Multiple regression and mediation/moderation analysis." },
        { n: "04", title: "Deliver", text: "An “Awareness Dashboard” prototype where students track their own digital habits." },
      ],
      org: "Application No 1919B012534181 · 2026 – ongoing",
    },
    skills: {
      title: "Skills",
      techLabel: "Technical",
      humanLabel: "Human",
      tech: ["Java", "Spring Boot", "React", "Next.js", "TypeScript", "PostgreSQL", "MySQL", "Python", "pandas", "Docker", "Git"],
      human: ["Team leadership", "Event organization", "Coordination", "Presentation", "Project planning", "Communication"],
    },
    contact: {
      title: "Let's work together.",
      text: "For internships, roles and collaborations, one email is enough.",
      email: "Send an email",
      cv: "View CV",
    },
    footer: { rights: "Tolga Olguner", built: "Built with Next.js · Three.js · GSAP" },
  },
};
