import { Request, Response } from "express";
import { CreateOrderSchema, createOrder, getOrderByNumber, getOrdersByUserId } from "./order.service";
import { notifyUserOrderCreated, notifyAdminNewOrder } from "../telegram/telegram.service";
import { env } from "../../config/env";
import prisma from "../../config/prisma";

export async function placeOrder(req: Request, res: Response) {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const order = await createOrder(parsed.data, req.userId);

  // Fire-and-forget Telegram notification to user
  if (req.userId) {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user?.telegramId) {
      notifyUserOrderCreated(user.telegramId, {
        orderNumber: order.orderNumber,
        fullName: order.fullName,
        totalPrice: order.totalPrice,
        deliveryMethod: order.deliveryMethod,
      }).catch(console.error);
    }
  }

  // Fire-and-forget Telegram notification to the admin
  if (env.ADMIN_CHAT_ID) {
    notifyAdminNewOrder(env.ADMIN_CHAT_ID, {
      orderNumber: order.orderNumber,
      fullName: order.fullName,
      totalPrice: order.totalPrice,
      deliveryMethod: order.deliveryMethod,
    }).catch(console.error);
  }

  res.status(201).json(order);
}

export async function fetchOrder(req: Request, res: Response) {
  const order = await getOrderByNumber(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
}

export async function fetchUserOrders(req: Request, res: Response) {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  const orders = await getOrdersByUserId(req.userId);
  res.json(orders);
}
