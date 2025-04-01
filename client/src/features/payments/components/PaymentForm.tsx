import { ErrorMessage, Formik, Field, Form } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addPayment } from "../slices/paymentsSlice";
import { updateOrder } from "@orders/slices/ordersSlice";
import { PaymentType } from "../types";
import { Order } from "@orders/types";
import { AppDispatch } from "@app/store";

interface Props {
  order: Order;
  type: PaymentType;
}

interface FormValues {
  amount: number;
  order_id: number;
  type: PaymentType;
}

const PaymentSchema = yup.object().shape({
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be a positive number"),
});

function PaymentForm({ order, type }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const totalPayments = order.payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return (
    <Formik<FormValues>
      initialValues={{
        amount: 0,
        order_id: order.id,
        type,
      }}
      validationSchema={PaymentSchema}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        setSubmitting(true);

        const paymentAmount = values.amount;
        const newTotalPayments = totalPayments + paymentAmount;

        if (newTotalPayments > order.total_price) {
          alert(
            `Error: The payment exceeds the order balance of $${(
              order.total_price - totalPayments
            ).toFixed(2)}`
          );
          setSubmitting(false);
          return;
        }

        dispatch(addPayment(values))
          .unwrap()
          .then(() => {
            if (newTotalPayments === order.total_price) {
              dispatch(updateOrder({ id: order.id, status: "closed" }))
                .unwrap()
                .then(() => {
                  resetForm();
                  setSubmitting(false);
                  navigate("/");
                })
                .catch((err) => {
                  console.error(err);
                  setSubmitting(false);
                });
            } else {
              setSubmitting(false);
              resetForm();
            }
          })
          .catch((err) => {
            console.error(err);
            setSubmitting(false);
          });
      }}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="p-4 space-y-4 bg-white shadow-md rounded-sm">
          <div>
            <label htmlFor="order_id">Order ID:</label>
            <Field
              name="order_id"
              type="text"
              readOnly
              className="w-full border border-gray-300 p-2 rounded-sm mt-1"
            />
          </div>

          <div>
            <label htmlFor="type">Payment Type:</label>
            <Field
              name="type"
              type="text"
              readOnly
              className="w-full border border-gray-300 p-2 rounded-sm mt-1"
            />
          </div>

          <div>
            <label htmlFor="amount">Amount:</label>
            <Field
              name="amount"
              type="number"
              placeholder="Enter amount"
              className="w-full border border-gray-300 p-2 rounded-sm mt-1"
            />
            <ErrorMessage
              name="amount"
              component="div"
              className="text-red-600 text-sm mt-1"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-sm"
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
