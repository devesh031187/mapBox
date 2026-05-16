# Restaurant Inventory Management System — Hotel F&B Operation
## Technical Specification Document v1.1

> **v1.1 (post-review):** Part I (Sections 1–13) is the original procurement-focused
> spec. **Part II (Section 14 onward)** is the comprehensiveness extension added after
> functional review — it closes the inventory-OUT, finance, contracts, expiry,
> recipe, reporting, configuration, audit, and ease-of-use gaps. Part II additions
> supersede Part I where they overlap (notably the consolidated phase plan in §22).

---

## Table of Contents

### Part I — Procurement Core (v1.0)
1. System Overview
2. Technology Stack & Architecture
3. Folder / File Structure
4. Database Schema (All Tables, Full Column Definitions, ER Relationships)
5. Role Permissions Matrix
6. Module 1 — Master Inventory
7. Module 2 — Vendor Management
8. Module 3 — Procurement Flow (PR → RFQ → Quotation → CS → PO → GRN)
9. Module 4 — Multi-Tier Approval Workflow
10. Module 5 — Price History & Tracking
11. Module 6 — Vendor Ranking Engine
12. Authentication & Authorization
13. Development Phases with Story Points *(superseded by §22)*

### Part II — Comprehensiveness Extension (v1.1)
14. Extension Overview & New Enums
15. New Database Tables
16. Module 7 — Stock Operations (Issuance, Transfer, Physical Count, Wastage)
17. Module 8 — Finance & Payments (Invoice Match, Payments, Debit Notes/Returns)
18. Module 9 — Contracts & Standing Orders
19. Module 10 — Batch, Expiry & FEFO Management
20. Module 11 — Recipe / BOM & Costing
21. Module 12 — Reports & Analytics; Module 13 — System Configuration; Module 14 — Audit & Notifications
22. Cross-Cutting Enhancements & Consolidated Permission Matrix
23. Consolidated Development Phase Plan (authoritative)

---

## 1. System Overview

A Hotel F&B Inventory Management System (HFIMS) manages the full lifecycle of raw material and supply procurement for food and beverage operations spanning multiple outlets (restaurants, banquets, room service, bars). Key operational concerns include:

- Maintaining accurate stock levels across multiple storage locations (dry store, cold room, bar store, kitchen).
- Enforcing minimum (par level) and maximum stock levels to prevent both stockouts and wastage.
- Running a governed procurement process: a purchase request must pass through internal approval before it reaches vendors, then must go through competitive bidding before a purchase order is committed.
- Ensuring price discipline by tracking every price movement per item per vendor and alerting when prices drift beyond acceptable thresholds.
- Scoring vendor performance systematically so procurement decisions are data-driven.

The system serves five roles: Admin, Store Manager, F&B Manager, Finance, and GM/Director. Each role has a precisely defined permission set across every module.

---

## 2. Technology Stack & Architecture

### Frontend
- React 18 + TypeScript 5
- Vite (build tool)
- Tailwind CSS 3
- Recharts (analytics charts)
- React Query (TanStack Query v5) — server state
- Zustand — client/UI state
- React Hook Form + Zod — forms and validation
- React Router v6
- Axios — HTTP client
- date-fns — date utilities

### Backend
- Node.js 20 LTS
- Express 4 + TypeScript 5
- Prisma 5 (ORM + migrations)
- PostgreSQL 15
- JWT (jsonwebtoken) + bcryptjs
- Zod — request validation
- node-cron — scheduled jobs (price alert checks, ranking recalculations)
- Winston — structured logging
- Multer — file uploads (GRN attachments, quotation documents)
- Nodemailer — email notifications

### Infrastructure assumptions
- Single server deployment (can be containerised later)
- PostgreSQL on the same host or managed service
- File storage: local filesystem under `/uploads` (path configurable for S3 migration)

---

## 3. Folder / File Structure

### Backend

```
/backend
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts                        # Express app bootstrap
│   ├── app.ts                          # Express app factory
│   ├── config/
│   │   ├── env.ts                      # Validated env vars (zod)
│   │   ├── database.ts                 # Prisma client singleton
│   │   └── logger.ts                   # Winston config
│   ├── types/
│   │   ├── express.d.ts                # Augment Request with user
│   │   └── enums.ts                    # Shared enums (mirrors Prisma)
│   ├── middleware/
│   │   ├── authenticate.ts             # JWT verification
│   │   ├── authorize.ts                # Role guard factory
│   │   ├── validate.ts                 # Zod request validation
│   │   ├── errorHandler.ts             # Global error handler
│   │   └── upload.ts                   # Multer config
│   ├── modules/
│   │   ├── auth/                        # auth.router/controller/service/schema
│   │   ├── users/
│   │   ├── inventory/
│   │   ├── categories/
│   │   ├── storage-locations/
│   │   ├── vendors/
│   │   ├── vendor-categories/
│   │   ├── purchase-requisitions/
│   │   ├── rfq/
│   │   ├── quotations/
│   │   ├── comparative-statements/
│   │   ├── purchase-orders/
│   │   ├── grn/
│   │   ├── approvals/
│   │   ├── price-history/
│   │   └── vendor-ranking/
│   ├── jobs/
│   │   ├── priceAlertJob.ts
│   │   └── vendorRankingJob.ts
│   └── utils/
│       ├── pagination.ts
│       ├── responseBuilder.ts
│       ├── generateCode.ts             # Auto-generate PR/PO/GRN codes
│       └── emailTemplates.ts
├── package.json
├── tsconfig.json
└── .env.example
```

Each module folder contains four files: `*.router.ts`, `*.controller.ts`, `*.service.ts`, `*.schema.ts`.

### Frontend

```
/frontend
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router/index.tsx
│   ├── config/api.ts                   # Axios instance, interceptors
│   ├── types/                          # api.ts, enums.ts, models.ts
│   ├── store/                          # authStore.ts, uiStore.ts (Zustand)
│   ├── hooks/                          # useAuth, usePermissions, useDebounce
│   ├── lib/                            # queryClient.ts, formatters.ts
│   ├── components/
│   │   ├── layout/                     # AppShell, Sidebar, Topbar, PageHeader
│   │   ├── ui/                         # Button, Input, Select, Modal, Table,
│   │   │                               # Badge, Card, Spinner, Toast,
│   │   │                               # ConfirmDialog, FileUpload, DatePicker,
│   │   │                               # Pagination
│   │   ├── forms/                      # FormField, FormError
│   │   └── charts/                     # LineChart, BarChart, RadarChart
│   ├── pages/
│   │   ├── auth/LoginPage.tsx
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── inventory/                  # List, Detail, ItemForm, Category,
│   │   │                               # StorageLocation, ParLevelAlert
│   │   ├── vendors/                    # List, Detail, Form
│   │   ├── procurement/                # PR, RFQ, Quotation, CS, PO, GRN pages
│   │   ├── approvals/                  # Inbox, Detail
│   │   ├── price-history/              # PriceHistory, PriceAlertList
│   │   ├── vendor-ranking/             # Ranking, RankingConfig
│   │   └── users/                      # UserList, UserForm
│   ├── services/                       # one *.service.ts per domain
│   └── utils/                          # permissions.ts, constants.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.example
```

---

## 4. Database Schema

### Enumerations

```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'STORE_MANAGER', 'FB_MANAGER', 'FINANCE', 'GM_DIRECTOR');
CREATE TYPE item_status AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');
CREATE TYPE uom AS ENUM ('KG', 'G', 'LTR', 'ML', 'PCS', 'DZ', 'BOX', 'CAN', 'BTL', 'PKT', 'BG', 'ROLL');
CREATE TYPE vendor_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED', 'UNDER_REVIEW');
CREATE TYPE pr_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'CONVERTED_TO_RFQ', 'CLOSED');
CREATE TYPE rfq_status AS ENUM ('DRAFT', 'SENT', 'PARTIAL_RESPONSE', 'FULLY_RESPONDED', 'COMPARATIVE_DONE', 'CLOSED');
CREATE TYPE quotation_status AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');
CREATE TYPE po_status AS ENUM ('DRAFT', 'APPROVED', 'SENT_TO_VENDOR', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CLOSED', 'CANCELLED');
CREATE TYPE grn_status AS ENUM ('DRAFT', 'POSTED', 'REJECTED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED');
CREATE TYPE approval_document_type AS ENUM ('PURCHASE_REQUISITION', 'PURCHASE_ORDER', 'GRN');
CREATE TYPE price_alert_type AS ENUM ('SPIKE', 'DROP', 'THRESHOLD_BREACH');
CREATE TYPE payment_terms AS ENUM ('IMMEDIATE', 'NET_7', 'NET_15', 'NET_30', 'NET_45', 'NET_60', 'COD');
CREATE TYPE storage_zone AS ENUM ('DRY_STORE', 'COLD_ROOM', 'FREEZER', 'BAR_STORE', 'KITCHEN', 'HOUSEKEEPING', 'GENERAL');
```

### Core Tables

**users**: id (UUID PK), employee_code (UNIQUE), full_name, email (UNIQUE), password_hash, role (user_role), outlet_id (FK), is_active, last_login_at, created_at, updated_at.

**outlets**: id (UUID PK), name, code (UNIQUE), type, is_active, created_at.

**item_categories**: id (UUID PK), name, code (UNIQUE), parent_id (self-FK, supports 3-level nesting), description, is_active, created_at, updated_at.

**storage_locations**: id (UUID PK), name, code (UNIQUE), zone (storage_zone), outlet_id (FK, null = central), temperature_min_c, temperature_max_c, capacity_description, is_active, created_at.

