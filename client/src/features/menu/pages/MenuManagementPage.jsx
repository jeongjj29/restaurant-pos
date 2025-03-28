import { useState } from "react";
import MenuItemTable from "@menu/components/MenuItemTable";
import MenuItemForm from "@menu/components/MenuItemForm";
import MenuCategoriesTable from "@menu/components/MenuCategoriesTable";
import MenuCategoryForm from "@menu/components/MenuCategoryForm";
import NavBar from "@menu/components/NavBar";

function MenuManagementPage() {
  const [tab, setTab] = useState("items");
  const [menuItemFormHidden, setMenuItemFormHidden] = useState(true);
  const [menuItemToEdit, setMenuItemToEdit] = useState(null);
  const [menuCategoryFormHidden, setMenuCategoryFormHidden] = useState(true);
  const [menuCategoryToEdit, setMenuCategoryToEdit] = useState(null);

  const handleClick = (field) => {
    setTab(field);
    setMenuItemFormHidden(true);
    setMenuCategoryFormHidden(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface text-text-primary p-6 rounded-md shadow-md">
      <NavBar tab={tab} setTab={handleClick} />

      <div className="flex items-start gap-8">
        {/* Table Section */}
        <div className="w-fit max-w-[750px]">
          {tab === "items" && (
            <MenuItemTable
              setMenuItemToEdit={setMenuItemToEdit}
              setMenuItemFormHidden={setMenuItemFormHidden}
            />
          )}
          {tab === "categories" && (
            <MenuCategoriesTable
              setMenuCategoryToEdit={setMenuCategoryToEdit}
              setMenuCategoryFormHidden={setMenuCategoryFormHidden}
            />
          )}
        </div>

        {/* Form Section */}
        <div className="w-[350px] shrink-0">
          {!menuItemFormHidden && tab === "items" && (
            <MenuItemForm
              menuItemToEdit={menuItemToEdit}
              setMenuItemToEdit={setMenuItemToEdit}
              setMenuItemFormHidden={setMenuItemFormHidden}
            />
          )}
          {!menuCategoryFormHidden && tab === "categories" && (
            <MenuCategoryForm
              menuCategoryToEdit={menuCategoryToEdit}
              setMenuCategoryToEdit={setMenuCategoryToEdit}
              setMenuCategoryFormHidden={setMenuCategoryFormHidden}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuManagementPage;
