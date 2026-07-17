# 🎨 Design Brief: Enlaço — Consolidated Design Package

**Role:** Head of UX/UI & Product Design (condensed authorship, portfolio-scope decision)
**Scope Note:** This single document replaces the standard 7-file Design Pipeline (Information Architecture, User Interaction Flows, Low-Fidelity Layout, Visual DNA & Tokens, Component Library, Design Handoff Spec, Design QA) for this portfolio project, per explicit stakeholder decision to condense delivery. It contains equivalent decisions at reduced depth.
**Input Source:** `context/Problem Discovery - Enlaço.md` + direct stakeholder visual-preference interview.
**Date:** July 7, 2026
**Document Version:** v1.0

---

## 01. Information Architecture

### Sitemap

```
Enlaço
├── / (Home / Landing)
│   └── CTA: "Criar sorteio"
│
├── /criar (Create Draw Wizard — Organizer, multi-step)
│   ├── Step 1: Participants (add name + delivery channel per person)
│   ├── Step 2: Exclusion Rules (pairwise "cannot draw" constraints)
│   ├── Step 3: Organizer Participation (toggle: play blind / manage only)
│   ├── Step 4: Review & Generate (irreversible action, confirm modal)
│
├── /sorteio/:drawId (Organizer Dashboard, post-generation)
│   ├── Delivery status per participant (sent / opened / pending)
│   ├── Resend / copy individual link action
│   └── (No access to who-got-whom if organizer opted blind)
│
├── /r/:resultToken (Participant Reveal Page — private, unguessable link)
│   ├── Pre-reveal state (tap-to-reveal interaction)
│   └── Post-reveal state (result card, optional wishlist note field)
│
└── /r/:resultToken (error variants)
    ├── Expired / already-claimed link
    └── Invalid token
```

