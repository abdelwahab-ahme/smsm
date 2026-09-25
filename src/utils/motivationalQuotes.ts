import { MotivationalQuote, UserProfile } from '../types';

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'curiosity-spark',
    icon: '💡',
    tag: 'شعلة الفضول',
    category: 'الفضول العلمي',
    quoteBoy: (name) =>
      `يا بطلنا العبقري ${name}، العلم العظيم يبدأ دائماً بسؤال بسيط: لماذا؟ لا تتوقف عن التساؤل والاستكشاف أبداً!`,
    quoteGirl: (name) =>
      `يا بطلتنا العبقرية ${name}، العلم العظيم يبدأ دائماً بسؤال بسيط: لماذا؟ لا تتوقفي عن التساؤل والاستكشاف أبداً!`,
    advice: 'كل سؤال يخطر في بالك هو خطوة أولى نحو اختراع جديد يغير العالم!',
  },
  {
    id: 'trial-and-learning',
    icon: '🔬',
    tag: 'روح التجربة',
    category: 'المحاولة والإصرار',
    quoteBoy: (name) =>
      `تذكّر يا بطلنا ${name}، المحاولة والتجربة هما سر العلماء الكبار.. الخطأ ليس نهاية الطريق، بل بداية التعلم الذكي!`,
    quoteGirl: (name) =>
      `تذكّري يا بطلتنا ${name}، المحاولة والتجربة هما سر العالمات الكبيرات.. الخطأ ليس نهاية الطريق، بل بداية التعلم الذكي!`,
    advice: 'العلماء يجربون مئات المرات قبل أن يصلوا لاكتشافاتهم المذهلة، وأنت مثلهم!',
  },
  {
    id: 'super-mind',
    icon: '🧠',
    tag: 'قوة العقل',
    category: 'الذكاء والتفكير',
    quoteBoy: (name) =>
      `أنت تملك عقلاً خارقاً يا بطلنا ${name}، كل لغز علمي تفكر فيه يجعلك أكثر ذكاءً وقوة وتألقاً!`,
    quoteGirl: (name) =>
      `أنتِ تملكين عقلاً خارقاً يا بطلتنا ${name}، كل لغز علمي تفكرين فيه يجعلكِ أكثر ذكاءً وقوة وتألقاً!`,
    advice: 'عقلك مثل العضلة الرياضية، كلما مرنته بالتفكير والأسئلة أصبح أقوى وأسرع!',
  },
  {
    id: 'space-explorer',
    icon: '🚀',
    tag: 'مغامرة الفضاء',
    category: 'الاستكشاف الواسع',
    quoteBoy: (name) =>
      `يا مستكشفنا الرائع ${name}، النجوم في السماء تنتظر من يكشف أسرارها، وأنت رائد فضاء المستقبل!`,
    quoteGirl: (name) =>
      `يا مستكشفتنا الرائعة ${name}، النجوم في السماء تنتظر من يكشف أسرارها، وأنتِ رائدة فضاء المستقبل!`,
    advice: 'لا تجعل لخيالك حدوداً، فالكون مليء بالعجائب التي تنتظر عقلك اللامع!',
  },
  {
    id: 'daily-habit',
    icon: '🌟',
    tag: 'همة الأبطال',
    category: 'الاستمرار اليومي',
    quoteBoy: (name) =>
      `يوم جديد وبداية تحدٍ ممتع يا ${name}، خطوتك اليومية تصنع منك أسطورة حقيقية في عالم المعرفة!`,
    quoteGirl: (name) =>
      `يوم جديد وبداية تحدٍ ممتع يا ${name}، خطوتكِ اليومية تصنع منكِ أسطورة حقيقية في عالم المعرفة!`,
    advice: 'المواظبة على اكتشاف معلومة واحدة كل يوم تجعلك موسوعة متحركة في غضون عام!',
  },
  {
    id: 'creativity-courage',
    icon: '🎨',
    tag: 'شجاعة الابتكار',
    category: 'الإبداع',
    quoteBoy: (name) =>
      `يا مبدعنا الصغير ${name}، العالم ينتظر أفكارك الفريدة، ثق بنفسك وفكر دائماً خارج الصندوق!`,
    quoteGirl: (name) =>
      `يا مبدعتنا الصغيرة ${name}، العالم ينتظر أفكاركِ الفريدة، ثقي بنفسكِ وفكري دائماً خارج الصندوق!`,
    advice: 'أجمل الاختراعات في تاريخ البشرية ولدت من فكرة بريئة لم يتوقعها أحد!',
  },
  {
    id: 'nature-detective',
    icon: '🌱',
    tag: 'أسرار الطبيعة',
    category: 'علوم الأحياء والبيئة',
    quoteBoy: (name) =>
      `يا محققنا الذكي ${name}، كل شجرة وزهرة وطائر حولك يخبئ سراً علمياً مدهشاً ينتظر أن تكتشفه!`,
    quoteGirl: (name) =>
      `يا محققتنا الذكية ${name}، كل شجرة وزهرة وطائر حولكِ يخبئ سراً علمياً مدهشاً ينتظر أن تكتشفيه!`,
    advice: 'تأمل الطبيعة يمنحنا إلهاماً لحل أعقد مشكلات التكنولوجيا والهندسة!',
  },
  {
    id: 'true-hero',
    icon: '🛡️',
    tag: 'بطل العزيمة',
    category: 'الإصرار والمثابرة',
    quoteBoy: (name) =>
      `البطل الحقيقي يا ${name} هو من يواجه التحديات بابتسامة وثقة ولا يستسلم أبداً!`,
    quoteGirl: (name) =>
      `البطلة الحقيقية يا ${name} هي من تواجه التحديات بابتسامة وثقة ولا تستسلم أبداً!`,
    advice: 'حتى لو واجهت لغزاً صعباً، خذ نفساً عميقاً واستعن بالتلميح، وستصل للحل بكل تأكيد!',
  },
  {
    id: 'kindness-science',
    icon: '💖',
    tag: 'أخلاق العلماء',
    category: 'نشر الخير والمعرفة',
    quoteBoy: (name) =>
      `أنت لست مجرد متفوق يا ${name}، بل أنت قدوة رائعة لأصدقائك في نشر الفرح والمساعدة وحب العلم!`,
    quoteGirl: (name) =>
      `أنتِ لستِ مجرد متفوقة يا ${name}، بل أنتِ قدوة رائعة لصديقاتكِ في نشر الفرح والمساعدة وحب العلم!`,
    advice: 'العالم الحقيقي يشارك علمه مع الناس ليجعل حياتهم أفضل وأسعد.',
  },
  {
    id: 'future-vision',
    icon: '🔭',
    tag: 'مستقبل مشرق',
    category: 'بناء الغد',
    quoteBoy: (name) =>
      `المستقبل يُصنع اليوم بعقلك وإرادتك يا ${name}، ونحن فخورون جداً بكل خطوة تخطوها في سماسم!`,
    quoteGirl: (name) =>
      `المستقبل يُصنع اليوم بعقلكِ وإرادتكِ يا ${name}، ونحن فخورون جداً بكل خطوة تخطينها في سماسم!`,
    advice: 'مكانك محجوز بين كبار العلماء والمخترعين، فاستمر بكل ثقة وحماس!',
  },
  {
    id: 'sunshine-energy',
    icon: '☀️',
    tag: 'طاقة إيجابية',
    category: 'النشاط والبهجة',
    quoteBoy: (name) =>
      `ابتسامتك وطاقتك يا بطلنا ${name} تنيران يومنا، اجعل شغفك بالعلم شعلة لا تنطفئ!`,
    quoteGirl: (name) =>
      `ابتسامتكِ وطاقتكِ يا بطلتنا ${name} تنيران يومنا، اجعلي شغفكِ بالعلم شعلة لا تنطفئ!`,
    advice: 'التعلم مع المرح هو أفضل وصفة لتثبيت المعلومات وصنع الذكريات الجميلة!',
  },
  {
    id: 'badge-glory',
    icon: '🏆',
    tag: 'فخر الإنجاز',
    category: 'التكريم والتميز',
    quoteBoy: (name) =>
      `كل وسام تحرزه يا ${name} هو تاج فخر لجهدك وسهرك وتفكيرك المستقل.. استمر نحو قمة المجد!`,
    quoteGirl: (name) =>
      `كل وسام تحرزينه يا ${name} هو تاج فخر لجهدكِ وسهركِ وتفكيركِ المستقل.. استمري نحو قمة المجد!`,
    advice: 'الأوسمة ليست مجرد نقاط، بل هي شهادة حية على نمو قدراتك يوماً بعد يوم!',
  },
];

/**
 * Returns a random quote, preferentially picking one different from previousId
 */
export function getRandomMotivationalQuote(previousId?: string): MotivationalQuote {
  const pool = previousId
    ? MOTIVATIONAL_QUOTES.filter((q) => q.id !== previousId)
    : MOTIVATIONAL_QUOTES;
  const list = pool.length > 0 ? pool : MOTIVATIONAL_QUOTES;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

/**
 * Formats quote message taking the active profile into account
 */
export function formatMotivationalQuote(
  quote: MotivationalQuote,
  profile?: UserProfile | null
): { text: string; displayName: string; isGirl: boolean } {
  const displayName = profile?.name ? profile.name.trim() : 'بطل سماسم';
  const isGirl = profile?.gender === 'girl';
  const text = isGirl ? quote.quoteGirl(displayName) : quote.quoteBoy(displayName);

  return {
    text,
    displayName,
    isGirl,
  };
}
