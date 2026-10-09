# Sika 💰 — app PWA de suivi de dépenses

Suivi de budget personnel, design iOS (Human Interface Guidelines), 100% local : aucune donnée ne quitte l'appareil.

**Installer** : ouvrez [https://ohaniceyt.github.io/sika/](https://ohaniceyt.github.io/sika/) sur votre téléphone
- iPhone : bouton Partager → « Sur l'écran d'accueil »
- Android : « Installer l'application » (bouton natif du navigateur)

## Fonctionnalités
- Enveloppes budgétaires par catégorie (dépassements signalés)
- Catégories personnalisables (nom, couleur, émoji) — créées/supprimées
- Dépenses récurrentes automatiques (loyer, abonnements)
- Objectifs d'épargne avec progression
- Comparatif vs mois précédent, stats par catégorie, série de saisie
- Recherche, export CSV, sauvegarde/restauration JSON
- Mode hors ligne complet (service worker)

## Technique
HTML/CSS/JS vanilla, zéro dépendance, ~85 Ko. Schéma de données versionné (v3), données stockées dans localStorage. PWA installable (manifest + SW network-first).

## Fichiers
- `index.html` — l'app complète (markup, styles, logique)
- `manifest.webmanifest` — manifeste PWA
- `sw.js` — service worker (offline)
- `icons/` — icônes (SVG source + PNG 192/512)
