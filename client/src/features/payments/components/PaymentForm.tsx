import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@app/hooks";
import { addPayment, fetchPayments } from "@payments/slices/paymentsSlice";
import { fetchOrders } from "@orders/slices/ordersSlice";
import { fetchTables } from "@tables/slices/tablesSlice";
import { PaymentType } from "@payments/types";
import { Order } from "@orders/types";
import {
  centsToMoney,
  getPaidCents,
  getRemainingCents,
  moneyToCents,
} from "@payments/paymentMath";

interface Props {
  order: Order;
  type: PaymentType;
}

interface FormValues {
  amount: number;
}

type Feedback = { kind: "error" | "success"; message: string } | null;

const getErrorMessage = (error: unknown): string =>
  typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : "Unable to record the payment. Please try again.";

function PaymentForm({ order, type }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback>(null);

  const totalCents = moneyToCents(order.total_price);
  const paidCents = getPaidCents(order);
  const remainingCents = getRemainingCents(order);
  const remainingBalance = centsToMoney(remainingCents);

  const PaymentSchema = yup.object({
    amount: yup
      .number()
      .typeError("Enter a valid payment amount")
      .required("Amount is required")
      .positive("Amount must be greater than $0.00")
      .max(
        remainingBalance,
        `Amount cannot exceed $${remainingBalance.toFixed(2)}`
      ),
  });

  if (order.status === "closed" || remainingCents === 0) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-success">
        <h3 className="font-semibold">Order settled</h3>
        <p className="mt-1 text-sm">No balance remains on this order.</p>
      </div>
    );
  }

  return (
    <Formik<FormValues>
      initialValues={{ amount: remainingBalance }}
      validationSchema={PaymentSchema}
      enableReinitialize
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        setFeedback(null);
        const amountCents = moneyToCents(values.amount);

        if (amountCents <= 0 || amountCents > remainingCents) {
          setFeedback({
            kind: "error",
            message: `Enter an amount from $0.01 to $${remainingBalance.toFixed(2)}.`,
          });
          setSubmitting(false);
          return;
        }

        let paymentRecorded = false;
        try {
          await dispatch(
            addPayment({
              amount: centsToMoney(amountCents),
              order_id: order.id,
              type,
            })
          ).unwrap();
          paymentRecorded = true;

          const [orders] = await Promise.all([
            dispatch(fetchOrders()).unwrap(),
            dispatch(fetchPayments()).unwrap(),
            dispatch(fetchTables()).unwrap(),
          ]);
          const refreshedOrder = orders.find(
            (candidate) => candidate.id === order.id
          );

          resetForm();
          if (refreshedOrder?.status === "closed") {
            navigate("/orders/all", { replace: true });
            return;
          }

          const refreshedRemaining = refreshedOrder
            ? centsToMoney(getRemainingCents(refreshedOrder))
            : centsToMoney(remainingCents - amountCents);
          setFeedback({
            kind: "success",
            message: `Payment recorded. Remaining balance: $${refreshedRemaining.toFixed(2)}.`,
          });
        } catch (error) {
          setFeedback({
            kind: "error",
            message: paymentRecorded
              ? "Payment was recorded, but the latest order state could not be loaded. Return to Orders before trying again."
              : getErrorMessage(error),
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 rounded-xl border border-border bg-surface-raised p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-black/15 p-3 text-sm">
            <dt className="text-text-secondary">Order</dt>
            <dd className="text-right font-semibold">#{order.id}</dd>
            <dt className="text-text-secondary">Method</dt>
            <dd className="text-right font-semibold uppercase">{type}</dd>
            <dt className="text-text-secondary">Order total</dt>
            <dd className="text-right">${centsToMoney(totalCents).toFixed(2)}</dd>
            <dt className="text-text-secondary">Paid</dt>
            <dd className="text-right">${centsToMoney(paidCents).toFixed(2)}</dd>
            <dt className="font-semibold text-text-primary">Balance</dt>
            <dd className="text-right font-bold text-accent">
              ${remainingBalance.toFixed(2)}
            </dd>
          </dl>

          <div>
            <label htmlFor="payment-amount" className="font-semibold">
              Payment amount
            </label>
            <Field
              id="payment-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              max={remainingBalance}
              step="0.01"
              className="mt-1 w-full rounded-lg border border-border bg-black/20 p-3 text-text-primary focus:border-accent focus:outline-none"
            />
            <ErrorMessage
              name="amount"
              component="div"
              className="mt-1 text-sm text-error"
            />
          </div>

          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={`rounded-lg p-3 text-sm ${
                feedback.kind === "error"
                  ? "bg-error/10 text-error"
                  : "bg-success/10 text-success"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="accent-badge w-full rounded-lg px-4 py-3 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Recording payment..." : "Record payment"}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default PaymentForm;
