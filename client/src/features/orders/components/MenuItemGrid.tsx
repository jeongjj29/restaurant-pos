import { MenuItem } from "@features/menu/types";

interface Props {
  items: MenuItem[];
  onClick: (item: MenuItem) => void;
}

function MenuItemGrid({ items, onClick }: Props) {
  return (
    <div className="w-1/2 grid h-full grid-cols-4 gap-2 justify-items-start mt-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onClick(item)}
          className="w-32 h-20 flex items-center justify-center text-center rounded-lg bg-blue-300 text-white cursor-pointer hover:bg-blue-600"
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export default MenuItemGrid;
