import { useState } from "react";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";

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
    "border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700 cursor-pointer";
  const tdCSS = "border border-gray-300 p-3 text-left text-sm text-gray-700";

  const sortedMenuCategories = [...menuCategories].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (menuCategoriesError) {
    return <p className="text-red-500">Error: {menuCategoriesError}</p>;
  }

  return (
    <div className="max-w-3xl ml-4 overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
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
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setMenuCategoryFormHidden(false);
                  setMenuCategoryToEdit(null);
                }}
              >
                <AddIcon />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMenuCategories.map((menuCategory) => (
            <tr key={menuCategory.id}>
              <td className={tdCSS}>{menuCategory.name}</td>
              <td className={tdCSS}>{menuCategory.secondary_name}</td>
              <td className={tdCSS}>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setMenuCategoryToEdit(menuCategory);
                    setMenuCategoryFormHidden(false);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MenuCategoriesTable;
