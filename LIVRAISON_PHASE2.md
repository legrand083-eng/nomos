# NOMOΣ — Phase 2 — Livraison Complète

**Date** : 12 février 2026  
**Branche GitHub** : `feature/phase2-pedigree`  
**Commit** : `24a2e4b` — "Phase 2 - Pedigree Opération (6 sections, 83 questions)"  
**Repository** : https://github.com/legrand083-eng/nomos

---

## ✅ Livraison Complète

La **Phase 2 de NOMOΣ** a été développée dans son intégralité et poussée sur GitHub.

### 📦 Contenu de la livraison

#### Base de Données

**Fichier** : `database/migration-phase2.sql`
- Extension de la table `operations` avec 45+ nouveaux champs (Sections A, B, D, E)
- Création de la table `intervenants` (Section C)
- Création de la table `jalons` (Section D)
- Extension de la table `lots` (Section F)
- Extension de la table `entreprises` (Section F)

**Fichier** : `database/seed-phase2.sql`
- Données complètes pour l'opération TOTEM (P388L)
- 5 intervenants (MOA, MOE, Architecte, BET Structure, OPC)
- 4 jalons (Démarrage, Terrassements, Clos couvert, Réception)
- 5 lots avec données de révision de prix

#### Composants UI Réutilisables (7 composants)

1. **CurrencyInput** : Champ montant en euros avec format français
2. **PercentInput** : Champ pourcentage avec validation
3. **DateInput** : Sélecteur de date HTML5
4. **ToggleSwitch** : Interrupteur animé (gold quand actif)
5. **SiretInput** : Validation SIRET avec algorithme de Luhn
6. **FileUpload** : Upload de fichiers avec drag & drop
7. **SectionProgress** : Indicateur circulaire de progression

#### API Routes (8 routes)

1. `GET /api/operations/[id]/pedigree` : Récupération complète
2. `PUT /api/operations/[id]/pedigree/[section]` : Sauvegarde par section
3. `POST /api/operations/[id]/intervenants` : Création intervenant
4. `PUT /api/operations/[id]/intervenants/[intervenantId]` : Modification
5. `DELETE /api/operations/[id]/intervenants/[intervenantId]` : Suppression
6. `POST /api/operations/[id]/jalons` : Création jalon
7. `PUT /api/operations/[id]/jalons/[jalonId]` : Modification
8. `DELETE /api/operations/[id]/jalons/[jalonId]` : Suppression

#### Page Pedigree (6 sections complètes)

**Fichier** : `src/app/dashboard/operations/[id]/pedigree/page.js` (800+ lignes)

**Section A — Identification** (9 questions)
- Type d'opération (public/privé)
- Type de marché (travaux/MOE/mixte)
- Forme de marché (ordinaire/BEFA/CPI/VEFA/etc.)
- Description de l'opération
- Département et région
- Budget HT et TTC
- Nombre de lots

**Section B — Juridique** (5 questions)
- Référentiel contractuel (CCAG 2021/2009/NF P03-001)
- Upload CCAP (PDF)
- Dérogations au CCAG (toggle + textarea)

**Section C — Intervenants** (15 questions)
- Type d'intervenant (13 types disponibles)
- Nom, SIRET
- Contacts multiples (Direction, Technique, Comptabilité)
- Mandataire, Signature certificats
- Table CRUD complète

**Section D — Planning** (14 questions)
- Dates OS1/OS2
- Durée globale et préparation
- Date fin calculée automatiquement
- Congés annuels (début/fin)
- Intempéries prévues
- Réunions chantier (jour, fréquence)
- Date limite situation
- Table jalons avec CRUD

**Section E — Financier** (28 questions)
- Retenue de garantie (taux, mode)
- Avance forfaitaire (taux, base, remboursement)
- Avance sur approvisionnements
- Prorata (mode, taux, gestionnaire)
- Révision de prix (type)
- Pénalités de retard (mode, montant, plafond)
- Pénalité absence réunion
- Insertion sociale (heures prévues)

**Section F — Entreprises** (12 questions)
- Table lots avec entreprises associées
- Affichage SIRET, montants, durée
- Indice de révision
- Lien vers module Entreprises

**Fichier CSS** : `pedigree.module.css` (500+ lignes)
- Design System strict (Navy, Gold, Cyan)
- Responsive (375px, 768px, 1440px)
- Dark mode compatible
- Animations fluides

---

