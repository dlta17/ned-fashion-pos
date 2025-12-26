
import { mockProducts, mockSales, mockRepairs } from './mockData';
import { Product, Sale, Repair, RepairStatus, SaleItem, PaymentMethod, Notification, User, Role, Supplier, Purchase, Customer, RemoteLicenseRecord } from '../types';

export const STORAGE_KEYS = {
    PRODUCTS: 'ned_pos_products',
    SALES: 'ned_pos_sales',
    REPAIRS: 'ned_pos_repairs',
    NOTIFICATIONS: 'ned_pos_notifications',
    USERS: 'ned_pos_users',
    SUPPLIERS: 'ned_pos_suppliers',
    PURCHASES: 'ned_pos_purchases',
    SETTINGS: 'ned_pos_store_settings',
    CUSTOMERS: 'ned_pos_customers',
    LICENSE_KEY: 'ned_fashion_pos_lic_v3'
};

const loadFromStorage = <T>(key: string, defaultData: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultData;
    } catch (e) { return defaultData; }
};

const saveToStorage = (key: string, data: any) => {
    try { 
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
};

// --- USERS ---
export const getUsers = (): Promise<User[]> => {
    const defaultUsers = [
        { id: 'u-designer', username: 'nedal', password: '123', role: Role.Designer },
        { id: 'u-owner', username: 'owner', password: '123', role: Role.Owner },
    ];
    return Promise.resolve(loadFromStorage<User[]>(STORAGE_KEYS.USERS, defaultUsers));
};

export const addUser = (u: Omit<User, 'id'>) => {
    const list = loadFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const newUser = { id: `user-${Date.now()}`, ...u };
    saveToStorage(STORAGE_KEYS.USERS, [...list, newUser]);
    return Promise.resolve(newUser);
};

export const updateUser = (id: string, data: Partial<User>) => {
    const list = loadFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        saveToStorage(STORAGE_KEYS.USERS, list);
    }
    return Promise.resolve();
};

export const deleteUser = (id: string) => {
    const list = loadFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    saveToStorage(STORAGE_KEYS.USERS, list.filter(u => u.id !== id));
    return Promise.resolve();
};

// --- CUSTOMERS ---
export const getCustomers = (): Promise<Customer[]> => Promise.resolve(loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []));

export const addCustomer = (c: Omit<Customer, 'id' | 'createdAt'>) => {
    const list = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const newC = { id: `cust-${Date.now()}`, ...c, createdAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.CUSTOMERS, [newC, ...list]);
    return Promise.resolve(newC);
};

export const updateCustomer = (id: string, data: Partial<Customer>) => {
    const list = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        saveToStorage(STORAGE_KEYS.CUSTOMERS, list);
    }
    return Promise.resolve();
};

export const deleteCustomer = (id: string) => {
    const list = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, list.filter(c => c.id !== id));
    return Promise.resolve();
};

// --- SALES ---
export const getSales = (): Promise<Sale[]> => {
    const sales = loadFromStorage<Sale[]>(STORAGE_KEYS.SALES, []);
    // دمج المبيعات المسجلة مع المبيعات التجريبية إذا كانت فارغة
    return Promise.resolve(sales.length > 0 ? sales : mockSales);
};

export const addSale = async (items: SaleItem[], paymentMethod: PaymentMethod, cashier: string, discount: number = 0, customerId?: string) => {
    const sales = await getSales();
    const customers = await getCustomers();
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);
    
    const customer = customers.find(c => c.id === customerId);

    const newSale: Sale = {
        id: `sale-${Date.now()}`,
        items,
        subtotal,
        discount,
        tax: 0,
        total,
        paymentMethod,
        date: new Date().toISOString(),
        cashier,
        customerId,
        customerName: customer?.name
    };

    const updatedSales = [newSale, ...sales];
    saveToStorage(STORAGE_KEYS.SALES, updatedSales);
    return newSale;
};

// --- PRODUCTS ---
export const getProducts = (): Promise<Product[]> => Promise.resolve(loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, mockProducts));

export const addProduct = (p: Omit<Product, 'id'>) => {
    const list = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, mockProducts);
    const newP = { id: `prod-${Date.now()}`, ...p };
    saveToStorage(STORAGE_KEYS.PRODUCTS, [...list, newP]);
    return Promise.resolve(newP);
};

export const updateProduct = (id: string, data: Partial<Product>) => {
    const list = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, mockProducts);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        saveToStorage(STORAGE_KEYS.PRODUCTS, list);
    }
    return Promise.resolve();
};

export const deleteProduct = (id: string) => {
    const list = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, mockProducts);
    saveToStorage(STORAGE_KEYS.PRODUCTS, list.filter(p => p.id !== id));
    return Promise.resolve();
};

