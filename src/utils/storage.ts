import { Badge, DailyChallenge, DiscoveryCard, UserProfile, ParentProfile, UserRole, BankQuestion, LabExperiment } from '../types';
import { QUESTION_BANK } from '../data/questionBank';
import { LAB_EXPERIMENTS } from '../data/labExperiments';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'curiosity_spark',
    name: 'شرارة الفضول الأولى',
    description: 'يُمنح لكل بطل عند حل أول كيس واكتشاف أول لغز علمي في سماسم!',
    icon: '🌟',
    color: 'from-amber-400 to-yellow-500',
    points: 10,
    requirement: 'حل أول تحدي يومي بنجاح',
  },
  {
    id: 'smart_explorer',
    name: 'رتبة المستكشف الذكي',
    description: 'تخطي 50 نقطة والارتقاء للمستوى الثاني من الذكاء والاستكشاف!',
    icon: '🔭',
    color: 'from-blue-400 to-cyan-500',
    points: 15,
    requirement: 'تخطي 50 نقطة في رصيد المعرفة',
  },
  {
    id: 'daily_streak',
    name: 'بطل الالتزام والاستمرار اليومي',
    description: 'للمواظبة الرائعة على حل التحدي كل يوم بيومه واستمرار الشغف العلمي!',
    icon: '⚡',
    color: 'from-yellow-400 to-amber-500',
    points: 20,
    requirement: 'المواظبة على حل التحدي اليومي',
  },
  {
    id: 'multiverse_explorer',
    name: 'مستكشف العوالم المتعددة',
    description: 'خوض مغامرات وحل أسئلة في مجالات معرفية متنوعة (فضاء، طبيعة، فيزياء)!',
    icon: '🌌',
    color: 'from-purple-500 to-indigo-600',
    points: 20,
    requirement: 'حل أسئلة في 3 مجالات علمية مختلفة',
  },
  {
    id: 'persistent_thinker',
    name: 'المحاول المثابر الذي لا يستسلم',
    description: 'التفكير العميق ومراجعة الإجابة والمحاولة مجدداً حتى الوصول للصواب!',
    icon: '🧠',
    color: 'from-rose-400 to-pink-500',
    points: 15,
    requirement: 'استخدام التلميح أو المحاولة بتركيز للوصول للحل',
  },
  {
    id: 'early_bird',
    name: 'متسائل الصباح الباكر',
    description: 'حل التحدي العلمي بشغف ونشاط ذهني في الصباح الباكر!',
    icon: '☀️',
    color: 'from-amber-300 to-orange-400',
    points: 15,
    requirement: 'حل التحدي اليومي في الفترة الصباحية',
  },
  {
    id: 'five_flavors',
    name: 'حارس أسرار النكهات الخمس',
    description: 'استكشاف أكياس ونكهات سماسم اللذيذة وأسرار العلوم بداخلها!',
    icon: '🍭',
    color: 'from-pink-400 to-rose-400',
    points: 25,
    requirement: 'استكشاف أكياس ونكهات سماسم وحل 5 تحديات',
  },
  {
    id: 'junior_scientist',
    name: 'رتبة العالم الصغير',
    description: 'تخطي 150 نقطة والدخول الرسمي لنادي العلماء والعباقرة الصغار!',
    icon: '🔬',
    color: 'from-emerald-400 to-teal-500',
    points: 30,
    requirement: 'الوصول إلى 150 نقطة فأكثر',
  },
  {
    id: 'physics_detective',
    name: 'المحقق العلمي العبقري',
    description: 'حل التحدي المتقدم في فيزياء الجاذبية وسرعة الأجسام والكون!',
    icon: '🔍',
    color: 'from-sky-400 to-blue-600',
    points: 25,
    requirement: 'حل تحدي فيزياء الجاذبية المتقدمة',
  },
  {
    id: 'professor_grand',
    name: 'وسام بروفيسور سماسم',
    description: 'الوصول للقمة المعرفية والتتويج بأعلى رتبة علمية في عائلة سماسم!',
    icon: '👑',
    color: 'from-amber-400 via-yellow-400 to-amber-600',
    points: 50,
    requirement: 'الوصول إلى 250 نقطة وتحقيق القمة المعرفية',
  },
  {
    id: 'math_lightning',
    name: 'صاعقة الحساب السريع',
    description: 'تحقيق أداء مذهل وإجابات متتالية في تحدي السرعة الحسابية بالـ Timer!',
    icon: '⚡',
    color: 'from-amber-400 to-yellow-500',
    points: 25,
    requirement: 'إحراز 5 إجابات صحيحة في جولة واحدة بتحدي السرعة',
  },
  {
    id: 'wheel_master',
    name: 'فارس عجلة المعرفة',
    description: 'تدوير عجلة المعرفة وحل أسئلة متنوعة وشجاعة في مختلف القطاعات!',
    icon: '🎡',
    color: 'from-fuchsia-500 to-pink-500',
    points: 25,
    requirement: 'تدوير العجلة وحل 3 أسئلة بنجاح',
  },
  {
    id: 'quiz_bank_conqueror',
    name: 'قاهر بنك الأسئلة الذكي',
    description: 'حل 10 أسئلة علمية ومنطقية غير مكررة من بنك الأسئلة الضخم!',
    icon: '🏆',
    color: 'from-emerald-400 via-teal-500 to-cyan-600',
    points: 35,
    requirement: 'حل 10 أسئلة متنوعة في بنك الأسئلة الذكي',
  },
  {
    id: 'lab_first_discovery',
    name: 'مبتكر المعمل الواعد',
    description: 'يُمنح للبطل عند إتمام أول تجربة علمية واقعية في المعمل العجيب!',
    icon: '🧪',
    color: 'from-emerald-400 to-teal-500',
    points: 20,
    requirement: 'إتمام أول تجربة علمية بالمعمل العجيب',
  },
  {
    id: 'lab_master_chemist',
    name: 'كيميائي المعمل العجيب',
    description: 'إتمام 3 تجارب فيزيائية وكيميائية وفهم أسرار المادة والغازات!',
    icon: '🌋',
    color: 'from-rose-500 to-amber-500',
    points: 30,
    requirement: 'إتمام 3 تجارب فيزيائية وكيميائية',
  },
  {
    id: 'lab_nature_explorer',
    name: 'عالم الطبيعة والبيئة',
    description: 'إتمام تجارب الحياة النباتية ودورة الماء وكشف عجائب الكون!',
    icon: '🌿',
    color: 'from-lime-400 to-emerald-600',
    points: 35,
    requirement: 'إتمام تجارب النباتات ودورة المطر والبيئة',
  },
  {
    id: 'little_sage',
    name: 'الحكيم الصغير',
    description: 'إتمام 3 قصص من قصص الأنبياء والإجابة عن أسئلتها بنجاح!',
    icon: '📖',
    color: 'from-emerald-400 to-teal-500',
    points: 20,
    requirement: 'إتمام 3 قصص من قصص الأنبياء',
  },
  {
    id: 'good_manners',
    name: 'صاحب الخلق الحسن',
    description: 'اختيار السلوك الصحيح في 5 مواقف من الآداب الإسلامية!',
    icon: '🌟',
    color: 'from-amber-400 to-yellow-500',
    points: 20,
    requirement: 'حل 5 مواقف من الأخلاق والآداب',
  },
  {
    id: 'fortress_hero',
    name: 'حصن البطل',
    description: 'ترتيب 3 أدعية أو سور قصيرة بنجاح وحفظها!',
    icon: '🛡️',
    color: 'from-sky-400 to-indigo-500',
    points: 25,
    requirement: 'ترتيب 3 أذكار صحيحة في حصن البطل',
  },
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'day-1',
    dayIndex: 1,
    title: 'سر سحر غزل البنات في معمل سماسم',
    category: 'فيزياء ممتعة',
    categoryColor: 'bg-pink-100 text-pink-900 border border-pink-300',
    question: 'كيف يتحول سكر الطعام الصلب داخل ماكينة سماسم إلى خيوط غزل بنات قطنية ناعمة جداً تذوب في الفم؟',
    options: [
      { id: 'opt-a', text: 'بإضافة ماء مثلج سريع التجمد' },
      { id: 'opt-b', text: 'بالحرارة العالية مع الدوران السريع الذي يقذف السكر عبر ثقوب دقيقة' },
      { id: 'opt-c', text: 'باستخدام مواد كيميائية مضغوطة بالهواء' },
      { id: 'opt-d', text: 'بواسطة مغناطيس خاص يجذب السكر' },
    ],
    correctOptionId: 'opt-b',
    explanation: 'تذيب الحرارة حبيبات السكر لتتحول لسائل، ثم تقوم قوة الطرد المركزي بالدوران بسرعة هائلة ودفع السائل عبر ثقوب مجهرية. وبمجرد ملامسته للهواء البارد، يتصلب فوراً على شكل خيوط حريرية فائقة الرقة كالسحاب!',
    funFact: 'هل تعلم؟ خيط غزل البنات أرق بكثير من شعرة رأس الإنسان!',
    hint: 'فكّر فيما يحدث عندما يدور الشيء بسرعة فائقة وحرارة عالية!',
    badgeRewardId: 'curiosity_spark',
    points: 20,
  },
  {
    id: 'day-2',
    dayIndex: 2,
    title: 'أسرار الكوكب الأحمر العجيب',
    category: 'فضاء',
    categoryColor: 'bg-indigo-100 text-indigo-950 border border-indigo-300',
    question: 'ما هو السبب الحقيقي وراء اللون الأحمر المميز لكوكب المريخ في الفضاء؟',
    options: [
      { id: 'opt-a', text: 'لأنه كوكب ساخن جداً ومليء بالنيران المشتعلة' },
      { id: 'opt-b', text: 'لوجود كميات ضخمة من أكسيد الحديد (الصدأ) في تربته وصخوره' },
      { id: 'opt-c', text: 'لأن غلافه الجوي مصنوع من زجاج أحمر' },
      { id: 'opt-d', text: 'بسبب قربه الشديد من الشمس مقارنة بالأرض' },
    ],
    correctOptionId: 'opt-b',
    explanation: 'صخور وتربة المريخ غنية جداً بمعدن الحديد الذي تفاعل مع الأكسجين قديماً وشكّل أكسيد الحديد (الصدأ) ذو اللون الصدأي البرتقالي المائل للحمرة، مما يجعله يبدو ساطعاً باللون الأحمر في سمائنا!',
    funFact: 'على كوكب المريخ يقع جبل "أوليمبوس"، وهو أكبر بركان في المجموعة الشمسية وارتفاعه 3 أضعاف قمة إيفرست!',
    hint: 'تذكر ماذا يحدث للحديد عندما يتعرض للهواء والرطوبة ويتحول لونه إلى بني مائل للاحمرار!',
    badgeRewardId: 'multiverse_explorer',
    points: 20,
  },
  {
    id: 'day-3',
    dayIndex: 3,
    title: 'لغز التنفس تحت أعماق البحار',
    category: 'طبيعة',
    categoryColor: 'bg-teal-100 text-teal-950 border border-teal-300',
    question: 'كيف تستطيع الأسماك تنفس الأكسجين والحياة داخل الماء دون أن تغرق؟',
    options: [
      { id: 'opt-a', text: 'تحبس أنفاسها وتصعد للسطح كل بضع دقائق فقط' },
      { id: 'opt-b', text: 'عن طريق الخياشيم التي تمتص الأكسجين الذائب في الماء' },
      { id: 'opt-c', text: 'عبر قشور جلدها الخارجية فقط' },
      { id: 'opt-d', text: 'الأسماك لا تحتاج للأكسجين نهائياً للعيش' },
    ],
    correctOptionId: 'opt-b',
    explanation: 'تمتلك الأسماك خياشيم رقيقة جداً غنية بالشعيرات الدموية، فعندما يدخل الماء من فمها ويمر عبر الخياشيم، يتم امتصاص جزيئات الأكسجين الذائبة في الماء وطرد ثاني أكسيد الكربون بسلاسة!',
    funFact: 'بعض الأسماك مثل سمكة التونة يجب أن تظل تسبح دون توقف طوال حياتها حتى يتدفق الماء عبر خياشيمها للتنفس!',
    hint: 'عضو موجود على جانبي رأس السمكة تحت غطاء متحرك!',
    badgeRewardId: 'multiverse_explorer',
    points: 20,
  },
  {
    id: 'day-4',
    dayIndex: 4,
    title: 'أسرار سرعة الصوت والضوء الخارقة',
    category: 'علوم',
    categoryColor: 'bg-amber-100 text-amber-950 border border-amber-300',
    question: 'أثناء العواصف الرعدية، لماذا نرى وميض البرق الساطع قبل أن نسمع صوت الرعد المدوي؟',
    options: [
      { id: 'opt-a', text: 'لأن أعيننا أقرب للغيوم من آذاننا' },
      { id: 'opt-b', text: 'لأن الرعد يبدأ بعد انتهاء البرق بـ 10 دقائق دائماً' },
      { id: 'opt-c', text: 'لأن سرعة الضوء هائلة جداً (300,000 كم/ثانية) وهي أسرع بكثير من سرعة الصوت في الهواء' },
      { id: 'opt-d', text: 'لأن الهواء يوقف الصوت ويمنعه من الوصول' },
    ],
    correctOptionId: 'opt-c',
    explanation: 'الضوء سريع للغاية ويسافر بسرعة 300,000 كيلومتر في الثانية الواحدة، بينما الصوت يسافر بسرعة 340 متراً فقط في الثانية، لذا يصل وميض البرق إلى أعيننا في جزء من الثانية بينما يستغرق الصوت ثوانٍ للوصول لآذاننا!',
    funFact: 'يمكنك معرفة بُعد العاصفة عنك بعدّ الثواني بين وميض البرق وصوت الرعد: كل 3 ثوانٍ تعني أن العاصفة تبعد كيلومتراً واحداً تقريباً!',
    hint: 'أيهما أسرع: وميض المصباح أم صوت التصفيق؟',
    badgeRewardId: 'smart_explorer',
    points: 20,
  },
  {
    id: 'day-5',
    dayIndex: 5,
    title: 'معجزة البصمات في أصابعنا',
    category: 'جسم الإنسان',
    categoryColor: 'bg-rose-100 text-rose-950 border border-rose-300',
    question: 'ما الشيء المميز جداً في بصمات أصابع كل إنسان على وجه الأرض؟',
    options: [
      { id: 'opt-a', text: 'تتغير أشكالها كل عام مع كبر العمر' },
      { id: 'opt-b', text: 'جميع التوائم المتطابقة لديهم نفس البصمة بالضبط' },
      { id: 'opt-c', text: 'فريدة تماماً ولا يتشابه فيها اثنان من بين 8 مليارات شخص، حتى التوائم المتطابقة!' },
      { id: 'opt-d', text: 'تختفي تماماً عند غسل اليدين بالصابون' },
    ],
    correctOptionId: 'opt-c',
    explanation: 'بصمة كل شخص هي تصميم هندسي رباني فريد لا يتكرر أبداً في أي إنسان آخر في العالم أجمع! وتتشكل هذه الخطوط الدقيقة أثناء نمو الجنين قبل ولادته وتبقى ثابتة طوال حياته.',
    funFact: 'الكوالا هو الحيوان الوحيد الذي يمتلك بصمات أصابع تشبه بصمات الإنسان لدرجة تخدع المحققين تحت المجهر!',
    hint: 'كل بطل في سماسم هو شخصية خاصة لا مثيل لها في الكون!',
    badgeRewardId: 'persistent_thinker',
    points: 20,
  },
  {
    id: 'day-6',
    dayIndex: 6,
    title: 'لغز الجاذبية الأرضية وسقوط الأجسام',
    category: 'فيزياء ممتعة',
    categoryColor: 'bg-sky-100 text-sky-950 border border-sky-300',
    question: 'إذا أسقطنا كرة حديدية ثقيلة وريشة خفيفة داخل أنبوب مفرغ تماماً من الهواء، ماذا يحدث؟',
    options: [
      { id: 'opt-a', text: 'تسقط الكرة الحديدية أولاً لأنها أثقل بكثير' },
      { id: 'opt-b', text: 'تسقطان معاً في نفس اللحظة بالضبط وتصلان للأرض سوياً!' },
      { id: 'opt-c', text: 'الريشة تطفو للأعلى ولا تسقط نهائياً' },
      { id: 'opt-d', text: 'تتكسر الكرة قبل أن تصل' },
    ],
    correctOptionId: 'opt-b',
    explanation: 'في غياب مقاومة الهواء، تجذب الجاذبية الأرضية جميع الأجسام بنفس التسارع الثابت تماماً، فتسقط الريشة والكرة بنفس السرعة وتصلان في نفس اللحظة تماماً!',
    funFact: 'قام رواد الفضاء على سطح القمر بإسقاط مطرقة وريشة معاً، وسقطتا في نفس اللحظة أمام كاميرات العالم أجمع!',
    hint: 'فكر فيما يمنع الريشة عادة على الأرض: هل هو وزنها أم الهواء الذي يداعبها؟',
    badgeRewardId: 'physics_detective',
    points: 20,
  },
  {
    id: 'day-7',
    dayIndex: 7,
    title: 'سر النكهات وألوان الطبيعة في حلوى سماسم',
    category: 'علوم',
    categoryColor: 'bg-pink-100 text-pink-950 border border-pink-300',
    question: 'من أين تأتي ألوان ونكهات الفراولة والكراميل الطبيعية الشهية داخل منتجات سماسم؟',
    options: [
      { id: 'opt-a', text: 'من مستخلصات الفواكه والنباتات الطبيعية والزيوت العطرية النقية' },
      { id: 'opt-b', text: 'من دهانات كيميائية صناعية غامقة' },
      { id: 'opt-c', text: 'بإضافة ماء البحر المالح' },
      { id: 'opt-d', text: 'من أوراق الشجر الجافة فقط' },
    ],
    correctOptionId: 'opt-a',
    explanation: 'تعتمد سماسم على خلاصة الفواكه الطبيعية والألوان الآمنة المستخرجة من النباتات الصحية مثل الشمندر والكركم والتوت لتمنح الأطفال نكهات ساحرة وصحية ومبهجة!',
    funFact: 'حاسة التذوق ترتبط مباشرة بحاسة الشم، فحوالي 80% من النكهة التي نشعر بها تأتي في الحقيقة من رائحة الطعام الزكية!',
    hint: 'ما هو المصدر الأكثر صحة وأماناً لأجسام الأبطال الصغار؟',
    badgeRewardId: 'five_flavors',
    points: 20,
  },
];

