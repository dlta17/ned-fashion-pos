
export interface Variant {
  id: string;
  color?: string;
  material?: string;
  size?: string;
  stock: number;
}

export enum TransactionType {
  SALE = 'SALE',
  RENTAL = 'RENTAL',
  SERVICE = 'SERVICE',
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  stock: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice?: number;
  rentalPricePerDay?: number;
  transactionType: TransactionType;
  variants: Variant[];
  serialNumbers?: string[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  transactionType: TransactionType;
  rentalDays?: number;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  EWALLET = 'EWALLET',
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  date: string;
  cashier: string;
}

export enum RepairStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED'
}

export interface Repair {
  id: string;
  customerName: string;
  deviceModel: string;
  serialNumber: string;
  issueDescription: string;
  status: RepairStatus;
  receivedDate: string;
}

export enum Role {
    Designer = 'Designer',
    Owner = 'Owner',
    Admin = 'Admin',
    Sales = 'Sales',
    Maintenance = 'Maintenance',
}

export interface User {
    id: string;
    username: string;
    role: Role;
    password?: string;
}

export enum SubscriptionPlan {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    LIFETIME = 'LIFETIME'
}

export interface RemoteLicenseRecord {
    hwid: string;
    clientName: string;
    status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
    plan: SubscriptionPlan;
    price: number;
    activationDate: string;
    expiryDate: string;
    lastSeen: string;
    version: string;
    warningMessage?: string;
}

export interface Notification {
  id: string;
  type: 'low-stock' | 'system-warning';
  message: string | { key: string; params: Record<string, string | number> };
  productId: string;
  productName: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
    enableInApp: boolean;
}

export interface StoreSettings {
    name: string;
    ownerName?: string;
    phone: string;
    registrationNumber: string;
    logoUrl: string;
    footerText: string;
    taxRate?: number;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email?: string;
    address?: string;
}

export interface PurchaseItem {
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
}

export interface Purchase {
    id: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    totalCost: number;
    date: string;
    notes?: string;
}

export interface TranscriptEntry {
    id: number;
    speaker: 'user' | 'model';
    text: string;
}
