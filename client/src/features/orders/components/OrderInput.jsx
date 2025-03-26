import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMenuCategories } from "@features/menu/slices/menuCategoriesSlice";
import { addOrder, fetchOrders } from "../slices/ordersSlice";
import { addOrderItem } from "../slices/orderItemsSlice";
import { TAX_RATE } from "@constants";
import axios from "axios";

function OrderInput({ tableId }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuCategories = useSelector(
    (state) => state.menuCategories.menuCategories
  );
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [pendingOrderItems, setPendingOrderItems] = useState([]);
  const [table, setTable] = useState({
    id: null,
    number: null,
  });

  useEffect(() => {
    dispatch(fetchMenuCategories());
    if (tableId) {
      axios.get(`/tables/${tableId}`).then((res) => {
        setTable(res.data);
      });
    }
  }, [dispatch, tableId]);

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

  const handleOrderSubmit = () => {
    dispatch(
      addOrder({
        type: table.id ? "dine_in" : "take_out",
        total_price: totalPriceWithTax,
        status: "open",
        sales_tax: TAX_RATE,
        user_id: 1,
        table_id: table.id ? table.id : null,
      })
    )
      .unwrap()
      .then((res) => {
        pendingOrderItems.forEach((item) => {
          dispatch(
            addOrderItem({
              order_id: res.id,
              menu_item_id: item.id,
              price: item.price,
              quantity: item.quantity,
            })
          )
            .unwrap()
            .then()
            .catch((err) => {
              console.error(err);
            })
            .finally(() => {
              setPendingOrderItems([]);
              dispatch(fetchOrders());
            });
        });
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        navigate("/");
      });
  };

  // Calculate subtotal, tax, and total price
  const subtotalPrice = pendingOrderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const taxPrice = parseFloat((subtotalPrice * TAX_RATE).toFixed(2));
  const totalPriceWithTax = parseFloat((subtotalPrice + taxPrice).toFixed(2));

  return (
    <div className="flex flex-col h-full w-full">
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
            {table.id ? `Table ${table.number} Order` : "Take-Out Order"}
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
                    ${subtotalPrice.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-bold text-right">TAX</td>
                  <td className="py-2 px-4 font-bold">
                    ${taxPrice.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-bold text-right">TOTAL</td>
                  <td className="py-2 px-4 font-bold">
                    ${totalPriceWithTax.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center w-full mt-4 p-4 bg-gray-100">
        <button
          onClick={handleOrderSubmit}
          className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default OrderInput;
