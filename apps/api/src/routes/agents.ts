import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AgentTypeSchema } from "../types/schemas.js";
import { orderTools } from "../tools/order.js";
import { billingTools } from "../tools/billing.js";
import { supportTools } from "../tools/support.js";

const agents = new Hono();

const agentCapabilities = {
  SUPPORT: {
    type: "SUPPORT",
    description: "General customer support assistant",
    capabilities: [
      "Answer general questions",
      "Provide FAQs",
      "Help with account issues",
      "General assistance",
    ],
    tools: Object.keys(supportTools),
  },
  ORDER: {
    type: "ORDER",
    description: "Order management assistant",
    capabilities: [
      "Create orders",
      "Check order status",
      "Get order details",
      "Cancel orders",
      "Return orders",
      "View user orders",
      "Get payment details for orders",
    ],
    tools: Object.keys(orderTools),
  },
  BILLING: {
    type: "BILLING",
    description: "Billing and payment assistant",
    capabilities: [
      "Create payments",
      "Check payment status",
      "Get payment details",
      "Refund payments",
      "View user payments",
      "Get payments for orders",
      "Get order details from payments",
    ],
    tools: Object.keys(billingTools),
  },
};

agents.get("/", async (c) => {
  return c.json({
    success: true,
    data: Object.values(agentCapabilities).map(
      ({ type, description, capabilities }) => ({
        type,
        description,
        capabilities,
      })
    ),
  });
});

agents.get(
  "/:type/capabilities",
  zValidator("param", z.object({ type: AgentTypeSchema })),
  async (c) => {
    const { type } = c.req.valid("param");
    const agent = agentCapabilities[type];

    if (!agent) {
      return c.json({ success: false, error: "Agent not found" }, 404);
    }

    return c.json({ success: true, data: agent });
  }
);

export default agents;
