import { prisma } from "../../config/database.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./categories.schema.js";

type CategoryNode = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  children: CategoryNode[];
};

function buildTree(flat: CategoryNode[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));

  const roots: CategoryNode[] = [];
  flat.forEach((c) => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(map.get(c.id)!);
    } else {
      roots.push(map.get(c.id)!);
    }
  });
  return roots;
}

export async function listTree() {
  const all = await prisma.itemCategory.findMany({
    select: { id: true, name: true, code: true, description: true, isActive: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
  return buildTree(all as CategoryNode[]);
}

export async function listFlat(isActive?: boolean) {
  return prisma.itemCategory.findMany({
    where: isActive !== undefined ? { isActive } : undefined,
    orderBy: [{ name: "asc" }],
  });
}

export async function getCategory(id: string) {
  const cat = await prisma.itemCategory.findUnique({
    where: { id },
    include: { children: true, parent: true },
  });
  if (!cat) throw new AppError(404, "Category not found");
  return cat;
}

export async function createCategory(dto: CreateCategoryDto, userId: string) {
  if (dto.parentId) {
    const parent = await prisma.itemCategory.findUnique({ where: { id: dto.parentId } });
    if (!parent) throw new AppError(400, "Parent category not found");

    // Enforce max 3 levels: parent must have no parent (level 1) or parent's parent must be level 1
    if (parent.parentId) {
      const grandparent = await prisma.itemCategory.findUnique({ where: { id: parent.parentId } });
      if (grandparent?.parentId) throw new AppError(400, "Maximum category depth is 3 levels");
    }
  }

  return prisma.itemCategory.create({
    data: {
      name: dto.name,
      code: dto.code,
      parentId: dto.parentId ?? null,
      description: dto.description,
      isActive: dto.isActive ?? true,
    },
  });
}

export async function updateCategory(id: string, dto: UpdateCategoryDto) {
  await getCategory(id);
  return prisma.itemCategory.update({ where: { id }, data: dto });
}

export async function deleteCategory(id: string) {
  const cat = await prisma.itemCategory.findUnique({
    where: { id },
    include: { children: { take: 1 }, items: { take: 1 } },
  });
  if (!cat) throw new AppError(404, "Category not found");
  if (cat.children.length) throw new AppError(409, "Cannot delete category with subcategories");
  if (cat.items.length) throw new AppError(409, "Cannot delete category with items assigned");
  await prisma.itemCategory.delete({ where: { id } });
}
