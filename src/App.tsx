import React, { useState, useEffect } from 'react';
import { UserProfile, ParentProfile, UserRole } from './types';
import { supabase } from './lib/supabase';
import { fetchQuestionBank } from './lib/questionBankDb';
import { setActiveQuestionBank } from './data/questionBank';
import {
  getChildrenByParentId,
  createChildProfileInDb,
  updateChildProfileInDb,
  deleteChildProfileFromDb,
  getUserProfileById,
  getParentByEmail,
  isCurrentUserAdmin,
  signOutSupabase,
  testSupabaseConnection,
  loadAdminData,
  createParentByAdmin,
} from './lib/samasmDatabase';
import { logAction } from './lib/audit';

const ACTIVE_CHILD_KEY = 'samasm_active_child_id';
import { SoundProvider, useSound } from './context/SoundContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DailyChallenge } from './components/DailyChallenge';
import { BadgesAndCertificate } from './components/BadgesAndCertificate';
import { SimsimLab } from './components/SimsimLab';
import { GamifiedLearningZone } from './components/GamifiedLearningZone';
import { ProfileModal } from './components/ProfileModal';
import { MotivationalQuoteCard } from './components/MotivationalQuoteCard';
import { WelcomeModal } from './components/WelcomeModal';
import { Shield, Heart, LogOut, Sun, Moon, Volume2, VolumeX } from 'lucide-react';

