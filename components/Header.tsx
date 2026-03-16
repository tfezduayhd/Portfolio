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
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:text-indigo-400 transition-colors">
          ik.
        </Link>
        <ul className="flex gap-6 text-sm font-medium text-neutral-400">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`hover:text-neutral-100 transition-colors ${
                  link.href === "/"
                    ? pathname === "/"
                      ? "text-neutral-100"
                      : ""
                    : pathname.startsWith(link.href)
                    ? "text-neutral-100"
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
