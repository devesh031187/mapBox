import bcrypt from "bcryptjs";
import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import { buildPage } from "../../utils/pagination.js";
import type { CreateUserInput, UpdateUserInput } from "./users.schema.js";

const userSelect = {
  id: true,
  employeeCode: true,
  fullName: true,
  email: true,
  role: true,
  outletId: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function listUsers(params: {
  page: number;
  limit: number;
  skip: number;
  role?: UserRole;
  search?: string;
}) {
  const where: Prisma.UserWhereInput = {};
  if (params.role) where.role = params.role;
  if (params.search) {
    where.OR = [
      { fullName: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
      { employeeCode: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return buildPage(items, total, params.page, params.limit);
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      employeeCode: input.employeeCode,
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: input.role,
      outletId: input.outletId ?? null,
    },
    select: userSelect,
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  await getUser(id);
  return prisma.user.update({
    where: { id },
    data: {
      fullName: input.fullName,
      email: input.email,
      role: input.role,
      outletId: input.outletId,
    },
    select: userSelect,
  });
}

export async function setUserStatus(id: string, isActive: boolean) {
  await getUser(id);
  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: userSelect,
  });
}
