import prisma from "../../config/prisma";
import { z } from "zod";

export const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      variantId: z.number().int().positive(),
      quantity: z.number().int().positive().max(10),
    })
  ).min(1),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email(),
  telegramUsername: z.string().optional(),
  country: z.string().min(2).max(80),
  city: z.string().optional(),
  address: z.string().optional(),
  deliveryMethod: z.enum(["Telegram Message", "Email", "WhatsApp", "Manual Support"]),
  note: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

function generateOrderNumber(): string {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZS-${now}-${rand}`;
}

export async function createOrder(input: CreateOrderInput, userId?: number) {
  const variantIds = input.items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: { product: true },
  });

  if (variants.length !== input.items.length) {
    throw new Error("One or more variants are invalid or inactive");
  }

  const orderItems = input.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) throw new Error(`Variant ${item.variantId} not found`);
    if (variant.productId !== item.productId) {
      throw new Error(`Variant ${item.variantId} does not belong to product ${item.productId}`);
    }
    if (!variant.product.isActive) {
      throw new Error(`Product ${variant.product.title} is not active`);
    }
    if (variant.stock !== -1 && variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${variant.product.title}`);
    }
    return {
      productId: item.productId,
      variantId: item.variantId,
      title: variant.product.title,
      variantName: variant.name,
      duration: variant.duration ?? undefined,
      region: variant.region ?? undefined,
      accountType: variant.accountType ?? undefined,
      price: variant.price,
      quantity: item.quantity,
      total: variant.price * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      subtotal,
      discount: 0,
      totalPrice: subtotal,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      telegramUsername: input.telegramUsername,
      country: input.country,
      city: input.city,
      address: input.address,
      deliveryMethod: input.deliveryMethod,
      note: input.note,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  // Decrement stock for finite-stock variants
  for (const item of input.items) {
    const variant = variants.find((v) => v.id === item.variantId)!;
    if (variant.stock !== -1) {
      await prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  return order;
}

export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}

export function getOrdersByUserId(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
