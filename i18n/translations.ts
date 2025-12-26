
// @google/genai translations file
export const translations = {
  ar: {
    common: {
      appName: 'NED FASHION PRO',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      cancel: 'إلغاء',
      edit: 'تعديل',
      details: 'تفاصيل',
      all: 'الكل',
      day: 'يوم',
      days: 'أيام',
      or: 'أو',
      print: 'طباعة',
      delete: 'حذف',
      export: 'تصدير البيانات',
      licensedBy: 'مرخص ومحمي من NED AI LABS',
    },
    sidebar: {
      dashboard: 'لوحة التحكم',
      pos: 'نقاط البيع',
      inventory: 'المخزون',
      customers: 'العملاء',
      repairs: 'الخياطة والتعديلات',
      reports: 'التقارير والسجل',
      settings: 'الإعدادات',
      liveAssistant: 'المساعد الصوتي',
      logout: 'تسجيل الخروج',
    },
    customers: {
      title: 'العملاء',
      addCustomer: 'إضافة عميل جديد',
      exportList: 'تصدير قائمة العملاء (CSV)',
      searchPlaceholder: 'ابحث باسم العميل أو رقم الجوال...',
      metrics: {
        visits: 'عدد الزيارات',
        totalSpent: 'إجمالي المشتريات',
        vip: 'عميل مميز 👑',
      },
      tabs: {
        info: 'البيانات والمقاسات',
        history: 'سجل المشتريات',
      }
    },
    reports: {
      title: 'التقارير والسجل',
      tabs: {
        sales: 'سجل المبيعات',
        customers: 'تحليل العملاء',
      },
      customerRanking: 'ترتيب العملاء حسب الإنفاق',
      topSpending: 'الأكثر إنفاقاً',
      visitCount: 'عدد المبيعات',
      lastVisit: 'آخر زيارة',
    },
    login: {
      title: 'NED FASHION PRO - تسجيل الدخول',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      loginButton: 'تسجيل الدخول',
      loggingIn: 'جاري الدخول...',
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    },
    dashboard: {
      title: 'لوحة التحكم',
      welcome: 'مرحباً، {{user}} في {{store}}',
      dailySales: 'مبيعات اليوم',
      itemsSoldToday: 'القطع المباعة اليوم',
      totalCustomers: 'إجمالي العملاء',
      pendingRepairs: 'طلبات خياطة معلقة',
      weeklySales: 'مبيعات هذا الأسبوع',
      sales: 'المبيعات',
      topSelling: 'الأكثر مبيعاً',
      quantitySold: 'الكمية المباعة',
      errors: {
        loadFailed: 'فشل تحميل بيانات لوحة التحكم.',
      },
    },
    inventory: {
      title: 'إدارة الملابس والمخزون',
      addProduct: 'إضافة صنف',
      editProduct: 'تعديل الصنف',
      searchPlaceholder: 'ابحث بالاسم, الباركود, الماركة...',
      table: {
        product: 'القطعة',
        category: 'القسم',
        stock: 'المخزون',
        price: 'السعر',
        status: 'الحالة',
        type: 'النوع',
      },
      status: {
        inStock: 'متوفر',
        lowStock: 'مخزون منخفض',
        outOfStock: 'نفذ المخزون',
      },
      errors: {
        saveFailed: 'فشل حفظ المنتج!',
      },
    },
    productForm: {
      name: 'اسم القطعة',
      barcode: 'الباركود',
      category: 'القسم (رجال/نساء/أطفال)',
      brand: 'الماركة',
      stock: 'الكمية الإجمالية',
      reorderPoint: 'حد إعادة الطلب',
      costPrice: 'التكلفة',
      sellingPrice: 'سعر البيع',
      rentalPricePerDay: 'سعر الإيجار لليوم',
      transactionType: 'نوع المعاملة',
      variants: {
          title: 'المقاسات والألوان',
          color: 'اللون',
          size: 'المقاس',
          material: 'الخامة',
          stock: 'العدد',
          add: 'إضافة خيار',
          empty: 'لم يتم إضافة مقاسات'
      }
    },
    repairs: {
      title: 'قسم الخياطة',
      newDevice: 'استلام طلب تعديل',
      confirmPrint: 'تم التسجيل بنجاح. طباعة تذكرة الاستلام؟',
      confirmPrintTicket: 'طباعة تذكرة للعميل {{customer}}؟',
      actions: {
          start: 'بدء العمل',
          finish: 'إنهاء العمل',
          deliver: 'تسليم للعميل',
      },
      print: {
          receipt: 'إيصال استلام (صيانة)',
          delivery: 'إيصال تسليم للعميل',
          general: 'تذكرة متابعة',
      },
      errors: {
          fetchFailed: 'فشل تحميل قائمة الطلبات.',
          updateFailed: 'فشل تحديث الحالة.'
      },
      empty: 'لا توجد طلبات خياطة حالياً.',
      table: {
        customerDevice: 'العميل / القطعة',
        issue: 'التعديل المطلوب',
        receivedDate: 'تاريخ الاستلام',
        status: 'الحالة',
        action: 'الإجراء',
      },
      form: {
          customerName: 'اسم العميل',
          deviceModel: 'نوع القطعة (قميص، فستان...)',
          serialNumber: 'كود / لون / علامة مميزة',
          issue: 'تفاصيل التعديل (تضييق، تقصير...)'
      }
    },
    pos: {
      searchPlaceholder: 'ابحث عن منتج...',
      stock: 'متاح',
      invoiceTitle: 'فاتورة بيع',
      cartEmpty: 'السلة فارغة',
      subtotal: 'المجموع',
      tax: 'الضريبة',
      total: 'الإجمالي',
      pay: 'دفع',
      payment: {
        title: 'إتمام الدفع',
        totalAmount: 'المطلوب',
        amountReceived: 'المدفوع',
        changeDue: 'الباقي',
        processing: 'تنفيذ...',
        confirmCash: 'دفع نقدي',
        payByCard: 'دفع شبكة/فيزا',
      },
      rental: {
        enterDuration: 'مدة الإيجار',
        rentalDays: 'عدد الأيام',
      },
      notifications: {
        saleSuccess: 'تمت العملية بنجاح!',
      },
      errors: {
        userNotLoggedIn: 'يجب تسجيل الدخول.',
        saleFailedGeneric: 'فشلت العملية.',
        notEnoughStock: 'الكمية غير متوفرة لـ {{productName}}',
      },
    },
    settings: {
        title: 'الإعدادات',
        tabs: {
            general: 'عام',
            notifications: 'تنبيهات',
            license: 'الترخيص',
            users: 'المستخدمين'
        },
        general: {
            title: 'بيانات المتجر',
            storeName: 'اسم المحل',
            phone: 'رقم الهاتف',
            registration: 'السجل التجاري/الضريبي',
            logoUrl: 'رابط الشعار',
            uploadLogo: 'رفع شعار',
            footer: 'ملاحظات الفاتورة',
            taxRate: 'الضريبة (%)',
        },
        notifications: {
            title: 'إعدادات التنبيهات',
            inApp: {
                label: 'تنبيه عند نقص المقاسات/الألوان',
                description: 'تنبيه عند وصول المخزون للحد الأدنى.',
            },
        },
        users: {
            title: 'إدارة المستخدمين',
            addUser: 'إضافة مستخدم',
            editUser: 'تعديل مستخدم',
            username: 'اسم الدخول',
            password: 'كلمة السر',
            passwordHint: 'اتركه فارغاً لعدم التغيير',
            role: 'الوظيفة',
            actions: 'تحكم',
            confirmDelete: 'حذف المستخدم؟'
        },
        license: {
            title: 'الترخيص',
            status: 'الحالة',
            activated: 'نسخة مفعلة',
            trial: 'نسخة تجريبية',
            daysLeft: 'أيام متبقية',
            hwId: 'معرف الجهاز',
            encryption: 'التشفير: نشط',
            enterKey: 'مفتاح التفعيل',
            activate: 'تفعيل',
            success: 'تم التفعيل!',
            failure: 'كود خاطئ.'
        }
    },
    notifications: {
        title: 'الإشعارات',
        markAllAsRead: 'مقروء',
        noNotifications: 'لا توجد إشعارات.',
        lowStock: 'كمية "{{productName}}" قاربت على الانتهاء. المتبقي: {{stock}}.',
    },
    liveAssistant: {
        title: 'المساعد الذكي',
        status: {
            idle: 'جاهز',
            connecting: 'اتصال...',
            connected: 'متصل',
            error: 'خطأ'
        },
        start: 'تحدث الآن',
        stop: 'توقف',
        initialPrompt: 'تحدث مع المساعد الذكي للاستفسار عن المخزون أو المبيعات.',
        systemInstruction: 'أنت مساعد ذكي لمحل ملابس. ساعد في معرفة المقاسات والألوان المتاحة.',
        errors: {
            unsupportedBrowser: 'المتصفح غير مدعوم.',
            connectionError: 'خطأ اتصال: {{message}}',
            startFailed: 'فشل البدء: {{message}}',
        }
    },
    protectedRoute: {
        unauthorized: 'ممنوع الدخول',
        noPermission: 'ليس لديك صلاحية.',
    },
    enums: {
      paymentMethod: {
        CASH: 'نقدًا',
        CARD: 'بطاقة',
        EWALLET: 'محفظة',
      },
      repairStatus: {
        PENDING: 'انتظار',
        IN_PROGRESS: 'جاري العمل',
        READY: 'جاهز',
        COMPLETED: 'تم التسليم',
      },
      transactionType: {
        SALE: 'بيع',
        RENTAL: 'إيجار',
        SERVICE: 'خدمة'
      },
      roles: {
          Designer: 'المصمم',
          Owner: 'المالك',
          Admin: 'مدير',
          Sales: 'مبيعات',
          Maintenance: 'خياط/ترزي'
      }
    },
  },
  en: {
    common: {
      appName: 'NED FASHION PRO',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      edit: 'Edit',
      details: 'Details',
      all: 'All',
      day: 'day',
      days: 'days',
      or: 'Or',
      print: 'Print',
      delete: 'Delete',
      export: 'Export Data',
      licensedBy: 'Licensed & Protected by NED AI LABS',
    },
    sidebar: {
      dashboard: 'Dashboard',
      pos: 'POS',
      inventory: 'Inventory',
      customers: 'Customers',
      repairs: 'Tailoring',
      reports: 'Reports',
      settings: 'Settings',
      liveAssistant: 'Live Assistant',
      logout: 'Logout',
    },
    customers: {
      title: 'Customers',
      addCustomer: 'Add New Customer',
      exportList: 'Export Customers (CSV)',
      searchPlaceholder: 'Search by name or phone...',
      metrics: {
        visits: 'Visits',
        totalSpent: 'Total Spent',
        vip: 'VIP Customer 👑',
      },
      tabs: {
        info: 'Info & Sizes',
        history: 'Sales History',
      }
    },
    reports: {
      title: 'Reports & History',
      tabs: {
        sales: 'Sales Log',
        customers: 'Customer Analytics',
      },
      customerRanking: 'Customer Spending Ranking',
      topSpending: 'Top Spending',
      visitCount: 'Sales Count',
      lastVisit: 'Last Visit',
    },
    login: {
      title: 'NED FASHION PRO - Login',
      username: 'Username',
      password: 'Password',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      error: 'Invalid username or password.',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome, {{user}} to {{store}}',
      dailySales: "Today's Sales",
      itemsSoldToday: 'Items Sold',
      totalCustomers: 'Total Customers',
      pendingRepairs: 'Pending Jobs',
      weeklySales: 'Weekly Sales',
      sales: 'Sales',
      topSelling: 'Top Products',
      quantitySold: 'Qty Sold',
      errors: {
        loadFailed: 'Failed to load data.',
      },
    },
    inventory: {
      title: 'Fashion Inventory',
      addProduct: 'Add Garment',
      editProduct: 'Edit Garment',
      searchPlaceholder: 'Search by name, barcode, brand...',
      table: {
        product: 'Garment',
        category: 'Category',
        stock: 'Stock',
        price: 'Price',
        status: 'Status',
        type: 'Type',
      },
      status: {
        inStock: 'In Stock',
        lowStock: 'Low Stock',
        outOfStock: 'Out of Stock',
      },
      errors: {
        saveFailed: 'Failed to save item!',
      },
    },
    productForm: {
      name: 'Item Name',
      barcode: 'Barcode',
      category: 'Category',
      brand: 'Brand',
      stock: 'Total Stock',
      reorderPoint: 'Reorder Point',
      costPrice: 'Cost',
      sellingPrice: 'Price',
      rentalPricePerDay: 'Rental Price/Day',
      transactionType: 'Type',
      variants: {
          title: 'Variants (Size/Color)',
          color: 'Color',
          size: 'Size',
          material: 'Material',
          stock: 'Stock',
          add: 'Add Variant',
          empty: 'No variants added.'
      }
    },
    repairs: {
      title: 'Tailoring & Alterations',
      newDevice: 'New Order',
      confirmPrint: 'Registered. Print ticket?',
      confirmPrintTicket: 'Print ticket for {{customer}}?',
      actions: {
          start: 'Start Work',
          finish: 'Finish Work',
          deliver: 'Deliver',
      },
      print: {
          receipt: 'REPAIR RECEIPT',
          delivery: 'DELIVERY NOTE',
          general: 'TAILORING TICKET',
      },
      errors: {
          fetchFailed: 'Failed to load jobs.',
          updateFailed: 'Failed to update status.'
      },
      empty: 'No active jobs.',
      table: {
        customerDevice: 'Customer / Garment',
        issue: 'Alteration',
        receivedDate: 'Date',
        status: 'Status',
        action: 'Action',
      },
      form: {
          customerName: 'Customer Name',
          deviceModel: 'Garment Type (e.g. Shirt)',
          serialNumber: 'Tag / Color',
          issue: 'Alteration Instructions'
      }
    },
    pos: {
      searchPlaceholder: 'Search items...',
      stock: 'Stock',
      invoiceTitle: 'Invoice',
      cartEmpty: 'Empty Cart',
      subtotal: 'Subtotal',
      tax: 'Tax',
      total: 'Total',
      pay: 'Pay',
      payment: {
        title: 'Payment',
        totalAmount: 'Total',
        amountReceived: 'Received',
        changeDue: 'Change',
        processing: 'Processing...',
        confirmCash: 'Cash',
        payByCard: 'Card',
      },
      rental: {
        enterDuration: 'Duration',
        rentalDays: 'Days',
      },
      notifications: {
        saleSuccess: 'Sold!',
      },
      errors: {
        userNotLoggedIn: 'Login required.',
        saleFailedGeneric: 'Failed.',
        notEnoughStock: 'No stock for {{productName}}',
      },
    },
    settings: {
        title: 'Settings',
        tabs: {
            general: 'General',
            notifications: 'Notifications',
            license: 'License',
            users: 'Users'
        },
        general: {
            title: 'Store Info',
            storeName: 'Store Name',
            phone: 'Phone',
            registration: 'Reg. No.',
            logoUrl: 'Logo URL',
            uploadLogo: 'Upload Logo',
            footer: 'Invoice Footer',
            taxRate: 'Tax (%)',
        },
        notifications: {
            title: 'Alerts',
            inApp: {
                label: 'Low stock alerts',
                description: 'Alert when sizes/colors run low.',
            },
        },
        users: {
            title: 'Users',
            addUser: 'Add User',
            editUser: 'Edit User',
            username: 'Username',
            password: 'Password',
            passwordHint: 'Leave blank to keep',
            role: 'Role',
            actions: 'Actions',
            confirmDelete: 'Delete user?'
        },
        license: {
            title: 'License',
            status: 'Status',
            activated: 'Activated',
            trial: 'Trial',
            daysLeft: 'Days Left',
            hwId: 'Hardware ID',
            encryption: 'Secure',
            enterKey: 'Enter Key',
            activate: 'Activate',
            success: 'Activated!',
            failure: 'Invalid Key.'
        }
    },
    notifications: {
        title: 'Notifications',
        markAllAsRead: 'Mark read',
        noNotifications: 'No notifications.',
        lowStock: 'Low stock for "{{productName}}". Left: {{stock}}.',
    },
    liveAssistant: {
        title: 'Live Assistant',
        status: {
            idle: 'Idle',
            connecting: 'Connecting...',
            connected: 'Connected',
            error: 'Error'
        },
        start: 'Start',
        stop: 'Stop',
        initialPrompt: 'Start conversation to ask about inventory.',
        systemInstruction: 'You are a fashion store assistant. Help with sizes, colors, and stock.',
        errors: {
            unsupportedBrowser: 'Not supported.',
            connectionError: 'Error: {{message}}',
            startFailed: 'Failed: {{message}}',
        }
    },
    protectedRoute: {
        unauthorized: 'Unauthorized',
        noPermission: 'No permission.',
    },
    enums: {
      paymentMethod: {
        CASH: 'Cash',
        CARD: 'Card',
        EWALLET: 'E-Wallet',
      },
      repairStatus: {
        PENDING: 'Pending',
        IN_PROGRESS: 'In Work',
        READY: 'Ready',
        COMPLETED: 'Picked Up',
      },
      transactionType: {
        SALE: 'Sale',
        RENTAL: 'Rental',
        SERVICE: 'Service'
      },
      roles: {
          Designer: 'Designer',
          Owner: 'Owner',
          Admin: 'Manager',
          Sales: 'Sales',
          Maintenance: 'Tailor'
      }
    },
  },
  fr: {
     common: { appName: 'NED FASHION PRO', save: 'Enregistrer', cancel: 'Annuler', print: 'Imprimer', licensedBy: 'NED AI LABS', day: 'jour', days: 'jours', all: 'Tout', edit: 'Modifier', details: 'Détails', or: 'Ou', delete: 'Supprimer', saving: 'Enregistrement...', generate: 'Générer' },
     sidebar: { dashboard: 'Tableau de bord', pos: 'Caisse', inventory: 'Stock', repairs: 'Couture', reports: 'Rapports', settings: 'Paramètres', logout: 'Déconnexion', liveAssistant: 'Assistant' },
     repairs: { 
         title: 'Atelier Couture', 
         newDevice: 'Nouvelle commande', 
         table: { customerDevice: 'Client / Vêtement', issue: 'Retouche' },
         print: { receipt: 'REÇU DE DÉPÔT', delivery: 'BON DE LIVRAISON', general: 'TICKET' }
     }
  },
   es: {
     common: { appName: 'NED FASHION PRO', save: 'Guardar', cancel: 'Cancelar', print: 'Imprimir', licensedBy: 'NED AI LABS', day: 'día', days: 'días', all: 'Todo', edit: 'Editar', details: 'Detalles', or: 'O', delete: 'Eliminar', saving: 'Guardando...', generate: 'Generar' },
     sidebar: { dashboard: 'Tablero', pos: 'Caja', inventory: 'Inventario', repairs: 'Costura', reports: 'Informes', settings: 'Ajustes', logout: 'Salir', liveAssistant: 'Asistente' },
     repairs: { 
         title: 'Taller de Costura', 
         newDevice: 'Nuevo pedido', 
         table: { customerDevice: 'Cliente / Prenda', issue: 'Arreglo' },
         print: { receipt: 'RECIBO', delivery: 'NOTA DE ENTREGA', general: 'TICKET' }
     }
  },
  de: {
     common: { appName: 'NED FASHION PRO', save: 'Speichern', cancel: 'Abbrechen', print: 'Drucken', licensedBy: 'NED AI LABS', day: 'Tag', days: 'Tage', all: 'Alle', edit: 'Bearbeiten', details: 'Details', or: 'Oder', delete: 'Löschen', saving: 'Speichern...', generate: 'Generieren' },
     sidebar: { dashboard: 'Dashboard', pos: 'Kasse', inventory: 'Lager', repairs: 'Schneiderei', reports: 'Berichte', settings: 'Einstellungen', logout: 'Abmelden', liveAssistant: 'Assistent' },
     repairs: { 
         title: 'Schneiderei', 
         newDevice: 'Neuer Auftrag', 
         table: { customerDevice: 'Kunde / Kleidungsstück', issue: 'Äندرung' },
         print: { receipt: 'QUITTUNG', delivery: 'LIEFERSCHEIN', general: 'TICKET' }
     }
  }
};
