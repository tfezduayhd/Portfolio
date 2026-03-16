export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <span>© {new Date().getFullYear()} — UI/UX Designer</span>
        <div className="flex gap-6">
          <a href="mailto:hello@example.com" className="hover:text-neutral-300 transition-colors">Email</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">LinkedIn</a>
          <a href="https://github.com/Ikenakk" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