**items** (Item Master): id (UUID PK), item_code (UNIQUE), name, description, category_id (FK), primary_uom, secondary_uom, conversion_factor, storage_location_id (FK), par_level_min, par_level_max, reorder_point, reorder_qty, current_stock, average_cost, last_purchase_price, is_perishable, shelf_life_days, hsn_code, tax_rate_percent, status (item_status), image_url, created_by (FK), created_at, updated_at. Indexes on category, status, storage_location, full-text on name.

**item_stock_ledger** (append-only): id (UUID PK), item_id (FK), movement_type ('GRN'|'CONSUMPTION'|'ADJUSTMENT'|'WASTAGE'|'TRANSFER'), reference_id, reference_code, qty_in, qty_out, unit_cost, balance_qty, balance_value, remarks, created_by (FK), created_at. Index on (item_id, created_at).

**vendor_categories**: id (UUID PK), name, code (UNIQUE), description, is_active, created_at.

**vendors**: id (UUID PK), vendor_code (UNIQUE), company_name, trade_name, vendor_category_id (FK), contact_person, email, phone, alternate_phone, address fields, tax_id, payment_terms, credit_limit, bank_name, bank_account_no, bank_ifsc, bank_branch, status (vendor_status), blacklist_reason, rating, on_time_delivery_rate, quality_score, notes, created_by (FK), created_at, updated_at.

**vendor_item_mapping**: id (UUID PK), vendor_id (FK), item_id (FK), vendor_item_code, vendor_item_description, lead_time_days, minimum_order_qty, is_preferred, is_active, created_at. UNIQUE (vendor_id, item_id).

**vendor_performance_records** (append-only): id (UUID PK), vendor_id (FK), po_id (FK), grn_id (FK), promised_delivery_date, actual_delivery_date, on_time, delay_days, ordered_qty, received_qty, rejected_qty, quality_pass_rate, price_variance_percent, rfq_response_time_hours, notes, recorded_at.

**approval_tiers**: id (UUID PK), document_type (approval_document_type), tier_name, tier_order, min_value, max_value (null=unlimited), required_role (user_role), is_active, created_at, updated_at. UNIQUE (document_type, tier_order).

**purchase_requisitions**: id (UUID PK), pr_number (UNIQUE), title, requested_by (FK), outlet_id (FK), required_date, priority, total_estimated_value, status (pr_status), remarks, current_approval_tier, created_at, updated_at.

**purchase_requisition_items**: id (UUID PK), pr_id (FK CASCADE), item_id (FK), required_qty, uom, estimated_unit_price, estimated_total, current_stock (snapshot), justification, line_status.

**request_for_quotations**: id (UUID PK), rfq_number (UNIQUE), pr_id (FK), title, issued_by (FK), issue_date, response_deadline, delivery_required_by, status (rfq_status), terms_and_conditions, notes, created_at, updated_at.

**rfq_items**: id (UUID PK), rfq_id (FK CASCADE), item_id (FK), required_qty, uom, pr_item_id (FK), specifications.

**rfq_vendors**: id (UUID PK), rfq_id (FK CASCADE), vendor_id (FK), invited_at, email_sent_at, responded_at, response_status. UNIQUE (rfq_id, vendor_id).

**quotations**: id (UUID PK), quotation_number (UNIQUE), rfq_id (FK), vendor_id (FK), submitted_at, valid_until, payment_terms, delivery_lead_time_days, status (quotation_status), total_value, document_url, notes. UNIQUE (rfq_id, vendor_id).

**quotation_line_items**: id (UUID PK), quotation_id (FK CASCADE), rfq_item_id (FK), item_id (FK), quoted_qty, uom, unit_price, discount_percent, tax_percent, net_unit_price, total_price, brand, country_of_origin, notes.

**comparative_statements**: id (UUID PK), cs_number (UNIQUE), rfq_id (FK UNIQUE), prepared_by (FK), prepared_at, recommendation_notes, status ('DRAFT'|'FINALIZED'|'APPROVED'), approved_by (FK), approved_at.

**cs_line_selections**: id (UUID PK), cs_id (FK CASCADE), rfq_item_id (FK), item_id (FK), selected_vendor_id (FK), selected_quotation_line_id (FK), selected_unit_price, selected_qty, selection_reason, lowest_price_vendor_id (FK), lowest_price, price_variance_from_lowest. UNIQUE (cs_id, rfq_item_id).

**purchase_orders**: id (UUID PK), po_number (UNIQUE), vendor_id (FK), cs_id (FK), rfq_id (FK), pr_id (FK), created_by (FK), outlet_id (FK), po_date, delivery_date, delivery_address, payment_terms, subtotal, tax_amount, discount_amount, total_amount, status (po_status), terms_and_conditions, internal_notes, current_approval_tier, sent_to_vendor_at, created_at, updated_at.

**purchase_order_items**: id (UUID PK), po_id (FK CASCADE), item_id (FK), cs_line_id (FK), ordered_qty, received_qty, uom, unit_price, discount_percent, tax_percent, total_price, line_status.

**grns**: id (UUID PK), grn_number (UNIQUE), po_id (FK), vendor_id (FK), received_by (FK), storage_location_id (FK), grn_date, vendor_invoice_number, vendor_invoice_date, vendor_invoice_amount, vehicle_number, status (grn_status), total_received_value, total_rejected_value, temperature_at_receipt, document_url, remarks, posted_at, posted_by (FK), created_at, updated_at.

**grn_items**: id (UUID PK), grn_id (FK CASCADE), po_item_id (FK), item_id (FK), ordered_qty (snapshot), received_qty, accepted_qty, rejected_qty, rejection_reason, uom, unit_price, total_accepted_value, batch_number, expiry_date, temperature_at_receipt.

**approval_records** (immutable once actioned): id (UUID PK), document_type (approval_document_type), document_id, document_number, tier_id (FK), tier_order, approver_id (FK), status (approval_status), action_at, comments, escalated_to (FK), escalated_at, created_at. Indexes on (document_type, document_id) and (approver_id, status) WHERE status='PENDING'.

**price_history** (append-only): id (UUID PK), item_id (FK), vendor_id (FK), grn_id (FK), po_id (FK), quotation_line_id (FK), unit_price, uom, quantity, effective_date, recorded_at. Index on (item_id, vendor_id, effective_date DESC).

**price_alerts**: id (UUID PK), item_id (FK), vendor_id (FK), alert_type (price_alert_type), previous_price, current_price, change_percent, threshold_percent, is_read, is_resolved, triggered_at, resolved_by (FK), resolved_at.

**price_alert_config**: id (UUID PK), item_id (FK, null=global), spike_threshold_percent (default 10), drop_threshold_percent (default 10), lookback_days (default 30), is_active, updated_by (FK), updated_at. UNIQUE (item_id).

**vendor_ranking_config**: id (UUID PK), config_name, price_weight (30), delivery_weight (25), quality_weight (25), response_time_weight (10), payment_terms_weight (10), evaluation_period_months (6), is_active, updated_by (FK), updated_at. CHECK: weights sum to 100.

**vendor_ranking_scores**: id (UUID PK), vendor_id (FK), config_id (FK), period_from, period_to, price_score, delivery_score, quality_score, response_time_score, payment_terms_score, weighted_total_score, rank_in_category, vendor_category_id (FK), po_count, grn_count, computed_at.

### ER Relationships Summary

```
outlets ← users, storage_locations, purchase_requisitions, purchase_orders
item_categories ←(self) item_categories; item_categories ← items
storage_locations ← items
items ← pr_items, rfq_items, quotation_line_items, cs_line_selections,
        po_items, grn_items, stock_ledger, price_history, price_alerts,
        vendor_item_mapping
vendor_categories ← vendors
vendors ← vendor_item_mapping, rfq_vendors, quotations, purchase_orders,
          grns, vendor_performance_records, vendor_ranking_scores, price_history
purchase_requisitions ← pr_items, rfqs, purchase_orders
request_for_quotations ← rfq_items, rfq_vendors, quotations,
                         comparative_statements, purchase_orders
quotations ← quotation_line_items
comparative_statements ← cs_line_selections ← purchase_order_items
purchase_orders ← purchase_order_items, grns
grns ← grn_items, price_history, vendor_performance_records, stock_ledger
approval_tiers ← approval_records
```

---

## 5. Role Permissions Matrix

| Permission | ADMIN | STORE_MGR | FB_MGR | FINANCE | GM |
|---|:--:|:--:|:--:|:--:|:--:|
| Users CRUD | Y | N | N | N | N |
| Item create/edit | Y | Y | N | N | N |
| Item deactivate | Y | N | N | N | N |
| Adjust par levels | Y | Y | N | N | N |
| Categories/storage config | Y | partial | N | N | N |
| Vendor create/edit | Y | Y | N | N | N |
| Vendor approve/blacklist | Y | N | N | N | Y |
| Vendor banking view | Y | N | N | Y | N |
| PR create | Y | Y | Y | N | N |
| PR approve T1 / T2 / T3 | Y | T1 | T2 | N | T3 |
| RFQ create/send | Y | Y | Y | N | N |
| Quotation entry | Y | Y | Y | N | N |
| CS prepare | Y | Y | Y | N | N |
| CS approve | Y | N | Y | N | Y |
| PO create/edit | Y | Y | Y | N | N |
| PO approve T1/T2/T3/T4 | Y | T1 | T2 | T3 | T4 |
| PO send to vendor | Y | Y | N | N | N |
| PO cancel | Y | N | N | N | Y |
| GRN create/post/reject | Y | Y | N | N | N |
| Price history view | Y | Y | Y | Y | Y |
| Price alert config | Y | N | N | Y | N |
| Resolve alerts | Y | Y | N | Y | N |
| Vendor ranking view | Y | Y | Y | Y | Y |
| Ranking weight config | Y | N | N | N | Y |
| Approval tier config | Y | N | N | N | N |
| Dashboard / export | Y | Y | Y | Y | Y |

