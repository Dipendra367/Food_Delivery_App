import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Camera, Save, Loader, MapPin } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentProfile, setCurrentProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setCurrentProfile(res.data);
            setFormData({ name: res.data.name, email: res.data.email, password: '' });
            if (res.data.profileImage) {
                setPreview(res.data.profileImage);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        if (formData.password) {
            data.append('password', formData.password);
        }
        if (image) {
            data.append('profileImage', image);
        }

        try {
            const res = await api.put('/users/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Profile Updated!');
            setCurrentProfile(res.data);
            updateUser(res.data);
        } catch (err) {
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    if (!currentProfile) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

            {/* Address Management Link */}
            <Link
                to="/addresses"
                className="block bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow border border-orange-200"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-600 p-3 rounded-full">
                            <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Delivery Addresses</h2>
                            <p className="text-gray-600">Manage your saved delivery addresses</p>
                        </div>
                    </div>
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </Link>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <User className="text-orange-600" />
                        Profile Information
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-50 bg-gray-100">
                                    {preview ? (
                                        <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors shadow-lg">
                                    <Camera className="w-5 h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500">Click camera icon to upload</p>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Leave blank to keep current"
                                        className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader className="animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
