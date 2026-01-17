import "dotenv/config";
import { streamText, type ModelMessage } from "ai";
import chatService from "../services/chat.js";

export async function supportAgent(messages: ModelMessage[], id: string = "") {
  return streamText({
    model: "openai/gpt-4o-mini",
    system:
      "You are a customer support assistant. Be clear, helpful, and concise. Use html break lines to make the response more readable.",
    messages,
    async onFinish({ text }) {
      await chatService.createMessageForChat(id, text, "AGENT", "SUPPORT");
    },
  });
}
