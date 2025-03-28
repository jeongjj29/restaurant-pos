import { useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import logo from "@assets/sikgaek-logo.png";
import { logout } from "@auth/authSlice";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
// import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";
import LogoutIcon from "@mui/icons-material/Logout";

function NavBar() {
  const dispatch = useDispatch();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const LINK_STYLE =
    "flex items-center gap-3 rounded-md bg-white/5 py-2 px-3 text-base font-medium hover:bg-white/15";

  const SUB_LINK_STYLE =
    "flex items-center gap-3 rounded-md bg-white/5 py-2 px-3 text-base font-medium hover:bg-white/15 ml-8";

  return (
    <div className="flex flex-col h-full p-4 shadow-md">
      <NavLink
        to="/"
        className="flex mb-2 h-36 items-center justify-center rounded-md bg-white/5 p-4"
      >
        <div className="w-32">
          <h1 className="text-3xl font-bold text-center mb-2">Sik Gaek</h1>
          <img src={logo} alt="Sik Gaek Logo" className="w-80 block" />
        </div>
      </NavLink>
      <div className="flex grow flex-col space-x-0 space-y-2">
        <NavLink to="/" className={LINK_STYLE}>
          <HomeIcon />
          <span>Home</span>
        </NavLink>

        <button
          className={LINK_STYLE}
          onClick={() => setOrdersOpen(!ordersOpen)}
        >
          <AssignmentIcon />
          <span>Orders</span>
        </button>

        {/* Orders Dropdown */}
        {ordersOpen && (
          <div className="flex flex-col space-y-2 ml-4">
            <NavLink to="/orders/all" className={SUB_LINK_STYLE}>
              <AssignmentIcon />
              <span>All Orders</span>
            </NavLink>
            <NavLink to="/orders/dinein" className={SUB_LINK_STYLE}>
              <TableRestaurantIcon />
              <span>Dine-In</span>
            </NavLink>
            <NavLink to="/orders/takeout" className={SUB_LINK_STYLE}>
              <TakeoutDiningIcon />
              <span>Take-Out</span>
            </NavLink>
          </div>
        )}

        <button
          className={LINK_STYLE}
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>

        {/* Settings Dropdown */}
        {settingsOpen && (
          <div className="flex flex-col space-y-2 ml-4">
            <NavLink to="/settings/employees" className={SUB_LINK_STYLE}>
              <GroupIcon />
              <span>Employees</span>
            </NavLink>

            <NavLink to="/settings/menu" className={SUB_LINK_STYLE}>
              <MenuBookIcon />
              <span>Menu</span>
            </NavLink>

            <NavLink to="/settings/tables" className={SUB_LINK_STYLE}>
              <TableRestaurantIcon />
              <span>Tables</span>
            </NavLink>

            {/* <NavLink
              to="/settings/reports"
              className={LINK_STYLE}
            >
              <AssessmentIcon />
              <span>Reports</span>
            </NavLink> */}
          </div>
        )}
        <div className="block h-auto w-full grow rounded-md bg-white/5 "></div>
        <button
          onClick={() => {
            dispatch(logout());
          }}
          className={LINK_STYLE}
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default NavBar;
