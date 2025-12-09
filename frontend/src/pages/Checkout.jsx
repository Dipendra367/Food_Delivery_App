// frontend/src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          qty: item.quantity
        })),
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          area: deliveryAddress.state,
          phone: deliveryAddress.phone
        },
        paymentMethod
      };

      await orderAPI.create(orderData);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const deliveryFee = 5.00;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="street"
                type="text"
                required
                value={deliveryAddress.street}
                onChange={handleAddressChange}
                className="input md:col-span-2"
                placeholder="Street Address"
              />
              <input
                name="city"
                type="text"
                required
                value={deliveryAddress.city}
                onChange={handleAddressChange}
                className="input"
                placeholder="City"
              />
              <input
                name="state"
                type="text"
                required
                value={deliveryAddress.state}
                onChange={handleAddressChange}
                className="input"
                placeholder="State"
              />
              <input
                name="zipCode"
                type="text"
                required
                value={deliveryAddress.zipCode}
                onChange={handleAddressChange}
                className="input"
                placeholder="Zip Code"
              />
              <input
                name="phone"
                type="tel"
                required
                value={deliveryAddress.phone}
                onChange={handleAddressChange}
                className="input"
                placeholder="Phone Number"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Method
            </h2>
            <div className="space-y-2">
              {['card', 'cash', 'upi'].map((method) => (
                <label key={method} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="capitalize">{method === 'upi' ? 'UPI' : method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span className="text-gray-700">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary-500">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-4 text-lg"
          >
            {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
