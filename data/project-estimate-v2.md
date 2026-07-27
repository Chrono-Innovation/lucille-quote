# Lucille — PO Management System · Internal Quote

**Project:** Lucille — Purchase Order Management System
**Estimated:** 2026-07-27
**Estimation Framework:** Chrono Innovation Standard
**Client:** Lucille (multi-branch restaurant)
**Status:** Internal Quote — EDI + Email/SMS Vendor Categories

---

## Executive Summary

### Development Effort

| Metric | Low | High |
|--------|-----|------|
| **Development** | 138 hours · $22,770 | 207 hours · $34,155 |
| **Total** | **187 hours · $30,806** | **281 hours · $46,209** |
| **With 15% Provisional** | **$35,427** | **$53,140** |

> Feature costs are fully loaded — project management and QA are distributed proportionally across the features.

**Rate:** $165/hour
**FTE:** 1.5 developers

**Required Scope:** 94 dev hours · **Optional Scope (⭐):** 44 dev hours

**Monthly Recurring:** Hosting and Support (SLA) on Chrono managed infrastructure — at the client's charge (TBD)

---

## Estimation Methodology

**Rate:** $165/hour (all roles)
**PM Overhead:** 20% of development effort (distributed across features)
**QA Overhead:** 15% of development effort (distributed across features)
**Provisional Extra Budget:** 15% on total (for scope changes during delivery)
**Conversion:** 8 productive hours = 1 working day

---

## Phase Summary Table

| Phase | Name | Dependency | Tasks | Hours | Cost |
|-------|------|------------|-------|-------|------|
| 1 | Backend | Mandatory | 6 | 8 | $1,320 |
| 2 | Vendor Integration — EDI | 1 | 6 | 34 | $5,610 |
| 3 | Vendor Integration — Email/SMS | 1 | 8 | 30 | $4,950 |
| 4 | Catalog Management | 1 | 3 | 28 | $4,620 |
| 5 | PO Management | 1, 4 | 4 | 8 | $1,320 |
| 6 | Frontend | 1, 4, 5 | 18 | 30 | $4,950 |
| 7 | Test | 1 | 2 | 0 | $0 |

### Totals

| Category | Tasks | Hours | Cost |
|----------|-------|-------|------|
| **Required** | 32 | 94 | $15,510 |
| **Optional (⭐)** | 15 | 44 | $7,260 |
| **GRAND TOTAL (Dev)** | **47** | **138** | **$22,770** |

**Notes:**
- Optional items are marked with ⭐ and can be deferred. They total 44 dev hours — including all 9 individual vendor connectors (4 EDI, 5 Email/SMS), each of which the client can enable independently. Only the two integration frameworks are required.
- Several line items are scoped at 0 days: they are sub-steps whose effort is captured by their parent build task (the PO management build effort sits under Frontend; backend PO management and Test are listed for scope clarity).

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
**Goal:** Submit purchase orders via EDI (SFTP / API) to all EDI-connected vendors, with acknowledgement and invoice reception, sharing one integration framework across vendors

| Task | Size | Hours | Cost |
|------|------|-------|------|
| EDI integration framework (SFTP / API abstraction, per-branch config, ack + invoice polling engine) | L | 16 | $2,640 |
| Hector Larivée — EDI connector ⭐ | S | 4 | $660 |
| Can-Am — EDI connector ⭐ | S | 4 | $660 |
| Sysco — EDI connector ⭐ | S | 4 | $660 |
| Gordon Food Service — EDI connector ⭐ | S | 4 | $660 |
| Invoice link to PO ⭐ | S | 2 | $330 |

**Phase 2 Total:** 34 hours · $5,610

> The framework is required to onboard any EDI vendor; each vendor connector is an independent, optional add-on (⭐) so the client can pick only the vendors they actually use. The framework covers SFTP/API transport, per-branch credentials, and shared acknowledgement/invoice polling. Adding a further EDI vendor beyond this list would only require another connector, not the framework. The flow to connect to each EDI vendor still needs to be clarified with the client; this quote estimates the effort as if it were clarified.

---

