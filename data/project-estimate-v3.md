# Lucille — PO Management System · Internal Quote

**Project:** Lucille — Purchase Order Management System
**Estimated:** 2026-11-17
**Estimation Framework:** Chrono Innovation Standard
**Client:** Lucille (multi-branch restaurant)
**Status:** Internal Quote — V3: EDI + Email/SMS + Web portal vendors

---

## Executive Summary

> **V3 draft.** Every V2 line item keeps its V2 hours and price. Items added in V3 come from the demo of 2026-11-04 and Mathieu's Loom (2026-11-10). They are listed at 0 hours until Ramon and Mathieu size them, so the totals below are still the V2 totals.

### Development Effort

| Metric | Low | High |
|--------|-----|------|
| **Development** | 138 hours · $22,770 | 207 hours · $34,155 |
| **Total** | **187 hours · $30,806** | **281 hours · $46,209** |
| **With 15% Provisional** | **$35,427** | **$53,140** |

> Feature costs are fully loaded — project management and QA are distributed proportionally across the features.

**Rate:** $165/hour
**FTE:** 1.5 developers

**Monthly Recurring:** Hosting (~$200/month) and third-party usage (SMS, LLM) billed separately; Support (SLA) on Chrono managed infrastructure — at the client's charge (TBD)

---

## Estimation Methodology

**Rate:** $165/hour (all roles)
**PM Overhead:** 20% of development effort (distributed across features)
**QA Overhead:** 15% of development effort (distributed across features)
**Provisional Extra Budget:** 15% on total (for scope changes during delivery)
**Conversion:** 8 productive hours = 1 working day

**V3 labels in task names:**
- **(V3 new)** — not in V2, 0 hours until sized
- **(V3 changed: …)** — same V2 hours and price, scope or status changed
- **(V3 removed: …)** — in V2, gone or moved in V3; kept as an unselected option so its V2 price stays visible
- **(Phase 2 add-on)** — automation, priced as an add-on (optional ⭐)

---

## Phase Summary Table

| Phase | Name | Dependency | Tasks | Hours | Cost |
|-------|------|------------|-------|-------|------|
| 1 | Backend | Mandatory | 6 | 8 | $1,320 |
| 2 | Vendor Integration — EDI | 1 | 4 | 26 | $4,290 |
| 3 | Vendor Integration — Email/SMS | 1 | 8 | 28 | $4,620 |
| 4 | Catalog Management | 1 | 4 | 28 | $4,620 |
| 5 | PO Management | 1, 4 | 8 | 8 | $1,320 |
| 6 | Frontend | 1, 4, 5 | 20 | 30 | $4,950 |
| 7 | Test | 1 | 3 | 0 | $0 |
| 8 | Vendor Integration — Web portal agent (best effort, anti-bot risk) ⭐ | 1, 4 | 4 | 10 | $1,650 |
| 9 | Ops console (best effort, anti-bot risk) ⭐ | 1, 5 | 5 | 0 | $0 |

### Totals

| Category | Tasks | Hours | Cost |
|----------|-------|-------|------|
| **GRAND TOTAL (Dev)** | **62** | **138** | **$22,770** |

**Notes:**
- Hours and costs are the V2 figures. The Hector Larivée and Can-Am EDI connectors and the Costco Email/SMS connector moved to phase 8 with their V2 hours and price. The other tasks added in V3 are at 0 hours pending sizing.
- Status changes in V3: Sysco EDI connector, the four remaining Email/SMS connectors and chef-UI mobile responsiveness move from optional to required. The Gordon Food Service EDI connector stays optional as in V2.

---

## Phase-by-Phase Breakdown

### Phase 1: Backend
**Status:** REQUIRED
**Goal:** Core platform services — authentication, audit, branch and user management

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Authentication (login, password reset) — no registration | S | 4 | $660 |
| Audit trail on all user actions in the platform | XS | 0 | $0 |
| Branches management (LCRUA) | S | 2 | $330 |
| User management | S | 2 | $330 |
| User management — LCRUA | XS | 0 | $0 |
| User management — Assignation to N branches | XS | 0 | $0 |

**Phase 1 Total:** 8 hours · $1,320

---

### Phase 2: Vendor Integration — EDI
**Status:** REQUIRED
**Goal:** Submit purchase orders via EDI (SFTP / API) to EDI-connected vendors, with acknowledgement and invoice reception

