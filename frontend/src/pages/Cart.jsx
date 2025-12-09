import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Wallet, CreditCard, MapPin, Plus } from 'lucide-react';
import AddressMap from '../components/AddressMap';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
            // Auto-select default address
            const defaultAddr = response.data.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
            } else if (response.data.length > 0) {
                setSelectedAddressId(response.data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const updateQty = (productId, newQty) => {
        if (newQty < 1) return;
        const newCart = cart.map(item =>
            item.productId === productId ? { ...item, qty: newQty } : item
        );
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeItem = (productId) => {
        const newCart = cart.filter(item => item.productId !== productId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
    const FREE_DELIVERY_THRESHOLD = 500;
    const DELIVERY_CHARGE = 50;
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const total = subtotal + deliveryCharge - discountAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError('');
        try {
            const res = await api.post('/coupons/validate', {
                code: couponCode,
                orderAmount: subtotal
            });
            setAppliedCoupon(res.data);
            // alert('Coupon applied successfully!');
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon');
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Validate address selection for non-cash payments or if user wants delivery
        if (!selectedAddressId && addresses.length === 0) {
            alert('Please add a delivery address before placing an order.');
            navigate('/addresses');
            return;
        }

        if (!selectedAddressId && addresses.length > 0) {
            alert('Please select a delivery address.');
            return;
        }

        setLoading(true);
        try {
            const items = cart.map(item => ({
                productId: item.productId,
                qty: item.qty
            }));

            const orderResponse = await api.post('/orders', {
                items,
                paymentMethod,
                deliveryAddressId: selectedAddressId,
                status: paymentMethod === 'cash' ? 'pending' : 'draft',
                couponCode: appliedCoupon?.code
            });
            const orderId = orderResponse.data._id;

            if (paymentMethod === 'cash') {
                // Clear cart and redirect to orders
                localStorage.removeItem('cart');
                setCart([]);
                alert('Order placed successfully!');
                navigate('/orders');
            } else if (paymentMethod === 'esewa') {
                // Initiate eSewa payment
                const esewaResponse = await api.post('/payments/esewa/initiate', { orderId });
                const { paymentUrl, paymentData } = esewaResponse.data;

                // Create a form and submit to eSewa
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = paymentUrl;

                Object.keys(paymentData).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = paymentData[key];
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else if (paymentMethod === 'khalti') {
                // Initiate Khalti payment
                const khaltiResponse = await api.post('/payments/khalti/initiate', { orderId });
                const { publicKey, amount, productIdentity, productName, productUrl } = khaltiResponse.data;

                // Load Khalti checkout
                const config = {
                    publicKey,
                    productIdentity,
                    productName,
                    productUrl,
                    amount,
                    eventHandler: {
                        onSuccess: async (payload) => {
                            // Verify payment
                            try {
                                await api.post('/payments/khalti/verify', {
                                    token: payload.token,
                                    amount: payload.amount,
                                    orderId
                                });
                                localStorage.removeItem('cart');
                                setCart([]);
                                navigate(`/payment/success?orderId=${orderId}`);
                            } catch (err) {
                                console.error(err);
                                navigate(`/payment/failure?orderId=${orderId}`);
                            }
                        },
                        onError: (error) => {
                            console.error(error);
                            navigate(`/payment/failure?orderId=${orderId}`);
                        },
                        onClose: () => {
                            console.log('Khalti widget closed');
                        }
                    }
                };

                const checkout = new window.KhaltiCheckout(config);
                checkout.show({ amount });
            }
        } catch (err) {
            console.error('Checkout error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to place order.';
            alert(errorMessage);

            // If email not verified, redirect to verify email page
            if (err.response?.data?.emailVerified === false) {
                navigate('/verify-email');
            }
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/products')}
                    className="text-orange-600 hover:underline font-medium"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <ul className="divide-y divide-gray-200">
                    {cart.map(item => (
                        <li key={item.productId} className="p-6 flex items-center justify-between">
                            <div className="flex items-center">
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="h-16 w-16 object-cover rounded-md"
                                />
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                                    <p className="text-gray-500">NPR {item.product.price}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center border rounded-md">
                                    <button
                                        onClick={() => updateQty(item.productId, item.qty - 1)}
                                        className="px-3 py-1 hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 font-medium">{item.qty}</span>
                                    <button
                                        onClick={() => updateQty(item.productId, item.qty + 1)}
                                        className="px-3 py-1 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="font-medium text-gray-900 w-20 text-right">
                                    NPR {(item.product.price * item.qty).toFixed(2)}
                                </p>
                                <button
                                    onClick={() => removeItem(item.productId)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* User Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Details</h2>
                <div className="space-y-2">
                    <p className="text-gray-700"><span className="font-medium">Name:</span> {user.name}</p>
                    <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
                </div>
            </div>

            {/* Delivery Address Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="text-orange-600" />
                        Delivery Address
                    </h2>
                    <button
                        onClick={() => navigate('/addresses')}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Add New
                    </button>
                </div>

                {loadingAddresses ? (
                    <p className="text-gray-500">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-6 bg-orange-50 rounded-lg">
                        <MapPin className="h-12 w-12 text-orange-300 mx-auto mb-2" />
                        <p className="text-gray-600 mb-3">No delivery addresses found</p>
                        <button
                            onClick={() => navigate('/addresses')}
                            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                        >
                            Add Delivery Address
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {addresses.map((address) => (
                            <label
                                key={address._id}
                                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedAddressId === address._id ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="deliveryAddress"
                                    value={address._id}
                                    checked={selectedAddressId === address._id}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                    className="mt-1 w-4 h-4 text-orange-600"
                                />
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">{address.label}</span>
                                        {address.isDefault && (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 text-sm">{address.street}</p>
                                    <p className="text-gray-600 text-sm">{address.area}, {address.city}</p>
                                    {address.landmark && (
                                        <p className="text-gray-500 text-sm">Landmark: {address.landmark}</p>
                                    )}
                                    <p className="text-gray-600 text-sm mt-1">Phone: {address.phone}</p>

                                    {/* Map Preview for Selected Address */}
                                    {selectedAddressId === address._id && address.coordinates && (
                                        <div className="mt-3">
                                            <AddressMap
                                                coordinates={address.coordinates}
                                                address={`${address.street}, ${address.area}`}
                                                height="150px"
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="text-orange-600" />
                    Select Payment Method
                </h2>
                <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: paymentMethod === 'cash' ? '#ea580c' : '#e5e7eb' }}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-orange-600"
                        />
                        <CreditCard className="ml-3 w-6 h-6 text-gray-600" />
                        <span className="ml-3 font-medium text-gray-900">Cash on Delivery</span>
                    </label>

                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: paymentMethod === 'esewa' ? '#ea580c' : '#e5e7eb' }}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="esewa"
                            checked={paymentMethod === 'esewa'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-orange-600"
                        />
                        <div className="ml-3 w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
                            e
                        </div>
                        <span className="ml-3 font-medium text-gray-900">eSewa</span>
                        <span className="ml-2 text-xs text-gray-500">(Test Mode)</span>
                    </label>

                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: paymentMethod === 'khalti' ? '#ea580c' : '#e5e7eb' }}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="khalti"
                            checked={paymentMethod === 'khalti'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-orange-600"
                        />
                        <div className="ml-3 w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
                            K
                        </div>
                        <span className="ml-3 font-medium text-gray-900">Khalti</span>
                        <span className="ml-2 text-xs text-gray-500">(Test Mode)</span>
                    </label>
                </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="text-orange-600" />
                    Apply Coupon
                </h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter Coupon Code"
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                        <button
                            onClick={handleRemoveCoupon}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200"
                        >
                            Remove
                        </button>
                    ) : (
                        <button
                            onClick={handleApplyCoupon}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
                        >
                            Apply
                        </button>
                    )}
                </div>
                {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                {appliedCoupon && (
                    <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex justify-between items-center">
                        <span>Coupon <b>{appliedCoupon.code}</b> applied!</span>
                        <span className="font-bold">- NPR {appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Total and Checkout */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">NPR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Delivery Charge</span>
                        <span className="font-medium">
                            {deliveryCharge === 0 ? (
                                <span className="text-green-600">FREE</span>
                            ) : (
                                `NPR ${deliveryCharge.toFixed(2)}`
                            )}
                        </span>
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>- NPR {appliedCoupon.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {subtotal < FREE_DELIVERY_THRESHOLD && (
                        <p className="text-sm text-orange-600">
                            Add NPR {(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)} more for free delivery!
                        </p>
                    )}
                    <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-3xl font-bold text-gray-900">NPR {total.toFixed(2)}</span>
                    </div>
                </div>
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className={`w-full bg-orange-600 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
            </div>
        </div>
    );
};

export default Cart;
