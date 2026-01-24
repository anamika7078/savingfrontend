'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import InputField from '../../../components/InputField';
import Loader from '../../../components/Loader';
import { fineAPI } from '../../../lib/api';
import { memberAPI } from '../../../lib/api';
import { loanAPI } from '../../../lib/api';
import { validationSchemas, validateForm, validationRules } from '../../../lib/validators';
import { formatCurrency } from '../../../lib/utils';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../lib/constants';

export default function AddFine() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [membersLoading, setMembersLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [filteredLoans, setFilteredLoans] = useState([]);
    const [formData, setFormData] = useState({
        memberId: '',
        loanId: '',
        type: 'other',
        amount: '',
        description: '',
        dueDate: '',
        remarks: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchMembers();
        fetchLoans();
    }, []);

    useEffect(() => {
        if (formData.memberId) {
            const memberLoans = loans.filter(loan => loan.memberId === parseInt(formData.memberId));
            setFilteredLoans(memberLoans);
        } else {
            setFilteredLoans([]);
        }
    }, [formData.memberId, loans]);

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

    const fetchLoans = async () => {
        try {
            const response = await loanAPI.getAll();
            const loansData = response.data?.loans || response.data || response || [];
            setLoans(Array.isArray(loansData) ? loansData : []);
        } catch (error) {
            console.error('Error fetching loans:', error);
            setLoans([]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateForm(formData, {
            memberId: [validationRules.required],
            type: [validationRules.required],
            amount: [
                validationRules.required,
                validationRules.positive,
                validationRules.min(1),
            ],
            description: [
                validationRules.required,
                validationRules.maxLength(1000),
            ],
            dueDate: [validationRules.required]
        });

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        try {
            setLoading(true);
            console.log('Creating fine:', formData);
            await fineAPI.create(formData);
            console.log('Fine created successfully');

            // Show success message
            alert(SUCCESS_MESSAGES.CREATED);

            // Redirect to fines list
            router.push('/fines');
        } catch (error) {
            console.error('Error creating fine:', error);
            console.error('Error details:', error.response);
            alert(error.message || error.error || ERROR_MESSAGES.GENERIC_ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/fines');
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
                    <Loader text="Creating fine..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Create Fine</h1>
                        <CustomButton
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Back to Fines
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

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Associated Loan (Optional)
                                    </label>
                                    <select
                                        name="loanId"
                                        value={formData.loanId}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select a loan (optional)...</option>
                                        {filteredLoans.map((loan) => (
                                            <option key={loan.id} value={loan.id}>
                                                {loan.loanNumber} - {formatCurrency(loan.principalAmount)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.loanId && (
                                        <p className="mt-1 text-sm text-red-600">{errors.loanId}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fine Type
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="late_payment"
                                                checked={formData.type === 'late_payment'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Late Payment</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="missed_meeting"
                                                checked={formData.type === 'missed_meeting'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Missed Meeting</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="violation"
                                                checked={formData.type === 'violation'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Violation</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="other"
                                                checked={formData.type === 'other'}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Other</span>
                                        </label>
                                    </div>
                                    {errors.type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                    )}
                                </div>

                                <InputField
                                    label="Fine Amount"
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="Enter fine amount"
                                    error={errors.amount}
                                    required
                                    step="0.01"
                                    min="1"
                                />

                                <InputField
                                    label="Due Date"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    placeholder="Select due date"
                                    error={errors.dueDate}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Enter detailed description of the fine"
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remarks (Optional)
                                    </label>
                                    <textarea
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                        placeholder="Enter any additional remarks"
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.remarks && (
                                        <p className="mt-1 text-sm text-red-600">{errors.remarks}</p>
                                    )}
                                </div>
                            </div>

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
                                    Create Fine
                                </CustomButton>
                            </div>
                        </form>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
