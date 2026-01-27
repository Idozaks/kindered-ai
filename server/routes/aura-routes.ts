import { Router, Request, Response } from "express";
import { db } from "../db";
import { circleContacts, medications, medicationLogs, hydrationLogs, wellnessLogs } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const circleContactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  relationship: z.enum(["daughter", "son", "doctor", "spouse", "caregiver", "friend"]),
  avatarInitials: z.string().optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().optional(),
});

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  scheduledTime: z.string().min(1),
  frequency: z.enum(["daily", "weekly", "as_needed"]).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

const wellnessLogSchema = z.object({
  mood: z.enum(["great", "good", "okay", "not_good", "bad"]),
  notes: z.string().optional(),
});

router.get("/contacts", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const contacts = await db
      .select()
      .from(circleContacts)
      .where(eq(circleContacts.userId, userId))
      .orderBy(circleContacts.order);

    return res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

router.post("/contacts", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = circleContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [contact] = await db
      .insert(circleContacts)
      .values({
        ...parsed.data,
        userId,
      })
      .returning();

    return res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({ error: "Failed to create contact" });
  }
});

router.put("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const parsed = circleContactSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [updated] = await db
      .update(circleContacts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(circleContacts.id, id), eq(circleContacts.userId, userId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.json(updated);
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ error: "Failed to update contact" });
  }
});

router.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const [deleted] = await db
      .delete(circleContacts)
      .where(and(eq(circleContacts.id, id), eq(circleContacts.userId, userId)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({ error: "Failed to delete contact" });
  }
});

router.get("/medications", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const meds = await db
      .select()
      .from(medications)
      .where(and(eq(medications.userId, userId), eq(medications.isActive, true)));

    return res.json(meds);
  } catch (error) {
    console.error("Error fetching medications:", error);
    return res.status(500).json({ error: "Failed to fetch medications" });
  }
});

router.post("/medications", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = medicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [medication] = await db
      .insert(medications)
      .values({
        ...parsed.data,
        userId,
      })
      .returning();

    return res.status(201).json(medication);
  } catch (error) {
    console.error("Error creating medication:", error);
    return res.status(500).json({ error: "Failed to create medication" });
  }
});

router.post("/medications/:id/take", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    const [log] = await db
      .insert(medicationLogs)
      .values({
        userId,
        medicationId: id,
        status: "taken",
      })
      .returning();

    return res.status(201).json(log);
  } catch (error) {
    console.error("Error logging medication:", error);
    return res.status(500).json({ error: "Failed to log medication" });
  }
});

router.get("/hydration", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const today = new Date().toISOString().split("T")[0];

    const [log] = await db
      .select()
      .from(hydrationLogs)
      .where(and(eq(hydrationLogs.userId, userId), eq(hydrationLogs.date, today)));

    if (!log) {
      return res.json({ glasses: 0, goal: 8, date: today });
    }

    return res.json(log);
  } catch (error) {
    console.error("Error fetching hydration:", error);
    return res.status(500).json({ error: "Failed to fetch hydration" });
  }
});

router.post("/hydration/add", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const today = new Date().toISOString().split("T")[0];

    const [existing] = await db
      .select()
      .from(hydrationLogs)
      .where(and(eq(hydrationLogs.userId, userId), eq(hydrationLogs.date, today)));

    if (existing) {
      const [updated] = await db
        .update(hydrationLogs)
        .set({ glasses: existing.glasses! + 1, updatedAt: new Date() })
        .where(eq(hydrationLogs.id, existing.id))
        .returning();
      return res.json(updated);
    }

    const [created] = await db
      .insert(hydrationLogs)
      .values({
        userId,
        date: today,
        glasses: 1,
        goal: 8,
      })
      .returning();

    return res.status(201).json(created);
  } catch (error) {
    console.error("Error adding hydration:", error);
    return res.status(500).json({ error: "Failed to add hydration" });
  }
});

router.post("/hydration/remove", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const today = new Date().toISOString().split("T")[0];

    const [existing] = await db
      .select()
      .from(hydrationLogs)
      .where(and(eq(hydrationLogs.userId, userId), eq(hydrationLogs.date, today)));

    if (existing && existing.glasses! > 0) {
      const [updated] = await db
        .update(hydrationLogs)
        .set({ glasses: existing.glasses! - 1, updatedAt: new Date() })
        .where(eq(hydrationLogs.id, existing.id))
        .returning();
      return res.json(updated);
    }

    return res.json({ glasses: 0, goal: 8, date: today });
  } catch (error) {
    console.error("Error removing hydration:", error);
    return res.status(500).json({ error: "Failed to remove hydration" });
  }
});

router.post("/wellness", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = wellnessLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [log] = await db
      .insert(wellnessLogs)
      .values({
        userId,
        mood: parsed.data.mood,
        notes: parsed.data.notes,
      })
      .returning();

    return res.status(201).json(log);
  } catch (error) {
    console.error("Error creating wellness log:", error);
    return res.status(500).json({ error: "Failed to create wellness log" });
  }
});

router.get("/wellness/history", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const logs = await db
      .select()
      .from(wellnessLogs)
      .where(eq(wellnessLogs.userId, userId))
      .orderBy(desc(wellnessLogs.loggedAt))
      .limit(30);

    return res.json(logs);
  } catch (error) {
    console.error("Error fetching wellness history:", error);
    return res.status(500).json({ error: "Failed to fetch wellness history" });
  }
});

export default router;
