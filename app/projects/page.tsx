import type { Metadata } from "next";
import SectionWrapper from "@/components/SectionWrapper";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { getLanguage, getLocalizedProject, uiCopy } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Projects",
  description: "A selection of UI/UX and front-end projects.",
};

interface ProjectsPageProps {
  searchParams: Promise<{ lang?: string | string[] }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { lang } = await searchParams;
  const language = getLanguage(lang);
  const copy = uiCopy[language];
  const localizedProjects = projects.map((project) => getLocalizedProject(project, language));

  return (
    <SectionWrapper>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-3 fade-up">{copy.navProjects}</h1>
        <p className="text-neutral-300 text-lg fade-up-delay">{copy.projectsIntro}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {localizedProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} language={language} />
        ))}
      </div>
    </SectionWrapper>
  );
}