### Phase 3: Vendor Integration — Email/SMS
**Status:** REQUIRED
**Goal:** Send purchase orders by email/SMS to all vendors without EDI support, sharing one integration framework across vendors, with an AI layer to interpret and draft vendor correspondence

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Email/SMS integration framework (templating, per-branch destination & client # config, delivery confirmation) | M | 10 | $1,650 |
| AI-assisted vendor correspondence — natural-language interpretation of inbound vendor replies (confirmations, pricing changes, backorders) and automated drafting of outbound order communications | L | 8 | $1,320 |
| DIX Étoiles — Email/SMS connector ⭐ | XS | 2 | $330 |
| Costco — Email/SMS connector ⭐ | XS | 2 | $330 |
| Frandon — Email/SMS connector ⭐ | XS | 2 | $330 |
| Central Kitchen — Email/SMS connector ⭐ | XS | 2 | $330 |
| Macchi — Email/SMS connector ⭐ | XS | 2 | $330 |
| Manually attach invoice to PO (file upload) ⭐ | S | 2 | $330 |

**Phase 3 Total:** 30 hours · $4,950

> The framework is required to onboard any Email/SMS vendor; each vendor connector is an independent, optional add-on (⭐) so the client can pick only the vendors they actually use. The framework covers templating, per-branch destination/client # configuration, and delivery confirmation. The AI correspondence layer offsets the lack of structured acknowledgements on this channel: it reads incoming vendor emails/SMS and surfaces confirmations, price changes, and backorder notices as structured PO updates, and drafts outbound messages for review. Adding a further Email/SMS vendor beyond this list would only require another connector, not the framework.

---

### Phase 4: Catalog Management
**Status:** REQUIRED
**Goal:** Manage the product catalog (list, add, edit, read, archive)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Catalog management — LCRUA Produit (list, add, edit, read, archive) | L | 16 | $2,640 |
| Preferred supplier with fallback system | S | 4 | $660 |
| Automatic system to send PO to the next preferred supplier | M | 8 | $1,320 |

**Phase 4 Total:** 28 hours · $4,620

---

### Phase 5: PO Management
**Status:** REQUIRED
**Goal:** Create and manage purchase orders (backend)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| List, Create, Read | S | 4 | $660 |
| Update (mark item as backordered) | S | 4 | $660 |
| Search products by name, code, vendor | XS | 0 | $0 |
| Support Drafting state ⭐ | XS | 0 | $0 |

**Phase 5 Total:** 8 hours · $1,320

> Back-ordered items are manually updated, not automatically detected. A chef can order from multiple vendors at once; the system splits POs by vendor.

---

### Phase 6: Frontend
**Status:** REQUIRED
**Goal:** User-facing interface for catalog, PO management, branches, users, and admin

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Design System | XS | 0 | $0 |
| i18n (multi-language support) ⭐ | M | 8 | $1,320 |
| User management | XS | 0 | $0 |
| Consult audit trail ⭐ | S | 2 | $330 |
| Authentication (login, password reset) — no registration | XS | 0 | $0 |
| Mobile responsiveness ⭐ | S | 4 | $660 |
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

**Phase 6 Total:** 30 hours · $4,950

---

### Phase 7: Test
**Status:** REQUIRED
**Goal:** Testing across the platform

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Unit testing | XS | 0 | $0 |
| E2E tests | XS | 0 | $0 |

**Phase 7 Total:** 0 hours · $0

---

## Assumptions & Constraints

### Infrastructure & Platform
- We will use our managed infrastructure to save time on development — hosting, auth, error tracking, observability
- Multi-branch environment (multiple Lucille restaurants)
- Not white-label

### Vendors & Ordering
- Back-ordered items are manually updated, not automatically detected
- 30 to 40 products per vendor, manually managed
- Catalog items are not automatically synced
- Product-to-supplier mapping is manually handled by an admin
- **EDI vendors** (SFTP/API, sharing one integration framework): Hector Larivée, Can-Am, Sysco, Gordon Food Service
- **Email/SMS vendors** (sharing one integration framework): DIX Étoiles, Costco, Frandon, Central Kitchen, Macchi
- A chef can order items from multiple vendors at once; the system will split POs by vendor accordingly
- The flow to connect to each EDI vendor still needs to be clarified. This quote estimates the effort as if it were clarified, but this is expected to change
- Technical documents to connect to third parties are provided by the client

### Design
- No specific design or brand guides will be provided. This can be a joint discussion, but Chrono reserves the right to veto

---

**Document Status:** Internal Quote — EDI + Email/SMS Vendor Categories
**Last Updated:** 2026-07-27
