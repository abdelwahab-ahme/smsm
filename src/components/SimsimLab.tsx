import React, { useState, useMemo } from 'react';
import { UserProfile, LabExperiment, LabCategory, AgeGroup } from '../types';
import { LAB_EXPERIMENTS, LAB_BADGES_INFO, getDynamicLabExperiments } from '../data/labExperiments';
import { useSound } from '../context/SoundContext';
import { fireBadgeUnlockConfetti, fireDailySuccessConfetti } from '../utils/confettiCelebration';
import {
  FlaskConical,
  Beaker,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Trophy,
  Lightbulb,
  Zap,
  Play,
  RotateCcw,
  Compass,
  ArrowRight
} from 'lucide-react';

interface SimsimLabProps {
  activeProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenBadgesTab?: () => void;
}

export const SimsimLab: React.FC<SimsimLabProps> = ({
  activeProfile,
  onUpdateProfile,
  onOpenBadgesTab,
}) => {
  const { playClick, playSparkle, playBadgeUnlock, playSuccessWhistle } = useSound();

  // Completed experiments set from profile
  const completedIds = useMemo(() => {
    return activeProfile.completedLabExperimentIds || [];
  }, [activeProfile.completedLabExperimentIds]);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<LabCategory | 'all'>('all');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  
  const allLabExperiments = useMemo(() => getDynamicLabExperiments(), []);
  const [expandedExperimentId, setExpandedExperimentId] = useState<string | null>(allLabExperiments[0]?.id || null);

  // Interactive step tracker per experiment in local session
  const [checkedSteps, setCheckedSteps] = useState<Record<string, number[]>>({});

  // Mini Interactive Beaker Simulator State
  const [beakerIng1, setBeakerIng1] = useState<string>('baking_soda');
  const [beakerIng2, setBeakerIng2] = useState<string>('vinegar');
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [reactorMessage, setReactorMessage] = useState<string | null>(null);

  // Success celebration modal or toast
  const [justCompletedExp, setJustCompletedExp] = useState<LabExperiment | null>(null);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<string | null>(null);

  // Filtered experiments list
  const filteredExperiments = useMemo(() => {
    return allLabExperiments.filter((exp) => {
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
      if (selectedAge !== 'all' && exp.ageGroup !== selectedAge && exp.ageGroup !== 'all') return false;
      const isDone = completedIds.includes(exp.id);
      if (filterStatus === 'completed' && !isDone) return false;
      if (filterStatus === 'pending' && isDone) return false;
      return true;
    });
  }, [allLabExperiments, selectedCategory, selectedAge, filterStatus, completedIds]);

  // Toggle experiment collapse
  const handleToggleCard = (id: string) => {
    playClick();
    setExpandedExperimentId((prev) => (prev === id ? null : id));
  };

  // Toggle step checkbox
  const handleToggleStep = (expId: string, stepIndex: number) => {
    playClick();
    setCheckedSteps((prev) => {
      const current = prev[expId] || [];
      const updated = current.includes(stepIndex)
        ? current.filter((i) => i !== stepIndex)
        : [...current, stepIndex];
      return { ...prev, [expId]: updated };
    });
  };

  // Mark experiment as completed in user profile
  const handleCompleteExperiment = (exp: LabExperiment) => {
    if (completedIds.includes(exp.id)) return;

    playSparkle();
    playBadgeUnlock();
    playSuccessWhistle();
    fireBadgeUnlockConfetti();

    const newCompleted = [...completedIds, exp.id];
    let newPoints = activeProfile.points + exp.points;
    const newUnlockedBadges = [...activeProfile.unlockedBadgeIds];
    let unlockedBadgeName: string | null = null;

    // Check Badge 1: First Lab Discovery
    if (!newUnlockedBadges.includes('lab_first_discovery')) {
      newUnlockedBadges.push('lab_first_discovery');
      newPoints += 20;
      unlockedBadgeName = 'مبتكر المعمل الواعد 🧪';
    }

    // Check Badge 2: Master Chemist (3 chemistry/physics experiments)
    const chemCount = LAB_EXPERIMENTS.filter(
      (e) => e.category === 'chemistry_physics' && newCompleted.includes(e.id)
    ).length;
    if (chemCount >= 3 && !newUnlockedBadges.includes('lab_master_chemist')) {
      newUnlockedBadges.push('lab_master_chemist');
      newPoints += 30;
      unlockedBadgeName = 'كيميائي المعمل العجيب 🌋';
    }

    // Check Badge 3: Nature & Plant Explorer
    const natureCount = LAB_EXPERIMENTS.filter(
      (e) => e.category === 'nature_plants' && newCompleted.includes(e.id)
    ).length;
    if (natureCount >= 2 && !newUnlockedBadges.includes('lab_nature_explorer')) {
      newUnlockedBadges.push('lab_nature_explorer');
      newPoints += 35;
      unlockedBadgeName = 'عالم الطبيعة والبيئة 🌿';
    }

    const updatedProfile: UserProfile = {
      ...activeProfile,
      points: newPoints,
      unlockedBadgeIds: newUnlockedBadges,
      completedLabExperimentIds: newCompleted,
      labPointsEarned: (activeProfile.labPointsEarned || 0) + exp.points,
    };

    onUpdateProfile(updatedProfile);
    setJustCompletedExp(exp);
    setNewlyUnlockedBadge(unlockedBadgeName);
  };

  // Run the Mini Interactive Beaker Reaction
  const handleRunBeakerReaction = () => {
    playClick();
    setIsReacting(true);
    setReactorMessage(null);

    setTimeout(() => {
      playSparkle();
      fireDailySuccessConfetti();
      setIsReacting(false);

      if (beakerIng1 === 'baking_soda' && beakerIng2 === 'vinegar') {
        setReactorMessage('🌋 فوار بركاني عظيم! تفاعل الخل مع البيكربونات يطلق فقاعات غاز ثاني أكسيد الكربون فوراً!');
      } else if (beakerIng1 === 'milk' && beakerIng2 === 'dish_soap') {
        setReactorMessage('🎨 دوامة الألوان الراقصة! جزيئات الصابون تهاجم دهون الحليب وتكسر التوتر السطحي!');
      } else if (beakerIng1 === 'water' && beakerIng2 === 'oil') {
        setReactorMessage('💡 سر الكثافة! قطرات الزيت تطفو للأعلى لأنها أخف من الماء ولا تختلط به أبداً!');
      } else if (beakerIng1 === 'water' && beakerIng2 === 'salt') {
        setReactorMessage('🌊 مياه البحر العائمة! الملح يذوب ويزيد كثافة الماء فيرفع الأجسام لتطفو فوقه!');
      } else {
        setReactorMessage('✨ تفاعل معملي رائع! لقد اكتشفت سراً علمياً جديداً من أسرار الطبيعة!');
      }
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO LAB BANNER                                                        */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white shadow-xl border-2 border-teal-400">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-white border border-white/30">
              <FlaskConical className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>المعمل العجيب — غزل بنات.. بس بدماغ سماسم</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              معمل سماسم للاكتشاف العلمي 🔬
            </h1>

            <p className="text-sm sm:text-base font-bold text-teal-50 max-w-2xl leading-relaxed">
              تجارب علمية حقيقية، ممتعة، وآمنة 100% يمكنك تنفيذها بسهولة في البيت بأدوات المطبخ اليومية، لأن{' '}
              <span className="font-black text-amber-300 underline decoration-amber-400">
                « كل سؤال… بداية اكتشاف »
              </span>
              !
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-black text-teal-100">
              <span className="flex items-center gap-1.5 bg-teal-800/40 px-3 py-1.5 rounded-xl border border-teal-400/30">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>آمنة ومعتمدة للأطفال</span>
              </span>
              <span className="flex items-center gap-1.5 bg-teal-800/40 px-3 py-1.5 rounded-xl border border-teal-400/30">
                <Lightbulb className="w-4 h-4 text-amber-300" />
                <span>أدوات منزلية متوفرة</span>
              </span>
              <span className="flex items-center gap-1.5 bg-teal-800/40 px-3 py-1.5 rounded-xl border border-teal-400/30">
                <Zap className="w-4 h-4 text-cyan-300" />
                <span>نقاط وأوسمة فورية</span>
              </span>
            </div>
          </div>

          {/* Quick Lab Stats Card */}
          <div className="w-full md:w-auto bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white p-5 rounded-2xl border-2 border-teal-300 shadow-xl shrink-0 space-y-3 min-w-[240px]">
            <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">سجل إنجاز البطل</span>
              <h3 className="text-base font-black text-teal-800 dark:text-teal-400">{activeProfile.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-teal-50 dark:bg-slate-800 p-2.5 rounded-xl border border-teal-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">التجارب المنجزة</span>
                <span className="text-xl font-black text-teal-700 dark:text-teal-300 flex items-center justify-center gap-1 mt-0.5">
                  <Beaker className="w-4 h-4" />
                  <span>{completedIds.length} / {LAB_EXPERIMENTS.length}</span>
                </span>
              </div>

              <div className="bg-amber-50 dark:bg-slate-800 p-2.5 rounded-xl border border-amber-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">نقاط المعمل</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                  <Trophy className="w-4 h-4" />
                  <span>+{activeProfile.labPointsEarned || 0}</span>
                </span>
              </div>
            </div>

            {onOpenBadgesTab && (
              <button
                onClick={() => {
                  playClick();
                  onOpenBadgesTab();
                }}
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>عرض أوسمة وشهادة المعمل 📜</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE MINI REACTOR (ركن الكيميائي الصغير التفاعلي)                */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-teal-200 dark:border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center text-2xl shadow-xs">
              ⚗️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                ركن التفاعل السريع: أنبوب اختبار سماسم
              </h2>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                اختر عنصرين آمنين من المعمل واضغط "امزج وشاهد التفاعل" لاكتشاف النتيجة الفيزيائية فوراً!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Ingredient 1 */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              المادة الأولى:
            </label>
            <select
              value={beakerIng1}
              onChange={(e) => setBeakerIng1(e.target.value)}
              className="w-full p-3 rounded-2xl border-2 border-teal-200 dark:border-slate-700 bg-teal-50/50 dark:bg-slate-800 font-black text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="baking_soda">🥄 مسحوق بيكربونات الصوديوم (قاعدي)</option>
              <option value="milk">🥛 حليب كامل الدسم غني بالدهون</option>
              <option value="water">💧 ماء عذب نقي</option>
            </select>
          </div>

          {/* Plus sign */}
          <div className="hidden md:flex justify-center text-2xl font-black text-teal-600">
            ➕
          </div>

          {/* Ingredient 2 */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              المادة الثانية:
            </label>
            <select
              value={beakerIng2}
              onChange={(e) => setBeakerIng2(e.target.value)}
              className="w-full p-3 rounded-2xl border-2 border-teal-200 dark:border-slate-700 bg-teal-50/50 dark:bg-slate-800 font-black text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="vinegar">🧪 خل أبيض حمضي</option>
              <option value="dish_soap">🧼 قطرة صابون سائل مذيب للدهون</option>
              <option value="oil">🌻 زيت نباتي خفيف (أقل كثافة)</option>
              <option value="salt">🧂 ملح طعام لزيادة الكثافة</option>
            </select>
          </div>
        </div>

        {/* Action button & Simulation container */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleRunBeakerReaction}
            disabled={isReacting}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Play className={`w-4 h-4 ${isReacting ? 'animate-spin' : ''}`} />
            <span>{isReacting ? 'جاري المزج والتفاعل...' : 'امزج وشاهد التفاعل العلمي! ⚗️'}</span>
          </button>

          {reactorMessage && (
            <div className="flex-1 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-extrabold text-emerald-950 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{reactorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EXPERIMENT BANK FILTERS                                                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <span>بنك التجارب المنزلية الحقيقية</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ({filteredExperiments.length} تجربة متاحة)
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              اختر التجربة التي تود تنفيذها مع أسرتك خطوة بخطوة واكسب نقاط المعرفة!
            </p>
          </div>

          {/* Reset Filters if changed */}
          {(selectedCategory !== 'all' || selectedAge !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                playClick();
                setSelectedCategory('all');
                setSelectedAge('all');
                setFilterStatus('all');
              }}
              className="text-xs font-black text-teal-700 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط التصفية</span>
            </button>
          )}
        </div>

        {/* Filter bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">مجال التجربة:</span>
            <div className="grid grid-cols-2 gap-1 text-xs font-black">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                جميع المجالات 🧪
              </button>
              <button
                onClick={() => setSelectedCategory('chemistry_physics')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  selectedCategory === 'chemistry_physics'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                فيزياء وكيمياء 🌋
              </button>
              <button
                onClick={() => setSelectedCategory('motion_optics')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  selectedCategory === 'motion_optics'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                حركة وبصريات ⛵
              </button>
              <button
                onClick={() => setSelectedCategory('nature_plants')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  selectedCategory === 'nature_plants'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                نبات وبيئة 🌱
              </button>
            </div>
          </div>

          {/* Age Group Filter */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">الفئة العمرية:</span>
            <div className="grid grid-cols-3 gap-1 text-xs font-black">
              <button
                onClick={() => setSelectedAge('all')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  selectedAge === 'all'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                الكل 👶
              </button>
              <button
                onClick={() => setSelectedAge('4-7')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  selectedAge === '4-7'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ٤-٨ سنوات
              </button>
              <button
                onClick={() => setSelectedAge('8-12')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  selectedAge === '8-12'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ٨-١٢ سنة
              </button>
            </div>
          </div>

          {/* Completion Status Filter */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">حالة الإنجاز:</span>
            <div className="grid grid-cols-3 gap-1 text-xs font-black">
              <button
                onClick={() => setFilterStatus('all')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  filterStatus === 'completed'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                منجزة ✅
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  filterStatus === 'pending'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                قيد التجربة ⏳
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EXPERIMENTS CARDS LIST                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        {filteredExperiments.map((exp) => {
          const isExpanded = expandedExperimentId === exp.id;
          const isDone = completedIds.includes(exp.id);
          const currentCheckedSteps = checkedSteps[exp.id] || [];

          return (
            <div
              key={exp.id}
              className={`rounded-3xl border-2 transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden shadow-md ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-slate-900'
                  : isExpanded
                  ? 'border-teal-500 ring-2 ring-teal-400/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-teal-400'
              }`}
            >
              {/* Header Row (Clickable) */}
              <div
                onClick={() => handleToggleCard(exp.id)}
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer gap-4 hover:bg-teal-50/40 dark:hover:bg-slate-800/50 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br ${exp.heroColor} text-white flex items-center justify-center text-3xl shadow-md shrink-0`}
                  >
                    {exp.icon}
                  </div>

                  <div className="space-y-1">
                    {/* Metadata clean text with dot separator (Anti-slop compliant) */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-teal-700 dark:text-teal-400 font-extrabold">{exp.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{exp.ageLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{exp.durationMinutes} دقائق</span>
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white leading-tight">
                      {exp.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold line-clamp-1 sm:line-clamp-none">
                      {exp.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isDone ? (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full">
                      <Check className="w-4 h-4 stroke-[3] text-emerald-700" />
                      <span>تمت بنجاح ✨</span>
                    </span>
                  ) : (
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-xl">
                      +{exp.points} نقطة
                    </span>
                  )}

                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Experiment Body */}
              {isExpanded && (
                <div className="p-5 sm:p-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-6 animate-in fade-in duration-200">
                  
                  {/* Safety Tip Box */}
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-300">
                      <strong>إرشاد الأمان للعلماء الصغار:</strong> {exp.safetyTip}
                    </div>
                  </div>

                  {/* Materials & Tools Grid */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
                      <span className="text-teal-600 dark:text-teal-400">📦</span>
                      <span>الأدوات المنزلية المطلوبة (متوفرة في كل بيت):</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {exp.materials.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px] font-black shrink-0">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Steps with Interactive Checkers */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
                      <span className="text-teal-600 dark:text-teal-400">🧪</span>
                      <span>خطوات التنفيذ المبسطة (انقر على المربع عند إتمام كل خطوة):</span>
                    </h4>

                    <div className="space-y-2.5">
                      {exp.steps.map((step, sIdx) => {
                        const isStepChecked = currentCheckedSteps.includes(sIdx);

                        return (
                          <div
                            key={sIdx}
                            onClick={() => handleToggleStep(exp.id, sIdx)}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isStepChecked
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-950 dark:text-emerald-200'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-300'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isStepChecked
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {isStepChecked && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>

                            <div className="text-xs sm:text-sm font-extrabold leading-relaxed">
                              <span className="text-teal-700 dark:text-teal-400 ml-1 font-black">الخطوة {sIdx + 1}:</span>
                              <span className={isStepChecked ? 'line-through opacity-85' : ''}>{step}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scientific Explanation Card */}
                  <div className="p-5 rounded-3xl bg-linear-to-br from-purple-50 via-fuchsia-50/50 to-indigo-50 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-slate-900 border-2 border-purple-200 dark:border-purple-900/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-base shadow-xs">
                        🧠
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-purple-950 dark:text-purple-300">
                        التفسير العلمي العجيب (لماذا حدث ذلك؟):
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed pr-2">
                      {exp.scientificExplanation}
                    </p>
                  </div>

                  {/* Fun Fact Box */}
                  <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800 flex items-start gap-2.5">
                    <span className="text-xl shrink-0">💡</span>
                    <div className="text-xs sm:text-sm font-extrabold text-cyan-950 dark:text-cyan-200">
                      <strong>معلومة سماسم الكونية:</strong> {exp.funFact}
                    </div>
                  </div>

                  {/* Completion Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {isDone ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>لقد أنجزت هذه التجربة واكتسبت +{exp.points} نقطة بنجاح!</span>
                        </span>
                      ) : (
                        <span>عند إتمام التجربة في منزلك، اضغط للتأكيد وحصد النقاط والأوسمة.</span>
                      )}
                    </div>

                    {!isDone ? (
                      <button
                        onClick={() => handleCompleteExperiment(exp)}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Trophy className="w-4 h-4 text-amber-300" />
                        <span>أنجزت هذه التجربة في بيتي بنجاح! (+{exp.points} نقطة) 🧪🎉</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-black text-xs flex items-center justify-center gap-1.5 opacity-90 cursor-default"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>تم توثيق التجربة في سجلك العلمي</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredExperiments.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <span className="text-4xl block">🔍</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              لم نعثر على تجارب مطابقة لمعايير التصفية
            </h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              جرب تغيير الفئة أو العمر لعرض التجارب العلمية المتاحة.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. SUCCESS CELEBRATION MODAL                                              */}
      {/* ========================================================================= */}
      {justCompletedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-teal-400 dark:border-teal-700 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center relative animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-4xl mx-auto shadow-lg shadow-teal-500/30">
              🎉
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                مبارك يا بطل العلوم! 🔬
              </h3>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لقد أنجزت بنجاح تجربة <strong>«{justCompletedExp.title}»</strong> وأضفت رصيداً علمياً جديداً لملفك!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-600 dark:text-slate-400">النقاط المكتسبة:</span>
                <span className="text-teal-700 dark:text-teal-300 font-mono text-base">+{justCompletedExp.points} نقطة ⭐</span>
              </div>

              {newlyUnlockedBadge && (
                <div className="pt-2 border-t border-teal-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-black text-amber-700 dark:text-amber-400">
                  <span>وسام معملي جديد مفتوح:</span>
                  <span className="bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-300">
                    {newlyUnlockedBadge}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              {onOpenBadgesTab && (
                <button
                  onClick={() => {
                    setJustCompletedExp(null);
                    onOpenBadgesTab();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Award className="w-4 h-4" />
                  <span>مشاهدة الشهادة المحدثة 📜</span>
                </button>
              )}

              <button
                onClick={() => setJustCompletedExp(null)}
                className="flex-1 py-3 rounded-2xl bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white font-black text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer shadow-xs"
              >
                متابعة الاستكشاف 🚀
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
