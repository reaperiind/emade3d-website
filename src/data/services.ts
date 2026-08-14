import type { LocalizedText } from "@/lib/localize";

export type ServiceIconKey =
  | "conception"
  | "impression"
  | "fabrication"
  | "prototypage"
  | "outillage"
  | "moules";

/**
 * Main services. To add a new service later:
 *   1. add an entry here (icon, title, description, points, optionally `available: false`)
 *   2. the Services page and the home services grid render it automatically.
 *
 * Fields use the { fr, en, ar } localized shape so new languages only need a
 * translation of this file.
 */
export type Service = {
  id: string;
  icon: ServiceIconKey;
  title: LocalizedText;
  short: LocalizedText;
  description: LocalizedText;
  process: LocalizedText;
  points: LocalizedText[];
  available?: boolean;
};

export const services: Service[] = [
  {
    id: "conception-3d",
    icon: "conception",
    title: { fr: "Conception 3D", en: "3D Design", ar: "تصميم ثلاثي الأبعاد" },
    short: {
      fr: "Modélisation 3D et conception mécanique à partir d'une idée, d'un croquis, d'un plan ou d'une pièce existante.",
      en: "3D modeling and mechanical design from an idea, a sketch, a drawing or an existing part.",
      ar: "نمذجة ثلاثية الأبعاد وتصميم ميكانيكي انطلاقاً من فكرة أو رسم أولي أو مخطط أو قطعة موجودة.",
    },
    description: {
      fr: "Nos ingénieurs conçoivent des pièces et des assemblages en CAO 3D, pensés pour l'impression 3D ou pour la fabrication classique. Nous partons de votre besoin — croquis, plan, image, fichier ou simple description — et nous livrons des fichiers 3D proprement modélisés, corrigés et prêts pour la fabrication.",
      en: "Our engineers design parts and assemblies in 3D CAD, engineered for 3D printing or traditional manufacturing. We start from your need — sketch, drawing, image, file or simple description — and deliver clean, corrected, production-ready 3D files.",
      ar: "يصمّم مهندسونا القطع والتجميعات باستخدام التصميم بمساعدة الحاسوب ثلاثي الأبعاد، معدّة للطباعة أو للتصنيع التقليدي. ننطلق من حاجتكم — رسم أولي، مخطط، صورة، ملف أو مجرد وصف — ونُسلّم ملفات ثلاثية الأبعاد نظيفة ومصحّحة وجاهزة للتصنيع.",
    },
    process: {
      fr: "Analyse du besoin → esquisse CAO → modélisation → vérification → fichiers d'usine.",
      en: "Needs analysis → CAD sketch → modeling → verification → production files.",
      ar: "تحليل الحاجة → رسم أولي بالحاسوب → نمذجة → تحقق → ملفات التصنيع.",
    },
    points: [
      { fr: "Conception mécanique et CAO 3D", en: "Mechanical design and 3D CAD", ar: "تصميم ميكانيكي وتصميم بمساعدة الحاسوب" },
      { fr: "Rétro-conception à partir d'une pièce existante", en: "Reverse engineering from an existing part", ar: "إعادة تصميم انطلاقاً من قطعة موجودة" },
      { fr: "Optimisation pour la fabrication (DFM)", en: "Design for manufacturing optimization (DFM)", ar: "تحسين التصميم بما يخدم التصنيع (DFM)" },
      { fr: "Analyse et correction de fichiers 3D", en: "3D file analysis and repair", ar: "تحليل وإصلاح الملفات ثلاثية الأبعاد" },
      { fr: "Livraison en formats STL, STEP, IGES", en: "Delivery in STL, STEP, IGES formats", ar: "تسليم بصيغ STL وSTEP وIGES" },
    ],
  },
  {
    id: "impression-3d",
    icon: "impression",
    title: { fr: "Impression 3D", en: "3D Printing", ar: "طباعة ثلاثية الأبعاد" },
    short: {
      fr: "FDM et impression résine pour prototypes rapides, pièces fonctionnelles et petites séries.",
      en: "FDM and resin printing for rapid prototypes, functional parts and small series.",
      ar: "طباعة FDM وطباعة الراتنج للنماذج الأولية السريعة والقطع الوظيفية والكميات الصغيرة.",
    },
    description: {
      fr: "Nous produisons des pièces par impression 3D FDM et résine, du prototype d'essai à la petite série fonctionnelle. Chaque pièce est orientée et paramétrée pour optimiser la résistance, la précision et la finition, avec un contrôle dimensionnel avant expédition.",
      en: "We manufacture parts with FDM and resin 3D printing, from test prototypes to functional small series. Every part is oriented and tuned for strength, precision and finish, with dimensional control before shipping.",
      ar: "نصنع القطع بتقنيات FDM والرتينج، من النماذج الأولية للاختبار إلى الكميات الصغيرة الوظيفية. نتحكم في اتجاه كل قطعة ومعاييرها لتحقيق أفضل مقاومة ودقة وجودة سطح، مع فحص أبعاد قبل الشحن.",
    },
    process: {
      fr: "Fichier 3D → préparation d'impression → impression → post-traitement → contrôle.",
      en: "3D file → print preparation → printing → post-processing → control.",
      ar: "ملف ثلاثي الأبعاد → تجهيز الطباعة → الطباعة → المعالجة اللاحقة → الفحص.",
    },
    points: [
      { fr: "FDM : PLA, PETG, ABS, PC, composites", en: "FDM: PLA, PETG, ABS, PC, composites", ar: "FDM: PLA، PETG، ABS، PC، مواد مركبة" },
      { fr: "Impression résine haute précision", en: "High-precision resin printing", ar: "طباعة راتنج عالية الدقة" },
      { fr: "Prototypage rapide en 24-48 h", en: "Rapid prototyping in 24-48 h", ar: "نمذجة أولية سريعة خلال 24-48 ساعة" },
      { fr: "Pièces fonctionnelles et petites séries", en: "Functional parts and small series", ar: "قطع وظيفية وكميات صغيرة" },
      { fr: "Finition : ponçage, peinture, inserts", en: "Finish: sanding, painting, inserts", ar: "تشطيب: صنفرة، طلاء، مدخلات" },
    ],
  },
  {
    id: "fabrication",
    icon: "fabrication",
    title: { fr: "Fabrication", en: "Manufacturing", ar: "التصنيع" },
    short: {
      fr: "Fabrication de pièces plastiques sur mesure, selon la technologie la plus adaptée à chaque projet.",
      en: "Custom plastic parts manufacturing, using the technology best suited to each project.",
      ar: "تصنيع قطع بلاستيكية حسب الطلب، بالتقنية الأنسب لكل مشروع.",
    },
    description: {
      fr: "Qu'il s'agisse d'une seule pièce, d'une poignée de prototypes ou d'une petite série, nous fabriquons des pièces plastiques fonctionnelles et durables. Le procédé est choisi en fonction de la géométrie, du matériau requis et du volume : impression, usinage, moulage ou assemblage sur mesure.",
      en: "Whether it is a single part, a handful of prototypes or a small run, we manufacture functional, durable plastic parts. The process is selected by geometry, required material and volume: printing, machining, molding or custom assembly.",
      ar: "سواء كانت قطعة واحدة أو بضع نماذج أولية أو كمية صغيرة، نصنع قطعاً بلاستيكية وظيفية ومتينة. نختار التقنية حسب الهندسة والمادة المطلوبة والكمية: طباعة أو تشغيل أو قولبة أو تجميع مخصص.",
    },
    process: {
      fr: "Étude technique → choix du procédé → fabrication → contrôle → livraison.",
      en: "Technical study → process selection → manufacturing → control → delivery.",
      ar: "دراسة تقنية → اختيار التقنية → التصنيع → الفحص → التسليم.",
    },
    points: [
      { fr: "Pièces sur mesure, à l'unité ou en série", en: "Custom parts, single or series", ar: "قطع حسب الطلب، منفردة أو بكميات" },
      { fr: "Tolérances serrées et reproductibilité", en: "Tight tolerances and repeatability", ar: "تفاوتات ضيقة وقابلية تكرار" },
      { fr: "Usinage pour les pièces techniques", en: "Machining for technical parts", ar: "تشغيل للقطع التقنية" },
      { fr: "Contrôle qualité avant livraison", en: "Quality control before delivery", ar: "مراقبة الجودة قبل التسليم" },
    ],
  },
  {
    id: "prototypage",
    icon: "prototypage",
    title: { fr: "Prototypage", en: "Prototyping", ar: "النمذجة الأولية" },
    short: {
      fr: "Transformer une idée en prototype tangible, testable et itérable avant la mise en production.",
      en: "Turning an idea into a tangible, testable, iterable prototype before production.",
      ar: "تحويل الفكرة إلى نموذج أولي ملموس قابل للاختبار والتطوير قبل الانتقال إلى الإنتاج.",
    },
    description: {
      fr: "Le prototype est l'étape qui valide une idée. Nous produisons des modèles d'aspect, des maquettes fonctionnelles et des prototypes techniques que vous pouvez tenir, tester, corriger — avant d'engager un outillage ou une série.",
      en: "The prototype is the step that validates an idea. We produce look-models, functional mockups and technical prototypes you can hold, test and correct — before committing to tooling or a production run.",
      ar: "النموذج الأولي هو الخطوة التي تتحقق من صحة الفكرة. ننتج نماذج شكلية ومجسمات وظيفية ونماذج أولية تقنية يمكنكم مسكها واختبارها وتصحيحها — قبل الالتزام بتصنيع أدوات أو سلسلة إنتاج.",
    },
    process: {
      fr: "CAO → choix du matériau → fabrication du prototype → tests → itération.",
      en: "CAD → material selection → prototype build → testing → iteration.",
      ar: "تصميم → اختيار المادة → صناعة النموذج → اختبار → تكرار.",
    },
    points: [
      { fr: "Du concept au premier prototype", en: "From concept to first prototype", ar: "من المفهوم إلى أول نموذج أولي" },
      { fr: "Tests fonctionnels et itérations rapides", en: "Functional tests and fast iterations", ar: "اختبارات وظيفية وتكرارات سريعة" },
      { fr: "Modèles d'aspect et de présentation", en: "Appearance and presentation models", ar: "نماذج شكلية وعرضية" },
      { fr: "Pré-série de validation", en: "Validation pre-series", ar: "دفعة تجريبية للمصادقة" },
    ],
  },
  {
    id: "outillage",
    icon: "outillage",
    title: { fr: "Outillage", en: "Tooling", ar: "أدوات التصنيع" },
    short: {
      fr: "Conception et fabrication d'outils, gabarits et dispositifs d'aide à la production.",
      en: "Design and manufacture of tools, jigs and production aids.",
      ar: "تصميم وتصنيع أدوات وقوالب (جيج) ومساعدات الإنتاج.",
    },
    description: {
      fr: "Un bon outillage fait gagner du temps et de la précision. Nous concevons et fabriquons des gabarits, des montages, des cales et des dispositifs sur mesure qui fiabilisent l'assemblage, le contrôle et la répétabilité de vos productions.",
      en: "Good tooling saves time and improves precision. We design and manufacture jigs, fixtures, gauges and custom devices that make your assembly, inspection and production repeatable.",
      ar: "الأداة الجيدة توفّر الوقت وترفع الدقة. نصمّم ونصنّع قوالب التثبيت وضوابط القياس والمساعدات المخصصة التي تضمن موثوقية التجميع والفحص وتكرارية الإنتاج.",
    },
    process: {
      fr: "Analyse du process → conception de l'outil → fabrication → essai sur poste.",
      en: "Process analysis → tool design → tooling build → on-line trial.",
      ar: "تحليل العملية → تصميم الأداة → تصنيعها → اختبار على خط الإنتاج.",
    },
    points: [
      { fr: "Gabarits et montages d'assemblage", en: "Assembly jigs and fixtures", ar: "قوالب تجميع وتثبيت" },
      { fr: "Outils de contrôle dimensionnel", en: "Dimensional inspection tools", ar: "أدوات قياس أبعاد" },
      { fr: "Dispositifs d'aide à la production", en: "Production assist devices", ar: "مساعدات الإنتاج" },
      { fr: "Séries courtes d'outillage", en: "Short tooling runs", ar: "دفعات أدوات قصيرة" },
    ],
  },
  {
    id: "moules",
    icon: "moules",
    title: { fr: "Moules", en: "Molds", ar: "القوالب" },
    short: {
      fr: "Conception et fabrication de moules plastiques pour petites et moyennes séries.",
      en: "Design and manufacture of plastic molds for small and medium series.",
      ar: "تصميم وتصنيع قوالب بلاستيكية للكميات الصغيرة والمتوسطة.",
    },
    description: {
      fr: "Passer de l'impression 3D à une production en moules demande une étude rigoureuse. Nous concevons et fabriquons des moules — souvent issus directement d'un prototype imprimé — pour produire des pièces identiques en petites et moyennes séries, avec des matériaux plastiques standards.",
      en: "Moving from 3D printing to mold production requires rigorous engineering. We design and manufacture molds — often directly derived from a printed prototype — to produce identical parts in small and medium series with standard plastic materials.",
      ar: "الانتقال من الطباعة ثلاثية الأبعاد إلى إنتاج القوالب يتطلب دراسة دقيقة. نصمّم ونصنّع قوالب — مستمدة غالباً من نموذج أولي مطبوع — لإنتاج قطع متطابقة بكميات صغيرة ومتوسطة ومواد بلاستيكية قياسية.",
    },
    process: {
      fr: "Étude de moulabilite → conception du moule → fabrication → essais → petites séries.",
      en: "Moldability study → mold design → mold build → trials → small series.",
      ar: "دراسة قابلية القولبة → تصميم القالب → تصنيعه → تجارب → كميات صغيرة.",
    },
    points: [
      { fr: "Étude de dépouille et de moulabilité", en: "Draft and moldability study", ar: "دراسة الميل الهندسي وقابلية القولبة" },
      { fr: "Moules injectés ou de compression", en: "Injection or compression molds", ar: "قوالب حقن أو ضغط" },
      { fr: "Moules pour petites et moyennes séries", en: "Molds for small and medium series", ar: "قوالب للكميات الصغيرة والمتوسطة" },
      { fr: "Essais de moulage et mise au point", en: "Molding trials and tuning", ar: "تجارب الحقن وضبطه" },
    ],
  },
];

