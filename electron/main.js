
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const createWindow = () => {
  const isDev = !app.isPackaged;

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'NED FASHION POS PRO',
    // إخفاء شريط القوائم العلوي للحصول على مظهر نظام POS احترافي
    autoHideMenuBar: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev
    },
    // أيقونة البرنامج
    icon: isDev 
      ? path.join(__dirname, '../public/vite.svg') 
      : path.join(__dirname, '../dist/vite.svg')
  });

  // حذف القائمة الافتراضية تماماً
  Menu.setApplicationMenu(null);

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    // تحميل الملف المبني من Vite
    win.loadFile(path.join(__dirname, '../dist/index.html')).catch(e => {
        console.error('Failed to load index.html', e);
    });
  }

  // لفتح البرنامج بملء الشاشة عند التشغيل (اختياري)
  // win.maximize();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
