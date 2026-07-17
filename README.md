# Enlaço — Private Gift Exchange Draw Engine

![Status](https://img.shields.io/badge/status-in_design-yellow.svg)
![Stack](https://img.shields.io/badge/stack-TBD%20(React%20%2B%20Vite)-61DAFB?logo=react)
![License](https://img.shields.io/badge/license-MIT-green)

> A constraint-aware gift exchange engine that delivers each participant's match **privately** — the organizer never sees the full mapping.

---

## 📌 Status

**In design phase.** Full discovery, requirements specification, and software design documents are written. Implementation has not started.

---

## 🎯 The Problem (short version)

Every existing Secret Santa solution forces a tradeoff: whoever organizes the draw ends up knowing everyone's pairing and can't fully participate. Paper slips, generic websites, and chat bots all share the same structural flaw — they conflate **draw generation** (an algorithm problem) with **private result delivery** (a distribution problem) into one step or one device.

**Enlaço separates them.**

---

## 🗄️ Legacy

This project is the **planned successor** to [meu-brother-secreto](https://github.com/KalyelNLaurindo/meu-brother-secreto), an earlier React implementation of the same concept built before any architectural planning. That v1 was deprecated due to structural debt.

Enlaço starts fresh with proper documentation-first engineering.

---

## 📄 Project Documentation

| Document | Purpose |
|---|---|
| [Problem Discovery](context/Problem%20Discovery%20-%20Enlaço.md) | Root cause analysis, stakeholder interviews, JTBD framework, cost of inaction |
| [Requirements Specification](context/Requirements%20Specification%20-%20Enlaço.md) | Functional and non-functional requirements, MoSCoW prioritization |
| [Software Design Document](context/Software%20Design%20Document%20-%20Enlaço.md) | Architecture, data model, component design, security, CI/TDD strategy |
| [Design Brief](context/Design%20Brief%20-%20Enlaço.md) | Visual design direction, UX principles, UI component spec |

---

## 💡 Core Feature: Organizer-Blind Draw

The defining constraint: the organizer can **also participate** in the draw without ever seeing the full participant→match mapping. Each person receives their own result via an individual private link — no shared screen, no organizer as the reveal bottleneck.

---

## 👤 Author

**Kalyel N. Laurindo / Software Engineer**
[GitHub](https://github.com/KalyelNLaurindo) · [LinkedIn](https://www.linkedin.com/in/kalyel-n-laurindo/)
