'use client';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import { reportAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import {
    UserGroupIcon,
    BanknotesIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await reportAPI.getDashboard();
                setStatistics(data.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout title="Dashboard">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => (
        <div className="card">
            <div className="card-body">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 bg-${color}-100 rounded-lg p-3`}>
                        <Icon className={`h-6 w-6 text-${color}-600`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="text-lg font-semibold text-gray-900">{value}</dd>
                        </dl>
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center">
                        {trend === 'up' ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-success-500" />
                        ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-error-500" />
                        )}
                        <span className={`ml-2 text-sm ${trend === 'up' ? 'text-success-500' : 'text-error-500'}`}>
                            {trendValue}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
            <Layout title="Dashboard">
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Members"
                            value={statistics?.members?.total || 0}
                            icon={UserGroupIcon}
                            trend="up"
                            trendValue={`+${statistics?.members?.newThisMonth || 0} this month`}
                            color="primary"
                        />
                        <StatCard
                            title="Active Loans"
                            value={statistics?.loans?.active || 0}
                            icon={CurrencyDollarIcon}
                            trend="up"
                            trendValue={formatCurrency(statistics?.loans?.outstanding || 0)}
                            color="warning"
                        />
                        <StatCard
                            title="Total Savings"
                            value={formatCurrency(statistics?.savings?.totalBalance || 0)}
                            icon={BanknotesIcon}
                            trend="up"
                            trendValue={`${statistics?.savings?.active || 0} accounts`}
                            color="success"
                        />
                        <StatCard
                            title="Pending Fines"
                            value={statistics?.fines?.pending || 0}
                            icon={ExclamationTriangleIcon}
                            trend="down"
                            trendValue={formatCurrency(statistics?.fines?.pendingAmount || 0)}
                            color="error"
                        />
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Loans */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Loans</h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-3">
                                    {statistics?.recentActivity?.recentLoans?.slice(0, 5).map((loan) => (
                                        <div key={loan.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{loan.loanNumber}</p>
                                                <p className="text-xs text-gray-500">
                                                    {loan.member?.firstName} {loan.member?.lastName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(loan.principalAmount)}
                                                </p>
                                                <span className={`badge badge-${getStatusColor(loan.status)}`}>
                                                    {loan.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Repayments */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Repayments</h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-3">
                                    {statistics?.recentActivity?.recentRepayments?.slice(0, 5).map((repayment) => (
                                        <div key={repayment.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    EMI #{repayment.repaymentNumber}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {repayment.loan?.member?.firstName} {repayment.loan?.member?.lastName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(repayment.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(repayment.paymentDate)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Fines */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Fines</h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-3">
                                    {statistics?.recentActivity?.recentFines?.slice(0, 5).map((fine) => (
                                        <div key={fine.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{fine.fineNumber}</p>
                                                <p className="text-xs text-gray-500">
                                                    {fine.member?.firstName} {fine.member?.lastName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(fine.amount)}
                                                </p>
                                                <span className={`badge badge-${getStatusColor(fine.status)}`}>
                                                    {fine.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <a
                                    href="/members/new"
                                    className="btn-primary text-center py-3"
                                >
                                    Add Member
                                </a>
                                <a
                                    href="/loans/new"
                                    className="btn-success text-center py-3"
                                >
                                    Apply Loan
                                </a>
                                <a
                                    href="/savings/new"
                                    className="btn-warning text-center py-3"
                                >
                                    Open Account
                                </a>
                                <a
                                    href="/reports"
                                    className="btn-secondary text-center py-3"
                                >
                                    View Reports
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}

function getStatusColor(status) {
    const colors = {
        active: 'success',
        inactive: 'warning',
        suspended: 'error',
        pending: 'warning',
        approved: 'success',
        disbursed: 'info',
        completed: 'success',
        defaulted: 'error',
        paid: 'success',
        unpaid: 'warning',
        overdue: 'error',
        waived: 'info',
    };
    return colors[status] || 'info';
}
