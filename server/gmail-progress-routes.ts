import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { requireAuth } from "./auth-routes";
import { journeyProgressSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

const GMAIL_PREFIX = "gmail_";

function toGmailJourneyId(journeyId: string): string {
  if (journeyId.startsWith(GMAIL_PREFIX)) return journeyId;
  return GMAIL_PREFIX + journeyId;
}

function fromGmailJourneyId(journeyId: string): string {
  if (journeyId.startsWith(GMAIL_PREFIX)) {
    return journeyId.substring(GMAIL_PREFIX.length);
  }
  return journeyId;
}

// Get all Gmail journey progress for current user
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const allProgress = await storage.getAllJourneyProgress(user.id);
    
    // Filter to Gmail journeys only and remove prefix for client
    const gmailProgress = allProgress
      .filter(p => p.journeyId.startsWith(GMAIL_PREFIX))
      .map(p => ({
        ...p,
        journeyId: fromGmailJourneyId(p.journeyId),
      }));
    
    res.json({ progress: gmailProgress });
  } catch (error) {
    console.error("Get Gmail progress error:", error);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

// Get progress for a specific Gmail journey
router.get("/:journeyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const journeyId = toGmailJourneyId(req.params.journeyId);
    
    const progress = await storage.getJourneyProgress(user.id, journeyId);
    const stepCompletions = await storage.getStepCompletions(user.id, journeyId);
    
    res.json({ 
      progress: progress 
        ? { ...progress, journeyId: fromGmailJourneyId(progress.journeyId) }
        : { journeyId: req.params.journeyId, currentStep: 0, completed: false },
      stepCompletions,
    });
  } catch (error) {
    console.error("Get Gmail journey progress error:", error);
    res.status(500).json({ error: "Failed to get journey progress" });
  }
});

// Update Gmail journey progress
router.put("/:journeyId", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const journeyId = toGmailJourneyId(req.params.journeyId);
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

    // Check for Gmail-specific achievements
    if (completed) {
      const allProgress = await storage.getAllJourneyProgress(user.id);
      const gmailProgress = allProgress.filter(p => p.journeyId.startsWith(GMAIL_PREFIX));
      const completedGmailCount = gmailProgress.filter(p => p.completed).length;
      
      // First Gmail journey completed
      if (completedGmailCount === 1) {
        await storage.grantAchievement(user.id, "first_gmail_journey_complete", {
          journeyId: fromGmailJourneyId(journeyId),
          completedAt: new Date().toISOString(),
        });
      }
      
      // All Gmail journeys completed (6 total)
      if (completedGmailCount === 6) {
        await storage.grantAchievement(user.id, "all_gmail_journeys_complete", {
          completedAt: new Date().toISOString(),
        });
      }
    }
    
    res.json({ 
      progress: {
        ...progress,
        journeyId: fromGmailJourneyId(progress.journeyId),
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Update Gmail progress error:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Record Gmail step completion
router.post("/:journeyId/steps/:stepIndex", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const journeyId = toGmailJourneyId(req.params.journeyId);
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
    console.error("Record Gmail step error:", error);
    res.status(500).json({ error: "Failed to record step completion" });
  }
});

export default router;
