import { z } from "zod";

const roleEnum = z.enum([
  "ADMIN",
  "STORE_MANAGER",
  "FB_MANAGER",
  "FINANCE",
  "GM_DIRECTOR",
]);

export const createUserSchema = z.object({
  employeeCode: z.string().min(1).max(20),
  fullName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: roleEnum,
  outletId: z.string().uuid().optional().nullable(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: roleEnum.optional(),
  outletId: z.string().uuid().optional().nullable(),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  role: roleEnum.optional(),
  search: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
