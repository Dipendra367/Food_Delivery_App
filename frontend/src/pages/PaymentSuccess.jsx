import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const refId = searchParams.get('refId');

    return (
        <div className="max-w-2xl mx-auto mt-20 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-24 h-24 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
                {orderId && (
                    <p className="text-sm text-gray-500 mb-2">Order ID: {orderId}</p>
                )}
                {refId && (
                    <p className="text-sm text-gray-500 mb-6">Transaction ID: {refId}</p>
                )}
                <div className="flex gap-4 justify-center mt-8">
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                        View Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
