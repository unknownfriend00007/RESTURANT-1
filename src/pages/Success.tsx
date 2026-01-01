import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Success() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    // Optional: Confetti effect or analytics
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            Your order has been confirmed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {orderNumber && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-green-700">{orderNumber}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-gray-600">
              Thank you for your order! We've received your payment and will start preparing your food shortly.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive updates about your order on your registered phone number.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/orders">View My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
