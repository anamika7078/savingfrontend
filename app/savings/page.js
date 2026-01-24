'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import CardBox from '../../components/CardBox';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import { savingsAPI } from '../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';

export default function Savings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [savings, setSavings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchSavings();
    }, []);

    useEffect(() => {
        fetchSavings();
    }, [filterStatus]);

    const fetchSavings = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus && filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await savingsAPI.getAll(params);
            console.log('Savings API response:', response);

            // Handle different response structures
            let savingsData = [];
            if (response && response.data && response.data.savings) {
                savingsData = response.data.savings;
            } else if (response && response.savings) {
                savingsData = response.savings;
            } else if (Array.isArray(response)) {
                savingsData = response;
            } else if (response && Array.isArray(response.data)) {
                savingsData = response.data;
            }

            console.log('Processed savings data:', savingsData);
            setSavings(savingsData);
        } catch (error) {
            console.error('Error fetching savings:', error);
            setSavings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSavings = (id) => {
        router.push(`/savings/${id}`);
    };

    const handleDeposit = (id) => {
        router.push(`/savings/${id}/deposit`);
    };

    const handleWithdraw = (id) => {
        router.push(`/savings/${id}/withdraw`);
    };

    const handleAddSavings = () => {
        router.push('/savings/add');
    };

    const filteredSavings = savings.filter(saving => {
        const matchesSearch = saving.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || saving.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading savings accounts..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Savings Accounts</h1>
                        <CustomButton variant="primary" onClick={handleAddSavings}>
                            Add Savings Account
                        </CustomButton>
                    </div>

                    {/* Filters */}
                    <CardBox className="mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by member name or account number..."
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
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="frozen">Frozen</option>
                                    </select>
                                </div>
                                <div>
                                    <CustomButton variant="outline" onClick={fetchSavings} className="w-full">
                                        Refresh
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    </CardBox>

                    {/* Savings Table */}
                    <CardBox>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Account Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Balance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Opened Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSavings.map((saving) => (
                                        <tr key={saving.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {saving.accountNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {saving.member?.firstName} {saving.member?.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="capitalize">{saving.accountType}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(saving.balance)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {saving.interestRate}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(saving.status)}`}>
                                                    {saving.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(saving.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => handleViewSavings(saving.id)}
                                                >
                                                    View
                                                </CustomButton>
                                                <CustomButton
                                                    variant="primary"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => handleDeposit(saving.id)}
                                                >
                                                    Deposit
                                                </CustomButton>
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleWithdraw(saving.id)}
                                                >
                                                    Withdraw
                                                </CustomButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredSavings.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No savings accounts found
                                </div>
                            )}
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}