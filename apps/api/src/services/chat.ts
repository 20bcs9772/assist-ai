import { prisma } from "../config/database.js";

class ChatService {
  async getChatById(id: string) {
    const chatDetails = await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          select: {
            role: true,
            content: true,
            agentType: true,
          },
        },
      },
    });

    if (!chatDetails) {
      throw new Error("Chat not found");
    }

    return chatDetails;
  }

  async createChat(name: string, message: string) {
    const chat = await prisma.chat.create({
      data: {
        name,
      },
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
        content: message,
        role: "USER",
      },
    });

    return await prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        messages: {
          select: {
            role: true,
            content: true,
            agentType: true,
          },
        },
      },
    });
  }

  async createMessageForChat(
    id: string,
    message: string,
    role: "USER" | "AGENT" = "USER",
    agentType?: "SUPPORT" | "ORDER" | "BILLING"
  ) {
    const chatDetails = await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          select: {
            role: true,
            content: true,
            agentType: true,
          },
        },
      },
    });

    if (!chatDetails) {
      throw new Error("Chat not found");
    }

    await prisma.message.create({
      data: {
        chatId: chatDetails.id,
        content: message,
        role,
        ...(agentType && { agentType }),
      },
    });
  }
}

export default new ChatService();
