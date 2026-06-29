import { Request, Response } from "express";
import { getProducts, getProductById } from "./product.service";

export async function listProducts(req: Request, res: Response) {
  const { category, search } = req.query as { category?: string; search?: string };
  const products = await getProducts(category, search);
  res.json(products);
}

export async function getProduct(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

  const product = await getProductById(id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json(product);
}
