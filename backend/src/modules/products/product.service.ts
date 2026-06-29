import prisma from "../../config/prisma";

export function getProducts(categorySlug?: string, search?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug && categorySlug !== "all"
        ? { category: { slug: categorySlug } }
        : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" } }
        : {}),
    },
    include: {
      category: true,
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
}

export function getProductById(id: number) {
  return prisma.product.findFirst({
    where: { id, isActive: true },
    include: {
      category: true,
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
  });
}
