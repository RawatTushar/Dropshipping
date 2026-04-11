import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  addToCart,
  removeOneFromCart,
  selectCartItemsByUser,
} from '../../features/cart/cartSlice';
import { selectCurrentUserId } from '../../features/auth/authSlice';
import { selectCurrentCurrency } from '../../features/preferences/currencySlice';
import { formatCurrencyFromUSD } from '../../utils/currency';
import { productsAPI } from '../../api/api';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const currency = useSelector(selectCurrentCurrency);
  const cartItems = useSelector((state) => selectCartItemsByUser(state, userId));

  const inCart = cartItems.find((item) => item._id === product._id);

  return (
    <article className="catalog-card" key={product._id}>
      <img
        src={product.image}
        alt={product.name}
        className="catalog-image"
        loading="lazy"
        onClick={() => navigate(`/products/${product._id}`)}
      />
      <div className="catalog-body">
        <p className="catalog-category">{product.category || 'General'}</p>
        <h3 onClick={() => navigate(`/products/${product._id}`)}>{product.name}</h3>
        <div className="catalog-meta">
          <span className="catalog-price">{formatCurrencyFromUSD(product.price, currency)}</span>
          <span className="catalog-stock">Stock: {product.countInStock ?? 0}</span>
        </div>
        <p className={`catalog-in-cart ${inCart ? '' : 'catalog-in-cart--placeholder'}`}>
          {inCart ? `In cart: ${inCart.qty}` : 'In cart: 0'}
        </p>
        <div className="catalog-actions">
          <button
            className="catalog-add-btn liquid-btn"
            onClick={() => {
              dispatch(addToCart({ ...product, userId }));
              productsAPI.trackInteraction(product._id, 'cart_add');
            }}
            disabled={Number(product.countInStock ?? 0) <= 0}
          >
            {Number(product.countInStock ?? 0) <= 0
              ? 'Out of stock'
              : inCart
                ? `Add more (${inCart.qty})`
                : 'Add to cart'}
          </button>
          <button
            className="catalog-remove-btn liquid-btn"
            onClick={() => dispatch(removeOneFromCart({ productId: product._id, userId }))}
            disabled={!inCart}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
