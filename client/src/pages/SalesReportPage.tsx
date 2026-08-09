import { useMemo } from "react";

import { useAppSelector } from "@app/hooks";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function SalesReportsPage() {
  const orders = useAppSelector((state) => state.orders.orders);
  const ordersLoading = useAppSelector((state) => state.orders.loading);
  const ordersError = useAppSelector((state) => state.orders.error);
  const payments = useAppSelector((state) => state.payments.payments);
  const paymentsLoading = useAppSelector((state) => state.payments.loading);
  const paymentsError = useAppSelector((state) => state.payments.error);

  const report = useMemo(() => {
    const revenue = payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );
    const paidOrderIds = new Set(payments.map((payment) => payment.order_id));
    const paymentMix = payments.reduce<Record<string, number>>((mix, payment) => {
      const type = payment.type || "other";
      mix[type] = (mix[type] ?? 0) + Number(payment.amount);
      return mix;
    }, {});

    return {
      revenue,
      averageTicket: paidOrderIds.size > 0 ? revenue / paidOrderIds.size : 0,
      openOrders: orders.filter((order) => order.status === "open").length,
      closedOrders: orders.filter((order) => order.status === "closed").length,
      paymentMix: Object.entries(paymentMix).sort(([, a], [, b]) => b - a),
    };
  }, [orders, payments]);

  const isLoading = ordersLoading || paymentsLoading;
  const error = ordersError || paymentsError;

  return (
    <div className="h-full rounded-2xl p-3 md:p-4">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
            Live service snapshot
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Sales reports</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Totals update from orders and recorded payments in this workspace.
          </p>
        </div>
        {isLoading && (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent-soft">
            Refreshing…
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-error/40 bg-error/10 p-3 text-sm text-error"
        >
          Some report data is unavailable: {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Recorded revenue", value: currency.format(report.revenue) },
          { label: "Average paid ticket", value: currency.format(report.averageTicket) },
          { label: "Open orders", value: report.openOrders.toString() },
          { label: "Closed orders", value: report.closedOrders.toString() },
        ].map((metric) => (
          <div key={metric.label} className="glass-panel rounded-xl p-4">
            <p className="text-sm text-text-secondary">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white/5 p-4">
        <h2 className="text-lg font-semibold">Payment mix</h2>
        {report.paymentMix.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-border p-5 text-sm text-text-secondary">
            No payments have been recorded yet. Complete an order to populate this
            report.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {report.paymentMix.map(([type, amount]) => {
              const share = report.revenue > 0 ? (amount / report.revenue) * 100 : 0;
              return (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="capitalize text-text-secondary">{type}</span>
                    <span className="font-semibold">{currency.format(amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesReportsPage;
