import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "@assets/sikgaek-logo.png";
import { logout } from "@auth/authSlice";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";
import LogoutIcon from "@mui/icons-material/Logout";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { hasMinimumAccess, MANAGER_ACCESS_LEVEL } from "@auth/access";

function NavBar() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const canViewSettings = hasMinimumAccess(
    currentUser,
    MANAGER_ACCESS_LEVEL
  );
  const signingOut = useAppSelector((state) => state.auth.loading);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [ordersOpen, setOrdersOpen] = useState<boolean>(false);

  const BASE_LINK_STYLE =
    "flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm md:text-base font-semibold transition-all duration-200";

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `${BASE_LINK_STYLE} ${
      isActive
        ? "accent-badge shadow-md"
        : "bg-white/5 text-text-secondary hover:bg-white/12 hover:text-text-primary"
    }`;

  const subLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `${BASE_LINK_STYLE} ml-3 ${
      isActive
        ? "accent-badge shadow-md"
        : "bg-white/5 text-text-secondary hover:bg-white/12 hover:text-text-primary"
    }`;

  return (
    <div className="glass-panel section-shell flex h-full min-h-0 flex-col rounded-2xl p-3">
      <NavLink
        to="/"
        className="mb-2 flex items-center justify-center rounded-xl border border-border/70 p-2.5"
      >
        <div className="w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Sik Gaek
          </h1>
          <img
            src={logo}
            alt="Sik Gaek Logo"
            className="w-36 md:w-44 mx-auto block drop-shadow-lg"
          />
        </div>
      </NavLink>
      <div className="flex grow flex-col space-x-0 space-y-2">
        <NavLink to="/" className={linkClassName}>
          <HomeIcon />
          <span>Home</span>
        </NavLink>

        <button
          type="button"
          aria-expanded={ordersOpen}
          aria-controls="orders-navigation"
          className={`${BASE_LINK_STYLE} bg-white/5 text-text-secondary hover:bg-white/12 hover:text-text-primary`}
          onClick={() => setOrdersOpen(!ordersOpen)}
        >
          <AssignmentIcon />
          <span>Orders</span>
        </button>

        {ordersOpen && (
          <div id="orders-navigation" className="flex flex-col space-y-2 ml-2">
            <NavLink to="/orders/all" className={subLinkClassName}>
              <AssignmentIcon />
              <span>All Orders</span>
            </NavLink>
            <NavLink to="/orders/dinein" className={subLinkClassName}>
              <TableRestaurantIcon />
              <span>Dine-In</span>
            </NavLink>
            <NavLink to="/orders/takeout" className={subLinkClassName}>
              <TakeoutDiningIcon />
              <span>Take-Out</span>
            </NavLink>
          </div>
        )}

        {canViewSettings && (
          <>
            <button
              type="button"
              aria-expanded={settingsOpen}
              aria-controls="settings-navigation"
              className={`${BASE_LINK_STYLE} bg-white/5 text-text-secondary hover:bg-white/12 hover:text-text-primary`}
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>

            {settingsOpen && (
              <div
                id="settings-navigation"
                className="flex flex-col space-y-2 ml-2"
              >
                <NavLink to="/settings/employees" className={subLinkClassName}>
                  <GroupIcon />
                  <span>Employees</span>
                </NavLink>

                <NavLink to="/settings/menu" className={subLinkClassName}>
                  <MenuBookIcon />
                  <span>Menu</span>
                </NavLink>

                <NavLink to="/settings/tables" className={subLinkClassName}>
                  <TableRestaurantIcon />
                  <span>Tables</span>
                </NavLink>

                <NavLink to="/settings/reports" className={subLinkClassName}>
                  <BarChartIcon />
                  <span>Reports</span>
                </NavLink>
              </div>
            )}
          </>
        )}
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        {currentUser && (
          <div className="mb-2 rounded-lg border border-border bg-white/5 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.12em] text-text-disabled">
              Signed in as
            </p>
            <p className="truncate text-sm font-semibold">
              {currentUser.first_name} {currentUser.last_name}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            void dispatch(logout());
          }}
          disabled={signingOut}
          className={`${BASE_LINK_STYLE} bg-rose-500/20 text-rose-200 hover:bg-rose-500/35`}
        >
          <LogoutIcon />
          <span>{signingOut ? "Signing out…" : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}

export default NavBar;
