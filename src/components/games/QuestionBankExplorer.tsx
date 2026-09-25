import React, { useState, useEffect } from 'react';
import { UserProfile, QuestionCategory, BankQuestion } from '../../types';
import { QUESTION_BANK, getSmartBankQuestion, getQuestionBankStats } from '../../data/questionBank';
import { useSound } from '../../context/SoundContext';
import { fireDailySuccessConfetti, fireBadgeUnlockConfetti } from '../../utils/confettiCelebration';
import { 
  Dices, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Award, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  RotateCcw,
  Check,
  Trophy
} from 'lucide-react';

interface QuestionBankExplorerProps {
  activeProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenBadgesTab?: () => void;
}

export const QuestionBankExplorer: React.FC<QuestionBankExplorerProps> = ({
  activeProfile,
  onUpdateProfile,
  onOpenBadgesTab,
}) => {
  const isGirl = activeProfile.gender === 'girl';
  const { playClick, playPop, playChime, playPointsEarned, playSuccessWhistle, playTryAgain, playBadgeUnlock } = useSound();

  const [activeCategory, setActiveCategory] = useState<QuestionCategory | 'all'>('all');
  const [currentQuestion, setCurrentQuestion] = useState<BankQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [answerFeedback, setAnswerFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isCategoryExhausted, setIsCategoryExhausted] = useState<boolean>(false);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);

  const solvedIds = activeProfile.solvedBankQuestionIds || [];
  const stats = getQuestionBankStats(solvedIds);
  const totalSolvedCount = solvedIds.length;
  const totalQuestionsCount = QUESTION_BANK.length;

  // Load a smart non-repeated question
  const loadNextQuestion = (category = activeCategory) => {
    playClick();
    setSelectedOptionId(null);
    setShowHint(false);
    setAnswerFeedback(null);
    setUnlockedBadge(null);

    const { question, isExhausted } = getSmartBankQuestion(category, solvedIds);
    setCurrentQuestion(question);
    setIsCategoryExhausted(isExhausted);
  };

  // Initial load or on category switch
  useEffect(() => {
    loadNextQuestion(activeCategory);
  }, [activeCategory]);

  // Handle Verify Answer
  const handleVerifyAnswer = () => {
    if (!currentQuestion || !selectedOptionId) return;

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

    if (isCorrect) {
      playChime();
      playPointsEarned();
      fireDailySuccessConfetti();

      const updatedSolved = solvedIds.includes(currentQuestion.id)
        ? solvedIds
        : [...solvedIds, currentQuestion.id];

      const updatedBadgeIds = [...activeProfile.unlockedBadgeIds];
      let newBadgeAwarded: string | null = null;

      // 10 questions solved badge
      if (updatedSolved.length >= 10 && !updatedBadgeIds.includes('quiz_bank_conqueror')) {
        updatedBadgeIds.push('quiz_bank_conqueror');
        newBadgeAwarded = 'قاهر بنك الأسئلة الذكي';
      }

      const updatedProfile: UserProfile = {
        ...activeProfile,
        points: activeProfile.points + currentQuestion.points,
        unlockedBadgeIds: updatedBadgeIds,
        solvedBankQuestionIds: updatedSolved,
      };

      onUpdateProfile(updatedProfile);

      setAnswerFeedback({
        isCorrect: true,
        message: isGirl
          ? `إجابة عبقرية وصحيحة 100%! فزتِ بـ +${currentQuestion.points} نقطة! 🎉`
          : `إجابة عبقرية وصحيحة 100%! فزت بـ +${currentQuestion.points} نقطة! 🎉`,
      });

      if (newBadgeAwarded) {
        setUnlockedBadge(newBadgeAwarded);
        setTimeout(() => {
          playBadgeUnlock();
          playSuccessWhistle();
          fireBadgeUnlockConfetti();
        }, 500);
      }
    } else {
      playTryAgain();
      setAnswerFeedback({
        isCorrect: false,
        message: isGirl
          ? 'محاولة طيبة يا بطلتنا! فكّري مجدداً أو استعيني بالتلميح الذهبي 💡'
          : 'محاولة طيبة يا بطلنا! فكّر مجدداً أو استعن بالتلميح الذهبي 💡',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 dark:border-indigo-800/60 shadow-lg relative overflow-hidden select-none space-y-6">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-xs">
            📚
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <span>بنك الأسئلة الضخم</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-extrabold border border-indigo-300">
                {totalQuestionsCount} سؤال علمي أصيل
              </span>
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              نظام اختيار عشوائي ذكي يمنع تكرار الأسئلة التي حللتها مسبقاً حتى تستكشف كافة العلوم!
            </p>
          </div>
        </div>

        {/* Global Solved Counter */}
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-800 px-4 py-2 rounded-2xl">
          <Trophy className="w-5 h-5 text-indigo-500" />
          <div className="text-right">
            <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">إجمالي الأسئلة المكتشفة</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {totalSolvedCount} من {totalQuestionsCount} سؤال
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer flex flex-col items-center gap-1 ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-102'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
          }`}
        >
          <span className="text-lg">🌟</span>
          <span>كل المجالات</span>
          <span className="text-[10px] opacity-80">{totalSolvedCount}/{totalQuestionsCount}</span>
        </button>

        <button
          onClick={() => setActiveCategory('science')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer flex flex-col items-center gap-1 ${
            activeCategory === 'science'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
          }`}
        >
          <span className="text-lg">🔬</span>
          <span>العلوم</span>
          <span className="text-[10px] opacity-80">{stats.science.solved}/{stats.science.total}</span>
        </button>

        <button
          onClick={() => setActiveCategory('space')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer flex flex-col items-center gap-1 ${
            activeCategory === 'space'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-102'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
          }`}
        >
          <span className="text-lg">🚀</span>
          <span>الفضاء</span>
          <span className="text-[10px] opacity-80">{stats.space.solved}/{stats.space.total}</span>
        </button>

        <button
          onClick={() => setActiveCategory('math')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer flex flex-col items-center gap-1 ${
            activeCategory === 'math'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md scale-102'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
          }`}
        >
          <span className="text-lg">🔢</span>
          <span>الرياضيات</span>
          <span className="text-[10px] opacity-80">{stats.math.solved}/{stats.math.total}</span>
        </button>

        <button
          onClick={() => setActiveCategory('logic')}
          className={`p-3 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer flex flex-col items-center gap-1 ${
            activeCategory === 'logic'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-102'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-purple-50'
          }`}
        >
          <span className="text-lg">🧩</span>
          <span>منطق وذكاء</span>
          <span className="text-[10px] opacity-80">{stats.logic.solved}/{stats.logic.total}</span>
        </button>
      </div>

      {/* Exhausted Category Banner if all solved */}
      {isCategoryExhausted && (
        <div className="p-4 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 text-amber-950 dark:text-amber-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-extrabold animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span>ما شاء الله! قمت بحل جميع أسئلة هذا القسم بنجاح تام! يمكنك مواصلة التدريب والاستمتاع بمراجعتها.</span>
          </div>
          <button
            onClick={() => loadNextQuestion()}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shrink-0 cursor-pointer"
          >
            سؤال مراجعة 🔁
          </button>
        </div>
      )}

      {/* Active Question Card */}
      {currentQuestion && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 border border-indigo-200">
                {currentQuestion.categoryIcon} {currentQuestion.categoryLabel}
              </span>
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                {currentQuestion.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {solvedIds.includes(currentQuestion.id) && (
                <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>محلول مسبقاً</span>
                </span>
              )}
              <span className="text-xs font-black text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
                +{currentQuestion.points} نقطة
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  playClick();
                  setSelectedOptionId(option.id);
                }}
                className={`p-4 rounded-2xl text-right font-extrabold text-sm border-2 transition-all cursor-pointer ${
                  selectedOptionId === option.id
                    ? 'bg-indigo-100 dark:bg-indigo-950 border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
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
                onClick={() => loadNextQuestion()}
                className="text-xs font-black text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                <span>سؤال عشوائي آخر 🎲</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleVerifyAnswer}
                disabled={!selectedOptionId}
                className={`flex-1 sm:flex-initial px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  selectedOptionId
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد الإجابة</span>
              </button>
            </div>
          </div>

          {showHint && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
              <span>💡 تلميح:</span>
              <span>{currentQuestion.hint}</span>
            </div>
          )}
        </div>
      )}

      {/* Answer Feedback */}
      {answerFeedback && currentQuestion && (
        <div className={`p-5 rounded-2xl border-2 flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
          answerFeedback.isCorrect
            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-950 dark:text-emerald-100'
            : 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-950 dark:text-rose-100'
        }`}>
          <div className="flex items-start gap-3">
            {answerFeedback.isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1.5">
              <p className="font-black text-sm sm:text-base">{answerFeedback.message}</p>
              {answerFeedback.isCorrect && (
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 pt-1 space-y-1">
                  <p>🔬 {currentQuestion.explanation}</p>
                  <p className="text-amber-800 dark:text-amber-300">✨ {currentQuestion.funFact}</p>
                </div>
              )}
            </div>
          </div>

          {answerFeedback.isCorrect && (
            <button
              onClick={() => loadNextQuestion()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>السؤال التالي</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      )}

      {/* Unlocked Badge Alert */}
      {unlockedBadge && (
        <div className="bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 rounded-2xl p-4 flex items-center justify-between gap-3 text-right animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                🎉 مبارك! حصلت على وسام جديد:
              </div>
              <div className="text-sm font-black text-amber-950 dark:text-white">
                {unlockedBadge} (+35 نقطة)
              </div>
            </div>
          </div>
          {onOpenBadgesTab && (
            <button
              onClick={onOpenBadgesTab}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              عرض في لوحة الشرف
            </button>
          )}
        </div>
      )}

    </div>
  );
};
