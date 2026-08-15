import type { LocalizedText } from "@/lib/localize";

export type CategoryId =
  | "impression-3d"
  | "conception-3d"
  | "prototypage"
  | "pieces-mecaniques"
  | "outillage"
  | "moules"
  | "fabrication-sur-mesure";

export type ProjectVisualKey =
  | "printer"
  | "cad"
  | "proto"
  | "gear"
  | "tool"
  | "mold"
  | "cnc";

export const projectCategories: {
  id: CategoryId;
  visual: ProjectVisualKey;
  label: LocalizedText;
}[] = [
  {
    id: "impression-3d",
    visual: "printer",
    label: { fr: "Impression 3D", en: "3D Printing", ar: "طباعة ثلاثية الأبعاد" },
  },
  {
    id: "conception-3d",
    visual: "cad",
    label: { fr: "Conception 3D", en: "3D Design", ar: "تصميم ثلاثي الأبعاد" },
  },
  {
    id: "prototypage",
    visual: "proto",
    label: { fr: "Prototypage", en: "Prototyping", ar: "نمذجة أولية" },
  },
  {
    id: "pieces-mecaniques",
    visual: "gear",
    label: { fr: "Pièces mécaniques", en: "Mechanical parts", ar: "قطع ميكانيكية" },
  },
  {
    id: "outillage",
    visual: "tool",
    label: { fr: "Outillage", en: "Tooling", ar: "أدوات التصنيع" },
  },
  {
    id: "moules",
    visual: "mold",
    label: { fr: "Moules", en: "Molds", ar: "قوالب" },
  },
  {
    id: "fabrication-sur-mesure",
    visual: "cnc",
    label: { fr: "Fabrication sur mesure", en: "Custom manufacturing", ar: "تصنيع حسب الطلب" },
  },
];

export type Project = {
  slug: string;
  title: LocalizedText;
  category: CategoryId;
  summary: LocalizedText;
  problem: LocalizedText;
  solution: LocalizedText;
  method: LocalizedText;
  result: LocalizedText;
  client: LocalizedText;
  duration: LocalizedText;
  year: string;
  featured?: boolean;
  /** Media keys referencing images stored in the media blob store. */
  images?: string[];
};

/**
 * Portfolio content is fully data-driven: to add a project, add an entry here
 * and pick a category. The visual is generated from the category.
 *
 * IMPORTANT: this is placeholder portfolio copy used to shape the design and
 * demonstrate the structure. Replace it with real Emade3D projects and photos.
 */
