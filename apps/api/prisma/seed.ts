import { prisma } from "../src/config/database.js";

const users = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

const orderStatuses = [
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

const paymentModes = ["CARD", "UPI", "NET_BANKING"] as const;
const paymentStatuses = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"] as const;

const agentTypes = ["SUPPORT", "ORDER", "BILLING"] as const;

/* ----------------- Helper generators ----------------- */

function userOrderMessage(orderId: string) {
  return [
    `Hi, can you tell me the status of my order ${orderId}?`,
    `I placed an order (${orderId}) but haven’t received any update.`,
    `Can you help me with order ${orderId}?`,
  ];
}

function userPaymentMessage(paymentId: string) {
  return [
    `My payment ${paymentId} is stuck. Can you check?`,
    `I was charged but payment ${paymentId} still shows pending.`,
    `What’s the status of my payment ${paymentId}?`,
  ];
}

function supportReply(name: string) {
  return `Hi ${name}, I’m here to help 🙂 Please share a bit more detail so I can assist you better.`;
}

function orderReply(orderId: string, status: string) {
  switch (status) {
    case "PENDING":
      return `Your order ${orderId} is currently pending and is being processed. You’ll receive an update soon.`;
    case "SHIPPED":
      return `Good news! Your order ${orderId} has been shipped and is on the way 🚚`;
    case "DELIVERED":
      return `Your order ${orderId} has been delivered successfully. Hope you enjoy it!`;
    case "CANCELLED":
      return `Order ${orderId} was cancelled. If you didn’t request this, I can help investigate.`;
    case "RETURNED":
      return `The return for order ${orderId} has been initiated. Refund details will be shared shortly.`;
    default:
      return `I’ve checked order ${orderId}. Let me know how else I can help.`;
  }
}

function billingReply(paymentId: string, status: string) {
  switch (status) {
    case "SUCCESS":
      return `Payment ${paymentId} was successful ✅ Your order is confirmed.`;
    case "PENDING":
      return `Payment ${paymentId} is still pending. This can take a few minutes depending on the bank.`;
    case "FAILED":
      return `Payment ${paymentId} failed ❌ No amount was deducted. You can retry safely.`;
    case "REFUNDED":
      return `Refund for payment ${paymentId} has been initiated. It should reflect in 3–5 business days.`;
    default:
      return `I’ve checked payment ${paymentId}. Let me know if you need help with anything else.`;
  }
}

/* ----------------- Seed logic ----------------- */

async function main() {
  /* -------- Orders -------- */
  const orders = [];
  for (let i = 0; i < 10; i++) {
    const order = await prisma.order.create({
      data: {
        placedBy: users[i % users.length],
        items: [
          { name: `Product ${i + 1}`, qty: Math.floor(Math.random() * 3) + 1 },
          { name: `Product ${i + 2}`, qty: Math.floor(Math.random() * 2) + 1 },
        ],
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      },
    });
    orders.push(order);
  }

  /* -------- Payments -------- */
  const payments = [];
  for (let i = 0; i < 8; i++) {
    const order = orders[i % orders.length];
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: Math.floor(Math.random() * 8000) + 500,
        mode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
        status:
          paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      },
    });
    payments.push(payment);
  }

  /* -------- Chats & Messages -------- */
  for (let i = 0; i < 12; i++) {
    const userName = users[i % users.length];
    const chat = await prisma.chat.create({
      data: { name: userName },
    });

    const order = orders[i % orders.length];
    const payment = payments[i % payments.length];

    // USER → AGENT (ORDER)
    const userMsg1 = userOrderMessage(order.id)[Math.floor(Math.random() * 3)];

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "USER",
        content: userMsg1,
      },
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "AGENT",
        agentType: "ORDER",
        content: orderReply(order.id, order.status),
      },
    });

    // USER → AGENT (BILLING)
    const userMsg2 = userPaymentMessage(payment.id)[
      Math.floor(Math.random() * 3)
    ];

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "USER",
        content: userMsg2,
      },
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "AGENT",
        agentType: "BILLING",
        content: billingReply(payment.id, payment.status),
      },
    });

    // SUPPORT follow-up
    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "AGENT",
        agentType: "SUPPORT",
        content: supportReply(userName),
      },
    });

    await prisma.agentAction.create({
      data: {
        chatId: chat.id,
        agentType: agentTypes[Math.floor(Math.random() * agentTypes.length)],
        action: "Handled user query",
        metadata: { seeded: true },
      },
    });
  }

  console.log("✅ Seeding completed with realistic agent conversations");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
