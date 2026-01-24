'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import CardBox from '../../components/CardBox';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import { loanAPI } from '../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';

export default function Loans() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchLoans();
    }, []);

    useEffect(() => {
        fetchLoans();
    }, [filterStatus]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus && filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await loanAPI.getAll(params);
            console.log('Loans API response:', response);

            // Handle different response structures
            let loansData = [];
            if (response && response.data && response.data.loans) {
                loansData = response.data.loans;
            } else if (response && response.loans) {
                loansData = response.loans;
            } else if (Array.isArray(response)) {
                loansData = response;
            } else if (response && Array.isArray(response.data)) {
                loansData = response.data;
            }

            console.log('Processed loans data:', loansData);
            setLoans(loansData);
        } catch (error) {
            console.error('Error fetching loans:', error);
            setLoans([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewLoan = (id) => {
        router.push(`/loans/${id}`);
    };

    const handleApproveLoan = (id) => {
        router.push(`/loans/${id}`);
    };

    const handleDisburseLoan = (id) => {
        router.push(`/loans/${id}`);
    };

    const handleAddLoan = () => {
        router.push('/loans/add');
    };

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading loans..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Loans Management</h1>
                        <CustomButton
                            variant="primary"
                            onClick={handleAddLoan}
                        >
                            Add Loan
                        </CustomButton>
                    </div>

                    <CardBox className="mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by member name or loan number..."
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
                                        <option value="approved">Approved</option>
                                        <option value="disbursed">Disbursed</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardBox>

                    <CardBox>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Principal Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tenure
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Outstanding Balance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Applied Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredLoans.map((loan) => (
                                        <tr key={loan.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {loan.loanNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {loan.member?.firstName} {loan.member?.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(loan.principalAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {loan.interestRate}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {loan.loanTerm} months
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(loan.remainingAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(loan.status)}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(loan.appliedDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => handleViewLoan(loan.id)}
                                                >
                                                    View
                                                </CustomButton>
                                                {loan.status === 'pending' && (
                                                    <CustomButton
                                                        variant="primary"
                                                        size="sm"
                                                        className="mr-2"
                                                        onClick={() => handleApproveLoan(loan.id)}
                                                    >
                                                        Approve
                                                    </CustomButton>
                                                )}
                                                {loan.status === 'approved' && (
                                                    <CustomButton
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleDisburseLoan(loan.id)}
                                                    >
                                                        Disburse
                                                    </CustomButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredLoans.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No loans found
                                </div>
                            )}
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
