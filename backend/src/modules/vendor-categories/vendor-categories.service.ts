import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { CreateVendorCategoryDto, UpdateVendorCategoryDto } from "./vendor-categories.schema.js";

export async function list(isActive?: boolean) {
  return prisma.vendorCategory.findMany({
    where: isActive !== undefined ? { isActive } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getOne(id: string) {
  const cat = await prisma.vendorCategory.findUnique({ where: { id } });
  if (!cat) throw new AppError(404, "Vendor category not found");
  return cat;
}

export async function create(dto: CreateVendorCategoryDto) {
  return prisma.vendorCategory.create({ data: { ...dto, isActive: dto.isActive ?? true } });
}

export async function update(id: string, dto: UpdateVendorCategoryDto) {
  await getOne(id);
  return prisma.vendorCategory.update({ where: { id }, data: dto });
}

export async function remove(id: string) {
  const cat = await prisma.vendorCategory.findUnique({
    where: { id },
    include: { vendors: { take: 1 } },
  });
  if (!cat) throw new AppError(404, "Vendor category not found");
  if (cat.vendors.length) throw new AppError(409, "Cannot delete category with vendors assigned");
  await prisma.vendorCategory.delete({ where: { id } });
}
