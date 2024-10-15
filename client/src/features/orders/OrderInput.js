import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMenuCategories } from "../menu/menuCategoriesSlice";

function OrderInput() {
  const dispatch = useDispatch();
  const menuCategories = useSelector(
    (state) => state.menuCategories.menuCategories
  );
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [pendingOrderItems, setPendingOrderItems] = useState([]);

  const TAX_RATE = 0.08875;

  useEffect(() => {
    dispatch(fetchMenuCategories());
  }, [dispatch]);

  const handleCategoryButtonClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleMenuItemClick = (menuItem) => {
    setPendingOrderItems((prevOrderItems) => {
      const existingItem = prevOrderItems.find(
        (item) => item.id === menuItem.id
      );

      if (existingItem) {
        // Increment quantity of existing item
        return prevOrderItems.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevOrderItems, { ...menuItem, quantity: 1 }];
      }
    });
  };

  // Calculate the total price
  const totalPrice = pendingOrderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="flex flex-row h-full w-full">
      {/* Sidebar with Category Buttons */}
      <div className="w-128 h-full flex flex-col justify-center m-6">
        {menuCategories.map((menuCategory) => (
          <button
            key={menuCategory.id}
            onClick={() => handleCategoryButtonClick(menuCategory.id)}
            className="w-full bg-green-300 hover:bg-green-400 text-white text-2xl font-bold py-2 px-4 rounded mb-2"
          >
            {menuCategory.name}
          </button>
        ))}
      </div>

      {/* Menu Items Display */}
      <div className="w-560 grid h-full grid-cols-4 gap-4 items-center justify-items-center mt-6">
        {menuCategories
          .filter((menuCategory) => menuCategory.id === selectedCategory)
          .flatMap((menuCategory) =>
            menuCategory.menu_items.map((menuItem) => (
              <div
                onClick={() => handleMenuItemClick(menuItem)}
                key={menuItem.id}
                className="w-32 h-20 flex items-center justify-center text-center rounded-lg bg-blue-300 text-white cursor-pointer hover:bg-blue-600"
              >
                {menuItem.name}
              </div>
            ))
          )}
      </div>

      {/* Order Display */}
      <div className="w-1/3 m-6 border-2 rounded-lg shadow-lg flex flex-col justify-between overflow-hidden">
        <h1 className="text-2xl text-center mt-4 mb-4 bg-gray-200 py-2">
          Take-Out Order
        </h1>

        {/* Scrollable Menu Items */}
        <div className="max-h-80 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-300 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left">Quantity</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingOrderItems.map((menuItem, index) => (
                <tr
                  key={menuItem.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="py-2 px-4">{menuItem.quantity}</td>
                  <td className="py-2 px-4">{menuItem.name}</td>
                  <td className="py-2 px-4">${menuItem.price.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    ${(menuItem.price * menuItem.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer aligned to bottom-right */}
        <div className="flex justify-end items-end w-full mt-4 p-4 bg-gray-100">
          <table className="w-auto">
            <tfoot>
              <tr>
                <td className="py-2 px-4 font-bold text-right">SUBTOTAL</td>
                <td className="py-2 px-4 font-bold">
                  ${totalPrice.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold text-right">TAX</td>
                <td className="py-2 px-4 font-bold">
                  ${(totalPrice * TAX_RATE).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold text-right">TOTAL</td>
                <td className="py-2 px-4 font-bold">
                  ${(totalPrice * (1 + TAX_RATE)).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderInput;
