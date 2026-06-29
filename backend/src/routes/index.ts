import { Router } from "express";
import { telegramAuth } from "../modules/auth/auth.controller";
import { listCategories } from "../modules/categories/category.controller";
import { listProducts, getProduct } from "../modules/products/product.controller";
import { placeOrder, fetchOrder, fetchUserOrders } from "../modules/orders/order.controller";
import {
  listOrders, patchOrderStatus,
  createProduct, updateProduct,
  createVariant, updateVariant,
  listUsers, createCategory, adminLogin,
} from "../modules/admin/admin.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Auth
router.post("/auth/telegram", telegramAuth);

// Public catalog
router.get("/categories", listCategories);
router.get("/products", listProducts);
router.get("/products/:id", getProduct);

// Orders
router.post("/orders", requireAuth, placeOrder);
router.get("/orders", requireAuth, fetchUserOrders);
router.get("/orders/:orderNumber", fetchOrder);

// Admin auth (no middleware — validates ADMIN_SECRET internally)
router.post("/admin/login", adminLogin);

// Admin (requires admin JWT)
router.get("/admin/orders", requireAdmin, listOrders);
router.patch("/admin/orders/:id/status", requireAdmin, patchOrderStatus);
router.post("/admin/products", requireAdmin, createProduct);
router.patch("/admin/products/:id", requireAdmin, updateProduct);
router.post("/admin/variants", requireAdmin, createVariant);
router.patch("/admin/variants/:id", requireAdmin, updateVariant);
router.get("/admin/users", requireAdmin, listUsers);
router.post("/admin/categories", requireAdmin, createCategory);

export default router;
