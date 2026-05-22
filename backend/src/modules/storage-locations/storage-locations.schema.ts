import { z } from "zod";
import { StorageZone } from "@prisma/client";

export const createStorageLocationSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).toUpperCase(),
  zone: z.nativeEnum(StorageZone),
  outletId: z.string().uuid().nullable().optional(),
  temperatureMinC: z.number().min(-50).max(50).nullable().optional(),
  temperatureMaxC: z.number().min(-50).max(50).nullable().optional(),
  capacityDescription: z.string().max(300).optional(),
  isActive: z.boolean().optional(),
});

export const updateStorageLocationSchema = createStorageLocationSchema.partial();

export type CreateStorageLocationDto = z.infer<typeof createStorageLocationSchema>;
export type UpdateStorageLocationDto = z.infer<typeof updateStorageLocationSchema>;
