import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import * as api from '../services/api';
import { Notification, NotificationSettings } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SETTINGS_KEY = 'dr_phone_pos_notification_settings';

const getDefaultSettings = (): NotificationSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse notification settings from localStorage", e);
    }
    return { enableInApp: true };
};


export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<NotificationSettings>(getDefaultSettings());

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await api.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const intervalId = setInterval(fetchNotifications, 30000);
            return () => clearInterval(intervalId);
        }
    }, [isAuthenticated, fetchNotifications]);

    const markAsRead = async (notificationId: string) => {
        await api.markNotificationAsRead(notificationId);
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    };

    const markAllAsRead = async () => {
        await api.markAllNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };
    
    const updateSettings = (newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, settings, updateSettings, loading }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};