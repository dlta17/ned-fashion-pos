
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { StoreSettings, RemoteLicenseRecord } from '../types';
import { checkLicenseStatusRemotely } from '../services/api';

interface LicenseState {
    hardwareId: string;
    installationDate: string;
    isActivated: boolean;
    trialDaysLeft: number;
    remoteStatus: 'ACTIVE' | 'BLOCKED' | 'PENDING';
    warningMessage?: string;
    currentVersion: string;
    latestVersion?: string;
    updateUrl?: string;
    updateDescription?: string;
    lastUpdateCheck?: string;
    remoteSyncUrl?: string; // GitHub Raw URL (e.g. https://raw.githubusercontent.com/user/repo/main/server.json)
}

interface StoreContextType {
    settings: StoreSettings;
    updateSettings: (newSettings: Partial<StoreSettings>) => void;
    license: LicenseState;
    activateLicense: (key: string) => boolean;
    refreshRemoteStatus: () => Promise<void>;
    clearLocalWarning: () => void;
    setRemoteSyncUrl: (url: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const SETTINGS_KEY = 'ned_fashion_store_settings';
const LICENSE_KEY = 'ned_fashion_pos_lic_v3';
const MASTER_SECRET = "NED-AI-LABS-SECRET-2025-POS-PRO";
const APP_VERSION = "1.0.1"; 

const generateHardwareId = () => {
    const nav = window.navigator;
    const entropy = [nav.hardwareConcurrency, nav.platform, window.screen.width].join('|');
    let hash = 5381;
    for (let i = 0; i < entropy.length; i++) hash = ((hash << 5) + hash) + entropy.charCodeAt(i);
    return 'HW-' + (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
};

const verifyLicenseKey = (inputKey: string, hardwareId: string): boolean => {
    const cleanKey = inputKey.trim().toUpperCase();
    const source = hardwareId + MASTER_SECRET;
    let hash = 0;
    for (let i = 0; i < source.length; i++) hash = ((hash << 5) - hash) + source.charCodeAt(i);
    const rawStr = Math.abs(hash).toString(16).toUpperCase().padEnd(16, 'X');
    const expectedKey = `${rawStr.substring(0, 4)}-${rawStr.substring(4, 8)}-${rawStr.substring(8, 12)}-${rawStr.substring(12, 16)}`;
    return cleanKey === expectedKey;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<StoreSettings>({
        name: 'NED POS PRO',
        phone: '',
        registrationNumber: '',
        logoUrl: '',
        footerText: 'Powered by NED AI LABS',
        taxRate: 0
    });

    const [license, setLicense] = useState<LicenseState>({
        hardwareId: generateHardwareId(),
        installationDate: new Date().toISOString(),
        isActivated: false,
        trialDaysLeft: 30,
        remoteStatus: 'PENDING',
        currentVersion: APP_VERSION
    });

    useEffect(() => {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) setSettings(JSON.parse(stored));

        const storedLic = localStorage.getItem(LICENSE_KEY);
        if (storedLic) {
            try {
                const parsed = JSON.parse(atob(storedLic));
                setLicense(prev => ({ ...prev, ...parsed, currentVersion: APP_VERSION }));
            } catch (e) {}
        }
        
        refreshRemoteStatus();
        const interval = setInterval(refreshRemoteStatus, 300000); // Check every 5 mins
        return () => clearInterval(interval);
    }, []);

    const refreshRemoteStatus = async () => {
        if (!license.remoteSyncUrl) return;

        try {
            // Fetch from GitHub Raw URL
            const response = await fetch(license.remoteSyncUrl, { cache: 'no-store' });
            if (response.ok) {
                const cloudData = await response.json();
                
                // 1. License & Security Check
                const myStore = cloudData.stores?.[license.hardwareId];
                
                // 2. Global Update Check
                const globalUpdate = cloudData.update || {};

                setLicense(prev => {
                    const newState: LicenseState = { 
                        ...prev, 
                        remoteStatus: myStore?.status || prev.remoteStatus,
                        warningMessage: myStore?.warning || globalUpdate?.globalWarning || prev.warningMessage,
                        latestVersion: globalUpdate?.version || prev.latestVersion,
                        updateUrl: globalUpdate?.url || prev.updateUrl,
                        updateDescription: globalUpdate?.description || prev.updateDescription,
                        lastUpdateCheck: new Date().toISOString()
                    };
                    localStorage.setItem(LICENSE_KEY, btoa(JSON.stringify(newState)));
                    return newState;
                });
            }
        } catch (e) {
            console.error("Cloud sync failed. Working in local mode.");
        }
    };

    const setRemoteSyncUrl = (url: string) => {
        setLicense(prev => {
            const newState = { ...prev, remoteSyncUrl: url };
            localStorage.setItem(LICENSE_KEY, btoa(JSON.stringify(newState)));
            return newState;
        });
        refreshRemoteStatus();
    };

    const clearLocalWarning = () => setLicense(prev => ({ ...prev, warningMessage: undefined }));

    const updateSettings = (newSettings: Partial<StoreSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const activateLicense = (key: string): boolean => {
        if (verifyLicenseKey(key, license.hardwareId)) {
            setLicense(prev => {
                const newLic = { ...prev, isActivated: true, remoteStatus: 'ACTIVE' as const };
                localStorage.setItem(LICENSE_KEY, btoa(JSON.stringify(newLic)));
                return newLic;
            });
            return true;
        }
        return false;
    };

    return (
        <StoreContext.Provider value={{ settings, updateSettings, license, activateLicense, refreshRemoteStatus, clearLocalWarning, setRemoteSyncUrl }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within StoreProvider');
    return context;
};
