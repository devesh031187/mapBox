import { z } from "zod";

export const createVendorCategorySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).toUpperCase(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const updateVendorCategorySchema = createVendorCategorySchema.partial();

export type CreateVendorCategoryDto = z.infer<typeof createVendorCategorySchema>;
export type UpdateVendorCategoryDto = z.infer<typeof updateVendorCategorySchema>;