export const DISCOVERY_CARDS: DiscoveryCard[] = [
  {
    id: 'candy-science',
    title: 'فيزياء غزل البنات السحرية',
    category: 'علوم الطهي والفيزياء',
    icon: '🍭',
    summary: 'كيف تتحول حبة سكر بلورية إلى سحابة وردية ناعمة تطير في الهواء؟',
    content: 'عند تسخين السكر لدرجة 160 مئوية، تتكسر الروابط البلورية الصلبة ويتحول إلى سائل ذهبي. عندما يدور رأس الماكينة بسرعة 3400 دورة بالدقيقة، يتم قذف السكر السائل في الهواء البارد فيبرد في أجزاء من الألف من الثانية ليتحول إلى خيوط غير متبلورة ناعمة مثل القطن تماماً!',
    funExperiment: 'جرّب وضع قطعة صغيرة من غزل البنات في فمك دون مضغ: ستلاحظ أنها تختفي في ثانية واحدة لأن لعاب الفم يذيب السكر الفائق الرقة فورياً!',
  },
  {
    id: 'rainbow-mystery',
    title: 'سر ألوان قوس قزح في السماء',
    category: 'بصريات وضوء',
    icon: '🌈',
    summary: 'هل ضوء الشمس الأبيض يخفي داخله كل ألوان الطبيعة؟',
    content: 'ضوء الشمس الذي يبدو لنا أبيضاً هو في الحقيقة مزيج متناغم من 7 ألوان مبهجة. عندما تسقط أشعة الشمس على قطرات المطر المعلقة في الهواء، تعمل كل قطرة مثل منشور زجاجي دقيق يكسر الضوء ويفصل ألوانه إلى: الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، والبنفسجي!',
    funExperiment: 'في يوم مشمس، قف وظهرك للشمس ورش رذاذاً خفيفاً من خرطوم الماء في الحديقة، ستشاهد قوس قزح الصغير الخاص بك يتألق أمام عينيك!',
  },
  {
    id: 'plant-sun',
    title: 'طبخ أوراق الشجر بالطاقة الشمسية',
    category: 'عالم النبات',
    icon: '🍃',
    summary: 'التمثيل الضوئي: كيف تصنع النباتات طعامها وتنتج لنا الأكسجين لنعيش؟',
    content: 'تحتوي أوراق النباتات على مادة سحرية خضراء تسمى "الكلوروفيل". تمتص هذه المادة ضوء الشمس، وتأخذ الماء من الجذور وثاني أكسيد الكربون من الهواء لتطبخ سكر الجلوكوز اللذيذ لطاقتها، وتهدينا كوكبياً غاز الأكسجين النقي الذي نتنفسه!',
    funExperiment: 'ضع نبتة صغيرة في غرفة معتمة بجوار نافذة، وراقب كيف تنحني أوراقها وساقها وتتجه بذكاء نحو الضوء بحثاً عن طاقة الشمس!',
  },
];

