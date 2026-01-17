import { prisma } from "../config/database.js";

class BillingService {
  async createPayment(
    orderId: string,
    amount: number,
    mode: "CARD" | "UPI" | "NET_BANKING",
    currency: string = "INR"
  ) {
    if (!orderId) {
      return { success: false, error: "Order ID is required" };
    }

    if (!amount || amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        currency,
        mode,
      },
    });

    return {
      success: true,
      data: {
        paymentId: payment.id,
      },
    };
  }

  async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    return {
      success: true,
      data: payment,
    };
  }

  async getPaymentStatus(id: string) {
    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    return {
      success: true,
      data: payment.status,
    };
  }

  async getPaymentsByUser(name: string) {
    const orders = await prisma.order.findMany({
      where: { placedBy: name },
      include: {
        payments: true,
      },
    });

    const allPayments = orders.flatMap((order) => order.payments);

    return {
      success: true,
      data: allPayments,
    };
  }

  async getPaymentsByOrder(orderId: string) {
    const payments = await prisma.payment.findMany({
      where: { orderId },
    });

    return {
      success: true,
      data: payments,
    };
  }

  async refundPayment(id: string) {
    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    if (payment.status === "REFUNDED") {
      return {
        success: false,
        error: "Payment has already been refunded",
      };
    }

    if (payment.status !== "SUCCESS") {
      return {
        success: false,
        error: "Only successful payments can be refunded",
      };
    }

    await prisma.payment.update({
      where: { id },
      data: {
        status: "REFUNDED",
      },
    });

    return {
      success: true,
      data: "Payment refunded successfully",
    };
  }
}

export default new BillingService();

