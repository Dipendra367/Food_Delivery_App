import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            setSubmitted(true);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center">
                        <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-sm text-gray-500 mb-6">
                            If you don't see the email, check your spam folder.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <Link
                    to="/login"
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Login
                </Link>

                <div className="text-center mb-8">
                    <div className="bg-orange-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Mail className="h-10 w-10 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                    <p className="text-gray-600">
                        No worries! Enter your email and we'll send you a reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    {message && !submitted && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Remember your password?{' '}
                        <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
