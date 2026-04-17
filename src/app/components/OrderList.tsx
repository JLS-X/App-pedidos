import { Order } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Trash2, Package, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDeleteOrder: (id: string) => void;
}

export function OrderList({ orders, isLoading, onToggleStatus, onDeleteOrder }: OrderListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-400 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando pedidos...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum pedido encontrado</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Tente ajustar os filtros</p>
      </div>
    );
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const completedOrders = orders.filter(order => order.status === 'completed');

  return (
    <div>
      {pendingOrders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
              {pendingOrders.length}
            </span>
            Pedidos Pendentes
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {pendingOrders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  onToggleStatus={onToggleStatus}
                  onDeleteOrder={onDeleteOrder}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
              {completedOrders.length}
            </span>
            Pedidos Concluídos
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {completedOrders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  onToggleStatus={onToggleStatus}
                  onDeleteOrder={onDeleteOrder}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderItem({ 
  order, 
  onToggleStatus, 
  onDeleteOrder 
}: { 
  order: Order; 
  onToggleStatus: (id: string, status: string) => void;
  onDeleteOrder: (id: string) => void;
}) {
  const isCompleted = order.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 transition-all hover:shadow-md ${
        isCompleted ? 'bg-gray-50 dark:bg-gray-700 opacity-75' : 'bg-white dark:bg-gray-800'
      }`}>
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggleStatus(order.id, order.status)}
              className="h-5 w-5"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${
                  isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {order.product}
                </h3>
                
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="font-medium dark:bg-gray-700 dark:text-gray-200">
                    Qtd: {order.quantity}
                  </Badge>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {order.notes && (
                  <div className="mt-3 flex gap-2">
                    <StickyNote className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${
                      isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteOrder(order.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}