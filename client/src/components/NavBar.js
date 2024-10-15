import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";

function NavBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  return (
    <div className="h-full w-48 bg-gray-200 p-4 shadow-md">
      <nav className="flex flex-col space-y-4">
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
        >
          <HomeIcon className="text-gray-500" />
          <span>Home</span>
        </NavLink>

        <button
          className="flex items-center space-x-2 text-left text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
          onClick={() => setOrdersOpen(!ordersOpen)}
        >
          <AssignmentIcon className="text-gray-500" />
          <span>Orders</span>
        </button>

        {/* Orders Dropdown */}
        {ordersOpen && (
          <div className="flex flex-col space-y-2 ml-4">
            <NavLink
              to="/orders/all"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
            >
              <AssignmentIcon className="text-gray-500" />
              <span>All Orders</span>
            </NavLink>
            <NavLink
              to="/orders/takeout"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
            >
              <TakeoutDiningIcon className="text-gray-500" />
              <span>Take-Out</span>
            </NavLink>
          </div>
        )}

        <button
          className="flex items-center space-x-2 text-left text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <SettingsIcon className="text-gray-500" />
          <span>Settings</span>
        </button>

        {/* Settings Dropdown */}
        {settingsOpen && (
          <div className="flex flex-col space-y-2 ml-4">
            <NavLink
              to="/settings/employees"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
            >
              <GroupIcon className="text-gray-500" />
              <span>Employees</span>
            </NavLink>

            <NavLink
              to="/settings/menu"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
            >
              <MenuBookIcon className="text-gray-500" />
              <span>Menu</span>
            </NavLink>

            <NavLink
              to="/settings/tables"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
            >
              <TableRestaurantIcon className="text-gray-500" />
              <span>Tables</span>
            </NavLink>

            <NavLink
              to="/settings/reports"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-200 p-2 rounded transition"
            >
              <AssessmentIcon className="text-gray-500" />
              <span>Reports</span>
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
}

export default NavBar;
