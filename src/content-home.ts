import type { Lang } from "@/content";

export type Stat = { value: number; suffix?: string; decimals?: number; label: string };
export type Stop = { year: string; period: string; title: string; text: string; tag: string; details?: string[] };
export type Card = { title: string; status: string; statusKind: "capstone" | "team" | "research" | "live"; period: string; text: string; tech: string[]; url: string };
export type Step = { n: string; title: string; text: string };

export type HomeDict = {
  nav: { about: string; journey: string; projects: string; research: string; contact: string; cv: string };
  hero: { kicker: string; line1: string; line2: string; sub: string; ctaProjects: string; ctaCv: string; scroll: string };
  stats: Stat[];
  about: { title: string; p1: string; p2: string; facts: { k: string; v: string }[]; badges: { k: string; v: string }[] };
  journey: { title: string; sub: string; rangeLabel: string; stops: Stop[] };
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
        { k: "Eğitim", v: "Işık Üniversitesi · YBS (2022–2026)" },
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
      rangeLabel: "Zaman aralığı",
      stops: [
        { year: "2021", period: "Eyl 2021 – Haz 2022", title: "İngilizce Hazırlık", text: "Işık Üniversitesi'nde bir yıl İngilizce hazırlık eğitimi.", tag: "Eğitim", details: ["EAQUALS akreditasyonlu program", "Akademik İngilizce ve sunum becerileri"] },
        { year: "2022", period: "Eylül 2022", title: "Yönetim Bilişim Sistemleri", text: "Bölüme başlangıç: yazılımı, veriyi ve iş süreçlerini birlikte ele alan bir program.", tag: "Eğitim", details: ["Java, veritabanı ve sistem analizi temelleri", "Genel not ortalaması 3,43 / 4"] },
        { year: "2024", period: "Oca 2024 – Haz 2026", title: "IT&MIS Kulübü Başkanı", text: "İki yıl boyunca kulübün yönetimi, etkinlik planlaması ve üye koordinasyonu.", tag: "Liderlik", details: ["Etkinlik ve söyleşi organizasyonu", "Yönetim kurulu ve üye koordinasyonu"] },
        { year: "2025", period: "May 2025 – Ağu 2026", title: "Kurumsal İletişim", text: "Çalışma burslu öğrenci olarak üniversitenin kurumsal organizasyonlarında görevli öğrenci ekibinin koordinasyonu.", tag: "Deneyim", details: ["Fuar, tören ve mezuniyet organizasyonları", "2025 ve 2026 Tercih ve Tanıtım Günleri — Tanıtım Ekibi"] },
        { year: "2025", period: "Eki 2025 – Tem 2026", title: "Unicourse", text: "Üniversite pazarlama temsilcisi: kampüste öğrenci topluluğuna yönelik pazarlama ve tanıtım.", tag: "Deneyim", details: ["Kampüs temsilciliği", "Öğrenci odaklı pazarlama faaliyetleri"] },
        { year: "2025", period: "2025", title: "Veteriner Yönetim Sistemi", text: "Beş kişilik ekipte proje koordinatörü; klinik operasyonları için Spring Boot REST API ve React arayüzü.", tag: "Ekip projesi", details: ["Spring Boot · React · MySQL · JWT", "Ekip koordinasyonu ve planlama"] },
        { year: "2025", period: "2025", title: "Veri bilimi projeleri", text: "Anket verisinde istatistiksel modelleme ve konut fiyatı tahmini üzerine iki dönem projesi.", tag: "Araştırma", details: ["Hızlı Kazanç Algısı — regresyon ve aracılık analizi, 44 sayfalık rapor", "İstanbul Konut Fiyat Tahmini — Random Forest"] },
        { year: "2026", period: "2026", title: "Işık CampusOS", text: "Bitirme projesi: kampüs yaşamını tek kimlik altında toplayan mikroservis platformu.", tag: "Bitirme", details: ["9 mikroservis · Spring Boot · React", "Kafka, API Gateway, Docker Compose"] },
        { year: "2026", period: "Nis 2026 – Haz 2026", title: "Işık Run Club", text: "Kulübün kuruluşunda kurucu yönetim kurulu üyesi olarak yer aldım.", tag: "Liderlik", details: ["Kuruluş süreci ve yönetim kurulu", "İlk etkinliklerin planlanması"] },
        { year: "2026", period: "2026 – devam ediyor", title: "TÜBİTAK 2209-A", text: "Dijital davranış ve akademik başarı üzerine 500 katılımcılı araştırmanın yürütücüsü.", tag: "Araştırma", details: ["Dört kişilik ekip · danışman Dr. Habibe Aktay", "Çoklu regresyon, aracılık/moderasyon analizi"] },
        { year: "2026", period: "2026", title: "Mezuniyet", text: "Dersler tamamlandı; staj dönemi ve sektöre geçiş.", tag: "Sırada" },
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
        { k: "Education", v: "Işık University · MIS (2022–2026)" },
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
      rangeLabel: "Timeline",
      stops: [
        { year: "2021", period: "Sep 2021 – Jun 2022", title: "English Preparatory Year", text: "One year of English preparation at Işık University.", tag: "Education", details: ["EAQUALS-accredited programme", "Academic English and presentation skills"] },
        { year: "2022", period: "September 2022", title: "Management Information Systems", text: "Started the degree: a programme that treats software, data and business processes together.", tag: "Education", details: ["Java, databases and systems analysis foundations", "GPA 3.43 / 4"] },
        { year: "2024", period: "Jan 2024 – Jun 2026", title: "IT&MIS Club President", text: "Two years of running the club: management, event planning and member coordination.", tag: "Leadership", details: ["Events and talks", "Board and member coordination"] },
        { year: "2025", period: "May 2025 – Aug 2026", title: "Corporate Communications", text: "Work-study student coordinating the student staff team at the university's corporate events.", tag: "Experience", details: ["Fairs, ceremonies and graduation", "2025 and 2026 Preference and Promotion Days — Promotion Team"] },
        { year: "2025", period: "Oct 2025 – Jul 2026", title: "Unicourse", text: "University marketing representative: on-campus marketing and outreach to the student community.", tag: "Experience", details: ["Campus representation", "Student-focused marketing"] },
        { year: "2025", period: "2025", title: "Veterinary Management System", text: "Project coordinator in a five-person team; Spring Boot REST API and React front end for clinic operations.", tag: "Team project", details: ["Spring Boot · React · MySQL · JWT", "Team coordination and planning"] },
        { year: "2025", period: "2025", title: "Data science projects", text: "Two term projects: statistical modelling on survey data and house-price prediction.", tag: "Research", details: ["Quick-gain perception — regression and mediation analysis, 44-page report", "Istanbul house prices — Random Forest"] },
        { year: "2026", period: "2026", title: "Işık CampusOS", text: "Capstone: a microservice platform bringing campus life under one identity.", tag: "Capstone", details: ["9 microservices · Spring Boot · React", "Kafka, API Gateway, Docker Compose"] },
        { year: "2026", period: "Apr 2026 – Jun 2026", title: "Işık Run Club", text: "Founding board member at the club's establishment.", tag: "Leadership", details: ["Founding process and board", "Planning the first events"] },
        { year: "2026", period: "2026 – ongoing", title: "TÜBİTAK 2209-A", text: "Leading a 500-participant study on digital behavior and academic achievement.", tag: "Research", details: ["Four-person team · advisor Dr. Habibe Aktay", "Multiple regression, mediation/moderation analysis"] },
        { year: "2026", period: "2026", title: "Graduation", text: "Coursework complete; internships and the move into industry.", tag: "Next" },
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
