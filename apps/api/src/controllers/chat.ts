import type { Context } from "hono";
import { routerAgent } from "../agents/router.js";
import { supportAgent } from "../agents/support.js";
import { orderAgent } from "../agents/order.js";
import { billingAgent } from "../agents/billing.js";
import chatService from "../services/chat.js";
import { mapChatToLLMMessages } from "../utils/helper.js";
import { ChatMessageSchema } from "../types/schemas.js";

export async function handleChat(c: Context) {
  try {
    const body = await c.req.json();
    const validation = ChatMessageSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ success: false, error: "Invalid request body" }, 400);
    }

    const { message, name, id = "" } = validation.data;

    let stream;
    let chatDetails: any;

    if (id) {
      const messageResult = await chatService.createMessageForChat(id, message);

      if (messageResult.success) {
        const chatResult = await chatService.getChatById(id);
        chatDetails = chatResult.data;
      } else {
        const newChatResult = await chatService.createChat(name, message);
        chatDetails = newChatResult.data;
      }
    } else {
      const newChatResult = await chatService.createChat(name, message);
      chatDetails = newChatResult.data;
    }

    const route = await routerAgent(message);
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
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Something went wrong while processing the chat",
      },
      500
    );
  }
}
