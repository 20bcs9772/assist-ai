import { z } from "zod";
import billingService from "../services/billing.js";

export const billingTools = {
  create_payment: {
    description: "Create a new payment for an order",
    inputSchema: z.object({
      orderId: z
        .string()
        .describe("The order ID for which payment is being made"),
      amount: z.number().min(0.01).describe("Payment amount"),
      mode: z.enum(["CARD", "UPI", "NET_BANKING"]).describe("Payment mode"),
      currency: z.string().optional().describe("Currency code (default: INR)"),
    }),
    execute: async ({
      orderId,
      amount,
      mode,
      currency,
    }: {
      orderId: string;
      amount: number;
      mode: "CARD" | "UPI" | "NET_BANKING";
      currency?: string;
    }) => {
      return await billingService.createPayment(
        orderId,
        amount,
        mode,
        currency,
      );
    },
  },
  payment_status: {
    description: "Get the status of a payment",
    inputSchema: z.object({
      paymentId: z.string().describe("The payment ID"),
    }),
    execute: async ({ paymentId }: { paymentId: string }) => {
      return await billingService.getPaymentStatus(paymentId);
    },
  },
  payment_details: {
    description: "Get the details of a payment by payment ID",
    inputSchema: z.object({
      paymentId: z.string().describe("The payment ID"),
    }),
    execute: async ({ paymentId }: { paymentId: string }) => {
      return await billingService.getPaymentById(paymentId);
    },
  },
  user_payments: {
    description: "Get all payments for a user",
    inputSchema: z.object({
      name: z.string().describe("The user name"),
    }),
    execute: async ({ name }: { name: string }) => {
      return await billingService.getPaymentsByUser(name);
    },
  },
  refund_payment: {
    description: "Refund a payment",
    inputSchema: z.object({
      paymentId: z.string().describe("The payment ID to refund"),
    }),
    execute: async ({ paymentId }: { paymentId: string }) => {
      return await billingService.refundPayment(paymentId);
    },
  },
  order_payments: {
    description: "Get all payments for an order",
    inputSchema: z.object({
      orderId: z.string().describe("The order ID"),
    }),
    execute: async ({ orderId }: { orderId: string }) => {
      return await billingService.getPaymentsByOrder(orderId);
    },
  },
};
