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
import { fetchTables } from "@tables/slices/tablesSlice";

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
  const currentUser = useAppSelector((state: RootState) => state.auth.user);
  const table = tables.find((table) => table.id === tableId);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(
    null
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
  }, [menuCategories, selectedCategory]);

  const handleMenuItemClick = (menuItem: MenuItem) => {
    setSubmitError(null);
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

  const handleQuantityChange = (menuItemId: number, change: number) => {
    setSubmitError(null);
    setPendingOrderItems((items) =>
      items.flatMap((item) => {
        if (item.id !== menuItemId) return [item];
        const quantity = item.quantity + change;
        return quantity > 0 ? [{ ...item, quantity }] : [];
      })
    );
  };

  const handleRemoveItem = (menuItemId: number) => {
    setSubmitError(null);
    setPendingOrderItems((items) =>
      items.filter((item) => item.id !== menuItemId)
    );
  };

  const getErrorMessage = (error: unknown) =>
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "Unable to submit the order. Please try again.";

  const handleOrderSubmit = async () => {
    if (submitting) return;
    if (pendingOrderItems.length === 0) {
      setSubmitError("Add at least one menu item before submitting the order.");
      return;
    }
    if (!currentUser) {
      setSubmitError("Your session is missing a user. Please sign in again.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const order = await dispatch(
        addOrder({
          type: table ? "dine_in" : "take_out",
          total_price: Number(total.toFixed(2)),
          status: "open",
          sales_tax: TAX_RATE,
          user_id: currentUser.id,
          table_id: table?.id || null,
        })
      ).unwrap();
      await Promise.all(
        pendingOrderItems.map((item) =>
          dispatch(
            addOrderItem({
              order_id: order.id,
              menu_item_id: item.id,
              price: Number(item.price),
              quantity: item.quantity,
            })
          ).unwrap()
        )
      );
      await Promise.all([
        dispatch(fetchOrders()).unwrap(),
        dispatch(fetchTables()).unwrap(),
      ]);
      navigate("/orders/all", { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-xl bg-white/5 p-3 xl:flex-row">
      <div className="flex shrink-0 gap-2 overflow-x-auto xl:w-44 xl:flex-col xl:overflow-y-auto">
        {menuCategories.map((menuCategory) => (
          <button
            type="button"
            key={menuCategory.id}
            onClick={() => setSelectedCategory(menuCategory)}
            aria-pressed={selectedCategory?.id === menuCategory.id}
            className={`min-w-32 rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors xl:w-full ${
              selectedCategory?.id === menuCategory.id
                ? "bg-accent text-[#241102]"
                : "bg-white/5 text-text-primary hover:bg-white/10"
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
        error={submitError}
        onIncrement={(itemId) => handleQuantityChange(itemId, 1)}
        onDecrement={(itemId) => handleQuantityChange(itemId, -1)}
        onRemove={handleRemoveItem}
      />
    </div>
  );
}

export default OrderInput;
