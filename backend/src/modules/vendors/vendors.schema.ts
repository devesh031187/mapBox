import { z } from "zod";
import { VendorStatus, PaymentTerms } from "@prisma/client";

export const createVendorSchema = z.object({
  vendorCode: z.string().min(1).max(30).toUpperCase(),
  companyName: z.string().min(1).max(200),
  tradeName: z.string().max(200).optional(),
  vendorCategoryId: z.string().uuid(),
  contactPerson: z.string().min(1).max(100),
  email: z.string().email().max(150),
  phone: z.string().min(7).max(20),
  alternatePhone: z.string().max(20).nullable().optional(),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).nullable().optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(4).max(10),
  country: z.string().max(100).optional(),
  taxId: z.string().max(50).nullable().optional(),
  paymentTerms: z.nativeEnum(PaymentTerms).optional(),
  creditLimit: z.number().positive().nullable().optional(),
  bankName: z.string().max(100).nullable().optional(),
  bankAccountNo: z.string().max(50).nullable().optional(),
  bankIfsc: z.string().max(20).nullable().optional(),
  bankBranch: z.string().max(100).nullable().optional(),
  status: z.nativeEnum(VendorStatus).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export const updateVendorStatusSchema = z.object({
  status: z.nativeEnum(VendorStatus),
  blacklistReason: z.string().max(500).optional(),
});

export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type UpdateVendorDto = z.infer<typeof updateVendorSchema>;
