import React, { useState } from 'react';
import { UserProfile, Gender } from '../types';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import { X, UserPlus, Check, Trash2, Sparkles, Heart } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (profile: Omit<UserProfile, 'id' | 'points' | 'unlockedBadgeIds' | 'lastSolvedDate' | 'solvedChallengesCount' | 'createdAt'>) => void;
  onDeleteProfile: (id: string) => void;
}

const AVATAR_OPTIONS = ['👦', '👧', '🍭', '🚀', '🧠', '🌟', '🦁', '🐱', '🔬'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}) => {
  const [isCreating, setIsCreating] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [packCode, setPackCode] = useState('');
  const [gender, setGender] = useState<Gender>('boy');
  const [selectedAvatar, setSelectedAvatar] = useState('👦');
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { playClick, playPop, playBadgeUnlock } = useSound();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('يرجى كتابة اسم البطل أو البطلة!');
      return;
    }
    if (!packCode.trim()) {
      setFormError('يرجى إدخال كود الطفل في الموقع (الموجود على كيس سماسم)!');
      return;
    }

    setFormError('');
    onCreateProfile({
      name: name.trim(),
      packCode: packCode.trim().toUpperCase(),
      gender,
      avatar: selectedAvatar,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    playBadgeUnlock();

    setName('');
    setPackCode('');
    setIsCreating(false);
  };

  const handleGenderChange = (newGender: Gender) => {
    playClick();
    setGender(newGender);
    if (newGender === 'girl' && selectedAvatar === '👦') {
      setSelectedAvatar('👧');
    } else if (newGender === 'boy' && selectedAvatar === '👧') {
      setSelectedAvatar('👦');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-pink-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-r from-pink-400 via-purple-400 to-amber-400" />

        {/* Close Button */}
        {profiles.length > 0 && (
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="absolute top-5 left-5 text-slate-500 hover:text-slate-800 p-1.5 rounded-full hover:bg-pink-100 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mt-2 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-3 border-2 border-pink-300 shadow-inner">
            <span className="text-3xl animate-bounce">🍭</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            {isCreating ? 'تسجيل بطل جديد في سماسم' : 'ملفات الأبطال المسجلين'}
          </h2>
          <p className="text-sm sm:text-base font-bold text-slate-700 mt-1">
            {isCreating
              ? 'أدخل بيانات البطل وكود الطفل لبدء مغامرة الاكتشاف في الموقع!'
              : 'اختر حساب البطل للمتابعة أو ابحث بكود الطفل'}
          </p>
        </div>

        {/* Create Profile Form */}
        {isCreating ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Encouraging Hero Banner */}
            <div className={`p-3.5 rounded-2xl border-2 text-sm font-black flex items-center gap-2 transition-colors ${
              gender === 'girl' 
                ? 'bg-pink-50 border-pink-300 text-pink-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}>
              <Sparkles className="w-5 h-5 shrink-0 text-amber-500" />
              <span>
                {gender === 'girl'
                  ? 'أهلاً بكِ يا بطلتنا الرائعة! مستعدة لخوض أروع المغامرات؟'
                  : 'أهلاً بك يا بطلنا الرائع! مستعد لخوض أروع المغامرات؟'}
              </span>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                النوع:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleGenderChange('boy')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${
                    gender === 'boy'
                      ? 'border-blue-500 bg-blue-100 text-blue-950 shadow-xs scale-102 ring-2 ring-blue-300'
                      : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-2xl">👦</span>
                  <span>بطل (ولد)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderChange('girl')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${
                    gender === 'girl'
                      ? 'border-pink-500 bg-pink-100 text-pink-950 shadow-xs scale-102 ring-2 ring-pink-300'
                      : 'border-slate-200 text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-2xl">👧</span>
                  <span>بطلة (بنت)</span>
                </button>
              </div>
            </div>

            {/* Child Name */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                اسم {gender === 'girl' ? 'البطلة' : 'البطل'}:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={gender === 'girl' ? 'مثال: جنى، ليان، فاطمة...' : 'مثال: يوسف، أحمد، كنان...'}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus:outline-hidden focus:border-pink-500 focus:ring-2 focus:ring-pink-300 font-extrabold text-base"
                required
              />
            </div>

            {/* Child Code in the website (Pack Code) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>كود الطفل في الموقع:</span>
                  <span className="text-[11px] font-extrabold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
                    (كود الكيس)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    const randomCode = 'SMSM-' + Math.floor(1000 + Math.random() * 9000);
                    setPackCode(randomCode);
                  }}
                  className="text-xs font-black text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="توليد كود تلقائي للطفل"
                >
                  <span>🎲</span>
                  <span>توليد كود تلقائي</span>
                </button>
              </div>
              <input
                type="text"
                value={packCode}
                onChange={(e) => setPackCode(e.target.value.toUpperCase())}
                placeholder="مثال: SMSM-7701 أو 8421 (مكتوب على الكيس)"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-300 font-mono font-black text-base tracking-wider text-left"
                dir="ltr"
                required
              />
              <p className="text-[11px] font-bold text-slate-600 mt-1">
                * كود الطفل هو رمزه الدائم في موقع سماسم لتسجيل نقاطه وأوسمته وشهادته.
              </p>
            </div>

            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                اختر الرمز المفضل:
              </label>
              <div className="flex flex-wrap gap-2 justify-center bg-pink-50/70 p-3 rounded-2xl border-2 border-pink-200">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      playPop();
                      setSelectedAvatar(av);
                    }}
                    className={`text-2xl sm:text-3xl p-2 rounded-xl transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-amber-400 scale-125 shadow-md ring-2 ring-amber-500'
                        : 'hover:bg-pink-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-xs sm:text-sm font-black text-rose-800 bg-rose-100 p-3 rounded-xl border border-rose-300">
                {formError}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3.5 px-4 rounded-2xl bg-linear-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-base shadow-md shadow-pink-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>حفظ وبدء الاكتشاف!</span>
              </button>

              {profiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsCreating(false);
                  }}
                  className="py-3.5 px-4 rounded-2xl border-2 border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        ) : (
          /* Profile List Screen */
          <div className="space-y-4">
            {profiles.length > 1 && (
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث باسم الطفل أو كود الطفل..."
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 bg-pink-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-pink-500 font-bold text-xs sm:text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-black"
                  >
                    ✕ مسح
                  </button>
                )}
              </div>
            )}

            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {profiles
                .filter((p) => {
                  if (!searchTerm.trim()) return true;
                  const term = searchTerm.trim().toLowerCase();
                  return (
                    p.name.toLowerCase().includes(term) ||
                    p.packCode.toLowerCase().includes(term)
                  );
                })
                .map((p) => {
                  const isActive = p.id === activeProfileId;
                  const isGirlProfile = p.gender === 'girl';

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        playClick();
                        onSelectProfile(p.id);
                        onClose();
                      }}
                      className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                        isActive
                          ? 'border-pink-500 bg-pink-100/80 shadow-sm ring-2 ring-pink-300'
                          : 'border-pink-200 hover:border-pink-400 bg-white hover:bg-pink-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner">
                          {p.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-950 text-base">
                              {p.name}
                            </h4>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black ${
                              isGirlProfile
                                ? 'bg-pink-200 text-pink-900'
                                : 'bg-blue-200 text-blue-900'
                            }`}>
                              {isGirlProfile ? 'بطلة' : 'بطل'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-700 font-bold mt-0.5 flex-wrap">
                            <span className="font-mono bg-pink-100 px-2 py-0.5 rounded-md text-xs font-bold text-pink-950 border border-pink-200 flex items-center gap-1">
                              <span className="text-[10px] text-pink-700 font-sans font-black">كود الطفل:</span>
                              <span>{p.packCode}</span>
                            </span>
                            <span className="text-amber-800 font-black">
                              ⭐ {p.points} نقطة
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-xs font-black text-pink-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            اختيار
                          </span>
                        )}

                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playClick();
                              if (window.confirm(`هل أنت متأكد من حذف ملف "${p.name}"؟`)) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="حذف هذا الملف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Add new profile button */}
            <button
              onClick={() => {
                playClick();
                setIsCreating(true);
              }}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-pink-400 hover:border-pink-600 hover:bg-pink-50 text-pink-700 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة بطل جديد إلى سماسم</span>
            </button>
          </div>
        )}

        {/* Footer brand encouragement */}
        <div className="mt-5 pt-3 border-t-2 border-pink-100 text-center">
          <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>عائلة سماسم ترحب بجميع المكتشفين والمبتكرين الصغار</span>
          </p>
        </div>
      </div>
    </div>
  );
};
