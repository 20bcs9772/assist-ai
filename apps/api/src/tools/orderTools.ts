import { z } from "zod";
import orderService from "../services/order.js";
import billingService from "../services/billing.js";

export const orderTools = {
  create_order: {
    description: "Create a new order",
    inputSchema: z.object({
      name: z.string().describe("Name of the user placing the order"),
      items: z.array(
        z.object({
          name: z.string(),
          qty: z.number().min(1),
        }),
      ),
    }),
    execute: async ({
      name,
      items,
    }: {
      name: string;
      items: { name: string; qty: number }[];
    }) => {
      return await orderService.createOrder(name, items);
    },
  },
  order_status: {
    description: "Get the status of an order",
    inputSchema: z.object({
      orderId: z.string().describe("The order ID"),
    }),
    execute: async ({ orderId }: { orderId: string }) => {
      return await orderService.getOrderStatus(orderId);
    },
  },
  order_details: {
    description: "Get the details of an order by order Id",
    inputSchema: z.object({
      orderId: z.string().describe("The order ID"),
    }),
    execute: async ({ orderId }: { orderId: string }) => {
      return await orderService.getOrderById(orderId);
    },
  },
  user_orders: {
    description: "Get the details of all orders of a user",
    inputSchema: z.object({
      name: z.string().describe("The user name"),
    }),
    execute: async ({ name }: { name: string }) => {
      return await orderService.getOrdersByUser(name);
    },
  },
  cancel_order: {
    description: "Cancel an order",
    inputSchema: z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }),
    execute: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => {
      return await orderService.cancelOrder(orderId, reason);
    },
  },
  return_order: {
    description: "Return an order",
    inputSchema: z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }),
    execute: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => {
      return await orderService.returnOrder(orderId, reason);
    },
  },
  payment_order: {
    description: "Get order details from a payment ID",
    inputSchema: z.object({
      paymentId: z.string().describe("The payment ID"),
    }),
    execute: async ({ paymentId }: { paymentId: string }) => {
      const payment = await billingService.getPaymentById(paymentId);
      if (!payment.success || !payment.data) {
        return payment;
      }
      return await orderService.getOrderById(payment?.data?.order?.id);
    },
  },
};
