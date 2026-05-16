import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`HFIMS API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(() => {
      void disconnectDatabase().then(() => process.exit(0));
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error(err instanceof Error ? err : String(err));
  process.exit(1);
});
