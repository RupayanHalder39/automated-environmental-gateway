// Reusable empty-state UI for pages when backend returns no data.
// Keeps UX consistent across modules and aligned to Figma's subtle empty styling.

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/50 rounded-lg p-6 text-center">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
    </div>
  );
}

