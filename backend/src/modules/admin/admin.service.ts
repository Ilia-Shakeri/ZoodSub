import prisma from "../../config/prisma";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export function getAdminOrders(status?: string) {
  return prisma.order.findMany({
    where: status ? { status: status as OrderStatus } : {},
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
  });
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export const CreateProductSchema = z.object({
  categoryId: z.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  deliveryType: z.string().default("instant"),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      duration: z.string().optional(),
      region: z.string().optional(),
      accountType: z.string().optional(),
      price: z.number().int().positive(),
      oldPrice: z.number().int().positive().optional(),
      stock: z.number().int().default(-1),
      isActive: z.boolean().default(true),
    })
  ).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().omit({ variants: true });

export const CreateVariantSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  duration: z.string().optional(),
  region: z.string().optional(),
  accountType: z.string().optional(),
  price: z.number().int().positive(),
  oldPrice: z.number().int().positive().optional(),
  stock: z.number().int().default(-1),
  isActive: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export async function adminCreateProduct(input: CreateProductInput) {
  const { variants, ...productData } = input;
  return prisma.product.create({
    data: {
      ...productData,
      variants: variants ? { create: variants } : undefined,
    },
    include: { variants: true },
  });
}

export function adminUpdateProduct(id: number, data: Partial<CreateProductInput>) {
  const { variants, ...rest } = data;
  return prisma.product.update({ where: { id }, data: rest, include: { variants: true } });
}

export function adminCreateVariant(data: z.infer<typeof CreateVariantSchema>) {
  return prisma.variant.create({ data });
}

export function adminUpdateVariant(id: number, data: Partial<z.infer<typeof CreateVariantSchema>>) {
  return prisma.variant.update({ where: { id }, data });
}

export function adminGetUsers(search?: string) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { telegramId: { contains: search } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export function adminCreateCategory(data: { name: string; slug: string; icon?: string; sortOrder?: number }) {
  return prisma.category.create({ data });
}
