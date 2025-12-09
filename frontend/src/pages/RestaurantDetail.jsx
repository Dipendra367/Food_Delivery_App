import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import AddressMap from '../components/AddressMap';
import { Star, MapPin, Clock, Phone, Info } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchRestaurantData();
    }, [id]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);
            const [restaurantRes, menuRes, reviewsRes] = await Promise.all([
                api.get(`/public/restaurants/${id}`),
                api.get(`/public/restaurants/${id}/menu`),
                api.get(`/reviews/restaurant/${id}`)
            ]);
            setRestaurant(restaurantRes.data);
            setProducts(menuRes.data);
            setReviews(reviewsRes.data);
        } catch (err) {
            console.error('Error fetching restaurant data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!newReview.comment.trim()) return;

        try {
            setSubmittingReview(true);
            const res = await api.post('/reviews', {
                restaurantId: id,
                rating: newReview.rating,
                comment: newReview.comment
            });

            // Add new review to list
            setReviews([res.data, ...reviews]);
            setNewReview({ rating: 5, comment: '' });

            // Update restaurant rating in UI (optional, but nice)
            // Ideally we'd re-fetch restaurant data or update local state
            fetchRestaurantData();
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!restaurant) {
        return <div className="text-center py-12">Restaurant not found</div>;
    }

    // Get unique categories
    const categories = ['All', ...new Set(products.flatMap(p => p.categories))];

    // Filter products
    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.categories.includes(activeCategory));

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 bg-gray-900">
                <img
                    src={restaurant.restaurantDetails?.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'}
                    alt={restaurant.restaurantDetails?.restaurantName}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.restaurantDetails?.restaurantName}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-200">
                                <div className="flex items-center gap-1">
                                    <Star className="text-yellow-400 fill-current" size={18} />
                                    <span className="font-bold text-white">{restaurant.restaurantDetails?.rating || 'New'}</span>
                                    <span>({restaurant.restaurantDetails?.totalReviews || 0} reviews)</span>
                                </div>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <div className="flex items-center gap-1">
                                    <MapPin size={18} />
                                    <span>{restaurant.restaurantDetails?.address?.area}, {restaurant.restaurantDetails?.address?.city}</span>
                                </div>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <div className="flex items-center gap-1">
                                    <Clock size={18} />
                                    <span>30-45 min</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {restaurant.restaurantDetails?.cuisine?.map((c, i) => (
                                <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Info Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                            <Phone size={20} className="text-orange-600" />
                            <span className="text-lg">{restaurant.restaurantDetails?.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Info size={20} className="text-orange-600 mt-1" />
                            <span className="text-lg">{restaurant.restaurantDetails?.description}</span>
                        </div>
                    </div>

                    {/* Map Location */}
                    <div className="bg-white rounded-xl shadow-sm p-2 h-48 lg:h-auto">
                        {restaurant.restaurantDetails?.address?.coordinates ? (
                            <AddressMap
                                coordinates={restaurant.restaurantDetails.address.coordinates}
                                address={`${restaurant.restaurantDetails.address.area}, ${restaurant.restaurantDetails.address.city}`}
                                height="100%"
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                                Map not available
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Section */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Categories Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-lg text-left whitespace-nowrap transition-colors ${activeCategory === cat
                                            ? 'bg-orange-600 text-white font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeCategory} Items</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No items found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Reviews Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>

                    {/* Write Review Form */}
                    {user ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                            <h3 className="text-lg font-bold mb-4">Write a Review</h3>
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
                                    placeholder="Share your experience..."
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
                        <div className="bg-orange-50 rounded-xl p-6 mb-8 text-center">
                            <p className="text-orange-800">Please <a href="/login" className="font-bold underline">login</a> to write a review.</p>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="bg-white rounded-xl shadow-sm p-6">
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
            </div>
        </div>
    );
};

export default RestaurantDetail;
