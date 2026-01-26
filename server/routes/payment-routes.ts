import { Router, Request, Response } from "express";
import { createOrder, captureOrder, getOrderDetails, isPayPalConfigured } from "../services/paypal";
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
    const { amount = "0.99", currency = "ILS", userId } = req.body;

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

router.post("/check-and-capture", async (req: Request, res: Response) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    console.log("Checking order status:", orderId, "for user:", userId);

    const orderDetails = await getOrderDetails(orderId);
    console.log("Order details:", JSON.stringify(orderDetails, null, 2));

    if (orderDetails.status === "COMPLETED") {
      const existingSub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      if (existingSub.length > 0 && existingSub[0].plan === "premium") {
        return res.json({
          success: true,
          status: "COMPLETED",
          message: "Payment already processed",
          alreadyPremium: true,
        });
      }
    }

    if (orderDetails.status === "APPROVED") {
      console.log("Order is approved, capturing payment...");
      const result = await captureOrder(orderId);
      console.log("Capture result:", result);

      if (result.status === "COMPLETED") {
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
            id: crypto.randomUUID(),
            userId: userId,
            paypalOrderId: result.orderId,
            paypalPayerId: result.payerId,
            plan: "premium",
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: oneYearLater,
          });
        }

        console.log("Subscription updated to premium for user:", userId);
        pendingOrders.delete(orderId);

        return res.json({
          success: true,
          status: "COMPLETED",
          message: "Payment captured successfully",
        });
      }
    }

    return res.json({
      success: false,
      status: orderDetails.status,
      message: `Order status is ${orderDetails.status}, not ready for capture`,
    });
  } catch (error: any) {
    console.error("Check and capture error:", error);
    res.status(500).json({ error: error.message || "Failed to check order" });
  }
});

router.get("/subscription/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

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
  
  const appDeepLink = captureSuccess 
    ? `doriai://payment-success?status=completed&token=${token}`
    : `doriai://payment-success?status=failed`;
  
  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>תשלום הצליח - Dori AI</title>
      ${captureSuccess ? `<meta http-equiv="refresh" content="2;url=${appDeepLink}">` : ''}
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
        .redirect-msg {
          margin-top: 16px;
          font-size: 0.9rem;
          opacity: 0.8;
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
          <a href="${appDeepLink}" class="back-btn">חזור לאפליקציה</a>
          <p class="redirect-msg">מחזיר אותך לאפליקציה אוטומטית...</p>
          <script>
            setTimeout(function() {
              window.location.href = "${appDeepLink}";
            }, 1500);
          </script>
        ` : `
          <div class="check">&#9888;</div>
          <h1>בעיה בעיבוד התשלום</h1>
          <p class="error">${errorMessage || "נסה שוב או צור קשר לתמיכה"}</p>
          <a href="${appDeepLink}" class="back-btn">חזור לאפליקציה</a>
        `}
      </div>
    </body>
    </html>
  `);
});

router.post("/capture-mobile", async (req: Request, res: Response) => {
  try {
    const { token, payerId, userId } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    console.log("Mobile capture request:", { token, payerId, userId });

    const result = await captureOrder(token);
    console.log("Mobile capture result:", result);

    if (result.status === "COMPLETED") {
      const actualUserId = userId || pendingOrders.get(token)?.userId || result.payerId;
      
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

      console.log("Mobile subscription saved for user:", actualUserId);

      res.json({ success: true, status: "COMPLETED" });
    } else {
      res.json({ success: false, status: result.status });
    }
  } catch (error: any) {
    console.error("Mobile capture error:", error);
    res.status(500).json({ error: error.message || "Failed to capture order" });
  }
});

router.post("/verify-order", async (req: Request, res: Response) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    if (!isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    console.log("Verify order request:", { orderId, userId });

    try {
      const result = await captureOrder(orderId);
      console.log("Verify capture result:", result);

      if (result.status === "COMPLETED") {
        const actualUserId = userId || pendingOrders.get(orderId)?.userId || result.payerId;
        
        pendingOrders.delete(orderId);
        
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

        console.log("Verified subscription saved for user:", actualUserId);

        res.json({ success: true, status: "COMPLETED" });
      } else {
        res.json({ success: false, status: result.status });
      }
    } catch (captureError: any) {
      if (captureError.message?.includes("INSTRUMENT_DECLINED") || 
          captureError.message?.includes("ORDER_NOT_APPROVED")) {
        return res.json({ success: false, status: "NOT_APPROVED", message: "Payment not yet approved" });
      }
      throw captureError;
    }
  } catch (error: any) {
    console.error("Verify order error:", error);
    res.status(500).json({ error: error.message || "Failed to verify order" });
  }
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
