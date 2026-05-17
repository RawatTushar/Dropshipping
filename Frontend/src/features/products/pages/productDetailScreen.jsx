import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { productsAPI } from '../../../api/api';
import DashboardLayout from '../../../components/DashboardLayout';
import ProductRecommendations from '../../../components/products/ProductRecommendations';
import ProductSocial from '../../../components/products/ProductSocial';
import { fetchProductById } from '../productsSlice';
import { selectCurrentCurrency } from '../../preferences/currencySlice';
import { formatCurrencyFromUSD } from '../../../utils/currency';
import { recordLocalProductView } from '../../../utils/browseSignals';
import '../../../productDetailScreen.css';

const ProductDetailScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, loadingDetails, detailsError } = useSelector((state) => state.products);
  const currency = useSelector(selectCurrentCurrency);

  useEffect(() => {
    if (id) dispatch(fetchProductById({ id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedProduct?._id) return undefined;
    recordLocalProductView(selectedProduct._id);
    productsAPI.trackInteraction(selectedProduct._id, 'view');
    return undefined;
  }, [selectedProduct?._id]);

  return (
    <DashboardLayout
      title="Product Details"
      subtitle="See full details, pricing, and customer feedback"
    >
      {loadingDetails ? <p>Loading product details...</p> : null}
      {detailsError ? <p className="catalog-error">{detailsError}</p> : null}

      {!loadingDetails && !detailsError && selectedProduct ? (
        <div className="product-detail-wrap">
          <div className="product-detail-card">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="product-detail-image" />
            <div className="product-detail-info">
              <p className="product-detail-category">{selectedProduct.category || 'General'}</p>
              <h2>{selectedProduct.name}</h2>
              <p className="product-detail-desc">{selectedProduct.description || 'No description available.'}</p>

              <div className="product-detail-grid">
                <div>
                  <span>Price</span>
                  <strong>{formatCurrencyFromUSD(selectedProduct.price, currency)}</strong>
                </div>
                <div>
                  <span>Brand</span>
                  <strong>{selectedProduct.brand || 'N/A'}</strong>
                </div>
                <div>
                  <span>Available stock</span>
                  <strong>{selectedProduct.countInStock ?? 0}</strong>
                </div>
              </div>

              <Link to="/products" className="back-link">← Back to products</Link>
            </div>
          </div>

          <ProductRecommendations anchorProductId={selectedProduct._id} />

          <ProductSocial productId={selectedProduct._id} />
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default ProductDetailScreen;
