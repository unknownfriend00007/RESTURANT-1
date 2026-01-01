import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const appName = import.meta.env.VITE_APP_NAME || 'Restaurant';

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to {appName}</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience authentic Indian cuisine delivered fresh to your doorstep
          </p>
          <Link to="/menu">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
              View Menu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Hot meals delivered in 30-45 minutes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
              <p className="text-gray-600">On orders above ₹500</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% safe with Razorpay</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-gray-600 mb-8">Browse our delicious menu and place your order now</p>
          <Link to="/menu">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Explore Menu
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
