'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import Loader from '../../../components/Loader';
import { savingsAPI } from '../../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../../lib/utils';

export default function MonthlySavings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [monthlySavings, setMonthlySavings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');

    useEffect(() => {
        fetchMonthlySavings();
    }, []);

    useEffect(() => {
        fetchMonthlySavings();
    }, [filterStatus, filterMonth, filterYear]);

    const fetchMonthlySavings = async () => {
        try {
            setLoading(true);
            const response = await savingsAPI.getAllMonthlySavings();
            console.log('Monthly Savings API response:', response);

            // Handle different response structures
            let monthlySavingsData = [];
            if (response && response.data && response.data.monthlySavings) {
                monthlySavingsData = response.data.monthlySavings;
            } else if (response && response.monthlySavings) {
                monthlySavingsData = response.monthlySavings;
            } else if (Array.isArray(response)) {
                monthlySavingsData = response;
            } else if (response && Array.isArray(response.data)) {
                monthlySavingsData = response.data;
            }

            console.log('Processed monthly savings data:', monthlySavingsData);
            setMonthlySavings(monthlySavingsData);
        } catch (error) {
            console.error('Error fetching monthly savings:', error);
            setMonthlySavings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMonthlySavings = () => {
        router.push('/savings/add');
    };

    const filteredMonthlySavings = monthlySavings.filter(saving => {
        const matchesSearch = saving.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saving.member?.memberId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || saving.paymentStatus === filterStatus;
        const matchesMonth = !filterMonth || saving.savingMonth === filterMonth;
        const matchesYear = !filterYear || saving.savingYear === filterYear;
        return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });

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
                        <CustomButton variant="primary" onClick={handleAddMonthlySavings}>
                            Add Monthly Savings
                        </CustomButton>
                    </div>

                    {/* Filters */}
                    <CardBox className="mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by member name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filterMonth}
                                        onChange={(e) => setFilterMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Months</option>
                                        <option value="01">January</option>
                                        <option value="02">February</option>
                                        <option value="03">March</option>
                                        <option value="04">April</option>
                                        <option value="05">May</option>
                                        <option value="06">June</option>
                                        <option value="07">July</option>
                                        <option value="08">August</option>
                                        <option value="09">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Year (e.g., 2026)"
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
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
                                    <CustomButton variant="outline" onClick={fetchMonthlySavings} className="w-full">
                                        Refresh
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    </CardBox>

                    {/* Monthly Savings Table */}
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
                                            Fixed Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fine
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Carry Forward
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Payable
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Entry Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMonthlySavings.map((saving) => (
                                        <tr key={saving.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {saving.member?.firstName} {saving.member?.lastName}
                                                <div className="text-xs text-gray-500">{saving.member?.memberId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(2000, parseInt(saving.savingMonth) - 1).toLocaleString('default', { month: 'long' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {saving.savingYear}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(saving.monthlyFixedAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(saving.fine)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(saving.carryForwardAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(saving.totalPayableAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${saving.paymentStatus === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {saving.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {saving.paymentDate ? formatDate(saving.paymentDate) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(saving.entryDate)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredMonthlySavings.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No monthly savings records found
                                </div>
                            )}
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
