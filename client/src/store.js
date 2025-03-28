import { configureStore } from "@reduxjs/toolkit";
import employeesReducer from "@employees/slices/employeesSlice";
import tablesReducer from "@tables/slices/tablesSlice";
import ordersReducer from "@orders/slices/ordersSlice";
import orderItemsReducer from "@orders/slices/orderItemsSlice";
import menuItemsReducer from "@menu/slices/menuItemsSlice";
import paymentsReducer from "@payments/slices/paymentsSlice";
// import discountsReducer from "@features/discounts/slices/discountsSlice";
import rolesReducer from "@employees/slices/rolesSlice";
import menuCategoriesReducer from "@menu/slices/menuCategoriesSlice";
import authSliceReducer from "@auth/authSlice";

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    tables: tablesReducer,
    orders: ordersReducer,
    orderItems: orderItemsReducer,
    menuItems: menuItemsReducer,
    payments: paymentsReducer,
    // discounts: discountsReducer,
    roles: rolesReducer,
    menuCategories: menuCategoriesReducer,
    auth: authSliceReducer,
  },
});
