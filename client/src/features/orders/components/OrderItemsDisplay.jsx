import React from "react";
import { subtotalPrice, taxPrice, totalPriceWithTax } from "../../../utils";

function OrderItemsDisplay({ table, orderItems, orderId }) {
  return (
    <div className="w-1/3 h-5/6 m-6 border-2 rounded-lg shadow-lg flex flex-col justify-between overflow-hidden">
      <p>Order #{orderId}</p>
      <p>Type: {table ? "Dine-In" : "Take-Out"}</p>

      {/* Scrollable Menu Items */}
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-300 text-white sticky top-0 z-10">
            <tr>
              <th className="py-2 px-4 text-left">Quantity</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orderItems.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              >
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4">{item.menu_item.name}</td>
                <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                <td className="py-2 px-4">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer aligned to bottom-right */}
      <div className="flex justify-end items-end w-full mt-4 p-4 bg-gray-100">
        <table className="w-auto">
          <tfoot>
            <tr>
              <td className="py-2 px-4 font-bold text-right">SUBTOTAL</td>
              <td className="py-2 px-4 font-bold">
                ${subtotalPrice(orderItems).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-bold text-right">TAX</td>
              <td className="py-2 px-4 font-bold">
                ${taxPrice(orderItems).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-bold text-right">TOTAL</td>
              <td className="py-2 px-4 font-bold">
                ${totalPriceWithTax(orderItems).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default OrderItemsDisplay;
