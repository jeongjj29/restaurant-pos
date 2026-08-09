import { Order } from "@orders/types";

interface OrderDetailsProps {
  order: Order | null;
}

function OrderDetails({ order }: OrderDetailsProps) {
  if (!order) return null;

  const items = order.order_items ?? [];
  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );
  const storedTotal = Number(order.total_price);
  const total = Number.isFinite(storedTotal) ? storedTotal : subtotal;
  const tax = Math.max(0, total - subtotal);

  return (
    <section className="flex max-h-full flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border p-4">
        <h1 className="text-xl text-text-primary">Order #{order.id}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {order.type === "take_out" ? "Take-out" : "Dine-in"} · {order.status}
        </p>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm text-text-primary">
          <thead className="sticky top-0 z-10 bg-surface-raised text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
              const price = Number(item.price);
              return (
                <tr key={item.id} className="odd:bg-white/5">
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{item.menu_item.name}</td>
                  <td className="px-4 py-3 text-right">${price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    ${(item.quantity * price).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="p-4 text-sm text-text-secondary">No line items found.</p>
        )}
      </div>

      <dl className="mt-auto grid grid-cols-2 gap-y-2 border-t border-border bg-black/15 p-4 text-sm">
        <dt className="text-text-secondary">Subtotal</dt>
        <dd className="text-right font-semibold">${subtotal.toFixed(2)}</dd>
        <dt className="text-text-secondary">Tax</dt>
        <dd className="text-right font-semibold">${tax.toFixed(2)}</dd>
        <dt className="text-base font-bold">Total</dt>
        <dd className="text-right text-base font-bold">${total.toFixed(2)}</dd>
      </dl>
    </section>
  );
}

export default OrderDetails;
