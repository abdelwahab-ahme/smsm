import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, BankQuestion } from '../../types';
import { getSmartBankQuestion, getQuestionBankStats } from '../../data/questionBank';
import { useSound } from '../../context/SoundContext';
import { fireDailySuccessConfetti, fireBadgeUnlockConfetti } from '../../utils/confettiCelebration';
import { IslamicContent, DEFAULT_CONTENT } from '../../data/islamicContent';
import { fetchIslamicContent } from '../../lib/islamicContentDb';
import { Lightbulb, CheckCircle2, XCircle, ArrowRight, RotateCcw, Check } from 'lucide-react';
 
interface IslamicCornerProps {
  activeProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenBadgesTab?: () => void;
}
 
type AwardResult = { gained: number; badge: string | null };
 
interface SectionProps {
  content: IslamicContent;
  profile: UserProfile;
  solvedIds: string[];
  isGirl: boolean;
  award: (itemId: string, points: number) => AwardResult;
}
 
// ============================================================
// قواعد الأوسمة (لازم تتطابق مع الأوسمة المضافة في utils/storage.ts)
// ============================================================
const BADGE_RULES = [
  { id: 'little_sage', prefix: 'isl-story-', needed: 3, bonus: 20, name: 'الحكيم الصغير' },
  { id: 'good_manners', prefix: 'isl-manners-', needed: 5, bonus: 20, name: 'صاحب الخلق الحسن' },
  { id: 'fortress_hero', prefix: 'isl-dhikr-', needed: 3, bonus: 25, name: 'حصن البطل' },
];
 
// ============================================================
// أدوات مساعدة
// ============================================================
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
 
function shuffleDifferent(parts: string[]): string[] {
  const original = parts.join('|');
  for (let i = 0; i < 10; i++) {
    const s = shuffle(parts);
    if (s.join('|') !== original) return s;
  }
  return [...parts].reverse();
}
 
const optionClass = (selected: boolean) =>
  `p-4 rounded-2xl text-right font-extrabold text-sm border-2 transition-all cursor-pointer ${
    selected
      ? 'bg-teal-100 dark:bg-teal-950 border-teal-500 text-teal-950 dark:text-teal-100 shadow-xs'
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 text-slate-800 dark:text-slate-200'
  }`;
 
