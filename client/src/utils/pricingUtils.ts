import { MenuItem } from "@features/menu/types";
import { OrderItem } from "@features/orders/types";

export const calculateSubtotal = (
  items: (MenuItem & { quantity: number })[] | OrderItem[]
): number => items.reduce((acc, item) => acc + item.price * item.quantity, 0);
