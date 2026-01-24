'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import CardBox from '../../components/CardBox';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import { fineAPI } from '../../lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '../../lib/utils';

export default function Fines() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [fines, setFines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchFines();
    }, []);

    useEffect(() => {
        fetchFines();
    }, [filterStatus]);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus && filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await fineAPI.getAll(params);
            let finesData = [];
            if (response.data && response.data.fines) {
                finesData = response.data.fines;
            } else if (response.fines) {
                finesData = response.fines;
            } else if (Array.isArray(response)) {
                finesData = response;
            } else if (response && Array.isArray(response.data)) {
                finesData = response.data;
            }

            setFines(finesData);
        } catch (error) {
            console.error('Error fetching fines:', error);
            setFines([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewFine = (id) => {
        router.push(`/fines/${id}`);
    };

    const handlePayFine = (id) => {
        router.push(`/fines/${id}`);
    };

    const handleWaiveFine = (id) => {
        router.push(`/fines/${id}`);
    };

    const handleAddFine = () => {
        router.push('/fines/add');
    };

    const handleCalculateLateFines = async () => {
        try {
            await fineAPI.calculateLateFines();
            alert('Late fines calculated successfully');
            fetchFines();
        } catch (error) {
            console.error('Error calculating late fines:', error);
            alert('Error calculating late fines');
        }
    };

    const filteredFines = fines.filter(fine => {
        const matchesSearch = fine.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.fineNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading fines..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Fines Management</h1>
                        <div className="flex space-x-2">
                            <CustomButton
                                variant="info"
                                onClick={handleCalculateLateFines}
                            >
                                Calculate Late Fines
                            </CustomButton>
                            <CustomButton
                                variant="primary"
                                onClick={handleAddFine}
                            >
                                Add Fine
                            </CustomButton>
                        </div>
                    </div>

                    <CardBox className="mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by member name or fine number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="waived">Waived</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardBox>

                    <CardBox>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fine Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredFines.map((fine) => (
                                        <tr key={fine.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {fine.fineNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {fine.member?.firstName} {fine.member?.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {fine.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(fine.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(fine.dueDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(fine.status)}`}>
                                                    {fine.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <CustomButton
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() => handleViewFine(fine.id)}
                                                >
                                                    View
                                                </CustomButton>
                                                {fine.status === 'pending' && (
                                                    <>
                                                        <CustomButton
                                                            variant="primary"
                                                            size="sm"
                                                            className="mr-2"
                                                            onClick={() => handlePayFine(fine.id)}
                                                        >
                                                            Pay
                                                        </CustomButton>
                                                        <CustomButton
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => handleWaiveFine(fine.id)}
                                                        >
                                                            Waive
                                                        </CustomButton>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredFines.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No fines found
                                </div>
                            )}
                        </div>
                    </CardBox>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}