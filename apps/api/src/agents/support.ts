import "dotenv/config";
import { stepCountIs, streamText, type ModelMessage } from "ai";
import chatService from "../services/chat.js";
import { supportTools } from "../tools/support.js";

export async function supportAgent(messages: ModelMessage[], id: string = "") {
  return streamText({
    model: "openai/gpt-4o-mini",
    system: `
You are a customer support assistant.

CRITICAL RULES:
- You must ALWAYS respond with a user-facing message.
- Even if tools return empty data, explain that clearly.
- Never end a response with only tool calls.
- If you cannot find relevant past chats, say so politely.
`,
    messages,
    tools: supportTools,
    stopWhen: stepCountIs(2),
    async onFinish({ text }) {
      await chatService.createMessageForChat(id, text, "AGENT", "SUPPORT");
    },
  });
}