---

## 6. Module 1 — Master Inventory

### Context
The Item Master is the foundation of inventory discipline. Each item needs a unique code (the same ingredient may be purchased under different vendor descriptions). Par levels define operational safety nets — min par is the floor, max par prevents over-purchasing of perishables. Storage location ties each item to its physical home for stock counts.

### User Stories
- As a **Store Manager**, I want to create an item master record with category, UOM, par levels, storage location so procurement and stock management are standardised.
- As a **Store Manager**, I want to see all items below reorder point so I can raise PRs proactively.
- As a **Store Manager**, I want to adjust par levels seasonally so targets reflect current menu requirements.
- As an **F&B Manager**, I want stock value by category so I can manage F&B cost percentages.
- As an **Admin**, I want to deactivate discontinued items so they no longer appear in purchasing.
- As any **user**, I want to search items by name/code/category quickly.

### API Endpoints — Items
| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/v1/items | All | List (paginated, filterable) |
| GET | /api/v1/items/:id | All | Detail |
| POST | /api/v1/items | ADMIN, STORE_MGR | Create |
| PUT | /api/v1/items/:id | ADMIN, STORE_MGR | Update |
| PATCH | /api/v1/items/:id/status | ADMIN | Change status |
| PATCH | /api/v1/items/:id/par-levels | ADMIN, STORE_MGR | Update par levels |
| GET | /api/v1/items/below-reorder | ADMIN, STORE_MGR, FB_MGR | Below reorder point |
| GET | /api/v1/items/:id/stock-ledger | ADMIN, STORE_MGR | Stock movement history |
| GET | /api/v1/items/:id/price-history | All | Price history |

Categories: GET/POST/PUT/DELETE `/api/v1/categories` (tree structure, soft delete only if no items linked).
Storage locations: GET/POST/PUT `/api/v1/storage-locations`.

**POST /api/v1/items body:**
```json
{
  "item_code": "DRY-001", "name": "Basmati Rice Long Grain",
  "category_id": "uuid", "primary_uom": "KG", "secondary_uom": "BG",
  "conversion_factor": 25, "storage_location_id": "uuid",
  "par_level_min": 50, "par_level_max": 200, "reorder_point": 75,
  "reorder_qty": 100, "is_perishable": false, "hsn_code": "1006",
  "tax_rate_percent": 5
}
```

### Business Rules
1. par_level_max > par_level_min.
2. reorder_point between par_level_min and par_level_max.
3. reorder_qty > 0.
4. Item code format `[CAT_CODE]-[3-digit seq]`.
5. is_perishable=true requires shelf_life_days.
6. Cannot change primary_uom while open PO/GRN/PR exists.
7. current_stock never edited directly — derived from stock ledger.
8. average_cost recalculated via weighted average on each GRN posting.
9. Items cannot be deactivated while on open POs/PRs.
10. Categories support up to 3 nesting levels.

### UI Screens
- **InventoryListPage**: filterable grid, color-code rows below par (red) / below reorder (amber).
- **ItemFormPage**: multi-section form (General, UOM, Storage & Par, Tax & Costing, Status).
- **ParLevelAlertPage**: items below reorder, bulk "Create PR".
- **InventoryDetailPage**: stock card, ledger history, price summary, linked POs.
- **CategoryListPage**: hierarchical tree with modals.
- **StorageLocationListPage**: grouped by zone with temperature ranges.

---

## 7. Module 2 — Vendor Management

### Context
Hotels deal with 50–200 vendors. The vendor master captures contact, financial terms (credit limit, payment terms), banking details (for Finance payments), compliance (GSTIN/PAN), and performance history. Vendor categories ensure only relevant vendors are invited per RFQ.

### User Stories
- As a **Store Manager**, I want to register a vendor with all mandatory details so they can be invited to RFQs.
- As a **Store Manager**, I want to map vendors to items they supply so RFQ invitations are auto-suggested.
- As an **F&B Manager**, I want to view vendor performance history before selecting them on a CS.
- As a **Finance** user, I want vendor banking details to process payments.
- As a **GM**, I want to blacklist a vendor with a documented reason.
- As an **Admin**, I want a vendor's full transaction history on one screen.

### API Endpoints
GET/POST/PUT `/api/v1/vendors`; PATCH `/api/v1/vendors/:id/status` (ADMIN, GM); GET `/api/v1/vendors/:id/performance`, `/performance/records`, `/purchase-history`, `/items`; POST/PUT/DELETE `/api/v1/vendors/:id/items` (mapping); GET/POST `/api/v1/vendor-categories`.

### Business Rules
1. email & phone unique across vendors.
2. Vendor code auto-generated `V-[YYYYMM]-[4-digit seq]`.
3. BLACKLISTED → ACTIVE requires GM approval workflow.
4. Banking details masked for non-Finance/non-Admin roles via field-level redaction.
5. No hard delete — deactivation/blacklist only.
6. Only one preferred vendor per item (unique partial index).
7. credit_limit positive if provided.
8. Blacklisting cancels all open RFQ invitations for that vendor.
9. Performance metrics are read-only computed fields.

### UI Screens
- **VendorListPage**: filters by category/status/city, star rating display, status badges.
- **VendorDetailPage**: tabs — General, Banking (role-gated), Mapped Items, Performance (KPI cards + 12-month line chart), Purchase History, Rankings.
- **VendorFormPage**: multi-section create/edit (address, banking, tax).

---

## 8. Module 3 — Procurement Flow

### Context
PR → RFQ → Quotations → Comparative Statement → PO (approval) → GRN. Every stage creates a document trail traceable by finance and auditors.

### 8.1 Purchase Requisition
**Stories**: multi-item PR with required qty/dates; urgent CRITICAL PRs prioritized; auto pre-populate current stock per line; GM inbox sorted by urgency.

Endpoints: GET/POST/PUT `/api/v1/purchase-requisitions`; POST `/:id/submit`, `/:id/convert-to-rfq`; DELETE (DRAFT only). Service auto-generates `PR-YYYYMM-NNNN`, snapshots current_stock, computes total_estimated_value, determines first approval tier.

### 8.2 RFQ
**Stories**: generate RFQ from approved PR with auto-suggested vendors; set response deadline; send RFQ emails in one action.

Endpoints: GET/POST/PUT `/api/v1/rfqs`; POST `/:id/send`, `/:id/vendors`; DELETE `/:id/vendors/:vendorId`; GET `/:id/suggested-vendors`.

### 8.3 Quotation Entry
**Stories**: manually enter vendor quotation data; attach original PDF; see last purchase price beside quoted price.

Endpoints: GET/POST/PUT `/api/v1/quotations`; POST `/:id/document`. Service computes net_unit_price = unit_price*(1-discount/100); total = net*qty*(1+tax/100); updates rfq_vendors response status.

### 8.4 Comparative Statement
**Stories**: side-by-side quotation matrix per item; auto-highlight lowest price; split-vendor selection; justification note for non-lowest selections.

Endpoints: GET/POST/PUT `/api/v1/comparative-statements`; POST `/:id/finalize`, `/:id/create-pos`. Build comparison matrix by joining quotation_line_items grouped by rfq_item_id, annotate minimum price.

### 8.5 Purchase Order
**Stories**: one-click PO from finalized CS; see PO value/approval tier; Finance approves above threshold; send PO to vendor by email.

Endpoints: GET/POST/PUT `/api/v1/purchase-orders`; POST `/:id/submit`, `/:id/send`; PATCH `/:id/cancel` (GM only, not if PARTIALLY_RECEIVED); GET `/:id/grns`.

### 8.6 GRN
**Stories**: GRN against PO with actual received/rejected qty; flag quality issues with rejection reason (feeds vendor performance); record vendor invoice for Finance matching; view ordered-vs-received variances.

Endpoints: GET/POST/PUT `/api/v1/grns`; POST `/:id/post`, `/:id/reject`, `/:id/document`.

**GRN Posting Logic (transactional):**
1. Validate DRAFT status.
2. Per item: increment current_stock by accepted_qty; recalc average_cost via weighted average `((stock*avg)+(accepted*price))/(stock+accepted)`; update last_purchase_price; insert stock_ledger row; insert price_history row.
3. Update po_items.received_qty.
4. Update PO status PARTIALLY/FULLY_RECEIVED.
5. Insert vendor_performance_record (delivery timing + quality).
6. Set grn.status=POSTED, posted_at=NOW().
7. Trigger price alert job (async).
8. Wrap all in DB transaction.

---

## 9. Module 4 — Multi-Tier Approval Workflow

### Context
Strict financial controls. ₹5,000 herbs = store manager; ₹500,000 equipment = GM. Tiers are DB-configurable without code changes.

### Default Tiers
**PR**: T1 STORE_MGR ₹0–25k; T2 FB_MGR ₹25k–100k; T3 GM ₹100k+.
**PO**: T1 STORE_MGR ₹0–10k; T2 FB_MGR ₹10k–50k; T3 FINANCE ₹50k–200k; T4 GM ₹200k+.

### Workflow Logic
On submit: look up tiers; cumulative chain (a ₹300k PO passes all 4 tiers); create approval_records PENDING in tier_order; notify T1; on each approval notify next tier; final approval → document APPROVED; any rejection → REJECTED + notify originator.