const PROFILES_KEY = 'samasm_app_profiles_v2';
const ACTIVE_PROFILE_KEY = 'samasm_app_active_profile_id_v2';
const DARK_MODE_KEY = 'samasm_app_theme_dark_v2';
const SOUND_MUTED_KEY = 'samasm_app_sound_muted_v2';
const SOUND_VOLUME_KEY = 'samasm_app_sound_volume_v2';
const SIMULATED_DATE_KEY = 'samasm_simulated_date_offset_v2';

export function getTodayDateString(): string {
  const offsetDays = getSimulatedDateOffset();
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  return date.toISOString().split('T')[0];
}

export function getSimulatedDateOffset(): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(SIMULATED_DATE_KEY);
  return val ? parseInt(val, 10) : 0;
}

export function setSimulatedDateOffset(days: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIMULATED_DATE_KEY, days.toString());
}

export function advanceToNextSimulatedDay() {
  const current = getSimulatedDateOffset();
  setSimulatedDateOffset(current + 1);
}

export function resetSimulatedDate() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SIMULATED_DATE_KEY);
}

export function getStoredProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      // Seed an initial demo profile for instant pleasant onboarding
      const defaultProfiles: UserProfile[] = [
        {
          id: 'demo-hero-1',
          name: 'سارة البطلة',
          packCode: 'SMSM-7701',
          gender: 'girl',
          avatar: '👧',
          points: 80,
          unlockedBadgeIds: ['curiosity_spark', 'smart_explorer', 'multiverse_explorer'],
          lastSolvedDate: null,
          solvedChallengesCount: 3,
          solvedCategories: ['فيزياء ممتعة', 'فضاء', 'طبيعة'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'demo-hero-2',
          name: 'عمر المكتشف',
          packCode: 'SMSM-9942',
          gender: 'boy',
          avatar: '👦',
          points: 35,
          unlockedBadgeIds: ['curiosity_spark'],
          lastSolvedDate: null,
          solvedChallengesCount: 1,
          solvedCategories: ['فيزياء ممتعة'],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(PROFILES_KEY, JSON.stringify(defaultProfiles));
      return defaultProfiles;
    }
    const parsed: UserProfile[] = JSON.parse(raw);
    // Sanitize any outdated badge IDs to ensure all 10 badges render smoothly
    const validBadgeIds = new Set(INITIAL_BADGES.map((b) => b.id));
    const sanitized = parsed.map((p) => {
      const filteredBadgeIds = p.unlockedBadgeIds.filter((bId) => validBadgeIds.has(bId));
      if (filteredBadgeIds.length === 0 && p.solvedChallengesCount > 0) {
        filteredBadgeIds.push('curiosity_spark');
      }
      return {
        ...p,
        unlockedBadgeIds: filteredBadgeIds,
      };
    });
    return sanitized;
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: UserProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (id) return id;
  const profiles = getStoredProfiles();
  return profiles.length > 0 ? profiles[0].id : null;
}

export function setActiveProfileId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function getStoredDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DARK_MODE_KEY) === 'true';
}

