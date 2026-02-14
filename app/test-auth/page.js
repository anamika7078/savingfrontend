'use client';
import { useState, useEffect } from 'react';
import { savingsAPI } from '../../lib/api';
import { getAuthToken, getCurrentUser } from '../../lib/auth';

export default function TestAuth() {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const addResult = (test, status, message, data = null) => {
        setTestResults(prev => [...prev, { test, status, message, data, timestamp: new Date().toISOString() }]);
    };

    const runTests = async () => {
        setLoading(true);
        setTestResults([]);

        // Test 1: Check localStorage
        addResult('LocalStorage Check', 'info', 'Checking localStorage...');
        const token = getAuthToken();
        const user = getCurrentUser();
        
        if (token) {
            addResult('Token in localStorage', 'success', `Token found (${token.length} chars)`, {
                preview: token.substring(0, 30) + '...',
                full: token
            });
        } else {
            addResult('Token in localStorage', 'error', 'No token found in localStorage');
        }

        if (user) {
            addResult('User in localStorage', 'success', 'User data found', user);
        } else {
            addResult('User in localStorage', 'error', 'No user data found');
        }

        // Test 2: Check API base URL
        addResult('API Configuration', 'info', 'Checking API configuration...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://savings-2-ckrp.onrender.com';
        addResult('API Base URL', 'info', `Base URL: ${apiUrl}`);

        // Test 3: Test API call
        if (token) {
            addResult('API Call Test', 'info', 'Attempting API call with token...');
            try {
                const response = await savingsAPI.getAllMonthlySavings({ limit: 10 });
                addResult('API Call', 'success', 'API call successful!', {
                    hasData: !!response,
                    dataKeys: response ? Object.keys(response) : [],
                    monthlySavings: response?.data?.monthlySavings?.length || 0
                });
            } catch (error) {
                addResult('API Call', 'error', `API call failed: ${error.message || error}`, {
                    error: error,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                });
            }
        } else {
            addResult('API Call Test', 'warning', 'Skipped - No token available');
        }

        setLoading(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Authentication & API Test</h1>
            
            <button
                onClick={runTests}
                disabled={loading}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? 'Running Tests...' : 'Run Tests Again'}
            </button>

            <div className="space-y-2">
                {testResults.map((result, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded border ${
                            result.status === 'success'
                                ? 'bg-green-50 border-green-200'
                                : result.status === 'error'
                                ? 'bg-red-50 border-red-200'
                                : result.status === 'warning'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-blue-50 border-blue-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{result.test}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${
                                result.status === 'success'
                                    ? 'bg-green-200 text-green-800'
                                    : result.status === 'error'
                                    ? 'bg-red-200 text-red-800'
                                    : result.status === 'warning'
                                    ? 'bg-yellow-200 text-yellow-800'
                                    : 'bg-blue-200 text-blue-800'
                            }`}>
                                {result.status}
                            </span>
                        </div>
                        <p className="mt-2 text-sm">{result.message}</p>
                        {result.data && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-gray-600">View Details</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </details>
                        )}
                        <p className="mt-1 text-xs text-gray-500">{result.timestamp}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

