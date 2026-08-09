import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { UnknownAction } from "@reduxjs/toolkit";
import authSliceReducer from "@auth/authSlice";
// import discountsReducer from "@features/discounts/slices/discountsSlice";
import employeesReducer from "@employees/slices/employeesSlice";
import orderItemsReducer from "@orders/slices/orderItemsSlice";
import ordersReducer from "@orders/slices/ordersSlice";
import menuCategoriesReducer from "@menu/slices/menuCategoriesSlice";
import menuItemsReducer from "@menu/slices/menuItemsSlice";
import paymentsReducer from "@payments/slices/paymentsSlice";
import rolesReducer from "@employees/slices/rolesSlice";
import tablesReducer from "@tables/slices/tablesSlice";
import runtimeConfigReducer from "@features/config/runtimeConfigSlice";

const appReducer = combineReducers({
  // discounts: discountsReducer,
  auth: authSliceReducer,
  employees: employeesReducer,
  orders: ordersReducer,
  orderItems: orderItemsReducer,
  menuCategories: menuCategoriesReducer,
  menuItems: menuItemsReducer,
  payments: paymentsReducer,
  roles: rolesReducer,
  tables: tablesReducer,
  runtimeConfig: runtimeConfigReducer,
});

export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction
) => {
  const shouldClearSessionData = [
    "auth/logout/fulfilled",
    "auth/logout/rejected",
    "auth/sessionExpired",
  ].includes(action.type);

  return appReducer(shouldClearSessionData ? undefined : state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