export const projects: Project[] = [
  {
    slug: "support-camera-soudable",
    title: {
      fr: "Support de caméra soudable",
      en: "Weldable camera bracket",
      ar: "حامل كاميرا قابل للحام",
    },
    category: "impression-3d",
    featured: true,
    year: "2024",
    client: { fr: "Atelier de maintenance industrielle", en: "Industrial maintenance workshop", ar: "ورشة صيانة صناعية" },
    duration: { fr: "5 jours", en: "5 days", ar: "5 أيام" },
    summary: {
      fr: "Un support destiné à fixer une caméra sur une structure métallique, conçu pour résister aux vibrations et à la chaleur.",
      en: "A bracket to mount a camera on a metal structure, designed to resist vibration and heat.",
      ar: "حامل لتثبيت كاميرا على هيكل معدني، مصمم لمقاومة الاهتزاز والحرارة.",
    },
    problem: {
      fr: "Le client devait fixer une caméra sur une poutre métallique exposée à la chaleur et aux vibrations. Aucun support du commerce ne convenait.",
      en: "The client had to mount a camera on a steel beam exposed to heat and vibration. No off-the-shelf bracket fit.",
      ar: "كان على العميل تثبيت كاميرا على عارضة معدنية معرضة للحرارة والاهتزاز، ولم يكن هناك أي حامل جاهز مناسب.",
    },
    solution: {
      fr: "Conception 3D d'un support sur mesure, optimisé pour l'impression en PC résistant à la température, avec points d'accroche soudables.",
      en: "Custom 3D-designed bracket, optimized for printing in heat-resistant PC, with weldable mounting points.",
      ar: "تصميم ثلاثي الأبعاد لحامل مخصص، محسّن للطباعة بخامة PC مقاومة للحرارة، مع نقاط تثبيت قابلة للحام.",
    },
    method: {
      fr: "Impression 3D FDM en polycarbonate, renforts internes optimisés par analyse de contraintes.",
      en: "FDM 3D printing in polycarbonate with internal ribs optimized through stress analysis.",
      ar: "طباعة ثلاثية الأبعاد FDM بخامة البولي كربونات مع تقوية داخلية محسّنة عبر تحليل الإجهادات.",
    },
    result: {
      fr: "Support installé et testé en conditions réelles : aucune déformation après des semaines d'usage intensif.",
      en: "Bracket installed and tested in real conditions: no deformation after weeks of intensive use.",
      ar: "تم تركيب الحامل واختباره في ظروف حقيقية: لا أي تشوه بعد أسابيع من الاستخدام المكثف.",
    },
  },
  {
    slug: "reducteur-demonstration",
    title: {
      fr: "Réducteur à engrenages de démonstration",
      en: "Demonstration gear reducer",
      ar: "علبة تروس تجريبية للعرض",
    },
    category: "conception-3d",
    featured: true,
    year: "2024",
    client: { fr: "Bureau d'études mécanique", en: "Mechanical design office", ar: "مكتب دراسات ميكانيكي" },
    duration: { fr: "3 semaines", en: "3 weeks", ar: "3 أسابيع" },
    summary: {
      fr: "Conception complète d'un réducteur pédagogique transparent, entièrement modélisé et optimisé en CAO.",
      en: "Full design of a transparent, educational gear reducer, entirely modeled and optimized in CAD.",
      ar: "تصميم كامل لعلبة تخفيض تعليمية شفافة، منمذجة ومحسّنة بالكامل بتقنية CAD.",
    },
    problem: {
      fr: "Un bureau d'études voulait un modèle pédagogique transparent pour expliquer le principe d'un réducteur à ses clients et ses apprentis.",
      en: "A design office wanted a transparent educational model to explain how a gear reducer works to clients and apprentices.",
      ar: "أراد مكتب دراسات نموذجاً تعليمياً شفافاً لشرح مبدأ علبة التروس لعملائه ومتدربيه.",
    },
    solution: {
      fr: "Conception mécanique complète : pignons, arbres, carter transparent, avec étude du rapport de transmission et de l'assemblage.",
      en: "Complete mechanical design: gears, shafts, transparent housing, with gear-ratio and assembly study.",
      ar: "تصميم ميكانيكي كامل: تروس، أعمدة، غلاف شفاف، مع دراسة نسبة النقل والتجميع.",
    },
    method: {
      fr: "Modélisation CAO paramétrique, validation de l'engrènement, impression des pignons en résine pour une finition lisse.",
      en: "Parametric CAD modeling, gear mesh validation, resin-printed gears for a smooth finish.",
      ar: "نمذجة بارامترية بتقنية CAD، التحقق من تعشيق التروس، وطباعة التروس بالرتينج للحصول على سطح أملس.",
    },
    result: {
      fr: "Un modèle fonctionnel et assemblé, utilisé aujourd'hui comme outil de démonstration.",
      en: "A functional, assembled model now used as a demonstration tool.",
      ar: "نموذج وظيفي ومجمّع، يُستخدم اليوم كأداة عرض تعليمية.",
    },
  },
  {
    slug: "gabarit-controle-dimensionnel",
    title: {
      fr: "Gabarit de contrôle dimensionnel",
      en: "Dimensional control gauge",
      ar: "قالب فحص أبعاد (جو-نو)",
    },
    category: "outillage",
    year: "2023",
    client: { fr: "Fabricant de connecteurs", en: "Connector manufacturer", ar: "مصنّع موصلات" },
    duration: { fr: "2 semaines", en: "2 weeks", ar: "أسبوعان" },
    summary: {
      fr: "Un gabarit « passe / ne passe pas » pour vérifier en 3 secondes la conformité d'une douille usinée.",
      en: "A go/no-go gauge to check a machined sleeve in 3 seconds.",
      ar: "قالب جو/نو-غو للتحقق من مطابقة جلبة مشغّلة خلال 3 ثوانٍ.",
    },
    problem: {
      fr: "Le contrôle des douilles après usinage prenait plusieurs minutes par pièce avec un pied à coulisse, et restait subjectif.",
      en: "Post-machining control of sleeves took minutes per part with calipers and stayed subjective.",
      ar: "كان فحص الجلبات بعد التشغيل يستغرق دقائق لكل قطعة باستخدام القدمة، ويبقى ذاتياً.",
    },
    solution: {
      fr: "Conception d'un gabarit dédié qui contrôle cote, alésage et parallélisme en une seule opération.",
      en: "A dedicated gauge controlling dimension, bore and parallelism in a single operation.",
      ar: "تصميم قالب مخصص يفحص البعد والتجويف والتوازي في عملية واحدة.",
    },
    method: {
      fr: "Prototype imprimé pour valider les cotes, puis gabarit final usiné en plastique technique avec inserts d'usure.",
      en: "Printed prototype to validate dimensions, then final gauge machined in engineering plastic with wear inserts.",
      ar: "نموذج أولي مطبوع للتحقق من الأبعاد، ثم القالب النهائي مشغّل من بلاستيك تقني مع مدخلات مقاومة للتآكل.",
    },
    result: {
      fr: "Temps de contrôle divisé par dix, zéro retour de non-conformité à la réception.",
      en: "Control time cut by ten, zero non-conformity returns.",
      ar: "تراجع زمن الفحص بعشرة أضعاف، وصفر بلاغات عدم مطابقة عند الاستلام.",
    },
  },
  {
    slug: "moule-connectique",
    title: {
      fr: "Moule pour pièce de connectique",
      en: "Mold for a connector part",
      ar: "قالب لقطعة موصّلات",
    },
    category: "moules",
    featured: true,
    year: "2024",
    client: { fr: "Électronicien industriel", en: "Industrial electronics company", ar: "شركة إلكترونيات صناعية" },
    duration: { fr: "6 semaines", en: "6 weeks", ar: "6 أسابيع" },
    summary: {
      fr: "Passage d'un prototype imprimé à un moule de production pour une série de 2 000 pièces identiques.",
      en: "Move from a printed prototype to a production mold for a run of 2,000 identical parts.",
      ar: "الانتقال من نموذج أولي مطبوع إلى قالب إنتاج لدفعة من 2000 قطعة متطابقة.",
    },
    problem: {
      fr: "Le client devait produire 2 000 boîtiers identiques : l'impression était trop lente et trop coûteuse à cette échelle.",
      en: "The client needed 2,000 identical housings: printing was too slow and too costly at this scale.",
      ar: "احتاج العميل إلى 2000 غلاف متطابق: كانت الطباعة بطيئة ومكلفة جداً بهذا الحجم.",
    },
    solution: {
      fr: "Étude de moulabilité, conception du moule directement dérivée du prototype validé, et essais de production.",
      en: "Moldability study, mold design directly derived from the validated prototype, and production trials.",
      ar: "دراسة قابلية القولبة، وتصميم القالب مستمداً مباشرة من النموذج المصادق عليه، وتجارب إنتاج.",
    },
    method: {
      fr: "Usinage de l'empreinte, polissage, réglage du plan de joint et des éjecteurs, puis essais avec matière.",
      en: "Cavity machining, polishing, parting-line and ejector tuning, then material trials.",
      ar: "تشغيل التجويف، التلميع، ضبط مستوى الفصل وأذرع القذف، ثم تجارب بالخامة الفعلية.",
    },
    result: {
      fr: "Pièces identiques au prototype avec un temps de cycle court, et un coût unitaire 40 % inférieur à l'impression.",
      en: "Parts identical to the prototype with a short cycle time, and a unit cost 40% below printing.",
      ar: "قطع مطابقة للنموذج الأولي بزمن دورة قصير، وتكلفة وحدة أقل من الطباعة بـ40%.",
    },
  },
  {
    slug: "prototype-aspirateur-industriel",
    title: {
      fr: "Prototype de tête d'aspiration industrielle",
      en: "Industrial suction head prototype",
      ar: "نموذج أولي لرأس شفط صناعي",
    },
    category: "prototypage",
    year: "2023",
    client: { fr: "Fabricant d'équipements de nettoyage", en: "Cleaning equipment manufacturer", ar: "مصنّع معدات تنظيف" },
    duration: { fr: "10 jours", en: "10 days", ar: "10 أيام" },
    summary: {
      fr: "Trois itérations d'un prototype fonctionnel pour valider l'aspiration et l'usure avant investissement.",
      en: "Three iterations of a functional prototype to validate suction and wear before investing.",
      ar: "ثلاثة تكرارات لنموذج أولي وظيفي للتحقق من الشفط والتآكل قبل الاستثمار.",
    },
    problem: {
      fr: "Avant de fabriquer des dizaines de têtes d'aspiration, le client devait valider la géométrie et mesurer l'usure réelle.",
      en: "Before making dozens of suction heads, the client needed to validate the geometry and measure real wear.",
      ar: "قبل تصنيع عشرات رؤوس الشفط، كان على العميل التحقق من الهندسة وقياس التآكل الفعلي.",
    },
    solution: {
      fr: "Prototypes imprimés en matériau résistant à l'abrasion, testés sur les machines réelles du client.",
      en: "Prototypes printed in an abrasion-resistant material, tested on the client's real machines.",
      ar: "نماذج أولية مطبوعة بخامة مقاومة للاحتكاك، مختبَرة على آلات العميل الفعلية.",
    },
    method: {
      fr: "Impression FDM, renforts et lèvres optimisés après chaque série de tests, en 3 itérations.",
      en: "FDM printing, ribs and lips optimized after each test round, in 3 iterations.",
      ar: "طباعة FDM مع تحسين التقوية والشفاه بعد كل جولة اختبار، عبر 3 تكرارات.",
    },
    result: {
      fr: "Géométrie finale validée et calée sur l'usure mesurée — le client a lancé la production avec des données réelles.",
      en: "Final geometry validated and tuned to measured wear — the client launched production with real data.",
      ar: "تمت المصادقة على الهندسة النهائية ومعايرتها على التآكل المقاس — وانطلق العميل في الإنتاج ببيانات حقيقية.",
    },
  },
  {
    slug: "pignon-remplacement",
    title: {
      fr: "Pignon de remplacement sur mesure",
      en: "Custom replacement gear",
      ar: "ترس تعويض حسب الطلب",
    },
    category: "pieces-mecaniques",
    year: "2023",
    client: { fr: "Ligne de production agroalimentaire", en: "Food-production line", ar: "خط إنتاج أغذية" },
    duration: { fr: "4 jours", en: "4 days", ar: "4 أيام" },
    summary: {
      fr: "Refabrication d'un pignon indisponible chez le fournisseur, pour remettre une ligne à l'arrêt en marche.",
      en: "Remanufacture of a gear no longer available from the supplier, to restart a stopped line.",
      ar: "إعادة صناعة ترس لم يعد متوفراً لدى المورد، لإعادة تشغيل خط متوقف.",
    },
    problem: {
      fr: "Un pignon en PC avait cassé et le délai fournisseur était de 8 semaines. La ligne était à l'arrêt.",
      en: "A PC gear broke and the supplier lead time was 8 weeks. The line was down.",
      ar: "انكسر ترس مصنوع من PC وكان أجل التوريد 8 أسابيع، بينما الخط متوقف.",
    },
    solution: {
      fr: "Rétro-ingénierie à partir du pignon cassé, puis fabrication d'une pièce compatible avec les mêmes caractéristiques.",
      en: "Reverse engineering from the broken gear, then production of a compatible part with the same characteristics.",
      ar: "هندسة عكسية من الترس المكسور، ثم صناعة قطعة متوافقة بنفس الخصائص.",
    },
    method: {
      fr: "Mesure métrologique du pignon, modélisation du profil de denture, impression résine renforcée (denture fatigante).",
      en: "Metrological measurement of the gear, tooth-profile modeling, reinforced resin printing (loaded flank).",
      ar: "قياس ميتولوجي للترس، نمذجة ملف الأسنان، وطباعة بالرتينج المقوى (جانب التحميل).",
    },
    result: {
      fr: "Ligne relancée en 4 jours. Le pignon de remplacement a tenu plus longtemps que l'original.",
      en: "Line restarted in 4 days. The replacement gear outlasted the original.",
      ar: "أعيد تشغيل الخط خلال 4 أيام، وظل الترس البديل صامداً أطول من الأصلي.",
    },
  },
  {
    slug: "piece-carrosserie-sur-mesure",
    title: {
      fr: "Pièce de carrosserie personnalisée",
      en: "Custom bodywork part",
      ar: "قطعة هيكل مخصصة",
    },
    category: "fabrication-sur-mesure",
    year: "2024",
    client: { fr: "Préparateur automobile", en: "Automotive tuner", ar: "مجهّز سيارات" },
    duration: { fr: "2 semaines", en: "2 weeks", ar: "أسبوعان" },
    summary: {
      fr: "Fabrication d'une prise d'air unique, dessinée par le client et produite en exemplaire unique.",
      en: "Manufacture of a one-off air intake, drawn by the client and produced as a single unit.",
      ar: "تصنيع مدخل هواء فريد، رسمه العميل وصُنع في نسخة واحدة.",
    },
    problem: {
      fr: "Le client avait un rendu 3D de son capot mais aucune pièce finie, et l'usinage métal était hors budget.",
      en: "The client had a 3D render of his hood but no finished part, and metal machining was out of budget.",
      ar: "كان لدى العميل رسم ثلاثي الأبعاد لغلافه لكن دون قطعة جاهزة، وكانت المعالجة المعدنية خارج الميزانية.",
    },
    solution: {
      fr: "Préparation du fichier pour l'impression, renforcement structurel et finition pour un rendu lisse et robuste.",
      en: "File preparation for printing, structural reinforcement and finishing for a smooth, robust look.",
      ar: "تجهيز الملف للطباعة، تقوية بنيوية وتشطيب لإطلالة ناعمة ومتينة.",
    },
    method: {
      fr: "Impression FDM grand format, ponçage et apprêt, finition peinte par notre partenaire.",
      en: "Large-format FDM printing, sanding and primer, painted finish by our partner.",
      ar: "طباعة FDM بأحجام كبيرة، صنفرة وطلاء أساسي، وتشطيب بالطلاء عبر شريكنا.",
    },
    result: {
      fr: "Pièce livrée montable, assemblée et peinte sur le véhicule du client en quelques jours.",
      en: "Delivered ready-to-fit, assembled and painted on the client's vehicle within days.",
      ar: "تسليم قطعة جاهزة للتركيب، وُضعت وصُبغت على سيارة العميل خلال أيام.",
    },
  },
  {
    slug: "gabarit-percage-assemblage",
    title: {
      fr: "Gabarit de perçage pour panneaux",
      en: "Drilling jig for panels",
      ar: "قالب حفر للألواح",
    },
    category: "outillage",
    year: "2022",
    client: { fr: "Menuisier aluminium", en: "Aluminium joiner", ar: "نجار ألمنيوم" },
    duration: { fr: "1 semaine", en: "1 week", ar: "أسبوع واحد" },
    summary: {
      fr: "Un gabarit réutilisable pour percer des trous parfaitement alignés sur des panneaux en série.",
      en: "A reusable jig to drill perfectly aligned holes on panels in series.",
      ar: "قالب قابل لإعادة الاستخدام لثقب ثقوب متوازية تماماً على الألواح بكميات.",
    },
    problem: {
      fr: "Le perçage à la main produisait des écarts d'alignement visibles et ralentissait le montage.",
      en: "Hand drilling produced visible alignment errors and slowed assembly.",
      ar: "كان الحفر اليدوي يسبب انحرافات واضحة في المحاذاة ويبطئ التجميع.",
    },
    solution: {
      fr: "Conception d'un gabarit basé sur les cotes du produit, avec douilles de guidage remplaçables.",
      en: "Jig designed from the product dimensions, with replaceable drill bushes.",
      ar: "تصميم قالب انطلاقاً من أبعاد المنتج، مع جلبات توجيه قابلة للاستبدال.",
    },
    method: {
      fr: "Impression renforcée + inserts métalliques de maintien, pièces d'usure rapides à remplacer.",
      en: "Reinforced printing + metal retention inserts, with wear parts that are quick to replace.",
      ar: "طباعة مقواة + مدخلات معدنية للتثبيت، وقطع تآكل سريعة الاستبدال.",
    },
    result: {
      fr: "Montage deux fois plus rapide, aucun écart de perçage constaté sur les séries suivantes.",
      en: "Assembly twice as fast, zero drilling error on subsequent series.",
      ar: "تجميع أسرع بمرتين، وصفر أخطاء حفر في الدفعات اللاحقة.",
    },
  },
  {
    slug: "boitier-electronique-etanche",
    title: {
      fr: "Boîtier électronique étanche",
      en: "Waterproof electronics enclosure",
      ar: "غلاف إلكتروني مقاوم للماء",
    },
    category: "impression-3d",
    year: "2024",
    client: { fr: "Startup IoT agricole", en: "Agri-tech startup", ar: "شركة ناشئة إنترنت الأشياء الزراعي" },
    duration: { fr: "2 semaines", en: "2 weeks", ar: "أسبوعان" },
    summary: {
      fr: "Un boîtier étanche IP54 conçu pour accueillir un capteur de sol connecté, en petites séries.",
      en: "An IP54 waterproof enclosure designed to house a connected soil sensor, in small series.",
      ar: "غلاف مقاوم للماء IP54 مصمم لإيواء حساس تربة متصل، بكميات صغيرة.",
    },
    problem: {
      fr: "La startup avait un PCB mais aucun boîtier adapté au terrain, à l'eau et à la poussière.",
      en: "The startup had a PCB but no enclosure suited to the field, water and dust.",
      ar: "كان لدى الشركة الناشئة لوحة PCB لكن دون غلاف مناسب للتربة والماء والغبار.",
    },
    solution: {
      fr: "Conception du boîtier avec joints, bossages PCB, fenêtre de communication et étanchéité IP54.",
      en: "Enclosure design with gaskets, PCB bosses, a communication window and IP54 sealing.",
      ar: "تصميم الغلاف مع حشوات، أعمدة تثبيت للوحة، نافذة اتصال، وعزل IP54.",
    },
    method: {
      fr: "Impression résine pour la précision des joints, puis petite série FDM PETG avec inserts filetés.",
      en: "Resin printing for gasket precision, then a small FDM PETG series with threaded inserts.",
      ar: "طباعة بالرتينج لدقة الحشوات، ثم كمية صغيرة FDM بخامة PETG مع مدخلات ملولبة.",
    },
    result: {
      fr: "50 boîtiers livrés, testés sous pluie et en plein champ, validés pour la mise sur le marché.",
      en: "50 enclosures delivered, tested in rain and in the field, validated for market launch.",
      ar: "تسليم 50 غلافاً، مختبَرة تحت المطر وفي الميدان، وصالحون للطرح في السوق.",
    },
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getCategoryMeta(id: CategoryId) {
  return projectCategories.find((c) => c.id === id);
}