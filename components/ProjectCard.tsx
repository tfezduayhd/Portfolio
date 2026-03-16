import Link from "next/link";
import Tag from "./Tag";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-2xl border border-neutral-800 bg-neutral-900 p-6 hover:border-indigo-500/50 hover:bg-neutral-800/60 transition-all duration-300"
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
