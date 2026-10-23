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
  },
  {
    "id": "trap-a1-extra-01",
    "level": "A1",
    "trap": "articles",
    "sub": "Choose the correct sentence.",
    "prompt": "I have ___ umbrella.",
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
    "prompt": "My parents ___ at home.",
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
    "prompt": "There isn't ___ milk in the fridge.",
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
    "prompt": "They ___ home an hour ago.",
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
    "prompt": "He apologized ___ being late.",
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
    "prompt": "If I ___ more time, I would learn Japanese.",
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
    "prompt": "We need to take ___ account the cost of travel.",
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
    "prompt": "He denied ___ the confidential file.",
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
    "prompt": "Only after the review ___ the error discovered.",
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
    "prompt": "They recommended that the proposal ___ revised.",
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
    "prompt": "Rarely ___ such a compelling argument.",
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
    "prompt": "The conclusion is predicated ___ several assumptions.",
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
  {"id":"trap-a1-bank-03","level":"A1","trap":"articles","sub":"Choose the correct article.","prompt":"She has ___ apple.","options":["a","an","the","—"],"answer":1,"why_en":"Use an before a vowel sound.","why_ar":"نستخدم an قبل صوت علة.","arabic_hint":"نستخدم an قبل صوت علة."},
  {"id":"trap-a1-bank-04","level":"A1","trap":"be-verbs","sub":"Choose the correct form.","prompt":"I ___ ready now.","options":["is","are","am","be"],"answer":2,"why_en":"Use am with I.","why_ar":"نستخدم am مع I.","arabic_hint":"نستخدم am مع I."},
  {"id":"trap-a1-bank-05","level":"A1","trap":"present-simple","sub":"Choose the correct verb.","prompt":"He ___ TV every evening.","options":["watch","watches","watching","watched"],"answer":1,"why_en":"Third-person singular takes -es here.","why_ar":"نضيف es مع الغائب المفرد هنا.","arabic_hint":"نضيف es مع الغائب المفرد هنا."},
  {"id":"trap-a1-bank-06","level":"A1","trap":"pronouns","sub":"Choose the correct pronoun.","prompt":"Sara is my friend. ___ is kind.","options":["He","They","It","She"],"answer":3,"why_en":"Use she for a female person.","why_ar":"نستخدم she للإشارة إلى فتاة أو امرأة.","arabic_hint":"نستخدم she للإشارة إلى فتاة أو امرأة."},
  {"id":"trap-a1-bank-07","level":"A1","trap":"plurals","sub":"Choose the plural form.","prompt":"I have three ___.","options":["box","boxs","boxes","boxies"],"answer":2,"why_en":"Nouns ending in x usually take -es.","why_ar":"الأسماء المنتهية بـ x تأخذ غالبًا es في الجمع.","arabic_hint":"الأسماء المنتهية بـ x تأخذ غالبًا es في الجمع."},
  {"id":"trap-a1-bank-08","level":"A1","trap":"can","sub":"Choose the correct form.","prompt":"My brother can ___ fast.","options":["runs","running","run","ran"],"answer":2,"why_en":"After can, use the base form.","why_ar":"بعد can نستخدم الفعل الأساسي.","arabic_hint":"بعد can نستخدم الفعل الأساسي."},
  {"id":"trap-a1-bank-09","level":"A1","trap":"word-order","sub":"Choose the correct question.","prompt":"___ you like music?","options":["Are","Do","Does","Is"],"answer":1,"why_en":"Use do with you in present-simple questions.","why_ar":"نستخدم do في السؤال مع you في المضارع البسيط.","arabic_hint":"نستخدم do في السؤال مع you في المضارع البسيط."},
  {"id":"trap-a1-bank-10","level":"A1","trap":"possessives","sub":"Choose the correct word.","prompt":"This is ___ book; I own it.","options":["me","my","mine is","I"],"answer":1,"why_en":"Use my before a noun.","why_ar":"نستخدم my قبل الاسم.","arabic_hint":"نستخدم my قبل الاسم."},
  {"id":"trap-a2-bank-03","level":"A2","trap":"past-simple","sub":"Choose the correct form.","prompt":"We ___ our grandparents yesterday.","options":["visit","visited","have visit","visiting"],"answer":1,"why_en":"Yesterday normally takes the past simple.","why_ar":"نستخدم الماضي البسيط مع yesterday.","arabic_hint":"نستخدم الماضي البسيط مع yesterday."},
  {"id":"trap-a2-bank-04","level":"A2","trap":"countability","sub":"Choose the correct word.","prompt":"How ___ apples do you need?","options":["much","many","any","little"],"answer":1,"why_en":"Use many with countable plural nouns.","why_ar":"نستخدم many مع الأسماء المعدودة بالجمع.","arabic_hint":"نستخدم many مع الأسماء المعدودة بالجمع."},
  {"id":"trap-a2-bank-05","level":"A2","trap":"comparatives","sub":"Choose the correct form.","prompt":"This road is ___ than that one.","options":["more narrow","narrower","most narrow","narrow"],"answer":1,"why_en":"Short adjectives usually take -er in comparisons.","why_ar":"غالبًا نضيف er للصفة القصيرة في المقارنة.","arabic_hint":"غالبًا نضيف er للصفة القصيرة في المقارنة."},
  {"id":"trap-a2-bank-06","level":"A2","trap":"prepositions","sub":"Choose the correct preposition.","prompt":"The meeting starts ___ nine.","options":["in","on","at","by"],"answer":2,"why_en":"Use at with clock times.","why_ar":"نستخدم at مع أوقات الساعة.","arabic_hint":"نستخدم at مع أوقات الساعة."},
  {"id":"trap-a2-bank-07","level":"A2","trap":"present-perfect","sub":"Choose the correct form.","prompt":"I have never ___ sushi.","options":["eat","ate","eaten","eating"],"answer":2,"why_en":"Present perfect uses have/has + past participle.","why_ar":"يتكون المضارع التام من have/has والتصريف الثالث.","arabic_hint":"يتكون المضارع التام من have/has والتصريف الثالث."},
  {"id":"trap-a2-bank-08","level":"A2","trap":"infinitives","sub":"Choose the correct form.","prompt":"She wants ___ a doctor.","options":["be","being","to be","is"],"answer":2,"why_en":"Want is followed by to + base verb.","why_ar":"يأتي بعد want المصدر مع to.","arabic_hint":"يأتي بعد want المصدر مع to."},
  {"id":"trap-b1-bank-03","level":"B1","trap":"verb-patterns","sub":"Choose the correct form.","prompt":"They avoided ___ about the problem.","options":["to talk","talk","talking","talked"],"answer":2,"why_en":"Avoid is followed by an -ing form.","why_ar":"يأتي بعد avoid فعل ing.","arabic_hint":"يأتي بعد avoid فعل ing."},
  {"id":"trap-b1-bank-04","level":"B1","trap":"conditionals","sub":"Choose the correct form.","prompt":"If I were you, I ___ apologise.","options":["will","would","am","have"],"answer":1,"why_en":"The second conditional uses would in the result clause.","why_ar":"يستخدم الشرط الثاني would في جملة النتيجة.","arabic_hint":"يستخدم الشرط الثاني would في جملة النتيجة."},
  {"id":"trap-b1-bank-05","level":"B1","trap":"reported-speech","sub":"Choose the correct form.","prompt":"He asked me where I ___.","options":["live","did I live","lived","do live"],"answer":2,"why_en":"Reported questions use statement word order and often backshift.","why_ar":"تستخدم الأسئلة المنقولة ترتيب الجملة الخبرية وغالبًا تحويل الزمن.","arabic_hint":"تستخدم الأسئلة المنقولة ترتيب الجملة الخبرية وغالبًا تحويل الزمن."},
  {"id":"trap-b1-bank-06","level":"B1","trap":"since-for","sub":"Choose the correct preposition.","prompt":"I've worked here ___ 2021.","options":["for","since","during","from"],"answer":1,"why_en":"Use since with a starting point.","why_ar":"نستخدم since مع نقطة البداية.","arabic_hint":"نستخدم since مع نقطة البداية."},
  {"id":"trap-b1-bank-07","level":"B1","trap":"gerunds","sub":"Choose the correct form.","prompt":"She is interested in ___ abroad.","options":["study","to study","studying","studied"],"answer":2,"why_en":"A preposition is followed by a noun or -ing form.","why_ar":"يأتي بعد حرف الجر اسم أو فعل ing.","arabic_hint":"يأتي بعد حرف الجر اسم أو فعل ing."},
  {"id":"trap-b1-bank-08","level":"B1","trap":"articles","sub":"Choose the correct article.","prompt":"He hopes to become ___ engineer.","options":["a","an","the","—"],"answer":1,"why_en":"Engineer begins with a vowel sound.","why_ar":"تبدأ engineer بصوت علة، لذا نستخدم an.","arabic_hint":"تبدأ engineer بصوت علة، لذا نستخدم an."},
  {"id":"trap-b1-bank-09","level":"B1","trap":"adjectives","sub":"Choose the correct word.","prompt":"The long journey was ___.","options":["tired","tiring","tire","tires"],"answer":1,"why_en":"Use -ing to describe something that causes a feeling.","why_ar":"نستخدم ing لوصف الشيء الذي يسبب الشعور.","arabic_hint":"نستخدم ing لوصف الشيء الذي يسبب الشعور."},
  {"id":"trap-b1-bank-10","level":"B1","trap":"modals","sub":"Choose the correct form.","prompt":"You ___ wear a seat belt; it is the law.","options":["might","must","would","could have"],"answer":1,"why_en":"Must expresses strong obligation.","why_ar":"تعبر must عن الإلزام القوي.","arabic_hint":"تعبر must عن الإلزام القوي."},
  {"id":"trap-b1-bank-11","level":"B1","trap":"relative-clauses","sub":"Choose the correct relative pronoun.","prompt":"The woman ___ called you is my aunt.","options":["which","whose","who","where"],"answer":2,"why_en":"Use who for a person as the subject.","why_ar":"نستخدم who للشخص عندما يكون فاعلًا.","arabic_hint":"نستخدم who للشخص عندما يكون فاعلًا."},
  {"id":"trap-b1-bank-12","level":"B1","trap":"collocations","sub":"Choose the correct phrase.","prompt":"Please ___ attention to the instructions.","options":["do","make","pay","give"],"answer":2,"why_en":"The standard collocation is pay attention.","why_ar":"التركيب الصحيح pay attention.","arabic_hint":"التركيب الصحيح pay attention."},
  {"id":"trap-b2-bank-03","level":"B2","trap":"inversion","sub":"Choose the correct sentence.","prompt":"Not until midnight ___ home.","options":["they returned","did they return","they did returned","returned they"],"answer":1,"why_en":"Not until at the beginning triggers inversion.","why_ar":"بدء الجملة بـ Not until يستلزم القلب.","arabic_hint":"بدء الجملة بـ Not until يستلزم القلب."},
  {"id":"trap-b2-bank-04","level":"B2","trap":"verb-patterns","sub":"Choose the correct form.","prompt":"He admitted ___ the mistake.","options":["to make","make","making","made"],"answer":2,"why_en":"Admit is followed by an -ing form.","why_ar":"يأتي بعد admit فعل ing.","arabic_hint":"يأتي بعد admit فعل ing."},
  {"id":"trap-b2-bank-05","level":"B2","trap":"prepositions","sub":"Choose the correct preposition.","prompt":"The new policy is consistent ___ our values.","options":["to","with","for","at"],"answer":1,"why_en":"The standard phrase is consistent with.","why_ar":"التركيب الصحيح consistent with.","arabic_hint":"التركيب الصحيح consistent with."},
  {"id":"trap-b2-bank-06","level":"B2","trap":"wish","sub":"Choose the correct form.","prompt":"I wish I ___ more time yesterday.","options":["have","had","had had","would have"],"answer":2,"why_en":"For regret about a past situation, use wish + past perfect.","why_ar":"للندم على الماضي نستخدم wish مع الماضي التام.","arabic_hint":"للندم على الماضي نستخدم wish مع الماضي التام."},
  {"id":"trap-b2-bank-07","level":"B2","trap":"articles","sub":"Choose the correct article.","prompt":"She plays ___ piano beautifully.","options":["a","an","the","—"],"answer":2,"why_en":"Musical instruments commonly take the in this construction.","why_ar":"تأتي the غالبًا مع الآلات الموسيقية بهذا التركيب.","arabic_hint":"تأتي the غالبًا مع الآلات الموسيقية بهذا التركيب."},
  {"id":"trap-b2-bank-08","level":"B2","trap":"causative","sub":"Choose the correct form.","prompt":"I had my laptop ___ yesterday.","options":["repair","repaired","repairing","to repair"],"answer":1,"why_en":"Have something done uses have + object + past participle.","why_ar":"يتكون causative من have ثم المفعول والتصريف الثالث.","arabic_hint":"يتكون causative من have ثم المفعول والتصريف الثالث."},
  {"id":"trap-b2-bank-09","level":"B2","trap":"linking-words","sub":"Choose the best connector.","prompt":"___ the heavy rain, the match continued.","options":["Although","Despite","However","Because"],"answer":1,"why_en":"Despite is followed by a noun phrase, not a full clause.","why_ar":"يأتي بعد despite تركيب اسمي لا جملة كاملة.","arabic_hint":"يأتي بعد despite تركيب اسمي لا جملة كاملة."},
  {"id":"trap-b2-bank-10","level":"B2","trap":"reported-speech","sub":"Choose the correct form.","prompt":"She denied ___ the confidential email.","options":["to send","sending","send","sent"],"answer":1,"why_en":"Deny is followed by an -ing form.","why_ar":"يأتي بعد deny فعل ing.","arabic_hint":"يأتي بعد deny فعل ing."},
  {"id":"trap-b2-bank-11","level":"B2","trap":"quantifiers","sub":"Choose the correct phrase.","prompt":"There is ___ chance of success without more data.","options":["few","little","many","several"],"answer":1,"why_en":"Chance is countable, but “little chance” is a fixed expression meaning a low probability.","why_ar":"تعبير little chance يعني احتمالًا ضعيفًا.","arabic_hint":"تعبير little chance يعني احتمالًا ضعيفًا."},
  {"id":"trap-b2-bank-12","level":"B2","trap":"collocations","sub":"Choose the correct verb.","prompt":"The findings ___ light on the cause.","options":["put","shed","set","casted"],"answer":1,"why_en":"The standard phrase is shed light on.","why_ar":"التعبير الصحيح shed light on.","arabic_hint":"التعبير الصحيح shed light on."},
  {"id":"trap-b2-bank-13","level":"B2","trap":"conditionals","sub":"Choose the correct form.","prompt":"Had we left earlier, we ___ the traffic.","options":["would avoid","would have avoided","will avoid","avoided"],"answer":1,"why_en":"A third conditional result uses would have + past participle.","why_ar":"تستخدم نتيجة الشرط الثالث would have والتصريف الثالث.","arabic_hint":"تستخدم نتيجة الشرط الثالث would have والتصريف الثالث."},
  {"id":"trap-b2-bank-14","level":"B2","trap":"adverbs","sub":"Choose the correct form.","prompt":"The instructions were ___ clear.","options":["remarkable","remarkably","remarking","remark"],"answer":1,"why_en":"An adverb modifies the adjective clear.","why_ar":"نستخدم الظرف لتعديل الصفة clear.","arabic_hint":"نستخدم الظرف لتعديل الصفة clear."},
  {"id":"trap-c1-bank-03","level":"C1","trap":"subjunctive","sub":"Choose the formal construction.","prompt":"The chair requested that each member ___ present.","options":["is","be","was","to be"],"answer":1,"why_en":"Formal request clauses can use the base-form subjunctive.","why_ar":"يمكن استخدام الفعل الأساسي بعد request that في الأسلوب الرسمي.","arabic_hint":"يمكن استخدام الفعل الأساسي بعد request that في الأسلوب الرسمي."},
  {"id":"trap-c1-bank-04","level":"C1","trap":"inversion","sub":"Choose the correct form.","prompt":"Rarely ___ such a convincing explanation.","options":["we have heard","have we heard","we heard have","heard we"],"answer":1,"why_en":"A fronted negative adverb triggers inversion.","why_ar":"الظرف السلبي في البداية يستلزم القلب.","arabic_hint":"الظرف السلبي في البداية يستلزم القلب."},
  {"id":"trap-c1-bank-05","level":"C1","trap":"collocations","sub":"Choose the correct preposition.","prompt":"The decision is contingent ___ approval.","options":["of","on","for","with"],"answer":1,"why_en":"The formal collocation is contingent on.","why_ar":"التركيب الرسمي contingent on.","arabic_hint":"التركيب الرسمي contingent on."},
  {"id":"trap-c1-bank-06","level":"C1","trap":"verb-patterns","sub":"Choose the correct form.","prompt":"The report warrants ___ further.","options":["to examine","examining","being examined","examine"],"answer":2,"why_en":"Warrant can take a passive -ing form when the subject receives the action.","why_ar":"يمكن استخدام being examined عندما يقع الفعل على الموضوع.","arabic_hint":"يمكن استخدام being examined عندما يقع الفعل على الموضوع."},
  {"id":"trap-c1-bank-07","level":"C1","trap":"concession","sub":"Choose the best connector.","prompt":"Much ___ I respect her, I disagree with this conclusion.","options":["as","although","despite","however"],"answer":0,"why_en":"Much as introduces a concessive clause.","why_ar":"تستخدم Much as لتقديم جملة تفيد التنازل أو الاعتراف.","arabic_hint":"تستخدم Much as لتقديم جملة تفيد التنازل أو الاعتراف."},
  {"id":"trap-c1-bank-08","level":"C1","trap":"relative-clauses","sub":"Choose the correct word.","prompt":"The proposal, ___ merits remain disputed, was approved.","options":["which","whose","who","where"],"answer":1,"why_en":"Whose can refer to the proposal's merits.","why_ar":"يمكن استخدام whose للدلالة على merits الخاصة بالمقترح.","arabic_hint":"يمكن استخدام whose للدلالة على merits الخاصة بالمقترح."},
  {"id":"trap-c1-bank-09","level":"C1","trap":"formal-grammar","sub":"Choose the correct form.","prompt":"It is imperative that the files ___ securely stored.","options":["are","be","will be","being"],"answer":1,"why_en":"Imperative that commonly takes the subjunctive base form.","why_ar":"يأتي الفعل الأساسي بعد imperative that في الأسلوب الرسمي.","arabic_hint":"يأتي الفعل الأساسي بعد imperative that في الأسلوب الرسمي."},
  {"id":"trap-c1-bank-10","level":"C1","trap":"prepositions","sub":"Choose the correct preposition.","prompt":"Her account is at variance ___ the official record.","options":["to","with","for","by"],"answer":1,"why_en":"The fixed phrase is at variance with.","why_ar":"التعبير الثابت at variance with.","arabic_hint":"التعبير الثابت at variance with."},
  {"id":"trap-c1-bank-11","level":"C1","trap":"inversion","sub":"Choose the correct form.","prompt":"Only after the audit ___ the discrepancy discovered.","options":["the team did","did the team","the team had","the team was"],"answer":1,"why_en":"Only after at the beginning triggers inversion in the main clause.","why_ar":"تقديم Only after يستلزم القلب في الجملة الرئيسية.","arabic_hint":"تقديم Only after يستلزم القلب في الجملة الرئيسية."},
  {"id":"trap-c1-bank-12","level":"C1","trap":"hedging","sub":"Choose the most cautious wording.","prompt":"The evidence ___ suggest a correlation, but it is not conclusive.","options":["may","must","does","will"],"answer":0,"why_en":"May signals a possibility rather than certainty.","why_ar":"تعبر may عن احتمال لا عن يقين.","arabic_hint":"تعبر may عن احتمال لا عن يقين."},
  {"id":"trap-c1-bank-13","level":"C1","trap":"word-choice","sub":"Choose the correct word.","prompt":"The new rule may ___ existing inequalities.","options":["exacerbate","exasperate","exaggerate","exempt"],"answer":0,"why_en":"Exacerbate means to make a problem worse.","why_ar":"Exacerbate تعني تفاقم المشكلة.","arabic_hint":"Exacerbate تعني تفاقم المشكلة."},
  {"id":"trap-c1-bank-14","level":"C1","trap":"collocations","sub":"Choose the correct preposition.","prompt":"The findings lend credence ___ the hypothesis.","options":["for","to","with","at"],"answer":1,"why_en":"The phrase is lend credence to.","why_ar":"التعبير الصحيح lend credence to.","arabic_hint":"التعبير الصحيح lend credence to."},
  {"id":"trap-c2-bank-03","level":"C2","trap":"inversion","sub":"Choose the correct form.","prompt":"Under no circumstances ___ the original data be altered.","options":["the researchers should","should the researchers","the researchers would","would the researchers to"],"answer":1,"why_en":"A negative fronted phrase triggers inversion.","why_ar":"العبارة السلبية في البداية تستلزم القلب.","arabic_hint":"العبارة السلبية في البداية تستلزم القلب."},
  {"id":"trap-c2-bank-04","level":"C2","trap":"formal-collocations","sub":"Choose the correct preposition.","prompt":"The argument is predicated ___ an untested assumption.","options":["in","on","at","for"],"answer":1,"why_en":"The formal collocation is predicated on.","why_ar":"التركيب الرسمي predicated on.","arabic_hint":"التركيب الرسمي predicated on."},
  {"id":"trap-c2-bank-05","level":"C2","trap":"subjunctive","sub":"Choose the formal construction.","prompt":"The statute requires that every applicant ___ the form in person.","options":["completes","complete","completed","to complete"],"answer":1,"why_en":"Require that can take the base-form subjunctive in formal English.","why_ar":"يمكن أن يأتي بعد require that الفعل بصيغته الأساسية.","arabic_hint":"يمكن أن يأتي بعد require that الفعل بصيغته الأساسية."},
  {"id":"trap-c2-bank-06","level":"C2","trap":"concession","sub":"Choose the correct construction.","prompt":"Be that ___ it may, the conclusion remains unsupported.","options":["as","so","what","which"],"answer":0,"why_en":"The fixed expression is be that as it may.","why_ar":"التعبير الثابت be that as it may.","arabic_hint":"التعبير الثابت be that as it may."},
  {"id":"trap-c2-bank-07","level":"C2","trap":"precision","sub":"Choose the closest meaning of “ostensible”.","prompt":["appearing to be true or real, though not necessarily so","proven beyond any doubt","completely irrelevant","impossible to observe"],"options":0,"answer":"Ostensible describes what appears to be the case.","why_en":"Ostensible تصف ما يبدو أنه صحيح دون ضمان ذلك."},
  {"id":"trap-c2-bank-08","level":"C2","trap":"formal-grammar","sub":"Choose the correct form.","prompt":"The evidence, together with the appendices, ___ been reviewed.","options":["have","has","were","are"],"answer":1,"why_en":"The head subject evidence is uncountable and takes has here.","why_ar":"الفاعل evidence غير معدود ويأخذ has هنا.","arabic_hint":"الفاعل evidence غير معدود ويأخذ has هنا."},
  {"id":"trap-c2-bank-09","level":"C2","trap":"collocations","sub":"Choose the correct phrase.","prompt":"The claim is difficult to reconcile ___ the available evidence.","options":["to","with","against","for"],"answer":1,"why_en":"The standard phrase is reconcile with.","why_ar":"التركيب الصحيح reconcile with.","arabic_hint":"التركيب الصحيح reconcile with."},
  {"id":"trap-c2-bank-10","level":"C2","trap":"inversion","sub":"Choose the correct form.","prompt":"Not once ___ the witness contradict the original statement.","options":["the witness did","did the witness","the witness has","has the witness did"],"answer":1,"why_en":"Not once at the beginning triggers inversion; did takes the base verb.","why_ar":"بدء الجملة بـ Not once يستلزم القلب، ويأتي بعد did الفعل الأساسي.","arabic_hint":"بدء الجملة بـ Not once يستلزم القلب، ويأتي بعد did الفعل الأساسي."},
  {"id":"trap-c2-bank-11","level":"C2","trap":"word-choice","sub":"Choose the best word.","prompt":"The distinction is ___; it changes the interpretation of the entire clause.","options":["material","materiel","maternal","mature"],"answer":0,"why_en":"Material means significant or relevant in this context.","why_ar":"Material تعني جوهريًا أو مؤثرًا في هذا السياق.","arabic_hint":"Material تعني جوهريًا أو مؤثرًا في هذا السياق."},
  {"id":"trap-c2-bank-12","level":"C2","trap":"formal-phrases","sub":"Choose the correct phrase.","prompt":"The distinction matters ___ the interpretation of the statute is concerned.","options":["insofar as","insofar","as far","so far as"],"answer":0,"why_en":"Insofar as means to the extent that or so far as.","why_ar":"Insofar as تعني بقدر ما أو من حيث إن.","arabic_hint":"احفظ التركيب insofar as كاملًا."},
  {"id":"trap-c2-bank-13","level":"C2","trap":"logic","sub":"Choose the correct word.","prompt":"The premises do not ___ entail the conclusion.","options":["necessarily","necessary","necessity","necessitated"],"answer":0,"why_en":"Necessarily is the adverb modifying entail.","why_ar":"Necessarily ظرف يصف الفعل entail.","arabic_hint":"Necessarily ظرف يصف الفعل entail."},
  {"id":"trap-c2-bank-14","level":"C2","trap":"formal-grammar","sub":"Choose the correct form.","prompt":"Were the evidence more robust, the claim ___ be defensible.","options":["might","must have","has to","would have been to"],"answer":0,"why_en":"Might expresses a possible result in this hypothetical condition.","why_ar":"تعبر might عن نتيجة محتملة في هذا الافتراض.","arabic_hint":"تعبر might عن نتيجة محتملة في هذا الافتراض."}
];
