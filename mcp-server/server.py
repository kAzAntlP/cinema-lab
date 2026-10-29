"""MCP-сервер кинотеатра «Луч»: афиша на неделю и бронь билетов."""

import json
import logging
import sys
from typing import Annotated

from pydantic import Field

from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

# Журнал — в поток ошибок, а не в print (раздел 3.3 курса)
logging.basicConfig(stream=sys.stderr, level=logging.INFO)

mcp = MCPServer("Кинотеатр «Луч»")

DAYS = ["понедельник", "вторник", "среда", "четверг",
        "пятница", "суббота", "воскресенье"]

# Афиша на неделю. Брони живут в памяти процесса:
# после перезапуска сервера они пропадают.
SESSIONS = [
    {"day": "пятница", "time": "19:00", "film": "Дюна",
     "hall": 1, "seats": 4},
    {"day": "пятница", "time": "21:30", "film": "Интерстеллар",
     "hall": 2, "seats": 6},
    {"day": "суббота", "time": "12:00", "film": "Чебурашка",
     "hall": 1, "seats": 8},
    {"day": "суббота", "time": "18:00", "film": "Дюна",
     "hall": 2, "seats": 2},
    {"day": "воскресенье", "time": "15:00", "film": "Чебурашка",
     "hall": 2, "seats": 5},
    {"day": "воскресенье", "time": "20:00", "film": "Интерстеллар",
     "hall": 1, "seats": 3},
]

# Брони: номер сеанса в списке -> {имя клиента: число билетов}
BOOKINGS: dict[int, dict[str, int]] = {
    i: {} for i in range(len(SESSIONS))
}


def check_day(day: str) -> str:
    """Приводит день к виду из DAYS или отказывает с подсказкой."""
    day = day.strip().lower()
    if day not in DAYS:
        raise ToolError(f"Неизвестный день «{day}». "
                        f"Допустимо: {', '.join(DAYS)}.")
    return day


def find_session(day: str, film: str) -> int:
    """Номер сеанса по дню и названию фильма."""
    day = check_day(day)
    title = film.strip(" «»\"").lower()
    for i, s in enumerate(SESSIONS):
        if s["day"] == day and s["film"].lower() == title:
            return i
    films = [s["film"] for s in SESSIONS if s["day"] == day]
    raise ToolError(f"Фильма «{film}» нет в афише на день «{day}». "
                    f"В этот день: {', '.join(films) or 'ничего'}.")


def free_seats(i: int) -> int:
    return SESSIONS[i]["seats"] - sum(BOOKINGS[i].values())


def with_free(i: int) -> dict:
    return {**SESSIONS[i], "free": free_seats(i)}


@mcp.tool()
def list_sessions(day: str) -> list[dict]:
    """Сеансы на день недели со свободными местами.

    day — день недели по-русски: «пятница», «суббота».
    """
    day = check_day(day)
    return [with_free(i) for i, s in enumerate(SESSIONS)
            if s["day"] == day]


@mcp.tool()
def book_tickets(
    day: str,
    film: str,
    client_name: str,
    count: Annotated[int, Field(ge=1, le=6)] = 1,
) -> str:
    """Бронирует билеты на сеанс.

    day — день недели, film — название фильма из афиши,
    client_name — имя клиента в именительном падеже,
    count — число билетов, от 1 до 6.
    """
    i = find_session(day, film)
    name = client_name.strip()
    if not name:
        raise ToolError("Укажите имя клиента.")
    if name in BOOKINGS[i]:
        raise ToolError(f"У клиента {name} уже есть бронь "
                        "на этот сеанс. Сначала отмените её.")
    free = free_seats(i)
    if free == 0:
        raise ToolError("На этот сеанс свободных мест нет.")
    if count > free:
        raise ToolError(f"Свободно мест: {free}, запрошено: {count}.")
    BOOKINGS[i][name] = count
    s = SESSIONS[i]
    return (f"Бронь: {name}, «{s['film']}», {s['day']} {s['time']}, "
            f"зал {s['hall']}, билетов: {count}.")


@mcp.tool()
def cancel_booking(day: str, film: str, client_name: str) -> str:
    """Отменяет бронь клиента на сеанс.

    day — день недели, film — название фильма,
    client_name — имя клиента в именительном падеже.
    """
    i = find_session(day, film)
    name = client_name.strip()
    if name not in BOOKINGS[i]:
        raise ToolError(f"У клиента {name} нет брони на этот сеанс.")
    count = BOOKINGS[i].pop(name)
    return f"Бронь {name} отменена, освобождено мест: {count}."


@mcp.resource("afisha://week")
def afisha() -> str:
    """Афиша на неделю со свободными местами, JSON."""
    rows = [with_free(i) for i in range(len(SESSIONS))]
    return json.dumps(rows, ensure_ascii=False)


if __name__ == "__main__":
    mcp.run(transport="streamable-http")