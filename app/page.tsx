import type { Metadata } from "next";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import ProjectCard from "@/components/ProjectCard";
import LabCard from "@/components/LabCard";
import { projects } from "@/data/projects";
import { labItems } from "@/data/lab";

export const metadata: Metadata = {
  title: "Portfolio — UI/UX Designer",
  description: "UI/UX Designer & Front-End Developer crafting intuitive digital experiences.",
};

export default function HomePage() {
  const featuredProjects = projects.slice(0, 2);
  const featuredLab = labItems.slice(0, 2);

  return (
    <>
      {/* Hero */}
      <SectionWrapper className="pt-24 pb-12">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-indigo-400 mb-4 tracking-widest uppercase">
            UI/UX Designer & Front-End Developer
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-100 mb-6 leading-tight">
            Hi, I&apos;m Hugo Dimitrijevic.<br />
            <span className="text-indigo-400">I design and build adaptive digital experiences.</span>
          </h1>
          <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
            UI/UX Designer and Front-End Developer, I combine design thinking with implementation to create user-centered interfaces. I&apos;m currently completing a Master in Transition numérique et Codesign at CNAM Paris and working in alternance at GRDF, with a strong focus on generative AI, Adaptive UI, and design systems.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors text-sm"
            >
              View Projects
            </Link>
            <Link
              href="/lab"
              className="px-6 py-3 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-neutral-100 font-medium transition-colors text-sm"
            >
              Explore the Lab →
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* Featured Projects */}
      <SectionWrapper>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-neutral-100">Selected Work</h2>
          <Link href="/projects" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            All projects →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </SectionWrapper>

      {/* Featured Lab */}
      <SectionWrapper>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-100">Lab</h2>
            <p className="text-sm text-neutral-500 mt-1">Interactive experiments & mini-tools</p>
          </div>
          <Link href="/lab" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            All experiments →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {featuredLab.map((item) => (
            <LabCard key={item.slug} item={item} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
