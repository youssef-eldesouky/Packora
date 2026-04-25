import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { AllData } from './Data/AllData';
import { CartProvider } from './context/CartContext';
import ScrollToTop from "react-scroll-to-top";
import SignUp from './components/SignUp/SignUp';
import ForgetPassword from './components/ForgetPass/ForgetPassword';
import EmailCheck from './components/ForgetPass/EmailCheck';
import HomePage from './components/Homepage/HomePage';
import Catalog from './components/Catalog/Catalog';
import Singlecard from './components/Singlecard/Singlecard';
import Track from './components/Track/Track';
import Cart from './components/Cart/Cart';
import Checkout from './components/Cart/Checkout';
import Support from './components/Support/Support';
import Profile from './components/Profile/Profile';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminOrders from './components/Admin/AdminOrders';
import AdminProducts from './components/Admin/AdminProducts';
import AdminCustomers from './components/Admin/AdminCustomers';
import AdminCustomerDetail from './components/Admin/AdminCustomerDetail';
import AdminAnalytics from './components/Admin/AdminAnalytics';
import { AdminAuthProvider } from './context/AdminAuthContext';
import RequireAdmin from './components/Admin/RequireAdmin';
import AdminOrderDetail from './components/Admin/AdminOrderDetail';
import AdminProductDetail from './components/Admin/AdminProductDetail';
import AdminInsights from './components/Admin/AdminInsights';
import GlobalLayout from './components/Layout/GlobalLayout';
import LandingPage from './components/LandingPage/LandingPage';
import Design from './components/Design/Design';
import Footer from './components/Footer/Footer';
import LoginPage from './components/LoginPage/LoginPage';

let router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'LandingPage', element: <Navigate to="/" replace /> },
      { path: 'HomePage', element: <HomePage /> },
      { path: 'SignUp', element: <SignUp /> },
      { path: 'ForgetPassword', element: <ForgetPassword /> },
      { path: 'EmailCheck', element: <EmailCheck /> },
      { path: 'Catalog', element: <Catalog /> },
      { path: 'Catalog/:productId', element: <Singlecard /> },
      { path: 'Track', element: <Track /> },
      { path: 'Cart', element: <Cart /> },
      { path: 'Cart/checkout', element: <Checkout /> },
      { path: 'Support', element: <Support /> },
      { path: 'Profile', element: <Profile /> },
      { path: 'Design', element: <Design /> },
      { path: 'Footer', element: <Footer /> },
      {
        path: 'admin',
        element: (
          <RequireAdmin>
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </RequireAdmin>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'insights/:slug', element: <AdminInsights /> },
          { path: 'orders', element: <AdminOrders /> },
          { path: 'orders/:orderId', element: <AdminOrderDetail /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'products/:productId', element: <AdminProductDetail /> },
          { path: 'customers', element: <AdminCustomers /> },
          { path: 'customers/:customerId', element: <AdminCustomerDetail /> },
          { path: 'analytics', element: <AdminAnalytics /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AdminAuthProvider>
    <AllData>
      <CartProvider>
        <ProfileProvider>
          <AuthProvider>
            <ScrollToTop smooth />
            <RouterProvider router={router} />
          </AuthProvider>
        </ProfileProvider>
      </CartProvider>
    </AllData>
  </AdminAuthProvider>

);
