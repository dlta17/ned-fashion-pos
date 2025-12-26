import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { CurrencyIcon } from './icons/CurrencyIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface CurrencySwitcherProps {
    buttonClassName?: string;
}

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ 
    buttonClassName = "text-gray-400 hover:text-white" 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, currency, setCurrency, languageDetails, currencies } = useI18n();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCurrencyChange = (currencyCode: string) => {
        setCurrency(currencyCode);
        setIsOpen(false);
    };

    const availableCurrencyCodes = languageDetails[language].currencies;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center p-2 rounded-lg focus:outline-none ${buttonClassName}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <CurrencyIcon />
                <span className="mx-1 font-semibold text-sm">{currency.code}</span>
                <ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 origin-top-right">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {availableCurrencyCodes.map((code) => {
                            const curr = currencies[code];
                            return (
                                <button
                                    key={code}
                                    onClick={() => handleCurrencyChange(code)}
                                    className={`block w-full text-start px-4 py-2 text-sm ${currency.code === code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100 hover:text-gray-900`}
                                    role="menuitem"
                                >
                                    <span className="font-bold">{curr.code}</span>
                                    <span className="text-gray-500 text-xs ms-2">{curr.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencySwitcher;