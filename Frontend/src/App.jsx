import React, { useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginScreen from './features/auth/pages/loginScreen';
import LoginOtp from './features/auth/pages/loginOtp';
import HomePage from './features/home/pages/homePage';
import RegisterScreen from './features/auth/pages/registerScreen';
import EmailConfirmation from './features/auth/pages/emailConfirmation';
import EmailConfirmationPending from './features/auth/pages/emailConfirmationPending';
import EnterOtp from './features/auth/pages/enterOtp';
import ChangePassword from './features/auth/pages/changePassword';
import SettingScreen from './features/settings/pages/settingScreen';
import ProductsScreen from './features/products/pages/productsScreen';
import OrdersScreen from './features/orders/pages/ordersScreen';
import ProductDetailScreen from './features/products/pages/productDetailScreen';
import CheckoutScreen from './features/orders/pages/checkoutScreen';
import CheckoutSuccessScreen from './features/orders/pages/checkoutSuccessScreen';
import MagicLogin from './features/auth/pages/magicLogin';
import AuthSessionHydrator from './components/AuthSessionHydrator';

const App = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="page-route-enter">
      <AuthSessionHydrator />
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/login-otp" element={<LoginOtp />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/products" element={<ProductsScreen />} />
        <Route path="/products/:id" element={<ProductDetailScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/checkout/success" element={<CheckoutSuccessScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/confirm-email" element={<EmailConfirmation />} />
        <Route path="/confirmation-pending" element={<EmailConfirmationPending />} />
        <Route path="/magic-login" element={<MagicLogin />} />
        <Route path="/settings" element={<SettingScreen />} />
        <Route path="/EnterOTP" element={<EnterOtp />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/" element={<LoginScreen />} />
      </Routes>
    </div>
  );
};

export default App;
