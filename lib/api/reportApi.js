import apiClient from './apiClient';

export const reportApi = {
    getDashboard: () => apiClient.get('/reports/dashboard'),
    getLoanPerformance: (params) => apiClient.get('/reports/loan-performance', { params }),
    getMemberWise: (memberId) => apiClient.get(`/reports/member-wise/${memberId}`),
    getFinancialSummary: (params) => apiClient.get('/reports/financial-summary', { params }),
    export: (params) => apiClient.get('/reports/export', { params }),
    getMemberStatistics: () => apiClient.get('/reports/member-statistics'),
    getSavingsReport: (params) => apiClient.get('/reports/savings', { params }),
    getLoansReport: (params) => apiClient.get('/reports/loans', { params }),
    getFinesReport: (params) => apiClient.get('/reports/fines', { params }),
};

export default reportApi;
