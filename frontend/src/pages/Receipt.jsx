import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Printer, Download, ArrowLeft, Loader } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Receipt = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReceipt();
    }, [orderId]);

    const fetchReceipt = async () => {
        try {
            const response = await api.get(`/receipts/${orderId}/data`);
            setReceipt(response.data);
        } catch (err) {
            console.error('Error fetching receipt:', err);
            setError('Failed to load receipt');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Use browser's native print-to-PDF functionality
        // This is more reliable than html2canvas for complex CSS
        const printButton = document.createElement('style');
        printButton.innerHTML = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .receipt, .receipt * {
                    visibility: visible;
                }
                .receipt {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(printButton);

        // Trigger print dialog
        window.print();

        // Clean up
        setTimeout(() => {
            document.head.removeChild(printButton);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (error || !receipt) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Receipt not found'}</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="text-orange-600 hover:underline font-medium"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const orderDate = new Date(receipt.orderDate).toLocaleString('en-NP', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    return (
        <div className="max-w-4xl mx-auto">
            {/* Action Buttons - Hidden when printing */}
            <div className="no-print mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Orders
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                    >
                        <Printer className="h-5 w-5" />
                        Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <Download className="h-5 w-5" />
                        Download
                    </button>
                </div>
            </div>

            {/* Receipt Content */}
            <div className="receipt bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center border-b-2 border-orange-600 pb-6 mb-8">
                    <h1 className="text-4xl font-bold text-orange-600 mb-2">FoodMandu AI</h1>
                    <p className="text-gray-600 text-lg">Order Receipt</p>
                </div>

                {/* Order Information */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Order Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 text-sm">Order ID</p>
                            <p className="font-medium">#{receipt.orderId}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Order Date</p>
                            <p className="font-medium">{orderDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${receipt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                receipt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {receipt.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Customer Details</h2>
                    <div className="space-y-2">
                        <div>
                            <p className="text-gray-600 text-sm">Name</p>
                            <p className="font-medium">{receipt.customer.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Email</p>
                            <p className="font-medium">{receipt.customer.email}</p>
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                {receipt.deliveryAddress && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Delivery Address</h2>
                        <div className="space-y-2">
                            <p className="font-medium">{receipt.deliveryAddress.label}</p>
                            <p className="text-gray-700">{receipt.deliveryAddress.street}</p>
                            <p className="text-gray-700">{receipt.deliveryAddress.area}, {receipt.deliveryAddress.city}</p>
                            {receipt.deliveryAddress.landmark && (
                                <p className="text-gray-600 text-sm">Landmark: {receipt.deliveryAddress.landmark}</p>
                            )}
                            <p className="text-gray-700">Phone: {receipt.deliveryAddress.phone}</p>
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Order Items</h2>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {receipt.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4">{item.name}</td>
                                    <td className="text-right py-3 px-4">{item.quantity}</td>
                                    <td className="text-right py-3 px-4">NPR {item.price.toFixed(2)}</td>
                                    <td className="text-right py-3 px-4">NPR {item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                            <tr className="border-t-2">
                                <td colSpan="3" className="text-right py-3 px-4 font-semibold">Subtotal:</td>
                                <td className="text-right py-3 px-4">NPR {receipt.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="text-right py-3 px-4 font-semibold">Delivery Charge:</td>
                                <td className="text-right py-3 px-4">
                                    {receipt.deliveryCharge === 0 ? 'FREE' : `NPR ${receipt.deliveryCharge.toFixed(2)}`}
                                </td>
                            </tr>
                            <tr className="bg-gray-50 border-t-2">
                                <td colSpan="3" className="text-right py-4 px-4 font-bold text-lg">TOTAL:</td>
                                <td className="text-right py-4 px-4 font-bold text-lg">NPR {receipt.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payment Information */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Payment Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 text-sm">Payment Method</p>
                            <p className="font-medium uppercase">{receipt.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Payment Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${receipt.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                receipt.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {receipt.paymentStatus.toUpperCase()}
                            </span>
                        </div>
                        {receipt.transactionId && (
                            <div className="col-span-2">
                                <p className="text-gray-600 text-sm">Transaction ID</p>
                                <p className="font-medium">{receipt.transactionId}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t mt-8">
                    <p className="text-gray-700 font-medium mb-1">Thank you for your order!</p>
                    <p className="text-gray-600 text-sm">For any queries, contact us at support@foodmandu.com</p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .receipt {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default Receipt;
