import type { Request, Response, NextFunction } from "express";
import * as svc from "./items.service.js";
import { listItemsQuerySchema } from "./items.schema.js";
import { ok, created } from "../../utils/responseBuilder.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listItemsQuerySchema.parse(req.query);
    ok(res, await svc.listItems(query));
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.getItem(req.params.id));
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    created(res, await svc.createItem(req.body, req.user!.id));
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.updateItem(req.params.id, req.body));
  } catch (e) { next(e); }
}

export async function getStockLedger(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    ok(res, await svc.getStockLedger(req.params.id, page, limit));
  } catch (e) { next(e); }
}

export async function belowReorder(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.getBelowReorderItems());
  } catch (e) { next(e); }
}
