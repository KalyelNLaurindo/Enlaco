# **📋 Requirements Specification: Enlaço — Constrained Random Gift-Exchange Draws with Private, Multi-Channel Reveal**

**Role:** Requirements Engineer / Analyst

**Objective:** Map out user journeys (scenarios) and prioritize functional requirements (MoSCoW) to guide the Software Design Document's remaining phases (API, persistence, delivery, packaging).

**Context:** Enlaço requirements specification detailing user interactions and core functional boundaries, designed to satisfy the vision described in the Problem Discovery document and the domain model already locked in Phase 1 of the Software Design Document.

## **🏛️ Project Metadata**

* **Client / Segment:** Consumer App — Individuals organizing group gift exchanges
* **Date of Creation:** July 8, 2026
* **Lead Requirements Engineer:** Kalyel N. Laurindo / Project Owner
* **Document Version:** v1.0
* **Associated Problem Discovery Document:** `context/Problem Discovery - Enlaço.md`
* **Associated Solution Architecture Document:** `context/Software Design Document - Enlaço.md` (Phase 1 — Domain Model & Draw Algorithm)

## **🧭 Cross-Document Alignment Notes**

These decisions were explicitly validated against existing architecture during elicitation, to preserve rastreabilidade between this document and the SDD:

| # | Topic | Resolution | Status vs. SDD |
|---|---|---|---|
| 1 | Max participants per draw | Kept at **50** (ASM-10). 500-participant events are a known limitation, deferred to roadmap — not in MVP scope. | No change to SDD. |
| 2 | Exclusion rule directionality | Kept **bidirectional-only** (ADR-01 unchanged). Asymmetric/directional exclusion (e.g., manager↛intern only) is Could Have, future work. | No change to SDD. |
| 3 | WhatsApp delivery | Kept **wa.me self-triggered deep link** as default (ASM-04). Active send via Business API is an optional, organizer-configured Should Have — does not change default MVP behavior. | No change to SDD. |
| 4 | Organizer authentication | **No login/account system.** Preserves ASM-08 ("no enterprise-grade auth"). Organizer identity/session is a per-draw **admin token**, not a user account. | No change to SDD. |

## **🎭 1. Scenario-Based Requirements Engineering (SBRE)**

### **Scenario A: Draw Creation Wizard**
* **Trigger Event:** Organizer selects "Create New Draw" and enters the event name (first required field).
* **System Action:** The system immediately creates a `Draw` record with `status = DRAFT` and issues a unique `adminToken`, displayed prominently in the UI ("Save this link to manage your draw later"). The wizard then proceeds through: Participants → Exclusion Rules → Delivery Channels → Organizer Blind Mode → Event Details → Data Consent (LGPD) → Final Summary (blocking). Every field change is auto-saved to the backend via a 2-second debounce, so the wizard is fully resumable from the `adminToken` at the exact incomplete step, indefinitely, until generation. Participant entries require a non-empty, trimmed name (no control characters) and at least one valid delivery channel; duplicate names are permitted (disambiguated by channel in the UI), duplicate channels (exact match) are blocked with an inline error. The system enforces a client-side minimum of 3 and maximum of 50 participants before allowing progression. Exclusion rules are entered as an unordered pair ("A and B cannot be matched to each other"), enforced bidirectionally in both directions per ADR-01 — there is no directional/unidirectional toggle in this version; the UI blocks self-exclusion pairs before submission. Delivery channel is configured per participant (not globally), with an optional wizard-level default to speed entry. Event Details (event name required ≤100 chars; event date, suggested gift value, and organizer message ≤500 chars all optional) are collected in a dedicated step and surfaced later on the reveal screen and delivery emails. The Data Consent step requires an explicit checkbox confirming the organizer has authorization to register each participant's personal data, linked to a privacy summary; this checkbox is a hard gate on the "Generate Draw" action and its acceptance (timestamp + IP) is recorded for audit purposes. The Final Summary screen is a blocking confirmation showing the full participant list with channels, all exclusion rules with explicit directionality, and an unmissable warning that generation is irreversible; a second mandatory checkbox ("I understand this action is irreversible") gates the "Generate Draw" button.

