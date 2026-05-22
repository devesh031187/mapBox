import type { Request, Response, NextFunction } from "express";
import * as svc from "./vendors.service.js";
import { ok, created } from "../../utils/responseBuilder.js";

function canViewBanking(req: Request): boolean {
  const role = req.user?.role;
  return role === "ADMIN" || role === "FINANCE";
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, status, categoryId } = req.query as Record<string, string>;
    const data = await svc.listVendors(
      { page: Number(page) || 1, limit: Math.min(Number(limit) || 20, 100), search, status, categoryId },
      canViewBanking(req)
    );
    ok(res, data);
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.getVendor(req.params.id, canViewBanking(req)));
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    created(res, await svc.createVendor(req.body, req.user!.id));
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.updateVendor(req.params.id, req.body));
  } catch (e) { next(e); }
}

export async function setStatus(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.setVendorStatus(req.params.id, req.body.status, req.body.blacklistReason));
  } catch (e) { next(e); }
}

export async function getPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    ok(res, await svc.getVendorPerformance(req.params.id, page, limit));
  } catch (e) { next(e); }
}

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.getVendorItems(req.params.id));
  } catch (e) { next(e); }
}
