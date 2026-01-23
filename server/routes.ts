import type { Express } from "express";
import { createServer, type Server } from "node:http";
import aiRoutes from "./ai-routes";
import authRoutes from "./auth-routes";
import progressRoutes from "./progress-routes";
import gmailProgressRoutes from "./gmail-progress-routes";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Progress tracking routes
  app.use("/api/progress", progressRoutes);
  
  // Gmail progress tracking routes
  app.use("/api/gmail-progress", gmailProgressRoutes);

  // AI routes for Dori AI features
  app.use("/api/ai", aiRoutes);

  // Image generation routes
  registerImageRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
