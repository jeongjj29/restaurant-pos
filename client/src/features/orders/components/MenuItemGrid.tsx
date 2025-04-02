import { MenuItem } from "@features/menu/types";

interface Props {
  items: MenuItem[];
  onClick: (item: MenuItem) => void;
}

function MenuItemGrid({ items, onClick }: Props) {
  return (
    <div className="w-fit h-fit grid grid-cols-4 gap-2 mt-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onClick(item)}
          className="w-32 h-20 flex items-center justify-center text-center rounded-lg bg-neutral-500 cursor-pointer hover:bg-neutral-600"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export default MenuItemGrid;
