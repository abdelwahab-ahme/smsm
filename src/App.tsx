import React, { useState, useEffect } from 'react';
import { UserProfile, ParentProfile, UserRole } from './types';
import { getChildrenByParentId, createChildProfileInDb, updateChildProfileInDb } from './lib/samasmDatabase';
import { 
  getStoredProfiles, 
  saveProfiles, 
  getActiveProfileId, 
  setActiveProfileId, 
  getStoredDarkMode, 
  saveStoredDarkMode,
  getStoredParents,
  saveStoredParents,
  getActiveParentId,
  setActiveParentId,
  getStoredActiveRole,
  saveStoredActiveRole
} from './utils/storage';
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
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getStoredProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => getActiveProfileId());

  // Parents
  const [parents, setParents] = useState<ParentProfile[]>(() => getStoredParents());
  const [activeParentId, setActiveParentIdState] = useState<string | null>(() => getActiveParentId());

  // Active Role: 'child' | 'parent' | 'admin' | null
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(() => getStoredActiveRole());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(getStoredActiveRole()));

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => getStoredActiveRole() === 'admin');

  // Child App Tabs
  const [currentTab, setCurrentTab] = useState<'challenge' | 'badges' | 'lab' | 'games'>('challenge');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getStoredDarkMode());

  const { playClick, isMuted, toggleSound } = useSound();

  // Dark Mode Sync with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    saveStoredDarkMode(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    playClick();
    setIsDarkMode((prev) => !prev);
  };

  // ----------------------------------------------------
  // Child Profile Handlers
  // ----------------------------------------------------
  const handleSelectProfile = (id: string) => {
    setActiveProfileIdState(id);
    setActiveProfileId(id);
    setActiveRoleState('child');
    saveStoredActiveRole('child');
    setIsLoggedIn(true);
    setCurrentTab('challenge');
  };

  const handleCreateProfile = async (data: Omit<UserProfile, 'id' | 'points' | 'unlockedBadgeIds' | 'lastSolvedDate' | 'solvedChallengesCount' | 'createdAt'>) => {
    const newProfile: UserProfile = {
      ...data,
      id: 'hero-' + Date.now(),
      points: 20, // Welcome points
      unlockedBadgeIds: ['curiosity_spark'], // First badge
      lastSolvedDate: null,
      solvedChallengesCount: 0,
      solvedCategories: [],
      createdAt: new Date().toISOString(),
    };

    // حفظ الطفل في Supabase إذا كان ولي الأمر مسجل الدخول
    await createChildProfileInDb(newProfile, activeParentId || undefined);

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    setActiveProfileIdState(newProfile.id);
    setActiveProfileId(newProfile.id);
    setActiveRoleState('child');
    saveStoredActiveRole('child');
    setIsProfileModalOpen(false);
    setIsLoggedIn(true);
    setCurrentTab('challenge');
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    saveProfiles(updated);
    if (activeProfileId === id) {
      const nextActive = updated.length > 0 ? updated[0].id : null;
      setActiveProfileIdState(nextActive);
      if (nextActive) {
        setActiveProfileId(nextActive);
      } else {
        handleLogout();
      }
    }
  };

  const handleUpdateActiveProfile = async (updated: UserProfile) => {
    const updatedList = profiles.map((p) => (p.id === updated.id ? updated : p));
    setProfiles(updatedList);
    saveProfiles(updatedList);

    // تحديث تقدم الطفل في Supabase مباشرة
    await updateChildProfileInDb(updated.id, updated);
  };

  const handleUpdateAllProfiles = (updatedList: UserProfile[]) => {
    setProfiles(updatedList);
    saveProfiles(updatedList);
    if (activeProfileId && !updatedList.some((p) => p.id === activeProfileId)) {
      const nextId = updatedList.length > 0 ? updatedList[0].id : null;
      setActiveProfileIdState(nextId);
      if (nextId) setActiveProfileId(nextId);
    }
  };

 // ----------------------------------------------------
  // Parent Handlers (تصحيح وتحديث)
  // ----------------------------------------------------
  const handleParentLogin = (parent: ParentProfile) => {
    // 1. ضمان إضافة أو تحديث ولي الأمر في القائمة الحالية والمخزنة
    setParents((prevParents) => {
      const exists = prevParents.some((p) => p.id === parent.id || p.email.toLowerCase() === parent.email.toLowerCase());
      const updatedList = exists 
        ? prevParents.map((p) => (p.id === parent.id || p.email.toLowerCase() === parent.email.toLowerCase() ? parent : p))
        : [...prevParents, parent];
      saveStoredParents(updatedList);
      return updatedList;
    });

    // 2. ضبط الحساب النشط والدور الحالي
    setActiveParentIdState(parent.id);
    setActiveParentId(parent.id);
    setActiveRoleState('parent');
    saveStoredActiveRole('parent');
    setIsLoggedIn(true);
  };

  const handleRegisterParentWithChildren = (
    parentData: { name: string; email: string },
    childrenList: { name: string; packCode: string }[]
  ) => {
    // 1. Create or match child profiles
    const updatedProfilesList = [...profiles];
    const linkedCodes: string[] = [];

    childrenList.forEach((child) => {
      const cleanCode = child.packCode.trim().toUpperCase();
      linkedCodes.push(cleanCode);

      // Check if profile exists; if not, auto-create
      const exists = updatedProfilesList.some(
        (p) => p.packCode.toUpperCase() === cleanCode
      );

      if (!exists) {
        const newChildProfile: UserProfile = {
          id: 'hero-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
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
        updatedProfilesList.push(newChildProfile);
      }
    });

    setProfiles(updatedProfilesList);
    saveProfiles(updatedProfilesList);

    // 2. Create and store parent profile
    const newParent: ParentProfile = {
      id: 'parent-' + Date.now(),
      name: parentData.name.trim() || 'ولي أمر',
      email: parentData.email.trim().toLowerCase(),
      linkedPackCodes: linkedCodes,
      createdAt: new Date().toISOString(),
    };

    const updatedParentsList = [...parents, newParent];
    setParents(updatedParentsList);
    saveStoredParents(updatedParentsList);

    setActiveParentIdState(newParent.id);
    setActiveParentId(newParent.id);
    setActiveRoleState('parent');
    saveStoredActiveRole('parent');
    setIsLoggedIn(true);
  };

  const handleUpdateParent = (updated: ParentProfile) => {
    const updatedList = parents.map((p) => (p.id === updated.id ? updated : p));
    setParents(updatedList);
    saveStoredParents(updatedList);
  };

  const handleUpdateAllParents = (updatedList: ParentProfile[]) => {
    setParents(updatedList);
    saveStoredParents(updatedList);
    if (activeParentId && !updatedList.some((p) => p.id === activeParentId)) {
      const nextId = updatedList.length > 0 ? updatedList[0].id : null;
      setActiveParentIdState(nextId);
      if (nextId) setActiveParentId(nextId);
    }
  };

  useEffect(() => {
    async function loadParentChildren() {
      if (activeRole === 'parent' && activeParentId) {
        const dbChildren = await getChildrenByParentId(activeParentId);
        if (dbChildren && dbChildren.length > 0) {
          setProfiles((prev) => {
            const merged = [...prev];
            dbChildren.forEach((child) => {
              const index = merged.findIndex((p) => p.id === child.id || p.packCode === child.packCode);
              if (index >= 0) {
                merged[index] = child;
              } else {
                merged.push(child);
              }
            });
            return merged;
          });
        }
      }
    }
    loadParentChildren();
  }, [activeRole, activeParentId]);

  // ----------------------------------------------------
  // Admin Handlers
  // ----------------------------------------------------
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setActiveRoleState('admin');
    saveStoredActiveRole('admin');
    setIsLoggedIn(true);
  };

  // ----------------------------------------------------
  // General Logout / Role Switcher
  // ----------------------------------------------------
  const handleLogout = () => {
    playClick();
    setIsLoggedIn(false);
    setActiveRoleState(null);
    saveStoredActiveRole(null);
    setIsAdminAuthenticated(false);
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
        onUpdateProfiles={handleUpdateAllProfiles}
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
      
      {/* Navigation Bar - Admin button hidden for children */}
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
        {/* Personalized Motivational Quote Banner */}
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
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateActiveProfile}
            onOpenBadgesTab={() => setCurrentTab('badges')}
          />
        )}
      </main>

      {/* Child Footer (No Admin / Parent references) */}
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