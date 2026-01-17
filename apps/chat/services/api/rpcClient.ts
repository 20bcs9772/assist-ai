import { hc } from "hono/client";
import type { AppType } from "@api/index.js";
import { API_URL } from "../../config/api.js";

// Create typed RPC client
export const rpcClient = hc<AppType>(API_URL);

