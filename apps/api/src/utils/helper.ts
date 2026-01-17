import type { ModelMessage } from "ai";

export function mapChatToLLMMessages(
  messages: {
    role: "USER" | "AGENT";
    content: string;
  }[],
  userName: string,
): ModelMessage[] {
  const systemMessage: ModelMessage = {
    role: "system",
    content: `User's name is ${userName}`,
  };

  const chatMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  return [systemMessage, ...chatMessages];
}
