'use client';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout.js';
import ProtectedRoute from '../../components/Common/ProtectedRoute';
import CardBox from '../../components/CardBox';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import InputField from '../../components/InputField';

export default function Rules() {
    const [loading, setLoading] = useState(true);
    const [rules, setRules] = useState([]);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            // Mock data for rules - in real app this would come from API
            const mockRules = [
                {
                    id: 1,
                    category: 'Loan Rules',
                    title: 'Minimum Loan Amount',
                    description: 'The minimum loan amount is $1,000 for all members.',
                    value: '1000',
                    type: 'number',
                    unit: 'USD'
                },
                {
                    id: 2,
                    category: 'Loan Rules',
                    title: 'Maximum Loan Amount',
                    description: 'The maximum loan amount is $100,000 based on member credit score.',
                    value: '100000',
                    type: 'number',
                    unit: 'USD'
                },
                {
                    id: 3,
                    category: 'Interest Rates',
                    title: 'Personal Loan Interest Rate',
                    description: 'Interest rate for personal loans.',
                    value: '12',
                    type: 'percentage',
                    unit: '%'
                },
                {
                    id: 4,
                    category: 'Interest Rates',
                    title: 'Business Loan Interest Rate',
                    description: 'Interest rate for business loans.',
                    value: '15',
                    type: 'percentage',
                    unit: '%'
                },
                {
                    id: 5,
                    category: 'Savings',
                    title: 'Minimum Savings Amount',
                    description: 'Minimum amount required to open a savings account.',
                    value: '100',
                    type: 'number',
                    unit: 'USD'
                },
                {
                    id: 6,
                    category: 'Fines',
                    title: 'Late Payment Fine',
                    description: 'Fine amount for late EMI payments.',
                    value: '50',
                    type: 'number',
                    unit: 'USD'
                }
            ];
            setRules(mockRules);
        } catch (error) {
            console.error('Error fetching rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData({
            value: rule.value,
            description: rule.description
        });
    };

    const handleSave = async () => {
        try {
            // In real app, this would call API to update rule
            console.log('Saving rule:', editingRule.id, formData);

            // Update local state
            setRules(rules.map(rule =>
                rule.id === editingRule.id
                    ? { ...rule, value: formData.value, description: formData.description }
                    : rule
            ));

            setEditingRule(null);
            setFormData({});
        } catch (error) {
            console.error('Error saving rule:', error);
            alert('Error saving rule');
        }
    };

    const handleCancel = () => {
        setEditingRule(null);
        setFormData({});
    };

    const groupedRules = rules.reduce((acc, rule) => {
        if (!acc[rule.category]) {
            acc[rule.category] = [];
        }
        acc[rule.category].push(rule);
        return acc;
    }, {});

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <Loader text="Loading rules..." />
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Rules & Regulations</h1>
                        <CustomButton variant="outline" onClick={fetchRules}>
                            Refresh
                        </CustomButton>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(groupedRules).map(([category, categoryRules]) => (
                            <CardBox key={category}>
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
                                    <div className="space-y-4">
                                        {categoryRules.map((rule) => (
                                            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                                                {editingRule?.id === rule.id ? (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">{rule.title}</h4>
                                                            <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <InputField
                                                                label="Value"
                                                                value={formData.value}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                                                placeholder={`Enter value in ${rule.unit}`}
                                                            />
                                                            <InputField
                                                                label="Description"
                                                                value={formData.description}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                                placeholder="Enter description"
                                                            />
                                                        </div>
                                                        <div className="flex space-x-3">
                                                            <CustomButton variant="primary" onClick={handleSave}>
                                                                Save
                                                            </CustomButton>
                                                            <CustomButton variant="outline" onClick={handleCancel}>
                                                                Cancel
                                                            </CustomButton>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium text-gray-900">{rule.title}</h4>
                                                            <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                                                            <div className="mt-2">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                    {rule.value} {rule.unit}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <CustomButton
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(rule)}
                                                            >
                                                                Edit
                                                            </CustomButton>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBox>
                        ))}
                    </div>

                    {rules.length === 0 && (
                        <CardBox>
                            <div className="text-center py-8 text-gray-500">
                                No rules found
                            </div>
                        </CardBox>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
                   