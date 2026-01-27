import type { Express } from "express";
import { createServer, type Server } from "node:http";
import aiRoutes from "./ai-routes";
import authRoutes from "./auth-routes";
import progressRoutes from "./progress-routes";
import gmailProgressRoutes from "./gmail-progress-routes";
import paymentRoutes from "./routes/payment-routes";
import evaluationRoutes from "./routes/evaluation-routes";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerWebsiteHelperRoutes } from "./routes/websiteHelper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Progress tracking routes
  app.use("/api/progress", progressRoutes);
  
  // Gmail progress tracking routes
  app.use("/api/gmail-progress", gmailProgressRoutes);

  // Payment routes for PayPal integration
  app.use("/api/payments", paymentRoutes);

  // AI routes for Dori AI features
  app.use("/api/ai", aiRoutes);

  // Learning path evaluation routes
  app.use("/api/evaluate", evaluationRoutes);

  // Image generation routes
  registerImageRoutes(app);

  // Website Helper routes
  registerWebsiteHelperRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
