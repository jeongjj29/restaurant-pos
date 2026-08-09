import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addOrder } from "../slices/ordersSlice";
import { RootState } from "@app/store";
import { MenuItem } from "@menu/types";
import MenuItemGrid from "./MenuItemGrid";
import OrderSummaryTable from "./OrderSummaryTable";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import {
  calculateOrderPreview,
  calculateSubtotal,
} from "@utils/pricingUtils";

interface OrderInputProps {
  tableId?: number;
}

function OrderInput({ tableId }: OrderInputProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const menuCategories = useAppSelector(
    (state: RootState) => state.menuCategories.menuCategories
  );
  const menuItems = useAppSelector(
    (state: RootState) => state.menuItems.menuItems
  );
  const tables = useAppSelector((state: RootState) => state.tables.tables);
  const runtimeConfig = useAppSelector(
    (state: RootState) => state.runtimeConfig
  );
  const table = tables.find((table) => table.id === tableId);
  const isDineIn = tableId !== undefined;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [pendingOrderItems, setPendingOrderItems] = useState<
    (MenuItem & { quantity: number })[]
  >([]);

  const subtotal = calculateSubtotal(pendingOrderItems);
  const preview =
    runtimeConfig.salesTaxRate === null
      ? null
      : calculateOrderPreview(subtotal, runtimeConfig.salesTaxRate);
  const visibleMenuItems = menuItems.filter(
    (menuItem) => menuItem.category_id === selectedCategoryId
  );

  useEffect(() => {
    if (menuCategories.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    const selectedCategoryStillExists = menuCategories.some(
      (category) => category.id === selectedCategoryId
    );
    if (!selectedCategoryStillExists) {
      setSelectedCategoryId(menuCategories[0].id);
    }
  }, [menuCategories, selectedCategoryId]);

  useEffect(() => {
    setPendingOrderItems((pendingItems) =>
      pendingItems.flatMap((pendingItem) => {
        const currentItem = menuItems.find((item) => item.id === pendingItem.id);
        return currentItem
          ? [{ ...currentItem, quantity: pendingItem.quantity }]
          : [];
      })
    );
  }, [menuItems]);

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
    if (runtimeConfig.salesTaxRate === null) {
      setSubmitError(
        "Sales tax configuration is unavailable. Retry data sync before submitting."
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await dispatch(
        addOrder({
          type: isDineIn ? "dine_in" : "take_out",
          table_id: tableId ?? null,
          items: pendingOrderItems.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
          })),
        })
      ).unwrap();
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
            onClick={() => setSelectedCategoryId(menuCategory.id)}
            aria-pressed={selectedCategoryId === menuCategory.id}
            className={`min-w-32 rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors xl:w-full ${
              selectedCategoryId === menuCategory.id
                ? "bg-accent text-[#241102]"
                : "bg-white/5 text-text-primary hover:bg-white/10"
            }`}
          >
            {menuCategory.name}
          </button>
        ))}
      </div>

      <MenuItemGrid items={visibleMenuItems} onClick={handleMenuItemClick} />

      <OrderSummaryTable
        items={pendingOrderItems}
        table={table}
        subtotal={subtotal}
        tax={preview?.tax ?? null}
        total={preview?.total ?? null}
        configurationLoading={runtimeConfig.loading}
        configurationError={runtimeConfig.error}
        isDineIn={isDineIn}
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