// ============================================================
// قسم القصص
// ============================================================
const StorySection: React.FC<SectionProps> = ({ content, solvedIds, award, isGirl }) => {
  const { playClick, playChime, playPointsEarned, playTryAgain } = useSound();
  const [openId, setOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<{ ok: boolean; gained: number } | null>(null);
 
  const story = content.stories.find((s) => s.id === openId) || null;
  const quizOrder = useMemo(
    () => (story ? shuffle(story.quiz.options.map((_, i) => i)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story?.id]
  );
  const isDone = (id: string) => solvedIds.includes(`isl-story-${id}`);
 
  const openStory = (id: string) => {
    playClick();
    setOpenId(id);
    setPage(0);
    setPicked(null);
    setResult(null);
  };
 
  const checkAnswer = () => {
    if (!story || picked === null) return;
    if (picked === story.quiz.correctIndex) {
      playChime();
      playPointsEarned();
      fireDailySuccessConfetti();
      const res = award(`isl-story-${story.id}`, 15);
      setResult({ ok: true, gained: res.gained });
    } else {
      playTryAgain();
      setResult({ ok: false, gained: 0 });
    }
  };
 
  if (!story) {
    return (
      <div className="space-y-3">
        <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
          اقرأ القصة صفحة بعد صفحة، ثم أجب عن سؤالها لتجمع النقاط والأوسمة.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {content.stories.map((s) => (
            <button
              key={s.id}
              onClick={() => openStory(s.id)}
              className="p-5 rounded-3xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-slate-800/60 hover:border-teal-400 text-right space-y-2 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl">{s.icon}</span>
                {isDone(s.id) && (
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>أتممتها</span>
                  </span>
                )}
              </div>
              <h4 className="font-black text-base text-slate-950 dark:text-white">{s.title}</h4>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{s.summary}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }
 
  const inQuiz = page >= story.pages.length;
 
  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          playClick();
          setOpenId(null);
        }}
        className="text-xs font-black text-teal-700 dark:text-teal-300 flex items-center gap-1 cursor-pointer"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        <span>الرجوع إلى القصص</span>
      </button>
 
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{story.icon}</span>
          <h4 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">{story.title}</h4>
        </div>
 
        {!inQuiz ? (
          <>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-loose min-h-[7rem]">
              {story.pages[page]}
            </p>
 
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {story.pages.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${i === page ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  />
                ))}
              </div>
 
              <div className="flex items-center gap-2">
                {page > 0 && (
                  <button
                    onClick={() => {
                      playClick();
                      setPage(page - 1);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-black text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    السابق
                  </button>
                )}
                <button
                  onClick={() => {
                    playClick();
                    setPage(page + 1);
                  }}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black cursor-pointer"
                >
                  {page === story.pages.length - 1 ? 'إلى السؤال' : 'التالي'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-relaxed">
              {story.quiz.question}
            </p>
 
            <div className="grid grid-cols-1 gap-2.5">
              {quizOrder.map((i) => (
                <button
                  key={i}
                  disabled={result?.ok}
                  onClick={() => {
                    playClick();
                    setPicked(i);
                    setResult(null);
                  }}
                  className={optionClass(picked === i)}
                >
                  {story.quiz.options[i]}
                </button>
              ))}
            </div>
 
            {!result?.ok && (
              <button
                onClick={checkAnswer}
                disabled={picked === null}
                className={`px-6 py-3 rounded-2xl font-black text-sm cursor-pointer ${
                  picked !== null
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                تأكيد الإجابة
              </button>
            )}
 
            {result && (
              <div
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                  result.ok
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-950 dark:text-emerald-100'
                    : 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-950 dark:text-rose-100'
                }`}
              >
                {result.ok ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div className="space-y-1">
                  <p className="font-black text-sm">
                    {result.ok
                      ? result.gained > 0
                        ? `إجابة صحيحة! ${isGirl ? 'فزتِ' : 'فزت'} بـ +${result.gained} نقطة 🎉`
                        : 'إجابة صحيحة! (أخذت نقاط هذه القصة من قبل)'
                      : 'ليست الإجابة الصحيحة، فكّر مرة أخرى وجرّب.'}
                  </p>
                  {result.ok && <p className="text-xs font-bold">{story.quiz.explanation}</p>}
                </div>
              </div>
            )}
 
            {result?.ok && (
              <button
                onClick={() => {
                  playClick();
                  setOpenId(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
              >
                قصة أخرى
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
 
// ============================================================
// قسم الأخلاق والآداب
// ============================================================
const MannersSection: React.FC<SectionProps> = ({ content, solvedIds, award, isGirl }) => {
  const { playClick, playChime, playPointsEarned, playTryAgain } = useSound();
  const total = content.manners.length;
  const todayIndex = total > 0 ? Math.floor(Date.now() / 86400000) % total : 0;
  const [index, setIndex] = useState(todayIndex);
  const [wrong, setWrong] = useState<number[]>([]);
  const [won, setWon] = useState<{ gained: number } | null>(null);
 
  const item = total > 0 ? content.manners[index % total] : null;
  const optionOrder = useMemo(
    () => (item ? shuffle(item.options.map((_, i) => i)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item?.id]
  );
 
  if (!item) return null;
 
  const doneCount = content.manners.filter((m) => solvedIds.includes(`isl-manners-${m.id}`)).length;
  const alreadyDone = solvedIds.includes(`isl-manners-${item.id}`);
 
  const choose = (i: number) => {
    if (won) return;
    if (i === item.correctIndex) {
      playChime();
      playPointsEarned();
      fireDailySuccessConfetti();
      const res = award(`isl-manners-${item.id}`, 10);
      setWon({ gained: res.gained });
    } else {
      playTryAgain();
      setWrong((w) => (w.includes(i) ? w : [...w, i]));
    }
  };
 
  const next = () => {
    playClick();
    setIndex((index + 1) % content.manners.length);
    setWrong([]);
    setWon(null);
  };
 
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
          اختر التصرف الذي يحبه الله ورسوله ﷺ واكسب الحسنات والنقاط.
        </p>
        <span className="text-[11px] font-black text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-3 py-1 rounded-full shrink-0">
          {doneCount} من {content.manners.length} مواقف
        </span>
      </div>
 
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
            {index === todayIndex ? 'موقف اليوم' : 'موقف آخر'}
          </span>
          {alreadyDone && !won && (
            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>حللته من قبل</span>
            </span>
          )}
        </div>
 
        <div className="flex items-start gap-3">
          <span className="text-4xl">{item.icon}</span>
          <p className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-relaxed">
            {item.situation}
          </p>
        </div>
 
        <div className="grid grid-cols-1 gap-2.5">
          {optionOrder.map((i) => {
            const opt = item.options[i];
            const isWrong = wrong.includes(i);
            const isRight = won && i === item.correctIndex;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={isWrong || !!won}
                className={`p-4 rounded-2xl text-right font-extrabold text-sm border-2 transition-all ${
                  isRight
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-950 dark:text-emerald-100'
                    : isWrong
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-300 opacity-70 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 text-slate-800 dark:text-slate-200 cursor-pointer'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
 
        {wrong.length > 0 && !won && (
          <p className="text-xs font-black text-rose-700 dark:text-rose-300">
            فكّر مرة أخرى، واختر التصرف الأجمل.
          </p>
        )}
 
        {won && (
          <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-400 text-emerald-950 dark:text-emerald-100 space-y-1.5">
            <p className="font-black text-sm">
              {won.gained > 0
                ? `أحسنت! ${isGirl ? 'كسبتِ' : 'كسبت'} +${won.gained} نقطة 🌟`
                : 'أحسنت! (أخذت نقاط هذا الموقف من قبل)'}
            </p>
            <p className="text-xs font-bold">{item.note}</p>
            <button
              onClick={next}
              className="mt-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
            >
              الموقف التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
 
// ============================================================
// قسم "هل تعلم؟" (أسئلة إسلامية من بنك الأسئلة في الداتابيز)
// ============================================================
const FactsSection: React.FC<SectionProps> = ({ profile, solvedIds, award, isGirl }) => {
  const { playClick, playPop, playChime, playPointsEarned, playTryAgain } = useSound();
  const stats = getQuestionBankStats(profile).islamic;
 
  const [question, setQuestion] = useState<BankQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; gained: number } | null>(null);
 
  const loadNext = () => {
    setSelected(null);
    setShowHint(false);
    setFeedback(null);
    setQuestion(getSmartBankQuestion(profile, 'islamic'));
  };
 
  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const verify = () => {
    if (!question || !selected) return;
    if (selected === question.correctOptionId) {
      playChime();
      playPointsEarned();
      fireDailySuccessConfetti();
      const res = award(question.id, question.points);
      setFeedback({ ok: true, gained: res.gained });
    } else {
      playTryAgain();
      setFeedback({ ok: false, gained: 0 });
    }
  };
 
  if (stats.total === 0 || !question) {
    return (
      <p className="text-sm font-bold text-slate-600 dark:text-slate-300 text-center py-8">
        لا توجد أسئلة إسلامية حالياً. سيضيف مدير المنصة أسئلة جديدة قريباً.
      </p>
    );
  }
 
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
          أسئلة وألغاز عن القرآن والسيرة والصحابة بأسلوب ممتع.
        </p>
        <span className="text-[11px] font-black text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-3 py-1 rounded-full shrink-0">
          {stats.solved} من {stats.total} سؤالاً
        </span>
      </div>
 
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">{question.title}</span>
          <div className="flex items-center gap-2">
            {solvedIds.includes(question.id) && (
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>محلول مسبقاً</span>
              </span>
            )}
            <span className="text-xs font-black text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
              +{question.points} نقطة
            </span>
          </div>
        </div>
 
        <p className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-relaxed">
          {question.question}
        </p>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              disabled={feedback?.ok}
              onClick={() => {
                playClick();
                setSelected(opt.id);
                setFeedback(null);
              }}
              className={optionClass(selected === opt.id)}
            >
              {opt.text}
            </button>
          ))}
        </div>
 
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              playPop();
              setShowHint(!showHint);
            }}
            className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{showHint ? 'إخفاء التلميح' : 'تلميح 💡'}</span>
          </button>
 
          {!feedback?.ok ? (
            <button
              onClick={verify}
              disabled={!selected}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm cursor-pointer ${
                selected
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              تأكيد الإجابة
            </button>
          ) : (
            <button
              onClick={() => {
                playClick();
                loadNext();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              السؤال التالي
            </button>
          )}
        </div>
 
        {showHint && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-950 dark:text-amber-200">
            💡 {question.hint}
          </div>
        )}
 
        {feedback && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
              feedback.ok
                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 text-rose-950 dark:text-rose-100'
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div className="space-y-1">
              <p className="font-black text-sm">
                {feedback.ok
                  ? feedback.gained > 0
                    ? `إجابة صحيحة! ${isGirl ? 'فزتِ' : 'فزت'} بـ +${feedback.gained} نقطة 🎉`
                    : 'إجابة صحيحة! (أخذت نقاط هذا السؤال من قبل)'
                  : 'محاولة طيبة، فكّر مرة أخرى أو استعن بالتلميح.'}
              </p>
              {feedback.ok && (
                <div className="text-xs font-bold space-y-1">
                  <p>📖 {question.explanation}</p>
                  <p className="text-amber-800 dark:text-amber-300">✨ {question.funFact}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
// ============================================================
// قسم حصن البطل (ترتيب الأذكار والسور القصيرة)
// ============================================================
const HisnSection: React.FC<SectionProps> = ({ content, solvedIds, award, isGirl }) => {
  const { playClick, playPop, playChime, playPointsEarned, playTryAgain } = useSound();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pool, setPool] = useState<string[]>([]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'ok' | 'wrong'>('idle');
  const [gained, setGained] = useState(0);
 
  const item = content.hisn.find((h) => h.id === openId) || null;
  const isDone = (id: string) => solvedIds.includes(`isl-dhikr-${id}`);
 
  const start = (id: string) => {
    const it = content.hisn.find((h) => h.id === id);
    if (!it) return;
    playClick();
    setOpenId(id);
    setPool(shuffleDifferent(it.parts));
    setPlaced([]);
    setStatus('idle');
    setGained(0);
  };
 
  const check = (arr: string[]) => {
    if (!item) return;
    if (arr.join('|') === item.parts.join('|')) {
      playChime();
      playPointsEarned();
      fireDailySuccessConfetti();
      const res = award(`isl-dhikr-${item.id}`, 15);
      setGained(res.gained);
      setStatus('ok');
    } else {
      playTryAgain();
      setStatus('wrong');
    }
  };
 
  const pick = (idx: number) => {
    if (status !== 'idle') return;
    playPop();
    const chunk = pool[idx];
    const newPool = pool.filter((_, i) => i !== idx);
    const newPlaced = [...placed, chunk];
    setPool(newPool);
    setPlaced(newPlaced);
    if (newPool.length === 0) check(newPlaced);
  };
 
  const unplace = (idx: number) => {
    if (status !== 'idle') return;
    playPop();
    setPool([...pool, placed[idx]]);
    setPlaced(placed.filter((_, i) => i !== idx));
  };
 
  const retry = () => {
    if (!item) return;
    playClick();
    setPool(shuffleDifferent(item.parts));
    setPlaced([]);
    setStatus('idle');
  };
 
  if (!item) {
    return (
      <div className="space-y-3">
        <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
          رتّب كلمات الدعاء أو السورة بالترتيب الصحيح لتحفظها وتحصل على النقاط.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.hisn.map((h) => (
            <button
              key={h.id}
              onClick={() => start(h.id)}
              className="p-4 rounded-3xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-slate-800/60 hover:border-teal-400 text-right flex items-center gap-3 cursor-pointer transition-all"
            >
              <span className="text-3xl">{h.icon}</span>
              <div className="flex-1">
                <h4 className="font-black text-sm text-slate-950 dark:text-white">{h.title}</h4>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{h.when}</p>
              </div>
              {isDone(h.id) && <Check className="w-5 h-5 text-emerald-600 stroke-[3] shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    );
  }
 
  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          playClick();
          setOpenId(null);
        }}
        className="text-xs font-black text-teal-700 dark:text-teal-300 flex items-center gap-1 cursor-pointer"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        <span>الرجوع إلى الأذكار</span>
      </button>
 
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{item.icon}</span>
          <div>
            <h4 className="text-lg font-black text-slate-950 dark:text-white">{item.title}</h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.when}</p>
          </div>
        </div>
 
        <div>
          <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">ترتيبك:</p>
          <div className="min-h-[3.5rem] p-3 rounded-2xl border-2 border-dashed border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 flex flex-wrap gap-2">
            {placed.length === 0 && (
              <span className="text-xs font-bold text-slate-400">اضغط على العبارات بالترتيب الصحيح</span>
            )}
            {placed.map((p, i) => (
              <button
                key={`${p}-${i}`}
                onClick={() => unplace(i)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-sm font-black cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
 
        {pool.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {pool.map((p, i) => (
              <button
                key={`${p}-${i}`}
                onClick={() => pick(i)}
                className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 text-sm font-black cursor-pointer active:scale-95 transition-transform"
              >
                {p}
              </button>
            ))}
          </div>
        )}
 
        {status === 'ok' && (
          <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-400 text-emerald-950 dark:text-emerald-100 space-y-1.5">
            <p className="font-black text-sm">
              {gained > 0
                ? `ما شاء الله! ${isGirl ? 'حفظتِ' : 'حفظت'} الترتيب الصحيح، +${gained} نقطة 🛡️`
                : 'ما شاء الله! ترتيب صحيح (أخذت نقاط هذا الذكر من قبل)'}
            </p>
            <p className="text-sm font-extrabold">{item.parts.join(' ')}</p>
            <button
              onClick={() => {
                playClick();
                setOpenId(null);
              }}
              className="mt-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
            >
              ذكر آخر
            </button>
          </div>
        )}
 
        {status === 'wrong' && (
          <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-400 text-rose-950 dark:text-rose-100 flex items-center justify-between gap-3">
            <p className="font-black text-sm">الترتيب غير صحيح، حاول مرة أخرى.</p>
            <button
              onClick={retry}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
 
// ============================================================
// المكوّن الرئيسي
// ============================================================
type CornerTab = 'stories' | 'manners' | 'facts' | 'hisn';
 
export const IslamicCorner: React.FC<IslamicCornerProps> = ({
  activeProfile,
  onUpdateProfile,
  onOpenBadgesTab,
}) => {
  const isGirl = activeProfile.gender === 'girl';
  const { playClick, playBadgeUnlock } = useSound();
  const [tab, setTab] = useState<CornerTab>('stories');
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);
  const [content, setContent] = useState<IslamicContent>(DEFAULT_CONTENT);
 
  // تحميل المحتوى من الداتابيز (لو الجدول فاضي يفضل المحتوى الافتراضي)
  useEffect(() => {
    let cancelled = false;
    fetchIslamicContent().then((res) => {
      if (!cancelled && res) setContent(res.content);
    });
    return () => {
      cancelled = true;
    };
  }, []);
 
  const solvedIds = activeProfile.solvedBankQuestionIds || [];
 
  const storiesDone = content.stories.filter((s) => solvedIds.includes(`isl-story-${s.id}`)).length;
  const mannersDone = content.manners.filter((m) => solvedIds.includes(`isl-manners-${m.id}`)).length;
  const hisnDone = content.hisn.filter((h) => solvedIds.includes(`isl-dhikr-${h.id}`)).length;
 
  // منح النقاط مرة واحدة فقط لكل عنصر، وفحص الأوسمة
  const award = (itemId: string, points: number): AwardResult => {
    if (solvedIds.includes(itemId)) return { gained: 0, badge: null };
 
    const newIds = [...solvedIds, itemId];
    const badges = [...(activeProfile.unlockedBadgeIds || [])];
    let bonus = 0;
    let badgeName: string | null = null;
 
    for (const rule of BADGE_RULES) {
      const count = newIds.filter((id) => id.startsWith(rule.prefix)).length;
      if (!badges.includes(rule.id) && count >= rule.needed) {
        badges.push(rule.id);
        bonus += rule.bonus;
        badgeName = rule.name;
      }
    }
 
    onUpdateProfile({
      ...activeProfile,
      points: activeProfile.points + points + bonus,
      unlockedBadgeIds: badges,
      solvedBankQuestionIds: newIds,
    });
 
    if (badgeName) {
      setUnlockedBadge(badgeName);
      setTimeout(() => {
        playBadgeUnlock();
        fireBadgeUnlockConfetti();
      }, 500);
    }
 
    return { gained: points + bonus, badge: badgeName };
  };
 
  const tabs: { id: CornerTab; label: string; icon: string }[] = [
    { id: 'stories', label: 'قصص الأنبياء', icon: '📖' },
    { id: 'manners', label: 'الأخلاق والآداب', icon: '🌟' },
    { id: 'facts', label: 'هل تعلم؟', icon: '🧠' },
    { id: 'hisn', label: 'حصن البطل', icon: '🛡️' },
  ];
 
  const isTabEmpty =
    (tab === 'stories' && content.stories.length === 0) ||
    (tab === 'manners' && content.manners.length === 0) ||
    (tab === 'hisn' && content.hisn.length === 0);
 
  const sectionProps: SectionProps = { content, profile: activeProfile, solvedIds, isGirl, award };
 
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border-2 border-teal-200 dark:border-teal-800/60 shadow-lg relative overflow-hidden space-y-5">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
 
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-teal-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl">
            🌙
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">ركن الإسلاميات</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              قصص وأخلاق وأذكار وأسئلة، نتعلم بها ونكسب الحسنات والنقاط.
            </p>
          </div>
        </div>
 
        <div className="grid grid-cols-3 gap-2 text-center shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-teal-800">
            <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">القصص</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">{storiesDone}/{content.stories.length}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-teal-800">
            <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">المواقف</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">{mannersDone}/{content.manners.length}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-teal-800">
            <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">الأذكار</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">{hisnDone}/{content.hisn.length}</div>
          </div>
        </div>
      </div>
 
      {/* Sub tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              playClick();
              setTab(t.id);
            }}
            className={`p-3 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === t.id
                ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-teal-50'
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
 
      {/* Active section */}
      {isTabEmpty && (
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 text-center py-8">
          لا يوجد محتوى في هذا القسم حالياً، وسيضيف مدير المنصة محتوى جديداً قريباً.
        </p>
      )}
      {!isTabEmpty && tab === 'stories' && <StorySection {...sectionProps} />}
      {!isTabEmpty && tab === 'manners' && <MannersSection {...sectionProps} />}
      {tab === 'facts' && <FactsSection {...sectionProps} />}
      {!isTabEmpty && tab === 'hisn' && <HisnSection {...sectionProps} />}
 
      {/* Unlocked badge banner */}
      {unlockedBadge && (
        <div className="bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 rounded-2xl p-4 flex items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs font-black text-amber-900 dark:text-amber-200">مبارك! حصلت على وسام جديد:</div>
              <div className="text-sm font-black text-amber-950 dark:text-white">{unlockedBadge}</div>
            </div>
          </div>
          {onOpenBadgesTab && (
            <button
              onClick={onOpenBadgesTab}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shrink-0"
            >
              عرض في لوحة الشرف
            </button>
          )}
        </div>
      )}
    </div>
  );
};