/**
 * Upcoming capabilities — already designed for, shown on the Services page as
 * "coming soon" chips. Adding a fourth pillar (CNC, injection, ...) to the
 * company's offer only requires un-flagging these entries or extending the
 * array in the future.
 */
export type ExpandingCapability = {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  ready: boolean;
};

export const expandingCapabilities: ExpandingCapability[] = [
  {
    id: "cnc",
    label: { fr: "Usinage CNC", en: "CNC Machining", ar: "تشغيل CNC" },
    description: {
      fr: "Usinage de précision de pièces techniques.",
      en: "Precision machining of technical parts.",
      ar: "تشغيل دقيق للقطع التقنية.",
    },
    ready: true,
  },
  {
    id: "injection",
    label: { fr: "Injection plastique", en: "Plastic injection", ar: "حقن البلاستيك" },
    description: {
      fr: "Production en série via moules d'injection.",
      en: "Series production via injection molds.",
      ar: "إنتاج متسلسل عبر قوالب الحقن.",
    },
    ready: true,
  },
  {
    id: "thermoforming",
    label: { fr: "Thermoformage", en: "Thermoforming", ar: "التشكيل الحراري" },
    description: {
      fr: "Formage de plaques plastiques sur outillage.",
      en: "Forming of plastic sheets over tooling.",
      ar: "تشكيل صفائح البلاستيك على الأدوات.",
    },
    ready: false,
  },
  {
    id: "reverse-engineering",
    label: { fr: "Rétro-ingénierie", en: "Reverse engineering", ar: "الهندسة العكسية" },
    description: {
      fr: "Numérisation et reconstitution de pièces existantes.",
      en: "Scanning and reconstruction of existing parts.",
      ar: "رقمنة وإعادة بناء القطع الموجودة.",
    },
    ready: true,
  },
  {
    id: "industrial-design",
    label: { fr: "Design industriel", en: "Industrial design", ar: "التصميم الصناعي" },
    description: {
      fr: "Styling, ergonomie et identité produit.",
      en: "Styling, ergonomics and product identity.",
      ar: "الشكل الجمالي، بيئة العمل وهوية المنتج.",
    },
    ready: true,
  },
];