import { useState } from "react";
// import MenuLayout from @features/menu/MenuLayout";
import MenuItemTable from "@features/menu/components/MenuItemTable";
import MenuItemForm from "@features/menu/components/MenuItemForm";
import MenuCategoriesTable from "@features/menu/components/MenuCategoriesTable";
import MenuCategoryForm from "@features/menu/components/MenuCategoryForm";

function MenuManagementPage() {
  const [menuItemFormHidden, setMenuItemFormHidden] = useState(true);
  const [menuItemToEdit, setMenuItemToEdit] = useState(null);
  const [menuCategoryToEdit, setMenuCategoryToEdit] = useState(null);
  const [menuCategoryFormHidden, setMenuCategoryFormHidden] = useState(true);

  return (
    <div className="flex flex-row justify-start">
      {/* Menu Items Table */}
      <MenuItemTable
        setMenuItemToEdit={setMenuItemToEdit}
        setMenuItemFormHidden={setMenuItemFormHidden}
      />

      <MenuCategoriesTable
        setMenuCategoryToEdit={setMenuCategoryToEdit}
        setMenuCategoryFormHidden={setMenuCategoryFormHidden}
      />

      {/* Menu Item Form */}
      {!menuItemFormHidden && (
        <MenuItemForm
          menuItemToEdit={menuItemToEdit}
          setMenuItemToEdit={setMenuItemToEdit}
          setMenuItemFormHidden={setMenuItemFormHidden}
        />
      )}
      {!menuCategoryFormHidden && (
        <MenuCategoryForm
          menuCategoryToEdit={menuCategoryToEdit}
          setMenuCategoryToEdit={setMenuCategoryToEdit}
          setMenuCategoryFormHidden={setMenuCategoryFormHidden}
        />
      )}
    </div>
  );
}

export default MenuManagementPage;
