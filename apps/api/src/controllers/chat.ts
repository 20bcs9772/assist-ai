import type { Context } from "hono";
import { routerAgent } from "../agents/router.js";
import { supportAgent } from "../agents/support.js";
import { orderAgent } from "../agents/order.js";
import { billingAgent } from "../agents/billing.js";
import chatService from "../services/chat.js";
import { mapChatToLLMMessages } from "../utils/helper.js";
import { ChatMessageSchema } from "../types/schemas.js";

export async function handleChat(c: Context) {
  const body = await c.req.json();
  const validation = ChatMessageSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, error: "Invalid request body" }, 400);
  }

  const { message, name, id = "" } = validation.data;

  const route = await routerAgent(message);
  let stream;
  let chatDetails: any = {};

  if (id) {
    await chatService.createMessageForChat(id, message);
    chatDetails = await chatService.getChatById(id);
  } else {
    chatDetails = await chatService.createChat(name, message);
  }

  const messages = mapChatToLLMMessages(chatDetails.messages, name);

  switch (route) {
    case "ORDER":
      stream = await orderAgent(messages, chatDetails.id);
      break;
    case "BILLING":
      stream = await billingAgent(messages, chatDetails.id);
      break;
    default:
      stream = await supportAgent(messages, chatDetails.id);
      break;
  }

  return stream.toTextStreamResponse({
    headers: {
      "x-chat-id": chatDetails.id,
      "Access-Control-Expose-Headers": "x-chat-id",
    },
  });
}
