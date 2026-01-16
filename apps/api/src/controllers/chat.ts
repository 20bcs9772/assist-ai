import type { Context } from "hono";
import { routerAgent } from "../agents/router.js";
import { supportAgent } from "../agents/support.js";
import { orderAgent } from "../agents/order.js";

export async function handleChat(c: Context) {
  const { message, name, id = "" } = await c.req.json();

  const intent = routerAgent(message);

  const stream = await supportAgent(message, name, id);

  await orderAgent(message, name, id)

  return stream.toTextStreamResponse();
}
