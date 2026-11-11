/* Arab Learner Traps: separate, editable lesson data. */
const MISTAKE_QUESTIONS = [
  {
    "id": "be01",
    "level": "A1",
    "trap": "am-is-are",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "She ___ very tall.",
    "q_ar": "هي ___ طويلة جدًا.",
    "options": [
      "am",
      "is",
      "are",
      "be"
    ],
    "answer": 1,
    "why_en": "Use is with she when describing a quality.",
    "why_ar": "نستخدم is مع she لوصف صفة؛ فنقول She is very tall.",
    "arabic_hint": "في العربية نقول «هي طويلة» دون فعل ظاهر بمعنى be، لكن الإنجليزية تحتاج إلى is."
  },
  {
    "id": "be02",
    "level": "A1",
    "trap": "am-is-are",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "I ___ ready for the lesson.",
    "q_ar": "أنا ___ مستعدًا للدرس.",
    "options": [
      "is",
      "are",
      "am",
      "be"
    ],
    "answer": 2,
    "why_en": "Use am with I before the adjective ready.",
    "why_ar": "نستخدم am مع I قبل الصفة ready؛ فنقول I am ready.",
    "arabic_hint": "قد يترجم المتعلم الجملة مباشرة وينسى أن am تأتي مع I."
  },
  {
    "id": "be03",
    "level": "A2",
    "trap": "am-is-are",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "He ___ to work by bus every day.",
    "q_ar": "هو ___ إلى العمل بالحافلة كل يوم.",
    "options": [
      "go",
      "goes",
      "is go",
      "going"
    ],
    "answer": 1,
    "why_en": "Use the present-simple form goes with he. Do not use is go; the main verb takes -s with he, she, or it.",
    "why_ar": "نستخدم goes مع he في المضارع البسيط. لا نقول is go؛ بل نضيف s إلى الفعل مع he أو she أو it.",
    "arabic_hint": "قد يخلط المتعلم بين فعل be والفعل الأساسي، فيقول He is go."
  },
  {
    "id": "be04",
    "level": "A2",
    "trap": "am-is-are",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "They ___ at home right now.",
    "q_ar": "هم ___ في المنزل الآن.",
    "options": [
      "is",
      "am",
      "are",
      "be"
    ],
    "answer": 2,
    "why_en": "Use are with they to describe where they are.",
    "why_ar": "نستخدم are مع they لوصف مكانهم؛ فنقول They are at home.",
    "arabic_hint": "انتبه إلى توافق فعل be مع الضمير الجمع they."
  },
  {
    "id": "be05",
    "level": "B1",
    "trap": "am-is-are",
    "sub": "Which sentence is correct?",
    "sub_ar": "أيّ جملة صحيحة؟",
    "prompt": "My brother ___ not interested in football.",
    "q_ar": "أخي ___ غير مهتم بكرة القدم.",
    "options": [
      "do",
      "does",
      "is",
      "are"
    ],
    "answer": 2,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "Interested صفة، لذلك نحتاج إلى فعل be: is not interested."
  },
  {
    "id": "be06",
    "level": "B2",
    "trap": "am-is-are",
    "sub": "Choose the correct question.",
    "sub_ar": "اختر السؤال الصحيح.",
    "prompt": "___ you familiar with this process?",
    "q_ar": "___ أنت على دراية بهذه العملية؟",
    "options": [
      "Do",
      "Are",
      "Have",
      "Does"
    ],
    "answer": 1,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "قد يضع المتعلم do أمام صفة، لكن familiar تحتاج إلى are هنا."
  },
  {
    "id": "be07",
    "level": "C1",
    "trap": "am-is-are",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "The results ___ consistent with the initial estimate.",
    "q_ar": "النتائج ___ متوافقة مع التقدير الأولي.",
    "options": [
      "is",
      "are",
      "has",
      "be"
    ],
    "answer": 1,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "Results جمع، لذلك نستخدم are وليس is."
  },
  {
    "id": "be08",
    "level": "C2",
    "trap": "am-is-are",
    "sub": "Select the standard form.",
    "sub_ar": "اختر الصيغة القياسية.",
    "prompt": "Neither explanation ___ entirely convincing.",
    "q_ar": "لا يبدو أي من التفسيرين ___ مقنعًا تمامًا.",
    "options": [
      "are",
      "were",
      "is",
      "have"
    ],
    "answer": 2,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "Neither explanation مفرد في هذا التركيب، ويأخذ is."
  },
  {
    "id": "pr01",
    "level": "A1",
    "trap": "in-on-at",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "My birthday is ___ May.",
    "q_ar": "عيد ميلادي في شهر ___.",
    "options": [
      "at",
      "on",
      "in",
      "to"
    ],
    "answer": 2,
    "why_en": "Use in with months: in May.",
    "why_ar": "نستخدم in مع أسماء الأشهر: in May.",
    "arabic_hint": "في العربية نقول «في مايو»، لكن الإنجليزية تستخدم in مع الأشهر."
  },
  {
    "id": "pr02",
    "level": "A1",
    "trap": "in-on-at",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "The class starts ___ 8:30.",
    "q_ar": "يبدأ الدرس ___ الساعة 8:30.",
    "options": [
      "in",
      "on",
      "at",
      "by"
    ],
    "answer": 2,
    "why_en": "Use at with an exact clock time: at 8:30.",
    "why_ar": "نستخدم at مع وقت الساعة المحدد: at 8:30.",
    "arabic_hint": "مع وقت محدد على الساعة نستخدم at."
  },
  {
    "id": "pr03",
    "level": "A2",
    "trap": "in-on-at",
    "sub": "Choose the natural sentence.",
    "sub_ar": "اختر الجملة الطبيعية في الإنجليزية.",
    "prompt": "We have a meeting ___ Monday.",
    "q_ar": "لدينا اجتماع ___ يوم الاثنين.",
    "options": [
      "in",
      "at",
      "on",
      "for"
    ],
    "answer": 2,
    "why_en": "Use on with days of the week: on Monday.",
    "why_ar": "نستخدم on مع أيام الأسبوع: on Monday.",
    "arabic_hint": "لا تترجم حرف الجر العربي «في» دائمًا إلى in؛ مع الأيام نستخدم on."
  },
  {
    "id": "pr04",
    "level": "A2",
    "trap": "in-on-at",
    "sub": "Choose the correct option.",
    "sub_ar": "اختر الخيار الصحيح.",
    "prompt": "She lives ___ Algiers.",
    "q_ar": "هي تعيش ___ الجزائر العاصمة.",
    "options": [
      "at",
      "in",
      "on",
      "to"
    ],
    "answer": 1,
    "why_en": "Use in with the name of a city: in Algiers.",
    "why_ar": "نستخدم in مع اسم المدينة: in Algiers.",
    "arabic_hint": "نستخدم in مع المدن والدول، وليس at."
  },
  {
    "id": "pr05",
    "level": "B1",
    "trap": "in-on-at",
    "sub": "Complete the expression.",
    "sub_ar": "أكمل التعبير.",
    "prompt": "I’m good ___ solving practical problems.",
    "q_ar": "أنا جيد ___ حل المشكلات العملية.",
    "options": [
      "in",
      "at",
      "on",
      "for"
    ],
    "answer": 1,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "التعبير الطبيعي هو good at، ثم اسم أو فعل ينتهي بـ ing."
  },
  {
    "id": "pr06",
    "level": "B2",
    "trap": "in-on-at",
    "sub": "Choose the correct phrase.",
    "sub_ar": "اختر العبارة الصحيحة.",
    "prompt": "The report was submitted ___ time, before the deadline.",
    "q_ar": "سُلّم التقرير ___ الموعد، قبل آخر أجل.",
    "options": [
      "in",
      "on",
      "at",
      "by"
    ],
    "answer": 1,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "On time تعني في الموعد المحدد؛ لا تخلط بينها وبين in time."
  },
  {
    "id": "pr07",
    "level": "C1",
    "trap": "in-on-at",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "The policy came ___ effect at the start of the year.",
    "q_ar": "دخلت السياسة حيز ___ في بداية العام.",
    "options": [
      "in",
      "on",
      "at",
      "into"
    ],
    "answer": 3,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "التعبير الثابت هو come into effect، أي يدخل حيّز التنفيذ."
  },
  {
    "id": "pr08",
    "level": "C2",
    "trap": "in-on-at",
    "sub": "Choose the idiomatic phrase.",
    "sub_ar": "اختر التعبير الاصطلاحي المناسب.",
    "prompt": "Her argument is ___ odds with the available evidence.",
    "q_ar": "حجتها ___ تعارض مع الأدلة المتاحة.",
    "options": [
      "in",
      "on",
      "at",
      "by"
    ],
    "answer": 2,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "التعبير الاصطلاحي at odds with يعني متعارضًا مع."
  },
  {
    "id": "ad01",
    "level": "A1",
    "trap": "adjective-order",
    "sub": "Choose the natural phrase.",
    "sub_ar": "اختر التعبير الطبيعي في الإنجليزية.",
    "prompt": "She bought a ___ bag.",
    "q_ar": "اشترت حقيبة ___ .",
    "options": [
      "leather small",
      "small leather",
      "leather small new",
      "small new leather"
    ],
    "answer": 1,
    "why_en": "The usual order is size before material: a small leather bag.",
    "why_ar": "يأتي الحجم عادةً قبل المادة: a small leather bag.",
    "arabic_hint": "في الإنجليزية يأتي الحجم عادةً قبل المادة: small leather bag."
  },
  {
    "id": "ad02",
    "level": "A1",
    "trap": "adjective-order",
    "sub": "Choose the correct phrase.",
    "sub_ar": "اختر العبارة الصحيحة.",
    "prompt": "He drives a ___ car.",
    "q_ar": "يقود سيارة ___.",
    "options": [
      "red fast",
      "fast red",
      "car fast red",
      "red car fast"
    ],
    "answer": 1,
    "why_en": "The speed adjective comes before the color: a fast red car.",
    "why_ar": "تأتي صفة السرعة قبل اللون: a fast red car.",
    "arabic_hint": "غالبًا تأتي صفة الجودة قبل اللون: fast red car."
  },
  {
    "id": "ad03",
    "level": "A2",
    "trap": "adjective-order",
    "sub": "Which sounds most natural?",
    "sub_ar": "أيّ الخيارات يبدو أكثر طبيعية؟",
    "prompt": "They live in a ___ house.",
    "q_ar": "يعيشون في منزل ___.",
    "options": [
      "wooden beautiful old",
      "old beautiful wooden",
      "beautiful old wooden",
      "wooden old beautiful"
    ],
    "answer": 2,
    "why_en": "Opinion usually comes before age and material: a beautiful old wooden house.",
    "why_ar": "تأتي صفة الرأي عادةً قبل العمر والمادة: a beautiful old wooden house.",
    "arabic_hint": "الترتيب الشائع هنا: الرأي ثم العمر ثم المادة."
  },
  {
    "id": "ad04",
    "level": "A2",
    "trap": "adjective-order",
    "sub": "Complete the phrase.",
    "sub_ar": "أكمل العبارة.",
    "prompt": "We stayed in a ___ hotel.",
    "q_ar": "أقمنا في فندق ___.",
    "options": [
      "comfortable modern Italian",
      "Italian comfortable modern",
      "modern Italian comfortable",
      "comfortable Italian modern"
    ],
    "answer": 0,
    "why_en": "The natural order here is opinion/quality, then age, then origin: a comfortable modern Italian hotel.",
    "why_ar": "الترتيب الطبيعي هنا هو الصفة الدالة على الجودة، ثم الحداثة، ثم الأصل: a comfortable modern Italian hotel.",
    "arabic_hint": "الترتيب المعتاد: الجودة ثم النمط/العمر ثم الأصل."
  },
  {
    "id": "ad05",
    "level": "B1",
    "trap": "adjective-order",
    "sub": "Choose the best phrase for a report.",
    "sub_ar": "اختر أفضل تعبير لتقرير.",
    "prompt": "The team developed an ___ system.",
    "q_ar": "طوّر الفريق نظامًا ___.",
    "options": [
      "control efficient new",
      "new control efficient",
      "efficient new control",
      "efficient system new control"
    ],
    "answer": 2,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "الترتيب الأنسب هنا efficient new control system: الجودة ثم الحداثة ثم نوع النظام."
  },
  {
    "id": "ad06",
    "level": "B2",
    "trap": "adjective-order",
    "sub": "Select the natural description.",
    "sub_ar": "اختر الوصف الطبيعي.",
    "prompt": "It was an ___ decision.",
    "q_ar": "كان قرارًا ___.",
    "options": [
      "unexpected political major",
      "major unexpected political",
      "unexpected major political",
      "political unexpected major"
    ],
    "answer": 2,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "الترتيب الطبيعي هنا unexpected ثم major ثم political."
  },
  {
    "id": "ad07",
    "level": "C1",
    "trap": "adjective-order",
    "sub": "Choose the most idiomatic phrase.",
    "sub_ar": "اختر التعبير الاصطلاحي الأكثر شيوعًا.",
    "prompt": "They proposed a ___ framework.",
    "q_ar": "اقترحوا إطار عمل ___.",
    "options": [
      "regulatory comprehensive new",
      "new comprehensive regulatory",
      "comprehensive new regulatory",
      "regulatory new comprehensive"
    ],
    "answer": 2,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "الترتيب الأكثر طبيعية هو comprehensive new regulatory framework."
  },
  {
    "id": "ad08",
    "level": "C2",
    "trap": "adjective-order",
    "sub": "Choose the most natural noun phrase.",
    "sub_ar": "اختر العبارة الاسمية الأكثر طبيعية.",
    "prompt": "The study offers a ___ account of the dispute.",
    "q_ar": "تقدم الدراسة عرضًا ___ للنزاع.",
    "options": [
      "historical nuanced unusually",
      "nuanced unusually historical",
      "unusually nuanced historical",
      "historical unusually nuanced"
    ],
    "answer": 2,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "ظرف الدرجة unusually يأتي قبل الصفة التي يصفها: unusually nuanced."
  },
  {
    "id": "te01",
    "level": "A1",
    "trap": "present-perfect-vs-past",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "I ___ my homework yesterday.",
    "q_ar": "أنا ___ واجبي المنزلي أمس.",
    "options": [
      "have finished",
      "finished",
      "have finish",
      "finishing"
    ],
    "answer": 1,
    "why_en": "Yesterday names a finished past time, so use the past simple: finished.",
    "why_ar": "تشير yesterday إلى وقت ماضٍ منتهٍ، لذا نستخدم الماضي البسيط: finished.",
    "arabic_hint": "Yesterday وقت منتهٍ، لذلك نستخدم الماضي البسيط finished."
  },
  {
    "id": "te02",
    "level": "A2",
    "trap": "present-perfect-vs-past",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "She ___ in this town since 2021.",
    "q_ar": "هي ___ في هذه البلدة منذ عام 2021.",
    "options": [
      "lived",
      "has lived",
      "is live",
      "have lived"
    ],
    "answer": 1,
    "why_en": "Since 2021 marks a period continuing to the present, so use has lived.",
    "why_ar": "تشير since 2021 إلى مدة مستمرة حتى الحاضر، لذا نستخدم has lived.",
    "arabic_hint": "Since تشير إلى نقطة بداية، والحالة مستمرة حتى الآن؛ نستخدم has lived."
  },
  {
    "id": "te03",
    "level": "A2",
    "trap": "present-perfect-vs-past",
    "sub": "Use “have been” to describe experience without a finished past time.",
    "sub_ar": "استخدم «have been» لوصف تجربة دون تحديد وقت ماضٍ منتهٍ.",
    "prompt": "Choose the correct sentence about life experience.",
    "q_ar": "اختر الجملة الصحيحة للتحدث عن تجربة في الحياة.",
    "options": [
      "went to London three times",
      "have been to London three times",
      "was in London three times",
      "am going to London three times"
    ],
    "answer": 1,
    "why_en": "Use “have been to” to describe life experience; a specific finished past time would normally use the past simple.",
    "why_ar": "نستخدم have been to للحديث عن تجربة في الحياة دون تحديد وقت ماضٍ منتهٍ. إذا ذكرت وقتًا منتهيًا مثل last year، نستخدم الماضي البسيط.",
    "arabic_hint": "لا تخلط بين “I have been to London” (تجربة في حياتي) و“I went to London last year” (حدث في وقت ماضٍ محدد)."
  },
  {
    "id": "te04",
    "level": "B1",
    "trap": "present-perfect-vs-past",
    "sub": "Choose the best option.",
    "sub_ar": "اختر الخيار الأنسب.",
    "prompt": "I can’t open the file. I ___ my password.",
    "q_ar": "لا أستطيع فتح الملف. لقد ___ كلمة المرور.",
    "options": [
      "forgot",
      "have forgotten",
      "forget yesterday",
      "had forget"
    ],
    "answer": 1,
    "why_en": "Choose the tense by looking at the time expression and its link to the present. Finished past times usually take the past simple; experiences or unfinished periods often use the present perfect.",
    "why_ar": "اختر الزمن بحسب مؤشر الوقت وعلاقته بالحاضر. الوقت الماضي المنتهي يأخذ غالبًا الماضي البسيط، أما التجارب أو الفترات المستمرة فقد تحتاج إلى المضارع التام.",
    "arabic_hint": "المضارع التام يربط نسيان كلمة المرور بالمشكلة الحالية."
  },
  {
    "id": "te05",
    "level": "B1",
    "trap": "present-perfect-vs-past",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "We ___ the museum last weekend.",
    "q_ar": "نحن ___ المتحف في عطلة نهاية الأسبوع الماضية.",
    "options": [
      "have visited",
      "visited",
      "have been visiting",
      "visit"
    ],
    "answer": 1,
    "why_en": "Choose the tense by looking at the time expression and its link to the present. Finished past times usually take the past simple; experiences or unfinished periods often use the present perfect.",
    "why_ar": "اختر الزمن بحسب مؤشر الوقت وعلاقته بالحاضر. الوقت الماضي المنتهي يأخذ غالبًا الماضي البسيط، أما التجارب أو الفترات المستمرة فقد تحتاج إلى المضارع التام.",
    "arabic_hint": "Last weekend وقت ماضٍ منتهٍ، لذا نستخدم visited."
  },
  {
    "id": "te06",
    "level": "B2",
    "trap": "present-perfect-vs-past",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "By the time I arrived, the meeting ___.",
    "q_ar": "بحلول وقت وصولي، كان الاجتماع قد ___.",
    "options": [
      "has started",
      "had started",
      "have started",
      "starts"
    ],
    "answer": 1,
    "why_en": "Choose the tense by looking at the time expression and its link to the present. Finished past times usually take the past simple; experiences or unfinished periods often use the present perfect.",
    "why_ar": "اختر الزمن بحسب مؤشر الوقت وعلاقته بالحاضر. الوقت الماضي المنتهي يأخذ غالبًا الماضي البسيط، أما التجارب أو الفترات المستمرة فقد تحتاج إلى المضارع التام.",
    "arabic_hint": "الماضي التام يوضح أن الاجتماع بدأ قبل وصولي."
  },
  {
    "id": "te07",
    "level": "C1",
    "trap": "present-perfect-vs-past",
    "sub": "Complete the sentence naturally.",
    "sub_ar": "أكمل الجملة بصياغة طبيعية.",
    "prompt": "This is the first time I ___ such a detailed analysis.",
    "q_ar": "هذه أول مرة ___ فيها تحليلًا بهذه الدرجة من التفصيل.",
    "options": [
      "saw",
      "have seen",
      "had saw",
      "am seeing yesterday"
    ],
    "answer": 1,
    "why_en": "Choose the tense by looking at the time expression and its link to the present. Finished past times usually take the past simple; experiences or unfinished periods often use the present perfect.",
    "why_ar": "اختر الزمن بحسب مؤشر الوقت وعلاقته بالحاضر. الوقت الماضي المنتهي يأخذ غالبًا الماضي البسيط، أما التجارب أو الفترات المستمرة فقد تحتاج إلى المضارع التام.",
    "arabic_hint": "بعد This is the first time نستخدم غالبًا المضارع التام."
  },
  {
    "id": "te08",
    "level": "C2",
    "trap": "present-perfect-vs-past",
    "sub": "Choose the precise option.",
    "sub_ar": "اختر الخيار الأكثر دقة.",
    "prompt": "The committee ___ three revisions so far, and it may request another.",
    "q_ar": "قدّمت اللجنة ___ مراجعات حتى الآن، وقد تطلب مراجعة أخرى.",
    "options": [
      "requested",
      "has requested",
      "had requested yesterday",
      "requests last week"
    ],
    "answer": 1,
    "why_en": "Choose the tense by looking at the time expression and its link to the present. Finished past times usually take the past simple; experiences or unfinished periods often use the present perfect.",
    "why_ar": "اختر الزمن بحسب مؤشر الوقت وعلاقته بالحاضر. الوقت الماضي المنتهي يأخذ غالبًا الماضي البسيط، أما التجارب أو الفترات المستمرة فقد تحتاج إلى المضارع التام.",
    "arabic_hint": "So far تربط ما حدث حتى الآن بالحاضر، لذا يناسبها has requested."
  },
  {
    "id": "un01",
    "level": "A1",
    "trap": "countable-uncountable",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "Can you give me some ___?",
    "q_ar": "هل يمكنك إعطائي بعض ___؟",
    "options": [
      "advices",
      "advice",
      "an advice",
      "advise"
    ],
    "answer": 1,
    "why_en": "Advice is uncountable; say some advice, not an advice or advices.",
    "why_ar": "كلمة advice غير معدودة؛ نقول some advice، وليس an advice أو advices.",
    "arabic_hint": "Advice اسم غير معدود؛ نقول some advice أو a piece of advice."
  },
  {
    "id": "un02",
    "level": "A1",
    "trap": "countable-uncountable",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "I need some ___ about the bus schedule.",
    "q_ar": "أحتاج إلى بعض ___ عن جدول الحافلات.",
    "options": [
      "informations",
      "information",
      "an information",
      "inform"
    ],
    "answer": 1,
    "why_en": "Information is uncountable; use information, not informations.",
    "why_ar": "كلمة information غير معدودة؛ نستخدم information دون s.",
    "arabic_hint": "Information غير معدود، رغم أن العربية تقول «معلومات»."
  },
  {
    "id": "un03",
    "level": "A2",
    "trap": "countable-uncountable",
    "sub": "Choose the correct phrase.",
    "sub_ar": "اختر العبارة الصحيحة.",
    "prompt": "There are ___ on the table.",
    "q_ar": "هناك ___ على الطاولة.",
    "options": [
      "three bread",
      "three breads",
      "three slices of bread",
      "three slice of bread"
    ],
    "answer": 2,
    "why_en": "Bread is uncountable here, so count slices: three slices of bread.",
    "why_ar": "كلمة bread غير معدودة هنا، لذا نعدّها بوحدات: three slices of bread.",
    "arabic_hint": "نعدّ bread بوحدات مثل slices أو loaves."
  },
  {
    "id": "un04",
    "level": "A2",
    "trap": "countable-uncountable",
    "sub": "Choose the natural sentence.",
    "sub_ar": "اختر الجملة الطبيعية في الإنجليزية.",
    "prompt": "The equipment ___ very expensive.",
    "q_ar": "المعدات ___ باهظة الثمن.",
    "options": [
      "are",
      "is",
      "were",
      "have"
    ],
    "answer": 1,
    "why_en": "Equipment is an uncountable singular noun, so use is.",
    "why_ar": "كلمة equipment اسم غير معدود ويعامل كمفرد، لذا نستخدم is.",
    "arabic_hint": "Equipment اسم غير معدود ويأخذ فعلًا مفردًا."
  },
  {
    "id": "un05",
    "level": "B1",
    "trap": "countable-uncountable",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "We received ___ useful feedback after the presentation.",
    "q_ar": "تلقينا ___ مفيدة بعد العرض التقديمي.",
    "options": [
      "many",
      "a few",
      "a lot of",
      "several"
    ],
    "answer": 2,
    "why_en": "“Feedback” is uncountable, so “a lot of useful feedback” is natural; do not use “many” or “a few” directly.",
    "why_ar": "Feedback اسم غير معدود؛ التعبير الطبيعي هنا a lot of useful feedback، ولا نستخدم many أو a few معه مباشرةً.",
    "arabic_hint": "قارن بين many suggestions (اقتراحات معدودة) وa lot of feedback (ملاحظات غير معدودة)."
  },
  {
    "id": "un06",
    "level": "B2",
    "trap": "countable-uncountable",
    "sub": "Choose the correct option.",
    "sub_ar": "اختر الخيار الصحيح.",
    "prompt": "The research ___ that the method is reliable.",
    "q_ar": "تشير الأبحاث ___ الطريقة موثوقة.",
    "options": [
      "suggest",
      "suggests",
      "suggestions",
      "are suggesting"
    ],
    "answer": 1,
    "why_en": "Some English nouns are uncountable even when Arabic uses a plural form. They usually do not take a/an or a plural -s; use a unit phrase when counting them.",
    "why_ar": "بعض الأسماء غير معدودة في الإنجليزية حتى لو كان مقابلها العربي جمعًا. لا نضيف إليها s ولا نستخدم a/an معها عادةً؛ استخدم وحدة قياس عند العد.",
    "arabic_hint": "Research اسم غير معدود في هذا المعنى، ويأخذ فعلًا مفردًا."
  },
  {
    "id": "un07",
    "level": "C1",
    "trap": "countable-uncountable",
    "sub": "Choose the natural phrase.",
    "sub_ar": "اختر التعبير الطبيعي في الإنجليزية.",
    "prompt": "The company has made considerable ___ in efficiency.",
    "q_ar": "حققت الشركة ___ ملحوظًا في الكفاءة.",
    "options": [
      "progresses",
      "progress",
      "a progress",
      "progressing"
    ],
    "answer": 1,
    "why_en": "Some English nouns are uncountable even when Arabic uses a plural form. They usually do not take a/an or a plural -s; use a unit phrase when counting them.",
    "why_ar": "بعض الأسماء غير معدودة في الإنجليزية حتى لو كان مقابلها العربي جمعًا. لا نضيف إليها s ولا نستخدم a/an معها عادةً؛ استخدم وحدة قياس عند العد.",
    "arabic_hint": "Progress اسم غير معدود في هذا المعنى: considerable progress."
  },
  {
    "id": "un08",
    "level": "C2",
    "trap": "countable-uncountable",
    "sub": "Choose the formal sentence.",
    "sub_ar": "اختر الجملة الرسمية.",
    "prompt": "The evidence ___ insufficient to support the claim.",
    "q_ar": "الأدلة ___ غير كافية لدعم الادعاء.",
    "options": [
      "are",
      "were",
      "is",
      "have been"
    ],
    "answer": 2,
    "why_en": "Some English nouns are uncountable even when Arabic uses a plural form. They usually do not take a/an or a plural -s; use a unit phrase when counting them.",
    "why_ar": "بعض الأسماء غير معدودة في الإنجليزية حتى لو كان مقابلها العربي جمعًا. لا نضيف إليها s ولا نستخدم a/an معها عادةً؛ استخدم وحدة قياس عند العد.",
    "arabic_hint": "Evidence اسم غير معدود ويأخذ عادةً فعلًا مفردًا."
  },
  {
    "id": "vb01",
    "level": "A1",
    "trap": "verb-patterns",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "I ___ with you.",
    "q_ar": "أنا ___ معك.",
    "options": [
      "am agree",
      "agree",
      "agreeing",
      "does agree"
    ],
    "answer": 1,
    "why_en": "Agree is a main verb; say I agree, not I am agree.",
    "why_ar": "Agree فعل أساسي؛ نقول I agree وليس I am agree.",
    "arabic_hint": "في العربية نقول «أنا موافق»، لكن agree فعل، لذلك نقول I agree لا I am agree."
  },
  {
    "id": "vb02",
    "level": "A2",
    "trap": "verb-patterns",
    "sub": "Complete the expression.",
    "sub_ar": "أكمل التعبير.",
    "prompt": "It depends ___ the weather.",
    "q_ar": "يعتمد الأمر ___ الطقس.",
    "options": [
      "of",
      "from",
      "on",
      "at"
    ],
    "answer": 2,
    "why_en": "The fixed expression is depend on.",
    "why_ar": "التعبير الثابت هو depend on.",
    "arabic_hint": "التعبير الصحيح هو depend on، ولا يُختار حرف الجر بالترجمة الحرفية."
  },
  {
    "id": "vb03",
    "level": "A2",
    "trap": "verb-patterns",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "She is married ___ a doctor.",
    "q_ar": "هي متزوجة ___ طبيب.",
    "options": [
      "with",
      "to",
      "by",
      "from"
    ],
    "answer": 1,
    "why_en": "The standard expression is married to someone.",
    "why_ar": "التعبير الصحيح هو married to someone.",
    "arabic_hint": "التعبير الصحيح هو married to someone، رغم اختلاف حرف الجر عن العربية."
  },
  {
    "id": "vb04",
    "level": "B1",
    "trap": "verb-patterns",
    "sub": "Choose the natural sentence.",
    "sub_ar": "اختر الجملة الطبيعية في الإنجليزية.",
    "prompt": "He suggested ___ the train instead.",
    "q_ar": "اقترح أن ___ القطار بدلًا من ذلك.",
    "options": [
      "to take",
      "taking",
      "take",
      "that taking"
    ],
    "answer": 1,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "Suggest يأتي غالبًا بعده فعل بـ ing أو جملة that، لا to + فعل في هذا التركيب."
  },
  {
    "id": "vb05",
    "level": "B1",
    "trap": "verb-patterns",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "We discussed ___ the deadline.",
    "q_ar": "ناقشنا ___ الموعد النهائي.",
    "options": [
      "about extending",
      "to extend",
      "extending",
      "extend to"
    ],
    "answer": 2,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "نقول discuss extending ولا نضيف about قبل المفعول."
  },
  {
    "id": "vb06",
    "level": "B2",
    "trap": "verb-patterns",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "I look forward to ___ from you.",
    "q_ar": "أتطلع إلى ___ أخبارك.",
    "options": [
      "hear",
      "hearing",
      "heard",
      "have hear"
    ],
    "answer": 1,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "في look forward to، كلمة to حرف جر، لذلك يأتي بعدها فعل بـ ing."
  },
  {
    "id": "vb07",
    "level": "C1",
    "trap": "verb-patterns",
    "sub": "Choose the natural sentence.",
    "sub_ar": "اختر الجملة الطبيعية في الإنجليزية.",
    "prompt": "The outcome depends ___ whether funding is approved.",
    "q_ar": "تعتمد النتيجة ___ ما إذا كان التمويل سيُعتمد.",
    "options": [
      "of",
      "on",
      "from",
      "about"
    ],
    "answer": 1,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "نستخدم depend on حتى عندما يأتي بعده تركيب طويل يبدأ بـ whether."
  },
  {
    "id": "vb08",
    "level": "C2",
    "trap": "verb-patterns",
    "sub": "Choose the formal construction.",
    "sub_ar": "اختر التركيب الرسمي.",
    "prompt": "The chair insisted that every member ___ present.",
    "q_ar": "أصرّ رئيس الجلسة على أن ___ كل عضو حاضرًا.",
    "options": [
      "is",
      "was being",
      "be",
      "to be"
    ],
    "answer": 2,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "بعد insisted that قد نستخدم be بصيغته الأساسية في الأسلوب الرسمي."
  },
  {
    "id": "trap-a1-extra-01",
    "level": "A1",
    "trap": "articles",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "I have ___ umbrella.",
    "q_ar": "لدي ___ مظلة.",
    "options": [
      "a",
      "an",
      "the",
      "—"
    ],
    "answer": 1,
    "why_en": "Use an before a vowel sound, as in umbrella.",
    "why_ar": "نستخدم an قبل صوت علة كما في umbrella.",
    "arabic_hint": "اختر الأداة وفق الصوت الأول للكلمة."
  },
  {
    "id": "trap-a1-extra-02",
    "level": "A1",
    "trap": "be-verbs",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "My parents ___ at home.",
    "q_ar": "والداي ___ في المنزل.",
    "options": [
      "is",
      "am",
      "are",
      "be"
    ],
    "answer": 2,
    "why_en": "Parents is plural, so it takes are.",
    "why_ar": "Parents جمع، لذلك نستخدم are.",
    "arabic_hint": "انتبه إلى أن الفاعل جمع."
  },
  {
    "id": "trap-a2-extra-01",
    "level": "A2",
    "trap": "countability",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "There isn't ___ milk in the fridge.",
    "q_ar": "لا يوجد ___ من الحليب في الثلاجة.",
    "options": [
      "many",
      "some",
      "any",
      "few"
    ],
    "answer": 2,
    "why_en": "Any is common in negative statements with uncountable nouns.",
    "why_ar": "نستخدم any كثيرًا في النفي مع الأسماء غير المعدودة.",
    "arabic_hint": "Milk اسم غير معدود والجملة منفية."
  },
  {
    "id": "trap-a2-extra-02",
    "level": "A2",
    "trap": "past-time",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "They ___ home an hour ago.",
    "q_ar": "لقد ___ إلى المنزل قبل ساعة.",
    "options": [
      "come",
      "came",
      "have come",
      "coming"
    ],
    "answer": 1,
    "why_en": "Ago refers to a finished past time, so use the past simple.",
    "why_ar": "تشير ago إلى وقت ماضٍ منتهٍ، لذا نستخدم الماضي البسيط.",
    "arabic_hint": "وجود ago دليل على الماضي البسيط."
  },
  {
    "id": "trap-b1-extra-01",
    "level": "B1",
    "trap": "verb-patterns",
    "sub": "Complete the sentence.",
    "sub_ar": "أكمل الجملة.",
    "prompt": "He apologized ___ being late.",
    "q_ar": "اعتذر عن ___ متأخرًا.",
    "options": [
      "for",
      "to",
      "about",
      "with"
    ],
    "answer": 0,
    "why_en": "The standard pattern is apologize for something or doing something.",
    "why_ar": "التركيب الصحيح apologize for شيء أو فعل.",
    "arabic_hint": "احفظ الفعل مع حرف الجر المناسب."
  },
  {
    "id": "trap-b1-extra-02",
    "level": "B1",
    "trap": "conditionals",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "If I ___ more time, I would learn Japanese.",
    "q_ar": "أكمل الجملة الإنجليزية: “If I ___ more time, I would learn Japanese.”",
    "options": [
      "have",
      "had",
      "will have",
      "would have"
    ],
    "answer": 1,
    "why_en": "The second conditional uses past simple in the if-clause.",
    "why_ar": "يستخدم الشرط الثاني الماضي البسيط في جملة if.",
    "arabic_hint": "would في النتيجة يشير غالبًا إلى الشرط الثاني."
  },
  {
    "id": "trap-b2-extra-01",
    "level": "B2",
    "trap": "collocations",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "We need to take ___ account the cost of travel.",
    "q_ar": "علينا أن نأخذ تكلفة السفر ___ الاعتبار.",
    "options": [
      "in",
      "into",
      "on",
      "at"
    ],
    "answer": 1,
    "why_en": "The fixed phrase is take into account.",
    "why_ar": "التعبير الثابت هو take into account.",
    "arabic_hint": "تعلم العبارة كاملة لا حرف الجر وحده."
  },
  {
    "id": "trap-b2-extra-02",
    "level": "B2",
    "trap": "reported-speech",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "He denied ___ the confidential file.",
    "q_ar": "أنكر ___ الملف السري.",
    "options": [
      "to open",
      "opening",
      "open",
      "opened"
    ],
    "answer": 1,
    "why_en": "Deny is followed by an -ing form.",
    "why_ar": "يأتي بعد deny فعل منتهٍ بـ ing.",
    "arabic_hint": "تختلف صيغة الفعل بعد deny عن بعض الأفعال الأخرى."
  },
  {
    "id": "trap-c1-extra-01",
    "level": "C1",
    "trap": "inversion",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "Only after the review ___ the error discovered.",
    "q_ar": "أكمل الجملة الإنجليزية: “Only after the review ___ the error discovered.”",
    "options": [
      "the team did",
      "did the team",
      "the team had",
      "the team was"
    ],
    "answer": 1,
    "why_en": "A fronted only after phrase triggers inversion in the main clause.",
    "why_ar": "تقديم Only after يستلزم القلب في الجملة الرئيسية.",
    "arabic_hint": "ابحث عن ترتيب الفعل المساعد ثم الفاعل."
  },
  {
    "id": "trap-c1-extra-02",
    "level": "C1",
    "trap": "subjunctive",
    "sub": "Choose the formal construction.",
    "sub_ar": "اختر التركيب الرسمي.",
    "prompt": "They recommended that the proposal ___ revised.",
    "q_ar": "أوصوا بأن ___ الاقتراح.",
    "options": [
      "is",
      "be",
      "was",
      "to be"
    ],
    "answer": 1,
    "why_en": "Formal recommendation clauses can use the base-form subjunctive be.",
    "why_ar": "يمكن استخدام be بصيغته الأساسية بعد recommend that في الأسلوب الرسمي.",
    "arabic_hint": "بعد recommend that قد يأتي الفعل بصيغته الأساسية."
  },
  {
    "id": "trap-c2-extra-01",
    "level": "C2",
    "trap": "inversion",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "Rarely ___ such a compelling argument.",
    "q_ar": "نادرًا ما ___ حجة مقنعة كهذه.",
    "options": [
      "we have heard",
      "have we heard",
      "we heard have",
      "heard we have"
    ],
    "answer": 1,
    "why_en": "A negative adverb at the beginning triggers subject–auxiliary inversion.",
    "why_ar": "الظرف السلبي في بداية الجملة يستلزم القلب.",
    "arabic_hint": "رتب الجملة: الظرف ثم الفعل المساعد ثم الفاعل."
  },
  {
    "id": "trap-c2-extra-02",
    "level": "C2",
    "trap": "formal-collocations",
    "sub": "Complete the phrase.",
    "sub_ar": "أكمل العبارة.",
    "prompt": "The conclusion is predicated ___ several assumptions.",
    "q_ar": "يستند الاستنتاج ___ عدة افتراضات.",
    "options": [
      "in",
      "on",
      "at",
      "for"
    ],
    "answer": 1,
    "why_en": "The standard formal collocation is predicated on.",
    "why_ar": "التركيب الرسمي الصحيح هو predicated on.",
    "arabic_hint": "احفظ التركيب predicated on كوحدة واحدة."
  },
  {
    "id": "trap-a1-bank-03",
    "level": "A1",
    "trap": "articles",
    "sub": "Choose the correct article.",
    "sub_ar": "اختر أداة التعريف أو التنكير الصحيحة.",
    "prompt": "She has ___ apple.",
    "q_ar": "لديها ___ تفاحة.",
    "options": [
      "a",
      "an",
      "the",
      "—"
    ],
    "answer": 1,
    "why_en": "Use an before a vowel sound.",
    "why_ar": "نستخدم an قبل صوت علة.",
    "arabic_hint": "نستخدم an قبل صوت علة."
  },
  {
    "id": "trap-a1-bank-04",
    "level": "A1",
    "trap": "be-verbs",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "I ___ ready now.",
    "q_ar": "أنا ___ مستعد الآن.",
    "options": [
      "is",
      "are",
      "am",
      "be"
    ],
    "answer": 2,
    "why_en": "Use am with I.",
    "why_ar": "نستخدم am مع I.",
    "arabic_hint": "نستخدم am مع I."
  },
  {
    "id": "trap-a1-bank-05",
    "level": "A1",
    "trap": "present-simple",
    "sub": "Choose the correct verb.",
    "sub_ar": "اختر الفعل الصحيح.",
    "prompt": "He ___ TV every evening.",
    "q_ar": "هو ___ التلفاز كل مساء.",
    "options": [
      "watch",
      "watches",
      "watching",
      "watched"
    ],
    "answer": 1,
    "why_en": "Third-person singular takes -es here.",
    "why_ar": "نضيف es مع الغائب المفرد هنا.",
    "arabic_hint": "نضيف es مع الغائب المفرد هنا."
  },
  {
    "id": "trap-a1-bank-06",
    "level": "A1",
    "trap": "pronouns",
    "sub": "Choose the correct pronoun.",
    "sub_ar": "اختر الضمير الصحيح.",
    "prompt": "Sara is my friend. ___ is kind.",
    "q_ar": "سارة صديقتي. ___ لطيفة.",
    "options": [
      "He",
      "They",
      "It",
      "She"
    ],
    "answer": 3,
    "why_en": "Use she for a female person.",
    "why_ar": "نستخدم she للإشارة إلى فتاة أو امرأة.",
    "arabic_hint": "نستخدم she للإشارة إلى فتاة أو امرأة."
  },
  {
    "id": "trap-a1-bank-07",
    "level": "A1",
    "trap": "plurals",
    "sub": "Choose the plural form.",
    "sub_ar": "اختر صيغة الجمع.",
    "prompt": "I have three ___.",
    "q_ar": "لدي ثلاثة ___.",
    "options": [
      "box",
      "boxs",
      "boxes",
      "boxies"
    ],
    "answer": 2,
    "why_en": "Nouns ending in x usually take -es.",
    "why_ar": "الأسماء المنتهية بـ x تأخذ غالبًا es في الجمع.",
    "arabic_hint": "الأسماء المنتهية بـ x تأخذ غالبًا es في الجمع."
  },
  {
    "id": "trap-a1-bank-08",
    "level": "A1",
    "trap": "can",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "My brother can ___ fast.",
    "q_ar": "أخي يستطيع أن ___ بسرعة.",
    "options": [
      "runs",
      "running",
      "run",
      "ran"
    ],
    "answer": 2,
    "why_en": "After can, use the base form.",
    "why_ar": "بعد can نستخدم الفعل الأساسي.",
    "arabic_hint": "بعد can نستخدم الفعل الأساسي."
  },
  {
    "id": "trap-a1-bank-09",
    "level": "A1",
    "trap": "word-order",
    "sub": "Choose the correct question.",
    "sub_ar": "اختر السؤال الصحيح.",
    "prompt": "___ you like music?",
    "q_ar": "___ تحب الموسيقى؟",
    "options": [
      "Are",
      "Do",
      "Does",
      "Is"
    ],
    "answer": 1,
    "why_en": "Use do with you in present-simple questions.",
    "why_ar": "نستخدم do في السؤال مع you في المضارع البسيط.",
    "arabic_hint": "نستخدم do في السؤال مع you في المضارع البسيط."
  },
  {
    "id": "trap-a1-bank-10",
    "level": "A1",
    "trap": "possessives",
    "sub": "Choose the correct word.",
    "sub_ar": "اختر الكلمة الصحيحة.",
    "prompt": "This is ___ book; I own it.",
    "q_ar": "هذا ___ كتاب؛ أنا أملكه.",
    "options": [
      "me",
      "my",
      "mine is",
      "I"
    ],
    "answer": 1,
    "why_en": "Use my before a noun.",
    "why_ar": "نستخدم my قبل الاسم.",
    "arabic_hint": "نستخدم my قبل الاسم."
  },
  {
    "id": "trap-a2-bank-03",
    "level": "A2",
    "trap": "past-simple",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "We ___ our grandparents yesterday.",
    "q_ar": "أكمل الجملة الإنجليزية: “We ___ our grandparents yesterday.”",
    "options": [
      "visit",
      "visited",
      "have visit",
      "visiting"
    ],
    "answer": 1,
    "why_en": "Yesterday normally takes the past simple.",
    "why_ar": "نستخدم الماضي البسيط مع yesterday.",
    "arabic_hint": "نستخدم الماضي البسيط مع yesterday."
  },
  {
    "id": "trap-a2-bank-04",
    "level": "A2",
    "trap": "countability",
    "sub": "Choose the correct word.",
    "sub_ar": "اختر الكلمة الصحيحة.",
    "prompt": "How ___ apples do you need?",
    "q_ar": "كم ___ تحتاج من التفاح؟",
    "options": [
      "much",
      "many",
      "any",
      "little"
    ],
    "answer": 1,
    "why_en": "Use many with countable plural nouns.",
    "why_ar": "نستخدم many مع الأسماء المعدودة بالجمع.",
    "arabic_hint": "نستخدم many مع الأسماء المعدودة بالجمع."
  },
  {
    "id": "trap-a2-bank-05",
    "level": "A2",
    "trap": "comparatives",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "This road is ___ than that one.",
    "q_ar": "هذا الطريق ___ من ذلك الطريق.",
    "options": [
      "more narrow",
      "narrower",
      "most narrow",
      "narrow"
    ],
    "answer": 1,
    "why_en": "Short adjectives usually take -er in comparisons.",
    "why_ar": "غالبًا نضيف er للصفة القصيرة في المقارنة.",
    "arabic_hint": "غالبًا نضيف er للصفة القصيرة في المقارنة."
  },
  {
    "id": "trap-a2-bank-06",
    "level": "A2",
    "trap": "prepositions",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "The meeting starts ___ nine.",
    "q_ar": "يبدأ الاجتماع ___ الساعة التاسعة.",
    "options": [
      "in",
      "on",
      "at",
      "by"
    ],
    "answer": 2,
    "why_en": "Use at with clock times.",
    "why_ar": "نستخدم at مع أوقات الساعة.",
    "arabic_hint": "نستخدم at مع أوقات الساعة."
  },
  {
    "id": "trap-a2-bank-07",
    "level": "A2",
    "trap": "present-perfect",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "I have never ___ sushi.",
    "q_ar": "لم ___ السوشي قط.",
    "options": [
      "eat",
      "ate",
      "eaten",
      "eating"
    ],
    "answer": 2,
    "why_en": "Present perfect uses have/has + past participle.",
    "why_ar": "يتكون المضارع التام من have/has والتصريف الثالث.",
    "arabic_hint": "يتكون المضارع التام من have/has والتصريف الثالث."
  },
  {
    "id": "trap-a2-bank-08",
    "level": "A2",
    "trap": "infinitives",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "She wants ___ a doctor.",
    "q_ar": "هي تريد ___ طبيبة.",
    "options": [
      "be",
      "being",
      "to be",
      "is"
    ],
    "answer": 2,
    "why_en": "Want is followed by to + base verb.",
    "why_ar": "يأتي بعد want المصدر مع to.",
    "arabic_hint": "يأتي بعد want المصدر مع to."
  },
  {
    "id": "trap-b1-bank-03",
    "level": "B1",
    "trap": "verb-patterns",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "They avoided ___ about the problem.",
    "q_ar": "تجنبوا ___ عن المشكلة.",
    "options": [
      "to talk",
      "talk",
      "talking",
      "talked"
    ],
    "answer": 2,
    "why_en": "Avoid is followed by an -ing form.",
    "why_ar": "يأتي بعد avoid فعل ing.",
    "arabic_hint": "يأتي بعد avoid فعل ing."
  },
  {
    "id": "trap-b1-bank-04",
    "level": "B1",
    "trap": "conditionals",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "If I were you, I ___ apologise.",
    "q_ar": "لو كنت مكانك، ___ أعتذر.",
    "options": [
      "will",
      "would",
      "am",
      "have"
    ],
    "answer": 1,
    "why_en": "The second conditional uses would in the result clause.",
    "why_ar": "يستخدم الشرط الثاني would في جملة النتيجة.",
    "arabic_hint": "يستخدم الشرط الثاني would في جملة النتيجة."
  },
  {
    "id": "trap-b1-bank-05",
    "level": "B1",
    "trap": "reported-speech",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "He asked me where I ___.",
    "q_ar": "سألني أين ___.",
    "options": [
      "live",
      "did I live",
      "lived",
      "do live"
    ],
    "answer": 2,
    "why_en": "Reported questions use statement word order and often backshift.",
    "why_ar": "تستخدم الأسئلة المنقولة ترتيب الجملة الخبرية وغالبًا تحويل الزمن.",
    "arabic_hint": "تستخدم الأسئلة المنقولة ترتيب الجملة الخبرية وغالبًا تحويل الزمن."
  },
  {
    "id": "trap-b1-bank-06",
    "level": "B1",
    "trap": "since-for",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "I've worked here ___ 2021.",
    "q_ar": "أعمل هنا ___ عام 2021.",
    "options": [
      "for",
      "since",
      "during",
      "from"
    ],
    "answer": 1,
    "why_en": "Use since with a starting point.",
    "why_ar": "نستخدم since مع نقطة البداية.",
    "arabic_hint": "نستخدم since مع نقطة البداية."
  },
  {
    "id": "trap-b1-bank-07",
    "level": "B1",
    "trap": "gerunds",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "She is interested in ___ abroad.",
    "q_ar": "هي مهتمة بـ ___ في الخارج.",
    "options": [
      "study",
      "to study",
      "studying",
      "studied"
    ],
    "answer": 2,
    "why_en": "A preposition is followed by a noun or -ing form.",
    "why_ar": "يأتي بعد حرف الجر اسم أو فعل ing.",
    "arabic_hint": "يأتي بعد حرف الجر اسم أو فعل ing."
  },
  {
    "id": "trap-b1-bank-08",
    "level": "B1",
    "trap": "articles",
    "sub": "Choose the correct article.",
    "sub_ar": "اختر أداة التعريف أو التنكير الصحيحة.",
    "prompt": "He hopes to become ___ engineer.",
    "q_ar": "يأمل أن يصبح ___ مهندسًا.",
    "options": [
      "a",
      "an",
      "the",
      "—"
    ],
    "answer": 1,
    "why_en": "Engineer begins with a vowel sound.",
    "why_ar": "تبدأ engineer بصوت علة، لذا نستخدم an.",
    "arabic_hint": "تبدأ engineer بصوت علة، لذا نستخدم an."
  },
  {
    "id": "trap-b1-bank-09",
    "level": "B1",
    "trap": "adjectives",
    "sub": "Choose the correct word.",
    "sub_ar": "اختر الكلمة الصحيحة.",
    "prompt": "The long journey was ___.",
    "q_ar": "كانت الرحلة الطويلة ___.",
    "options": [
      "tired",
      "tiring",
      "tire",
      "tires"
    ],
    "answer": 1,
    "why_en": "Use -ing to describe something that causes a feeling.",
    "why_ar": "نستخدم ing لوصف الشيء الذي يسبب الشعور.",
    "arabic_hint": "نستخدم ing لوصف الشيء الذي يسبب الشعور."
  },
  {
    "id": "trap-b1-bank-10",
    "level": "B1",
    "trap": "modals",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "You ___ wear a seat belt; it is the law.",
    "q_ar": "___ عليك ارتداء حزام الأمان؛ فهذا هو القانون.",
    "options": [
      "might",
      "must",
      "would",
      "could have"
    ],
    "answer": 1,
    "why_en": "Must expresses strong obligation.",
    "why_ar": "تعبر must عن الإلزام القوي.",
    "arabic_hint": "تعبر must عن الإلزام القوي."
  },
  {
    "id": "trap-b1-bank-11",
    "level": "B1",
    "trap": "relative-clauses",
    "sub": "Choose the correct relative pronoun.",
    "sub_ar": "اختر ضمير الوصل الصحيح.",
    "prompt": "The woman ___ called you is my aunt.",
    "q_ar": "المرأة ___ اتصلت بك هي عمتي.",
    "options": [
      "which",
      "whose",
      "who",
      "where"
    ],
    "answer": 2,
    "why_en": "Use who for a person as the subject.",
    "why_ar": "نستخدم who للشخص عندما يكون فاعلًا.",
    "arabic_hint": "نستخدم who للشخص عندما يكون فاعلًا."
  },
  {
    "id": "trap-b1-bank-12",
    "level": "B1",
    "trap": "collocations",
    "sub": "Choose the correct phrase.",
    "sub_ar": "اختر العبارة الصحيحة.",
    "prompt": "Please ___ attention to the instructions.",
    "q_ar": "يرجى ___ الانتباه إلى التعليمات.",
    "options": [
      "do",
      "make",
      "pay",
      "give"
    ],
    "answer": 2,
    "why_en": "The standard collocation is pay attention.",
    "why_ar": "التركيب الصحيح pay attention.",
    "arabic_hint": "التركيب الصحيح pay attention."
  },
  {
    "id": "trap-b2-bank-03",
    "level": "B2",
    "trap": "inversion",
    "sub": "Choose the correct sentence.",
    "sub_ar": "اختر الجملة الصحيحة.",
    "prompt": "Not until midnight ___ home.",
    "q_ar": "أكمل الجملة الإنجليزية: “Not until midnight ___ home.”",
    "options": [
      "they returned",
      "did they return",
      "they did returned",
      "returned they"
    ],
    "answer": 1,
    "why_en": "Not until at the beginning triggers inversion.",
    "why_ar": "بدء الجملة بـ Not until يستلزم القلب.",
    "arabic_hint": "بدء الجملة بـ Not until يستلزم القلب."
  },
  {
    "id": "trap-b2-bank-04",
    "level": "B2",
    "trap": "verb-patterns",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "He admitted ___ the mistake.",
    "q_ar": "أكمل الجملة الإنجليزية: “He admitted ___ the mistake.”",
    "options": [
      "to make",
      "make",
      "making",
      "made"
    ],
    "answer": 2,
    "why_en": "Admit is followed by an -ing form.",
    "why_ar": "يأتي بعد admit فعل ing.",
    "arabic_hint": "يأتي بعد admit فعل ing."
  },
  {
    "id": "trap-b2-bank-05",
    "level": "B2",
    "trap": "prepositions",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "The new policy is consistent ___ our values.",
    "q_ar": "تتوافق السياسة الجديدة ___ قيمنا.",
    "options": [
      "to",
      "with",
      "for",
      "at"
    ],
    "answer": 1,
    "why_en": "The standard phrase is consistent with.",
    "why_ar": "التركيب الصحيح consistent with.",
    "arabic_hint": "التركيب الصحيح consistent with."
  },
  {
    "id": "trap-b2-bank-06",
    "level": "B2",
    "trap": "wish",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "I wish I ___ more time yesterday.",
    "q_ar": "أكمل الجملة الإنجليزية: “I wish I ___ more time yesterday.”",
    "options": [
      "have",
      "had",
      "had had",
      "would have"
    ],
    "answer": 2,
    "why_en": "For regret about a past situation, use wish + past perfect.",
    "why_ar": "للندم على الماضي نستخدم wish مع الماضي التام.",
    "arabic_hint": "للندم على الماضي نستخدم wish مع الماضي التام."
  },
  {
    "id": "trap-b2-bank-07",
    "level": "B2",
    "trap": "articles",
    "sub": "Choose the correct article.",
    "sub_ar": "اختر أداة التعريف أو التنكير الصحيحة.",
    "prompt": "She plays ___ piano beautifully.",
    "q_ar": "هي تعزف ___ البيانو ببراعة.",
    "options": [
      "a",
      "an",
      "the",
      "—"
    ],
    "answer": 2,
    "why_en": "Musical instruments commonly take the in this construction.",
    "why_ar": "تأتي the غالبًا مع الآلات الموسيقية بهذا التركيب.",
    "arabic_hint": "تأتي the غالبًا مع الآلات الموسيقية بهذا التركيب."
  },
  {
    "id": "trap-b2-bank-08",
    "level": "B2",
    "trap": "causative",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "I had my laptop ___ yesterday.",
    "q_ar": "أكمل الجملة الإنجليزية: “I had my laptop ___ yesterday.”",
    "options": [
      "repair",
      "repaired",
      "repairing",
      "to repair"
    ],
    "answer": 1,
    "why_en": "Have something done uses have + object + past participle.",
    "why_ar": "يتكون causative من have ثم المفعول والتصريف الثالث.",
    "arabic_hint": "يتكون causative من have ثم المفعول والتصريف الثالث."
  },
  {
    "id": "trap-b2-bank-09",
    "level": "B2",
    "trap": "linking-words",
    "sub": "Choose the best connector.",
    "sub_ar": "اختر أداة الربط الأنسب.",
    "prompt": "___ the heavy rain, the match continued.",
    "q_ar": "___ الأمطار الغزيرة، استمرت المباراة.",
    "options": [
      "Although",
      "Despite",
      "However",
      "Because"
    ],
    "answer": 1,
    "why_en": "Despite is followed by a noun phrase, not a full clause.",
    "why_ar": "يأتي بعد despite تركيب اسمي لا جملة كاملة.",
    "arabic_hint": "يأتي بعد despite تركيب اسمي لا جملة كاملة."
  },
  {
    "id": "trap-b2-bank-10",
    "level": "B2",
    "trap": "reported-speech",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "She denied ___ the confidential email.",
    "q_ar": "أكمل الجملة الإنجليزية: “She denied ___ the confidential email.”",
    "options": [
      "to send",
      "sending",
      "send",
      "sent"
    ],
    "answer": 1,
    "why_en": "Deny is followed by an -ing form.",
    "why_ar": "يأتي بعد deny فعل ing.",
    "arabic_hint": "يأتي بعد deny فعل ing."
  },
  {
    "id": "trap-b2-bank-11",
    "level": "B2",
    "trap": "quantifiers",
    "sub": "Choose the correct phrase.",
    "sub_ar": "اختر العبارة الصحيحة.",
    "prompt": "There is ___ chance of success without more data.",
    "q_ar": "هناك ___ فرصة للنجاح دون مزيد من البيانات.",
    "options": [
      "few",
      "little",
      "many",
      "several"
    ],
    "answer": 1,
    "why_en": "Chance is countable, but “little chance” is a fixed expression meaning a low probability.",
    "why_ar": "تعبير little chance يعني احتمالًا ضعيفًا.",
    "arabic_hint": "تعبير little chance يعني احتمالًا ضعيفًا."
  },
  {
    "id": "trap-b2-bank-12",
    "level": "B2",
    "trap": "collocations",
    "sub": "Choose the correct verb.",
    "sub_ar": "اختر الفعل الصحيح.",
    "prompt": "The findings ___ light on the cause.",
    "q_ar": "تسلط النتائج ___ على السبب.",
    "options": [
      "put",
      "shed",
      "set",
      "casted"
    ],
    "answer": 1,
    "why_en": "The standard phrase is shed light on.",
    "why_ar": "التعبير الصحيح shed light on.",
    "arabic_hint": "التعبير الصحيح shed light on."
  },
  {
    "id": "trap-b2-bank-13",
    "level": "B2",
    "trap": "conditionals",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "Had we left earlier, we ___ the traffic.",
    "q_ar": "لو غادرنا مبكرًا، ___نا الازدحام.",
    "options": [
      "would avoid",
      "would have avoided",
      "will avoid",
      "avoided"
    ],
    "answer": 1,
    "why_en": "A third conditional result uses would have + past participle.",
    "why_ar": "تستخدم نتيجة الشرط الثالث would have والتصريف الثالث.",
    "arabic_hint": "تستخدم نتيجة الشرط الثالث would have والتصريف الثالث."
  },
  {
    "id": "trap-b2-bank-14",
    "level": "B2",
    "trap": "adverbs",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "The instructions were ___ clear.",
    "q_ar": "كانت التعليمات واضحة ___.",
    "options": [
      "remarkable",
      "remarkably",
      "remarking",
      "remark"
    ],
    "answer": 1,
    "why_en": "An adverb modifies the adjective clear.",
    "why_ar": "نستخدم الظرف لتعديل الصفة clear.",
    "arabic_hint": "نستخدم الظرف لتعديل الصفة clear."
  },
  {
    "id": "trap-c1-bank-03",
    "level": "C1",
    "trap": "subjunctive",
    "sub": "Choose the formal construction.",
    "sub_ar": "اختر التركيب الرسمي.",
    "prompt": "The chair requested that each member ___ present.",
    "q_ar": "طلب رئيس الجلسة أن يكون كل عضو ___.",
    "options": [
      "is",
      "be",
      "was",
      "to be"
    ],
    "answer": 1,
    "why_en": "Formal request clauses can use the base-form subjunctive.",
    "why_ar": "يمكن استخدام الفعل الأساسي بعد request that في الأسلوب الرسمي.",
    "arabic_hint": "يمكن استخدام الفعل الأساسي بعد request that في الأسلوب الرسمي."
  },
  {
    "id": "trap-c1-bank-04",
    "level": "C1",
    "trap": "inversion",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "Rarely ___ such a convincing explanation.",
    "q_ar": "نادرًا ما ___ تفسيرًا مقنعًا كهذا.",
    "options": [
      "we have heard",
      "have we heard",
      "we heard have",
      "heard we"
    ],
    "answer": 1,
    "why_en": "A fronted negative adverb triggers inversion.",
    "why_ar": "الظرف السلبي في البداية يستلزم القلب.",
    "arabic_hint": "الظرف السلبي في البداية يستلزم القلب."
  },
  {
    "id": "trap-c1-bank-05",
    "level": "C1",
    "trap": "collocations",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "The decision is contingent ___ approval.",
    "q_ar": "يتوقف القرار ___ الموافقة.",
    "options": [
      "of",
      "on",
      "for",
      "with"
    ],
    "answer": 1,
    "why_en": "The formal collocation is contingent on.",
    "why_ar": "التركيب الرسمي contingent on.",
    "arabic_hint": "التركيب الرسمي contingent on."
  },
  {
    "id": "trap-c1-bank-06",
    "level": "C1",
    "trap": "verb-patterns",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "The report warrants ___ further.",
    "q_ar": "يستحق التقرير ___ إضافيًا.",
    "options": [
      "to examine",
      "examining",
      "being examined",
      "examine"
    ],
    "answer": 2,
    "why_en": "Warrant can take a passive -ing form when the subject receives the action.",
    "why_ar": "يمكن استخدام being examined عندما يقع الفعل على الموضوع.",
    "arabic_hint": "يمكن استخدام being examined عندما يقع الفعل على الموضوع."
  },
  {
    "id": "trap-c1-bank-07",
    "level": "C1",
    "trap": "concession",
    "sub": "Choose the best connector.",
    "sub_ar": "اختر أداة الربط الأنسب.",
    "prompt": "Much ___ I respect her, I disagree with this conclusion.",
    "q_ar": "مع أنني ___ أحترمها، فإنني أختلف مع هذا الاستنتاج.",
    "options": [
      "as",
      "although",
      "despite",
      "however"
    ],
    "answer": 0,
    "why_en": "Much as introduces a concessive clause.",
    "why_ar": "تستخدم Much as لتقديم جملة تفيد التنازل أو الاعتراف.",
    "arabic_hint": "تستخدم Much as لتقديم جملة تفيد التنازل أو الاعتراف."
  },
  {
    "id": "trap-c1-bank-08",
    "level": "C1",
    "trap": "relative-clauses",
    "sub": "Choose the correct word.",
    "sub_ar": "اختر الكلمة الصحيحة.",
    "prompt": "The proposal, ___ merits remain disputed, was approved.",
    "q_ar": "أكمل الجملة الإنجليزية: “The proposal, ___ merits remain disputed, was approved.”",
    "options": [
      "which",
      "whose",
      "who",
      "where"
    ],
    "answer": 1,
    "why_en": "Whose can refer to the proposal's merits.",
    "why_ar": "يمكن استخدام whose للدلالة على merits الخاصة بالمقترح.",
    "arabic_hint": "يمكن استخدام whose للدلالة على merits الخاصة بالمقترح."
  },
  {
    "id": "trap-c1-bank-09",
    "level": "C1",
    "trap": "formal-grammar",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "It is imperative that the files ___ securely stored.",
    "q_ar": "من الضروري أن ___ الملفات محفوظة بأمان.",
    "options": [
      "are",
      "be",
      "will be",
      "being"
    ],
    "answer": 1,
    "why_en": "Imperative that commonly takes the subjunctive base form.",
    "why_ar": "يأتي الفعل الأساسي بعد imperative that في الأسلوب الرسمي.",
    "arabic_hint": "يأتي الفعل الأساسي بعد imperative that في الأسلوب الرسمي."
  },
  {
    "id": "trap-c1-bank-10",
    "level": "C1",
    "trap": "prepositions",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "Her account is at variance ___ the official record.",
    "q_ar": "تختلف روايتها ___ السجل الرسمي.",
    "options": [
      "to",
      "with",
      "for",
      "by"
    ],
    "answer": 1,
    "why_en": "The fixed phrase is at variance with.",
    "why_ar": "التعبير الثابت at variance with.",
    "arabic_hint": "التعبير الثابت at variance with."
  },
  {
    "id": "trap-c1-bank-11",
    "level": "C1",
    "trap": "inversion",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "Only after the audit ___ the discrepancy discovered.",
    "q_ar": "أكمل الجملة الإنجليزية: “Only after the audit ___ the discrepancy discovered.”",
    "options": [
      "the team did",
      "did the team",
      "the team had",
      "the team was"
    ],
    "answer": 1,
    "why_en": "Only after at the beginning triggers inversion in the main clause.",
    "why_ar": "تقديم Only after يستلزم القلب في الجملة الرئيسية.",
    "arabic_hint": "تقديم Only after يستلزم القلب في الجملة الرئيسية."
  },
  {
    "id": "trap-c1-bank-12",
    "level": "C1",
    "trap": "hedging",
    "sub": "Choose the most cautious wording.",
    "sub_ar": "اختر الصياغة الأكثر تحفّظًا.",
    "prompt": "The evidence ___ suggest a correlation, but it is not conclusive.",
    "q_ar": "قد ___ الأدلة إلى وجود ارتباط، لكنها ليست قاطعة.",
    "options": [
      "may",
      "must",
      "does",
      "will"
    ],
    "answer": 0,
    "why_en": "May signals a possibility rather than certainty.",
    "why_ar": "تعبر may عن احتمال لا عن يقين.",
    "arabic_hint": "تعبر may عن احتمال لا عن يقين."
  },
  {
    "id": "trap-c1-bank-13",
    "level": "C1",
    "trap": "word-choice",
    "sub": "Choose the correct word.",
    "sub_ar": "اختر الكلمة الصحيحة.",
    "prompt": "The new rule may ___ existing inequalities.",
    "q_ar": "قد ___ القاعدة الجديدة أوجه عدم المساواة القائمة.",
    "options": [
      "exacerbate",
      "exasperate",
      "exaggerate",
      "exempt"
    ],
    "answer": 0,
    "why_en": "Exacerbate means to make a problem worse.",
    "why_ar": "Exacerbate تعني تفاقم المشكلة.",
    "arabic_hint": "Exacerbate تعني تفاقم المشكلة."
  },
  {
    "id": "trap-c1-bank-14",
    "level": "C1",
    "trap": "collocations",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "The findings lend credence ___ the hypothesis.",
    "q_ar": "تضفي النتائج مصداقية ___ الفرضية.",
    "options": [
      "for",
      "to",
      "with",
      "at"
    ],
    "answer": 1,
    "why_en": "The phrase is lend credence to.",
    "why_ar": "التعبير الصحيح lend credence to.",
    "arabic_hint": "التعبير الصحيح lend credence to."
  },
  {
    "id": "trap-c2-bank-03",
    "level": "C2",
    "trap": "inversion",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "Under no circumstances ___ the original data be altered.",
    "q_ar": "لا يجوز تحت أي ظرف ___ البيانات الأصلية.",
    "options": [
      "the researchers should",
      "should the researchers",
      "the researchers would",
      "would the researchers to"
    ],
    "answer": 1,
    "why_en": "A negative fronted phrase triggers inversion.",
    "why_ar": "العبارة السلبية في البداية تستلزم القلب.",
    "arabic_hint": "العبارة السلبية في البداية تستلزم القلب."
  },
  {
    "id": "trap-c2-bank-04",
    "level": "C2",
    "trap": "formal-collocations",
    "sub": "Choose the correct preposition.",
    "sub_ar": "اختر حرف الجر الصحيح.",
    "prompt": "The argument is predicated ___ an untested assumption.",
    "q_ar": "تستند الحجة ___ افتراض لم يُختبر.",
    "options": [
      "in",
      "on",
      "at",
      "for"
    ],
    "answer": 1,
    "why_en": "The formal collocation is predicated on.",
    "why_ar": "التركيب الرسمي predicated on.",
    "arabic_hint": "التركيب الرسمي predicated on."
  },
  {
    "id": "trap-c2-bank-05",
    "level": "C2",
    "trap": "subjunctive",
    "sub": "Choose the formal construction.",
    "sub_ar": "اختر التركيب الرسمي.",
    "prompt": "The statute requires that every applicant ___ the form in person.",
    "q_ar": "يشترط القانون أن ___ كل متقدم الاستمارة شخصيًا.",
    "options": [
      "completes",
      "complete",
      "completed",
      "to complete"
    ],
    "answer": 1,
    "why_en": "Require that can take the base-form subjunctive in formal English.",
    "why_ar": "يمكن أن يأتي بعد require that الفعل بصيغته الأساسية.",
    "arabic_hint": "يمكن أن يأتي بعد require that الفعل بصيغته الأساسية."
  },
  {
    "id": "trap-c2-bank-06",
    "level": "C2",
    "trap": "concession",
    "sub": "Choose the correct construction.",
    "sub_ar": "اختر التركيب الصحيح.",
    "prompt": "Be that ___ it may, the conclusion remains unsupported.",
    "q_ar": "مهما ___ الأمر، يظل الاستنتاج بلا دعم.",
    "options": [
      "as",
      "so",
      "what",
      "which"
    ],
    "answer": 0,
    "why_en": "The fixed expression is be that as it may.",
    "why_ar": "التعبير الثابت be that as it may.",
    "arabic_hint": "التعبير الثابت be that as it may."
  },
  {
    "id": "trap-c2-bank-07",
    "level": "C2",
    "trap": "precision",
    "sub": "Choose the closest meaning of “ostensible”.",
    "sub_ar": "اختر أقرب معنى لكلمة «ostensible».",
    "prompt": "The ostensible purpose of the visit was to inspect the building.",
    "q_ar": "كان الغرض الظاهري من الزيارة هو تفقد المبنى.",
    "options": [
      "appearing to be true or real, though not necessarily so",
      "proven beyond any doubt",
      "completely irrelevant",
      "impossible to observe"
    ],
    "answer": 0,
    "why_en": "Ostensible describes something that appears to be true or real, without guaranteeing that it actually is.",
    "why_ar": "تصف كلمة ostensible شيئًا يبدو صحيحًا أو حقيقيًا ظاهريًا، دون أن يعني ذلك بالضرورة أنه كذلك فعلًا.",
    "arabic_hint": "ostensible تعني «ظاهري» أي ما يبدو صحيحًا في الظاهر."
  },
  {
    "id": "trap-c2-bank-08",
    "level": "C2",
    "trap": "formal-grammar",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "The evidence, together with the appendices, ___ been reviewed.",
    "q_ar": "أكمل الجملة الإنجليزية: “The evidence, together with the appendices, ___ been reviewed.”",
    "options": [
      "have",
      "has",
      "were",
      "are"
    ],
    "answer": 1,
    "why_en": "The head subject evidence is uncountable and takes has here.",
    "why_ar": "الفاعل evidence غير معدود ويأخذ has هنا.",
    "arabic_hint": "الفاعل evidence غير معدود ويأخذ has هنا."
  },
  {
    "id": "trap-c2-bank-09",
    "level": "C2",
    "trap": "collocations",
    "sub": "Choose the correct phrase.",
    "sub_ar": "اختر العبارة الصحيحة.",
    "prompt": "The claim is difficult to reconcile ___ the available evidence.",
    "q_ar": "يصعب التوفيق بين الادعاء ___ الأدلة المتاحة.",
    "options": [
      "to",
      "with",
      "against",
      "for"
    ],
    "answer": 1,
    "why_en": "The standard phrase is reconcile with.",
    "why_ar": "التركيب الصحيح reconcile with.",
    "arabic_hint": "التركيب الصحيح reconcile with."
  },
  {
    "id": "trap-c2-bank-10",
    "level": "C2",
    "trap": "inversion",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "Not once ___ the witness contradict the original statement.",
    "q_ar": "لم ___ الشاهد يناقض التصريح الأصلي ولو مرة واحدة.",
    "options": [
      "the witness did",
      "did the witness",
      "the witness has",
      "has the witness did"
    ],
    "answer": 1,
    "why_en": "Not once at the beginning triggers inversion; did takes the base verb.",
    "why_ar": "بدء الجملة بـ Not once يستلزم القلب، ويأتي بعد did الفعل الأساسي.",
    "arabic_hint": "بدء الجملة بـ Not once يستلزم القلب، ويأتي بعد did الفعل الأساسي."
  },
  {
    "id": "trap-c2-bank-11",
    "level": "C2",
    "trap": "word-choice",
    "sub": "Choose the best word.",
    "sub_ar": "اختر الكلمة الأنسب.",
    "prompt": "The distinction is ___; it changes the interpretation of the entire clause.",
    "q_ar": "التمييز ___؛ فهو يغيّر تفسير الجملة بأكملها.",
    "options": [
      "material",
      "materiel",
      "maternal",
      "mature"
    ],
    "answer": 0,
    "why_en": "Material means significant or relevant in this context.",
    "why_ar": "Material تعني جوهريًا أو مؤثرًا في هذا السياق.",
    "arabic_hint": "Material تعني جوهريًا أو مؤثرًا في هذا السياق."
  },
  {
    "id": "trap-c2-bank-12",
    "level": "C2",
    "trap": "formal-phrases",
    "sub": "Choose the correct phrase.",
    "sub_ar": "اختر العبارة الصحيحة.",
    "prompt": "The distinction matters ___ the interpretation of the statute is concerned.",
    "q_ar": "يكتسب التمييز أهمية ___ تفسير القانون.",
    "options": [
      "insofar as",
      "insofar",
      "as far",
      "so far as"
    ],
    "answer": 0,
    "why_en": "Insofar as means to the extent that or so far as.",
    "why_ar": "Insofar as تعني بقدر ما أو من حيث إن.",
    "arabic_hint": "احفظ التركيب insofar as كاملًا."
  },
  {
    "id": "trap-c2-bank-13",
    "level": "C2",
    "trap": "logic",
    "sub": "Choose the correct word.",
    "sub_ar": "اختر الكلمة الصحيحة.",
    "prompt": "The premises do not ___ entail the conclusion.",
    "q_ar": "المقدمات لا ___ الاستنتاج بالضرورة.",
    "options": [
      "necessarily",
      "necessary",
      "necessity",
      "necessitated"
    ],
    "answer": 0,
    "why_en": "Necessarily is the adverb modifying entail.",
    "why_ar": "Necessarily ظرف يصف الفعل entail.",
    "arabic_hint": "Necessarily ظرف يصف الفعل entail."
  },
  {
    "id": "trap-c2-bank-14",
    "level": "C2",
    "trap": "formal-grammar",
    "sub": "Choose the correct form.",
    "sub_ar": "اختر الصيغة الصحيحة.",
    "prompt": "Were the evidence more robust, the claim ___ be defensible.",
    "q_ar": "لو كانت الأدلة أقوى، ___ أن يكون الادعاء قابلًا للدفاع عنه.",
    "options": [
      "might",
      "must have",
      "has to",
      "would have been to"
    ],
    "answer": 0,
    "why_en": "Might expresses a possible result in this hypothetical condition.",
    "why_ar": "تعبر might عن نتيجة محتملة في هذا الافتراض.",
    "arabic_hint": "تعبر might عن نتيجة محتملة في هذا الافتراض."
  }
];
