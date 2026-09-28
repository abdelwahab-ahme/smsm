import React, { useState } from 'react';
import { UserProfile, ParentProfile } from '../types';
import { INITIAL_BADGES, getTodayDateString } from '../utils/storage';
import { useSound } from '../context/SoundContext';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  LogOut, 
  Compass, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Lightbulb,
  ShieldCheck,
  GraduationCap,
  Award as CertificateIcon
} from 'lucide-react';

interface ParentDashboardProps {
  parent: ParentProfile;
  allProfiles: UserProfile[];
  onUpdateParent: (updated: ParentProfile) => void;
  onUpdateProfiles?: (updated: UserProfile[]) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onPreviewChildCertificate?: (child: UserProfile) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  parent,
  allProfiles,
  onUpdateParent,
  onUpdateProfiles,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onPreviewChildCertificate,
}) => {
  const [newChildName, setNewChildName] = useState('');
  const [newChildCode, setNewChildCode] = useState('');
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [canAutoCreateChild, setCanAutoCreateChild] = useState<{ name: string; code: string } | null>(null);
  const [unlinkConfirmChild, setUnlinkConfirmChild] = useState<{ code: string; name: string } | null>(null);

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { playClick, playPop, playSuccessWhistle, playTryAgain, isMuted, toggleSound } = useSound();
  const todayStr = getTodayDateString();

  // جلب الأطفال المرتبطين بحساب ولي الأمر
  const linkedChildren = allProfiles.filter((p) =>
    parent.linkedPackCodes.some((code) => code.toUpperCase() === p.packCode.toUpperCase())
  );

  // تحديد الطفل المختار حالياً
  const currentChild = selectedChildId
    ? linkedChildren.find((c) => c.id === selectedChildId) || linkedChildren[0] || null
    : linkedChildren[0] || null;

  // التعامل مع تقديم نموذج ربط الطفل
  const handleLinkChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');
    setCanAutoCreateChild(null);

    if (!newChildCode.trim()) {
      setLinkError('يرجى إدخال كود الطفل المكتوب على كيس سماسم');
      playTryAgain();
      return;
    }

    const cleanCode = newChildCode.trim().toUpperCase();

    if (parent.linkedPackCodes.includes(cleanCode)) {
      setLinkError('هذا الطفل مرتبط بحسابك بالفعل!');
      playTryAgain();
      return;
    }

    const matchedProfile = allProfiles.find((p) => p.packCode.toUpperCase() === cleanCode);

    if (!matchedProfile) {
      if (onUpdateProfiles) {
        setCanAutoCreateChild({
          name: newChildName.trim() || 'بطل سماسم',
          code: cleanCode,
        });
        setLinkError(`لم يتم العثور على بطل مسجل بالكود "${cleanCode}" بعد. يمكنك الضغط على زر الإنشاء بالأسفل لإنشاء ملفه وربطه فوراً!`);
      } else {
        setLinkError(`لم يتم العثور على بطل مسجل بالكود "${cleanCode}". تأكد من كتابة الكود بشكل صحيح.`);
      }
      playTryAgain();
      return;
    }

    const updatedCodes = [...parent.linkedPackCodes, cleanCode];
    onUpdateParent({
      ...parent,
      linkedPackCodes: updatedCodes,
    });
    setLinkSuccess(`تم ربط حساب البطل "${matchedProfile.name}" بنجاح! 🎉`);
    playSuccessWhistle();
    setNewChildCode('');
    setNewChildName('');
    setIsLinkingOpen(false);
  };

  const handleAutoCreateAndLink = () => {
    if (!canAutoCreateChild || !onUpdateProfiles) return;
    const { name, code } = canAutoCreateChild;
    const newChildProfile: UserProfile = {
      id: 'hero-' + Date.now(),
      name: name,
      packCode: code,
      gender: 'boy',
      avatar: '👦',
      points: 20,
      unlockedBadgeIds: ['curiosity_spark'],
      lastSolvedDate: null,
      solvedChallengesCount: 0,
      solvedCategories: [],
      createdAt: new Date().toISOString(),
    };

    onUpdateProfiles([...allProfiles, newChildProfile]);

    const updatedCodes = [...parent.linkedPackCodes, code];
    onUpdateParent({
      ...parent,
      linkedPackCodes: updatedCodes,
    });

    setLinkSuccess(`تم إنشاء حساب البطل "${name}" وربطه بلوحة متابعتك بنجاح! 🎉`);
    playSuccessWhistle();
    setNewChildCode('');
    setNewChildName('');
    setCanAutoCreateChild(null);
    setIsLinkingOpen(false);
  };

  const handleUnlinkChild = (packCode: string, name: string) => {
    playClick();
    setUnlinkConfirmChild({ code: packCode, name });
  };

  const confirmUnlink = () => {
    if (!unlinkConfirmChild) return;
    const updatedCodes = parent.linkedPackCodes.filter(
      (c) => c.toUpperCase() !== unlinkConfirmChild.code.toUpperCase()
    );
    onUpdateParent({
      ...parent,
      linkedPackCodes: updatedCodes,
    });
    setUnlinkConfirmChild(null);
    setSelectedChildId(null);
    playPop();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50/70 via-purple-50/50 to-pink-50/60 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b-2 border-purple-200 dark:border-purple-900/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950 border-2 border-purple-300 dark:border-purple-800 p-1 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                  سماسم — بوابة ولي الأمر
                </span>
                <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-300">
                  متابعة الأبناء 👨‍👩‍👧‍👦
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                مرحباً بك: <strong className="font-mono text-purple-700 dark:text-purple-300">{parent.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-300 shadow-xs cursor-pointer"
              title="تبديل الوضع"
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleSound}
              className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer"
              title="التحكم بالصوت"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                playClick();
                onLogout();
              }}
              className="px-3.5 py-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تسجيل الخروج والعودة لاختيار الدور"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Welcome & Overview Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-purple-300 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-right space-y-2">
              <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-black backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>لوحة متابعة نشاط وتطور الأبناء</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                تابع شغف وتطور أبطالك الصغار يومياً 🌟
              </h1>
              <p className="text-xs sm:text-sm text-purple-100 font-bold max-w-xl leading-relaxed">
                هنا يمكنك متابعة إنجاز الأبناء للتحديات العلمية اليومية، رصيد النقاط، الأوسمة المكتسبة، وقراءة توصيات تربوية علمية مخصصة.
              </p>
            </div>

            <button
              onClick={() => {
                playClick();
                setIsLinkingOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-transform cursor-pointer shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ ربط طفل جديد</span>
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {linkSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-black flex items-center justify-between">
            <span>{linkSuccess}</span>
            <button onClick={() => setLinkSuccess('')} className="p-1 hover:opacity-75">✕</button>
          </div>
        )}

        {/* Link New Child Form Drawer */}
        {isLinkingOpen && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-purple-300 dark:border-purple-800 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-600" />
                <span>ربط حساب طفل بكود كيس سماسم</span>
              </h3>
              <button
                onClick={() => setIsLinkingOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkChildSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                    اسم الطفل (للتأكيد):
                  </label>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="مثال: يوسف، سارة..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1">
                    كود الطفل في الموقع (كود الكيس) *:
                  </label>
                  <input
                    type="text"
                    value={newChildCode}
                    onChange={(e) => setNewChildCode(e.target.value.toUpperCase())}
                    placeholder="مثال: SMSM-7701"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white font-mono font-black text-sm tracking-wider"
                    required
                  />
                </div>
              </div>

              {linkError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 text-rose-900 dark:text-rose-200 text-xs font-black space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{linkError}</span>
                  </div>
                  {canAutoCreateChild && (
                    <button
                      type="button"
                      onClick={handleAutoCreateAndLink}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>تفعيل وتسجيل البطل "{canAutoCreateChild.name}" بهذا الكود وربطه فوراً 🚀</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLinkingOpen(false);
                    setCanAutoCreateChild(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  تأكيد الربط
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Children Selector Tabs */}
        {linkedChildren.length > 0 ? (
          <div className="space-y-6">
            
            {/* Children Switcher Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-black text-slate-500 shrink-0 ml-1">
                الأبناء المرتبطون ({linkedChildren.length}):
              </span>
              {linkedChildren.map((child) => {
                const isSelected = currentChild?.id === child.id;
                const isSolvedToday = child.lastSolvedDate === todayStr;

                return (
                  <button
                    key={child.id}
                    onClick={() => {
                      playClick();
                      setSelectedChildId(child.id);
                    }}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-100 dark:bg-purple-950/80 text-purple-950 dark:text-purple-200 shadow-md ring-2 ring-purple-300'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{child.avatar}</span>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span>{child.name}</span>
                        {isSolvedToday ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="أكمل تحدي اليوم" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="لم يحل اليوم بعد" />
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-purple-700 dark:text-purple-400">
                        {child.packCode}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Child Detailed Activity Card */}
            {currentChild && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-200 dark:border-purple-900/80 p-5 sm:p-7 shadow-xl space-y-6">
                
                {/* Child Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-amber-300 to-pink-400 p-1 flex items-center justify-center text-4xl shadow-md">
                      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[20px] flex items-center justify-center">
                        {currentChild.avatar}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                          البطل: {currentChild.name}
                        </h2>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                          currentChild.gender === 'girl'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                        }`}>
                          {currentChild.gender === 'girl' ? 'بطلة 👧' : 'بطل 👦'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-lg border border-purple-300">
                          كود الكيس: {currentChild.packCode}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          مسجل منذ: {currentChild.createdAt ? currentChild.createdAt.split('T')[0] : 'سابقاً'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onPreviewChildCertificate && (
                      <button
                        onClick={() => onPreviewChildCertificate(currentChild)}
                        className="px-3 py-2 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 text-xs font-black flex items-center gap-1 border border-purple-200 cursor-pointer"
                        title="عرض شهادة التقدير"
                      >
                        <CertificateIcon className="w-3.5 h-3.5" />
                        <span>الشهادة 📜</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleUnlinkChild(currentChild.packCode, currentChild.name)}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-black flex items-center gap-1 border border-rose-200 cursor-pointer"
                      title="فك ارتباط الطفل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>فك الارتباط</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  
                  {/* Today status */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      حالة تحدي اليوم:
                    </span>
                    {currentChild.lastSolvedDate === todayStr ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>أنجز التحدي اليوم! 🎉</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base">
                        <Clock className="w-5 h-5 shrink-0" />
                        <span>في انتظار الإنجاز اليوم</span>
                      </div>
                    )}
                  </div>

                  {/* Points */}
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block mb-1">
                      رصيد نقاط المعرفة:
                    </span>
                    <div className="flex items-center gap-1.5 text-amber-950 dark:text-amber-200 font-black text-xl">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span>{currentChild.points}</span>
                      <span className="text-xs font-bold">نقطة</span>
                    </div>
                  </div>

                  {/* Solved Count */}
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-400 block mb-1">
                      التحديات المحلولة:
                    </span>
                    <div className="flex items-center gap-1.5 text-blue-950 dark:text-blue-200 font-black text-xl">
                      <Compass className="w-5 h-5 text-blue-500" />
                      <span>{currentChild.solvedChallengesCount}</span>
                      <span className="text-xs font-bold">تحدياً</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-400 block mb-1">
                      الأوسمة المكتسبة:
                    </span>
                    <div className="flex items-center gap-1.5 text-purple-950 dark:text-purple-200 font-black text-xl">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span>{currentChild.unlockedBadgeIds.length}</span>
                      <span className="text-xs font-bold">أوسمة شرفية</span>
                    </div>
                  </div>

                </div>

                {/* Badges Showcase */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>أوسمة الشرف العلمية التي حصدها {currentChild.name}:</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {INITIAL_BADGES.map((b) => {
                      const isUnlocked = currentChild.unlockedBadgeIds.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2.5 ${
                            isUnlocked
                              ? 'bg-amber-50/80 dark:bg-slate-800 border-amber-300 dark:border-amber-700 shadow-xs'
                              : 'bg-slate-100/60 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                          }`}
                        >
                          <span className="text-2xl">{b.icon}</span>
                          <div className="text-right">
                            <span className="text-xs font-black block text-slate-900 dark:text-white leading-tight">
                              {b.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {isUnlocked ? 'مكتسب ✅' : 'قيد الاستكشاف 🔒'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actionable Educational Advice for Parent */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-sm">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <span>نصيحة سماسم لولي الأمر اليوم 💡</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 leading-relaxed">
                    {currentChild.points > 100
                      ? `ما شاء الله! البطل ${currentChild.name} يظهر فضولاً علمياً مبهراً بتخطيه ${currentChild.points} نقطة. شجعه اليوم على تجربة أحد تفاعلات "المعمل العجيب" في المنزل ومشاركتك اكتشافه!`
                      : `شجع ${currentChild.name} على حل التحدي اليومي وقراءة التفسير العلمي المبسط المكتوب خلف كيس سماسم، فهذا يعزز شغفه بالسؤال والاستكشاف!`}
                  </p>
                </div>

              </div>
            )}

          </div>
        ) : (
          /* Empty state: No children linked yet */
          <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-purple-300 dark:border-purple-800 shadow-sm space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
              👨‍👩‍👧‍👦
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                لم تقم بربط أي بطل بعد
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                للبدء في متابعة أبنائك، يرجى الضغط على زر "ربط طفل جديد" وإدخال كود الكيس المطبوع على عبوة سماسم.
              </p>
            </div>
            <button
              onClick={() => {
                playClick();
                setIsLinkingOpen(true);
              }}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>ربط أول طفل الآن</span>
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-purple-200 dark:border-slate-800 py-4 text-center text-xs font-bold text-slate-500">
        <p>بوابة ولي الأمر • تطبيق سماسم التعليمي والترفيهي للأطفال 🍭</p>
      </footer>

      {/* In-App Unlink Child Confirmation Modal */}
      {unlinkConfirmChild && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border-2 border-rose-300 dark:border-rose-800 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                تأكيد فك الارتباط
              </h3>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                هل أنت متأكد من فك ارتباط حساب البطل <strong className="text-purple-700 dark:text-purple-300">"{unlinkConfirmChild.name}"</strong> من لوحة المتابعة الخاصة بك؟
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setUnlinkConfirmChild(null)}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmUnlink}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                نعم، فك الارتباط
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};