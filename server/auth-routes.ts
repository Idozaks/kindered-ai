import { Router, Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, updateUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();
const SALT_ROUNDS = 10;

// Middleware to verify authentication
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const session = await storage.getSessionByToken(token);
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const user = await storage.getUser(session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerUserSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await storage.createUser({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      phoneNumber: data.phoneNumber,
      preferredLanguage: data.preferredLanguage,
    });

    // Create session
    const session = await storage.createSession(user.id);

    // Create free subscription
    await storage.createSubscription(user.id, "free");

    // Return user data (without password)
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({
      user: safeUser,
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginUserSchema.parse(req.body);

    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordValid = await compare(data.password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create new session
    const session = await storage.createSession(user.id);

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      user: safeUser,
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
router.post("/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    const session = (req as any).session;
    await storage.deleteSession(session.token);
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Get current user
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { passwordHash: _, ...safeUser } = user;
  
  // Get subscription info
  const subscription = await storage.getSubscription(user.id);
  
  res.json({
    user: safeUser,
    subscription: subscription || { plan: "free", status: "active" },
  });
});

// Update user preferences
router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const updates = updateUserPreferencesSchema.parse(req.body);

    const updatedUser = await storage.updateUser(user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { passwordHash: _, ...safeUser } = updatedUser;
    res.json({ user: safeUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Update error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

// Complete onboarding
router.post("/complete-onboarding", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const updatedUser = await storage.updateUser(user.id, {
      onboardingCompleted: true,
    });

    // Grant first-time achievement
    await storage.grantAchievement(user.id, "onboarding_complete", {
      completedAt: new Date().toISOString(),
    });

    const { passwordHash: _, ...safeUser } = updatedUser!;
    res.json({ user: safeUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

export default router;
