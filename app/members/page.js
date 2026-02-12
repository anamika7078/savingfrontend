'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import { memberAPI } from '../../lib/api';
import CardBox from '../../components/CardBox';
import Loader from '../../components/Loader';
import CustomButton from '../../components/CustomButton';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';

export default function Members() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);

    const handleAddMember = () => {
        router.push('/members/add');
    };

    const handleViewMember = (id) => {
        router.push(`/members/${id}`);
    };

    const handleEditMember = (id) => {
        router.push(`/members/edit/${id}`);
    };

    const handleDeleteMember = async (id) => {
        if (!confirm('Are you sure you want to delete this member?')) {
            return;
        }

        try {
            await memberAPI.delete(id);
            // Refresh the members list
            fetchMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Error deleting member');
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            console.log('Fetching members...');
            console.log('Auth token:', localStorage.getItem('token'));

            const response = await memberAPI.getAll();
            console.log('Raw members response:', response);

            // Handle the correct response structure: response.data.members
            let membersData = [];
            if (response && response.data && response.data.members) {
                console.log('Response has data.members property:', response.data.members);
                membersData = Array.isArray(response.data.members) ? response.data.members : [];
            } else if (response && response.data) {
                console.log('Response has data property:', response.data);
                membersData = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                console.log('Response is directly an array');
                membersData = response;
            } else {
                console.log('Unknown response format, using empty array');
            }

            console.log('Final members data:', membersData);
            console.log('Number of members:', membersData.length);

            setMembers(membersData);
        } catch (error) {
            console.error('Error fetching members:', error);
            console.error('Error response:', error.response);
            setMembers([]); // Ensure members is always an array
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading members..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Members</h1>
                        <CustomButton variant="primary" onClick={handleAddMember}>
                            Add Member
                        </CustomButton>
                    </div>
                    <CardBox>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(members) && members.map((member) => (
                                        <tr key={member.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {member.firstName} {member.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {member.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(member.status || 'active')}`}>
                                                    {member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(member.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => handleViewMember(member.id)}
                                                >
                                                    View
                                                </CustomButton>
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => handleEditMember(member.id)}
                                                >
                                                    Edit
                                                </CustomButton>
                                                <CustomButton
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteMember(member.id)}
                                                >
                                                    Delete
                                                </CustomButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {members.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No members found
                                </div>
                            )}
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
