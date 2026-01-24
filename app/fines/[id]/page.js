'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import Loader from '../../../components/Loader';
import { fineAPI } from '../../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../../lib/utils';

export default function ViewFine() {
    const router = useRouter();
    const params = useParams();
    const fineId = params.id;

    const [loading, setLoading] = useState(true);
    const [fine, setFine] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showWaiveModal, setShowWaiveModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [waiveLoading, setWaiveLoading] = useState(false);
    const [paymentData, setPaymentData] = useState({
        paymentMethod: 'cash',
        transactionId: ''
    });
    const [waiveData, setWaiveData] = useState({
        waiveReason: ''
    });
    const [paymentErrors, setPaymentErrors] = useState({});
    const [waiveErrors, setWaiveErrors] = useState({});

    useEffect(() => {
        if (fineId) {
            fetchFine();
        }
    }, [fineId]);

    const fetchFine = async () => {
        try {
            setLoading(true);
            const response = await fineAPI.getById(fineId);
            const fineData = response.data || response;
            setFine(fineData);
        } catch (error) {
            console.error('Error fetching fine:', error);
            alert('Error loading fine data');
            router.push('/fines');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        setShowPaymentModal(true);
    };

    const handleWaive = async () => {
        setShowWaiveModal(true);
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
            await fineAPI.pay(fineId, paymentData);
            alert('Payment successful');
            setShowPaymentModal(false);
            setPaymentData({ paymentMethod: 'cash', transactionId: '' });
            setPaymentErrors({});
            fetchFine(); // Refresh fine data
        } catch (error) {
            console.error('Error paying fine:', error);
            alert(`Error paying fine: ${error.message || 'Unknown error'}`);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleWaiveSubmit = async (e) => {
        e.preventDefault();

        // Validate waive data
        if (!waiveData.waiveReason.trim()) {
            setWaiveErrors({ waiveReason: 'Waive reason is required' });
            return;
        }

        try {
            setWaiveLoading(true);
            await fineAPI.waive(fineId, waiveData);
            alert('Fine waived successfully');
            setShowWaiveModal(false);
            setWaiveData({ waiveReason: '' });
            setWaiveErrors({});
            fetchFine(); // Refresh fine data
        } catch (error) {
            console.error('Error waiving fine:', error);
            alert(`Error waiving fine: ${error.message || 'Unknown error'}`);
        } finally {
            setWaiveLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/fines');
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading fine details..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!fine) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fine not found</h2>
                            <CustomButton variant="primary" onClick={handleBack}>
                                Back to Fines
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
                        <h1 className="text-2xl font-bold">Fine Details</h1>
                        <div className="flex space-x-2">
                            <CustomButton
                                variant="outline"
                                onClick={handleBack}
                            >
                                Back to Fines
                            </CustomButton>
                            {fine.status === 'pending' && (
                                <>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handlePay}
                                    >
                                        Pay Fine
                                    </CustomButton>
                                    <CustomButton
                                        variant="warning"
                                        onClick={handleWaive}
                                    >
                                        Waive Fine
                                    </CustomButton>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Fine Information */}
                    <CardBox className="mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Fine Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Fine Number</label>
                                    <p className="mt-1 text-sm text-gray-900">{fine.fineNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status</label>
                                    <span className={`mt-1 inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(fine.status)}`}>
                                        {fine.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Member</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {fine.member?.firstName} {fine.member?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Fine Type</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{fine.type.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Amount</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(fine.amount)}</p>
                                </div>
                                {fine.loan && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Associated Loan</label>
                                        <p className="mt-1 text-sm text-gray-900">{fine.loan.loanNumber}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Issue Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(fine.date)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Due Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(fine.dueDate)}</p>
                                </div>
                                {fine.paymentDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Payment Date</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(fine.paymentDate)}</p>
                                    </div>
                                )}
                                {fine.paymentMethod && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">{fine.paymentMethod.replace('_', ' ')}</p>
                                    </div>
                                )}
                                {fine.waiver && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Waived By</label>
                                        <p className="mt-1 text-sm text-gray-900">{fine.waiver.username}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{fine.description}</p>
                            </div>

                            {fine.remarks && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-500">Remarks</label>
                                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{fine.remarks}</p>
                                </div>
                            )}

                            {fine.waiveReason && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-500">Waive Reason</label>
                                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{fine.waiveReason}</p>
                                </div>
                            )}
                        </div>
                    </CardBox>

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Pay Fine</h3>

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

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <CustomButton
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowPaymentModal(false);
                                                setPaymentData({ paymentMethod: 'cash', transactionId: '' });
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
                                            Pay {formatCurrency(fine.amount)}
                                        </CustomButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Waive Modal */}
                    {showWaiveModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Waive Fine</h3>

                                <form onSubmit={handleWaiveSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Waive Reason
                                        </label>
                                        <textarea
                                            value={waiveData.waiveReason}
                                            onChange={(e) => setWaiveData(prev => ({ ...prev, waiveReason: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter reason for waiving this fine"
                                            rows="4"
                                            required
                                        />
                                        {waiveErrors.waiveReason && (
                                            <p className="mt-1 text-sm text-red-600">{waiveErrors.waiveReason}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <CustomButton
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowWaiveModal(false);
                                                setWaiveData({ waiveReason: '' });
                                                setWaiveErrors({});
                                            }}
                                            disabled={waiveLoading}
                                        >
                                            Cancel
                                        </CustomButton>
                                        <CustomButton
                                            type="submit"
                                            variant="warning"
                                            loading={waiveLoading}
                                            disabled={waiveLoading}
                                        >
                                            Waive Fine
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
