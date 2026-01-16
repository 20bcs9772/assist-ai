import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import chat from "./routes/chat.js";

const app = new Hono();

app.use("*", cors());

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/chat", chat);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
