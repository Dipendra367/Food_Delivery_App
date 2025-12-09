import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Plus, Edit2, Trash2, Check, Map } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import AddressMap from '../components/AddressMap';

const Addresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        street: '',
        city: '',
        area: '',
        landmark: '',
        phone: '',
        coordinates: null
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Use useCallback to prevent infinite loops
    const handleLocationSelect = useCallback((coords) => {
        setFormData(prev => ({ ...prev, coordinates: coords }));
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch addresses');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await api.put(`/addresses/${editingId}`, formData);
                alert('Address updated successfully');
            } else {
                await api.post('/addresses', formData);
                alert('Address added successfully');
            }

            setFormData({
                label: '',
                street: '',
                city: '',
                area: '',
                landmark: '',
                phone: '',
                coordinates: null
            });
            setShowForm(false);
            setEditingId(null);
            fetchAddresses();
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save address';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (address) => {
        setFormData({
            label: address.label,
            street: address.street,
            city: address.city,
            area: address.area,
            landmark: address.landmark || '',
            phone: address.phone,
            coordinates: address.coordinates || null
        });
        setEditingId(address._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            await api.delete(`/addresses/${id}`);
            alert('Address deleted successfully');
            fetchAddresses();
        } catch (err) {
            console.error(err);
            alert('Failed to delete address');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await api.put(`/addresses/${id}/default`);
            fetchAddresses();
        } catch (err) {
            console.error(err);
            alert('Failed to set default address');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Delivery Addresses</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({
                            label: '',
                            street: '',
                            city: '',
                            area: '',
                            landmark: '',
                            phone: '',
                            coordinates: null
                        });
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add New Address
                </button>
            </div>

            {/* Address Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {editingId ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Label *
                                </label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g., Home, Office"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="9800000000"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                placeholder="House/Flat No., Building Name"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Area *
                                </label>
                                <input
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    placeholder="e.g., Thamel, Patan"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="e.g., Kathmandu"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.landmark}
                                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                placeholder="e.g., Near Bhatbhateni Supermarket"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Map Picker - Optional */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Location on Map (Optional)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowMap(!showMap)}
                                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                                >
                                    <Map className="h-4 w-4" />
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </button>
                            </div>
                            {showMap && (
                                <MapPicker
                                    initialPosition={formData.coordinates}
                                    onLocationSelect={handleLocationSelect}
                                    height="350px"
                                />
                            )}
                            {!showMap && formData.coordinates && (
                                <p className="text-sm text-gray-500">
                                    Location saved: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
                {addresses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses yet</h3>
                        <p className="text-gray-500 mb-4">Add a delivery address to place orders</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700 transition-colors"
                        >
                            Add Your First Address
                        </button>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div
                            key={address._id}
                            className={`bg-white rounded-lg shadow-md p-6 ${address.isDefault ? 'border-2 border-orange-500' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{address.label}</h3>
                                        {address.isDefault && (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700">{address.street}</p>
                                    <p className="text-gray-600">{address.area}, {address.city}</p>
                                    {address.landmark && (
                                        <p className="text-gray-500 text-sm">Landmark: {address.landmark}</p>
                                    )}
                                    <p className="text-gray-600 mt-2">Phone: {address.phone}</p>
                                </div>
                                <div className="flex gap-2">
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address._id)}
                                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                                            title="Set as default"
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address._id)}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Show map if coordinates exist */}
                            {address.coordinates && address.coordinates.lat && address.coordinates.lng && (
                                <div className="mt-4">
                                    <AddressMap
                                        coordinates={address.coordinates}
                                        address={`${address.street}, ${address.area}, ${address.city}`}
                                        height="200px"
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Addresses;
