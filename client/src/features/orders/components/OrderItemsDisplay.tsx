import { calculateSubtotal } from "@utils/pricingUtils";
import { TAX_RATE } from "@constants";
import { OrderItem } from "@orders/types";
import { Table } from "@features/tables/types";

interface Props {
  table: Table | undefined;
  orderItems: OrderItem[];
  orderId: number;
}

function OrderItemsDisplay({ table, orderItems, orderId }: Props) {
  const subtotal = calculateSubtotal(orderItems);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="h-full bg-surface p-6 rounded-lg shadow-lg flex flex-col justify-between overflow-hidden h-[85vh] max-w-md">
      <div className="flex flex-col mb-4">
        <p className="text-text-primary text-xl font-semibold">
          Order #{orderId}
        </p>
        <p className="text-text-secondary text-md">
          Type: {table ? "Dine-In" : "Take-Out"}
        </p>
        <p>{table ? `Table ${table.number}` : null}</p>
      </div>

      <div className="flex-grow overflow-y-auto">
        <table className="min-w-full text-sm text-left text-text-primary">
          <thead className="bg-white/5 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white/5" : "bg-white/10"}
              >
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{item.menu_item.name}</td>
                <td className="px-4 py-2">${item.price}</td>
                <td className="px-4 py-2">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-surface rounded-lg shadow-sm">
        <table className="text-sm w-auto ml-auto mb-4">
          <tfoot className="text-right">
            <tr>
              <td className="py-1 px-4 font-semibold text-text-secondary">
                Subtotal
              </td>
              <td className="py-1 px-4 font-bold">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-1 px-4 font-semibold text-text-secondary">
                Tax
              </td>
              <td className="py-1 px-4 font-bold">${tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-semibold text-text-secondary text-lg">
                Total
              </td>
              <td className="py-2 px-4 font-bold text-lg">
                ${total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default OrderItemsDisplay;