// --- REPAIRS ---
export const getRepairs = (): Promise<Repair[]> => Promise.resolve(loadFromStorage<Repair[]>(STORAGE_KEYS.REPAIRS, mockRepairs));

export const addRepair = (r: Omit<Repair, 'id' | 'receivedDate' | 'status'>) => {
    const list = loadFromStorage<Repair[]>(STORAGE_KEYS.REPAIRS, []);
    const newR: Repair = { 
        id: `repair-${Date.now()}`, 
        ...r, 
        status: RepairStatus.PENDING, 
        receivedDate: new Date().toISOString() 
    };
    saveToStorage(STORAGE_KEYS.REPAIRS, [newR, ...list]);
    return Promise.resolve(newR);
};

export const updateRepairStatus = (id: string, status: RepairStatus) => {
    const list = loadFromStorage<Repair[]>(STORAGE_KEYS.REPAIRS, []);
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
        list[idx] = { ...list[idx], status };
        saveToStorage(STORAGE_KEYS.REPAIRS, list);
    }
    return Promise.resolve();
};

// --- DASHBOARD ANALYTICS ---
export const getDashboardData = async () => {
    const sales = await getSales();
    const repairs = await getRepairs();
    
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
    
    const dailySales = todaySales.reduce((a, b) => a + b.total, 0);
    const itemsSoldToday = todaySales.reduce((acc, sale) => 
        acc + sale.items.reduce((sum, item) => sum + item.quantity, 0), 0
    );

    const pendingRepairs = repairs.filter(r => r.status !== RepairStatus.COMPLETED).length;

    const productMap: Record<string, { name: string, sold: number, revenue: number }> = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productMap[item.productName]) {
                productMap[item.productName] = { name: item.productName, sold: 0, revenue: 0 };
            }
            productMap[item.productName].sold += item.quantity;
            productMap[item.productName].revenue += (item.price * item.quantity);
        });
    });
    
    const topSelling = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toDateString();
    });

    const salesByDay = last7Days.map(dayStr => {
        const d = new Date(dayStr);
        const dayLabel = d.toLocaleDateString('ar-SA', { weekday: 'short' });
        const dayTotal = sales
            .filter(s => new Date(s.date).toDateString() === dayStr)
            .reduce((acc, s) => acc + s.total, 0);
        return { day: dayLabel, sales: dayTotal };
    });

    return { dailySales, itemsSoldToday, pendingRepairs, topSelling, salesByDay };
};

export const exportSystemData = () => {
    const backup: any = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const data = localStorage.getItem(storageKey);
        if (data) backup[storageKey] = data;
    });
    return backup;
};

export const importSystemData = (backup: any) => {
    try {
        Object.entries(backup).forEach(([key, value]) => {
            localStorage.setItem(key, value as string);
        });
        return true;
    } catch (e) { return false; }
};

export const checkLicenseStatusRemotely = async (hwid: string): Promise<RemoteLicenseRecord | null> => null;
export const getNotifications = (): Promise<Notification[]> => Promise.resolve([]);
export const markNotificationAsRead = (id: string) => Promise.resolve();
export const markAllNotificationsAsRead = () => Promise.resolve();
export const getSuppliers = (): Promise<Supplier[]> => Promise.resolve(loadFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []));
export const addSupplier = (s: Omit<Supplier, 'id'>) => {
    const list = loadFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const newS = { id: `sup-${Date.now()}`, ...s };
    saveToStorage(STORAGE_KEYS.SUPPLIERS, [newS, ...list]);
    return Promise.resolve(newS);
};
export const updateSupplier = (id: string, data: Partial<Supplier>) => {
    const list = loadFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        saveToStorage(STORAGE_KEYS.SUPPLIERS, list);
    }
    return Promise.resolve();
};
export const deleteSupplier = (id: string) => {
    const list = loadFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    saveToStorage(STORAGE_KEYS.SUPPLIERS, list.filter(s => s.id !== id));
    return Promise.resolve();
};
export const getPurchases = (): Promise<Purchase[]> => Promise.resolve(loadFromStorage(STORAGE_KEYS.PURCHASES, []));
export const addPurchase = (p: Omit<Purchase, 'id' | 'date'>) => {
    const list = loadFromStorage<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
    const newP: Purchase = { id: `pur-${Date.now()}`, ...p, date: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.PURCHASES, [newP, ...list]);
    return Promise.resolve(newP);
};
export const getRemoteLicenses = (): Promise<RemoteLicenseRecord[]> => Promise.resolve([]);
export const updateRemoteLicense = (hwid: string, data: any) => Promise.resolve();
export const deleteRemoteLicense = (hwid: string) => Promise.resolve();
