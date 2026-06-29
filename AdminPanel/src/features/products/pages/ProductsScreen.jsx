import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteProduct } from '../../../shared/lib/adminApi';
import axiosInstance from '../../../shared/lib/adminApi';
import { clearAdminInfo, getAdminInfo, isAdminUser } from '../../../utils/adminAuth';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight, Plus, Search, Edit2, Trash2 } from 'lucide-react';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const productList = products || [];
    if (!q) return productList;
    return productList.filter((p) => {
      const haystack = [p.name, p.category, p.brand, p.description, p.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch a large limit to get all products for admin
      const { data } = await axiosInstance.get('/api/products', { params: { limit: 1000 } });
      setProducts(Array.isArray(data.items) ? data.items : []);
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
    if (window.confirm('Are you sure you want to delete This product?')) {
      try {
        if (!isAdminUser(getAdminInfo())) {
          alert('Please login first as an admin to perform this action.');
          navigate('/login');
          return;
        }

        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
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
        <button className="btn btn-primary" type="button" onClick={() => navigate('/products/new')}>
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
          <div className="empty-state" style={{ color: 'var(--danger)' }}>
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Search size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--border-color)' }} />
            No products found. Start by adding one!
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="admin-product-search"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                Search products
              </label>
              <div style={{ position: 'relative', maxWidth: '420px' }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="admin-product-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, category, brand, or ID..."
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-dark)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </div>
              {query.trim() ? (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {filteredProducts.length} of {products.length} products
                </p>
              ) : null}
            </div>

{filteredProducts.length === 0 ? (
               <div className="empty-state">
                 <Search size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--border-color)' }} />
                No products match "{query.trim()}".
               </div>
             ) : (
               <>
                 <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                   Showing {filteredProducts.length} of {products.length} products
                 </p>
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
                    {filteredProducts.map((product) => {
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
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.image || 'https://via.placeholder.com/50'}
                              alt={product.name}
                              className="product-img-thumb"
                            />
                          </td>
                          <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{product.name}</td>
                          <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                            ${price.toFixed(2)}
                          </td>
                          <td
                            style={{
                              color: marginPct == null ? 'var(--text-muted)' : undefined,
                              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                            }}
                          >
                           {marginPct == null ? '-' : `${marginPct}%`}
                          </td>
                          <td>
                            <span
                              style={{
                                background: 'var(--bg-hover)',
                                border: '1px solid var(--border-color)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                              }}
                            >
                              {product.category}
                            </span>
                          </td>
                          <td
                            style={{
                              fontWeight: 600,
                              color: product.countInStock <= 10 ? 'var(--warning)' : 'inherit',
                            }}
                          >
                            {product.countInStock}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-icon"
                                style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
                                onClick={() => navigate(`/products/${product.id}/edit`)}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-icon"
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                                onClick={() => deleteHandler(product.id)}
                              >
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
              </>
            )}
          </>
        )}
      </motion.div>
    </>
  );
  
};


export default ProductsScreen;
