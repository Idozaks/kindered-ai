const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

if (!clientId || !clientSecret) {
  console.warn("PayPal credentials not configured. Payment features will be disabled.");
}

async function getAccessToken(): Promise<string> {
  if (!clientId || !clientSecret) {
    throw new Error("PayPal not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export interface CreateOrderResult {
  orderId: string;
  approvalUrl: string;
}

export interface CaptureOrderResult {
  orderId: string;
  status: string;
  payerId: string;
  payerEmail: string;
}

export async function createOrder(
  amount: string,
  currency: string = "ILS",
  description: string = "Dori AI Premium Subscription"
): Promise<CreateOrderResult> {
  const accessToken = await getAccessToken();

  const baseUrl = process.env.EXPO_PUBLIC_DOMAIN 
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` 
    : "http://localhost:5000";

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "PayPal-Request-Id": `order-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
          description,
        },
      ],
      application_context: {
        brand_name: "Dori AI - דורי AI",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${baseUrl}/api/payments/success`,
        cancel_url: `${baseUrl}/api/payments/cancel`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PayPal order: ${error}`);
  }

  const order = await response.json();
  const approvalLink = order.links?.find((link: any) => link.rel === "approve");

  if (!approvalLink?.href) {
    throw new Error("No approval URL in PayPal response");
  }

  return {
    orderId: order.id,
    approvalUrl: approvalLink.href,
  };
}

export async function captureOrder(orderId: string): Promise<CaptureOrderResult> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to capture PayPal order: ${error}`);
  }

  const order = await response.json();

  return {
    orderId: order.id,
    status: order.status,
    payerId: order.payer?.payer_id || "",
    payerEmail: order.payer?.email_address || "",
  };
}

export async function getOrderDetails(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PayPal order: ${error}`);
  }

  return response.json();
}

export function isPayPalConfigured(): boolean {
  return !!(clientId && clientSecret);
}
