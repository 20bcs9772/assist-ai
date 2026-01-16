import { prisma } from "../config/database.js";

class OrderService {
  async getOrderById(id: string) {
    const orderDetails = await prisma.order.findUnique({
      where: { id },
    });

    if (!orderDetails) {
      throw new Error("Order not found");
    }

    return orderDetails;
  }

  async getOrdersByUser(name: string) {
    const orderDetails = await prisma.order.findMany({
      where: { placedBy: name },
    });

    return orderDetails;
  }

  async cancelOrder(id: string, reason: string | null = "NA") {
    const orderDetails = await prisma.order.findUnique({
      where: { id },
    });

    if (!orderDetails) {
      throw new Error("Order not found");
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(Date.now()),
        cancelReason: reason,
      },
    });
  }

  async returnOrder(id: string, reason: string | null = "NA") {
    const orderDetails = await prisma.order.findUnique({
      where: { id },
    });

    if (!orderDetails) {
      throw new Error("Order not found");
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: "RETURNED",
        returnedAt: new Date(Date.now()),
        returnReason: reason,
      },
    });
  }
}

export default new OrderService();
