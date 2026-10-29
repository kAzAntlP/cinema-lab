import "server-only";
import { createMCPClient } from "@ai-sdk/mcp";

// Один клиент на один запрос: открыть, поработать, закрыть
export async function openMcp() {
  const url = process.env.MCP_URL ?? "http://127.0.0.1:8000/mcp";
  return createMCPClient({ transport: { type: "http", url } });
}