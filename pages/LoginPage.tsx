
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CurrencySwitcher from '../components/CurrencySwitcher';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(t('login.error'));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-950 flex-col overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="absolute top-6 ltr:right-6 rtl:left-6 flex items-center gap-2">
        <CurrencySwitcher buttonClassName="text-slate-400 hover:text-white" />
        <LanguageSwitcher buttonClassName="text-slate-400 hover:text-white" />
      </div>

      <div className="w-full max-w-md p-10 space-y-8 bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              {t('login.title')}
            </h1>
            <p className="text-slate-500 font-bold mt-2">نظام نقاط البيع الموحد</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-2">اسم المستخدم</label>
            <input
              type="text"
              required
              className="w-full px-6 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white font-bold focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-2">كلمة المرور</label>
            <input
              type="password"
              required
              className="w-full px-6 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-2xl text-white font-bold focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-black text-center animate-shake">
                  {error}
              </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black shadow-xl hover:bg-indigo-50 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'دخول للنظام'}
          </button>
        </form>
      </div>
      
      <div className="mt-12 text-center relative z-10">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black">
            {t('common.licensedBy')}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
