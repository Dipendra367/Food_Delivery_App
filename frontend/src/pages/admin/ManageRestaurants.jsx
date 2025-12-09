/ frontend/src/pages/admin/ManageRestaurants.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';

const ManageRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: [],
    image: '',
    'address.city': '',
    'address.state': '',
    'address.zipCode': '',
    rating: 4.0,
    deliveryTime: '30-40 mins',
    minimumOrder: 15
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await adminAPI.getRestaurants();
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Parse cuisine array
      const data = {
        ...formData,
        cuisine: typeof formData.cuisine === 'string' ? formData.cuisine.split(',').map(c => c.trim()) : formData.cuisine,
        address: {
          city: formData['address.city'],
          state: formData['address.state'],
          zipCode: formData['address.zipCode']
        }
      };
      
      if (editingId) {
        await adminAPI.updateRestaurant(editingId, data);
      } else {
        await adminAPI.createRestaurant(data);
      }
      
      fetchRestaurants();
      resetForm();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      alert(error.response?.data?.error || 'Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant) => {
    setEditingId(restaurant._id);
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      cuisine: restaurant.cuisine.join(', '),
      image: restaurant.image,
      'address.city': restaurant.address?.city || '',
      'address.state': restaurant.address?.state || '',
      'address.zipCode': restaurant.address?.zipCode || '',
      rating: restaurant.rating,
      deliveryTime: restaurant.deliveryTime,
      minimumOrder: restaurant.minimumOrder
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant and all its products?')) {
      try {
        await adminAPI.deleteRestaurant(id);
        fetchRestaurants();
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        alert('Failed to delete restaurant');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      cuisine: [],
      image: '',
      'address.city': '',
      'address.state': '',
      'address.zipCode': '',
      rating: 4.0,
      deliveryTime: '30-40 mins',
      minimumOrder: 15
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Restaurants</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Restaurant
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Restaurant</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Restaurant Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Cuisine Types (comma-separated)"
                required
                value={formData.cuisine}
                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input md:col-span-2"
                rows="3"
              />
              <input
                type="url"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="input md:col-span-2"
              />
              <input
                type="text"
                placeholder="City"
                value={formData['address.city']}
                onChange={(e) => setFormData({ ...formData, 'address.city': e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="State"
                value={formData['address.state']}
                onChange={(e) => setFormData({ ...formData, 'address.state': e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={formData['address.zipCode']}
                onChange={(e) => setFormData({ ...formData, 'address.zipCode': e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Delivery Time (e.g., 30-40 mins)"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                className="input"
              />
              <div className="flex gap-4 md:col-span-2">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'} Restaurant
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Restaurants Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{restaurant.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.cuisine.map((c) => (
                      <span key={c} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEdit(restaurant)}
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant._id)}
                      className="text-red-500 hover:text-red-700 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRestaurants;