import { z } from "zod";
import orderService from "../services/order.js";

export const orderTools = {
  order_status: {
    description: "Get the status of an order",
    inputSchema: z.object({
      orderId: z.string().describe("The order ID"),
    }),
    execute: async ({ orderId }) => {
      return await getOrderStatus(orderId);
    },
  },

  cancel_order: {
    description: "Cancel an order",
    inputSchema: z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }),
    execute: async ({ orderId, reason }) => {
      return await cancelOrder(orderId, reason);
    },
  },

  return_order: {
    description: "Create a return request",
    inputSchema: z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }),
    execute: async ({ orderId, reason }) => {
      return await createReturn(orderId, reason);
    },
  },
};
