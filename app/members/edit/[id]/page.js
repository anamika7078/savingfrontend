'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../../components/Common/ProtectedRoute';
import CardBox from '../../../../components/CardBox';
import CustomButton from '../../../../components/CustomButton';
import InputField from '../../../../components/InputField';
import Loader from '../../../../components/Loader';
import { memberAPI } from '../../../../lib/api';
import { validationSchemas, validateForm } from '../../../../lib/validators';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../../lib/constants';

export default function EditMember() {
    const router = useRouter();
    const params = useParams();
    const memberId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        memberName: '',
        monthlySavingAmount: '',
        workingLoanFund: '',
        workingSavingsFund: '',
        penaltyAmount: '',
        totalSavings: '',
        outstandingLoanBalance: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (memberId) {
            // Validate member ID
            if (memberId === 'new' || isNaN(parseInt(memberId))) {
                console.error('Invalid member ID:', memberId);
                alert('Invalid member ID. Redirecting to members list.');
                router.push('/members');
                return;
            }
            fetchMember();
        }
    }, [memberId]);

    const fetchMember = async () => {
        try {
            setFetchLoading(true);
            const response = await memberAPI.getById(memberId);
            const member = response.data || response;

            // Format date for input field
            const formattedDate = member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '';

            setFormData({
                firstName: member.firstName || '',
                lastName: member.lastName || '',
                email: member.email || '',
                phone: member.phone || '',
                address: member.address || '',
                dateOfBirth: formattedDate,
                memberName: member.memberName || '',
                monthlySavingAmount: member.monthlySavingAmount || '',
                workingLoanFund: member.workingLoanFund || '',
                workingSavingsFund: member.workingSavingsFund || '',
                penaltyAmount: member.penaltyAmount || '',
                totalSavings: member.totalSavings || '',
                outstandingLoanBalance: member.outstandingLoanBalance || '',
            });
        } catch (error) {
            console.error('Error fetching member:', error);
            alert('Error loading member data');
            router.push('/members');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedData = {
                ...prev,
                [name]: value
            };

            // Calculate Total Savings when monthlySavingAmount or penaltyAmount changes
            if (name === 'monthlySavingAmount' || name === 'penaltyAmount') {
                const monthlyAmount = parseFloat(updatedData.monthlySavingAmount) || 0;
                const penaltyAmount = parseFloat(updatedData.penaltyAmount) || 0;
                updatedData.totalSavings = (monthlyAmount + penaltyAmount).toString();
            }

            // Calculate Outstanding Loan Balance when workingLoanFund or workingSavingsFund changes
            if (name === 'workingLoanFund' || name === 'workingSavingsFund') {
                const loanFund = parseFloat(updatedData.workingLoanFund) || 0;
                const savingsFund = parseFloat(updatedData.workingSavingsFund) || 0;
                updatedData.outstandingLoanBalance = (loanFund - savingsFund).toString();
            }

            return updatedData;
        });

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
            firstName: validationSchemas.member.name,
            lastName: validationSchemas.member.name,
            email: validationSchemas.member.email,
            phone: validationSchemas.member.phone,
            address: validationSchemas.member.address,
            dateOfBirth: validationSchemas.member.dateOfBirth,
        });

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        try {
            setLoading(true);
            console.log('Updating member with data:', formData);
            await memberAPI.update(memberId, formData);
            console.log('Member updated successfully');

            // Trigger refresh for view page
            localStorage.setItem('memberUpdated', memberId);
            setTimeout(() => localStorage.removeItem('memberUpdated'), 1000);

            // Show success message
            alert(SUCCESS_MESSAGES.UPDATED);

            // Redirect to members list
            router.push('/members');
        } catch (error) {
            console.error('Error updating member:', error);
            console.error('Error details:', error.response);
            alert(error.message || error.error || ERROR_MESSAGES.GENERIC_ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/members');
    };

    if (fetchLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading member data..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Updating member..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Edit Member</h1>
                        <CustomButton
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Back to Members
                        </CustomButton>
                    </div>

                    <CardBox>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    error={errors.firstName}
                                    required
                                />

                                <InputField
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    error={errors.lastName}
                                    required
                                />

                                <InputField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    error={errors.email}
                                    required
                                />

                                <InputField
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    error={errors.phone}
                                    required
                                />

                                <InputField
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    error={errors.dateOfBirth}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputField
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter full address"
                                    error={errors.address}
                                    required
                                />
                            </div>

                            {/* Financial Information Section */}
                            <div className="md:col-span-2 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
                            </div>

                            <InputField
                                label="Member Name"
                                name="memberName"
                                value={formData.memberName}
                                onChange={handleChange}
                                placeholder="Enter member name as per records"
                            />

                            <InputField
                                label="Monthly Saving Amount"
                                name="monthlySavingAmount"
                                type="number"
                                value={formData.monthlySavingAmount}
                                onChange={handleChange}
                                placeholder="Enter monthly saving amount"
                            />

                            <InputField
                                label="Working Loan Fund (optional)"
                                name="workingLoanFund"
                                type="number"
                                value={formData.workingLoanFund}
                                onChange={handleChange}
                                placeholder="Enter working loan fund amount"
                            />

                            <InputField
                                label="Working Savings Fund (optional)"
                                name="workingSavingsFund"
                                type="number"
                                value={formData.workingSavingsFund}
                                onChange={handleChange}
                                placeholder="Enter working savings fund amount"
                            />

                            <InputField
                                label="Penalty Amount"
                                name="penaltyAmount"
                                type="number"
                                value={formData.penaltyAmount}
                                onChange={handleChange}
                                placeholder="Enter penalty amount"
                            />

                            <InputField
                                label="Total Savings"
                                name="totalSavings"
                                type="number"
                                value={formData.totalSavings}
                                onChange={handleChange}
                                placeholder="Auto-calculated total savings"
                                readOnly
                            />

                            <InputField
                                label="Outstanding Loan Balance"
                                name="outstandingLoanBalance"
                                type="number"
                                value={formData.outstandingLoanBalance}
                                onChange={handleChange}
                                placeholder="Auto-calculated outstanding loan balance"
                                readOnly
                            />

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
                                    Update Member
                                </CustomButton>
                            </div>
                        </form>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
