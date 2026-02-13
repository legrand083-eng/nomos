# NOMOΣ — Phase 1 Documentation

**νόμος — The Standard, The Rule**

## Vue d'ensemble

NOMOΣ est une plateforme SaaS pour la gestion des certificats de paiement dans le secteur BTP français, conforme au CCAG 2021.

Cette **Phase 1** établit les fondations techniques de l'application :
- Authentification sécurisée avec JWT
- Design System complet
- Structure de navigation par rôle
- Base de données MySQL
- Architecture Next.js optimisée pour O2Switch

## Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Front-end** | Next.js (App Router) | 14.2.21 |
| **Framework** | React | 18.3.1 |
| **Base de données** | MySQL | 8.x |
| **Authentification** | JWT + bcrypt | - |
| **Hébergement** | O2Switch | - |
| **Node.js** | >= 20.0.0 | - |

## Installation

### Prérequis

- Node.js >= 20.0.0
- MySQL 8.x
- pnpm (recommandé) ou npm

### Étapes

1. **Cloner le projet**
   ```bash
   cd /home/ubuntu/nomos
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   
   Modifier `.env.local` avec vos valeurs :
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`

4. **Créer la base de données**
   
   Via phpMyAdmin ou ligne de commande MySQL :
   ```sql
   CREATE DATABASE nomos_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Exécuter le schéma**
   ```bash
   mysql -u nomos_user -p nomos_dev < database/schema.sql
   ```

6. **Charger les données de démonstration**
   ```bash
   mysql -u nomos_user -p nomos_dev < database/seed.sql
   ```

7. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```
   
   L'application sera accessible sur `http://localhost:3000`

## Comptes de démonstration

Tous les comptes utilisent le mot de passe : **`Nomos2026!`**

| Rôle | Email | Code anti-robot |
|------|-------|-----------------|
| **Admin** | christophe@polarisconseil.pro | DURchr |
| **MOE** | moe@demo-nomos.pro | MARsop |
| **OPC** | opc@demo-nomos.pro | DUBjea |
| **MOA** | moa@demo-nomos.pro | LERmar |
| **Entreprise** | entreprise@demo-nomos.pro | BERpie |
| **Comptabilité** | compta@demo-nomos.pro | PETcla |

## Structure du projet

```
nomos/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.js           # Layout racine
│   │   ├── page.js             # Page d'accueil (Temple)
│   │   ├── connexion/          # Page de connexion
│   │   ├── dashboard/          # Dashboard protégé
│   │   └── api/                # API Routes
│   │       └── auth/           # Endpoints d'authentification
│   ├── components/
│   │   ├── ui/                 # Composants UI réutilisables
│   │   ├── layout/             # Header, Sidebar, Footer
│   │   └── modules/            # Composants métier (Phase 2+)
│   ├── lib/
│   │   ├── db.js               # Connexion MySQL
│   │   ├── auth.js             # Logique d'authentification
│   │   ├── middleware.js       # Protection des routes
│   │   └── utils.js            # Fonctions utilitaires
│   └── styles/
│       └── globals.css         # Design System NOMOΣ
├── database/
│   ├── schema.sql              # Schéma de base de données
│   └── seed.sql                # Données de démonstration
├── public/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── docs/
│   └── README.md               # Ce fichier
├── package.json
├── next.config.js
└── .env.local
```

## Design System

### Couleurs

| Usage | Hex | Variable CSS |
|-------|-----|--------------|
| Navy (primaire) | `#0F1A2E` | `--color-navy` |
| Gold (accent) | `#C9A227` | `--color-gold` |
| Cyan (info) | `#00E5FF` | `--color-cyan` |
| Success | `#22C55E` | `--color-success` |
| Warning | `#F59E0B` | `--color-warning` |
| Error | `#EF4444` | `--color-error` |

### Typographie

- **Branding** : Cinzel (600)
- **Interface** : DM Sans (400-700)
- **Nombres/Code** : JetBrains Mono (400-500)

### Espacement (Fibonacci)

`3px`, `5px`, `8px`, `13px`, `21px`, `34px`, `55px`

## Authentification

### Flux de connexion

1. L'utilisateur saisit email, mot de passe et code anti-robot
2. Le code anti-robot est validé : `NOM[0-2].toUpperCase() + prenom[0-2].toLowerCase()`
3. Le mot de passe est vérifié avec bcrypt
4. Un JWT access token (15 min) et refresh token (7 jours) sont générés
5. Le refresh token est stocké en base de données
6. Une seule session active par utilisateur (nouvelle connexion = suppression de la précédente)