### **Scenario B: Draw Generation**
* **Trigger Event:** Organizer clicks "Generate Draw" on the Final Summary screen with both the consent and irreversibility checkboxes checked.
* **System Action:** The system validates `Draw.status == DRAFT` before executing `DrawGenerator.generate()`; generation is idempotent — a duplicate click, page refresh, or repeated request while `status == GENERATED` returns the existing state without re-running the algorithm (enforced via a status check plus a uniqueness constraint on `Assignment` per `Draw` to close any race-condition window). Before allowing generation, the system pre-validates exclusion-graph feasibility; if the constraint set is unsolvable, generation is blocked and `DrawInfeasibleError` (or its pre-check equivalent) returns a structured, per-participant breakdown — not a generic message — identifying each blocked participant, the exclusion rule IDs responsible, and their remaining candidate count, rendered in the UI as a readable, actionable list (e.g., "Carlos cannot draw anyone: excluded from Ana (rule #1) and Beto (rule #2)"). On success, `Draw.status` transitions to `GENERATED` and delivery is triggered for every participant. The post-generation screen differs by mode: in **Organizer Blind Mode**, only an aggregate delivery status is shown ("47/48 delivered successfully, 1 pending retry"), with no pairing data anywhere in the UI, logs, or API responses reachable by the organizer (direct URL/API access to the full pairing returns 403 or masked data while blind mode is active); in **Non-Blind Mode**, the full pair table (giver → receiver → channel → delivery status) is shown immediately, with a per-row manual resend action and PDF/CSV export available.

### **Scenario C: Result Delivery & Retry**
* **Trigger Event:** A `Draw` transitions to `GENERATED`, triggering per-participant delivery across their configured channel.
* **System Action:** The system attempts automatic delivery in a bounded retry cycle: attempt 1 immediately, attempt 2 at +30s, attempt 3 at +60s (30s apart), with a live on-screen countdown/attempt counter per participant card. If all 3 attempts fail, the system waits 10 minutes and triggers a new 3-attempt cycle; this repeats until either a delivery succeeds or the organizer intervenes. A manual "resend" action is always available to the organizer regardless of automatic-cycle state (in Blind Mode, resend is available without ever exposing recipient identity — only channel and status). Email delivery contains a personalized "View my result" link/button that resolves the `resultToken` through the reveal screen — never the plaintext result in the email body — and supports event branding fields (event name, organizer name; visual template execution is deferred to the Design phase) plus a mandatory LGPD disclosure footer. WhatsApp delivery defaults to a pre-filled `wa.me` deep link that the participant self-triggers; if the organizer has configured WhatsApp Business API credentials in settings, the system instead sends actively through that channel. QR codes are a client-side encoding of the same `resultToken` reveal URL (not an independent delivery channel), suitable for print, in-person display, or forwarding through WhatsApp/email. Independently of organizer-driven resend, any participant may request re-delivery of their own link within the 24-hour TTL window by submitting the exact channel value registered for them (no reveal occurs at this step, and the same token is re-sent rather than a new one issued); this self-service path is rate-limited to 3 requests per participant per 24 hours.

### **Scenario D: Participant Reveal**
* **Trigger Event:** A participant opens their delivery link or scans their QR code, resolving a `resultToken`.
* **System Action:** The system resolves the token and displays the recipient's name immediately — no additional confirmation step ("are you sure you want to reveal?") gates the result. The token remains valid for 24 hours from the `Draw`'s generation timestamp (one shared clock for all participants, not per-individual), and may be opened multiple times within that window; each access is logged (timestamp + count) for audit purposes without exposing the pairing to the organizer under Blind Mode. Alongside the recipient's name, the reveal screen surfaces any populated Event Details: event name, event date, suggested gift value, and organizer message. If the token is expired, already invalidated (cancellation, archival), or malformed, the participant is routed to a dedicated error screen with cause-specific messaging (expired vs. cancelled vs. invalid) directing them to contact the organizer.

