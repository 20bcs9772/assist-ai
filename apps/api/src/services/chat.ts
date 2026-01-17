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
            createdAt: true,
          },
        },
      },
    });

    if (!chatDetails) {
      return {
        success: false,
        error: "Chat not found",
      };
    }

    return {
      success: true,
      data: chatDetails,
    };
  }

  async getChatsByName(name: string) {
    const chats = await prisma.chat.findMany({
      where: { name },
      include: {
        messages: {
          select: {
            role: true,
            content: true,
            agentType: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      success: true,
      data: chats,
    };
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

    return {
      success: true,
      data: chats,
    };
  }

  async createChat(name: string, message: string) {
    if (!name || !message) {
      return {
        success: false,
        error: "Name and message are required",
      };
    }

    const chat = await prisma.chat.create({
      data: { name },
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
        content: message,
        role: "USER",
      },
    });

    const fullChat = await prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        messages: {
          select: {
            role: true,
            content: true,
            agentType: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      success: true,
      data: fullChat,
    };
  }

  async createMessageForChat(
    id: string,
    message: string,
    role: "USER" | "AGENT" = "USER",
    agentType?: "SUPPORT" | "ORDER" | "BILLING"
  ) {
    const chat = await prisma.chat.findUnique({ where: { id } });

    if (!chat) {
      return {
        success: false,
        error: "Chat not found",
      };
    }

    await prisma.message.create({
      data: {
        chatId: id,
        content: message,
        role,
        ...(agentType && { agentType }),
      },
    });

    return {
      success: true,
    };
  }

  async deleteChat(id: string) {
    const chat = await prisma.chat.findUnique({ where: { id } });

    if (!chat) {
      return {
        success: false,
        error: "Chat not found",
      };
    }

    await prisma.chat.delete({ where: { id } });

    return {
      success: true,
      data: "Chat deleted successfully",
    };
  }
}

export default new ChatService();
