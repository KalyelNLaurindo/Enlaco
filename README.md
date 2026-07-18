# Enlaço — Private Gift Exchange Draw Engine

![Status](https://img.shields.io/badge/status-in_development-blue.svg)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB?logo=react)
![License](https://img.shields.io/badge/license-MIT-green)

> A constraint-aware gift exchange engine that delivers each participant's match **privately** — the organizer never sees the full mapping.

---

## 📌 Status

**In development phase.** Scaffolding is complete, and domain validation schemas are fully implemented and verified via TDD.

---

## 🎯 The Problem

Every existing Secret Santa solution forces a tradeoff: whoever organizes the draw ends up knowing everyone's pairing and can't fully participate. Paper slips, generic websites, and chat bots all share the same structural flaw — they conflate **draw generation** (an algorithm problem) with **private result delivery** (a distribution problem) into one step or one device.

**Enlaço separates them.**

---

## 📄 Project Documentation

| Document | Purpose |
|---|---|
| [Problem Discovery](context/Problem%20Discovery%20-%20Enlaço.md) | Root cause analysis, stakeholder interviews, JTBD framework |
| [Requirements Specification](context/Requirements%20Specification%20-%20Enlaço.md) | Functional requirements, MoSCoW prioritization |
| [Software Design Document](context/Software%20Design%20Document%20-%20Enlaço.md) | Solution architecture, data schemas, API contracts |
| [Design Brief](context/Design%20Brief%20-%20Enlaço.md) | Visual design direction, UX principles |
| [Implementation Flow](context/Implementation%20Flow%20-%20Enlaço.md) | Execution roadmap and TDD specifications |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v20.11.0 or higher
- npm v10.2.4 or higher

### Installation
Install project dependencies:
```bash
npm install
```

### Running Tests (TDD)
Execute the Vitest test suite:
```bash
npm run test
```

### Running Development Server
Start the Vite development server:
```bash
npm run dev
```

---

## 👤 Author

**Kalyel N. Laurindo / Software Engineer**
[GitHub](https://github.com/KalyelNLaurindo) · [LinkedIn](https://www.linkedin.com/in/kalyel-n-laurindo/)

***
**Autoria/Assinatura:** Kalyel N. Laurindo / Software Engineer
