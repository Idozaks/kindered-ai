import type { Express } from "express";
import { createServer, type Server } from "node:http";
import aiRoutes from "./ai-routes";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI routes for Kindred AI features
  app.use("/api/ai", aiRoutes);

  // Image generation routes
  registerImageRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
