// Form validation rules
export const validationRules = {
    required: (value) => {
        if (!value || value.toString().trim() === '') {
            return 'This field is required';
        }
        return null;
    },

    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
        }
        return null;
    },

    minLength: (min) => (value) => {
        if (value && value.length < min) {
            return `Must be at least ${min} characters long`;
        }
        return null;
    },

    maxLength: (max) => (value) => {
        if (value && value.length > max) {
            return `Must be no more than ${max} characters long`;
        }
        return null;
    },

    numeric: (value) => {
        if (value && isNaN(Number(value))) {
            return 'Must be a valid number';
        }
        return null;
    },

    positive: (value) => {
        const num = Number(value);
        if (value && (isNaN(num) || num <= 0)) {
            return 'Must be a positive number';
        }
        return null;
    },

    min: (min) => (value) => {
        const num = Number(value);
        if (value && (isNaN(num) || num < min)) {
            return `Must be at least ${min}`;
        }
        return null;
    },

    max: (max) => (value) => {
        const num = Number(value);
        if (value && (isNaN(num) || num > max)) {
            return `Must be no more than ${max}`;
        }
        return null;
    },

    phone: (value) => {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        if (value && !phoneRegex.test(value)) {
            return 'Please enter a valid phone number';
        }
        return null;
    },

    password: (value) => {
        if (!value || value.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])/.test(value)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(value)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(value)) {
            return 'Password must contain at least one number';
        }
        return null;
    },

    confirmPassword: (password) => (confirmPassword) => {
        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }
        return null;
    },

    futureDate: (value) => {
        if (value && new Date(value) <= new Date()) {
            return 'Date must be in the future';
        }
        return null;
    },

    pastDate: (value) => {
        if (value && new Date(value) > new Date()) {
            return 'Date must be in the past';
        }
        return null;
    },

    age: (minAge, maxAge) => (value) => {
        if (!value) return null;

        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < minAge) {
            return `Must be at least ${minAge} years old`;
        }
        if (maxAge && age > maxAge) {
            return `Must be no more than ${maxAge} years old`;
        }
        return null;
    },
};

// Form field validator
export const validateField = (value, rules) => {
    for (const rule of rules) {
        const error = rule(value);
        if (error) return error;
    }
    return null;
};

// Form validator
export const validateForm = (formData, schema) => {
    const errors = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
        const error = validateField(formData[fieldName], rules);
        if (error) {
            errors[fieldName] = error;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Common validation schemas
export const validationSchemas = {
    login: {
        username: [validationRules.required],
        password: [validationRules.required],
    },

    register: {
        username: [
            validationRules.required,
            validationRules.minLength(3),
            validationRules.maxLength(50),
        ],
        email: [
            validationRules.required,
            validationRules.email,
        ],
        password: [
            validationRules.required,
            validationRules.password,
        ],
        confirmPassword: [
            validationRules.required,
            validationRules.confirmPassword,
        ],
    },

    member: {
        name: [
            validationRules.required,
            validationRules.minLength(2),
            validationRules.maxLength(100),
        ],
        email: [
            validationRules.required,
            validationRules.email,
        ],
        phone: [
            validationRules.required,
            validationRules.phone,
        ],
        address: [
            validationRules.required,
            validationRules.maxLength(200),
        ],
        dateOfBirth: [
            validationRules.required,
            validationRules.age(18, 120),
        ],
    },

    loan: {
        memberId: [validationRules.required],
        amount: [
            validationRules.required,
            validationRules.positive,
            validationRules.min(1000),
        ],
        interestRate: [
            validationRules.required,
            validationRules.positive,
            validationRules.min(1),
            validationRules.max(50),
        ],
        tenureMonths: [
            validationRules.required,
            validationRules.positive,
            validationRules.min(1),
            validationRules.max(360),
        ],
        purpose: [
            validationRules.required,
            validationRules.maxLength(200),
        ],
    },

    savings: {
        memberId: [validationRules.required],
        amount: [
            validationRules.required,
            validationRules.positive,
            validationRules.min(100),
        ],
        type: [validationRules.required],
    },

    fine: {
        memberId: [validationRules.required],
        amount: [
            validationRules.required,
            validationRules.positive,
            validationRules.min(1),
        ],
        reason: [
            validationRules.required,
            validationRules.maxLength(200),
        ],
    },
};
