export const SITE = {
  name: "Darpan Adhikari",
  shortName: "Darpan",
  title: "Full Stack Developer in Nepal | Darpan Adhikari",
  tagline: "Nepali full-stack software developer building production systems across web, AI, mobile, and desktop.",
  description:
    "Darpan Adhikari is a Nepali full-stack developer based in Kathmandu, Nepal building scalable web platforms, AI/OCR pipelines, mobile apps, desktop tools, ERP systems, and custom software solutions.",
  url: "https://www.darpanadhikari.com.np",
  email: "darpand263@gmail.com",
  location: "Kathmandu, Nepal",
  timezone: "Asia/Kathmandu",
  availability: "Open to full-time roles and freelance work",
  github: "https://github.com/DarpanAdhikari",
  linkedin: "https://www.linkedin.com/in/darpan-adhikari-81b866280/",
  x: "https://x.com/Darpan_3",
  npm: "https://www.npmjs.com/~darpan-adhikari",
  pubDev: "https://pub.dev/publishers/darpanadhikari.com.np/packages",
  portrait: "/images/professional-img.png",
  logo: "/images/drp-whiteback-logo.png",
  ogImage: "/images/og-default.png",
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects/", label: "Work" },
  { href: "/services/", label: "Services" },
  { href: "/about/", label: "About" },
  { href: "/experience/", label: "Experience" },
  { href: "/contact/", label: "Contact" },
] as const;

export const STATS = [
  { value: "5+", label: "years building" },
  { value: "37", label: "selected projects" },
  { value: "12", label: "AI projects" },
  { value: "4", label: "platforms" },
] as const;

export const SKILL_GROUPS = [
  {
    label: "Languages",
    items: ["Python", "PHP", "TypeScript", "JavaScript", "Go", "Dart", "Java", "C/C++", "C#/.NET"],
  },
  {
    label: "Backend",
    items: ["Laravel", "CodeIgniter", "Django", "Flask", "Node.js", "REST APIs", "SQLAlchemy", "OCPP"],
  },
  {
    label: "Frontend",
    items: ["React", "Astro", "Vue.js", "Tailwind CSS", "HTML/CSS", "Flutter", "Electron", "Tauri"],
  },
  {
    label: "AI & data",
    items: [
      "PaddleOCR",
      "EasyOCR",
      "YOLO",
      "OpenCV",
      "Ollama",
      "RAG",
      "WhisperX",
      "pyannote",
      "NLLB-200",
      "MySQL",
      "PostgreSQL",
    ],
  },
  {
    label: "Infrastructure",
    items: ["Docker", "GitHub Actions", "Linux", "Nginx", "Render", "Koyeb", "cPanel", "Git"],
  },
] as const;

