import type { ModelMessage } from "ai";

export function mapChatToLLMMessages(
  messages: {
    role: "USER" | "AGENT";
    content: string;
  }[]
): ModelMessage[] {
  return messages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));
}
