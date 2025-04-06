import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuItems } from "../slices/menuItemsSlice";
import { fetchMenuCategories } from "../slices/menuCategoriesSlice";
import EditButton from "@components/buttons/EditButton";
import CreateButton from "@components/buttons/CreateButton";
import { RootState, AppDispatch } from "@app/store";
import { MenuItem } from "../types";

interface MenuItemTableProps {
  setMenuItemToEdit: (menuItem: MenuItem | null) => void;
  setMenuItemFormHidden: (hidden: boolean) => void;
}

type SortKey = keyof MenuItem | "menu_category.name";

const MenuItemTable: React.FC<MenuItemTableProps> = ({
  setMenuItemToEdit,
  setMenuItemFormHidden,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const menuItems = useSelector(
    (state: RootState) => state.menuItems.menuItems
  );
  const menuItemsError = useSelector(
    (state: RootState) => state.menuItems.error
  );

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  const thCSS =
    "sticky top-0 px-4 py-2 text-left text-sm font-semibold text-text-primary bg-surface border-b border-border cursor-pointer";
  const tdCSS =
    "px-4 py-2 text-left text-sm text-text-secondary border-b border-border";

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchMenuCategories());
  }, [dispatch]);

  const sortedMenuItems = [...menuItems].sort((a, b) => {
    const aVal =
      sortConfig.key === "menu_category.name"
        ? a.menu_category.name
        : (a[sortConfig.key] as string | number);
    const bVal =
      sortConfig.key === "menu_category.name"
        ? b.menu_category.name
        : (b[sortConfig.key] as string | number);

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  if (menuItems.length === 0 && !menuItemsError) {
    return <p className="text-text-secondary">Loading menu items...</p>;
  }

  if (menuItemsError) {
    return <p className="text-red-600">Error: {menuItemsError}</p>;
  }

  return (
    <div className="max-w-4xl border border-border rounded-md shadow-md">
      <div className="max-h-[85vh] overflow-y-auto rounded-md">
        <table className="min-w-full bg-surface rounded-md">
          <thead className="bg-surface z-10">
            <tr>
              <th className={thCSS} onClick={() => handleSort("name")}>
                Name{" "}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className={thCSS}
                onClick={() => handleSort("secondary_name")}
              >
                Secondary Name{" "}
                {sortConfig.key === "secondary_name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className={thCSS}
                onClick={() => handleSort("menu_category.name")}
              >
                Category{" "}
                {sortConfig.key === "menu_category.name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className={thCSS} onClick={() => handleSort("price")}>
                Price{" "}
                {sortConfig.key === "price" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className={thCSS}>
                <CreateButton
                  onClick={() => {
                    setMenuItemToEdit(null);
                    setMenuItemFormHidden(false);
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMenuItems.map((menuItem, index) => (
              <tr
                key={menuItem.id}
                className={
                  index % 2 === 0
                    ? "bg-white/5 hover:bg-white/20"
                    : "bg-white/10 hover:bg-white/20"
                }
              >
                <td className={tdCSS}>{menuItem.name}</td>
                <td className={tdCSS}>{menuItem.secondary_name}</td>
                <td className={tdCSS}>{menuItem.menu_category.name}</td>
                <td className={tdCSS}>${menuItem.price}</td>
                <td className={tdCSS}>
                  <EditButton
                    onClick={() => {
                      setMenuItemToEdit(menuItem);
                      setMenuItemFormHidden(false);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuItemTable;
