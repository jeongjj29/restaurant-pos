import { MenuItem } from "@menu/types";
import { Table } from "@tables/types";

interface Props {
  items: (MenuItem & { quantity: number })[];
  table: Table | undefined;
  subtotal: number;
  tax: number;
  total: number;
  onClick: () => void;
  submitting: boolean;
  error: string | null;
  onIncrement: (itemId: number) => void;
  onDecrement: (itemId: number) => void;
  onRemove: (itemId: number) => void;
}

function OrderSummaryTable({
  items,
  table,
  subtotal,
  tax,
  total,
  onClick,
  submitting,
  error,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  return (
    <section className="flex max-h-full min-h-[24rem] w-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg xl:w-[26rem]">
      <h1 className="border-b border-border py-3 text-center text-xl font-bold">
        {table ? `Table ${table.number} Order` : "Take-Out Order"}
      </h1>

      <div className="flex-grow overflow-auto">
        <table className="min-w-full text-sm text-left text-text-primary">
          <thead className="bg-white/5 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white/5" : "bg-white/10"}
              >
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">${item.price}</td>
                <td className="px-4 py-2">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onDecrement(item.id)}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="h-8 w-8 rounded-md border border-border bg-white/5 font-bold hover:bg-white/10"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => onIncrement(item.id)}
                      aria-label={`Increase ${item.name} quantity`}
                      className="h-8 w-8 rounded-md border border-border bg-white/5 font-bold hover:bg-white/10"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="rounded-md px-2 py-1.5 text-error hover:bg-error/10"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-white/5 border-t border-border">
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

        {items.length === 0 && !error && (
          <p className="mb-3 text-center text-sm text-text-secondary">
            Add at least one item to submit this order.
          </p>
        )}
        {error && (
          <p role="alert" className="mb-3 rounded-lg bg-error/10 p-3 text-sm text-error">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={submitting || items.length === 0}
          onClick={onClick}
          className="accent-badge w-full rounded-lg px-6 py-2.5 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </section>
  );
}

export default OrderSummaryTable;
