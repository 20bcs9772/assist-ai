import { API_URL } from "../../config/api.js";

export interface StreamChunk {
  type: "thinking" | "content" | "done" | "error";
  data?: string;
}

export async function* streamChatMessage(
  message: string,
  name: string,
  chatId?: string,
): AsyncGenerator<StreamChunk, void, unknown> {
  const url = `${API_URL}/api/chat/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      name,
      id: chatId ?? "",
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to stream message" }));
    yield { type: "error", data: error.error || "Failed to stream message" };
    return;
  }

  const chatIdHeader = response.headers.get("x-chat-id");
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    yield { type: "error", data: "No response body" };
    return;
  }

  let buffer = "";
  let thinkingShown = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer.trim()) {
          yield { type: "content", data: buffer };
        }
        yield { type: "done", data: chatIdHeader || undefined };
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      if (!thinkingShown) {
        thinkingShown = true;
        yield { type: "thinking", data: "" };
      }

      if (buffer.length > 0) {
        const content = buffer;
        buffer = "";
        yield { type: "content", data: content };
      }
    }
  } catch (error) {
    yield {
      type: "error",
      data: error instanceof Error ? error.message : "Stream error",
    };
  } finally {
    reader.releaseLock();
  }
}
