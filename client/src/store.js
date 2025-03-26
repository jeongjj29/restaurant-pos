import { configureStore } from "@reduxjs/toolkit";
import employeesReducer from "@features/employees/slices/employeesSlice";
import tablesReducer from "@features/tables/slices/tablesSlice";
import ordersReducer from "@features/orders/slices/ordersSlice";
import orderItemsReducer from "@features/orders/slices/orderItemsSlice";
import menuItemsReducer from "@features/menu/slices/menuItemsSlice";
import paymentsReducer from "@features/payments/slices/paymentsSlice";
// import discountsReducer from "@features/discounts/slices/discountsSlice";
import rolesReducer from "@features/employees/slices/rolesSlice";
import menuCategoriesReducer from "@features/menu/slices/menuCategoriesSlice";
import authSliceReducer from "@features/auth/authSlice";

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
