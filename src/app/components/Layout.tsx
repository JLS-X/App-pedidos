import { Outlet, Link, useLocation } from "react-router";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { ShoppingCart, Package, BarChart3 } from "lucide-react";
import logoImage from 'figma:asset/8cad1902a16a01d7a5054075dc6df5fdd180f28a.png';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-900 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={logoImage} 
                  alt="Toque de doçura" 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover bg-white shadow-lg"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">
                    Toque de Doçura
                  </h1>
                  <p className="text-xs md:text-sm text-blue-100 dark:text-blue-200">
                    Sistema de Gestão
                  </p>
                </div>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex gap-1 md:gap-2 overflow-x-auto">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  isActive("/") && !isActive("/products") && !isActive("/dashboard")
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm md:text-base">Pedidos</span>
              </Link>
              
              <Link
                to="/products"
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  isActive("/products")
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="text-sm md:text-base">Produtos</span>
              </Link>
              
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  isActive("/dashboard")
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm md:text-base">Dashboard</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-20">
          <div className="flex justify-around items-center px-2 py-3">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/") && !isActive("/products") && !isActive("/dashboard")
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-xs font-medium">Pedidos</span>
            </Link>
            
            <Link
              to="/products"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/products")
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <Package className="w-6 h-6" />
              <span className="text-xs font-medium">Produtos</span>
            </Link>
            
            <Link
              to="/dashboard"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/dashboard")
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
          </div>
        </nav>
      </div>
    </ThemeProvider>
  );
}