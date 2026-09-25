import React, { useState } from 'react';
import { UserProfile } from '../types';
import { KnowledgeWheel } from './games/KnowledgeWheel';
import { MathSpeedChallenge } from './games/MathSpeedChallenge';
import { QuestionBankExplorer } from './games/QuestionBankExplorer';
import { useSound } from '../context/SoundContext';
import { 
  Gamepad2, 
  RotateCw, 
  Zap, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  Award, 
  Compass, 
  Flame 
} from 'lucide-react';

interface GamifiedLearningZoneProps {
  activeProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenBadgesTab: () => void;
}

export const GamifiedLearningZone: React.FC<GamifiedLearningZoneProps> = ({
  activeProfile,
  onUpdateProfile,
  onOpenBadgesTab,
}) => {
  const [activeGameTab, setActiveGameTab] = useState<'wheel' | 'speed' | 'bank'>('wheel');
  const { playClick } = useSound();
  const isGirl = activeProfile.gender === 'girl';

  const solvedBankCount = activeProfile.solvedBankQuestionIds?.length || 0;
  const highScore = activeProfile.mathSpeedHighScore || 0;
  const wheelSpins = activeProfile.wheelSpinsCount || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner - Cheerful Arcade Theme */}
      <div className="bg-linear-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-2 border-fuchsia-400">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black border border-white/30 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>ركن الألعاب وبنك الأسئلة الذكي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isGirl ? `مرحباً بكِ في واحة التحديات يا بطلتنا ${activeProfile.name}!` : `مرحباً بك في واحة التحديات يا بطلنا ${activeProfile.name}!`}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-fuchsia-100 leading-relaxed">
              اختر لعبتك المفضلة: أدر عجلة المعرفة، أو اختبر سرعتك الذهنية مع المؤقت، أو استكشف بنك الأسئلة العلمي الضخم دون أي تكرار!
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0 w-full md:w-auto text-center">
            <div className="px-2">
              <div className="text-[10px] font-extrabold text-fuchsia-200">رصيد النقاط</div>
              <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                {activeProfile.points} ⭐
              </div>
            </div>
            <div className="px-2 border-x border-white/20">
              <div className="text-[10px] font-extrabold text-fuchsia-200">رقم السرعة القياسي</div>
              <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                {highScore} ⚡
              </div>
            </div>
            <div className="px-2">
              <div className="text-[10px] font-extrabold text-fuchsia-200">أسئلة تم حلها</div>
              <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                {solvedBankCount} 📚
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <button
          onClick={() => {
            playClick();
            setActiveGameTab('wheel');
          }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeGameTab === 'wheel'
              ? 'bg-linear-to-r from-fuchsia-500 to-pink-500 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${activeGameTab === 'wheel' ? 'animate-spin' : ''}`} />
          <span>عجلة المعرفة 🎡</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveGameTab('speed');
          }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeGameTab === 'speed'
              ? 'bg-linear-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 fill-amber-500" />
          <span>تحدي السرعة الحسابية ⏱️</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveGameTab('bank');
          }}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeGameTab === 'bank'
              ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>بنك الأسئلة الضخم 📚</span>
        </button>
      </div>

      {/* Active Game Component View */}
      {activeGameTab === 'wheel' && (
        <KnowledgeWheel
          activeProfile={activeProfile}
          onUpdateProfile={onUpdateProfile}
          onOpenBadgesTab={onOpenBadgesTab}
        />
      )}

      {activeGameTab === 'speed' && (
        <MathSpeedChallenge
          activeProfile={activeProfile}
          onUpdateProfile={onUpdateProfile}
          onOpenBadgesTab={onOpenBadgesTab}
        />
      )}

      {activeGameTab === 'bank' && (
        <QuestionBankExplorer
          activeProfile={activeProfile}
          onUpdateProfile={onUpdateProfile}
          onOpenBadgesTab={onOpenBadgesTab}
        />
      )}

    </div>
  );
};
