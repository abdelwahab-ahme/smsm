import React, { useState, useEffect } from 'react';
import { verifyAdminEmail, verifyAdminPin, getStoredAdminEmail } from '../utils/storage';
import { useSound } from '../context/SoundContext';
import { ShieldAlert, Lock, Eye, EyeOff, X, KeyRound, AlertCircle, CheckCircle, Mail, ArrowRight } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const { playClick, playTryAgain, playSuccessWhistle } = useSound();

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setIsEmailVerified(false);
      setEmailError('');
      setPin('');
      setPinError('');
      setShowPin(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Verify Email
  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailError('يرجى إدخال البريد الإلكتروني للمسؤول');
      setIsEmailVerified(false);
      playTryAgain();
      return;
    }

    if (verifyAdminEmail(cleanEmail)) {
      // Authorized admin email recognized!
      setIsEmailVerified(true);
      setEmailError('');
      setPinError('');
      playClick();
    } else {
      // Fake or unauthorized email entered!
      // Must say "صلاحيتك لا تسمح" and DO NOT show password input!
      setIsEmailVerified(false);
      setEmailError('صلاحيتك لا تسمح! هذا البريد غير مصرح له بالوصول للوحة الإدارة.');
      playTryAgain();
    }
  };

  // Step 2: Verify Password / Master Key
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) return;

    if (!pin.trim()) {
      setPinError('يرجى إدخال كلمة مرور أو رمز الأدمن السري');
      playTryAgain();
      return;
    }

    if (verifyAdminPin(pin.trim())) {
      setPinError('');
      playSuccessWhistle();
      onSuccess();
    } else {
      setPinError('رمز المرور السري غير صحيح! تأكد من الرمز وحاول مجدداً.');
      playTryAgain();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-red-500/80 dark:border-red-900/90 relative overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Strip */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-r from-red-600 via-rose-600 to-purple-700" />

        {/* Close Button */}
        <button
          onClick={() => {
            playClick();
            onClose();
          }}
          className="absolute top-4 left-4 p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="text-center mt-2 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/80 border-2 border-red-300 dark:border-red-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="inline-block px-3 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-black text-[11px] mb-1.5 border border-red-300 dark:border-red-800">
            🔒 منطقة محظورة: Admin Only
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            التحقق من هوية مدير النظام
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            لوحة الإدارة خاصة بمدير النظام فقط. لا يمكن الدخول إلا بإيميل الأدمن المعتمد.
          </p>
        </div>

        {/* STEP 1: Admin Email Input */}
        <form onSubmit={handleCheckEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5 text-right flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span>البريد الإلكتروني للأدمن:</span>
              </span>
              {isEmailVerified && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>تم التحقق من الصلاحية</span>
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="email"
                value={email}
                disabled={isEmailVerified}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  setIsEmailVerified(false);
                }}
                placeholder="أدخل إيميل مدير النظام..."
                autoFocus={!isEmailVerified}
                dir="ltr"
                className={`w-full px-4 py-3 rounded-2xl border-2 bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-hidden font-bold text-sm text-left transition-colors ${
                  isEmailVerified
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
                    : emailError
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 dark:border-slate-700 focus:border-red-500'
                }`}
              />
            </div>

            {/* Quick Helper Hint with Default Master Email */}
            {!isEmailVerified && (
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 text-right">
                💡 البريد المعتمد للمدير: <span className="font-mono text-purple-700 dark:text-purple-400 font-bold">{getStoredAdminEmail()}</span>
              </p>
            )}
          </div>

          {/* Email Verification Error Message */}
          {emailError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-black flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div className="text-right leading-relaxed">
                <p className="font-black text-sm">{emailError}</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-bold mt-0.5">
                  تم حجب إمكانية إدخال كلمة المرور لحماية النظام.
                </p>
              </div>
            </div>
          )}

          {/* If email not verified yet, show Verify Email Button */}
          {!isEmailVerified && (
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-md shadow-red-600/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>التحقق من صلاحية البريد</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          )}
        </form>

        {/* STEP 2: Password / PIN input — ONLY APPEARS WHEN EMAIL IS VERIFIED! */}
        {isEmailVerified ? (
          <form onSubmit={handlePinSubmit} className="mt-4 pt-4 border-t-2 border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>تم التعرف عليك كمدير للنظام!</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsEmailVerified(false);
                  setPin('');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white underline font-bold cursor-pointer"
              >
                تغيير البريد
              </button>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5 text-right flex items-center justify-between">
                <span>أدخل كلمة المرور / رمز الأمان السري:</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                  PIN
                </span>
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="رمز الأمان السري..."
                  maxLength={20}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-red-500 focus:ring-2 focus:ring-red-300 text-center font-mono font-black text-xl tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  title={showPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 text-right flex items-center gap-1">
                <span>🔑</span>
                <span>الرمز الافتراضي: <strong className="font-mono text-purple-700 dark:text-purple-400 font-black">7701</strong></span>
              </p>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-black flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-red-600 via-purple-700 to-indigo-700 hover:from-red-700 hover:to-indigo-800 text-white font-black text-sm shadow-md shadow-red-600/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>تسجيل الدخول وفتح لوحة الإدارة</span>
            </button>
          </form>
        ) : null}

      </div>
    </div>
  );
};
