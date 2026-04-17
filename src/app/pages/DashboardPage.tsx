import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { TrendingUp, ShoppingCart, DollarSign, Package, Calendar, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/card';

interface Order {
  id: string;
  product: string;
  quantity: number;
  notes: string;
  status: string;
  createdAt: string;
  price?: number; // Price at time of purchase
}

interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

interface DailyStat {
  id: string;
  date: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  productCount: { [key: string]: number };
}

export function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [historicalStats, setHistoricalStats] = useState<DailyStat[]>([]);
  const [totalStats, setTotalStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCompletedOrders: 0, totalDays: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3b443693`;

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/orders`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }),
        fetch(`${API_URL}/products`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }),
      ]);

      if (!ordersRes.ok || !productsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);

      // Fetch stats separately with error handling
      try {
        const [statsRes, summaryRes] = await Promise.all([
          fetch(`${API_URL}/stats`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }),
          fetch(`${API_URL}/stats/summary`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }),
        ]);

        if (statsRes.ok && summaryRes.ok) {
          const statsData = await statsRes.json();
          const summaryData = await summaryRes.json();
          setHistoricalStats(statsData.stats || []);
          setTotalStats(summaryData);
        }
      } catch (statsError) {
        console.log('Stats not available yet:', statsError);
        setHistoricalStats([]);
        setTotalStats({ totalOrders: 0, totalRevenue: 0, totalCompletedOrders: 0, totalDays: 0 });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  // Calculate statistics - Use ALL current orders since old completed ones are auto-deleted
  // If there are no orders from today specifically, show all current orders
  const displayOrders = todayOrders.length > 0 ? todayOrders : orders;
  const isShowingToday = todayOrders.length > 0;
  
  const totalOrdersToday = displayOrders.length;
  const completedOrdersToday = displayOrders.filter(o => o.status === 'completed').length;
  const pendingOrdersToday = displayOrders.filter(o => o.status === 'pending').length;

  // Calculate revenue
  const calculateRevenue = () => {
    let total = 0;
    displayOrders.forEach(order => {
      // Use the price saved in the order (at time of purchase)
      // If order doesn't have price (old orders), fallback to current product price
      let orderPrice = order.price;
      if (!orderPrice) {
        const product = products.find(p => p.name === order.product);
        orderPrice = product ? product.price : 0;
      }
      total += orderPrice * order.quantity;
    });
    return total;
  };

  const totalRevenueToday = calculateRevenue();

  // Top selling products
  const getTopProducts = () => {
    const productCount: { [key: string]: { count: number; revenue: number } } = {};
    
    displayOrders.forEach(order => {
      // Use the price saved in the order (at time of purchase)
      let orderPrice = order.price;
      if (!orderPrice) {
        const product = products.find(p => p.name === order.product);
        orderPrice = product ? product.price : 0;
      }
      
      if (!productCount[order.product]) {
        productCount[order.product] = { count: 0, revenue: 0 };
      }
      productCount[order.product].count += order.quantity;
      productCount[order.product].revenue += orderPrice * order.quantity;
    });

    return Object.entries(productCount)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-400 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Dashboard - {isShowingToday ? 'Hoje' : 'Pedidos Atuais'}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        {!isShowingToday && orders.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ Mostrando pedidos de dias anteriores. Pedidos concluídos serão excluídos automaticamente amanhã.
            </p>
          </div>
        )}
      </div>

      {/* Total Accumulated Stats */}
      {totalStats.totalDays > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-800 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-6 h-6" />
            <h2 className="text-xl md:text-2xl font-bold">Totais Acumulados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white/80 text-sm font-medium mb-1">Total de Pedidos</p>
              <p className="text-3xl font-bold">{totalStats.totalOrders + totalOrdersToday}</p>
              <p className="text-white/70 text-xs mt-1">{totalStats.totalDays} dias registrados</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white/80 text-sm font-medium mb-1">Pedidos Concluídos</p>
              <p className="text-3xl font-bold">{totalStats.totalCompletedOrders + completedOrdersToday}</p>
              <p className="text-white/70 text-xs mt-1">Histórico completo</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white/80 text-sm font-medium mb-1">Lucro Total</p>
              <p className="text-3xl font-bold">R$ {(totalStats.totalRevenue + totalRevenueToday).toFixed(2)}</p>
              <p className="text-white/70 text-xs mt-1">Desde o início</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total de Pedidos</p>
              <p className="text-4xl font-bold">{totalOrdersToday}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        {/* Completed Orders */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Pedidos Concluídos</p>
              <p className="text-4xl font-bold">{completedOrdersToday}</p>
            </div>
            <Package className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        {/* Pending Orders */}
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium mb-1">Pedidos Pendentes</p>
              <p className="text-4xl font-bold">{pendingOrdersToday}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-yellow-200" />
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Lucro Total</p>
              <p className="text-4xl font-bold">R$ {totalRevenueToday.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-200" />
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Top 5 Produtos do Dia
        </h2>
        
        {topProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum pedido hoje</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div 
                key={product.name}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 break-words">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.count} unidade{product.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {product.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Histórico de Vendas
          </h2>
          <button
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? (
              <ChevronUp className="w-5 h-5 mr-1" />
            ) : (
              <ChevronDown className="w-5 h-5 mr-1" />
            )}
            {showHistory ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        
        {showHistory && (
          <div className="space-y-3">
            {historicalStats.map(stat => (
              <div 
                key={stat.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold">
                    {new Date(stat.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 break-words">
                      {new Date(stat.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.totalOrders} pedido{stat.totalOrders !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {stat.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p className="text-xs md:text-sm">🔄 Atualizando a cada 5 segundos</p>
      </div>
    </div>
  );
}