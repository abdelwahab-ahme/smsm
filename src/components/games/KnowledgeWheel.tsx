import React, { useState, useRef } from 'react';
import { UserProfile, QuestionCategory, BankQuestion } from '../../types';
import { getSmartBankQuestion } from '../../data/questionBank';
import { useSound } from '../../context/SoundContext';
import { fireDailySuccessConfetti, fireBadgeUnlockConfetti } from '../../utils/confettiCelebration';
import { 
  Dices, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Award, 
  ChevronRight,
  HelpCircle,
  Trophy
} from 'lucide-react';

interface KnowledgeWheelProps {
  activeProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenBadgesTab?: () => void;
}

interface Sector {
  id: QuestionCategory | 'bonus';
  label: string;
  icon: string;
  color: string;
  accent: string;
}

const SECTORS: Sector[] = [
  { id: 'science', label: 'علوم', icon: '🔬', color: '#10b981', accent: '#059669' },
  { id: 'space', label: 'فضاء', icon: '🚀', color: '#6366f1', accent: '#4f46e5' },
  { id: 'math', label: 'رياضيات', icon: '🔢', color: '#f59e0b', accent: '#d97706' },
  { id: 'logic', label: 'منطق وذكاء', icon: '🧩', color: '#a855f7', accent: '#9333ea' },
  { id: 'bonus', label: 'صندوق المفاجأة 2x', icon: '🌟', color: '#ec4899', accent: '#db2777' },
];

