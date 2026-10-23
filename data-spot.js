/* Spot the Mistake: independent lesson data. */
const SPOT_QUESTIONS = [
  {
    "id": "spot-a1-01",
    "level": "A1",
    "text": "She go to school every day.",
    "wrongIndex": 1,
    "fix": "goes",
    "why_en": "With he/she/it, the present simple usually adds -s to the verb.",
    "why_ar": "مع he أو she أو it نضيف غالبًا s للفعل في المضارع البسيط."
  },
  {
    "id": "spot-a1-02",
    "level": "A1",
    "text": "He are my best friend.",
    "wrongIndex": 1,
    "fix": "is",
    "why_en": "Use is with he, she, and it.",
    "why_ar": "نستخدم is مع he وshe وit."
  },
  {
    "id": "spot-a1-03",
    "level": "A1",
    "text": "I have a apple.",
    "wrongIndex": 2,
    "fix": "an",
    "why_en": "Use an before a vowel sound, as in apple.",
    "why_ar": "نستخدم an قبل صوت متحرك مثل apple."
  },
  {
    "id": "spot-a1-04",
    "level": "A1",
    "text": "They is at home now.",
    "wrongIndex": 1,
    "fix": "are",
    "why_en": "They is plural, so use are.",
    "why_ar": "They ضمير جمع، لذلك نستخدم are."
  },
  {
    "id": "spot-a1-05",
    "level": "A1",
    "text": "She can sings very well.",
    "wrongIndex": 2,
    "fix": "sing",
    "why_en": "A modal verb such as can is followed by the base verb.",
    "why_ar": "بعد can يأتي الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-a1-06",
    "level": "A1",
    "text": "I am agree with you.",
    "wrongIndex": 1,
    "fix": "remove am",
    "why_en": "Agree is a verb; say “I agree.”",
    "why_ar": "Agree فعل، لذا نقول I agree وليس I am agree."
  },
  {
    "id": "spot-a1-07",
    "level": "A1",
    "text": "He has two childs.",
    "wrongIndex": 3,
    "fix": "children.",
    "why_en": "The plural of child is children.",
    "why_ar": "جمع child هو children وليس childs."
  },
  {
    "id": "spot-a1-08",
    "level": "A1",
    "text": "We go to work in Monday.",
    "wrongIndex": 4,
    "fix": "on",
    "why_en": "Use on with days of the week.",
    "why_ar": "نستخدم on مع أيام الأسبوع."
  },
  {
    "id": "spot-a2-01",
    "level": "A2",
    "text": "She doesn't likes coffee.",
    "wrongIndex": 2,
    "fix": "like",
    "why_en": "After doesn't, use the base form of the verb.",
    "why_ar": "بعد doesn't نستخدم الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-a2-02",
    "level": "A2",
    "text": "She live here.",
    "wrongIndex": 1,
    "fix": "lives",
    "why_en": "With he, she, or it, the present simple usually adds -s to the main verb.",
    "why_ar": "مع he وshe وit نضيف غالبًا s للفعل في المضارع البسيط."
  },
  {
    "id": "spot-a2-03",
    "level": "A2",
    "text": "There is many books on the desk.",
    "wrongIndex": 1,
    "fix": "are",
    "why_en": "Use are with plural nouns such as books.",
    "why_ar": "نستخدم are مع الاسم الجمع مثل books."
  },
  {
    "id": "spot-a2-04",
    "level": "A2",
    "text": "He explained me the rule.",
    "wrongIndex": 2,
    "fix": "to me",
    "why_en": "Explain something to someone; do not use this pattern with a direct person object.",
    "why_ar": "نقول explain something to someone، ولا نضع الشخص مباشرة بعد explain."
  },
  {
    "id": "spot-a2-05",
    "level": "A2",
    "text": "I look forward to meet you.",
    "wrongIndex": 4,
    "fix": "meeting",
    "why_en": "In look forward to, to is a preposition followed by -ing.",
    "why_ar": "في look forward to، كلمة to حرف جر ويتبعها فعل ing."
  },
  {
    "id": "spot-a2-06",
    "level": "A2",
    "text": "She is married with a doctor.",
    "wrongIndex": 3,
    "fix": "to",
    "why_en": "The standard expression is married to someone.",
    "why_ar": "التعبير الصحيح هو married to someone."
  },
  {
    "id": "spot-a2-07",
    "level": "A2",
    "text": "I have saw him before.",
    "wrongIndex": 2,
    "fix": "seen",
    "why_en": "Yesterday refers to a finished past time, so use the past simple.",
    "why_ar": "Yesterday وقت ماضٍ منتهٍ، لذا نستخدم الماضي البسيط."
  },
  {
    "id": "spot-a2-08",
    "level": "A2",
    "text": "Can you give me an advice?",
    "wrongIndex": 4,
    "fix": "some",
    "why_en": "Advice is uncountable; use some advice or a piece of advice.",
    "why_ar": "Advice اسم غير معدود؛ نقول some advice أو a piece of advice."
  },
  {
    "id": "spot-b1-01",
    "level": "B1",
    "text": "If I will see her, I'll tell her.",
    "wrongIndex": 2,
    "fix": "remove will",
    "why_en": "In a first conditional if-clause, use the present simple for the future condition.",
    "why_ar": "في جملة الشرط الأولى نستخدم المضارع البسيط بعد if."
  },
  {
    "id": "spot-b1-02",
    "level": "B1",
    "text": "Despite of the rain, we went out.",
    "wrongIndex": 1,
    "fix": "remove of",
    "why_en": "Despite is not followed by of; use in spite of if you need of.",
    "why_ar": "لا نضيف of بعد despite؛ أما in spite of فيأتي معها of."
  },
  {
    "id": "spot-b1-03",
    "level": "B1",
    "text": "The news are surprising.",
    "wrongIndex": 2,
    "fix": "is",
    "why_en": "News looks plural but is grammatically singular.",
    "why_ar": "كلمة news تبدو جمعًا لكنها مفرد نحويًا."
  },
  {
    "id": "spot-b1-04",
    "level": "B1",
    "text": "I suggested to applying.",
    "wrongIndex": 2,
    "fix": "remove to",
    "why_en": "Suggest is normally followed by a gerund or a that-clause, not this infinitive pattern.",
    "why_ar": "يتبع suggest غالبًا فعل ing أو جملة that، لا هذا التركيب."
  },
  {
    "id": "spot-b1-05",
    "level": "B1",
    "text": "She has went to Paris.",
    "wrongIndex": 2,
    "fix": "gone",
    "why_en": "“Went” is the past simple of go; use “gone” after has or have.",
    "why_ar": "Went هو الماضي البسيط من go، أما بعد has أو have فنستخدم gone."
  },
  {
    "id": "spot-b1-06",
    "level": "B1",
    "text": "He is responsible of the team.",
    "wrongIndex": 3,
    "fix": "for",
    "why_en": "The usual collocation is responsible for.",
    "why_ar": "التعبير الثابت هو responsible for."
  },
  {
    "id": "spot-b1-07",
    "level": "B1",
    "text": "I have less books than you.",
    "wrongIndex": 2,
    "fix": "fewer",
    "why_en": "Use fewer with countable plural nouns such as books.",
    "why_ar": "نستخدم fewer مع الأسماء المعدودة الجمع مثل books."
  },
  {
    "id": "spot-b1-08",
    "level": "B1",
    "text": "Although he was tired, but he continued.",
    "wrongIndex": 4,
    "fix": "remove but",
    "why_en": "Although already introduces the contrast, so do not add but in the same clause structure.",
    "why_ar": "Although تدل على التناقض بنفسها، فلا نضيف but بالطريقة نفسها."
  },
  {
    "id": "spot-b2-01",
    "level": "B2",
    "text": "Had I knew the answer, I would have told you.",
    "wrongIndex": 2,
    "fix": "known",
    "why_en": "In third conditional inversion, use the past participle after had.",
    "why_ar": "في قلب الشرط الثالث نستخدم التصريف الثالث بعد had."
  },
  {
    "id": "spot-b2-02",
    "level": "B2",
    "text": "The proposal comprises of three parts.",
    "wrongIndex": 3,
    "fix": "remove of",
    "why_en": "Comprise is normally used without of in this meaning.",
    "why_ar": "يُستخدم comprise عادةً دون of بهذا المعنى."
  },
  {
    "id": "spot-b2-03",
    "level": "B2",
    "text": "Neither of the options are suitable.",
    "wrongIndex": 4,
    "fix": "is",
    "why_en": "In formal usage, neither of + plural noun often takes a singular verb.",
    "why_ar": "في الاستعمال الرسمي، يأتي neither of غالبًا مع فعل مفرد."
  },
  {
    "id": "spot-b2-04",
    "level": "B2",
    "text": "The data shows a clear trend.",
    "wrongIndex": 2,
    "fix": "show",
    "why_en": "In formal academic writing, data is often treated as plural.",
    "why_ar": "في الكتابة الأكاديمية الرسمية تُعامل data غالبًا كجمع."
  },
  {
    "id": "spot-b2-05",
    "level": "B2",
    "text": "No sooner had we arrived when it started raining.",
    "wrongIndex": 5,
    "fix": "than",
    "why_en": "The fixed structure is no sooner ... than.",
    "why_ar": "التركيب الثابت هو no sooner ... than."
  },
  {
    "id": "spot-b2-06",
    "level": "B2",
    "text": "She is used to wake up early.",
    "wrongIndex": 4,
    "fix": "waking",
    "why_en": "Be used to means be accustomed to; to is a preposition here.",
    "why_ar": "Be used to بمعنى اعتاد، وto هنا حرف جر يتبعه ing."
  },
  {
    "id": "spot-b2-07",
    "level": "B2",
    "text": "The manager demanded that he apologizes.",
    "wrongIndex": 5,
    "fix": "apologize.",
    "why_en": "After demand that, formal English often uses the base-form subjunctive.",
    "why_ar": "بعد demand that يُستخدم الفعل بصيغته الأساسية في الأسلوب الرسمي."
  },
  {
    "id": "spot-b2-08",
    "level": "B2",
    "text": "It is high time we leave.",
    "wrongIndex": 5,
    "fix": "left.",
    "why_en": "It is high time is commonly followed by a past form for a present change needed.",
    "why_ar": "بعد It is high time نستخدم غالبًا صيغة الماضي للتعبير عن أمر حان وقته."
  }
  ,
  {"id":"spot-a1-09","level":"A1","text":"They is at home.","wrongIndex":1,"fix":"are","why_en":"Use “are” with the plural subject “they”.","why_ar":"نستخدم are مع الفاعل الجمع they."},
  {"id":"spot-a1-10","level":"A1","text":"I have two childs.","wrongIndex":3,"fix":"children.","why_en":"The plural of child is children, not childs.","why_ar":"جمع child هو children وليس childs."},
  {"id":"spot-a2-09","level":"A2","text":"She didn’t went to work yesterday.","wrongIndex":2,"fix":"go","why_en":"After didn’t, use the base form of the verb.","why_ar":"بعد didn’t نستخدم الفعل بصيغته الأساسية: go."},
  {"id":"spot-a2-10","level":"A2","text":"There are much people outside.","wrongIndex":2,"fix":"many","why_en":"Use many with countable plural nouns such as people.","why_ar":"نستخدم many مع الأسماء المعدودة الجمع مثل people."},
  {"id":"spot-b1-09","level":"B1","text":"I look forward to meet you.","wrongIndex":4,"fix":"meeting","why_en":"“Look forward to” is followed by a noun or an -ing form.","why_ar":"يتبع look forward to اسم أو فعل منتهٍ بـ ing."},
  {"id":"spot-b1-10","level":"B1","text":"If I would have more time, I would travel.","wrongIndex":2,"fix":"had","why_en":"The second conditional uses past simple in the if-clause.","why_ar":"في الشرط الثاني نستخدم الماضي البسيط في جملة if."},
  {"id":"spot-b2-09","level":"B2","text":"In spite the rain, the match continued.","wrongIndex":2,"fix":"of the","why_en":"Despite is not followed by “of”; use “despite the rain” or “in spite of the rain”.","why_ar":"لا يأتي of بعد despite؛ نقول despite the rain أو in spite of the rain."},
  {"id":"spot-b2-10","level":"B2","text":"Hardly I arrived when the phone rang.","wrongIndex":1,"fix":"had I","why_en":"When “hardly” begins the sentence, use subject–auxiliary inversion.","why_ar":"عندما تبدأ الجملة بـ Hardly نستخدم القلب: hardly had I arrived."},
  {"id":"spot-c1-01","level":"C1","text":"The committee suggested him to revise the proposal.","wrongIndex":2,"fix":"that he","why_en":"Suggest is not normally followed by object + infinitive in this meaning; use “suggested that he revise” or “suggested revising”.","why_ar":"لا يأتي suggest عادةً مع مفعول ثم to + فعل؛ نستخدم suggested that he revise أو suggested revising."},
  {"id":"spot-c1-02","level":"C1","text":"The data indicates a substantial decline.","wrongIndex":1,"fix":"indicate","why_en":"In formal usage, “data” is often treated as a plural noun, taking “indicate”.","why_ar":"في الاستعمال الرسمي تُعامل data غالبًا كجمع، لذا نستخدم indicate."},
  {"id":"spot-c2-01","level":"C2","text":"Little did she knew how serious the consequences were.","wrongIndex":3,"fix":"know","why_en":"After the auxiliary “did”, use the base form “know”.","why_ar":"بعد did نستخدم الفعل بصيغته الأساسية know."},
  {"id":"spot-c2-02","level":"C2","text":"The evidence is too scant to warrants a definitive conclusion.","wrongIndex":6,"fix":"warrant","why_en":"The verb “warrant” takes a direct object here and is not followed by “of”.","why_ar":"الفعل warrant يأخذ مفعولًا مباشرًا هنا ولا يتبعه of."}

];
