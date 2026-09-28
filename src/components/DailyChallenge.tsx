import React, { useState, useEffect } from 'react';
import { DailyChallenge as IDailyChallenge, UserProfile, Badge } from '../types';
import { DAILY_CHALLENGES, INITIAL_BADGES, getTodayDateString, advanceToNextSimulatedDay, resetSimulatedDate, getSimulatedDateOffset, getStoredDailyChallenges } from '../utils/storage';
import { useSound } from '../context/SoundContext';
import { fireDailySuccessConfetti, fireBadgeUnlockConfetti } from '../utils/confettiCelebration';
import { recordSolvedChallengeInDb } from '../lib/samasmDatabase';

import { 
  Sparkles, 
  Lightbulb, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  Calendar, 
  RotateCcw, 
  Trophy, 
  ArrowRight,
  Flame,
  Zap,
  HelpCircle,
  Award,
  X
} from 'lucide-react';

interface DailyChallengeProps {
  activeProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenBadgesTab: () => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  activeProfile,
  onUpdateProfile,
  onOpenBadgesTab,
}) => {
  const isGirl = activeProfile.gender === 'girl';
  const todayStr = getTodayDateString();
  const simulatedOffset = getSimulatedDateOffset();
  const { playClick, playPop, playChime, playBadgeUnlock, playSuccessWhistle, playPointsEarned, playTryAgain } = useSound();

  // Select today's challenge based on date hash or offset
  const todayDateObj = new Date(todayStr);
  const dayOfYear = Math.floor(
    (todayDateObj.getTime() - new Date(todayDateObj.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const allChallenges = getStoredDailyChallenges();
  const challengeIndex = Math.abs(dayOfYear % (allChallenges.length || 1));
  const currentChallenge: IDailyChallenge = allChallenges[challengeIndex] || DAILY_CHALLENGES[0];

  // State
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [celebratedBadge, setCelebratedBadge] = useState<Badge | null>(null);

  // Is today's challenge already locked / solved?
  const isLockedToday = activeProfile.lastSolvedDate === todayStr;

  // Countdown timer to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();
      if (diffMs <= 0) {
        setCountdown('00:00:00');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const format = (num: number) => String(num).padStart(2, '0');
      setCountdown(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [todayStr]);

  // Handle Answer Verification
  const handleVerifyAnswer = () => {
    if (!selectedOptionId) return;

    if (selectedOptionId === currentChallenge.correctOptionId) {
      // Correct! Play cheerful chime, points cascade sound, and trigger celebratory confetti
      playChime();
      playPointsEarned();
      fireDailySuccessConfetti();

      let addedPoints = currentChallenge.points;
      const newSolvedCount = activeProfile.solvedChallengesCount + 1;
      const updatedBadgeIds = [...activeProfile.unlockedBadgeIds];
      const categories = new Set(activeProfile.solvedCategories || []);
      categories.add(currentChallenge.category);

      let newlyUnlockedBadges: string[] = [];

      // 1. شرارة الفضول الأولى (+10 نقاط)
      if (!updatedBadgeIds.includes('curiosity_spark')) {
        updatedBadgeIds.push('curiosity_spark');
        newlyUnlockedBadges.push('curiosity_spark');
        addedPoints += 10;
      }

      // 2. رتبة المستكشف الذكي (+15 نقطة)
      if (activeProfile.points + addedPoints >= 50 && !updatedBadgeIds.includes('smart_explorer')) {
        updatedBadgeIds.push('smart_explorer');
        newlyUnlockedBadges.push('smart_explorer');
        addedPoints += 15;
      }

      // 3. بطل الالتزام والاستمرار اليومي (+20 نقطة)
      if (newSolvedCount >= 2 && !updatedBadgeIds.includes('daily_streak')) {
        updatedBadgeIds.push('daily_streak');
        newlyUnlockedBadges.push('daily_streak');
        addedPoints += 20;
      }

      // 4. مستكشف العوالم المتعددة (+20 نقطة)
      if (categories.size >= 3 && !updatedBadgeIds.includes('multiverse_explorer')) {
        updatedBadgeIds.push('multiverse_explorer');
        newlyUnlockedBadges.push('multiverse_explorer');
        addedPoints += 20;
      }

      // 5. المحاول المثابر الذي لا يستسلم (+15 نقطة)
      if ((showHint || (activeProfile.retryCount && activeProfile.retryCount > 0)) && !updatedBadgeIds.includes('persistent_thinker')) {
        updatedBadgeIds.push('persistent_thinker');
        newlyUnlockedBadges.push('persistent_thinker');
        addedPoints += 15;
      }

      // 6. متسائل الصباح الباكر (+15 نقطة)
      const currentHour = new Date().getHours();
      if (currentHour < 13 && !updatedBadgeIds.includes('early_bird')) {
        updatedBadgeIds.push('early_bird');
        newlyUnlockedBadges.push('early_bird');
        addedPoints += 15;
      }

      // 7. حارس أسرار النكهات الخمس (+25 نقطة)
      if ((newSolvedCount >= 5 || currentChallenge.id === 'day-7') && !updatedBadgeIds.includes('five_flavors')) {
        updatedBadgeIds.push('five_flavors');
        newlyUnlockedBadges.push('five_flavors');
        addedPoints += 25;
      }

      // 8. رتبة العالم الصغير (+30 نقطة)
      if (activeProfile.points + addedPoints >= 150 && !updatedBadgeIds.includes('junior_scientist')) {
        updatedBadgeIds.push('junior_scientist');
        newlyUnlockedBadges.push('junior_scientist');
        addedPoints += 30;
      }

      // 9. المحقق العلمي العبقري (+25 نقطة)
      if ((currentChallenge.id === 'day-6' || currentChallenge.badgeRewardId === 'physics_detective') && !updatedBadgeIds.includes('physics_detective')) {
        updatedBadgeIds.push('physics_detective');
        newlyUnlockedBadges.push('physics_detective');
        addedPoints += 25;
      }

      // 10. وسام بروفيسور سماسم (+50 نقطة)
      if (activeProfile.points + addedPoints >= 250 && !updatedBadgeIds.includes('professor_grand')) {
        updatedBadgeIds.push('professor_grand');
        newlyUnlockedBadges.push('professor_grand');
        addedPoints += 50;
      }

      if (newlyUnlockedBadges.length > 0) {
        const foundBadge = INITIAL_BADGES.find((b) => b.id === newlyUnlockedBadges[0]);
        setTimeout(() => {
          playBadgeUnlock();
          playSuccessWhistle();
          fireBadgeUnlockConfetti();
          if (foundBadge) {
            setCelebratedBadge(foundBadge);
          }
        }, 600);
      }

      const updatedProfile: UserProfile = {
        ...activeProfile,
        points: activeProfile.points + addedPoints,
        unlockedBadgeIds: updatedBadgeIds,
        lastSolvedDate: todayStr,
        solvedChallengesCount: newSolvedCount,
        solvedCategories: Array.from(categories),
        retryCount: 0,
      };

      // 1. تحديث البروفايل محلياً
      onUpdateProfile(updatedProfile);

      // 2. تسجيل حل التحدي في Supabase
      recordSolvedChallengeInDb(activeProfile.id, currentChallenge.id, addedPoints);

      setFeedback({
        isCorrect: true,
        message: isGirl
          ? 'إجابة مذهلة وصحيحة 100%! أنتِ بطلة خارقة في سماسم! 🎉'
          : 'إجابة مذهلة وصحيحة 100%! أنت بطل خارق في سماسم! 🎉',
      });

    } else {
      // Incorrect
      playTryAgain();
      onUpdateProfile({
        ...activeProfile,
        retryCount: (activeProfile.retryCount || 0) + 1,
      });
      setFeedback({
        isCorrect: false,
        message: isGirl
          ? 'محاولة طيبة يا بطلتنا! فكّري مجدداً أو استعيني بتلميح سماسم الذكي 💡'
          : 'محاولة طيبة يا بطلنا! فكّر مجدداً أو استعن بتلميح سماسم الذكي 💡',
      });
    }
  };

  // Simulation handler for parents/evaluators
  const handleSimulateNextDay = () => {
    playClick();
    advanceToNextSimulatedDay();
    setSelectedOptionId(null);
    setFeedback(null);
    setShowHint(false);
  };

  const handleResetSimulation = () => {
    playClick();
    resetSimulatedDate();
    setSelectedOptionId(null);
    setFeedback(null);
    setShowHint(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner - Bright, Joyful, Warm */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-pink-500 via-rose-400 to-amber-400 p-6 sm:p-8 text-white shadow-xl border-2 border-pink-300">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/25 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-yellow-200/40 blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-right space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/95 px-4 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-xs flex-wrap">
              <Calendar className="w-4 h-4 text-pink-600" />
              <span>تحدي اليوم: {todayStr}</span>
              <span className="text-pink-300">|</span>
              <span className="text-pink-800 font-mono font-black">كود الطفل: {activeProfile.packCode}</span>
              {simulatedOffset > 0 && (
                <span className="bg-amber-300 text-slate-900 px-2 py-0.5 rounded text-[11px] font-black">
                  (محاكاة +{simulatedOffset} يوم)
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-xs">
              {isGirl ? `أهلاً بكِ يا بطلتنا ${activeProfile.name}! 🌟` : `أهلاً بك يا بطلنا ${activeProfile.name}! 🌟`}
            </h1>
            
            <p className="text-sm sm:text-base font-extrabold text-white max-w-xl leading-relaxed">
              في سماسم نؤمن بأن <span className="font-black text-yellow-100 underline decoration-yellow-300">"كل سؤال… بداية اكتشاف"</span>. فهل أنت مستعد لاكتشاف سر اليوم وجمع نقاط المعرفة؟
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-md shrink-0">
            <div className="text-center">
              <p className="text-xs text-slate-700 font-extrabold">رصيد الذكاء</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                <span>{activeProfile.points}</span>
              </p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-slate-700 font-extrabold">التحديات المنجزة</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span>{activeProfile.solvedChallengesCount}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Challenge Section */}
      {isLockedToday ? (
        /* LOCKED STATE (Time Lock) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-300 dark:border-emerald-500/50 p-6 sm:p-8 shadow-xl text-center space-y-6 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-r from-emerald-400 via-teal-300 to-amber-300" />
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-4xl shadow-inner">
            <CheckCircle2 className="w-12 h-12 stroke-[3]" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              {isGirl ? 'أحسنتِ يا بطلتنا العبقرية! 🎉' : 'أحسنت يا بطلنا العبقري! 🎉'}
            </h2>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              لقد نجحت في حل تحدي اليوم وحصلت على النقاط! نظام الأمان في سماسم يفتح لك مغامرة جديدة كل يوم لاكتشاف معلومة علمية مدهشة.
            </p>
          </div>

          {/* Time Lock Countdown Box */}
          <div className="max-w-md mx-auto bg-pink-50/80 dark:bg-slate-800/80 p-5 rounded-2xl border-2 border-pink-200 dark:border-slate-700 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-sm font-black">
              <Clock className="w-4 h-4 text-pink-600 dark:text-pink-400 animate-spin" />
              <span>الوقت المتبقي حتى التحدي القادم:</span>
            </div>
            <span className="font-mono text-3xl sm:text-4xl font-black text-pink-600 dark:text-pink-400 tracking-wider">
              {countdown}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
              تحديات سماسم تتجدد يومياً في تمام الساعة 12:00 منتصف الليل
            </span>
          </div>

          {/* Solved Question Recap */}
          <div className="max-w-xl mx-auto text-right bg-amber-50/90 dark:bg-slate-800/90 p-5 rounded-2xl border-2 border-amber-200 dark:border-amber-700/60 space-y-3">
            <div className="flex items-center gap-2 text-pink-800 dark:text-pink-300 font-black text-base">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>مراجعة اكتشاف اليوم: {currentChallenge.title}</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed">
              {currentChallenge.question}
            </p>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-slate-100 space-y-2">
              <p className="font-black text-emerald-800 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                💡 التفسير العلمي المبسط:
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentChallenge.explanation}
              </p>
              <div className="pt-2 border-t border-amber-100 dark:border-slate-800 text-amber-900 dark:text-amber-300 font-extrabold text-sm flex items-center gap-1.5">
                🌟 {currentChallenge.funFact}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                playClick();
                onOpenBadgesTab();
              }}
              className="px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-md shadow-amber-400/25 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-900" />
              <span>عرض أوسمتي وشهادة التقدير</span>
            </button>

            {/* Simulation button for evaluators/parents */}
            <button
              onClick={handleSimulateNextDay}
              className="px-5 py-3.5 rounded-2xl border-2 border-dashed border-pink-400 hover:bg-pink-100/70 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 text-pink-700 dark:text-pink-300 font-black text-sm flex items-center gap-2 transition-colors cursor-pointer"
              title="محاكاة قدوم اليوم التالي لاختبار سؤال جديد فوراً دون الانتظار"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>محاكاة يوم جديد (لتجربة التحدي التالي)</span>
            </button>

            {simulatedOffset > 0 && (
              <button
                onClick={handleResetSimulation}
                className="px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-black text-sm flex items-center gap-1.5 cursor-pointer"
                title="إعادة التاريخ إلى اليوم الفعلي"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة ضبط التاريخ</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ACTIVE UNLOCKED CHALLENGE */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-pink-300 dark:border-indigo-900 p-6 sm:p-8 shadow-xl space-y-6 relative transition-colors">
          
          {/* Question Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-pink-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black shadow-2xs ${currentChallenge.categoryColor}`}>
                {currentChallenge.category}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-black">
                تحدي رقم {currentChallenge.dayIndex}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-950 dark:text-amber-200 font-black text-sm bg-amber-100 dark:bg-amber-950/70 px-3.5 py-1.5 rounded-full border-2 border-amber-300 dark:border-amber-700 shadow-2xs">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>+{currentChallenge.points} نقطة</span>
              </div>
              <div className="flex items-center gap-1 text-pink-900 dark:text-pink-300 text-xs font-black bg-pink-100 dark:bg-pink-950/70 px-3 py-1.5 rounded-full border border-pink-200 dark:border-pink-800">
                <Clock className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>سؤال اليوم</span>
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0 text-2xl font-black shadow-md shadow-pink-500/25 mt-1">
                ❓
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 dark:text-white leading-relaxed">
                  {currentChallenge.question}
                </h2>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-1.5 font-bold">
                  اختر الإجابة التي تراها صحيحة ثم اضغط على زر التحقق لمعرفة النتيجة!
                </p>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              {currentChallenge.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const letter = ['أ', 'ب', 'ج', 'د'][idx] || '';

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playPop();
                      setSelectedOptionId(opt.id);
                      setFeedback(null);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-right transition-all duration-200 flex items-center gap-4 relative group cursor-pointer ${
                      isSelected
                        ? 'border-pink-500 dark:border-pink-400 bg-pink-100 dark:bg-pink-950/80 text-pink-950 dark:text-pink-100 shadow-md shadow-pink-500/20 scale-101 ring-3 ring-pink-400'
                        : 'border-pink-200 dark:border-slate-700 hover:border-pink-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800 hover:bg-pink-50/70 dark:hover:bg-slate-700/80 text-slate-950 dark:text-white shadow-xs'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl font-black text-base flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                      isSelected
                        ? 'bg-pink-500 text-white'
                        : 'bg-pink-50 dark:bg-slate-700 text-pink-800 dark:text-pink-300 border-2 border-pink-200 dark:border-slate-600 group-hover:bg-pink-200'
                    }`}>
                      {letter}
                    </div>
                    <span className="font-extrabold text-base sm:text-lg leading-relaxed flex-1 text-slate-950 dark:text-slate-100">
                      {opt.text}
                    </span>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs shrink-0">
                        <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hint Section & Verification Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
            <button
              type="button"
              onClick={() => {
                playClick();
                setShowHint(!showHint);
              }}
              className="text-sm font-black text-amber-900 dark:text-amber-200 hover:text-amber-950 flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/80 border-2 border-amber-300 dark:border-amber-700/80 transition-colors shadow-2xs cursor-pointer"
            >
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500" />
              <span>{showHint ? 'إخفاء التلميح' : 'أريد تلميحاً من سماسم 💡'}</span>
            </button>

            {/* Submit Verification Button */}
            <button
              type="button"
              disabled={!selectedOptionId}
              onClick={handleVerifyAnswer}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base shadow-md transition-all flex items-center justify-center gap-2 ${
                selectedOptionId
                  ? 'bg-linear-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>تحقق من الإجابة يا سماسم!</span>
            </button>
          </div>

          {/* Hint Box */}
          {showHint && (
            <div className="bg-amber-100/90 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-700 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
              <span className="text-2xl">💡</span>
              <div className="space-y-1 text-sm sm:text-base text-amber-950 dark:text-amber-100 font-bold">
                <p className="font-black text-amber-900 dark:text-amber-300">تلميح ذكي من سماسم:</p>
                <p>{currentChallenge.hint}</p>
              </div>
            </div>
          )}

          {/* Feedback Message */}
          {feedback && (
            <div className={`p-5 rounded-2xl border-2 flex items-start gap-3.5 animate-in fade-in duration-200 ${
              feedback.isCorrect
                ? 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-100/90 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100'
            }`}>
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-black text-base sm:text-lg">{feedback.message}</p>
                {!feedback.isCorrect && (
                  <p className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                    لا تقلق، يمكنك المحاولة مجدداً حتى تكتشف الإجابة الصحيحة!
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Brand Educational Philosophy Banner */}
      <div className="bg-pink-50/90 dark:bg-slate-800/90 p-5 rounded-3xl border-2 border-pink-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-xs shrink-0">
            🧠
          </div>
          <div>
            <h4 className="font-black text-slate-950 dark:text-white text-base">
              لماذا نسأل كل يوم سؤالاً جديداً؟
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold mt-0.5">
              الأسئلة اليومية تنمي الفضول العلمي وتدرب عقلك ليفكر مثل العلماء والمكتشفين الكبار!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            onOpenBadgesTab();
          }}
          className="text-xs sm:text-sm font-black text-pink-700 dark:text-pink-400 hover:text-pink-800 flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>شاهد الأوسمة والشهادات</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      </div>

      {/* Celebratory Badge Unlock Modal */}
      {celebratedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setCelebratedBadge(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-4 border-amber-300 dark:border-amber-500 relative text-center space-y-5 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                playClick();
                setCelebratedBadge(null);
              }}
              className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Sparkle Header */}
            <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-4 py-1.5 rounded-full text-xs font-black text-amber-950 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>إنجاز علمي جديد في سماسم!</span>
            </div>

            {/* Bouncing Badge Icon */}
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-linear-to-br from-amber-300 via-yellow-200 to-amber-400 p-1 shadow-xl flex items-center justify-center animate-bounce">
              <div className="w-full h-full bg-amber-50 dark:bg-slate-800 rounded-[22px] flex items-center justify-center text-5xl">
                {celebratedBadge.icon}
              </div>
              <span className="absolute -bottom-2 bg-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                +{celebratedBadge.points} نقطة
              </span>
            </div>

            {/* Title & Name */}
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                {isGirl ? 'مبارك يا بطلتنا المكتشفة! 🎉' : 'مبارك يا بطلنا المكتشف! 🎉'}
              </h3>
              <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                وسام: {celebratedBadge.name}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                {celebratedBadge.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  playBadgeUnlock();
                  playSuccessWhistle();
                  fireBadgeUnlockConfetti();
                }}
                className="w-full py-3 rounded-2xl bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>🎺</span>
                <span>سماع صفارة النجاح واحتفال إضافي 🎉</span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  setCelebratedBadge(null);
                  onOpenBadgesTab();
                }}
                className="w-full py-3.5 rounded-2xl bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>عرض وسامي في لوحة الشرف 🏆</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};