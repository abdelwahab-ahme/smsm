import { BankQuestion, UserProfile } from '../types';

// دالة فلترة الأسئلة قبل عرضها للطفل
export const getQuestionsForProfile = (questions: BankQuestion[], profile: UserProfile) => {
  return questions.filter((question) => {
    // إذا كان السؤال إسلامياً والطفل ليس مسلماً (أو لم يفعل قسم الإسلاميات)، استبعد السؤال
    if ((question as any).isIslamic && profile.religion !== 'muslim') {
      return false;
    }
    return true;
  });
};

export const QUESTION_BANK: BankQuestion[] = [
  // ==========================================
  // 🔬 1. قسم العلوم (Science) - 8 أسئلة
  // ==========================================
  {
    id: 'sci-1',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'سر اللون الأخضر في أوراق النبات',
    question: 'ما هي المادة المدهشة التي تعطي النباتات لونها الأخضر وتساعدها في صنع طعامها بواسطة ضوء الشمس؟',
    options: [
      { id: 'a', text: 'الكلوروفيل (اليخضور)' },
      { id: 'b', text: 'الكالسيوم' },
      { id: 'c', text: 'الهيموجلوبين' },
      { id: 'd', text: 'السكر المذاب' },
    ],
    correctOptionId: 'a',
    explanation: 'مادة الكلوروفيل الخضراء تلتقط طاقة أشعة الشمس وتحول ثاني أكسيد الكربون والماء إلى سكر مغذٍ للنبات وأكسجين نقي نتنفسه في عملية تسمى التمثيل الضوئي!',
    funFact: 'بدون نباتات الأرض وعملية التمثيل الضوئي، لما وُجد أكسجين كافٍ لتتنفس الكائنات الحية!',
    hint: 'اسمها يبدأ بحرف الكاف، وهي بمثابة المصنع الغذائي الأخضر للنبتة.',
    points: 15,
  },
  {
    id: 'sci-2',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'لغز طفو السفن العملاقة',
    question: 'لماذا تطفو سفينة حديدية ضخمة تزن آلاف الأطنان فوق سطح البحر، بينما يغرق مسمار صغير من الحديد في القاع؟',
    options: [
      { id: 'a', text: 'لأن ماء البحر يحب السفن الكبيرة' },
      { id: 'b', text: 'بسبب تجويف السفينة المملوء بالهواء الذي يقلل متوسط كثافتها ويزيد قوة دفع الماء' },
      { id: 'c', text: 'لأن السفينة تملك محركات نفاثة ترفعها للأعلى' },
      { id: 'd', text: 'لأن الحديد المصنوعة منه السفينة نوع خفيف جداً يطفو ذاتياً' },
    ],
    correctOptionId: 'b',
    explanation: 'تطبيقاً لقاعدة العالم أرخميدس، تحتوي السفينة على فراغات وتجاويف عملاقة مملوءة بالهواء، مما يجعل وزن السفينة الإجمالي أقل بكثير من وزن حجم الماء الذي تزيحه، فتدفعها قوة الطفو للأعلى!',
    funFact: 'العالم أرخميدس اكتشف سر الطفو عندما كان يستحم فصرخ بكلمته الشهيرة: وجدتها! (يوريكا)!',
    hint: 'فكر في الهواء الموجود بداخل السفينة مقارنة بالمسمار المصمت تماماً.',
    points: 20,
  },
  {
    id: 'sci-3',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'حراس الدفاع في جسم الإنسان',
    question: 'ما هي الخلايا المسؤولة في دمنا عن محاربة الجراثيم والبكتيريا والدفاع عن أجسامنا كجيش شجاع؟',
    options: [
      { id: 'a', text: 'خلايا الدم البيضاء' },
      { id: 'b', text: 'خلايا الدم الحمراء' },
      { id: 'c', text: 'الصفائح الدموية' },
      { id: 'd', text: 'خلايا العظام' },
    ],
    correctOptionId: 'a',
    explanation: 'خلايا الدم البيضاء هي خط الدفاع الأول في الجهاز المناعي، تلتهم الميكروبات الضارة وتنتج أجساماً مضادة لحمايتنا من الأمراض!',
    funFact: 'في قطرة دم واحدة صغيرة يوجد ما بين 7000 إلى 25000 خلية دم بيضاء ساهرة على حمايتك!',
    hint: 'لونها يعاكس لون خلايا الدم التي تحمل الأكسجين وتلون الدم بالأحمر.',
    points: 15,
  },
  {
    id: 'sci-4',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'تحولات المادة العجيبة',
    question: 'عندما يتحول الماء السائل إلى بخار غير مرئي عند تعرضه لدرجة حرارة 100 مئوية، ما اسم هذه العملية؟',
    options: [
      { id: 'a', text: 'التبخر والغلَيان' },
      { id: 'b', text: 'التجمد' },
      { id: 'c', text: 'التكثف' },
      { id: 'd', text: 'الانصهار' },
    ],
    correctOptionId: 'a',
    explanation: 'تكتسب جزيئات الماء طاقة حرارية تجعلها تتحرك بسرعة هائلة وتتباعد، فتتحول من الحالة السائلة إلى الحالة الغازية صاعدة إلى الهواء!',
    funFact: 'البخار الأبيض الذي تراه فوق كوب الشاي ليس هو الغاز، بل قطرات ماء دقيقة جداً بدأت تتكثف في الهواء البارد!',
    hint: 'نفس العملية التي تصعد بها مياه البحار إلى السماء لتشكل السحب.',
    points: 15,
  },
  {
    id: 'sci-5',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'سحر الكهرباء الساكنة',
    question: 'إذا فركت بالوناً صوفياً بشعرك ثم قربته من قصاصات ورق صغيرة، لماذا تنجذب الأوراق نحو البالون كالمغناطيس؟',
    options: [
      { id: 'a', text: 'بسبب وجود مادة صمغية خفية في البالون' },
      { id: 'b', text: 'بسبب انتقال الإلكترونات وتكوين شحنات كهربائية ساكنة تجذب الأوراق' },
      { id: 'c', text: 'بسبب قوة الجاذبية الأرضية المعكوسة' },
      { id: 'd', text: 'لأن البالون يحتوي على غاز الهيليوم الساحر' },
    ],
    correctOptionId: 'b',
    explanation: 'الاحتكاك ينقل إلكترونات سالبة من الشعر إلى سطح البالون، فتنشأ شحنة كهربائية ساكنة تجذب الأجسام الخفيفة المتعادلة كالأوراق والشعر!',
    funFact: 'البرق في السماء أثناء العواصف هو شكل عملاق وخارق لنفس هذه الكهرباء الساكنة!',
    hint: 'ظاهرة مرتبطة بالشحنات الكهربائية المتجمعة على السطح نتيجة الاحتكاك.',
    points: 15,
  },
  {
    id: 'sci-6',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'أسرار ألوان أوراق الخريف',
    question: 'لماذا تتحول أوراق معظم الأشجار من اللون الأخضر إلى الأصفر والبرتقالي والأحمر في فصل الخريف؟',
    options: [
      { id: 'a', text: 'لأن الشجرة تصاب بالبرد الشديد' },
      { id: 'b', text: 'لأن ضوء الشمس يقل، فيتوقف إنتاج الكلوروفيل الأخضر وتظهر الأصباغ المخبأة الأخرى' },
      { id: 'c', text: 'لأن التربة تمتص صبغات برتقالية في الشتاء' },
      { id: 'd', text: 'بسبب تساقط الأمطار الحمضية فقط' },
    ],
    correctOptionId: 'b',
    explanation: 'مع قصر النهار وبرودة الجو، تبدأ الشجرة بالاستعداد للشتاء وتتوقف عن صنع الكلوروفيل الأخضر، مما يسمح للأصباغ الصفراء والبرتقالية (الكاروتينات) التي كانت موجودة طوال الوقت بالظهور والتألق!',
    funFact: 'تساقط الأوراق يحمي الشجرة من فقدان الماء والكسر تحت ثقل الثلوج خلال فصل الشتاء!',
    hint: 'الأصباغ الملونة كانت موجودة دائماً لكن اللون الأخضر كان يغطي عليها.',
    points: 20,
  },
  {
    id: 'sci-7',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'قوس قزح وتفكك الضوء',
    question: 'من أين تأتي ألوان قوس قزح السبعة الجميلة في السماء بعد هطول المطر؟',
    options: [
      { id: 'a', text: 'من دهان خاص تطلقه السحب' },
      { id: 'b', text: 'من انكسار وتشتت ضوء الشمس الأبيض عبر قطرات المطر كالموشور' },
      { id: 'c', text: 'من انعكاس ألوان الزهور على الأرض' },
      { id: 'd', text: 'من احتكاك الرياح الباردة بالجبال' },
    ],
    correctOptionId: 'b',
    explanation: 'ضوء الشمس يبدو أبيض، لكنه في الحقيقة مزيج متناغم من أطياف ألوان متعددة. عندما يدخل الضوء في قطرة المطر الكروية، ينكسر وينعكس ويتشتت إلى ألوانه الأصلية السبعة!',
    funFact: 'في الحقيقة، قوس قزح عبارة عن دائرة كاملة 360 درجة، لكننا نرى نصفها فقط لأن سطح الأرض يحجب النصف الآخر، وركاب الطائرات يمكنهم رؤيته دائرياً بالكامل!',
    hint: 'قطرات الماء تعمل مثل منشور زجاجي دقيق يفكك شعاع النور.',
    points: 15,
  },
  {
    id: 'sci-8',
    category: 'science',
    categoryLabel: 'العلوم',
    categoryIcon: '🔬',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    title: 'بركان الأرض وصهارة الصخور',
    question: 'ماذا نسمي الصخور المنصهرة شديدة الحرارة عندما تكون محبوسة في أعماق باطن الأرض قبل خروجها؟',
    options: [
      { id: 'a', text: 'الماجما (الصهارة)' },
      { id: 'b', text: 'الرماد البركاني' },
      { id: 'c', text: 'الحجر الجيري' },
      { id: 'd', text: 'الجرانيت المثلج' },
    ],
    correctOptionId: 'a',
    explanation: 'تسمى الصخور المنصهرة الساخنة تحت قشرة الأرض "ماجما"، وعندما تنفجر وتتدفق على سطح الأرض عبر فوهة البركان يصبح اسمها "لافا" أو حمماً بركانية!',
    funFact: 'تصل درجة حرارة الماجما إلى أكثر من 1200 درجة مئوية، وهي قادرة على صهر الصخور والحديد في ثوانٍ!',
    hint: 'كلمة علمية تبدأ بحرف الميم.',
    points: 15,
  },

  // ==========================================
  // 🚀 2. قسم الفضاء (Space) - 8 أسئلة
  // ==========================================
  {
    id: 'space-1',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'عملاق المجموعة الشمسية',
    question: 'ما هو أكبر كوكب حجماً وكتلة في مجموعتنا الشمسية بأكملها؟',
    options: [
      { id: 'a', text: 'كوكب المشتري (Jupiter)' },
      { id: 'b', text: 'كوكب زحل' },
      { id: 'c', text: 'كوكب الأرض' },
      { id: 'd', text: 'كوكب نبتون' },
    ],
    correctOptionId: 'a',
    explanation: 'المشتري هو كوكب غازي عملاق حجمه كبير جداً لدرجة أنه يمكن أن يتسع لأكثر من 1300 كوكب بحجم كوكب الأرض بداخله!',
    funFact: 'على كوكب المشتري توجد "البقعة الحمراء العظيمة"، وهي عاصفة إعصارية عملاقة أكبر من حجم كوكب الأرض وتدور منذ أكثر من 300 عام!',
    hint: 'الكوكب الخامس بعداً عن الشمس ويشتهر بحلقاته الغازية وبقعته الحمراء الشهيرة.',
    points: 15,
  },
  {
    id: 'space-2',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'حقيقة الشمس في الكون',
    question: 'ما هو التصنيف الفلكي الحقيقي لشمسنا التي تضيء سماءنا كل يوم؟',
    options: [
      { id: 'a', text: 'نجم متوسط الحجم من كرات الغاز الملتهب' },
      { id: 'b', text: 'كوكب صخري كبير جداً مشتعل' },
      { id: 'c', text: 'قمر تابع لمجرة أندروميدا' },
      { id: 'd', text: 'نيزك ناري ثابت في مكانه' },
    ],
    correctOptionId: 'a',
    explanation: 'الشمس عبارة عن نجم كروي عملاق من غازي الهيدروجين والهيليوم، تحدث في قلبه تفاعلات اندماج نووي تولد كميات هائلة من الضوء والدفء والحياة!',
    funFact: 'ضوء الشمس يسافر بسرعة 300 ألف كيلومتر في الثانية ويستغرق حوالي 8 دقائق و20 ثانية ليصل إلى أعيننا على الأرض!',
    hint: 'كل النقاط اللامعة في سماء الليل هي شموس مثل شمسنا لكنها بعيدة جداً.',
    points: 15,
  },
  {
    id: 'space-3',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'أفران كوكب الزهرة الجهنمية',
    question: 'ما هو الكوكب الأكثر سخونة وحرارة في المجموعة الشمسية على الإطلاق (أكثر من 460 درجة مئوية)؟',
    options: [
      { id: 'a', text: 'كوكب الزهرة (Venus)' },
      { id: 'b', text: 'عطارد (الأقرب للشمس)' },
      { id: 'c', text: 'المريخ' },
      { id: 'd', text: 'أورانوس' },
    ],
    correctOptionId: 'a',
    explanation: 'رغم أن عطارد أقرب للشمس، إلا أن كوكب الزهرة يملك غلافاً جوياً كثيفاً جداً من ثاني أكسيد الكربون وسحب حمض الكبريتيك التي تحبس الحرارة كفرن عملاق (احتباس حراري فائق)!',
    funFact: 'يوم واحد على كوكب الزهرة أطول من سنته كاملة! لأن دورانه حول نفسه بطيء جداً ومعكوس الاتجاه!',
    hint: 'يسمى توأم الأرض في الحجم، لكنه جحيم ساخن محاط بسحب صفراء سميكة.',
    points: 20,
  },
  {
    id: 'space-4',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'حقيقة النجوم الساقطة',
    question: 'عندما نرى وميضاً سريعاً في سماء الليل ونقول "سقطت نجمة"، ما الذي يحدث في الحقيقة؟',
    options: [
      { id: 'a', text: 'حبيبات غبار أو صخور فضائية صغيرة (شهب) تحترق في الغلاف الجوي للأرض' },
      { id: 'b', text: 'نجم حقيقي مات وسقط فوق البحر' },
      { id: 'c', text: 'صاروخ فضائي فقد اتجاهه' },
      { id: 'd', text: 'انفجار قنبلة ضوئية من القمر' },
    ],
    correctOptionId: 'a',
    explanation: 'الشهب هي جسيمات صخرية صغيرة من الفضاء تندفع بسرعة هائلة نحو الأرض، واحتكاكها بجزيئات الهواء في الغلاف الجوي يولد حرارة شديدة تجعلها تتوهج وتحترق قبل وصولها للأرض!',
    funFact: 'معظم الشهب التي نراها ليست أكبر من حبة العدس أو حبة الرمل!',
    hint: 'اسمها العلمي "شهاب"، والغلاف الجوي يحمينا منها باحتراقها.',
    points: 15,
  },
  {
    id: 'space-5',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'سر تعاقب الليل والنهار',
    question: 'ما هي الحركة الكونية المسؤولة عن تعاقب الليل والنهار على كوكب الأرض كل 24 ساعة؟',
    options: [
      { id: 'a', text: 'دوران الأرض حول محورها (نفسها)' },
      { id: 'b', text: 'دوران الأرض حول الشمس' },
      { id: 'c', text: 'حركة القمر حول الأرض' },
      { id: 'd', text: 'إطفاء الشمس لنورها ليلاً' },
    ],
    correctOptionId: 'a',
    explanation: 'تدور الأرض دورة كاملة حول محورها من الغرب إلى الشرق كل 24 ساعة تقريباً، فالنصف المواجه للشمس يعيش النهار بينما النصف المعاكس يكون في ظلام الليل!',
    funFact: 'دوران الأرض حول الشمس في 365 يوماً هو المسؤول عن الفصول الأربعة وليس الليل والنهار!',
    hint: 'الأرض تدور كبلبل متحرك أمام ضوء المصباح الشمسي.',
    points: 15,
  },
  {
    id: 'space-6',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'لغز الثقوب السوداء الغامضة',
    question: 'لماذا تعتبر الثقوب السوداء في الفضاء مخيفة وغامضة جداً للعلماء؟',
    options: [
      { id: 'a', text: 'لأن جاذبيتها خارقة لدرجة أن الضوء نفسه لا يستطيع الهروب منها إذا اقترب' },
      { id: 'b', text: 'لأنها تبتلع المجرات في دقيقة واحدة' },
      { id: 'c', text: 'لأنها مصنوعة من وحوش فضائية عملاقة' },
      { id: 'd', text: 'لأنها تحرق الكون بالليزر' },
    ],
    correctOptionId: 'a',
    explanation: 'تنشأ الثقوب السوداء عند موت النجوم العملاقة وانهيار مادتها في نقطة مجهرية بالغة الكثافة، فتصبح قوة جذبها هائلة لدرجة ألا يفلت منها أي شيء، حتى أسرع شيء في الكون وهو الضوء!',
    funFact: 'في مركز مجرتنا درب التبانة يوجد ثقب أسود هائل الحجم يسمى "الرامي أ*" كتلته تعادل ملايين الشموس!',
    hint: 'شيء ذو جاذبية مطلقة يبتلع النور ولا يعكسه، لذلك يبدو أسود تماماً.',
    points: 20,
  },
  {
    id: 'space-7',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'المشي فوق سطح القمر',
    question: 'عندما هبط رواد الفضاء على سطح القمر عام 1969، لماذا كانوا يقفزون بخفة عالية وخطوات واسعة؟',
    options: [
      { id: 'a', text: 'لأن جاذبية القمر تعادل سدس (1/6) جاذبية الأرض فقط' },
      { id: 'b', text: 'لأن أحذيتهم كانت مزودة بنوابض مطاطية' },
      { id: 'c', text: 'لأن تربة القمر مصنوعة من إسفنج مرن' },
      { id: 'd', text: 'لأن الهواء هناك يدفعهم للأعلى' },
    ],
    correctOptionId: 'a',
    explanation: 'كتلة القمر أصغر بكثير من كتلة الأرض، لذلك فإن قوة جاذبيته أضعف 6 مرات، فإذا كان وزنك على الأرض 30 كجم، سيصبح وزنك على القمر 5 كجم فقط!',
    funFact: 'آثار أقدام رواد فضاء أبولو على القمر ستبقى كما هي لملايين السنين، لأنه لا يوجد هواء أو رياح أو أمطار لتمحوها!',
    hint: 'كلما صغرت كتلة الجرم الفضائي ضعفت قوة جاذبيته وسهل القفز عليه.',
    points: 15,
  },
  {
    id: 'space-8',
    category: 'space',
    categoryLabel: 'الفضاء',
    categoryIcon: '🚀',
    categoryColor: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-100 dark:border-indigo-700',
    title: 'حلقات كوكب زحل البديعة',
    question: 'مم تتكون الحلقات الساطعة الرائعة التي تدور حول كوكب زحل وتبدو كتاج ملكي؟',
    options: [
      { id: 'a', text: 'من مليارات القطع من الجليد والصخور والغبار الفضائي' },
      { id: 'b', text: 'من حبل ذهبي صلب يدور في الفضاء' },
      { id: 'c', text: 'من غاز الهيليوم المضيء فقط' },
      { id: 'd', text: 'من أضواء ليزرية طبيعية' },
    ],
    correctOptionId: 'a',
    explanation: 'حلقات زحل ليست جسماً صلباً، بل تتألف من مليارات الجزيئات الجليدية والصخور التي يتراوح حجمها من حبة رمل صغيرة إلى صخور بحجم المنازل، وتعكس ضوء الشمس ببريق مذهل!',
    funFact: 'رغم أن عرض حلقات زحل يصل إلى نحو 280 ألف كيلومتر، إلا أن سمكها لا يتعدى 10 أمتار فقط في بعض الأماكن، فهي أرق من ورقة دفتر بالنسبة لحجمها!',
    hint: 'قطع جليدية وصخرية تعكس نور الشمس.',
    points: 20,
  },

  // ==========================================
  // 🔢 3. قسم الرياضيات (Mathematics) - 8 أسئلة
  // ==========================================
  {
    id: 'math-1',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'اللغز الرياضي للعدد الزوجي الأولي',
    question: 'العدد الأولي هو العدد الذي لا يقبل القسمة إلا على نفسه وعلى الواحد.. ما هو العدد الأولي الزوجي الوحيد في كل الأعداد؟',
    options: [
      { id: 'a', text: 'العدد 2' },
      { id: 'b', text: 'العدد 4' },
      { id: 'c', text: 'العدد 0' },
      { id: 'd', text: 'لا يوجد عدد زوجي أولي نهائياً' },
    ],
    correctOptionId: 'a',
    explanation: 'العدد 2 هو العدد الزوجي الوحيد الأولي، لأن أي عدد زوجي آخر أكبر منه (مثل 4, 6, 8...) يقبل القسمة على 2 بالتأكيد، وبالتالي يفقد خاصية كونه أولياً!',
    funFact: 'الأعداد الأولية تعتبر بمثابة "ذرات بناء" علم الرياضيات، وتستخدم اليوم لتشفير وحماية كلمات المرور في الإنترنت!',
    hint: 'أصغر عدد زوجي موجب بعد الصفر.',
    points: 15,
  },
  {
    id: 'math-2',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'حساب محيط المربع الذكي',
    question: 'حديقة ألعاب مربعة الشكل طول ضلعها الواحد يساوي 6 أمتار.. كم متراً يكون محيط الحديقة بالكامل؟',
    options: [
      { id: 'a', text: '24 متراً (6 × 4)' },
      { id: 'b', text: '36 متراً (6 × 6)' },
      { id: 'c', text: '12 متراً (6 + 6)' },
      { id: 'd', text: '18 متراً' },
    ],
    correctOptionId: 'a',
    explanation: 'المربع له 4 أضلاع متساوية تماماً في الطول. المحيط هو مجموع أطوال أضلاعه الخارجية: 6 + 6 + 6 + 6 = 24 متراً (أو 6 × 4 = 24)!',
    funFact: 'المساحة هي ما يملأ الداخل (6 × 6 = 36 متر مربع)، بينما المحيط هو السياج الذي يحيط بالحديقة من الخارج!',
    hint: 'المربع يملك 4 أضلاع متطابقة.. اضرب طول الضلع في 4.',
    points: 15,
  },
  {
    id: 'math-3',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'كسور البيتزا الشهية',
    question: 'قسّمت فطيرة بيتزا دائرية كبيرة إلى 8 قطع متساوية، أكلت أنت وصديقك 4 قطع منها.. ما هو الكسر المتبقي من البيتزا؟',
    options: [
      { id: 'a', text: 'النصف (1/2 أو 4/8)' },
      { id: 'b', text: 'الربع (1/4)' },
      { id: 'c', text: 'الثلث (1/3)' },
      { id: 'd', text: 'فطيرة كاملة' },
    ],
    correctOptionId: 'a',
    explanation: '8 قطع أكل منها 4، يتبقى 4 قطع من أصل 8 (4/8)، وعند تبسيط الكسر بقسمة البسط والمقام على 4 نجد أنه يساوي النصف تماماً (1/2)!',
    funFact: 'الكسور نشأت عند الفراعنة قبل آلاف السنين لتوزيع القمح والأراضي الزراعية بعد فيضان النيل بدقة!',
    hint: '4 هي نصف الـ 8 تماماً.',
    points: 15,
  },
  {
    id: 'math-4',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'نمط المتتالية المضاعفة',
    question: 'تأمل هذا النمط الحسابي الممتع: 2، 4، 8، 16، ... ما هو الرقم الذي يأتي بعد الـ 16 مباشرة؟',
    options: [
      { id: 'a', text: '32 (مضاعفة الرقم السابق)' },
      { id: 'b', text: '20' },
      { id: 'c', text: '24' },
      { id: 'd', text: '64' },
    ],
    correctOptionId: 'a',
    explanation: 'النمط هنا يعتمد على ضرب كل رقم في 2 (المضاعفة): 2×2=4، 4×2=8، 8×2=16، والرقم التالي هو 16×2 = 32!',
    funFact: 'هذه المتتالية هي الأساس الذي تبنى عليه سعة ذاكرة الهواتف والكمبيوتر (16 جيجا، 32 جيجا، 64 جيجا، 128 جيجا...)!',
    hint: 'كل رقم هو ضعف الرقم الذي قبله.',
    points: 15,
  },
  {
    id: 'math-5',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'لغز ضرب الأصفار المدهش',
    question: 'ما هو الناتج الحسابي للعملية التالية: 5 × 8 × 9 × 12 × 4 × 0 ؟',
    options: [
      { id: 'a', text: '0 (صفر دائماً)' },
      { id: 'b', text: '17280' },
      { id: 'c', text: '1' },
      { id: 'd', text: '100' },
    ],
    correctOptionId: 'a',
    explanation: 'في عملية الضرب، الصفر هو العنصر الماص! أي عدد تضربه في صفر، مهما كان كبيراً أو معقداً، يكون الناتج النهائي دائماً صفراً!',
    funFact: 'الرياضيون العرب هم من نشروا استخدام الرقم "صفر" في العالم وأحدثوا ثورة في علم الحساب والجبر!',
    hint: 'انظر إلى آخر رقم في معادلة الضرب!',
    points: 15,
  },
  {
    id: 'math-6',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'حساب دقائق الوقت السريعة',
    question: 'في رحلة علمية استغرقت ساعتين ونصف.. كم دقيقة بالتمام والكمال مدة هذه الرحلة؟',
    options: [
      { id: 'a', text: '150 دقيقة (60 + 60 + 30)' },
      { id: 'b', text: '120 دقيقة' },
      { id: 'c', text: '250 دقيقة' },
      { id: 'd', text: '90 دقيقة' },
    ],
    correctOptionId: 'a',
    explanation: 'الساعة الواحدة بها 60 دقيقة. ساعتان = 60 + 60 = 120 دقيقة. ونصف الساعة = 30 دقيقة. المجموع: 120 + 30 = 150 دقيقة!',
    funFact: 'تم تقسيم الساعة إلى 60 دقيقة والدقيقة إلى 60 ثانية على يد البابليين القدماء لأن الرقم 60 يقبل القسمة على أرقام كثيرة بسهولة!',
    hint: 'الساعة = 60 دقيقة، ونصف الساعة = 30 دقيقة.',
    points: 15,
  },
  {
    id: 'math-7',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'زوايا المثلث في الهندسة',
    question: 'مهما كان شكل المثلث (قائم أو متساوي الأضلاع أو منفرج)، ما هو مجموع درجات زواياه الثلاث الداخلية دائماً؟',
    options: [
      { id: 'a', text: '180 درجة' },
      { id: 'b', text: '360 درجة' },
      { id: 'c', text: '90 درجة' },
      { id: 'd', text: '100 درجة' },
    ],
    correctOptionId: 'a',
    explanation: 'في الهندسة الإقليدية، مجموع الزوايا الداخلية لأي مثلث في الكون يساوي دائماً 180 درجة (وهي زاوية خط مستقيم كاملة)!',
    funFact: 'إذا قطعت زوايا أي مثلث ورقي وجمعتها بجوار بعضها، ستشكل لك خطاً مستقيماً تاماً!',
    hint: 'نصف مجموع زوايا الشكل الرباعي (المربع 360 درجة).',
    points: 20,
  },
  {
    id: 'math-8',
    category: 'math',
    categoryLabel: 'الرياضيات',
    categoryIcon: '🔢',
    categoryColor: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700',
    title: 'عبقرية غاوس في الجمع السريع',
    question: 'ما هو حاصل جمع الأرقام المتتالية من 1 إلى 10 (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10)؟',
    options: [
      { id: 'a', text: '55' },
      { id: 'b', text: '50' },
      { id: 'c', text: '45' },
      { id: 'd', text: '60' },
    ],
    correctOptionId: 'a',
    explanation: 'العالم الصغير غاوس حلها في ثوانٍ وهو طفل: جمع الأول مع الأخير (1+10=11)، و(2+9=11)، و(3+8=11).. هناك 5 أزواج كل زوج يساوي 11، إذن: 5 × 11 = 55!',
    funFact: 'كارل فريدريش غاوس يُلقب بأمير الرياضيات واكتشف هذه الطريقة الذكية وهو في الصف الثالث الابتدائي حين حاول معلمه إشغال الصف بها!',
    hint: 'طريقة الأزواج: (10+1=11) مكررة 5 مرات.',
    points: 20,
  },

  // ==========================================
  // 🧩 4. قسم المنطق والذكاء (Logic) - 8 أسئلة
  // ==========================================
  {
    id: 'logic-1',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'لغز الميزان والوزن العادل',
    question: 'كيلوغرام من الحديد وكيلوغرام من القطن الناعم.. أيهما أثقل إذا وضعناهما على كفتي ميزان حساس؟',
    options: [
      { id: 'a', text: 'متساويان في الوزن تماماً (كلاهما 1 كجم)' },
      { id: 'b', text: 'كيلوغرام الحديد أثقل بالتأكيد' },
      { id: 'c', text: 'كيلوغرام القطن أثقل' },
      { id: 'd', text: 'لا يمكن مقارنتهما' },
    ],
    correctOptionId: 'a',
    explanation: 'الخدعة هنا في كلمة "كيلوغرام"، فالكتلة المحددة هي 1 كجم لكلا المادتين، لذا فهما متساويان في الوزن تماماً، وإن كان القطن يأخذ حجماً ومساحة أكبر بكثير لأن كثافته أقل!',
    funFact: 'هذا اللغز يعلم الأطفال التمييز بين مفهوم "الكتلة والوزن" ومفهوم "الحجم والكثافة"!',
    hint: 'ركز على الرقم والوحدة: كلاهما "كيلوغرام واحد".',
    points: 15,
  },
  {
    id: 'logic-2',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'لغز الغرفة المظلمة والشمعة',
    question: 'دخلت غرفة مظلمة جداً وباردة، وكان معك عود ثقاب واحد فقط.. وتوجد في الغرفة شمعة ومصباح كاز وموقد حطب، فماذا ستشعل أولاً؟',
    options: [
      { id: 'a', text: 'عود الثقاب أولاً!' },
      { id: 'b', text: 'الشمعة لتنير الغرفة' },
      { id: 'c', text: 'مصباح الكاز' },
      { id: 'd', text: 'موقد الحطب للتدفئة' },
    ],
    correctOptionId: 'a',
    explanation: 'تفكير منطقي سليم! لا يمكنك إشعال الشمعة أو المصباح أو الموقد قبل أن تشعل عود الثقاب الذي بيدك أولاً!',
    funFact: 'الألغاز المنطقية تدرب الدماغ على التفكير التسلسلي (الخطوة أ تسبق الخطوة ب)!',
    hint: 'فكّر في الأداة التي تحتاجها لتشعل أي شيء آخر.',
    points: 15,
  },
  {
    id: 'logic-3',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'لغز اتجاه الظل والشمس',
    question: 'في الصباح الباكر، إذا وقفت في فناء المدرسة ووجهك مواجه لشروق الشمس من جهة الشرق.. إلى أي جهة يسقط ظلك على الأرض؟',
    options: [
      { id: 'a', text: 'نحو الغرب (خلفك مباشرة)' },
      { id: 'b', text: 'نحو الشرق (أمامك)' },
      { id: 'c', text: 'نحو الشمال' },
      { id: 'd', text: 'تحت قدميك مباشرة بدون اتجاه' },
    ],
    correctOptionId: 'a',
    explanation: 'الضوء يسير في خطوط مستقيمة، وعندما تحجب أنت أشعة الشمس القادمة من الشرق، يتشكل ظلك في الجهة المعاكسة تماماً لمصدر الضوء وهي جهة الغرب خلفك!',
    funFact: 'قديماً كان الناس يعرفون الوقت بدقة بمراقبة طول واتجاه الظل في جهاز يسمى "المزولة الشمسية"!',
    hint: 'الظل يقع دائماً في الجهة المعاكسة لمصدر الضوء.',
    points: 15,
  },
  {
    id: 'logic-4',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'لغز مصافحة الأصدقاء الثلاثة',
    question: 'التقى 3 أصدقاء في معمل العلوم، وقام كل واحد منهم بمصافحة صديقيه مرة واحدة فقط.. كم مصافحة تمت إجمالاً؟',
    options: [
      { id: 'a', text: '3 مصافحات فقط' },
      { id: 'b', text: '6 مصافحات' },
      { id: 'c', text: '9 مصافحات' },
      { id: 'd', text: 'مصافحتان' },
    ],
    correctOptionId: 'a',
    explanation: 'لنسمهم أ، ب، ج: (أ يصافح ب = 1)، (أ يصافح ج = 2)، (ب يصافح ج = 3). المصافحة تجمع شخصين معاً في نفس اللحظة فلا تحسب مرتين، إذن المجموع 3 مصافحات!',
    funFact: 'هذه المسألة في الرياضيات تسمى "التوافيق والتباديل"، وتستخدم في جدولة مباريات دوري كرة القدم!',
    hint: 'المصافحة الواحدة تتم بين شخصين في وقت واحد وتكفي كليهما.',
    points: 20,
  },
  {
    id: 'logic-5',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'لغز المرآة وانعكاس الصورة',
    question: 'عندما تقف مستقيماً أمام المرآة وترفع يدك اليمنى لتلوح لنفسك، أي يد تبدو مرفوعة في صورة المرآة؟',
    options: [
      { id: 'a', text: 'اليد اليسرى لصورتك في المرآة' },
      { id: 'b', text: 'اليد اليمنى لصورتك' },
      { id: 'c', text: 'كلتا اليدين معاً' },
      { id: 'd', text: 'المرآة لا تعكس اليد' },
    ],
    correctOptionId: 'a',
    explanation: 'المرآة تعكس الصورة أمامياً وخلفياً، فتبدو صورتك وكأنها تقف في مواجهتك مباشرة، لذا فإن يدك اليمنى تقابل اليد اليسرى للشخص المواجه لك في المرآة!',
    funFact: 'سيارات الإسعاف تكتب كلمة "AMBULANCE" معكوسة على مقدمتها حتى يقرأها السائقون في مرآة سيارتهم معتدلة وسليمة!',
    hint: 'تخيل أن صورتك في المرآة هي شخص حقيقي يقف أمامك وجهاً لوجه.',
    points: 15,
  },
  {
    id: 'logic-6',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'حساب عمر الأخوين الذكي',
    question: 'إذا كان عمر سلمى الآن 10 سنوات، وعمر أخيها الصغير نصف عمرها (5 سنوات).. عندما تكبر سلمى ويصبح عمرها 20 سنة، كم سيكون عمر أخيها؟',
    options: [
      { id: 'a', text: '15 سنة (الفرق بينهما 5 سنوات دائماً)' },
      { id: 'b', text: '10 سنوات' },
      { id: 'c', text: '20 سنة' },
      { id: 'd', text: '25 سنة' },
    ],
    correctOptionId: 'a',
    explanation: 'الخدعة تكمن في الاعتقاد بأن عمره سيظل نصف عمرها دائماً! الفرق بين عمر الأخوين هو 5 سنوات، وهذا الفرق يظل ثابتاً مدى الحياة: 20 - 5 = 15 سنة!',
    funFact: 'الفارق الزمني في الأعمار بين البشر يظل ثابتاً لا يتغير أبداً مع مرور السنوات!',
    hint: 'فارق العمر بين الأخوين ثابت دائماً ولا يتغير أبداً.',
    points: 15,
  },
  {
    id: 'logic-7',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'لغز المطر والشارع المبتل',
    question: 'استيقظت صباحاً ونظرت من نافذة غرفتك فوجدت كل شوارع المدينة مبللة بالماء وأغصان الأشجار تقطر، لكن سقف شرفة منزلك جاف تماماً.. ما هو التفسير المنطقي الأرجح؟',
    options: [
      { id: 'a', text: 'أمطرت السماء ليلاً بينما سقف الشرفة محمي بسقف المنزل العلوي' },
      { id: 'b', text: 'الجيران غسلوا كل شوارع المدينة بالخراطيم' },
      { id: 'c', text: 'الشوارع تعرقت بسبب الحرارة' },
      { id: 'd', text: 'فاضت مياه البحر على كل المدينة دون صوت' },
    ],
    correctOptionId: 'a',
    explanation: 'الاستنتاج العلمي المنطقي (Deductive Reasoning) يقوم على ربط كل الأدلة: هطول المطر ليلاً بلل كل الأماكن المكشوفة، بينما الأماكن المغطاة كالشرفة ظلت جافة!',
    funFact: 'هذه الطريقة في ربط الأدلة واستبعاد الاحتمالات المستحيلة هي نفس الطريقة التي يعمل بها المحققون وعلماء الفضاء!',
    hint: 'المطر يسقط من السماء عمودياً ويبلل الأماكن المفتوحة فقط.',
    points: 15,
  },
  {
    id: 'logic-8',
    category: 'logic',
    categoryLabel: 'منطق وذكاء',
    categoryIcon: '🧩',
    categoryColor: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950 dark:text-purple-100 dark:border-purple-700',
    title: 'لغز الشيء الذي يحملك ولا يمكنك رؤيته',
    question: 'شيء يحيط بك في كل مكان ويحملك ويحمل الطائرات السحابية في السماء، لكنك لا تستطيع لمسه أو رؤيته بعينيك.. ما هو؟',
    options: [
      { id: 'a', text: 'الهواء (الغلاف الجوي)' },
      { id: 'b', text: 'الضوء' },
      { id: 'c', text: 'الماء' },
      { id: 'd', text: 'الظلام' },
    ],
    correctOptionId: 'a',
    explanation: 'الهواء عبارة عن مزيج من الغازات غير المرئية، ولكنه يمتلك كتلة وضغطاً ويحمل الطائرات والطيور عند تحرك أجنحتها فوقه!',
    funFact: 'رغم أننا لا نرى الهواء، إلا أن الغلاف الجوي المحيط بالأرض يزن آلاف المليارات من الأطنان!',
    hint: 'نتنفسه طوال الوقت ولا يمكننا العيش بدونه.',
    points: 15,
  },
  {
    id: 'islamic-1',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'أول سور القرآن الكريم ترتيباً',
    question: 'سورة عظيمة نكرر قراءتها في كل ركعة من صلواتنا اليومية، وتسمى أيضاً "أم الكتاب".. ما هي؟',
    options: [
      { id: 'a', text: 'سورة الفاتحة' },
      { id: 'b', text: 'سورة الإخلاص' },
      { id: 'c', text: 'سورة الناس' },
      { id: 'd', text: 'سورة البقرة' },
    ],
    correctOptionId: 'a',
    explanation: 'سورة الفاتحة هي أول سورة في المصحف الشريف، ولا تصح الصلاة إلا بقراءتها.',
    funFact: 'تُسمى سورة الفاتحة بـ "السبع المثاني" لأنها تتكون من 7 آيات ونكررها في كل صلاة!',
    hint: 'نفتتح بها قراءة القرآن الكريم دائماً.',
    points: 15,
  },
  {
    id: 'islamic-2',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'خاتم الأنبياء والمرسلين',
    question: 'من هو النبي الكريـم الذي أُرسل رحمة للعالمين وأُنزل عليه القرآن الكريم؟',
    options: [
      { id: 'a', text: 'سيدنا محمد ﷺ' },
      { id: 'b', text: 'سيدنا إبراهيم عليه السلام' },
      { id: 'c', text: 'سيدنا موسى عليه السلام' },
      { id: 'd', text: 'سيدنا عيسى عليه السلام' },
    ],
    correctOptionId: 'a',
    explanation: 'سيدنا محمد ﷺ هو آخر الأنبياء والرسل، ولد في مكة المكرمة ونزل عليه الوحي في غار حراء.',
    funFact: 'كان يُلقب النبي ﷺ قبل البعثة بـ "الصادق الأمين" لشدة أمانته وصدقه بين الناس!',
    hint: 'عند ذكر اسمه نُصلي ونُسلّم عليه.',
    points: 15,
  },
  {
    id: 'islamic-3',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'عدد أركان الإسلام',
    question: 'بُني الإسلام على عدد محدد من الأركان الأساسية مثل الشهادتين والصلاة والصوم.. فكم عددها؟',
    options: [
      { id: 'a', text: '5 أركان' },
      { id: 'b', text: '3 أركان' },
      { id: 'c', text: '6 أركان' },
      { id: 'd', text: '7 أركان' },
    ],
    correctOptionId: 'a',
    explanation: 'أركان الإسلام خمسة: شهادة أن لا إله إلا الله وأن محمداً رسول الله، وإقام الصلاة، وإيتاء الزكاة، وصوم رمضان، وحج البيت.',
    funFact: 'الحديث الشهير "بُني الإسلام على خمس" رواه الصحابي الجليل عبد الله بن عمر رضي الله عنهما.',
    hint: 'عدد أصابع اليد الواحدة!',
    points: 15,
  },
  {
    id: 'islamic-4',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'قبلة المسلمين في الصلاة',
    question: 'يتجه المسلمون في جميع أنحاء العالم أثناء الصلاة نحو مكان مقدس واحد.. ما هو؟',
    options: [
      { id: 'a', text: 'الكعبة المشرفة بـ مكة' },
      { id: 'b', text: 'المسجد النبوي بـ المدينة' },
      { id: 'c', text: 'المسجد الأقصى' },
      { id: 'd', text: 'جبل عرفات' },
    ],
    correctOptionId: 'a',
    explanation: 'الكعبة المشرفة بمدينة مكة المكرمة هي بيت الله الحرام وقبلة جميع المسلمين في صلاتهم.',
    funFact: 'أول من بنى الكعبة المشرفة ورفع قواعدها هو سيدنا إبراهيم عليه السلام وابنه سيدنا إسماعيل!',
    hint: 'توجد في البيت الحرام بمكة المكرمة.',
    points: 15,
  },
  {
    id: 'islamic-5',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'شهر الصيام والقرآن',
    question: 'شهر هجري مبارك يصوم فيه المسلمون من طلوع الفجر حتى غروب الشمس، وفيه ليلة القدر.. ما هو؟',
    options: [
      { id: 'a', text: 'شهر رمضان' },
      { id: 'b', text: 'شهر شعبان' },
      { id: 'c', text: 'شهر محرم' },
      { id: 'd', text: 'شهر ذو الحجة' },
    ],
    correctOptionId: 'a',
    explanation: 'شهر رمضان هو الشهر التاسع في التقويم الهجري، وفيه أنزل الله تعالى القرآن الكريم على نبينا محمد ﷺ.',
    funFact: 'ثواب العمل الصالح والعبادة في ليلة القدر يعادل عبادة أكثر من 83 سنة (ألف شهر)!',
    hint: 'ننتظره كل عام لنحتفل به ونعلق الفوانيس.',
    points: 15,
  },
  {
    id: 'islamic-6',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'الصحابي الملهم بالسعادة',
    question: 'أول من أذن بالصلاة في الإسلام وصاحب الصوت الندي الجميل الذي اختاره النبي ﷺ.. من هو؟',
    options: [
      { id: 'a', text: 'بلال بن رباح رضي الله عنه' },
      { id: 'b', text: 'أبو بكر الصديق رضي الله عنه' },
      { id: 'c', text: 'عمر بن الخطاب رضي الله عنه' },
      { id: 'd', text: 'عثمان بن عفان رضي الله عنه' },
    ],
    correctOptionId: 'a',
    explanation: 'بلال بن رباح هو الصحابي الجليل الذي اختاره الرسول ﷺ ليكون أول مؤذن في تاريخ الإسلام.',
    funFact: 'عندما أذن بلال لأول مرة فوق سطح الكعبة يوم فتح مكة، فرح المسلمون فرحاً عظيماً بشهادة التوحيد!',
    hint: 'لقبه المؤذن الأول في الإسلام.',
    points: 15,
  },
  {
    id: 'islamic-7',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'أطول سورة في القرآن',
    question: 'سورة مباركة هي أطول سور القرآن الكريم وتحتوي على "آية الكرسي".. ما اسمها؟',
    options: [
      { id: 'a', text: 'سورة البقرة' },
      { id: 'b', text: 'سورة آل عمران' },
      { id: 'c', text: 'سورة النساء' },
      { id: 'd', text: 'سورة يس' },
    ],
    correctOptionId: 'a',
    explanation: 'سورة البقرة هي أطول سورة في المصحف الشريف، وتتكون من 286 آية.',
    funFact: 'تسمى سورة البقرة وآل عمران بـ "الزهراوان"، وقراءتها في البيت تطرد الشياطين وتجلب البركة!',
    hint: 'تسمت باسم الحيوان المذكور في قصة بني إسرائيل مع سيدنا موسى.',
    points: 15,
  },
  {
    id: 'islamic-8',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'كليم الله من الأنبياء',
    question: 'نبي كريم كلمه الله تعالى بشكل مباشر وأرسله إلى فرعون بالمعجزات كالعصا واليد البيضاء.. من هو؟',
    options: [
      { id: 'a', text: 'سيدنا موسى عليه السلام' },
      { id: 'b', text: 'سيدنا يوسف عليه السلام' },
      { id: 'c', text: 'سيدنا سليمان عليه السلام' },
      { id: 'd', text: 'سيدنا نوح عليه السلام' },
    ],
    correctOptionId: 'a',
    explanation: 'سيدنا موسى عليه السلام يُلقب بـ "كليم الله" لأن الله عز وجل كلمه عند جبل الطور بسيناء.',
    funFact: 'سيدنا موسى عليه السلام هو أكثر الأنبياء ذكراً في القرآن الكريم بأحداث وقصص ملهمة جداً!',
    hint: 'انفلق له البحر بإذن الله ونجا وقومه من فرعون.',
    points: 15,
  },
  {
    id: 'islamic-9',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'عدد الصلوات المفروضة',
    question: 'كم عدد الصلوات الأساسية المفروضة على المسلم في اليوم والليلة؟',
    options: [
      { id: 'a', text: '5 صلوات' },
      { id: 'b', text: '3 صلوات' },
      { id: 'c', text: '4 صلوات' },
      { id: 'd', text: '6 صلوات' },
    ],
    correctOptionId: 'a',
    explanation: 'الصلوات المفروضة يومياً خمس هي: الفجر، الظهر، العصر، المغرب، والعشاء.',
    funFact: 'فُرِضت الصلاة في السماء مباشرة خلال رحلة الإسراء والمعراج المباركة لشدة أهميتها!',
    hint: 'تبدأ بالفجر وتنتهي بالعشاء.',
    points: 15,
  },
  {
    id: 'islamic-10',
    category: 'islamic',
    categoryLabel: 'ركن الإسلاميات',
    categoryIcon: '🌙',
    categoryColor: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700',
    isIslamic: true,
    title: 'معجزة بناء السفينة والنجاة',
    question: 'نبي صبور أمره الله ببناء سفينة ضخمة على اليابس لينقذ المؤمنين والحيوانات من الطوفان العظيم.. من هو؟',
    options: [
      { id: 'a', text: 'سيدنا نوح عليه السلام' },
      { id: 'b', text: 'سيدنا أدم عليه السلام' },
      { id: 'c', text: 'سيدنا يونس عليه السلام' },
      { id: 'd', text: 'سيدنا إبراهيم عليه السلام' },
    ],
    correctOptionId: 'a',
    explanation: 'سيدنا نوح عليه السلام هو شيخ المرسلين الذي استمر يدعو قومه مئات السنين وصنع السفينة بأمر الله.',
    funFact: 'حمل سيدنا نوح في سفينته من كل أزواج الحيوانات والطيور اثنين (ذمراً وأنثى) للحفاظ على الحياة!',
    hint: 'اشتهر بقصة السفينة والطوفان.',
    points: 15,
  },

];

  


