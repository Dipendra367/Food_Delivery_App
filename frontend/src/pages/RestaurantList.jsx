import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Star, MapPin, Clock, Search } from 'lucide-react';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cuisineFilter, setCuisineFilter] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, [searchTerm, cuisineFilter]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (cuisineFilter) params.cuisine = cuisineFilter;

            const res = await api.get('/public/restaurants', { params });
            setRestaurants(res.data);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero / Search Section */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Best Restaurants Near You</h1>
                <div className="max-w-2xl mx-auto flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                        />
                    </div>
                    <select
                        value={cuisineFilter}
                        onChange={(e) => setCuisineFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm bg-white"
                    >
                        <option value="">All Cuisines</option>
                        <option value="Nepali">Nepali</option>
                        <option value="Newari">Newari</option>
                        <option value="Indian">Indian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Italian">Italian</option>
                        <option value="Fast Food">Fast Food</option>
                    </select>
                </div>
            </div>

            {/* Restaurant Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map(restaurant => (
                        <Link to={`/restaurants/${restaurant._id}`} key={restaurant._id} className="group">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                                <div className="relative h-48 bg-gray-200">
                                    <img
                                        src={restaurant.restaurantDetails?.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
                                        alt={restaurant.restaurantDetails?.restaurantName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                        <Star size={14} className="text-yellow-400 fill-current" />
                                        <span className="text-xs font-bold text-gray-800">{restaurant.restaurantDetails?.rating || 'New'}</span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {restaurant.restaurantDetails?.restaurantName || restaurant.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {restaurant.restaurantDetails?.description || 'No description available.'}
                                    </p>

                                    <div className="mt-auto space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin size={16} className="text-orange-500" />
                                            <span>{restaurant.restaurantDetails?.address?.area || 'Kathmandu'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock size={16} className="text-green-500" />
                                            <span>Open Now</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {restaurant.restaurantDetails?.cuisine?.map((c, i) => (
                                                <span key={i} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && restaurants.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No restaurants found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantList;
