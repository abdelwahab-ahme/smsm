export type Gender = 'boy' | 'girl';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  points: number; // 10 to 50
  unlockedAt?: string;
  requirement: string;
}

export interface UserProfile {
  id: string;
  name: string;
  packCode: string; // كود الطفل في الموقع (كود الكيس)
  email?: string; // بريد إلكتروني اختياري للطفل أو ولي الأمر
  gender: Gender;
  avatar: string;
  points: number;
  unlockedBadgeIds: string[];
  lastSolvedDate: string | null; // YYYY-MM-DD
  solvedChallengesCount: number;
  solvedCategories?: string[];
  retryCount?: number;
  solvedBankQuestionIds?: string[];
  mathSpeedHighScore?: number;
  wheelSpinsCount?: number;
  completedLabExperimentIds?: string[];
  labPointsEarned?: number;
  createdAt: string;
}

export type LabCategory = 'chemistry_physics' | 'motion_optics' | 'nature_plants';

export type AgeGroup = 'all' | '4-7' | '8-12';

export type DifficultyLevel = 'easy' | 'medium' | 'family';

export interface LabExperiment {
  id: string;
  title: string;
  category: LabCategory;
  categoryName: string;
  categoryIcon: string;
  ageGroup: AgeGroup;
  ageLabel: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  durationMinutes: number;
  icon: string;
  heroColor: string;
  summary: string;
  safetyTip: string;
  materials: string[];
  steps: string[];
  scientificExplanation: string;
  funFact: string;
  points: number;
  badgeRewardId?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export type QuestionCategory = 'science' | 'space' | 'math' | 'logic';

export interface BankQuestion {
  id: string;
  category: QuestionCategory;
  categoryLabel: string;
  categoryIcon: string;
  categoryColor: string;
  title: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  funFact: string;
  hint: string;
  points: number;
}

export interface DailyChallenge {
  id: string;
  dayIndex: number; // 1 to 30
  title: string;
  category: 'علوم' | 'فضاء' | 'طبيعة' | 'جسم الإنسان' | 'فيزياء ممتعة';
  categoryColor: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  funFact: string;
  hint: string;
  badgeRewardId?: string;
  points: number;
}

export interface DiscoveryCard {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  content: string;
  funExperiment: string;
}

export interface MotivationalQuote {
  id: string;
  icon: string;
  tag: string;
  category: string;
  quoteBoy: (name: string) => string;
  quoteGirl: (name: string) => string;
  advice: string;
}

export type CertificateFrameId = 'purple' | 'gold' | 'cosmic' | 'pink' | 'emerald' | 'ocean';

export interface CertificateFrameTheme {
  id: CertificateFrameId;
  name: string;
  icon: string;
  description: string;
  previewBg: string;
  outerBorderHex: string;
  innerBorderHex: string;
  dashedBorderHex: string;
  cornerSymbol: string;
  cornerColorHex: string;
  plaqueBgHex: string;
  plaqueBorderHex: string;
  plaqueTextHex: string;
  sealColor1Hex: string;
  sealColor2Hex: string;
  sealBorderHex: string;
  accentColorHex: string;
  // CSS preview classes
  previewOuterBorderClass: string;
  previewDashedBorderClass: string;
  previewCornerClass: string;
  previewPlaqueClass: string;
  previewSealClass: string;
  // Rich gradient & joy styling
  gradientBg: string;
  bannerGradient: string;
  bannerBorderHex: string;
  bannerTextColorHex: string;
  primaryTextColorHex: string;
  highlightColorHex: string;
  statsBgHex: string;
  statsBorderHex: string;
  statsTextHex: string;
  subtleTextColorHex: string;
}

export interface CertificateMilestone {
  id: string;
  title: string;
  subtitle: string;
  badgeIdRequired?: string;
  minPointsRequired?: number;
  minChallengesRequired?: number;
  icon: string;
  frameThemeId: CertificateFrameId;
  description: string;
  ribbonTitle: string;
}

export type UserRole = 'child' | 'parent' | 'admin';

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  linkedPackCodes: string[]; // child pack codes linked to this parent
  createdAt: string;
}


