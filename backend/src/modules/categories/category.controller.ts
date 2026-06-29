import { Request, Response } from "express";
import { getCategories } from "./category.service";

export async function listCategories(_req: Request, res: Response) {
  const categories = await getCategories();
  res.json(categories);
}
