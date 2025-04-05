import { useEffect, useState } from "react";
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
  const tables = useAppSelector((state: RootState) => state.tables.tables);
  const table = tables.find((table) => table.id === tableId);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>(
    menuCategories[0]
  );
  const [pendingOrderItems, setPendingOrderItems] = useState<
    (MenuItem & { quantity: number })[]
  >([]);

  const subtotal = calculateSubtotal(pendingOrderItems);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  useEffect(() => {
    if (menuCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(menuCategories[0]);
    }
  }, [menuCategories]);

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

  const handleOrderSubmit = async () => {
    try {
      setSubmitting(true);
      const order = await dispatch(
        addOrder({
          type: table ? "dine_in" : "take_out",
          total_price: total,
          status: "open",
          sales_tax: TAX_RATE,
          user_id: 1,
          table_id: table?.id || null,
        })
      ).unwrap();
      await Promise.all(
        pendingOrderItems.map((item) =>
          dispatch(
            addOrderItem({
              order_id: order.id,
              menu_item_id: item.id,
              price: item.price,
              quantity: item.quantity,
            })
          )
        )
      );
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setSubmitting(false);
      dispatch(fetchOrders());
      navigate("/orders/all");
    }
  };

  return (
    <div className="flex flex-row h-full w-full bg-white/5 rounded-md justify-between">
      <div className="w-1/8 overflow-y-auto flex flex-col justify-start m-4">
        {menuCategories.map((menuCategory) => (
          <button
            key={menuCategory.id}
            onClick={() => setSelectedCategory(menuCategory)}
            className={`w-full hover:bg-green-400 text-xl font-bold py-2 px-2 rounded-sm mb-2 ${
              selectedCategory?.id === menuCategory.id
                ? "bg-white/15"
                : "bg-white/5"
            }`}
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
        onClick={handleOrderSubmit}
        submitting={submitting}
      />
    </div>
  );
}

export default OrderInput;
