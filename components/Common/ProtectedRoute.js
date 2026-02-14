'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Small delay to ensure localStorage is available
        const timer = setTimeout(() => {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            console.log('ProtectedRoute - User:', user);

            if (!user) {
                console.log('ProtectedRoute: No user, redirecting to login');
                router.push('/auth/login');
                return;
            }

            if (adminOnly && user?.role !== 'admin') {
                console.log('ProtectedRoute: Not admin, redirecting to dashboard');
                router.push('/dashboard');
                return;
            }

            console.log('ProtectedRoute: Authorized');
            setAuthorized(true);
            setLoading(false);
        }, 100);

        return () => clearTimeout(timer);
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
