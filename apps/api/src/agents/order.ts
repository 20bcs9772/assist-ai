import chatService from "../services/chat.js";
import { mapChatToLLMMessages } from "../utils/helper.js";
import { parseOrderAction } from "../utils/orders.js";
import { generateResponse } from "../utils/response.js";
import orderService from "../services/order.js";

export async function orderAgent(input: string, name: string, id: string = "") {
  let chatDetails: any = {};

  if (id) {
    await chatService.createMessageForChat(id, input);
    chatDetails = await chatService.getChatById(id);
  } else {
    chatDetails = await chatService.createChat(name, input);
  }

  const messages = mapChatToLLMMessages(chatDetails.messages);

  const { action, orderId, reason } = await parseOrderAction(input);

  switch (action) {
    case "cancel_order":
      await orderService.cancelOrder(orderId as string, reason);
      break;
    case "return_order":
      await orderService.returnOrder(orderId as string, reason);
  }

  //   return generateResponse({
  //     system:
  //       "You are a customer support assistant. Be clear, helpful, and concise.",
  //     user: input,
  //     messages,
  //     async onComplete(response) {
  //       await chatService.createMessageForChat(id, response, "AGENT", "SUPPORT");
  //     },
  //   });
}
