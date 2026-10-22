/* Word of the Day: independent vocabulary data. */
const WOTD_WORDS = [
  {
    "word": "notice",
    "pronunciation": "",
    "meaning": "to become aware of something",
    "meaning_ar": "المستوى الأساسي · to become aware of something",
    "level": "A1",
    "example": "I noticed a small change.",
    "origin": "From Latin notitia, meaning knowledge."
  },
  {
    "word": "improve",
    "pronunciation": "",
    "meaning": "to make or become better",
    "meaning_ar": "المستوى الأساسي · to make or become better",
    "level": "A1",
    "example": "I want to improve my English.",
    "origin": "From Old French emprower, linked to making progress."
  },
  {
    "word": "curious",
    "pronunciation": "",
    "meaning": "eager to know or learn",
    "meaning_ar": "المستوى الأساسي · eager to know or learn",
    "level": "A1",
    "example": "She is curious about science.",
    "origin": "From Latin curiosus, meaning careful or inquisitive."
  },
  {
    "word": "journey",
    "pronunciation": "",
    "meaning": "an act of travelling from one place to another",
    "meaning_ar": "المستوى الأساسي · an act of travelling from one place to another",
    "level": "A1",
    "example": "Learning is a long journey.",
    "origin": "Historically linked to a day's travel."
  },
  {
    "word": "choose",
    "pronunciation": "",
    "meaning": "to decide which thing you want",
    "meaning_ar": "المستوى الأساسي · to decide which thing you want",
    "level": "A1",
    "example": "Choose the answer that fits.",
    "origin": "From Old English ceosan."
  },
  {
    "word": "habit",
    "pronunciation": "",
    "meaning": "something you do regularly",
    "meaning_ar": "المستوى الأساسي · something you do regularly",
    "level": "A1",
    "example": "Reading is a useful habit.",
    "origin": "From Latin habitus, meaning condition or manner."
  },
  {
    "word": "share",
    "pronunciation": "",
    "meaning": "to give part of something to others",
    "meaning_ar": "المستوى الأساسي · to give part of something to others",
    "level": "A1",
    "example": "We share ideas in class.",
    "origin": "Related to the idea of dividing or distributing."
  },
  {
    "word": "simple",
    "pronunciation": "",
    "meaning": "easy to understand or do",
    "meaning_ar": "المستوى الأساسي · easy to understand or do",
    "level": "A1",
    "example": "Keep your explanation simple.",
    "origin": "From Latin simplex, meaning single or uncomplicated."
  },
  {
    "word": "careful",
    "pronunciation": "",
    "meaning": "giving attention to avoid mistakes",
    "meaning_ar": "المستوى الأساسي · giving attention to avoid mistakes",
    "level": "A1",
    "example": "Be careful with spelling.",
    "origin": "Built from care + -ful."
  },
  {
    "word": "practice",
    "pronunciation": "",
    "meaning": "repeated activity to improve a skill",
    "meaning_ar": "المستوى الأساسي · repeated activity to improve a skill",
    "level": "A1",
    "example": "A little practice helps every day.",
    "origin": "The noun spelling practice ends in -ice."
  },
  {
    "word": "achieve",
    "pronunciation": "",
    "meaning": "to succeed in doing something",
    "meaning_ar": "ما قبل المتوسط · to succeed in doing something",
    "level": "A2",
    "example": "You can achieve your goal.",
    "origin": "From Old French achever, to bring to an end."
  },
  {
    "word": "support",
    "pronunciation": "",
    "meaning": "to help or encourage someone",
    "meaning_ar": "ما قبل المتوسط · to help or encourage someone",
    "level": "A2",
    "example": "My friends support my goals.",
    "origin": "From Latin supportare, to carry from below."
  },
  {
    "word": "avoid",
    "pronunciation": "",
    "meaning": "to stay away from something",
    "meaning_ar": "ما قبل المتوسط · to stay away from something",
    "level": "A2",
    "example": "Avoid translating every word literally.",
    "origin": "From Old French esvuidier."
  },
  {
    "word": "suggest",
    "pronunciation": "",
    "meaning": "to offer an idea for consideration",
    "meaning_ar": "ما قبل المتوسط · to offer an idea for consideration",
    "level": "A2",
    "example": "I suggest taking a short break.",
    "origin": "From Latin suggerere, to bring up."
  },
  {
    "word": "depend",
    "pronunciation": "",
    "meaning": "to be decided or affected by something",
    "meaning_ar": "ما قبل المتوسط · to be decided or affected by something",
    "level": "A2",
    "example": "The result depends on your effort.",
    "origin": "The phrase depend on has a fixed preposition."
  },
  {
    "word": "compare",
    "pronunciation": "",
    "meaning": "to examine similarities and differences",
    "meaning_ar": "ما قبل المتوسط · to examine similarities and differences",
    "level": "A2",
    "example": "Compare the two sentences.",
    "origin": "From Latin comparare, to pair together."
  },
  {
    "word": "confident",
    "pronunciation": "",
    "meaning": "believing in your ability",
    "meaning_ar": "ما قبل المتوسط · believing in your ability",
    "level": "A2",
    "example": "She feels confident speaking English.",
    "origin": "From Latin confidere, to trust."
  },
  {
    "word": "purpose",
    "pronunciation": "",
    "meaning": "the reason for doing something",
    "meaning_ar": "ما قبل المتوسط · the reason for doing something",
    "level": "A2",
    "example": "What is the purpose of this task?",
    "origin": "From Latin propositum, an intention."
  },
  {
    "word": "discover",
    "pronunciation": "",
    "meaning": "to find something unexpectedly or for the first time",
    "meaning_ar": "ما قبل المتوسط · to find something unexpectedly or for the first time",
    "level": "A2",
    "example": "We discovered a better method.",
    "origin": "Literally related to uncovering what was hidden."
  },
  {
    "word": "patient",
    "pronunciation": "",
    "meaning": "able to wait calmly",
    "meaning_ar": "ما قبل المتوسط · able to wait calmly",
    "level": "A2",
    "example": "Be patient with yourself.",
    "origin": "From Latin patientia, the ability to endure."
  },
  {
    "word": "accurate",
    "pronunciation": "",
    "meaning": "correct and without mistakes",
    "meaning_ar": "المتوسط · correct and without mistakes",
    "level": "B1",
    "example": "The report must be accurate.",
    "origin": "From Latin accuratus, done with care."
  },
  {
    "word": "assume",
    "pronunciation": "",
    "meaning": "to accept something as true without proof",
    "meaning_ar": "المتوسط · to accept something as true without proof",
    "level": "B1",
    "example": "Do not assume the answer.",
    "origin": "From Latin assumere, to take up."
  },
  {
    "word": "approach",
    "pronunciation": "",
    "meaning": "a way of dealing with something",
    "meaning_ar": "المتوسط · a way of dealing with something",
    "level": "B1",
    "example": "Try a different approach.",
    "origin": "From French approcher, to come near."
  },
  {
    "word": "evidence",
    "pronunciation": "",
    "meaning": "facts that support a conclusion",
    "meaning_ar": "المتوسط · facts that support a conclusion",
    "level": "B1",
    "example": "The evidence supports the claim.",
    "origin": "From Latin evidentia, clearness."
  },
  {
    "word": "maintain",
    "pronunciation": "",
    "meaning": "to keep something in good condition or continue it",
    "meaning_ar": "المتوسط · to keep something in good condition or continue it",
    "level": "B1",
    "example": "Maintain a steady learning routine.",
    "origin": "From Latin manu tenere, to hold in the hand."
  },
  {
    "word": "reliable",
    "pronunciation": "",
    "meaning": "able to be trusted",
    "meaning_ar": "المتوسط · able to be trusted",
    "level": "B1",
    "example": "Use a reliable source.",
    "origin": "From rely + -able."
  },
  {
    "word": "consequence",
    "pronunciation": "",
    "meaning": "a result of an action",
    "meaning_ar": "المتوسط · a result of an action",
    "level": "B1",
    "example": "Every choice has a consequence.",
    "origin": "From Latin consequi, to follow."
  },
  {
    "word": "perspective",
    "pronunciation": "",
    "meaning": "a particular way of seeing something",
    "meaning_ar": "المتوسط · a particular way of seeing something",
    "level": "B1",
    "example": "Try to understand her perspective.",
    "origin": "From Latin perspicere, to look through."
  },
  {
    "word": "significant",
    "pronunciation": "",
    "meaning": "important or large enough to matter",
    "meaning_ar": "المتوسط · important or large enough to matter",
    "level": "B1",
    "example": "We noticed a significant improvement.",
    "origin": "From Latin significare, to indicate."
  },
  {
    "word": "clarify",
    "pronunciation": "",
    "meaning": "to make something easier to understand",
    "meaning_ar": "المتوسط · to make something easier to understand",
    "level": "B1",
    "example": "Could you clarify your point?",
    "origin": "From Latin clarus, clear."
  },
  {
    "word": "subtle",
    "pronunciation": "",
    "meaning": "not obvious but important",
    "meaning_ar": "فوق المتوسط · not obvious but important",
    "level": "B2",
    "example": "There is a subtle difference in meaning.",
    "origin": "From Latin subtilis, finely woven."
  },
  {
    "word": "coherent",
    "pronunciation": "",
    "meaning": "logical and well organised",
    "meaning_ar": "فوق المتوسط · logical and well organised",
    "level": "B2",
    "example": "Write a coherent paragraph.",
    "origin": "From Latin cohaerere, to stick together."
  },
  {
    "word": "ambiguous",
    "pronunciation": "",
    "meaning": "having more than one possible meaning",
    "meaning_ar": "فوق المتوسط · having more than one possible meaning",
    "level": "B2",
    "example": "The instruction is ambiguous.",
    "origin": "From Latin ambiguus, uncertain."
  },
  {
    "word": "inevitable",
    "pronunciation": "",
    "meaning": "certain to happen",
    "meaning_ar": "فوق المتوسط · certain to happen",
    "level": "B2",
    "example": "Mistakes are an inevitable part of learning.",
    "origin": "From Latin inevitabilis, unavoidable."
  },
  {
    "word": "justify",
    "pronunciation": "",
    "meaning": "to give a good reason for something",
    "meaning_ar": "فوق المتوسط · to give a good reason for something",
    "level": "B2",
    "example": "Can you justify your choice?",
    "origin": "From Latin justificare, to do justice."
  },
  {
    "word": "reluctant",
    "pronunciation": "",
    "meaning": "unwilling or hesitant",
    "meaning_ar": "فوق المتوسط · unwilling or hesitant",
    "level": "B2",
    "example": "He was reluctant to speak first.",
    "origin": "From Latin reluctari, to struggle against."
  },
  {
    "word": "precise",
    "pronunciation": "",
    "meaning": "exact and accurate",
    "meaning_ar": "فوق المتوسط · exact and accurate",
    "level": "B2",
    "example": "Choose a precise word.",
    "origin": "From Latin praecidere, to cut off."
  },
  {
    "word": "distinguish",
    "pronunciation": "",
    "meaning": "to recognise a difference",
    "meaning_ar": "فوق المتوسط · to recognise a difference",
    "level": "B2",
    "example": "Distinguish fact from opinion.",
    "origin": "From Latin distinguere, to separate."
  },
  {
    "word": "interpret",
    "pronunciation": "",
    "meaning": "to explain the meaning of something",
    "meaning_ar": "فوق المتوسط · to explain the meaning of something",
    "level": "B2",
    "example": "How do you interpret this sentence?",
    "origin": "From Latin interpretari."
  },
  {
    "word": "convey",
    "pronunciation": "",
    "meaning": "to communicate or express something",
    "meaning_ar": "فوق المتوسط · to communicate or express something",
    "level": "B2",
    "example": "Her tone conveys confidence.",
    "origin": "From Latin conveyere, to carry together."
  },
  {
    "word": "elaborate",
    "pronunciation": "",
    "meaning": "to explain or develop in more detail",
    "meaning_ar": "فوق المتوسط · to explain or develop in more detail",
    "level": "B2",
    "example": "Could you elaborate on that idea?",
    "origin": "From Latin elaborare, to work out."
  },
  {
    "word": "inference",
    "pronunciation": "",
    "meaning": "a conclusion based on evidence",
    "meaning_ar": "فوق المتوسط · a conclusion based on evidence",
    "level": "B2",
    "example": "That inference is reasonable.",
    "origin": "From Latin inferre, to bring in."
  },
  {
    "word": "resilient",
    "pronunciation": "",
    "meaning": "able to recover after difficulty",
    "meaning_ar": "فوق المتوسط · able to recover after difficulty",
    "level": "B2",
    "example": "A resilient learner keeps trying.",
    "origin": "From Latin resilire, to spring back."
  },
  {
    "word": "plausible",
    "pronunciation": "",
    "meaning": "seeming reasonable or likely",
    "meaning_ar": "فوق المتوسط · seeming reasonable or likely",
    "level": "B2",
    "example": "That is a plausible explanation.",
    "origin": "From Latin plausibilis, worthy of applause."
  },
  {
    "word": "contemplate",
    "pronunciation": "",
    "meaning": "to think deeply about something",
    "meaning_ar": "فوق المتوسط · to think deeply about something",
    "level": "B2",
    "example": "Take a moment to contemplate the question.",
    "origin": "From Latin contemplari, to observe."
  },
  {
    "word": "articulate",
    "pronunciation": "",
    "meaning": "to express ideas clearly",
    "meaning_ar": "فوق المتوسط · to express ideas clearly",
    "level": "B2",
    "example": "She can articulate complex ideas.",
    "origin": "From Latin articulare, to divide into joints."
  },
  {
    "word": "mitigate",
    "pronunciation": "",
    "meaning": "to make something less harmful or severe",
    "meaning_ar": "فوق المتوسط · to make something less harmful or severe",
    "level": "B2",
    "example": "Good planning can mitigate risk.",
    "origin": "From Latin mitigare, to soften."
  },
  {
    "word": "nuance",
    "pronunciation": "",
    "meaning": "a small difference in meaning or feeling",
    "meaning_ar": "فوق المتوسط · a small difference in meaning or feeling",
    "level": "B2",
    "example": "The translation misses a nuance.",
    "origin": "From French nuance, a shade of colour."
  },
  {
    "word": "intricate",
    "pronunciation": "",
    "meaning": "having many detailed parts",
    "meaning_ar": "فوق المتوسط · having many detailed parts",
    "level": "B2",
    "example": "The machine has an intricate design.",
    "origin": "From Latin intricatus, entangled."
  },
  {
    "word": "foster",
    "pronunciation": "",
    "meaning": "to encourage development",
    "meaning_ar": "فوق المتوسط · to encourage development",
    "level": "B2",
    "example": "Good feedback can foster confidence.",
    "origin": "From Old English fostrian, to nourish."
  },
  {
    "word": "derive",
    "pronunciation": "",
    "meaning": "to obtain something from a source",
    "meaning_ar": "فوق المتوسط · to obtain something from a source",
    "level": "B2",
    "example": "Many words derive from Latin.",
    "origin": "From Latin derivare, to lead off."
  },
  {
    "word": "sustain",
    "pronunciation": "",
    "meaning": "to keep something going over time",
    "meaning_ar": "فوق المتوسط · to keep something going over time",
    "level": "B2",
    "example": "Small habits sustain progress.",
    "origin": "From Latin sustinere, to hold up."
  },
  {
    "word": "compelling",
    "pronunciation": "",
    "meaning": "very convincing or interesting",
    "meaning_ar": "فوق المتوسط · very convincing or interesting",
    "level": "B2",
    "example": "She gave a compelling argument.",
    "origin": "From compel, ultimately Latin compellere."
  },
  {
    "word": "framework",
    "pronunciation": "",
    "meaning": "a basic structure supporting an idea or system",
    "meaning_ar": "فوق المتوسط · a basic structure supporting an idea or system",
    "level": "B2",
    "example": "Use a framework to organise your essay.",
    "origin": "Frame + work describes a supporting structure."
  },
  {
    "word": "furthermore",
    "pronunciation": "",
    "meaning": "in addition to what was already said",
    "meaning_ar": "فوق المتوسط · in addition to what was already said",
    "level": "B2",
    "example": "Furthermore, the results were consistent.",
    "origin": "Formed from further + more."
  },
  {
    "word": "whereas",
    "pronunciation": "",
    "meaning": "used to contrast two facts",
    "meaning_ar": "فوق المتوسط · used to contrast two facts",
    "level": "B2",
    "example": "I prefer tea, whereas he likes coffee.",
    "origin": "Where + as developed into a contrast connector."
  },
  {
    "word": "conversely",
    "pronunciation": "",
    "meaning": "in an opposite way",
    "meaning_ar": "فوق المتوسط · in an opposite way",
    "level": "B2",
    "example": "Conversely, the second method was slower.",
    "origin": "From Latin conversus, turned around."
  },
  {
    "word": "undermine",
    "pronunciation": "",
    "meaning": "to weaken gradually or indirectly",
    "meaning_ar": "فوق المتوسط · to weaken gradually or indirectly",
    "level": "B2",
    "example": "One error can undermine the argument.",
    "origin": "Originally linked to digging beneath a structure."
  },
  {
    "word": "endeavour",
    "pronunciation": "",
    "meaning": "an attempt to do something difficult",
    "meaning_ar": "فوق المتوسط · an attempt to do something difficult",
    "level": "B2",
    "example": "Learning a language is a worthwhile endeavour.",
    "origin": "From Old French endever, to make an effort."
  },
  {
    "word": "profound",
    "pronunciation": "",
    "meaning": "very great or intense",
    "meaning_ar": "فوق المتوسط · very great or intense",
    "level": "B2",
    "example": "The book had a profound effect on me.",
    "origin": "From Latin profundus, deep."
  }
];
