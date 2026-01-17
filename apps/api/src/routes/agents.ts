import { Hono } from "hono";
import { AgentTypeSchema } from "../types/schemas.js";
import { orderTools } from "../tools/orderTools.js";
import { billingTools } from "../tools/billingTools.js";

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
    tools: [],
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
    data: Object.values(agentCapabilities).map(({ type, description, capabilities }) => ({
      type,
      description,
      capabilities,
    })),
  });
});

agents.get("/:type/capabilities", async (c) => {
  const { type } = c.req.param();
  const validation = AgentTypeSchema.safeParse(type);

  if (!validation.success) {
    return c.json({ success: false, error: "Invalid agent type" }, 400);
  }

  const agent = agentCapabilities[validation.data];
  if (!agent) {
    return c.json({ success: false, error: "Agent not found" }, 404);
  }

  return c.json({ success: true, data: agent });
});

export default agents;

