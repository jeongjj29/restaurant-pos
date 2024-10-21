import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuItems } from "./menuItemsSlice";
import { fetchMenuCategories } from "./menuCategoriesSlice";

function MenuItemTable() {
  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.menuItems.menuItems);
  const menuCategories = useSelector(
    (state) => state.menuCategories.menuCategories
  );
  const menuItemsError = useSelector((state) => state.menuItems.error);
  const menuCategoriesError = useSelector(
    (state) => state.menuCategories.error
  );

  const thCSS =
    "border border-gray-300 p-3 text-left text-sm font-semibold text-gray-700";
  const tdCSS = "border border-gray-300 p-3 text-left text-sm text-gray-700";

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchMenuCategories());
  }, [dispatch]);

  // Loading state handling
  if (menuItems.length === 0 && !menuItemsError) {
    return <p className="text-gray-600">Loading menu items...</p>;
  }

  if (menuItemsError)
    return <p className="text-red-600">Error: {menuItemsError}</p>;
  if (menuCategoriesError)
    return <p className="text-red-600">Error: {menuCategoriesError}</p>;

  return (
    <div className="max-w-4xl mx-auto my-8 overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className={thCSS}>Name</th>
            <th className={thCSS}>Secondary Name</th>
            <th className={thCSS}>Category</th>
            <th className={thCSS}>Price</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((menuItem) => (
            <tr key={menuItem.id} className="hover:bg-gray-50">
              <td className={tdCSS}>{menuItem.name}</td>
              <td className={tdCSS}>{menuItem.secondary_name}</td>
              <td className={tdCSS}>{menuItem.menu_category.name}</td>
              <td className={tdCSS}>{menuItem.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MenuItemTable;
