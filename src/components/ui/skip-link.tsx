export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded bg-accent px-4 py-2 text-sm font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
    >
      {label}
    </a>
  );
}