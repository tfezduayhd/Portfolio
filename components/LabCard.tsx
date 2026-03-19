import Link from "next/link";
import Tag from "./Tag";
import { LabItem } from "@/types";
import { Language, withLanguage } from "@/lib/i18n";

interface LabCardProps {
  item: LabItem;
  language: Language;
}

export default function LabCard({ item, language }: LabCardProps) {
  return (
    <Link
      href={withLanguage(`/lab/${item.slug}`, language)}
      className="group block rounded-2xl glass-panel p-6 smooth-lift hover:border-white/15"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-white/30 text-xs font-bold shrink-0 border border-white/[0.06]">
          ▶
        </span>
        <div className="flex items-start justify-between gap-4 flex-1">
          <h3 className="text-base font-semibold text-white/75 group-hover:text-white/95 transition-colors leading-snug">
            {item.title}
          </h3>
          <span className="text-[11px] text-white/20 shrink-0 mt-0.5 tracking-wider">{item.year}</span>
        </div>
      </div>
      <p className="text-sm text-white/30 mb-4 ml-10 leading-relaxed">{item.description}</p>
      <div className="flex flex-wrap gap-2 ml-10">
        {item.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </Link>
  );
}
