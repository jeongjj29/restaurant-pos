import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addOrder, fetchOrders } from "../slices/ordersSlice";
import { addOrderItem } from "../slices/orderItemsSlice";
import { TAX_RATE } from "@constants";
import { RootState } from "@app/store";
import { MenuCategory, MenuItem } from "@menu/types";
import MenuItemGrid from "./MenuItemGrid";
import OrderSummaryTable from "./OrderSummaryTable";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { calculateSubtotal } from "@utils/pricingUtils";

interface OrderInputProps {
  tableId?: number;
}

function OrderInput({ tableId }: OrderInputProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const menuCategories = useAppSelector(
    (state: RootState) => state.menuCategories.menuCategories
  );
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>(
    menuCategories[0]
  );
  const [pendingOrderItems, setPendingOrderItems] = useState<
    (MenuItem & { quantity: number })[]
  >([]);
  const tables = useAppSelector((state: RootState) => state.tables.tables);
  const table = tables.find((table) => table.id === tableId);

  const subtotal = calculateSubtotal(pendingOrderItems);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

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
        type: table ? "dine_in" : "take_out",
        total_price: total,
        status: "open",
        sales_tax: TAX_RATE,
        user_id: 1,
        table_id: table?.id || null,
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

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-row h-full w-full">
        <div className="w-fit h-full flex flex-col justify-center m-6">
          {menuCategories.map((menuCategory) => (
            <button
              key={menuCategory.id}
              onClick={() => setSelectedCategory(menuCategory)}
              className="w-full bg-white/10 hover:bg-green-400 text-2xl font-bold py-2 px-2 rounded-sm mb-2"
            >
              {menuCategory.name}
            </button>
          ))}
        </div>

        <MenuItemGrid
          items={selectedCategory?.menu_items || []}
          onClick={handleMenuItemClick}
        />

        <OrderSummaryTable
          items={pendingOrderItems}
          table={table}
          subtotal={subtotal}
          tax={tax}
          total={total}
        />
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
