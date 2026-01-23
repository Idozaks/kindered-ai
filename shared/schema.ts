import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - main user accounts
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  phoneNumber: text("phone_number"),
  preferredLanguage: text("preferred_language").default("he"),
  textSizePreference: text("text_size_preference").default("large"),
  highContrastMode: boolean("high_contrast_mode").default(false),
  voiceGuidanceEnabled: boolean("voice_guidance_enabled").default(true),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Journey progress - tracks which guides users have completed
export const journeyProgress = pgTable("journey_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  journeyId: text("journey_id").notNull(),
  currentStep: integer("current_step").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  startedAt: timestamp("started_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
});

// Step completions - detailed tracking of each step
export const stepCompletions = pgTable("step_completions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  journeyId: text("journey_id").notNull(),
  stepIndex: integer("step_index").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  timeSpentSeconds: integer("time_spent_seconds"),
});

// Achievements/badges for motivation
export const achievements = pgTable("achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementType: text("achievement_type").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  metadata: jsonb("metadata"),
});

// Subscriptions for premium features
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").default("free"),
  status: text("status").default("active"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  journeyProgress: many(journeyProgress),
  stepCompletions: many(stepCompletions),
  achievements: many(achievements),
  subscription: one(subscriptions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const journeyProgressRelations = relations(journeyProgress, ({ one }) => ({
  user: one(users, {
    fields: [journeyProgress.userId],
    references: [users.id],
  }),
}));

export const stepCompletionsRelations = relations(stepCompletions, ({ one }) => ({
  user: one(users, {
    fields: [stepCompletions.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  passwordHash: true,
  displayName: true,
  phoneNumber: true,
  preferredLanguage: true,
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.enum(["he", "en"]).default("he"),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateUserPreferencesSchema = z.object({
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.enum(["he", "en"]).optional(),
  textSizePreference: z.enum(["normal", "large", "extra-large"]).optional(),
  highContrastMode: z.boolean().optional(),
  voiceGuidanceEnabled: z.boolean().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export const journeyProgressSchema = z.object({
  journeyId: z.string(),
  currentStep: z.number().int().min(0),
  completed: z.boolean().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type JourneyProgress = typeof journeyProgress.$inferSelect;
export type StepCompletion = typeof stepCompletions.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
