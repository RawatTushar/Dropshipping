import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../../../api/adminApi';
import { clearAdminInfo, getAdminInfo, isAdminUser } from '../../../utils/adminAuth';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

const ProductEditScreen = ({ isNew = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = isNew || !id;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setName(data.name);
      setPrice(data.price);
      setCostPrice(
        data.costPrice != null && data.costPrice !== '' ? String(data.costPrice) : ''
      );
      setImage(data.image);
      setBrand(data.brand);
      setCategory(data.category);
      setCountInStock(data.countInStock);
      setDescription(data.description);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isCreateMode) {
      return undefined;
    }

    const timerId = setTimeout(() => {
      fetchProduct();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchProduct, isCreateMode]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isAdminUser(getAdminInfo())) {
        alert('Please login first as an admin to perform this action.');
        navigate('/login');
        return;
      }

      const costNum = costPrice === '' ? null : Number(costPrice);
      const productData = {
        name,
        price: Number(price),
        costPrice:
          costPrice === '' || costNum == null || Number.isNaN(costNum) ? null : costNum,
        image,
        brand,
        category,
        countInStock: Number(countInStock),
        description,
      };

      if (isCreateMode) {
        await createProduct(productData);
      } else {
        await updateProduct(id, productData);
      }

      setLoading(false);
      navigate('/products');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearAdminInfo();
        navigate('/login');
      }
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{isCreateMode ? 'Add Product' : 'Edit Product'}</h1>
          <p className="subtitle">{isCreateMode ? 'Add a new item to your store' : `Editing product ID: ${id}`}</p>
        </div>
        <button className="btn" style={{ backgroundColor: 'var(--bg-hover)', color: 'white', border: '1px solid var(--border-color)' }} onClick={() => navigate('/products')}>
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <motion.div 
        className="card" 
        style={{ maxWidth: '900px' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {error && <div style={{ color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>{error}</div>}
        
        <form onSubmit={submitHandler} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Basic Information</h3>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Media & Description</h3>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Image URL</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }} />
              {image ? (
                <img src={image} alt="Preview" style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '10px', background: 'var(--bg-dark)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
          </div>

          <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Pricing & Inventory</h3>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Sell price (USD) *</label>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Supplier cost (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="Optional"
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
              Used for profit calculations on the dashboard.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Stock Count *</label>
            <input type="number" min="0" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Brand</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontSize: '0.95rem' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} onClick={() => navigate('/products')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }} disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default ProductEditScreen;
