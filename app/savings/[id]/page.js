'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import Loader from '../../../components/Loader';
import { savingsAPI } from '../../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../../lib/utils';

export default function ViewSavings() {
    const router = useRouter();
    const params = useParams();
    const savingsId = params.id;

    const [loading, setLoading] = useState(true);
    const [savings, setSavings] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState('deposit');
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [transactionData, setTransactionData] = useState({
        amount: '',
        remarks: ''
    });
    const [transactionErrors, setTransactionErrors] = useState({});

    useEffect(() => {
        if (savingsId) {
            fetchSavings();
        }
    }, [savingsId]);

    const fetchSavings = async () => {
        try {
            setLoading(true);
            const response = await savingsAPI.getById(savingsId);
            const savingsData = response.data || response;
            setSavings(savingsData);
        } catch (error) {
            console.error('Error fetching savings account:', error);
            alert('Error loading savings account data');
            router.push('/savings');
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        setTransactionType('deposit');
        setShowTransactionModal(true);
    };

    const handleWithdraw = async () => {
        setTransactionType('withdraw');
        setShowTransactionModal(true);
    };

    const handleCalculateInterest = async () => {
        if (!confirm('Are you sure you want to calculate interest for this account?')) {
            return;
        }

        try {
            await savingsAPI.calculateInterest(savingsId);
            alert('Interest calculated successfully');
            fetchSavings(); // Refresh savings data
        } catch (error) {
            console.error('Error calculating interest:', error);
            alert('Error calculating interest');
        }
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();

        // Validate transaction data
        if (!transactionData.amount || parseFloat(transactionData.amount) <= 0) {
            setTransactionErrors({ amount: 'Amount must be a positive number' });
            return;
        }

        try {
            setTransactionLoading(true);

            if (transactionType === 'deposit') {
                await savingsAPI.deposit(savingsId, transactionData);
                alert('Deposit successful');
            } else {
                await savingsAPI.withdraw(savingsId, transactionData);
                alert('Withdrawal successful');
            }

            setShowTransactionModal(false);
            setTransactionData({ amount: '', remarks: '' });
            setTransactionErrors({});
            fetchSavings(); // Refresh savings data
        } catch (error) {
            console.error(`Error ${transactionType}:`, error);
            alert(`Error ${transactionType}: ${error.message || 'Unknown error'}`);
        } finally {
            setTransactionLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/savings');
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading savings account details..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!savings) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Savings account not found</h2>
                            <CustomButton variant="primary" onClick={handleBack}>
                                Back to Savings
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
                        <h1 className="text-2xl font-bold">Savings Account Details</h1>
                        <div className="flex space-x-2">
                            <CustomButton
                                variant="outline"
                                onClick={handleBack}
                            >
                                Back to Savings
                            </CustomButton>
                            {savings.status === 'active' && (
                                <>
                                    <CustomButton
                                        variant="primary"
                                        onClick={handleDeposit}
                                    >
                                        Deposit
                                    </CustomButton>
                                    <CustomButton
                                        variant="warning"
                                        onClick={handleWithdraw}
                                    >
                                        Withdraw
                                    </CustomButton>
                                    {savings.accountType === 'fixed' && (
                                        <CustomButton
                                            variant="info"
                                            onClick={handleCalculateInterest}
                                        >
                                            Calculate Interest
                                        </CustomButton>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Account Information */}
                    <CardBox className="mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Account Number</label>
                                    <p className="mt-1 text-sm text-gray-900">{savings.accountNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Status</label>
                                    <span className={`mt-1 inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(savings.status)}`}>
                                        {savings.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Member</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {savings.member?.firstName} {savings.member?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Account Type</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{savings.accountType}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Current Balance</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(savings.balance)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Interest Rate</label>
                                    <p className="mt-1 text-sm text-gray-900">{savings.interestRate}%</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Minimum Balance</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(savings.minimumBalance)}</p>
                                </div>
                                {savings.monthlyContribution && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Monthly Contribution</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(savings.monthlyContribution)}</p>
                                    </div>
                                )}
                                {savings.maturityDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Maturity Date</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(savings.maturityDate)}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Created Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(savings.createdAt)}</p>
                                </div>
                                {savings.lastInterestCalculated && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Last Interest Calculated</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(savings.lastInterestCalculated)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );

    // Transaction Modal
    return showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {transactionType === 'deposit' ? 'Make Deposit' : 'Make Withdrawal'}
                </h3>

                <form onSubmit={handleTransactionSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={transactionData.amount}
                            onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter amount"
                            required
                        />
                        {transactionErrors.amount && (
                            <p className="mt-1 text-sm text-red-600">{transactionErrors.amount}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Remarks
                        </label>
                        <textarea
                            value={transactionData.remarks}
                            onChange={(e) => setTransactionData(prev => ({ ...prev, remarks: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter remarks (optional)"
                            rows="3"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <CustomButton
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowTransactionModal(false);
                                setTransactionData({ amount: '', remarks: '' });
                                setTransactionErrors({});
                            }}
                            disabled={transactionLoading}
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton
                            type="submit"
                            variant={transactionType === 'deposit' ? 'primary' : 'warning'}
                            loading={transactionLoading}
                            disabled={transactionLoading}
                        >
                            {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
                        </CustomButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
