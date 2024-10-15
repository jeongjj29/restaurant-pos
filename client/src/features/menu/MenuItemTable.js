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

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchMenuCategories());
  }, [dispatch]);

  console.log(menuItems);
  console.log(menuCategories);

  if (menuItemsError) return <p>Error: {menuItemsError}</p>;
  if (menuCategoriesError) return <p>Error: {menuCategoriesError}</p>;

  return (
    <table>
      <tr>
        <th>Name</th>
        <th>Secondary Name</th>
        <th>Category</th>
        <th>Price</th>
      </tr>
      {menuItems.map((menuItem) => {
        return (
          <tr key={menuItem.id}>
            <td>{menuItem.name}</td>
            <td>{menuItem.secondary_name}</td>
            <td>{menuItem.menu_category.name}</td>
            <td>{menuItem.price}</td>
          </tr>
        );
      })}
    </table>
  );
}

export default MenuItemTable;
