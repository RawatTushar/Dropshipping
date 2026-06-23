import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import AdminSessionHydrator from './components/AdminSessionHydrator';
import Layout from './components/Layout';
import DashboardScreen from './features/admin/pages/DashboardScreen';
import SalesScreen from './features/sales/pages/SalesScreen';
import ProductsScreen from './features/products/pages/ProductsScreen';
import ProductEditScreen from './features/products/pages/ProductEditScreen';
import LoginScreen from './features/auth/pages/LoginScreen';

function App() {
  return (
    <>
      <AdminSessionHydrator />
      <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route element={<Layout />}>
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="sales" element={<SalesScreen />} />
        <Route path="products" element={<ProductsScreen />} />
        <Route path="products/new" element={<ProductEditScreen isNew />} />
        <Route path="products/:id/edit" element={<ProductEditScreen />} />
      </Route>
      <Route index element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;
