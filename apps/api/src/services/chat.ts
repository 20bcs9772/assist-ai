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

  async getAllChats() {
    const chats = await prisma.chat.findMany({
      include: {
        messages: {
          select: {
            role: true,
            content: true,
            agentType: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chats;
  }

  async deleteChat(id: string) {
    const chat = await prisma.chat.findUnique({ where: { id } });

    if (!chat) {
      throw new Error("Chat not found");
    }

    await prisma.chat.delete({
      where: { id },
    });

    return { success: true };
  }
}

export default new ChatService();
