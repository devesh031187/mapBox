import type { Request, Response, NextFunction } from "express";
import * as svc from "./categories.service.js";
import { ok, created } from "../../utils/responseBuilder.js";

export async function listTree(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.listTree();
    ok(res, data);
  } catch (e) { next(e); }
}

export async function listFlat(req: Request, res: Response, next: NextFunction) {
  try {
    const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    const data = await svc.listFlat(isActive);
    ok(res, data);
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getCategory(req.params.id);
    ok(res, data);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.createCategory(req.body, req.user!.id);
    created(res, data);
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.updateCategory(req.params.id, req.body);
    ok(res, data);
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteCategory(req.params.id);
    ok(res, { message: "Category deleted" });
  } catch (e) { next(e); }
}
