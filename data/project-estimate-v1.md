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
| **Development** | 96 hours · $15,840 | 144 hours · $23,760 |
| **Total** | **131 hours · $21,516** | **195 hours · $32,109** |
| **With 15% Provisional** | **$24,743** | **$36,925** |

> Feature costs are fully loaded — project management and QA are distributed proportionally across the features.

**Rate:** $165/hour
**FTE:** 1.5 developers
**Contingency:** 145% applied to base hours for the high range
**Estimated Timeline:** ~11-16 working days (~2.2-3.25 weeks) at 1.5 FTE

**Required Scope:** 70 dev hours · **Optional Scope (⭐):** 26 dev hours

**Monthly Recurring:** Hosting and Support (SLA) on Chrono managed infrastructure — at the client's charge (TBD)

---

## Estimation Methodology

**Contingency Factor:** 145% applied to base hours to produce the high-range estimate
**Rate:** $165/hour (all roles)
**PM Overhead:** 20% of development effort (distributed across features)
**QA Overhead:** 15% of development effort (distributed across features)
**Provisional Extra Budget:** 15% on total (for scope changes during delivery)
**Conversion:** 8 productive hours = 1 working day

---

## Phase Summary Table

| Phase | Name | Dependency | Tasks | Hours | Cost |
|-------|------|------------|-------|-------|------|
| 1 | Backend | Mandatory | 4 | 16 | $2,640 |
| 2 | Vendor Integration — Sysco | 1 | 2 | 18 | $2,970 |
| 3 | Vendor Integration — Costco ⭐ | 1 | 2 | 8 | $1,320 |
| 4 | Vendor Integration — Central Kitchen | 1 | 2 | 8 | $1,320 |
| 5 | Catalog Management | 1 | 1 | 16 | $2,640 |
| 6 | Frontend | 1, 5 | 4 | 30 | $4,950 |

### Totals

| Category | Tasks | Hours | Cost |
|----------|-------|-------|------|
| **Required** | 8 | 70 | $11,550 |
| **Optional (⭐)** | 7 | 26 | $4,290 |
| **GRAND TOTAL (Dev)** | **15** | **96** | **$15,840** |

**Notes:**
- Optional items are marked with ⭐ and can be deferred. They total 26 dev hours.
- Phase 3 (Vendor Integration — Costco) is entirely optional.
- Features with no estimated effort have been removed from this version; their scope is folded into the related task descriptions.

---

## Phase-by-Phase Breakdown

### Phase 1: Backend
**Status:** REQUIRED
**Goal:** Core platform services — authentication, audit, branch and user management

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Authentication (login, password reset) — no registration | 0.5 d | 4 | $660 |
| Audit trail on all user actions in the platform | 1 d | 8 | $1,320 |
| Branches management (LCRUA) | 0.25 d | 2 | $330 |
| User management (LCRUA, assignation to N branches) | 0.25 d | 2 | $330 |

**Phase 1 Total:** 16 hours · $2,640

---

### Phase 2: Vendor Integration — Sysco
**Status:** REQUIRED
**Goal:** Submit purchase orders to Sysco via SFTP / API

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Sysco PO submission integration (SFTP / API; per-branch config: client #, contact, API key; EDI layer; acknowledgement and invoice-reception polling per PO) | 2 d | 16 | $2,640 |
| Invoice link to PO ⭐ | 0.25 d | 2 | $330 |

**Phase 2 Total:** 18 hours · $2,970

> The flow to connect to Sysco still needs to be clarified. This quote estimates the effort as if it were clarified.

---

### Phase 3: Vendor Integration — Costco
**Status:** OPTIONAL
**Goal:** Send purchase orders to Costco by email (Costco is email-only)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Email integration — Costco (edit destination email / client # per branch, super admin only) ⭐ | 0.75 d | 6 | $990 |
| Manually attach invoice to PO (file upload) ⭐ | 0.25 d | 2 | $330 |

**Phase 3 Total:** 8 hours · $1,320 — OPTIONAL

---

### Phase 4: Vendor Integration — Central Kitchen
**Status:** REQUIRED
**Goal:** Send purchase orders to Central Kitchen by email (email-only)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Email integration — Central Kitchen (edit destination email / client # per branch, super admin only) | 0.75 d | 6 | $990 |
| Manually attach invoice to PO (file upload) ⭐ | 0.25 d | 2 | $330 |

**Phase 4 Total:** 8 hours · $1,320

---

### Phase 5: Catalog Management
**Status:** REQUIRED
**Goal:** Manage the product catalog (list, add, edit, read, archive)

| Task | Size | Hours | Cost |
|------|------|-------|------|
| Catalog management — LCRUA Produit (list, add, edit, read, archive) | 2 d | 16 | $2,640 |

**Phase 5 Total:** 16 hours · $2,640

---

### Phase 6: Frontend
**Status:** REQUIRED
**Goal:** User-facing interface for catalog and purchase-order management

| Task | Size | Hours | Cost |
|------|------|-------|------|
| i18n (multi-language support) ⭐ | 1 d | 8 | $1,320 |
| Consult audit trail ⭐ | 0.25 d | 2 | $330 |
| Mobile responsiveness ⭐ | 0.5 d | 4 | $660 |
| PO management (list, create, read; update / mark item as backordered; mark as draft vs send PO; search products by name, code, vendor) | 2 d | 16 | $2,640 |

**Phase 6 Total:** 30 hours · $4,950

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
