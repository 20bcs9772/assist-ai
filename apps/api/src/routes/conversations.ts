import { Hono } from "hono";
import { ConversationIdSchema } from "../types/schemas.js";
import chatService from "../services/chat.js";

const conversations = new Hono();

conversations.get("/", async (c) => {
  try {
    const result = await chatService.getAllChats();

    if (!result.success) {
      return c.json(
        { success: false, error: "Failed to fetch conversations" },
        500
      );
    }

    return c.json({ success: true, data: result.data });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch conversations" },
      500
    );
  }
});

conversations.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const validation = ConversationIdSchema.safeParse({ id });

    if (!validation.success) {
      return c.json({ success: false, error: "Invalid conversation ID" }, 400);
    }

    const result = await chatService.getChatById(validation.data.id);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 404);
    }

    return c.json({ success: true, data: result.data });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch conversation" },
      500
    );
  }
});

conversations.delete("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const validation = ConversationIdSchema.safeParse({ id });

    if (!validation.success) {
      return c.json({ success: false, error: "Invalid conversation ID" }, 400);
    }

    const result = await chatService.deleteChat(validation.data.id);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 404);
    }

    return c.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to delete conversation" },
      500
    );
  }
});

export default conversations;
