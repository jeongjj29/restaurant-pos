import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuItems } from "./menuItemsSlice";

function MenuItemList() {
  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.menuItems.menuItems);
  const error = useSelector((state) => state.menuItems.error);

  useEffect(() => {
    dispatch(fetchMenuItems());
  }, [dispatch]);

  console.log(menuItems);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <ul></ul>
    </div>
  );
}

export default MenuItemList;
