import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteProduct, getProducts } from '../../../api/adminApi';
import { clearAdminInfo, getAuthConfig } from '../../../utils/adminAuth';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchProducts]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const config = getAuthConfig();

        if (!config) {
            alert("Please login first as an admin to perform this action.");
            navigate('/login');
            return;
        }

        await deleteProduct(id, config);
        
        // Refresh standard list
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearAdminInfo();
          navigate('/login');
        }
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="subtitle">Manage everything in your inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : error ? (
          <div className="empty-state" style={{ color: 'var(--danger)' }}>{error}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Search size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--border-color)' }} />
            No products found. Start by adding one!
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Margin</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const price = Number(product.price);
                  const cost =
                    product.costPrice != null && product.costPrice !== ''
                      ? Number(product.costPrice)
                      : null;
                  const marginPct =
                    cost != null && !Number.isNaN(cost) && price > 0
                      ? (((price - cost) / price) * 100).toFixed(1)
                      : null;
                  return (
                  <tr key={product._id}>
                    <td>
                      <img src={product.image || 'https://via.placeholder.com/50'} alt={product.name} className="product-img-thumb" />
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{product.name}</td>
                    <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>${price.toFixed(2)}</td>
                    <td style={{ color: marginPct == null ? 'var(--text-muted)' : undefined, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                      {marginPct == null ? '—' : `${marginPct}%`}
                    </td>
                    <td>
                      <span style={{ 
                        background: 'var(--bg-hover)', border: '1px solid var(--border-color)', 
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' 
                      }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: product.countInStock <= 10 ? 'var(--warning)' : 'inherit' }}>
                      {product.countInStock}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }} onClick={() => navigate(`/products/${product._id}/edit`)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} onClick={() => deleteHandler(product._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ProductsScreen;
