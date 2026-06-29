import prisma from "../../config/prisma";

export function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}
