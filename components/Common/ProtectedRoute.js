'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '../../lib/auth';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            const user = getCurrentUser();

            if (!authenticated) {
                router.push('/auth/login');
                return;
            }

            if (adminOnly && user?.role !== 'admin') {
                router.push('/dashboard');
                return;
            }

            setAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router, adminOnly]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return children;
}
