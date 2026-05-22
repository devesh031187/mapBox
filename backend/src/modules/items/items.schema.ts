import { z } from "zod";
import { Uom, ItemStatus } from "@prisma/client";

export const createItemSchema = z.object({
  itemCode: z.string().min(1).max(30).toUpperCase(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  categoryId: z.string().uuid(),
  primaryUom: z.nativeEnum(Uom),
  secondaryUom: z.nativeEnum(Uom).nullable().optional(),
  conversionFactor: z.number().positive().nullable().optional(),
  storageLocationId: z.string().uuid(),
  parLevelMin: z.number().min(0).optional(),
  parLevelMax: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  reorderQty: z.number().min(0).optional(),
  isPerishable: z.boolean().optional(),
  shelfLifeDays: z.number().int().positive().nullable().optional(),
  hsnCode: z.string().max(20).optional(),
  taxRatePercent: z.number().min(0).max(100).optional(),
  status: z.nativeEnum(ItemStatus).optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  trackBatches: z.boolean().optional(),
  trackExpiry: z.boolean().optional(),
  nearExpiryDays: z.number().int().positive().nullable().optional(),
  barcode: z.string().max(64).nullable().optional(),
  abcClass: z.enum(["A", "B", "C"]).nullable().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const updateItemStatusSchema = z.object({
  status: z.nativeEnum(ItemStatus),
});

export const listItemsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  storageLocationId: z.string().uuid().optional(),
  status: z.nativeEnum(ItemStatus).optional(),
  belowReorder: z.coerce.boolean().optional(),
  abcClass: z.enum(["A", "B", "C"]).optional(),
});

export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
