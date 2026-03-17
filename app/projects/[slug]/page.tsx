import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import Tag from "@/components/Tag";
import { projects } from "@/data/projects";
import { getLanguage, getLocalizedProject, uiCopy, withLanguage } from "@/lib/i18n";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
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

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const language = getLanguage(lang);
  const copy = uiCopy[language];
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const localizedProject = getLocalizedProject(project, language);

  return (
    <SectionWrapper>
      <div className="mx-auto max-w-5xl">
        <Link
          href={withLanguage("/projects", language)}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors duration-300 mb-10"
        >
          {copy.backToProjects}
        </Link>

        <header className="max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">{localizedProject.title}</h1>
          <p className="text-neutral-300 text-lg leading-relaxed">{localizedProject.description}</p>
        </header>

        <aside className="max-w-3xl mx-auto mb-14 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-300 mb-6">{copy.projectSummary}</h2>
          <dl className="grid sm:grid-cols-2 gap-6">
            <div>
              <dt className="text-xs uppercase tracking-widest text-neutral-400 mb-2">{copy.role}</dt>
              <dd className="text-neutral-100 font-medium">{localizedProject.role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-neutral-400 mb-2">{copy.year}</dt>
              <dd className="text-neutral-100 font-medium">{localizedProject.year}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-widest text-neutral-400 mb-3">Tags</dt>
              <dd className="flex flex-wrap gap-2">
                {localizedProject.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </dd>
            </div>
          </dl>
        </aside>

        <div className="max-w-3xl mx-auto space-y-14">
          {[
            { label: copy.problem, content: localizedProject.problem },
            { label: copy.process, content: localizedProject.process },
            { label: copy.solution, content: localizedProject.solution },
            { label: copy.impact, content: localizedProject.impact },
          ].map(({ label, content }) => (
            <section key={label}>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-5">{label}</h2>
              <p className="text-neutral-300 text-lg leading-relaxed">{content}</p>
            </section>
          ))}
        </div>

        {(localizedProject.liveUrl || localizedProject.githubUrl) && (
          <div className="max-w-3xl mx-auto flex gap-4 mt-12">
            {localizedProject.liveUrl && (
              <a href={localizedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all duration-300 smooth-lift">
                {copy.liveDemo}
              </a>
            )}
            {localizedProject.githubUrl && (
              <a href={localizedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-neutral-200 text-sm font-medium transition-all duration-300 bg-white/5 backdrop-blur-sm smooth-lift">
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
