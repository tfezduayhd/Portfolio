import type { Metadata } from "next";
import SectionWrapper from "@/components/SectionWrapper";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "A selection of UI/UX and front-end projects.",
};

export default function ProjectsPage() {
  return (
    <SectionWrapper>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-3 fade-up">Projects</h1>
        <p className="text-neutral-300 text-lg fade-up-delay">A curated selection of design and front-end work.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
}
