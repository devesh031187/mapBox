import { z } from "zod";

export const createMappingSchema = z.object({
  vendorId: z.string().uuid(),
  itemId: z.string().uuid(),
  vendorItemCode: z.string().max(50).optional(),
  vendorItemDescription: z.string().max(200).optional(),
  leadTimeDays: z.number().int().min(0).optional(),
  minimumOrderQty: z.number().positive().nullable().optional(),
  isPreferred: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateMappingSchema = createMappingSchema.omit({ vendorId: true, itemId: true }).partial();

export type CreateMappingDto = z.infer<typeof createMappingSchema>;
export type UpdateMappingDto = z.infer<typeof updateMappingSchema>;
