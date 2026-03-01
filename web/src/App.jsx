import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import LandingPage from './pages/LandingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';
import RegistrationPage from './pages/RegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';



const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 uppercase">
            Quality<span className="text-gray-900">Store</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors uppercase">
              Tienda
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                data-testid="nav-admin"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase border-b-2 border-blue-600"
              >
                Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-500">
                  {user.role === 'admin' ? '🛡️ Admin' : `👤 ${user.username}`}
                </span>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors uppercase"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                data-testid="nav-login"
                className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors uppercase"
              >
                Ingresar
              </Link>
            )}

            <Link to="/cart" className="relative group p-2 cursor-pointer">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span data-testid="cart-count" className="font-bold text-blue-600">
                  {cartCount}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/admin" element={<AdminDashboard />} />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
