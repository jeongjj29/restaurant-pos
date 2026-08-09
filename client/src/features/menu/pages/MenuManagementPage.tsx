import { useState } from "react";
import MenuItemTable from "@menu/components/MenuItemTable";
import MenuItemForm from "@menu/components/MenuItemForm";
import MenuCategoriesTable from "@menu/components/MenuCategoriesTable";
import MenuCategoryForm from "@menu/components/MenuCategoryForm";
import NavBar, { MenuTabKey } from "@menu/components/NavBar";
import { MenuCategory, MenuItem } from "@menu/types";

function MenuManagementPage() {
  const [tab, setTab] = useState<MenuTabKey>("items");
  const [menuItemFormHidden, setMenuItemFormHidden] = useState(true);
  const [menuItemToEdit, setMenuItemToEdit] = useState<MenuItem | null>(null);
  const [menuCategoryFormHidden, setMenuCategoryFormHidden] = useState(true);
  const [menuCategoryToEdit, setMenuCategoryToEdit] =
    useState<MenuCategory | null>(null);

  const handleClick = (field: MenuTabKey) => {
    setTab(field);
    setMenuItemFormHidden(true);
    setMenuCategoryFormHidden(true);
    setMenuItemToEdit(null);
    setMenuCategoryToEdit(null);
  };

  return (
    <div className="glass-panel flex h-full min-h-0 w-full flex-col rounded-2xl p-3 md:p-4">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Catalog operations
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Menu management</h1>
      </div>
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
          {menuItemFormHidden &&
            menuCategoryFormHidden && (
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-white/5 p-6 text-center text-sm text-text-secondary">
                Select a row to edit, or use the plus button to add a new {tab === "items" ? "menu item" : "category"}.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default MenuManagementPage;