export const EXPERIENCE = [
  {
    role: "Freelance Nepali Translator & AI Data Specialist",
    company: "Freelance / Independent",
    location: "Remote",
    period: "Sep 2026 - Present",
    summary:
      "Support AI/ML language projects as a remote freelancer, combining Nepali-English localization with AI training data preparation, dataset cleaning, and output review.",
    highlights: [
      "Localize Nepali and English content for AI training, evaluation, and client delivery workflows while preserving terminology, tone, and formatting.",
      "Clean, normalize, and structure multilingual datasets for model training, including duplicate removal, label checks, and consistency reviews.",
      "Review AI-generated Nepali and English outputs for fluency, factual fit, and cultural accuracy, then document corrections for client teams.",
      "Prepare AI training examples and annotation guidance that help maintain consistent quality across freelance batches.",
      "Balance remote freelance delivery with full-stack and open-source project work.",
    ],
    stack: ["Nepali", "English", "Localization", "AI Training", "Data Cleaning", "Dataset QA"],
    current: true,
  },
  {
    role: "Senior Full-Stack Developer",
    company: "Axis Software",
    location: "Kathmandu, Nepal · On-site",
    period: "Feb 2025 - Sep 2026",
    summary:
      "Owned production ERP systems and AI services across PHP, Python, and JavaScript, from architecture through deployment on shared hosting and a centralized local server.",
    highlights: [
      "Built OCR and reconciliation workflows that convert photographed billing documents into structured, validated records.",
      "Shipped a RAG support chatbot grounded in an internal knowledge base and served through Flask APIs.",
      "Built real-time device middleware and hardware-to-server integrations for production deployments.",
      "Led QR-generation APIs, device synchronization, and multi-format document exports.",
      "Worked directly with client stakeholders to turn operational workflows into scoped systems, demos, and production handover.",
      "Mentored junior developers and interns on code quality, architecture, and delivery.",
    ],
    stack: ["CodeIgniter", "Flask", "Python", "JavaScript", "MySQL", "AI/OCR", "Realtime Systems"],
    current: false,
  },
  {
    role: "Django Developer Intern",
    company: "Lunar I.T. Solution Pvt. Ltd.",
    location: "Remote",
    period: "Feb 2025 - May 2025",
    summary:
      "Built the Gym Management Platform as the core internship deliverable, covering subscriptions, attendance, fees, and payments.",
    highlights: [
      "Developed, tested, and deployed Django applications with a focus on responsiveness and performance.",
      "Designed databases, wrote complex SQL queries, and optimized query performance.",
      "Participated in code reviews, debugging, technical documentation, and cross-functional delivery.",
    ],
    stack: ["Django", "Python", "MySQL", "SQL"],
    current: false,
  },
  {
    role: "Freelance Full-Stack Laravel Developer",
    company: "Independent",
    location: "Remote",
    period: "Sep 2023 - Jan 2025",
    summary:
      "Delivered Laravel applications for education, media, and e-commerce clients, including school and college management systems, news portals, blogs, social platforms, live broadcasting, and real-time chat.",
    highlights: [
      "Built school and college management platforms with role-based access, attendance, fees, results, and administrative reporting.",
      "Shipped news portals and blog platforms with editorial publishing workflows, media handling, and SEO-friendly public pages.",
      "Integrated eSewa, Khalti, and Stripe payment flows for Nepali and international client projects.",
      "Built social platform features, real-time chat, and live broadcasting workflows with Pusher and WebSockets.",
      "Owned delivery end to end: database design, backend, interface, deployment, and post-launch fixes.",
    ],
    stack: ["Laravel", "PHP", "MySQL", "JavaScript", "Blade", "Pusher", "WebSockets", "eSewa/Khalti", "Stripe"],
    current: false,
  },
  {
    role: "Freelance Data Transcriber",
    company: "TransPerfect via DataForce",
    location: "Remote",
    period: "Mar 2022 - Apr 2022",
    summary:
      "Delivered remote transcription and Nepali language work under strict client quality and formatting guidelines.",
    highlights: [
      "Transcribed and formatted multilingual content with high accuracy.",
      "Worked primarily in MS Word and met time-sensitive delivery requirements.",
    ],
    stack: ["Transcription", "Nepali Typing", "MS Word"],
    current: false,
  },
] as const;

export const EDUCATION = [
  {
    degree: "BSc. Computer Science and Information Technology",
    school: "Banke Bageshwori Campus",
    location: "Nepalgunj, Nepal",
    period: "2020 - 2024",
  },
  {
    degree: "+2 Science",
    school: "Kalika Multiple Campus",
    location: "Pokhara, Nepal",
    period: "2018 - 2020",
  },
] as const;

export const LANGUAGES = [
  { name: "Nepali", level: "Native" },
  { name: "English", level: "Professional working proficiency" },
  { name: "Hindi", level: "Conversational" },
] as const;

export const PRINCIPLES = [
  {
    title: "Build for the real constraint",
    body: "Production often means shared hosting, no root access, slow networks, and hardware that was not designed to talk to your server. Architecture should respect that reality.",
  },
  {
    title: "Own the whole vertical",
    body: "I prefer projects where I can move between schema design, API behavior, interface details, deployment, and the awkward integration at the edge.",
  },
  {
    title: "Make AI useful, not decorative",
    body: "The value is in extraction accuracy, reconciliation, retrieval quality, and time saved. The model is only one part of the system around it.",
  },
  {
    title: "Leave systems understandable",
    body: "Clear naming, predictable structure, useful documentation, and sensible failure states matter more than clever code that only its author can maintain.",
  },
] as const;

export const PROJECT_CATEGORIES = [
  { id: "all", label: "All work" },
  { id: "ai", label: "AI & data" },
  { id: "web", label: "Web platforms" },
  { id: "product", label: "Product & tools" },
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "open-source", label: "Open source" },
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]["id"];

export const CATEGORY_LABELS: Record<Exclude<ProjectCategory, "all">, string> = {
  ai: "AI & data",
  web: "Web platform",
  product: "Product & tools",
  desktop: "Desktop",
  mobile: "Mobile",
  "open-source": "Open source",
};

export const STATUS_LABELS = {
  live: "Live",
  shipped: "Shipped",
  private: "Private case study",
  "in-progress": "In progress",
} as const;
