
import React from 'react';

interface PageHeaderProps {
    title: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, buttonText, onButtonClick }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">{title}</h1>
            {buttonText && onButtonClick && (
                <button
                    onClick={onButtonClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default PageHeader;
