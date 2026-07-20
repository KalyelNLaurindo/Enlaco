<p align="center">
  <img src="./src/assets/logo.png" alt="Enlaço Logo" width="128" height="128" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);" />
</p>

# Enlaço — Constrained Secret Santa Coordinator (SPA)

> A privacy-focused, zero-login Progressive Web App (PWA) with client-side drawing constraints, organizer blind mode, and offline QR-code sharing.

---

## 🎯 Project Overview

**Enlaço** is a modern, responsive, mobile-first Single Page Application (SPA) designed to orchestrate Secret Santa (amigo secreto) gift exchanges without requiring servers, database persistence, user accounts, or authorization. 

The engine runs entirely in the user's browser, utilizing a constrained draw algorithm to resolve match exclusions. It generates offline-sharable QR codes and encrypted token-based URLs that let participants safely reveal their recipient without exposing matches to anyone else—including the organizer.

---

## ✨ Features

* **Organizer Blind Mode:** The coordinator can set up and participate in the draw without spoiling their own surprise. Results are generated client-side and matches are never displayed to the coordinator's session.
* **Smartphone-Centric UI Transitions:** Landing and creation workflows are unified. When starting a draw, the desktop presentation sidebars collapse smoothly (`opacity` and `max-width` transitions), and the virtual phone mockup slides into the center viewport.
* **Advanced Drawing Constraints:** Set up bidirectional exclusion rules (e.g., prevent spouses or immediate family members from drawing each other).
* **Multi-Channel Distribution:** Share results individually via direct WhatsApp links, recovery emails, or by downloading/sharing an offline custom QR Code voucher image.
* **100% Offline-Capable (PWA):** Once loaded, the application operates completely offline. You can configure the draw, add participants, and generate matching outputs in airplane mode.
* **Bilingual Emoji Switcher:** Minimalist switcher rendering native country flag emojis (`🇧🇷`, `🇺🇸`, `🇪🇸`, `🇫🇷`, `🇩🇪`, `🇷🇺`) supporting Portuguese, English, Spanish, French, German, and Russian.

---

## 🛠️ Technology Stack

Enlaço is built using a clean, modern frontend architecture with minimal overhead:

### Core Framework & State
* **React 18.3 & TypeScript 5.6:** Strict type safety and functional component architecture.
* **Zustand 5.0:** Lightweight, custom-middleware-backed state management providing local storage persistence for draw state and history.
* **React Router Dom 7.1:** Client-side SPA routing hub managing transitions between creation, dashboard, success, and reveal surfaces.

### Drawing & Sharing Utilities
* **qrcode (npm):** Client-side QR code generator used to draw participant-specific match tokens onto offline `<canvas>` overlays. Allows downloading dynamic PNG vouchers.
* **Zod 4.4:** Declarative runtime schemas for validating participant entries, configuration limits, and imported draw JSON backups.

### Tooling & Build System
* **Vite 5.4:** Lightning-fast HMR and optimized bundler.
* **vite-plugin-pwa 1.3:** Seamless PWA registration, asset precaching, and service worker deployment for full offline capabilities.
* **Vitest 1.6 & JSDOM:** Fast, isolated testing framework running unit tests on domain services, store state, and UI components.
* **Google Fonts (Poppins & Inter):** Loaded via CSS imports for clean geometric headers (**Poppins**) and highly readable body copy (**Inter**).

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
