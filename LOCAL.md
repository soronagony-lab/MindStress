# MindStress — développement

## BD locale (recommandé pour coder)

Firestore et Auth tournent **sur ta machine** via les **Firebase Emulators**. Aucune donnée n’est envoyée au cloud tant que `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`.

### 1. Variables `.env.local`

```bash
cp .env.example .env.local
```

Contenu minimal pour la BD locale :

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_APP_ID=local
```

Tu peux laisser `NEXT_PUBLIC_FIREBASE_CONFIG` vide : une **config démo** est utilisée automatiquement avec l’émulateur.

### 2. Dépendances

```bash
cd mindstress-app
npm install
```

### 3. Terminal A — émulateurs Firestore + Auth

```bash
npm run emulators
```

La première fois, `npx` télécharge **firebase-tools** (normal). Les émulateurs Firestore nécessitent **Java (JRE)** installé sur la machine.

Laisse ce processus ouvert. UI des émulateurs : [http://localhost:4000](http://localhost:4000)  
Ports par défaut : Firestore **8080**, Auth **9099** (voir `firebase.json`).

### 4. Terminal B — Next.js

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Les chemins Firestore restent `/artifacts/{appId}/...` avec **`appId = local`** par défaut (ou `NEXT_PUBLIC_APP_ID`).

### 5. Dr. Mind (IA)

`GEMINI_API_KEY` dans `.env.local` si tu veux tester le chat (clé Google AI, hors Firebase).

---

## Sans émulateur (cloud Firebase / Inforge)

Mets **`NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`** (ou supprime la ligne) et renseigne :

- `NEXT_PUBLIC_APP_ID`
- `NEXT_PUBLIC_FIREBASE_CONFIG` ou `NEXT_PUBLIC_FIREBASE_CONFIG_B64`

---

## GitHub

- Ne commite **jamais** `.env.local`.
- Tu peux commiter `firebase.json`, `firestore.rules`, `.firebaserc`.

---

## Vercel (déploiement)

1. **Ne pas** activer l’émulateur en prod : `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` absent ou `false`.
2. Variables : `NEXT_PUBLIC_APP_ID`, config Firebase, `GEMINI_API_KEY`, etc.
3. **Root Directory** du projet Vercel : `mindstress-app` si le repo parent contient ce dossier.

La base de données en production est alors celle du **projet Firebase** (éventuellement alignée avec Inforge pour les règles / chemins).

---

## Ordre de priorité — config Firebase (client)

1. `window.__firebase_config` (Inforge sur la page)
2. `NEXT_PUBLIC_FIREBASE_CONFIG`
3. `NEXT_PUBLIC_FIREBASE_CONFIG_B64`
4. Si `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` et rien d’autre → config démo pour l’émulateur
