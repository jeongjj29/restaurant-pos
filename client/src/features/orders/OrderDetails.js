import React from "react";
import { TAX_RATE } from "../../constants";

function OrderDetails({ order }) {
  if (!order) {
    return null;
  }

  const subtotal = order.order_items.reduce(
    (acc, item) => acc + item.menu_item.price * item.quantity,
    0
  );
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = subtotal + tax;

  return (
    <div className=" m-6 flex flex-col justify-between overflow-hidden border-2 rounded-lg shadow-lg">
      <h1 className="text-2xl text-center mt-4 mb-4">Order #{order.id}</h1>
      <p>Type: {order.type === "take_out" ? "TAKE-OUT" : "DINE-IN"}</p>
      <div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-300 text-white sticky top-0 z-10">
            <tr>
              <th className="py-2 px-4 text-left">Quantity</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr
                key={item.id}
                className={item.id % 2 === 0 ? "bg-white" : "bg-gray-100"}
              >
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4">{item.menu_item.name}</td>
                <td className="py-2 px-4">
                  ${item.menu_item.price.toFixed(2)}
                </td>
                <td className="py-2 px-4">
                  ${(item.quantity * item.menu_item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end items-end w-full mt-4 p-4 bg-gray-100">
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

export default OrderDetails;
