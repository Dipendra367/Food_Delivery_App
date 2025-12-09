import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Plus, Minus, Star, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);

        // Fetch Restaurant Details
        if (productRes.data.restaurantId) {
          const restRes = await api.get(`/public/restaurants/${productRes.data.restaurantId}`);
          setRestaurant(restRes.data);
        }

        // Fetch Product Reviews
        const reviewsRes = await api.get(`/reviews/product/${id}`);
        setReviews(reviewsRes.data);

      } catch (err) {
        console.error('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    setQty(1);
  }, [id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId: product._id, qty, product });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${qty} x ${product.name} to cart!`);
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        restaurantId: product.restaurantId,
        productId: product._id,
        rating: newReview.rating,
        comment: newReview.comment
      });

      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/2">
            <img
              className="h-64 w-full object-cover md:h-full"
              src={product.image}
              alt={product.name}
            />
          </div>
          <div className="p-8 md:w-1/2">
            <div className="uppercase tracking-wide text-sm text-orange-600 font-semibold">
              {product.cuisine} • {product.categories.join(', ')}
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Restaurant Link */}
            {restaurant && (
              <Link to={`/restaurants/${restaurant._id}`} className="flex items-center gap-2 mt-2 text-gray-600 hover:text-orange-600 transition-colors">
                <Store size={18} />
                <span className="font-medium">Sold by: {restaurant.restaurantDetails?.restaurantName}</span>
              </Link>
            )}

            <p className="mt-4 text-gray-600">{product.description}</p>
            <div className="mt-4">
              {product.tags.map(tag => (
                <span key={tag} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">NPR {product.price}</span>

              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${product.inStock ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Reviews</h2>

        {/* Write Review */}
        {user ? (
          <div className="mb-8 border-b pb-8">
            <h3 className="text-lg font-bold mb-4">Rate this Product</h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`p-1 transition-colors ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star fill="currentColor" size={24} />
                  </button>
                ))}
              </div>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="How was the food?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows="3"
              ></textarea>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="self-end bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 rounded-xl p-4 mb-8 text-center">
            <p className="text-orange-800">Please <Link to="/login" className="font-bold underline">login</Link> to review this product.</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reviews yet.</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{review.userId?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Similar Items */}
      {product.similarItems && product.similarItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.similarItems.map(item => (
              <ProductCard
                key={item._id}
                product={item}
                onAddToCart={() => {
                  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                  const existing = cart.find(i => i.productId === item._id);
                  if (existing) {
                    existing.qty += 1;
                  } else {
                    cart.push({ productId: item._id, qty: 1, product: item });
                  }
                  localStorage.setItem('cart', JSON.stringify(cart));
                  alert(`Added ${item.name} to cart!`);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;