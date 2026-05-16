import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { AppError } from "./errorHandler.js";
import type { UserRole } from "@prisma/client";

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization header");
    }

    const token = header.slice(7);
    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    } catch {
      throw new AppError(401, "Invalid or expired token");
    }

    const revoked = await prisma.revokedToken.findUnique({
      where: { jti: payload.jti },
    });
    if (revoked) {
      throw new AppError(401, "Token has been revoked");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new AppError(401, "User no longer active");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      jti: payload.jti,
    };
    next();
  } catch (err) {
    next(err);
  }
}
