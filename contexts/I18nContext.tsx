
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../i18n/translations';

type Language = keyof typeof translations;

export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

interface LanguageDetail {
    name: string;
    dir: 'ltr' | 'rtl';
    primaryCurrency: string;
    currencies: string[];
}

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
  currency: Currency;
  setCurrency: (currencyCode: string) => void;
  formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
  languageDetails: Record<Language, LanguageDetail>;
  currencies: Record<string, Currency>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const currencies: Record<string, Currency> = {
    EGP: { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
    AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
};

export const languageDetails: Record<Language, LanguageDetail> = {
    ar: { name: 'العربية', dir: 'rtl', primaryCurrency: 'EGP', currencies: ['EGP', 'SAR', 'AED', 'USD', 'EUR'] },
    en: { name: 'English', dir: 'ltr', primaryCurrency: 'USD', currencies: ['USD', 'GBP', 'EUR', 'CAD', 'AUD'] },
    fr: { name: 'Français', dir: 'ltr', primaryCurrency: 'EUR', currencies: ['EUR', 'USD', 'CAD'] },
    es: { name: 'Español', dir: 'ltr', primaryCurrency: 'EUR', currencies: ['EUR', 'USD', 'MXN'] },
    de: { name: 'Deutsch', dir: 'ltr', primaryCurrency: 'EUR', currencies: ['EUR', 'CHF'] },
};

const getInitialLanguage = (): Language => {
    const savedLang = localStorage.getItem('dr_phone_pos_language');
    if (savedLang && savedLang in translations) {
        return savedLang as Language;
    }
    // Default to Arabic if no save found
    return 'ar';
};

const getInitialCurrency = (lang: Language): Currency => {
    const savedCurrencyCode = localStorage.getItem('dr_phone_pos_currency');
    if (savedCurrencyCode && savedCurrencyCode in currencies) {
        return currencies[savedCurrencyCode];
    }
    // Default to Egyptian Pound if no save found, regardless of browser lang initially
    return currencies['EGP'];
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);
    const [currency, setCurrencyState] = useState<Currency>(() => getInitialCurrency(language));

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = languageDetails[language].dir;
    }, [language]);

    const setLanguage = (lang: Language) => {
        localStorage.setItem('dr_phone_pos_language', lang);
        setLanguageState(lang);
        
        // Optional: Logic to auto-switch currency when language changes? 
        // Currently disabled to respect user choice of currency.
        // If user specifically wants EGP with English, we allow it.
    };
    
    const setCurrency = (currencyCode: string) => {
        if (currencyCode in currencies) {
            localStorage.setItem('dr_phone_pos_currency', currencyCode);
            setCurrencyState(currencies[currencyCode]);
        }
    };
    
    const formatCurrency = useCallback((amount: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: currency.code,
            ...options,
        }).format(amount);
    }, [language, currency]);

    const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
        const keys = key.split('.');
        let text = translations[language];

        for (const k of keys) {
            if (text && typeof text === 'object' && k in text) {
                text = (text as any)[k];
            } else {
                // Fallback to English if key missing in current language
                let fallbackText = translations.en;
                for (const fk of keys) {
                    if (fallbackText && typeof fallbackText === 'object' && fk in fallbackText) {
                        fallbackText = (fallbackText as any)[fk];
                    } else {
                        return key;
                    }
                }
                text = fallbackText;
                break;
            }
        }
        
        let result = typeof text === 'string' ? text : key;

        if (params) {
            for (const [paramKey, paramValue] of Object.entries(params)) {
                result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
            }
        }

        return result;
    }, [language]);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t, currency, setCurrency, formatCurrency, languageDetails, currencies }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
