import type { Metadata } from "next";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import ProjectCard from "@/components/ProjectCard";
import LabCard from "@/components/LabCard";
import { projects } from "@/data/projects";
import { labItems } from "@/data/lab";
import { getLanguage, getLocalizedLabItem, getLocalizedProject, uiCopy, withLanguage } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Portfolio — UI/UX Designer",
  description: "UI/UX Designer & Front-End Developer crafting intuitive digital experiences.",
};

interface HomePageProps {
  searchParams: Promise<{ lang?: string | string[] }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { lang } = await searchParams;
  const language = getLanguage(lang);
  const copy = uiCopy[language];
  const featuredProjects = projects.slice(0, 2).map((project) => getLocalizedProject(project, language));
  const featuredLab = labItems.slice(0, 2).map((item) => getLocalizedLabItem(item, language));

  return (
    <>
      {/* ── Hero: Full-viewport immersive introduction ─────────── */}
      <section className="relative min-h-[92vh] flex items-end pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto w-full px-6 sm:px-8">
          {/* Role tag */}
          <p className="text-[11px] font-medium tracking-[0.35em] uppercase text-white/40 mb-6 fade-up">
            {copy.heroRole}
          </p>

          {/* Name & statement — brutalist large type */}
          <h1 className="fade-up-delay">
            <span className="block text-[clamp(2.4rem,6vw,5.2rem)] font-bold leading-[1.05] tracking-tight text-white/90">
              {copy.heroTitle}
            </span>
            <span className="block mt-2 text-[clamp(1.2rem,2.8vw,2rem)] font-light leading-snug text-white/50 max-w-3xl">
              {copy.heroAccent}
            </span>
          </h1>

          {/* Thin divider */}
          <div className="divider-line w-full max-w-md mt-10 mb-8 fade-up-delay-2" />

          {/* Description */}
          <p className="text-sm sm:text-base leading-relaxed text-white/35 max-w-xl fade-up-delay-2">
            {copy.heroDescription}
          </p>
        </div>
      </section>

      {/* ── Featured Projects ─────────────────────────────────── */}
      <SectionWrapper>
        <div className="flex items-end justify-between mb-10 fade-up">
          <div>
            <span className="block text-[11px] font-medium tracking-[0.35em] uppercase text-white/30 mb-2">01</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-white/85 tracking-tight">{copy.selectedWork}</h2>
          </div>
          <Link
            href={withLanguage("/projects", language)}
            className="text-xs tracking-wide text-white/30 hover:text-white/60 transition-colors duration-400 uppercase"
          >
            {copy.allProjects}
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} language={language} />
          ))}
        </div>
      </SectionWrapper>

      {/* ── Featured Lab ──────────────────────────────────────── */}
      <SectionWrapper>
        <div className="flex items-end justify-between mb-10 fade-up">
          <div>
            <span className="block text-[11px] font-medium tracking-[0.35em] uppercase text-white/30 mb-2">02</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-white/85 tracking-tight">Lab</h2>
            <p className="text-xs text-white/25 mt-1">{copy.labSubtitle}</p>
          </div>
          <Link
            href={withLanguage("/lab", language)}
            className="text-xs tracking-wide text-white/30 hover:text-white/60 transition-colors duration-400 uppercase"
          >
            {copy.allExperiments}
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {featuredLab.map((item) => (
            <LabCard key={item.slug} item={item} language={language} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
