import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Plus } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface OrderFormProps {
  onAddOrder: (product: string, quantity: number, notes: string) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export function OrderForm({ onAddOrder }: OrderFormProps) {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3b443693`;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const selectedProduct = products.find(p => p.name === product);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !quantity) {
      return;
    }

    setIsSubmitting(true);
    await onAddOrder(product, Number(quantity), notes);
    
    // Clear form
    setProduct('');
    setQuantity('');
    setNotes('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Novo Pedido</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Produto
          </label>
          <select
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-colors"
          >
            <option value="">Selecione um produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} - R$ {p.price.toFixed(2)}
              </option>
            ))}
          </select>
          {selectedProduct && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
              💰 Preço unitário: R$ {selectedProduct.price.toFixed(2)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantidade
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-colors"
          />
          {selectedProduct && quantity && (
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
              📊 Total: R$ {(selectedProduct.price * Number(quantity)).toFixed(2)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observações
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalhes adicionais (opcional)"
            rows={3}
            className="w-full px-3 md:px-4 py-2 md:py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!product.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 md:py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg text-base md:text-base"
        >
          ➕ Adicionar Pedido
        </button>
      </form>
    </div>
  );
}