### User Stories
- As a **Store Manager**, I want an approval inbox of documents awaiting my action.
- As an **F&B Manager**, I want to approve/reject a PR with a comment.
- As a **GM**, I want email notification for high-value PO approvals.
- As an **Admin**, I want to configure tiers/thresholds without code changes.
- As an **F&B Manager**, I want current stock shown when approving a PR.

### API Endpoints
GET `/api/v1/approvals/inbox`, `/:id`, `/history`; POST `/:id/approve`, `/:id/reject`, `/:id/escalate`; GET/POST/PUT `/api/v1/approval-tiers` (ADMIN).

### Business Rules
1. Cannot approve own submitted documents.
2. Only action approvals at your tier (role-enforced).
3. Document value change resets the chain (edits blocked on non-DRAFT).
4. Escalation target must share the tier's required role.
5. Rejection notifies originator + previous approvers.
6. Approval records immutable once actioned.

### UI Screens
- **ApprovalInboxPage**: card/table with doc type, number, value, requester, age, priority; quick Approve/Reject modals.
- **ApprovalDetailPage**: read-only document preview + approval chain stepper + comment panel.
- Admin tier config screen with inline editing.

---

## 10. Module 5 — Price History & Tracking

### Context
Price volatility is a major F&B challenge. Without systematic tracking, the same item is bought at different prices from the same vendor. Enables trend analysis, budget forecasting, anomaly/fraud detection.

### User Stories
- As an **F&B Manager**, I want a 12-month price trend chart for budget planning.
- As a **Finance** user, I want to configure spike/drop thresholds.
- As a **Store Manager**, I want alerts when a quote is >10% above last purchase price.
- As an **F&B Manager**, I want multi-vendor price comparison on one chart.
- As a **Finance** user, I want to export price history to Excel.

### API Endpoints
GET `/api/v1/price-history` (filterable), `/trend`, `/compare`, `/export?format=csv`; GET `/api/v1/price-alerts`, `/:id`; PATCH `/:id/resolve`, `/:id/read`; GET/PUT `/api/v1/price-alert-config`, `/item/:itemId`.

### Price Alert Job Logic
On GRN posting (triggered) + nightly cron: fetch last N price records (lookback_days); compute benchmark = moving average; if new_price > benchmark*(1+spike%) → SPIKE alert; if < benchmark*(1-drop%) → DROP alert; notify Finance + F&B Manager; per-item config overrides global.

### Business Rules
1. Price history immutable (actual transaction prices).
2. Default thresholds ±10%, per-item overridable.
3. Default lookback 30 days.
4. <3 data points in window → no alert (insufficient data).
5. Alerts only on GRN posting (actual purchases), not quotation entry.
6. Dedupe: max one alert per item-vendor-type per day.

### UI Screens
- **PriceHistoryPage**: item selector + date range; tabs: history table (date, vendor, qty, price, %change), trend chart (line per vendor).
- **PriceAlertListPage**: alert table with SPIKE/DROP badges, resolve action.

---

## 11. Module 6 — Vendor Ranking Engine

### Context
Transforms procurement from "cheapest wins" to "best total-value partner". Weighted scoring from actual transaction data — not subjective ratings. Finance can emphasize price, Operations can emphasize delivery.

### Scoring Dimensions
| Dimension | Metric | Method |
|---|---|---|
| Price | avg net price vs market avg | Lower = higher (best=100) |
| Delivery | on_time_delivery_rate % | Direct % → score |
| Quality | quality_pass_rate % | Direct % → score |
| Response Time | avg rfq_response_time_hours | Inverse, capped 48h |
| Payment Terms | IMMEDIATE=20…NET_60=100, COD=50 | Lookup |

`total = price*pw + delivery*dw + quality*qw + response*rw + payment*ptw` (weights/100, sum=100).

### User Stories
- As an **F&B Manager**, I want vendors ranked by category for top-performer identification.
- As a **GM**, I want to configure dimension weights to reflect hotel priorities.
- As a **Store Manager**, I want a vendor radar chart across all five dimensions.
- As an **F&B Manager**, I want vendor ranking shown on the comparative statement.
- As a **GM**, I want monthly automatic recalculation.

### API Endpoints
GET `/api/v1/vendor-rankings` (filter by category), `/:vendorId`, `/:vendorId/history`; POST `/recalculate` (ADMIN, GM); GET/PUT `/api/v1/vendor-ranking-config` (weights must sum to 100).

### Ranking Algorithm
1. Load active config; period = today − evaluation_period_months.
2. Per vendor with ≥3 GRNs: compute price_score (vs cheapest per item, averaged), delivery_score (avg on_time*100), quality_score (avg quality_pass_rate), response_time_score (max(0,100−avg_hours/48*100)), payment_terms_score (lookup), weighted_total.
3. Insert vendor_ranking_scores; update vendors.rating = total/20; rank within category.

### Business Rules
1. Minimum 3 GRNs in period to be scored; else "Insufficient Data".
2. Config change marks scores stale → recalculation required.
3. Manual recalc anytime (Admin/GM); auto on 1st of month.
4. Historical scores preserved (never deleted).
5. Weight sum = 100 enforced to 2 decimal precision.

### UI Screens
- **VendorRankingPage**: leaderboard (rank, name, category, total, breakdown bars, ▲▼ rank change); radar chart per vendor; score history line chart.
- **RankingConfigPage**: 5 weight sliders constrained to sum 100, evaluation period selector, live re-order preview.

---

## 12. Authentication & Authorization

### JWT Flow
1. `POST /api/v1/auth/login` → `{ access_token, refresh_token, user }`.
2. access_token: JWT, 8h expiry, payload `{ sub, role, email, iat, exp }`.
3. refresh_token: 7d, HttpOnly cookie.
4. `POST /api/v1/auth/refresh` → new access_token.
5. `POST /api/v1/auth/logout` → revoke refresh token (revoked_tokens table or Redis).

Middleware chain: `authenticate → authorize([roles]) → validate(schema) → controller`.

Endpoints: POST `/auth/login`, `/auth/refresh`, `/auth/logout`; GET `/auth/me`; PATCH `/auth/change-password`; GET/POST/PUT `/api/v1/users` (ADMIN); PATCH `/users/:id/status`.

Field-level security: banking details stripped from vendor responses except ADMIN, FINANCE, GM_DIRECTOR.

---

## 13. Development Phases with Story Points

Scale: 1=trivial, 2=small, 3=medium, 5=large, 8=very large, 13=complex.

| Phase | Scope | Points | Duration |
|---|---|---|---|
| 1 — Foundation | Scaffold, DB schema, JWT auth, user CRUD, AppShell, login, protected routes | 38 | 2 wk |
| 2 — Master Data | Categories, storage, item master, stock ledger, vendors, vendor-item mapping + all UI | 84 | 2 wk |
| 3 — Procurement Core | PR, RFQ, Quotation, CS, PO, GRN APIs + UI + email + GRN transaction | 136 | 4 wk |
| 4 — Approval Workflow | Tier config, approval engine, actions, inbox, notifications + UI + integration | 58 | 2 wk |
| 5 — Price History & Alerts | History API, trend/compare, alert job, config, export + UI | 44 | 2 wk |
| 6 — Vendor Ranking | Config, calculation service, cron, read APIs + leaderboard/radar UI | 57 | 2 wk |
| 7 — Dashboard & Polish | Dashboard KPIs/charts, reports, export, search, notifications, security audit, docs | 74 | 2 wk |
| **Total** | | **491** | **~16 wk** |

Assumes 1 backend + 1 frontend developer at ~30–35 points/dev/sprint.

---

## Key Architectural Decisions

1. **UUID primary keys** — prevents enumeration attacks, enables future multi-tenancy.
2. **Soft deletes** — items/vendors/users never hard-deleted; status flags control visibility.
3. **Immutable audit trail** — stock_ledger, price_history, approval_records, vendor_performance_records are append-only.
4. **GRN posting is the single source of truth** — stock adjustments only via posted GRN transaction.
5. **Approval engine is data-driven** — tier config in DB, not code constants.
6. **Weighted ranking algorithm-defined** — weights in DB, algorithm fixed.
7. **Price alerts threshold-driven from GRN events** — no subjective manual creation.
8. **Field-level security for banking data** — enforced at service/controller layer.

