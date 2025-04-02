import { MenuItem } from "@menu/types";
import { Table } from "@tables/types";
import { TAX_RATE } from "@constants";

interface Props {
  items: (MenuItem & { quantity: number })[];
  table: Table | undefined;
  subtotal: number;
  tax: number;
  total: number;
}

function OrderSummaryTable({ items, table, subtotal, tax, total }: Props) {
  return (
    <div className="w-auto h-full m-6 border-border rounded-lg shadow-lg flex flex-col overflow-hidden">
      <h1 className="text-2xl text-center mt-4 mb-4 bg-white/5 py-2">
        {table ? `Table ${table.number} Order` : "Take-Out Order"}
      </h1>

      <div className="max-h-80 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white/5">
          <thead className="bg-white/5 text-white sticky top-0 z-10">
            <tr>
              <th className="py-2 px-4 text-left">Quantity</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white/5" : "bg-white/10"}
              >
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                <td className="py-2 px-4">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-end w-full mt-4 p-4 bg-white/5">
        <table className="w-auto">
          <tfoot>
            <tr>
              <td className="py-2 px-4 font-bold text-right">SUBTOTAL</td>
              <td className="py-2 px-4 font-bold">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-bold text-right">TAX</td>
              <td className="py-2 px-4 font-bold">${tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-bold text-right">TOTAL</td>
              <td className="py-2 px-4 font-bold">${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default OrderSummaryTable;
