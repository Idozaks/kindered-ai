import { Router, Request, Response } from "express";
import { createOrder, captureOrder, isPayPalConfigured } from "../services/paypal";
import { db } from "../db";
import { subscriptions } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

let devModeEnabled = process.env.DEV_MODE === "true";

const pendingOrders = new Map<string, { userId: string; createdAt: Date }>();

setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [orderId, data] of pendingOrders.entries()) {
    if (data.createdAt < oneHourAgo) {
      pendingOrders.delete(orderId);
    }
  }
}, 15 * 60 * 1000);

router.get("/status", async (req: Request, res: Response) => {
  res.json({
    paypalConfigured: isPayPalConfigured(),
    devMode: devModeEnabled,
  });
});

router.get("/dev-mode", (req: Request, res: Response) => {
  res.json({ devMode: devModeEnabled });
});

router.post("/dev-mode", (req: Request, res: Response) => {
  const { enabled } = req.body;
  devModeEnabled = !!enabled;
  res.json({ devMode: devModeEnabled });
});

router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { amount = "49.90", currency = "ILS", userId } = req.body;

    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    const result = await createOrder(amount, currency, "Dori AI Premium - מנוי פרימיום");

    if (userId && result.orderId) {
      pendingOrders.set(result.orderId, { userId, createdAt: new Date() });
      console.log("Stored pending order:", result.orderId, "for user:", userId);
    }

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

    if (devModeEnabled) {
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

router.get("/success", async (req: Request, res: Response) => {
  const { token, PayerID } = req.query;
  
  console.log("Payment success callback:", { token, PayerID });
  
  let captureSuccess = false;
  let errorMessage = "";
  let userName = "";
  
  if (token && typeof token === "string") {
    try {
      const result = await captureOrder(token);
      console.log("Capture result:", result);
      
      if (result.status === "COMPLETED") {
        captureSuccess = true;
        
        const pendingOrder = pendingOrders.get(token);
        const actualUserId = pendingOrder?.userId || result.payerId;
        
        console.log("Using userId:", actualUserId, "from pending order:", !!pendingOrder);
        
        pendingOrders.delete(token);
        
        const now = new Date();
        const oneYearLater = new Date(now);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        
        const existingSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, actualUserId))
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
            .where(eq(subscriptions.userId, actualUserId));
        } else {
          await db.insert(subscriptions).values({
            id: crypto.randomUUID(),
            userId: actualUserId,
            paypalOrderId: result.orderId,
            paypalPayerId: result.payerId,
            plan: "premium",
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: oneYearLater,
          });
        }
        
        console.log("Subscription saved for user:", actualUserId);
      }
    } catch (error: any) {
      console.error("Capture error:", error);
      errorMessage = error.message;
    }
  }
  
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
          max-width: 90%;
        }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; opacity: 0.9; margin: 10px 0; }
        .check { font-size: 5rem; margin-bottom: 20px; }
        .premium-badge {
          display: inline-block;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #333;
          padding: 8px 24px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 1.1rem;
          margin: 20px 0;
        }
        .features {
          text-align: right;
          margin: 24px 0;
          padding: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
        }
        .features li {
          margin: 8px 0;
          list-style: none;
        }
        .features li:before {
          content: "✓ ";
          color: #90EE90;
        }
        .error { color: #ffcccc; }
        .back-btn {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 32px;
          background: white;
          color: #667eea;
          border-radius: 12px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${captureSuccess ? `
          <div class="check">&#10003;</div>
          <h1>ברוכים הבאים לפרימיום!</h1>
          <div class="premium-badge">&#11088; Dori Premium &#11088;</div>
          <p><strong>השדרוג הושלם בהצלחה</strong></p>
          <div class="features">
            <ul>
              <li>שיחות ללא הגבלה עם דורי</li>
              <li>עזרה בפענוח מכתבים</li>
              <li>עזרה בהבנת אתרים</li>
              <li>תמיכה בעברית מלאה</li>
            </ul>
          </div>
          <p>סגור חלון זה וחזור לאפליקציה</p>
        ` : `
          <div class="check">&#9888;</div>
          <h1>בעיה בעיבוד התשלום</h1>
          <p class="error">${errorMessage || "נסה שוב או צור קשר לתמיכה"}</p>
        `}
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
