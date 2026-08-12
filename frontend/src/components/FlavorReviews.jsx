import React, { useMemo, useState } from 'react';

const ratingFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateTime = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export default function FlavorReviews({ products, reviews, onCreateReview }) {
  const [form, setForm] = useState({
    customer: '',
    flavor: '',
    rating: '5',
    review: ''
  });

  const flavors = useMemo(() => {
    const flavorSet = new Set(products.map((product) => product.flavor).filter(Boolean));
    return [...flavorSet].sort((left, right) => left.localeCompare(right));
  }, [products]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, entry) => sum + Number(entry.rating), 0);
    return total / reviews.length;
  }, [reviews]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.customer.trim() || !form.flavor || !form.review.trim()) return;

    onCreateReview({
      id: `review-${Date.now()}`,
      customer: form.customer.trim(),
      flavor: form.flavor,
      rating: Number(form.rating),
      review: form.review.trim(),
      created_at: new Date().toISOString()
    });

    setForm((current) => ({
      ...current,
      customer: '',
      review: '',
      rating: '5'
    }));
  }

  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>Customer Flavor Reviews</h2>
          <span>Share taste feedback by flavor</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label htmlFor="review-customer">
            Customer name
            <input
              id="review-customer"
              type="text"
              value={form.customer}
              onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))}
              placeholder="Ava from Northwind"
              required
            />
          </label>

          <label htmlFor="review-flavor">
            Flavor
            <select
              id="review-flavor"
              value={form.flavor}
              onChange={(event) => setForm((current) => ({ ...current, flavor: event.target.value }))}
              required
            >
              <option value="">Select a flavor</option>
              {flavors.map((flavor) => (
                <option key={flavor} value={flavor}>{flavor}</option>
              ))}
            </select>
          </label>

          <label htmlFor="review-rating">
            Rating (1 to 5)
            <select
              id="review-rating"
              value={form.rating}
              onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}
            >
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </label>

          <label htmlFor="review-comment">
            Review
            <input
              id="review-comment"
              type="text"
              value={form.review}
              onChange={(event) => setForm((current) => ({ ...current, review: event.target.value }))}
              placeholder="Creamy texture and balanced sweetness"
              required
            />
          </label>

          <button type="submit">Submit Review</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Recent Feedback</h2>
          <span>{reviews.length} submitted reviews</span>
        </div>

        <div className="review-stats" role="status" aria-live="polite">
          <strong>Average rating</strong>
          <span>{averageRating ? `${ratingFormatter.format(averageRating)} / 5` : 'No reviews yet'}</span>
        </div>

        <div className="transaction-list">
          {reviews.length === 0 && <div className="message">No customer reviews yet.</div>}
          {reviews.map((entry) => (
            <article className="transaction-card" key={entry.id}>
              <div>
                <strong>{entry.customer}</strong>
                <span>{dateTime.format(new Date(entry.created_at))}</span>
              </div>
              <div>
                <span>{entry.flavor}</span>
                <span className="rating-pill">{entry.rating} / 5</span>
              </div>
              <p>{entry.review}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
