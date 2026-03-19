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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/40 backdrop-blur-2xl">
      <nav className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href={withLanguage("/", language)}
          className="text-base font-semibold tracking-tight text-white/70 hover:text-white transition-colors duration-400"
        >
          Hd.
        </Link>
        <div className="flex items-center gap-5">
          <ul className="flex gap-6 text-[13px] font-medium text-white/35">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={withLanguage(link.href, language)}
                  className={`hover:text-white/80 transition-colors duration-400 ${
                    link.href === "/"
                      ? pathname === "/"
                        ? "text-white/80"
                        : ""
                      : pathname.startsWith(link.href)
                      ? "text-white/80"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center rounded-md border border-white/[0.06] bg-white/[0.03] p-0.5">
            {languageOptions.map((option) => (
              <Link
                key={option}
                href={withLanguage(pathname, option)}
                className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition-colors duration-300 ${
                  language === option
                    ? "bg-white/10 text-white/80"
                    : "text-white/25 hover:text-white/50"
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
