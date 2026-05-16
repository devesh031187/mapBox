-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STORE_MANAGER', 'FB_MANAGER', 'FINANCE', 'GM_DIRECTOR');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "Uom" AS ENUM ('KG', 'G', 'LTR', 'ML', 'PCS', 'DZ', 'BOX', 'CAN', 'BTL', 'PKT', 'BG', 'ROLL');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "PrStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'CONVERTED_TO_RFQ', 'CLOSED');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIAL_RESPONSE', 'FULLY_RESPONDED', 'COMPARATIVE_DONE', 'CLOSED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PoStatus" AS ENUM ('DRAFT', 'APPROVED', 'SENT_TO_VENDOR', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GrnStatus" AS ENUM ('DRAFT', 'POSTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ApprovalDocumentType" AS ENUM ('PURCHASE_REQUISITION', 'PURCHASE_ORDER', 'GRN', 'WASTAGE', 'PAYMENT', 'RATE_CONTRACT');

-- CreateEnum
CREATE TYPE "PriceAlertType" AS ENUM ('SPIKE', 'DROP', 'THRESHOLD_BREACH');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('IMMEDIATE', 'NET_7', 'NET_15', 'NET_30', 'NET_45', 'NET_60', 'COD');

-- CreateEnum
CREATE TYPE "StorageZone" AS ENUM ('DRY_STORE', 'COLD_ROOM', 'FREEZER', 'BAR_STORE', 'KITCHEN', 'HOUSEKEEPING', 'GENERAL');

