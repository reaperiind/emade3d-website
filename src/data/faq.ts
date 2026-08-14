import type { LocalizedText } from "@/lib/localize";

export type FaqItem = {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
};

export const faqItems: FaqItem[] = [
  {
    id: "image-only",
    question: {
      fr: "Pouvez-vous fabriquer une pièce à partir d'une simple photo ?",
      en: "Can you manufacture a part from a simple photo?",
      ar: "هل يمكنكم تصنيع قطعة انطلاقاً من صورة فقط؟",
    },
    answer: {
      fr: "Oui, dans la plupart des cas. À partir d'une ou plusieurs photos, de dimensions ou d'un dessin, nous reconstituons la pièce en 3D puis nous la fabriquons. Dans certains cas, nous vous demanderons des précisions de cotes.",
      en: "Yes, in most cases. From one or more photos, dimensions or a drawing, we reconstruct the part in 3D then manufacture it. In some cases we will ask you for measurement details.",
      ar: "نعم في معظم الحالات. من صورة أو عدة صور أو أبعاد أو رسم، نعيد بناء القطعة ثلاثياً ثم نصنّعها. في بعض الحالات نطلب منكم توضيح الأبعاد.",
    },
  },
  {
    id: "3d-file",
    question: {
      fr: "Puis-je envoyer un fichier 3D ?",
      en: "Can I send a 3D file?",
      ar: "هل يمكنني إرسال ملف ثلاثي الأبعاد؟",
    },
    answer: {
      fr: "Bien sûr, c'est même le plus rapide. Vous pouvez déposer votre fichier directement dans votre demande sur notre portail, avec toutes les informations du projet.",
      en: "Of course, it's actually the fastest way. You can upload your file directly in your request on our portal, along with all the project details.",
      ar: "بالتأكيد، بل إنها الطريقة الأسرع. يمكنكم رفع ملفكم مباشرة مع طلبكم على بوابتنا مع كل تفاصيل المشروع.",
    },
  },
  {
    id: "accepted-formats",
    question: {
      fr: "Quels formats de fichiers acceptez-vous ?",
      en: "What file formats do you accept?",
      ar: "ما صيغ الملفات المقبولة؟",
    },
    answer: {
      fr: "Nous acceptons les formats volumétriques : STL, OBJ, 3MF ; et surtout les formats CAO natives : STEP, IGES, et les fichiers SOLIDWORKS, Fusion 360 ou FreeCAD.",
      en: "We accept mesh formats: STL, OBJ, 3MF; and especially native CAD formats: STEP, IGES, and SOLIDWORKS, Fusion 360 or FreeCAD files.",
      ar: "نقبل صيغ الشبكات: STL وOBJ و3MF؛ وخاصة الصيغ الهندسية الأصلية: STEP وIGES وملفات SOLIDWORKS وFusion 360 أو FreeCAD.",
    },
  },
  {
    id: "materials",
    question: {
      fr: "Quels matériaux utilisez-vous ?",
      en: "What materials do you use?",
      ar: "ما المواد التي تستخدمونها؟",
    },
    answer: {
      fr: "Selon la technologie : PLA, PETG, ABS, PC, nylon, résines standard et techniques, ainsi que des plastiques d'usinage. Nous vous recommandons le matériau le plus adapté à l'usage réel de la pièce.",
      en: "Depending on the technology: PLA, PETG, ABS, PC, nylon, standard and engineering resins, as well as machinable plastics. We recommend the material best suited to the part's real use.",
      ar: "حسب التقنية: PLA وPETG وABS وPC والنايلون والراتنجات القياسية والتقنية بالإضافة إلى مواد التشغيل. نوصيكم بالمادة الأنسب للاستخدام الفعلي للقطعة.",
    },
  },
  {
    id: "design-service",
    question: {
      fr: "Proposez-vous des services de conception ?",
      en: "Do you offer design services?",
      ar: "هل تقدمون خدمات التصميم؟",
    },
    answer: {
      fr: "Oui. La conception 3D fait partie de nos services : modélisation, correction de fichiers, adaptation d'une pièce existante et conception complète adaptée à la fabrication.",
      en: "Yes. 3D design is one of our services: modeling, file repair, adapting an existing part and full design-for-manufacturing.",
      ar: "نعم. التصميم ثلاثي الأبعاد من خدماتنا: نمذجة، إصلاح الملفات، تكييف قطعة موجودة وتصميم كامل مهيأ للتصنيع.",
    },
  },
  {
    id: "small-quantity",
    question: {
      fr: "Fabriquez-vous de petites quantités ?",
      en: "Do you manufacture small quantities?",
      ar: "هل تصنّعون كميات صغيرة؟",
    },
    answer: {
      fr: "Oui, c'est même notre spécialité. Nous produisons des petites et moyennes séries : quelques unités, plusieurs dizaines, ou des séries plus importantes avec un outillage dédié.",
      en: "Yes, that's actually our specialty. We produce small and medium runs: a few units, dozens, or larger series with dedicated tooling.",
      ar: "نعم، بل إنها من تخصصاتنا. ننتج كميات صغيرة ومتوسطة: بضعة قطع أو عشرات، أو سلاسل أكبر عبر أدوات مخصصة.",
    },
  },
  {
    id: "single-part",
    question: {
      fr: "Fabriquez-vous une seule pièce ?",
      en: "Can you manufacture a single part?",
      ar: "هل تصنّعون قطعة واحدة؟",
    },
    answer: {
      fr: "Oui, la pièce unique est parfaitement possible, surtout en impression 3D ou par usinage. C'est idéal pour une pièce de remplacement, un prototype ou une pièce rare.",
      en: "Yes, a single part is perfectly feasible, especially with 3D printing or machining. Ideal for a replacement part, a prototype or a rare part.",
      ar: "نعم، القطعة المفردة ممكنة تماماً، خاصة بالطباعة ثلاثية الأبعاد أو التشغيل. مثالية لقطعة تعويض أو نموذج أولي أو قطعة نادرة.",
    },
  },
  {
    id: "pricing",
    question: {
      fr: "Comment le prix est-il calculé ?",
      en: "How is the price calculated?",
      ar: "كيف يُحسب السعر؟",
    },
    answer: {
      fr: "Le prix dépend de la technologie, du matériau, de la géométrie (temps de fabrication), de la quantité et d'éventuelles finitions. Envoyez votre fichier ou vos photos sur le portail : nous vous répondons avec une proposition claire, sans surprise.",
      en: "The price depends on the technology, material, geometry (manufacturing time), quantity and any finishing. Send your file or photos through the portal: we reply with a clear, no-surprise proposal.",
      ar: "يعتمد السعر على التقنية والمادة وهندسة القطعة (وقت التصنيع) والكمية وأي تشطيب. أرسلوا ملفكم أو صوركم عبر البوابة: نرد عليكم بعرض واضح دون مفاجآت.",
    },
  },
  {
    id: "lead-time",
    question: {
      fr: "Quels sont les délais de fabrication ?",
      en: "What are the manufacturing lead times?",
      ar: "ما هي آجال التصنيع؟",
    },
    answer: {
      fr: "Pour un prototype simple, comptez 24 à 48 heures. Pour une pièce plus complexe ou une petite série, le délai est précisé avec la proposition, généralement de quelques jours à deux semaines.",
      en: "For a simple prototype, allow 24 to 48 hours. For a more complex part or a small series, the lead time is stated with the proposal, usually a few days to two weeks.",
      ar: "للنموذج الأولي البسيط، احسبوا من 24 إلى 48 ساعة. للقطعة الأكثر تعقيداً أو الكمية الصغيرة، يُحدد الأجل مع العرض، عادة من أيام قليلة إلى أسبوعين.",
    },
  },
  {
    id: "tracking",
    question: {
      fr: "Comment suivre ma commande ?",
      en: "How can I track my order?",
      ar: "كيف يمكنني تتبع طلبي؟",
    },
    answer: {
      fr: "Toutes vos demandes et commandes sont suivies via notre portail, où vous trouvez l'état d'avancement de chaque étape : étude, conception, fabrication, contrôle, livraison.",
      en: "All your requests and orders are tracked through our portal, where you can see the progress of each step: study, design, manufacturing, control, delivery.",
      ar: "تتابعون جميع طلباتكم عبر بوابتنا، حيث تجدون حالة كل خطوة: الدراسة، التصميم، التصنيع، الفحص، التسليم.",
    },
  },
  {
    id: "confidentiality",
    question: {
      fr: "Mes fichiers et mes idées sont-ils protégés ?",
      en: "Are my files and ideas protected?",
      ar: "هل ملفاتي وأفكاري محمية؟",
    },
    answer: {
      fr: "Oui. Nous traitons chaque projet de manière confidentielle et nous ne réutilisons jamais vos fichiers ou vos designs pour un autre client, sauf accord écrit de votre part.",
      en: "Yes. We handle every project confidentially and never reuse your files or designs for another client without your written consent.",
      ar: "نعم. نتعامل مع كل مشروع بسرية تامة ولا نعيد استخدام ملفاتكم أو تصميماتكم لعميل آخر إلا بموافقة كتابية منكم.",
    },
  },
];