### Sécurité

- **JWT** : HS256, clés séparées pour access et refresh
- **Mots de passe** : bcrypt avec 12 rounds
- **Tentatives échouées** : verrouillage après 5 tentatives (30 min)
- **Session** : expiration après 8h d'inactivité, logout forcé après 24h
- **Screen lock** : après 15 min d'inactivité (Phase 2)

## Déploiement sur O2Switch

### Préparation

1. **Build de production**
   ```bash
   pnpm build
   ```

2. **Créer le fichier server.js**
   ```javascript
   const { createServer } = require('http');
   const { parse } = require('url');
   const next = require('next');
   
   const dev = process.env.NODE_ENV !== 'production';
   const hostname = 'localhost';
   const port = process.env.PORT || 3000;
   
   const app = next({ dev, hostname, port });
   const handle = app.getRequestHandler();
   
   app.prepare().then(() => {
     createServer(async (req, res) => {
       try {
         const parsedUrl = parse(req.url, true);
         await handle(req, res, parsedUrl);
       } catch (err) {
         console.error('Error occurred handling', req.url, err);
         res.statusCode = 500;
         res.end('internal server error');
       }
     }).listen(port, (err) => {
       if (err) throw err;
       console.log(`> Ready on http://${hostname}:${port}`);
     });
   });
   ```

### Déploiement via cPanel

1. **Connexion SSH**
   ```bash
   ssh user@your-domain.fr
   ```

2. **Créer le répertoire**
   ```bash
   mkdir -p /home/account/nomos
   ```

3. **Transférer les fichiers**
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.next' ./ user@server:/home/account/nomos/
   ```

4. **Installer les dépendances sur le serveur**
   ```bash
   cd /home/account/nomos
   npm install --production
   npm run build
   ```

5. **Configurer Setup Node.js App dans cPanel**
   - Application root : `nomos`
   - Application startup file : `server.js`
   - Node version : 20 ou 22
   - Application mode : Production

6. **Créer la base de données MySQL**
   - Via cPanel → MySQL Databases
   - Exécuter `schema.sql` puis `seed.sql` via phpMyAdmin

7. **Configurer .env.production**
   ```bash
   cp .env.example .env.production
   # Modifier avec les valeurs de production
   ```

8. **Démarrer l'application**
   - Via cPanel → Setup Node.js App → Restart

## Validation Phase 1

### Checklist fonctionnelle

- [x] `npm install` complète sans erreurs
- [x] `npm run dev` démarre sans erreurs sur le port 3000
- [x] Page d'accueil affiche le logo NOMOΣ avec la couleur gold `#C9A227`
- [x] Page de connexion avec formulaire fonctionnel
- [x] Validation du code anti-robot
- [x] Toggle dark mode fonctionne sur toutes les pages
- [x] Design responsive (mobile 375px, tablette 768px, desktop 1440px)
- [x] Schéma MySQL se crée sans erreurs
- [x] Données seed s'insèrent sans erreurs
- [x] Connexion avec identifiants démo retourne un JWT
- [x] Routes protégées retournent 401 sans token
- [x] Routes protégées retournent 403 avec mauvais rôle
- [x] Session unique : nouvelle connexion supprime la session précédente
- [x] Structure de fichiers conforme au prompt
- [x] Aucune bibliothèque UI externe (Material UI, Chakra, Tailwind, shadcn)
- [x] Couleurs, polices et espacements conformes au Design System

## Prochaines phases

### Phase 2 : Modules métier (à venir)

- Gestion des certificats de paiement
- Révision de prix automatique
- Calcul des pénalités de retard
- Signature électronique (Code MAÎTRE)
- Exports comptables

### Phase 3 : Optimisations (à venir)

- Dashboard analytics
- Notifications temps réel
- Gestion documentaire avancée
- API publique

## Support

Pour toute question technique ou demande de support :

**POLARIS CONSEIL — Groupe QUESTOR**  
Email : contact@polarisconseil.pro  
Téléphone : 06 72 33 11 70

---

**NOMOΣ** — νόμος — The Standard, The Rule  
© 2026 POLARIS CONSEIL — Groupe QUESTOR — Confidentiel
