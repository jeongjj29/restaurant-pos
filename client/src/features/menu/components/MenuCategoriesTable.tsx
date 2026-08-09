import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateButton from "@components/buttons/CreateButton";
import EditButton from "@components/buttons/EditButton";
import { RootState } from "@app/store";
import { MenuCategory } from "@menu/types";
import { AppDispatch } from "@app/store";
import { fetchMenuCategories } from "@menu/slices/menuCategoriesSlice";

interface MenuCategoriesTableProps {
  setMenuCategoryToEdit: (category: MenuCategory | null) => void;
  setMenuCategoryFormHidden: (hidden: boolean) => void;
}

type SortKey = keyof Pick<MenuCategory, "name" | "secondary_name">;

function MenuCategoriesTable({
  setMenuCategoryToEdit,
  setMenuCategoryFormHidden,
}: MenuCategoriesTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const menuCategories = useSelector(
    (state: RootState) => state.menuCategories.menuCategories
  );
  const menuCategoriesError = useSelector(
    (state: RootState) => state.menuCategories.error
  );
  const menuCategoriesLoading = useSelector(
    (state: RootState) => state.menuCategories.loading
  );

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  const thCSS =
    "px-4 py-2 text-left text-sm font-semibold text-text-primary bg-surface border-b border-border cursor-pointer";
  const tdCSS =
    "px-4 py-2 text-left text-sm text-text-secondary border-b border-border";

  const sortedMenuCategories = [...menuCategories].sort((a, b) => {
    if ((a[sortConfig.key] ?? "") < (b[sortConfig.key] ?? ""))
      return sortConfig.direction === "asc" ? -1 : 1;
    if ((a[sortConfig.key] ?? "") > (b[sortConfig.key] ?? ""))
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  if (menuCategories.length === 0 && menuCategoriesLoading) {
    return <p className="text-text-secondary">Loading menu categories...</p>;
  }

  if (menuCategories.length === 0 && menuCategoriesError) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-error/40 bg-error/10 p-6 text-center">
        <p className="text-error">
          Could not load menu categories: {menuCategoriesError}
        </p>
        <button
          type="button"
          onClick={() => void dispatch(fetchMenuCategories())}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    );
  }

  if (menuCategories.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-white/5 p-6 text-center">
        <p className="text-text-secondary">No menu categories have been added yet.</p>
        <button
          type="button"
          onClick={() => {
            setMenuCategoryToEdit(null);
            setMenuCategoryFormHidden(false);
          }}
          className="accent-badge rounded-lg px-4 py-2 text-sm"
        >
          Add first category
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {menuCategoriesError && (
        <div
          role="alert"
          className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"
        >
          Last category action failed: {menuCategoriesError}
        </div>
      )}
      <div className="h-full min-h-0 overflow-auto rounded-md border border-border shadow-md">
        <table className="min-w-full bg-surface rounded-md">
        <thead>
          <tr>
            <th className={thCSS} onClick={() => handleSort("name")}>
              Name{" "}
              {sortConfig.key === "name" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th className={thCSS} onClick={() => handleSort("secondary_name")}>
              Secondary Name{" "}
              {sortConfig.key === "secondary_name" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th className={thCSS}>
              <CreateButton
                onClick={() => {
                  setMenuCategoryFormHidden(false);
                  setMenuCategoryToEdit(null);
                }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMenuCategories.map((menuCategory, index) => (
            <tr
              key={menuCategory.id}
              className={
                index % 2 === 0
                  ? "bg-white/5 hover:bg-white/20"
                  : "bg-white/10 hover:bg-white/20"
              }
            >
              <td className={tdCSS}>{menuCategory.name}</td>
              <td className={tdCSS}>{menuCategory.secondary_name}</td>
              <td className={tdCSS}>
                <EditButton
                  onClick={() => {
                    setMenuCategoryToEdit(menuCategory);
                    setMenuCategoryFormHidden(false);
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
}

export default MenuCategoriesTable;
