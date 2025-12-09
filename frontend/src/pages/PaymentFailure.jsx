import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');

    return (
        <div className="max-w-2xl mx-auto mt-20 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
                <div className="flex justify-center mb-6">
                    <XCircle className="w-24 h-24 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
                <p className="text-gray-600 mb-6">Unfortunately, your payment could not be processed. Please try again.</p>
                {orderId && (
                    <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
                )}
                <div className="flex gap-4 justify-center mt-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
