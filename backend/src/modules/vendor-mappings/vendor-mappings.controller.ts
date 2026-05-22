import type { Request, Response, NextFunction } from "express";
import * as svc from "./vendor-mappings.service.js";
import { ok, created } from "../../utils/responseBuilder.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId, itemId } = req.query as Record<string, string>;
    ok(res, await svc.list({ vendorId, itemId }));
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.getOne(req.params.id));
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    created(res, await svc.create(req.body));
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.update(req.params.id, req.body));
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.remove(req.params.id);
    ok(res, { message: "Mapping deleted" });
  } catch (e) { next(e); }
}
