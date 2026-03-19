interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  return (
    <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.03] text-white/30 border border-white/[0.06]">
      {label}
    </span>
  );
}
