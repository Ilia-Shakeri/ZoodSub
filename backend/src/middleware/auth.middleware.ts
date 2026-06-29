import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../modules/auth/auth.service";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      isAdmin?: boolean;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }
  req.userId = payload.userId ?? undefined;
  req.isAdmin = payload.isAdmin;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  });
}
