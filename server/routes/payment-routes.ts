import { Router, Request, Response } from "express";
import { createOrder, captureOrder, isPayPalConfigured } from "../services/paypal";
import { db } from "../db";
import { subscriptions } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

const DEV_MODE = process.env.DEV_MODE === "true";

router.get("/status", async (req: Request, res: Response) => {
  res.json({
    paypalConfigured: isPayPalConfigured(),
    devMode: DEV_MODE,
  });
});

router.get("/dev-mode", (req: Request, res: Response) => {
  res.json({ devMode: DEV_MODE });
});

router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { amount = "49.90", currency = "ILS" } = req.body;

    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    const result = await createOrder(amount, currency, "Dori AI Premium - מנוי פרימיום");

    res.json({
      orderId: result.orderId,
      approvalUrl: result.approvalUrl,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

router.post("/capture-order", async (req: Request, res: Response) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    const result = await captureOrder(orderId);

    if (result.status === "COMPLETED" && userId) {
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      const existingSub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      if (existingSub.length > 0) {
        await db
          .update(subscriptions)
          .set({
            paypalOrderId: result.orderId,
            paypalPayerId: result.payerId,
            plan: "premium",
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: oneYearLater,
            updatedAt: now,
          })
          .where(eq(subscriptions.userId, userId));
      } else {
        await db.insert(subscriptions).values({
          userId,
          paypalOrderId: result.orderId,
          paypalPayerId: result.payerId,
          plan: "premium",
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: oneYearLater,
        });
      }
    }

    res.json({
      success: result.status === "COMPLETED",
      orderId: result.orderId,
      status: result.status,
    });
  } catch (error: any) {
    console.error("Capture order error:", error);
    res.status(500).json({ error: error.message || "Failed to capture order" });
  }
});

router.get("/subscription/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (DEV_MODE) {
      return res.json({
        isPremium: true,
        plan: "premium",
        status: "active",
        devMode: true,
      });
    }

    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (sub.length === 0) {
      return res.json({
        isPremium: false,
        plan: "free",
        status: "none",
      });
    }

    const subscription = sub[0];
    const now = new Date();
    const isActive =
      subscription.status === "active" &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd > now;

    res.json({
      isPremium: isActive && subscription.plan === "premium",
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error: any) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: error.message || "Failed to get subscription" });
  }
});

router.get("/success", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>תשלום הצליח - Dori AI</title>
      <style>
        body {
          font-family: 'Varela Round', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; opacity: 0.9; }
        .check { font-size: 4rem; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="check">✓</div>
        <h1>התשלום הצליח!</h1>
        <p>תודה שהצטרפת ל-Dori AI Premium</p>
        <p>אתה יכול לחזור לאפליקציה עכשיו</p>
      </div>
    </body>
    </html>
  `);
});

router.get("/cancel", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>תשלום בוטל - Dori AI</title>
      <style>
        body {
          font-family: 'Varela Round', Arial, sans-serif;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; opacity: 0.9; }
        .x { font-size: 4rem; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="x">✕</div>
        <h1>התשלום בוטל</h1>
        <p>אתה יכול לחזור לאפליקציה ולנסות שוב</p>
      </div>
    </body>
    </html>
  `);
});

export default router;
