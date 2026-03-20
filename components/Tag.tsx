interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  return (
    <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(var(--accent),0.05)] text-[rgba(var(--accent),0.45)] border border-[rgba(var(--accent),0.1)]">
      {label}
    </span>
  );
}
