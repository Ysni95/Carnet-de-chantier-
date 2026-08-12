# Carnet de chantier — déploiement avec stockage partagé (Netlify Blobs)

Ce dossier contient tout ce qu'il faut pour héberger le carnet de chantier sur
Netlify avec un vrai stockage en ligne (les données seront les mêmes que tu
consultes depuis ton ordinateur ou ton iPhone).

## Contenu du dossier

- `index.html` — la page (identique à avant, mais elle appelle maintenant une
  fonction Netlify au lieu de `window.storage`, qui ne marche que dans
  l'aperçu Claude.ai)
- `netlify/functions/data.js` — la fonction serverless qui lit/écrit les
  données dans Netlify Blobs
- `netlify.toml` — la configuration de déploiement
- `package.json` — déclare la dépendance `@netlify/blobs` nécessaire à la
  fonction

## Important : pourquoi pas un simple glisser-déposer ?

Le glisser-déposer d'un seul fichier HTML sur Netlify ne permet pas
d'installer la fonction serverless (elle a besoin que `npm install` tourne
pour récupérer `@netlify/blobs`). Il faut donc déployer tout le dossier via
l'une de ces deux méthodes :

### Méthode recommandée : Netlify CLI (10 minutes, une seule fois)

1. Installe Node.js si ce n'est pas déjà fait : https://nodejs.org
2. Ouvre un terminal dans ce dossier et installe l'outil Netlify :
   ```
   npm install -g netlify-cli
   ```
3. Connecte-toi à ton compte Netlify :
   ```
   netlify login
   ```
4. Installe la dépendance :
   ```
   npm install
   ```
5. Déploie :
   ```
   netlify deploy --prod
   ```
   (la première fois, la CLI te demande de créer ou choisir un site — accepte
   les valeurs par défaut, le dossier à publier est `.`)

Pour les mises à jour futures, il suffira de relancer `netlify deploy --prod`
depuis ce dossier.

### Alternative : GitHub + Netlify

1. Crée un dépôt GitHub et mets-y tout le contenu de ce dossier
2. Sur Netlify : "Add new site" → "Import an existing project" → connecte le
   dépôt GitHub
3. Netlify détecte automatiquement `netlify.toml`, installe les dépendances et
   déploie la fonction

Avec cette méthode, chaque `git push` redéploie automatiquement le site.

## Après le déploiement

Ouvre l'URL Netlify sur ton ordinateur ET sur ton iPhone (Safari ou Chrome) :
les dépenses et les ouvriers que tu ajoutes depuis un appareil seront visibles
sur l'autre, car ils sont maintenant stockés côté serveur (Netlify Blobs) et
non plus dans le navigateur.

Astuce iPhone : dans Safari, utilise "Partager" → "Sur l'écran d'accueil" pour
avoir une icône qui ouvre directement le carnet, comme une vraie app.

## Protection par mot de passe

Le site demande maintenant un mot de passe avant d'afficher le carnet. Ce mot
de passe est vérifié côté serveur (dans la fonction Netlify), pas seulement
caché dans la page — donc quelqu'un qui regarde le code source ne peut pas le
contourner.

**Étape obligatoire avant que ça marche : définir le mot de passe sur Netlify**

1. Va sur ton site dans le tableau de bord Netlify (app.netlify.com)
2. "Site configuration" → "Environment variables" → "Add a variable"
3. Clé : `CARNET_PASSWORD`
   Valeur : le mot de passe de ton choix (ex: `Chantier2026`)
4. Sauvegarde, puis redéploie le site une fois ("Deploys" → "Trigger deploy" →
   "Deploy site") pour que la fonction prenne bien en compte la variable

Tant que cette variable n'est pas définie, la fonction refusera toutes les
requêtes (message d'erreur "CARNET_PASSWORD n'est pas configuré").

**Sur chaque appareil (ordi, iPhone)** : la première visite demande le mot de
passe. Il est ensuite mémorisé pour la session du navigateur (tant que
l'onglet reste ouvert) — si tu fermes complètement Safari ou ajoutes l'app à
l'écran d'accueil, il te sera probablement redemandé à la prochaine ouverture,
ce qui est normal pour ce niveau de sécurité simple.

**Limite à connaître** : ce mot de passe protège l'accès aux données, mais
n'importe qui qui le connaît peut aussi bien consulter que modifier le
carnet — il n'y a pas de rôles différents (lecture seule / écriture). Pour un
usage familial ou avec les artisans de confiance, c'est largement suffisant.