-- CreateEnum
CREATE TYPE "IssuanceStatus" AS ENUM ('DRAFT', 'REQUESTED', 'APPROVED', 'PARTIALLY_ISSUED', 'ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'IN_TRANSIT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockCountStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COUNTED', 'VARIANCE_REVIEW', 'APPROVED', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockCountType" AS ENUM ('FULL', 'CYCLE', 'SPOT', 'CATEGORY');

-- CreateEnum
CREATE TYPE "WastageStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED');

-- CreateEnum
CREATE TYPE "WastageReason" AS ENUM ('EXPIRED', 'SPOILED', 'DAMAGED', 'BREAKAGE', 'OVER_PRODUCTION', 'CONTAMINATION', 'PEST', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('RECEIVED', 'UNDER_VERIFICATION', 'MATCHED', 'MISMATCH_HOLD', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('NOT_MATCHED', 'MATCHED', 'PRICE_VARIANCE', 'QTY_VARIANCE', 'BOTH_VARIANCE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SCHEDULED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CHEQUE', 'CASH', 'UPI', 'CARD', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "DebitNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DebitNoteReason" AS ENUM ('POST_RECEIPT_DEFECT', 'SHORT_SUPPLY', 'PRICE_OVERCHARGE', 'QUALITY_REJECTION', 'EXPIRY', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED');

-- CreateEnum
CREATE TYPE "StandingOrderFrequency" AS ENUM ('DAILY', 'ALTERNATE_DAYS', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM_DAYS');

-- CreateEnum
CREATE TYPE "StandingOrderStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "ExpiryAlertLevel" AS ENUM ('NEAR_EXPIRY', 'EXPIRED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPROVAL_PENDING', 'APPROVAL_RESULT', 'PRICE_ALERT', 'EXPIRY_ALERT', 'REORDER_ALERT', 'GRN_POSTED', 'PAYMENT_DUE', 'CONTRACT_EXPIRING', 'STOCK_COUNT_DUE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'BOTH');

-- CreateEnum
CREATE TYPE "PoRevisionStatus" AS ENUM ('ORIGINAL', 'AMENDED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'APPROVE', 'REJECT', 'POST', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'EXHAUSTED', 'EXPIRED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "PoSourceType" AS ENUM ('MANUAL', 'FROM_CS', 'FROM_STANDING_ORDER', 'FROM_CONTRACT');

-- CreateTable
CREATE TABLE "outlets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outlets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_code" VARCHAR(20) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "outlet_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revoked_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jti" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "parent_id" UUID,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "item_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "zone" "StorageZone" NOT NULL,
    "outlet_id" UUID,
    "temperature_min_c" DECIMAL(5,2),
    "temperature_max_c" DECIMAL(5,2),
    "capacity_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category_id" UUID NOT NULL,
    "primary_uom" "Uom" NOT NULL,
    "secondary_uom" "Uom",
    "conversion_factor" DECIMAL(10,4),
    "storage_location_id" UUID NOT NULL,
    "par_level_min" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "par_level_max" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "reorder_point" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "reorder_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "current_stock" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "average_cost" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "last_purchase_price" DECIMAL(12,4),
    "is_perishable" BOOLEAN NOT NULL DEFAULT false,
    "shelf_life_days" INTEGER,
    "hsn_code" VARCHAR(20),
    "tax_rate_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "image_url" VARCHAR(500),
    "track_batches" BOOLEAN NOT NULL DEFAULT false,
    "track_expiry" BOOLEAN NOT NULL DEFAULT false,
    "near_expiry_days" INTEGER,
    "barcode" VARCHAR(64),
    "abc_class" CHAR(1),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_stock_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "batch_id" UUID,
    "movement_type" VARCHAR(30) NOT NULL,
    "reference_id" UUID,
    "reference_code" VARCHAR(50),
    "qty_in" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "qty_out" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "balance_qty" DECIMAL(12,3) NOT NULL,
    "balance_value" DECIMAL(14,4) NOT NULL,
    "remarks" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_stock_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_code" VARCHAR(30) NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200),
    "vendor_category_id" UUID NOT NULL,
    "contact_person" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "alternate_phone" VARCHAR(20),
    "address_line1" VARCHAR(200) NOT NULL,
    "address_line2" VARCHAR(200),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pincode" VARCHAR(10) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "tax_id" VARCHAR(50),
    "payment_terms" "PaymentTerms" NOT NULL DEFAULT 'NET_30',
    "credit_limit" DECIMAL(14,2),
    "bank_name" VARCHAR(100),
    "bank_account_no" VARCHAR(50),
    "bank_ifsc" VARCHAR(20),
    "bank_branch" VARCHAR(100),
    "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "blacklist_reason" TEXT,
    "rating" DECIMAL(3,2),
    "on_time_delivery_rate" DECIMAL(5,2),
    "quality_score" DECIMAL(5,2),
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_item_mapping" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "vendor_item_code" VARCHAR(50),
    "vendor_item_description" VARCHAR(200),
    "lead_time_days" INTEGER NOT NULL DEFAULT 1,
    "minimum_order_qty" DECIMAL(12,3),
    "is_preferred" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_item_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_performance_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "po_id" UUID,
    "grn_id" UUID,
    "promised_delivery_date" DATE NOT NULL,
    "actual_delivery_date" DATE,
    "on_time" BOOLEAN,
    "delay_days" INTEGER,
    "ordered_qty" DECIMAL(12,3) NOT NULL,
    "received_qty" DECIMAL(12,3),
    "rejected_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "quality_pass_rate" DECIMAL(5,2),
    "price_variance_percent" DECIMAL(6,3),
    "rfq_response_time_hours" DECIMAL(8,2),
    "notes" TEXT,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_performance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type" "ApprovalDocumentType" NOT NULL,
    "tier_name" VARCHAR(50) NOT NULL,
    "tier_order" INTEGER NOT NULL,
    "min_value" DECIMAL(14,2) NOT NULL,
    "max_value" DECIMAL(14,2),
    "required_role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "approval_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type" "ApprovalDocumentType" NOT NULL,
    "document_id" UUID NOT NULL,
    "document_number" VARCHAR(30) NOT NULL,
    "tier_id" UUID NOT NULL,
    "tier_order" INTEGER NOT NULL,
    "approver_id" UUID NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "action_at" TIMESTAMPTZ,
    "comments" TEXT,
    "escalated_to" UUID,
    "escalated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_delegations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "delegator_id" UUID NOT NULL,
    "delegate_id" UUID NOT NULL,
    "document_types" "ApprovalDocumentType"[],
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pr_number" VARCHAR(30) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "requested_by" UUID NOT NULL,
    "outlet_id" UUID,
    "required_date" DATE NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    "total_estimated_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "PrStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "current_approval_tier" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchase_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisition_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pr_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "required_qty" DECIMAL(12,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "estimated_unit_price" DECIMAL(12,4),
    "estimated_total" DECIMAL(14,2),
    "current_stock" DECIMAL(12,3),
    "justification" TEXT,
    "line_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "purchase_requisition_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_for_quotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rfq_number" VARCHAR(30) NOT NULL,
    "pr_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "issued_by" UUID NOT NULL,
    "issue_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response_deadline" DATE NOT NULL,
    "delivery_required_by" DATE NOT NULL,
    "status" "RfqStatus" NOT NULL DEFAULT 'DRAFT',
    "terms_and_conditions" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "request_for_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rfq_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "required_qty" DECIMAL(12,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "pr_item_id" UUID,
    "specifications" TEXT,

    CONSTRAINT "rfq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_vendors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rfq_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "invited_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_sent_at" TIMESTAMPTZ,
    "responded_at" TIMESTAMPTZ,
    "response_status" VARCHAR(20) NOT NULL DEFAULT 'INVITED',

    CONSTRAINT "rfq_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotation_number" VARCHAR(30) NOT NULL,
    "rfq_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" DATE NOT NULL,
    "payment_terms" "PaymentTerms" NOT NULL,
    "delivery_lead_time_days" INTEGER NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'RECEIVED',
    "total_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "document_url" VARCHAR(500),
    "notes" TEXT,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotation_id" UUID NOT NULL,
    "rfq_item_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quoted_qty" DECIMAL(12,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "net_unit_price" DECIMAL(12,4) NOT NULL,
    "freight_per_unit" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "landed_unit_price" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(14,2) NOT NULL,
    "brand" VARCHAR(100),
    "country_of_origin" VARCHAR(100),
    "notes" TEXT,

    CONSTRAINT "quotation_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparative_statements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cs_number" VARCHAR(30) NOT NULL,
    "rfq_id" UUID NOT NULL,
    "prepared_by" UUID NOT NULL,
    "prepared_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommendation_notes" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,

    CONSTRAINT "comparative_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cs_line_selections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cs_id" UUID NOT NULL,
    "rfq_item_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "selected_vendor_id" UUID NOT NULL,
    "selected_quotation_line_id" UUID NOT NULL,
    "selected_unit_price" DECIMAL(12,4) NOT NULL,
    "selected_qty" DECIMAL(12,3) NOT NULL,
    "selection_reason" TEXT,
    "lowest_price_vendor_id" UUID,
    "lowest_price" DECIMAL(12,4),
    "price_variance_from_lowest" DECIMAL(6,3),

    CONSTRAINT "cs_line_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "po_number" VARCHAR(30) NOT NULL,
    "vendor_id" UUID NOT NULL,
    "cs_id" UUID,
    "rfq_id" UUID,
    "pr_id" UUID,
    "rate_contract_id" UUID,
    "parent_po_id" UUID,
    "source_type" "PoSourceType" NOT NULL DEFAULT 'MANUAL',
    "revision_no" INTEGER NOT NULL DEFAULT 0,
    "revision_status" "PoRevisionStatus" NOT NULL DEFAULT 'ORIGINAL',
    "created_by" UUID NOT NULL,
    "outlet_id" UUID,
    "po_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_date" DATE NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "payment_terms" "PaymentTerms" NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "landed_cost_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "PoStatus" NOT NULL DEFAULT 'DRAFT',
    "terms_and_conditions" TEXT,
    "internal_notes" TEXT,
    "current_approval_tier" INTEGER,
    "sent_to_vendor_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "po_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "cs_line_id" UUID,
    "ordered_qty" DECIMAL(12,3) NOT NULL,
    "received_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "uom" "Uom" NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(14,2) NOT NULL,
    "line_status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "grn_number" VARCHAR(30) NOT NULL,
    "po_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "received_by" UUID NOT NULL,
    "storage_location_id" UUID NOT NULL,
    "grn_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendor_invoice_number" VARCHAR(100),
    "vendor_invoice_date" DATE,
    "vendor_invoice_amount" DECIMAL(14,2),
    "vehicle_number" VARCHAR(30),
    "status" "GrnStatus" NOT NULL DEFAULT 'DRAFT',
    "total_received_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_rejected_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "temperature_at_receipt" DECIMAL(5,2),
    "document_url" VARCHAR(500),
    "remarks" TEXT,
    "posted_at" TIMESTAMPTZ,
    "posted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "grns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "grn_id" UUID NOT NULL,
    "po_item_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "ordered_qty" DECIMAL(12,3) NOT NULL,
    "received_qty" DECIMAL(12,3) NOT NULL,
    "accepted_qty" DECIMAL(12,3) NOT NULL,
    "rejected_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "rejection_reason" TEXT,
    "uom" "Uom" NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "total_accepted_value" DECIMAL(14,2) NOT NULL,
    "batch_number" VARCHAR(100),
    "expiry_date" DATE,
    "temperature_at_receipt" DECIMAL(5,2),

    CONSTRAINT "grn_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "grn_id" UUID,
    "po_id" UUID,
    "quotation_line_id" UUID,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "uom" "Uom" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "effective_date" DATE NOT NULL,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "vendor_id" UUID,
    "alert_type" "PriceAlertType" NOT NULL,
    "previous_price" DECIMAL(12,4) NOT NULL,
    "current_price" DECIMAL(12,4) NOT NULL,
    "change_percent" DECIMAL(6,3) NOT NULL,
    "threshold_percent" DECIMAL(5,2) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "triggered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_alert_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID,
    "spike_threshold_percent" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "drop_threshold_percent" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "lookback_days" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "price_alert_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_ranking_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "config_name" VARCHAR(100) NOT NULL,
    "price_weight" DECIMAL(5,2) NOT NULL DEFAULT 30.00,
    "delivery_weight" DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    "quality_weight" DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    "response_time_weight" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "payment_terms_weight" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "evaluation_period_months" INTEGER NOT NULL DEFAULT 6,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vendor_ranking_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_ranking_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "config_id" UUID NOT NULL,
    "period_from" DATE NOT NULL,
    "period_to" DATE NOT NULL,
    "price_score" DECIMAL(5,2) NOT NULL,
    "delivery_score" DECIMAL(5,2) NOT NULL,
    "quality_score" DECIMAL(5,2) NOT NULL,
    "response_time_score" DECIMAL(5,2) NOT NULL,
    "payment_terms_score" DECIMAL(5,2) NOT NULL,
    "weighted_total_score" DECIMAL(5,2) NOT NULL,
    "rank_in_category" INTEGER,
    "vendor_category_id" UUID,
    "po_count" INTEGER NOT NULL DEFAULT 0,
    "grn_count" INTEGER NOT NULL DEFAULT 0,
    "computed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_ranking_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_issuances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "issuance_number" VARCHAR(30) NOT NULL,
    "from_storage_location_id" UUID NOT NULL,
    "to_outlet_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "issuance_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purpose" TEXT,
    "cost_center" VARCHAR(50) NOT NULL,
    "status" "IssuanceStatus" NOT NULL DEFAULT 'DRAFT',
    "total_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "posted_at" TIMESTAMPTZ,
    "posted_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_issuances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_issuance_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "issuance_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "batch_id" UUID,
    "requested_qty" DECIMAL(12,3) NOT NULL,
    "issued_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "uom" "Uom" NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "total_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "line_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "stock_issuance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transfer_number" VARCHAR(30) NOT NULL,
    "from_storage_location_id" UUID NOT NULL,
    "to_storage_location_id" UUID NOT NULL,
    "initiated_by" UUID NOT NULL,
    "received_by" UUID,
    "dispatch_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt_date" DATE,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "total_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transfer_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "batch_id" UUID,
    "sent_qty" DECIMAL(12,3) NOT NULL,
    "received_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "uom" "Uom" NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "variance_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "variance_reason" TEXT,
    "line_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "stock_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_counts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "count_number" VARCHAR(30) NOT NULL,
    "count_type" "StockCountType" NOT NULL,
    "storage_location_id" UUID,
    "category_id" UUID,
    "scheduled_date" DATE NOT NULL,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "counted_by" UUID NOT NULL,
    "reviewed_by" UUID,
    "approved_by" UUID,
    "is_blind" BOOLEAN NOT NULL DEFAULT false,
    "status" "StockCountStatus" NOT NULL DEFAULT 'DRAFT',
    "total_variance_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stock_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_count_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "count_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "batch_id" UUID,
    "system_qty" DECIMAL(12,3) NOT NULL,
    "counted_qty" DECIMAL(12,3),
    "variance_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "uom" "Uom" NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "variance_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variance_percent" DECIMAL(6,3) NOT NULL DEFAULT 0,
    "variance_reason" TEXT,
    "recount_flag" BOOLEAN NOT NULL DEFAULT false,
    "counted_at" TIMESTAMPTZ,

    CONSTRAINT "stock_count_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wastage_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wastage_number" VARCHAR(30) NOT NULL,
    "storage_location_id" UUID NOT NULL,
    "outlet_id" UUID,
    "reported_by" UUID NOT NULL,
    "approved_by" UUID,
    "wastage_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" "WastageReason" NOT NULL,
    "status" "WastageStatus" NOT NULL DEFAULT 'DRAFT',
    "total_wastage_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "attachment_url" VARCHAR(500),
    "remarks" TEXT,
    "posted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wastage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wastage_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wastage_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "batch_id" UUID,
    "qty" DECIMAL(12,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "total_value" DECIMAL(14,2) NOT NULL,
    "item_reason" TEXT,
    "photo_url" VARCHAR(500),

    CONSTRAINT "wastage_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_batches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "grn_item_id" UUID,
    "batch_number" VARCHAR(100) NOT NULL,
    "storage_location_id" UUID NOT NULL,
    "received_qty" DECIMAL(12,3) NOT NULL,
    "available_qty" DECIMAL(12,3) NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "manufacture_date" DATE,
    "expiry_date" DATE,
    "supplier_lot" VARCHAR(100),
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "item_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expiry_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "storage_location_id" UUID NOT NULL,
    "expiry_date" DATE NOT NULL,
    "days_to_expiry" INTEGER NOT NULL,
    "alert_level" "ExpiryAlertLevel" NOT NULL,
    "available_qty" DECIMAL(12,3) NOT NULL,
    "value_at_risk" DECIMAL(14,2) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_actioned" BOOLEAN NOT NULL DEFAULT false,
    "action_taken" TEXT,
    "triggered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actioned_by" UUID,

    CONSTRAINT "expiry_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_number" VARCHAR(100) NOT NULL,
    "internal_ref" VARCHAR(30) NOT NULL,
    "vendor_id" UUID NOT NULL,
    "po_id" UUID,
    "invoice_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "received_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "freight_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "other_charges" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'RECEIVED',
    "match_status" "MatchStatus" NOT NULL DEFAULT 'NOT_MATCHED',
    "document_url" VARCHAR(500),
    "verified_by" UUID,
    "approved_by" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vendor_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_invoice_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "po_item_id" UUID,
    "grn_item_id" UUID,
    "item_id" UUID NOT NULL,
    "invoiced_qty" DECIMAL(12,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "tax_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(14,2) NOT NULL,
    "matched_grn_qty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "qty_variance" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "price_variance" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "line_match_status" "MatchStatus" NOT NULL DEFAULT 'NOT_MATCHED',

    CONSTRAINT "vendor_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_grn_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "linked_value" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "invoice_grn_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_number" VARCHAR(30) NOT NULL,
    "vendor_id" UUID NOT NULL,
    "payment_date" DATE,
    "scheduled_date" DATE NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "bank_reference" VARCHAR(100),
    "status" "PaymentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "approved_by" UUID,
    "processed_by" UUID,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "allocated_amount" DECIMAL(14,2) NOT NULL,
    "debit_note_id" UUID,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debit_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "debit_note_number" VARCHAR(30) NOT NULL,
    "vendor_id" UUID NOT NULL,
    "grn_id" UUID,
    "invoice_id" UUID,
    "reason" "DebitNoteReason" NOT NULL,
    "debit_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DebitNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "reason_detail" TEXT,
    "document_url" VARCHAR(500),
    "issued_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "debit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debit_note_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "debit_note_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "batch_id" UUID,
    "qty" DECIMAL(12,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "total_value" DECIMAL(14,2) NOT NULL,
    "reason_detail" TEXT,

    CONSTRAINT "debit_note_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contract_number" VARCHAR(30) NOT NULL,
    "vendor_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "payment_terms" "PaymentTerms" NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "renewal_notice_days" INTEGER NOT NULL DEFAULT 30,
    "terms_url" VARCHAR(500),
    "created_by" UUID NOT NULL,
    "approved_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rate_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_contract_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contract_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "contracted_unit_price" DECIMAL(12,4) NOT NULL,
    "uom" "Uom" NOT NULL,
    "min_order_qty" DECIMAL(12,3),
    "max_period_qty" DECIMAL(12,3),
    "price_revision_clause" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rate_contract_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standing_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "so_number" VARCHAR(30) NOT NULL,
    "vendor_id" UUID NOT NULL,
    "contract_id" UUID,
    "outlet_id" UUID NOT NULL,
    "frequency" "StandingOrderFrequency" NOT NULL,
    "custom_days" INTEGER[],
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "next_run_date" DATE NOT NULL,
    "delivery_lead_days" INTEGER NOT NULL DEFAULT 1,
    "status" "StandingOrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "auto_approve" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "standing_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standing_order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "standing_order_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "default_qty" DECIMAL(12,3) NOT NULL,
    "uom" "Uom" NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "standing_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standing_order_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "standing_order_id" UUID NOT NULL,
    "run_date" DATE NOT NULL,
    "generated_po_id" UUID,
    "status" VARCHAR(20) NOT NULL,
    "skip_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "standing_order_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "outlet_id" UUID,
    "category" VARCHAR(100),
    "yield_qty" DECIMAL(12,3) NOT NULL,
    "yield_uom" "Uom" NOT NULL,
    "prep_notes" TEXT,
    "selling_price" DECIMAL(12,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "item_id" UUID,
    "sub_recipe_id" UUID,
    "qty" DECIMAL(12,4) NOT NULL,
    "uom" "Uom" NOT NULL,
    "wastage_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_costings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "computed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_cost" DECIMAL(14,4) NOT NULL,
    "cost_per_yield_unit" DECIMAL(14,4) NOT NULL,
    "food_cost_percent" DECIMAL(6,3),
    "computed_by" UUID NOT NULL,

    CONSTRAINT "recipe_costings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uom_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "dimension" VARCHAR(20) NOT NULL,
    "base_uom_code" VARCHAR(20),
    "conversion_to_base" DECIMAL(14,6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "uom_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_master" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rate_percent" DECIMAL(5,2) NOT NULL,
    "is_compound" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,

    CONSTRAINT "tax_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "number_series" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type" VARCHAR(50) NOT NULL,
    "prefix" VARCHAR(20) NOT NULL,
    "padding" INTEGER NOT NULL DEFAULT 4,
    "current_value" INTEGER NOT NULL DEFAULT 0,
    "reset_frequency" VARCHAR(20) NOT NULL DEFAULT 'YEARLY',
    "last_reset_at" TIMESTAMPTZ,

    CONSTRAINT "number_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_years" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(20) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "financial_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_profile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "legal_name" VARCHAR(200) NOT NULL,
    "brand_name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "tax_registration" VARCHAR(50),
    "base_currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "logo_url" VARCHAR(500),
    "fiscal_settings" JSONB,
    "updated_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "hotel_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" JSONB NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50),
    "updated_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" VARCHAR(60) NOT NULL,
    "entity_id" UUID,
    "entity_label" VARCHAR(200),
    "before_json" JSONB,
    "after_json" JSONB,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "request_id" VARCHAR(64),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT,
    "link_url" VARCHAR(500),
    "entity_type" VARCHAR(60),
    "entity_id" UUID,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "email_sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'BOTH',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outlets_code_key" ON "outlets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "revoked_tokens_jti_key" ON "revoked_tokens"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "item_categories_code_key" ON "item_categories"("code");

-- CreateIndex
CREATE INDEX "item_categories_parent_id_idx" ON "item_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "storage_locations_code_key" ON "storage_locations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_code_key" ON "items"("item_code");

-- CreateIndex
CREATE INDEX "items_category_id_idx" ON "items"("category_id");

-- CreateIndex
CREATE INDEX "items_status_idx" ON "items"("status");

-- CreateIndex
CREATE INDEX "items_storage_location_id_idx" ON "items"("storage_location_id");

-- CreateIndex
CREATE INDEX "items_barcode_idx" ON "items"("barcode");

-- CreateIndex
CREATE INDEX "item_stock_ledger_item_id_created_at_idx" ON "item_stock_ledger"("item_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_categories_code_key" ON "vendor_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_vendor_code_key" ON "vendors"("vendor_code");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_item_mapping_vendor_id_item_id_key" ON "vendor_item_mapping"("vendor_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_tiers_document_type_tier_order_key" ON "approval_tiers"("document_type", "tier_order");

-- CreateIndex
CREATE INDEX "approval_records_document_type_document_id_idx" ON "approval_records"("document_type", "document_id");

-- CreateIndex
CREATE INDEX "approval_records_approver_id_status_idx" ON "approval_records"("approver_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requisitions_pr_number_key" ON "purchase_requisitions"("pr_number");

-- CreateIndex
CREATE UNIQUE INDEX "request_for_quotations_rfq_number_key" ON "request_for_quotations"("rfq_number");

-- CreateIndex
CREATE UNIQUE INDEX "rfq_vendors_rfq_id_vendor_id_key" ON "rfq_vendors"("rfq_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_number_key" ON "quotations"("quotation_number");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_rfq_id_vendor_id_key" ON "quotations"("rfq_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "comparative_statements_cs_number_key" ON "comparative_statements"("cs_number");

-- CreateIndex
CREATE UNIQUE INDEX "comparative_statements_rfq_id_key" ON "comparative_statements"("rfq_id");

-- CreateIndex
CREATE UNIQUE INDEX "cs_line_selections_cs_id_rfq_item_id_key" ON "cs_line_selections"("cs_id", "rfq_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "grns_grn_number_key" ON "grns"("grn_number");

-- CreateIndex
CREATE INDEX "price_history_item_id_vendor_id_effective_date_idx" ON "price_history"("item_id", "vendor_id", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "price_alert_config_item_id_key" ON "price_alert_config"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_issuances_issuance_number_key" ON "stock_issuances"("issuance_number");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_transfer_number_key" ON "stock_transfers"("transfer_number");

-- CreateIndex
CREATE UNIQUE INDEX "stock_counts_count_number_key" ON "stock_counts"("count_number");

-- CreateIndex
CREATE UNIQUE INDEX "wastage_records_wastage_number_key" ON "wastage_records"("wastage_number");

-- CreateIndex
CREATE INDEX "item_batches_item_id_expiry_date_idx" ON "item_batches"("item_id", "expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_invoices_internal_ref_key" ON "vendor_invoices"("internal_ref");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_grn_links_invoice_id_grn_id_key" ON "invoice_grn_links"("invoice_id", "grn_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "payments"("payment_number");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_payment_id_invoice_id_key" ON "payment_allocations"("payment_id", "invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "debit_notes_debit_note_number_key" ON "debit_notes"("debit_note_number");

-- CreateIndex
CREATE UNIQUE INDEX "rate_contracts_contract_number_key" ON "rate_contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "rate_contract_items_contract_id_item_id_key" ON "rate_contract_items"("contract_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "standing_orders_so_number_key" ON "standing_orders"("so_number");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_recipe_code_key" ON "recipes"("recipe_code");

-- CreateIndex
CREATE UNIQUE INDEX "uom_master_code_key" ON "uom_master"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tax_master_code_key" ON "tax_master"("code");

-- CreateIndex
CREATE UNIQUE INDEX "number_series_document_type_key" ON "number_series"("document_type");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_type_key" ON "notification_preferences"("user_id", "type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_categories" ADD CONSTRAINT "item_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "item_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_storage_location_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_stock_ledger" ADD CONSTRAINT "item_stock_ledger_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_stock_ledger" ADD CONSTRAINT "item_stock_ledger_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "item_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_vendor_category_id_fkey" FOREIGN KEY ("vendor_category_id") REFERENCES "vendor_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_item_mapping" ADD CONSTRAINT "vendor_item_mapping_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_item_mapping" ADD CONSTRAINT "vendor_item_mapping_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_performance_records" ADD CONSTRAINT "vendor_performance_records_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_records" ADD CONSTRAINT "approval_records_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "approval_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "purchase_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_for_quotations" ADD CONSTRAINT "request_for_quotations_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "purchase_requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "request_for_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_pr_item_id_fkey" FOREIGN KEY ("pr_item_id") REFERENCES "purchase_requisition_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_vendors" ADD CONSTRAINT "rfq_vendors_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "request_for_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_vendors" ADD CONSTRAINT "rfq_vendors_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "request_for_quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_rfq_item_id_fkey" FOREIGN KEY ("rfq_item_id") REFERENCES "rfq_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line_items" ADD CONSTRAINT "quotation_line_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparative_statements" ADD CONSTRAINT "comparative_statements_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "request_for_quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs_line_selections" ADD CONSTRAINT "cs_line_selections_cs_id_fkey" FOREIGN KEY ("cs_id") REFERENCES "comparative_statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs_line_selections" ADD CONSTRAINT "cs_line_selections_rfq_item_id_fkey" FOREIGN KEY ("rfq_item_id") REFERENCES "rfq_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs_line_selections" ADD CONSTRAINT "cs_line_selections_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs_line_selections" ADD CONSTRAINT "cs_line_selections_selected_quotation_line_id_fkey" FOREIGN KEY ("selected_quotation_line_id") REFERENCES "quotation_line_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "request_for_quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "purchase_requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_rate_contract_id_fkey" FOREIGN KEY ("rate_contract_id") REFERENCES "rate_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_parent_po_id_fkey" FOREIGN KEY ("parent_po_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_cs_line_id_fkey" FOREIGN KEY ("cs_line_id") REFERENCES "cs_line_selections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grns" ADD CONSTRAINT "grns_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grns" ADD CONSTRAINT "grns_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "grns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_po_item_id_fkey" FOREIGN KEY ("po_item_id") REFERENCES "purchase_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "grns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_ranking_scores" ADD CONSTRAINT "vendor_ranking_scores_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_ranking_scores" ADD CONSTRAINT "vendor_ranking_scores_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "vendor_ranking_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_issuance_items" ADD CONSTRAINT "stock_issuance_items_issuance_id_fkey" FOREIGN KEY ("issuance_id") REFERENCES "stock_issuances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_issuance_items" ADD CONSTRAINT "stock_issuance_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_issuance_items" ADD CONSTRAINT "stock_issuance_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "item_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "item_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_count_id_fkey" FOREIGN KEY ("count_id") REFERENCES "stock_counts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_count_items" ADD CONSTRAINT "stock_count_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "item_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wastage_items" ADD CONSTRAINT "wastage_items_wastage_id_fkey" FOREIGN KEY ("wastage_id") REFERENCES "wastage_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wastage_items" ADD CONSTRAINT "wastage_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wastage_items" ADD CONSTRAINT "wastage_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "item_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_batches" ADD CONSTRAINT "item_batches_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_batches" ADD CONSTRAINT "item_batches_grn_item_id_fkey" FOREIGN KEY ("grn_item_id") REFERENCES "grn_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expiry_alerts" ADD CONSTRAINT "expiry_alerts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "item_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoices" ADD CONSTRAINT "vendor_invoices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoices" ADD CONSTRAINT "vendor_invoices_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoice_items" ADD CONSTRAINT "vendor_invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "vendor_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoice_items" ADD CONSTRAINT "vendor_invoice_items_po_item_id_fkey" FOREIGN KEY ("po_item_id") REFERENCES "purchase_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invoice_items" ADD CONSTRAINT "vendor_invoice_items_grn_item_id_fkey" FOREIGN KEY ("grn_item_id") REFERENCES "grn_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_grn_links" ADD CONSTRAINT "invoice_grn_links_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "vendor_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_grn_links" ADD CONSTRAINT "invoice_grn_links_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "grns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "vendor_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_debit_note_id_fkey" FOREIGN KEY ("debit_note_id") REFERENCES "debit_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debit_notes" ADD CONSTRAINT "debit_notes_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debit_notes" ADD CONSTRAINT "debit_notes_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "grns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debit_notes" ADD CONSTRAINT "debit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "vendor_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debit_note_items" ADD CONSTRAINT "debit_note_items_debit_note_id_fkey" FOREIGN KEY ("debit_note_id") REFERENCES "debit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_contracts" ADD CONSTRAINT "rate_contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_contract_items" ADD CONSTRAINT "rate_contract_items_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "rate_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_contract_items" ADD CONSTRAINT "rate_contract_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standing_orders" ADD CONSTRAINT "standing_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standing_orders" ADD CONSTRAINT "standing_orders_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "rate_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standing_order_items" ADD CONSTRAINT "standing_order_items_standing_order_id_fkey" FOREIGN KEY ("standing_order_id") REFERENCES "standing_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standing_order_items" ADD CONSTRAINT "standing_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standing_order_runs" ADD CONSTRAINT "standing_order_runs_standing_order_id_fkey" FOREIGN KEY ("standing_order_id") REFERENCES "standing_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_sub_recipe_id_fkey" FOREIGN KEY ("sub_recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_costings" ADD CONSTRAINT "recipe_costings_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
