import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Failed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="w-20 h-20 text-red-600 mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-700">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-lg">
            Something went wrong
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-600">
              We couldn't process your payment. This could be due to:
            </p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside text-left">
              <li>Insufficient balance</li>
              <li>Network connectivity issues</li>
              <li>Payment gateway timeout</li>
              <li>Bank declined the transaction</li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Don't worry!</strong> No amount has been deducted from your account.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
              <Link to="/checkout">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Need help? Contact support at{' '}
            <a href="tel:9999999999" className="text-orange-600 hover:underline">
              +91 9999999999
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
