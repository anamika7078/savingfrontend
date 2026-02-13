// Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

// Date formatting
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    };

    return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    };

    return new Date(date).toLocaleString('en-US', defaultOptions);
};

// Calculate EMI
export const calculateEMI = (principal, annualRate, tenureMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
};

// Calculate total interest
export const calculateTotalInterest = (principal, annualRate, tenureMonths) => {
    const emi = calculateEMI(principal, annualRate, tenureMonths);
    const totalPayment = emi * tenureMonths;
    return Math.round((totalPayment - principal) * 100) / 100;
};

// Generate loan schedule
export const generateLoanSchedule = (principal, annualRate, tenureMonths) => {
    const emi = calculateEMI(principal, annualRate, tenureMonths);
    const monthlyRate = annualRate / 12 / 100;
    const schedule = [];
    let remainingPrincipal = principal;

    for (let month = 1; month <= tenureMonths; month++) {
        const interestPayment = remainingPrincipal * monthlyRate;
        const principalPayment = emi - interestPayment;
        remainingPrincipal -= principalPayment;

        schedule.push({
            month,
            emi: Math.round(emi * 100) / 100,
            principal: Math.round(principalPayment * 100) / 100,
            interest: Math.round(interestPayment * 100) / 100,
            balance: Math.round(Math.max(0, remainingPrincipal) * 100) / 100,
        });
    }

    return schedule;
};

// Status badge helper
export const getStatusBadge = (status, type = 'default') => {
    const statusConfig = {
        default: {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            paid: 'bg-green-100 text-green-800',
            unpaid: 'bg-red-100 text-red-800',
        },
        loan: {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            disbursed: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-gray-100 text-gray-800',
        },
    };

    return statusConfig[type]?.[status] || statusConfig.default[status] || 'bg-gray-100 text-gray-800';
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Deep clone object
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));

    const cloned = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
};

// Capitalize first letter
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

// Validate email format
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
    const re = /^\+?[\d\s-()]{10,}$/;
    return re.test(phone);
};

// Format phone number
export const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};
