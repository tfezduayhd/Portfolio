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
      className="group block rounded-2xl glass-panel p-6 smooth-lift hover:border-indigo-400/60"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors leading-snug">
          {project.title}
        </h3>
        <span className="text-xs text-neutral-500 shrink-0 mt-1">{project.year}</span>
      </div>
      <p className="text-sm text-neutral-400 mb-4 leading-relaxed">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </Link>
  );
}
