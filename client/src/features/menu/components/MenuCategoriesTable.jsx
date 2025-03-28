import { useState } from "react";
import { useSelector } from "react-redux";
import CreateButton from "@components/buttons/CreateButton";
import EditButton from "@components/buttons/EditButton";

function MenuCategoriesTable({
  setMenuCategoryToEdit,
  setMenuCategoryFormHidden,
}) {
  const menuCategories = useSelector(
    (state) => state.menuCategories.menuCategories
  );
  const menuCategoriesError = useSelector(
    (state) => state.menuCategories.error
  );

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const thCSS =
    "px-4 py-2 text-left text-sm font-semibold text-text-primary bg-surface border-b border-border cursor-pointer";
  const tdCSS =
    "px-4 py-2 text-left text-sm text-text-secondary border-b border-border";

  const sortedMenuCategories = [...menuCategories].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  if (menuCategoriesError) {
    return <p className="text-error">Error: {menuCategoriesError}</p>;
  }

  return (
    <div className="max-w-2xl overflow-x-auto rounded-md shadow-md border border-border">
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
  );
}

export default MenuCategoriesTable;
