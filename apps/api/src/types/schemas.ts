import { z } from "zod";

export const ChatMessageSchema = z.object({
  message: z.string().min(1),
  name: z.string(),
  id: z.string().optional(),
});

export const ConversationIdSchema = z.object({
  id: z.string().uuid(),
});

export const AgentTypeSchema = z.enum(["SUPPORT", "ORDER", "BILLING"]);

export const CreateOrderSchema = z.object({
  name: z.string().min(1),
  items: z.array(
    z.object({
      name: z.string().min(1),
      qty: z.number().min(1),
    })
  ).min(1),
});

export const OrderIdSchema = z.object({
  orderId: z.string().uuid(),
});

export const CancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().optional(),
});

export const ReturnOrderSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().optional(),
});

export const CreatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().min(0.01),
  mode: z.enum(["CARD", "UPI", "NET_BANKING"]),
  currency: z.string().optional().default("INR"),
});

export const PaymentIdSchema = z.object({
  paymentId: z.string().uuid(),
});

export const UserNameSchema = z.object({
  name: z.string().min(1),
});

export const RefundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
});

