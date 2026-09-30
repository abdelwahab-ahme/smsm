import React, { useState, useMemo } from 'react';
import { UserProfile, Gender, ParentProfile, BankQuestion, DailyChallenge, LabExperiment, QuestionCategory, LabCategory, AgeGroup, DifficultyLevel } from '../types';
import { 
  INITIAL_BADGES, 
  getTodayDateString, 
  getSimulatedDateOffset, 
  resetSimulatedDate, 
  advanceToNextSimulatedDay,
  getStoredAdminPin,
  saveStoredAdminPin,
  resetAdminPinToDefault,
  DEFAULT_ADMIN_PIN,
  getStoredAdminEmail,
  saveStoredAdminEmail,
  DEFAULT_ADMIN_EMAIL,
  getStoredQuestionBank,
  saveStoredQuestionBank,
  getStoredDailyChallenges,
  saveStoredDailyChallenges,
  getStoredLabExperiments,
  saveStoredLabExperiments
} from '../utils/storage';
import { QUESTION_BANK } from '../data/questionBank';
import { LAB_EXPERIMENTS } from '../data/labExperiments';
import { DAILY_CHALLENGES } from '../utils/storage';
import { useSound } from '../context/SoundContext';
import { deleteChildProfileFromDb, deleteParentFromDb } from '../lib/samasmDatabase';
import { logAction } from '../lib/audit';
import { 
  Shield, 
  Users, 
  Trophy, 
  Award, 
  Search, 
  Unlock, 
  Plus, 
  Minus, 
  Trash2, 
  RotateCcw, 
  Calendar,
  Lock,
  CheckCircle2, 
  FileSpreadsheet,
  KeyRound,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  LayoutGrid,
  Table,
  UserPlus,
  Edit3,
  X,
  Sparkles,
  Mail,
  Sliders,
  CheckCircle,
  HelpCircle,
  FlaskConical,
  BookOpen,
  Settings,
  UserCheck,
  GraduationCap
} from 'lucide-react';

