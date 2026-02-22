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
import { useAppDispatch } from "@app/hooks";

function NavBar() {
  const dispatch = useAppDispatch();
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
          className={`${BASE_LINK_STYLE} bg-white/5 text-text-secondary hover:bg-white/12 hover:text-text-primary`}
          onClick={() => setOrdersOpen(!ordersOpen)}
        >
          <AssignmentIcon />
          <span>Orders</span>
        </button>

        {ordersOpen && (
          <div className="flex flex-col space-y-2 ml-2">
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

        <button
          className={`${BASE_LINK_STYLE} bg-white/5 text-text-secondary hover:bg-white/12 hover:text-text-primary`}
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>

        {settingsOpen && (
          <div className="flex flex-col space-y-2 ml-2">
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
          </div>
        )}
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <button
          onClick={() => {
            dispatch(logout());
          }}
          className={`${BASE_LINK_STYLE} bg-rose-500/20 text-rose-200 hover:bg-rose-500/35`}
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default NavBar;
