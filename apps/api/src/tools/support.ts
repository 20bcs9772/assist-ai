import { z } from "zod";
import chatService from "../services/chat.js";

export const supportTools = {
  get_chat_by_id: {
    description: "Get full chat details using chat ID",
    inputSchema: z.object({
      chatId: z.string().describe("The chat ID"),
    }),
    execute: async ({ chatId }: { chatId: string }) => {
      return await chatService.getChatById(chatId);
    },
  },
  get_chats_by_name: {
    description: "Get all chats for a user by name",
    inputSchema: z.object({
      name: z.string().describe("User name"),
    }),
    execute: async ({ name }: { name: string }) => {
      return await chatService.getChatsByName(name);
    },
  },
  get_all_chats: {
    description: "Get all chats in the system",
    inputSchema: z.object({}),
    execute: async () => {
      return await chatService.getAllChats();
    },
  },
};
