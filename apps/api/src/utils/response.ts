import "dotenv/config";
import { streamText, type ModelMessage } from "ai";

export function generateResponse({
  system,
  user,
  messages,
  onComplete,
}: {
  system: string;
  user: string;
  messages: ModelMessage[];
  onComplete?: (fullText: string) => Promise<void> | void;
}) {
  return streamText({
    model: "openai/gpt-4o-mini",
    system,
    // prompt: user,
    messages,
    async onFinish({ text }) {
      if (onComplete) {
        await onComplete(text);
      }
    },
  });
}