export function saveStoredDarkMode(isDark: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DARK_MODE_KEY, isDark ? 'true' : 'false');
}

export function getStoredSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SOUND_MUTED_KEY) === 'true';
}

export function saveStoredSoundMuted(isMuted: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_MUTED_KEY, isMuted ? 'true' : 'false');
}

export function getStoredVolume(): number {
  if (typeof window === 'undefined') return 0.8;
  const raw = localStorage.getItem(SOUND_VOLUME_KEY);
  if (!raw) return 0.8;
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? 0.8 : Math.max(0, Math.min(1, parsed));
}

export function saveStoredVolume(volume: number) {
  if (typeof window === 'undefined') return;
  const clamped = Math.max(0, Math.min(1, volume));
  localStorage.setItem(SOUND_VOLUME_KEY, clamped.toString());
}

// ----------------------------------------------------
// Admin Security & Permissions System
// ----------------------------------------------------
export const DEFAULT_ADMIN_EMAIL = 'abdelwahabhagag3@samasam.com';
export const DEFAULT_ADMIN_PIN = '202210609$Admin'; // Default PIN for master admin
const ADMIN_PIN_KEY = 'samasm_admin_pin_v2';
const ADMIN_EMAIL_KEY = 'samasm_admin_email_v2';

export function getStoredAdminEmail(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_EMAIL;
  return localStorage.getItem(ADMIN_EMAIL_KEY) || DEFAULT_ADMIN_EMAIL;
}

