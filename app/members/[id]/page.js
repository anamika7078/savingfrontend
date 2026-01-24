'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout/Layout.js';
import ProtectedRoute from '../../../components/Common/ProtectedRoute';
import CardBox from '../../../components/CardBox';
import CustomButton from '../../../components/CustomButton';
import Loader from '../../../components/Loader';
import { memberAPI } from '../../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../../lib/utils';

export default function ViewMember() {
    const router = useRouter();
    const params = useParams();
    const memberId = params.id;

    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState(null);

    useEffect(() => {
        if (memberId) {
            fetchMember();
        }
    }, [memberId]);

    // Add event listener for storage changes to detect updates
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'memberUpdated' && e.newValue === memberId) {
                fetchMember();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check for updates when window gains focus
        const handleFocus = () => {
            fetchMember();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [memberId]);

    const fetchMember = async () => {
        try {
            setLoading(true);
            console.log('Fetching member data for ID:', memberId);
            const response = await memberAPI.getById(memberId);
            console.log('Raw member response:', response);
            const memberData = response.data || response;
            console.log('Processed member data:', memberData);
            console.log('Monthly saving amount:', memberData.monthlySavingAmount);
            setMember(memberData);
        } catch (error) {
            console.error('Error fetching member:', error);
            alert('Error loading member data');
            router.push('/members');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchMember();
    };

    const handleEdit = () => {
        router.push(`/members/edit/${memberId}`);
    };

    const handleBack = () => {
        router.push('/members');
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading member profile..." fullScreen />
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!member) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Member not found</h2>
                            <CustomButton variant="primary" onClick={handleBack}>
                                Back to Members
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
                        <h1 className="text-2xl font-bold">Member Profile</h1>
                        <div className="flex space-x-3">
                            <CustomButton
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                Refresh
                            </CustomButton>
                            <CustomButton
                                variant="outline"
                                onClick={handleBack}
                            >
                                Back to Members
                            </CustomButton>
                            <CustomButton
                                variant="primary"
                                onClick={handleEdit}
                            >
                                Edit Member
                            </CustomButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Personal Information */}
                        <div className="lg:col-span-2">
                            <CardBox>
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.firstName} {member.lastName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                            <p className="mt-1 text-sm text-gray-900">{member.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                                            <p className="mt-1 text-sm text-gray-900">{member.phone}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.dateOfBirth ? formatDate(member.dateOfBirth) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500">Address</label>
                                            <p className="mt-1 text-sm text-gray-900">{member.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardBox>

                            {/* Financial Information */}
                            <CardBox className="mt-6">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Monthly Saving Amount</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.monthlySavingAmount ? formatCurrency(member.monthlySavingAmount) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Total Savings</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.totalSavings ? formatCurrency(member.totalSavings) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Working Loan Fund</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.workingLoanFund ? formatCurrency(member.workingLoanFund) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Working Savings Fund</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.workingSavingsFund ? formatCurrency(member.workingSavingsFund) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Outstanding Loan Balance</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.outstandingLoanBalance ? formatCurrency(member.outstandingLoanBalance) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Penalty Amount</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {member.penaltyAmount ? formatCurrency(member.penaltyAmount) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardBox>
                        </div>

                        {/* Sidebar Information */}
                        <div className="lg:col-span-1">
                            <CardBox>
                                <div className="p-6">
                                    <div className="text-center">
                                        <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                                            </span>
                                        </div>
                                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                                            {member.firstName} {member.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>

                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Member ID</label>
                                                <p className="mt-1 text-sm text-gray-900">{member.memberId || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Status</label>
                                                <div className="mt-1">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(member.isActive ? 'active' : 'inactive')}`}>
                                                        {member.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Member Since</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {member.createdAt ? formatDate(member.createdAt) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardBox>

                            {/* Quick Actions */}
                            <CardBox className="mt-6">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <CustomButton
                                        variant="primary"
                                        className="w-full"
                                        onClick={handleEdit}
                                    >
                                        Edit Member
                                    </CustomButton>
                                    <CustomButton
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push(`/savings?member=${memberId}`)}
                                    >
                                        View Savings
                                    </CustomButton>
                                    <CustomButton
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push(`/loans?member=${memberId}`)}
                                    >
                                        View Loans
                                    </CustomButton>
                                </div>
                            </CardBox>
                        </div>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
