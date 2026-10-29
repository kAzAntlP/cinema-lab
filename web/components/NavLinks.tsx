"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Афиша" },
  { href: "/chat", label: "Ассистент" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex gap-4">
      {LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={
              pathname === link.href
                ? "font-semibold text-indigo-700"
                : "text-slate-600 hover:text-slate-900"
            }
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}