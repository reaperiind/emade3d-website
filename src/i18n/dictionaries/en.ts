import type { Dictionary } from "./fr";

const en: Dictionary = {
  meta: {
    home: {
      title: "Emade3D — 3D Design, 3D Printing and Manufacturing",
      description:
        "From idea to finished part: 3D design, 3D printing, prototyping, tooling, molds and custom plastic parts manufacturing.",
    },
    services: {
      title: "Services — 3D Design, 3D Printing, Prototyping, Tooling, Molds",
      description:
        "Explore Emade3D's engineering and manufacturing services: 3D design, 3D printing, prototyping, tooling and molds for custom plastic parts.",
    },
    realisations: {
      title: "Our work — Manufactured parts and projects",
      description:
        "A selection of our work: mechanical parts, prototypes, tooling and molds designed and manufactured to measure.",
    },
    process: {
      title: "How it works — From idea to finished part",
      description:
        "Understand our six-step process: need, study, design, validation, manufacturing, control and delivery.",
    },
    about: {
      title: "About — Emade3D, engineering, design and manufacturing",
      description:
        "Emade3D is an engineering, design and manufacturing company that turns ideas and technical problems into functional parts.",
    },
    faq: {
      title: "Frequently asked questions — Emade3D",
      description:
        "Answers to the most common questions about 3D design, 3D printing, materials, lead times and custom part manufacturing.",
    },
    contact: {
      title: "Contact — Emade3D",
      description:
        "Contact Emade3D by phone, WhatsApp, e-mail or through our contact form. We are here to help with your project.",
    },
    quote: {
      title: "Request a quote — Custom design and manufacturing",
      description:
        "Start your Emade3D quote request: prepare your project, create your request on our portal and get your technical study and proposal within 24-48 hours.",
    },
    track: {
      title: "Track my order — Emade3D",
      description:
        "Track your Emade3D order at every step: study, design, manufacturing, control and delivery. Enter your tracking number.",
    },
  },

  nav: {
    home: "Home",
    services: "Services",
    realisations: "Our work",
    process: "How it works",
    about: "About",
    contact: "Contact",
    faq: "FAQ",
    devis: "Request a quote",
    tracking: "Track my order",
    orders: "My orders",
    newOrder: "New order",
    menu: "Menu",
    language: "Language",
    skipToContent: "Skip to content",
    welcomeTitle: "Choose your language",
    welcomeText: "Select the site language to continue.",
  },

  common: {
    all: "All",
    allCategories: "All categories",
    readMore: "Learn more",
    viewProject: "View project",
    viewAll: "View all",
    backToProjects: "Back to our work",
    close: "Close",
    requestedBy: "Client",
    method: "Manufacturing method",
    duration: "Lead time",
    prevProject: "Previous project",
    nextProject: "Next project",
  },

  hero: {
    kicker: "Engineering · Design · Manufacturing",
    title: "From idea to finished part.",
    accentWord: "finished part.",
    subtitle:
      "Emade3D supports your project end to end: feasibility study, 3D design, prototyping, printing and manufacturing of the final part. Have an idea, a sketch or a manufacturing problem? We find the solution.",
    ctaDevis: "Request a quote",
    ctaRealisations: "See our work",
    scroll: "Scroll",
    badges: [
      { label: "Precision", value: "0.1 mm" },
      { label: "Covered trades", value: "6" },
      { label: "Made to measure", value: "100%" },
    ],
  },

  services: {
    kicker: "Our services",
    title: "Complete engineering solutions",
    subtitle:
      "From design to production, we cover the whole chain: create, prototype, machine, tool, mold.",
    explore: "Learn more",
    viewAll: "See all services",
    fromIdea: "From idea to part",
    futureTitle: "Toward other processes",
    futureSubtitle:
      "Our engineering platform keeps evolving: new processes and services will be added without changing your experience.",
    futureStatus: "Coming soon",
  },

  solution: {
    kicker: "Your technical partner",
    title: "An idea? A manufacturing problem? We find the solution.",
    lead: "At Emade3D, we don't just execute a plan. We study your need, challenge the design and propose the most reliable and cost-effective manufacturing method to deliver a part that works — and can actually be made.",
    points: [
      {
        title: "Feasibility study",
        text: "We analyze your idea, sketch or file and determine the best technical and material approach.",
      },
      {
        title: "Design for manufacturing",
        text: "We optimize the geometry so the part is simple, reliable and cost-effective to make, even in small series.",
      },
      {
        title: "Right process selection",
        text: "3D printing, machining, tooling, molding: we pick the technology best suited to each part and each volume.",
      },
    ],
    note: "Have a 3D file? Just an image? Or simply an idea? That's enough to get started.",
  },

  realisations: {
    kicker: "Our work",
    title: "Concrete projects, real parts",
    subtitle:
      "A selection of the parts and solutions we have designed and manufactured for our clients.",
    problem: "The problem",
    solution: "The solution",
    method: "Manufacturing method",
    result: "The result",
    empty: "No project in this category yet.",
  },

  process: {
    kicker: "Our method",
    title: "How does it work?",
    subtitle:
      "A simple and transparent process, designed for both the client and the engineer.",
    intro:
      "From the first discussion to the part in your hands, every step is clear, validated and traceable.",
  },

  cta: {
    kicker: "Let's talk about your project",
    title: "Have a project?",
    lead: "Describe your need on our portal and receive a study and manufacturing proposal. No commitment.",
    button: "Request a quote",
    tracking: "Track my order",
  },

  quote: {
    kicker: "Request a quote",
    title: "New order",
    subtitle:
      "Fill in the details below and we will start working on your order.",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    orderDate: "Order date",
    serviceType: "Service type",
    servicePlaceholder: "Choose a service",
    services: {
      impression: "3D Printing",
      conception: "3D Design",
      both: "3D Design + 3D Printing",
    },
    description: "Detailed order description",
    descriptionPlaceholder: "Describe your project in detail here...",
    submit: "Confirm the order",
    sending: "Sending...",
    noteBeforeSubmit:
      "By confirming, your order is recorded and a unique tracking code is assigned to you to follow every step.",
    helpTitle: "A question before you start?",
    helpText:
      "Browse the answers to the most common questions or contact us directly.",
    helpFaq: "See the FAQ",
    helpContact: "Contact us",
    servicesHint: "Also discover our services:",
    result: {
      successTitle: "Order confirmed!",
      successText:
        "Your order has been recorded. Keep your tracking code safe:",
      codeLabel: "Tracking code",
      saveReceipt: "Save receipt (image)",
      receiptSaved: "Receipt downloaded",
      copyCode: "Copy code",
      copied: "Code copied!",
      goToTracking: "Track my order",
      newOrder: "New order",
    },
  },

  track: {
    kicker: "Order tracking",
    title: "Track my order",
    subtitle: "Enter your tracking number to see the status of your order.",
    code: "Tracking number",
    codePlaceholder: "EMD-XXXXXX",
    submit: "Track",
    sending: "Searching...",
    note:
      "Enter your tracking code to display your order status.",
    helpTitle: "Don't have an order yet?",
    helpText:
      "Create a new order in a few minutes or browse our services.",
    helpNewOrder: "New order",
    helpFaq: "See the FAQ",
    helpContact: "Contact us",
    servicesHint: "Also discover our services:",
    notFound: "No order matches this code.",
    notFoundCode: "Check the code entered (format EMD-XXXXXX).",
    client: "Client",
    phone: "Phone",
    service: "Service",
    date: "Date",
    statusLabel: "Status",
    statuses: {
      new: "Order received",
      processing: "In production",
      shipped: "Shipped",
      done: "Completed",
      cancelled: "Cancelled",
    },
    description: "Description",
    trackingHelp:
      "This code is provided when your order is confirmed.",
  },

  about: {
    kicker: "About",
    title: "Engineering + Design + Manufacturing",
    intro:
      "Emade3D is an engineering, design and manufacturing company. We turn ideas, sketches and technical problems into real, functional and durable parts.",
    lead:
      "We are not just a 3D printing service. We work upstream — to study, design and optimize — and downstream — to manufacture, control and deliver.",
    pillars: [
      {
        title: "Engineering",
        text: "A rigorous technical approach: material selection, dimensioning, manufacturing constraints.",
      },
      {
        title: "Design",
        text: "3D design, optimization and design that is intended to be manufactured from the start.",
      },
      {
        title: "Manufacturing",
        text: "Production, quality control and delivery of reliable, ready-to-use parts.",
      },
    ],
    points: [
      "Mechanical design and 3D CAD",
      "3D printing and plastic manufacturing",
      "Rapid prototyping and testing",
      "Tooling and production molds",
      "Custom solutions for every client",
      "Working with companies, workshops, startups and inventors",
    ],
    sectionTitle: "What we actually do",
    sectionText:
      "Whether you need a single part, a prototype to test or small production tooling, we put engineering at the service of your project.",
    audiencesTitle: "Who we work with",
    audiences: [
      "Companies and industry",
      "Workshops and design offices",
      "Startups and innovative projects",
      "Inventors and individuals",
    ],
    valuesTitle: "How we work",
    values: [
      { title: "Precision", text: "Accurate, measured and controlled parts." },
      { title: "Technical honesty", text: "We recommend the right solution, not the most expensive one." },
      { title: "Availability", text: "A single point of contact and clear answers." },
    ],
  },

  faq: {
    kicker: "FAQ",
    title: "Frequently asked questions",
    subtitle:
      "Everything you need to know before starting your project. Another question? Get in touch.",
    moreTitle: "Can't find your answer?",
    moreText: "Contact us directly, we usually reply within 24 hours.",
    cta: "Ask your question",
    askWhatsapp: "Message us on WhatsApp",
  },

  contact: {
    kicker: "Contact",
    title: "Let's talk about your project",
    subtitle:
      "A question, a need, a project? Contact us. For any quote request, use our dedicated portal.",
    form: {
      title: "Contact form",
      name: "Full name",
      namePlaceholder: "Your name",
      email: "E-mail address",
      emailPlaceholder: "you@example.com",
      phone: "Phone (optional)",
      phonePlaceholder: "+213 ...",
      message: "Your message",
      messagePlaceholder: "Describe your project or question…",
      submit: "Send message",
      sending: "Sending…",
      privacy: "Your information stays confidential.",
      success:
        "Thank you! Your message has been prepared in your mail app. Send it in one click.",
    },
    info: {
      phone: "Phone",
      whatsapp: "WhatsApp",
      email: "E-mail",
      address: "Address",
      hours: "Opening hours",
      quoteTitle: "Need a quote?",
      quoteText: "Create your request directly on our portal:",
      quoteButton: "Request a quote",
    },
  },

  footer: {
    description:
      "Emade3D — Design · Prototyping · Manufacturing. From idea to finished part.",
    tagline: "From idea to finished part.",
    nav: "Navigation",
    services: "Services",
    contact: "Contact",
    resources: "Resources",
    devis: "Request a quote",
    tracking: "Track my order",
    rights: "All rights reserved.",
    madeWith: "Designed and manufactured with precision.",
  },

  notFound: {
    code: "404",
    title: "Page not found",
    subtitle: "The page you are looking for does not exist or has moved.",
    back: "Back to home",
  },
};

export default en;