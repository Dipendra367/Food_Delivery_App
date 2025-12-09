import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

import { TrendingUp, UtensilsCrossed, Star, MapPin } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? 'All' : category);
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ productId: product._id, qty: 1, product });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `url('/hero-food-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/40 to-orange-700/30"></div>
        <div className="relative px-8 py-16 md:py-24 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Taste of Nepal, <br /> Delivered to You
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            From steaming Momos to authentic Thakali sets, get your favorite meals delivered in minutes.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Order Now
          </button>
        </div>
      </div>

      {/* Special Offers / Coupons */}
      <CouponsSection />

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UtensilsCrossed className="text-orange-600" />
          Explore Categories
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {['Momo', 'Thakali', 'Newari', 'Noodles', 'Snacks'].map(cat => (
            <div
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 w-32 h-32 rounded-xl shadow-sm border flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer group ${selectedCategory === cat ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${selectedCategory === cat ? 'bg-orange-200' : 'bg-orange-50 group-hover:bg-orange-100'}`}>
                <span className="text-2xl">🍽️</span>
              </div>
              <span className={`font-medium group-hover:text-orange-600 ${selectedCategory === cat ? 'text-orange-700' : 'text-gray-700'}`}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Restaurants */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          Popular Restaurants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PopularRestaurants />
        </div>
      </div>

      {/* Fresh Menu (New Arrivals) */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">🆕</span>
          {selectedCategory === 'All' ? 'Fresh on the Menu' : `${selectedCategory} Menu`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* We'll fetch all products and show the last 4 */}
          <FreshMenu selectedCategory={selectedCategory} />
        </div>
      </div>
    </div>
  );
};

const PopularRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/public/restaurants').then(res => {
      setRestaurants(res.data.slice(0, 3)); // Show top 3
    });
  }, []);

  return (
    <>
      {restaurants.map(restaurant => (
        <div
          key={restaurant._id}
          onClick={() => navigate(`/restaurants/${restaurant._id}`)}
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-gray-100"
        >
          <div className="relative h-48">
            <img
              src={restaurant.restaurantDetails?.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
              alt={restaurant.restaurantDetails?.restaurantName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-current" />
              {restaurant.restaurantDetails?.rating || 'New'}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
              {restaurant.restaurantDetails?.restaurantName}
            </h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-1">{restaurant.restaurantDetails?.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-orange-500" />
                <span>{restaurant.restaurantDetails?.address?.area}</span>
              </div>
              <div className="flex gap-2">
                {restaurant.restaurantDetails?.cuisine?.slice(0, 2).map((c, i) => (
                  <span key={i} className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const CouponsSection = () => {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    api.get('/coupons')
      .then(res => setCoupons(res.data))
      .catch(err => console.error('Failed to fetch coupons:', err));
  }, []);

  if (coupons.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="text-orange-600" />
        Special Offers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon._id} className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white relative overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-3xl font-bold">{coupon.discountPercent}% OFF</h3>
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                  Min Order: NPR {coupon.minOrderAmount}
                </span>
              </div>
              <p className="text-orange-100 mb-4 font-medium">{coupon.description}</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center border border-white/30 group cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(coupon.code);
                  alert('Coupon code copied!');
                }}>
                <span className="font-mono font-bold text-lg tracking-wider">{coupon.code}</span>
                <span className="text-xs bg-white text-orange-600 px-2 py-1 rounded font-bold group-hover:bg-gray-100 transition-colors">
                  COPY
                </span>
              </div>
              <p className="text-xs text-orange-200 mt-2 flex items-center gap-1">
                <span>Valid until {new Date(coupon.validTo).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FreshMenu = ({ selectedCategory }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data.reverse());
    });
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products.slice(0, 8) // Show top 8 if All
    : products.filter(p => p.categories.includes(selectedCategory));

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ productId: product._id, qty: 1, product });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${product.name} to cart!`);
  };

  return (
    <>
      {filteredProducts.map(product => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </>
  );
};

export default Home;