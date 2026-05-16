# Site web Paris Video Tech

Site officiel de l'association **Paris Video Tech** — refonte 2026, hors WordPress.

**Stack :** [Astro](https://astro.build/) + TypeScript + MDX + [Decap CMS](https://decapcms.org/)
**Hébergement :** [Netlify](https://www.netlify.com/) (CI/CD natif depuis GitHub)
**Phase actuelle :** 1 — Fondations techniques.

---

## Prérequis

- **Node.js 22.x** (voir `.nvmrc`)
- **npm 10.x**

Optionnel pour l'éditeur :
- Extension VS Code **Astro** ([astro-build.astro-vscode](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode))
- Extension VS Code **Prettier**

---

## Démarrage

```bash
# Installation des dépendances
npm install

# Serveur de dev (http://localhost:4321)
npm run dev

# Build de production (dans dist/)
npm run build

# Prévisualisation du build de production
npm run preview

# Type-check
npm run check

# Formatage du code
npm run format
```

---

## Structure du projet

```
website/
├── public/                  # Assets statiques servis tels quels
│   ├── admin/               # Decap CMS (interface /admin/)
│   ├── fonts/               # Polices locales (.ttf, à migrer en .woff2)
│   ├── images/              # Logos, photos équipe, sponsors, covers meetups
│   └── robots.txt
├── src/
│   ├── components/          # Composants Astro réutilisables
│   ├── content/
│   │   ├── config.ts        # Schéma Zod des Content Collections
│   │   └── meetups/         # Articles meetups en MDX (1 fichier = 1 meetup)
│   ├── data/                # JSON/TS de constantes (équipe, sponsors, site)
│   ├── layouts/             # Layouts globaux
│   ├── pages/               # Routes du site
│   └── styles/              # tokens.css, fonts.css, global.css
├── astro.config.mjs
├── netlify.toml             # Config Netlify (build + headers + redirections)
├── package.json
└── tsconfig.json
```

---

## Ajouter une conférence

### Option A — Via Decap CMS (recommandé pour le bureau)

Une fois le site déployé sur Netlify :

1. Ouvrir `https://parisvideotech.com/admin/`.
2. Se connecter (Netlify Identity).
3. Cliquer "Meetups" → "New meetup".
4. Remplir le formulaire (titre, date, statut, intervenants, lien YouTube, résumé, contenu).
5. Cliquer "Publish".

Decap commit le MDX dans le repo, Netlify rebuild et redéploie automatiquement (~1 min).

### Option B — En direct dans le repo (workflow dev)

Créer un fichier `src/content/meetups/mon-meetup.mdx` :

```mdx
---
title: 'Paris Video Tech #33 — Sujet du meetup'
date: 2026-09-15T19:00:00+02:00
status: upcoming    # ou "past" si déjà passé
location: 'Le Wagon, Paris 11e'
summary: 'Phrase courte qui résume le meetup.'
speakers:
  - name: 'Jean Dupont'
    role: 'CTO'
    company: 'Streamco'
    talk_title: 'Live streaming à très basse latence'
    linkedin: 'https://www.linkedin.com/in/...'
youtube_url: 'https://www.youtube.com/watch?v=...'   # si replay dispo
tags: ['HLS', 'LLHLS', 'CMAF']
---

Contenu Markdown libre — description longue, contexte, lien vers les slides, etc.

## Programme

- ...
```

Puis `git push` → Netlify rebuild.

---

## Mettre à jour la prochaine conférence (cadence 4/an)

Le hero de la home affiche automatiquement le meetup avec `status: upcoming`. Pour
le mettre à jour :

1. Passer l'ancien meetup `upcoming` à `status: past`.
2. Créer/éditer le nouveau avec `status: upcoming`.

Il ne doit y avoir qu'**un seul** meetup avec `status: upcoming` à la fois.

---

## Charte graphique

- Couleurs : `#CE031B` (rouge), `#324147` (gris foncé), `#FFFFFF`.
- Typographies : **Montserrat** (display) + **Roboto** (corps).
- Toutes les valeurs sont dans `src/styles/tokens.css`.

Pour modifier la charte (Phase 4) : éditer `tokens.css`, l'ensemble du site est
automatiquement mis à jour.

---

## Déploiement (à configurer)

### Première configuration

1. Pousser ce repo sur GitHub (`pvt-website` ou nom au choix).
2. Sur [app.netlify.com](https://app.netlify.com/), "Add new site" → "Import from Git".
3. Sélectionner le repo. Netlify détecte automatiquement Astro
   (build command : `npm run build`, publish : `dist`).
4. Déployer. URL provisoire : `<random>.netlify.app`.

### Configurer Decap CMS

1. Dans Netlify : **Site settings → Identity → Enable Identity**.
2. **Identity → Registration → Invite only** (recommandé pour limiter aux membres du bureau).
3. **Identity → Services → Git Gateway → Enable**.
4. **Identity → Invite users** → ajouter les emails des membres du bureau.
5. Tester sur `https://<votre-site>.netlify.app/admin/`.

### Bascule du domaine `parisvideotech.com`

1. Dans Netlify : **Domain management → Add custom domain → parisvideotech.com**.
2. Configurer le DNS chez ton registrar (CNAME ou ALIAS vers Netlify).
3. Activer le HTTPS auto (Let's Encrypt).
4. Netlify gère la redirection www → apex.

---

## Phase 1 (en cours) — état

- ✅ Bootstrap projet Astro + TypeScript
- ✅ Design system (`tokens.css`, `fonts.css`, `global.css`)
- ✅ Layouts (`BaseLayout`) + composants (`Header`, `Footer`, `Button`, `SocialIcon`)
- ✅ Pages : home, meetups-recents, rejoignez-nous, a-propos, mentions-legales,
  politique-de-confidentialite, [slug] (catch-all articles), 404
- ✅ Content Collection `meetups` avec schéma Zod typé
- ✅ Configuration Netlify (build + headers de sécurité + redirections)
- ✅ Configuration Decap CMS (`/admin/`)
- ✅ Données initiales (équipe, sponsors)
- ⏳ Conversion des fonts TTF → WOFF2 (à faire en cours de phase)
- ⏳ Rapatriement des médias depuis l'export WP (photos équipe, sponsors)
- ⏳ Création SVG du logo (ou conservation PNG si SVG indispo)

## Phase 2 (à venir) — migration contenu

- Script `scripts/wp-to-mdx.mjs` qui parse le SQL WP et génère 40 MDX
  dans `src/content/meetups/`.
- Rapatriement et optimisation des covers meetups.
- Recette : chaque article du WP existe-t-il dans le nouveau site ?

---

## Aide & contact

- **Chef de projet :** Simon Laroque
- **Email asso :** contact@parisvideotech.com
- **Docs projet :** voir `../AUDIT.md`, `../DESIGN_AUDIT.md`, `../ARBO.md`,
  `../DECISIONS.md` (un dossier au-dessus de ce repo).
