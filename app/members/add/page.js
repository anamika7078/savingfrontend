'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import InputField from '../../../components/InputField';
import Loader from '../../../components/Loader';
import { memberAPI } from '../../../lib/api';
import { validationSchemas, validateForm } from '../../../lib/validators';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../lib/constants';

export default function AddMember() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        memberName: '',
        monthlySavingAmount: '',
    });
    const [errors, setErrors] = useState({});

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
            console.log('Creating member with data:', formData);
            await memberAPI.create(formData);
            console.log('Member created successfully');

            // Show success message (you can integrate toast here)
            alert(SUCCESS_MESSAGES.CREATED);

            // Redirect to members list
            router.push('/members');
        } catch (error) {
            console.error('Error creating member:', error);
            console.error('Error details:', error.response);
            alert(error.message || error.error || ERROR_MESSAGES.GENERIC_ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/members');
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Creating member..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Add New Member</h1>
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
                                    Create Member
                                </CustomButton>
                            </div>
                        </form>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
