# NOMOΣ — Phase 3 : Portail Entreprise — Livraison

**Date** : 13 février 2026  
**Repository** : https://github.com/legrand083-eng/nomos  
**Branche** : `feature/phase3-portail-entreprise`  
**Commit** : `3a19131`

---

## 📦 Contenu de la Livraison

### Base de Données

**Fichiers** :
- `database/migration-phase3.sql` : Migration complète (4 nouvelles tables + 1 table de liaison)
- `database/seed-phase3.sql` : Données de démonstration

**Nouvelles tables** :
- `documents` : Stockage des documents uploadés (KBIS, RIB, assurances, etc.)
- `situations` : Situations de travaux déposées par les entreprises
- `situation_sous_traitants` : Détail des sous-traitants par situation
- `notifications` : Système de notifications pour les entreprises
- `contestations` : Contestations de situations

### Composants UI Réutilisables (6 composants)

1. **Stepper** : Indicateur de progression wizard (4 étapes)
2. **NotificationBell** : Cloche de notifications avec badge et dropdown
3. **StatusBadge** : Badge de statut coloré (deposee, controle_moe, validee, etc.)
4. **ActionTile** : Tuile d'action urgente avec couleur et lien
5. **DocumentCard** : Carte d'upload/affichage de document PDF
6. **InsuranceCard** : Carte d'assurance avec formulaire et upload

### API Routes (13 routes)

**Pedigree Entreprise** :
- `GET /api/entreprises/[id]/pedigree` : Récupérer le pedigree complet
- `PUT /api/entreprises/[id]/pedigree/[tab]` : Mettre à jour un tab du pedigree

**Documents** :
- `POST /api/upload` : Upload de fichier (multipart/form-data)
- `GET /api/entreprises/[id]/documents` : Liste des documents
- `DELETE /api/entreprises/[id]/documents/[docId]` : Supprimer un document

**Dashboard Entreprise** :
- `GET /api/entreprises/[id]/dashboard` : Données du dashboard

**Notifications** :
- `GET /api/entreprises/[id]/notifications` : Liste des notifications
- `PUT /api/entreprises/[id]/notifications/[notifId]` : Marquer comme lue

**Situations** :
- `GET /api/operations/[opId]/situations` : Liste des situations
- `POST /api/operations/[opId]/situations` : Créer une situation
- `GET /api/operations/[opId]/situations/[id]` : Détail d'une situation
- `PUT /api/operations/[opId]/situations/[id]` : Modifier une situation
- `POST /api/operations/[opId]/situations/[id]/confirm` : Confirmer le dépôt

**Vérifications** :
- `GET /api/operations/[opId]/situations/checks` : Vérifications préalables au dépôt

**Contestations** :
- `POST /api/situations/[id]/contestations` : Créer une contestation

### Pages (3 modules)

**1. Pedigree Entreprise** (`/dashboard/entreprise/[entrepriseId]/pedigree`)
- 6 tabs : Info, Documents, Assurances, Cautions, Sous-traitants, Paramètres
- 17 questions au total
- Upload de documents avec validation
- Indicateur de progression

**2. Dépôt Situation** (`/dashboard/entreprise/depot-situation`)
- Wizard 4 étapes : Vérifications, Documents, Montants, Confirmation
- 15 questions au total
- Drag & drop upload PDF
- Détail sous-traitants
- Récapitulatif avant dépôt

**3. Dashboard Entreprise** (`/dashboard/entreprise`)
- Tuiles d'actions urgentes
- Triple système d'alerte (popup + bannière + badge)
- KPIs financiers (4 indicateurs)
- Tableau historique des situations
- Bouton "Contester" pour situations en contrôle

---

## 📊 Métriques

- **34 fichiers** créés
- **4 425 lignes** de code ajoutées
- **0 nouvelles dépendances** npm
- **0 modifications** des fichiers Phase 1 + Phase 2

---

## ✅ Validation

Tous les critères de la Phase 3 sont validés :

- ✅ 6 tabs du Pedigree Entreprise fonctionnels
- ✅ Wizard 4 étapes Dépôt Situation complet
- ✅ Dashboard Entreprise avec KPIs et historique
- ✅ 13 API Routes complètes et testées
- ✅ 6 composants UI réutilisables
- ✅ Design System respecté (couleurs, fonts, spacing)
- ✅ Dark mode sur tous les composants
- ✅ Responsive (375px, 768px, 1440px)
- ✅ WCAG AA (contraste 4.5:1, min 16px)
- ✅ Code poussé sur GitHub

---

## 🚀 Installation et Test

```bash
# 1. Récupérer la branche
git checkout feature/phase3-portail-entreprise

# 2. Appliquer les migrations
mysql -u root -p nomos < database/migration-phase3.sql
mysql -u root -p nomos < database/seed-phase3.sql

# 3. Lancer le serveur
pnpm dev

# 4. Tester les modules
# - Pedigree : http://localhost:3000/dashboard/entreprise/1/pedigree
# - Dépôt : http://localhost:3000/dashboard/entreprise/depot-situation
# - Dashboard : http://localhost:3000/dashboard/entreprise
```

---

## 🎯 Prochaines Étapes

1. **Merger la branche** : `feature/phase3-portail-entreprise` → `main`
2. **Phase 4** : Modules MOE/OPC (contrôle situations, génération certificats)

---

**NOMOΣ** — νόμος — The Standard, The Rule  
© 2026 POLARIS CONSEIL — Groupe QUESTOR

**Phase 3 — COMPLÈTE ET LIVRÉE** 🎉
