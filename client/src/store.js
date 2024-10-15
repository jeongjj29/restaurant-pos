import { configureStore } from "@reduxjs/toolkit";
import employeesReducer from "./features/employees/employeesSlice";
import tablesReducer from "./features/tables/tablesSlice";
// import ordersReducer from "./features/orders/ordersSlice";
// import orderItemsReducer from "./features/orderItems/orderItemsSlice";
import menuItemsReducer from "./features/menu/menuItemsSlice";
// import paymentsReducer from "./features/payments/paymentsSlice";
// import discountsReducer from "./features/discounts/discountsSlice";
// import rolesReducer from "./features/roles/rolesSlice";
import menuCategoriesReducer from "./features/menu/menuCategoriesSlice";

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    tables: tablesReducer,
    // orders: ordersReducer,
    // orderItems: orderItemsReducer,
    menuItems: menuItemsReducer,
    // payments: paymentsReducer,
    // discounts: discountsReducer,
    // roles: rolesReducer,
    menuCategories: menuCategoriesReducer,
  },
});
