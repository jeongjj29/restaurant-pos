import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

function App() {
  return (
    <div className="h-screen w-screen flex flex-row">
      {/* NavBar with fixed width */}
      <NavBar className="w-64 bg-gray-800" />

      {/* Outlet to take the remaining space */}
      <div className="flex-grow bg-gray-100 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
