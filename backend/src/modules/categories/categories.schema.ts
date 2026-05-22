import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).toUpperCase(),
  parentId: z.string().uuid().nullable().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
