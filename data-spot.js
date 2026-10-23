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
    "why_en": "The present perfect uses have/has + the past participle. The past participle of see is seen.",
    "why_ar": "يتكون المضارع التام من have/has والتصريف الثالث؛ والتصريف الثالث من see هو seen."
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
  },
  {
    "id": "spot-a1-09",
    "level": "A1",
    "text": "They is at home.",
    "wrongIndex": 1,
    "fix": "are",
    "why_en": "Use “are” with the plural subject “they”.",
    "why_ar": "نستخدم are مع الفاعل الجمع they."
  },
  {
    "id": "spot-a1-10",
    "level": "A1",
    "text": "I have two childs.",
    "wrongIndex": 3,
    "fix": "children.",
    "why_en": "The plural of child is children, not childs.",
    "why_ar": "جمع child هو children وليس childs."
  },
  {
    "id": "spot-a2-09",
    "level": "A2",
    "text": "She didn’t went to work yesterday.",
    "wrongIndex": 2,
    "fix": "go",
    "why_en": "After didn’t, use the base form of the verb.",
    "why_ar": "بعد didn’t نستخدم الفعل بصيغته الأساسية: go."
  },
  {
    "id": "spot-a2-10",
    "level": "A2",
    "text": "There are much people outside.",
    "wrongIndex": 2,
    "fix": "many",
    "why_en": "Use many with countable plural nouns such as people.",
    "why_ar": "نستخدم many مع الأسماء المعدودة الجمع مثل people."
  },
  {
    "id": "spot-b1-09",
    "level": "B1",
    "text": "I look forward to meet you.",
    "wrongIndex": 4,
    "fix": "meeting",
    "why_en": "“Look forward to” is followed by a noun or an -ing form.",
    "why_ar": "يتبع look forward to اسم أو فعل منتهٍ بـ ing."
  },
  {
    "id": "spot-b1-10",
    "level": "B1",
    "text": "If I would have more time, I would travel.",
    "wrongIndex": 2,
    "fix": "had",
    "why_en": "The second conditional uses past simple in the if-clause.",
    "why_ar": "في الشرط الثاني نستخدم الماضي البسيط في جملة if."
  },
  {
    "id": "spot-b2-09",
    "level": "B2",
    "text": "In spite the rain, the match continued.",
    "wrongIndex": 2,
    "fix": "of the",
    "why_en": "Despite is not followed by “of”; use “despite the rain” or “in spite of the rain”.",
    "why_ar": "لا يأتي of بعد despite؛ نقول despite the rain أو in spite of the rain."
  },
  {
    "id": "spot-b2-10",
    "level": "B2",
    "text": "Hardly I arrived when the phone rang.",
    "wrongIndex": 1,
    "fix": "had I",
    "why_en": "When “hardly” begins the sentence, use subject–auxiliary inversion.",
    "why_ar": "عندما تبدأ الجملة بـ Hardly نستخدم القلب: hardly had I arrived."
  },
  {
    "id": "spot-c1-01",
    "level": "C1",
    "text": "The committee suggested him to revise the proposal.",
    "wrongIndex": 2,
    "fix": "that he",
    "why_en": "Suggest is not normally followed by object + infinitive in this meaning; use “suggested that he revise” or “suggested revising”.",
    "why_ar": "لا يأتي suggest عادةً مع مفعول ثم to + فعل؛ نستخدم suggested that he revise أو suggested revising."
  },
  {
    "id": "spot-c1-02",
    "level": "C1",
    "text": "The data indicates a substantial decline.",
    "wrongIndex": 1,
    "fix": "indicate",
    "why_en": "In formal usage, “data” is often treated as a plural noun, taking “indicate”.",
    "why_ar": "في الاستعمال الرسمي تُعامل data غالبًا كجمع، لذا نستخدم indicate."
  },
  {
    "id": "spot-c2-01",
    "level": "C2",
    "text": "Little did she knew how serious the consequences were.",
    "wrongIndex": 3,
    "fix": "know",
    "why_en": "After the auxiliary “did”, use the base form “know”.",
    "why_ar": "بعد did نستخدم الفعل بصيغته الأساسية know."
  },
  {
    "id": "spot-c2-02",
    "level": "C2",
    "text": "The evidence is too scant to warrants a definitive conclusion.",
    "wrongIndex": 6,
    "fix": "warrant",
    "why_en": "The verb “warrant” takes a direct object here and is not followed by “of”.",
    "why_ar": "الفعل warrant يأخذ مفعولًا مباشرًا هنا ولا يتبعه of."
  },
  {
    "id": "spot-a1-11",
    "level": "A1",
    "text": "He don't like milk.",
    "wrongIndex": 1,
    "fix": "doesn't",
    "why_en": "With he, she, or it, use doesn't in the present simple negative.",
    "why_ar": "مع he أو she أو it نستخدم doesn't في النفي بالمضارع البسيط."
  },
  {
    "id": "spot-a1-12",
    "level": "A1",
    "text": "This are my keys.",
    "wrongIndex": 1,
    "fix": "is",
    "why_en": "Use is with the singular demonstrative this.",
    "why_ar": "نستخدم is مع اسم مفرد يبدأ بـ this."
  },
  {
    "id": "spot-a2-11",
    "level": "A2",
    "text": "We have lived here since five years.",
    "wrongIndex": 4,
    "fix": "for",
    "why_en": "Use for with a duration and since with a starting point.",
    "why_ar": "نستخدم for مع مدة زمنية وsince مع نقطة بداية."
  },
  {
    "id": "spot-a2-12",
    "level": "A2",
    "text": "There isn't some bread left.",
    "wrongIndex": 2,
    "fix": "any",
    "why_en": "In ordinary negative statements, use any rather than some.",
    "why_ar": "في النفي المعتاد نستخدم any بدل some."
  },
  {
    "id": "spot-b1-11",
    "level": "B1",
    "text": "I'm used to wake up early.",
    "wrongIndex": 3,
    "fix": "waking",
    "why_en": "“Be used to” is followed by a noun or an -ing form.",
    "why_ar": "يأتي بعد be used to اسم أو فعل منتهٍ بـ ing."
  },
  {
    "id": "spot-b1-12",
    "level": "B1",
    "text": "Despite of the traffic, we arrived on time.",
    "wrongIndex": 1,
    "fix": "remove of",
    "why_en": "Despite is followed directly by a noun phrase; do not add of.",
    "why_ar": "تأتي despite مباشرة قبل الاسم ولا نضيف of."
  },
  {
    "id": "spot-b2-11",
    "level": "B2",
    "text": "No sooner had we sat down when the lights went out.",
    "wrongIndex": 5,
    "fix": "than",
    "why_en": "The fixed pair is “no sooner … than”.",
    "why_ar": "التركيب الثابت هو no sooner … than."
  },
  {
    "id": "spot-b2-12",
    "level": "B2",
    "text": "She denied to have taken the documents.",
    "wrongIndex": 2,
    "fix": "having",
    "why_en": "Deny is followed by an -ing form, not a to-infinitive.",
    "why_ar": "يأتي بعد deny فعل منتهٍ بـ ing وليس مصدرًا مع to."
  },
  {
    "id": "spot-c1-03",
    "level": "C1",
    "text": "Had I knew about the delay, I would have called.",
    "wrongIndex": 2,
    "fix": "known",
    "why_en": "In third conditional inversion, use the past participle after had.",
    "why_ar": "في القلب الشرطي من النوع الثالث نستخدم التصريف الثالث بعد had."
  },
  {
    "id": "spot-c1-04",
    "level": "C1",
    "text": "The findings are comprised of three distinct stages.",
    "wrongIndex": 2,
    "fix": "comprise",
    "why_en": "In standard usage, comprise can take the parts directly; “are comprised of” is often avoided in formal editing.",
    "why_ar": "في التحرير الرسمي يُفضّل أن يأتي comprise مباشرةً قبل الأجزاء دون are/of."
  },
  {
    "id": "spot-c1-05",
    "level": "C1",
    "text": "Scarcely had the meeting begun than the alarm sounded.",
    "wrongIndex": 5,
    "fix": "when",
    "why_en": "The usual paired construction is “scarcely … when”.",
    "why_ar": "التركيب المعتاد هو scarcely … when."
  },
  {
    "id": "spot-c1-06",
    "level": "C1",
    "text": "Each of the proposals have been carefully reviewed.",
    "wrongIndex": 4,
    "fix": "has",
    "why_en": "The head of the subject is each, which takes a singular verb.",
    "why_ar": "رأس الفاعل هو each ولذلك يأخذ فعلًا مفردًا."
  },
  {
    "id": "spot-c2-03",
    "level": "C2",
    "text": "Were he to have knew the truth, he might have acted differently.",
    "wrongIndex": 4,
    "fix": "known",
    "why_en": "The perfect infinitive is “to have + past participle”.",
    "why_ar": "صيغة المصدر التام هي to have متبوعة بالتصريف الثالث."
  },
  {
    "id": "spot-c2-04",
    "level": "C2",
    "text": "Not only the report was inaccurate, but it was also incomplete.",
    "wrongIndex": 3,
    "fix": "was the report",
    "why_en": "When “not only” opens a clause, subject–auxiliary inversion is required.",
    "why_ar": "عندما تبدأ الجملة بـ Not only نستخدم القلب بين الفعل المساعد والفاعل."
  },
  {
    "id": "spot-c2-05",
    "level": "C2",
    "text": "The policy may have unforeseen implications, not least because it is predicated in assumptions.",
    "wrongIndex": 12,
    "fix": "on",
    "why_en": "The standard collocation is “predicated on”, meaning based on.",
    "why_ar": "التركيب الصحيح predicated on بمعنى قائم على."
  },
  {
    "id": "spot-c2-06",
    "level": "C2",
    "text": "Rarely the committee reached consensus so quickly.",
    "wrongIndex": 1,
    "fix": "has the committee",
    "why_en": "A fronted negative adverb such as rarely triggers inversion.",
    "why_ar": "الظرف السلبي Rarely في بداية الجملة يستلزم القلب."
  },
  {
    "id": "spot-a1-13",
    "level": "A1",
    "text": "She can sings very well.",
    "wrongIndex": 2,
    "fix": "sing",
    "why_en": "A modal verb such as can is followed by the base form.",
    "why_ar": "بعد الفعل الناقص can نستخدم الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-a1-14",
    "level": "A1",
    "text": "Those is my shoes.",
    "wrongIndex": 1,
    "fix": "are",
    "why_en": "Use are with the plural demonstrative those.",
    "why_ar": "نستخدم are مع اسم الإشارة للجمع those."
  },
  {
    "id": "spot-a2-13",
    "level": "A2",
    "text": "I am interested on science.",
    "wrongIndex": 3,
    "fix": "in",
    "why_en": "The standard collocation is interested in.",
    "why_ar": "التركيب الصحيح هو interested in."
  },
  {
    "id": "spot-a2-14",
    "level": "A2",
    "text": "He has visited Paris last year.",
    "wrongIndex": 1,
    "fix": "remove has",
    "why_en": "A finished past-time expression such as last year normally takes the past simple.",
    "why_ar": "مع زمن ماضٍ منتهٍ مثل last year نستخدم الماضي البسيط عادةً."
  },
  {
    "id": "spot-b1-13",
    "level": "B1",
    "text": "If I knew the answer, I will tell you.",
    "wrongIndex": 6,
    "fix": "would",
    "why_en": "The second conditional uses would in the result clause.",
    "why_ar": "في الشرط من النوع الثاني نستخدم would في جملة النتيجة."
  },
  {
    "id": "spot-b1-14",
    "level": "B1",
    "text": "The film was bored, so we left.",
    "wrongIndex": 3,
    "fix": "boring,",
    "why_en": "Boring describes the thing that causes boredom; bored describes a person's feeling.",
    "why_ar": "Boring تصف الشيء المسبب للملل، أما bored فتصف شعور الشخص."
  },
  {
    "id": "spot-b2-13",
    "level": "B2",
    "text": "Despite he was exhausted, he continued working.",
    "wrongIndex": 0,
    "fix": "Although",
    "why_en": "Use although before a full clause; despite is followed by a noun or -ing form.",
    "why_ar": "نستخدم although قبل جملة كاملة، أما despite فيأتي بعدها اسم أو فعل ing."
  },
  {
    "id": "spot-b2-14",
    "level": "B2",
    "text": "She speaks English as if she is a native speaker, but she only started last year.",
    "wrongIndex": 6,
    "fix": "were",
    "why_en": "For an unreal comparison, as if + were is common in formal English.",
    "why_ar": "للتشبيه غير الحقيقي، يُستخدم were بعد as if في الإنجليزية الرسمية."
  },
  {
    "id": "spot-c1-07",
    "level": "C1",
    "text": "Were the company to expands abroad, costs would rise.",
    "wrongIndex": 4,
    "fix": "expand",
    "why_en": "After the infinitive marker to, use the base form of the verb.",
    "why_ar": "بعد to في المصدر نستخدم الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-c1-08",
    "level": "C1",
    "text": "The report gives rise for serious concerns.",
    "wrongIndex": 4,
    "fix": "to",
    "why_en": "The fixed phrase is “give rise to”.",
    "why_ar": "التعبير الثابت هو give rise to."
  },
  {
    "id": "spot-c2-07",
    "level": "C2",
    "text": "So intricate was the mechanism that few could explained it.",
    "wrongIndex": 8,
    "fix": "explain",
    "why_en": "When “so + adjective” is fronted, use subject–auxiliary inversion.",
    "why_ar": "عند تقديم so + صفة نستخدم القلب بين الفاعل والفعل المساعد."
  },
  {
    "id": "spot-c2-08",
    "level": "C2",
    "text": "The argument rests on a premise whose validity has yet to be substantiate.",
    "wrongIndex": 12,
    "fix": "substantiated.",
    "why_en": "After “has yet to be”, use the past participle in the passive.",
    "why_ar": "بعد has yet to be نستخدم التصريف الثالث للمبني للمجهول."
  },
  {
    "id": "spot-a1-15",
    "level": "A1",
    "text": "My brother have a bicycle.",
    "wrongIndex": 2,
    "fix": "has",
    "why_en": "Use has with he, she, and it in the present simple.",
    "why_ar": "نستخدم has مع he وshe وit في المضارع البسيط."
  },
  {
    "id": "spot-a1-16",
    "level": "A1",
    "text": "We are go to school now.",
    "wrongIndex": 2,
    "fix": "going",
    "why_en": "The present continuous uses be + verb-ing.",
    "why_ar": "يتكون المضارع المستمر من be والفعل المنتهي بـ ing."
  },
  {
    "id": "spot-a2-15",
    "level": "A2",
    "text": "I didn't saw him yesterday.",
    "wrongIndex": 2,
    "fix": "see",
    "why_en": "After did or didn't, use the base form of the verb.",
    "why_ar": "بعد did أو didn't نستخدم الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-a2-16",
    "level": "A2",
    "text": "This bag is more cheaper than that one.",
    "wrongIndex": 3,
    "fix": "remove more",
    "why_en": "Do not use more with a comparative adjective already ending in -er.",
    "why_ar": "لا نستخدم more مع صفة مقارنة تنتهي أصلًا بـ er."
  },
  {
    "id": "spot-b1-15",
    "level": "B1",
    "text": "I have been here since three hours.",
    "wrongIndex": 4,
    "fix": "for",
    "why_en": "Use for with a duration and since with a starting point.",
    "why_ar": "نستخدم for مع المدة وsince مع نقطة البداية."
  },
  {
    "id": "spot-b1-16",
    "level": "B1",
    "text": "She asked me where was going.",
    "wrongIndex": 4,
    "fix": "I was",
    "why_en": "Reported questions use statement word order: subject before verb.",
    "why_ar": "في الأسئلة المنقولة نستخدم ترتيب الجملة الخبرية: الفاعل ثم الفعل."
  },
  {
    "id": "spot-b2-15",
    "level": "B2",
    "text": "Had I known earlier, I would tell you yesterday.",
    "wrongIndex": 6,
    "fix": "have told",
    "why_en": "A past unreal condition uses would have + past participle in the result clause.",
    "why_ar": "في الشرط غير الحقيقي عن الماضي نستخدم would have والتصريف الثالث في النتيجة."
  },
  {
    "id": "spot-b2-16",
    "level": "B2",
    "text": "The manager insisted on us leave early.",
    "wrongIndex": 5,
    "fix": "leaving",
    "why_en": "Use insist that + clause, or insist on + noun/-ing form.",
    "why_ar": "نستخدم insist that مع جملة، أو insist on مع اسم أو فعل ing."
  },
  {
    "id": "spot-c1-09",
    "level": "C1",
    "text": "Not until the data was analysed did the pattern became clear.",
    "wrongIndex": 9,
    "fix": "become",
    "why_en": "A fronted not until phrase triggers inversion in the main clause.",
    "why_ar": "عند بدء الجملة بـ Not until يحدث القلب في الجملة الرئيسية."
  },
  {
    "id": "spot-c1-10",
    "level": "C1",
    "text": "The findings are at odds to the initial hypothesis.",
    "wrongIndex": 5,
    "fix": "with",
    "why_en": "The fixed expression is at odds with.",
    "why_ar": "التعبير الثابت هو at odds with."
  },
  {
    "id": "spot-c2-09",
    "level": "C2",
    "text": "Under no circumstances should the files shared.",
    "wrongIndex": 6,
    "fix": "be shared.",
    "why_en": "A negative phrase at the beginning requires subject–auxiliary inversion.",
    "why_ar": "العبارة السلبية في البداية تستلزم القلب بين الفعل المساعد والفاعل."
  },
  {
    "id": "spot-c2-10",
    "level": "C2",
    "text": "The proposal is contingent of external approval.",
    "wrongIndex": 4,
    "fix": "on",
    "why_en": "The standard collocation is contingent on.",
    "why_ar": "التركيب الصحيح هو contingent on."
  },
  {
    "id": "spot-a1-17",
    "level": "A1",
    "text": "She don't like tea.",
    "wrongIndex": 1,
    "fix": "doesn't",
    "why_en": "Use doesn't with she in the present simple.",
    "why_ar": "نستخدم doesn't مع she في المضارع البسيط."
  },
  {
    "id": "spot-a1-18",
    "level": "A1",
    "text": "There are a cat under the chair.",
    "wrongIndex": 1,
    "fix": "is",
    "why_en": "Use is with a singular noun phrase.",
    "why_ar": "نستخدم is مع الاسم المفرد."
  },
  {
    "id": "spot-a1-19",
    "level": "A1",
    "text": "He go to work by bus.",
    "wrongIndex": 1,
    "fix": "goes",
    "why_en": "Third-person singular takes -s in the present simple.",
    "why_ar": "نضيف s للفعل مع الغائب المفرد في المضارع البسيط."
  },
  {
    "id": "spot-a1-20",
    "level": "A1",
    "text": "I am twelve year old.",
    "wrongIndex": 3,
    "fix": "years",
    "why_en": "Use the plural noun years after twelve.",
    "why_ar": "نستخدم years بالجمع بعد twelve."
  },
  {
    "id": "spot-a2-17",
    "level": "A2",
    "text": "We was tired after the trip.",
    "wrongIndex": 1,
    "fix": "were",
    "why_en": "Use were with we.",
    "why_ar": "نستخدم were مع we."
  },
  {
    "id": "spot-a2-18",
    "level": "A2",
    "text": "She is good in mathematics.",
    "wrongIndex": 3,
    "fix": "at",
    "why_en": "The usual collocation is good at a subject or skill.",
    "why_ar": "التركيب الشائع هو good at."
  },
  {
    "id": "spot-a2-19",
    "level": "A2",
    "text": "I have saw him before.",
    "wrongIndex": 2,
    "fix": "seen",
    "why_en": "Present perfect uses have + past participle, so saw must be seen.",
    "why_ar": "يتكون المضارع التام من have والتصريف الثالث، لذا تصبح saw هي seen."
  },
  {
    "id": "spot-a2-20",
    "level": "A2",
    "text": "There isn't some bread left.",
    "wrongIndex": 2,
    "fix": "any",
    "why_en": "Any is normally used in negative statements like this.",
    "why_ar": "نستخدم any عادةً في الجمل المنفية مثل هذه."
  },
  {
    "id": "spot-b1-17",
    "level": "B1",
    "text": "She suggested take a taxi.",
    "wrongIndex": 2,
    "fix": "taking",
    "why_en": "Suggest is followed by an -ing form or a that-clause.",
    "why_ar": "يأتي بعد suggest فعل ing أو جملة تبدأ بـ that."
  },
  {
    "id": "spot-b1-18",
    "level": "B1",
    "text": "I look forward to hear from you.",
    "wrongIndex": 4,
    "fix": "hearing",
    "why_en": "In look forward to, to is a preposition followed by -ing.",
    "why_ar": "في look forward to يأتي بعد to فعل ing."
  },
  {
    "id": "spot-b1-19",
    "level": "B1",
    "text": "He explained the problem me.",
    "wrongIndex": 4,
    "fix": "to me",
    "why_en": "Explain something to someone is the standard pattern.",
    "why_ar": "التركيب الصحيح explain something to someone."
  },
  {
    "id": "spot-b1-20",
    "level": "B1",
    "text": "Despite of the traffic, we arrived early.",
    "wrongIndex": 0,
    "fix": "In spite",
    "why_en": "Use in spite of, or despite without of.",
    "why_ar": "نستخدم in spite of أو despite دون of."
  },
  {
    "id": "spot-b2-17",
    "level": "B2",
    "text": "The results depend of several factors.",
    "wrongIndex": 3,
    "fix": "on",
    "why_en": "The fixed collocation is depend on.",
    "why_ar": "التركيب الصحيح depend on."
  },
  {
    "id": "spot-b2-18",
    "level": "B2",
    "text": "She denied take the document.",
    "wrongIndex": 2,
    "fix": "taking",
    "why_en": "Deny is followed by an -ing form.",
    "why_ar": "يأتي بعد deny فعل ing."
  },
  {
    "id": "spot-b2-19",
    "level": "B2",
    "text": "Not only did she missed the train, but she lost her ticket.",
    "wrongIndex": 4,
    "fix": "miss",
    "why_en": "After did, use the base form of the verb.",
    "why_ar": "بعد did نستخدم الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-b2-20",
    "level": "B2",
    "text": "The proposal aims at reduce waste.",
    "wrongIndex": 4,
    "fix": "reducing",
    "why_en": "After a preposition such as at, use the -ing form.",
    "why_ar": "بعد حرف جر مثل at نستخدم فعل ing."
  },
  {
    "id": "spot-c1-11",
    "level": "C1",
    "text": "The board insisted that he submits the report immediately.",
    "wrongIndex": 5,
    "fix": "submit",
    "why_en": "The mandative subjunctive uses the base form after insist that.",
    "why_ar": "يأتي الفعل بصيغته الأساسية بعد insist that في هذا التركيب الرسمي."
  },
  {
    "id": "spot-c1-12",
    "level": "C1",
    "text": "Scarcely had we arrived than the storm began.",
    "wrongIndex": 4,
    "fix": "when",
    "why_en": "The standard pair is scarcely...when.",
    "why_ar": "التركيب القياسي هو scarcely...when."
  },
  {
    "id": "spot-c1-13",
    "level": "C1",
    "text": "The extent to which these claims are valid remain unclear.",
    "wrongIndex": 8,
    "fix": "remains",
    "why_en": "The grammatical subject of remain is the singular extent.",
    "why_ar": "الفاعل النحوي هو extent المفرد، لذلك نستخدم remains."
  },
  {
    "id": "spot-c1-14",
    "level": "C1",
    "text": "The new policy is liable of cause confusion.",
    "wrongIndex": 5,
    "fix": "to",
    "why_en": "The standard phrase is liable to do something.",
    "why_ar": "التعبير الصحيح liable to يتبعه الفعل."
  },
  {
    "id": "spot-c1-15",
    "level": "C1",
    "text": "Were it not for her advice, I would have make a costly mistake.",
    "wrongIndex": 9,
    "fix": "made",
    "why_en": "Would have is followed by the past participle.",
    "why_ar": "يأتي بعد would have التصريف الثالث."
  },
  {
    "id": "spot-c1-16",
    "level": "C1",
    "text": "The author alludes on a well-known philosophical debate.",
    "wrongIndex": 3,
    "fix": "to",
    "why_en": "The verb allude takes the preposition to.",
    "why_ar": "يأتي بعد allude حرف الجر to."
  },
  {
    "id": "spot-c1-17",
    "level": "C1",
    "text": "Only when the figures were checked did the discrepancy emerged.",
    "wrongIndex": 9,
    "fix": "emerge.",
    "why_en": "After did, use the base form of the verb.",
    "why_ar": "بعد did نستخدم الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-c1-18",
    "level": "C1",
    "text": "The findings lend credence for the hypothesis.",
    "wrongIndex": 4,
    "fix": "to",
    "why_en": "The fixed phrase is lend credence to.",
    "why_ar": "التعبير الصحيح lend credence to."
  },
  {
    "id": "spot-c1-19",
    "level": "C1",
    "text": "It is essential that every applicant is informed promptly.",
    "wrongIndex": 6,
    "fix": "be",
    "why_en": "Formal mandative clauses often use the base-form subjunctive be.",
    "why_ar": "في الأسلوب الرسمي قد نستخدم be بصيغته الأساسية بعد essential that."
  },
  {
    "id": "spot-c1-20",
    "level": "C1",
    "text": "The two accounts are mutually exclusive to one another.",
    "wrongIndex": 6,
    "fix": "of",
    "why_en": "The phrase “mutually exclusive of one another” is standard.",
    "why_ar": "التعبير المقبول هو mutually exclusive of one another."
  },
  {
    "id": "spot-c2-11",
    "level": "C2",
    "text": "Little did she realised how consequential the decision would be.",
    "wrongIndex": 3,
    "fix": "realise",
    "why_en": "After did, use the base form of the verb.",
    "why_ar": "بعد did نستخدم الفعل بصيغته الأساسية."
  },
  {
    "id": "spot-c2-12",
    "level": "C2",
    "text": "The claim is predicated in an assumption that remains untested.",
    "wrongIndex": 4,
    "fix": "on",
    "why_en": "The formal collocation is predicated on.",
    "why_ar": "التركيب الرسمي الصحيح predicated on."
  },
  {
    "id": "spot-c2-13",
    "level": "C2",
    "text": "Be that as it may, the evidence do not support the conclusion.",
    "wrongIndex": 7,
    "fix": "does",
    "why_en": "Evidence is an uncountable noun and takes a singular verb here.",
    "why_ar": "Evidence اسم غير معدود ويأخذ فعلًا مفردًا هنا."
  },
  {
    "id": "spot-c2-14",
    "level": "C2",
    "text": "The theory is not so much disproven than inadequately supported.",
    "wrongIndex": 7,
    "fix": "as",
    "why_en": "The contrastive construction is not so much X as Y.",
    "why_ar": "التركيب المقابل هو not so much X as Y."
  },
  {
    "id": "spot-c2-15",
    "level": "C2",
    "text": "Had the issue been addressed, the consequences may have been less severe.",
    "wrongIndex": 7,
    "fix": "might",
    "why_en": "For a past counterfactual, might have is the coherent result form here.",
    "why_ar": "في الافتراض المخالف للماضي، تكون might have متناسقة هنا."
  },
  {
    "id": "spot-c2-16",
    "level": "C2",
    "text": "The distinction is subtle, not to say imperceptiblely.",
    "wrongIndex": 7,
    "fix": "imperceptible.",
    "why_en": "Use the adjective imperceptible to describe the distinction.",
    "why_ar": "نستخدم الصفة imperceptible لوصف distinction."
  },
  {
    "id": "spot-c2-17",
    "level": "C2",
    "text": "Under no circumstances the confidential data be disclosed.",
    "wrongIndex": 3,
    "fix": "should the",
    "why_en": "A negative fronted phrase requires subject–auxiliary inversion.",
    "why_ar": "العبارة السلبية في البداية تستلزم القلب."
  },
  {
    "id": "spot-c2-18",
    "level": "C2",
    "text": "The argument is compelling insofar than it accounts for the exceptions.",
    "wrongIndex": 5,
    "fix": "as",
    "why_en": "The standard conjunction is insofar as.",
    "why_ar": "التركيب الصحيح insofar as."
  },
  {
    "id": "spot-c2-19",
    "level": "C2",
    "text": "Such was the ambiguity that neither interpretation could be rule out.",
    "wrongIndex": 9,
    "fix": "ruled",
    "why_en": "The passive infinitive requires the past participle ruled out.",
    "why_ar": "يتطلب المبني للمجهول التصريف الثالث ruled out."
  },
  {
    "id": "spot-c2-20",
    "level": "C2",
    "text": "The recommendation rests on premises whose implications has yet to be explored.",
    "wrongIndex": 7,
    "fix": "have",
    "why_en": "The plural subject implications takes have.",
    "why_ar": "الفاعل implications جمع، لذلك نستخدم have."
  }
];
