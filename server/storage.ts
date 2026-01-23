import { 
  users, 
  sessions,
  journeyProgress,
  stepCompletions,
  achievements,
  subscriptions,
  type User, 
  type InsertUser,
  type Session,
  type JourneyProgress,
  type StepCompletion,
  type Achievement,
  type Subscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Sessions
  createSession(userId: string): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  
  // Journey Progress
  getJourneyProgress(userId: string, journeyId: string): Promise<JourneyProgress | undefined>;
  getAllJourneyProgress(userId: string): Promise<JourneyProgress[]>;
  upsertJourneyProgress(userId: string, journeyId: string, currentStep: number, completed?: boolean): Promise<JourneyProgress>;
  
  // Step Completions
  recordStepCompletion(userId: string, journeyId: string, stepIndex: number, timeSpentSeconds?: number): Promise<StepCompletion>;
  getStepCompletions(userId: string, journeyId: string): Promise<StepCompletion[]>;
  
  // Achievements
  grantAchievement(userId: string, achievementType: string, metadata?: object): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Subscriptions
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(userId: string, plan: string): Promise<Subscription>;
  updateSubscription(userId: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Sessions
  async createSession(userId: string): Promise<Session> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const [session] = await db
      .insert(sessions)
      .values({ userId, token, expiresAt })
      .returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));
    
    if (session && session.expiresAt < new Date()) {
      await this.deleteSession(token);
      return undefined;
    }
    
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  // Journey Progress
  async getJourneyProgress(userId: string, journeyId: string): Promise<JourneyProgress | undefined> {
    const [progress] = await db
      .select()
      .from(journeyProgress)
      .where(and(
        eq(journeyProgress.userId, userId),
        eq(journeyProgress.journeyId, journeyId)
      ));
    return progress || undefined;
  }

  async getAllJourneyProgress(userId: string): Promise<JourneyProgress[]> {
    return db
      .select()
      .from(journeyProgress)
      .where(eq(journeyProgress.userId, userId));
  }

  async upsertJourneyProgress(
    userId: string, 
    journeyId: string, 
    currentStep: number, 
    completed: boolean = false
  ): Promise<JourneyProgress> {
    const existing = await this.getJourneyProgress(userId, journeyId);
    
    if (existing) {
      const [updated] = await db
        .update(journeyProgress)
        .set({ 
          currentStep, 
          completed,
          completedAt: completed ? new Date() : existing.completedAt,
          lastAccessedAt: new Date()
        })
        .where(eq(journeyProgress.id, existing.id))
        .returning();
      return updated;
    }
    
    const [progress] = await db
      .insert(journeyProgress)
      .values({ userId, journeyId, currentStep, completed })
      .returning();
    return progress;
  }

  // Step Completions
  async recordStepCompletion(
    userId: string, 
    journeyId: string, 
    stepIndex: number, 
    timeSpentSeconds?: number
  ): Promise<StepCompletion> {
    const [completion] = await db
      .insert(stepCompletions)
      .values({ userId, journeyId, stepIndex, timeSpentSeconds })
      .returning();
    return completion;
  }

  async getStepCompletions(userId: string, journeyId: string): Promise<StepCompletion[]> {
    return db
      .select()
      .from(stepCompletions)
      .where(and(
        eq(stepCompletions.userId, userId),
        eq(stepCompletions.journeyId, journeyId)
      ));
  }

  // Achievements
  async grantAchievement(
    userId: string, 
    achievementType: string, 
    metadata?: object
  ): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values({ userId, achievementType, metadata })
      .returning();
    return achievement;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }

  // Subscriptions
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription || undefined;
  }

  async createSubscription(userId: string, plan: string = "free"): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({ userId, plan, status: "active" })
      .returning();
    return subscription;
  }

  async updateSubscription(
    userId: string, 
    updates: Partial<Subscription>
  ): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return subscription || undefined;
  }
}

export const storage = new DatabaseStorage();
