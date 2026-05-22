import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { CreateStorageLocationDto, UpdateStorageLocationDto } from "./storage-locations.schema.js";

export async function list(filters: { outletId?: string; zone?: string; isActive?: boolean }) {
  return prisma.storageLocation.findMany({
    where: {
      outletId: filters.outletId,
      zone: filters.zone as never,
      isActive: filters.isActive,
    },
    include: { outlet: { select: { id: true, name: true, code: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getOne(id: string) {
  const loc = await prisma.storageLocation.findUnique({
    where: { id },
    include: { outlet: { select: { id: true, name: true, code: true } } },
  });
  if (!loc) throw new AppError(404, "Storage location not found");
  return loc;
}

export async function create(dto: CreateStorageLocationDto) {
  return prisma.storageLocation.create({
    data: {
      name: dto.name,
      code: dto.code,
      zone: dto.zone,
      outletId: dto.outletId ?? null,
      temperatureMinC: dto.temperatureMinC ?? null,
      temperatureMaxC: dto.temperatureMaxC ?? null,
      capacityDescription: dto.capacityDescription,
      isActive: dto.isActive ?? true,
    },
  });
}

export async function update(id: string, dto: UpdateStorageLocationDto) {
  await getOne(id);
  return prisma.storageLocation.update({ where: { id }, data: dto });
}

export async function remove(id: string) {
  const loc = await prisma.storageLocation.findUnique({
    where: { id },
    include: { items: { take: 1 } },
  });
  if (!loc) throw new AppError(404, "Storage location not found");
  if (loc.items.length) throw new AppError(409, "Cannot delete location with items assigned");
  await prisma.storageLocation.delete({ where: { id } });
}
