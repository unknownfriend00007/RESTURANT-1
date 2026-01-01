import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Search, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate, validatePhone } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  items: Array<{ id: string; name: string; quantity: number }>;
  created_at: string;
}

export default function Orders() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      
      if (!data || data.length === 0) {
        toast.info('No orders found for this phone number');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Track Your Orders</h1>

      {/* Search Form */}
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle>Enter Phone Number</CardTitle>
          <CardDescription>
            Enter the phone number you used while placing the order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Orders
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Orders List */}
      {searched && (
        <div className="max-w-4xl mx-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            orders.map(order => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.order_number}</CardTitle>
                      <CardDescription>
                        {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <div className="space-y-2 text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Items:</h4>
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-orange-600">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