function AppContent() {
  // Profiles (Students / Children)
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);

  // Parents
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [activeParentId, setActiveParentIdState] = useState<string | null>(null);

  // Active Role: 'child' | 'parent' | 'admin' | null
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Child App Tabs
  const [currentTab, setCurrentTab] = useState<'challenge' | 'badges' | 'lab' | 'games'>('challenge');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const { playClick, isMuted, toggleSound } = useSound();
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [bankVersion, setBankVersion] = useState<number>(0);
  // ----------------------------------------------------
  // 🌐 Supabase Integration & Direct Database Sync
  // ----------------------------------------------------
  useEffect(() => {
    testSupabaseConnection().then((result) => {
      if (!result.success) console.error('❌ خطأ في الاتصال بـ Supabase:', result.error);
    });
  }, []);
  // 📚 تحميل بنك الأسئلة من الداتابيز (متاح للكل)
  useEffect(() => {
    fetchQuestionBank().then((rows) => {
      if (rows && rows.length > 0) {
        setActiveQuestionBank(rows);
        setBankVersion((v) => v + 1);
      }
    });
  }, []);
  // 📥 تحميل كل البيانات للأدمن فقط بعد تأكيد صلاحياته
  useEffect(() => {
    if (activeRole !== 'admin' || !isAdminAuthenticated) return;
    let cancelled = false;
    loadAdminData().then(({ profiles: allProfiles, parents: allParents }) => {
      if (cancelled) return;
      setProfiles(allProfiles);
      setParents(allParents);
    });
    return () => {
      cancelled = true;
    };
  }, [activeRole, isAdminAuthenticated]);
  // ♻️ استرجاع الجلسة بعد تحديث الصفحة
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          if (await isCurrentUserAdmin()) {
            if (!mounted) return;
            setIsAdminAuthenticated(true);
            setActiveRoleState('admin');
            setIsLoggedIn(true);
            return;
          }

          const email = session.user.email?.toLowerCase();
          const parent = email ? await getParentByEmail(email) : null;
          if (parent) {
            if (!mounted) return;
            setParents((prev) => (prev.some((p) => p.id === parent.id) ? prev : [...prev, parent]));
            setActiveParentIdState(parent.id);
            setActiveRoleState('parent');
            setIsLoggedIn(true);
            return;
          }
        }

        const savedChildId = localStorage.getItem(ACTIVE_CHILD_KEY);
        if (savedChildId) {
          const child = await getUserProfileById(savedChildId);
          if (!mounted) return;
          if (child) {
            setProfiles((prev) => (prev.some((p) => p.id === child.id) ? prev : [...prev, child]));
            setActiveProfileIdState(child.id);
            setActiveRoleState('child');
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem(ACTIVE_CHILD_KEY);
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);
  // Dark Mode Sync with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    playClick();
    setIsDarkMode((prev) => !prev);
  };

  // ----------------------------------------------------
  // Child Profile Handlers
  // ----------------------------------------------------
  const handleSelectProfile = async (id: string) => {
    // لو بيانات الطفل مش في الـ state (اتسجل من جهاز تاني مثلاً) هاتها من الداتابيز
    if (!profiles.some((p) => p.id === id)) {
      const fetched = await getUserProfileById(id);
      if (fetched) {
        setProfiles((prev) => (prev.some((p) => p.id === fetched.id) ? prev : [...prev, fetched]));
      }
    }
    localStorage.setItem(ACTIVE_CHILD_KEY, id);
    setActiveProfileIdState(id);
    setActiveRoleState('child');
    setIsLoggedIn(true);
    setCurrentTab('challenge');
    logAction('child_login', { entity: 'user_profiles', entityId: id });
  };

  const handleCreateProfile = async (data: Omit<UserProfile, 'id' | 'points' | 'unlockedBadgeIds' | 'lastSolvedDate' | 'solvedChallengesCount' | 'createdAt'>) => {
    const newProfile: UserProfile = {
      ...data,
      id: crypto.randomUUID(),
      points: 20,
      unlockedBadgeIds: ['curiosity_spark'],
      lastSolvedDate: null,
      solvedChallengesCount: 0,
      solvedCategories: [],
      createdAt: new Date().toISOString(),
    };

    const saved = await createChildProfileInDb(newProfile, activeParentId || undefined);
    if (!saved) {
      alert('تعذر حفظ الحساب في قاعدة البيانات. ربما كود الكيس مستخدم من قبل، أو حدثت مشكلة اتصال.');
      return;
    }

    setProfiles((prev) => [...prev, newProfile]);
    localStorage.setItem(ACTIVE_CHILD_KEY, newProfile.id);
    setActiveProfileIdState(newProfile.id);
    setActiveRoleState('child');
    setIsProfileModalOpen(false);
    setIsLoggedIn(true);
    setCurrentTab('challenge');
  };

  const handleDeleteProfile = async (id: string) => {
    const ok = await deleteChildProfileFromDb(id);
    if (!ok) {
      alert('فشل الحذف من قاعدة البيانات.');
      return;
    }

    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    if (activeProfileId === id) {
      const nextActive = updated.length > 0 ? updated[0].id : null;
      setActiveProfileIdState(nextActive);
      if (!nextActive) handleLogout();
    }
  };
  const handleUpdateActiveProfile = async (updated: UserProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    const saved = await updateChildProfileInDb(updated.id, updated);
    if (!saved) {
      console.error('⚠️ تقدم الطفل لم يُحفظ في الداتابيز:', updated.id);
    }
  };

  const handleUpdateAllProfiles = async (updatedList: UserProfile[]) => {
    const previous = profiles;
    setProfiles(updatedList);

    try {
      for (const p of updatedList) {
        const old = previous.find((o) => o.id === p.id);

        if (!old) {
          // طالب جديد
          const created = await createChildProfileInDb(p);
          if (!created) throw new Error('create failed: ' + p.name);
        } else if (JSON.stringify(old) !== JSON.stringify(p)) {
          // تعديل (نقاط، أوسمة، بيانات، فك قفل...)
          const saved = await updateChildProfileInDb(p.id, p);
          if (!saved) throw new Error('update failed: ' + p.name);
        }
      }
      // الحذف بيتم في handleConfirmDeleteStudent نفسها
    } catch (err) {
      console.error('❌ Failed to sync profiles to database:', err);
      setProfiles(previous);
      alert('تعذر حفظ التغيير في قاعدة البيانات، وتم التراجع عنه. راجع الـ Console.');
    }
  };

  // ----------------------------------------------------
  // Parent Handlers
  // ----------------------------------------------------
  const handleParentLogin = (parent: ParentProfile) => {
    setParents((prevParents) => {
      const exists = prevParents.some((p) => p.id === parent.id || p.email.toLowerCase() === parent.email.toLowerCase());
      return exists 
        ? prevParents.map((p) => (p.id === parent.id || p.email.toLowerCase() === parent.email.toLowerCase() ? parent : p))
        : [...prevParents, parent];
    });

    setActiveParentIdState(parent.id);
    logAction('parent_login', { entity: 'parents', entityId: parent.id });
    setActiveRoleState('parent');
    setIsLoggedIn(true);
  };

  const handleRegisterParentWithChildren = async (
    parentData: { name: string; email: string },
    childrenList: { name: string; packCode: string }[]
  ) => {
    const updatedProfilesList = [...profiles];
    const linkedCodes: string[] = [];

    for (const child of childrenList) {
      const cleanCode = child.packCode.trim().toUpperCase();
      linkedCodes.push(cleanCode);

      const exists = updatedProfilesList.some(
        (p) => p.packCode.toUpperCase() === cleanCode
      );

      if (!exists) {
        const newChildProfile: UserProfile = {
          id: crypto.randomUUID(),
          name: child.name.trim() || 'بطل سماسم',
          packCode: cleanCode,
          gender: 'boy',
          avatar: '👦',
          points: 20,
          unlockedBadgeIds: ['curiosity_spark'],
          lastSolvedDate: null,
          solvedChallengesCount: 0,
          solvedCategories: [],
          createdAt: new Date().toISOString(),
        };

        await createChildProfileInDb(newChildProfile);
        updatedProfilesList.push(newChildProfile);
      }
    }

    setProfiles(updatedProfilesList);

    const newParent: ParentProfile = {
      id: 'parent-' + Date.now(),
      name: parentData.name.trim() || 'ولي أمر',
      email: parentData.email.trim().toLowerCase(),
      linkedPackCodes: linkedCodes,
      createdAt: new Date().toISOString(),
    };

    // حفظ ولي الأمر في Supabase
    await supabase.from('parents').insert([{
      id: newParent.id,
      name: newParent.name,
      email: newParent.email,
      linked_pack_codes: newParent.linkedPackCodes
    }]);

    setParents((prev) => [...prev, newParent]);
    setActiveParentIdState(newParent.id);
    setActiveRoleState('parent');
    setIsLoggedIn(true);
  };

  const handleUpdateParent = (updated: ParentProfile) => {
    setParents((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleUpdateAllParents = async (updatedList: ParentProfile[]) => {
    const previous = parents;
    setParents(updatedList);

    try {
      for (const p of updatedList) {
        if (!previous.some((o) => o.id === p.id)) {
          const ok = await createParentByAdmin(p);
          if (!ok) throw new Error('create parent failed: ' + p.email);
        }
      }
    } catch (err) {
      console.error('❌ Failed to sync parents:', err);
      setParents(previous);
      alert('تعذر حفظ ولي الأمر في قاعدة البيانات (ربما البريد مسجل من قبل).');
    }
  };

  useEffect(() => {
    if (activeRole !== 'parent' || !activeParentId) return;
    let cancelled = false;

    (async () => {
      const children = await getChildrenByParentId(activeParentId);
      if (cancelled) return;

      setProfiles((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        children.forEach((c) => map.set(c.id, c));
        return Array.from(map.values());
      });
      setParents((prev) =>
        prev.map((p) =>
          p.id === activeParentId ? { ...p, linkedPackCodes: children.map((c) => c.packCode) } : p
        )
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [activeRole, activeParentId]);
  // ----------------------------------------------------
  // Admin Handlers
  // ----------------------------------------------------
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setActiveRoleState('admin');
    setIsLoggedIn(true);
    logAction('admin_login');
  };

  // ----------------------------------------------------
  // General Logout / Role Switcher
  // ----------------------------------------------------
  const handleLogout = async () => {
    playClick();
    const role = activeRole;

    localStorage.removeItem(ACTIVE_CHILD_KEY);
    setIsLoggedIn(false);
    setActiveRoleState(null);
    setIsAdminAuthenticated(false);
    setActiveParentIdState(null);

    if (role === 'admin' || role === 'parent') {
      await logAction(`${role}_logout`); // قبل signOut عشان يتسجل باسم صاحب الجلسة
    }
    try {
      await signOutSupabase();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;
  const activeParent = parents.find((p) => p.id === activeParentId) || (activeParentId ? {
    id: activeParentId,
    name: 'ولي الأمر',
    email: '',
    linkedPackCodes: [],
    createdAt: new Date().toISOString()
  } : null);

  // ========================================================
  // 1. GATEKEEPER / AUTH SCREEN (ROLE SELECTION)
  // ========================================================
  if (!isLoggedIn || !activeRole) {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-black">
          جاري التحميل... 🍭
        </div>
      );
    }
    return (
      <div className="min-h-screen">
        <AuthScreen
          profiles={profiles}
          parents={parents}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onParentLogin={handleParentLogin}
          onRegisterParentWithChildren={handleRegisterParentWithChildren}
          onAdminLogin={handleAdminLogin}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </div>
    );
  }

  // ========================================================
  // 2. PARENT ROLE VIEW (ISOLATED TO PARENT DASHBOARD)
  // ========================================================
  if (activeRole === 'parent') {
    const currentParent: ParentProfile = activeParent || {
      id: activeParentId || 'parent-default',
      name: 'ولي الأمر',
      email: '',
      linkedPackCodes: [],
      createdAt: new Date().toISOString()
    };

    return (
      <ParentDashboard
        parent={currentParent}
        allProfiles={profiles}
        onUpdateParent={handleUpdateParent}
        onUpdateProfiles={setProfiles}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  // ========================================================
  // 3. ADMIN ROLE VIEW (ISOLATED TO FULL ADMIN DASHBOARD)
  // ========================================================
  if (activeRole === 'admin' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-linear-to-b from-slate-100 via-purple-50/40 to-slate-200 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Admin Top Utility Strip */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b-2 border-red-200 dark:border-red-900/80 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 border-2 border-red-300 dark:border-red-800 p-1 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <span className="font-black text-lg text-slate-950 dark:text-white">
                  سماسم — لوحة تحكم مدير النظام
                </span>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 mr-2 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                  Super Admin Only 🔒
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
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
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                title="قفل لوحة الأدمن وتسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span>قفل وخروج 🔒</span>
              </button>
            </div>
          </div>
        </header>

        {/* Admin Main Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          <AdminDashboard
            profiles={profiles}
            activeProfileId={activeProfileId}
            onUpdateProfiles={handleUpdateAllProfiles}
            parents={parents}
            onUpdateParents={handleUpdateAllParents}
            onSelectProfile={(id) => {
              handleSelectProfile(id);
            }}
            onCloseAdmin={handleLogout}
            onLockAdmin={handleLogout}
          />
        </main>
      </div>
    );
  }

  // ========================================================
  // 4. CHILD ROLE VIEW (ISOLATED TO CHILD LEARNING ZONE)
  // ========================================================
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-linear-to-b from-amber-50/80 via-pink-50/50 to-sky-50/60 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      
      {/* Navigation Bar */}
      <Navbar
        activeProfile={activeProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'admin') {
            setCurrentTab(tab);
          }
        }}
        onRequestAdmin={() => {}}
        onLogoutOrSwitchHero={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        showAdminButton={false}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <MotivationalQuoteCard
          activeProfile={activeProfile}
          currentTab={currentTab}
        />

        {activeProfile && currentTab === 'challenge' && (
          <DailyChallenge
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateActiveProfile}
            onOpenBadgesTab={() => setCurrentTab('badges')}
          />
        )}

        {activeProfile && currentTab === 'badges' && (
          <BadgesAndCertificate
            activeProfile={activeProfile}
          />
        )}

        {activeProfile && currentTab === 'lab' && (
          <SimsimLab
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateActiveProfile}
            onOpenBadgesTab={() => setCurrentTab('badges')}
          />
        )}

        {activeProfile && currentTab === 'games' && (
          <GamifiedLearningZone
            key={bankVersion}
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateActiveProfile}
            onOpenBadgesTab={() => setCurrentTab('badges')}
          />
        )}
      </main>

      {/* Child Footer */}
      <footer className="border-t-2 border-pink-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 mt-10 py-6 sm:py-8 shadow-xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-right">
          
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="سماسم"
              className="w-11 h-11 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <p className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
                سماسم — كل سؤال… بداية اكتشاف
              </p>
              <p className="text-xs text-pink-700 dark:text-pink-400 font-extrabold">
                غزل بنات.. بس بدماغ سماسم 🍭
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => {
                playClick();
                setCurrentTab('challenge');
              }}
              className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
            >
              التحدي اليومي
            </button>
            <span className="text-pink-300 dark:text-slate-600">•</span>
            <button
              onClick={() => {
                playClick();
                setCurrentTab('badges');
              }}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              الأوسمة والشهادة
            </button>
            <span className="text-pink-300 dark:text-slate-600">•</span>
            <button
              onClick={() => {
                playClick();
                setCurrentTab('lab');
              }}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              معمل الاكتشاف 🔬
            </button>
            <span className="text-pink-300 dark:text-slate-600">•</span>
            <button
              onClick={() => {
                playClick();
                setCurrentTab('games');
              }}
              className="hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors cursor-pointer"
            >
              الألعاب والأسئلة 🎮
            </button>
            <span className="text-pink-300 dark:text-slate-600">•</span>
            <button
              onClick={handleLogout}
              className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer text-rose-600 dark:text-rose-400"
            >
              <LogOut className="w-4 h-4" />
              <span>تبديل الحساب / خروج</span>
            </button>
          </div>

          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            صُنع بحب لأبطال وبطلات المعرفة
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
          </p>

        </div>
      </footer>

      {/* Profiles Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Cheerful Welcome Popup */}
      <WelcomeModal />

    </div>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <AppContent />
    </SoundProvider>
  );
}