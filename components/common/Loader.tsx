export function Loader() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[--secondary]/60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[--primary]" />
      </span>
      <span className="text-sm text-[--text-secondary]">Generating your card...</span>
    </div>
  );
}