### Environment Variables (.env.example)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/hfims
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx
SMTP_FROM=noreply@hotel.com
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE_MB=10
PORT=3000
NODE_ENV=production
PRICE_ALERT_CRON=0 6 * * *
RANKING_CRON=0 2 1 * *
```

### Most Critical Files for Implementation

- `/backend/prisma/schema.prisma` — single source of DB truth; all tables/enums/relations; every module depends on it.
- `/backend/src/modules/grn/grn.service.ts` — most complex service; atomic GRN posting transaction.
- `/backend/src/modules/approvals/approvals.service.ts` — approval engine; all procurement docs depend on it.
- `/backend/src/modules/comparative-statements/cs.service.ts` — comparison matrix + split-vendor PO generation.
- `/frontend/src/pages/procurement/ComparativeStatementPage.tsx` — most complex UI; vendor-vs-item matrix.

---
---

# PART II — Comprehensiveness Extension (v1.1)

## 14. Extension Overview & New Enums

### 14.1 Why This Extension Exists

Part I delivers a strong **procurement** engine but, reviewed as a working hotel
F&B system, it only models stock coming **IN**. A comprehensive system must also
model stock going **OUT**, the **finance close** (invoice → payment), real-world
**rate contracts / standing orders**, **expiry/FEFO** for perishables, **recipe
costing**, a full **reports** suite, **system configuration**, a global **audit
log**, and a set of **ease-of-use** capabilities (bulk import, role dashboards,
barcode, delegation, mobile receiving). Part II specifies all of these.

### 14.2 Closure Map (review gap → where addressed)

| # | Gap | Addressed in |
|---|---|---|
| 1 | Stock issuance / consumption / inter-store transfer | Module 7 (§16) |
| 2 | Physical stock count / reconciliation | Module 7 (§16.3) |
| 3 | Wastage / spoilage | Module 7 (§16.4) |
| 4 | Invoice verification, 3-way match, payments | Module 8 (§17) |
| 5 | Rate contracts / standing orders | Module 9 (§18) |
| 6 | Returns to vendor / debit notes | Module 8 (§17.3) |
| 7 | Batch / expiry / FEFO | Module 10 (§19) |
| 8 | Reports suite | Module 12 (§21.1) |
| 9 | Recipe / BOM costing | Module 11 (§20) |
| 10 | Approval delegation / out-of-office | §22.1 |
| 11 | Settings / master configuration | Module 13 (§21.2) |
| 12 | Bulk import/export | §22.2 |
| 13 | Role-specific dashboards | §22.3 |
| 14 | PO amendment / revision | §22.4 |
| 15 | General audit log | Module 14 (§21.3) |
| EoU | Barcode/QR, mobile receiving, global search, notifications, landed cost | §22.5–22.9 |

### 14.3 New Enumerations

```sql
CREATE TYPE issuance_status AS ENUM ('DRAFT', 'REQUESTED', 'APPROVED', 'PARTIALLY_ISSUED', 'ISSUED', 'CANCELLED');
CREATE TYPE transfer_status AS ENUM ('DRAFT', 'IN_TRANSIT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED');
CREATE TYPE stock_count_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'COUNTED', 'VARIANCE_REVIEW', 'APPROVED', 'POSTED', 'CANCELLED');
CREATE TYPE stock_count_type AS ENUM ('FULL', 'CYCLE', 'SPOT', 'CATEGORY');
CREATE TYPE wastage_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED');
CREATE TYPE wastage_reason AS ENUM ('EXPIRED', 'SPOILED', 'DAMAGED', 'BREAKAGE', 'OVER_PRODUCTION', 'CONTAMINATION', 'PEST', 'OTHER');
CREATE TYPE invoice_status AS ENUM ('RECEIVED', 'UNDER_VERIFICATION', 'MATCHED', 'MISMATCH_HOLD', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'DISPUTED', 'CANCELLED');
CREATE TYPE match_status AS ENUM ('NOT_MATCHED', 'MATCHED', 'PRICE_VARIANCE', 'QTY_VARIANCE', 'BOTH_VARIANCE');
CREATE TYPE payment_status AS ENUM ('SCHEDULED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSED', 'FAILED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CHEQUE', 'CASH', 'UPI', 'CARD', 'ADJUSTMENT');
CREATE TYPE debit_note_status AS ENUM ('DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'SETTLED', 'CANCELLED');
CREATE TYPE debit_note_reason AS ENUM ('POST_RECEIPT_DEFECT', 'SHORT_SUPPLY', 'PRICE_OVERCHARGE', 'QUALITY_REJECTION', 'EXPIRY', 'OTHER');
CREATE TYPE contract_status AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED');
CREATE TYPE standing_order_frequency AS ENUM ('DAILY', 'ALTERNATE_DAYS', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM_DAYS');
CREATE TYPE standing_order_status AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');
CREATE TYPE expiry_alert_level AS ENUM ('NEAR_EXPIRY', 'EXPIRED', 'CRITICAL');
CREATE TYPE notification_type AS ENUM ('APPROVAL_PENDING', 'APPROVAL_RESULT', 'PRICE_ALERT', 'EXPIRY_ALERT', 'REORDER_ALERT', 'GRN_POSTED', 'PAYMENT_DUE', 'CONTRACT_EXPIRING', 'STOCK_COUNT_DUE', 'SYSTEM');
CREATE TYPE notification_channel AS ENUM ('IN_APP', 'EMAIL', 'BOTH');
CREATE TYPE po_revision_status AS ENUM ('ORIGINAL', 'AMENDED', 'SUPERSEDED');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'APPROVE', 'REJECT', 'POST', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT');
```

### 14.4 New Folder Modules (backend `src/modules/`, frontend `pages/`)

```
backend/src/modules/
  stock-issuance/  stock-transfer/  stock-count/  wastage/
  invoices/  payments/  debit-notes/
  rate-contracts/  standing-orders/
  batch-expiry/  recipes/
  reports/  settings/  audit-log/  notifications/
  dashboard/  bulk-io/  delegations/

backend/src/jobs/
  expiryAlertJob.ts  standingOrderJob.ts  reorderAlertJob.ts
  paymentDueJob.ts   contractExpiryJob.ts

frontend/src/pages/
  stock-ops/   (Issuance, Transfer, StockCount, Wastage)
  finance/     (InvoiceList, InvoiceMatch, PaymentList, DebitNote)
  contracts/   (RateContractList/Form, StandingOrderList/Form)
  expiry/      (ExpiryDashboard, BatchTrace)
  recipes/     (RecipeList/Form, RecipeCosting)
  reports/     (ReportCenter + per-report pages)
  settings/    (UomMaster, TaxMaster, NumberSeries, HotelProfile, FinancialYear)
  audit/       (AuditLogViewer)
  dashboard/   (role-specific dashboard variants)
```

---

## 15. New Database Tables

> All tables follow Part I conventions: UUID PK `gen_random_uuid()`, `created_at`/
> `updated_at` TIMESTAMPTZ, `@db.Decimal` for money/qty, soft-delete via status, and
> append-only ledger writes for any stock-affecting action.

### Stock Operations

**stock_issuances** — issue from a store to a consuming outlet/department.
id (PK), issuance_number (UNIQUE, `ISS-YYYYMM-NNNN`), from_storage_location_id (FK), to_outlet_id (FK), requested_by (FK users), approved_by (FK users, nullable), issuance_date, purpose, cost_center, status (issuance_status), total_value, remarks, posted_at, posted_by (FK), created_at, updated_at.

**stock_issuance_items** — id (PK), issuance_id (FK CASCADE), item_id (FK), batch_id (FK item_batches, nullable — FEFO-selected), requested_qty, issued_qty, uom, unit_cost (weighted-avg snapshot), total_cost, line_status.

**stock_transfers** — store-to-store movement. id (PK), transfer_number (UNIQUE, `TRF-YYYYMM-NNNN`), from_storage_location_id (FK), to_storage_location_id (FK), initiated_by (FK), received_by (FK, nullable), dispatch_date, receipt_date (nullable), status (transfer_status), total_value, remarks, created_at, updated_at.

**stock_transfer_items** — id (PK), transfer_id (FK CASCADE), item_id (FK), batch_id (FK, nullable), sent_qty, received_qty, uom, unit_cost, variance_qty, variance_reason, line_status.

**stock_counts** — physical count header. id (PK), count_number (UNIQUE, `STK-YYYYMM-NNNN`), count_type (stock_count_type), storage_location_id (FK, nullable for full), category_id (FK, nullable), scheduled_date, started_at, completed_at, counted_by (FK), reviewed_by (FK, nullable), approved_by (FK, nullable), is_blind (BOOLEAN — hide system qty during count), status (stock_count_status), total_variance_value, remarks, created_at, updated_at.

**stock_count_items** — id (PK), count_id (FK CASCADE), item_id (FK), batch_id (FK, nullable), system_qty (snapshot), counted_qty, variance_qty (computed), uom, unit_cost, variance_value, variance_percent, variance_reason, recount_flag (BOOLEAN), counted_at.

**wastage_records** — id (PK), wastage_number (UNIQUE, `WST-YYYYMM-NNNN`), storage_location_id (FK), outlet_id (FK, nullable), reported_by (FK), approved_by (FK, nullable), wastage_date, reason (wastage_reason), status (wastage_status), total_wastage_value, attachment_url, remarks, posted_at, created_at, updated_at.

**wastage_items** — id (PK), wastage_id (FK CASCADE), item_id (FK), batch_id (FK, nullable), qty, uom, unit_cost, total_value, item_reason, photo_url.

### Finance & Payments

**vendor_invoices** — id (PK), invoice_number (vendor's), internal_ref (UNIQUE, `INV-YYYYMM-NNNN`), vendor_id (FK), po_id (FK, nullable), invoice_date, due_date (derived from payment_terms), received_date, currency (default base), subtotal, tax_amount, freight_amount, other_charges, discount_amount, total_amount, status (invoice_status), match_status (match_status), document_url, verified_by (FK, nullable), approved_by (FK, nullable), notes, created_at, updated_at.

**vendor_invoice_items** — id (PK), invoice_id (FK CASCADE), po_item_id (FK, nullable), grn_item_id (FK, nullable), item_id (FK), invoiced_qty, uom, unit_price, tax_percent, line_total, matched_grn_qty, qty_variance, price_variance, line_match_status (match_status).

**invoice_grn_links** — N:N invoice↔GRN (one invoice may cover multiple GRNs). id (PK), invoice_id (FK), grn_id (FK), linked_value. UNIQUE (invoice_id, grn_id).

**payments** — id (PK), payment_number (UNIQUE, `PAY-YYYYMM-NNNN`), vendor_id (FK), payment_date, scheduled_date, method (payment_method), amount, currency, bank_reference, status (payment_status), approved_by (FK, nullable), processed_by (FK, nullable), remarks, created_at, updated_at.

**payment_allocations** — apply one payment across many invoices. id (PK), payment_id (FK CASCADE), invoice_id (FK), allocated_amount, debit_note_id (FK, nullable — settled via debit note). UNIQUE (payment_id, invoice_id).

**debit_notes** — vendor return / chargeback. id (PK), debit_note_number (UNIQUE, `DN-YYYYMM-NNNN`), vendor_id (FK), grn_id (FK, nullable), invoice_id (FK, nullable), reason (debit_note_reason), debit_date, status (debit_note_status), total_amount, reason_detail, document_url, issued_by (FK), created_at, updated_at.

**debit_note_items** — id (PK), debit_note_id (FK CASCADE), item_id (FK), batch_id (FK, nullable), qty, uom, unit_price, total_value, reason_detail.

### Contracts & Standing Orders

**rate_contracts** — id (PK), contract_number (UNIQUE, `RC-YYYY-NNNN`), vendor_id (FK), title, start_date, end_date, status (contract_status), payment_terms, auto_renew (BOOLEAN), renewal_notice_days, terms_url, created_by (FK), approved_by (FK, nullable), created_at, updated_at.

**rate_contract_items** — locked price for the period. id (PK), contract_id (FK CASCADE), item_id (FK), contracted_unit_price, uom, min_order_qty, max_period_qty (nullable cap), price_revision_clause, is_active. UNIQUE (contract_id, item_id).

**standing_orders** — recurring auto-PO (milk/bread/produce). id (PK), so_number (UNIQUE, `SO-YYYY-NNNN`), vendor_id (FK), contract_id (FK rate_contracts, nullable), outlet_id (FK), frequency (standing_order_frequency), custom_days (INT[] — weekdays for CUSTOM_DAYS), start_date, end_date (nullable), next_run_date, delivery_lead_days, status (standing_order_status), auto_approve (BOOLEAN), created_by (FK), created_at, updated_at.

**standing_order_items** — id (PK), standing_order_id (FK CASCADE), item_id (FK), default_qty, uom, unit_price (from contract or last), is_active.

**standing_order_runs** — audit of each generated PO. id (PK), standing_order_id (FK), run_date, generated_po_id (FK purchase_orders, nullable), status, skip_reason (nullable), created_at.

### Batch & Expiry

**item_batches** — per-batch stock with expiry; the FEFO source of truth. id (PK), item_id (FK), grn_item_id (FK, nullable), batch_number, storage_location_id (FK), received_qty, available_qty, unit_cost, manufacture_date (nullable), expiry_date (nullable), supplier_lot, status ('ACTIVE','EXHAUSTED','EXPIRED','QUARANTINED'), created_at, updated_at. Index (item_id, expiry_date ASC) for FEFO.

**expiry_alerts** — id (PK), item_id (FK), batch_id (FK), storage_location_id (FK), expiry_date, days_to_expiry, alert_level (expiry_alert_level), available_qty, value_at_risk, is_read, is_actioned, action_taken, triggered_at, actioned_by (FK, nullable).

### Recipe / BOM

**recipes** — id (PK), recipe_code (UNIQUE), name, outlet_id (FK, nullable), category, yield_qty, yield_uom, prep_notes, selling_price (nullable), is_active, created_by (FK), created_at, updated_at.

**recipe_ingredients** — id (PK), recipe_id (FK CASCADE), item_id (FK, nullable), sub_recipe_id (FK recipes, nullable — nested recipes), qty, uom, wastage_percent, is_active. CHECK: exactly one of item_id / sub_recipe_id set.

**recipe_costings** — periodic computed cost snapshot. id (PK), recipe_id (FK), computed_at, total_cost, cost_per_yield_unit, food_cost_percent (vs selling_price), computed_by (FK).

### Configuration, Audit, Notifications

**uom_master** — id (PK), code (UNIQUE), name, dimension ('WEIGHT','VOLUME','COUNT'), base_uom_code (nullable), conversion_to_base (DECIMAL), is_active. *(Replaces the hard-coded `uom` enum at config layer; enum retained for typed columns, validated against this table.)*

**tax_master** — id (PK), code (UNIQUE), name, rate_percent, is_compound, is_active, effective_from, effective_to.

**number_series** — id (PK), document_type (UNIQUE), prefix, padding, current_value, reset_frequency ('NEVER','YEARLY','MONTHLY'), last_reset_at.

**financial_years** — id (PK), name, start_date, end_date, is_current (BOOLEAN), is_closed (BOOLEAN). One `is_current = true`.

**hotel_profile** — id (PK, singleton), legal_name, brand_name, address, tax_registration, base_currency, logo_url, fiscal_settings (JSONB), updated_by (FK), updated_at.

**system_settings** — key/value config. id (PK), setting_key (UNIQUE), setting_value (JSONB), description, category, updated_by (FK), updated_at.

**approval_delegations** — id (PK), delegator_id (FK users), delegate_id (FK users), document_types (approval_document_type[]), start_date, end_date, reason, is_active, created_at. Rule: delegate must hold the same role as delegator.

**audit_logs** (append-only, immutable) — id (PK), actor_id (FK users, nullable for system), action (audit_action), entity_type, entity_id, entity_label, before_json (JSONB, nullable), after_json (JSONB, nullable), ip_address, user_agent, request_id, created_at. Indexes on (entity_type, entity_id) and (actor_id, created_at).

**notifications** — id (PK), user_id (FK), type (notification_type), title, body, link_url, entity_type, entity_id, channel (notification_channel), is_read, read_at, email_sent_at, created_at. Index (user_id, is_read, created_at DESC).

**notification_preferences** — id (PK), user_id (FK), type (notification_type), channel (notification_channel), is_enabled. UNIQUE (user_id, type).

### Schema changes to Part I tables

- **purchase_orders**: add `source_type` ('MANUAL','FROM_CS','FROM_STANDING_ORDER','FROM_CONTRACT'), `rate_contract_id` (FK, nullable), `parent_po_id` (FK self, nullable), `revision_no` (INT default 0), `revision_status` (po_revision_status default 'ORIGINAL'), `landed_cost_total` (DECIMAL).
- **quotation_line_items**: add `freight_per_unit`, `landed_unit_price` (computed: net_unit_price + freight + non-recoverable tax) — CS now compares landed cost.
- **items**: add `track_batches` (BOOLEAN default false), `track_expiry` (BOOLEAN default false), `near_expiry_days` (INT, nullable), `barcode` (VARCHAR, nullable, indexed), `abc_class` (CHAR(1), nullable — A/B/C from analytics).
- **grn_items**: on post, also create/update an **item_batches** row when `items.track_batches = true`.
- **item_stock_ledger**: `movement_type` now also includes `'ISSUANCE'`, `'TRANSFER_OUT'`, `'TRANSFER_IN'`, `'COUNT_ADJUSTMENT'`, `'RETURN_TO_VENDOR'`; `batch_id` (FK item_batches, nullable) added.

---

## 16. Module 7 — Stock Operations

### 16.1 Stock Issuance / Requisition (inventory OUT)

**Context.** The store does not consume stock — outlets do. A kitchen/bar raises an
internal requisition; the store issues against it; stock decrements at weighted-avg
cost and posts to the consuming cost center. This is the primary OUT movement and
the basis of true F&B cost.

**User stories.**
- As a **Kitchen/Outlet user**, I want to raise a stock requisition for items I need so the store can issue them.
- As a **Store Manager**, I want to issue stock against a requisition, with FEFO batch auto-selection, so the oldest/nearest-expiry stock leaves first.
- As an **F&B Manager**, I want issued value posted to the outlet cost center so daily F&B cost is accurate.
- As a **Store Manager**, I want to partially issue when stock is short and keep the balance open.

**Endpoints.** GET/POST/PUT `/api/v1/stock-issuances`; POST `/:id/submit`, `/:id/approve`, `/:id/issue` (posts ledger OUT, decrements batches FEFO), `/:id/cancel`; GET `/:id` (with FEFO batch suggestions).

**Rules.** (1) Cannot issue more than available. (2) FEFO: auto-pick batches ordered by `expiry_date ASC, created_at ASC`. (3) Issue posts `item_stock_ledger` (`ISSUANCE`, qty_out) + decrements `item_batches.available_qty`; recompute `items.current_stock`. (4) Issued cost = current weighted-avg cost snapshot. (5) Transaction-wrapped. (6) Cost center mandatory.

### 16.2 Inter-Store Transfer

**Context.** Central store → bar store, main kitchen → banquet, etc. Two-step
(dispatch / receive) to track in-transit and shrinkage.

**Stories.** Transfer with dispatch then receiving confirmation; record receiving variance with reason; in-transit stock visible.

**Endpoints.** GET/POST/PUT `/api/v1/stock-transfers`; POST `/:id/dispatch` (TRANSFER_OUT ledger at source), `/:id/receive` (TRANSFER_IN at destination, variance handling), `/:id/cancel`.

**Rules.** Dispatch decrements source + creates IN_TRANSIT; receive increments destination; `variance_qty = sent − received` posts as `WASTAGE`/`ADJUSTMENT` with mandatory reason; batch identity carried across stores.

### 16.3 Physical Stock Count / Reconciliation

**Context.** Periodic full/cycle/spot counts; the control that catches theft and
wastage. Blind count hides system qty to prevent bias.

**Stories.**
- As a **Store Manager**, I want to generate a count sheet (full / by location / by category) and enter physical quantities.
- As an **F&B Manager**, I want a blind count so counters can't see expected qty.
- As an **F&B Manager**, I want a variance report (value + %) and to approve adjustments before they post.
- As **Finance**, I want shrinkage value by period for cost control.

**Endpoints.** GET/POST `/api/v1/stock-counts`; POST `/:id/start`, `/:id/enter` (bulk counted qty, supports barcode), `/:id/submit`, `/:id/review`, `/:id/approve`, `/:id/post` (posts `COUNT_ADJUSTMENT` ledger, adjusts batches), `/:id/recount` (flag lines); GET `/:id/variance-report`, `/:id/count-sheet?format=pdf`.

**Rules.** (1) `system_qty` frozen at start. (2) Variance > config threshold → mandatory reason + may force recount. (3) Posting requires approval; adjustments are append-only ledger writes (no silent edits). (4) Counts can be category/location scoped; cycle-count schedule configurable. (5) Locks affected items from issuance while `IN_PROGRESS` (configurable).

### 16.4 Wastage / Spoilage

**Context.** Expired/spoiled/damaged/breakage write-offs with reason, photo
evidence, approval, and cost reporting — major hotel cost-leakage control.

**Stories.** Record wastage with reason + photo; approval before stock write-off; wastage analysis by reason/outlet/period; auto-suggest expired batches from expiry module.

**Endpoints.** GET/POST/PUT `/api/v1/wastage`; POST `/:id/submit`, `/:id/approve`, `/:id/reject`, `/:id/post` (WASTAGE ledger OUT, batch decrement); GET `/:id`, `/reports/summary?groupBy=reason|outlet|period`.

**Rules.** Approval tier by wastage value (reuse approval engine, new `approval_document_type` value `WASTAGE`); posting decrements batch + ledger; photo optional but configurable as mandatory above a value threshold.

**Shared UI.** Stock Ops hub with four sub-apps (Issuance, Transfer, Count, Wastage); all list+form+detail; barcode-enabled qty entry; mobile/tablet-optimized layouts (loading-dock and floor use).

---

## 17. Module 8 — Finance & Payments

### 17.1 Vendor Invoice & 3-Way Match

**Context.** The finance close. Invoice is matched against PO (price) and GRN
(received qty). Mismatches beyond tolerance are held; matched invoices flow to
payment scheduling per payment terms.

**Stories.**
- As **Finance**, I want to register a vendor invoice and link it to its GRN(s)/PO.
- As **Finance**, I want automatic 3-way match (PO price ↔ GRN qty ↔ invoice) flagging variances beyond tolerance.
- As **Finance**, I want to hold/dispute a mismatched invoice and resolve via debit note.
- As a **GM**, I want high-value invoice approval before payment.

**Endpoints.** GET/POST/PUT `/api/v1/invoices`; POST `/:id/link-grn`, `/:id/run-match`, `/:id/verify`, `/:id/approve`, `/:id/dispute`, `/:id/hold`; GET `/:id/match-report`, `/aging`.

**Match logic.** For each invoice line: find matched GRN qty (via po_item/grn links); `qty_variance = invoiced − received`; `price_variance = invoice_price − po_price`; tolerances from `system_settings` (default ±2% price, 0 qty). Set `line_match_status` and roll up to header `match_status`. MATCHED → eligible for payment; variance → `MISMATCH_HOLD`.

### 17.2 Payments & Aging

**Stories.** Schedule payment by due date; batch-pay multiple invoices to one vendor; allocate one payment across invoices/debit notes; payables aging (0–30/31–60/61–90/90+); payment approval tier.

**Endpoints.** GET/POST `/api/v1/payments`; POST `/:id/approve`, `/:id/process`, `/:id/cancel`, `/:id/allocate`; GET `/aging`, `/due-soon`, `/vendor/:vendorId/ledger`.

**Rules.** Total allocations ≤ payment amount; invoice `status` transitions PARTIALLY_PAID/PAID by cumulative allocation; debit notes net against payable; payment approval reuses approval engine (`PAYMENT` doc type); `paymentDueJob` raises PAYMENT_DUE notifications.

### 17.3 Debit Notes / Returns to Vendor

**Context.** Defect found after acceptance, short supply, overcharge → formal
debit against vendor, settled by deduction from next payment or vendor credit.

**Stories.** Raise debit note against GRN/invoice with reason; debit note reduces payable; track settlement; feeds vendor quality score.

**Endpoints.** GET/POST/PUT `/api/v1/debit-notes`; POST `/:id/issue`, `/:id/acknowledge`, `/:id/settle`, `/:id/cancel`.

**Rules.** Post-receipt return decrements stock (`RETURN_TO_VENDOR` ledger + batch); debit note links to payment_allocation for settlement; rejected/returned qty updates `vendor_performance_records` (lowers quality score, feeds Module 6 ranking).

**UI.** Finance hub: Invoice list (match-status badges), Match workbench (PO|GRN|Invoice 3-pane diff), Payment scheduler + aging dashboard, Debit note manager. Finance role finally has a complete workspace.

---

## 18. Module 9 — Contracts & Standing Orders

### 18.1 Rate Contracts

**Context.** Annual/seasonal fixed-price agreements (vegetables, dairy, grocery).
Contract price overrides spot RFQ; CS shows "Contract" vendors with locked price.

**Stories.** Create rate contract with item price list + validity; PO auto-uses contract price when active (skips RFQ); alert before contract expiry; contract vs market price variance report.

**Endpoints.** GET/POST/PUT `/api/v1/rate-contracts`; POST `/:id/activate`, `/:id/terminate`, `/:id/renew`; GET `/active-for-item/:itemId`, `/:id/price-variance`.

**Rules.** Only one ACTIVE contract per vendor-item-period; contract price feeds PO directly; `contractExpiryJob` alerts `renewal_notice_days` before end; expiry auto-sets EXPIRED unless `auto_renew`.

### 18.2 Standing Orders (recurring auto-PO)

**Context.** Daily milk/bread/produce — RFQ per delivery is unusable. Standing
order auto-generates POs on a schedule from a contract or last price.

**Stories.** Define standing order (vendor, items, frequency, qty); system auto-generates PO on schedule; auto-approve below threshold; pause/resume (e.g., low-occupancy periods); skip a run with reason.

**Endpoints.** GET/POST/PUT `/api/v1/standing-orders`; POST `/:id/pause`, `/:id/resume`, `/:id/end`, `/:id/skip-next`, `/:id/generate-now`; GET `/:id/runs`.

**Rules.** `standingOrderJob` (daily cron) generates POs where `next_run_date <= today` per frequency/`custom_days`; price from linked rate contract else last purchase price; `auto_approve=true` skips approval if value < tier-1 threshold; each run logged in `standing_order_runs` (idempotent — no double-generation).

**UI.** Contracts hub: rate-contract list/form with item price grid + expiry badges; standing-order calendar view (upcoming runs), run history, pause/skip controls.

---

## 19. Module 10 — Batch, Expiry & FEFO Management

**Context.** Food safety + cost. Perishable stock tracked per batch with expiry;
issuance/transfer consume FEFO; near-expiry alerts drive action before write-off.

**Stories.**
- As a **Store Manager**, I want stock tracked by batch with expiry so I know exactly what expires when.
- As a **Store Manager**, I want FEFO auto-applied on issuance so nearest-expiry stock goes first.
- As an **F&B Manager**, I want a near-expiry dashboard with value-at-risk so I can act (use-first menus, transfers, returns) before loss.
- As a **Store Manager**, I want batch traceability (which GRN → which issuance) for recalls/food-safety audits.

**Endpoints.** GET `/api/v1/batches?item_id&location&status`; GET `/batches/:id/trace` (GRN→batch→issuances chain); GET `/api/v1/expiry-alerts?level`; PATCH `/expiry-alerts/:id/action`; GET `/reports/near-expiry`, `/reports/expired-value`.

**Rules.** Batches created on GRN post when `items.track_batches`; `available_qty` decremented by issuance/transfer/wastage; `expiryAlertJob` (daily) raises NEAR_EXPIRY (`<= near_expiry_days`), CRITICAL (`<= ceil(near_expiry_days/3)`), EXPIRED (`< today`); expired batches auto-`QUARANTINED` and proposed to Wastage module; FEFO is the mandatory picking order everywhere stock leaves.

**UI.** Expiry dashboard (heatmap by days-to-expiry, value-at-risk KPIs, drill to batch); batch trace timeline; one-click "send to wastage" / "create transfer" from alert.

---

## 20. Module 11 — Recipe / BOM & Costing

**Context.** Bridges inventory to the menu. Recipe = BOM of items (+ nested
sub-recipes) with wastage %. Recipe costing rolls live weighted-avg item cost into
plate cost and food-cost % — core F&B management metric. (Optional POS-driven
depletion is a documented future hook, not in initial build.)

**Stories.**
- As an **F&B Manager**, I want to define recipes with ingredient quantities and wastage % so plate cost is known.
- As an **F&B Manager**, I want recipe cost auto-recomputed when item costs change so menu pricing stays accurate.
- As an **F&B Manager**, I want food-cost % vs selling price per dish to spot margin erosion.
- As a **chef**, I want nested sub-recipes (sauces, stocks) reused across dishes.

**Endpoints.** GET/POST/PUT `/api/v1/recipes`; GET `/:id/costing` (live roll-up), POST `/:id/recost`; GET `/reports/food-cost`, `/reports/margin-alert`.

**Rules.** Cost = Σ(ingredient qty × current weighted-avg cost × (1 + wastage%)) + nested sub-recipe cost (recursive, cycle-protected); `food_cost_percent = total_cost / selling_price × 100`; recompute on demand + nightly; margin-alert when food-cost% exceeds configurable target.

**UI.** Recipe builder (ingredient grid, sub-recipe picker, live cost preview), costing report, margin-alert list.

---

## 21. Modules 12–14 — Reports, Configuration, Audit & Notifications

### 21.1 Module 12 — Reports & Analytics

**Report catalog** (all filterable by date/outlet/category/vendor; export CSV/Excel/PDF):

| Report | Purpose |
|---|---|
| F&B Cost Report | Opening + purchases − closing = consumption; cost % vs revenue |
| Stock Valuation | On-hand value (weighted avg) by location/category, as-of date |
| Consumption / Issuance | Issued qty/value by outlet & cost center |
| Variance Report | Stock-count system vs physical, shrinkage value |
| Wastage Analysis | By reason/outlet/period, % of consumption |
| Slow / Non-Moving Stock | No movement in N days, capital locked |
| ABC Analysis | Items ranked by consumption value (A/B/C), writes `items.abc_class` |
| Reorder Report | At/below reorder point, suggested order qty |
| Near-Expiry / Expired | Value at risk by days bucket |
| Purchase Register | All POs by vendor/period |
| GRN Register | All receipts, accepted vs rejected |
| Vendor Spend Analysis | Spend by vendor/category, vs contract |
| Payables Aging | Outstanding by ageing bucket |
| Price Variance | Actual vs contract / vs market |
| Recipe Food-Cost | Plate cost & margin per dish |

**Endpoints.** `GET /api/v1/reports/:reportKey?...filters&format=`; `GET /api/v1/reports/catalog`; scheduled-report subscription (email) via `system_settings`.

**UI.** Report Center (catalog cards, saved filters, scheduled email subscriptions); each report has table + chart + export.

### 21.2 Module 13 — System Configuration

**Stories.** Admin manages UOM master, tax master, document number series, financial year, hotel profile, tolerances/thresholds (price-alert %, match tolerance, count variance, food-cost target), without code changes.

**Endpoints.** CRUD `/api/v1/settings/uom`, `/settings/tax`, `/settings/number-series`, `/settings/financial-years`, `/settings/hotel-profile`, `/settings/system` (key/value); POST `/settings/financial-years/:id/close` (period close: lock transactions, snapshot closing stock as next period opening).

**Rules.** One current financial year; closed period blocks back-dated postings; number-series changes don't affect issued numbers; UOM/tax changes are effective-dated.

### 21.3 Module 14 — Audit Log & Notifications

**Audit.** Global middleware writes `audit_logs` (before/after JSON) for every
create/update/delete/status/approve/reject/post/login/export on all entities —
immutable, queryable by entity or actor. **Stories:** as Admin/GM, trace any
change for compliance/forensics. **Endpoint:** `GET /api/v1/audit-logs?entity_type&entity_id&actor&action&from&to`. **UI:** filterable audit viewer with before/after diff.

**Notifications.** Unified framework: `notifications` + per-user
`notification_preferences` (per type, channel IN_APP/EMAIL/BOTH). Producers:
approvals, price/expiry/reorder/payment-due/contract-expiry/stock-count-due, GRN
posted. **Endpoints:** `GET /api/v1/notifications`, `PATCH /:id/read`, `POST /read-all`, GET/PUT `/notification-preferences`. **UI:** topbar bell with unread count, dropdown, preferences screen.

---

## 22. Cross-Cutting Enhancements & Consolidated Permission Matrix

**22.1 Approval Delegation.** `approval_delegations` lets an approver delegate to a
same-role user for a date range; the approval engine resolves the active delegate
when routing/notifying so leave never stalls procurement. Endpoints: GET/POST/DELETE
`/api/v1/delegations`. UI: "Delegate my approvals" self-service.

**22.2 Bulk Import/Export.** Excel/CSV import with template download, dry-run
validation (row-level errors), and commit, for: items, vendors, vendor-item map,
rate-contract prices, opening stock. Endpoints: `GET /bulk-io/template/:entity`,
`POST /bulk-io/:entity/validate`, `POST /bulk-io/:entity/commit`. Essential for
go-live onboarding.

**22.3 Role-Specific Dashboards.** Distinct home per role —
*Store Manager:* reorder list, pending issuances, count due, near-expiry.
*F&B Manager:* F&B cost %, wastage trend, approvals, top variances.
*Finance:* payables aging, invoices to match, payments due, debit notes.
*GM:* spend vs budget, high-value approvals, vendor ranking, KPI tiles.
*Admin:* system health, audit highlights, master-data counts.
Endpoint: `GET /api/v1/dashboard` (payload varies by role).

**22.4 PO Amendment / Revision.** Amend a sent PO (qty/price/date) → new revision
(`parent_po_id`, `revision_no++`, prior `SUPERSEDED`); re-triggers approval if value
rises beyond original tier; full revision history on PO detail.

**22.5 Barcode / QR.** `items.barcode` indexed; GRN, stock count, issuance, and
transfer screens accept scanner input (HID keyboard-wedge + camera scan on mobile);
label-print for shelf/bin.

**22.6 Mobile/Tablet Receiving.** Responsive, touch-first GRN, stock-count, and
issuance screens for loading-dock/floor tablet use.

**22.7 Global Search.** Single search bar across items, vendors, PR/RFQ/PO/GRN/
invoice by number or name — first-class, in topbar (not a Phase 7 afterthought).

**22.8 Landed-Cost Comparison.** CS compares `landed_unit_price` (net + freight +
non-recoverable tax), not just unit price, so the cheapest *true* cost wins.

**22.9 Notification-Driven UX.** All time-critical events (reorder, expiry, approval,
payment due, contract expiry, count due) push to the in-app bell + optional email
per user preference.

### Consolidated Permission Matrix — new capabilities

| Permission | ADMIN | STORE_MGR | FB_MGR | FINANCE | GM |
|---|:--:|:--:|:--:|:--:|:--:|
| Stock requisition (create) | Y | Y | Y | N | N |
| Stock issue (post) | Y | Y | N | N | N |
| Inter-store transfer | Y | Y | N | N | N |
| Stock count create/enter | Y | Y | N | N | N |
| Stock count approve/post | Y | N | Y | N | Y |
| Wastage report | Y | Y | Y | N | N |
| Wastage approve | Y | N | Y | N | Y |
| Invoice register/verify/match | Y | N | N | Y | N |
| Invoice approve (high value) | Y | N | N | N | Y |
| Payment schedule/allocate | Y | N | N | Y | N |
| Payment approve | Y | N | N | N | Y |
| Debit note issue | Y | N | N | Y | N |
| Rate contract create | Y | Y | Y | N | N |
| Rate contract approve | Y | N | N | N | Y |
| Standing order manage | Y | Y | Y | N | N |
| Batch/expiry view & action | Y | Y | Y | Y | Y |
| Recipe create/cost | Y | N | Y | N | N |
| Reports view/export | Y | Y | Y | Y | Y |
| System configuration | Y | N | N | N | N |
| Financial period close | Y | N | N | Y | N |
| Audit log view | Y | N | N | N | Y |
| Bulk import/export | Y | Y | N | N | N |
| Delegate own approvals | Y | Y | Y | Y | Y |
| PO amendment | Y | Y | Y | N | N |

---

## 23. Consolidated Development Phase Plan (authoritative — supersedes §13)

Same scale (1–13). Part I phases 1–7 unchanged; Part II adds phases 8–13.

| Phase | Scope | Points | Duration |
|---|---|---|---|
| 1 | Foundation (scaffold, schema, JWT, AppShell) | 38 | 2 wk |
| 2 | Master Data (items, vendors, categories) | 84 | 2 wk |
| 3 | Procurement Core (PR→RFQ→CS→PO→GRN) | 136 | 4 wk |
| 4 | Approval Workflow + **delegation** | 64 | 2 wk |
| 5 | Price History & Alerts | 44 | 2 wk |
| 6 | Vendor Ranking Engine | 57 | 2 wk |
| **7** | **Stock Operations** (issuance, transfer, count, wastage) | **128** | **4 wk** |
| **8** | **Batch/Expiry/FEFO** + integrate into all OUT flows | **52** | **2 wk** |
| **9** | **Finance & Payments** (invoice match, payments, debit notes) | **120** | **3.5 wk** |
| **10** | **Contracts & Standing Orders** + PO source/amendment | **78** | **2.5 wk** |
| **11** | **Recipe / BOM & Costing** | **44** | **1.5 wk** |
| **12** | **System Config, Audit, Notifications, Delegation, Bulk I/O** | **86** | **2.5 wk** |
| **13** | **Reports, Role Dashboards, Barcode, Mobile, Global Search, Polish** | **128** | **4 wk** |
| **Total** | | **1,159** | **~38 wk (~9 months)** |

Build order rationale: **7 → 8** before **9** (issuance/batch must exist before
3-way match and stock-affecting returns); **10** after procurement+finance (contracts
feed PO, standing orders feed payment); **11** after stock ops (recipe cost needs
live weighted-avg); **12–13** harden and make it easy to use. Assumes 1 BE + 1 FE
dev at ~30–35 pts/dev/sprint; a 3–4 dev team compresses this to ~5 months.

### Recommended MVP cut (if time-boxed)
Phases 1–9 (procurement + stock ops + batch/expiry + finance) = a **complete,
auditable inventory system**: ~723 pts (~24 wk). Contracts, recipe, advanced
reports/UX (10–13) follow as fast-follow releases.

### Additional critical implementation files (Part II)
- `/backend/src/modules/stock-issuance/stock-issuance.service.ts` — FEFO picking + OUT ledger transaction.
- `/backend/src/modules/invoices/invoices.service.ts` — 3-way match engine.
- `/backend/src/modules/batch-expiry/fefo.ts` — shared FEFO resolver used by issuance/transfer/wastage.
- `/backend/src/jobs/standingOrderJob.ts` — idempotent recurring-PO generator.
- `/backend/src/middleware/audit.ts` — global before/after audit capture.
- `/backend/src/modules/stock-count/stock-count.service.ts` — variance reconciliation + adjustment posting.
