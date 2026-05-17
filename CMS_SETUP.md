# Setup Decap CMS — guide pas-à-pas

Toute la partie code est déjà en place dans le projet :
- `public/admin/index.html` + `public/admin/config.yml` — interface Decap CMS
- Widget Netlify Identity chargé dans le `BaseLayout` (pour intercepter les
  emails d'invitation depuis n'importe quelle page)
- CSP étendue pour autoriser `identity.netlify.com`
- Schéma typé de la collection `meetups` (frontmatter validé)

Il te reste **3 actions côté dashboard Netlify** + un test final.

---

## 1. Activer Netlify Identity (2 min)

1. Va sur https://app.netlify.com → clique sur ton site.
2. **Site configuration → Identity** (dans la sidebar gauche).
3. Clique sur **Enable Identity**.

C'est tout pour cette étape. Identity est activé.

---

## 2. Restreindre les inscriptions à "Invite only" (1 min)

Indispensable. Sinon n'importe qui sur Internet pourrait créer un compte sur
`/admin/` et éditer le contenu.

1. Toujours dans **Identity** (sidebar).
2. **Registration → Registration preferences**.
3. Choisir **Invite only** (au lieu de "Open").
4. **Save**.

À ce stade, personne ne peut s'inscrire — uniquement les utilisateurs que tu
invites explicitement.

---

## 3. Activer Git Gateway (2 min)

Git Gateway est la passerelle qui permet à Decap CMS d'écrire dans le repo
GitHub sans demander à chaque utilisateur de se connecter avec son compte
GitHub personnel.

1. Toujours dans **Identity** (sidebar).
2. **Services → Git Gateway**.
3. Clique sur **Enable Git Gateway**.
4. Netlify te demande d'autoriser l'accès au repo GitHub via OAuth →
   approuver. Tu signes en tant que propriétaire du repo.

Une fois activé, Netlify a un token GitHub qui permet à Decap d'effectuer
des commits dans ton repo au nom de l'utilisateur authentifié.

---

## 4. Inviter les membres du bureau (5 min)

1. **Identity → Invite users**.
2. Saisir les emails des membres du bureau qui doivent pouvoir éditer le
   site. Par exemple :
   - benoit@... (président)
   - gregoire@... (trésorier)
   - simon.laroque@gmail.com (toi)
   - etc.
3. Envoie. Chaque membre reçoit un email avec un lien de confirmation.

Quand un membre clique sur le lien :
- Il atterrit sur `https://parisvideotech.com/#invite_token=...`
- Le widget Netlify Identity (chargé en defer sur toutes les pages)
  intercepte le hash, lui demande de **choisir un mot de passe**, puis
  **redirige automatiquement vers `/admin/`**.

---

## 5. Test final

1. Va sur `https://idyllic-piroshki-6306de.netlify.app/admin/` (ou ton
   domaine final une fois le DNS basculé).
2. Le widget Decap s'ouvre. Login avec tes identifiants Netlify Identity.
3. Tu dois voir la collection **Meetups** avec les 41 articles.
4. Clique sur **"Nouveau meetup"** → un formulaire structuré s'ouvre
   (titre, date, statut, intervenants, etc.).
5. Sauvegarde → Decap fait un commit dans le repo → Netlify rebuild
   automatiquement.

---

## Workflow éditorial typique pour la prochaine conf

Quand tu auras les détails du **PVT #33 du 30 juin** :

1. Ouvre `/admin/`, login.
2. Édite **Paris Video Tech #33** (le placeholder existant).
3. Remplis :
   - `Lieu` (ex. "Le Wagon, Paris 11e")
   - `Résumé` (mise à jour avec le programme)
   - `Intervenants` (un par un avec nom + société + LinkedIn + titre du talk)
   - `Image de couverture` (upload via Decap, stocké dans `public/images/meetups/`)
4. **Publish** → commit auto → site mis à jour en 1-2 minutes.

Quand le replay sera dispo :
- Re-éditer, passer `Statut: Passé`, remplir `Lien YouTube du replay`.

---

## Workflow pour ajouter un futur meetup (PVT #34, #35...)

1. `/admin/` → **Nouveau meetup**.
2. Remplis title, date, statut "À venir", lieu, résumé.
3. Publish.

Decap crée un fichier `src/content/meetups/paris-video-tech-XX-....mdx`
automatiquement, avec un slug basé sur le titre. Le site se met à jour
au prochain build.

---

## Désactivation temporaire

Si tu veux désactiver l'admin (maintenance), tu peux :
- **Désactiver Identity** côté Netlify dashboard (les sessions existantes
  expirent).
- Ou ajouter une protection mot de passe Netlify sur `/admin/*` via
  **Site configuration → Visitor access → Password protection**.

---

## En cas de souci

- **Login échoue** : vérifier que l'email a bien été invité (Identity → Users).
- **Sauvegarde échoue** : vérifier que Git Gateway est bien activé (étape 3).
- **`/admin/` montre une page blanche** : ouvrir DevTools console, regarder
  les erreurs CSP. Si tu vois une erreur sur `unpkg.com` ou
  `identity.netlify.com`, la CSP doit être étendue (mais c'est déjà fait
  dans `netlify.toml`).

---

## Bonus — gestion des rôles (si besoin plus tard)

Decap CMS permet de différencier les rôles via les attributs `roles` de
Netlify Identity. Par exemple, on pourrait limiter le statut "publier" à
un petit groupe (Simon + président) et laisser les autres en "brouillon".

À mettre en place plus tard si nécessaire — voir
https://decapcms.org/docs/git-gateway-backend/#roles.
