

import { Product, Sale, Repair, RepairStatus, User, Role, PaymentMethod, Notification, TransactionType, Supplier } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Slim Fit Men Suit',
    barcode: '100100100',
    category: 'Suits',
    brand: 'Zara',
    stock: 15,
    reorderPoint: 3,
    costPrice: 100,
    sellingPrice: 250,
    transactionType: TransactionType.SALE,
    variants: [
      { id: 'v1', color: 'Navy Blue', size: '48', stock: 5 },
      { id: 'v2', color: 'Navy Blue', size: '50', stock: 5 },
      { id: 'v3', color: 'Black', size: '52', stock: 5 },
    ],
    serialNumbers: [],
  },
  {
    id: 'prod-002',
    name: 'Summer Floral Dress',
    barcode: '200200200',
    category: 'Dresses',
    brand: 'H&M',
    stock: 40,
    reorderPoint: 5,
    costPrice: 20,
    sellingPrice: 65,
    transactionType: TransactionType.SALE,
    variants: [
        { id: 'v4', color: 'Red', size: 'S', stock: 10 },
        { id: 'v5', color: 'Red', size: 'M', stock: 20 },
        { id: 'v6', color: 'Blue', size: 'S', stock: 10 },
    ],
  },
  {
    id: 'prod-003',
    name: 'Tuxedo Rental',
    barcode: '300300300',
    category: 'Rental',
    brand: 'Armani',
    stock: 8,
    reorderPoint: 2,
    costPrice: 300,
    rentalPricePerDay: 40,
    transactionType: TransactionType.RENTAL,
    variants: [
        { id: 'v7', color: 'Black', size: '50', stock: 4 },
        { id: 'v8', color: 'Black', size: '52', stock: 4 },
    ],
    serialNumbers: ['TUX-001', 'TUX-002', 'TUX-003'],
  },
  {
    id: 'prod-004',
    name: 'Cotton Chino Pants',
    barcode: '400400400',
    category: 'Pants',
    brand: 'Gap',
    stock: 50,
    reorderPoint: 10,
    costPrice: 15,
    sellingPrice: 45,
    transactionType: TransactionType.SALE,
    variants: [],
  },
   {
    id: 'prod-005',
    name: 'Classic White Shirt',
    barcode: '500500500',
    category: 'Shirts',
    brand: 'Ralph Lauren',
    stock: 25,
    reorderPoint: 5,
    costPrice: 35,
    sellingPrice: 85,
    transactionType: TransactionType.SALE,
    variants: [],
  },
  {
    id: 'prod-006',
    name: 'Alteration: Hemming',
    barcode: 'SERV-001',
    category: 'Services',
    brand: 'House',
    stock: 9999,
    reorderPoint: 0,
    costPrice: 0,
    sellingPrice: 15,
    transactionType: TransactionType.SERVICE,
    variants: [],
  }
];

export const mockSales: Sale[] = [
  { 
    id: 'sale-001', 
    items: [{ productId: 'prod-001', productName: 'Slim Fit Men Suit', quantity: 1, price: 250, transactionType: TransactionType.SALE }],
    subtotal: 250, discount: 0, tax: 37.5, total: 287.5,
    paymentMethod: PaymentMethod.CARD,
    date: new Date('2023-10-27T10:00:00Z').toISOString(), 
    cashier: 'Ahmed' 
  },
  { 
    id: 'sale-002', 
    items: [{ productId: 'prod-002', productName: 'Summer Floral Dress', quantity: 1, price: 65, transactionType: TransactionType.SALE }],
    subtotal: 65, discount: 0, tax: 9.75, total: 74.75,
    paymentMethod: PaymentMethod.CASH,
    date: new Date('2023-10-27T11:30:00Z').toISOString(), 
    cashier: 'Fatima' 
  },
  { 
    id: 'sale-003', 
    items: [{ productId: 'prod-003', productName: 'Tuxedo Rental', quantity: 1, price: 40, transactionType: TransactionType.RENTAL, rentalDays: 3 }],
    subtotal: 120, discount: 0, tax: 18, total: 138,
    paymentMethod: PaymentMethod.CASH,
    date: new Date('2023-10-26T15:00:00Z').toISOString(), 
    cashier: 'Ahmed' 
  },
];


export const mockRepairs: Repair[] = [
    {
        id: 'job-001',
        customerName: 'Mohammed Ali',
        deviceModel: 'Men Suit Jacket',
        serialNumber: 'Blue / Size 50',
        issueDescription: 'Shorten sleeves by 2cm',
        status: RepairStatus.READY,
        receivedDate: new Date('2023-10-25T09:00:00Z').toISOString(),
    },
    {
        id: 'job-002',
        customerName: 'Sara Ibrahim',
        deviceModel: 'Evening Dress',
        serialNumber: 'Red Silk',
        issueDescription: 'Take in waist, fix zipper',
        status: RepairStatus.IN_PROGRESS,
        receivedDate: new Date('2023-10-26T14:00:00Z').toISOString(),
    },
    {
        id: 'job-003',
        customerName: 'Youssef Hassan',
        deviceModel: 'Jeans',
        serialNumber: 'Levis 501',
        issueDescription: 'Hemming / Shortening',
        status: RepairStatus.PENDING,
        receivedDate: new Date('2023-10-27T11:00:00Z').toISOString(),
    },
    {
        id: 'job-004',
        customerName: 'Aisha Omar',
        deviceModel: 'Leather Jacket',
        serialNumber: 'Black',
        issueDescription: 'Repair tear in lining',
        status: RepairStatus.COMPLETED,
        receivedDate: new Date('2023-10-20T16:30:00Z').toISOString(),
    }
];

export const mockSuppliers: Supplier[] = [
    { id: 'sup-1', name: 'Al-Amal Textiles', contactPerson: 'Mahmoud', phone: '0100000000', email: 'info@alamal.com', address: 'Cairo' },
    { id: 'sup-2', name: 'Fashion House Wholesale', contactPerson: 'Sarah', phone: '0122222222', address: 'Alexandria' }
];

// Mock users with passwords for demonstration
export const mockUsers = [
    { id: 'user-1', username: 'admin', password: 'admin123', role: Role.Admin },
    { id: 'user-2', username: 'sales', password: 'sales123', role: Role.Sales },
    { id: 'user-3', username: 'tailor', password: '123', role: Role.Maintenance },
];

export const mockNotifications: Notification[] = [];
