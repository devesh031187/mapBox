import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/responseBuilder.js";
import { parsePagination } from "../../utils/pagination.js";
import * as usersService from "./users.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const result = await usersService.listUsers({
      page,
      limit,
      skip,
      role: req.query.role as never,
      search: req.query.search as string | undefined,
    });
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await usersService.getUser(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    created(res, await usersService.createUser(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await usersService.updateUser(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function setStatus(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await usersService.setUserStatus(req.params.id, req.body.isActive));
  } catch (err) {
    next(err);
  }
}
