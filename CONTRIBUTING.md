# Contribuer au site Paris Video Tech

Tu fais partie du bureau et tu veux ajouter une conf, modifier l'équipe, retoucher un texte ? Voici comment faire selon le type de modif.

---

## Cas A — Modif de contenu simple (texte d'un MDX, ajout de meetup, prix sponsoring, etc.)

Pas besoin d'installer quoi que ce soit. Tout se fait depuis ton navigateur via GitHub.

### Pré-requis (une seule fois)

1. **Compte GitHub** — si tu n'en as pas, créer sur https://github.com/signup
2. **Accès au repo** — demande à Simon de t'ajouter comme collaborator (rôle "Write")

### Modifier un fichier

1. Va sur le repo GitHub (URL à demander à Simon).
2. Navigue jusqu'au fichier à modifier (par exemple `src/content/meetups/paris-video-tech-33.mdx`).
3. Clique sur l'icône **crayon** en haut à droite du fichier.
4. Modifie le contenu directement.
5. En bas, **"Commit changes"** :
   - Donne un message clair : `update: ajout détails PVT #33`
   - Choisis **"Commit directly to the main branch"**
6. Clique **Commit changes**.

→ Vercel détecte le push, rebuild, le site est mis à jour en 1-2 min.

### Ajouter un nouveau meetup

1. Dans `src/content/meetups/`, clique **Add file → Create new file**.
2. Nomme-le `paris-video-tech-34.mdx` (ou autre slug).
3. Copie le contenu d'un meetup existant comme template.
4. Modifie titre, date, summary, etc.
5. Commit.

---

## Cas B — Modif de code (CSS, composants, ajout d'une page)

Là il faut une install locale pour tester avant de pusher.

### Pré-requis (une seule fois)

1. **Git** — https://git-scm.com/downloads
2. **Node.js 22** — https://nodejs.org/ (LTS)
3. **Un éditeur de code** — recommandé : [VS Code](https://code.visualstudio.com/) avec l'extension Astro.
4. **Compte GitHub** + accès au repo.

### Récupérer le repo en local (une seule fois)

Ouvre un terminal (PowerShell sous Windows, Terminal sous macOS) :

```bash
cd <où tu veux mettre le projet>
git clone https://github.com/<owner>/pvt-website.git
cd pvt-website
npm install
```

`npm install` télécharge les dépendances (~30s).

### Lancer le site en local

```bash
npm run dev
```

→ ouvre http://localhost:4321 dans ton navigateur. Le site tourne avec hot reload : chaque modif d'un fichier est répercutée immédiatement à l'écran.

### Workflow type pour une modif

```bash
# 1. Récupère les dernières modifs poussées par les autres
git pull

# 2. Modifie ce que tu veux dans ton éditeur
#    (Astro recharge automatiquement la page)

# 3. Vérifie que ça compile sans erreur
npm run check:mdx    # valide les MDX
npm run build         # build complet

# 4. Commit + push
git add .
git commit -m "fix(header): corrige le menu mobile"
git push
```

→ Vercel rebuild, site mis à jour en 1-2 min.

---

## Structure du projet (pour t'orienter)

```
website/
├── public/                  # Images, fonts, fichiers statiques
│   ├── images/
│   │   ├── meetups/         # Covers des meetups
│   │   ├── team/            # Photos du bureau
│   │   └── sponsors/        # Logos sponsors
│   └── fonts/
├── src/
│   ├── content/meetups/     # 1 fichier .mdx par meetup
│   ├── data/                # Constantes (équipe, sponsors, prix sponsoring)
│   ├── components/          # Composants réutilisables (.astro)
│   ├── layouts/             # Layout global
│   ├── pages/               # 1 fichier .astro par page (sauf [slug].astro)
│   └── styles/              # tokens.css (couleurs/typo) + global.css
├── vercel.json              # Config Vercel (redirects + en-têtes sécurité)
└── package.json
```

### Fichiers fréquemment modifiés

| Tu veux modifier… | Va dans… |
|---|---|
| Le prochain meetup à venir | `src/content/meetups/paris-video-tech-XX.mdx` (changer `status: upcoming`) |
| Les détails d'une conf passée | `src/content/meetups/<slug>.mdx` |
| Un membre du bureau | `src/data/team.json` |
| Un sponsor | `src/data/sponsors.json` + logo dans `public/images/sponsors/` |
| Les prix sponsoring | `src/data/sponsorship.json` |
| Le contenu de la page À propos | `src/pages/a-propos.astro` |
| Les couleurs / typo globales | `src/styles/tokens.css` |
| Le menu nav | `src/components/Header.astro` |

---

## Règles d'hygiène Git de base

- **`git pull` avant de bosser** : récupère ce que les autres ont poussé.
- **Commits petits et ciblés** : un commit = un changement logique. Évite les commits massifs "j'ai tout modifié".
- **Message clair** : `add: PVT #34`, `fix: typo footer`, `update: prix sponsoring 2027`.
- **Push uniquement quand ça compile** : si `npm run build` plante en local, ça plantera sur Vercel.

---

## En cas de souci

- **`npm install` plante** → supprime `node_modules/` et `package-lock.json`, relance.
- **`npm run dev` plante** → regarde le message d'erreur, souvent un MDX cassé. Lance `npm run check:mdx` pour identifier.
- **Le build Vercel échoue** → va sur https://vercel.com/<projet>/deployments → clique sur le deploy en erreur → onglet "Build logs" → cherche l'erreur. La ligne en rouge te dit quel fichier coince.
- **Tu as un conflit Git après `git pull`** → demande de l'aide à Simon avant de bricoler à l'arrache, c'est facile de perdre du contenu.

---

## Contact

Pour toute question technique sur le projet : ping Simon en interne. Pour les questions "qu'est-ce qu'on met dans cette conf ?" : c'est une discussion bureau, pas technique.
