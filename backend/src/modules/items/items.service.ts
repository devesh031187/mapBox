import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import { parsePagination, buildPage } from "../../utils/pagination.js";
import type { CreateItemDto, UpdateItemDto, ListItemsQuery } from "./items.schema.js";

const itemSelect = {
  id: true,
  itemCode: true,
  name: true,
  description: true,
  categoryId: true,
  primaryUom: true,
  secondaryUom: true,
  conversionFactor: true,
  storageLocationId: true,
  parLevelMin: true,
  parLevelMax: true,
  reorderPoint: true,
  reorderQty: true,
  currentStock: true,
  averageCost: true,
  lastPurchasePrice: true,
  isPerishable: true,
  shelfLifeDays: true,
  hsnCode: true,
  taxRatePercent: true,
  status: true,
  imageUrl: true,
  trackBatches: true,
  trackExpiry: true,
  nearExpiryDays: true,
  barcode: true,
  abcClass: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, code: true } },
  storageLocation: { select: { id: true, name: true, code: true, zone: true } },
} satisfies Prisma.ItemSelect;

export async function listItems(query: ListItemsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ItemWhereInput = {
    ...(query.status && { status: query.status }),
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.storageLocationId && { storageLocationId: query.storageLocationId }),
    ...(query.abcClass && { abcClass: query.abcClass }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { itemCode: { contains: query.search, mode: "insensitive" } },
        { barcode: { contains: query.search, mode: "insensitive" } },
      ],
    }),
    ...(query.belowReorder && {
      currentStock: { lt: prisma.item.fields.reorderPoint },
    }),
  };

  // belowReorder needs raw comparison; handle separately
  if (query.belowReorder) {
    const [items, total] = await Promise.all([
      prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM items
        WHERE current_stock < reorder_point
        ${query.categoryId ? Prisma.sql`AND category_id = ${query.categoryId}::uuid` : Prisma.empty}
        ${query.status ? Prisma.sql`AND status = ${query.status}::"ItemStatus"` : Prisma.sql`AND status = 'ACTIVE'::"ItemStatus"`}
        LIMIT ${limit} OFFSET ${skip}
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM items
        WHERE current_stock < reorder_point
        ${query.categoryId ? Prisma.sql`AND category_id = ${query.categoryId}::uuid` : Prisma.empty}
        ${query.status ? Prisma.sql`AND status = ${query.status}::"ItemStatus"` : Prisma.sql`AND status = 'ACTIVE'::"ItemStatus"`}
      `,
    ]);
    const ids = items.map((r) => r.id);
    const fullItems = await prisma.item.findMany({
      where: { id: { in: ids } },
      select: itemSelect,
      orderBy: { name: "asc" },
    });
    return buildPage(fullItems, Number(total[0].count), page, limit);
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({ where, select: itemSelect, orderBy: { name: "asc" }, skip, take: limit }),
    prisma.item.count({ where }),
  ]);

  return buildPage(items, total, page, limit);
}

export async function getItem(id: string) {
  const item = await prisma.item.findUnique({ where: { id }, select: itemSelect });
  if (!item) throw new AppError(404, "Item not found");
  return item;
}

export async function createItem(dto: CreateItemDto, userId: string) {
  if (dto.parLevelMax !== undefined && dto.parLevelMin !== undefined && dto.parLevelMax < dto.parLevelMin) {
    throw new AppError(400, "parLevelMax must be >= parLevelMin");
  }

  return prisma.item.create({
    data: {
      itemCode: dto.itemCode,
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      primaryUom: dto.primaryUom,
      secondaryUom: dto.secondaryUom ?? null,
      conversionFactor: dto.conversionFactor ?? null,
      storageLocationId: dto.storageLocationId,
      parLevelMin: dto.parLevelMin ?? 0,
      parLevelMax: dto.parLevelMax ?? 0,
      reorderPoint: dto.reorderPoint ?? 0,
      reorderQty: dto.reorderQty ?? 0,
      isPerishable: dto.isPerishable ?? false,
      shelfLifeDays: dto.shelfLifeDays ?? null,
      hsnCode: dto.hsnCode,
      taxRatePercent: dto.taxRatePercent ?? 0,
      status: dto.status ?? "ACTIVE",
      imageUrl: dto.imageUrl ?? null,
      trackBatches: dto.trackBatches ?? false,
      trackExpiry: dto.trackExpiry ?? false,
      nearExpiryDays: dto.nearExpiryDays ?? null,
      barcode: dto.barcode ?? null,
      abcClass: dto.abcClass ?? null,
      createdBy: userId,
    },
    select: itemSelect,
  });
}

export async function updateItem(id: string, dto: UpdateItemDto) {
  await getItem(id);
  if (dto.parLevelMax !== undefined && dto.parLevelMin !== undefined && dto.parLevelMax < dto.parLevelMin) {
    throw new AppError(400, "parLevelMax must be >= parLevelMin");
  }
  return prisma.item.update({ where: { id }, data: dto as Prisma.ItemUpdateInput, select: itemSelect });
}

export async function getStockLedger(itemId: string, page: number, limit: number) {
  await getItem(itemId);
  const skip = (page - 1) * limit;
  const [entries, total] = await Promise.all([
    prisma.itemStockLedger.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.itemStockLedger.count({ where: { itemId } }),
  ]);
  return buildPage(entries, total, page, limit);
}

export async function getBelowReorderItems() {
  return prisma.$queryRaw<
    Array<{
      id: string;
      item_code: string;
      name: string;
      current_stock: number;
      reorder_point: number;
      par_level_min: number;
      uom: string;
    }>
  >`
    SELECT i.id, i.item_code, i.name, i.current_stock, i.reorder_point, i.par_level_min, i.primary_uom as uom
    FROM items i
    WHERE i.current_stock < i.reorder_point
      AND i.status = 'ACTIVE'::"ItemStatus"
    ORDER BY (i.reorder_point - i.current_stock) DESC
  `;
}
