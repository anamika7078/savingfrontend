'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import CardBox from '../../components/CardBox';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import { repaymentAPI } from '../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';

export default function Repayments() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [repayments, setRepayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDateRange, setFilterDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        fetchRepayments();
        fetchStatistics();
    }, []);

    useEffect(() => {
        fetchRepayments();
    }, [filterStatus, filterDateRange]);

    const fetchRepayments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus && filterStatus !== 'all') {
                params.status = filterStatus;
            }
            if (filterDateRange.startDate) {
                params.startDate = filterDateRange.startDate;
            }
            if (filterDateRange.endDate) {
                params.endDate = filterDateRange.endDate;
            }

            const response = await repaymentAPI.getAll(params);
            console.log('Repayments API response:', response);

            // Handle different response structures
            let repaymentsData = [];
            if (response && response.data && response.data.repayments) {
                repaymentsData = response.data.repayments;
            } else if (response && response.repayments) {
                repaymentsData = response.repayments;
            } else if (Array.isArray(response)) {
                repaymentsData = response;
            } else if (response && Array.isArray(response.data)) {
                repaymentsData = response.data;
            }

            console.log('Processed repayments data:', repaymentsData);
            setRepayments(repaymentsData);
        } catch (error) {
            console.error('Error fetching repayments:', error);
            setRepayments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await repaymentAPI.getStatistics();
            setStatistics(response.data || response);
        } catch (error) {
            console.error('Error fetching repayment statistics:', error);
        }
    };

    const handleViewRepayment = (id) => {
        router.push(`/repayments/${id}`);
    };

    const handleMakePayment = (id) => {
        router.push(`/repayments/${id}/pay`);
    };

    const handleViewOverdue = async () => {
        try {
            const response = await repaymentAPI.getOverdue();
            const overdueData = response.data || response;
            setRepayments(Array.isArray(overdueData) ? overdueData : []);
        } catch (error) {
            console.error('Error fetching overdue repayments:', error);
            alert('Error fetching overdue repayments');
        }
    };

    const filteredRepayments = repayments.filter(repayment => {
        const matchesSearch = repayment.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repayment.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repayment.loan?.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            repayment.repaymentNumber?.toString().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading repayments..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Repayments Management</h1>
                        <div className="flex space-x-2">
                            <CustomButton
                                variant="info"
                                onClick={handleViewOverdue}
                            >
                                View Overdue
                            </CustomButton>
                            <CustomButton
                                variant="outline"
                                onClick={fetchStatistics}
                            >
                                Refresh Stats
                            </CustomButton>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    {statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <CardBox>
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-500">Total Repayments</h3>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                                </div>
                            </CardBox>
                            <CardBox>
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-500">Paid</h3>
                                    <p className="text-2xl font-bold text-green-600">{statistics.paid}</p>
                                </div>
                            </CardBox>
                            <CardBox>
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                                    <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                                </div>
                            </CardBox>
                            <CardBox>
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
                                    <p className="text-2xl font-bold text-red-600">{statistics.overdue}</p>
                                </div>
                            </CardBox>
                        </div>
                    )}

                    {/* Filters */}
                    <CardBox className="mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by member, loan number, or repayment number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="partial">Partial</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        placeholder="Start Date"
                                        value={filterDateRange.startDate}
                                        onChange={(e) => setFilterDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        placeholder="End Date"
                                        value={filterDateRange.endDate}
                                        onChange={(e) => setFilterDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardBox>

                    {/* Repayments Table */}
                    <CardBox>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Repayment #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Principal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRepayments.map((repayment) => (
                                        <tr key={repayment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{repayment.repaymentNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {repayment.member?.firstName} {repayment.member?.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {repayment.loan?.loanNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(repayment.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(repayment.principalAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(repayment.interestAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(repayment.dueDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(repayment.status)}`}>
                                                    {repayment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => handleViewRepayment(repayment.id)}
                                                >
                                                    View
                                                </CustomButton>
                                                {repayment.status === 'pending' && (
                                                    <CustomButton
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleMakePayment(repayment.id)}
                                                    >
                                                        Pay
                                                    </CustomButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredRepayments.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No repayments found
                                </div>
                            )}
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