export function saveStoredAdminEmail(newEmail: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!newEmail || !newEmail.includes('@')) return false;
  localStorage.setItem(ADMIN_EMAIL_KEY, newEmail.trim().toLowerCase());
  return true;
}

export function verifyAdminEmail(enteredEmail: string): boolean {
  if (!enteredEmail) return false;
  const input = enteredEmail.trim().toLowerCase();
  const current = getStoredAdminEmail().trim().toLowerCase();
  const master = DEFAULT_ADMIN_EMAIL.toLowerCase();
  return input === current || input === master;
}

export function getStoredAdminPin(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PIN;
  return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
}

export function saveStoredAdminPin(newPin: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!newPin || newPin.trim().length < 3) return false;
  localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
  return true;
}

export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = getStoredAdminPin();
  return enteredPin.trim() === currentPin.trim();
}

export function resetAdminPinToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PIN_KEY, DEFAULT_ADMIN_PIN);
  localStorage.setItem(ADMIN_EMAIL_KEY, DEFAULT_ADMIN_EMAIL);
}

// ----------------------------------------------------
// Role & Parent Storage System
// ----------------------------------------------------
const ACTIVE_ROLE_KEY = 'samasm_active_role_v3';
const PARENTS_KEY = 'samasm_parent_profiles_v3';
const ACTIVE_PARENT_ID_KEY = 'samasm_active_parent_id_v3';

