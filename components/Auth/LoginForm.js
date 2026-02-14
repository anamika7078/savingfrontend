'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/auth';
import { getErrorMessage } from '../../utils/helpers';

export default function LoginForm() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('🔐 Attempting login with:', { username: formData.username });
            const result = await login(formData);
            console.log('✅ Login successful, result:', result);
            
            // Verify token is stored
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            console.log('📦 Token stored:', storedToken ? 'YES (' + storedToken.length + ' chars)' : 'NO');
            console.log('📦 User stored:', storedUser ? 'YES' : 'NO');
            
            if (!storedToken) {
                console.error('❌ CRITICAL: Token was not stored after login!');
                setError('Login failed: Token not stored. Please try again.');
                return;
            }
            
            console.log('✅ Redirecting to dashboard...');
            router.push('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Community Finance Management System
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-error-50 p-4">
                            <div className="text-sm text-error-800">{error}</div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="input mt-1"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input mt-1"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
                                Register here
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
