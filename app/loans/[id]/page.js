'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import Loader from '../../../components/Loader';
import { loanAPI } from '../../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../../lib/utils';

export default function ViewLoan() {
    const router = useRouter();
    const params = useParams();
    const loanId = params.id;

    const [loading, setLoading] = useState(true);
    const [loan, setLoan] = useState(null);

    useEffect(() => {
        if (loanId) {
            fetchLoan();
        }
    }, [loanId]);

    const fetchLoan = async () => {
        try {
            setLoading(true);
            const response = await loanAPI.getById(loanId);
            const loanData = response.data || response;
            setLoan(loanData);
        } catch (error) {
            console.error('Error fetching loan:', error);
            alert('Error loading loan data');
            router.push('/loans');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this loan?')) {
            return;
        }

        try {
            await loanAPI.approve(loanId);
            alert('Loan approved successfully');
            fetchLoan(); // Refresh loan data
        } catch (error) {
            console.error('Error approving loan:', error);
            alert('Error approving loan');
        }
    };

    const handleDisburse = async () => {
        if (!confirm('Are you sure you want to disburse this loan?')) {
            return;
        }

        try {
            await loanAPI.disburse(loanId);
            alert('Loan disbursed successfully');
            fetchLoan(); // Refresh loan data
        } catch (error) {
            console.error('Error disbursing loan:', error);
            alert('Error disbursing loan');
        }
    };

    const handleBack = () => {
        router.push('/loans');
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading loan details..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!loan) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loan not found</h2>
                            <CustomButton variant="primary" onClick={handleBack}>
                                Back to Loans
                            </CustomButton>
                        </div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Loan Details</h1>
                        <div className="flex space-x-2">
                            <CustomButton
                                variant="outline"
                                onClick={handleBack}
                            >
                                Back to Loans
                            </CustomButton>
                            {loan.status === 'pending' && (
                                <CustomButton
                                    variant="primary"
                                    onClick={handleApprove}
                                >
                                    Approve Loan
                                </CustomButton>
                            )}
                            {loan.status === 'approved' && (
                                <CustomButton
                                    variant="success"
                                    onClick={handleDisburse}
                                >
                                    Disburse Loan
                                </CustomButton>
                            )}
                        </div>
                    </div>

                    {/* Loan Information */}
                    <CardBox className="mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Loan Number</label>
                                    <p className="mt-1 text-sm text-gray-900">{loan.loanNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status</label>
                                    <span className={`mt-1 inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(loan.status)}`}>
                                        {loan.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Member</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {loan.member?.firstName} {loan.member?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Application Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(loan.applicationDate)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Principal Amount</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(loan.principalAmount)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Interest Rate</label>
                                    <p className="mt-1 text-sm text-gray-900">{loan.interestRate}%</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Loan Term</label>
                                    <p className="mt-1 text-sm text-gray-900">{loan.loanTerm} months</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">EMI Amount</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(loan.emiAmount)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Total Amount</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(loan.totalAmount)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Amount Paid</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(loan.amountPaid)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Remaining Amount</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(loan.remainingAmount)}</p>
                                </div>
                                {loan.approvalDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Approval Date</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(loan.approvalDate)}</p>
                                    </div>
                                )}
                                {loan.disbursementDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Disbursement Date</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(loan.disbursementDate)}</p>
                                    </div>
                                )}
                                {loan.dueDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Next EMI Date</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(loan.dueDate)}</p>
                                    </div>
                                )}
                                {loan.maturityDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Maturity Date</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(loan.maturityDate)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardBox>

                    {/* Additional Details */}
                    {(loan.purpose || loan.collateral || loan.guarantor) && (
                        <CardBox className="mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {loan.purpose && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500">Purpose</label>
                                            <p className="mt-1 text-sm text-gray-900">{loan.purpose}</p>
                                        </div>
                                    )}
                                    {loan.collateral && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500">Collateral</label>
                                            <p className="mt-1 text-sm text-gray-900">{loan.collateral}</p>
                                        </div>
                                    )}
                                    {loan.guarantor && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Guarantor</label>
                                            <p className="mt-1 text-sm text-gray-900">{loan.guarantor}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardBox>
                    )}

                    {/* Repayment Schedule */}
                    {loan.repayments && loan.repayments.length > 0 && (
                        <CardBox>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Repayment Schedule</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Installment #
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
                                                    Payment Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {loan.repayments.map((repayment) => (
                                                <tr key={repayment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {repayment.repaymentNumber}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(repayment.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(repayment.principalAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {repayment.paymentDate ? formatDate(repayment.paymentDate) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardBox>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
