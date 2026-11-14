# PROJECT SPEC — MacroBatch (Clean Culinary Tech)

## Vision du Produit
Application web d'optimisation de **batch cooking protéiné et budgétaire** conçue pour transformer une session cuisine dominicale d'1h20 en 10 repas (20 portions pour 2 personnes) structurés autour d'une matrice modulaire (**3 Bases Protéinées × 2 Bases Glucides/Légumes × 3 Sauces Maison = 5 Assemblages variés**).

## Direction Artistique : "Clean Culinary Tech"
- **Fond principal** : Crème / Blanc cassé (`#FAF8F5`)
- **Surfaces & Cartes** : Blanc pur (`#FFFFFF`) et Ivoire chaud (`#F3EFE6`) avec bordures subtiles (`#E6E0D4`)
- **Typographie** : Éditoriale lisible (Serif éditorial pour les titres culinaires + Sans-serif géométrique pour l'interface + Monospace tabulaire pour les macros, prix, ratios et chronomètres)
- **Accents chromatiques** :
  - **Vert Sauge (`#2D5A27`)** : Indicateurs budgétaires, rentabilité, validation et fraîcheur
  - **Ambre Chaud (`#D97706`)** : Indicateurs de densité protéique, énergie et minuteurs actifs

## Architecture Fonctionnelle (Single-Page MVP Interactive)
1. **Vue 1 : Configurateur & KPIs**
   - Sélecteur dynamique du nombre de personnes (1 à 6 personnes, défaut : 2 personnes soit 20 portions/semaine) et filtres d'objectifs.
   - Recalcul temps réel de toutes les quantités (briques, assemblages, liste de courses) et des coûts.
   - 3 Cartes KPI principales : Coût total du panier, Coût par portion (cible Éco < 3,20€/portion), Protéines moyennes par repas & par jour (cible 130g/jour).
2. **Vue 2 : La Matrice & Assemblages**
   - Visualisation des 8 briques préparées le dimanche (3 Protéines, 2 Bases Glucides/Légumes, 3 Sauces maison).
   - 5 Assemblages de repas détaillés croisant `[Base] + [Protéine] + [Sauce]` avec macros exactes (Protéines, Glucides, Lipides, Kcal) et coût exact par portion.
3. **Vue 3 : Liste de Courses Intelligente**
   - Liste interactive avec cases à cocher, barre de progression du panier et filtrage par rayon de supermarché français.
   - Affichage du prix réel constaté et du badge d'efficacité protéique (`g de protéines / €`) pour chaque ingrédient.
4. **Vue 4 : Mode "Session Cuisine" (Live Timer — 1h20)**
   - Rétroplanning chronologique en 8 étapes de `T+00` à `T+80 min`.
   - Chronomètre interactif en direct, barre de progression globale, cases à cocher par étape et mode focus adapté à l'usage mobile sur le plan de travail.
