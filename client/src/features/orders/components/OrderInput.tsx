import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMenuCategories } from "@menu/slices/menuCategoriesSlice";
import { addOrder, fetchOrders } from "../slices/ordersSlice";
import { addOrderItem } from "../slices/orderItemsSlice";
import { TAX_RATE } from "@constants";
import axios from "axios";
import { AppDispatch, RootState } from "@app/store";
import { MenuCategory, MenuItem } from "@menu/types";
import { Table } from "@tables/types";

interface OrderInputProps {
  tableId?: number;
}

function OrderInput({ tableId }: OrderInputProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const menuCategories = useSelector(
    (state: RootState) => state.menuCategories.menuCategories
  );

  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [pendingOrderItems, setPendingOrderItems] = useState<
    (MenuItem & { quantity: number })[]
  >([]);
  const [table, setTable] = useState<Partial<Table>>({});

  useEffect(() => {
    dispatch(fetchMenuCategories());

    if (tableId) {
      axios.get<Table>(`/tables/${tableId}`).then((res) => {
        setTable(res.data);
      });
    }
  }, [dispatch, tableId]);

  const handleCategoryButtonClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  const handleMenuItemClick = (menuItem: MenuItem) => {
    setPendingOrderItems((prevOrderItems) => {
      const existingItem = prevOrderItems.find(
        (item) => item.id === menuItem.id
      );

      if (existingItem) {
        return prevOrderItems.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
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
        table_id: table.id || null,
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
          ).catch(console.error);
        });

        dispatch(fetchOrders());
        setPendingOrderItems([]);
        navigate("/");
      })
      .catch(console.error);
  };

  const subtotalPrice = pendingOrderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const taxPrice = parseFloat((subtotalPrice * TAX_RATE).toFixed(2));
  const totalPriceWithTax = parseFloat((subtotalPrice + taxPrice).toFixed(2));

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-row h-full w-full">
        <div className="w-128 h-full flex flex-col justify-center m-6">
          {menuCategories.map((menuCategory) => (
            <button
              key={menuCategory.id}
              onClick={() => handleCategoryButtonClick(menuCategory.id)}
              className="w-full bg-green-300 hover:bg-green-400 text-white text-2xl font-bold py-2 px-4 rounded-sm mb-2"
            >
              {menuCategory.name}
            </button>
          ))}
        </div>

        <div className="w-560 grid h-full grid-cols-4 gap-4 items-center justify-items-center mt-6">
          {menuCategories
            .find((category) => category.id === selectedCategory)
            ?.menu_items.map((menuItem) => (
              <div
                key={menuItem.id}
                onClick={() => handleMenuItemClick(menuItem)}
                className="w-32 h-20 flex items-center justify-center text-center rounded-lg bg-blue-300 text-white cursor-pointer hover:bg-blue-600"
              >
                {menuItem.name}
              </div>
            ))}
        </div>

        <div className="w-1/3 m-6 border-2 rounded-lg shadow-lg flex flex-col justify-between overflow-hidden">
          <h1 className="text-2xl text-center mt-4 mb-4 bg-gray-200 py-2">
            {table.id ? `Table ${table.number} Order` : "Take-Out Order"}
          </h1>

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
                {pendingOrderItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
          className="bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 rounded-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default OrderInput;
