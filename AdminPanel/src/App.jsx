import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardScreen from './screens/DashboardScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import LoginScreen from './screens/LoginScreen';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route element={<Layout />}>
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="products" element={<ProductsScreen />} />
        <Route path="products/new" element={<ProductEditScreen isNew />} />
        <Route path="products/:id/edit" element={<ProductEditScreen />} />
      </Route>
      <Route index element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
