import React, { useMemo, useState } from 'react';

const STARS = [1, 2, 3, 4, 5];

const ProductSocial = ({ productId }) => {
  const likesKey = 'productLikes';
  const ratingsKey = 'productRatings';
  const reviewsKey = 'productReviews';

  const initialLiked = useMemo(() => {
    const likes = JSON.parse(localStorage.getItem(likesKey) || '{}');
    return !!likes[productId];
  }, [productId]);

  const initialRating = useMemo(() => {
    const ratings = JSON.parse(localStorage.getItem(ratingsKey) || '{}');
    return Number(ratings[productId] || 0);
  }, [productId]);

  const initialReviews = useMemo(() => {
    const reviews = JSON.parse(localStorage.getItem(reviewsKey) || '{}');
    return Array.isArray(reviews[productId]) ? reviews[productId] : [];
  }, [productId]);

  const [liked, setLiked] = useState(initialLiked);
  const [rating, setRating] = useState(initialRating);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewInput, setReviewInput] = useState('');

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : rating
      ? rating.toFixed(1)
      : '0.0';

  const toggleLike = () => {
    const likes = JSON.parse(localStorage.getItem(likesKey) || '{}');
    const next = !liked;
    likes[productId] = next;
    localStorage.setItem(likesKey, JSON.stringify(likes));
    setLiked(next);
  };

  const setProductRating = (value) => {
    const ratings = JSON.parse(localStorage.getItem(ratingsKey) || '{}');
    ratings[productId] = value;
    localStorage.setItem(ratingsKey, JSON.stringify(ratings));
    setRating(value);
  };

  const submitReview = (e) => {
    e.preventDefault();
    const text = reviewInput.trim();
    if (!text) return;

    const userName = localStorage.getItem('userName') || 'Anonymous';
    const savedReviews = JSON.parse(localStorage.getItem(reviewsKey) || '{}');
    const review = {
      author: userName,
      text,
      rating: rating || 0,
      createdAt: new Date().toISOString(),
    };

    const nextReviews = [review, ...(savedReviews[productId] || [])].slice(0, 20);
    savedReviews[productId] = nextReviews;
    localStorage.setItem(reviewsKey, JSON.stringify(savedReviews));
    setReviews(nextReviews);
    setReviewInput('');
  };

  return (
    <section className="product-social">
      <div className="product-social__top">
        <button className={`like-btn ${liked ? 'active' : ''}`} onClick={toggleLike}>
          {liked ? '? Liked' : '? Like'}
        </button>
        <p className="rating-meta">Average rating: <strong>{avgRating}</strong> / 5</p>
      </div>

      <div className="star-row">
        {STARS.map((star) => (
          <button
            key={star}
            className={`star-btn ${star <= rating ? 'active' : ''}`}
            onClick={() => setProductRating(star)}
            type="button"
            title={`${star} star`}
          >
            ?
          </button>
        ))}
      </div>

      <form className="review-form" onSubmit={submitReview}>
        <textarea
          value={reviewInput}
          onChange={(e) => setReviewInput(e.target.value)}
          placeholder="Write your review..."
          rows={3}
        />
        <button type="submit" className="btn-primary">Post review</button>
      </form>

      <div className="review-list">
        {reviews.length === 0 ? <p>No reviews yet.</p> : null}
        {reviews.map((r, idx) => (
          <article className="review-item" key={`${r.createdAt}-${idx}`}>
            <div className="review-head">
              <strong>{r.author}</strong>
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            {r.rating ? <p className="review-rating">{'?'.repeat(r.rating)}</p> : null}
            <p>{r.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductSocial;
