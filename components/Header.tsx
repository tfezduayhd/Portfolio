"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Language, getLanguage, uiCopy, withLanguage } from "@/lib/i18n";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const language = getLanguage(searchParams.get("lang") ?? undefined);

  const copy = uiCopy[language];
  const navLinks = [
    { href: "/", label: copy.navHome },
    { href: "/projects", label: copy.navProjects },
    { href: "/lab", label: copy.navLab },
  ];
  const languageOptions: Language[] = ["fr", "en"];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/45 backdrop-blur-xl">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href={withLanguage("/", language)}
          className="text-lg font-semibold tracking-tight hover:text-indigo-300 transition-colors duration-300"
        >
          Hd.
        </Link>
        <div className="flex items-center gap-4">
          <ul className="flex gap-6 text-sm font-medium text-neutral-300">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={withLanguage(link.href, language)}
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
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            {languageOptions.map((option) => (
              <Link
                key={option}
                href={withLanguage(pathname, option)}
                className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded-md transition-colors duration-300 ${
                  language === option
                    ? "bg-white text-neutral-950"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {option}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
