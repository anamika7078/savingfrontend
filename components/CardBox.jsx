import React from 'react';

const CardBox = ({
    children,
    title,
    subtitle,
    className = '',
    padding = 'p-6',
    shadow = 'shadow-md',
    ...props
}) => {
    const baseClasses = 'bg-white rounded-lg';
    const classes = `${baseClasses} ${shadow} ${padding} ${className}`;

    return (
        <div className={classes} {...props}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
        {children}
    </div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
        {children}
    </div>
);

export default CardBox;