export function getStoredActiveRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
  if (stored === 'child' || stored === 'parent' || stored === 'admin') {
    return stored as UserRole;
  }
  return null;
}

export function saveStoredActiveRole(role: UserRole | null): void {
  if (typeof window === 'undefined') return;
  if (!role) {
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  } else {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  }
}

export function getStoredParents(): ParentProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PARENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ParentProfile[];
  } catch {
    return [];
  }
}

export function saveStoredParents(parents: ParentProfile[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARENTS_KEY, JSON.stringify(parents));
}

export function getActiveParentId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_PARENT_ID_KEY);
}

export function setActiveParentId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (!id) {
    localStorage.removeItem(ACTIVE_PARENT_ID_KEY);
  } else {
    localStorage.setItem(ACTIVE_PARENT_ID_KEY, id);
  }
}

// ----------------------------------------------------
// Platform Dynamic Content (Customizable by Admin)
// ----------------------------------------------------
const CUSTOM_CHALLENGES_KEY = 'samasm_custom_challenges_v1';
const CUSTOM_QUESTION_BANK_KEY = 'samasm_custom_qbank_v1';
const CUSTOM_LAB_KEY = 'samasm_custom_lab_v1';

export function getStoredDailyChallenges(): DailyChallenge[] {
  if (typeof window === 'undefined') return DAILY_CHALLENGES;
  try {
    const raw = localStorage.getItem(CUSTOM_CHALLENGES_KEY);
    if (!raw) return DAILY_CHALLENGES;
    const parsed = JSON.parse(raw) as DailyChallenge[];
    return parsed.length > 0 ? parsed : DAILY_CHALLENGES;
  } catch {
    return DAILY_CHALLENGES;
  }
}