## 📊 Métriques de Développement

- **Fichiers créés** : 25
- **Lignes de code** : 3 653 insertions
- **Composants UI** : 7
- **API Routes** : 8
- **Sections Pedigree** : 6 (A→F)
- **Questions totales** : 83
- **Tables DB créées** : 2 (intervenants, jalons)
- **Champs DB ajoutés** : 82

---

## 🎯 Contraintes Respectées

✅ **Aucune nouvelle dépendance npm**  
✅ **Aucune modification des fichiers Phase 1**  
✅ **Design System strict** (couleurs, fonts, spacing Fibonacci)  
✅ **WCAG AA** (contraste 4.5:1, min 16px)  
✅ **Dark mode** sur tous les composants  
✅ **Responsive** (375px, 768px, 1440px)  
✅ **JavaScript uniquement** (pas de TypeScript)  
✅ **CSS custom** (pas de Tailwind, pas de UI libraries)

---

## 🚀 Instructions de Déploiement

### 1. Cloner et installer

```bash
git clone https://github.com/legrand083-eng/nomos.git
cd nomos
git checkout feature/phase2-pedigree
pnpm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env.local
# Éditer .env.local avec vos variables MySQL
```

### 3. Appliquer les migrations

```bash
# Phase 1
mysql -u root -p nomos < database/schema.sql
mysql -u root -p nomos < database/seed.sql

# Phase 2
mysql -u root -p nomos < database/migration-phase2.sql
mysql -u root -p nomos < database/seed-phase2.sql
```

### 4. Lancer le serveur

```bash
pnpm dev
# Ouvrir http://localhost:3000
```

### 5. Accéder au Pedigree

1. Se connecter avec `christophe@polarisconseil.pro` / `Nomos2026!` / `DURchr`
2. Aller dans Dashboard → Opérations
3. Cliquer sur l'opération TOTEM (P388L)
4. Accéder à `/dashboard/operations/1/pedigree`

---

## 📋 Checklist de Validation

Tous les points de la checklist Phase 2 sont validés :

- [x] migration-phase2.sql s'exécute sans erreurs
- [x] seed-phase2.sql peuple les données TOTEM
- [x] Page Pedigree charge à `/dashboard/operations/1/pedigree`
- [x] Les 6 tabs s'affichent et switchent correctement
- [x] Section A : formulaire sauvegarde et charge
- [x] Section B : formulaire + upload CCAP (placeholder)
- [x] Section C : ajout/modification/suppression intervenants
- [x] Section D : dates calculées, table jalons fonctionne
- [x] Section E : tous les toggles montrent/cachent les champs conditionnels
- [x] Section F : lots s'affichent avec entreprises associées
- [x] Progress indicator se met à jour après sauvegarde
- [x] Dark mode fonctionne sur tous les nouveaux composants
- [x] Responsive à 375px, 768px, 1440px
- [x] Aucune nouvelle dépendance npm ajoutée
- [x] Code poussé sur GitHub

---

## 🔗 Liens

- **Repository** : https://github.com/legrand083-eng/nomos
- **Branche** : `feature/phase2-pedigree`
- **Pull Request** : https://github.com/legrand083-eng/nomos/pull/new/feature/phase2-pedigree

---

## 📝 Notes Techniques

### Calcul du Pedigree Completion

Le pourcentage de complétion est calculé automatiquement dans l'API `PUT /api/operations/[id]/pedigree/[section]` via la fonction `updatePedigreeCompletion()`. Elle compte les champs remplis sur 83 questions totales.

### Validation SIRET

Le composant `SiretInput` utilise l'algorithme de Luhn pour valider les numéros SIRET en temps réel. Un indicateur visuel (✓/✗) et un message d'aide s'affichent.

### Dates Calculées

Dans la Section D, la date de fin prévue est calculée automatiquement : `date_os1 + duree_globale_mois`. Le calcul se fait côté client avec `useEffect`.

### Champs Conditionnels

Les sections B et E utilisent des toggles pour afficher/masquer des champs conditionnels :
- Dérogations CCAG → textarea
- Avance forfaitaire → taux, base, remboursement
- Avance appro → taux
- Prorata → taux, gestionnaire
- Insertion sociale → heures prévues

---

**NOMOΣ** — νόμος — The Standard, The Rule  
© 2026 POLARIS CONSEIL — Groupe QUESTOR

**Phase 2 — COMPLÈTE ET LIVRÉE**
