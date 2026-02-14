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
            
            // Check if user exists before making request
            const user = localStorage.getItem('user');
            if (!user) {
                console.error('No user found. Redirecting to login...');
                alert('Please login to access savings data');
                router.push('/auth/login');
                return;
            }
            
            console.log('=== SAVINGS API CALL DEBUG ===');
            console.log('User exists:', !!user);
            
            const params = {};
            if (filterStatus && filterStatus !== 'all') {
                params.paymentStatus = filterStatus;
            }
            // Remove pagination limit to get all records
            params.limit = 10000;

            console.log('Calling getAllMonthlySavings with params:', params);
            console.log('API endpoint will be: /api/savings/monthly/all');
            
            const response = await savingsAPI.getAllMonthlySavings(params);
            console.log('=== API RESPONSE RECEIVED ===');
            console.log('Full response:', JSON.stringify(response, null, 2));
            console.log('Response type:', typeof response);
            console.log('Response keys:', response ? Object.keys(response) : 'null');
            console.log('Is array?', Array.isArray(response));

            // Handle different response structures
            // The API interceptor returns response.data, so:
            // Backend sends: { success: true, data: { monthlySavings: [...], pagination: {...} } }
            // Interceptor extracts: { monthlySavings: [...], pagination: {...} }
            let savingsData = [];
            
            if (response && response.monthlySavings && Array.isArray(response.monthlySavings)) {
                // Most likely structure after interceptor
                savingsData = response.monthlySavings;
                console.log('✅ Extracted from response.monthlySavings:', savingsData.length);
            } else if (response && response.data && response.data.monthlySavings && Array.isArray(response.data.monthlySavings)) {
                // If interceptor didn't extract data
                savingsData = response.data.monthlySavings;
                console.log('✅ Extracted from response.data.monthlySavings:', savingsData.length);
            } else if (response && response.data && Array.isArray(response.data)) {
                // If data is directly an array
                savingsData = response.data;
                console.log('✅ Extracted from response.data (array):', savingsData.length);
            } else if (Array.isArray(response)) {
                // If response is directly an array
                savingsData = response;
                console.log('✅ Response is directly an array:', savingsData.length);
            } else {
                console.error('❌ Unexpected response structure:', response);
                console.error('Response structure details:', {
                    hasResponse: !!response,
                    hasData: !!(response && response.data),
                    hasMonthlySavings: !!(response && response.monthlySavings),
                    hasDataMonthlySavings: !!(response && response.data && response.data.monthlySavings),
                    isArray: Array.isArray(response),
                    isDataArray: !!(response && response.data && Array.isArray(response.data))
                });
            }

            console.log('📊 Processed monthly savings data:', savingsData);
            console.log('📊 Number of records:', savingsData.length);
            console.log('📊 First record sample:', savingsData[0]);
            setSavings(savingsData || []);
        } catch (error) {
            console.error('Error fetching monthly savings:', error);
            console.error('Error details:', {
                message: error?.message || error,
                response: error?.response,
                data: error?.data,
                stack: error?.stack
            });
            // Show user-friendly error message
            if (error?.message) {
                alert(`Error loading savings: ${error.message}`);
            } else if (typeof error === 'string') {
                alert(`Error loading savings: ${error}`);
            } else {
                alert('Error loading savings. Please check the console for details.');
            }
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
        if (!saving) return false;
        const matchesSearch = !searchTerm || 
            saving.memberId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.memberId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.memberId?.memberId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.savingMonth?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.savingYear?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || saving.paymentStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });
    
    console.log('🔍 Filtered savings count:', filteredSavings.length, 'out of', savings.length);
    console.log('🔍 Savings array:', savings);
    console.log('🔍 First saving item:', savings[0]);

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading monthly savings..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Monthly Savings</h1>
                        <CustomButton variant="primary" onClick={handleAddSavings}>
                            Add Monthly Savings
                        </CustomButton>
                    </div>

                    {/* Filters */}
                    <CardBox className="mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by member name, ID, month, or year..."
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
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
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
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Month
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Year
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Monthly Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Payable
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSavings.length > 0 ? (
                                        filteredSavings.map((saving) => (
                                            <tr key={saving.id || saving._id || Math.random()}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {saving.memberId?.firstName} {saving.memberId?.lastName}
                                                <div className="text-xs text-gray-500">{saving.memberId?.memberId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {saving.savingMonth}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {saving.savingYear}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(saving.monthlyFixedAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(saving.totalPayableAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(saving.paymentStatus)}`}>
                                                    {saving.paymentStatus?.charAt(0).toUpperCase() + saving.paymentStatus?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {saving.paymentDate ? formatDate(saving.paymentDate) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewSavings(saving.id)}
                                                >
                                                    View
                                                </CustomButton>
                                            </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                                No monthly savings found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}