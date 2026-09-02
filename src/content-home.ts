import type { Lang } from "@/content";

export type Stat = { value: number; suffix?: string; decimals?: number; label: string };
export type Stop = { year: string; period: string; title: string; text: string; tag: string; details?: string[]; featured?: boolean };
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
        { year: "2021", period: "Eyl 2021 – Haz 2022", title: "Işık Üniversitesi'ne Giriş", text: "Bir yıl İngilizce hazırlık eğitimi okudum.", tag: "Eğitim", details: ["EAQUALS akreditasyonlu program", "Akademik İngilizce ve dil pratiği becerileri"] },
        { year: "2022", period: "Eylül 2022", title: "Bölüme Başlangıç", text: "Yönetim Bilişim Sistemleri bölümüne başladım; yazılımı, veriyi ve iş süreçlerini birlikte okuyan bir programda ilerledim.", tag: "Eğitim", details: ["Yazılım geliştirme, veritabanı ve sistem analizi", "İş süreçleri, proje yönetimi ve veri analizi"] },
        { year: "2024", period: "Oca 2024 – Haz 2026", title: "IT&MIS Kulübü Başkanı", text: "İki yıl boyunca kulübün başkanlığını yürüttüm; etkinlikleri planlayıp ekipleri koordine ettim. 2026'da Işık Run Club'ın kurucuları arasında yer aldım.", tag: "Liderlik", details: ["Söyleşi, zirve, hackathon ve kariyer fuarı", "Şirket gezileri ve mülakat simülasyonları", "Işık Run Club — kurucu üye: sportif ve sosyal alanda organizasyon"] },
        { year: "2025", period: "May 2025 – Ağu 2026", title: "Çalışma Burslu Öğrenci", text: "Üniversitenin Kurumsal İletişim Daire Başkanlığı'nda görev aldım; tanıtımdan organizasyona kadar birçok sürecin farklı aşamalarında sorumluluk üstlendim.", tag: "Deneyim", details: ["Kurumsal etkinlik, tören ve fuar organizasyonları", "Tercih ve Tanıtım Günleri'nde görevli öğrenci ekibinin koordinasyonu"] },
        { year: "2025", period: "Eki 2025 – Tem 2026", title: "Üniversite Temsilcisi", text: "Unicourse'un üniversite tarafındaki tanıtım ve pazarlama ekibinde yer aldım; firmanın ihtiyaç duyduğu eğitim materyallerinin organizasyonunu yürüttüm.", tag: "Deneyim", details: ["Kampüste tanıtım ve pazarlama faaliyetleri", "Eğitim materyallerinin hazırlanması ve organizasyonu"] },
        { year: "2025", period: "2025", title: "Yazılım Projeleri", text: "Masaüstünden web'e uzanan projelerle kendimi geliştirdim: JavaFX uygulamalarından Spring Boot ve React ile kurulan tam yığın sistemlere geçtim.", tag: "Geliştirme", details: ["Veteriner Yönetim Sistemi — beş kişilik ekipte proje koordinatörü", "Otel Yönetim Sistemi ve SelfWorkout — JavaFX + ilişkisel veritabanı", "REST API, JWT ile yetkilendirme, rol bazlı arayüzler"] },
        { year: "2025", period: "2025", title: "Veri Bilimi Projeleri", text: "Anket ve ilan verisi üzerinde iki dönem projesi yürüttüm; veriyi temizlemekten model kurmaya kadar süreci uçtan uca deneyimledim.", tag: "Araştırma", details: ["Şans oyunlarında hızlı kazanç algısı — güvenilirlik, regresyon ve aracılık analizi", "İstanbul konut fiyat tahmini — öznitelik mühendisliği ve Random Forest", "Python · pandas · statsmodels · scikit-learn"] },
        { year: "2026", period: "2026", title: "Alan Projeleri", text: "Farklı alanlarda da üretmek için blokzincir ve IoT tarafında projeler geliştirdim.", tag: "Keşif", details: ["EventChain — cüzdanla giriş, QR yoklama ve NFT katılım sertifikası", "SiteDAO — apartman yönetimini zincire taşıyan merkeziyetsiz uygulama", "GuardPi — Raspberry Pi üzerinde sensör ve kamerayı tek panelde toplayan güvenlik sistemi"] },
        { year: "2026", period: "2026 – devam ediyor", title: "TÜBİTAK 2209-A", text: "Hazırladığımız araştırma projesi TÜBİTAK tarafından kabul edildi ve 2209-A programı kapsamında hibe desteği almaya hak kazandı. Projenin yürütücüsüyüm.", tag: "Araştırma", details: ["Dijital davranışların akademik başarıya etkisi — 500 katılımcı", "Dört kişilik ekip · danışman Dr. Habibe Aktay", "Çoklu regresyon, aracılık ve moderasyon analizi"] },
        { year: "2026", period: "2026", title: "Işık CampusOS", text: "Bitirme projemde kampüs yaşamının dağınık süreçlerini tek kimlik altında toplayan mikroservis tabanlı bir platform kurdum.", tag: "Bitirme Projesi", featured: true, details: ["9 mikroservis · Spring Boot · React · PostgreSQL", "API Gateway'de merkezi JWT, Kafka ile olay güdümlü iletişim", "Docker Compose, Eureka servis keşfi, Zipkin ile izleme"] },
        { year: "2026", period: "2026", title: "Mezuniyet", text: "Ders yükümlülüklerimi tamamladım; staj sürecinin ardından öğrendiklerimi sektörde uygulamaya başlıyorum.", tag: "Sırada", details: ["Genel not ortalaması 3,43 / 4,00", "Yönetim Bilişim Sistemleri, Işık Üniversitesi"] },
      ],
    },
    projects: {
      title: "Projeler",
      sub: "Ders projelerinden bitirme projesine — her biri o dönemki seviyemi dürüstçe yansıtıyor.",
      cards: [
        { title: "Işık CampusOS", status: "Bitirme projesi", statusKind: "capstone", period: "2026", text: "Kampüs yaşamının dağınık süreçlerini tek kimlik altında topladım: kulüp ve etkinlikler, tesis rezervasyonu, yemek siparişi, paylaşımlı yolculuk. API Gateway'de merkezi JWT doğrulama kurdum, servisleri Kafka ile olay güdümlü hale getirdim, her servise kendi veritabanını verdim.", tech: ["Java", "Spring Boot", "React", "Kafka", "PostgreSQL", "Docker"], url: "https://github.com/tolguner/IsikCampusOS" },
        { title: "Veteriner Yönetim Sistemi", status: "Ekip projesi · koordinatör", statusKind: "team", period: "2025", text: "Bir veteriner kliniğinin hasta, randevu ve tedavi kayıtlarını tek sistemde yönetmesini sağlayan uygulamayı, beş kişilik ekipte proje koordinatörü olarak yürüttüm.", tech: ["Spring Boot", "React", "MySQL", "JWT"], url: "https://github.com/tolguner/Veterinary-Management-System" },
        { title: "Hızlı Kazanç Algısı ve Emek İlişkisi", status: "Veri bilimi", statusKind: "research", period: "2025", text: "Şans oyunlarında hızlı kazanç algısının emek inancıyla ilişkisini inceledim; 153 katılımcılı veride güvenilirlik, regresyon ve aracılık analizi yaptım.", tech: ["Python", "pandas", "statsmodels", "Jupyter"], url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi" },
        { title: "tolguner.me", status: "Canlı", statusKind: "live", period: "2026", text: "Bu site. Next.js, Three.js ve GSAP ile scroll'a bağlı bir deneyim kurdum; GitHub Pages üzerinde statik olarak yayınlanıyor.", tech: ["Next.js", "Three.js", "GSAP", "Tailwind"], url: "https://github.com/tolguner/tolguner.github.io" },
      ],
      othersTitle: "Diğer depolar",
      othersSub: "GitHub'daki diğer herkese açık çalışmalar",
    },
    research: {
      title: "Araştırma",
      kicker: "TÜBİTAK 2209-A · Proje Yürütücüsü",
      headline: "Ekran süresi, uyku, stres ve farkındalık akademik başarıyı nasıl etkiliyor?",
      text: "Üniversite öğrencilerinin dijital davranışlarının akademik başarı üzerindeki etkisini veri bilimi yaklaşımıyla inceliyorum. Proje TÜBİTAK tarafından kabul edildi ve 2209-A programı kapsamında hibe desteği alıyor. Dört kişilik ekibin yürütücüsüyüm; danışmanımız Dr. Habibe Aktay.",
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
        { year: "2021", period: "Sep 2021 – Jun 2022", title: "Starting at Işık University", text: "I spent a year in the English preparatory programme.", tag: "Education", details: ["EAQUALS-accredited programme", "Academic English and language practice"] },
        { year: "2022", period: "September 2022", title: "Starting the Degree", text: "I began Management Information Systems, a programme that reads software, data and business processes together.", tag: "Education", details: ["Software development, databases and systems analysis", "Business processes, project management and data analysis"] },
        { year: "2024", period: "Jan 2024 – Jun 2026", title: "IT&MIS Club President", text: "I ran the club for two years, planning events and coordinating teams. In 2026 I became one of the founders of Işık Run Club.", tag: "Leadership", details: ["Talks, summits, hackathons and career fairs", "Company visits and mock interviews", "Işık Run Club — founding member: organizing on the sports and social side"] },
        { year: "2025", period: "May 2025 – Aug 2026", title: "Work-Study Student", text: "I worked at the university's Corporate Communications Directorate, taking responsibility across many stages of promotion and organization.", tag: "Experience", details: ["Corporate events, ceremonies and fairs", "Coordinating the student staff team at Preference and Promotion Days"] },
        { year: "2025", period: "Oct 2025 – Jul 2026", title: "University Representative", text: "I worked on Unicourse's university-side promotion and marketing team and organized the training materials the company needed.", tag: "Experience", details: ["On-campus promotion and marketing", "Preparing and organizing training materials"] },
        { year: "2025", period: "2025", title: "Software Projects", text: "I grew through projects that ran from desktop to web: JavaFX applications first, then full-stack systems with Spring Boot and React.", tag: "Development", details: ["Veterinary Management System — project coordinator in a five-person team", "Hotel Management System and SelfWorkout — JavaFX + relational databases", "REST APIs, JWT authorization, role-based interfaces"] },
        { year: "2025", period: "2025", title: "Data Science Projects", text: "I ran two term projects on survey and listing data, going end to end from cleaning to modelling.", tag: "Research", details: ["Quick-gain perception in games of chance — reliability, regression and mediation analysis", "Istanbul house prices — feature engineering and Random Forest", "Python · pandas · statsmodels · scikit-learn"] },
        { year: "2026", period: "2026", title: "Exploratory Projects", text: "To build outside my usual stack, I developed projects in blockchain and IoT.", tag: "Exploration", details: ["EventChain — wallet login, QR check-in and NFT attendance certificates", "SiteDAO — decentralized building management moved on-chain", "GuardPi — Raspberry Pi security system with sensors and camera in one dashboard"] },
        { year: "2026", period: "2026 – ongoing", title: "TÜBİTAK 2209-A", text: "Our research proposal was accepted by TÜBİTAK and awarded a grant under the 2209-A programme. I lead the project.", tag: "Research", details: ["Effect of digital behavior on academic achievement — 500 participants", "Four-person team · advisor Dr. Habibe Aktay", "Multiple regression, mediation and moderation analysis"] },
        { year: "2026", period: "2026", title: "Işık CampusOS", text: "For my capstone I built a microservice platform that brings the scattered parts of campus life under a single identity.", tag: "Capstone", featured: true, details: ["9 microservices · Spring Boot · React · PostgreSQL", "Central JWT at the API gateway, event-driven communication over Kafka", "Docker Compose, Eureka service discovery, Zipkin tracing"] },
        { year: "2026", period: "2026", title: "Graduation", text: "I completed my coursework; after the internship period I start applying what I learned in industry.", tag: "Next", details: ["GPA 3.43 / 4.00", "Management Information Systems, Işık University"] },
      ],
    },
    projects: {
      title: "Projects",
      sub: "From course work to capstone — each one honestly reflects where I was at the time.",
      cards: [
        { title: "Işık CampusOS", status: "Capstone", statusKind: "capstone", period: "2026", text: "I brought the scattered parts of campus life under one identity: clubs and events, facility booking, food ordering, ride sharing. I set up central JWT validation at the API gateway, made services event-driven over Kafka and gave each service its own database.", tech: ["Java", "Spring Boot", "React", "Kafka", "PostgreSQL", "Docker"], url: "https://github.com/tolguner/IsikCampusOS" },
        { title: "Veterinary Management System", status: "Team · coordinator", statusKind: "team", period: "2025", text: "I led the application that lets a veterinary clinic manage patient, appointment and treatment records in one system, as project coordinator in a five-person team.", tech: ["Spring Boot", "React", "MySQL", "JWT"], url: "https://github.com/tolguner/Veterinary-Management-System" },
        { title: "Quick-Gain Perception and Effort", status: "Data science", statusKind: "research", period: "2025", text: "I examined how perceived quick gains in games of chance relate to belief in effort, running reliability, regression and mediation analysis on data from 153 participants.", tech: ["Python", "pandas", "statsmodels", "Jupyter"], url: "https://github.com/tolguner/Hizli-Kazanc-Algisi-Analizi" },
        { title: "tolguner.me", status: "Live", statusKind: "live", period: "2026", text: "This site. I built a scroll-driven experience with Next.js, Three.js and GSAP; it is hosted statically on GitHub Pages.", tech: ["Next.js", "Three.js", "GSAP", "Tailwind"], url: "https://github.com/tolguner/tolguner.github.io" },
      ],
      othersTitle: "Other repositories",
      othersSub: "More public work on GitHub",
    },
    research: {
      title: "Research",
      kicker: "TÜBİTAK 2209-A · Project Lead",
      headline: "How do screen time, sleep, stress and awareness shape academic achievement?",
      text: "I examine the effect of university students' digital behaviors on academic achievement through a data science approach. The project was accepted by TÜBİTAK and receives a grant under the 2209-A programme. I lead the four-person team; our advisor is Dr. Habibe Aktay.",
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
