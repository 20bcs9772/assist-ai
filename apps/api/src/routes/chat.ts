import { Hono, type Context } from "hono";
import { handleChat } from "../controllers/chat.js";

const chat = new Hono();

chat.post("/messages", handleChat);

export default chat;
