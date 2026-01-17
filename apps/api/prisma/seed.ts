import { prisma } from "../src/config/database.js";


async function main() {
  const users = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  const orders = [];
  for (let i = 0; i < 10; i++) {
    const order = await prisma.order.create({
      data: {
        placedBy: users[i % users.length],
        items: [
          { name: `Product ${i + 1}`, qty: Math.floor(Math.random() * 5) + 1 },
          { name: `Product ${i + 2}`, qty: Math.floor(Math.random() * 3) + 1 },
        ],
        status: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"][
          Math.floor(Math.random() * 5)
        ] as any,
      },
    });
    orders.push(order);
  }

  const payments = [];
  for (let i = 0; i < 8; i++) {
    const order = orders[i % orders.length];
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: Math.floor(Math.random() * 10000) + 100,
        mode: ["CARD", "UPI", "NET_BANKING"][Math.floor(Math.random() * 3)] as any,
        status: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"][
          Math.floor(Math.random() * 4)
        ] as any,
      },
    });
    payments.push(payment);
  }

  const agentTypes = ["SUPPORT", "ORDER", "BILLING"] as const;
  const sampleMessages = [
    "Hello, I need help with my order",
    "What is the status of my payment?",
    "I want to cancel my order",
    "Can you help me with a refund?",
    "I have a question about my account",
    "How do I track my shipment?",
    "I need to update my payment method",
    "What are your return policies?",
  ];

  for (let i = 0; i < 12; i++) {
    const chat = await prisma.chat.create({
      data: {
        name: users[i % users.length],
      },
    });

    const numMessages = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < numMessages; j++) {
      const isUser = j % 2 === 0;
      const agentType = isUser
        ? null
        : agentTypes[Math.floor(Math.random() * agentTypes.length)];

      await prisma.message.create({
        data: {
          chatId: chat.id,
          role: isUser ? "USER" : "AGENT",
          content: isUser
            ? sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
            : `Agent response ${j + 1} for chat ${i + 1}`,
          agentType: agentType || undefined,
        },
      });
    }

    const agentAction = await prisma.agentAction.create({
      data: {
        chatId: chat.id,
        agentType: agentTypes[Math.floor(Math.random() * agentTypes.length)],
        action: `Action performed in chat ${i + 1}`,
        metadata: { timestamp: new Date().toISOString() },
      },
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

