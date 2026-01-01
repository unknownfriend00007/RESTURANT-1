import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, validatePhone, validateName } from '@/lib/utils';
import { openRazorpayCheckout, createOrder, verifyPayment } from '@/lib/razorpay-client';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add items to cart before checking out</p>
        <Button onClick={() => navigate('/menu')} className="bg-orange-600 hover:bg-orange-700">
          Browse Menu
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateName(formData.name)) {
      toast.error('Please enter a valid name (2-50 characters)');
      return;
    }
    
    if (!validatePhone(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (formData.address.length < 10 || formData.address.length > 200) {
      toast.error('Address must be between 10 and 200 characters');
      return;
    }

    setLoading(true);

    try {
      // Create order on backend (backend validates and calculates total)
      const order = await createOrder({
        cart: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        },
      });

      // Open Razorpay checkout
      const paymentResult = await openRazorpayCheckout({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        orderNumber: order.orderNumber,
        customer: {
          name: formData.name,
          phone: formData.phone,
        },
      });

      if (paymentResult.success && paymentResult.paymentData) {
        // Verify payment on backend
        const verificationResult = await verifyPayment(paymentResult.paymentData);

        if (verificationResult.success) {
          // Clear cart and redirect to success
          clearCart();
          navigate(`/success?order=${verificationResult.orderNumber}`);
        } else {
          toast.error('Payment verification failed');
          navigate('/failed');
        }
      } else {
        toast.info('Payment cancelled');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </CardTitle>
              <CardDescription>Review your items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t-2">
                <p className="text-xl font-bold">Total</p>
                <p className="text-2xl font-bold text-orange-600">{formatPrice(totalAmount)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Customer Details
              </CardTitle>
              <CardDescription>Enter your information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500">10-digit Indian mobile number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter your complete address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    minLength={10}
                    maxLength={200}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay {formatPrice(totalAmount)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  🔒 Secured by Razorpay • PCI DSS Compliant
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
