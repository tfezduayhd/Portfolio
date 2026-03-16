interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({ children, className = "" }: SectionWrapperProps) {
  return (
    <section className={`max-w-5xl mx-auto px-6 py-16 ${className}`}>
      {children}
    </section>
  );
}
