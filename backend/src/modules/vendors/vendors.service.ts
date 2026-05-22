import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import { parsePagination, buildPage } from "../../utils/pagination.js";
import type { CreateVendorDto, UpdateVendorDto } from "./vendors.schema.js";

const BANKING_FIELDS = ["bankAccountNo", "bankIfsc", "bankName", "bankBranch"] as const;

function maskBankingFields(vendor: Record<string, unknown>, canViewBanking: boolean) {
  if (canViewBanking) return vendor;
  const masked = { ...vendor };
  BANKING_FIELDS.forEach((f) => {
    if (masked[f] !== null && masked[f] !== undefined) {
      masked[f] = "****";
    }
  });
  return masked;
}

const vendorSelect = {
  id: true,
  vendorCode: true,
  companyName: true,
  tradeName: true,
  vendorCategoryId: true,
  contactPerson: true,
  email: true,
  phone: true,
  alternatePhone: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  pincode: true,
  country: true,
  taxId: true,
  paymentTerms: true,
  creditLimit: true,
  bankName: true,
  bankAccountNo: true,
  bankIfsc: true,
  bankBranch: true,
  status: true,
  blacklistReason: true,
  rating: true,
  onTimeDeliveryRate: true,
  qualityScore: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  vendorCategory: { select: { id: true, name: true, code: true } },
} satisfies Prisma.VendorSelect;

export async function listVendors(
  query: { page?: number; limit?: number; search?: string; status?: string; categoryId?: string },
  canViewBanking: boolean
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.VendorWhereInput = {
    ...(query.status && { status: query.status as never }),
    ...(query.categoryId && { vendorCategoryId: query.categoryId }),
    ...(query.search && {
      OR: [
        { companyName: { contains: query.search, mode: "insensitive" } },
        { vendorCode: { contains: query.search, mode: "insensitive" } },
        { contactPerson: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ],
    }),
  };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({ where, select: vendorSelect, orderBy: { companyName: "asc" }, skip, take: limit }),
    prisma.vendor.count({ where }),
  ]);

  const masked = vendors.map((v) => maskBankingFields(v as Record<string, unknown>, canViewBanking));
  return buildPage(masked, total, page, limit);
}

export async function getVendor(id: string, canViewBanking: boolean) {
  const vendor = await prisma.vendor.findUnique({ where: { id }, select: vendorSelect });
  if (!vendor) throw new AppError(404, "Vendor not found");
  return maskBankingFields(vendor as Record<string, unknown>, canViewBanking);
}

export async function createVendor(dto: CreateVendorDto, userId: string) {
  return prisma.vendor.create({
    data: {
      ...dto,
      country: dto.country ?? "India",
      paymentTerms: dto.paymentTerms ?? "NET_30",
      status: dto.status ?? "ACTIVE",
      createdBy: userId,
    },
    select: vendorSelect,
  });
}

export async function updateVendor(id: string, dto: UpdateVendorDto) {
  const existing = await prisma.vendor.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Vendor not found");
  return prisma.vendor.update({ where: { id }, data: dto as Prisma.VendorUpdateInput, select: vendorSelect });
}

export async function setVendorStatus(id: string, status: string, blacklistReason?: string) {
  const existing = await prisma.vendor.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Vendor not found");
  return prisma.vendor.update({
    where: { id },
    data: {
      status: status as never,
      blacklistReason: status === "BLACKLISTED" ? (blacklistReason ?? null) : null,
    },
    select: vendorSelect,
  });
}

export async function getVendorPerformance(vendorId: string, page: number, limit: number) {
  await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } }).catch(() => {
    throw new AppError(404, "Vendor not found");
  });
  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    prisma.vendorPerformanceRecord.findMany({
      where: { vendorId },
      orderBy: { recordedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.vendorPerformanceRecord.count({ where: { vendorId } }),
  ]);
  return buildPage(records, total, page, limit);
}

export async function getVendorItems(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new AppError(404, "Vendor not found");
  return prisma.vendorItemMapping.findMany({
    where: { vendorId },
    include: {
      item: { select: { id: true, itemCode: true, name: true, primaryUom: true, currentStock: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
