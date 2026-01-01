import { Link } from 'react-router-dom';

export default function Footer() {
  const appName = import.meta.env.VITE_APP_NAME || 'Restaurant';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🍛</span>
              <span className="text-xl font-bold text-orange-600">{appName}</span>
            </div>
            <p className="text-gray-600 text-sm">
              Fresh Indian cuisine, delivered hot to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="text-gray-600 hover:text-orange-600 transition-colors text-sm">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-orange-600 transition-colors text-sm">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="text-gray-600 hover:text-orange-600 transition-colors text-sm">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Contact</h3>
            <p className="text-gray-600 text-sm mb-2">
              📞 {import.meta.env.VITE_RESTAURANT_PHONE || '+91 9999999999'}
            </p>
            <p className="text-gray-600 text-sm">
              📧 {import.meta.env.VITE_RESTAURANT_EMAIL || 'contact@restaurant.com'}
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} {appName}. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            🔒 Secured by Razorpay • Powered by Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
