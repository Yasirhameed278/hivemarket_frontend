import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';
import useWishlistStore from './store/wishlistStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import VendorLayout from './components/layout/VendorLayout';
import Chatbot from './components/Chatbot';
import Loader from './components/ui/Loader';

// Pages (lazy loaded)
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminVendors = lazy(() => import('./pages/admin/AdminVendors'));

// Vendor pages
const BecomeVendor = lazy(() => import('./pages/BecomeVendor'));
const VendorStore = lazy(() => import('./pages/VendorStore'));
const Stores = lazy(() => import('./pages/Stores'));
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorProducts = lazy(() => import('./pages/vendor/VendorProducts'));
const VendorOrders = lazy(() => import('./pages/vendor/VendorOrders'));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, isAdmin } = useAuthStore();
  if (!isLoggedIn()) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" />;
  return children;
};

const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <Chatbot />
  </div>
);

export default function App() {
  const { isLoggedIn, fetchMe } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (isLoggedIn()) {
      fetchMe();
      fetchCart();
      fetchWishlist();
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'DM Sans' } }} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/products/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected user routes */}
          <Route path="/cart" element={<MainLayout><ProtectedRoute><Cart /></ProtectedRoute></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><ProtectedRoute><Checkout /></ProtectedRoute></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>} />
          <Route path="/orders" element={<MainLayout><ProtectedRoute><Orders /></ProtectedRoute></MainLayout>} />
          <Route path="/orders/:id" element={<MainLayout><ProtectedRoute><OrderDetail /></ProtectedRoute></MainLayout>} />
          <Route path="/wishlist" element={<MainLayout><ProtectedRoute><Wishlist /></ProtectedRoute></MainLayout>} />

          {/* All stores listing */}
          <Route path="/stores" element={<MainLayout><Stores /></MainLayout>} />

          {/* Vendor public store */}
          <Route path="/vendors/:id" element={<MainLayout><VendorStore /></MainLayout>} />

          {/* Become a vendor */}
          <Route path="/become-vendor" element={<MainLayout><BecomeVendor /></MainLayout>} />

          {/* Vendor dashboard (protected — VendorLayout handles its own auth redirect) */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorDashboard />} />
            <Route path="products" element={<VendorProducts />} />
            <Route path="orders" element={<VendorOrders />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="vendors" element={<AdminVendors />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}