### Navigation Model
Linear, wizard-driven for the organizer (`/criar`); zero-navigation, single-purpose landing for participants (`/r/:resultToken` — no nav chrome, no way to browse other participants' state). This directly enforces the Problem Discovery root cause fix: generation and reveal are architecturally separate surfaces, not just separate steps on one screen.

---

## 02. User Interaction Flows

### Flow A — Organizer (standard)
`Home → Create Wizard (Participants → Exclusions → Blind toggle OFF → Review) → Generate → Dashboard (share links/QR per channel) → monitor delivery status`

### Flow B — Organizer (blind mode)
Same as Flow A with Blind toggle ON at Step 3. On generation, the organizer's own result is routed through the same `/r/:resultToken` private link as any other participant — the Dashboard explicitly masks their own pairing. This is the direct interaction-design answer to Persona 1's core pain ("the one who draws can't play").

### Flow C — Participant (any channel: email / WhatsApp link / QR)
`Receive channel message → open /r/:resultToken → tap-to-reveal → result card shown → (optional) leave wishlist note`
No login, no account creation — token-in-URL is the only auth mechanism (matches Problem Discovery's out-of-scope: "no enterprise-grade authentication/SSO").

### Flow D — Error / Edge Case
`Open expired or already-claimed link → explicit state screen (not a silent redirect) → CTA: "Contact your organizer"`. This directly closes the gap in Problem Discovery Field 9.2 (no fallback existed before for broken flows).

---

## 03. Low-Fidelity Layout Notes

- **Wizard (`/criar`)**: single-column, mobile-first, fixed-bottom primary CTA (thumb-reach), step indicator pinned at top. Each step is a full-screen focused task — no multi-step forms crammed onto one view (reduces error rate vs. paper-slip cross-checking pain point).
- **Participant chip list (Step 1/2)**: horizontally-wrapping chip row, each chip removable; exclusion pairs selected via a two-tap "select A → select B" interaction rather than a dropdown matrix (avoids N×N grid complexity at higher participant counts, up to ~50 per Problem Discovery scope).
- **Reveal page (`/r/:resultToken`)**: full-bleed centered layout, no header/footer chrome, single card, generous whitespace — deliberately isolates the participant from any surrounding UI so the moment reads as private and intentional, not like a generic app screen.
- **Dashboard (`/sorteio/:drawId`)**: status list, one row per participant, badge-driven status (sent/opened/pending), no pairing data rendered anywhere on this screen even for non-blind organizers post-generation (reduces temptation/accidental exposure risk).

---

## 04. Visual DNA & Tokens

### Color Palette (Dark Mode default)

| Token | Hex | Usage |
|---|---|---|
| `color.bg.base` | `#0F0F12` | App background |
| `color.bg.surface` | `#18181D` | Cards, panels, wizard steps |
| `color.bg.surface-raised` | `#212127` | Modals, popovers |
| `color.border.default` | `#2C2C34` | Dividers, input borders |
| `color.text.primary` | `#F5F5F7` | Headings, primary content |
| `color.text.secondary` | `#A3A3AE` | Supporting text, labels |
| `color.text.disabled` | `#5C5C66` | Disabled states |
| `color.accent.default` | `#FF2E93` | Primary CTA, active states, reveal highlight |
| `color.accent.hover` | `#FF57AA` | Hover state |
| `color.accent.pressed` | `#D6167A` | Pressed/active |
| `color.feedback.success` | `#2FE6B0` | Delivery confirmed, valid actions |
| `color.feedback.warning` | `#FFC857` | Pending states |
| `color.feedback.error` | `#FF5C5C` | Expired link, validation errors |

**Light mode** is defined as a secondary token set (inverted neutrals, same accent/feedback hues adjusted for AA contrast on white) — deferred to implementation-time generation via the same token names, not detailed further at this scope depth.

**Accessibility note:** `color.accent.default` (#FF2E93) on `color.bg.base` (#0F0F12) must be contrast-checked at implementation time (target WCAG AA 4.5:1 for text use; large-scale/decorative use only if it fails).

### Typography

| Token | Family | Usage |
|---|---|---|
| `font.display` | Quicksand (600/700) | H1/H2, reveal moment headline — rounded humanist letterforms carry the playful tone |
| `font.body` | Nunito (400/600) | Body text, labels, buttons — pairs cleanly with Quicksand, high legibility at small sizes |
| `font.mono` (optional) | JetBrains Mono | Result tokens/codes if displayed as text (rare — QR/link is primary) |

Type scale (px, 1.25 ratio): `12 / 14 / 16(base) / 20 / 25 / 31 / 39 / 49`

### Spacing & Shape

- **Spacing scale (4px base grid):** `4, 8, 12, 16, 24, 32, 48, 64`
- **Border radius:** `radius.sm = 12px` (inputs), `radius.md = 20px` (cards), `radius.pill = 9999px` (buttons, chips, badges) — confirmed "bem arredondado" direction.
- **Elevation:** flat design with border-based separation (`color.border.default`) as primary hierarchy tool; soft shadow (`0 8px 24px rgba(0,0,0,0.4)`) reserved for modals/popovers only.

### Iconography & Illustration
- **Icon set:** Phosphor Icons, `regular` (line) weight as default, `fill` weight only for active/selected states.
- **Illustration:** light, flat-vector illustrations at emotional high-points only — reveal pre-state (wrapped gift motif), empty states (no participants yet), error state (broken link motif). Not used decoratively elsewhere, to keep production scope realistic for a portfolio build.

---

## 05. Component Library (Key Components)

| Component | Variants | Notes |
|---|---|---|
| `Button` | primary (filled, pill, accent), secondary (outline, pill), ghost (text-only) | Min touch target 44×44px |
| `TextField` | default, error, disabled | `radius.sm`, label above field |
| `ParticipantChip` | default, removable | Pill shape, avatar-initial + name + close icon |
| `ExclusionPairSelector` | two-tap select A/B | Renders as chip-to-chip link once paired, removable |
| `ToggleSwitch` | on/off | Used for organizer-blind mode |
| `Stepper` | 4-step (wizard) | Horizontal on desktop, condensed dot-indicator on mobile |
| `StatusBadge` | sent / opened / pending / expired | Pill, color-coded via `color.feedback.*` |
| `RevealCard` | pre-reveal (tap prompt), post-reveal (result) | `radius.md`, illustration slot at top |
| `ConfirmModal` | destructive-confirm (irreversible generate) | Explicit "this cannot be undone" copy required |
| `QRDisplayBlock` | with copy-link fallback | Used in organizer Dashboard per participant |
| `Toast` | success, error | Non-blocking, auto-dismiss |
| `EmptyState` | illustration + message + CTA | Used pre-participants and on broken-link error page |

---

## 06. Design Handoff — Data-to-UI Mapping

Conceptual mapping only (contract detail belongs to Carla Dupont's SDD, not to this brief):

| UI Surface | Reads | Writes |
|---|---|---|
| Create Wizard | — | Draw draft (participants[], exclusionRules[], organizerBlind: bool) |
| Review & Generate | Draw draft | Triggers draw generation (irreversible) + delivery dispatch |
| Organizer Dashboard | Draw status, per-participant delivery state | Resend action (re-dispatch only, never re-reveals pairing) |
| Reveal Page | Single result by `resultToken` (participant-scoped, never the full mapping) | Marks token as claimed on first reveal; optional wishlist note |
| Error Page | Token validity check | — |

**Critical invariant for Engineering (flag for Carla Dupont's SDD):** the API must never expose an endpoint that returns the full participant↔match mapping to any client after generation — not even to the organizer's session. Each `resultToken` must resolve to exactly one participant's own result. This is the architectural enforcement of the entire product's value proposition.

---

## 07. Design QA — Condensed Checklist

- [ ] Contrast-check `color.accent.default` against `color.bg.base` for all text-on-accent and accent-on-base combinations (WCAG AA).
- [ ] Verify pill-radius buttons maintain 44×44px minimum touch target at all breakpoints.
- [ ] Reveal-page tap-to-reveal interaction must have a non-JS fallback (progressive enhancement) since it's the single most critical moment in the product.
- [ ] Mobile-first breakpoints validated at 360px (small Android), 390px (iOS), 768px (tablet), 1280px (desktop).
- [ ] Empty/error states never render a blank screen — `EmptyState` component is mandatory on every zero-data path.

---

**Document Author:** Kalyel N. Laurindo / Design Lead
