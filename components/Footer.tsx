"use client";

import { useSearchParams } from "next/navigation";
import { getLanguage, uiCopy } from "@/lib/i18n";

export default function Footer() {
  const searchParams = useSearchParams();
  const language = getLanguage(searchParams.get("lang") ?? undefined);

  const copy = uiCopy[language];

  return (
    <footer className="relative border-t border-white/[0.06] py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/25">
        <span>© {new Date().getFullYear()} — {copy.footerRole}</span>
        <div className="flex gap-8">
          <a href="mailto:hello@example.com" className="hover:text-white/60 transition-colors duration-400">Email</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors duration-400">LinkedIn</a>
          <a href="https://github.com/Ikenakk" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors duration-400">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
