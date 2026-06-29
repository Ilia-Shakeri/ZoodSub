import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import {
  getAdminOrders, updateOrderStatus,
  CreateProductSchema, adminCreateProduct, adminUpdateProduct,
  CreateVariantSchema, adminCreateVariant, adminUpdateVariant,
  adminGetUsers, adminCreateCategory, UpdateProductSchema,
} from "./admin.service";
import { signToken } from "../auth/auth.service";
import { env } from "../../config/env";

export async function listOrders(req: Request, res: Response) {
  const orders = await getAdminOrders(req.query.status as string | undefined);
  res.json(orders);
}

export async function patchOrderStatus(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { status } = req.body as { status?: string };
  if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const order = await updateOrderStatus(id, status as OrderStatus);
  res.json(order);
}

export async function createProduct(req: Request, res: Response) {
  const parsed = CreateProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const product = await adminCreateProduct(parsed.data);
  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const parsed = UpdateProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const product = await adminUpdateProduct(id, parsed.data);
  res.json(product);
}

export async function createVariant(req: Request, res: Response) {
  const parsed = CreateVariantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const variant = await adminCreateVariant(parsed.data);
  res.status(201).json(variant);
}

export async function updateVariant(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const variant = await adminUpdateVariant(id, req.body);
  res.json(variant);
}

export async function listUsers(req: Request, res: Response) {
  const users = await adminGetUsers(req.query.search as string | undefined);
  res.json(users);
}

export async function createCategory(req: Request, res: Response) {
  const category = await adminCreateCategory(req.body);
  res.status(201).json(category);
}

export function adminLogin(req: Request, res: Response) {
  const { secret } = req.body as { secret?: string };
  if (!secret || secret !== env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Invalid admin secret" });
  }
  const token = signToken(null, true);
  res.json({ token });
}
