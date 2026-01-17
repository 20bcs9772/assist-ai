import { prisma } from "../config/database.js";

class OrderService {
  async createOrder(
    placedBy: string,
    items: {
      name: string;
      qty: number;
    }[],
  ) {
    if (!placedBy) {
      return { success: false, error: "User name is required" };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "At least one item is required" };
    }

    const invalidItem = items.find((item) => !item.name || item.qty <= 0);

    if (invalidItem) {
      return {
        success: false,
        error: "Each item must have a valid name and quantity > 0",
      };
    }

    const order = await prisma.order.create({
      data: {
        placedBy,
        items,
      },
    });

    return {
      success: true,
      data: {
        orderId: order.id,
      },
    };
  }
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }
    return {
      success: true,
      data: order,
    };
  }
  async getOrderStatus(id: string) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    return {
      success: true,
      data: order.status,
    };
  }

  async getOrdersByUser(name: string) {
    const orderDetails = await prisma.order.findMany({
      where: { placedBy: name },
    });

    return {
      success: true,
      data: orderDetails,
    };
  }

  async cancelOrder(id: string, reason = "NA") {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });

    return {
      success: true,
      data: "Order cancelled successfully",
    };
  }

  async returnOrder(id: string, reason = "NA") {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }
    await prisma.order.update({
      where: { id },
      data: {
        status: "RETURNED",
        returnedAt: new Date(),
        returnReason: reason,
      },
    });
    return {
      success: true,
      data: "Return initiated successfully",
    };
  }
}

export default new OrderService();
