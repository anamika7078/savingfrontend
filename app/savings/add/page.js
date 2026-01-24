'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import InputField from '../../../components/InputField';
import Loader from '../../../components/Loader';
import { savingsAPI } from '../../../lib/api';
import { memberAPI } from '../../../lib/api';
import { validationSchemas, validateForm, validationRules } from '../../../lib/validators';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../lib/constants';

export default function AddMonthlySavings() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [membersLoading, setMembersLoading] = useState(true);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [members, setMembers] = useState([]);
    const [previousMonthData, setPreviousMonthData] = useState(null);
    const [formData, setFormData] = useState({
        memberId: '',
        savingMonth: '',
        savingYear: new Date().getFullYear().toString(),
        monthlyFixedAmount: '2000', // Default fixed amount
        fine: '0',
        totalPayableAmount: '2000',
        paymentStatus: 'unpaid',
        paymentDate: '',
        remarks: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchMembers();
    }, []);

    // Generate months dropdown
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    // Generate years dropdown (current year and 2 years back)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i).map(year => ({
        value: year.toString(),
        label: year.toString()
    }));

    const fetchMembers = async () => {
        try {
            setMembersLoading(true);
            const response = await memberAPI.getAll();
            const membersData = response.data?.members || response.data || response || [];
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (error) {
            console.error('Error fetching members:', error);
            setMembers([]);
        } finally {
            setMembersLoading(false);
        }
    };

    // Check for previous month unpaid and calculate carry forward
    const checkPreviousMonthStatus = async (memberId, month, year) => {
        if (!memberId || !month || !year) return;

        try {
            setCheckingDuplicate(true);

            // Calculate previous month
            const currentDate = new Date(parseInt(year), parseInt(month) - 1);
            const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
            const prevMonth = (previousDate.getMonth() + 1).toString().padStart(2, '0');
            const prevYear = previousDate.getFullYear().toString();

            // Check for duplicate entry
            const duplicateCheck = await savingsAPI.checkDuplicate({
                memberId,
                savingMonth: month,
                savingYear: year
            });

            if (duplicateCheck.exists) {
                setErrors(prev => ({ ...prev, duplicate: 'Savings entry for this member, month, and year already exists' }));
                return;
            }

            // Get previous month data
            const prevMonthResponse = await savingsAPI.getMemberMonthSavings(memberId, prevMonth, prevYear);

            if (prevMonthResponse.data && prevMonthResponse.data.paymentStatus === 'unpaid') {
                const prevData = prevMonthResponse.data;
                const carryForwardAmount = parseFloat(prevData.monthlyFixedAmount) + parseFloat(prevData.fine || 0);
                const currentFixedAmount = parseFloat(formData.monthlyFixedAmount);
                const totalPayable = carryForwardAmount + currentFixedAmount;

                setPreviousMonthData(prevData);
                setFormData(prev => ({
                    ...prev,
                    fine: prevData.fine || '0',
                    totalPayableAmount: totalPayable.toString()
                }));

                // Show carry forward warning
                setErrors(prev => ({
                    ...prev,
                    carryForward: `Previous month (${prevMonth}-${prevYear}) is unpaid. Carry forward amount: ₹${carryForwardAmount.toLocaleString('en-IN')}`
                }));
            } else {
                // No carry forward, reset calculations
                setPreviousMonthData(null);
                const currentFixedAmount = parseFloat(formData.monthlyFixedAmount);
                setFormData(prev => ({
                    ...prev,
                    fine: '0',
                    totalPayableAmount: currentFixedAmount.toString()
                }));
                setErrors(prev => ({ ...prev, carryForward: '' }));
            }
        } catch (error) {
            console.error('Error checking previous month:', error);
            // Reset if error
            setPreviousMonthData(null);
            const currentFixedAmount = parseFloat(formData.monthlyFixedAmount);
            setFormData(prev => ({
                ...prev,
                fine: '0',
                totalPayableAmount: currentFixedAmount.toString()
            }));
        } finally {
            setCheckingDuplicate(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };
        setFormData(newFormData);

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Recalculate total payable if fixed amount or fine changes
        if (name === 'monthlyFixedAmount' || name === 'fine') {
            const fixedAmount = parseFloat(newFormData.monthlyFixedAmount) || 0;
            const fine = parseFloat(newFormData.fine) || 0;
            let totalPayable = fixedAmount + fine;

            // Add carry forward if exists
            if (previousMonthData) {
                const carryForward = parseFloat(previousMonthData.monthlyFixedAmount) + parseFloat(previousMonthData.fine || 0);
                totalPayable += carryForward;
            }

            setFormData(prev => ({
                ...prev,
                totalPayableAmount: totalPayable.toString()
            }));
        }

        // Check previous month status when member, month, or year changes
        if (name === 'memberId' || name === 'savingMonth' || name === 'savingYear') {
            if (name === 'memberId') {
                setFormData(prev => ({ ...prev, savingMonth: '', savingYear: new Date().getFullYear().toString() }));
            }
            if (newFormData.memberId && newFormData.savingMonth && newFormData.savingYear) {
                checkPreviousMonthStatus(newFormData.memberId, newFormData.savingMonth, newFormData.savingYear);
            }
        }
    };

    const calculateExpectedInterest = () => {
        // Not applicable for monthly savings
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateForm(formData, {
            memberId: [validationRules.required],
            savingMonth: [validationRules.required],
            savingYear: [validationRules.required],
            monthlyFixedAmount: [
                validationRules.required,
                validationRules.positive,
                validationRules.min(1),
            ],
            totalPayableAmount: [
                validationRules.required,
                validationRules.positive,
                validationRules.min(1),
            ]
        });

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        if (errors.duplicate) {
            alert('Duplicate entry exists. Please check the form.');
            return;
        }

        try {
            setLoading(true);

            // Prepare submission data
            const submissionData = {
                ...formData,
                monthlyFixedAmount: parseFloat(formData.monthlyFixedAmount),
                fine: parseFloat(formData.fine),
                totalPayableAmount: parseFloat(formData.totalPayableAmount),
                carryForwardAmount: previousMonthData ?
                    (parseFloat(previousMonthData.monthlyFixedAmount) + parseFloat(previousMonthData.fine || 0)) : 0
            };

            console.log('Creating monthly savings entry:', submissionData);
            await savingsAPI.createMonthlyEntry(submissionData);
            console.log('Monthly savings entry created successfully');

            // Show success message
            alert(SUCCESS_MESSAGES.CREATED);

            // Redirect to savings list
            router.push('/savings');
        } catch (error) {
            console.error('Error creating monthly savings entry:', error);
            console.error('Error details:', error.response);
            alert(error.message || error.error || ERROR_MESSAGES.GENERIC_ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/savings');
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
                    <Loader text="Creating monthly savings entry..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    const expectedInterest = calculateExpectedInterest();
    const totalAmount = parseFloat(formData.totalPayableAmount) || 0;

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Add Monthly Saving</h1>
                        <CustomButton
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Back to Savings
                        </CustomButton>
                    </div>

                    <CardBox>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Member Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Member Name / Member ID *
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

                                {/* Saving Month */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Saving Month *
                                    </label>
                                    <select
                                        name="savingMonth"
                                        value={formData.savingMonth}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                        disabled={!formData.memberId}
                                    >
                                        <option value="">Select month...</option>
                                        {months.map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.savingMonth && (
                                        <p className="mt-1 text-sm text-red-600">{errors.savingMonth}</p>
                                    )}
                                </div>

                                {/* Saving Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Saving Year *
                                    </label>
                                    <select
                                        name="savingYear"
                                        value={formData.savingYear}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                        disabled={!formData.memberId}
                                    >
                                        {years.map((year) => (
                                            <option key={year.value} value={year.value}>
                                                {year.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.savingYear && (
                                        <p className="mt-1 text-sm text-red-600">{errors.savingYear}</p>
                                    )}
                                </div>

                                {/* Monthly Fixed Amount */}
                                <InputField
                                    label="Monthly Fixed Amount"
                                    name="monthlyFixedAmount"
                                    type="number"
                                    value={formData.monthlyFixedAmount}
                                    onChange={handleChange}
                                    placeholder="Enter monthly fixed amount"
                                    error={errors.monthlyFixedAmount}
                                    required
                                    step="0.01"
                                    min="1"
                                    readonly={checkingDuplicate}
                                />

                                {/* Fine */}
                                <InputField
                                    label="Fine"
                                    name="fine"
                                    type="number"
                                    value={formData.fine}
                                    onChange={handleChange}
                                    placeholder="Fine amount (auto-calculated)"
                                    error={errors.fine}
                                    step="0.01"
                                    min="0"
                                    readonly={checkingDuplicate || previousMonthData !== null}
                                    helperText={previousMonthData ? "Auto-calculated from previous month" : "Auto-calculated if previous month unpaid"}
                                />

                                {/* Total Payable Amount */}
                                <InputField
                                    label="Total Payable Amount"
                                    name="totalPayableAmount"
                                    type="number"
                                    value={formData.totalPayableAmount}
                                    onChange={handleChange}
                                    placeholder="Total payable amount"
                                    error={errors.totalPayableAmount}
                                    required
                                    step="0.01"
                                    min="1"
                                    readonly
                                    helperText="Auto-calculated"
                                />

                                {/* Payment Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Status *
                                    </label>
                                    <select
                                        name="paymentStatus"
                                        value={formData.paymentStatus}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                    {errors.paymentStatus && (
                                        <p className="mt-1 text-sm text-red-600">{errors.paymentStatus}</p>
                                    )}
                                </div>

                                {/* Payment Date - Show only if paid */}
                                {formData.paymentStatus === 'paid' && (
                                    <InputField
                                        label="Payment Date"
                                        name="paymentDate"
                                        type="date"
                                        value={formData.paymentDate}
                                        onChange={handleChange}
                                        placeholder="Select payment date"
                                        error={errors.paymentDate}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                )}

                                {/* Remarks */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remarks (Optional)
                                    </label>
                                    <textarea
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Add any remarks or notes..."
                                    />
                                    {errors.remarks && (
                                        <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                    )}
                                </div>
                            </div>

                            {/* Carry Forward Warning */}
                            {errors.carryForward && (
                                <div className="md:col-span-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">Carry Forward Alert</h3>
                                            <p className="mt-1 text-sm text-yellow-700">{errors.carryForward}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Duplicate Entry Warning */}
                            {errors.duplicate && (
                                <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Duplicate Entry</h3>
                                            <p className="mt-1 text-sm text-red-700">{errors.duplicate}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Calculation Summary */}
                            {(totalAmount > 0 || previousMonthData) && (
                                <div className="md:col-span-2 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Saving Calculation</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Monthly Fixed Amount</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                ₹{parseFloat(formData.monthlyFixedAmount || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Fine Amount</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                                ₹{parseFloat(formData.fine || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        {previousMonthData && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Carry Forward Amount</label>
                                                <p className="mt-1 text-lg font-semibold text-orange-600">
                                                    ₹{(parseFloat(previousMonthData.monthlyFixedAmount) + parseFloat(previousMonthData.fine || 0)).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Total Payable Amount</label>
                                            <p className="mt-1 text-lg font-bold text-indigo-600">
                                                ₹{totalAmount.toLocaleString('en-IN')}
                                            </p>
                                        </div>
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
                                    Add Monthly Saving
                                </CustomButton>
                            </div>
                        </form>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
