import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductsPage } from "./pages/ProductsPage";
import { DashboardPage } from "./pages/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: OrdersPage },
      { path: "products", Component: ProductsPage },
      { path: "dashboard", Component: DashboardPage },
    ],
  },
]);
