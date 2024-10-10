import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

function NavBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="h-full w-48 bg-slate-200">
      <nav className="flex flex-col ">
        <NavLink to="/">
          <HomeIcon /> Home
        </NavLink>
        <button
          className="text-left"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <SettingsIcon /> Settings
        </button>
        {settingsOpen ? (
          <div className="flex flex-col ml-8">
            <NavLink to="/settings/employees">
              <GroupIcon /> Employees
            </NavLink>
            <NavLink to="/settings/menu">
              <MenuBookIcon /> Menu
            </NavLink>
            <NavLink to="/settings/tables">
              <TableRestaurantIcon /> Tables
            </NavLink>
            <NavLink to="/settings/reports">
              <AssessmentIcon /> Reports
            </NavLink>
          </div>
        ) : null}
      </nav>
    </div>
  );
}

export default NavBar;
