
import { Sale, Product, StoreSettings, Repair } from '../types';

const formatCurrency = (amount: number, currencyCode: string, locale: string) => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
    }).format(amount);
};

const getPrintStyles = (isRtl: boolean) => `
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: #fff; direction: ${isRtl ? 'rtl' : 'ltr'}; color: #000; }
    .thermal { width: 48mm; margin: 0 auto; padding: 10px 0; font-size: 11px; line-height: 1.4; }
    .header { text-align: center; margin-bottom: 10px; }
    .logo { max-width: 60%; margin: 0 auto 5px auto; display: block; filter: grayscale(1); }
    .name { font-weight: 900; font-size: 1.4em; text-transform: uppercase; }
    .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
    .divider-bold { border-bottom: 2px solid #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .item-name { font-weight: bold; display: block; }
    .grand-total { font-size: 1.5em; font-weight: 900; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
    .footer { text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; }
    .thanks { font-weight: 900; font-size: 1.3em; display: block; margin-bottom: 5px; }
    .owner-section { margin-top: 15px; border: 1.5px solid #000; padding: 8px; font-weight: 900; font-size: 1.1em; background: #f0f0f0; }
    @media print { @page { size: 58mm auto; margin: 0; } }
`;

export const generateInvoiceHtml = (sale: Sale, settings: StoreSettings, type: string, currencyCode: string, locale: string) => {
    const isRtl = locale === 'ar';
    const itemsHtml = sale.items.map(item => `
        <div style="margin-bottom: 6px;">
            <span class="item-name">${item.productName}</span>
            <div class="row">
                <span>${item.quantity} × ${formatCurrency(item.price, currencyCode, locale)}</span>
                <span style="font-weight:900;">${formatCurrency(item.price * item.quantity, currencyCode, locale)}</span>
            </div>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html dir="${isRtl ? 'rtl' : 'ltr'}">
        <head><meta charset="UTF-8"><style>${getPrintStyles(isRtl)}</style></head>
        <body>
            <div class="thermal">
                <div class="header">
                    ${settings.logoUrl ? `<img src="${settings.logoUrl}" class="logo" />` : ''}
                    <div class="name">${settings.name}</div>
                    <div style="font-size:0.8em;">هاتف: ${settings.phone}</div>
                    <div class="divider"></div>
                    <div class="row" style="font-size:0.8em;">
                        <span>${new Date(sale.date).toLocaleDateString(locale)}</span>
                        <span>#${sale.id.slice(-6)}</span>
                    </div>
                </div>
                <div class="divider-bold"></div>
                ${itemsHtml}
                <div class="divider-bold"></div>
                <div class="total-section">
                    <div class="row"><span>المجموع:</span><span>${formatCurrency(sale.subtotal, currencyCode, locale)}</span></div>
                    ${sale.discount > 0 ? `<div class="row"><span>الخصم:</span><span>${formatCurrency(sale.discount, currencyCode, locale)}</span></div>` : ''}
                    <div class="row grand-total"><span>الإجمالي الصافي:</span><span>${formatCurrency(sale.total, currencyCode, locale)}</span></div>
                </div>
                <div class="footer">
                    <span class="thanks">شكراً لزيارتكم</span>
                    ${settings.ownerName ? `<div class="owner-section">بإدارة: ${settings.ownerName}</div>` : ''}
                    <div style="font-size:0.7em; margin-top:10px;">${settings.footerText}</div>
                    <div style="font-size:0.5em; opacity:0.5; margin-top:5px; font-family:monospace;">NED POS PRO - SECURED V3</div>
                </div>
            </div>
        </body>
        </html>
    `;
};

export const printInvoice = (sale: Sale, settings: StoreSettings, type: string, currency: string, locale: string) => {
    const html = generateInvoiceHtml(sale, settings, type, currency, locale);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(html);
    iframe.contentWindow?.document.close();
    iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
    };
};

export const openCashDrawer = () => { window.print(); };
export const printBarcodeLabel = (product: Product, settings: StoreSettings, locale: string, currency: string, qty: number) => { alert("جاري الطباعة..."); };
export const printRepairTicket = (repair: Repair, settings: StoreSettings, locale: string) => { alert("طباعة تذكرة صيانة..."); };
export const printReport = (data: any, settings: StoreSettings, locale: string, currency: string) => { alert("طباعة تقرير مبيعات..."); };
