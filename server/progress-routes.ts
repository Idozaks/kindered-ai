import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { requireAuth } from "./auth-routes";
import { journeyProgressSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all journey progress for current user
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const progress = await storage.getAllJourneyProgress(user.id);
    
    res.json({ progress });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

// Get progress for a specific journey
router.get("/:journeyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const journeyId = req.params.journeyId as string;
    
    const progress = await storage.getJourneyProgress(user.id, journeyId);
    const stepCompletions = await storage.getStepCompletions(user.id, journeyId);
    
    res.json({ 
      progress: progress || { journeyId, currentStep: 0, completed: false },
      stepCompletions,
    });
  } catch (error) {
    console.error("Get journey progress error:", error);
    res.status(500).json({ error: "Failed to get journey progress" });
  }
});

// Update journey progress
router.put("/:journeyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const journeyId = req.params.journeyId as string;
    const { currentStep, completed } = journeyProgressSchema.parse({
      journeyId,
      ...req.body,
    });
    
    const progress = await storage.upsertJourneyProgress(
      user.id, 
      journeyId, 
      currentStep, 
      completed
    );

    // Check for achievements
    if (completed) {
      const allProgress = await storage.getAllJourneyProgress(user.id);
      const completedCount = allProgress.filter(p => p.completed).length;
      
      // First journey completed
      if (completedCount === 1) {
        await storage.grantAchievement(user.id, "first_journey_complete", {
          journeyId,
          completedAt: new Date().toISOString(),
        });
      }
      
      // All journeys completed (assuming 7 total)
      if (completedCount === 7) {
        await storage.grantAchievement(user.id, "all_journeys_complete", {
          completedAt: new Date().toISOString(),
        });
      }
    }
    
    res.json({ progress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Update progress error:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Record step completion
router.post("/:journeyId/steps/:stepIndex", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const journeyId = req.params.journeyId as string;
    const stepIndex = req.params.stepIndex as string;
    const { timeSpentSeconds } = req.body;
    
    const completion = await storage.recordStepCompletion(
      user.id,
      journeyId,
      parseInt(stepIndex, 10),
      timeSpentSeconds
    );
    
    res.json({ completion });
  } catch (error) {
    console.error("Record step error:", error);
    res.status(500).json({ error: "Failed to record step completion" });
  }
});

// Get user achievements
router.get("/achievements/all", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const achievements = await storage.getUserAchievements(user.id);
    
    res.json({ achievements });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({ error: "Failed to get achievements" });
  }
});

// Get user stats summary
router.get("/stats/summary", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const allProgress = await storage.getAllJourneyProgress(user.id);
    const achievements = await storage.getUserAchievements(user.id);
    
    const completedJourneys = allProgress.filter(p => p.completed).length;
    const inProgressJourneys = allProgress.filter(p => !p.completed && (p.currentStep ?? 0) > 0).length;
    
    res.json({
      completedJourneys,
      inProgressJourneys,
      totalAchievements: achievements.length,
      lastActivityAt: allProgress.length > 0 
        ? allProgress.reduce((latest, p) => 
            p.lastAccessedAt && p.lastAccessedAt > (latest || new Date(0)) 
              ? p.lastAccessedAt 
              : latest, 
            null as Date | null
          )
        : null,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
