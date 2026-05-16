# Restaurant Inventory Management System — Hotel F&B Operation
## Technical Specification Document v1.0

---

## Table of Contents

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
13. Development Phases with Story Points

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
