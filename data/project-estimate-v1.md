# Lucille — PO Management System · Internal Quote

**Project:** Lucille — Purchase Order Management System
**Estimated:** 2026-06-22
**Estimation Framework:** Chrono Innovation Standard
**Client:** Lucille (multi-branch restaurant)
**Status:** Internal Quote — Initial Estimate

---

## Executive Summary

### Development Effort

| Metric | Low | High |
|--------|-----|------|
| **Development** | 112 hours · $18,480 | 168 hours · $27,720 |
| **Total** | **152 hours · $25,047** | **228 hours · $37,488** |
| **With 15% Provisional** | **$28,804** | **$43,111** |

> Feature costs are fully loaded — project management and QA are distributed proportionally across the features.

**Rate:** $165/hour
**FTE:** 1.5 developers

**Required Scope:** 92 dev hours · **Optional Scope (⭐):** 20 dev hours

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
| 1 | Backend | Mandatory | 6 | 16 | $2,640 |
| 2 | Vendor Integration — Sysco | 1 | 6 | 18 | $2,970 |
| 3 | Vendor Integration — Costco | 1 | 3 | 8 | $1,320 |
| 4 | Vendor Integration — Central Kitchen | 1 | 3 | 8 | $1,320 |
| 5 | Catalog Management | 1 | 3 | 32 | $5,280 |
| 6 | PO Management | 1, 5 | 4 | 0 | $0 |
| 7 | Frontend | 1, 5, 6 | 18 | 30 | $4,950 |
| 8 | Test | 1 | 2 | 0 | $0 |

### Totals

| Category | Tasks | Hours | Cost |
|----------|-------|-------|------|
| **Required** | 38 | 92 | $15,180 |
| **Optional (⭐)** | 7 | 20 | $3,300 |
| **GRAND TOTAL (Dev)** | **45** | **112** | **$18,480** |

**Notes:**
- Optional items are marked with ⭐ and can be deferred. They total 26 dev hours.
- Several line items are scoped at 0 days: they are sub-steps whose effort is captured by their parent build task (the PO management build effort sits under Frontend; backend PO management and Test are listed for scope clarity).

---

## Phase-by-Phase Breakdown

### Phase 1: Backend
**Status:** REQUIRED
**Goal:** Core platform services — authentication, audit, branch and user management

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Authentication (login, password reset) — no registration | S | 4 | $660 |
| Audit trail on all user actions in the platform | M | 8 | $1,320 |
| Branches management (LCRUA) | S | 2 | $330 |
| User management | S | 2 | $330 |
| User management — LCRUA | — | 0 | $0 |
| User management — Assignation to N branches | — | 0 | $0 |

**Phase 1 Total:** 16 hours · $2,640

---

### Phase 2: Vendor Integration — Sysco
**Status:** REQUIRED
**Goal:** Submit purchase orders to Sysco via SFTP / API, with acknowledgement and invoice reception

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Sysco PO submission integration (SFTP / API) | L | 16 | $2,640 |
| Manage integration per branch (client #, contact, API key) | — | 0 | $0 |
| EDI integration layer — Sysco (deposit PO on their system) | — | 0 | $0 |
| Acknowledgement polling job per PO | — | 0 | $0 |
| Invoice reception polling job per PO | — | 0 | $0 |
| Invoice link to PO ⭐ | S | 2 | $330 |

**Phase 2 Total:** 18 hours · $2,970

> The flow to connect to Sysco still needs to be clarified. This quote estimates the effort as if it were clarified.

---

### Phase 3: Vendor Integration — Costco
**Status:** REQUIRED
**Goal:** Send purchase orders to Costco by email (Costco is email-only)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Email integration — Costco | M | 6 | $990 |
| Edit destination email / client # (super admin only) per branch | — | 0 | $0 |
| Manually attach invoice to PO (file upload) ⭐ | S | 2 | $330 |

**Phase 3 Total:** 8 hours · $1,320

---

### Phase 4: Vendor Integration — Central Kitchen
**Status:** REQUIRED
**Goal:** Send purchase orders to Central Kitchen by email (email-only)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Email integration — Central Kitchen | M | 6 | $990 |
| Edit destination email / client # (super admin only) per branch | — | 0 | $0 |
| Manually attach invoice to PO (file upload) ⭐ | S | 2 | $330 |

**Phase 4 Total:** 8 hours · $1,320

---

### Phase 5: Catalog Management
**Status:** REQUIRED
**Goal:** Manage the product catalog (list, add, edit, read, archive)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Catalog management — LCRUA Produit (list, add, edit, read, archive) | L | 16 | $2,640 |
| Preferred supplier with fallback system | M | 8 | $1,320 |
| Automatic system to send PO to the next preferred supplier | M | 8 | $1,320 |

**Phase 5 Total:** 32 hours · $5,280

---

### Phase 6: PO Management
**Status:** REQUIRED
**Goal:** Create and manage purchase orders (backend)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| List, Create, Read | — | 0 | $0 |
| Update (mark item as backordered) | — | 0 | $0 |
| Search products by name, code, vendor | — | 0 | $0 |
| Support Drafting state ⭐ | — | 0 | $0 |

**Phase 6 Total:** 0 hours · $0

> Back-ordered items are manually updated, not automatically detected. A chef can order from multiple vendors at once; the system splits POs by vendor.

---

### Phase 7: Frontend
**Status:** REQUIRED
**Goal:** User-facing interface for catalog, PO management, branches, users, and admin

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Design System | — | 0 | $0 |
| i18n (multi-language support) ⭐ | M | 8 | $1,320 |
| User management | — | 0 | $0 |
| Consult audit trail ⭐ | S | 2 | $330 |
| Authentication (login, password reset) — no registration | — | 0 | $0 |
| Mobile responsiveness ⭐ | S | 4 | $660 |
| Catalog management (LCRUA) | — | 0 | $0 |
| Branches management LCRUA (super admin only) | — | 0 | $0 |
| User management (super admin only) | — | 0 | $0 |
| User management — LCRUA | — | 0 | $0 |
| User management — Assignation to N branches | — | 0 | $0 |
| Catalog management | — | 0 | $0 |
| LCRUA Products (list, add, edit, read, archive) | — | 0 | $0 |
| PO management | L | 16 | $2,640 |
| PO — List, Create, Read | — | 0 | $0 |
| PO — Update (mark item as backordered) | — | 0 | $0 |
| PO — Mark as draft vs send PO | — | 0 | $0 |
| PO — Search products by name, code, vendor | — | 0 | $0 |

**Phase 7 Total:** 30 hours · $4,950

---

### Phase 8: Test
**Status:** REQUIRED
**Goal:** Testing across the platform

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Unit testing | — | 0 | $0 |
| E2E tests | — | 0 | $0 |

**Phase 8 Total:** 0 hours · $0

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
- Costco and Central Kitchen are email only
- Sysco POs are sent by SFTP or API
- A chef can order items from multiple vendors at once; the system will split POs by vendor accordingly
- The flow to connect to Sysco still needs to be clarified. This quote estimates the effort as if it were clarified, but this is expected to change
- Technical documents to connect to third parties (Sysco, Costco, Central Kitchen) are provided by the client

### Design
- No specific design or brand guides will be provided. This can be a joint discussion, but Chrono reserves the right to veto

---

**Document Status:** Internal Quote — Initial Estimate
**Last Updated:** 2026-06-22
