import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { BellIcon } from './icons/BellIcon';
import { Notification } from '../types';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

const NotificationItem: React.FC<{ notification: Notification; onClick: () => void; }> = ({ notification, onClick }) => {
    const { t, language } = useI18n();
    
    const renderMessage = () => {
        if (typeof notification.message === 'object' && notification.message.key) {
            return t(notification.message.key, notification.message.params as any);
        }
        // Fallback for old string messages if any
        return String(notification.message);
    }

    return (
        <div onClick={onClick} className={`p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}>
            <p className="text-sm text-gray-700">{renderMessage()}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString(language)}</p>
        </div>
    );
};

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, settings } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { t } = useI18n();
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // This check must come AFTER all hook calls to avoid violating Rules of Hooks.
    if (!settings.enableInApp) {
        return null;
    }
    
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
        // Navigate to the inventory page to see the product
        navigate('/inventory'); 
    };

    const handleMarkAllReadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllAsRead();
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-white focus:outline-none">
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 origin-top-right">
                    <div className="p-3 flex justify-between items-center border-b">
                        <h4 className="font-semibold text-gray-800">{t('notifications.title')}</h4>
                        {notifications.some(n => !n.read) && (
                           <button onClick={handleMarkAllReadClick} className="text-sm text-blue-600 hover:underline">
                                {t('notifications.markAllAsRead')}
                           </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <NotificationItem key={n.id} notification={n} onClick={() => handleNotificationClick(n)} />
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500 text-center">{t('notifications.noNotifications')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;