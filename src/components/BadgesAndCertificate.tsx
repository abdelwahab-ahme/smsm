import React, { useRef, useState, useEffect } from 'react';
import { Badge, CertificateFrameId, CertificateMilestone, UserProfile } from '../types';
import { INITIAL_BADGES } from '../utils/storage';
import { useSound } from '../context/SoundContext';
import { 
  downloadCertificateFromDom, 
  getCertificateBlob, 
  downloadCertificatePdf,
  printIsolatedCertificate 
} from '../utils/certificateGenerator';
import { CERTIFICATE_FRAMES, CERTIFICATE_MILESTONES, getCertificateFrameTheme } from '../utils/certificateThemes';
import { fireBadgeUnlockConfetti, fireDailySuccessConfetti } from '../utils/confettiCelebration';
import { 
  Trophy, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Award, 
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  FileText
} from 'lucide-react';

interface BadgesAndCertificateProps {
  activeProfile: UserProfile;
}
// الأوسمة الخاصة بركن الإسلاميات (تظهر للطفل المسلم فقط)
const ISLAMIC_BADGE_IDS = ['little_sage', 'good_manners', 'fortress_hero'];
export const BadgesAndCertificate: React.FC<BadgesAndCertificateProps> = ({ activeProfile }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active milestone for Certificates Gallery
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>('grand_master');
  const [selectedFrameId, setSelectedFrameId] = useState<CertificateFrameId>('purple');
  const [activeSubTab, setActiveSubTab] = useState<'certificate' | 'gallery'>('certificate');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [scale, setScale] = useState(1);
  const { playClick, playPop, playBadgeUnlock, playSuccessWhistle } = useSound();

  const isGirl = activeProfile.gender === 'girl';
  const currentTheme = getCertificateFrameTheme(selectedFrameId);

  // Active milestone details
  const activeMilestone = CERTIFICATE_MILESTONES.find((m) => m.id === activeMilestoneId) || CERTIFICATE_MILESTONES[0];

  // الطفل غير المسلم ما يشوفش الأوسمة الإسلامية
  const visibleBadges =
    activeProfile.religion === 'muslim'
      ? INITIAL_BADGES
      : INITIAL_BADGES.filter((b) => !ISLAMIC_BADGE_IDS.includes(b.id));

  const unlockedBadgeObjects = visibleBadges.filter((b) =>
    activeProfile.unlockedBadgeIds.includes(b.id)
  );

  // Direct PDF Downloader (generates and downloads a real .pdf file)
  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      playClick();

      // Trigger celebratory confetti
      fireDailySuccessConfetti();

      await downloadCertificatePdf(
        activeProfile,
        unlockedBadgeObjects,
        selectedFrameId,
        activeMilestone.ribbonTitle
      );

      setIsDownloadingPdf(false);
      setDownloadSuccess(true);
      playBadgeUnlock();
      playSuccessWhistle();
      fireBadgeUnlockConfetti();

      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to download PDF certificate:', err);
      setIsDownloadingPdf(false);
      alert('حدث خطأ أثناء تنزيل ملف الـ PDF، يرجى المحاولة مرة أخرى.');
    }
  };

  // Milestone unlock checker
  const isMilestoneUnlocked = (milestone: CertificateMilestone): boolean => {
    if (milestone.minPointsRequired && activeProfile.points < milestone.minPointsRequired) {
      return false;
    }
    if (milestone.badgeIdRequired && !activeProfile.unlockedBadgeIds.includes(milestone.badgeIdRequired)) {
      return false;
    }
    if (milestone.minChallengesRequired && activeProfile.solvedChallengesCount < milestone.minChallengesRequired) {
      return false;
    }
    return true;
  };

  // Switch to a milestone from the gallery
  const handleSelectMilestone = (milestone: CertificateMilestone) => {
    playPop();
    setActiveMilestoneId(milestone.id);
    setSelectedFrameId(milestone.frameThemeId);
    setActiveSubTab('certificate');

    // Scroll smoothly to certificate viewer
    setTimeout(() => {
      certificateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  // Responsive scale calculator: scales the 920px certificate proportionally on mobile
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        if (availableWidth < 936) {
          const newScale = Math.max(0.34, (availableWidth - 24) / 920);
          setScale(newScale);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Download certificate directly from DOM preserving exact fonts, layout, and colors
  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      setIsDownloading(true);
      playClick();

      // Trigger celebratory confetti
      fireDailySuccessConfetti();

      await downloadCertificateFromDom(
        certificateRef.current,
        activeProfile,
        selectedFrameId,
        unlockedBadgeObjects,
        activeMilestone.ribbonTitle
      );

      setIsDownloading(false);
      setDownloadSuccess(true);
      playBadgeUnlock();
      playSuccessWhistle();
      fireBadgeUnlockConfetti();

      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to download certificate image:', err);
      setIsDownloading(false);
      alert('حدث خطأ أثناء حفظ الشهادة، يرجى المحاولة مرة أخرى.');
    }
  };

  // Share certificate flow
  const handleOpenShareModal = () => {
    playClick();
    setIsShareModalOpen(true);
  };

  const shareText = `🎉 فخورون جداً بـ ${isGirl ? 'بطلتنا الرائعة' : 'بطلنا الرائع'} ${activeProfile.name}! حصل على ${activeMilestone.title} في تطبيق سماسم التعليمي برصيد ⭐ ${activeProfile.points} نقطة و 🏆 ${unlockedBadgeObjects.length} وساماً علمياً! "كل سؤال… بداية اكتشاف" 🚀🍭`;

  // Native share (Web Share API)
  const handleNativeShare = async () => {
    if (!certificateRef.current) return;
    try {
      setIsSharing(true);
      playClick();

      const { blob, fileName } = await getCertificateBlob(
        certificateRef.current,
        activeProfile,
        selectedFrameId,
        unlockedBadgeObjects,
        activeMilestone.ribbonTitle
      );

      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `شهادة تفوق سماسم - ${activeProfile.name}`,
          text: shareText,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `شهادة تفوق سماسم - ${activeProfile.name}`,
          text: shareText,
          url: window.location.href,
        });
      } else {
        handleWhatsappShare();
      }
      setIsSharing(false);
    } catch (err) {
      console.warn('Native share cancelled or failed:', err);
      setIsSharing(false);
    }
  };

  // WhatsApp share
  const handleWhatsappShare = () => {
    playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + window.location.href)}`;
    window.open(url, '_blank');
  };

  // Copy share message & link
  const handleCopyText = async () => {
    playClick();
    try {
      await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      alert('تعذر نسخ الرابط تلقائياً.');
    }
  };

  const handlePrint = async () => {
    if (!certificateRef.current) return;
    playClick();
    await printIsolatedCertificate(certificateRef.current, activeProfile.name);
  };

  const handleCelebrate = () => {
    playBadgeUnlock();
    playSuccessWhistle();
    fireBadgeUnlockConfetti();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Badges Header Banner - Bright Golden Sunshine */}
      <div className="bg-linear-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-lg relative overflow-hidden border-2 border-amber-300">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/90 px-4 py-1 rounded-full text-xs font-black text-amber-950 shadow-2xs">
              <Award className="w-4 h-4 text-amber-700" />
              <span>لوحة الشرف والإنجازات</span>
              <span className="mx-1 text-amber-400">|</span>
              <span className="text-pink-800 font-mono font-black">كود الطفل: {activeProfile.packCode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
              أوسمة {isGirl ? 'بطلتنا الرائعة' : 'بطلنا الرائع'} {activeProfile.name}
            </h1>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 max-w-lg leading-relaxed">
              كل وسام يمثل سرّاً علمياً اكتشفته وخطوة جديدة في طريق العلماء والعباقرة!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-md shrink-0">
            <div className="text-center">
              <p className="text-xs font-black text-slate-800">الأوسمة المكتسبة</p>
              <p className="text-3xl font-black text-amber-700">
              {unlockedBadgeObjects.length} / {visibleBadges.length}
              </p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs font-black text-slate-800">إجمالي النقاط</p>
              <p className="text-3xl font-black text-rose-600 flex items-center justify-center gap-1">
                ⭐ {activeProfile.points}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs Switcher: [الشهادة والتحميل] & [معرض الشهادات والأوسمة] */}
      <div className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border-2 border-purple-200 dark:border-slate-800 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => {
            playPop();
            setActiveSubTab('certificate');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'certificate'
              ? 'bg-linear-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>الشهادة المعتمدة 📜</span>
        </button>

        <button
          onClick={() => {
            playPop();
            setActiveSubTab('gallery');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'gallery'
              ? 'bg-linear-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>معرض الشهادات (6) 🏛️</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CERTIFICATES GALLERY (معرض الشهادات)                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-purple-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span>🏛️ معرض شهادات وأوسمة سماسم</span>
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                تصفح جميع شهادات التكريم المستحقة وقيد التقدم للبطل، واضغط على أي شهادة لمعاينتها ومشاركتها!
              </p>
            </div>

            {/* Gallery Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-purple-200 dark:border-slate-700">
              <button
                onClick={() => setGalleryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  galleryFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                الكل ({CERTIFICATE_MILESTONES.length})
              </button>
              <button
                onClick={() => setGalleryFilter('unlocked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  galleryFilter === 'unlocked'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                المفتوحة 🏆 ({CERTIFICATE_MILESTONES.filter(isMilestoneUnlocked).length})
              </button>
              <button
                onClick={() => setGalleryFilter('locked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  galleryFilter === 'locked'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                قيد التقدم ⏳ ({CERTIFICATE_MILESTONES.filter((m) => !isMilestoneUnlocked(m)).length})
              </button>
            </div>
          </div>

          {/* Milestone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CERTIFICATE_MILESTONES.filter((m) => {
              const unlocked = isMilestoneUnlocked(m);
              if (galleryFilter === 'unlocked') return unlocked;
              if (galleryFilter === 'locked') return !unlocked;
              return true;
            }).map((milestone) => {
              const isUnlocked = isMilestoneUnlocked(milestone);
              const isSelected = activeMilestoneId === milestone.id;

              return (
                <div
                  key={milestone.id}
                  onClick={() => isUnlocked && handleSelectMilestone(milestone)}
                  className={`p-6 rounded-3xl border-2 transition-all relative flex flex-col justify-between ${
                    isUnlocked
                      ? isSelected
                        ? 'border-purple-600 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-purple-400 scale-[1.02] cursor-pointer'
                        : 'border-purple-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:border-purple-400 cursor-pointer'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 opacity-80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Icon & Status */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border-2 border-purple-300 dark:border-purple-700 flex items-center justify-center text-3xl shadow-xs">
                        {milestone.icon}
                      </div>

                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مستحقة ومفتوحة ✨</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>قيد الإنجاز ⏳</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-black text-slate-950 dark:text-white text-lg leading-tight">
                        {milestone.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                        {milestone.subtitle}
                      </p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMilestone(milestone);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>معاينة واعتماد هذه الشهادة 📜</span>
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                        الشرط: {milestone.minPointsRequired ? `الوصول لـ ${milestone.minPointsRequired} نقطة` : ''}{milestone.minChallengesRequired ? `حل ${milestone.minChallengesRequired} تحديات` : ''}{milestone.badgeIdRequired ? ` (أو فتح الوسام المخصص)` : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CERTIFICATE PREVIEW & DOWNLOAD                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'certificate' && (
        <div className="space-y-4 pt-2">
          
          {/* Active Milestone Info Pill */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-purple-50 dark:bg-slate-900 p-4 rounded-2xl border-2 border-purple-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeMilestone.icon}</span>
              <div>
                <div className="text-xs font-black text-purple-700 dark:text-purple-400">الشهادة المعروضة حالياً:</div>
                <div className="text-base font-black text-slate-950 dark:text-white">{activeMilestone.title}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('gallery')}
              className="py-1.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 font-black text-xs flex items-center gap-1.5 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <span>تبديل الشهادة من المعرض</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Action Toolbar Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span>شهادة التقدير الرسمية من سماسم</span>
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                شهادة رسمية عالية الدقة تحافظ تماماً على الخطوط والتنسيق والألوان وبدون حذف أي تفاصيل!
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={handleCelebrate}
                className="p-3 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="إطلاق ألعاب نارية واحتفال"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span className="hidden sm:inline">احتفال</span>
              </button>

              {/* Download Real PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-4 py-3 rounded-2xl border-2 border-purple-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-purple-50 text-purple-950 dark:text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                title="تنزيل الشهادة مباشرة كملف PDF رسمي عالي الدقة"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>{isDownloadingPdf ? 'جاري تجهيز PDF...' : 'تحميل الشهادة (PDF) 📄'}</span>
              </button>

              {/* Print directly */}
              <button
                onClick={handlePrint}
                className="p-3 rounded-2xl border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="طباعة الشهادة مباشرة"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">طباعة</span>
              </button>

              {/* Share Certificate */}
              <button
                onClick={handleOpenShareModal}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-500/25 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة الشهادة 🚀</span>
              </button>

              {/* Download PNG Image */}
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className="px-5 py-3 rounded-2xl bg-linear-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:from-purple-700 hover:to-fuchsia-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-500/25 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'جاري تجهيز الصورة...' : 'تحميل الشهادة (PNG) 🎓'}</span>
              </button>
            </div>
          </div>

          {/* Pro-tip banner for parents */}
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-2.5 text-xs font-bold text-amber-950 dark:text-amber-300">
            <span className="text-base shrink-0">💡</span>
            <span>
              <strong>خيارات التنزيل المتاحة:</strong> يمكنك تحميل الشهادة فوراً كصورة <strong>PNG بدقة 4K</strong>، أو الضغط على <strong>"حفظ كـ PDF / طباعة"</strong> واختيار "حفظ بتنسيق PDF" للحصول على وثيقة PDF متجهة فائقة النقاء للطباعة أو الإطارات!
            </span>
          </div>

          {downloadSuccess && (
            <div className="p-4 rounded-2xl bg-purple-100 border-2 border-purple-400 text-purple-950 text-sm font-black flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0" />
              <span>تم تحميل شهادتك بنجاح بالدقة الكاملة ونفس الخطوط والألوان المبهجة بدون حذف أي كلام! مبارك يا بطلنا! 🎓</span>
            </div>
          )}

          {/* Frame Theme Palette Customizer */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shadow-xs">
                  🎨
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    اختر لوحة ألوان الشهادة المفضلة لك:
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    الإطار النشط: <span className="text-purple-600 dark:text-purple-400 font-black">{currentTheme.name}</span> — {currentTheme.description}
                  </p>
                </div>
              </div>
              
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-linear-to-r from-purple-500 via-fuchsia-500 to-amber-400 text-white self-start sm:self-auto shadow-xs">
                لوحة ألوان متدرجة ومبهجة ✨
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-1">
              {CERTIFICATE_FRAMES.map((frame) => {
                const isSelected = selectedFrameId === frame.id;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => {
                      playPop();
                      setSelectedFrameId(frame.id);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center relative ${
                      isSelected
                        ? 'bg-purple-50/90 dark:bg-slate-800 border-purple-500 shadow-md scale-102 ring-2 ring-purple-400/50'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                        ✓
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl">{frame.icon}</span>
                      <div className={`w-3.5 h-3.5 rounded-full bg-linear-to-r ${frame.previewBg} shadow-2xs border border-white/50`} />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {frame.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Responsive Certificate Preview Container (Smooth auto-scale on mobile screens) */}
          <div ref={containerRef} className="w-full flex justify-center items-center overflow-hidden py-4 px-1">
            <div
              style={{
                width: `${920 * scale}px`,
                height: `${610 * scale}px`,
                position: 'relative',
                transition: 'width 0.15s ease, height 0.15s ease',
              }}
            >
              {/* 
                THE LIVE CANONICAL CERTIFICATE ELEMENT
                - Width: 920px, Height: 610px
                - Clean corners (no diamond marks)
                - No omitted words: full brand name, slogan, child code, full recipient name, full praise statement,
                  points, badges count, completed challenges, and ALL unlocked badges listed with full names and icons!
              */}
              <div
                ref={certificateRef}
                id="samasm-official-certificate"
                className="arabic-cert"
                style={{
                  width: '920px',
                  height: '610px',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  background: currentTheme.gradientBg,
                  border: `12px solid ${currentTheme.outerBorderHex}`,
                  borderRadius: '32px',
                  padding: '24px 28px',
                  fontFamily: "'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif",
                  direction: 'rtl',
                  letterSpacing: 'normal',
                  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Inner Decorative Dashed Border */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '8px',
                    border: `2px dashed ${currentTheme.dashedBorderHex}`,
                    borderRadius: '20px',
                    pointerEvents: 'none',
                  }}
                />

                {/* Subtle Watermark Logo Background */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.05,
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src="/logo.png"
                    alt=""
                    style={{ width: '420px', height: '420px', objectFit: 'contain' }}
                  />
                </div>

                {/* ================= SECTION 1: HEADER ================= */}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                  {/* Top Row: Brand & Code */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    {/* Brand Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src="/logo.png"
                        alt="شعار سماسم"
                        style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '12px' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#DB2777', lineHeight: '1.1' }}>
                          سماسم
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: currentTheme.primaryTextColorHex }}>
                          غزل بنات.. بس بدماغ سماسم
                        </div>
                      </div>
                    </div>

                    {/* Child Code Badge Left */}
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: `1.5px solid ${currentTheme.statsBorderHex}`,
                        borderRadius: '16px',
                        padding: '4px 14px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: currentTheme.primaryTextColorHex,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>كود الطفل المعتمد:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#C026D3' }}>
                        {activeProfile.packCode}
                      </span>
                    </div>
                  </div>

                  {/* Plaque Title Ribbon (Joyful Purple Gradient) */}
                  <div
                    style={{
                      display: 'inline-block',
                      background: currentTheme.bannerGradient,
                      border: `2px solid ${currentTheme.bannerBorderHex}`,
                      borderRadius: '50px',
                      padding: '6px 36px',
                      boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
                      marginTop: '2px',
                    }}
                  >
                    <h1
                      style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: currentTheme.bannerTextColorHex,
                        margin: 0,
                        letterSpacing: 'normal',
                      }}
                    >
                      {activeMilestone.ribbonTitle}
                    </h1>
                  </div>

                  {/* Slogan */}
                  <div style={{ fontSize: '13px', fontWeight: 800, color: currentTheme.highlightColorHex, marginTop: '4px' }}>
                    « كل سؤال… بداية اكتشاف »
                  </div>
                </div>

                {/* ================= SECTION 2: RECIPIENT & PRAISE ================= */}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', margin: '4px 0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: currentTheme.subtleTextColorHex, marginBottom: '2px' }}>
                    تُمنح هذه الشهادة بكل فخر واعتزاز إلى
                  </div>

                  {/* Child Name Title */}
                  <div style={{ display: 'inline-block', position: 'relative', padding: '2px 20px' }}>
                    <div
                      style={{
                        fontSize: '32px',
                        fontWeight: 900,
                        color: currentTheme.primaryTextColorHex,
                        lineHeight: '1.2',
                      }}
                    >
                      <span>{isGirl ? 'البطلة الرائعة / ' : 'البطل الرائع / '}</span>
                      <span style={{ color: currentTheme.highlightColorHex }}>{activeProfile.name}</span>
                    </div>

                    {/* Gradient underline divider */}
                    <div
                      style={{
                        height: '3px',
                        background: `linear-gradient(90deg, transparent 0%, ${currentTheme.accentColorHex} 50%, transparent 100%)`,
                        borderRadius: '2px',
                        marginTop: '4px',
                      }}
                    />
                  </div>

                  {/* Praise statement */}
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1E293B',
                      maxWidth: '680px',
                      margin: '6px auto 0 auto',
                      lineHeight: '1.5',
                    }}
                  >
                    تقديراً لذكائه الوقاد، وشغفه باستكشاف أسرار العلوم والكون، وإنجازه تحديات سماسم اليومية بنجاح باهر محققاً:
                  </div>
                </div>

                {/* ================= SECTION 3: METRICS & ALL BADGES ================= */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                  {/* 3 Metric Summary Boxes */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '24px',
                      maxWidth: '560px',
                      margin: '0 auto',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: `1.5px solid ${currentTheme.statsBorderHex}`,
                      borderRadius: '16px',
                      padding: '8px 20px',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: currentTheme.statsTextHex }}>
                        نقاط المعرفة
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#D97706' }}>
                        ⭐ {activeProfile.points}
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: currentTheme.statsBorderHex }} />

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: currentTheme.statsTextHex }}>
                        الأوسمة المستحقة
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: currentTheme.primaryTextColorHex }}>
                        🏆 {unlockedBadgeObjects.length}
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '28px', background: currentTheme.statsBorderHex }} />

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: currentTheme.statsTextHex }}>
                        التحديات المكتملة
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>
                        🎯 {activeProfile.solvedChallengesCount}
                      </div>
                    </div>
                  </div>

                  {/* ALL Earned Badges Row (Shows every single unlocked badge without omitting any words!) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      flexWrap: 'wrap',
                      maxHeight: '62px',
                      overflow: 'hidden',
                    }}
                  >
                    {unlockedBadgeObjects.length > 0 ? (
                      unlockedBadgeObjects.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#FFFFFF',
                            border: `1.5px solid ${currentTheme.statsBorderHex}`,
                            borderRadius: '10px',
                            padding: '2px 8px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            color: currentTheme.primaryTextColorHex,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ fontSize: '12px' }}>{b.icon}</span>
                          <span>{b.name}</span>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: currentTheme.statsTextHex,
                          background: 'rgba(255,255,255,0.7)',
                          padding: '3px 12px',
                          borderRadius: '12px',
                        }}
                      >
                        🌟 وسام الانضمام لأسرة سماسم والاكتشاف العلمي
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= SECTION 4: FOOTER & SEAL ================= */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: `1.5px solid ${currentTheme.statsBorderHex}`,
                    marginTop: '4px',
                  }}
                >
                  {/* Date (Right) */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: currentTheme.subtleTextColorHex }}>
                      تاريخ الاعتماد:
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                      {new Date().toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Themed Royal Wax Seal (Center) */}
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${currentTheme.sealColor1Hex} 0%, ${currentTheme.sealColor2Hex} 100%)`,
                      border: `3px solid ${currentTheme.sealBorderHex}`,
                      boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      transform: 'rotate(-4deg)',
                      padding: '2px',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                    <div style={{ fontSize: '9px', fontWeight: 900, lineHeight: 1.1, marginTop: '1px' }}>
                      معتمد رسمياً
                    </div>
                    <div style={{ fontSize: '8px', fontWeight: 800, color: '#FEF08A' }}>
                      سماسم ✦
                    </div>
                  </div>

                  {/* Signature (Left) */}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: currentTheme.subtleTextColorHex }}>
                      إدارة ومبتكرو سماسم
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#DB2777', fontStyle: 'italic' }}>
                      فريق سماسم للاكتشاف ✍️
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* BADGES GRID SECTION                                                       */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-6 border-t-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>منظومة الـ {visibleBadges.length} وساماً المتميزة</span>
          </h2>
          <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 bg-amber-100 dark:bg-amber-950/70 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700/80">
          {unlockedBadgeObjects.length} من {visibleBadges.length} مفتوح
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleBadges.map((badge) => {
            const isUnlocked = activeProfile.unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (isUnlocked) {
                    playPop();
                    playSuccessWhistle();
                    fireBadgeUnlockConfetti();
                  } else {
                    playClick();
                  }
                }}
                className={`p-5 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isUnlocked
                    ? 'border-amber-300 dark:border-amber-500/60 bg-white dark:bg-slate-900 shadow-md ring-1 ring-amber-200 dark:ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 opacity-80'
                }`}
              >
                {/* Top status & Points tag */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                      isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-300 dark:border-amber-600'
                        : 'bg-slate-200 dark:bg-slate-800 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                        isUnlocked
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                          <span>تم الإنجاز</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>مقفل</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      +{badge.points} نقطة
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5 my-3">
                  <h3 className="font-black text-slate-950 dark:text-white text-lg">
                    {badge.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                    {badge.description}
                  </p>
                </div>

                {/* Requirement */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>الشرط:</span>
                  <span className="font-black text-amber-800 dark:text-amber-400">
                    {badge.requirement}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SHARE MODAL                                                               */}
      {/* ========================================================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-300 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            
            {/* Close button */}
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md shadow-purple-500/30">
                🚀
              </div>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                مشاركة شهادة {isGirl ? 'بطلتنا' : 'بطلنا'} {activeProfile.name}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                شارك هذا الإنجاز المعرفي المبهج مع العائلة، الأصدقاء، أو على منصات التواصل!
              </p>
            </div>

            {/* Share Action Buttons */}
            <div className="space-y-3">
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsappShare}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-transform cursor-pointer"
              >
                <span className="text-lg">💬</span>
                <span>مشاركة عبر واتساب (WhatsApp)</span>
              </button>

              {/* Native System Share */}
              <button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="w-full py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>{isSharing ? 'جاري تجهيز المشاركة...' : 'مشاركة سريعة عبر النظام (تطبيقات أخرى)'}</span>
              </button>

              {/* Copy Message & Link */}
              <button
                onClick={handleCopyText}
                className="w-full py-3.5 px-5 rounded-2xl border-2 border-purple-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-purple-600" />}
                <span>{copiedLink ? 'تم نسخ الرسالة والرابط بنجاح! 🎉' : 'نسخ رسالة التكريم والرابط'}</span>
              </button>

              {/* Direct PDF Download inside modal */}
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  setTimeout(() => handleDownloadPdf(), 200);
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 active:scale-95 transition-transform cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>تحميل الشهادة كملف PDF رسمي (A4) 📄</span>
              </button>
            </div>

            {/* Share Preview Text Box */}
            <div className="bg-purple-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-purple-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 space-y-1">
              <span className="text-[11px] font-black text-purple-700 dark:text-purple-400">نص التكريم:</span>
              <p className="leading-relaxed">{shareText}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