### **Scenario E: Retention & Save Lifecycle**
* **Trigger Event:** A `Draw` reaches `GENERATED` status and its 24-hour default TTL begins counting down, or the organizer explicitly marks it as "Saved."
* **System Action:** By default, an unsaved `Draw`'s tokens (both `resultToken`s and the `adminToken`'s access to result data) become inaccessible 24 hours after generation. If the organizer saves the draw, they select a retention period (default 90 days; extendable to 180 days, 365 days, or indefinite, with an explicit warning on the indefinite option). Seven days before the retention period lapses, the system emails the organizer's recovery address (if provided) a proactive expiration notice. If no action is taken, on the day after expiry the draw transitions to `EXPIRED_SAVED`, is hidden from the default listing, and becomes recoverable for 15 additional days from an "Archive/Trash" view; after that window, all personal data (names, emails, phone numbers) is anonymized or removed, retaining only anonymized statistical metadata, and every reveal token is invalidated immediately at archival. Manual deletion is available at any time, gated by a double confirmation, and immediately invalidates all tokens and removes the associated data.

### **Scenario F: Draw Cancellation**
* **Trigger Event:** Organizer selects "Cancel Draw" while `Draw.status == GENERATED` (not yet expired or archived).
* **System Action:** The system routes to a dedicated Cancellation screen showing how many participants have already accessed their reveal token (e.g., "2 of 50 already viewed"), alongside a high-visibility warning that cancellation is irreversible and that participants who already viewed their result retain that knowledge even though system access is revoked. A mandatory confirmation checkbox gates the action. On confirmation, `Draw.status` transitions to `CANCELLED` and every token is invalidated instantly; subsequent access attempts return a cancellation-specific error screen distinct from the generic expired-token message. The organizer may "Duplicate as New Draft," which copies the participant list and exclusion rules into a fresh `DRAFT` draw — a wholly new draw with new tokens and new notifications, never a resurrection of the cancelled one.

### **Scenario G: Admin Access & Recovery (No-Login Model)**
* **Trigger Event:** Organizer loses access to their `adminToken` (cleared cache, new device, corrupted browser state).
* **System Action:** If a recovery email was provided during wizard creation (optional field, disclosed via tooltip as used solely for recovery), the organizer can visit a public "Recover Access" screen and submit that email; the system resends the original admin link to it without disclosing whether the email is associated with any draw (anti-enumeration). The organizer-facing dashboard is client-side only: the browser's local storage retains the list of admin tokens created on that device, with a manual "import" action (paste an admin link) to add drafts/draws created elsewhere or recovered via email. `DRAFT` draws that are never generated may be purged after 1 year of inactivity, with prior notice sent to the recovery email if one was registered.

### **Scenario H: Audit Export (PDF/CSV)**
* **Trigger Event:** Organizer (holding a valid `adminToken`) requests an export from the Status/Pair screen of a `GENERATED` or `SAVED` draw.
* **System Action:** The system generates a structured, print-ready report — analogous to a closing session report, not a raw log dump — containing: the full pair list (giver → receiver, channel, delivery status) in Non-Blind mode, or aggregate-only figures (no pairing) in Blind mode; complete timestamps for every event (generation, each delivery attempt T1/T2/T3, first reveal access per participant); a cryptographic integrity hash of the generated pairing set computed at generation time, included to prove the exported pairs were not altered afterward; and a per-token access-count log. Both a formatted PDF (for printing) and a raw CSV (for data processing) are offered. The Blind-mode restriction is enforced identically to the live UI — no export path may bypass it to reveal pairing data to the organizer.

## **🎯 2. MoSCoW Prioritization Framework**

### **🔴 Must Have (Critical for Core Value Proposition & MVP Launch)**

* **Requirement RF01: Draw Creation Wizard with Autosave**
  * *Description:* Multi-step wizard (Participants → Exclusion Rules → Delivery Channels → Blind Mode → Event Details → Consent → Summary) that creates a `DRAFT` Draw and `adminToken` on first field entry, autosaves every change (2s debounce), and is fully resumable via `adminToken`.
  * *JTBD Tracing:* Field 10.1 (Functional Job) — generate a fair, rule-constrained draw without forced disclosure; Field 1.4 (organizer must currently sacrifice participation or manually enforce rules).

* **Requirement RF02: Participant & Channel Validation**
  * *Description:* Enforce required name + at least one valid delivery channel per participant; block duplicate channels (exact match); allow duplicate names disambiguated by channel; enforce 3–50 participant bounds client-side.
  * *JTBD Tracing:* Field 1.4 (manual exclusion/error-proneness); Section 6 Metric "Manual Exclusion Rule Errors."

