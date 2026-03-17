"use client";

import { useSearchParams } from "next/navigation";
import { getLanguage, uiCopy } from "@/lib/i18n";

export default function Footer() {
  const searchParams = useSearchParams();
  const language = getLanguage(searchParams.get("lang") ?? undefined);

  const copy = uiCopy[language];

  return (
    <footer className="border-t border-white/10 py-8 mt-16 bg-neutral-950/40 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
        <span>© {new Date().getFullYear()} — {copy.footerRole}</span>
        <div className="flex gap-6">
          <a href="mailto:hello@example.com" className="hover:text-white transition-colors duration-300">Email</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">LinkedIn</a>
          <a href="https://github.com/Ikenakk" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
