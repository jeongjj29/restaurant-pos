import { ErrorMessage, Formik, Field, Form } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { addPayment } from "./paymentsSlice";

const PaymentSchema = yup.object().shape({
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be a positive number"),
});

function PaymentForm({ order, type }) {
  const dispatch = useDispatch();

  return (
    <Formik
      initialValues={{
        amount: "",
        order_id: order.id,
        type: type,
      }}
      validationSchema={PaymentSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        dispatch(addPayment(values))
          .unwrap()
          .then(() => {
            setSubmitting(false);
          })
          .catch((err) => {
            console.error(err);
            setSubmitting(false);
          });
      }}
      enableReinitialize // Correct placement of enableReinitialize
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
