import React, { useState } from "react";
// import MenuLayout from "../../features/menu/MenuLayout";
import MenuItemTable from "../../features/menu/MenuItemTable";
import MenuItemForm from "../../features/menu/MenuItemForm";

function MenuManagementPage() {
  const [editFormHidden, setEditFormHidden] = useState(true);
  const [menuItemToEdit, setMenuItemToEdit] = useState(null);

  return (
    <div className="flex flex-row">
      {/* Menu Items Table */}
      <MenuItemTable
        setMenuItemToEdit={setMenuItemToEdit}
        setEditFormHidden={setEditFormHidden}
      />

      {/* Menu Item Form */}
      {!editFormHidden && (
        <MenuItemForm
          menuItemToEdit={menuItemToEdit}
          setMenuItemToEdit={setMenuItemToEdit}
          setEditFormHidden={setEditFormHidden}
        />
      )}
    </div>
  );
}

export default MenuManagementPage;
