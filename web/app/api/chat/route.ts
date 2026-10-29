import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { ollama } from "ai-sdk-ollama";
import { openMcp } from "@/lib/mcp";

const SYSTEM = [
  "Ты администратор кинотеатра «Луч». Отвечай только по-русски.",
  "Для броней и вопросов об афише используй инструменты.",
  "День недели передавай в именительном падеже: «суббота».",
  "Имя клиента передавай в именительном падеже: «Петров».",
].join(" ");

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const mcp = await openMcp().catch(() => null);

  if (!mcp) {
    return new Response("MCP-сервер не запущен", { status: 503 });
  }

  const result = streamText({
    model: ollama(process.env.LLM_MODEL ?? "qwen3:4b"),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools: await mcp.tools(),
    stopWhen: stepCountIs(5),
    onFinish: () => mcp.close(),
    onError: () => mcp.close(),
  });

  return result.toUIMessageStreamResponse({
  onError: (error) => {
    console.error("ОШИБКА В ЧАТЕ:", error);
    return error instanceof Error ? error.message : String(error);
  },
});
}