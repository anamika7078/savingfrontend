'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import InputField from '../../../components/InputField';
import Loader from '../../../components/Loader';
import { loanAPI } from '../../../lib/api';
import { memberAPI } from '../../../lib/api';
import { validationSchemas, validateForm, validationRules } from '../../../lib/validators';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../lib/constants';

export default function AddLoan() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [membersLoading, setMembersLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        memberId: '',
        principalAmount: '',
        interestRate: '2', // Default 2% as per your rules
        monthlyPrincipalPayment: '', // Editable monthly principal payment
        penaltyAmount: '', // New penalty amount field
        purpose: '',
        collateral: '',
        guarantor: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setMembersLoading(true);
            const response = await memberAPI.getAll();
            const membersData = response.data?.data?.members || response.data?.members || response.data || response || [];
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (error) {
            console.error('Error fetching members:', error);
            setMembers([]);
        } finally {
            setMembersLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const calculatePaymentSchedule = () => {
        const loanAmount = parseFloat(formData.principalAmount) || 0;
        const monthlyInterestRate = parseFloat(formData.interestRate) || 2; // Default 2%
        const principalPerMonth = parseFloat(formData.monthlyPrincipalPayment) || 0;
        const penaltyAmount = parseFloat(formData.penaltyAmount) || 0;

        if (loanAmount <= 0 || principalPerMonth <= 0) {
            return [];
        }

        const schedule = [];
        let currentOpeningBalance = loanAmount;
        let monthNumber = 1;

        while (currentOpeningBalance > 0 && monthNumber <= 360) { // Max 30 years
            const monthlyInterest = currentOpeningBalance * monthlyInterestRate / 100;
            const principalPaid = Math.min(principalPerMonth, currentOpeningBalance);
            const totalPayable = principalPaid + monthlyInterest + penaltyAmount;
            const closingBalance = currentOpeningBalance - principalPaid;

            schedule.push({
                month: monthNumber,
                openingBalance: currentOpeningBalance,
                principalPaid: principalPaid,
                interest: monthlyInterest,
                penalty: penaltyAmount,
                totalPayable: totalPayable,
                closingBalance: closingBalance
            });

            currentOpeningBalance = closingBalance;
            monthNumber++;
        }

        return schedule;
    };

    const getTotalMonths = () => {
        return calculatePaymentSchedule().length;
    };

    const calculateMonthlyPrincipal = (loanAmount, months) => {
        return loanAmount / months;
    };

    const handleDurationChange = (months) => {
        const loanAmount = parseFloat(formData.principalAmount) || 0;
        if (loanAmount > 0 && months > 0) {
            const monthlyPrincipal = calculateMonthlyPrincipal(loanAmount, months);
            setFormData(prev => ({
                ...prev,
                monthlyPrincipalPayment: monthlyPrincipal.toFixed(2)
            }));
        }
    };

    const getTotalInterest = () => {
        const schedule = calculatePaymentSchedule();
        return schedule.reduce((total, payment) => total + payment.interest, 0);
    };

    const getTotalAmount = () => {
        const schedule = calculatePaymentSchedule();
        return schedule.reduce((total, payment) => total + payment.totalPayable, 0);
    };

    const getTotalPenalty = () => {
        const schedule = calculatePaymentSchedule();
        return schedule.reduce((total, payment) => total + (payment.penalty || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateForm(formData, {
            memberId: validationSchemas.loan.memberId,
            principalAmount: [
                validationRules.required,
                validationRules.positive,
                validationRules.min(100),
            ],
            interestRate: [
                validationRules.required,
                validationRules.positive,
                validationRules.min(0),
                validationRules.max(100),
            ],
            monthlyPrincipalPayment: [
                validationRules.required,
                validationRules.positive,
                validationRules.min(100),
            ],
            penaltyAmount: [
                validationRules.positive,
                validationRules.min(0),
            ],
            purpose: [
                validationRules.required,
                validationRules.maxLength(200),
            ]
        });

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        try {
            setLoading(true);
            console.log('Creating loan application:', formData);
            await loanAPI.create(formData);
            console.log('Loan application created successfully');

            // Show success message
            alert(SUCCESS_MESSAGES.CREATED);

            // Redirect to loans list
            router.push('/loans');
        } catch (error) {
            console.error('Error creating loan application:', error);
            console.error('Error details:', error.response);
            alert(error.message || error.error || ERROR_MESSAGES.GENERIC_ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/loans');
    };

    if (membersLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading members..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Creating loan application..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    const paymentSchedule = calculatePaymentSchedule();
    const totalMonths = getTotalMonths();
    const totalInterest = getTotalInterest();
    const totalPenalty = getTotalPenalty();
    const totalAmount = getTotalAmount();

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Apply for Loan</h1>
                        <CustomButton
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Back to Loans
                        </CustomButton>
                    </div>

                    <CardBox>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Member
                                    </label>
                                    <select
                                        name="memberId"
                                        value={formData.memberId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select a member...</option>
                                        {members.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.firstName} {member.lastName} ({member.memberId})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.memberId && (
                                        <p className="mt-1 text-sm text-red-600">{errors.memberId}</p>
                                    )}
                                </div>

                                <InputField
                                    label="Principal Amount"
                                    name="principalAmount"
                                    type="number"
                                    value={formData.principalAmount}
                                    onChange={handleChange}
                                    placeholder="Enter loan amount"
                                    error={errors.principalAmount}
                                    required
                                    step="0.01"
                                    min="1"
                                />

                                <InputField
                                    label="Monthly Interest Rate (%)"
                                    name="interestRate"
                                    type="number"
                                    value={formData.interestRate}
                                    onChange={handleChange}
                                    placeholder="Enter monthly interest rate (default 2%)"
                                    error={errors.interestRate}
                                    required
                                    step="0.01"
                                    min="0"
                                    max="100"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Duration (months)
                                    </label>
                                    <select
                                        onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select duration...</option>
                                        <option value="6">6 months</option>
                                        <option value="10">10 months</option>
                                        <option value="12">12 months</option>
                                        <option value="18">18 months</option>
                                        <option value="24">24 months</option>
                                        <option value="36">36 months</option>
                                    </select>
                                </div>

                                <InputField
                                    label="Monthly Principal Payment (₹)"
                                    name="monthlyPrincipalPayment"
                                    type="number"
                                    value={formData.monthlyPrincipalPayment}
                                    onChange={handleChange}
                                    placeholder="Enter monthly principal payment"
                                    error={errors.monthlyPrincipalPayment}
                                    required
                                    step="0.01"
                                    min="100"
                                />

                                <InputField
                                    label="Penalty Amount (₹)"
                                    name="penaltyAmount"
                                    type="number"
                                    value={formData.penaltyAmount}
                                    onChange={handleChange}
                                    placeholder="Enter penalty amount (optional)"
                                    error={errors.penaltyAmount}
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputField
                                    label="Purpose"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    placeholder="Enter loan purpose"
                                    error={errors.purpose}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputField
                                    label="Collateral Details"
                                    name="collateral"
                                    value={formData.collateral}
                                    onChange={handleChange}
                                    placeholder="Enter collateral details"
                                    error={errors.collateral}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputField
                                    label="Guarantor Name"
                                    name="guarantor"
                                    value={formData.guarantor}
                                    onChange={handleChange}
                                    placeholder="Enter guarantor name"
                                    error={errors.guarantor}
                                />
                            </div>

                            {/* Loan Rules Summary */}
                            {paymentSchedule.length > 0 && (
                                <div className="md:col-span-2 p-6 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Rules & Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Loan Amount</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                ₹{parseFloat(formData.principalAmount).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Monthly Interest Rate</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                {formData.interestRate}%
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Monthly Principal</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                ₹{parseFloat(formData.monthlyPrincipalPayment).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Penalty Amount</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                ₹{parseFloat(formData.penaltyAmount || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Total Months</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                {totalMonths} months
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Total Interest</label>
                                            <p className="mt-1 text-lg font-semibold text-blue-600">
                                                ₹{totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Total Penalty</label>
                                            <p className="mt-1 text-lg font-semibold text-orange-600">
                                                ₹{totalPenalty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Total Amount Payable</label>
                                            <p className="mt-1 text-lg font-semibold text-green-600">
                                                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Avg Monthly Payment</label>
                                            <p className="mt-1 text-lg font-semibold text-purple-600">
                                                ₹{(totalAmount / totalMonths).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Schedule Table */}
                            {paymentSchedule.length > 0 && (
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Payment Schedule</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Balance</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Paid</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payable</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {paymentSchedule.map((payment) => (
                                                    <tr key={payment.month} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{payment.month}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                            ₹{payment.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                            ₹{payment.principalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                            ₹{payment.interest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                            ₹{(payment.penalty || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-green-600">
                                                            ₹{payment.totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                            ₹{payment.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <CustomButton
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </CustomButton>
                                <CustomButton
                                    type="submit"
                                    variant="primary"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Submit Application
                                </CustomButton>
                            </div>
                        </form>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
