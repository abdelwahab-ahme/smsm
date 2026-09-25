import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useSound } from '../context/SoundContext';
import { fireDailySuccessConfetti } from '../utils/confettiCelebration';
import { 
  Volume2, 
  Volume1, 
  VolumeX, 
  Users, 
  Trophy, 
  Sparkles, 
  Shield, 
  Compass, 
  Award, 
  Sun, 
  Moon, 
  Sliders, 
  X, 
  Gamepad2, 
  FlaskConical,
  LogOut,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  activeProfile: UserProfile | null;
  onOpenProfileModal: () => void;
  currentTab: 'challenge' | 'badges' | 'lab' | 'games' | 'admin';
  onSelectTab: (tab: 'challenge' | 'badges' | 'lab' | 'games' | 'admin') => void;
  onRequestAdmin: () => void;
  onLogoutOrSwitchHero?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  showAdminButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfile,
  onOpenProfileModal,
  currentTab,
  onSelectTab,
  onRequestAdmin,
  onLogoutOrSwitchHero,
  isDarkMode,
  onToggleDarkMode,
  showAdminButton = false,
}) => {
  const isGirl = activeProfile?.gender === 'girl';
  const { isMuted, toggleSound, volume, setVolume, playClick, playSparkle, playSuccessWhistle } = useSound();
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Close volume popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setIsVolumeOpen(false);
      }
    };
    if (isVolumeOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isVolumeOpen]);

  const handleCheerConfetti = () => {
    playSparkle();
    fireDailySuccessConfetti();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b-2 border-pink-200 dark:border-indigo-900/80 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Brand & Mascot Logo */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" 
            onClick={() => {
              playClick();
              onSelectTab('challenge');
            }}
          >
            <div className="relative group shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-pink-400 via-rose-300 to-amber-300 p-0.5 shadow-md transform group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center p-1">
                  <img
                    src="/logo.png"
                    alt="شعار سماسم"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<span class="text-2xl">🍭</span>';
                      }
                    }}
                  />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                جديد!
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black bg-linear-to-r from-pink-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                  سماسم
                </span>
                <span className="hidden md:inline-block px-2.5 py-0.5 text-xs font-black rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-800 dark:text-pink-300 border border-pink-300 dark:border-pink-800 shadow-2xs">
                  غزل بنات.. بس بدماغ سماسم
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-extrabold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>كل سؤال… بداية اكتشاف</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet Lg) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            <button
              onClick={() => {
                playClick();
                onSelectTab('challenge');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs xl:text-sm transition-all duration-200 cursor-pointer ${
                currentTab === 'challenge'
                  ? 'bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-105'
                  : 'text-slate-700 dark:text-slate-200 hover:text-pink-700 dark:hover:text-pink-400 hover:bg-pink-50/80 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>التحدي اليومي</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onSelectTab('badges');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs xl:text-sm transition-all duration-200 cursor-pointer ${
                currentTab === 'badges'
                  ? 'bg-linear-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md shadow-amber-400/30 scale-105'
                  : 'text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>الأوسمة والشهادة</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onSelectTab('lab');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs xl:text-sm transition-all duration-200 cursor-pointer ${
                currentTab === 'lab'
                  ? 'bg-linear-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25 scale-105'
                  : 'text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-400 hover:bg-teal-50/80 dark:hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>المعمل العجيب 🔬</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onSelectTab('games');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs xl:text-sm transition-all duration-200 cursor-pointer ${
                currentTab === 'games'
                  ? 'bg-linear-to-r from-fuchsia-600 to-pink-500 text-white shadow-md shadow-fuchsia-500/25 scale-105'
                  : 'text-slate-700 dark:text-slate-200 hover:text-fuchsia-700 dark:hover:text-fuchsia-400 hover:bg-fuchsia-50/80 dark:hover:bg-slate-800'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>الألعاب والأسئلة 🎮</span>
            </button>
          </nav>

          {/* Right Controls: Points, Profile, DarkMode, Audio, Cheer, Admin */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Points pill */}
            {activeProfile && (
              <div
                onClick={() => {
                  playClick();
                  onSelectTab('badges');
                }}
                className="cursor-pointer flex items-center gap-1 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/80 border-2 border-amber-300 dark:border-amber-700/80 px-2 sm:px-2.5 py-1 rounded-2xl text-amber-950 dark:text-amber-200 font-black text-xs sm:text-sm shadow-xs hover:scale-105 transition-all"
                title="اضغط لعرض الأوسمة والشهادة"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-bounce" />
                <span>{activeProfile.points}</span>
                <span className="text-[10px] font-bold hidden sm:inline">نقطة</span>
              </div>
            )}

            {/* Profile Pill & Switcher */}
            {activeProfile ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playClick();
                    onOpenProfileModal();
                  }}
                  className="flex items-center gap-1.5 bg-pink-50 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-slate-700 border-2 border-pink-200 dark:border-slate-700 hover:border-pink-300 py-1 px-2 sm:px-2.5 rounded-2xl transition-all shadow-xs group cursor-pointer"
                  title="تبديل أو تعديل ملف البطل"
                >
                  <span className="text-xl sm:text-2xl">{activeProfile.avatar || (isGirl ? '👧' : '👦')}</span>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {activeProfile.name}
                    </p>
                    <p className="text-[10px] text-pink-800 dark:text-pink-300 font-bold font-mono">
                      {activeProfile.packCode}
                    </p>
                  </div>
                </button>

                {/* Logout / Switch Hero Shortcut */}
                {onLogoutOrSwitchHero && (
                  <button
                    onClick={() => {
                      playClick();
                      onLogoutOrSwitchHero();
                    }}
                    className="p-1.5 sm:p-2 rounded-2xl text-slate-500 hover:text-pink-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="تسجيل الخروج أو تبديل البطل"
                    aria-label="تسجيل الخروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  playClick();
                  onOpenProfileModal();
                }}
                className="flex items-center gap-1.5 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>دخول</span>
              </button>
            )}

            {/* Dark Mode Toggle Switch */}
            <button
              onClick={onToggleDarkMode}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border-2 font-black text-xs transition-all cursor-pointer select-none active:scale-95 ${
                isDarkMode
                  ? 'bg-indigo-950 text-amber-300 border-amber-400/80 hover:bg-indigo-900 shadow-xs'
                  : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 shadow-xs'
              }`}
              title={isDarkMode ? 'الوضع الحالي: ليلي. اضغط للنهاري ☀️' : 'الوضع الحالي: نهاري. اضغط لليلي 🌙'}
              aria-label="تبديل الوضع"
            >
              {isDarkMode ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-600" />}
            </button>

            {/* Volume Control Button & Popover */}
            <div className="relative" ref={volumeRef}>
              <button
                onClick={() => {
                  playClick();
                  setIsVolumeOpen((prev) => !prev);
                }}
                className={`p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer ${
                  isMuted || volume === 0
                    ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}
                title="التحكم بالصوت"
                aria-label="التحكم بالصوت"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : volume < 0.4 ? (
                  <Volume1 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>

              {/* Volume Popover Menu */}
              {isVolumeOpen && (
                <div 
                  className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-60 p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>مستوى الصوت والمؤثرات</span>
                    </span>
                    <button
                      onClick={() => setIsVolumeOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                      aria-label="إغلاق"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-slate-700 dark:text-slate-300">الشدة:</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        {isMuted ? 'مكتوم' : `${Math.round(volume * 100)}%`}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : Math.round(volume * 100)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) / 100;
                        setVolume(val);
                      }}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 my-3">
                    <button
                      onClick={toggleSound}
                      className={`py-1.5 rounded-xl text-[10px] font-black border ${
                        isMuted
                          ? 'bg-rose-500 text-white border-rose-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      كتم 🔇
                    </button>
                    <button
                      onClick={() => setVolume(0.3)}
                      className="py-1.5 rounded-xl text-[10px] font-black border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      30% 🔉
                    </button>
                    <button
                      onClick={() => setVolume(0.7)}
                      className="py-1.5 rounded-xl text-[10px] font-black border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      70% 🔊
                    </button>
                    <button
                      onClick={() => setVolume(1.0)}
                      className="py-1.5 rounded-xl text-[10px] font-black border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      100% 📢
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cheerful celebration sparkle */}
            <button
              onClick={handleCheerConfetti}
              className="p-1.5 sm:p-2 rounded-2xl text-amber-600 hover:bg-amber-100 dark:hover:bg-slate-800 border border-amber-200 dark:border-amber-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="فرحة واحتفال سماسم 🎉"
              aria-label="احتفال"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            </button>

            {/* Admin Protected Button - Only if showAdminButton is true */}
            {showAdminButton && (
              <button
                onClick={() => {
                  playClick();
                  onRequestAdmin();
                }}
                className={`p-1.5 sm:p-2 rounded-2xl transition-colors cursor-pointer border ${
                  currentTab === 'admin'
                    ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800'
                }`}
                title="لوحة تحكم مدير النظام (خاصة بالأدمن فقط 🔒)"
                aria-label="لوحة تحكم مدير النظام"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Bottom/Sub-Navbar (Visible below lg screens) */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t-2 border-pink-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95">
          <button
            onClick={() => {
              playClick();
              onSelectTab('challenge');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-black transition-colors ${
              currentTab === 'challenge'
                ? 'text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-slate-800'
                : 'text-slate-700 dark:text-slate-300 hover:text-pink-600'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>التحدي</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onSelectTab('badges');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-black transition-colors ${
              currentTab === 'badges'
                ? 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-slate-800'
                : 'text-slate-700 dark:text-slate-300 hover:text-amber-600'
            }`}
          >
            <Award className="w-5 h-5" />
            <span>الأوسمة</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onSelectTab('lab');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-black transition-colors ${
              currentTab === 'lab'
                ? 'text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-slate-800'
                : 'text-slate-700 dark:text-slate-300 hover:text-teal-600'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            <span>المعمل</span>
          </button>

          <button
            onClick={() => {
              playClick();
              onSelectTab('games');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-black transition-colors ${
              currentTab === 'games'
                ? 'text-fuchsia-700 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-slate-800'
                : 'text-slate-700 dark:text-slate-300 hover:text-fuchsia-600'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span>الألعاب</span>
          </button>

          {showAdminButton && (
            <button
              onClick={() => {
                playClick();
                onRequestAdmin();
              }}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-black transition-colors ${
                currentTab === 'admin'
                  ? 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-slate-800'
                  : 'text-slate-700 dark:text-slate-300 hover:text-purple-600'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>الأدمن</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
