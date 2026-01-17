import type { Context, Next } from "hono";

const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 100;

function getClientId(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : c.req.header("x-real-ip") || "unknown";
  return ip;
}

export async function rateLimit(c: Context, next: Next) {
  const clientId = getClientId(c);
  const now = Date.now();

  const clientData = requestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return next();
  }

  if (clientData.count >= MAX_REQUESTS) {
    return c.json(
      { error: "Too many requests. Please try again later." },
      429
    );
  }

  clientData.count++;
  return next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