interface AdminDashboardProps {
  profiles: UserProfile[];
  activeProfileId: string | null;
  onUpdateProfiles: (updated: UserProfile[]) => void;
  parents: ParentProfile[];
  onUpdateParents: (updated: ParentProfile[]) => void;
  onSelectProfile: (id: string) => void;
  onCloseAdmin: () => void;
  onLockAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profiles,
  activeProfileId,
  onUpdateProfiles,
  parents,
  onUpdateParents,
  onSelectProfile,
  onCloseAdmin,
  onLockAdmin,
}) => {
  // Navigation sub-tabs inside Admin Dashboard
  const [activeAdminTab, setActiveAdminTab] = useState<'students' | 'parents' | 'questions' | 'lab' | 'security'>('students');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'cards'>('auto');
  
  // Modals & In-App Dialogs for Students
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<{ id: string; name: string } | null>(null);
  const [inspectStudent, setInspectStudent] = useState<UserProfile | null>(null);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Form state for Adding Student
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<Gender>('boy');
  const [newStudentPoints, setNewStudentPoints] = useState(20);
  const [newStudentAvatar, setNewStudentAvatar] = useState('👦');

  // Parents Management State
  const [deleteConfirmParent, setDeleteConfirmParent] = useState<ParentProfile | null>(null);
  const [isAddingParent, setIsAddingParent] = useState(false);
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentChildCode, setNewParentChildCode] = useState('');

  // Questions Management State
  const [questions, setQuestions] = useState<BankQuestion[]>(() => getStoredQuestionBank());
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<QuestionCategory | 'all'>('all');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);
  const [deleteConfirmQuestionId, setDeleteConfirmQuestionId] = useState<string | null>(null);

  // Lab Experiments Management State
  const [experiments, setExperiments] = useState<LabExperiment[]>(() => getStoredLabExperiments());
  const [isAddingExperiment, setIsAddingExperiment] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<LabExperiment | null>(null);
  const [deleteConfirmExpId, setDeleteConfirmExpId] = useState<string | null>(null);

  // Question Form State
  const [qTitle, setQTitle] = useState('');
  const [qCategory, setQCategory] = useState<QuestionCategory>('science');
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('a');
  const [qExplanation, setQExplanation] = useState('');
  const [qFunFact, setQFunFact] = useState('');
  const [qHint, setQHint] = useState('');
  const [qPoints, setQPoints] = useState(20);

  // Experiment Form State
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<LabCategory>('chemistry_physics');
  const [expAgeGroup, setExpAgeGroup] = useState<AgeGroup>('all');
  const [expDifficulty, setExpDifficulty] = useState<DifficultyLevel>('easy');
  const [expDuration, setExpDuration] = useState(5);
  const [expSummary, setExpSummary] = useState('');
  const [expMaterials, setExpMaterials] = useState('');
  const [expSteps, setExpSteps] = useState('');
  const [expExplanation, setExpExplanation] = useState('');
  const [expFunFact, setExpFunFact] = useState('');
  const [expPoints, setExpPoints] = useState(25);

  // Security Credentials State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const todayStr = getTodayDateString();
  const simulatedOffset = getSimulatedDateOffset();
  const { playClick, playPop, playPointsEarned, playSuccessWhistle, playTryAgain } = useSound();

  // Metrics
  const totalChildren = profiles.length;
  const totalParents = parents.length;
  const totalPoints = profiles.reduce((sum, p) => sum + p.points, 0);
  const totalSolvedToday = profiles.filter((p) => p.lastSolvedDate === todayStr).length;
  const totalBadgesEarned = profiles.reduce((sum, p) => sum + p.unlockedBadgeIds.length, 0);

  // Filtered children
  const filteredProfiles = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.packCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, message });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  // ----------------------------------------------------------------
  // 1. STUDENTS ACTIONS
  // ----------------------------------------------------------------
  const handleConfirmDeleteStudent = async () => {
    if (!deleteConfirmStudent) return;
    const { id, name } = deleteConfirmStudent;

    // الحسابات التجريبية أو المحلية ما لهاش وجود في الداتابيز
    const isLocalOnly = id.startsWith('hero-') || id.startsWith('demo-hero-');
    const ok = isLocalOnly ? true : await deleteChildProfileFromDb(id);

    if (!ok) {
      playTryAgain();
      showToast('فشل الحذف من قاعدة البيانات ولم يتم حذف الطالب (راجع Console).', 'error');
      return;
    }

    playPop();
    onUpdateProfiles(profiles.filter((p) => p.id !== id));
    setDeleteConfirmStudent(null);
    if (inspectStudent?.id === id) setInspectStudent(null);
    if (editingStudent?.id === id) setEditingStudent(null);
    logAction('delete_student', { entity: 'user_profiles', entityId: id, details: { name } });
    showToast(`تم حذف حساب الطالب "${name}" بنجاح!`, 'success');
  };

  const handleResetLockForChild = (childId: string) => {
    playPop();
    const updated = profiles.map((p) => {
      if (p.id === childId) {
        return {
          ...p,
          lastSolvedDate: null,
        };
      }
      return p;
    });
    onUpdateProfiles(updated);
    if (inspectStudent && inspectStudent.id === childId) {
      setInspectStudent({ ...inspectStudent, lastSolvedDate: null });
    }
    showToast('تم فك قفل التحدي اليومي للطالب فوراً!', 'success');
  };

  const handleAdjustPoints = (childId: string, delta: number) => {
    if (delta > 0) {
      playPointsEarned();
      playSuccessWhistle();
    } else {
      playClick();
    }
    const updated = profiles.map((p) => {
      if (p.id === childId) {
        return {
          ...p,
          points: Math.max(0, p.points + delta),
        };
      }
      return p;
    });
    onUpdateProfiles(updated);
    if (inspectStudent && inspectStudent.id === childId) {
      setInspectStudent({ ...inspectStudent, points: Math.max(0, inspectStudent.points + delta) });
    }
  };

  const handleToggleBadge = (childId: string, badgeId: string) => {
    playClick();
    const updated = profiles.map((p) => {
      if (p.id === childId) {
        const hasBadge = p.unlockedBadgeIds.includes(badgeId);
        const newBadges = hasBadge 
          ? p.unlockedBadgeIds.filter((b) => b !== badgeId)
          : [...p.unlockedBadgeIds, badgeId];
        return {
          ...p,
          unlockedBadgeIds: newBadges,
        };
      }
      return p;
    });
    onUpdateProfiles(updated);
    const target = updated.find((p) => p.id === childId);
    if (target && inspectStudent?.id === childId) {
      setInspectStudent(target);
    }
  };

  const handleSaveEditedStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editingStudent.name.trim() || !editingStudent.packCode.trim()) {
      showToast('يرجى ملء اسم الطالب وكود الكيس', 'error');
      return;
    }
    const updated = profiles.map((p) => (p.id === editingStudent.id ? editingStudent : p));
    onUpdateProfiles(updated);
    setEditingStudent(null);
    playSuccessWhistle();
    showToast(`تم حفظ تعديلات الطالب "${editingStudent.name}" بنجاح!`, 'success');
  };

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentCode.trim()) {
      showToast('يرجى كتابة اسم الطالب وكود الكيس', 'error');
      playTryAgain();
      return;
    }

    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      packCode: newStudentCode.trim().toUpperCase(),
      email: newStudentEmail.trim().toLowerCase() || undefined,
      gender: newStudentGender,
      avatar: newStudentAvatar,
      points: Number(newStudentPoints) || 20,
      unlockedBadgeIds: ['curiosity_spark'],
      lastSolvedDate: null,
      solvedChallengesCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [...profiles, newProfile];
    onUpdateProfiles(updated);
    setIsAddingStudent(false);
    setNewStudentName('');
    setNewStudentCode('');
    setNewStudentEmail('');
    playSuccessWhistle();
    showToast(`تمت إضافة البطل "${newProfile.name}" بنجاح!`, 'success');
  };

  // ----------------------------------------------------------------
  // 2. PARENTS ACTIONS
  // ----------------------------------------------------------------
  const handleAddParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentEmail.trim() || !newParentEmail.includes('@')) {
      showToast('يرجى إدخال بريد إلكتروني صالح لولي الأمر', 'error');
      playTryAgain();
      return;
    }

    const newParent: ParentProfile = {
      id: 'parent-' + Date.now(),
      name: newParentName.trim() || 'ولي أمر',
      email: newParentEmail.trim().toLowerCase(),
      linkedPackCodes: newParentChildCode.trim() ? [newParentChildCode.trim().toUpperCase()] : [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...parents, newParent];
    onUpdateParents(updated);
    setIsAddingParent(false);
    setNewParentEmail('');
    setNewParentName('');
    setNewParentChildCode('');
    playSuccessWhistle();
    showToast(`تم تسجيل حساب ولي الأمر (${newParent.email}) بنجاح!`, 'success');
  };

  const handleConfirmDeleteParent = async () => {
    if (!deleteConfirmParent) return;
    const target = deleteConfirmParent;

    const isLocalOnly = target.id.startsWith('parent-');
    const ok = isLocalOnly ? true : await deleteParentFromDb(target.id);

    if (!ok) {
      playTryAgain();
      showToast('فشل حذف ولي الأمر من قاعدة البيانات (راجع Console).', 'error');
      return;
    }

    onUpdateParents(parents.filter((p) => p.id !== target.id));
    setDeleteConfirmParent(null);
    playPop();
    logAction('delete_parent', { entity: 'parents', entityId: target.id, details: { email: target.email } });
    showToast(`تم حذف حساب ولي الأمر (${target.email})!`, 'success');
  };
  // ----------------------------------------------------------------
  // 3. QUESTIONS MANAGEMENT (ADMIN PLATFORM CONTENT CONTROL)
  // ----------------------------------------------------------------
  const handleOpenAddQuestion = () => {
    setQTitle('');
    setQCategory('science');
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQCorrect('a');
    setQExplanation('');
    setQFunFact('');
    setQHint('');
    setQPoints(20);
    setEditingQuestion(null);
    setIsAddingQuestion(true);
  };

  const handleOpenEditQuestion = (q: BankQuestion) => {
    setEditingQuestion(q);
    setQTitle(q.title);
    setQCategory(q.category);
    setQText(q.question);
    setQOptA(q.options[0]?.text || '');
    setQOptB(q.options[1]?.text || '');
    setQOptC(q.options[2]?.text || '');
    setQOptD(q.options[3]?.text || '');
    setQCorrect(q.correctOptionId || 'a');
    setQExplanation(q.explanation);
    setQFunFact(q.funFact);
    setQHint(q.hint);
    setQPoints(q.points);
    setIsAddingQuestion(true);
  };

  const handleSaveQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOptA.trim() || !qOptB.trim()) {
      showToast('يرجى ملء نص السؤال وخياري إجابة على الأقل', 'error');
      playTryAgain();
      return;
    }

    const categoryIcons: Record<QuestionCategory, string> = {
      science: '🔬',
      space: '🚀',
      math: '🔢',
      logic: '🧩',
    };

    const categoryLabels: Record<QuestionCategory, string> = {
      science: 'العلوم',
      space: 'الفضاء',
      math: 'الرياضيات',
      logic: 'منطق وذكاء',
    };

    const questionObj: BankQuestion = {
      id: editingQuestion ? editingQuestion.id : 'custom-q-' + Date.now(),
      category: qCategory,
      categoryLabel: categoryLabels[qCategory],
      categoryIcon: categoryIcons[qCategory],
      categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100',
      title: qTitle.trim() || `سؤال ${categoryLabels[qCategory]} جديد`,
      question: qText.trim(),
      options: [
        { id: 'a', text: qOptA.trim() },
        { id: 'b', text: qOptB.trim() },
        { id: 'c', text: qOptC.trim() || 'إجابة ج' },
        { id: 'd', text: qOptD.trim() || 'إجابة د' },
      ],
      correctOptionId: qCorrect,
      explanation: qExplanation.trim() || 'تفسير علمي رائع يثري معلومات الطفل!',
      funFact: qFunFact.trim() || 'اكتشاف علمي ممتع!',
      hint: qHint.trim() || 'فكر بذكاء واستنتج الإجابة!',
      points: Number(qPoints) || 20,
    };

    let updatedQuestions: BankQuestion[];
    if (editingQuestion) {
      updatedQuestions = questions.map((q) => (q.id === editingQuestion.id ? questionObj : q));
      showToast('تم حفظ تعديلات السؤال في بنك الأسئلة!', 'success');
    } else {
      updatedQuestions = [questionObj, ...questions];
      showToast('تمت إضافة السؤال الجديد إلى بنك أسئلة وتحديات المنصة!', 'success');
    }

    setQuestions(updatedQuestions);
    saveStoredQuestionBank(updatedQuestions);
    setIsAddingQuestion(false);
    setEditingQuestion(null);
    playSuccessWhistle();
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    saveStoredQuestionBank(updated);
    setDeleteConfirmQuestionId(null);
    playPop();
    showToast('تم حذف السؤال من بنك الأسئلة بنجاح!', 'success');
  };

  const handleResetQuestionsToDefault = () => {
    setQuestions(QUESTION_BANK);
    saveStoredQuestionBank(QUESTION_BANK);
    playSuccessWhistle();
    showToast('تمت استعادة الأسئلة الافتراضية بنجاح!', 'success');
  };

  // ----------------------------------------------------------------
  // 4. EXPERIMENTS MANAGEMENT
  // ----------------------------------------------------------------
  const handleOpenAddExperiment = () => {
    setExpTitle('');
    setExpCategory('chemistry_physics');
    setExpAgeGroup('all');
    setExpDifficulty('easy');
    setExpDuration(5);
    setExpSummary('');
    setExpMaterials('');
    setExpSteps('');
    setExpExplanation('');
    setExpFunFact('');
    setExpPoints(25);
    setEditingExperiment(null);
    setIsAddingExperiment(true);
  };

  const handleOpenEditExperiment = (exp: LabExperiment) => {
    setEditingExperiment(exp);
    setExpTitle(exp.title);
    setExpCategory(exp.category);
    setExpAgeGroup(exp.ageGroup);
    setExpDifficulty(exp.difficulty);
    setExpDuration(exp.durationMinutes);
    setExpSummary(exp.summary);
    setExpMaterials(exp.materials.join('\n'));
    setExpSteps(exp.steps.join('\n'));
    setExpExplanation(exp.scientificExplanation);
    setExpFunFact(exp.funFact);
    setExpPoints(exp.points);
    setIsAddingExperiment(true);
  };

  const handleSaveExperimentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expSummary.trim()) {
      showToast('يرجى ملء عنوان وملخص التجربة', 'error');
      playTryAgain();
      return;
    }

    const matList = expMaterials.split('\n').map((m) => m.trim()).filter(Boolean);
    const stepsList = expSteps.split('\n').map((s) => s.trim()).filter(Boolean);

    const expObj: LabExperiment = {
      id: editingExperiment ? editingExperiment.id : 'custom-exp-' + Date.now(),
      title: expTitle.trim(),
      category: expCategory,
      categoryName: expCategory === 'chemistry_physics' ? 'فيزياء وكيمياء' : expCategory === 'motion_optics' ? 'حركة وبصريات' : 'طبيعة ونباتات',
      categoryIcon: expCategory === 'chemistry_physics' ? '🌋' : expCategory === 'motion_optics' ? '🌈' : '🌱',
      ageGroup: expAgeGroup,
      ageLabel: expAgeGroup === 'all' ? 'جميع الأعمار' : expAgeGroup === '4-7' ? '٤-٧ سنوات' : '٨-١٢ سنة',
      difficulty: expDifficulty,
      difficultyLabel: expDifficulty === 'easy' ? 'سهل وممتع' : expDifficulty === 'medium' ? 'متوسط' : 'عائلي',
      durationMinutes: Number(expDuration) || 5,
      icon: '🧪',
      heroColor: 'from-purple-500 to-indigo-600',
      summary: expSummary.trim(),
      safetyTip: 'آمنة وتتم بمساعدة وإشراف الكبار.',
      materials: matList.length > 0 ? matList : ['أدوات منزلية بسيطة وآمنة'],
      steps: stepsList.length > 0 ? stepsList : ['اتبع الإرشادات وشاهد التفاعل العلمي الممتع!'],
      scientificExplanation: expExplanation.trim() || 'تفسير علمي يوضح المبدأ والظاهرة للأطفال.',
      funFact: expFunFact.trim() || 'معلومة مدهشة تزيد من حصيلة الطفل المعرفية!',
      points: Number(expPoints) || 25,
      badgeRewardId: 'lab_first_discovery'
    };

    let updatedExp: LabExperiment[];
    if (editingExperiment) {
      updatedExp = experiments.map((ex) => (ex.id === editingExperiment.id ? expObj : ex));
      showToast('تم حفظ تعديلات التجربة العلمية بنجاح!', 'success');
    } else {
      updatedExp = [expObj, ...experiments];
      showToast('تمت إضافة التجربة الجديدة إلى معمل سماسم!', 'success');
    }

    setExperiments(updatedExp);
    saveStoredLabExperiments(updatedExp);
    setIsAddingExperiment(false);
    setEditingExperiment(null);
    playSuccessWhistle();
  };

  const handleDeleteExperiment = (id: string) => {
    const updated = experiments.filter((e) => e.id !== id);
    setExperiments(updated);
    saveStoredLabExperiments(updated);
    setDeleteConfirmExpId(null);
    playPop();
    showToast('تم حذف التجربة العلمية من المعمل!', 'success');
  };

  const handleResetExperimentsToDefault = () => {
    setExperiments(LAB_EXPERIMENTS);
    saveStoredLabExperiments(LAB_EXPERIMENTS);
    playSuccessWhistle();
    showToast('تمت استعادة تجارب المعمل الافتراضية!', 'success');
  };

  // ----------------------------------------------------------------
  // 5. SECURITY ACTIONS
  // ----------------------------------------------------------------
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.trim().length < 3) {
      showToast('يجب أن يتكون رمز المرور من 3 أرقام أو حروف على الأقل', 'error');
      playTryAgain();
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      showToast('رمز التأكيد غير مطابق للرمز الجديد!', 'error');
      playTryAgain();
      return;
    }

    const saved = saveStoredAdminPin(newPin.trim());
    if (saved) {
      showToast('تم تحديث رمز حماية الأدمن السري بنجاح!', 'success');
      playSuccessWhistle();
      setNewPin('');
      setConfirmPin('');
      setIsChangingPin(false);
    }
  };

  const handleSaveAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      showToast('يرجى إدخال بريد إلكتروني صالح للمدير', 'error');
      playTryAgain();
      return;
    }
    saveStoredAdminEmail(newAdminEmail.trim());
    showToast('تم حفظ البريد الإلكتروني المعتمد للمدير بنجاح!', 'success');
    playSuccessWhistle();
    setIsChangingEmail(false);
    setNewAdminEmail('');
  };

  // Export CSV
  const handleExportCSV = () => {
    playClick();
    const headers = ['الاسم', 'كود الطفل', 'البريد الإلكتروني', 'النوع', 'النقاط', 'عدد الأوسمة', 'الأوسمة', 'تاريخ آخر حل', 'تاريخ التسجيل'];
    const rows = profiles.map((p) => [
      p.name,
      p.packCode,
      p.email || 'غير مسجل',
      p.gender === 'girl' ? 'أنثى' : 'ذكر',
      p.points,
      p.unlockedBadgeIds.length,
      p.unlockedBadgeIds.join(';'),
      p.lastSolvedDate || 'لم يحل بعد',
      p.createdAt ? p.createdAt.split('T')[0] : 'غير محدد',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `samasm-heroes-report-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير ملف إكسل (CSV) بنجاح!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-between gap-3 shadow-lg border-2 animate-in slide-in-from-top-4 duration-200 ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
            : 'bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{feedbackMsg.message}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-linear-to-r from-red-700 via-purple-700 to-indigo-800 text-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-xl border-2 border-red-300/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md text-amber-300 border border-amber-300/30 px-4 py-1 rounded-full text-xs font-black shadow-xs">
              <Shield className="w-4 h-4 text-red-400" />
              <span>لوحة الإدارة والتحكم الشامل للمنصة (Admin Only 🔒)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              التحكم الكامل في منصة سماسم 🎛️
            </h1>
            <p className="text-xs sm:text-sm text-red-100 font-extrabold max-w-xl leading-relaxed">
              صلاحيات كاملة ومباشرة لك وحدك: إدارة حسابات الطلاب وأولياء الأمور، إضافة وتعديل الأسئلة والتحديات اليومية، تجارب المعمل، وضبط الأمان.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white text-purple-950 hover:bg-slate-50 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
              <span>تصدير (CSV)</span>
            </button>

            <button
              onClick={() => {
                playClick();
                if (onLockAdmin) {
                  onLockAdmin();
                } else {
                  onCloseAdmin();
                }
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-red-950/80 hover:bg-red-900 text-white font-black text-xs sm:text-sm transition-all border border-red-400/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              title="قفل لوحة الأدمن وتسجيل الخروج"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>قفل وخروج 🔒</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation (Tab switcher for all admin superpowers) */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => {
            playClick();
            setActiveAdminTab('students');
          }}
          className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAdminTab === 'students'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الطلاب والأبطال ({profiles.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveAdminTab('parents');
          }}
          className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAdminTab === 'parents'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>أولياء الأمور ({parents.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveAdminTab('questions');
          }}
          className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAdminTab === 'questions'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>بنك الأسئلة والتحديات ({questions.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveAdminTab('lab');
          }}
          className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAdminTab === 'lab'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>تجارب المعمل العجيب ({experiments.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveAdminTab('security');
          }}
          className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeAdminTab === 'security'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>الأمان والمحاكاة</span>
        </button>
      </div>

      {/* ================================================================ */}
      {/* TAB 1: STUDENTS MANAGEMENT & BASKET */}
      {/* ================================================================ */}
      {activeAdminTab === 'students' && (
        <div className="space-y-4">
          
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                سجل حسابات الطلاب والأبطال
              </h2>
              <span className="bg-red-100 text-red-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                {filteredProfiles.length} مسجل
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  setIsAddingStudent(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ إضافة طالب جديد</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو كود الكيس أو الإيميل..."
              className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-xs sm:text-sm font-bold"
            />
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-md overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black">
                  <th className="py-3.5 px-4">الطالب</th>
                  <th className="py-3.5 px-3">كود الكيس</th>
                  <th className="py-3.5 px-3">النوع</th>
                  <th className="py-3.5 px-3">النقاط</th>
                  <th className="py-3.5 px-3">الأوسمة</th>
                  <th className="py-3.5 px-3">حالة اليوم</th>
                  <th className="py-3.5 px-3 text-center">التحكم والسلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-black">
                      لا يوجد طلاب يطابقون البحث
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => {
                    const isLocked = p.lastSolvedDate === todayStr;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{p.avatar}</span>
                            <div>
                              <span className="font-black text-slate-950 dark:text-white block text-sm">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-slate-500 font-bold block">
                                {p.email ? p.email : `${p.solvedChallengesCount} تحديات منجزة`}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-mono font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded text-xs border border-purple-200">
                            {p.packCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            p.gender === 'girl' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {p.gender === 'girl' ? 'بنت 👧' : 'ولد 👦'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-amber-700 dark:text-amber-400 text-sm">
                              ⭐ {p.points}
                            </span>
                            <button
                              onClick={() => handleAdjustPoints(p.id, 50)}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]"
                              title="+50 نقطة"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => handleAdjustPoints(p.id, -50)}
                              className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[10px]"
                              title="-50 نقطة"
                            >
                              -50
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-black text-slate-800 dark:text-slate-200">
                            {p.unlockedBadgeIds.length} أوسمة
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              <span>حل اليوم</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Unlock className="w-3 h-3" />
                              <span>متاح</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Follow up student */}
                            <button
                              onClick={() => {
                                playClick();
                                setInspectStudent(p);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-black flex items-center gap-1 cursor-pointer"
                              title="عرض ملف الطالب والأوسمة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>متابعة</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                playClick();
                                setEditingStudent({ ...p });
                              }}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Unlock */}
                            {isLocked && (
                              <button
                                onClick={() => handleResetLockForChild(p.id)}
                                className="px-2 py-1 rounded-lg bg-amber-100 text-amber-950 text-xs font-black hover:bg-amber-200 cursor-pointer"
                                title="فك القفل اليومي"
                              >
                                فك
                              </button>
                            )}

                            {/* Delete (السلة) */}
                            <button
                              onClick={() => {
                                playClick();
                                setDeleteConfirmStudent({ id: p.id, name: p.name });
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-200 text-rose-600 border border-rose-300 cursor-pointer"
                              title="حذف حساب الطالب (السلة)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: PARENTS ACCOUNTS & LINKED STUDENTS */}
      {/* ================================================================ */}
      {activeAdminTab === 'parents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                دليل حسابات أولياء الأمور
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                متابعة أولياء الأمور والأبناء المرتبطين بحساب كل ولي أمر.
              </p>
            </div>

            <button
              onClick={() => {
                playClick();
                setIsAddingParent(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة حساب ولي أمر</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parents.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-500 font-bold">
                لا توجد حسابات أولياء أمور مسجلة حالياً.
              </div>
            ) : (
              parents.map((parent) => {
                const linked = profiles.filter((p) =>
                  parent.linkedPackCodes.some((code) => code.toUpperCase() === p.packCode.toUpperCase())
                );

                return (
                  <div
                    key={parent.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900/60 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center font-black">
                          👨‍👩‍👧
                        </div>
                        <div>
                          <h4 className="font-black text-slate-950 dark:text-white text-base">
                            {parent.name || 'ولي أمر'}
                          </h4>
                          <span className="font-mono text-xs text-purple-700 dark:text-purple-300 block">
                            {parent.email}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          playClick();
                          setDeleteConfirmParent(parent);
                        }}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="حذف حساب ولي الأمر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-xs font-bold text-slate-500 block mb-2">
                        الأبناء المرتبطون ({linked.length}):
                      </span>
                      {linked.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {linked.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border border-purple-200 text-xs font-black"
                            >
                              <span>{c.avatar}</span>
                              <span>{c.name}</span>
                              <span className="font-mono text-[10px] text-purple-600">({c.packCode})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-bold">
                          لم يقم بربط أي طفل بعد (أكواد غير مطابقة أو لم تُدخل).
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3: QUESTION BANK & DAILY CHALLENGES EDITOR */}
      {/* ================================================================ */}
      {activeAdminTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span>إدارة بنك الأسئلة والتحديات اليومية</span>
                <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {questions.length} سؤال
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                يمكنك كأدمن إضافة أسئلة جديدة للمنصة، تعديل الإجابات والتفسيرات، أو حذف أي سؤال.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetQuestionsToDefault}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-black cursor-pointer"
                title="استعادة بنك الأسئلة الافتراضي"
              >
                <RotateCcw className="w-3.5 h-3.5 inline ml-1" />
                استعادة الافتراضي
              </button>

              <button
                onClick={() => {
                  playClick();
                  handleOpenAddQuestion();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ إضافة سؤال جديد</span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'science', 'space', 'math', 'logic'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setQuestionCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer shrink-0 ${
                  questionCategoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat === 'all' ? 'جميع الأقسام' : cat === 'science' ? 'العلوم 🔬' : cat === 'space' ? 'الفضاء 🚀' : cat === 'math' ? 'الرياضيات 🔢' : 'منطق وذكاء 🧩'}
              </button>
            ))}
          </div>

          {/* Questions Grid */}
          <div className="space-y-3">
            {questions
              .filter((q) => questionCategoryFilter === 'all' || q.category === questionCategoryFilter)
              .map((q) => (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{q.categoryIcon}</span>
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                          {q.categoryLabel}
                        </span>
                        <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                          ⭐ {q.points} نقطة
                        </span>
                      </div>
                      <h4 className="font-black text-slate-950 dark:text-white text-base">
                        {q.question}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="تعديل السؤال"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-200 text-rose-600 cursor-pointer"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                    {q.options.map((opt) => {
                      const isCorrect = opt.id === q.correctOptionId;
                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-950 dark:text-emerald-200 font-black'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation snippet */}
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                    💡 <strong>التفسير العلمي:</strong> {q.explanation}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 4: SIMSIM LAB EXPERIMENTS EDITOR */}
      {/* ================================================================ */}
      {activeAdminTab === 'lab' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span>إدارة تجارب المعمل العجيب 🔬</span>
                <span className="text-xs bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                  {experiments.length} تجربة
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                تحكم في تجارب المعمل المعروضة للأطفال، أضف خطوات جديدة، أو عدل التفسيرات العلمية.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetExperimentsToDefault}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-black cursor-pointer"
              >
                استعادة الافتراضي
              </button>

              <button
                onClick={() => {
                  playClick();
                  handleOpenAddExperiment();
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ إضافة تجربة جديدة</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-200 dark:border-teal-900/60 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{exp.icon}</span>
                    <div>
                      <h4 className="font-black text-slate-950 dark:text-white text-base">
                        {exp.title}
                      </h4>
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                        {exp.categoryName} • {exp.durationMinutes} دقائق
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditExperiment(exp)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="تعديل التجربة"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExperiment(exp.id)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-200 text-rose-600 cursor-pointer"
                      title="حذف التجربة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {exp.summary}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px] font-bold text-slate-500">
                  <span>الأدوات المطلوبة ({exp.materials.length}): {exp.materials.slice(0, 3).join('، ')}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 5: SECURITY CREDENTIALS & DATE SIMULATION */}
      {/* ================================================================ */}
      {activeAdminTab === 'security' && (
        <div className="space-y-4">
          
          {/* Admin Email & PIN Management */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    بيانات اعتماد الدخول ومفتاح الأمان (Admin Credentials)
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    البريد المعتمد للمدير: <strong className="font-mono text-purple-700">{getStoredAdminEmail()}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangingEmail(!isChangingEmail)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-black hover:bg-slate-50 cursor-pointer"
                >
                  تعديل البريد
                </button>
                <button
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 cursor-pointer"
                >
                  🔑 تغيير الرمز السري
                </button>
              </div>
            </div>

            {/* Email Change Form */}
            {isChangingEmail && (
              <form onSubmit={handleSaveAdminEmail} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  البريد الإلكتروني الجديد لمدير النظام:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    dir="ltr"
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white font-mono text-sm"
                    required
                  />
                  <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-white font-black text-xs">
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {/* PIN Change Form */}
            {isChangingPin && (
              <form onSubmit={handleSaveNewPin} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      الرمز السري الجديد (PIN):
                    </label>
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="رمز جديد..."
                      maxLength={12}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-black text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                      تأكيد الرمز:
                    </label>
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="أعد كتابة الرمز..."
                      maxLength={12}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-black text-sm"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 text-white font-black text-xs">
                  حفظ الرمز السري الجديد
                </button>
              </form>
            )}
          </div>

          {/* Date Simulation Controls */}
          <div className="bg-amber-50 dark:bg-slate-900 p-5 rounded-3xl border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-black">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>تاريخ المنصة اليوم: <strong className="font-mono text-base">{todayStr}</strong></span>
              {simulatedOffset > 0 && (
                <span className="bg-amber-300 text-amber-950 px-2 py-0.5 rounded text-xs font-black">
                  (+{simulatedOffset} يوم محاكاة)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  playClick();
                  advanceToNextSimulatedDay();
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
              >
                +1 يوم مستقبلي (تجربة التحدي القادم)
              </button>

              {simulatedOffset !== 0 && (
                <button
                  onClick={() => {
                    playClick();
                    resetSimulatedDate();
                  }}
                  className="px-4 py-2 rounded-xl border border-amber-400 bg-white text-amber-950 font-black text-xs cursor-pointer"
                >
                  إعادة ضبط
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: CONFIRM DELETE STUDENT (سلة الحذف) */}
      {/* ================================================================ */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-2 border-rose-400">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                تأكيد حذف الطالب نهائياً
              </h3>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                هل أنت متأكد من حذف حساب الطالب <strong className="text-rose-600 font-black">"{deleteConfirmStudent.name}"</strong> من قاعدة البيانات؟
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-black text-xs text-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDeleteStudent}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                نعم، احذف الطالب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: CONFIRM DELETE PARENT */}
      {/* ================================================================ */}
      {deleteConfirmParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border-2 border-rose-400">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                تأكيد حذف حساب ولي الأمر
              </h3>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                هل أنت متأكد من حذف حساب ولي الأمر <strong className="text-rose-600 font-black">({deleteConfirmParent.email})</strong>؟
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmParent(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-black text-xs text-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDeleteParent}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                نعم، احذف الحساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: ADD / EDIT QUESTION (PLATFORM CONTENT) */}
      {/* ================================================================ */}
      {isAddingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-amber-400 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>{editingQuestion ? 'تعديل سؤال في بنك الأسئلة' : 'إضافة سؤال جديد لبنك الأسئلة والتحديات'}</span>
              </h3>
              <button onClick={() => setIsAddingQuestion(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handleSaveQuestionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  القسم العلمي:
                </label>
                <select
                  value={qCategory}
                  onChange={(e) => setQCategory(e.target.value as QuestionCategory)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black"
                >
                  <option value="science">العلوم (Science) 🔬</option>
                  <option value="space">الفضاء والفلك (Space) 🚀</option>
                  <option value="math">الرياضيات والحساب (Math) 🔢</option>
                  <option value="logic">منطق وذكاء (Logic) 🧩</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  نص السؤال العلمي *:
                </label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="اكتب السؤال الموجه للطفل..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">الخيار (أ):</label>
                  <input
                    type="text"
                    value={qOptA}
                    onChange={(e) => setQOptA(e.target.value)}
                    placeholder="الخيار الأول..."
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">الخيار (ب):</label>
                  <input
                    type="text"
                    value={qOptB}
                    onChange={(e) => setQOptB(e.target.value)}
                    placeholder="الخيار الثاني..."
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">الخيار (ج):</label>
                  <input
                    type="text"
                    value={qOptC}
                    onChange={(e) => setQOptC(e.target.value)}
                    placeholder="الخيار الثالث..."
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">الخيار (د):</label>
                  <input
                    type="text"
                    value={qOptD}
                    onChange={(e) => setQOptD(e.target.value)}
                    placeholder="الخيار الرابع..."
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black text-emerald-700 mb-1">الخيار الصحيح:</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-emerald-950 text-xs font-black"
                  >
                    <option value="a">الخيار (أ)</option>
                    <option value="b">الخيار (ب)</option>
                    <option value="c">الخيار (ج)</option>
                    <option value="d">الخيار (د)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-amber-700 mb-1">النقاط الممنوحة:</label>
                  <input
                    type="number"
                    value={qPoints}
                    onChange={(e) => setQPoints(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">التفسير العلمي المبسط:</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="لماذا هذه هي الإجابة الصحيحة؟"
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-xl border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md"
                >
                  {editingQuestion ? 'حفظ التعديلات' : 'نشر السؤال في المنصة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: ADD / EDIT LAB EXPERIMENT */}
      {/* ================================================================ */}
      {isAddingExperiment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-teal-400 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                <span>{editingExperiment ? 'تعديل تجربة علمية' : 'إضافة تجربة جديدة للمعمل العجيب'}</span>
              </h3>
              <button onClick={() => setIsAddingExperiment(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handleSaveExperimentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">عنوان التجربة *:</label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="مثال: صنع قوس قزح في كوب ماء"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">القسم:</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as LabCategory)}
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                  >
                    <option value="chemistry_physics">فيزياء وكيمياء 🌋</option>
                    <option value="motion_optics">حركة وبصريات 🌈</option>
                    <option value="nature_plants">طبيعة ونباتات 🌱</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">المدة (بالدقائق):</label>
                  <input
                    type="number"
                    value={expDuration}
                    onChange={(e) => setExpDuration(Number(e.target.value))}
                    min={2}
                    max={60}
                    className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">ملخص مشوق للتجربة:</label>
                <textarea
                  value={expSummary}
                  onChange={(e) => setExpSummary(e.target.value)}
                  placeholder="ملخص قصير يشجع الطفل..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-xl border text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">الأدوات والمواد (اكتب كل أداة في سطر):</label>
                <textarea
                  value={expMaterials}
                  onChange={(e) => setExpMaterials(e.target.value)}
                  placeholder="كوب ماء&#10;ملعقة ملح&#10;ألوان طعام..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-xl border text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">خطوات التنفيذ (اكتب كل خطوة في سطر):</label>
                <textarea
                  value={expSteps}
                  onChange={(e) => setExpSteps(e.target.value)}
                  placeholder="الخطوة الأولى...&#10;الخطوة الثانية..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-xl border text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">التفسير العلمي للظاهرة:</label>
                <textarea
                  value={expExplanation}
                  onChange={(e) => setExpExplanation(e.target.value)}
                  placeholder="لماذا حدث هذا التفاعل؟"
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-xl border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingExperiment(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md"
                >
                  {editingExperiment ? 'حفظ التعديلات' : 'نشر التجربة في المعمل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: ADD STUDENT */}
      {/* ================================================================ */}
      {isAddingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-red-400">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-600" />
                <span>إضافة بطل / طالب جديد للمنصة</span>
              </h3>
              <button onClick={() => setIsAddingStudent(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handleCreateStudentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">اسم الطالب *:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="مثال: يوسف محمود"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">كود الكيس *:</label>
                  <input
                    type="text"
                    value={newStudentCode}
                    onChange={(e) => setNewStudentCode(e.target.value.toUpperCase())}
                    placeholder="SMSM-9901"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl border font-mono font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">النوع:</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-bold"
                  >
                    <option value="boy">ذكر 👦</option>
                    <option value="girl">أنثى 👧</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">البريد الإلكتروني (اختياري):</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">النقاط الترحيبية:</label>
                <input
                  type="number"
                  value={newStudentPoints}
                  onChange={(e) => setNewStudentPoints(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md"
                >
                  حفظ الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: ADD PARENT */}
      {/* ================================================================ */}
      {isAddingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-purple-400">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>إضافة حساب ولي أمر جديد</span>
              </h3>
              <button onClick={() => setIsAddingParent(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handleAddParentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">البريد الإلكتروني لولي الأمر *:</label>
                <input
                  type="email"
                  value={newParentEmail}
                  onChange={(e) => setNewParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">اسم ولي الأمر:</label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="مثال: أ/ أحمد علي"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">كود الطفل المرتبط به (اختياري):</label>
                <input
                  type="text"
                  value={newParentChildCode}
                  onChange={(e) => setNewParentChildCode(e.target.value.toUpperCase())}
                  placeholder="SMSM-7701"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingParent(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md"
                >
                  تسجيل ولي الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: INSPECT STUDENT DETAILS & BADGES */}
      {/* ================================================================ */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-purple-400 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{inspectStudent.avatar}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">
                    ملف البطل: {inspectStudent.name}
                  </h3>
                  <span className="font-mono text-xs text-purple-700 dark:text-purple-300">
                    كود: {inspectStudent.packCode}
                  </span>
                </div>
              </div>
              <button onClick={() => setInspectStudent(null)} className="text-slate-400 p-1">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
                <span className="text-slate-500 block">رصيد النقاط:</span>
                <span className="text-base font-black text-amber-700">⭐ {inspectStudent.points}</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200">
                <span className="text-slate-500 block">التحديات المحلولة:</span>
                <span className="text-base font-black text-blue-700">{inspectStudent.solvedChallengesCount}</span>
              </div>
            </div>

            {/* Badges Toggle List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                أوسمة الشرف (اضغط لمنح أو سحب وسام):
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {INITIAL_BADGES.map((b) => {
                  const hasBadge = inspectStudent.unlockedBadgeIds.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleToggleBadge(inspectStudent.id, b.id)}
                      className={`p-2 rounded-xl border text-right text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        hasBadge
                          ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 text-amber-950 dark:text-amber-100'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{b.icon}</span>
                        <span className="truncate">{b.name}</span>
                      </div>
                      <span>{hasBadge ? '✅' : '➕'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectStudent(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-black text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* IN-APP MODAL: EDIT STUDENT */}
      {/* ================================================================ */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-purple-400">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                تعديل بيانات الطالب
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handleSaveEditedStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">اسم الطالب:</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">كود الكيس:</label>
                <input
                  type="text"
                  value={editingStudent.packCode}
                  onChange={(e) => setEditingStudent({ ...editingStudent, packCode: e.target.value.toUpperCase() })}
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl border font-mono font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={editingStudent.email || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">النقاط الحالية:</label>
                <input
                  type="number"
                  value={editingStudent.points}
                  onChange={(e) => setEditingStudent({ ...editingStudent, points: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
