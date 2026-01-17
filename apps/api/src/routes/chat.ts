import { Hono } from "hono";
import { handleChat } from "../controllers/chat.js";
import conversations from "./conversations.js";

const chat = new Hono();

chat.post("/messages", handleChat);
chat.route("/conversations", conversations);

export default chat;
