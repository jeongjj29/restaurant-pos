import { ErrorMessage, Formik, Field, Form } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { addPayment } from "./paymentsSlice";
import { updateOrder } from "../orders/ordersSlice"; // Import your new action

const PaymentSchema = yup.object().shape({
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be a positive number"),
});

function PaymentForm({ order, type }) {
  const dispatch = useDispatch();

  const totalPayments = order.payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return (
    <Formik
      initialValues={{
        amount: "",
        order_id: order.id,
        type: type,
      }}
      validationSchema={PaymentSchema}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        setSubmitting(true);

        // Parse amount to float and calculate new total payments
        const paymentAmount = parseFloat(values.amount);
        const newTotalPayments = totalPayments + paymentAmount;

        if (newTotalPayments > order.total_price) {
          // Handle overpayment scenario if total exceeds order total price
          alert(
            `Error: The payment exceeds the order total of ${order.total_price}`
          );
          setSubmitting(false);
          return;
        }

        // Dispatch the addPayment action
        dispatch(addPayment(values))
          .unwrap()
          .then(() => {
            // If the new total payments equals the order total price
            if (newTotalPayments === order.total_price) {
              // Dispatch the updateOrder action to mark the order as "closed"
              dispatch(updateOrder({ orderId: order.id, status: "closed" }));
            }
            setSubmitting(false);
            resetForm(); // Optional: Reset the form after successful submission
          })
          .catch((err) => {
            console.error(err);
            setSubmitting(false);
          });
      }}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="p-4 space-y-4 bg-white shadow-md rounded">
          {/* Order ID (Read-Only) */}
          <div>
            <label htmlFor="order_id">Order ID:</label>
            <Field
              name="order_id"
              type="text"
              readOnly
              className="w-full border border-gray-300 p-2 rounded mt-1"
            />
          </div>

          {/* Type (Read-Only) */}
          <div>
            <label htmlFor="type">Payment Type:</label>
            <Field
              name="type"
              type="text"
              readOnly
              className="w-full border border-gray-300 p-2 rounded mt-1"
            />
          </div>

          {/* Amount (Editable) */}
          <div>
            <label htmlFor="amount">Amount:</label>
            <Field
              name="amount"
              type="number"
              placeholder="Enter amount"
              className="w-full border border-gray-300 p-2 rounded mt-1"
            />
            <ErrorMessage
              name="amount"
              component="div"
              className="text-red-600 text-sm mt-1"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              {isSubmitting ? "Submitting..." : "Submit Payment"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default PaymentForm;
