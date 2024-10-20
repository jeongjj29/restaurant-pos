import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

function App() {
  return (
    <div className="h-screen w-screen flex flex-row bg-gray-100">
      {/* NavBar with fixed width and full height */}
      <NavBar className="w-64 h-full bg-gray-800 shadow-lg" />

      {/* Outlet to take the remaining space */}
      <div className="flex-1 h-full p-6 bg-white shadow-inner">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
