import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, MapPin, Package } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                NepEats
              </span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Menu
              </Link>
              {user && (
                <Link to="/orders" className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Orders
                </Link>
              )}
              {user && user.isAdmin && (
                <Link to="/admin" className="text-orange-600 hover:text-orange-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {user && user.role === 'restaurant' && (
                <Link to="/restaurant/dashboard" className="text-orange-600 hover:text-orange-700 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-gray-600 hover:text-orange-600 relative p-2 rounded-full hover:bg-orange-50 transition-colors">
              <ShoppingCart className="h-6 w-6" />
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/orders" className="text-gray-500 hover:text-orange-600 p-2 rounded-full hover:bg-orange-50 transition-colors" title="Orders">
                  <Package className="h-6 w-6" />
                </Link>
                <Link to="/addresses" className="text-gray-500 hover:text-orange-600 p-2 rounded-full hover:bg-orange-50 transition-colors" title="Addresses">
                  <MapPin className="h-6 w-6" />
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-orange-600 p-2 rounded-full hover:bg-orange-50 transition-colors">
                  <User className="h-6 w-6" />
                </Link>
                <div className="flex items-center gap-2">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all hover:scale-105">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;