export function saveStoredDailyChallenges(challenges: DailyChallenge[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_CHALLENGES_KEY, JSON.stringify(challenges));
}

export function getStoredQuestionBank(): BankQuestion[] {
  if (typeof window === 'undefined') return QUESTION_BANK;
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTION_BANK_KEY);
    if (!raw) return QUESTION_BANK;
    const parsed = JSON.parse(raw) as BankQuestion[];
    return parsed.length > 0 ? parsed : QUESTION_BANK;
  } catch {
    return QUESTION_BANK;
  }
}

export function saveStoredQuestionBank(questions: BankQuestion[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_QUESTION_BANK_KEY, JSON.stringify(questions));
}

export function getStoredLabExperiments(): LabExperiment[] {
  if (typeof window === 'undefined') return LAB_EXPERIMENTS;
  try {
    const raw = localStorage.getItem(CUSTOM_LAB_KEY);
    if (!raw) return LAB_EXPERIMENTS;
    const parsed = JSON.parse(raw) as LabExperiment[];
    return parsed.length > 0 ? parsed : LAB_EXPERIMENTS;
  } catch {
    return LAB_EXPERIMENTS;
  }
}

export function saveStoredLabExperiments(experiments: LabExperiment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_LAB_KEY, JSON.stringify(experiments));
}

