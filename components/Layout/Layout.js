'use client';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            {/* Main content */}
            <div className="lg:pl-64">
                <Header title={title} />

                <main className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
