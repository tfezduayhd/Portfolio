import type { Metadata } from "next";
import SectionWrapper from "@/components/SectionWrapper";
import LabCard from "@/components/LabCard";
import { labItems } from "@/data/lab";
import { getLanguage, getLocalizedLabItem, uiCopy } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Lab",
  description: "Interactive experiments, mini-tools and front-end playgrounds.",
};

interface LabPageProps {
  searchParams: Promise<{ lang?: string | string[] }>;
}

export default async function LabPage({ searchParams }: LabPageProps) {
  const { lang } = await searchParams;
  const language = getLanguage(lang);
  const copy = uiCopy[language];
  const localizedLabItems = labItems.map((item) => getLocalizedLabItem(item, language));

  return (
    <SectionWrapper>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-3 fade-up">{copy.navLab}</h1>
        <p className="text-neutral-300 text-lg fade-up-delay">
          {copy.labIntro}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {localizedLabItems.map((item) => (
          <LabCard key={item.slug} item={item} language={language} />
        ))}
      </div>
    </SectionWrapper>
  );
}
