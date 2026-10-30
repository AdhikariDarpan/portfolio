export type ServiceOffer = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  fit: string[];
  deliverables: string[];
  tags: string[];
  accent: string;
};

export type TechnicalProof = {
  title: string;
  project: string;
  href: string;
  constraint: string;
  decision: string;
  result: string;
  proof: string[];
  accent: string;
};

export const SERVICE_OFFERS: ServiceOffer[] = [
  {
    slug: "ai-document-automation",
    number: "01",
    title: "AI and document automation",
    summary: "Turn documents, images, and audio into structured records your team can trust.",
    fit: [
      "Invoices, forms, and documents arrive as photos or PDFs.",
      "OCR output is almost right, but not reliable enough to automate.",
      "Manual review is slowing down the operation.",
    ],
    deliverables: [
      "Extraction API or batch pipeline",
      "Confidence scoring and review flags",
      "Deployment, documentation, and handover",
    ],
    tags: ["PaddleOCR", "EasyOCR", "YOLO", "Ollama", "WhisperX"],
    accent: "#b9a5ff",
  },
  {
    slug: "internal-web-platforms",
    number: "02",
    title: "Internal web platforms",
    summary: "Build the ERP, dashboard, or admin workspace your operation actually needs.",
    fit: [
      "Spreadsheets and manual steps are becoming the system.",
      "Different roles need different access and workflows.",
      "You need one source of truth across branches or teams.",
    ],
    deliverables: [
      "Schema, API, and permission design",
      "Role-based admin interface",
      "Deployment, documentation, and handover",
    ],
    tags: ["Laravel", "Django", "Flask", "React", "Go"],
    accent: "#c8ff5e",
  },
  {
    slug: "device-legacy-integrations",
    number: "03",
    title: "Device and legacy integrations",
    summary: "Connect EV chargers, attendance devices, printers, and local systems to software people can use.",
    fit: [
      "EV chargers or OCPP devices need a local control and monitoring layer.",
      "Attendance devices, printers, or local services need a web layer.",
      "Sync fails silently or creates duplicate records.",
    ],
    deliverables: [
      "OCPP charger integration with live session state",
      "Reliable sync and retry handling",
      "Status dashboard, exports, and structured failure states",
    ],
    tags: ["ZKTeco", "OCPP", "WebSockets", "Docker", "REST"],
    accent: "#22d3ee",
  },
  {
    slug: "cross-platform-products",
    number: "04",
    title: "Cross-platform products",
    summary: "Ship a focused product across mobile, desktop, web, or the command line.",
    fit: [
      "The product needs to work across multiple platforms.",
      "A browser utility or CLI would remove repeated work.",
      "You need a small tool with real distribution.",
    ],
    deliverables: [
      "Working product and packaging",
      "Release workflow and documentation",
      "Maintenance handover",
    ],
    tags: ["Flutter", "Electron", "Tauri", "Go", "Astro"],
    accent: "#ff9b6a",
  },
];

export const PROOF_CARDS: TechnicalProof[] = [
  {
    title: "OCR that fails safely",
    project: "Doc Extractor",
    href: "/projects/doc-extractor/",
    constraint: "Invoices vary, and raw OCR returns believable values that are often wrong.",
    decision:
      "PaddleOCR primary, EasyOCR fallback, five-stage preprocessing, spatial parsing, and confidence flags.",
    result:
      "Uncertain values go to review instead of being silently accepted, and the deterministic core runs without an LLM.",
    proof: ["2 OCR engines", "5 preprocessing stages", "No required LLM"],
    accent: "#b9a5ff",
  },
  {
    title: "Device sync that survives real hardware",
    project: "DRP Attendance Server",
    href: "/projects/drp-attendance-server/",
    constraint:
      "The system has to work with a local ZKTeco device, network timeouts, duplicate punches, and operators who need to trust the last sync.",
    decision:
      "Scheduled sync, uniqueness constraints, structured device errors, and live dashboard updates.",
    result:
      "Punches are ingested without duplicates, and the operator can see whether the device and scheduler are healthy.",
    proof: ["180-second sync", "Duplicate-safe writes", "Live dashboard"],
    accent: "#22d3ee",
  },
  {
    title: "API contracts that do not drift",
    project: "Sajilo Invoice",
    href: "/projects/sajilo-invoice/",
    constraint:
      "A multi-branch ERP needs a Go API, a React workspace, permissions, and a contract that stays honest as modules are added.",
    decision:
      "Handler, service, and repository layers; Swagger-to-TypeScript types; a shared JWT refresh queue; embedded migrations.",
    result:
      "Contract changes become reviewable diffs, and concurrent expired sessions share one refresh request instead of racing.",
    proof: ["Go and React", "2 database engines", "JWT authentication"],
    accent: "#ff9b6a",
  },
];

export const PROOF_STRIP = [
  "37 tests in CI",
  "100,000-row table demo",
  "6 image output formats",
  "0 runtime dependencies",
] as const;

export const PROCESS_STEPS = [
  {
    number: "01",
    title: "Understand the workflow",
    body: "We start with the real constraint: who uses the system, what happens today, and what breaks as it grows.",
  },
  {
    number: "02",
    title: "Scope the first milestone",
    body: "You get a written scope, sequence, and estimate before implementation starts, so the first release has a clear target.",
  },
  {
    number: "03",
    title: "Build with visible progress",
    body: "Working software is demoed regularly. Feedback happens while it is still cheap to change the system.",
  },
  {
    number: "04",
    title: "Deploy and hand over",
    body: "Deployment, documentation, and a clean handover are part of the build, not something added after launch.",
  },
] as const;

export const ENGAGEMENT_MODELS = [
  {
    title: "Project build",
    body: "Fixed-scope or milestone-based delivery for a defined system, module, or product.",
  },
  {
    title: "Audit or rescue",
    body: "A focused review of an existing platform, pipeline, or integration, followed by a practical fix plan.",
  },
  {
    title: "Ongoing support",
    body: "Continued development, maintenance, and operational improvements after the first release.",
  },
  {
    title: "Full-time role",
    body: "Open to full-time full-stack roles in Nepal or remote, with the same end-to-end ownership.",
  },
] as const;

export const SERVICE_FAQS = [
  {
    question: "What kinds of projects are a good fit?",
    answer:
      "Production web platforms, AI and document pipelines, device or hardware integrations, and focused cross-platform products. The common thread is a system that has to work outside a demo.",
  },
  {
    question: "Do you work with existing codebases?",
    answer:
      "Yes. I can review an existing platform, identify the constraint that is causing the most risk, and work within the current stack instead of replacing it for its own sake.",
  },
  {
    question: "How do you handle private or client work?",
    answer:
      "Private case studies document the architecture, scope, and engineering decisions without exposing client names, credentials, source code, or user data.",
  },
  {
    question: "Are you available for full-time roles?",
    answer:
      "Yes. I am open to full-time full-stack roles in Nepal or remote, alongside freelance projects and focused audits.",
  },
  {
    question: "How do we start?",
    answer:
      "Send a short brief through the contact page with what you are building, what is stuck, and the constraint that matters most. I reply within one business day.",
  },
  {
    question: "Do you work remotely?",
    answer:
      "Yes. I am based in Kathmandu, Nepal, and work remotely with teams across time zones. I am comfortable with async written communication and scheduled demos.",
  },
] as const;
