import React, { useState, useEffect } from 'react';
import { UserProfile, Gender, Religion, ParentProfile } from '../types';
import { useSound } from '../context/SoundContext';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import {
  Rocket,
  UserPlus,
  LogIn,
  Shield,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ArrowRight,
  Mail,
  KeyRound,
  Plus,
  Trash2,
  Lock,
  RefreshCw,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import {
  sendParentOtp,
  verifyParentOtp,
  getParentByEmail,
  createParentProfile,
  isCurrentUserAdmin,
} from '../lib/samasmDatabase';

interface AuthScreenProps {
  profiles: UserProfile[];
  parents: ParentProfile[];
  onSelectProfile: (id: string) => void;
  onCreateProfile: (profile: Omit<UserProfile, 'id' | 'points' | 'unlockedBadgeIds' | 'lastSolvedDate' | 'solvedChallengesCount' | 'createdAt'>) => void;
  onParentLogin: (parent: ParentProfile) => void;
  onRegisterParentWithChildren: (
    parentData: { name: string; email: string },
    children: { name: string; packCode: string }[]
  ) => void;
  onAdminLogin: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const AVATAR_OPTIONS = ['👦', '👧', '🍭', '🚀', '🧠', '🌟', '🦁', '🐱', '🔬', '🎨', '⚡', '👑'];

// 📱 دالة مساعدة لحفظ كود الكيس على هذا الجهاز فقط
const savePackCodeToDevice = (code: string) => {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  const savedCodes: string[] = JSON.parse(
    localStorage.getItem('local_device_pack_codes') || '[]'
  );
  if (!savedCodes.includes(cleanCode)) {
    savedCodes.push(cleanCode);
    localStorage.setItem('local_device_pack_codes', JSON.stringify(savedCodes));
  }
};

export const AuthScreen: React.FC<AuthScreenProps> = ({
  profiles: initialProfiles,
  parents,
  onSelectProfile,
  onCreateProfile,
  onParentLogin,
  onRegisterParentWithChildren,
  onAdminLogin,
  isDarkMode,
  onToggleDarkMode,
}) => {
  // 🌐 Online Device Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // دالة لجلب الحسابات المسجلة على هذا الجهاز فقط أونلاين من Supabase
  const refreshDeviceProfiles = async () => {
    setIsRefreshing(true);
    try {
      const localPackCodes: string[] = JSON.parse(
        localStorage.getItem('local_device_pack_codes') || '[]'
      );

      if (localPackCodes.length === 0) {
        setProfiles([]);
        setIsRefreshing(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('pack_code', localPackCodes);

      if (data && !error) {
        const fetchedProfiles: UserProfile[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          packCode: p.pack_code || '',
          gender: p.gender || 'boy',
          avatar: p.avatar || '👦',
          religion: p.religion || 'muslim',
          points: p.points ?? 20,
          unlockedBadgeIds: p.unlocked_badge_ids || ['curiosity_spark'],
          lastSolvedDate: p.last_solved_date,
          solvedChallengesCount: p.solved_challenges_count ?? 0,
          solvedCategories: p.solved_categories || [],
          retryCount: p.retry_count ?? 0,
          mathSpeedHighScore: p.math_speed_high_score ?? 0,
          wheelSpinsCount: p.wheel_spins_count ?? 0,
          labPointsEarned: p.lab_points_earned ?? 0,
          createdAt: p.created_at,
        }));
        setProfiles(fetchedProfiles);
      }
    } catch (err) {
      console.error('Error fetching device profiles:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshDeviceProfiles();
  }, []);

  // Role Selection: 'child' | 'parent' | 'admin'
  const [selectedRole, setSelectedRole] = useState<'child' | 'parent' | 'admin'>('child');

  // Child Tab State
  const [childTab, setChildTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [packCode, setPackCode] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender>('boy');
  const [religion, setReligion] = useState<Religion>('muslim'); // 👈 إضافة الـ State في المكان الصحيح
  const [selectedAvatar, setSelectedAvatar] = useState('👦');
  const [regError, setRegError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [childLoginError, setChildLoginError] = useState('');

  // Parent Tab State
  const [parentTab, setParentTab] = useState<'login' | 'register'>(
    parents.length > 0 ? 'login' : 'register'
  );
  const [parentLoginEmail, setParentLoginEmail] = useState('');
  const [parentLoginError, setParentLoginError] = useState('');
  const [parentOtpSent, setParentOtpSent] = useState(false);
  const [parentOtp, setParentOtp] = useState('');
  const [parentAuthLoading, setParentAuthLoading] = useState(false);
  const [parentRegName, setParentRegName] = useState('');
  const [parentRegEmail, setParentRegEmail] = useState('');
  const [parentChildrenList, setParentChildrenList] = useState<Array<{ name: string; packCode: string }>>([
    { name: '', packCode: '' },
  ]);
  const [parentRegError, setParentRegError] = useState('');

  // Admin Tab State
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [adminOtp, setAdminOtp] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  const { isMuted, toggleSound, playClick, playPop, playBadgeUnlock, playTryAgain, playSuccessWhistle } = useSound();

  // Child Handlers
  const handleGenderChange = (newGender: Gender) => {
    playClick();
    setGender(newGender);
    if (newGender === 'girl' && (selectedAvatar === '👦' || selectedAvatar === '⚡')) {
      setSelectedAvatar('👧');
    } else if (newGender === 'boy' && (selectedAvatar === '👧' || selectedAvatar === '🎨')) {
      setSelectedAvatar('👦');
    }
  };

  const handleRegisterChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setRegError('يرجى كتابة اسم البطل أو البطلة!');
      playTryAgain();
      return;
    }
    if (!packCode.trim()) {
      setRegError('يرجى إدخال كود الطفل في الموقع!');
      playTryAgain();
      return;
    }

    const cleanPackCode = packCode.trim().toUpperCase();

    // 1. حفظ كود الطفل على هذا الجهاز محلياً
    savePackCodeToDevice(cleanPackCode);

    setRegError('');
    onCreateProfile({
      name: name.trim(),
      packCode: cleanPackCode,
      email: email.trim().toLowerCase() || undefined,
      gender,
      religion, // 👈 حفظ خيار المحتوى الديني
      avatar: selectedAvatar,
    });

    // إعادة تحديث القائمة لإظهار الحساب الجديد فوراً
    refreshDeviceProfiles();

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    playBadgeUnlock();
  };

  const handleDirectChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setChildLoginError('يرجى إدخال كود الكيس أو الإيميل للبحث');
      playTryAgain();
      return;
    }

    const clean = searchQuery.trim().toLowerCase();
    
    let matched = profiles.find(
      (p) =>
        p.packCode.toLowerCase() === clean ||
        p.name.trim().toLowerCase() === clean ||
        (p.email && p.email.toLowerCase() === clean)
    );

    if (!matched) {
      try {
        const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('pack_code', clean.toUpperCase());

        if (data && data.length > 0) {
          const p = data[0];
          matched = {
            id: p.id,
            name: p.name,
            packCode: p.pack_code || '',
            gender: p.gender || 'boy',
            avatar: p.avatar || '👦',
            religion: p.religion || 'muslim',
            points: p.points ?? 20,
            unlockedBadgeIds: p.unlocked_badge_ids || ['curiosity_spark'],
            lastSolvedDate: p.last_solved_date,
            solvedChallengesCount: p.solved_challenges_count ?? 0,
            solvedCategories: p.solved_categories || [],
            retryCount: p.retry_count ?? 0,
            mathSpeedHighScore: p.math_speed_high_score ?? 0,
            wheelSpinsCount: p.wheel_spins_count ?? 0,
            labPointsEarned: p.lab_points_earned ?? 0,
            createdAt: p.created_at,
          };
          savePackCodeToDevice(matched.packCode);
          await refreshDeviceProfiles();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      savePackCodeToDevice(matched.packCode);
    }

    if (matched) {
      setChildLoginError('');
      playClick();
      onSelectProfile(matched.id);
    } else {
      setChildLoginError(`لم نعثر على حساب مسجل بكود أو إيميل "${searchQuery}". تأكد من البيانات أو أنشئ حساباً جديداً!`);
      playTryAgain();
    }
  };

  // Parent Handlers
  const handleParentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentLoginError('');

    if (!parentLoginEmail.trim() || !parentLoginEmail.includes('@')) {
      setParentLoginError('يرجى إدخال بريد إلكتروني صالح');
      playTryAgain();
      return;
    }

    const cleanEmail = parentLoginEmail.trim().toLowerCase();

    try {
      setParentAuthLoading(true);

      if (!parentOtpSent) {
        await sendParentOtp(cleanEmail);
        setParentOtpSent(true);
        playSuccessWhistle();
        return;
      }

      if (!parentOtp.trim()) {
        setParentLoginError('يرجى إدخال كود التحقق المرسل إلى بريدك الإلكتروني');
        playTryAgain();
        return;
      }

      const authResult = await verifyParentOtp(cleanEmail, parentOtp);
      const authUser = authResult.user;

      if (!authUser) {
        setParentLoginError('تعذر إنشاء جلسة تسجيل الدخول. حاول مرة أخرى.');
        playTryAgain();
        return;
      }

      let parent = await getParentByEmail(cleanEmail);

      if (!parent) {
        await createParentProfile(
          authUser.id,
          'ولي أمر',
          cleanEmail
        );
        parent = await getParentByEmail(cleanEmail);
      }

      if (!parent) {
        setParentLoginError('تم تسجيل الدخول ولكن تعذر تحميل ملف ولي الأمر.');
        playTryAgain();
        return;
      }

      playSuccessWhistle();
      onParentLogin(parent);
    } catch (error: any) {
      console.error(error);
      setParentLoginError(
        error?.message || 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.'
      );
      playTryAgain();
    } finally {
      setParentAuthLoading(false);
    }
  };

  const handleAddChildToParentReg = () => {
    playPop();
    setParentChildrenList([...parentChildrenList, { name: '', packCode: '' }]);
  };

  const handleRemoveChildFromParentReg = (index: number) => {
    playClick();
    if (parentChildrenList.length > 1) {
      setParentChildrenList(parentChildrenList.filter((_, i) => i !== index));
    }
  };

  const handleParentRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParentRegError('');

    if (!parentRegName.trim()) {
      setParentRegError('يرجى كتابة اسم ولي الأمر');
      playTryAgain();
      return;
    }

    if (!parentRegEmail.trim() || !parentRegEmail.includes('@')) {
      setParentRegError('يرجى إدخال بريد إلكتروني صحيح');
      playTryAgain();
      return;
    }

    const validChildren = parentChildrenList.filter(c => c.name.trim() && c.packCode.trim());
    if (validChildren.length === 0) {
      setParentRegError('يرجى إضافة طفل واحد على الأقل مع الاسم وكود الكيس');
      playTryAgain();
      return;
    }

    validChildren.forEach(child => savePackCodeToDevice(child.packCode));

    onRegisterParentWithChildren(
      { name: parentRegName.trim(), email: parentRegEmail.trim().toLowerCase() },
      validChildren
    );

    refreshDeviceProfiles();
    playSuccessWhistle();
  };

  // Admin Handlers
  const handleAdminOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
  
    const cleanEmail = adminEmailInput.trim().toLowerCase();
  
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAdminError('يرجى إدخال بريد إلكتروني صالح لمدير النظام');
      playTryAgain();
      return;
    }
  
    try {
      setAdminAuthLoading(true);
  
      // المرحلة الأولى: إرسال OTP
      if (!adminOtpSent) {
        await sendParentOtp(cleanEmail);
  
        setAdminOtpSent(true);
        setAdminOtp('');
        playSuccessWhistle();
  
        return;
      }
  
      // المرحلة الثانية: التحقق من OTP
      if (!adminOtp.trim()) {
        setAdminError('يرجى إدخال كود التحقق المرسل إلى بريد الأدمن');
        playTryAgain();
        return;
      }
  
      const authResult = await verifyParentOtp(
        cleanEmail,
        adminOtp.trim()
      );
  
      if (!authResult.user) {
        setAdminError('تعذر إنشاء جلسة الأدمن. حاول مرة أخرى.');
        playTryAgain();
        return;
      }
  
      // التحقق من أن المستخدم Admin فعلاً
      const isAdmin = await isCurrentUserAdmin();
  
      if (!isAdmin) {
        await supabase.auth.signOut();
        setAdminError('هذا الحساب لا يمتلك صلاحيات مدير النظام.');
        playTryAgain();
        return;
      }
  
      playSuccessWhistle();
      onAdminLogin();
    } catch (error: any) {
      console.error('Admin authentication error:', error);
  
      setAdminError(
        error?.message ||
        'حدث خطأ أثناء إرسال أو التحقق من كود الأدمن.'
      );
  
      playTryAgain();
    } finally {
      setAdminAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-3 sm:px-6 bg-linear-to-b from-amber-50 via-pink-50 to-sky-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Bar Utilities */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border-2 border-pink-200 dark:border-pink-800 p-1 flex items-center justify-center shadow-xs">
            <img
              src="/logo.png"
              alt="سماسم"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="font-black text-lg bg-linear-to-r from-pink-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
            سماسم
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-pink-300 text-slate-700 dark:text-amber-300 shadow-xs cursor-pointer transition-colors"
            title="تبديل الوضع الليلي / النهاري"
            aria-label="تبديل الوضع"
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-pink-300 text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer transition-colors"
            title="كتم أو تشغيل الصوت"
            aria-label="التحكم بالصوت"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-lg w-full mx-auto my-auto py-3">
        
        {/* Brand Header */}
        <div className="text-center mb-5 space-y-1.5">
          <div className="relative inline-block mx-auto mb-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-2 bg-white dark:bg-slate-800 border-4 border-amber-300 dark:border-amber-500 shadow-xl flex items-center justify-center mx-auto transform hover:rotate-2 transition-transform">
              <img
                src="/logo.png"
                alt="شخصية سماسم"
                className="w-full h-full object-contain filter drop-shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white dark:border-slate-800 animate-bounce">
              ✨ مرحباً!
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black bg-linear-to-r from-pink-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
            سماسم — كل سؤال… بداية اكتشاف
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-pink-700 dark:text-pink-400">
            غزل بنات.. بس بدماغ سماسم 🍭
          </p>
        </div>

        {/* ROLE SELECTOR TABS */}
        <div className="bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-3xl border-2 border-purple-200 dark:border-purple-900/80 shadow-md grid grid-cols-3 gap-1.5 mb-4">
          <button
            type="button"
            onClick={() => {
              playClick();
              setSelectedRole('child');
            }}
            className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'child'
                ? 'bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-102'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-lg">👦👧</span>
            <span>بطل (طفل)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              setSelectedRole('parent');
            }}
            className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'parent'
                ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 scale-102'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-lg">👨‍👩‍👧‍👦</span>
            <span>ولي أمر</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              setSelectedRole('admin');
            }}
            className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-linear-to-r from-red-600 to-rose-700 text-white shadow-md shadow-red-600/25 scale-102'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span>مدير النظام</span>
          </button>
        </div>

        {/* MAIN BODY CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-pink-200 dark:border-indigo-900/80 shadow-xl transition-colors">
          
          {/* CHILD VIEW */}
          {selectedRole === 'child' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setChildTab('login');
                    setChildLoginError('');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    childTab === 'login'
                      ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>دخول بطل مسجل</span>
                  {profiles.length > 0 && (
                    <span className="font-mono bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-1.5 rounded-full text-[10px]">
                      {profiles.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setChildTab('register');
                    setRegError('');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    childTab === 'register'
                      ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>تسجيل بطل جديد</span>
                </button>
              </div>

              {childTab === 'login' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200">
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="text-right">
                        <span className="text-[11px] font-bold block text-slate-500 dark:text-slate-400">
                          حسابات هذا الجهاز أونلاين:
                        </span>
                        <span className="text-xs font-black text-purple-950 dark:text-white">
                          {profiles.length > 0 ? (
                            <>تم جلب <strong className="font-mono text-purple-700 dark:text-purple-300">{profiles.length}</strong> بطل مسجل على هذا الجهاز</>
                          ) : (
                            'لا توجد حسابات مسجلة على هذا الجهاز بعد'
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={refreshDeviceProfiles}
                      disabled={isRefreshing}
                      className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer flex items-center justify-center"
                      title="تحديث البيانات أونلاين"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <form onSubmit={handleDirectChildLogin} className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ادخل كود الكيس أو الاسم (مثال: SMSM-7701)"
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-pink-500 font-mono font-bold text-xs"
                      />
                      <button
                        type="submit"
                        className="absolute left-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-xs cursor-pointer"
                      >
                        دخول
                      </button>
                    </div>

                    {childLoginError && (
                      <p className="text-xs font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                        {childLoginError}
                      </p>
                    )}
                  </form>

                  {profiles.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 block text-right">
                        اختر حسابك المسجل للدخول:
                      </span>
                      {profiles.map((p) => {
                        const isGirl = p.gender === 'girl';
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              playClick();
                              onSelectProfile(p.id);
                            }}
                            className="cursor-pointer p-2.5 rounded-2xl border-2 border-pink-100 dark:border-slate-800 hover:border-pink-400 dark:hover:border-pink-600 bg-pink-50/40 dark:bg-slate-800/50 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between group active:scale-98"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 border-2 border-amber-200 dark:border-amber-600/60 flex items-center justify-center text-xl shadow-xs">
                                {p.avatar}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-black text-slate-950 dark:text-white text-xs sm:text-sm">
                                    {p.name}
                                  </h4>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                    isGirl
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  }`}>
                                    {isGirl ? 'بطلة' : 'بطل'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                  <span className="font-mono bg-pink-100 dark:bg-pink-950 text-pink-900 dark:text-pink-300 px-1 py-0.2 rounded text-[10px]">
                                    {p.packCode}
                                  </span>
                                  <span className="text-amber-600 dark:text-amber-400 font-black text-[11px]">
                                    ⭐ {p.points}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-black text-pink-600 dark:text-pink-400 group-hover:translate-x-[-3px] transition-transform">
                              <span>دخول</span>
                              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-2.5">
                      <div className="text-3xl">📱</div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        لا توجد حسابات أبطال مسجلة على هذا الجهاز بعد.
                      </p>
                      <button
                        onClick={() => {
                          playClick();
                          setChildTab('register');
                        }}
                        className="px-4 py-2 rounded-xl bg-pink-500 text-white font-black text-xs shadow-md cursor-pointer"
                      >
                        تسجيل بطل جديد الآن 🚀
                      </button>
                    </div>
                  )}
                </div>
              )}

              {childTab === 'register' && (
                <form onSubmit={handleRegisterChildSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                      النوع:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenderChange('boy')}
                        className={`py-2 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          gender === 'boy'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-blue-200 shadow-xs ring-2 ring-blue-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-lg">👦</span>
                        <span>بطل (ولد)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenderChange('girl')}
                        className={`py-2 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          gender === 'girl'
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-950 text-pink-950 dark:text-pink-200 shadow-xs ring-2 ring-pink-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-lg">👧</span>
                        <span>بطلة (بنت)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                      اسم {gender === 'girl' ? 'البطلة' : 'البطل'}:
                    </label>
                    <input
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={gender === 'girl' ? 'مثال: سارة، ليان، جنى...' : 'مثال: عمر، يوسف، أحمد...'}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* 👈 اختيار المحتوى الديني في المكان الصحيح */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                      تفعيل المحتوى الديني (الإسلاميات):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          setReligion('muslim');
                        }}
                        className={`py-2 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          religion === 'muslim'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 ring-2 ring-amber-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>🌙 قسم الإسلاميات</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          setReligion('other');
                        }}
                        className={`py-2 px-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          religion !== 'muslim'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-950 dark:text-purple-200 ring-2 ring-purple-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>✨ عام / ثقافة وأخلاقيات</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200">
                        كود الطفل في الموقع (كود الكيس) *:
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          const generated = 'SMSM-' + Math.floor(1000 + Math.random() * 9000);
                          setPackCode(generated);
                        }}
                        className="text-[10px] font-black text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-lg cursor-pointer"
                      >
                        🎲 كود تلقائي
                      </button>
                    </div>
                    <input
                      type="text"
                      value={packCode}
                      onChange={(e) => setPackCode(e.target.value.toUpperCase())}
                      placeholder="مثال: SMSM-7701"
                      dir="ltr"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-mono font-black text-xs sm:text-sm tracking-wider"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                      اختر الرمز المفضل:
                    </label>
                    <div className="flex flex-wrap gap-1.5 justify-center bg-pink-50/60 dark:bg-slate-800/60 p-2 rounded-2xl border border-pink-200 dark:border-slate-700">
                      {AVATAR_OPTIONS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => {
                            playPop();
                            setSelectedAvatar(av);
                          }}
                          className={`text-xl p-1.5 rounded-xl transition-all cursor-pointer ${
                            selectedAvatar === av
                              ? 'bg-amber-400 scale-115 shadow-xs ring-2 ring-amber-500'
                              : 'hover:bg-pink-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {regError && (
                    <p className="text-xs font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-xl border border-rose-200">
                      {regError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl bg-linear-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>حفظ أونلاين وبدء مغامرة الاكتشاف! 🚀</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* PARENT VIEW */}
          {selectedRole === 'parent' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-1.5 bg-purple-50 dark:bg-slate-800/80 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setParentTab('login');
                    setParentLoginError('');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    parentTab === 'login'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>دخول ولي أمر</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setParentTab('register');
                    setParentRegError('');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    parentTab === 'register'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>تسجيل جديد لولي الأمر</span>
                </button>
              </div>

              {parentTab === 'login' && (
                <form onSubmit={handleParentLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                      البريد الإلكتروني لولي الأمر:
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={parentLoginEmail}
                        onChange={(e) => setParentLoginEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-xs"
                        required
                        disabled={parentOtpSent}
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {parentOtpSent && (
                    <div>
                      <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                        كود التحقق المرسل إلى بريدك:
                      </label>
                      <input
                        type="text"
                        value={parentOtp}
                        onChange={(e) => setParentOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-mono font-black text-center text-sm"
                        required
                      />
                    </div>
                  )}

                  {parentLoginError && (
                    <p className="text-xs font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200">
                      {parentLoginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={parentAuthLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {parentAuthLoading ? (
                      <span>جاري المعالجة...</span>
                    ) : parentOtpSent ? (
                      <span>تأكيد الدخول 🔑</span>
                    ) : (
                      <span>إرسال كود التحقق ✉️</span>
                    )}
                  </button>
                </form>
              )}

              {parentTab === 'register' && (
                <form onSubmit={handleParentRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                      اسم ولي الأمر:
                    </label>
                    <input
                      type="text"
                      value={parentRegName}
                      onChange={(e) => setParentRegName(e.target.value)}
                      placeholder="مثال: أ. محمد أحمد"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
                      البريد الإلكتروني:
                    </label>
                    <input
                      type="email"
                      value={parentRegEmail}
                      onChange={(e) => setParentRegEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-2 border-t pt-2 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        ربط الأبناء والطلب بولي الأمر:
                      </span>
                      <button
                        type="button"
                        onClick={handleAddChildToParentReg}
                        className="text-[11px] font-black text-purple-600 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> إضافة طفل
                      </button>
                    </div>

                    {parentChildrenList.map((c, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="اسم الطفل"
                          value={c.name}
                          onChange={(e) => {
                            const updated = [...parentChildrenList];
                            updated[idx].name = e.target.value;
                            setParentChildrenList(updated);
                          }}
                          className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="كود الكيس (SMSM-7701)"
                          value={c.packCode}
                          onChange={(e) => {
                            const updated = [...parentChildrenList];
                            updated[idx].packCode = e.target.value.toUpperCase();
                            setParentChildrenList(updated);
                          }}
                          className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                        />
                        {parentChildrenList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChildFromParentReg(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {parentRegError && (
                    <p className="text-xs font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200">
                      {parentRegError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    إنشاء وربط الحسابات أونلاين 🚀
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ADMIN VIEW */}
          {selectedRole === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-950 dark:text-red-200">
                <Lock className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span className="text-xs font-black">
                  منطقة خاصة بمدير النظام والمسؤولين فقط 🔒
                </span>
              </div>

              {!adminOtpSent ? (
  <form onSubmit={handleAdminOtpSubmit} className="space-y-3">
    <div>
      <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
        بريد مدير النظام:
      </label>

      <div className="relative">
        <input
          type="email"
          value={adminEmailInput}
          onChange={(e) => {
            setAdminEmailInput(e.target.value);
            setAdminError('');
          }}
          placeholder="admin@example.com"
          dir="ltr"
          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-xs"
          required
        />

        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      </div>
    </div>

    {adminError && (
      <p className="text-xs font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200">
        {adminError}
      </p>
    )}

    <button
      type="submit"
      disabled={adminAuthLoading}
      className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all"
    >
      {adminAuthLoading ? 'جاري إرسال رمز التحقق...' : 'إرسال رمز التحقق 📩'}
    </button>
  </form>
) : (
  <form onSubmit={handleAdminOtpSubmit} className="space-y-3">

    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-black flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        تم إرسال رمز التحقق إلى بريد الأدمن
      </span>

      <button
        type="button"
        onClick={() => {
          setAdminOtpSent(false);
          setAdminOtp('');
          setAdminError('');
        }}
        className="text-[10px] text-slate-500 underline hover:text-slate-800"
      >
        تغيير البريد
      </button>
    </div>

    <div>
      <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-1 text-right">
        رمز التحقق OTP:
      </label>

      <div className="relative">
        <input
          type="text"
          value={adminOtp}
          onChange={(e) => {
            setAdminOtp(e.target.value.replace(/\D/g, '').slice(0, 8));
            setAdminError('');
          }}
          placeholder="12345678"
          dir="ltr"
          inputMode="numeric"
          maxLength={8}
          autoFocus
          className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-red-300 dark:border-red-800 bg-white dark:bg-slate-800 text-slate-950 dark:text-white font-mono font-black text-center tracking-[0.5em] text-lg"
          required
        />

        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
      </div>
    </div>

    {adminError && (
      <p className="text-xs font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200">
        {adminError}
      </p>
    )}

    <button
      type="submit"
      disabled={adminAuthLoading}
      className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all"
    >
      {adminAuthLoading
        ? 'جاري التحقق من صلاحيات الأدمن...'
        : 'تحقق ودخول لوحة التحكم 🔓'}
    </button>
  </form>
)}
            </div>
          )}

        </div>
      </div>

      {/* Footer text */}
      <div className="max-w-4xl w-full mx-auto text-center py-2">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          صُنع بحب لأبطال وبطلات المعرفة ❤️ سماسم 2026
        </p>
      </div>

    </div>
  );
};