* **Requirement RF03: Exclusion Rule Configuration (Bidirectional-Only Pair UI)**
  * *Description:* Unordered pair selector — every rule blocks both directions, per ADR-01 (kept unchanged per Cross-Document Alignment #2, confirmed 2026-07-08). No directional toggle exists in this version (see RF22, Could Have). UI blocks self-exclusion before submission; feasibility pre-check with per-participant conflict reporting.
  * *JTBD Tracing:* Field 1.4 ("manually enforcing exclusion rules is error-prone by hand"); Root Cause (Section 7, Why 3).

* **Requirement RF04: Organizer Blind Mode**
  * *Description:* Toggle enabling organizer participation without ever surfacing the full or partial pairing to them in any UI, log, or API response; direct access attempts return 403/masked data.
  * *JTBD Tracing:* Field 10.1/10.2 (organizer's own surprise preserved); core Macro Pain Statement (Field 1.5).

* **Requirement RF05: Constrained Draw Generation with Idempotency**
  * *Description:* Single, idempotent generation transition (`DRAFT → GENERATED`) using the Phase-1 domain algorithm; duplicate triggers return existing state, never regenerate.
  * *JTBD Tracing:* Core Invariant (SDD §1.2); Field 10.1.

* **Requirement RF06: Structured `DrawInfeasibleError` Reporting**
  * *Description:* Conflict-specific, per-participant breakdown of infeasible exclusion graphs, surfaced in UI as an actionable list, not a generic message.
  * *JTBD Tracing:* Field 1.4 (manual rule errors forcing re-draws); Section 6 Metric "Manual Exclusion Rule Errors."

* **Requirement RF07: Final Summary — Irreversibility Gate**
  * *Description:* Blocking pre-generation summary of participants, channels, and exclusion rules with an explicit irreversibility warning and mandatory confirmation checkbox.
  * *JTBD Tracing:* Field 9.2 (no fallback exists once a shared reveal happens); prevents Root Cause repeat.

* **Requirement RF08: Multi-Channel Private Delivery (Email default, WhatsApp link, QR)**
  * *Description:* Per-participant channel configuration; email link-based delivery (never plaintext result in body); `wa.me` deep link for WhatsApp; client-generated QR encoding the reveal URL.
  * *JTBD Tracing:* Field 1.4 ("requiring everyone to view results on the same physical device"); Field 8.1 (in-scope: multiple independent channels).

* **Requirement RF09: Automatic Retry with Bounded Backoff**
  * *Description:* 3 automatic attempts (0s/30s/60s) with on-screen counter, followed by a 10-minute wait before a new cycle; manual resend always available.
  * *JTBD Tracing:* Section 6 Metric "Reveal Privacy Failures" (reliability of the replacement delivery mechanism itself).

* **Requirement RF10: Participant Reveal Screen**
  * *Description:* Immediate, no-confirmation display of the recipient's name plus populated Event Details, accessible repeatedly within the 24h TTL from a shared generation-time clock.
  * *JTBD Tracing:* Field 10.2 (Emotional Job — confidence result stays a genuine surprise until chosen).

* **Requirement RF11: Token Expiration & Error Handling**
  * *Description:* Cause-specific error screens for expired, cancelled, and invalid tokens.
  * *JTBD Tracing:* Field 9.2 (no current fallback for broken/expired access).

* **Requirement RF12: Default 24h TTL with Explicit Save/Retention Flow**
  * *Description:* Unsaved draws expire automatically at 24h; saving requires a chosen retention period (default 90 days), a 7-day pre-expiry email notice, a 15-day archive/recovery window, then anonymization.
  * *JTBD Tracing:* ASM-02 (TTL-based expiration persists across restarts); Field 6.6 (success verification via delivery-channel logs).

* **Requirement RF13: Draw Cancellation Flow**
  * *Description:* Dedicated confirmation screen showing already-viewed count, mandatory acknowledgment checkbox, instant token invalidation, "Duplicate as New Draft" recovery path.
  * *JTBD Tracing:* Field 9.2 (resolution blockers when a rule is broken post-facto).

* **Requirement RF14: No-Login Admin Token Model with Recovery**
  * *Description:* `adminToken` issued at draft creation, optional recovery email captured, public "Recover Access" screen with anti-enumeration response, client-side (localStorage) admin token listing with manual import.
  * *JTBD Tracing:* ASM-08 (no enterprise-grade auth) preserved by design.

* **Requirement RF15: Token Security & Rate Limiting**
  * *Description:* `resultToken`/`adminToken` as UUID v4 (or ≥32-char random alphanumeric); reveal endpoint rate-limited (10 req/IP/15min); generic 404 after 5 invalid attempts in 5 minutes; invalid-attempt logging.
  * *JTBD Tracing:* Domain Invariant #4 (SDD §1.2 — full mapping never exposed); security baseline for any public token-based access.

* **Requirement RF16: LGPD Consent Gate**
  * *Description:* Mandatory wizard checkbox confirming authorization to register participants' data, linked privacy summary, consent record (timestamp + IP) retained per draw, and a disclosure footer on every participant-facing delivery email.
  * *JTBD Tracing:* Legal/compliance baseline for processing third-party personal data (name, email, phone) collected by the organizer, not the data subject.

### **🟡 Should Have (High Value, Target for Immediate Post-MVP Release)**

* **Requirement RF17: WhatsApp Business API Active Send**
  * *Description:* Organizer-configurable Business API credentials (settings popup); when present, backend sends actively instead of relying on the `wa.me` self-triggered link.
  * *JTBD Tracing:* Field 1.4 (remote/hybrid participant inclusion), extending RF08 without changing its MVP default.

* **Requirement RF18: Non-Blind Pair Table with Per-Row Resend**
  * *Description:* Full giver→receiver→channel→status table immediately after generation (Non-Blind only), with individual resend actions.
  * *JTBD Tracing:* Field 4.2 (quality/output damage from undiagnosed delivery failures).

* **Requirement RF19: Participant Self-Service Link Recovery**
  * *Description:* Participant-initiated resend of their own token by submitting their exact registered channel value, rate-limited to 3 requests/24h, no reveal at this step.
  * *JTBD Tracing:* Field 9.2 (removes dependency on organizer availability for lost-link recovery).

* **Requirement RF20: Audit Export (PDF/CSV)**
  * *Description:* Print-ready consolidated report (pairs, full timestamps, integrity hash, access-count log) plus raw CSV, respecting the Blind-mode pairing restriction.
  * *JTBD Tracing:* Field 6.6 (Success Verification Method — delivery/access logs as proof).

* **Requirement RF21: Event Details (Date, Suggested Value, Organizer Message)**
  * *Description:* Optional wizard fields surfaced on the reveal screen and delivery emails.
  * *JTBD Tracing:* Field 10.3 (Social Job — a thoughtful, well-run exchange).

### **🟢 Could Have (Desirable, Nice-to-Have, Low Urgency)**

* **Requirement RF22: Directional (Asymmetric) Exclusion Rules**
  * *Description:* Optional per-rule directionality (A↛B without B↛A), additive to the bidirectional-only model per ADR-01.
  * *JTBD Tracing:* Field 1.4 (asymmetric real-world constraints, e.g., hierarchical exclusions), explicitly deferred per Cross-Document Alignment #2.

* **Requirement RF23: Draw Scale Beyond 50 Participants**
  * *Description:* Algorithm/architecture revision to support large-scale draws (e.g., ~500 participants), deferred per Cross-Document Alignment #1.
  * *JTBD Tracing:* Section 6 Metric "Tradition Abandonment" for larger groups — known limitation, not addressed in MVP.

### **⚪ Won't Have (Explicitly Out of Scope for This Version)**

* Enterprise-grade authentication / SSO for organizers (ASM-08; superseded in practice by the no-login admin-token model, RF14).
* Native mobile apps beyond PWA install (Problem Discovery Field 8.2).
* Monetary/prize-based raffle compliance handling (Problem Discovery Field 8.2, ASM-09).
* In-app group chat/messaging beyond delivering the draw result (Problem Discovery Field 8.2).

---

🏁 **End of Document:** This Requirements Specification defines the strict functional boundaries of the system. Any updates to this scope must be validated against the Product Vision and Solution Architecture. Three architectural questions were raised and resolved against the existing SDD during elicitation (see Cross-Document Alignment Notes); no changes to the locked Phase 1 domain model were required.

**Document Author:** Kalyel N. Laurindo / Project Owner
