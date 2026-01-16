import chatService from "../services/chat.js";
import { mapChatToLLMMessages } from "../utils/helper.js";
import { generateResponse } from "../utils/response.js";

export async function supportAgent(
  input: string,
  name: string,
  id: string = ""
) {
  let chatDetails: any = {};

  if (id) {
    await chatService.createMessageForChat(id, input);
    chatDetails = await chatService.getChatById(id);
  } else {
    chatDetails = await chatService.createChat(name, input);
  }

  const messages = mapChatToLLMMessages(chatDetails.messages);

  return generateResponse({
    system:
      "You are a customer support assistant. Be clear, helpful, and concise.",
    user: input,
    messages,
    async onComplete(response) {
      await chatService.createMessageForChat(id, response, "AGENT", "SUPPORT");
    },
  });
}
