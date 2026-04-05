import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginScreen from './screens/loginScreen';
import LoginOtp from './screens/loginOtp';
import HomePage from './screens/homePage';
import RegisterScreen from './screens/registerScreen';
import EmailConfirmation from './screens/emailConfirmation';
import EmailConfirmationPending from './screens/emailConfirmationPending';
import EnterOtp from './screens/enterOtp';
import ChangePassword from './screens/changePassword';
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/login-otp" element={<LoginOtp />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/confirm-email" element={<EmailConfirmation />} />
      <Route path="/confirmation-pending" element={<EmailConfirmationPending />} />
      <Route path="/EnterOTP" element={<EnterOtp />} />
      <Route path="/changePassword" element={<ChangePassword />} />
      <Route path="/" element={<LoginScreen />} />
    </Routes>
  );
};

export default App;