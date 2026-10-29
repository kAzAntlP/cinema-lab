import type { Metadata } from "next";
import Link from "next/link";
import NavLinks from "../components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "Кинотеатр «Луч»",
  description: "Афиша и ассистент администратора кинотеатра",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 p-4">
            <Link href="/" className="text-lg font-bold">
              Кинотеатр «Луч»
            </Link>
            <NavLinks />
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}