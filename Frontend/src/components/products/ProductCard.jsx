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
import { discountPercent, formatSoldCount } from '../../utils/catalogDisplay';
import { productsAPI } from '../../api/api';

function StarRow({ rating }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const filled = Math.min(5, Math.round(r));
  return (
    <span className="catalog-stars" aria-label={`${r.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < filled ? 'catalog-star catalog-star--on' : 'catalog-star'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const currency = useSelector(selectCurrentCurrency);
  const cartItems = useSelector((state) => selectCartItemsByUser(state, userId));

  const inCart = cartItems.find((item) => item._id === product._id);
  const pct = discountPercent(product);
  const listPrice = Number(product.compareAtPrice || 0);
  const salePrice = Number(product.price || 0);
  const showDiscount = pct > 0 && listPrice > salePrice;
  const rating = Number(product.rating || 0);
  const reviews = Number(product.reviewCount || 0);

  return (
    <article className="catalog-card" key={product._id}>
      <div className="catalog-card-media">
        {showDiscount ? (
          <span className="catalog-badge catalog-badge--sale">-{pct}%</span>
        ) : null}
        <img
          src={product.image}
          alt={product.name}
          className="catalog-image"
          loading="lazy"
          onClick={() => navigate(`/products/${product._id}`)}
        />
      </div>
      <div className="catalog-body">
        <p className="catalog-category">{product.category || 'General'}</p>
        <h3 onClick={() => navigate(`/products/${product._id}`)}>{product.name}</h3>
        <div className="catalog-rating-row">
          <StarRow rating={rating} />
          {rating > 0 ? (
            <span className="catalog-rating-num">{rating.toFixed(1)}</span>
          ) : null}
          {reviews > 0 ? (
            <span className="catalog-review-count">({reviews})</span>
          ) : (
            <span className="catalog-review-count catalog-review-count--muted">New</span>
          )}
          <span className="catalog-sold-pill">{formatSoldCount(product.soldCount)}</span>
        </div>
        <div className="catalog-meta catalog-meta--price">
          <span className="catalog-price-block">
            <span className="catalog-price">{formatCurrencyFromUSD(product.price, currency)}</span>
            {showDiscount ? (
              <span className="catalog-compare-at">
                {formatCurrencyFromUSD(product.compareAtPrice, currency)}
              </span>
            ) : null}
          </span>
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
