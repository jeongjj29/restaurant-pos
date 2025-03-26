import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuItems } from "../slices/menuItemsSlice";
import { fetchMenuCategories } from "../slices/menuCategoriesSlice";
import AddIcon from "@mui/icons-material/Add";

function MenuItemTable({ setMenuItemToEdit, setMenuItemFormHidden }) {
  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.menuItems.menuItems);
  const menuItemsError = useSelector((state) => state.menuItems.error);

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const thCSS =
    "border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700 cursor-pointer";
  const tdCSS = "border border-gray-300 p-3 text-left text-sm text-gray-700";

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchMenuCategories());
  }, [dispatch]);

  // Sorting function
  const sortedMenuItems = [...menuItems].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Function to handle column sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Loading state handling
  if (menuItems.length === 0 && !menuItemsError) {
    return <p className="text-gray-600">Loading menu items...</p>;
  }

  if (menuItemsError)
    return <p className="text-red-600">Error: {menuItemsError}</p>;

  return (
    <div className="max-w-3xl overflow-x-auto shadow-md rounded-lg">
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
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setMenuItemToEdit(null);
                  setMenuItemFormHidden(false);
                }}
              >
                <AddIcon />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMenuItems.map((menuItem) => (
            <tr key={menuItem.id} className="hover:bg-gray-50">
              <td className={tdCSS}>{menuItem.name}</td>
              <td className={tdCSS}>{menuItem.secondary_name}</td>
              <td className={tdCSS}>{menuItem.menu_category.name}</td>
              <td className={tdCSS}>{menuItem.price}</td>
              <td className={tdCSS}>
                <button
                  onClick={() => {
                    setMenuItemToEdit(menuItem);
                    setMenuItemFormHidden(false);
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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

export default MenuItemTable;