// 1. دالة اختار سؤال ذكي بناءً على ملف الطفل والأسئلة المحلولة سابقاً
export function getSmartBankQuestion(
  profile?: UserProfile | null,
  selectedCategory?: string
): BankQuestion | null {
  if (!QUESTION_BANK || QUESTION_BANK.length === 0) return null;

  let availableQuestions = [...QUESTION_BANK];

  // تصفية الأسئلة بناءً على تفعيل/إلغاء المحتوى الديني
  if (profile && profile.religion !== 'muslim') {
    availableQuestions = availableQuestions.filter(
      (q) => !q.isIslamic && q.category !== 'islamic'
    );
  }

  // تصفية حسب القسم المختار (إن وجد)
  if (selectedCategory && selectedCategory !== 'all') {
    availableQuestions = availableQuestions.filter(
      (q) => q.category === selectedCategory
    );
  }

  // استبعاد الأسئلة التي حلها الطفل من قبل (إن أمكن)
  const solvedIds = profile?.solvedBankQuestionIds || [];
  const unsolvedQuestions = availableQuestions.filter(
    (q) => !solvedIds.includes(q.id)
  );

  // إذا حل جميع الأسئلة، نختار من كل الأسئلة المتاحة عشوائياً
  const pool = unsolvedQuestions.length > 0 ? unsolvedQuestions : availableQuestions;

  if (pool.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// 2. دالة إحصائيات بنك الأسئلة
export function getQuestionBankStats(profile?: UserProfile | null) {
  let questions = QUESTION_BANK || [];

  // إخفاء الأسئلة الإسلامية لغير المسلم
  if (profile && profile.religion !== 'muslim') {
    questions = questions.filter(
      (q) => !q.isIslamic && q.category !== 'islamic'
    );
  }

  const solvedIds = profile?.solvedBankQuestionIds || [];

  const getCategoryStats = (category: string) => {
    const categoryQuestions = questions.filter(
      (q) => q.category === category
    );

    const solvedCount = categoryQuestions.filter((q) =>
      solvedIds.includes(q.id)
    ).length;

    return {
      total: categoryQuestions.length,
      solved: solvedCount,
      remaining: Math.max(0, categoryQuestions.length - solvedCount),
    };
  };

  const totalQuestions = questions.length;

  const solvedCount = questions.filter((q) =>
    solvedIds.includes(q.id)
  ).length;

  return {
    totalQuestions,
    solvedCount,
    remainingCount: Math.max(0, totalQuestions - solvedCount),
    progressPercentage:
      totalQuestions > 0
        ? Math.round((solvedCount / totalQuestions) * 100)
        : 0,

    // إحصائيات المجالات
    science: getCategoryStats('science'),
    space: getCategoryStats('space'),
    math: getCategoryStats('math'),
    logic: getCategoryStats('logic'),
    islamic: getCategoryStats('islamic'),
  };

}