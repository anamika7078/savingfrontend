// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        LOGOUT: '/auth/logout',
    },
    MEMBERS: '/members',
    LOANS: '/loans',
    SAVINGS: '/savings',
    REPAYMENTS: '/repayments',
    FINES: '/fines',
    REPORTS: '/reports',
};

// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    MANAGER: 'manager',
};

// Loan statuses
export const LOAN_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    DISBURSED: 'disbursed',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
};

// Fine statuses
export const FINE_STATUS = {
    PAID: 'paid',
    UNPAID: 'unpaid',
    WAIVED: 'waived',
};

// Savings types
export const SAVINGS_TYPES = {
    FIXED: 'fixed',
    RECURRING: 'recurring',
    VOLUNTARY: 'voluntary',
};

// Payment methods
export const PAYMENT_METHODS = {
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
    CHEQUE: 'cheque',
    ONLINE: 'online',
};

// Transaction types
export const TRANSACTION_TYPES = {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    LOAN_DISBURSEMENT: 'loan_disbursement',
    LOAN_REPAYMENT: 'loan_repayment',
    FINE_PAYMENT: 'fine_payment',
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
};

// Date formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    DATETIME: 'MMM dd, yyyy HH:mm',
};

// Currency
export const CURRENCY = {
    CODE: 'USD',
    SYMBOL: '$',
};

// Interest rates (in percentage)
export const INTEREST_RATES = {
    SAVINGS: {
        FIXED: 6.5,
        RECURRING: 7.0,
        VOLUNTARY: 5.5,
    },
    LOANS: {
        PERSONAL: 12.0,
        BUSINESS: 15.0,
        EDUCATION: 8.0,
        EMERGENCY: 10.0,
    },
};

// Loan limits
export const LOAN_LIMITS = {
    MIN_AMOUNT: 1000,
    MAX_AMOUNT: 100000,
    MIN_TENURE: 1,
    MAX_TENURE: 60, // in months
};

// Fine amounts
export const FINE_AMOUNTS = {
    LATE_PAYMENT: 50,
    BOUNCE_CHEQUE: 100,
    DOCUMENT_MISSING: 25,
};

// Navigation items
export const NAVIGATION_ITEMS = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: 'HomeIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.MANAGER],
    },
    {
        name: 'Members',
        href: '/members',
        icon: 'UserGroupIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    },
    {
        name: 'Savings',
        href: '/savings',
        icon: 'BanknotesIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.MANAGER],
    },
    {
        name: 'Loans',
        href: '/loans',
        icon: 'CurrencyDollarIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.MANAGER],
    },
    {
        name: 'Repayments',
        href: '/repayments',
        icon: 'ArrowPathIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.MANAGER],
    },
    {
        name: 'Fines',
        href: '/fines',
        icon: 'ExclamationTriangleIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    },
    {
        name: 'Reports',
        href: '/reports',
        icon: 'ChartBarIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    },
    {
        name: 'Rules',
        href: '/rules',
        icon: 'DocumentTextIcon',
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.MANAGER],
    },
];

// Toast notification types
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    GENERIC_ERROR: 'An error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
    CREATED: 'Created successfully!',
    UPDATED: 'Updated successfully!',
    DELETED: 'Deleted successfully!',
    SAVED: 'Saved successfully!',
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logout successful!',
    REGISTER_SUCCESS: 'Registration successful!',
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
};

// Table column definitions
export const TABLE_COLUMNS = {
    MEMBERS: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phone', label: 'Phone', sortable: false },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'joinedDate', label: 'Joined Date', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
    ],
    LOANS: [
        { key: 'member', label: 'Member', sortable: false },
        { key: 'amount', label: 'Amount', sortable: true },
        { key: 'interestRate', label: 'Interest Rate', sortable: true },
        { key: 'tenure', label: 'Tenure', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'createdAt', label: 'Created Date', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
    ],
    SAVINGS: [
        { key: 'member', label: 'Member', sortable: false },
        { key: 'amount', label: 'Amount', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'interestRate', label: 'Interest Rate', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'createdAt', label: 'Created Date', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
    ],
    FINES: [
        { key: 'member', label: 'Member', sortable: false },
        { key: 'amount', label: 'Amount', sortable: true },
        { key: 'reason', label: 'Reason', sortable: false },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'createdAt', label: 'Created Date', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
    ],
};

// Export options
export const EXPORT_FORMATS = {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
};

// Chart colors
export const CHART_COLORS = {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#8B5CF6',
    GRAY: '#6B7280',
};
