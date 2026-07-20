<p align="center">
  <img src="./src/assets/logo.png" alt="Enlaço Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);" />
</p>

# Enlaço — Constrained Secret Santa Coordinator (SPA)

> A privacy-focused, zero-login Progressive Web App (PWA) with client-side drawing constraints, organizer blind mode, and offline QR-code sharing.

<p align="center">
  <a href="https://github.com/KalyelNLaurindo/Enlaco/actions/workflows/ci.yml">
    <img src="https://github.com/KalyelNLaurindo/Enlaco/actions/workflows/ci.yml/badge.svg" alt="Frontend CI/CD" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://zustand.docs.pmnd.rs/">
    <img src="https://img.shields.io/badge/Zustand-5.0-black?logo=react&logoColor=white" alt="Zustand" />
  </a>
  <a href="https://zod.dev/">
    <img src="https://img.shields.io/badge/Zod-4.4-3E67B1?logo=zod&logoColor=white" alt="Zod" />
  </a>
  <a href="https://www.npmjs.com/package/qrcode">
    <img src="https://img.shields.io/badge/QRCode-1.5-blueviolet" alt="QRCode" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  </a>
  <a href="https://vite-pwa-org.netlify.app/">
    <img src="https://img.shields.io/badge/PWA-Ready-orange?logo=pwa&logoColor=white" alt="PWA" />
  </a>
  <a href="https://vitest.dev/">
    <img src="https://img.shields.io/badge/Vitest-1.6-729B1B?logo=vitest&logoColor=white" alt="Vitest" />
  </a>
</p>

<p align="center">
  <b>Languages</b><br>
  <a href="./README.md">🇧🇷 Português</a> | 
  <a href="./README.es.md">🇪🇸 Español</a> | 
  <a href="./README.fr.md">🇫🇷 Français</a> | 
  <a href="./README.de.md">🇩🇪 Deutsch</a> | 
  <a href="./README.ru.md">🇷🇺 Русский</a>
</p>

---

## 🎯 Project Overview

**Enlaço** is a modern, responsive, mobile-first Single Page Application (SPA) designed to orchestrate Secret Santa (amigo secreto) gift exchanges without requiring servers, database persistence, user accounts, or authorization. 

The engine runs entirely in the user's browser, utilizing a constrained draw algorithm to resolve match exclusions. It generates offline-sharable QR codes and encrypted token-based URLs that let participants safely reveal their recipient without exposing matches to anyone else—including the organizer.

---

## 🚀 Key Features

* **Organizer Blind Mode:** The coordinator can set up and participate in the draw without spoiling their own surprise. Results are generated client-side and matches are never displayed to the coordinator's session.
* **Smartphone-Centric UI Transitions:** Landing and creation workflows are unified. When starting a draw, the desktop presentation sidebars collapse smoothly (`opacity` and `max-width` transitions), and the virtual phone mockup slides into the center viewport.
* **Advanced Drawing Constraints:** Set up bidirectional exclusion rules (e.g., prevent spouses or immediate family members from drawing each other).
* **Multi-Channel Distribution:** Share results individually via direct WhatsApp links, recovery emails, or by downloading/sharing an offline custom QR Code voucher image.
* **100% Offline-Capable (PWA):** Once loaded, the application operates completely offline. You can configure the draw, add participants, and generate matching outputs in airplane mode.
* **Bilingual Emoji Switcher:** Minimalist switcher rendering native country flag emojis (`🇧🇷`, `🇺🇸`, `🇪🇸`, `🇫🇷`, `🇩🇪`, `🇷🇺`) supporting Portuguese, English, Spanish, French, German, and Russian.

---

## 🛠️ Complete Tech Stack & External Dependencies

The application relies on the following libraries, dependencies, and external assets:

