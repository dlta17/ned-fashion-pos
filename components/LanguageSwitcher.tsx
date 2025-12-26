import React, { useState, useRef, useEffect } from 'react';
import { useI18n, languageDetails } from '../contexts/I18nContext';
import { GlobeIcon } from './icons/GlobeIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface LanguageSwitcherProps {
    buttonClassName?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
    buttonClassName = "text-gray-400 hover:text-white" 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useI18n();
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

    const handleLanguageChange = (lang: keyof typeof languageDetails) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center p-2 rounded-lg focus:outline-none ${buttonClassName}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <GlobeIcon />
                <ChevronDownIcon />
            </button>
            {isOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 origin-top-right">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {Object.entries(languageDetails).map(([langCode, { name }]) => (
                            <button
                                key={langCode}
                                onClick={() => handleLanguageChange(langCode as keyof typeof languageDetails)}
                                className={`block w-full text-start px-4 py-2 text-sm ${language === langCode ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100 hover:text-gray-900`}
                                role="menuitem"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;