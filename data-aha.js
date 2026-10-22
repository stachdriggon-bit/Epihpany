/* Short Aha notes shown after selected incorrect answers. */
const AHA_NOTES = [
  {
    "id": "aha-1",
    "level": "A1",
    "en": "With he, she, or it, the verb usually needs -s in the present simple.",
    "ar": "مع he وshe وit نضيف غالبًا s للفعل في المضارع البسيط.",
    "questionId": "be01"
  },
  {
    "id": "aha-2",
    "level": "A1",
    "en": "After can, use the base verb: can go, not can goes.",
    "ar": "بعد can نستخدم الفعل الأساسي: can go وليس can goes.",
    "questionId": "be02"
  },
  {
    "id": "aha-3",
    "level": "A1",
    "en": "English sentences usually need a verb even when Arabic leaves it understood.",
    "ar": "الجملة الإنجليزية تحتاج غالبًا إلى فعل حتى عندما يكون مفهومًا ضمنًا في العربية.",
    "questionId": "be03"
  },
  {
    "id": "aha-4",
    "level": "A1",
    "en": "Use an when the next word begins with a vowel sound, not just a vowel letter.",
    "ar": "نستخدم an بحسب الصوت المتحرك في بداية الكلمة، لا الحرف فقط.",
    "questionId": "be04"
  },
  {
    "id": "aha-5",
    "level": "A1",
    "en": "A plural subject needs a plural verb: they are, not they is.",
    "ar": "الفاعل الجمع يحتاج فعلًا مناسبًا: they are وليس they is.",
    "questionId": "be05"
  },
  {
    "id": "aha-6",
    "level": "A2",
    "en": "Does already carries the third-person marker, so the main verb stays plain.",
    "ar": "كلمة does تحمل علامة الغائب، لذلك يبقى الفعل الأساسي دون s.",
    "questionId": "be06"
  },
  {
    "id": "aha-7",
    "level": "A2",
    "en": "Since points to a starting time; for points to a duration.",
    "ar": "Since تشير إلى بداية زمنية، أما for فتشير إلى مدة.",
    "questionId": "be07"
  },
  {
    "id": "aha-8",
    "level": "A2",
    "en": "Advice and information are uncountable in English even when Arabic uses plurals.",
    "ar": "Advice وinformation غير معدودتين بالإنجليزية رغم أن مقابلهما العربي جمع.",
    "questionId": "be08"
  },
  {
    "id": "aha-9",
    "level": "A2",
    "en": "Look forward to uses -ing because to is a preposition here.",
    "ar": "بعد look forward to نستخدم ing لأن to حرف جر هنا.",
    "questionId": "spot-a1-01"
  },
  {
    "id": "aha-10",
    "level": "A2",
    "en": "Learn prepositions as part of a phrase: depend on, interested in.",
    "ar": "احفظ حرف الجر ضمن العبارة كاملة: depend on وinterested in.",
    "questionId": "spot-a1-02"
  },
  {
    "id": "aha-11",
    "level": "B1",
    "en": "A finished past-time word such as yesterday usually calls for the past simple.",
    "ar": "مؤشر وقت منتهٍ مثل yesterday يحتاج غالبًا إلى الماضي البسيط.",
    "questionId": "spot-a1-03"
  },
  {
    "id": "aha-12",
    "level": "B1",
    "en": "In a real future condition, the if-clause normally uses present simple.",
    "ar": "في شرط مستقبلي حقيقي، يأتي المضارع البسيط عادةً بعد if.",
    "questionId": "spot-a1-04"
  },
  {
    "id": "aha-13",
    "level": "B1",
    "en": "Despite takes a noun or -ing directly; in spite of includes of.",
    "ar": "تأتي despite مباشرةً قبل اسم أو ing، بينما نقول in spite of.",
    "questionId": "spot-a1-05"
  },
  {
    "id": "aha-14",
    "level": "B1",
    "en": "Fewer is for countable items; less is for amounts and uncountable nouns.",
    "ar": "نستخدم fewer للمعدود وless للكميات وغير المعدود.",
    "questionId": "spot-a1-06"
  },
  {
    "id": "aha-15",
    "level": "B1",
    "en": "Suggest an idea, suggest doing something; avoid “suggest someone to do”.",
    "ar": "نقول suggest doing أو suggest that؛ وتجنب suggest someone to do.",
    "questionId": "spot-a1-07"
  },
  {
    "id": "aha-16",
    "level": "B2",
    "en": "Had + subject inversion still needs a past participle: Had I known...",
    "ar": "حتى مع قلب had نحتاج التصريف الثالث: Had I known...",
    "questionId": "spot-a1-08"
  },
  {
    "id": "aha-17",
    "level": "B2",
    "en": "No sooner pairs with than; hardly and scarcely often pair with when.",
    "ar": "يأتي than مع no sooner، بينما يأتي when غالبًا مع hardly وscarcely.",
    "questionId": "type-a1-01"
  },
  {
    "id": "aha-18",
    "level": "B2",
    "en": "In formal recommendations, that-clause verbs can use the bare form: recommend that he act.",
    "ar": "في توصيات رسمية قد يأتي الفعل بعد that بصيغته الأساسية: recommend that he act.",
    "questionId": "type-a1-02"
  },
  {
    "id": "aha-19",
    "level": "B2",
    "en": "A phrase between the subject and verb does not always change the subject's number.",
    "ar": "العبارة الواقعة بين الفاعل والفعل لا تغيّر دائمًا عدد الفاعل.",
    "questionId": "type-a1-03"
  },
  {
    "id": "aha-20",
    "level": "B2",
    "en": "A nuanced answer can be correct even when a more literal translation sounds tempting.",
    "ar": "قد تكون الإجابة الدقيقة صحيحة حتى عندما تبدو الترجمة الحرفية مغرية.",
    "questionId": "type-a1-04"
  }
];
