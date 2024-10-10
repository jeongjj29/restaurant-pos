import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

function App() {
  return (
    <div className="h-screen w-screen flex flex-row">
      <NavBar />
      <div className="">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
