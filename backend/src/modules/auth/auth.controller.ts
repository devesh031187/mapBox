import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { ok } from "../../utils/responseBuilder.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE = "refresh_token";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/v1/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie(REFRESH_COOKIE, result.refresh_token, refreshCookieOptions);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, result.refresh_token, refreshCookieOptions);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user) {
      await authService.logout(req.user.jti, req.user.id);
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
    ok(res, { message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.id);
    ok(res, user);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    ok(res, { message: "Password changed" });
  } catch (err) {
    next(err);
  }
}
