"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/lab", label: "Lab" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/45 backdrop-blur-xl">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:text-indigo-300 transition-colors duration-300">
          Hd.
        </Link>
        <ul className="flex gap-6 text-sm font-medium text-neutral-300">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`hover:text-white transition-colors duration-300 ${
                  link.href === "/"
                    ? pathname === "/"
                      ? "text-white"
                      : ""
                    : pathname.startsWith(link.href)
                    ? "text-white"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
