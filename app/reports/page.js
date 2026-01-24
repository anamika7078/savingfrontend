'use client';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import CardBox from '../../components/CardBox';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import { reportAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [selectedReport, setSelectedReport] = useState('dashboard');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReportData();
    }, [selectedReport, dateRange]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            let data;

            switch (selectedReport) {
                case 'dashboard':
                    data = await reportAPI.getDashboard();
                    break;
                case 'loan-performance':
                    data = await reportAPI.getLoanPerformance(dateRange);
                    break;
                case 'financial-summary':
                    data = await reportAPI.getFinancialSummary(dateRange);
                    break;
                default:
                    data = await reportAPI.getDashboard();
            }

            setReportData(data);
        } catch (error) {
            console.error('Error fetching report data:', error);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const response = await reportAPI.export({ ...dateRange, format });
            // Handle file download
            const blob = new Blob([response], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${selectedReport}-${dateRange.start}-${dateRange.end}.${format}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Error exporting report');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading reports..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                        <div className="flex space-x-3">
                            <CustomButton
                                variant="outline"
                                onClick={() => handleExport('pdf')}
                            >
                                Export PDF
                            </CustomButton>
                            <CustomButton
                                variant="outline"
                                onClick={() => handleExport('excel')}
                            >
                                Export Excel
                            </CustomButton>
                        </div>
                    </div>

                    {/* Report Controls */}
                    <CardBox className="mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Report Type
                                    </label>
                                    <select
                                        value={selectedReport}
                                        onChange={(e) => setSelectedReport(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="dashboard">Dashboard Summary</option>
                                        <option value="loan-performance">Loan Performance</option>
                                        <option value="financial-summary">Financial Summary</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardBox>

                    {/* Report Content */}
                    {reportData && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <CardBox>
                                    <div className="p-6">
                                        <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {formatCurrency(reportData.totalRevenue || 0)}
                                        </p>
                                        <p className="text-sm text-green-600 mt-2">
                                            +{reportData.revenueGrowth || 0}% from last period
                                        </p>
                                    </div>
                                </CardBox>
                                <CardBox>
                                    <div className="p-6">
                                        <h3 className="text-sm font-medium text-gray-500">Active Loans</h3>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {reportData.activeLoans || 0}
                                        </p>
                                        <p className="text-sm text-blue-600 mt-2">
                                            {formatCurrency(reportData.totalLoanAmount || 0)} outstanding
                                        </p>
                                    </div>
                                </CardBox>
                                <CardBox>
                                    <div className="p-6">
                                        <h3 className="text-sm font-medium text-gray-500">Total Savings</h3>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {formatCurrency(reportData.totalSavings || 0)}
                                        </p>
                                        <p className="text-sm text-green-600 mt-2">
                                            +{reportData.savingsGrowth || 0}% growth
                                        </p>
                                    </div>
                                </CardBox>
                                <CardBox>
                                    <div className="p-6">
                                        <h3 className="text-sm font-medium text-gray-500">Collection Rate</h3>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {reportData.collectionRate || 0}%
                                        </p>
                                        <p className="text-sm text-orange-600 mt-2">
                                            {reportData.overdueAccounts || 0} overdue accounts
                                        </p>
                                    </div>
                                </CardBox>
                            </div>

                            {/* Detailed Report Table */}
                            <CardBox>
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {selectedReport === 'dashboard' ? 'Dashboard Summary' :
                                            selectedReport === 'loan-performance' ? 'Loan Performance' :
                                                'Financial Summary'}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Metric
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Current Period
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Previous Period
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Change
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {reportData.metrics?.map((metric, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {metric.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {metric.type === 'currency' ? formatCurrency(metric.current) : metric.current}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {metric.type === 'currency' ? formatCurrency(metric.previous) : metric.previous}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`font-medium ${metric.change > 0 ? 'text-green-600' :
                                                                    metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                                                                }`}>
                                                                {metric.change > 0 ? '+' : ''}{metric.change}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardBox>
                        </div>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}