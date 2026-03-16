import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import Tag from "@/components/Tag";
import { projects } from "@/data/projects";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <SectionWrapper>
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-10">
        ← Back to Projects
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        <h1 className="text-4xl font-bold text-neutral-100 mb-3">{project.title}</h1>
        <p className="text-neutral-400 text-lg">{project.description}</p>
        <div className="flex flex-wrap gap-6 mt-6 text-sm text-neutral-500">
          <span>Role: <span className="text-neutral-300">{project.role}</span></span>
          <span>Year: <span className="text-neutral-300">{project.year}</span></span>
        </div>
      </header>

      <div className="grid gap-8">
        {[
          { label: "Problem", content: project.problem },
          { label: "Process", content: project.process },
          { label: "Solution", content: project.solution },
          { label: "Impact", content: project.impact },
        ].map(({ label, content }) => (
          <div key={label} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">{label}</h2>
            <p className="text-neutral-300 leading-relaxed">{content}</p>
          </div>
        ))}
      </div>

      {(project.liveUrl || project.githubUrl) && (
        <div className="flex gap-4 mt-10">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors">
              Live Demo →
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-sm font-medium transition-colors">
              GitHub
            </a>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}
