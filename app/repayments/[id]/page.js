'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import Loader from '../../../components/Loader';
import { repaymentAPI } from '../../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../../lib/utils';

export default function ViewRepayment() {
    const router = useRouter();
    const params = useParams();
    const repaymentId = params.id;

    const [loading, setLoading] = useState(true);
    const [repayment, setRepayment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentData, setPaymentData] = useState({
        paymentMethod: 'cash',
        transactionId: '',
        remarks: ''
    });
    const [paymentErrors, setPaymentErrors] = useState({});

    useEffect(() => {
        if (repaymentId) {
            fetchRepayment();
        }
    }, [repaymentId]);

    const fetchRepayment = async () => {
        try {
            setLoading(true);
            const response = await repaymentAPI.getById(repaymentId);
            const repaymentData = response.data || response;
            setRepayment(repaymentData);
        } catch (error) {
            console.error('Error fetching repayment:', error);
            alert('Error loading repayment data');
            router.push('/repayments');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        // Validate payment data
        if (!paymentData.paymentMethod) {
            setPaymentErrors({ paymentMethod: 'Payment method is required' });
            return;
        }

        try {
            setPaymentLoading(true);
            await repaymentAPI.makePayment(repaymentId, paymentData);
            alert('Payment successful');
            setShowPaymentModal(false);
            setPaymentData({ paymentMethod: 'cash', transactionId: '', remarks: '' });
            setPaymentErrors({});
            fetchRepayment(); // Refresh repayment data
        } catch (error) {
            console.error('Error making payment:', error);
            alert(`Error making payment: ${error.message || 'Unknown error'}`);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/repayments');
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading repayment details..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!repayment) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Repayment not found</h2>
                            <CustomButton variant="primary" onClick={handleBack}>
                                Back to Repayments
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
                        <h1 className="text-2xl font-bold">Repayment Details</h1>
                        <div className="flex space-x-2">
                            <CustomButton
                                variant="outline"
                                onClick={handleBack}
                            >
                                Back to Repayments
                            </CustomButton>
                            {repayment.status === 'pending' && (
                                <CustomButton
                                    variant="primary"
                                    onClick={handlePay}
                                >
                                    Make Payment
                                </CustomButton>
                            )}
                        </div>
                    </div>

                    {/* Repayment Information */}
                    <CardBox className="mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Repayment Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Repayment Number</label>
                                    <p className="mt-1 text-sm text-gray-900">#{repayment.repaymentNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status</label>
                                    <span className={`mt-1 inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(repayment.status)}`}>
                                        {repayment.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Member</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {repayment.member?.firstName} {repayment.member?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Loan Number</label>
                                    <p className="mt-1 text-sm text-gray-900">{repayment.loan?.loanNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Total Amount</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(repayment.amount)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Principal Amount</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(repayment.principalAmount)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Interest Amount</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(repayment.interestAmount)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Due Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(repayment.dueDate)}</p>
                                </div>
                                {repayment.paymentDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Payment Date</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(repayment.paymentDate)}</p>
                                    </div>
                                )}
                                {repayment.paymentMethod && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{repayment.paymentMethod.replace('_', ' ')}</p>
                                    </div>
                                )}
                                {repayment.transactionId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
                                        <p className="mt-1 text-sm text-gray-900">{repayment.transactionId}</p>
                                    </div>
                                )}
                                {repayment.lateFee && parseFloat(repayment.lateFee) > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Late Fee</label>
                                        <p className="mt-1 text-sm text-red-600">{formatCurrency(repayment.lateFee)}</p>
                                    </div>
                                )}
                            </div>

                            {repayment.remarks && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-500">Remarks</label>
                                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{repayment.remarks}</p>
                                </div>
                            )}
                        </div>
                    </CardBox>

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Make Payment</h3>

                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            value={paymentData.paymentMethod}
                                            onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="check">Check</option>
                                            <option value="online">Online</option>
                                        </select>
                                        {paymentErrors.paymentMethod && (
                                            <p className="mt-1 text-sm text-red-600">{paymentErrors.paymentMethod}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Transaction ID (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentData.transactionId}
                                            onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter transaction ID"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Remarks (Optional)
                                        </label>
                                        <textarea
                                            value={paymentData.remarks}
                                            onChange={(e) => setPaymentData(prev => ({ ...prev, remarks: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter any remarks"
                                            rows="3"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <CustomButton
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowPaymentModal(false);
                                                setPaymentData({ paymentMethod: 'cash', transactionId: '', remarks: '' });
                                                setPaymentErrors({});
                                            }}
                                            disabled={paymentLoading}
                                        >
                                            Cancel
                                        </CustomButton>
                                        <CustomButton
                                            type="submit"
                                            variant="primary"
                                            loading={paymentLoading}
                                            disabled={paymentLoading}
                                        >
                                            Pay {formatCurrency(repayment.amount)}
                                        </CustomButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
