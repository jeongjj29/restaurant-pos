import { Outlet } from "react-router-dom";

function SettingsPage() {
  return (
    <div className="h-full min-h-0 rounded-2xl">
      <Outlet />
    </div>
  );
}

export default SettingsPage;
