# 🎁 Enlaço — Decoupled Constrained Gift-Exchange Draw Engine (Frontend)

[![Frontend CI/CD](https://github.com/kalyel/enlaco-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/kalyel/enlaco-frontend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)

Enlaço is a highly polished, mobile-first, zero-login Secret Santa (amigo secreto) drawing coordinator. This repository contains the Frontend Single Page Application (SPA), built using React, Vite, TypeScript, and Zustand. It implements a strict, constraint-based drawing configuration wizard and a highly secure, private "Tap-to-Reveal" participant landing page.

---

## 🎯 Business Value & Objectives

- **The Organizer Surprise (Blind Mode):** Standard gift-exchange managers force the coordinator to sacrifice their surprise or manually write paper slips. Enlaço resolves this through **Organizer Blind Mode**, allowing the coordinator to participate in the draw without ever exposing the matches to their own browser session or administration logs.
- **Privacy First (No Accounts):** No login, SSO, or emails are required for participants. Secure URL tokens (`resultToken`) serve as the sole access-control method.
- **Decoupled Architecture:** Drawing generation and result viewing are strictly isolated surfaces to prevent accidental peek leaks.

---

## 🧭 Repository Structure

This project follows an atomic, feature-based directory structure:

```
src/
├── domain/
│   └── types/
│       └── index.ts                 # Pure business entities and contracts
├── validation/
│   └── schemas/
│       ├── draw.ts                  # Zod validation schemas
│       └── draw.test.ts             # Validation unit test cases
├── features/
│   ├── wizard/                      # Sorteio Creation Wizard Feature
│   │   ├── components/              # Step 0 to 3 UI Step Components
│   │   ├── hooks/                   # useWizardAutosave hook (Debounced local state)
│   │   ├── store/                   # Zustand local storage persistent store
│   │   └── WizardPage.tsx           # Page orchestrator & progress stepper
│   └── reveal/                      # Tap-to-Reveal Participant Landing Feature
│       ├── components/              # RevealCard UI Component
│       └── RevealPage.tsx           # Chrome-free centered layout wrapper
├── test/
│   └── setup.ts                     # Vitest global testing setup
├── App.tsx                          # BrowserRouter app shell routing
├── main.tsx                         # DOM entrypoint
└── index.css                        # Design System tokens & base CSS rules
```

---

## 🛠️ Visual DNA & Design System

The application strictly implements the visual rules defined in the project design brief:

- **Typography:** Pinned to **Quicksand** (Google Fonts) for display/headers to convey a friendly, rounded tone, and **Nunito** for high legibility body copy.
- **Color Palette (Dark Default):**
  - Base Background: `#0F0F12`
  - Surface Card: `#18181D`
  - Accent Color: `#FF2E93` (Pill buttons, active states, key highlight text)
  - Success Feedback: `#2FE6B0`
  - Error/Validation: `#FF5C5C`
- **Shape & Touch Targets:** Flat design with border-only separation (`#2C2C34`), generous `20px` card borders, and touch targets constrained to a minimum of `44x44px` on all buttons for mobile accessibility.

---

## ⚙️ Quick Start (Developer Setup)

### Prerequisites
- **Node.js:** v20.19.0 or higher
- **npm:** 10.2.4 or higher

### Local Installation
1. Clone this repository to your workstation.
2. Install the production and development dependencies:
   ```bash
   npm install
   ```

### Command Reference

| Action | Command | Description |
|---|---|---|
| **Development** | `npm run dev` | Spins up local Vite development server. |
| **Linting** | `npm run lint` | Runs ESLint check across all TSX/TS files. |
| **Typecheck** | `npx tsc --project tsconfig.app.json --noEmit` | Validates TypeScript strict compiler rules. |
| **Testing** | `npm run test` | Launches Vitest suite in interactive watch mode. |
| **Test Run** | `npm run test -- run` | Runs full Vitest suite once (used in CI/CD pipeline). |
| **Build** | `npm run build` | Compiles source files into production-ready `dist/` bundle. |
| **Preview** | `npm run preview` | Serves compiled assets locally for integration checks. |

---

## 🧪 Automated Testing & Quality Checks

The repository relies on strict TDD checks. Before pushing code or creating a PR, verify the type correctness and test suite status:

```bash
# 1. Type correctness check
npx tsc --project tsconfig.app.json --noEmit

# 2. Run all 70 test suites
npm run test -- run --reporter=verbose
```

---

## 🌐 PWA & Service Worker Support

This app acts as an installable **Progressive Web App (PWA)** using `vite-plugin-pwa`. It includes offline caching capabilities and registers service workers automatically when deployed to production.

---

## 🛡️ License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Autoria/Assinatura:** Kalyel N. Laurindo / Software Engineer
