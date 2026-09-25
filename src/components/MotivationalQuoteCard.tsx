import React, { useState, useEffect } from 'react';
import { UserProfile, MotivationalQuote } from '../types';
import { getRandomMotivationalQuote, formatMotivationalQuote } from '../utils/motivationalQuotes';
import { useSound } from '../context/SoundContext';
import { Sparkles, Dices, ChevronDown, ChevronUp, Quote, Heart } from 'lucide-react';

interface MotivationalQuoteCardProps {
  activeProfile: UserProfile | null;
  currentTab: 'challenge' | 'badges' | 'lab' | 'games' | 'admin';
}

export const MotivationalQuoteCard: React.FC<MotivationalQuoteCardProps> = ({
  activeProfile,
  currentTab,
}) => {
  const [quote, setQuote] = useState<MotivationalQuote>(() => getRandomMotivationalQuote());
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { playSparkle, playPop } = useSound();

  // Change quote automatically whenever the active tab switches OR active profile changes
  useEffect(() => {
    const newQuote = getRandomMotivationalQuote(quote?.id);
    setQuote(newQuote);
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentTab, activeProfile?.id, activeProfile?.gender]);

  const handleNextQuote = () => {
    playSparkle();
    setIsAnimating(true);
    const next = getRandomMotivationalQuote(quote.id);
    setQuote(next);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const formatted = formatMotivationalQuote(quote, activeProfile);

  return (
    <div className="mb-6 select-none transition-all duration-300">
      <div
        className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 shadow-md ${
          isMinimized
            ? 'p-3.5 bg-amber-50/90 dark:bg-slate-900/90 border-amber-200 dark:border-amber-700/60'
            : 'p-5 sm:p-6 bg-linear-to-r from-amber-50 via-pink-50/60 to-yellow-50/70 dark:from-slate-900/90 dark:via-indigo-950/80 dark:to-slate-900/90 border-amber-300 dark:border-amber-500/50'
        }`}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {isMinimized ? (
          // Minimized Compact View
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0 animate-bounce">{quote.icon}</span>
              <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 truncate">
                <span className="text-pink-600 dark:text-pink-400 font-extrabold ml-1">
                  [{quote.tag}]:
                </span>
                {formatted.text}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleNextQuote}
                className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
                title="رسالة تحفيزية أخرى"
                aria-label="رسالة أخرى"
              >
                <Dices className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setIsMinimized(false);
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="توسيع الرسالة"
                aria-label="توسيع"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Full Inspiring View
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Left/Main Column: Quote & Tag */}
            <div className="flex items-start gap-3.5 sm:gap-4 flex-1">
              {/* Animated Icon Avatar */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-200 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-600 text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-sm animate-float mt-0.5">
                {quote.icon}
              </div>

              {/* Message Content */}
              <div className="space-y-1.5 flex-1">
                {/* Meta Tag Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-linear-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-900 animate-spin" />
                    <span>رسالة سماسم التحفيزية</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-pink-100 dark:bg-pink-950/70 border border-pink-200 dark:border-pink-800/80 text-pink-900 dark:text-pink-300 font-extrabold text-[11px]">
                    <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                    <span>{quote.tag}</span>
                  </span>

                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                    • {quote.category}
                  </span>
                </div>

                {/* Main Personalized Quote Text */}
                <div
                  className={`transition-all duration-300 ${
                    isAnimating ? 'opacity-40 scale-98 translate-y-1' : 'opacity-100 scale-100 translate-y-0'
                  }`}
                >
                  <p className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-relaxed flex items-baseline gap-1.5">
                    <Quote className="w-4 h-4 text-amber-500 shrink-0 rotate-180 inline" />
                    <span>{formatted.text}</span>
                  </p>

                  {/* Sub-advice / encouragement */}
                  <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 mt-1 flex items-center gap-1.5">
                    <span>💡 نصيحة للمستكشفين:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{quote.advice}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Actions */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-amber-200/60 dark:border-slate-800 w-full md:w-auto justify-between md:justify-end">
              <button
                type="button"
                onClick={handleNextQuote}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border-2 border-amber-300 dark:border-slate-700 text-amber-950 dark:text-amber-200 font-black text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="عرض اقتباس تحفيزي آخر"
              >
                <Dices className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>رسالة أخرى 🎲</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  setIsMinimized(true);
                }}
                className="p-2 rounded-2xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                title="تصغير الرسالة"
                aria-label="تصغير"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
