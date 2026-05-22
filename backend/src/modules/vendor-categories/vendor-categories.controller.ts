import type { Request, Response, NextFunction } from "express";
import * as svc from "./vendor-categories.service.js";
import { ok, created } from "../../utils/responseBuilder.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    ok(res, await svc.list(isActive));
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
    ok(res, { message: "Vendor category deleted" });
  } catch (e) { next(e); }
}
