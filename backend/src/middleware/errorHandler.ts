import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../config/logger.js";
import { fail } from "../utils/responseBuilder.js";

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  fail(res, 404, "Route not found");
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    fail(res, err.status, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    fail(res, 422, "Validation failed", err.flatten().fieldErrors);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      fail(res, 409, "A record with this unique value already exists", err.meta);
      return;
    }
    if (err.code === "P2025") {
      fail(res, 404, "Record not found");
      return;
    }
    fail(res, 400, "Database request error", { code: err.code });
    return;
  }

  logger.error(err instanceof Error ? err : String(err));
  fail(res, 500, "Internal server error");
}
