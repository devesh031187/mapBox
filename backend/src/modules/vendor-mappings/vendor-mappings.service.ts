import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { CreateMappingDto, UpdateMappingDto } from "./vendor-mappings.schema.js";

export async function list(filters: { vendorId?: string; itemId?: string }) {
  return prisma.vendorItemMapping.findMany({
    where: { vendorId: filters.vendorId, itemId: filters.itemId },
    include: {
      vendor: { select: { id: true, vendorCode: true, companyName: true } },
      item: { select: { id: true, itemCode: true, name: true, primaryUom: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOne(id: string) {
  const m = await prisma.vendorItemMapping.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, vendorCode: true, companyName: true } },
      item: { select: { id: true, itemCode: true, name: true, primaryUom: true } },
    },
  });
  if (!m) throw new AppError(404, "Vendor-item mapping not found");
  return m;
}

export async function create(dto: CreateMappingDto) {
  const existing = await prisma.vendorItemMapping.findFirst({
    where: { vendorId: dto.vendorId, itemId: dto.itemId },
  });
  if (existing) throw new AppError(409, "Mapping already exists for this vendor-item pair");

  if (dto.isPreferred) {
    // Clear preferred flag from other mappings for same item
    await prisma.vendorItemMapping.updateMany({
      where: { itemId: dto.itemId, isPreferred: true },
      data: { isPreferred: false },
    });
  }

  return prisma.vendorItemMapping.create({
    data: {
      vendorId: dto.vendorId,
      itemId: dto.itemId,
      vendorItemCode: dto.vendorItemCode,
      vendorItemDescription: dto.vendorItemDescription,
      leadTimeDays: dto.leadTimeDays ?? 1,
      minimumOrderQty: dto.minimumOrderQty ?? null,
      isPreferred: dto.isPreferred ?? false,
      isActive: dto.isActive ?? true,
    },
    include: {
      vendor: { select: { id: true, vendorCode: true, companyName: true } },
      item: { select: { id: true, itemCode: true, name: true, primaryUom: true } },
    },
  });
}

export async function update(id: string, dto: UpdateMappingDto) {
  const m = await prisma.vendorItemMapping.findUnique({ where: { id } });
  if (!m) throw new AppError(404, "Vendor-item mapping not found");

  if (dto.isPreferred) {
    await prisma.vendorItemMapping.updateMany({
      where: { itemId: m.itemId, isPreferred: true, NOT: { id } },
      data: { isPreferred: false },
    });
  }

  return prisma.vendorItemMapping.update({ where: { id }, data: dto });
}

export async function remove(id: string) {
  const m = await prisma.vendorItemMapping.findUnique({ where: { id } });
  if (!m) throw new AppError(404, "Vendor-item mapping not found");
  await prisma.vendorItemMapping.delete({ where: { id } });
}
