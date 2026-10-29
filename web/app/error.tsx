"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const retry = reset; 

  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="text-xl font-bold text-red-700">Афиша недоступна</h1>
      <p className="my-2">MCP-сервер не отвечает. Запустите его и нажмите «Повторить».</p>
      <button
        onClick={() => retry()}
        className="rounded bg-indigo-600 px-4 py-2 text-white"
      >
        Повторить
      </button>
    </main>
  );
}