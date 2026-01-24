'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    UserGroupIcon,
    BanknotesIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { getCurrentUser, logout } from '../../lib/auth';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Members', href: '/members', icon: UserGroupIcon },
    { name: 'Savings', href: '/savings', icon: BanknotesIcon },
    { name: 'Loans', href: '/loans', icon: CurrencyDollarIcon },
    { name: 'Repayments', href: '/repayments', icon: DocumentTextIcon },
    { name: 'Fines', href: '/fines', icon: ExclamationTriangleIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Rules', href: '/rules', icon: Cog6ToothIcon },
];

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const user = getCurrentUser();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            {/* Mobile sidebar */}
            <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-emerald-600 via-teal-600 to-cyan-700">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
            </div>

            {/* Mobile header */}
            <div className="lg:hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600">
                    <button
                        type="button"
                        className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-white text-lg font-semibold">Community Finance</h1>
                    <div className="w-6" />
                </div>
            </div>
        </>
    );
}

function SidebarContent({ pathname, user, onLogout }) {
    return (
        <>
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 shadow-lg">
                <h1 className="text-white text-xl font-bold">Community Finance</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${isActive
                                    ? 'sidebar-item-active'
                                    : 'sidebar-item-inactive'
                                    }`}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex-shrink-0 flex border-t border-teal-500 border-opacity-30 p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-50 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-emerald-200 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4">
                    <button
                        onClick={onLogout}
                        className="sidebar-item-inactive w-full"
                    >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
