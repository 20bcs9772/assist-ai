import "dotenv/config";
import { stepCountIs, streamText, type ModelMessage } from "ai";
import chatService from "../services/chat.js";
import { billingTools } from "../tools/billingTools.js";

export async function billingAgent(messages: ModelMessage[], id: string) {
  return streamText({
    model: "openai/gpt-4o-mini",
    system: `
You are a billing support assistant.
If a tool returns success=false, explain the error to the user
and ask for missing or correct information.
Use html break lines to make the response more readable.
`,
    messages,
    tools: billingTools,
    stopWhen: stepCountIs(2),
    async onFinish({ text }) {
      await chatService.createMessageForChat(id, text, "AGENT", "BILLING");
    },
  });
}
