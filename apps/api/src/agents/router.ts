import "dotenv/config";
import { generateText, Output } from "ai";

export async function routerAgent(message: string) {
  const result = await generateText({
    model: "openai/gpt-4o-mini",
    system: `
You are an intent router for a customer support system.

Classify the user's message into exactly ONE of these categories:

SUPPORT:
- General help
- Confusion
- FAQs
- Questions not related to orders or payments

ORDER:
- Order status
- Creating orders
- Cancelling or returning orders
- Order details
- Shipping or delivery questions

BILLING:
- Payments
- Refunds
- Charges


Return ONLY the category name.
`,
    prompt: message,
    output: Output.choice({
      options: ["SUPPORT", "ORDER", "BILLING"],
      name: "agent_route",
    }),
    temperature: 0,
  });

  return result.output;
}
