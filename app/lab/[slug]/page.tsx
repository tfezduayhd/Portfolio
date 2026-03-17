import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionWrapper from "@/components/SectionWrapper";
import Tag from "@/components/Tag";
import LabComponentRenderer from "@/components/lab/LabComponentRenderer";
import { labItems } from "@/data/lab";
import { getLanguage, getLocalizedLabItem, uiCopy, withLanguage } from "@/lib/i18n";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
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

export default async function LabDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const language = getLanguage(lang);
  const copy = uiCopy[language];
  const item = labItems.find((i) => i.slug === slug);
  if (!item) notFound();
  const localizedItem = getLocalizedLabItem(item, language);

  return (
    <SectionWrapper>
      <Link
        href={withLanguage("/lab", language)}
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors duration-300 mb-10"
      >
        {copy.backToLab}
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {localizedItem.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">{localizedItem.title}</h1>
        <p className="text-neutral-300 text-lg">{localizedItem.description}</p>
        <span className="text-sm text-neutral-500 mt-4 block">{copy.year}: {localizedItem.year}</span>
      </header>

      {/* Interactive component */}
      {localizedItem.component ? (
        <div className="rounded-2xl glass-panel p-6 sm:p-8">
          <LabComponentRenderer name={localizedItem.component} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 backdrop-blur-sm p-12 flex flex-col items-center justify-center text-center min-h-64">
          <span className="text-4xl mb-4">🚧</span>
          <p className="text-neutral-400 font-medium mb-2">{copy.comingSoon}</p>
          <p className="text-sm text-neutral-600 max-w-sm">
            {copy.comingSoonDescription}
          </p>
        </div>
      )}
    </SectionWrapper>
  );
}
