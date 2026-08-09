import { MenuItem } from "@features/menu/types";

interface Props {
  items: MenuItem[];
  onClick: (item: MenuItem) => void;
}

function MenuItemGrid({ items, onClick }: Props) {
  return (
    <div className="grid min-w-0 flex-1 auto-rows-[5.5rem] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onClick(item)}
          className="flex min-w-0 items-center justify-center rounded-lg border border-border bg-surface-raised p-2 text-center font-semibold text-text-primary transition-colors hover:border-accent hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

export default MenuItemGrid;
