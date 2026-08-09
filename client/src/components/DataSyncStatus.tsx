import { useAppSelector } from "@app/hooks";
import { hasMinimumAccess, MANAGER_ACCESS_LEVEL } from "@auth/access";

interface DataSyncStatusProps {
  onRetry: () => void;
}

function DataSyncStatus({ onRetry }: DataSyncStatusProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const employees = useAppSelector((state) => state.employees);
  const roles = useAppSelector((state) => state.roles);
  const menuItems = useAppSelector((state) => state.menuItems);
  const menuCategories = useAppSelector((state) => state.menuCategories);
  const orders = useAppSelector((state) => state.orders);
  const orderItems = useAppSelector((state) => state.orderItems);
  const payments = useAppSelector((state) => state.payments);
  const tables = useAppSelector((state) => state.tables);
  const runtimeConfig = useAppSelector((state) => state.runtimeConfig);
  const canViewManagementData = hasMinimumAccess(
    currentUser,
    MANAGER_ACCESS_LEVEL
  );
  const resources = [
    ...(canViewManagementData
      ? [
          { label: "employees", ...employees },
          { label: "roles", ...roles },
        ]
      : []),
    { label: "menu items", ...menuItems },
    { label: "menu categories", ...menuCategories },
    { label: "orders", ...orders },
    { label: "order items", ...orderItems },
    { label: "payments", ...payments },
    { label: "tables", ...tables },
    { label: "runtime configuration", ...runtimeConfig },
  ];

  const loadingCount = resources.filter((resource) => resource.loading).length;
  const failures = resources.filter((resource) => resource.error);

  if (loadingCount === 0 && failures.length === 0) return null;

  return (
    <div className="mb-2 space-y-2" aria-live="polite">
      {loadingCount > 0 && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-xs text-accent-soft"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          Syncing {loadingCount} {loadingCount === 1 ? "resource" : "resources"}…
        </div>
      )}

      {failures.length > 0 && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm"
        >
          <p className="text-error">
            Could not sync {failures.map((failure) => failure.label).join(", ")}.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-error/40 px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-white/10"
          >
            Retry data sync
          </button>
        </div>
      )}
    </div>
  );
}

export default DataSyncStatus;
