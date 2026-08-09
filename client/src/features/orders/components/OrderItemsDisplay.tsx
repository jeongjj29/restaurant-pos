import { calculateSubtotal } from "@utils/pricingUtils";
import { Order } from "@orders/types";

interface Props {
  order: Order;
}

function OrderItemsDisplay({ order }: Props) {
  const subtotal = calculateSubtotal(order.order_items);
  const serverTotal = Number(order.total_price);
  const total = Number.isFinite(serverTotal) ? serverTotal : subtotal;
  const tax = Math.max(0, total - subtotal);

  return (
    <div className="flex h-[85vh] max-w-md flex-col justify-between overflow-hidden rounded-lg bg-surface p-6 shadow-lg">
      <div className="flex flex-col mb-4">
        <p className="text-text-primary text-xl font-semibold">
          Order #{order.id}
        </p>
        <p className="text-text-secondary text-md">
          Type: {order.type === "dine_in" ? "Dine-In" : "Take-Out"}
        </p>
        <p>{order.table ? `Table ${order.table.number}` : null}</p>
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
            {order.order_items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white/5" : "bg-white/10"}
              >
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{item.menu_item.name}</td>
                <td className="px-4 py-2">${item.price}</td>
                <td className="px-4 py-2">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
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
