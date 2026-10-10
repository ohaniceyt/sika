# Sika 💰 — app PWA de suivi de dépenses

**Sika** (l'argent, enakan) — suivi de budget personnel, design iOS (Human Interface Guidelines), **100% local** : aucune donnée ne quitte l'appareil, jamais.

**Installer** : ouvrez [https://ohaniceyt.github.io/sika/](https://ohaniceyt.github.io/sika/) sur votre téléphone
- iPhone (Safari) : bouton Partager → « Sur l'écran d'accueil »
- Android : « Installer l'application »

## Fonctionnalités
- **Onboarding** : prénom, devise (Euro, **FCFA** sans décimales, Dollar CAD/US, Livre, CHF), budget mensuel *optionnel*, répartition conseillée en enveloppes
- **Enveloppes budgétaires** par catégorie (barres colorées, dépassement signalé)
- **Saisie ultra-rapide** : chips des dépenses fréquentes + pavé numérique maison sur mobile (pas de clavier système)
- **Modifier/supprimer** : tap sur une dépense → fiche complète (avec **« Même dépense aujourd'hui »** en 1 tap) ; sur une catégorie, glisse à droite = modifier, à gauche = supprimer avec **réaffectation au choix** des dépenses et récurrences
- **Récurrences** mensuelles ou **hebdomadaires**, ajoutées automatiquement — moteur sans doublon, même en ouvrant l'app une fois par mois ; **tap sur une récurrence pour la modifier** (montant, catégorie, fréquence, jour) ou l'arrêter
- **Objectifs d'épargne** avec progression et suppression
- **Stats** : périodes mois / semaine / année (sélecteur), donut % ⇄ montant, comparatif vs mois ou semaine précédente, tendance 6 mois, série de saisie, objectifs atteints
- **Historique** : groupé par jour, recherche, filtres, pagination (200 par 200)
- **Données** : export CSV, sauvegarde/restauration JSON complète, **import de relevé bancaire CSV** avec détection du séparateur/format de date/`1 234,56`⇄`1,234.56` et **catégorisation automatique**, rappel de sauvegarde **+ bandeau mensuel** (archivage du mois précédent dans les 7 premiers jours)
- **Hors ligne** : service worker, tout marche sans réseau

## Technique
HTML/CSS/JS vanilla dans un seul `index.html` (~100 Ko), **zéro dépendance**, zéro serveur. Schéma de données versionné (v3), stockage `localStorage` (blindé contre la corruption), backup manuel encadré par un rappel automatique + bandeau mensuel, focus-trap et `role="button"` sur les listes (clavier).

Icônes : source vectorielle unique `icons/icon.svg` (~0,9 Ko) → PNG compressés palette (~10–12 Ko) + **écrans de démarrage iOS** light/dark (une taille exacte par appareil, `apple-touch-startup-image`). Régénérables en 1 commande : `node scripts/gen-ios-assets.mjs` (script dev, nécessite `npm i sharp`, pas déployé).

Design : [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) — SF Pro, couleurs système iOS, dark mode auto, safe-areas, header « liquid glass », sheets au ressort (`cubic-bezier(.32,.72,.33,1)`).

## Fichiers
- `index.html` — l'app complète (markup, styles, logique)
- `manifest.webmanifest` — manifeste PWA
- `sw.js` — service worker (network-first sur les navigations, offline-first)
- `icons/` — icônes (SVG source vecteur + PNG 180/192/512) et `icons/splash/` — écrans de démarrage iOS
- `scripts/gen-ios-assets.mjs` — générateur dev des PNG (script, pas déployé)

## Licence
MIT.