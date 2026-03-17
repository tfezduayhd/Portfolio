import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import Tag from "@/components/Tag";
import LabComponentRenderer from "@/components/lab/LabComponentRenderer";
import { labItems } from "@/data/lab";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return labItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = labItems.find((i) => i.slug === slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description,
  };
}

export default async function LabDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = labItems.find((i) => i.slug === slug);
  if (!item) notFound();

  return (
    <SectionWrapper>
      <Link href="/lab" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors duration-300 mb-10">
        ← Back to Lab
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{item.title}</h1>
        <p className="text-neutral-300 text-lg">{item.description}</p>
        <span className="text-sm text-neutral-500 mt-4 block">Year: {item.year}</span>
      </header>

      {/* Interactive component */}
      {item.component ? (
        <div className="rounded-2xl glass-panel p-6 sm:p-8">
          <LabComponentRenderer name={item.component} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 backdrop-blur-sm p-12 flex flex-col items-center justify-center text-center min-h-64">
          <span className="text-4xl mb-4">🚧</span>
          <p className="text-neutral-400 font-medium mb-2">Interactive experience coming soon</p>
          <p className="text-sm text-neutral-600 max-w-sm">
            This mini-project is being built. Drop in a React component here to make it interactive.
          </p>
        </div>
      )}
    </SectionWrapper>
  );
}
