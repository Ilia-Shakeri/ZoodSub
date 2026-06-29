"use client";

import axios from "axios";
import { Category, Product, Order, DeliveryForm, CartItem } from "../types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("zoodsub_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function authTelegram(initData: string): Promise<{ token: string; user: object }> {
  const { data } = await api.post("/auth/telegram", { initData });
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get("/categories");
  return data;
}

export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  const { data } = await api.get("/products", { params: { category, search } });
  return data;
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createOrder(
  items: CartItem[],
  delivery: DeliveryForm
): Promise<Order> {
  const { data } = await api.post("/orders", {
    items: items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    ...delivery,
  });
  return data;
}

export async function fetchOrder(orderNumber: string): Promise<Order> {
  const { data } = await api.get(`/orders/${orderNumber}`);
  return data;
}

export async function fetchUserOrders(): Promise<Order[]> {
  const { data } = await api.get("/orders");
  return data;
}

// Admin auth
export async function adminLogin(secret: string): Promise<{ token: string }> {
  const { data } = await api.post("/admin/login", { secret });
  return data;
}

// Admin
export async function adminFetchOrders(status?: string): Promise<Order[]> {
  const { data } = await api.get("/admin/orders", { params: { status } });
  return data;
}

export async function adminUpdateOrderStatus(id: number, status: string) {
  const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
  return data;
}

export async function adminFetchProducts(): Promise<Product[]> {
  const { data } = await api.get("/products");
  return data;
}

export async function adminCreateProduct(payload: object) {
  const { data } = await api.post("/admin/products", payload);
  return data;
}

export async function adminUpdateProduct(id: number, payload: object) {
  const { data } = await api.patch(`/admin/products/${id}`, payload);
  return data;
}

export async function adminCreateVariant(payload: object) {
  const { data } = await api.post("/admin/variants", payload);
  return data;
}

export async function adminUpdateVariant(id: number, payload: object) {
  const { data } = await api.patch(`/admin/variants/${id}`, payload);
  return data;
}

export async function adminFetchUsers(search?: string) {
  const { data } = await api.get("/admin/users", { params: { search } });
  return data;
}

export async function adminCreateCategory(payload: object) {
  const { data } = await api.post("/admin/categories", payload);
  return data;
}
