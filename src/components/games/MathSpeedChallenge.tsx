import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../../types';
import { useSound } from '../../context/SoundContext';
import { fireDailySuccessConfetti, fireBadgeUnlockConfetti } from '../../utils/confettiCelebration';
import { Timer, Zap, Trophy, Play, RotateCcw, Check, X, Sparkles, Flame, Award } from 'lucide-react';

interface MathSpeedChallengeProps {
  activeProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenBadgesTab?: () => void;
}

interface MathQuestion {
  num1: number;
  num2: number;
  operation: '+' | '-' | '×';
  correctAnswer: number;
  options: number[];
}

export const MathSpeedChallenge: React.FC<MathSpeedChallengeProps> = ({
  activeProfile,
  onUpdateProfile,
  onOpenBadgesTab,
}) => {
  const isGirl = activeProfile.gender === 'girl';
  const { playClick, playChime, playPointsEarned, playSuccessWhistle, playTryAgain, playBadgeUnlock } = useSound();

  const GAME_DURATION = 35; // 35 seconds
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [unlockedNewBadge, setUnlockedNewBadge] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate dynamic kid-friendly math question
  const generateQuestion = useCallback((): MathQuestion => {
    const ops: ('+' | '-' | '×')[] = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = 0;
    let n2 = 0;
    let ans = 0;

    if (op === '+') {
      n1 = Math.floor(Math.random() * 15) + 2;
      n2 = Math.floor(Math.random() * 15) + 2;
      ans = n1 + n2;
    } else if (op === '-') {
      n1 = Math.floor(Math.random() * 18) + 8;
      n2 = Math.floor(Math.random() * n1) + 1;
      ans = n1 - n2;
    } else {
      // Multiplication up to table of 6 or 10
      n1 = Math.floor(Math.random() * 6) + 2;
      n2 = Math.floor(Math.random() * 6) + 2;
      ans = n1 * n2;
    }

    // Generate 3 plausible distractors
    const optionsSet = new Set<number>([ans]);
    while (optionsSet.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const wrong = Math.max(0, ans + delta);
      if (wrong !== ans) {
        optionsSet.add(wrong);
      }
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return {
      num1: n1,
      num2: n2,
      operation: op,
      correctAnswer: ans,
      options,
    };
  }, []);

  // Start the game
  const handleStartGame = () => {
    playClick();
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setTimeLeft(GAME_DURATION);
    setUnlockedNewBadge(false);
    setCurrentQuestion(generateQuestion());
    setGameState('playing');
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle Game Over
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      setGameState('finished');

      // Award points earned in this speed round
      const pointsWon = Math.max(10, score * 5);
      const updatedBadgeIds = [...activeProfile.unlockedBadgeIds];
      let gotBadge = false;

      // Check math lightning badge (at least 5 correct answers in a session)
      if (score >= 5 && !updatedBadgeIds.includes('math_lightning')) {
        updatedBadgeIds.push('math_lightning');
        gotBadge = true;
      }

      const newHighScore = Math.max(activeProfile.mathSpeedHighScore || 0, score);
      const updatedProfile: UserProfile = {
        ...activeProfile,
        points: activeProfile.points + pointsWon,
        unlockedBadgeIds: updatedBadgeIds,
        mathSpeedHighScore: newHighScore,
      };

      onUpdateProfile(updatedProfile);

      if (gotBadge) {
        setUnlockedNewBadge(true);
        setTimeout(() => {
          playBadgeUnlock();
          playSuccessWhistle();
          fireBadgeUnlockConfetti();
        }, 300);
      } else if (score > (activeProfile.mathSpeedHighScore || 0)) {
        setTimeout(() => {
          playSuccessWhistle();
          fireDailySuccessConfetti();
        }, 200);
      } else {
        playPointsEarned();
      }
    }
  }, [timeLeft, gameState]);

  // Handle Option Click
  const handleAnswer = (chosen: number) => {
    if (gameState !== 'playing' || !currentQuestion) return;

    if (chosen === currentQuestion.correctAnswer) {
      playChime();
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > highestStreak) setHighestStreak(newStreak);
      setFeedback('correct');

      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestion(generateQuestion());
      }, 180);
    } else {
      playTryAgain();
      setStreak(0);
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
      }, 300);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 dark:border-amber-600/60 shadow-lg relative overflow-hidden select-none">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-100 dark:border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-xs">
            ⚡
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <span>تحدي السرعة الحسابية</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-extrabold border border-amber-300">
                بـ Timer ⏱️
              </span>
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              أجب على أكبر قدر ممكن من العمليات الحسابية الذكية قبل نفاد الـ 35 ثانية!
            </p>
          </div>
        </div>

        {/* High Score badge */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 px-4 py-2 rounded-2xl">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div className="text-right">
            <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">أعلى رقم قياسي</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {activeProfile.mathSpeedHighScore || 0} إجابات صحيحة
            </div>
          </div>
        </div>
      </div>

      {/* Game States */}
      {gameState === 'idle' && (
        <div className="text-center py-10 space-y-6 max-w-md mx-auto">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-amber-400 to-yellow-300 flex items-center justify-center text-5xl shadow-lg mx-auto animate-bounce">
              ⏱️
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-md">
              35 ثانية!
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {isGirl ? 'هل أنتِ مستعدة للتحدي يا بطلتنا؟' : 'هل أنت مستعد للتحدي يا بطلنا؟'}
            </h4>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              مرّن عقلك الخارق في الحساب الذهني السريع! إحراز 5 إجابات صحيحة في جولة واحدة يمنحك وسام «صاعقة الحساب السريع ⚡» فوراً!
            </p>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-base shadow-lg shadow-amber-400/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>ابدأ تحدي السرعة الحسابية الآن 🚀</span>
          </button>
        </div>
      )}

      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-6">
          {/* Progress & Stats Bar */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Timer */}
            <div className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 ${
              timeLeft <= 8
                ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-800 dark:text-rose-200 animate-pulse'
                : 'bg-amber-50 dark:bg-slate-800 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white'
            }`}>
              <Timer className="w-5 h-5 text-amber-500" />
              <span className="font-mono text-xl sm:text-2xl font-black">{timeLeft}s</span>
            </div>

            {/* Score */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <span className="text-xl sm:text-2xl font-black">{score}</span>
              <span className="text-xs font-bold">صحيح</span>
            </div>

            {/* Streak */}
            <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/50 border-2 border-pink-300 dark:border-pink-700 text-pink-900 dark:text-pink-200 flex items-center justify-center gap-1.5">
              <Flame className={`w-5 h-5 ${streak >= 3 ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
              <span className="text-xl sm:text-2xl font-black">{streak}</span>
              <span className="text-xs font-bold">متتالي</span>
            </div>
          </div>

          {/* Time Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 8 ? 'bg-rose-500' : 'bg-linear-to-r from-amber-400 to-emerald-500'
              }`}
              style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
            />
          </div>

          {/* Question Equation Card */}
          <div className={`p-8 rounded-3xl border-4 text-center transition-all ${
            feedback === 'correct'
              ? 'bg-emerald-100 border-emerald-400 dark:bg-emerald-950/80 scale-102'
              : feedback === 'wrong'
              ? 'bg-rose-100 border-rose-400 dark:bg-rose-950/80'
              : 'bg-linear-to-br from-amber-50 to-pink-50/50 dark:from-slate-800 dark:to-slate-800/60 border-amber-300 dark:border-amber-600'
          }`}>
            <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-950 px-3 py-1 rounded-full mb-3 inline-block">
              احسب الناتج بأسرع ما يمكن:
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-slate-900 dark:text-white mt-1">
              {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ؟
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="py-5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border-2 border-amber-200 dark:border-slate-700 hover:border-amber-400 text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center py-8 space-y-6 max-w-md mx-auto animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-amber-400 to-yellow-300 flex items-center justify-center text-5xl shadow-xl mx-auto">
            🏆
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {isGirl ? 'أحسنتِ يا بطلتنا السريعة! 🎉' : 'أحسنت يا بطلنا السريع! 🎉'}
            </h4>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              انتهت الـ 35 ثانية بنجاح وتألق رياضي كبير!
            </p>
          </div>

          {/* Stats Summary Box */}
          <div className="bg-amber-50 dark:bg-slate-800/80 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">الإجابات الصحيحة</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{score}</div>
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">أعلى تتابع</div>
              <div className="text-2xl font-black text-pink-600 dark:text-pink-400 mt-0.5">{highestStreak}</div>
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">نقاط مكتسبة</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">+{Math.max(10, score * 5)}</div>
            </div>
          </div>

          {unlockedNewBadge && (
            <div className="bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-3 text-right">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="text-xs font-black text-amber-900 dark:text-amber-200">
                  🎉 مبارك! حصلت على وسام جديد:
                </div>
                <div className="text-sm font-black text-amber-950 dark:text-white">
                  صاعقة الحساب السريع (+25 نقطة)
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartGame}
              className="flex-1 py-3.5 rounded-2xl bg-linear-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة لتحطيم الرقم القياسي 🔁</span>
            </button>

            {onOpenBadgesTab && (
              <button
                onClick={() => {
                  playClick();
                  onOpenBadgesTab();
                }}
                className="py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>لوحة الأوسمة</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
