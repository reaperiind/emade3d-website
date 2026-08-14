import type { LocalizedText } from "@/lib/localize";

export type ProcessStep = {
  id: string;
  number: string;
  title: LocalizedText;
  description: LocalizedText;
  hint: LocalizedText;
};

/**
 * The six-step method. Titles and descriptions are localized; the component
 * renders them as a numbered timeline (works for LTR and RTL).
 */
export const processSteps: ProcessStep[] = [
  {
    id: "besoin",
    number: "01",
    title: { fr: "Votre besoin", en: "Your need", ar: "حاجتكم" },
    description: {
      fr: "Vous nous expliquez votre idée, votre problème ou votre projet : une image, un croquis, un fichier ou même une simple description suffisent.",
      en: "You tell us about your idea, problem or project: an image, a sketch, a file or even a simple description is enough.",
      ar: "تشرحون لنا فكرتكم أو مشكلتكم أو مشروعكم: صورة، رسم، ملف أو حتى مجرد وصف يكفي.",
    },
    hint: { fr: "Entrée : idée, croquis, fichier", en: "Input: idea, sketch, file", ar: "المدخل: فكرة، رسم، ملف" },
  },
  {
    id: "etude",
    number: "02",
    title: { fr: "Étude", en: "Study", ar: "الدراسة" },
    description: {
      fr: "Nous analysons les exigences, le matériau adapté et la meilleure méthode de fabrication pour votre pièce.",
      en: "We analyze the requirements, the right material and the best manufacturing method for your part.",
      ar: "نحلل المتطلبات والمادة المناسبة وأفضل طريقة تصنيع لقطعتكم.",
    },
    hint: { fr: "Entrée : analyse technique", en: "Input: technical analysis", ar: "المدخل: تحليل تقني" },
  },
  {
    id: "conception",
    number: "03",
    title: { fr: "Conception", en: "Design", ar: "التصميم" },
    description: {
      fr: "Création ou modification du design 3D : modélisation, correction du fichier, optimisation pour la fabrication.",
      en: "Creation or adjustment of the 3D design: modeling, file repair, optimization for manufacturing.",
      ar: "إنشاء أو تعديل التصميم ثلاثي الأبعاد: النمذجة، إصلاح الملف، تحسينه للتصنيع.",
    },
    hint: { fr: "Entrée : CAO / fichiers 3D", en: "Input: CAD / 3D files", ar: "المدخل: تصميم / ملفات ثلاثية الأبعاد" },
  },
  {
    id: "validation",
    number: "04",
    title: { fr: "Validation", en: "Validation", ar: "المصادقة" },
    description: {
      fr: "Le design et la proposition sont revus avec vous : matériau, tolérances, délais et coût. Vous validez avant la moindre fabrication.",
      en: "The design and proposal are reviewed with you: material, tolerances, lead time and cost. You approve before any manufacturing starts.",
      ar: "نراجع التصميم والعرض معكم: المادة، التفاوتات، الآجال والتكلفة. توافقون قبل أي تصنيع.",
    },
    hint: { fr: "Entrée : accord client", en: "Input: client approval", ar: "المدخل: موافقة العميل" },
  },
  {
    id: "fabrication",
    number: "05",
    title: { fr: "Fabrication", en: "Manufacturing", ar: "التصنيع" },
    description: {
      fr: "Exécution de la pièce, du prototype ou de l'outil avec la technologie retenue et un suivi qualité.",
      en: "Production of the part, prototype or tool with the selected technology and quality follow-up.",
      ar: "تنفيذ القطعة أو النموذج أو الأداة بالتقنية المعتمدة مع متابعة الجودة.",
    },
    hint: { fr: "Entrée : impression / usinage / moulage", en: "Input: printing / machining / molding", ar: "المدخل: طباعة / تشغيل / قولبة" },
  },
  {
    id: "controle",
    number: "06",
    title: { fr: "Contrôle & livraison", en: "Control & delivery", ar: "الفحص والتسليم" },
    description: {
      fr: "Contrôle de la pièce, finition si nécessaire, emballage et remise au client.",
      en: "Part inspection, finishing if needed, packaging and handover to the client.",
      ar: "فحص القطعة، التشطيب عند الحاجة، التغليف والتسليم للعميل.",
    },
    hint: { fr: "Entrée : pièce conforme", en: "Input: compliant part", ar: "المدخل: قطعة مطابقة" },
  },
];