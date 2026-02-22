import { NavLink } from "react-router-dom";
import { useAppSelector } from "@app/hooks";
import { RootState } from "@app/store";

function Home() {
  const orders = useAppSelector((state: RootState) => state.orders.orders);
  const openOrders = orders.filter((order) => order.status === "open").length;
  const employees = useAppSelector(
    (state: RootState) => state.employees.employees.length
  );
  const menuItems = useAppSelector(
    (state: RootState) => state.menuItems.menuItems.length
  );
  const tables = useAppSelector((state: RootState) => state.tables.tables.length);

  const cards = [
    { label: "Open Orders", value: openOrders, to: "/orders/all" },
    { label: "Team Members", value: employees, to: "/settings/employees" },
    { label: "Menu Items", value: menuItems, to: "/settings/menu" },
    { label: "Dining Tables", value: tables, to: "/settings/tables" },
  ];

  return (
    <div className="h-full rounded-2xl p-3 md:p-4">
      <div className="mb-4">
        <p className="text-text-secondary uppercase tracking-[0.2em] text-xs mb-2">
          Daily Overview
        </p>
        <h1 className="text-3xl md:text-5xl font-bold">Restaurant Control Desk</h1>
        <p className="mt-3 text-text-secondary max-w-2xl">
          Monitor service volume, manage floor operations, and jump into the next
          action instantly.
        </p>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <NavLink
            key={card.label}
            to={card.to}
            className="glass-panel rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
          >
            <p className="text-sm text-text-secondary mb-3">{card.label}</p>
            <p className="text-4xl font-bold">{card.value}</p>
          </NavLink>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <NavLink
            to="/orders/dinein"
            className="accent-badge rounded-lg px-4 py-2.5 text-sm"
          >
            Start Dine-In Order
          </NavLink>
          <NavLink
            to="/orders/takeout"
            className="accent-badge rounded-lg px-4 py-2.5 text-sm"
          >
            Start Take-Out Order
          </NavLink>
          <NavLink
            to="/orders/all"
            className="rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm text-text-primary hover:bg-white/10"
          >
            Review All Orders
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Home;
