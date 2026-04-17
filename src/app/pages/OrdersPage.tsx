import { useState, useEffect } from 'react';
import { OrderForm } from '../components/OrderForm';
import { OrderList } from '../components/OrderList';
import { Toaster, toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Filter } from 'lucide-react';

export interface Order {
  id: string;
  product: string;
  quantity: number;
  notes: string;
  status: string;
  createdAt: string;
  price?: number; // Price at time of purchase
}

type FilterType = 'all' | 'pending' | 'completed';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3b443693`;

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      // Check if any orders were auto-deleted (show notification only once per day)
      const lastCheckDate = localStorage.getItem('lastAutoDeleteCheck');
      const today = new Date().toDateString();
      
      if (lastCheckDate !== today && data.deletedCount && data.deletedCount > 0) {
        toast.info(`🗑️ ${data.deletedCount} pedido(s) concluído(s) de ontem foram excluídos automaticamente`);
        localStorage.setItem('lastAutoDeleteCheck', today);
      }
      
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddOrder = async (product: string, quantity: number, notes: string) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ product, quantity, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      await fetchOrders();
      toast.success('Pedido adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Erro ao adicionar pedido');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      await fetchOrders();
      toast.success(newStatus === 'completed' ? 'Pedido concluído!' : 'Pedido reaberto');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Erro ao atualizar pedido');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      await fetchOrders();
      toast.success('Pedido excluído');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Erro ao excluir pedido');
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'completed') return order.status === 'completed';
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8 transition-colors">
        <OrderForm onAddOrder={handleAddOrder} />
        
        {/* Filter Buttons */}
        <div className="mt-8 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Filtrar Pedidos
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ⏳ Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ✅ Concluídos ({completedCount})
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <OrderList 
            orders={filteredOrders}
            isLoading={isLoading}
            onToggleStatus={handleToggleStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="text-xs md:text-sm">🔄 Atualizando a cada 5 segundos</p>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </>
  );
}