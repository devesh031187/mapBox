import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRouter from "./modules/auth/auth.router.js";
import usersRouter from "./modules/users/users.router.js";

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
  app.use("/api/v1", api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