| Task | Size | Hours | Cost |
|------|------|-------|------|
| EDI integration framework (SFTP / API abstraction, per-branch config, ack + invoice polling engine) | L | 16 | $2,640 |
| Sysco — EDI connector | S | 4 | $660 |
| Gordon Food Service — EDI connector ⭐ | S | 4 | $660 |
| Invoice link to PO ⭐ | S | 2 | $330 |

**Phase 2 Total:** 26 hours · $4,290

> V3: Sysco is the only vendor that supports EDI well (Loom), so its connector is now required. The Gordon Food Service EDI connector stays optional as in V2. Hector Larivée and Can-Am move to the web portal agent (phase 8) with their V2 price.

---

### Phase 3: Vendor Integration — Email/SMS
**Status:** REQUIRED
**Goal:** Send purchase orders by email/SMS to vendors without EDI support, with an AI layer to interpret and draft vendor correspondence

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Email/SMS integration framework (templating, per-branch destination & client # config, delivery confirmation) | M | 10 | $1,650 |
| AI-assisted vendor correspondence — natural-language interpretation of inbound vendor replies (confirmations, pricing changes, backorders) and automated drafting of outbound order communications | L | 8 | $1,320 |
| AI guardrails — client-defined rules: accept a substitution or not, when to escalate | S | 0 | $1,000 fixed |
| DIX Étoiles — Email/SMS connector | XS | 2 | $330 |
| Frandon — Email/SMS connector | XS | 2 | $330 |
| Central Kitchen — Email/SMS connector | XS | 2 | $330 |
| Macchi — Email/SMS connector | XS | 2 | $330 |
| Manually attach invoice to PO (file upload) ⭐ | S | 2 | $330 |

**Phase 3 Total:** 28 hours · $4,620

> V3: the AI bot needs explicit guardrails set with the client (Loom). Costco is not ordered by email: an HQ person buys on the website with a card.

---

### Phase 4: Catalog Management
**Status:** REQUIRED
**Goal:** Manage the product catalog (list, add, edit, read, archive), product formats and supplier fallback

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Catalog management — LCRUA Produit (list, add, edit, read, archive) | L | 16 | $2,640 |
| Product formats — sizes per product, one supplier SKU per size, grouped for chefs | M | 0 | $0 |
| Preferred supplier with fallback system | S | 4 | $660 |
| Automatic system to send PO to the next preferred supplier | M | 8 | $1,320 |

**Phase 4 Total:** 28 hours · $4,620

> V3: product formats were asked for in the demo of 11-04 and in the Loom. Back-ordered items stay manually updated, as in V2.

---

### Phase 5: PO Management
**Status:** REQUIRED
**Goal:** Create and manage purchase orders (backend)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| List, Create, Read | S | 4 | $660 |
| Update (mark item as backordered) | S | 4 | $660 |
| Search products by name, code, vendor | XS | 0 | $0 |
| Per-supplier order cut-off schedule and expected delivery date | S | 0 | $0 |
| Statuses per vendor PO: awaiting, confirmed, partial, back-ordered, rerouted | S | 0 | $0 |
| Special instructions on an order | XS | 0 | $0 |
| Order history filters — location, date | XS | 0 | $0 |
| Support Drafting state ⭐ | XS | 0 | $300 fixed |

**Phase 5 Total:** 8 hours · $1,320

> V3: cut-off schedule is "very, very critical" for the client (Loom). Whether special instructions go to the vendor or to HQ is to confirm with the client.

---

### Phase 6: Frontend
**Status:** REQUIRED
**Goal:** User-facing interface for catalog, PO management, chef ordering, branches, users, and admin

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Design System | XS | 0 | $0 |
| i18n (multi-language support) ⭐ | M | 8 | $1,320 |
| User management | XS | 0 | $0 |
| Consult audit trail ⭐ | S | 2 | $330 |
| Authentication (login, password reset) — no registration | XS | 0 | $0 |
| Mobile responsiveness | S | 4 | $660 |
| Catalog management (LCRUA) | XS | 0 | $0 |
| Branches management LCRUA (super admin only) | XS | 0 | $0 |
| User management (super admin only) | XS | 0 | $0 |
| User management — LCRUA | XS | 0 | $0 |
| User management — Assignation to N branches | XS | 0 | $0 |
| Catalog management | XS | 0 | $0 |
| LCRUA Products (list, add, edit, read, archive) | XS | 0 | $0 |
| PO management | L | 16 | $2,640 |
| PO — List, Create, Read | XS | 0 | $0 |
| PO — Update (mark item as backordered) | XS | 0 | $0 |
| PO — Mark as draft vs send PO | XS | 0 | $0 |
| PO — Search products by name, code, vendor | XS | 0 | $0 |
| Chef ordering by supplier — cut-off countdown, format selector, multi-vendor cart and review | M | 0 | $0 |
| Progressive Web App, installable on the chef's phone ⭐ | S | 0 | $670 fixed |

**Phase 6 Total:** 30 hours · $4,950

> V3: vendor-centric chef screens were shown in the demo of 11-04. The PWA was requested by the client (Loom) as a nice to have.

---

### Phase 7: Test
**Status:** REQUIRED
**Goal:** Testing across the platform, go-live and hypercare

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Unit testing | XS | 0 | $0 |
| E2E tests | XS | 0 | $0 |
| UAT, go-live, 2 weeks hypercare | S | 0 | $0 |

**Phase 7 Total:** 0 hours · $0

---

### Phase 8: Vendor Integration — Web portal agent (best effort, anti-bot risk)
**Status:** OPTIONAL (Phase 2 add-on) — V3 new phase
**Goal:** Order on vendor websites with a headless AI browser agent for vendors without EDI

| Task | Size | Hours | Cost |
|------|------|-------|------|
| AI browser agent framework (headless): log in, place the order, capture the confirmation, read stock | L | 0 | $2,500 fixed |
| Hector Larivée — portal connector | S | 4 | $660 |
| Can-Am — portal connector | S | 4 | $660 |
| Costco — automated ordering agent | M | 2 | $330 |

**Phase 8 Total:** 10 hours · $1,650

> Tested headless by Mathieu on Hector Larivée (Loom). Depends on the vendor sites staying stable and showing stock.
>
> Risk: if a vendor site adds anti-bot protection (CAPTCHA, bot detection), the agent can stop working for that vendor. This is outside our control and may not be fixable.

---

### Phase 9: Ops console (best effort, anti-bot risk)
**Status:** OPTIONAL — V3 new phase
**Goal:** HQ operations: Costco daily aggregation, alerts and human oversight of the AI bot

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Costco daily aggregation page for HQ, replaces collecting orders on WhatsApp ⭐ | S | 0 | $639 fixed |
| Alerts dashboard — no fallback left, bot out of scope, approvals pending ⭐ | S | 0 | $1,239 fixed |
| Bot approval queue — the bot asks before sending when unsure ⭐ | S | 0 | $630 fixed |
| Human takeover of a vendor conversation, full thread history ⭐ | S | 0 | $630 fixed |
| Notifications by email / SMS / phone call ⭐ | XS | 0 | $330 fixed |

**Phase 9 Total:** 0 hours · $0

> The Costco daily page is the base solution agreed with the client (Loom). It replaces the Costco email connector.

---

## Assumptions & Constraints

### Infrastructure & Platform
- We will use our managed infrastructure to save time on development — hosting, auth, error tracking, observability
- Multi-branch environment (multiple Lucille restaurants)
- Not white-label
- Third-party usage (SMS, LLM) billed separately

### Vendors & Ordering
- Back-ordered items are manually updated, not automatically detected
- 30 to 40 products per vendor, manually managed
- Catalog items are not automatically synced
- Product-to-supplier mapping is manually handled by an admin, including one SKU per size
- **Email/SMS vendors:** DIX Étoiles, Frandon, Central Kitchen, Macchi
- **Web portal vendors (AI agent):** Hector Larivée, Can-Am, Costco. They depend on the vendor sites staying stable and showing stock; site changes are a change request
- **Web portal agent — anti-bot risk:** a vendor site can add anti-bot protection at any time, which can break automated ordering for that vendor independently of Chrono. Continuity of the feature is not guaranteed
- **Web portal agent — vendor site changes:** support does not cover breakages caused by a vendor updating its website. These are not bugs in the platform but adaptations to a changed site, and are billed as change requests
- **Costco:** daily aggregation page; purchase, payment and invoicing stay manual. Automated ordering is a best-effort option
- Costco does not provide any usable automatable communication channel (email, SMS or API), so Costco orders cannot be sent by the platform
- A chef can order items from multiple vendors at once; the system will split POs by vendor accordingly
- Each vendor's channel is confirmed during onboarding; changing it later is a change request
- Technical documents to connect to third parties are provided by the client
- The client sets the AI guardrails and the alert rules in a workshop after kick-off

### Design
- No specific design or brand guides will be provided. This can be a joint discussion, but Chrono reserves the right to veto
- Chef UI mobile-friendly (PWA); admin desktop only; no native app

---

**Document Status:** Internal Quote — V3 draft
**Last Updated:** 2026-11-17
