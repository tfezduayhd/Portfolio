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
        <div className="max-w-2xl lg:max-w-4xl rounded-3xl glass-panel p-8 sm:p-10 fade-up">
          <p className="text-sm font-medium text-indigo-300 mb-4 tracking-widest uppercase">
            UI/UX Designer & Front-End Developer
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight fade-up-delay">
            Hi, I&apos;m Hugo Dimitrijevic.<br />
            <span className="bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-transparent">I design and build adaptive digital experiences.</span>
          </h1>
          <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
            UI/UX Designer and Front-End Developer, I combine design thinking with implementation to create user-centered interfaces. I&apos;m currently completing a Master in Transition numérique et Codesign at CNAM Paris and working in alternance at GRDF, with a strong focus on generative AI, Adaptive UI, and design systems.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all duration-300 text-sm smooth-lift"
            >
              View Projects
            </Link>
            <Link
              href="/lab"
              className="px-6 py-3 rounded-xl border border-white/15 hover:border-white/30 text-neutral-200 hover:text-white font-medium transition-all duration-300 text-sm smooth-lift bg-white/5 backdrop-blur-sm"
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
