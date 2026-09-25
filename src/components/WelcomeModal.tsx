import React, { useState, useEffect } from 'react';
import { useSound } from '../context/SoundContext';
import { fireDailySuccessConfetti } from '../utils/confettiCelebration';
import { Sparkles, Rocket, X, Star, Heart } from 'lucide-react';

interface WelcomeModalProps {
  onStartAdventure?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStartAdventure }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { playPop, playSuccessWhistle, playChime } = useSound();

  useEffect(() => {
    // Check if shown in current session
    const hasSeenWelcome = sessionStorage.getItem('samasm_welcome_seen_v2');
    if (!hasSeenWelcome) {
      // Small delay to allow the app to render smoothly before opening
      const timer = setTimeout(() => {
        setIsOpen(true);
        playPop();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    playSuccessWhistle();
    fireDailySuccessConfetti();
    setIsClosing(true);
    sessionStorage.setItem('samasm_welcome_seen_v2', 'true');

    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (onStartAdventure) {
        onStartAdventure();
      }
    }, 350);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-linear-to-b from-amber-50 via-pink-50/70 to-sky-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 dark:border-amber-500 shadow-2xl text-center select-none overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Decorative Floating Background Shapes */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 dark:text-slate-400 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Character / Mascot Logo */}
        <div className="relative inline-block mx-auto mb-4">
          <div className="absolute inset-0 bg-linear-to-tr from-amber-300 to-pink-300 dark:from-amber-500 dark:to-pink-500 rounded-full blur-xl opacity-60 scale-110 animate-pulse pointer-events-none" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-3 bg-white dark:bg-slate-800 border-4 border-amber-400 dark:border-amber-500 shadow-xl flex items-center justify-center mx-auto transform hover:rotate-3 transition-transform">
            <img
              src="/logo.png"
              alt="شخصية سماسم"
              className="w-full h-full object-contain filter drop-shadow-md"
              onError={(e) => {
                // Fallback emoji if image missing
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  const fallback = document.createElement('span');
                  fallback.className = 'text-5xl';
                  fallback.innerText = '🍭';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          {/* Badge icon */}
          <span className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg shadow-md border-2 border-white dark:border-slate-900 animate-bounce">
            ✨
          </span>
        </div>

        {/* Welcome Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-linear-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-xs mb-3">
          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          <span>مرحباً بك في عالم المعرفة والمرح!</span>
        </div>

        {/* Required Slogan & Message */}
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white leading-tight">
            كل سؤال… بداية اكتشاف
          </h2>
          <p className="text-base sm:text-lg font-black text-pink-600 dark:text-pink-400">
            جاهز لمغامرة النهاردة يا بطل؟
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed pt-1">
            استعد لحل تحديات اليوم، وجمع الأوسمة، وخوض ألعاب السرعة وعجلة المعرفة الممتعة! 🌟
          </p>
        </div>

        {/* Floating Mini Highlights */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-amber-200 dark:border-slate-700">
            <span className="text-xl">🎯</span>
            <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-0.5">تحدٍ يومي</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-pink-200 dark:border-slate-700">
            <span className="text-xl">🏆</span>
            <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-0.5">أوسمة شرف</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-sky-200 dark:border-slate-700">
            <span className="text-xl">🎡</span>
            <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-0.5">ألعاب وألغاز</div>
          </div>
        </div>

        {/* Primary Call to Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-amber-400 via-pink-500 to-yellow-400 hover:from-amber-500 hover:via-pink-600 hover:to-yellow-500 text-white font-black text-base sm:text-lg shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Rocket className="w-5 h-5 fill-white" />
          <span>ابدأ المغامرة الآن! 🚀</span>
        </button>

      </div>
    </div>
  );
};
