import { useState } from "react";
import MenuItemTable from "@menu/components/MenuItemTable";
import MenuItemForm from "@menu/components/MenuItemForm";
import MenuCategoriesTable from "@menu/components/MenuCategoriesTable";
import MenuCategoryForm from "@menu/components/MenuCategoryForm";
import NavBar from "@menu/components/NavBar";
import { MenuCategory, MenuItem } from "@menu/types";

type TabKey = "items" | "categories" | "layout";

function MenuManagementPage() {
  const [tab, setTab] = useState<TabKey>("items");
  const [menuItemFormHidden, setMenuItemFormHidden] = useState(true);
  const [menuItemToEdit, setMenuItemToEdit] = useState<MenuItem | null>(null);
  const [menuCategoryFormHidden, setMenuCategoryFormHidden] = useState(true);
  const [menuCategoryToEdit, setMenuCategoryToEdit] =
    useState<MenuCategory | null>(null);

  const handleClick = (field: TabKey) => {
    setTab(field);
    setMenuItemFormHidden(true);
    setMenuCategoryFormHidden(true);
  };

  return (
    <div className="glass-panel flex h-full min-h-0 w-full flex-col rounded-2xl p-3 md:p-4">
      <NavBar tab={tab} setTab={handleClick} />

      <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="min-h-0 overflow-auto">
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

        <div className="min-h-0 overflow-auto">
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
