import Link from "next/link";
import Tag from "./Tag";
import { LabItem } from "@/types";

interface LabCardProps {
  item: LabItem;
}

export default function LabCard({ item }: LabCardProps) {
  return (
    <Link
      href={`/lab/${item.slug}`}
      className="group block rounded-2xl glass-panel p-6 smooth-lift hover:border-emerald-400/60"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold shrink-0">
          ▶
        </span>
        <div className="flex items-start justify-between gap-4 flex-1">
          <h3 className="text-base font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors leading-snug">
            {item.title}
          </h3>
          <span className="text-xs text-neutral-500 shrink-0 mt-0.5">{item.year}</span>
        </div>
      </div>
      <p className="text-sm text-neutral-400 mb-4 ml-11 leading-relaxed">{item.description}</p>
      <div className="flex flex-wrap gap-2 ml-11">
        {item.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </Link>
  );
}