export const KnowledgeWheel: React.FC<KnowledgeWheelProps> = ({
  activeProfile,
  onUpdateProfile,
  onOpenBadgesTab,
}) => {
  const isGirl = activeProfile.gender === 'girl';
  const { playClick, playPop, playChime, playPointsEarned, playSuccessWhistle, playTryAgain, playBadgeUnlock } = useSound();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<BankQuestion | null>(null);
  const [isBonusMultiplier, setIsBonusMultiplier] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);

  const numSectors = SECTORS.length;
  const sectorAngle = 360 / numSectors;

  // Spin the wheel
  const handleSpin = () => {
    if (isSpinning) return;

    playClick();
    setIsSpinning(true);
    setSelectedSector(null);
    setActiveQuestion(null);
    setSelectedOptionId(null);
    setShowHint(false);
    setAnswerFeedback(null);
    setUnlockedBadge(null);

    // Random sector pick
    const targetSectorIndex = Math.floor(Math.random() * numSectors);
    const chosenSector = SECTORS[targetSectorIndex];

    // Calculate rotation with multiple full spins (5 to 8 rotations)
    const extraRotations = 360 * (5 + Math.floor(Math.random() * 3));
    // SVG wheel points at top (pointer at top is 270 deg or 90 deg)
    const targetOffset = targetSectorIndex * sectorAngle + sectorAngle / 2;
    const finalAngle = rotationAngle + extraRotations + (360 - (targetOffset % 360));

    setRotationAngle(finalAngle);

    // Audio click cadence while spinning
    const interval = setInterval(() => {
      playPop();
    }, 280);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      setSelectedSector(chosenSector);
      playSuccessWhistle();

      // Determine category question
      const isBonus = chosenSector.id === 'bonus';
      setIsBonusMultiplier(isBonus);

      const targetCategory: QuestionCategory = isBonus
        ? (['science', 'space', 'math', 'logic'][Math.floor(Math.random() * 4)] as QuestionCategory)
        : (chosenSector.id as QuestionCategory);

      const { question } = getSmartBankQuestion(
        targetCategory,
        activeProfile.solvedBankQuestionIds || []
      );

      setActiveQuestion(question);
    }, 3800);
  };

  // Submit Answer
  const handleVerifyAnswer = () => {
    if (!activeQuestion || !selectedOptionId) return;

    const isCorrect = selectedOptionId === activeQuestion.correctOptionId;

    if (isCorrect) {
      playChime();
      playPointsEarned();
      fireDailySuccessConfetti();

      const multiplier = isBonusMultiplier ? 2 : 1;
      const pointsWon = activeQuestion.points * multiplier;

      const solvedList = activeProfile.solvedBankQuestionIds || [];
      const updatedSolved = solvedList.includes(activeQuestion.id)
        ? solvedList
        : [...solvedList, activeQuestion.id];

      const currentSpins = (activeProfile.wheelSpinsCount || 0) + 1;
      const updatedBadgeIds = [...activeProfile.unlockedBadgeIds];
      let newBadgeAwarded: string | null = null;

      // Wheel Master Badge (3 wheel challenges solved)
      if (currentSpins >= 3 && !updatedBadgeIds.includes('wheel_master')) {
        updatedBadgeIds.push('wheel_master');
        newBadgeAwarded = 'فارس عجلة المعرفة';
      }

      // Quiz Bank Conqueror (10 questions solved)
      if (updatedSolved.length >= 10 && !updatedBadgeIds.includes('quiz_bank_conqueror')) {
        updatedBadgeIds.push('quiz_bank_conqueror');
        newBadgeAwarded = 'قاهر بنك الأسئلة الذكي';
      }

      const updatedProfile: UserProfile = {
        ...activeProfile,
        points: activeProfile.points + pointsWon,
        unlockedBadgeIds: updatedBadgeIds,
        solvedBankQuestionIds: updatedSolved,
        wheelSpinsCount: currentSpins,
      };

      onUpdateProfile(updatedProfile);

      setAnswerFeedback({
        isCorrect: true,
        message: isGirl
          ? `رائعة وذكية 100%! فزتِ بـ +${pointsWon} نقطة في رصيد المعرفة! 🎉`
          : `رائع وذكي 100%! فزت بـ +${pointsWon} نقطة في رصيد المعرفة! 🎉`,
      });

      if (newBadgeAwarded) {
        setUnlockedBadge(newBadgeAwarded);
        setTimeout(() => {
          playBadgeUnlock();
          fireBadgeUnlockConfetti();
        }, 500);
      }
    } else {
      playTryAgain();
      setAnswerFeedback({
        isCorrect: false,
        message: isGirl
          ? 'محاولة طيبة يا بطلتنا! فكّري واستعيني بالتلميح الذهبي 💡'
          : 'محاولة طيبة يا بطلنا! فكّر واستعن بالتلميح الذهبي 💡',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-fuchsia-300 dark:border-fuchsia-700/60 shadow-lg relative overflow-hidden select-none">
      
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fuchsia-100 dark:border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500 text-white flex items-center justify-center text-2xl shadow-xs">
            🎡
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <span>عجلة المعرفة العشوائية</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-900 dark:text-fuchsia-300 font-extrabold border border-fuchsia-300">
                تحدي الحظ والذكاء 🎯
              </span>
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              أدر العجلة الملونة وتحدَّ نفسك في قطاع عشوائي مع فرصة لمضاعفة النقاط!
            </p>
          </div>
        </div>

        {/* Spins counter */}
        <div className="flex items-center gap-2 bg-fuchsia-50 dark:bg-slate-800 border border-fuchsia-300 dark:border-fuchsia-800 px-4 py-2 rounded-2xl">
          <Trophy className="w-5 h-5 text-fuchsia-500" />
          <div className="text-right">
            <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">تحديات العجلة المكتملة</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {activeProfile.wheelSpinsCount || 0} جولات
            </div>
          </div>
        </div>
      </div>

      {/* Wheel Area & Controls */}
      <div className="flex flex-col items-center justify-center py-4">
        
        {/* Pointer Arrow */}
        <div className="relative z-20 -mb-4 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-md animate-bounce" />
        </div>

        {/* The SVG Spinning Wheel - Responsive sizing */}
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72">
          <svg
            className="w-full h-full rounded-full shadow-2xl border-4 border-white dark:border-slate-800 transition-transform duration-3800 ease-out"
            viewBox="0 0 100 100"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
            }}
          >
            {SECTORS.map((sector, index) => {
              const startAngle = (index * sectorAngle * Math.PI) / 180;
              const endAngle = (((index + 1) * sectorAngle) * Math.PI) / 180;
              const x1 = 50 + 50 * Math.cos(startAngle);
              const y1 = 50 + 50 * Math.sin(startAngle);
              const x2 = 50 + 50 * Math.cos(endAngle);
              const y2 = 50 + 50 * Math.sin(endAngle);

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
              const midAngle = ((index + 0.5) * sectorAngle * Math.PI) / 180;
              const textX = 50 + 32 * Math.cos(midAngle);
              const textY = 50 + 32 * Math.sin(midAngle);

              return (
                <g key={sector.id}>
                  <path d={pathData} fill={sector.color} stroke="#ffffff" strokeWidth="0.8" />
                  <text
                    x={textX}
                    y={textY}
                    fill="#ffffff"
                    fontSize="6"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${((index + 0.5) * sectorAngle) + 90}, ${textX}, ${textY})`}
                  >
                    {sector.icon}
                  </text>
                </g>
              );
            })}
            {/* Center Cap */}
            <circle cx="50" cy="50" r="11" fill="#1e1b4b" stroke="#ffffff" strokeWidth="1.5" />
            <text x="50" y="52" fill="#fbbf24" fontSize="7" textAnchor="middle" fontWeight="black">
              سماسم
            </text>
          </svg>
        </div>

        {/* Spin Button */}
        <div className="mt-6">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`px-8 py-3.5 rounded-2xl font-black text-base shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
              isSpinning
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-linear-to-r from-fuchsia-500 via-pink-500 to-amber-500 hover:opacity-95 text-white shadow-fuchsia-500/25'
            }`}
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'العجلة تدور الآن...' : 'أدر عجلة المعرفة 🎡'}</span>
          </button>
        </div>
      </div>

      {/* Selected Sector & Drawn Question */}
      {selectedSector && activeQuestion && (
        <div className="mt-8 pt-6 border-t-2 border-fuchsia-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Sector Highlight Banner */}
          <div className="p-4 rounded-2xl bg-fuchsia-50 dark:bg-slate-800/80 border-2 border-fuchsia-300 dark:border-fuchsia-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{selectedSector.icon}</span>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">وقفت العجلة على:</span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  قطاع {selectedSector.label}
                </h4>
              </div>
            </div>

            {isBonusMultiplier && (
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs animate-bounce shadow-md">
                مكافأة مضاعفة 2X 🌟
              </span>
            )}
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-fuchsia-700 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-950 px-3 py-1 rounded-full">
                {activeQuestion.title}
              </span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                +{isBonusMultiplier ? activeQuestion.points * 2 : activeQuestion.points} نقطة
              </span>
            </div>

            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
              {activeQuestion.question}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {activeQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    playClick();
                    setSelectedOptionId(option.id);
                  }}
                  className={`p-4 rounded-2xl text-right font-extrabold text-sm border-2 transition-all cursor-pointer ${
                    selectedOptionId === option.id
                      ? 'bg-fuchsia-100 dark:bg-fuchsia-950 border-fuchsia-500 dark:border-fuchsia-400 text-fuchsia-950 dark:text-fuchsia-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-fuchsia-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>

            {/* Hint & Verify controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  playPop();
                  setShowHint(!showHint);
                }}
                className="text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{showHint ? 'إخفاء التلميح' : 'تلميح سماسم الذكي 💡'}</span>
              </button>

              <button
                onClick={handleVerifyAnswer}
                disabled={!selectedOptionId}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  selectedOptionId
                    ? 'bg-linear-to-r from-fuchsia-500 to-pink-500 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد الإجابة</span>
              </button>
            </div>

            {showHint && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
                <span>💡 تلميح:</span>
                <span>{activeQuestion.hint}</span>
              </div>
            )}
          </div>

          {/* Feedback */}
          {answerFeedback && (
            <div className={`p-5 rounded-2xl border-2 flex items-start gap-3 animate-in fade-in duration-200 ${
              answerFeedback.isCorrect
                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-950 dark:text-rose-100'
            }`}>
              {answerFeedback.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-black text-sm sm:text-base">{answerFeedback.message}</p>
                {answerFeedback.isCorrect && (
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 pt-1 space-y-1">
                    <p>🔬 {activeQuestion.explanation}</p>
                    <p className="text-amber-800 dark:text-amber-300">✨ {activeQuestion.funFact}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {unlockedBadge && (
            <div className="bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 rounded-2xl p-4 flex items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎡</span>
                <div>
                  <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                    🎉 مبارك! وسام جديد:
                  </div>
                  <div className="text-sm font-black text-amber-950 dark:text-white">
                    {unlockedBadge} (+25 نقطة)
                  </div>
                </div>
              </div>
              {onOpenBadgesTab && (
                <button
                  onClick={onOpenBadgesTab}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
                >
                  عرض الوسام
                </button>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
