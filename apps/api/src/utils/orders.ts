import { generateText, Output } from "ai";
import { z } from "zod";

const OrderActionSchema = z.object({
  action: z.enum([
    "cancel_order",
    "return_order",
    "order_status",
    "order_details",
    "unknown",
  ]),
  orderId: z.string().nullable(),
  reason: z.string().nullable(),
});

export type OrderAction = z.infer<typeof OrderActionSchema>;

export async function parseOrderAction(message: string) {
  const result = await generateText({
    model: "openai/gpt-4o-mini",
    system: "You need to extract structured order intent from user messages.",
    prompt: `User message: "${message}"`,
    output: Output.object({
      schema: OrderActionSchema,
      name: "order_action",
      description: "Parsed order intent from user message",
    }),
  });

  return result.output;
}
