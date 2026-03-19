interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({ children, className = "" }: SectionWrapperProps) {
  return (
    <section className={`max-w-6xl mx-auto px-6 sm:px-8 py-16 ${className}`}>
      {children}
    </section>
  );
}
