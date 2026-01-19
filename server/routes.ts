import type { Express } from "express";
import { createServer, type Server } from "node:http";
import aiRoutes from "./ai-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI routes for Kindred AI features
  app.use("/api/ai", aiRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
