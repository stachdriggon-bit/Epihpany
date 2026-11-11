/* Type It: independent lesson data. */
const TYPING_QUESTIONS = [
  {
    "id": "type-a1-01",
    "level": "A1",
    "prompt": "She ___ to school every day.",
    "q_ar": "هي ___ إلى المدرسة كل يوم.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "go",
    "accept": [
      "goes"
    ],
    "why_en": "With she, use the present-simple form ending in -s.",
    "why_ar": "مع she نضيف غالبًا s إلى الفعل في المضارع البسيط.",
    "answer": "goes"
  },
  {
    "id": "type-a1-02",
    "level": "A1",
    "prompt": "They ___ happy today.",
    "q_ar": "هم ___ سعداء اليوم.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "are"
    ],
    "why_en": "Use are with the subject they.",
    "why_ar": "نستخدم are مع الفاعل they.",
    "answer": "are"
  },
  {
    "id": "type-a1-03",
    "level": "A1",
    "prompt": "I ___ a student.",
    "q_ar": "أنا ___ طالبًا/طالبة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "am"
    ],
    "why_en": "Use am with the subject I.",
    "why_ar": "نستخدم am مع الفاعل I.",
    "answer": "am"
  },
  {
    "id": "type-a1-04",
    "level": "A1",
    "prompt": "He ___ football on Fridays.",
    "q_ar": "هو ___ كرة القدم أيام الجمعة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "play",
    "accept": [
      "plays"
    ],
    "why_en": "With he, use the present-simple form ending in -s.",
    "why_ar": "مع he نضيف غالبًا s إلى الفعل في المضارع البسيط.",
    "answer": "plays"
  },
  {
    "id": "type-a1-05",
    "level": "A1",
    "prompt": "We ___ in Algeria.",
    "q_ar": "نحن ___ في الجزائر.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "live",
    "accept": [
      "live"
    ],
    "why_en": "Use the base verb with we in the present simple.",
    "why_ar": "نستخدم الفعل بصيغته الأساسية مع we في المضارع البسيط.",
    "answer": "live"
  },
  {
    "id": "type-a1-06",
    "level": "A1",
    "prompt": "She has ___ orange.",
    "q_ar": "لديها ___ برتقالة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "a/an",
    "accept": [
      "an"
    ],
    "why_en": "Use an before a vowel sound, as in orange.",
    "why_ar": "نستخدم an قبل صوت علة، كما في orange.",
    "answer": "an"
  },
  {
    "id": "type-a1-07",
    "level": "A1",
    "prompt": "There ___ two cats outside.",
    "q_ar": "هناك ___ قطتان في الخارج.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "are"
    ],
    "why_en": "In there is/are, the verb agrees with the noun that follows; two cats is plural.",
    "why_ar": "في تركيب there is/are يتوافق الفعل مع الاسم الذي يليه؛ وtwo cats جمع، لذلك نستخدم are.",
    "answer": "are"
  },
  {
    "id": "type-a1-08",
    "level": "A1",
    "prompt": "My brother ___ 10 years old.",
    "q_ar": "أخي ___ عمره 10 سنوات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "is"
    ],
    "why_en": "Use is with the singular subject my brother.",
    "why_ar": "نستخدم is مع الفاعل المفرد my brother.",
    "answer": "is"
  },
  {
    "id": "type-a1-09",
    "level": "A1",
    "prompt": "I ___ coffee every morning.",
    "q_ar": "أنا ___ القهوة كل صباح.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "drink",
    "accept": [
      "drink"
    ],
    "why_en": "Use the base verb with I for a regular habit.",
    "why_ar": "نستخدم الفعل بصيغته الأساسية مع I للتعبير عن عادة.",
    "answer": "drink"
  },
  {
    "id": "type-a1-10",
    "level": "A1",
    "prompt": "He ___ not like tea.",
    "q_ar": "هو ___ لا يحب الشاي.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "do",
    "accept": [
      "does"
    ],
    "why_en": "Use does not with he; the main verb after does stays in its base form.",
    "why_ar": "نستخدم does not مع he، ويبقى الفعل الأساسي بعد does دون s.",
    "answer": "does"
  },
  {
    "id": "type-a2-01",
    "level": "A2",
    "prompt": "She has ___ here since May.",
    "q_ar": "هي تعيش هنا منذ شهر مايو.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "live",
    "accept": [
      "lived",
      "been living"
    ],
    "why_en": "Since May marks a period continuing to now; use the present perfect, and lived is the past participle.",
    "why_ar": "تشير since May إلى مدة بدأت في الماضي وما زالت مستمرة؛ نستخدم المضارع التام، وlived هو التصريف الثالث.",
    "answer": "lived"
  },
  {
    "id": "type-a2-02",
    "level": "A2",
    "prompt": "I ___ him yesterday.",
    "q_ar": "أنا ___ه أمس.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "see",
    "accept": [
      "saw"
    ],
    "why_en": "Yesterday is a finished past time, so use the past simple: saw.",
    "why_ar": "كلمة yesterday تشير إلى وقت ماضٍ منتهٍ، لذا نستخدم الماضي البسيط: saw.",
    "answer": "saw"
  },
  {
    "id": "type-a2-03",
    "level": "A2",
    "prompt": "They are interested ___ music.",
    "q_ar": "هم مهتمون ___ الموسيقى.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "in"
    ],
    "why_en": "The fixed expression is interested in.",
    "why_ar": "التركيب الثابت هو interested in.",
    "answer": "in"
  },
  {
    "id": "type-a2-04",
    "level": "A2",
    "prompt": "He doesn't ___ meat.",
    "q_ar": "هو لا ___ اللحم.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "eat",
    "accept": [
      "eat"
    ],
    "why_en": "After does not/doesn't, use the base form of the verb: eat.",
    "why_ar": "بعد does not أو doesn't نستخدم الفعل بصيغته الأساسية: eat.",
    "answer": "eat"
  },
  {
    "id": "type-a2-05",
    "level": "A2",
    "prompt": "We have already ___ lunch.",
    "q_ar": "لقد ___نا الغداء بالفعل.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "eat",
    "accept": [
      "eaten"
    ],
    "why_en": "The present perfect uses have/has + past participle; the past participle of eat is eaten.",
    "why_ar": "يتكون المضارع التام من have/has مع التصريف الثالث؛ والتصريف الثالث من eat هو eaten.",
    "answer": "eaten"
  },
  {
    "id": "type-a2-06",
    "level": "A2",
    "prompt": "This is ___ than mine.",
    "q_ar": "هذا ___ من خاصتي.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "good",
    "accept": [
      "better"
    ],
    "why_en": "Good has the irregular comparative form better.",
    "why_ar": "صيغة المقارنة من good غير منتظمة، وهي better.",
    "answer": "better"
  },
  {
    "id": "type-a2-07",
    "level": "A2",
    "prompt": "There isn't ___ milk left.",
    "q_ar": "لم يتبقَّ ___ من الحليب.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "much",
    "accept": [
      "much"
    ],
    "why_en": "Milk is uncountable, and much is common in negative sentences with uncountable nouns.",
    "why_ar": "كلمة milk اسم غير معدود، ونستخدم much غالبًا في الجمل المنفية مع الأسماء غير المعدودة.",
    "answer": "much"
  },
  {
    "id": "type-a2-08",
    "level": "A2",
    "prompt": "I look forward to ___ you.",
    "q_ar": "أتطلع إلى ___ بك.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "meet",
    "accept": [
      "meeting"
    ],
    "why_en": "In look forward to, to is a preposition, so it is followed by a noun or an -ing form.",
    "why_ar": "في look forward to، تكون to حرف جر، لذلك يأتي بعدها اسم أو فعل بصيغة ing.",
    "answer": "meeting"
  },
  {
    "id": "type-a2-09",
    "level": "A2",
    "prompt": "She ___ TV when I called.",
    "q_ar": "كانت هي ___ التلفاز عندما اتصلت.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "watch",
    "accept": [
      "was watching"
    ],
    "why_en": "The action was in progress when another past event happened, so use was + verb-ing.",
    "why_ar": "كان الفعل مستمرًا عند وقوع حدث آخر في الماضي، لذا نستخدم was مع الفعل المنتهي بـ ing.",
    "answer": "was watching"
  },
  {
    "id": "type-a2-10",
    "level": "A2",
    "prompt": "If it rains, we ___ home.",
    "q_ar": "إذا أمطرت، فسوف ___ في المنزل.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "stay",
    "accept": [
      "will stay"
    ],
    "why_en": "This is a first conditional: if + present simple, then will + base verb.",
    "why_ar": "هذا شرط من النوع الأول: if مع المضارع البسيط، ثم will مع الفعل بصيغته الأساسية.",
    "answer": "will stay"
  },
  {
    "id": "type-b1-01",
    "level": "B1",
    "prompt": "If I ___ more time, I'd learn Italian.",
    "q_ar": "لو كان لدي وقت أكثر، لتعلمت الإيطالية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "have",
    "accept": [
      "had"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "had"
  },
  {
    "id": "type-b1-02",
    "level": "B1",
    "prompt": "She has worked here ___ 2022.",
    "q_ar": "إنها تعمل هنا ___ عام 2022.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "since"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "since"
  },
  {
    "id": "type-b1-03",
    "level": "B1",
    "prompt": "The report ___ by the team yesterday.",
    "q_ar": "___ التقرير من قِبل الفريق أمس.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "write",
    "accept": [
      "was written"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "was written"
  },
  {
    "id": "type-b1-04",
    "level": "B1",
    "prompt": "I wish I ___ more confident.",
    "q_ar": "أتمنى لو أنني ___ أكثر ثقة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "were"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "were"
  },
  {
    "id": "type-b1-05",
    "level": "B1",
    "prompt": "He suggested ___ a taxi.",
    "q_ar": "اقترح هو ___ سيارة أجرة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "take",
    "accept": [
      "taking"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "taking"
  },
  {
    "id": "type-b1-06",
    "level": "B1",
    "prompt": "By the time we arrived, they ___ .",
    "q_ar": "بحلول وقت وصولنا، كانوا قد ___.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "leave",
    "accept": [
      "had left"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "had left"
  },
  {
    "id": "type-b1-07",
    "level": "B1",
    "prompt": "Neither answer ___ correct.",
    "q_ar": "لا ___ أيٌّ من الإجابتين صحيحًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "is"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "is"
  },
  {
    "id": "type-b1-08",
    "level": "B1",
    "prompt": "She asked me where I ___ .",
    "q_ar": "سألتني أين ___.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "live",
    "accept": [
      "lived"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "lived"
  },
  {
    "id": "type-b1-09",
    "level": "B1",
    "prompt": "I'm used to ___ early.",
    "q_ar": "أنا معتاد على ___ مبكرًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "wake up",
    "accept": [
      "waking up"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "waking up"
  },
  {
    "id": "type-b1-10",
    "level": "B1",
    "prompt": "The film was ___ than I expected.",
    "q_ar": "كان الفيلم ___ مما توقعت.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "interesting",
    "accept": [
      "more interesting"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "more interesting"
  },
  {
    "id": "type-b2-01",
    "level": "B2",
    "prompt": "Had I ___ earlier, I would have caught the train.",
    "q_ar": "لو أنني ___ في وقت أبكر، للحقت بالقطار.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "leave",
    "accept": [
      "left"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "left"
  },
  {
    "id": "type-b2-02",
    "level": "B2",
    "prompt": "The committee recommended that he ___ immediately.",
    "q_ar": "أوصت اللجنة بأن ___ فورًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "act",
    "accept": [
      "act"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "act"
  },
  {
    "id": "type-b2-03",
    "level": "B2",
    "prompt": "No sooner had she arrived ___ the phone rang.",
    "q_ar": "ما إن وصلت حتى رن الهاتف.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "connector",
    "accept": [
      "than"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "than"
  },
  {
    "id": "type-b2-04",
    "level": "B2",
    "prompt": "The findings are consistent ___ earlier research.",
    "q_ar": "تتوافق النتائج ___ الأبحاث السابقة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "with"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "with"
  },
  {
    "id": "type-b2-05",
    "level": "B2",
    "prompt": "Were it not for your help, I ___ failed.",
    "q_ar": "لولا مساعدتك، ___ قد فشلت.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "would",
    "accept": [
      "would have"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "would have"
  },
  {
    "id": "type-b2-06",
    "level": "B2",
    "prompt": "The device needs ___ before use.",
    "q_ar": "يحتاج الجهاز إلى ___ قبل الاستخدام.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "test",
    "accept": [
      "testing",
      "to be tested"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "testing"
  },
  {
    "id": "type-b2-07",
    "level": "B2",
    "prompt": "He denied ___ the document.",
    "q_ar": "أنكر هو ___ الوثيقة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "sign",
    "accept": [
      "signing"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "signing"
  },
  {
    "id": "type-b2-08",
    "level": "B2",
    "prompt": "The results, together with the appendix, ___ included.",
    "q_ar": "النتائج، إلى جانب الملحق، ___ مُدرجة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "are"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "are"
  },
  {
    "id": "type-b2-09",
    "level": "B2",
    "prompt": "She speaks as though she ___ everything.",
    "q_ar": "تتحدث كما لو أنها ___ كل شيء.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "know",
    "accept": [
      "knew"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "knew"
  },
  {
    "id": "type-b2-10",
    "level": "B2",
    "prompt": "The more you practise, the ___ you become.",
    "q_ar": "كلما تدربت أكثر، أصبحت ___.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "good",
    "accept": [
      "better"
    ],
    "why_en": "Use the form that fits the subject, tense, and structure of the sentence.",
    "why_ar": "اختر الصيغة التي تناسب الفاعل والزمن وتركيب الجملة.",
    "answer": "better"
  },
  {
    "id": "type-a1-11",
    "level": "A1",
    "prompt": "My sister ___ ten years old.",
    "q_ar": "أختي ___ عمرها عشر سنوات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "is"
    ],
    "why_en": "Use “is” with a singular third-person subject.",
    "why_ar": "نستخدم is مع فاعل مفرد غائب.",
    "answer": "is"
  },
  {
    "id": "type-a1-12",
    "level": "A1",
    "prompt": "We ___ English at school.",
    "q_ar": "نحن ___ الإنجليزية في المدرسة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "study",
    "accept": [
      "study"
    ],
    "why_en": "Use the base form with “we” in the present simple.",
    "why_ar": "نستخدم الفعل الأساسي مع we في المضارع البسيط.",
    "answer": "study"
  },
  {
    "id": "type-a2-11",
    "level": "A2",
    "prompt": "There isn’t ___ sugar in the jar.",
    "q_ar": "لا يوجد ___ من السكر في المرطبان.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "much / many",
    "accept": [
      "much"
    ],
    "why_en": "Sugar is uncountable, so “much” fits this negative sentence.",
    "why_ar": "Sugar اسم غير معدود، لذلك نستخدم much في الجملة المنفية.",
    "answer": "much"
  },
  {
    "id": "type-a2-12",
    "level": "A2",
    "prompt": "I have known her ___ five years.",
    "q_ar": "أعرفها ___ خمس سنوات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "for / since",
    "accept": [
      "for"
    ],
    "why_en": "Use “for” with a duration of time.",
    "why_ar": "نستخدم for مع مدة زمنية.",
    "answer": "for"
  },
  {
    "id": "type-b1-11",
    "level": "B1",
    "prompt": "If I had studied harder, I ___ the exam.",
    "q_ar": "لو كنت قد درست بجد أكثر، ___ الامتحان.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "pass",
    "accept": [
      "would have passed"
    ],
    "why_en": "The third conditional uses would have + past participle in the result clause.",
    "why_ar": "في الشرط الثالث نستخدم would have مع التصريف الثالث في النتيجة.",
    "answer": "would have passed"
  },
  {
    "id": "type-b1-12",
    "level": "B1",
    "prompt": "She suggested ___ a taxi.",
    "q_ar": "اقترحت هي ___ سيارة أجرة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "take",
    "accept": [
      "taking"
    ],
    "why_en": "Suggest can be followed by a gerund (-ing form).",
    "why_ar": "يمكن أن يتبع suggest فعل بصيغة ing.",
    "answer": "taking"
  },
  {
    "id": "type-b2-11",
    "level": "B2",
    "prompt": "No sooner had we sat down ___ the alarm rang.",
    "q_ar": "ما إن جلسنا حتى انطلق الإنذار.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "connector",
    "accept": [
      "than"
    ],
    "why_en": "The fixed construction is “no sooner … than”.",
    "why_ar": "التركيب الثابت هو no sooner … than.",
    "answer": "than"
  },
  {
    "id": "type-b2-12",
    "level": "B2",
    "prompt": "The report needs ___ before publication.",
    "q_ar": "يحتاج التقرير إلى ___ قبل النشر.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "revise",
    "accept": [
      "revising",
      "to be revised"
    ],
    "why_en": "“Need” can take an -ing form with passive meaning, or a passive infinitive.",
    "why_ar": "يمكن أن يأتي need مع ing بمعنى المبني للمجهول أو مع مصدر مبني للمجهول.",
    "answer": "revising"
  },
  {
    "id": "type-c1-01",
    "level": "C1",
    "prompt": "Not until the figures were verified ___ the report released.",
    "q_ar": "لم يُنشر التقرير إلا بعد التحقق من الأرقام.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "was"
    ],
    "why_en": "“Not until” at the beginning triggers inversion in the main clause.",
    "why_ar": "عند بدء الجملة بـ Not until يحدث القلب في الجملة الرئيسية.",
    "answer": "was"
  },
  {
    "id": "type-c1-02",
    "level": "C1",
    "prompt": "Her account was consistent ___ the available evidence.",
    "q_ar": "كانت روايتها متوافقة ___ الأدلة المتاحة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "with"
    ],
    "why_en": "The established collocation is “consistent with”.",
    "why_ar": "التركيب الصحيح هو consistent with.",
    "answer": "with"
  },
  {
    "id": "type-c2-01",
    "level": "C2",
    "prompt": "Were the premise ___ false, the inference would collapse.",
    "q_ar": "لو ثبت أن الفرضية ___ خاطئة، لانْهار الاستنتاج.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "prove",
    "accept": [
      "to prove"
    ],
    "why_en": "Formal hypothetical inversion uses “were + subject + to-infinitive”.",
    "why_ar": "في القلب الافتراضي الرسمي نستخدم were + الفاعل + to + الفعل.",
    "answer": "to prove"
  },
  {
    "id": "type-c2-02",
    "level": "C2",
    "prompt": "The evidence is suggestive, but not ___.",
    "q_ar": "الأدلة توحي بذلك، لكنها ليست ___.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "decisive",
    "accept": [
      "conclusive"
    ],
    "why_en": "“Conclusive” means sufficient to settle a question definitively.",
    "why_ar": "Conclusive تعني حاسمًا بما يكفي لإنهاء الجدل حول المسألة.",
    "answer": "conclusive"
  },
  {
    "id": "type-a1-13",
    "level": "A1",
    "prompt": "My sister ___ (like) apples.",
    "q_ar": "أختي ___ (تحب) التفاح.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "present simple",
    "accept": [
      "likes"
    ],
    "why_en": "With he, she, or it, add -s in the present simple.",
    "why_ar": "مع he أو she أو it نضيف s للفعل في المضارع البسيط.",
    "answer": "likes"
  },
  {
    "id": "type-a1-14",
    "level": "A1",
    "prompt": "They ___ students.",
    "q_ar": "هم ___ طلاب.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "are"
    ],
    "why_en": "Use are with the subject they.",
    "why_ar": "نستخدم are مع الفاعل they.",
    "answer": "are"
  },
  {
    "id": "type-a2-13",
    "level": "A2",
    "prompt": "I was tired, ___ I went to bed early.",
    "q_ar": "كنت متعبًا، ___ ذهبت إلى النوم مبكرًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "result",
    "accept": [
      "so"
    ],
    "why_en": "So introduces the result of being tired.",
    "why_ar": "نستخدم so لذكر النتيجة، وهي الذهاب للنوم مبكرًا.",
    "answer": "so"
  },
  {
    "id": "type-a2-14",
    "level": "A2",
    "prompt": "How ___ water do we need?",
    "q_ar": "كمية ___ الماء التي نحتاج إليها؟",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "quantity",
    "accept": [
      "much"
    ],
    "why_en": "Use much with uncountable nouns such as water.",
    "why_ar": "نستخدم much مع الأسماء غير المعدودة مثل water.",
    "answer": "much"
  },
  {
    "id": "type-b1-13",
    "level": "B1",
    "prompt": "If I ___ (know) about the meeting, I would have attended.",
    "q_ar": "لو أنني ___ بشأن الاجتماع، لحضرته.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "third conditional",
    "accept": [
      "had known"
    ],
    "why_en": "The if-clause of the third conditional uses past perfect.",
    "why_ar": "يستخدم الشرط من النوع الثالث الماضي التام في جملة if.",
    "answer": "had known"
  },
  {
    "id": "type-b1-14",
    "level": "B1",
    "prompt": "She suggested ___ (take) the earlier train.",
    "q_ar": "اقترحت هي ___ القطار الأسبق.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "verb pattern",
    "accept": [
      "taking"
    ],
    "why_en": "Suggest is followed by an -ing form when proposing an action.",
    "why_ar": "يأتي بعد suggest فعل منتهٍ بـ ing عند اقتراح فعل.",
    "answer": "taking"
  },
  {
    "id": "type-b2-13",
    "level": "B2",
    "prompt": "No sooner had he arrived ___ it began to rain.",
    "q_ar": "ما إن وصل حتى بدأ المطر.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "paired conjunction",
    "accept": [
      "than"
    ],
    "why_en": "The standard pair is “no sooner … than”.",
    "why_ar": "التركيب القياسي هو no sooner … than.",
    "answer": "than"
  },
  {
    "id": "type-b2-14",
    "level": "B2",
    "prompt": "The instructions were so vague that they were open ___ interpretation.",
    "q_ar": "كانت التعليمات غامضة جدًا، لذا كانت قابلة ___ التأويل.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "to"
    ],
    "why_en": "The established phrase is “open to interpretation”.",
    "why_ar": "التركيب الصحيح هو open to interpretation.",
    "answer": "to"
  },
  {
    "id": "type-c1-03",
    "level": "C1",
    "prompt": "Only after the audit ___ the discrepancy discovered.",
    "q_ar": "لم يُكتشف التباين إلا بعد التدقيق.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "was"
    ],
    "why_en": "A fronted “only after” phrase triggers inversion in the main clause.",
    "why_ar": "عند بدء الجملة بـ Only after يحدث القلب في الجملة الرئيسية.",
    "answer": "was"
  },
  {
    "id": "type-c1-04",
    "level": "C1",
    "prompt": "The proposal, ___ initially controversial, was eventually adopted.",
    "q_ar": "اقتراح ___ مثيرًا للجدل في البداية، اعتُمد في النهاية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "although it was",
    "accept": [
      "although initially controversial",
      "though initially controversial"
    ],
    "why_en": "A concessive reduced clause can omit the subject and be-verb when understood.",
    "why_ar": "يمكن اختصار جملة التنازل بحذف الفاعل وفعل be إذا كانا مفهومين.",
    "answer": "although initially controversial"
  },
  {
    "id": "type-c1-05",
    "level": "C1",
    "prompt": "The results are contingent ___ the sample size.",
    "q_ar": "تعتمد النتائج ___ حجم العينة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "on"
    ],
    "why_en": "The collocation is “contingent on”.",
    "why_ar": "التركيب الصحيح contingent on.",
    "answer": "on"
  },
  {
    "id": "type-c1-06",
    "level": "C1",
    "prompt": "Were the data ___ independently, the conclusion might differ.",
    "q_ar": "لو ___ البيانات بشكل مستقل، فقد يختلف الاستنتاج.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "analyse",
    "accept": [
      "to be analysed",
      "to be analyzed"
    ],
    "why_en": "Formal hypothetical inversion can use “were + subject + to be + past participle”.",
    "why_ar": "يمكن استخدام were مع الفاعل ثم to be والتصريف الثالث في الافتراض الرسمي.",
    "answer": "to be analysed"
  },
  {
    "id": "type-c2-03",
    "level": "C2",
    "prompt": "So compelling ___ the evidence that the panel reopened the case.",
    "q_ar": "كانت الأدلة مقنعة جدًا لدرجة أن اللجنة أعادت فتح القضية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "was"
    ],
    "why_en": "With “so + adjective” fronted for emphasis, invert the auxiliary and subject.",
    "why_ar": "عند تقديم so + صفة للتوكيد نستخدم القلب بين الفعل والفاعل.",
    "answer": "was"
  },
  {
    "id": "type-c2-04",
    "level": "C2",
    "prompt": "The claim is not borne ___ by the available evidence.",
    "q_ar": "الادعاء لا تدعمه الأدلة المتاحة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "out",
    "accept": [
      "out"
    ],
    "why_en": "The phrase “borne out” means supported or confirmed by evidence.",
    "why_ar": "التعبير borne out يعني أن الأدلة تؤيد الادعاء.",
    "answer": "out"
  },
  {
    "id": "type-c2-05",
    "level": "C2",
    "prompt": "Much ___ I admire her work, I disagree with this conclusion.",
    "q_ar": "مع أنني ___ أُعجب بعملها، فإنني أختلف مع هذا الاستنتاج.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "as",
    "accept": [
      "as"
    ],
    "why_en": "“Much as” introduces a concessive clause meaning although.",
    "why_ar": "يأتي Much as لبدء جملة تنازلية بمعنى رغم أن.",
    "answer": "as"
  },
  {
    "id": "type-c2-06",
    "level": "C2",
    "prompt": "The witness's account was internally ___, with no contradictions.",
    "q_ar": "كانت رواية الشاهد متسقة داخليًا، دون أي تناقضات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "consistent",
    "accept": [
      "consistent"
    ],
    "why_en": "Consistent means coherent and free from contradiction.",
    "why_ar": "Consistent تعني متماسكًا وخاليًا من التناقض.",
    "answer": "consistent"
  },
  {
    "id": "type-a1-15",
    "level": "A1",
    "prompt": "She can ___ (swim) very well.",
    "q_ar": "هي تستطيع أن ___ (تسبح) جيدًا جدًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "modal verb",
    "accept": [
      "swim"
    ],
    "why_en": "A modal verb is followed by the base form.",
    "why_ar": "يأتي بعد الفعل الناقص الفعل بصيغته الأساسية.",
    "answer": "swim"
  },
  {
    "id": "type-a1-16",
    "level": "A1",
    "prompt": "Those ___ my shoes.",
    "q_ar": "تلك ___ حذائي.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "are"
    ],
    "why_en": "Use are with the plural subject those.",
    "why_ar": "نستخدم are مع الفاعل الجمع those.",
    "answer": "are"
  },
  {
    "id": "type-a2-15",
    "level": "A2",
    "prompt": "I'm interested ___ learning French.",
    "q_ar": "أنا مهتم ___ بتعلم الفرنسية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "in"
    ],
    "why_en": "The standard phrase is interested in.",
    "why_ar": "التركيب الصحيح interested in.",
    "answer": "in"
  },
  {
    "id": "type-a2-16",
    "level": "A2",
    "prompt": "We ___ (see) that film last week.",
    "q_ar": "نحن ___ (نشاهد) ذلك الفيلم الأسبوع الماضي.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "past simple",
    "accept": [
      "saw"
    ],
    "why_en": "A finished time expression like last week calls for the past simple.",
    "why_ar": "مع last week نستخدم الماضي البسيط.",
    "answer": "saw"
  },
  {
    "id": "type-b1-15",
    "level": "B1",
    "prompt": "If I had known, I ___ (come).",
    "q_ar": "لو كنت قد عرفت، ___ (آتي).",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "third conditional",
    "accept": [
      "would have come"
    ],
    "why_en": "The third conditional result uses would have + past participle.",
    "why_ar": "تستخدم نتيجة الشرط الثالث would have مع التصريف الثالث.",
    "answer": "would have come"
  },
  {
    "id": "type-b1-16",
    "level": "B1",
    "prompt": "The lecture was so ___ that I nearly fell asleep. (bore)",
    "q_ar": "كانت المحاضرة ___ جدًا حتى كدت أغفو. (يملّ)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "adjective",
    "accept": [
      "boring"
    ],
    "why_en": "Use -ing to describe something that causes a feeling.",
    "why_ar": "نستخدم ing لوصف الشيء الذي يسبب الشعور.",
    "answer": "boring"
  },
  {
    "id": "type-b2-15",
    "level": "B2",
    "prompt": "Despite ___ exhausted, she finished the report. (be)",
    "q_ar": "على الرغم من ___ مرهقة، أكملت التقرير. (يكون)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "-ing form",
    "accept": [
      "being"
    ],
    "why_en": "Despite can be followed by a noun or an -ing form.",
    "why_ar": "يمكن أن يأتي بعد despite اسم أو فعل منتهٍ بـ ing.",
    "answer": "being"
  },
  {
    "id": "type-b2-16",
    "level": "B2",
    "prompt": "The new evidence casts doubt ___ the original theory.",
    "q_ar": "تثير الأدلة الجديدة الشكوك ___ النظرية الأصلية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "on"
    ],
    "why_en": "The fixed collocation is “cast doubt on”.",
    "why_ar": "التركيب الثابت هو cast doubt on.",
    "answer": "on"
  },
  {
    "id": "type-c1-07",
    "level": "C1",
    "prompt": "Were the plan ___ properly, it might succeed. (implement)",
    "q_ar": "لو ___ الخطة على النحو الصحيح، فقد تنجح. (يُنفّذ)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "passive infinitive",
    "accept": [
      "to be implemented"
    ],
    "why_en": "Hypothetical inversion can use were + subject + to be + past participle.",
    "why_ar": "يمكن استخدام were مع الفاعل ثم to be والتصريف الثالث في الافتراض.",
    "answer": "to be implemented"
  },
  {
    "id": "type-c1-08",
    "level": "C1",
    "prompt": "The decision gave rise ___ considerable debate.",
    "q_ar": "أثار القرار جدلًا كبيرًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "to"
    ],
    "why_en": "The standard phrase is “give rise to”.",
    "why_ar": "التعبير الصحيح give rise to.",
    "answer": "to"
  },
  {
    "id": "type-c2-07",
    "level": "C2",
    "prompt": "So complex ___ the evidence that no firm conclusion could be drawn.",
    "q_ar": "كانت الأدلة معقدة جدًا بحيث تعذّر التوصل إلى استنتاج قاطع.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "was"
    ],
    "why_en": "Fronting “so + adjective” for emphasis triggers inversion.",
    "why_ar": "تقديم so + صفة للتوكيد يستلزم القلب.",
    "answer": "was"
  },
  {
    "id": "type-c2-08",
    "level": "C2",
    "prompt": "The hypothesis remains to be ___ independently. (test)",
    "q_ar": "لا تزال الفرضية بحاجة إلى أن تُ___ بشكل مستقل. (يختبر)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "past participle",
    "accept": [
      "tested"
    ],
    "why_en": "The passive infinitive uses be + past participle.",
    "why_ar": "يتكون المصدر المبني للمجهول من be والتصريف الثالث.",
    "answer": "tested"
  },
  {
    "id": "type-a1-17",
    "level": "A1",
    "prompt": "My brother ___ a bicycle.",
    "q_ar": "أخي ___ دراجة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "have",
    "accept": [
      "has"
    ],
    "why_en": "Use has with he, she, or it.",
    "why_ar": "نستخدم has مع he أو she أو it.",
    "answer": "has"
  },
  {
    "id": "type-a1-18",
    "level": "A1",
    "prompt": "We are ___ to school now. (go)",
    "q_ar": "نحن ___ إلى المدرسة الآن. (نذهب)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "present continuous",
    "accept": [
      "going"
    ],
    "why_en": "The present continuous uses be + verb-ing.",
    "why_ar": "يتكون المضارع المستمر من be والفعل المنتهي بـ ing.",
    "answer": "going"
  },
  {
    "id": "type-a2-17",
    "level": "A2",
    "prompt": "I didn't ___ him yesterday. (see)",
    "q_ar": "أنا لم ___ه أمس. (أرى)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "base form",
    "accept": [
      "see"
    ],
    "why_en": "After didn't, use the base form.",
    "why_ar": "بعد didn't نستخدم الفعل بصيغته الأساسية.",
    "answer": "see"
  },
  {
    "id": "type-a2-18",
    "level": "A2",
    "prompt": "This bag is ___ than that one. (cheap)",
    "q_ar": "هذه الحقيبة ___ من تلك. (رخيصة)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "comparative",
    "accept": [
      "cheaper"
    ],
    "why_en": "Short adjectives usually form the comparative with -er.",
    "why_ar": "غالبًا نكوّن المقارنة للصفات القصيرة بإضافة er.",
    "answer": "cheaper"
  },
  {
    "id": "type-b1-17",
    "level": "B1",
    "prompt": "I've been waiting ___ two hours.",
    "q_ar": "أنا أنتظر ___ ساعتين.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "for/since",
    "accept": [
      "for"
    ],
    "why_en": "Use for with a duration.",
    "why_ar": "نستخدم for مع مدة زمنية.",
    "answer": "for"
  },
  {
    "id": "type-b1-18",
    "level": "B1",
    "prompt": "She asked me where I ___ going.",
    "q_ar": "سألتني إلى أين ___ ذاهبًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "reported question",
    "accept": [
      "was"
    ],
    "why_en": "Reported questions use statement word order.",
    "why_ar": "تستخدم الأسئلة المنقولة ترتيب الجملة الخبرية.",
    "answer": "was"
  },
  {
    "id": "type-b2-17",
    "level": "B2",
    "prompt": "Had I known, I would ___ you earlier.",
    "q_ar": "لو كنت قد عرفت، لكنت ___ لك في وقت أبكر.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "past participle",
    "accept": [
      "have told"
    ],
    "why_en": "The third conditional result uses would have + past participle.",
    "why_ar": "تستخدم نتيجة الشرط الثالث would have والتصريف الثالث.",
    "answer": "have told"
  },
  {
    "id": "type-b2-18",
    "level": "B2",
    "prompt": "The manager insisted ___ our leaving early.",
    "q_ar": "أصرّ المدير ___ مغادرتنا مبكرًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "on"
    ],
    "why_en": "Use insist on before a noun or an -ing form.",
    "why_ar": "نستخدم insist on قبل اسم أو فعل ing.",
    "answer": "on"
  },
  {
    "id": "type-c1-09",
    "level": "C1",
    "prompt": "Not until the data had been analysed ___ the pattern become clear.",
    "q_ar": "لم يتضح النمط إلا بعد تحليل البيانات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "auxiliary",
    "accept": [
      "did"
    ],
    "why_en": "A fronted not until phrase triggers inversion; use did + base verb for the past simple.",
    "why_ar": "عند تقديم Not until يحدث القلب، ونستخدم did مع الفعل الأساسي للماضي البسيط.",
    "answer": "did"
  },
  {
    "id": "type-c1-10",
    "level": "C1",
    "prompt": "The findings are at odds ___ the initial hypothesis.",
    "q_ar": "تتعارض النتائج ___ الفرضية الأولية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "with"
    ],
    "why_en": "The fixed phrase is at odds with.",
    "why_ar": "التعبير الثابت هو at odds with.",
    "answer": "with"
  },
  {
    "id": "type-c2-09",
    "level": "C2",
    "prompt": "Under no circumstances ___ these files be shared.",
    "q_ar": "لا يجوز تحت أي ظرف ___ هذه الملفات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "modal",
    "accept": [
      "should"
    ],
    "why_en": "A negative phrase at the beginning requires inversion.",
    "why_ar": "العبارة السلبية في بداية الجملة تستلزم القلب.",
    "answer": "should"
  },
  {
    "id": "type-c2-10",
    "level": "C2",
    "prompt": "The proposal is contingent ___ external approval.",
    "q_ar": "يتوقف الاقتراح ___ موافقة خارجية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "on"
    ],
    "why_en": "The formal collocation is contingent on.",
    "why_ar": "التركيب الرسمي هو contingent on.",
    "answer": "on"
  },
  {
    "id": "type-a1-19",
    "level": "A1",
    "prompt": "My sister ___ eight years old.",
    "q_ar": "أختي ___ عمرها ثماني سنوات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "be",
    "accept": [
      "is"
    ],
    "why_en": "Use is with a singular subject such as my sister.",
    "why_ar": "نستخدم is مع الفاعل المفرد مثل my sister.",
    "answer": "is"
  },
  {
    "id": "type-a1-20",
    "level": "A1",
    "prompt": "They ___ football every Friday. (play)",
    "q_ar": "هم ___ كرة القدم كل يوم جمعة. (يلعبون)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "present simple",
    "accept": [
      "play"
    ],
    "why_en": "Use the base form with the plural subject they.",
    "why_ar": "نستخدم الفعل الأساسي مع الفاعل الجمع they.",
    "answer": "play"
  },
  {
    "id": "type-a2-19",
    "level": "A2",
    "prompt": "We ___ a film when you called. (watch)",
    "q_ar": "كنا ___ فيلمًا عندما اتصلت. (نشاهد)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "past continuous",
    "accept": [
      "were watching"
    ],
    "why_en": "Use were + verb-ing for an action in progress in the past.",
    "why_ar": "نستخدم were مع الفعل ing لحدث كان مستمرًا في الماضي.",
    "answer": "were watching"
  },
  {
    "id": "type-a2-20",
    "level": "A2",
    "prompt": "There isn't ___ juice left.",
    "q_ar": "لم يتبقَّ ___ من العصير.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "any/some",
    "accept": [
      "any"
    ],
    "why_en": "Any is commonly used in negative sentences.",
    "why_ar": "نستخدم any غالبًا في الجمل المنفية.",
    "answer": "any"
  },
  {
    "id": "type-b1-19",
    "level": "B1",
    "prompt": "She suggested ___ a taxi. (take)",
    "q_ar": "اقترحت هي ___ سيارة أجرة. (تأخذ)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "verb pattern",
    "accept": [
      "taking"
    ],
    "why_en": "Suggest is followed by an -ing form or a that-clause.",
    "why_ar": "يأتي بعد suggest فعل ing أو جملة تبدأ بـ that.",
    "answer": "taking"
  },
  {
    "id": "type-b1-20",
    "level": "B1",
    "prompt": "I look forward to ___ from you. (hear)",
    "q_ar": "أتطلع إلى ___ منك. (أسمع)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "verb pattern",
    "accept": [
      "hearing"
    ],
    "why_en": "Here, to is a preposition, so it is followed by -ing.",
    "why_ar": "هنا to حرف جر، لذلك يأتي بعده فعل ing.",
    "answer": "hearing"
  },
  {
    "id": "type-b2-19",
    "level": "B2",
    "prompt": "Not only ___ she miss the train, but she also lost her ticket.",
    "q_ar": "لم تكتفِ بتفويت القطار، بل فقدت تذكرتها أيضًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "inversion",
    "accept": [
      "did"
    ],
    "why_en": "Not only at the beginning triggers inversion with did + base verb.",
    "why_ar": "بدء الجملة بـ Not only يستلزم القلب باستخدام did والفعل الأساسي.",
    "answer": "did"
  },
  {
    "id": "type-b2-20",
    "level": "B2",
    "prompt": "The results depend ___ several factors.",
    "q_ar": "تعتمد النتائج ___ عدة عوامل.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "on"
    ],
    "why_en": "The standard collocation is depend on.",
    "why_ar": "التركيب الصحيح depend on.",
    "answer": "on"
  },
  {
    "id": "type-c1-11",
    "level": "C1",
    "prompt": "The board insisted that he ___ the report immediately. (submit)",
    "q_ar": "أصرّ مجلس الإدارة على أن ___ التقرير فورًا. (يقدّم)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "subjunctive",
    "accept": [
      "submit"
    ],
    "why_en": "Formal insist that clauses can use the base-form subjunctive.",
    "why_ar": "يمكن استخدام الفعل بصيغته الأساسية بعد insist that في الأسلوب الرسمي.",
    "answer": "submit"
  },
  {
    "id": "type-c1-12",
    "level": "C1",
    "prompt": "Scarcely had we arrived ___ the storm began.",
    "q_ar": "ما إن وصلنا حتى بدأت العاصفة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "conjunction",
    "accept": [
      "when"
    ],
    "why_en": "The standard pairing is scarcely...when.",
    "why_ar": "التركيب القياسي هو scarcely...when.",
    "answer": "when"
  },
  {
    "id": "type-c1-13",
    "level": "C1",
    "prompt": "The extent to which these claims are valid ___ unclear. (remain)",
    "q_ar": "إن مدى صحة هذه الادعاءات ___ غير واضح. (يبقى)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "subject–verb agreement",
    "accept": [
      "remains"
    ],
    "why_en": "The head subject is the singular noun extent.",
    "why_ar": "الفاعل الأساسي هو الاسم المفرد extent.",
    "answer": "remains"
  },
  {
    "id": "type-c1-14",
    "level": "C1",
    "prompt": "The new policy is liable ___ causing confusion.",
    "q_ar": "قد تكون السياسة الجديدة عرضة ___ التسبب في الارتباك.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "to"
    ],
    "why_en": "The standard phrase is liable to do something.",
    "why_ar": "التعبير الصحيح liable to يتبعه الفعل.",
    "answer": "to"
  },
  {
    "id": "type-c1-15",
    "level": "C1",
    "prompt": "Were it not for her advice, I would have ___ a costly mistake. (make)",
    "q_ar": "لولا نصيحتها، لكنت قد ___ خطأً مكلفًا. (أرتكب)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "past participle",
    "accept": [
      "made"
    ],
    "why_en": "Would have is followed by the past participle.",
    "why_ar": "يأتي بعد would have التصريف الثالث.",
    "answer": "made"
  },
  {
    "id": "type-c1-16",
    "level": "C1",
    "prompt": "The author alludes ___ a well-known debate.",
    "q_ar": "يشير الكاتب ___ نقاش معروف.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "to"
    ],
    "why_en": "The verb allude takes the preposition to.",
    "why_ar": "يأتي بعد allude حرف الجر to.",
    "answer": "to"
  },
  {
    "id": "type-c1-17",
    "level": "C1",
    "prompt": "Only when the figures were checked ___ the discrepancy emerge?",
    "q_ar": "لم يظهر التباين إلا بعد التحقق من الأرقام.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "auxiliary",
    "accept": [
      "did"
    ],
    "why_en": "A fronted only-when clause triggers inversion in the main clause.",
    "why_ar": "تقديم Only when يستلزم القلب في الجملة الرئيسية.",
    "answer": "did"
  },
  {
    "id": "type-c1-18",
    "level": "C1",
    "prompt": "The findings lend credence ___ the hypothesis.",
    "q_ar": "تضفي النتائج مصداقية ___ الفرضية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "preposition",
    "accept": [
      "to"
    ],
    "why_en": "The fixed phrase is lend credence to.",
    "why_ar": "التعبير الصحيح lend credence to.",
    "answer": "to"
  },
  {
    "id": "type-c1-19",
    "level": "C1",
    "prompt": "It is essential that every applicant ___ informed promptly.",
    "q_ar": "من الضروري أن ___ كل متقدم على علم بالأمر فورًا.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "formal subjunctive",
    "accept": [
      "be"
    ],
    "why_en": "Formal mandative clauses often use the base-form subjunctive be.",
    "why_ar": "في الأسلوب الرسمي نستخدم be بصيغته الأساسية بعد essential that.",
    "answer": "be"
  },
  {
    "id": "type-c1-20",
    "level": "C1",
    "prompt": "Had I known about the closure, I ___ a different route. (take)",
    "q_ar": "لو كنت قد علمت بالإغلاق، ___ طريقًا مختلفًا. (أسلك)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "third conditional",
    "accept": [
      "would have taken"
    ],
    "why_en": "A past counterfactual result uses would have + past participle.",
    "why_ar": "تستخدم نتيجة الافتراض المخالف للماضي would have والتصريف الثالث.",
    "answer": "would have taken"
  },
  {
    "id": "type-c2-11",
    "level": "C2",
    "prompt": "Little ___ she realise how consequential the decision would be.",
    "q_ar": "لم تكن تتصور هي مدى تأثير القرار.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "inversion",
    "accept": [
      "did"
    ],
    "why_en": "Little at the beginning triggers subject–auxiliary inversion.",
    "why_ar": "بدء الجملة بـ Little يستلزم القلب بين الفعل المساعد والفاعل.",
    "answer": "did"
  },
  {
    "id": "type-c2-12",
    "level": "C2",
    "prompt": "The claim is predicated ___ an assumption that remains untested.",
    "q_ar": "يستند الادعاء ___ افتراض لم يُختبر بعد.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "formal collocation",
    "accept": [
      "on"
    ],
    "why_en": "The formal collocation is predicated on.",
    "why_ar": "التركيب الرسمي الصحيح predicated on.",
    "answer": "on"
  },
  {
    "id": "type-c2-13",
    "level": "C2",
    "prompt": "Be that as it may, the evidence ___ not support the conclusion.",
    "q_ar": "مهما يكن، فإن الأدلة ___ لا تدعم الاستنتاج.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "auxiliary",
    "accept": [
      "does"
    ],
    "why_en": "Evidence is uncountable and takes a singular verb here.",
    "why_ar": "Evidence اسم غير معدود ويأخذ فعلًا مفردًا هنا.",
    "answer": "does"
  },
  {
    "id": "type-c2-14",
    "level": "C2",
    "prompt": "The theory is not so much disproven ___ inadequately supported.",
    "q_ar": "النظرية ليست مدحوضة بقدر ما هي غير مدعومة بما يكفي.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "contrastive construction",
    "accept": [
      "as"
    ],
    "why_en": "The construction is not so much X as Y.",
    "why_ar": "التركيب هو not so much X as Y.",
    "answer": "as"
  },
  {
    "id": "type-c2-15",
    "level": "C2",
    "prompt": "Had the issue been addressed, the consequences ___ have been less severe.",
    "q_ar": "لو عولجت المشكلة، ___ أن تكون العواقب أقل خطورة.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "modal verb",
    "accept": [
      "might"
    ],
    "why_en": "Might have expresses a possible alternative result in a past counterfactual.",
    "why_ar": "تعبّر might have عن نتيجة بديلة محتملة في افتراض مخالف للماضي.",
    "answer": "might"
  },
  {
    "id": "type-c2-16",
    "level": "C2",
    "prompt": "The distinction is subtle, not to say ___. (imperceptible)",
    "q_ar": "التمييز دقيق، بل يكاد يكون ___. (غير ملحوظ)",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "adverb",
    "accept": [
      "imperceptibly"
    ],
    "why_en": "The adverb form of imperceptible is imperceptibly.",
    "why_ar": "صيغة الظرف من imperceptible هي imperceptibly.",
    "answer": "imperceptibly"
  },
  {
    "id": "type-c2-17",
    "level": "C2",
    "prompt": "Under no circumstances ___ the confidential data be disclosed.",
    "q_ar": "لا يجوز تحت أي ظرف ___ الكشف عن البيانات السرية.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "inversion",
    "accept": [
      "should"
    ],
    "why_en": "A negative fronted phrase requires subject–auxiliary inversion.",
    "why_ar": "العبارة السلبية في البداية تستلزم القلب.",
    "answer": "should"
  },
  {
    "id": "type-c2-18",
    "level": "C2",
    "prompt": "The argument is compelling insofar ___ it accounts for the exceptions.",
    "q_ar": "الحجة مقنعة بقدر ما ___ تفسر الاستثناءات.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "conjunction",
    "accept": [
      "as"
    ],
    "why_en": "The standard conjunction is insofar as.",
    "why_ar": "التركيب الصحيح insofar as.",
    "answer": "as"
  },
  {
    "id": "type-c2-19",
    "level": "C2",
    "prompt": "Such was the ambiguity that neither interpretation could be ___ out. (rule)",
    "q_ar": "كان الغموض شديدًا لدرجة تعذر استبعاد أي من التفسيرين.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "past participle",
    "accept": [
      "ruled"
    ],
    "why_en": "The passive construction requires the past participle ruled out.",
    "why_ar": "يتطلب المبني للمجهول التصريف الثالث ruled out.",
    "answer": "ruled"
  },
  {
    "id": "type-c2-20",
    "level": "C2",
    "prompt": "The recommendation rests on premises whose implications ___ yet to be explored.",
    "q_ar": "تستند التوصية إلى مقدمات لم تُستكشف ___ آثارها بعد.",
    "sub_ar": "تلميح: اكتب الكلمة الناقصة باللغة الإنجليزية.",
    "hint": "auxiliary",
    "accept": [
      "have"
    ],
    "why_en": "The plural subject implications takes have.",
    "why_ar": "الفاعل implications جمع، لذلك نستخدم have.",
    "answer": "have"
  }
];
