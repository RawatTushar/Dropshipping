import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardScreen from './screens/DashboardScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import LoginScreen from './screens/LoginScreen';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardScreen />} />
        <Route path="products" element={<ProductsScreen />} />
        <Route path="products/new" element={<ProductEditScreen isNew />} />
        <Route path="products/:id/edit" element={<ProductEditScreen />} />
      </Route>
    </Routes>
  );
}

export default App;
