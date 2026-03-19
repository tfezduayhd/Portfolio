import Link from "next/link";
import Tag from "./Tag";
import { Project } from "@/types";
import { Language, withLanguage } from "@/lib/i18n";

interface ProjectCardProps {
  project: Project;
  language: Language;
}

export default function ProjectCard({ project, language }: ProjectCardProps) {
  return (
    <Link
      href={withLanguage(`/projects/${project.slug}`, language)}
      className="group block rounded-2xl glass-panel p-6 smooth-lift hover:border-white/15"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-base font-semibold text-white/75 group-hover:text-white/95 transition-colors leading-snug">
          {project.title}
        </h3>
        <span className="text-[11px] text-white/20 shrink-0 mt-1 tracking-wider">{project.year}</span>
      </div>
      <p className="text-sm text-white/30 mb-4 leading-relaxed">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </Link>
  );
}
