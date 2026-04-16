# Vault.env

A premium, zero-knowledge `.env` and project management hub. All encryption happens client-side using AES-256-GCM with PBKDF2 key derivation. Your master password never leaves your browser.

## Features

- **Zero-Knowledge Encryption**  -  Secrets are encrypted/decrypted entirely in the browser using the Web Crypto API (AES-GCM 256-bit). Firestore only stores ciphertext, IV, and salt.
- **Master Password Lock**  -  A full-screen vault lock overlay derives the AES key via PBKDF2 (600K iterations). The key is held in volatile memory only.
- **Project Dashboard**  -  Organize secrets by project with a Bento-grid card layout.
- **3-Tab Workspace**  -  Each project has Secrets (spreadsheet-style), Files (encrypted upload via Firebase Storage), and Notes (Markdown editor).
- **Bulk Import**  -  Paste raw `.env` content and import all key-value pairs at once.
- **Auto-Lock**  -  10-minute idle timer clears the encryption key and redirects to the lock screen.
- **Firebase Auth**  -  Email/password authentication with Firebase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Backend | Firebase (Auth, Firestore, Storage) |
| Encryption | Web Crypto API (AES-GCM 256-bit, PBKDF2) |
| Styling | Tailwind CSS v4 + Framer Motion |
| State | Zustand |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd vault.env
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Create a **Firestore** database
4. Enable **Storage**
5. Copy your config values

```bash
cp .env.example .env.local
```

Fill in your Firebase config values in `.env.local`.

### 3. Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage
```

Or copy the rules from `firestore.rules` and `storage.rules` into the Firebase Console.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout with Geist font
│   ├── page.tsx              # Entry point → redirects to dashboard
│   ├── globals.css           # Design tokens & custom utilities
│   ├── dashboard/
│   │   ├── layout.tsx        # Auth + vault guard
│   │   └── page.tsx          # Project grid
│   └── project/
│       ├── layout.tsx        # Auth + vault guard
│       └── [id]/page.tsx     # Workspace with 3-tab system
├── components/
│   ├── ui/                   # Button, Card, Input, Modal, Tabs, Spinner
│   ├── auth/                 # AuthForm (login/register)
│   ├── vault/                # AppShell, LockScreen, Header
│   └── project/              # ProjectCard, CreateProjectModal, SecretsTab, FilesTab, NotesTab
├── hooks/
│   ├── useAuth.ts            # Firebase auth state listener
│   └── useIdle.ts            # 10-min idle auto-lock
├── lib/
│   ├── crypto.ts             # AES-GCM encrypt/decrypt + PBKDF2
│   ├── firebase.ts           # Firebase app init
│   ├── firestore.ts          # All Firestore CRUD operations
│   └── utils.ts              # cn(), formatters, constants
└── store/
    └── vault-store.ts        # Zustand store for master password + auth state
```

## Security Model

1. **Master Password** is used with PBKDF2 (600K iterations, SHA-256) to derive an AES-256-GCM key
2. The derived key exists **only in browser memory** (Zustand store)  -  never written to disk, localStorage, or Firestore
3. Every secret value is encrypted individually with a unique salt + IV before being stored in Firestore
4. Files are encrypted as raw `ArrayBuffer` before being uploaded to Firebase Storage
5. Auto-lock clears the key from memory after 10 minutes of inactivity
6. A verification payload is stored to validate the master password without exposing it

## License

MIT
