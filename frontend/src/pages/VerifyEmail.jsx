import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error, no-token
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);
    const [resendEmail, setResendEmail] = useState('');

    useEffect(() => {
        if (token) {
            verifyEmail();
        } else {
            // No token provided, show resend form
            setStatus('no-token');
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await api.get(`/auth/verify-email/${token}`);
            setStatus('success');
            setMessage(response.data.message);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        }
    };

    const handleResend = async (e) => {
        if (e) e.preventDefault();

        const emailToUse = resendEmail || prompt('Please enter your email address:');
        if (!emailToUse) return;

        setResending(true);
        try {
            const response = await api.post('/auth/resend-verification', { email: emailToUse });
            alert(response.data.message);
            setMessage('Verification email sent! Please check your inbox.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                {status === 'verifying' && (
                    <div className="text-center">
                        <Loader className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
                        <p className="text-gray-600">Please wait while we verify your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-sm text-gray-500 mb-4">Redirecting to login page...</p>
                        <Link
                            to="/login"
                            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>

                        <div className="space-y-3">
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {resending ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-5 w-5" />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>

                            <Link
                                to="/login"
                                className="block text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'no-token' && (
                    <div className="text-center">
                        <div className="bg-orange-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Mail className="h-12 w-12 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification Required</h2>
                        <p className="text-gray-600 mb-6">
                            Please verify your email address to continue. Enter your email below to resend the verification link.
                        </p>

                        {message && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleResend} className="space-y-4">
                            <input
                                type="email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={resending}
                                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {resending ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-5 w-5" />
                                        Send Verification Email
                                    </>
                                )}
                            </button>
                        </form>

                        <Link
                            to="/login"
                            className="block mt-4 text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