* **React (v18.3.1) & React-DOM (v18.3.1):** Core functional component library and virtual DOM rendering engine.
* **TypeScript (v5.6.2):** Strict typing and domain modeling.
* **React Router DOM (v7.18.1):** Client-side router managing views (`/`, `/criar`, `/sorteio/:drawId`, `/sorteio/:drawId/concluido`, and `/r/:resultToken`).
* **Zustand (v5.0.14):** State store backing up history, participants list, and exclusion rules directly to client-side `localStorage`.
* **Zod (v4.4.3):** Runtime schema validator parsing local state backups and configuration boundaries.
* **qrcode (v1.5.4):** Library generating dynamic QR codes, drawing them on a `<canvas>` context together with branding to export PNG vouchers.
* **Google Fonts (Poppins & Inter):** Web typefaces loaded in stylesheet. Poppins acts as the geometric header font, while Inter handles data grids and form body copy.
* **Logos & Brand Graphics:** Premium dark-themed icon artwork (`/src/assets/logo.png` and `/public/logo.png`) serving as the app logo and PWA manifest target icon.
* **Vite (v5.4.10) & Vite Plugin PWA (v1.3.0):** Build tool and Progressive Web App compiler generating manifest parameters and background service worker caches.
* **Vitest (v1.6.0), jsdom (v24.1.3), and @testing-library/react (v16.3.2):** Standard testing suite providing strict user interaction simulation for TDD verification.

---

## 🧭 Repository Structure

```
src/
├── assets/                  # High-quality brand assets, icons, and logos
├── components/              # Globally shared components (e.g., LanguageSwitcher flag controls)
├── domain/                  # Core domain logic
│   ├── services/            # Pure services (match generator, token crypto, i18n dictionary)
│   └── types/               # TypeScript domain model contracts
├── features/                # Self-contained business flows
│   ├── dashboard/           # Organizer administrative board (view history, export audit CSV)
│   ├── landing/             # Main landing shell & smartphone slide transition container
│   ├── reveal/              # Participant Tap-to-Reveal card page
│   └── wizard/              # Sorteio creation steps (details, participants, exclusions, review)
│       └── components/      # Creation steps subcomponents & success panel
├── test/                    # Global unit test suite configuration
├── App.tsx                  # BrowserRouter routing hub
├── index.css                # Visual theme tokens (HSL colors, glassmorphism templates)
└── main.tsx                 # Application mounting entrypoint
```

---

## 📖 User Guide: How it Works

### 1. Set Event Details
Enter your event's name, description, recommended budget, and date. You can choose to enable **Blind Mode** (so the organizer doesn't know who they drew) and provide a recovery email.

### 2. Add Participants & Delivery Channels
Input the name of each participant and their preferred sharing channel. You can select:
* **WhatsApp Link:** Automatically pre-fills a message to send directly.
* **Recovery Email:** Pre-fills mail links.
* **QR / Presential:** Generates a QR Code on the organizer's device that participants can scan in person.

### 3. Configure Exclusions
Set up exclusion rules. For example, if "Alice" and "Bob" are a couple, add a rule preventing Alice from drawing Bob and vice-versa. The engine's backtracking algorithm handles the constraints client-side.

### 4. Review & Draw Animation
Review your group settings. Click **"Sortear"** to run the matching algorithm. An animated shuffling overlay will simulate the draw, generating encrypted tokens for each match.

### 5. Sharing the Match
On the success page, click **"Compartilhar QR Codes"**. You can:
* Click **WhatsApp** to open a direct chat.
* Click **Download PNG** to save a coupon voucher showing the event logo, the participant name, and their personalized QR Code to share via any messenger app offline.

### 6. Tap-to-Reveal
When a participant scans their QR Code or opens their reveal link:
1. They are taken to a clean, chrome-free page showing a virtual gift card.
2. They click the card to animate the reveal.
3. The page reads the encrypted URL token, decrypts it client-side, and reveals the name of their recipient.

---

## ⚙️ Developer Guide (Setup & Verification)

### Local Development
To launch the hot-reloading development server locally:
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Test execution (TDD Verification)
This project enforces strict test coverage on domain functions, store transitions, and i18n translations. To run the full test suite:
```bash
# Run Vitest suite once (CI mode)
npm run test -- run
```

### Static Typechecking & Linting
Validate strict TypeScript compiler guidelines and ESLint configurations:
```bash
# Strict TypeScript check
npx tsc --project tsconfig.app.json --noEmit

# Linting check
npm run lint
```

### Production Build
Generate optimized static files for deployment:
```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🛡️ License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

***

**Author:** Kalyel Nunes Laurindo / Software Engineer
