import type { Metadata } from "next";
import SectionWrapper from "@/components/SectionWrapper";
import LabCard from "@/components/LabCard";
import { labItems } from "@/data/lab";

export const metadata: Metadata = {
  title: "Lab",
  description: "Interactive experiments, mini-tools and front-end playgrounds.",
};

export default function LabPage() {
  return (
    <SectionWrapper>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-100 mb-3">Lab</h1>
        <p className="text-neutral-400 text-lg">
          Interactive experiments, mini-tools and front-end playgrounds. Each project is self-contained and ready to explore.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {labItems.map((item) => (
          <LabCard key={item.slug} item={item} />
        ))}
      </div>
    </SectionWrapper>
  );
}
