# Emade3D — Site officiel / Official website

Site vitrine (corporate / marketing) de **Emade3D**, société d'ingénierie, de conception
et de fabrication : *Conception 3D · Impression 3D · Prototypage · Outillage · Moules ·
Fabrication de pièces sur mesure*.

> **De l'idée à la pièce fabriquée.**
>
> Le site est la vitrine publique de la société. Il **ne gère pas les commandes** :
> toutes les demandes de devis et le suivi des commandes se font sur le
> **Emade3D Portal** existant, vers lequel le site redirige simplement.

---

## Stack

- **Next.js 14** (App Router) — static output, très rapide
- **TypeScript**
- **Tailwind CSS 3** (accent et thème industrial sombre)
- **i18n maison** (sans dépendance) — `fr` · `en` · `ar`, avec RTL complet pour l'arabe

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build statique
npm run start      # serveur de production
npm run lint       # eslint + types
```

## Structure

```
src/
├─ app/[locale]/            Pages (page.tsx, layout.tsx, not-found + [slug])
├─ components/
│  ├─ layout/               Header, Footer, lang-switcher
│  ├─ sections/             Hero, services, sections réutilisables…
│  ├─ ui/                   Boutons, Reveal (scroll), icônes, logo…
│  └─ visual/               Illustrations SVG techniques (héros + projets)
├─ config/site.ts           ★ CONFIGURATION CENTRALE (voir ci-dessous)
├─ data/                    services.ts, projects.ts, faq.ts, process.ts
├─ i18n/                    config + dictionaries/{fr,en,ar}.ts + provider
└─ lib/                     seo.ts, localize.ts, cn.ts
```

## Configuration centrale — `src/config/site.ts`

Tout ce qui est susceptible de changer est centralisé ici — **aucune valeur ne
doit être codée en dur ailleurs** :

| Clé | Rôle |
| --- | --- |
| `PORTAL_URL` | **Portail Emade3D** (racine, ex. `https://portal.emade3d.store`) |
| `portalNewOrderUrl(locale)` | **Page « Demander un devis »** → `/fr/new` du Portail (page interne `/demander-un-devis` y redirige le client pour confirmer) |
| `portalTrackingUrl(locale)` | **Lien « Suivre ma commande »** → `/fr/track` du Portail (page interne `/suivre-ma-commande` y redirige le client) |

> **Commandes** — Le bouton « Mes commandes » du header (`src/components/ui/orders-menu.tsx`)
> ouvre un menu au survol avec deux actions : **Nouvelle commande** (`/demander-un-devis`)
> et **Suivre ma commande** (`/suivre-ma-commande`). Les deux pages sont internes et
> redirigent vers le Portail à la confirmation — le site n'a pas son propre backend.
| `site.domain` | Domaine (SEO : canonical, sitemap, hreflang) |
| `site.contact` | Téléphone, WhatsApp, e-mail, adresse, map, horaires |
| `site.social` | Réseaux sociaux (vides = masqués) |
| `site.brand.accent` | Couleur d'accent (celle du logo) |
| `site.seo` | Titres / descriptions / mots-clés / image OpenGraph |

Il est aussi possible de surcharger via variables d'environnement :

```
NEXT_PUBLIC_PORTAL_URL=https://portal.monsite.com
NEXT_PUBLIC_SITE_URL=https://www.emade3d.com
```

## Ajouter un service

Ouvrir `src/data/services.ts` et ajouter un objet dans `services[]`
(`id`, `icon`, `title`, `short`, `description`, `process`, `points` — chaque texte
en `{ fr, en, ar }`). La page Services, la grille d'accueil et le footer le
prennent en compte automatiquement. Les capacités futures (CNC, injection,
rétro-ingénierie…) sont déjà préparées dans `expandingCapabilities`.

Pour **nouveaux procédés** déjà prévus : débloquer un élément de
`expandingCapabilities` ou en ajouter — aucune modification de structure.

## Ajouter un projet (portfolio)

Ouvrir `src/data/projects.ts` et ajouter un objet dans `projects[]`
(`slug`, `title`, `category`, `problem`, `solution`, `method`, `result`, …).
La catégorie génère l'illustration technique (`ProjectVisual`) et alimente le
filtre de la page Réalisations.

> Les projets actuels sont des **textes de démonstration** : remplacez-les par
> les vraies réalisations et photos d'Emade3D (champ `image` / visual).

## Langues & RTL

`src/i18n/dictionaries/` contient `fr.ts` (référence), `en.ts` et `ar.ts`
(dictées au type de `fr` pour garantir l'égalité des clés). L'ordre des langues
et le défaut sont dans `src/i18n/config.ts` (`defaultLocale: "fr"`).

Le routage : `fr` / `en` / `ar` par préfixe (middleware). `/` redirige vers
`/fr`. Tout le CSS utilise des propriétés logiques (`ms/me/ps/pe`, `start/end`)
→ passage automatique et complet en **RTL** pour l'arabe.

## SEO

- `generateMetadata` par page (`src/lib/seo.ts`) : title, description,
  canonical, **hreflang** fr/en/ar, OpenGraph, Twitter Card.
- `src/app/sitemap.ts` : sitemap multilingue (pages + projets).
- `src/app/robots.ts` : robots.txt.
- JSON-LD : `Organization` (layout) + `FAQPage` (page FAQ).
- Illustrations SVG locales (aucune image lourde) → très rapide.

## Déploiement

Le site est totalement statique en sortie de build et se déploie sur n'importe
quel hébergeur (Vercel, Netlify, serveur Node, conteneur) :

```bash
npm run build && npm run start
```

Vercel : importer le dépôt — aucun réglage requis (le middleware de langue est
inclus). Puis configurer `NEXT_PUBLIC_SITE_URL` et les URL du Portail.

## Zone « contact » / formulaire

Le formulaire de contact fonctionne **sans backend** : il prépare un e-mail
(`mailto:`) à l'adresse configurée. Pour une vraie soumission, branchez un
endpoint (Formspree, API, etc.) dans `src/components/sections/contact-form.tsx`.

---

© Emade3D — site développé pour l'entreprise. Tous droits réservés.