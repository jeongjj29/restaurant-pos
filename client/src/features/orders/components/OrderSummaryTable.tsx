import { MenuItem } from "@menu/types";
import { Table } from "@tables/types";
import { TAX_RATE } from "@constants";

interface Props {
  items: (MenuItem & { quantity: number })[];
  table: Table | undefined;
  subtotal: number;
  tax: number;
  total: number;
  onClick: () => void;
  submitting: boolean;
}

function OrderSummaryTable({
  items,
  table,
  subtotal,
  tax,
  total,
  onClick,
  submitting,
}: Props) {
  return (
    <div className="w-auto max-h-full m-4 border border-border rounded-lg shadow-lg flex flex-col bg-surface rounded-xl overflow-hidden">
      <h1 className="text-xl font-bold text-center mb-2 py-2 border-b border-border">
        {table ? `Table ${table.number} Order` : "Take-Out Order"}
      </h1>

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
            {items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white/5" : "bg-white/10"}
              >
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                <td className="px-4 py-2">
                  ${(item.price * item.quantity).toFixed(2)}
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

        <button
          disabled={submitting}
          onClick={onClick}
          className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all w-full ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default OrderSummaryTable;
