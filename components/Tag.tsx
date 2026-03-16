interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
      {label}
    </span>
  );
}
