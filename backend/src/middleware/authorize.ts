import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { AppError } from "./errorHandler.js";

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "Authentication required"));
      return;
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      next(new AppError(403, "You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
