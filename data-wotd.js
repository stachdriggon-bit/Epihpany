/* Word of the Day: independent vocabulary data. */
const WOTD_WORDS = [
  {
    "word": "notice",
    "pronunciation": "NOH-tis",
    "meaning": "to become aware of something",
    "meaning_ar": "يلاحظ",
    "level": "A1",
    "example": "I noticed a small change.",
    "example_ar": "لاحظت تغييرًا صغيرًا.",
    "origin": "From Latin notitia, meaning knowledge.",
    "origin_ar": "من اللاتينية notitia، وتعني المعرفة."
  },
  {
    "word": "improve",
    "pronunciation": "im-PROOV",
    "meaning": "to make or become better",
    "meaning_ar": "يحسّن",
    "level": "A1",
    "example": "I want to improve my English.",
    "example_ar": "أريد تحسين لغتي الإنجليزية.",
    "origin": "From Old French emprower, linked to making progress.",
    "origin_ar": "من الفرنسية القديمة، وترتبط بإحراز التقدم."
  },
  {
    "word": "curious",
    "pronunciation": "KYOOR-ee-us",
    "meaning": "eager to know or learn",
    "meaning_ar": "فضولي",
    "level": "A1",
    "example": "She is curious about science.",
    "example_ar": "إنها فضولية بشأن العلوم.",
    "origin": "From Latin curiosus, meaning careful or inquisitive.",
    "origin_ar": "من اللاتينية curiosus، وتدل على حب الاستطلاع."
  },
  {
    "word": "journey",
    "pronunciation": "JUR-nee",
    "meaning": "an act of travelling from one place to another",
    "meaning_ar": "رحلة",
    "level": "A1",
    "example": "Learning is a long journey.",
    "example_ar": "التعلّم رحلة طويلة.",
    "origin": "Historically linked to a day's travel.",
    "origin_ar": "ارتبطت تاريخيًا بالسفر الذي يستغرق يومًا."
  },
  {
    "word": "choose",
    "pronunciation": "chooz",
    "meaning": "to decide which thing you want",
    "meaning_ar": "يختار",
    "level": "A1",
    "example": "Choose the answer that fits.",
    "example_ar": "اختر الإجابة المناسبة.",
    "origin": "From Old English ceosan.",
    "origin_ar": "من الإنجليزية القديمة ceosan."
  },
  {
    "word": "habit",
    "pronunciation": "HAB-it",
    "meaning": "something you do regularly",
    "meaning_ar": "عادة",
    "level": "A1",
    "example": "Reading is a useful habit.",
    "example_ar": "القراءة عادة مفيدة.",
    "origin": "From Latin habitus, meaning condition or manner.",
    "origin_ar": "من اللاتينية habitus، وتعني الحالة أو الطريقة."
  },
  {
    "word": "share",
    "pronunciation": "shair",
    "meaning": "to give part of something to others",
    "meaning_ar": "يشارك",
    "level": "A1",
    "example": "We share ideas in class.",
    "example_ar": "نتبادل الأفكار في الصف.",
    "origin": "Related to the idea of dividing or distributing.",
    "origin_ar": "مرتبطة بفكرة التقسيم أو التوزيع."
  },
  {
    "word": "simple",
    "pronunciation": "SIM-pul",
    "meaning": "easy to understand or do",
    "meaning_ar": "بسيط",
    "level": "A1",
    "example": "Keep your explanation simple.",
    "example_ar": "اجعل شرحك بسيطًا.",
    "origin": "From Latin simplex, meaning single or uncomplicated.",
    "origin_ar": "من اللاتينية simplex، وتعني غير معقّد."
  },
  {
    "word": "careful",
    "pronunciation": "KAIR-ful",
    "meaning": "giving attention to avoid mistakes",
    "meaning_ar": "حذر",
    "level": "A1",
    "example": "Be careful with spelling.",
    "example_ar": "كن حذرًا في التهجئة.",
    "origin": "Built from care + -ful.",
    "origin_ar": "تتكوّن من care بمعنى العناية واللاحقة -ful."
  },
  {
    "word": "practice",
    "pronunciation": "PRAK-tis",
    "meaning": "repeated activity to improve a skill",
    "meaning_ar": "ممارسة",
    "level": "A1",
    "example": "A little practice helps every day.",
    "example_ar": "القليل من التدريب يفيد كل يوم.",
    "origin": "The noun spelling practice ends in -ice.",
    "origin_ar": "في الاسم practice تنتهي التهجئة بـ -ice."
  },
  {
    "word": "achieve",
    "pronunciation": "uh-CHEEV",
    "meaning": "to succeed in doing something",
    "meaning_ar": "يحقق",
    "level": "A2",
    "example": "You can achieve your goal.",
    "origin": "From Old French achever, to bring to an end."
  },
  {
    "word": "support",
    "pronunciation": "suh-PORT",
    "meaning": "to help or encourage someone",
    "meaning_ar": "يدعم",
    "level": "A2",
    "example": "My friends support my goals.",
    "origin": "From Latin supportare, to carry from below."
  },
  {
    "word": "avoid",
    "pronunciation": "uh-VOID",
    "meaning": "to stay away from something",
    "meaning_ar": "يتجنب",
    "level": "A2",
    "example": "Avoid translating every word literally.",
    "origin": "From Old French esvuidier."
  },
  {
    "word": "suggest",
    "pronunciation": "sug-JEST",
    "meaning": "to offer an idea for consideration",
    "meaning_ar": "يقترح",
    "level": "A2",
    "example": "I suggest taking a short break.",
    "origin": "From Latin suggerere, to bring up."
  },
  {
    "word": "depend",
    "pronunciation": "dih-PEND",
    "meaning": "to be decided or affected by something",
    "meaning_ar": "يعتمد",
    "level": "A2",
    "example": "The result depends on your effort.",
    "origin": "The phrase depend on has a fixed preposition."
  },
  {
    "word": "compare",
    "pronunciation": "kum-PAIR",
    "meaning": "to examine similarities and differences",
    "meaning_ar": "يقارن",
    "level": "A2",
    "example": "Compare the two sentences.",
    "origin": "From Latin comparare, to pair together."
  },
  {
    "word": "confident",
    "pronunciation": "KON-fi-dunt",
    "meaning": "believing in your ability",
    "meaning_ar": "واثق",
    "level": "A2",
    "example": "She feels confident speaking English.",
    "origin": "From Latin confidere, to trust."
  },
  {
    "word": "purpose",
    "pronunciation": "PUR-pus",
    "meaning": "the reason for doing something",
    "meaning_ar": "هدف أو غرض",
    "level": "A2",
    "example": "What is the purpose of this task?",
    "origin": "From Latin propositum, an intention."
  },
  {
    "word": "discover",
    "pronunciation": "dis-KUV-er",
    "meaning": "to find something unexpectedly or for the first time",
    "meaning_ar": "يكتشف",
    "level": "A2",
    "example": "We discovered a better method.",
    "origin": "Literally related to uncovering what was hidden."
  },
  {
    "word": "patient",
    "pronunciation": "PAY-shunt",
    "meaning": "able to wait calmly",
    "meaning_ar": "صبور",
    "level": "A2",
    "example": "Be patient with yourself.",
    "origin": "From Latin patientia, the ability to endure."
  },
  {
    "word": "accurate",
    "pronunciation": "AK-yuh-rut",
    "meaning": "correct and without mistakes",
    "meaning_ar": "دقيق",
    "level": "B1",
    "example": "The report must be accurate.",
    "origin": "From Latin accuratus, done with care."
  },
  {
    "word": "assume",
    "pronunciation": "uh-SOOM",
    "meaning": "to accept something as true without proof",
    "meaning_ar": "يفترض",
    "level": "B1",
    "example": "Do not assume the answer.",
    "origin": "From Latin assumere, to take up."
  },
  {
    "word": "approach",
    "pronunciation": "uh-PROHCH",
    "meaning": "a way of dealing with something",
    "meaning_ar": "نهج أو طريقة",
    "level": "B1",
    "example": "Try a different approach.",
    "origin": "From French approcher, to come near."
  },
  {
    "word": "evidence",
    "pronunciation": "EV-i-duns",
    "meaning": "facts that support a conclusion",
    "meaning_ar": "دليل",
    "level": "B1",
    "example": "The evidence supports the claim.",
    "origin": "From Latin evidentia, clearness."
  },
  {
    "word": "maintain",
    "pronunciation": "mayn-TAYN",
    "meaning": "to keep something in good condition or continue it",
    "meaning_ar": "يحافظ على",
    "level": "B1",
    "example": "Maintain a steady learning routine.",
    "origin": "From Latin manu tenere, to hold in the hand."
  },
  {
    "word": "reliable",
    "pronunciation": "ri-LY-uh-bul",
    "meaning": "able to be trusted",
    "meaning_ar": "موثوق",
    "level": "B1",
    "example": "Use a reliable source.",
    "origin": "From rely + -able."
  },
  {
    "word": "consequence",
    "pronunciation": "KON-si-kwens",
    "meaning": "a result of an action",
    "meaning_ar": "نتيجة",
    "level": "B1",
    "example": "Every choice has a consequence.",
    "origin": "From Latin consequi, to follow."
  },
  {
    "word": "perspective",
    "pronunciation": "per-SPEK-tiv",
    "meaning": "a particular way of seeing something",
    "meaning_ar": "وجهة نظر",
    "level": "B1",
    "example": "Try to understand her perspective.",
    "origin": "From Latin perspicere, to look through."
  },
  {
    "word": "significant",
    "pronunciation": "sig-NIF-i-kunt",
    "meaning": "important or large enough to matter",
    "meaning_ar": "مهم أو ملحوظ",
    "level": "B1",
    "example": "We noticed a significant improvement.",
    "origin": "From Latin significare, to indicate."
  },
  {
    "word": "clarify",
    "pronunciation": "KLAIR-uh-fy",
    "meaning": "to make something easier to understand",
    "meaning_ar": "يوضّح",
    "level": "B1",
    "example": "Could you clarify your point?",
    "origin": "From Latin clarus, clear."
  },
  {
    "word": "subtle",
    "pronunciation": "SUT-ul",
    "meaning": "not obvious but important",
    "meaning_ar": "دقيق أو خفي",
    "level": "B2",
    "example": "There is a subtle difference in meaning.",
    "origin": "From Latin subtilis, finely woven."
  },
  {
    "word": "coherent",
    "pronunciation": "koh-HEER-unt",
    "meaning": "logical and well organised",
    "meaning_ar": "مترابط ومنطقي",
    "level": "B2",
    "example": "Write a coherent paragraph.",
    "origin": "From Latin cohaerere, to stick together."
  },
  {
    "word": "ambiguous",
    "pronunciation": "am-BIG-yoo-us",
    "meaning": "having more than one possible meaning",
    "meaning_ar": "ملتبس",
    "level": "B2",
    "example": "The instruction is ambiguous.",
    "origin": "From Latin ambiguus, uncertain."
  },
  {
    "word": "inevitable",
    "pronunciation": "in-EV-i-tuh-bul",
    "meaning": "certain to happen",
    "meaning_ar": "حتمي",
    "level": "B2",
    "example": "Mistakes are an inevitable part of learning.",
    "origin": "From Latin inevitabilis, unavoidable."
  },
  {
    "word": "justify",
    "pronunciation": "JUS-ti-fy",
    "meaning": "to give a good reason for something",
    "meaning_ar": "يبرر",
    "level": "B2",
    "example": "Can you justify your choice?",
    "origin": "From Latin justificare, to do justice."
  },
  {
    "word": "reluctant",
    "pronunciation": "ri-LUK-tunt",
    "meaning": "unwilling or hesitant",
    "meaning_ar": "متردد أو غير راغب",
    "level": "B2",
    "example": "He was reluctant to speak first.",
    "origin": "From Latin reluctari, to struggle against."
  },
  {
    "word": "precise",
    "pronunciation": "pri-SYSE",
    "meaning": "exact and accurate",
    "meaning_ar": "دقيق",
    "level": "B2",
    "example": "Choose a precise word.",
    "origin": "From Latin praecidere, to cut off."
  },
  {
    "word": "distinguish",
    "pronunciation": "dis-TING-gwish",
    "meaning": "to recognise a difference",
    "meaning_ar": "يميّز",
    "level": "B2",
    "example": "Distinguish fact from opinion.",
    "origin": "From Latin distinguere, to separate."
  },
  {
    "word": "interpret",
    "pronunciation": "in-TUR-prit",
    "meaning": "to explain the meaning of something",
    "meaning_ar": "يفسّر",
    "level": "B2",
    "example": "How do you interpret this sentence?",
    "origin": "From Latin interpretari."
  },
  {
    "word": "convey",
    "pronunciation": "kun-VAY",
    "meaning": "to communicate or express something",
    "meaning_ar": "ينقل أو يعبّر عن",
    "level": "B2",
    "example": "Her tone conveys confidence.",
    "origin": "From Latin conveyere, to carry together."
  },
  {
    "word": "elaborate",
    "pronunciation": "ih-LAB-uh-rayt",
    "meaning": "to explain or develop in more detail",
    "meaning_ar": "يفصّل",
    "level": "C1",
    "example": "Could you elaborate on that idea?",
    "origin": "From Latin elaborare, to work out."
  },
  {
    "word": "inference",
    "pronunciation": "IN-fur-uns",
    "meaning": "a conclusion based on evidence",
    "meaning_ar": "استنتاج",
    "level": "C1",
    "example": "That inference is reasonable.",
    "origin": "From Latin inferre, to bring in."
  },
  {
    "word": "resilient",
    "pronunciation": "ri-ZIL-yunt",
    "meaning": "able to recover after difficulty",
    "meaning_ar": "قادر على التعافي",
    "level": "C1",
    "example": "A resilient learner keeps trying.",
    "origin": "From Latin resilire, to spring back."
  },
  {
    "word": "plausible",
    "pronunciation": "PLAW-zuh-bul",
    "meaning": "seeming reasonable or likely",
    "meaning_ar": "معقول",
    "level": "C1",
    "example": "That is a plausible explanation.",
    "origin": "From Latin plausibilis, worthy of applause."
  },
  {
    "word": "contemplate",
    "pronunciation": "KON-tum-playt",
    "meaning": "to think deeply about something",
    "meaning_ar": "يتأمل",
    "level": "C1",
    "example": "Take a moment to contemplate the question.",
    "origin": "From Latin contemplari, to observe."
  },
  {
    "word": "articulate",
    "pronunciation": "ar-TIK-yuh-lut",
    "meaning": "to express ideas clearly",
    "meaning_ar": "يعبّر بوضوح",
    "level": "C1",
    "example": "She can articulate complex ideas.",
    "origin": "From Latin articulare, to divide into joints."
  },
  {
    "word": "mitigate",
    "pronunciation": "MIT-i-gayt",
    "meaning": "to make something less harmful or severe",
    "meaning_ar": "يخفف",
    "level": "C1",
    "example": "Good planning can mitigate risk.",
    "origin": "From Latin mitigare, to soften."
  },
  {
    "word": "nuance",
    "pronunciation": "NOO-ahns",
    "meaning": "a small difference in meaning or feeling",
    "meaning_ar": "فرق دقيق في المعنى",
    "level": "C1",
    "example": "The translation misses a nuance.",
    "origin": "From French nuance, a shade of colour."
  },
  {
    "word": "intricate",
    "pronunciation": "IN-tri-kit",
    "meaning": "having many detailed parts",
    "meaning_ar": "معقد التفاصيل",
    "level": "C1",
    "example": "The machine has an intricate design.",
    "origin": "From Latin intricatus, entangled."
  },
  {
    "word": "foster",
    "pronunciation": "FOS-tur",
    "meaning": "to encourage development",
    "meaning_ar": "يعزز أو ينمّي",
    "level": "C1",
    "example": "Good feedback can foster confidence.",
    "origin": "From Old English fostrian, to nourish."
  },
  {
    "word": "derive",
    "pronunciation": "di-RYVE",
    "meaning": "to obtain something from a source",
    "meaning_ar": "يشتق أو يستمد",
    "level": "C2",
    "example": "Many words derive from Latin.",
    "origin": "From Latin derivare, to lead off."
  },
  {
    "word": "sustain",
    "pronunciation": "suh-STAYN",
    "meaning": "to keep something going over time",
    "meaning_ar": "يحافظ على الاستمرار",
    "level": "C2",
    "example": "Small habits sustain progress.",
    "origin": "From Latin sustinere, to hold up."
  },
  {
    "word": "compelling",
    "pronunciation": "kum-PEL-ing",
    "meaning": "very convincing or interesting",
    "meaning_ar": "مقنع",
    "level": "C2",
    "example": "She gave a compelling argument.",
    "origin": "From compel, ultimately Latin compellere."
  },
  {
    "word": "framework",
    "pronunciation": "FRAYM-wurk",
    "meaning": "a basic structure supporting an idea or system",
    "meaning_ar": "إطار عمل",
    "level": "C2",
    "example": "Use a framework to organise your essay.",
    "origin": "Frame + work describes a supporting structure."
  },
  {
    "word": "furthermore",
    "pronunciation": "FUR-thur-mor",
    "meaning": "in addition to what was already said",
    "meaning_ar": "علاوة على ذلك",
    "level": "C2",
    "example": "Furthermore, the results were consistent.",
    "origin": "Formed from further + more."
  },
  {
    "word": "whereas",
    "pronunciation": "wair-AZ",
    "meaning": "used to contrast two facts",
    "meaning_ar": "بينما",
    "level": "C2",
    "example": "I prefer tea, whereas he likes coffee.",
    "origin": "Where + as developed into a contrast connector."
  },
  {
    "word": "conversely",
    "pronunciation": "kun-VURS-lee",
    "meaning": "in an opposite way",
    "meaning_ar": "على العكس",
    "level": "C2",
    "example": "Conversely, the second method was slower.",
    "origin": "From Latin conversus, turned around."
  },
  {
    "word": "undermine",
    "pronunciation": "un-dur-MYNE",
    "meaning": "to weaken gradually or indirectly",
    "meaning_ar": "يقوّض",
    "level": "C2",
    "example": "One error can undermine the argument.",
    "origin": "Originally linked to digging beneath a structure."
  },
  {
    "word": "endeavour",
    "pronunciation": "en-DEV-ur",
    "meaning": "an attempt to do something difficult",
    "meaning_ar": "مسعى",
    "level": "C2",
    "example": "Learning a language is a worthwhile endeavour.",
    "origin": "From Old French endever, to make an effort."
  },
  {
    "word": "profound",
    "pronunciation": "pruh-FOUND",
    "meaning": "very great or intense",
    "meaning_ar": "عميق الأثر",
    "level": "C2",
    "example": "The book had a profound effect on me.",
    "origin": "From Latin profundus, deep."
  }
];
