import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/users/usersSlice";
// import tablesReducer from "../features/tables/tablesSlice";
// import ordersReducer from "../features/orders/ordersSlice";
// import orderItemsReducer from "../features/orderItems/orderItemsSlice";
// import menuItemsReducer from "../features/menuItems/menuItemsSlice";
// import paymentsReducer from "../features/payments/paymentsSlice";
// import discountsReducer from "../features/discounts/discountsSlice";
// import rolesReducer from "../features/roles/rolesSlice";
// import menuCategoriesReducer from "../features/menuCategories/menuCategoriesSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    // tables: tablesReducer,
    // orders: ordersReducer,
    // orderItems: orderItemsReducer,
    // menuItems: menuItemsReducer,
    // payments: paymentsReducer,
    // discounts: discountsReducer,
    // roles: rolesReducer,
    // menuCategories: menuCategoriesReducer,
  },
});
