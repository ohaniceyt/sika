# Sika 💰 — app PWA de suivi de dépenses

**Sika** (l'argent, enakan) — suivi de budget personnel, design iOS (Human Interface Guidelines), **100% local** : aucune donnée ne quitte l'appareil, jamais.

**Installer** : ouvrez [https://ohaniceyt.github.io/sika/](https://ohaniceyt.github.io/sika/) sur votre téléphone
- iPhone (Safari) : bouton Partager → « Sur l'écran d'accueil »
- Android : « Installer l'application »

## Fonctionnalités
- **Onboarding** : prénom, devise (Euro, **FCFA** sans décimales, Dollar CAD/US, Livre, CHF), budget mensuel *optionnel*, répartition conseillée en enveloppes
- **Enveloppes budgétaires** par catégorie (barres colorées, dépassement signalé)
- **Saisie ultra-rapide** : chips des dépenses fréquentes + pavé numérique maison sur mobile (pas de clavier système)
- **Modifier/supprimer** : tap sur une dépense → fiche complète ; sur une catégorie, glisse à droite = modifier, à gauche = supprimer (confirmation)
- **Récurrences** mensuelles ou **hebdomadaires**, ajoutées automatiquement — moteur sans doublon, même en ouvrant l'app une fois par mois
- **Objectifs d'épargne** avec progression et suppression
- **Stats** : périodes mois / semaine / année (sélecteur), donut % ⇄ montant, comparatif vs mois ou semaine précédente, tendance 6 mois, série de saisie, objectifs atteints
- **Historique** : groupé par jour, recherche, filtres, pagination (200 par 200)
- **Données** : export CSV, sauvegarde/restauration JSON complète, **import de relevé bancaire CSV** avec détection du séparateur/format de date/`1 234,56`⇄`1,234.56` et **catégorisation automatique**, rappel de sauvegarde
- **Hors ligne** : service worker, tout marche sans réseau

## Technique
HTML/CSS/JS vanilla dans un seul `index.html` (~95 Ko), **zéro dépendance**, zéro serveur. Schéma de données versionné (v3), stockage `localStorage` (blindé contre la corruption), backup manuel encadré par un rappel automatique, focus-trap et `role="button"` sur les listes (clavier).

Design : [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) — SF Pro, couleurs système iOS, dark mode auto, safe-areas, header « liquid glass », sheets au ressort (`cubic-bezier(.32,.72,.33,1)`).

## Fichiers
- `index.html` — l'app complète (markup, styles, logique)
- `manifest.webmanifest` — manifeste PWA
- `sw.js` — service worker (network-first sur les navigations, offline-first)
- `icons/` — icônes (SVG source vecteur + PNG 192/512)

## Licence
MIT.