import "dotenv/config";
import { stepCountIs, streamText, type ModelMessage } from "ai";
import chatService from "../services/chat.js";
import { orderTools } from "../tools/order.js";

export async function orderAgent(messages: ModelMessage[], id: string) {
  return streamText({
    model: "openai/gpt-4o-mini",
    system: `
You are an order support assistant.
If a tool returns success=false, explain the error to the user
and ask for missing or correct information.
Use html break lines to make the response more readable.
`,
    messages,
    tools: orderTools,
    stopWhen: stepCountIs(2),
    async onFinish({ text }) {
      await chatService.createMessageForChat(id, text, "AGENT", "ORDER");
    },
  });
}
