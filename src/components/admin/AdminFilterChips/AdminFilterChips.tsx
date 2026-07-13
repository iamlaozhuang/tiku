import { X } from "lucide-react";

export type AdminFilterChip = {
  id: string;
  label: string;
  value: string;
};

export function AdminFilterChips({
  filters,
  onRemove,
}: {
  filters: AdminFilterChip[];
  onRemove: (filterId: string) => void;
}) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="已启用筛选"
      className="border-border bg-surface flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
    >
      <span className="text-text-secondary text-xs font-medium">
        已启用筛选
      </span>
      <ul className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const readableFilter = `${filter.label}：${filter.value}`;

          return (
            <li key={filter.id}>
              <button
                aria-label={`移除筛选 ${readableFilter}`}
                className="border-border bg-secondary text-secondary-foreground focus-visible:ring-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium outline-none hover:opacity-80 focus-visible:ring-3"
                type="button"
                onClick={() => onRemove(filter.id)}
              >
                <span>{readableFilter}</span>
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
