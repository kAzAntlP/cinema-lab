import { openMcp } from "../lib/mcp";

// Страница строится на каждый запрос: брони меняются в чате
export const dynamic = "force-dynamic";

type Session = {
  day: string;
  time: string;
  film: string;
  hall: number;
  seats: number;
  free: number;
};

// Читает ресурс afisha://week без участия модели
async function loadAfisha(): Promise<Session[]> {
  const mcp = await openMcp();
  try {
    const res = await mcp.readResource({ uri: "afisha://week" });
    const first = res.contents[0];
    return typeof first?.text === "string" ? JSON.parse(first.text) : [];
  } finally {
    await mcp.close();
  }
}

export default async function AfishaPage() {
  const sessions = await loadAfisha();
  const days = [...new Set(sessions.map((s) => s.day))];
  
  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Афиша на неделю</h1>
      {days.map((day) => (
        <section key={day} className="mb-6">
          <h2 className="mb-2 text-lg font-semibold capitalize">{day}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sessions
              .filter((s) => s.day === day)
              .map((s) => (
                <li
                  key={s.time + s.film}
                  className={`rounded-lg border p-4 ${
                    s.free === 0
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-semibold">{s.time} — {s.film}</p>
                  <p className="text-sm text-slate-600">Зал {s.hall}</p>
                  <p className="text-sm">
                    {s.free === 0 ? "Мест нет" : `Свободно ${s.free} из ${s.seats}`}
                  </p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}