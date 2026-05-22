import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRouter from "./modules/auth/auth.router.js";
import usersRouter from "./modules/users/users.router.js";
import categoriesRouter from "./modules/categories/categories.router.js";
import storageLocationsRouter from "./modules/storage-locations/storage-locations.router.js";
import itemsRouter from "./modules/items/items.router.js";
import vendorCategoriesRouter from "./modules/vendor-categories/vendor-categories.router.js";
import vendorsRouter from "./modules/vendors/vendors.router.js";
import vendorMappingsRouter from "./modules/vendor-mappings/vendor-mappings.router.js";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
  });

  const api = express.Router();
  api.use("/auth", authRouter);
  api.use("/users", usersRouter);
  api.use("/categories", categoriesRouter);
  api.use("/storage-locations", storageLocationsRouter);
  api.use("/items", itemsRouter);
  api.use("/vendor-categories", vendorCategoriesRouter);
  api.use("/vendors", vendorsRouter);
  api.use("/vendor-mappings", vendorMappingsRouter);
  app.use("/api/v1", api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
