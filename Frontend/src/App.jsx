import React, { useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginScreen from './screens/loginScreen';
import LoginOtp from './screens/loginOtp';
import HomePage from './screens/homePage';
import RegisterScreen from './screens/registerScreen';
import EmailConfirmation from './screens/emailConfirmation';
import EmailConfirmationPending from './screens/emailConfirmationPending';
import EnterOtp from './screens/enterOtp';
import ChangePassword from './screens/changePassword';
import SettingScreen from './screens/settingScreen';
import ProductsScreen from './screens/productsScreen';
import OrdersScreen from './screens/ordersScreen';
import ProductDetailScreen from './screens/productDetailScreen';
import CheckoutScreen from './screens/checkoutScreen';
import CheckoutSuccessScreen from './screens/checkoutSuccessScreen';

const App = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="page-route-enter">
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
        <Route path="/settings" element={<SettingScreen />} />
        <Route path="/EnterOTP" element={<EnterOtp />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/" element={<LoginScreen />} />
      </Routes>
    </div>
  );
};

export default App;
