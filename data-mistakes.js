/* Arab Learner Traps: separate, editable lesson data. */
const MISTAKE_QUESTIONS = [
  {
    "id": "be01",
    "level": "A1",
    "trap": "am-is-are",
    "sub": "Choose the correct sentence.",
    "prompt": "She ___ very tall.",
    "options": [
      "am",
      "is",
      "are",
      "be"
    ],
    "answer": 1,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "في العربية نقول «هي طويلة» دون فعل ظاهر بمعنى be، لكن الإنجليزية تحتاج إلى is."
  },
  {
    "id": "be02",
    "level": "A1",
    "trap": "am-is-are",
    "sub": "Complete the sentence.",
    "prompt": "I ___ ready for the lesson.",
    "options": [
      "is",
      "are",
      "am",
      "be"
    ],
    "answer": 2,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "قد يترجم المتعلم الجملة مباشرة وينسى أن am تأتي مع I."
  },
  {
    "id": "be03",
    "level": "A2",
    "trap": "am-is-are",
    "sub": "Choose the correct form.",
    "prompt": "He ___ to work by bus every day.",
    "options": [
      "go",
      "goes",
      "is go",
      "going"
    ],
    "answer": 1,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "قد يخلط المتعلم بين فعل be والفعل الأساسي، فيقول He is go."
  },
  {
    "id": "be04",
    "level": "A2",
    "trap": "am-is-are",
    "sub": "Complete the sentence.",
    "prompt": "They ___ at home right now.",
    "options": [
      "is",
      "am",
      "are",
      "be"
    ],
    "answer": 2,
    "why_en": "English needs a form of be with adjectives and uses am/is/are according to the subject. Do not put be before an ordinary present-simple verb.",
    "why_ar": "الإنجليزية تحتاج إلى فعل be مع الصفات، ويجب أن يتوافق am/is/are مع الفاعل. لا نضع be قبل الفعل العادي في المضارع البسيط.",
    "arabic_hint": "انتبه إلى توافق فعل be مع الضمير الجمع they."
  },
  {
    "id": "be05",
    "level": "B1",
    "trap": "am-is-are",
    "sub": "Which sentence is correct?",
    "prompt": "My brother ___ not interested in football.",
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
    "prompt": "___ you familiar with this process?",
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
    "prompt": "The results ___ consistent with the initial estimate.",
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
    "prompt": "Neither explanation ___ entirely convincing.",
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
    "prompt": "My birthday is ___ May.",
    "options": [
      "at",
      "on",
      "in",
      "to"
    ],
    "answer": 2,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "في العربية نقول «في مايو»، لكن الإنجليزية تستخدم in مع الأشهر."
  },
  {
    "id": "pr02",
    "level": "A1",
    "trap": "in-on-at",
    "sub": "Complete the sentence.",
    "prompt": "The class starts ___ 8:30.",
    "options": [
      "in",
      "on",
      "at",
      "by"
    ],
    "answer": 2,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "مع وقت محدد على الساعة نستخدم at."
  },
  {
    "id": "pr03",
    "level": "A2",
    "trap": "in-on-at",
    "sub": "Choose the natural sentence.",
    "prompt": "We have a meeting ___ Monday.",
    "options": [
      "in",
      "at",
      "on",
      "for"
    ],
    "answer": 2,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "لا تترجم حرف الجر العربي «في» دائمًا إلى in؛ مع الأيام نستخدم on."
  },
  {
    "id": "pr04",
    "level": "A2",
    "trap": "in-on-at",
    "sub": "Choose the correct option.",
    "prompt": "She lives ___ Algiers.",
    "options": [
      "at",
      "in",
      "on",
      "to"
    ],
    "answer": 1,
    "why_en": "English prepositions are often fixed by the time expression, place, or idiom. Learn the whole phrase rather than translating the Arabic preposition literally.",
    "why_ar": "حروف الجر الإنجليزية ترتبط غالبًا بنوع الوقت أو المكان أو التعبير الثابت. تعلّم العبارة كاملة بدل ترجمة حرف الجر العربي حرفيًا.",
    "arabic_hint": "نستخدم in مع المدن والدول، وليس at."
  },
  {
    "id": "pr05",
    "level": "B1",
    "trap": "in-on-at",
    "sub": "Complete the expression.",
    "prompt": "I’m good ___ solving practical problems.",
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
    "prompt": "The report was submitted ___ time, before the deadline.",
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
    "prompt": "The policy came ___ effect at the start of the year.",
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
    "prompt": "Her argument is ___ odds with the available evidence.",
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
    "prompt": "She bought a ___ bag.",
    "options": [
      "leather small",
      "small leather",
      "leather small new",
      "small new leather"
    ],
    "answer": 1,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "في الإنجليزية يأتي الحجم عادةً قبل المادة: small leather bag."
  },
  {
    "id": "ad02",
    "level": "A1",
    "trap": "adjective-order",
    "sub": "Choose the correct phrase.",
    "prompt": "He drives a ___ car.",
    "options": [
      "red fast",
      "fast red",
      "car fast red",
      "red car fast"
    ],
    "answer": 1,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "غالبًا تأتي صفة الجودة قبل اللون: fast red car."
  },
  {
    "id": "ad03",
    "level": "A2",
    "trap": "adjective-order",
    "sub": "Which sounds most natural?",
    "prompt": "They live in a ___ house.",
    "options": [
      "wooden beautiful old",
      "old beautiful wooden",
      "beautiful old wooden",
      "wooden old beautiful"
    ],
    "answer": 2,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "الترتيب الشائع هنا: الرأي ثم العمر ثم المادة."
  },
  {
    "id": "ad04",
    "level": "A2",
    "trap": "adjective-order",
    "sub": "Complete the phrase.",
    "prompt": "We stayed in a ___ hotel.",
    "options": [
      "comfortable modern Italian",
      "Italian comfortable modern",
      "modern Italian comfortable",
      "comfortable Italian modern"
    ],
    "answer": 0,
    "why_en": "English adjectives usually follow a familiar order before the noun, such as opinion, size or age, then color, origin, or material.",
    "why_ar": "للصفات في الإنجليزية ترتيب مألوف قبل الاسم، مثل الرأي ثم الحجم أو العمر ثم اللون أو الأصل أو المادة.",
    "arabic_hint": "الترتيب المعتاد: الجودة ثم النمط/العمر ثم الأصل."
  },
  {
    "id": "ad05",
    "level": "B1",
    "trap": "adjective-order",
    "sub": "Choose the best phrase for a report.",
    "prompt": "The team developed an ___ system.",
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
    "prompt": "It was an ___ decision.",
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
    "prompt": "They proposed a ___ framework.",
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
    "prompt": "The study offers a ___ account of the dispute.",
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
    "prompt": "I ___ my homework yesterday.",
    "options": [
      "have finished",
      "finished",
      "have finish",
      "finishing"
    ],
    "answer": 1,
    "why_en": "Choose the tense by looking at the time expression and its link to the present. Finished past times usually take the past simple; experiences or unfinished periods often use the present perfect.",
    "why_ar": "اختر الزمن بحسب مؤشر الوقت وعلاقته بالحاضر. الوقت الماضي المنتهي يأخذ غالبًا الماضي البسيط، أما التجارب أو الفترات المستمرة فقد تحتاج إلى المضارع التام.",
    "arabic_hint": "Yesterday وقت منتهٍ، لذلك نستخدم الماضي البسيط finished."
  },
  {
    "id": "te02",
    "level": "A2",
    "trap": "present-perfect-vs-past",
    "sub": "Complete the sentence.",
    "prompt": "She ___ in this town since 2021.",
    "options": [
      "lived",
      "has lived",
      "is live",
      "have lived"
    ],
    "answer": 1,
    "why_en": "Choose the tense by looking at the time expression and its link to the present. Finished past times usually take the past simple; experiences or unfinished periods often use the present perfect.",
    "why_ar": "اختر الزمن بحسب مؤشر الوقت وعلاقته بالحاضر. الوقت الماضي المنتهي يأخذ غالبًا الماضي البسيط، أما التجارب أو الفترات المستمرة فقد تحتاج إلى المضارع التام.",
    "arabic_hint": "Since تشير إلى نقطة بداية، والحالة مستمرة حتى الآن؛ نستخدم has lived."
  },
  {
    "id": "te03",
    "level": "A2",
    "trap": "present-perfect-vs-past",
    "sub": "Use “have been” to describe experience without a finished past time.",
    "prompt": "Choose the correct sentence about life experience.",
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
    "prompt": "I can’t open the file. I ___ my password.",
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
    "prompt": "We ___ the museum last weekend.",
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
    "prompt": "By the time I arrived, the meeting ___.",
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
    "prompt": "This is the first time I ___ such a detailed analysis.",
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
    "prompt": "The committee ___ three revisions so far, and it may request another.",
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
    "prompt": "Can you give me some ___?",
    "options": [
      "advices",
      "advice",
      "an advice",
      "advise"
    ],
    "answer": 1,
    "why_en": "Some English nouns are uncountable even when Arabic uses a plural form. They usually do not take a/an or a plural -s; use a unit phrase when counting them.",
    "why_ar": "بعض الأسماء غير معدودة في الإنجليزية حتى لو كان مقابلها العربي جمعًا. لا نضيف إليها s ولا نستخدم a/an معها عادةً؛ استخدم وحدة قياس عند العد.",
    "arabic_hint": "Advice اسم غير معدود؛ نقول some advice أو a piece of advice."
  },
  {
    "id": "un02",
    "level": "A1",
    "trap": "countable-uncountable",
    "sub": "Complete the sentence.",
    "prompt": "I need some ___ about the bus schedule.",
    "options": [
      "informations",
      "information",
      "an information",
      "inform"
    ],
    "answer": 1,
    "why_en": "Some English nouns are uncountable even when Arabic uses a plural form. They usually do not take a/an or a plural -s; use a unit phrase when counting them.",
    "why_ar": "بعض الأسماء غير معدودة في الإنجليزية حتى لو كان مقابلها العربي جمعًا. لا نضيف إليها s ولا نستخدم a/an معها عادةً؛ استخدم وحدة قياس عند العد.",
    "arabic_hint": "Information غير معدود، رغم أن العربية تقول «معلومات»."
  },
  {
    "id": "un03",
    "level": "A2",
    "trap": "countable-uncountable",
    "sub": "Choose the correct phrase.",
    "prompt": "There are ___ on the table.",
    "options": [
      "three bread",
      "three breads",
      "three slices of bread",
      "three slice of bread"
    ],
    "answer": 2,
    "why_en": "Some English nouns are uncountable even when Arabic uses a plural form. They usually do not take a/an or a plural -s; use a unit phrase when counting them.",
    "why_ar": "بعض الأسماء غير معدودة في الإنجليزية حتى لو كان مقابلها العربي جمعًا. لا نضيف إليها s ولا نستخدم a/an معها عادةً؛ استخدم وحدة قياس عند العد.",
    "arabic_hint": "نعدّ bread بوحدات مثل slices أو loaves."
  },
  {
    "id": "un04",
    "level": "A2",
    "trap": "countable-uncountable",
    "sub": "Choose the natural sentence.",
    "prompt": "The equipment ___ very expensive.",
    "options": [
      "are",
      "is",
      "were",
      "have"
    ],
    "answer": 1,
    "why_en": "Some English nouns are uncountable even when Arabic uses a plural form. They usually do not take a/an or a plural -s; use a unit phrase when counting them.",
    "why_ar": "بعض الأسماء غير معدودة في الإنجليزية حتى لو كان مقابلها العربي جمعًا. لا نضيف إليها s ولا نستخدم a/an معها عادةً؛ استخدم وحدة قياس عند العد.",
    "arabic_hint": "Equipment اسم غير معدود ويأخذ فعلًا مفردًا."
  },
  {
    "id": "un05",
    "level": "B1",
    "trap": "countable-uncountable",
    "sub": "Complete the sentence.",
    "prompt": "We received ___ useful feedback after the presentation.",
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
    "prompt": "The research ___ that the method is reliable.",
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
    "prompt": "The company has made considerable ___ in efficiency.",
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
    "prompt": "The evidence ___ insufficient to support the claim.",
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
    "prompt": "I ___ with you.",
    "options": [
      "am agree",
      "agree",
      "agreeing",
      "does agree"
    ],
    "answer": 1,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "في العربية نقول «أنا موافق»، لكن agree فعل، لذلك نقول I agree لا I am agree."
  },
  {
    "id": "vb02",
    "level": "A2",
    "trap": "verb-patterns",
    "sub": "Complete the expression.",
    "prompt": "It depends ___ the weather.",
    "options": [
      "of",
      "from",
      "on",
      "at"
    ],
    "answer": 2,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "التعبير الصحيح هو depend on، ولا يُختار حرف الجر بالترجمة الحرفية."
  },
  {
    "id": "vb03",
    "level": "A2",
    "trap": "verb-patterns",
    "sub": "Choose the correct sentence.",
    "prompt": "She is married ___ a doctor.",
    "options": [
      "with",
      "to",
      "by",
      "from"
    ],
    "answer": 1,
    "why_en": "English verbs have their own patterns and prepositions. A direct translation from Arabic can sound unnatural, so learn the verb together with what follows it.",
    "why_ar": "لكل فعل إنجليزي نمطه وحرف الجر الذي يأتي معه. الترجمة الحرفية من العربية قد تنتج جملة غير طبيعية، لذا تعلّم الفعل مع التركيب الذي يليه.",
    "arabic_hint": "التعبير الصحيح هو married to someone، رغم اختلاف حرف الجر عن العربية."
  },
  {
    "id": "vb04",
    "level": "B1",
    "trap": "verb-patterns",
    "sub": "Choose the natural sentence.",
    "prompt": "He suggested ___ the train instead.",
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
    "prompt": "We discussed ___ the deadline.",
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
    "prompt": "I look forward to ___ from you.",
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
    "prompt": "The outcome depends ___ whether funding is approved.",
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
    "prompt": "The chair insisted that every member ___ present.",
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
  }
];
