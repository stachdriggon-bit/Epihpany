/* EPIPHANY — The Language Detective UI bridge */
(() => {
  'use strict';
  const fixtures = window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES;
  const engine = window.EPIPHANY_LANGUAGE_DETECTIVE_ENGINE;
  const investigationModel = window.EPIPHANY_CASEBOUND_INVESTIGATION;
  if (!fixtures || !engine || !investigationModel || typeof engine.evaluate !== 'function') {
    window.EPIPHANY_LANGUAGE_DETECTIVE = { available: false };
    return;
  }

  const caseInfo = Object.fromEntries(Object.entries(fixtures.cases).map(([id, item]) => [id, item.presentation]));
  const CEFR_ORDER = ['A1','A2','B1','B2','C1','C2'];
  const CASEBOUND_ARABIC = Object.freeze({
    'PLAY · INVESTIGATE · DEDUCE':'العب · حقّق · استنتج',
    'Every clue has a story. Investigate cases, examine evidence and discover what really happened.':'لكل قرينة حكاية. حقّق في القضايا، وافحص الأدلة، واكتشف ما حدث بالفعل.',
    'Read the clues. Prove what happened.':'اقرأ القرائن، وأثبت ما حدث.',
    'CASE FILES':'ملفات القضايا',
    'Preparing your case files…':'جارٍ تجهيز ملفات القضايا…',
    'CASEBOUND · EVERY CLUE HAS A STORY':'كيسباوند · لكل قرينة حكاية',
    'Investigate cases, examine evidence and discover what really happened.':'حقّق في القضايا، وافحص الأدلة، واكتشف ما حدث بالفعل.',
    'Read the statements':'اقرأ الإفادات',
    'Question people':'استجوب الأشخاص',
    'Examine evidence':'افحص الأدلة',
    'Build your conclusion':'كوّن استنتاجك',
    'Choose your English level':'اختر مستواك في الإنجليزية',
    'Each level has its own investigations, characters and challenges.':'لكل مستوى تحقيقاته وشخصياته وتحدياته الخاصة.',
    'Beginner':'مبتدئ',
    'Elementary':'ابتدائي',
    'Intermediate':'متوسط',
    'Upper intermediate':'فوق المتوسط',
    'Advanced':'متقدم',
    'Proficient':'متمكن',
    'Short, direct clues and everyday situations.':'قرائن قصيرة ومباشرة ومواقف من الحياة اليومية.',
    'Simple timelines and clear links between events.':'تسلسل زمني بسيط وروابط واضحة بين الأحداث.',
    'More detail, reported accounts and careful comparisons.':'تفاصيل أكثر، وإفادات منقولة، ومقارنات دقيقة.',
    'More layered evidence and competing interpretations.':'أدلة متعددة الطبقات وتفسيرات متنافسة.',
    'Subtle evidence boundaries and competing explanations.':'حدود دقيقة للأدلة وتفسيرات متنافسة.',
    'Highly nuanced reasoning across complex sources.':'استدلال دقيق للغاية عبر مصادر معقدة.',
    'View investigations →':'استعرض التحقيقات ←',
    'Coming soon':'قريبًا',
    'Open investigation →':'ابدأ التحقيق ←',
    'All levels':'كل المستويات',
    'There are no investigations at this level yet. New cases will appear here.':'لا توجد تحقيقات في هذا المستوى حاليًا. ستظهر القضايا الجديدة هنا.',
    'Settings':'الإعدادات',
    'Support level':'مستوى المساعدة',
    'Answer style':'أسلوب الإجابة',
    'Guided':'موجّه',
    'Hints + practice':'تلميحات وتدريب',
    'Steady':'متوازن',
    'Balanced':'معتدل',
    'Challenge':'تحدٍّ',
    'Least help':'أقل قدر من المساعدة',
    'Standard':'قياسي',
    'Reason, then choose':'استدل، ثم اختر',
    'Hell Mode':'وضع الجحيم',
    'Write it all':'اكتب الإجابة كاملة',
    'CASE BRIEF':'ملخص القضية',
    'YOUR INVESTIGATION':'تحقيقك',
    'Meet the people':'تعرّف على الأشخاص',
    'Review the evidence':'راجع الأدلة',
    'Start Investigation':'ابدأ التحقيق',
    'Take your time. You can review everything you discover as the investigation unfolds.':'خذ وقتك. يمكنك مراجعة كل ما تكتشفه مع تقدّم التحقيق.',
    'The Missing Bag':'الحقيبة المفقودة',
    'Three passengers claim a bag found in a quiet station waiting room.':'يدّعي ثلاثة ركاب ملكية حقيبة عُثر عليها في صالة انتظار هادئة بمحطة القطار.',
    'Your task: decide whose bag is the best-supported match. Compare where each person waited, what was found inside the bag, and the independent library record. A strong match is not the same as absolute proof.':'مهمتك: حدّد الشخص الذي تدعمه الأدلة أكثر بوصفه صاحب الحقيبة. قارن أماكن انتظار الأشخاص، ومحتويات الحقيبة، وسجل المكتبة المستقل. فالتطابق القوي لا يعني إثبات الملكية بصورة قاطعة.',
    '8:00 — Lina waits at the bench beside the timetable board.':'8:00 — تنتظر لينا عند المقعد بجوار لوحة مواعيد القطارات.',
    '8:05 — Omar waits by the window. Nora waits near the door a little later.':'8:05 — ينتظر عمر بجوار النافذة، ثم تنتظر نورا قرب الباب بعد ذلك بقليل.',
    '8:32 — A green canvas bag is found beside the timetable bench. Its owner is not recorded.':'8:32 — عُثر على حقيبة قماشية خضراء بجوار مقعد لوحة المواعيد، ولم يُسجَّل اسم مالكها.',
    'The bag inventory lists a paperback book, a blue notebook and a red pencil case.':'تُظهر قائمة محتويات الحقيبة وجود كتاب ذي غلاف ورقي ودفتر أزرق ومقلمة حمراء.',
    'The library record shows that Lina borrowed the same paperback that morning.':'يُظهر سجل المكتبة أن لينا استعارت الكتاب الورقي نفسه في ذلك الصباح.',
    'The seating log records where the three passengers waited, but it does not record who owned the bag.':'يسجّل سجل المقاعد أماكن انتظار الركاب الثلاثة، لكنه لا يحدد صاحب الحقيبة.',
    'What does the found-property report tell us?':'ماذا يخبرنا تقرير المفقودات؟',
    'A green canvas bag was found by the timetable bench.':'عُثر على حقيبة قماشية خضراء بجوار مقعد لوحة المواعيد.',
    'Lina collected the bag.':'استلمت لينا الحقيبة.',
    'The bag belongs to the person by the window.':'الحقيبة تخص الشخص الذي كان بجوار النافذة.',
    'The report gives the bag’s description and location, but it does not name the owner.':'يذكر التقرير وصف الحقيبة ومكان العثور عليها، لكنه لا يحدد مالكها.',
    'What does the library record add?':'ماذا يضيف سجل المكتبة؟',
    'It proves Lina owns every item in the bag.':'يثبت أن لينا تملك كل ما في الحقيبة.',
    'It links Lina to the paperback found in the bag.':'يربط لينا بالكتاب الورقي الموجود في الحقيبة.',
    'It shows Omar borrowed the book.':'يُظهر أن عمر هو من استعار الكتاب.',
    'The library record links Lina to one item, but it does not prove ownership by itself.':'يربط سجل المكتبة لينا بأحد محتويات الحقيبة، لكنه لا يثبت الملكية بمفرده.',
    'I waited near the timetable board. I had a green canvas bag, but I cannot remember where I put it.':'انتظرت بالقرب من لوحة مواعيد القطارات. كانت معي حقيبة قماشية خضراء، لكنني لا أتذكر أين وضعتها.',
    'I sat by the window. My bag is a black backpack with a laptop inside.':'جلست بجوار النافذة. حقيبتي حقيبة ظهر سوداء بداخلها حاسوب محمول.',
    'I waited near the door. I had a blue shopping bag with a scarf inside.':'انتظرت بالقرب من الباب. كانت معي حقيبة تسوق زرقاء بداخلها وشاح.',
    'Waiting-room seating log':'سجل مقاعد صالة الانتظار',
    'Found-property report':'تقرير المفقودات',
    'Bag inventory':'قائمة محتويات الحقيبة',
    'Library borrowing record':'سجل استعارة المكتبة',
    'Kiosk receipt':'إيصال كشك المحطة',
    'What time did you leave the waiting room?':'في أي وقت غادرت صالة الانتظار؟',
    'I left for a short time at about 8:17. I bought tea at the station kiosk.':'غادرت لفترة قصيرة نحو الساعة 8:17. اشتريت الشاي من كشك المحطة.',
    'Why did you borrow the paperback that morning?':'لماذا استعرت الكتاب الورقي ذلك الصباح؟',
    'I wanted to read it on my journey. I borrowed it from the library before I came to the station.':'أردت قراءته في رحلتي. استعرت الكتاب من المكتبة قبل مجيئي إلى المحطة.',
    'When did you last see your green bag?':'متى رأيت حقيبتك الخضراء آخر مرة؟',
    'I remember having it near the timetable board. I do not remember seeing it after that.':'أتذكر أنها كانت معي بالقرب من لوحة المواعيد. ولا أتذكر أنني رأيتها بعد ذلك.',
    'Could you see the timetable bench from your seat?':'هل كنت تستطيع رؤية مقعد لوحة المواعيد من مكان جلوسك؟',
    'Not clearly. The people and bags near the bench were difficult to see.':'ليس بوضوح. كان من الصعب رؤية الأشخاص والحقائب بالقرب من المقعد.',
    'Did you leave your seat before 8:32?':'هل غادرت مقعدك قبل الساعة 8:32؟',
    'Yes. I went to the station noticeboard, but I did not go to the timetable bench.':'نعم. ذهبت إلى لوحة إعلانات المحطة، لكنني لم أذهب إلى مقعد لوحة المواعيد.',
    'Did you see anyone near the timetable bench?':'هل رأيت أحدًا بالقرب من مقعد لوحة المواعيد؟',
    'I saw someone standing there, but I could not see who it was.':'رأيت شخصًا يقف هناك، لكنني لم أتمكن من معرفة هويته.',
    'What did you do after waiting near the door?':'ماذا فعلت بعد الانتظار بالقرب من الباب؟',
    'I went to the ticket counter to ask about my train.':'ذهبت إلى شباك التذاكر للاستفسار عن قطاري.',
    'Could you see the timetable bench from the door?':'هل كنت تستطيع رؤية مقعد لوحة المواعيد من عند الباب؟',
    'I could see part of the bench, but I could not see everything near it.':'كنت أرى جزءًا من المقعد، لكنني لم أكن أرى كل ما حوله.',
    'Did you notice the green bag before it was found?':'هل لاحظت الحقيبة الخضراء قبل العثور عليها؟',
    'I saw a green bag near the bench, but I did not see who left it there.':'رأيت حقيبة خضراء بالقرب من المقعد، لكنني لم أرَ من تركها هناك.',
    'The station seating log places Lina at the bench beside the timetable board before 8:15. Omar was by the window and Nora was near the door.':'يضع سجل مقاعد المحطة لينا عند المقعد المجاور للوحة المواعيد قبل الساعة 8:15. وكان عمر بجوار النافذة ونورا بالقرب من الباب.',
    'where each passenger waited':'مكان انتظار كل راكب',
    'The log records seats, not ownership of any bag.':'يسجل هذا السجل أماكن الجلوس، ولا يحدد مالك أي حقيبة.',
    'At 8:32 a green canvas bag was found beside the bench near the timetable board. The report does not name its owner.':'في الساعة 8:32 عُثر على حقيبة قماشية خضراء بجوار المقعد القريب من لوحة المواعيد. ولا يذكر التقرير اسم مالكها.',
    'bag description and last recorded location':'وصف الحقيبة وآخر مكان سُجّل وجودها فيه',
    'The finder did not see who left the bag.':'لم يرَ الشخص الذي عثر على الحقيبة من تركها.',
    'The green canvas bag contained a paperback book, a blue notebook and a red pencil case.':'احتوت الحقيبة القماشية الخضراء على كتاب ذي غلاف ورقي ودفتر أزرق ومقلمة حمراء.',
    'three items inside the bag':'ثلاثة أشياء داخل الحقيبة',
    'The inventory does not identify the owner.':'لا تحدد قائمة المحتويات مالك الحقيبة.',
    'The library record shows that Lina borrowed the same paperback book that morning.':'يُظهر سجل المكتبة أن لينا استعارت الكتاب الورقي نفسه في ذلك الصباح.',
    'independent link between Lina and one item in the bag':'صلة مستقلة بين لينا وأحد محتويات الحقيبة',
    'The record does not prove that Lina owned the bag or the other items.':'لا يثبت السجل أن لينا تملك الحقيبة أو بقية محتوياتها.',
    'A receipt records Lina buying tea at the station kiosk at 8:17.':'يسجل الإيصال شراء لينا للشاي من كشك المحطة عند الساعة 8:17.',
    'Lina was away from the waiting room briefly':'كانت لينا خارج صالة الانتظار لفترة قصيرة',
    'The receipt does not show where her bag was or who owned it.':'لا يوضح الإيصال مكان الحقيبة أو هوية مالكها.',
    'Lina is the best-supported owner of the green bag':'لينا هي صاحبة الحقيبة الخضراء التي تدعمها الأدلة بأقوى صورة',
    'Lina borrowed the paperback found in the bag':'استعارت لينا الكتاب الورقي الموجود في الحقيبة',
    'the records support but do not absolutely prove ownership':'تدعم السجلات الملكية، لكنها لا تثبتها بصورة قاطعة',
    'Lina left briefly at about 8:17 and bought tea at the station kiosk.':'غادرت لينا لفترة قصيرة نحو الساعة 8:17 واشترت الشاي من كشك المحطة.',
    'Lina borrowed the paperback because she wanted to read it on her journey.':'استعارت لينا الكتاب الورقي لأنها أرادت قراءته في رحلتها.',
    'Lina remembers having the green bag near the timetable board but does not remember seeing it afterward.':'تتذكر لينا أن الحقيبة الخضراء كانت معها بالقرب من لوحة المواعيد، لكنها لا تتذكر رؤيتها بعد ذلك.',
    'Omar could not clearly see the timetable bench from his seat.':'لم يتمكن عمر من رؤية مقعد لوحة المواعيد بوضوح من مكان جلوسه.',
    'Omar says he went to the station noticeboard before 8:32 and did not go to the timetable bench.':'يقول عمر إنه ذهب إلى لوحة إعلانات المحطة قبل الساعة 8:32 ولم يذهب إلى مقعد لوحة المواعيد.',
    'Omar saw someone near the timetable bench but could not identify the person.':'رأى عمر شخصًا بالقرب من مقعد لوحة المواعيد، لكنه لم يتمكن من تحديد هويته.',
    'Nora went to the ticket counter to ask about her train.':'ذهبت نورا إلى شباك التذاكر للاستفسار عن قطارها.',
    'Nora could see only part of the timetable bench from the door.':'لم تتمكن نورا من رؤية سوى جزء من مقعد لوحة المواعيد من عند الباب.',
    'Nora saw a green bag near the bench but did not see who left it there.':'رأت نورا حقيبة خضراء بالقرب من المقعد، لكنها لم ترَ من تركها هناك.',
    'The delivery record says the package was placed at reception at 10:05.':'يذكر سجل التسليم أن الطرد وُضع عند مكتب الاستقبال الساعة 10:05.',
    'The witness saw a resident in a green jacket pick up the package at 10:12.':'شاهد الشاهد أحد السكان يرتدي سترة خضراء ويأخذ الطرد الساعة 10:12.',
    'The resident was not identified.':'لم تُحدد هوية الساكن.',
    'Nora arrived later and the package was no longer there.':'وصلت نورا لاحقًا ولم يعد الطرد موجودًا.',
    'The envelope was found in Room B at 4:10.':'عُثر على الظرف في الغرفة B الساعة 4:10.',
    'The card log confirms that a card opened Room B, but does not identify its user.':'يؤكد سجل البطاقة فتح الغرفة B باستخدام بطاقة، لكنه لا يحدد مستخدمها.',
    'R-4 recorded an unusual signal increase.':'سجل R-4 ارتفاعًا غير مألوف في الإشارة.',
    'The record is incomplete.':'السجل غير مكتمل.',
    'Analysts could not establish the cause.':'لم يتمكن المحللون من تحديد السبب.',
    'cause remains unresolved':'لا يزال السبب غير محسوم',
    'External source is a possible hypothesis.':'المصدر الخارجي فرضية محتملة.',
    'No source identified.':'لم يُحدد أي مصدر.',
    'Temporary receiver fault is a possible hypothesis.':'عطل مؤقت في جهاز الاستقبال فرضية محتملة.',
    'No diagnostic test confirms a fault.':'لا يوجد اختبار تشخيصي يؤكد وجود عطل.',
    'R-7 differs in direction and sensitivity.':'يختلف R-7 في الاتجاه والحساسية.',
    'instrument comparison':'مقارنة الأجهزة',
    'Not a direct control.':'ليس جهاز مقارنة ضابطًا مباشرًا.',
    'The record is incomplete.':'السجل غير مكتمل.',
    'Neither proposed cause is confirmed.':'لم يتأكد أي من السببين المقترحين.',
    'possible external explanation':'تفسير خارجي محتمل',
    'possible equipment explanation':'تفسير محتمل متعلق بالمعدات',
    'recorded anomaly':'الظاهرة المسجلة',
    'An external source is possible.':'من المحتمل وجود مصدر خارجي.',
    'A temporary receiver fault is possible.':'من المحتمل وجود عطل مؤقت في جهاز الاستقبال.',
    'R-7 cannot be used as a direct comparison.':'لا يمكن استخدام R-7 بوصفه مقارنة مباشرة.',
    'CASE FILE':'ملف القضية',
    'YOUR TASK':'مهمتك',
    'People and interviews':'الأشخاص والمقابلات',
    'People’s accounts':'إفادات الأشخاص',
    'Initial accounts from people in the case.':'الإفادات الأولية للأشخاص في القضية.',
    'Answers revealed when you asked a question.':'الإجابات التي كُشفت عندما طرحت سؤالًا.',
    'Records and objects you examined.':'السجلات والأشياء التي فحصتها.',
    'Witness accounts you chose to hear.':'إفادات الشهود التي اخترت الاستماع إليها.',
    'Evidence checks':'فحص الأدلة',
    'Optional practice to help you inspect the record. These checks do not block progress or affect the written assessment.':'تدريب اختياري لمساعدتك على فحص السجل. لا تعيق هذه الأسئلة تقدمك ولا تؤثر في تقييم الإجابة المكتوبة.',
    'Quick evidence practice':'تدريب سريع على الأدلة',
    'Optional practice':'تدريب اختياري',
    'Practice':'تدرّب',
    'Hide questions':'إخفاء الأسئلة',
    'Examine evidence →':'افحص الدليل ←',
    'New evidence is available':'يتوفر دليل جديد',
    'Its contents will be revealed when you choose to examine it.':'ستُكشف محتوياته عندما تختار فحصه.',
    'Keep investigating before you conclude.':'واصل التحقيق قبل الوصول إلى استنتاج.',
    'The required investigation path is complete.':'اكتمل مسار التحقيق المطلوب.',
    'Complete the required evidence before concluding.':'أكمل فحص الأدلة المطلوبة قبل الاستنتاج.',
    'Review the people and their accounts.':'راجع الأشخاص وإفاداتهم.',
    'Review your reasoning before submitting.':'راجع استدلالك قبل الإرسال.',
    'Case notebook':'دفتر القضية',
    'Your discoveries':'اكتشافاتك',
    'Your notebook is empty':'دفترك فارغ',
    'You have asked this person a question. Their answer is saved in your case notebook.':'لقد طرحت سؤالًا على هذا الشخص. حُفظت إجابته في دفتر القضية.',
    'You can review the feedback and try again. Earlier attempts are kept in this open investigation.':'يمكنك مراجعة الملاحظات والمحاولة مجددًا. ستظل المحاولات السابقة محفوظة في هذا التحقيق المفتوح.',
    'Submit reasoning →':'أرسل الاستدلال ←',
    'Assess my answer →':'قيّم إجابتي ←',
    'Assess my conclusion →':'قيّم استنتاجي ←',
    'Choose one conclusion.':'اختر استنتاجًا واحدًا.',
    'This step is locked until your reasoning is submitted.':'هذه الخطوة مقفلة حتى ترسل استدلالك.',
    'Write your reasoning before unlocking the conclusion choices.':'اكتب استدلالك قبل فتح خيارات الاستنتاج.',
    'Submit your reasoning before choosing a conclusion.':'أرسل استدلالك قبل اختيار الاستنتاج.',
    'Please complete both fields before submitting.':'يرجى إكمال الحقلين قبل الإرسال.',
    'Write your reasoning, then choose the conclusion that best matches it.':'اكتب استدلالك، ثم اختر الاستنتاج الأكثر توافقًا معه.',
    'Choose one conclusion after writing your reasoning.':'اختر استنتاجًا واحدًا بعد كتابة استدلالك.',
    'The Missing Package':'الحزمة المفقودة',
    'A delivery disappears before its recipient arrives.':'تختفي شحنة قبل وصول مستلمها.',
    'Your task: identify what the witness actually saw, then separate that from what remains unknown about the person.':'مهمتك: حدّد ما شاهده الشاهد فعلًا، ثم افصله عما لا يزال مجهولًا بشأن الشخص.',
    '10:05 — The delivery record says the package was placed at reception; no recipient was recorded.':'10:05 — يذكر سجل التسليم أن الطرد وُضع عند مكتب الاستقبال، دون تسجيل اسم المستلم.',
    '10:00–10:15 — Adam was away and did not see the delivery.':'10:00–10:15 — كان آدم بعيدًا ولم يشاهد عملية التسليم.',
    '10:12 — Sara saw a resident wearing a green jacket take the package after the driver left it on the table. She did not see the resident’s face.':'10:12 — شاهدت سارة أحد السكان يرتدي سترة خضراء يأخذ الطرد بعد أن تركه السائق على الطاولة. لكنها لم ترَ وجهه.',
    '10:20 — Nora arrived and the package was no longer there.':'10:20 — وصلت نورا ولم يعد الطرد موجودًا.',
    'The optional label names Nora and Apartment 2B; it does not identify who picked up the package.':'تذكر البطاقة الاختيارية اسم نورا والشقة 2B، لكنها لا تحدد من أخذ الطرد.',
    'Which account stays within what Sara witnessed?':'أي إفادة تلتزم بما شاهدته سارة فعلًا؟',
    'A resident left with the package after the driver stepped away.':'غادر أحد السكان حاملًا الطرد بعد ابتعاد السائق.',
    'Nora collected the package when she reached reception.':'استلمت نورا الطرد عند وصولها إلى مكتب الاستقبال.',
    'Adam handed the package to someone before leaving.':'سلّم آدم الطرد إلى شخص ما قبل مغادرته.',
    'Sara witnessed a resident collect the package after the driver left; she did not identify the resident.':'شاهدت سارة أحد السكان يأخذ الطرد بعد مغادرة السائق، لكنها لم تحدد هوية ذلك الشخص.',
    'Which statement about the person can the report support?':'أي عبارة عن الشخص يمكن للتقرير دعمها؟',
    'The person was the resident listed on the optional label.':'كان الشخص هو الساكن المذكور في البطاقة الاختيارية.',
    'The person’s identity cannot be established from Sara’s account.':'لا يمكن تحديد هوية الشخص من إفادة سارة.',
    'The person was someone who arrived after Nora.':'كان الشخص ممن وصلوا بعد نورا.',
    'The label does not identify the picker, and Sara did not see the person’s face.':'لا تحدد البطاقة هوية من أخذ الطرد، كما أن سارة لم ترَ وجه الشخص.',
    'Delivery record: package placed at reception at 10:05.':'سجل التسليم: وُضع الطرد عند مكتب الاستقبال الساعة 10:05.',
    'delivery and time':'عملية التسليم ووقتها',
    'Does not name a recipient or picker.':'لا يذكر اسم المستلم أو من أخذ الطرد.',
    'Sara saw an unidentified resident in a green jacket pick up the package at 10:12.':'شاهدت سارة أحد السكان مجهول الهوية يرتدي سترة خضراء ويأخذ الطرد الساعة 10:12.',
    'observed pickup':'واقعة أخذ الطرد التي شوهدت',
    'Sara did not see the resident face.':'لم ترَ سارة وجه الساكن.',
    'Sara did not identify the resident.':'لم تحدد سارة هوية الساكن.',
    'identity remains unknown':'لا تزال الهوية مجهولة',
    'Does not establish motive.':'لا يثبت الدافع.',
    'Nora arrived later and the package was absent.':'وصلت نورا لاحقًا وكان الطرد قد اختفى.',
    'later absence':'اختفاء الطرد لاحقًا',
    'Does not identify the picker.':'لا يحدد هوية من أخذ الطرد.',
    'package was picked up by a resident':'أخذ أحد السكان الطرد',
    'unidentified resident picked up package':'أخذ أحد السكان مجهولي الهوية الطرد',
    'picker identity unknown':'هوية من أخذ الطرد مجهولة',
    'motive unknown':'الدافع مجهول',
    'theft asserted as fact':'الادعاء بوقوع سرقة على أنه حقيقة',
    'Conflicting Accounts':'إفادات متعارضة',
    'An envelope vanishes, then appears in another room.':'يختفي ظرف ثم يظهر في غرفة أخرى.',
    'Your task: explain where the envelope was found and decide what the timeline and access record can—and cannot—prove about who moved it.':'مهمتك: وضّح مكان العثور على الظرف، وحدد ما يستطيع التسلسل الزمني وسجل الدخول إثباته وما لا يستطيعان إثباته بشأن من نقله.',
    '3:05 — Nadia placed the envelope of workshop recordings at library reception.':'3:05 — وضعت ناديا ظرف تسجيلات ورشة العمل عند مكتب استقبال المكتبة.',
    '3:20 — Omar saw a large envelope on the desk. Later, he saw Nadia carrying papers near the exit and assumed they were the envelope, but he did not identify them.':'3:20 — رأى عمر ظرفًا كبيرًا على المكتب. وبعد ذلك رأى ناديا تحمل أوراقًا قرب المخرج، وافترض أنها الظرف، لكنه لم يتمكن من تحديدها.',
    'About 3:25 — Lena said she moved a group of papers to Room B; she was unsure whether she checked every sheet.':'نحو 3:25 — قالت لينا إنها نقلت مجموعة من الأوراق إلى الغرفة B، لكنها لم تكن متأكدة من فحص كل ورقة.',
    '3:22–3:41 — A card opened Room B and the room was later closed. The log does not establish who physically used the card or what was carried inside.':'3:22–3:41 — استُخدمت بطاقة لفتح الغرفة B ثم أُغلقت لاحقًا. ولا يحدد السجل من استخدم البطاقة فعليًا أو ما الذي أُدخل إلى الغرفة.',
    '3:45 — Nadia returned and found the envelope missing.':'3:45 — عادت ناديا ووجدت الظرف مفقودًا.',
    '4:10 — The envelope was found closed in Room B, with papers inside.':'4:10 — عُثر على الظرف مغلقًا في الغرفة B وبداخله أوراق.',
    'Which claim is justified by the access record alone?':'أي ادعاء يبرره سجل الدخول وحده؟',
    'Lena entered Room B during the recorded interval.':'دخلت لينا الغرفة B خلال الفترة المسجلة.',
    'Someone used a card to open Room B; the user is not established.':'استخدم شخص ما بطاقة لفتح الغرفة B، لكن هوية المستخدم غير محددة.',
    'The envelope was taken into Room B during that interval.':'نُقل الظرف إلى الغرفة B خلال تلك الفترة.',
    'The record confirms a card event, but it does not identify the physical user or what entered the room.':'يؤكد السجل استخدام بطاقة، لكنه لا يحدد المستخدم الفعلي أو ما أُدخل إلى الغرفة.',
    'How should Omar’s later observation be described?':'كيف ينبغي وصف ملاحظة عمر اللاحقة؟',
    'Nadia carried the missing envelope towards the exit.':'حملت ناديا الظرف المفقود باتجاه المخرج.',
    'Nadia carried papers, but Omar could not confirm what they were.':'حملت ناديا أوراقًا، لكن عمر لم يتمكن من التأكد من ماهيتها.',
    'Lena passed the envelope to Nadia near the exit.':'سلّمت لينا الظرف إلى ناديا قرب المخرج.',
    'Omar saw Nadia carrying papers, but he did not identify them as the envelope.':'رأى عمر ناديا تحمل أوراقًا، لكنه لم يحدد أنها الظرف.',
    'The envelope was found in Room B at 4:10.':'عُثر على الظرف في الغرفة B الساعة 4:10.',
    'later location':'الموقع اللاحق',
    'Does not identify who moved it.':'لا يحدد من نقله.',
    'Lena reported moving a group of papers to Room B.':'أفادت لينا بأنها نقلت مجموعة من الأوراق إلى الغرفة B.',
    'reported movement of papers':'الإبلاغ عن نقل الأوراق',
    'She did not recall checking every sheet.':'لم تتذكر أنها فحصت كل ورقة.',
    'Lena card opened Room B.':'فُتحت الغرفة B باستخدام بطاقة لينا.',
    'credential access event':'حدث دخول باستخدام بطاقة',
    'Does not prove Lena physically used the card.':'لا يثبت أن لينا استخدمت البطاقة بنفسها.',
    'The card log does not identify the physical user.':'لا يحدد سجل البطاقة هوية المستخدم الفعلي.',
    'actor uncertainty':'عدم اليقين بشأن هوية الفاعل',
    'No actor identity is established.':'لم تثبت هوية أي فاعل.',
    'Lena moving the envelope is plausible but not established.':'من المحتمل أن تكون لينا قد نقلت الظرف، لكن ذلك غير مثبت.',
    'plausible movement hypothesis':'فرضية محتملة بشأن نقل الظرف',
    'The record does not identify the person who moved the envelope.':'لا يحدد السجل الشخص الذي نقل الظرف.',
    'envelope found in Room B':'العثور على الظرف في الغرفة B',
    'Lena reported moving papers':'أفادت لينا بأنها نقلت أوراقًا',
    'Lena card was used':'استُخدمت بطاقة لينا',
    'card user identity unproven':'لم تثبت هوية مستخدم البطاقة',
    'Lena possibly moved the envelope':'ربما نقلت لينا الظرف',
    'Lena personally moved envelope as fact':'الادعاء بأن لينا نقلت الظرف بنفسها كحقيقة',
    'The Uncertain Evidence':'الأدلة غير الحاسمة',
    'An observatory receiver records an unusual signal.':'يسجل جهاز استقبال في مرصد إشارة غير مألوفة.',
    'Your task: separate the recorded anomaly from its possible explanations. Decide whether the evidence identifies a cause or leaves competing hypotheses open.':'مهمتك: افصل بين الظاهرة المسجلة وتفسيراتها المحتملة. حدّد ما إذا كانت الأدلة تكشف السبب أم تترك فرضيات متنافسة مفتوحة.',
    '14 October, 21:43–21:47 — Receiver R-4 recorded an unusual signal-strength increase. The recovered recording is incomplete.':'14 أكتوبر، 21:43–21:47 — سجّل جهاز الاستقبال R-4 ارتفاعًا غير مألوف في قوة الإشارة. والتسجيل المستعاد غير مكتمل.',
    'Analyst One: an external source is possible, but its identity cannot be established and equipment fault cannot be ruled out.':'المحلل الأول: قد يكون المصدر خارجيًا، لكن لا يمكن تحديد هويته ولا استبعاد وجود عطل في المعدات.',
    'Analyst Two: a temporary R-4 fault is possible, but there is no diagnostic result proving it.':'المحلل الثاني: قد يكون هناك عطل مؤقت في R-4، لكن لا توجد نتيجة تشخيصية تثبت ذلك.',
    'Maintenance records show unstable readings in September and a connection check before R-4 returned to service. There was no maintenance or diagnostic test on the night of 14 October.':'تُظهر سجلات الصيانة قراءات غير مستقرة في سبتمبر وفحصًا للتوصيلات قبل إعادة R-4 إلى الخدمة. ولم تُجرَ صيانة أو اختبارات تشخيصية ليلة 14 أكتوبر.',
    'R-7 did not record the increase, but its direction and sensitivity differed, so it is not a direct control.':'لم يسجل R-7 الارتفاع، لكن اتجاهه وحساسيته مختلفان، لذلك لا يصلح بوصفه جهاز مقارنة ضابطًا مباشرًا.',
    'A preliminary report suggested an external event before the original recording was recovered; it is not independent confirmation.':'اقترح تقرير أولي وقوع حدث خارجي قبل استعادة التسجيل الأصلي، لكنه لا يُعد تأكيدًا مستقلًا.',
    'A technician’s note from two days earlier expresses concern that the problem may have returned; it is an impression, not a diagnosis.':'تعبر ملاحظة لفني كُتبت قبل يومين عن قلقه من احتمال عودة المشكلة؛ لكنها انطباع وليست تشخيصًا.',
    'Which statement reports the instrument record without adding a cause?':'أي عبارة تنقل ما سجله الجهاز دون إضافة سبب؟',
    'R-4 registered an unusual rise, although the recovered record is incomplete.':'سجل R-4 ارتفاعًا غير مألوف، رغم أن التسجيل المستعاد غير مكتمل.',
    'An outside source produced the rise recorded by R-4.':'تسبب مصدر خارجي في الارتفاع الذي سجله R-4.',
    'A fault in R-4 explains the rise in the recovered recording.':'يفسر عطل في R-4 الارتفاع الوارد في التسجيل المستعاد.',
    'The recording establishes an unusual increase on R-4, not what produced it.':'يثبت التسجيل حدوث ارتفاع غير مألوف في R-4، لكنه لا يحدد سببه.',
    'What limits the comparison with R-7?':'ما الذي يحد من المقارنة مع R-7؟',
    'R-7 had a different direction and sensitivity from R-4.':'كان اتجاه R-7 وحساسيته مختلفين عن R-4.',
    'R-7 recorded the same increase as R-4.':'سجل R-7 الارتفاع نفسه الذي سجله R-4.',
    'R-7 was tested alongside R-4 during the event.':'اختُبر R-7 إلى جانب R-4 أثناء الحدث.',
    'Because the instruments differed in direction and sensitivity, R-7 is not a direct control.':'نظرًا لاختلاف الجهازين في الاتجاه والحساسية، لا يُعد R-7 جهاز مقارنة ضابطًا مباشرًا.',
    'R-4 recorded unusual increase':'سجل R-4 ارتفاعًا غير مألوف',
    'cause remains unresolved':'لا يزال السبب غير محسوم',
    'external source is possible':'من المحتمل وجود مصدر خارجي',
    'receiver fault is possible':'من المحتمل وجود عطل في جهاز الاستقبال',
    'R-7 is not a direct control':'لا يُعد R-7 جهاز مقارنة ضابطًا مباشرًا',
    'The Blue Scarf':'الوشاح الأزرق',
    'Mina loses her blue scarf at a small train station.':'تفقد مينا وشاحها الأزرق في محطة قطار صغيرة.',
    'Your task: find where Mina’s scarf is now. Use the short records to follow what happened.':'مهمتك: اكتشف مكان وشاح مينا الآن. استخدم السجلات القصيرة لتتبع ما حدث.',
    '8:05 — Mina sits on a bench at Platform 2. She has a blue scarf with a small silver star.':'8:05 — تجلس مينا على مقعد في الرصيف 2، ومعها وشاح أزرق يحمل نجمة فضية صغيرة.',
    '8:20 — A cleaner finds a blue scarf with a small silver star under the bench and takes it to the lost-property desk.':'8:20 — يعثر عامل النظافة على وشاح أزرق يحمل نجمة فضية صغيرة تحت المقعد، وينقله إلى مكتب المفقودات.',
    '8:25 — The station list records one blue scarf with a small silver star from Platform 2.':'8:25 — يسجل كشف المحطة استلام وشاح أزرق واحد يحمل نجمة فضية صغيرة من الرصيف 2.',
    'A station notice says lost property is kept at the ticket desk.':'يفيد إعلان المحطة بأن المفقودات تُحفظ لدى شباك التذاكر.',
    'When Mina gets on her train, the scarf is no longer with her.':'عندما تستقل مينا قطارها، لا يكون الوشاح معها.',
    'Mina says she had a blue scarf with a small silver star when she sat on the bench at Platform 2. It was missing when she boarded her train.':'تقول مينا إن معها وشاحًا أزرق يحمل نجمة فضية صغيرة عندما جلست على مقعد الرصيف 2، وإنه كان مفقودًا عندما استقلت قطارها.',
    'scarf description and last known possession':'وصف الوشاح وآخر مرة عُرف أنه كان بحوزتها',
    'Mina did not see where the scarf fell.':'لم ترَ مينا أين سقط الوشاح.',
    'A cleaner found a blue scarf with a small silver star under the Platform 2 bench at 8:20 and took it to the lost-property desk.':'عثر عامل النظافة على وشاح أزرق يحمل نجمة فضية صغيرة تحت مقعد الرصيف 2 عند الساعة 8:20، ونقله إلى مكتب المفقودات.',
    'matching scarf found and transferred':'العثور على الوشاح المطابق ونقله',
    'The note does not name the owner.':'لا تذكر الملاحظة اسم المالك.',
    'At 8:25 the station list recorded one blue scarf with a small silver star received from Platform 2.':'في الساعة 8:25 سجّل كشف المحطة استلام وشاح أزرق واحد يحمل نجمة فضية صغيرة من الرصيف 2.',
    'matching item received by lost property':'استلام مكتب المفقودات للغرض المطابق',
    'The list records the item, not the owner.':'يسجل الكشف الغرض، لا مالكه.',
    'A station notice says lost property is kept at the ticket desk.':'يفيد إعلان المحطة بأن المفقودات تُحفظ لدى شباك التذاكر.',
    'where lost property is kept':'مكان حفظ المفقودات',
    'The notice does not identify any particular lost item.':'لا يحدد الإعلان أي غرض مفقود بعينه.',
    'Where did the cleaner find the scarf?':'أين وجد عامل النظافة الوشاح؟',
    'Under the bench on Platform 2.':'تحت المقعد في الرصيف 2.',
    'On Mina’s train.':'على قطار مينا.',
    'At the ticket desk.':'عند شباك التذاكر.',
    'The cleaning note says the scarf was under the bench on Platform 2.':'تذكر ملاحظة عامل النظافة أن الوشاح كان تحت المقعد في الرصيف 2.',
    'What happened after the cleaner found the scarf?':'ماذا حدث بعد أن عثر عامل النظافة على الوشاح؟',
    'The cleaner left it on the bench.':'تركه عامل النظافة على المقعد.',
    'The cleaner took it to the lost-property desk.':'نقله عامل النظافة إلى مكتب المفقودات.',
    'Mina took it onto the train.':'أخذته مينا معها إلى القطار.',
    'The cleaning note says the scarf was taken to lost property, and the station list confirms it was received.':'تذكر ملاحظة عامل النظافة أن الوشاح نُقل إلى مكتب المفقودات، ويؤكد كشف المحطة استلامه.',
    'Mina scarf is at the lost-property or ticket desk':'وشاح مينا موجود في مكتب المفقودات أو عند شباك التذاكر',
    'matching scarf was found under the Platform 2 bench':'عُثر على الوشاح المطابق تحت مقعد الرصيف 2',
    'cleaner took the scarf to lost property':'نقل عامل النظافة الوشاح إلى مكتب المفقودات',
    'the records describe the same scarf by its silver star':'تصف السجلات الوشاح نفسه من خلال نجمته الفضية',
    'the scarf was stolen':'سُرق الوشاح',
    'Supported by the evidence':'مدعوم بالأدلة',
    'Not enough information to assess this point':'لا تتوفر معلومات كافية لتقييم هذه النقطة',
    'Not established by the evidence':'غير مثبت بالأدلة',
    'Goes beyond what the evidence establishes':'يتجاوز ما تثبته الأدلة',
    'Needs a closer look':'يحتاج إلى مراجعة أدق',
    'Separate what the records establish from what they only suggest.':'ميّز بين ما تثبته السجلات وما تشير إليه فحسب.',
    'Evidence':'الأدلة',
    'People':'الأشخاص',
    'Conclusion':'الاستنتاج',
    'Initial statements':'الإفادات الأولية',
    'What everyone said':'ما قاله الجميع',
    'Who would you like to speak with?':'مع من تود التحدث؟',
    'Available to question':'متاح للاستجواب',
    'Conversation open':'المحادثة مفتوحة',
    'Interview complete':'اكتملت المقابلة',
    'Evidence board':'لوحة الأدلة',
    'Records & objects':'السجلات والأشياء',
    'People’s accounts':'إفادات الأشخاص',
    'Interview notes':'ملاحظات المقابلات',
    'Case notebook':'دفتر القضية',
    'Your notebook is empty. Examine a record or speak with someone; discoveries will be organised here.':'دفترك فارغ. افحص سجلًا أو تحدث إلى أحد الأشخاص؛ وستُنظَّم اكتشافاتك هنا.',
    'Optional hints':'تلميحات اختيارية',
    'Use them in order. Hints do not reduce your academic score.':'استخدمها بالترتيب. لا تؤثر التلميحات في تقييمك الأكاديمي.',
    'Direction':'التوجيه',
    'Connection':'الربط',
    'Reasoning':'الاستدلال',
    'Start with what the records directly establish. Separate observations from assumptions.':'ابدأ بما تثبته السجلات مباشرة، وافصل بين الملاحظات والافتراضات.',
    'Compare the timeline and sources. Access, opportunity and a reported action are not automatically proof that one person acted.':'قارن التسلسل الزمني والمصادر. فإمكانية الوصول وتوفر الفرصة وورود فعل في إفادة لا تثبت تلقائيًا أن شخصًا بعينه هو من قام به.',
    'State what is established, what remains possible, and what the evidence cannot establish.':'وضّح ما ثبت، وما لا يزال ممكنًا، وما تعجز الأدلة عن إثباته.',
    'Explain your reasoning':'اشرح استدلالك',
    'What do the records establish? Which details are only possible, and what cannot be proved?':'ما الذي تثبته السجلات؟ وما التفاصيل التي تظل مجرد احتمالات؟ وما الذي لا يمكن إثباته؟',
    'Your Reasoning':'استدلالك',
    'What do you think happened?':'ما الذي تعتقد أنه حدث؟',
    'Support your conclusion':'ادعم استنتاجك',
    'Connect your explanation to the case material, and identify what remains uncertain.':'اربط تفسيرك بمواد القضية، وحدد ما لا يزال غير مؤكد.',
    'Choose your conclusion':'اختر استنتاجك',
    'Select the statement that is best supported by the evidence—not simply the most certain one.':'اختر العبارة التي تدعمها الأدلة بأفضل صورة، لا العبارة الأكثر جزمًا فحسب.',
    'The conclusion choices unlock after you submit your reasoning.':'ستُفتح خيارات الاستنتاج بعد إرسال استدلالك.',
    'The conclusion choices unlock after you submit your reasoning.':'ستُفتح خيارات الاستنتاج بعد إرسال استدلالك.',
    'Conclusion supported':'الاستنتاج مدعوم بالأدلة',
    'Partly supported':'مدعوم جزئيًا',
    'Needs clarification':'يحتاج إلى توضيح',
    'Unsupported conclusion':'استنتاج غير مدعوم',
    'Conflicts with the evidence':'يتعارض مع الأدلة',
    'Your main conclusion and reasoning fit the available evidence.':'يتوافق استنتاجك الأساسي واستدلالك مع الأدلة المتاحة.',
    'You have identified part of the picture. Review the missing link or evidence boundary below.':'لقد حددت جزءًا من الصورة. راجع الحلقة المفقودة أو حدود الأدلة أدناه.',
    'The meaning or reference is not clear enough to assess fairly. Clarify who or what you mean, then try again.':'المعنى أو المرجع غير واضح بما يكفي لتقييم الإجابة بإنصاف. وضّح من أو ما الذي تقصده، ثم حاول مجددًا.',
    'A central claim goes beyond what the case evidence establishes. This does not mean every part of your answer is wrong.':'يتجاوز أحد الادعاءات الأساسية ما تثبته أدلة القضية. ولا يعني ذلك أن جميع أجزاء إجابتك خاطئة.',
    'A central claim conflicts with the case record. Revisit the relevant evidence before drawing that conclusion.':'يتعارض ادعاء أساسي مع سجل القضية. راجع الأدلة ذات الصلة قبل الوصول إلى ذلك الاستنتاج.',
    'Records you examined':'السجلات التي فحصتها',
    'What to take from this result':'ما الذي يمكنك استخلاصه من هذه النتيجة؟',
    'Keep in mind':'تذكّر',
    'A missing detail is not automatically a contradiction. A strong inference can be reasonable without becoming proof; the limits of each record still matter.':'غياب أحد التفاصيل لا يعني بالضرورة وجود تناقض. قد يكون الاستنتاج القوي معقولًا دون أن يصبح دليلًا قاطعًا؛ وتظل حدود كل سجل مهمة.',
    'Revise and try again':'راجع إجابتك وحاول مجددًا',
    'Choose another case':'اختر قضية أخرى'
  });

  function markCaseboundTranslations(container) {
    if (!container) return;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,noscript,textarea,input,select,option,code,pre,.translate-btn,[aria-hidden="true"],[data-ld-conclusion-option],.ld-conclusion-locked,.ld-contact-row,.ld-scene-step')) continue;
      const english = String(node.nodeValue || '').replace(/\s+/g, ' ').trim();
      if (!english || !CASEBOUND_ARABIC[english]) continue;
      const button = parent.closest('button');
      if (button && button.querySelector('[data-tx]')) continue;
      nodes.push({node,english,arabic:CASEBOUND_ARABIC[english],button});
    }
    nodes.forEach(({node,english,arabic,button}) => {
      if (!node.parentNode || node.parentElement?.closest('[data-tx]') || (button && button.querySelector('[data-tx]'))) return;
      if (button && button.childElementCount === 0 && button.textContent.trim() === english) {
        button.dataset.tx = '';
        button.dataset.translationAr = arabic;
        return;
      }
      const span = document.createElement('span');
      span.dataset.tx = '';
      span.dataset.translationAr = arabic;
      node.parentNode.replaceChild(span,node);
      span.appendChild(node);
    });
  }

  function enhanceCaseboundTranslations() {
    const page = root?.closest('.casebound-page') || root;
    markCaseboundTranslations(page);
    window.EPIPHANY_TRANSLATION_ENHANCE?.(page);
    const drawer = document.getElementById('ld-case-notebook');
    if (drawer) {
      markCaseboundTranslations(drawer);
      window.EPIPHANY_TRANSLATION_ENHANCE?.(drawer);
    }
  }

  const hints = [
    { id: 'DIRECTION', title: 'Direction', text: 'Start with what the records directly establish. Separate observations from assumptions.' },
    { id: 'CONNECTION', title: 'Connection', text: 'Compare the timeline and sources. Access, opportunity and a reported action are not automatically proof that one person acted.' },
    { id: 'REASONING', title: 'Reasoning', text: 'State what is established, what remains possible, and what the evidence cannot establish.' }
  ];
  let root = null;
  let onExit = () => {};
  let state = null;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const outcomeLabel = {
    ACCEPTED: 'Conclusion supported',
    PARTIAL: 'Partly supported',
    NEEDS_CLARIFICATION: 'Needs clarification',
    UNSUPPORTED: 'Unsupported conclusion',
    CONTRADICTION: 'Conflicts with the evidence'
  };
  const outcomeText = {
    ACCEPTED: 'Your main conclusion and reasoning fit the available evidence.',
    PARTIAL: 'You have identified part of the picture. Review the missing link or evidence boundary below.',
    NEEDS_CLARIFICATION: 'The meaning or reference is not clear enough to assess fairly. Clarify who or what you mean, then try again.',
    UNSUPPORTED: 'A central claim goes beyond what the case evidence establishes. This does not mean every part of your answer is wrong.',
    CONTRADICTION: 'A central claim conflicts with the case record. Revisit the relevant evidence before drawing that conclusion.'
  };

  const outcomeStamp = {
    ACCEPTED: 'SOLVED',
    PARTIAL: 'PARTIAL',
    NEEDS_CLARIFICATION: 'CLARIFY',
    UNSUPPORTED: 'NOT ESTABLISHED',
    CONTRADICTION: 'REVISIT EVIDENCE'
  };

  function segmented(name, label, options) {
    return '<fieldset class="ld-segment"><legend>' + label + '</legend><div class="ld-segment-options">' + options.map(o =>
      '<label class="ld-segment-option' + (state[name] === o[0] ? ' is-on' : '') + '"><input type="radio" name="ld-' + name + '" value="' + o[0] + '" data-ld-setting="' + name + '"' + (state[name] === o[0] ? ' checked' : '') + '><strong>' + o[1] + '</strong><small>' + o[2] + '</small></label>'
    ).join('') + '</div></fieldset>';
  }

  function settingsMarkup() {
    const answerOptions = [['STANDARD','Standard','Reason, then choose']];
    if (state.completedCaseIds.length) answerOptions.push(['HELL','Hell Mode','Write it all']);
    return '<details class="ld-settings-disclosure"><summary><span aria-hidden="true">⚙</span> Settings</summary><div class="ld-settings">' +
      segmented('trainingMode', 'Support level', [['GUIDED','Guided','Hints + practice'],['STEADY','Steady','Balanced'],['CHALLENGE','Challenge','Least help']]) +
      segmented('answerFormat', 'Answer style', answerOptions) +
      '</div></details>';
  }

  const CEFR_LEVELS = {
    A1: { title: 'A1 · Beginner', note: 'Short, direct clues and everyday situations.' },
    A2: { title: 'A2 · Elementary', note: 'Simple timelines and clear links between events.' },
    B1: { title: 'B1 · Intermediate', note: 'More detail, reported accounts and careful comparisons.' },
    B2: { title: 'B2 · Upper intermediate', note: 'More layered evidence and competing interpretations.' },
    C1: { title: 'C1 · Advanced', note: 'Subtle evidence boundaries and competing explanations.' },
    C2: { title: 'C2 · Proficient', note: 'Highly nuanced reasoning across complex sources.' }
  };

  function picker() {
    const levelCards = CEFR_ORDER.map(level => {
      const meta = CEFR_LEVELS[level];
      const count = Object.keys(caseInfo).filter(id => caseInfo[id].cefr === level).length;
      const rank = CEFR_ORDER.indexOf(level) + 1;
      return '<button type="button" class="ld-level-card' + (count ? '' : ' is-empty') + '" data-level="' + level + '" data-ld-level-select="' + level + '">' +
        '<span class="ld-level-card-top"><strong>' + level + '</strong><span>' + count + (count === 1 ? ' case' : ' cases') + '</span></span>' +
        '<span class="ld-level-dots" aria-hidden="true">' + CEFR_ORDER.map((_, k) => '<i' + (k < rank ? ' class="on"' : '') + '></i>').join('') + '</span>' +
        '<b>' + meta.title.slice(5) + '</b><span>' + meta.note + '</span>' +
        '<em>' + (count ? 'View investigations →' : 'Coming soon') + '</em></button>';
    }).join('');
    const selectedLevel = state.selectedLevel;
    const selectedMeta = selectedLevel ? CEFR_LEVELS[selectedLevel] : null;
    const caseCards = selectedLevel ? Object.keys(caseInfo)
      .filter(id => caseInfo[id].cefr === selectedLevel)
      .map((id, n) => {
        const item = caseInfo[id];
        return '<button type="button" class="ld-case-card" data-level="' + esc(item.cefr) + '" data-ld-case="' + id + '">' +
          '<span class="ld-case-tab">CASE ' + String(n + 1).padStart(2, '0') + ' · ' + esc(item.cefr) + '</span>' +
          '<span class="ld-case-meta">' + esc(item.category) + '</span><strong>' + esc(item.title) + '</strong><span>' + esc(item.subtitle) + '</span>' +
          '<em>Open investigation →</em></button>';
      }).join('') : '';
    const content = selectedLevel
      ? '<div class="ld-level-case-view"><div class="ld-level-view-heading"><button type="button" class="ld-back" data-ld-level-back>← All levels</button><div><span class="ld-kicker">' + selectedLevel + '</span><h3>' + selectedMeta.title + '</h3><p>' + selectedMeta.note + '</p></div></div>' +
        (caseCards ? '<div class="ld-case-grid">' + caseCards + '</div>' : '<p class="ld-level-empty">There are no investigations at this level yet. New cases will appear here.</p>') +
        '</div>'
      : '<div class="ld-level-selection"><div class="ld-level-selection-heading"><h3>Choose your English level</h3><p>Each level has its own investigations, characters and challenges.</p></div><div class="ld-level-grid">' + levelCards + '</div></div>';
    root.innerHTML = '<section class="ld-shell ld-casebound-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-exit>← Home</button><span>CASE FILES</span></div>' +
      '<div class="ld-heading ld-hero"><span class="ld-kicker">CASEBOUND · EVERY CLUE HAS A STORY</span><h2>CASEBOUND</h2><p class="ld-hero-line">Read the clues. Prove what happened.</p><p>Investigate cases, examine evidence and discover what really happened.</p><ol class="ld-howto"><li><b>1</b>Read the statements</li><li><b>2</b>Question people</li><li><b>3</b>Examine evidence</li><li><b>4</b>Build your conclusion</li></ol></div>' +
      settingsMarkup() + content +
      '<p class="ld-note">Guided, Steady and Challenge change the level of support. Standard and Hell Mode change how you submit your conclusion; neither mode changes the evidence or rewards unsupported certainty.</p>' +
      '</section>';
    enhanceCaseboundTranslations();
  }

  function readResponse() {
    if (!root || state?.stage === 'result') return state?.lastResponse || { conclusion: '', reasoning: '', selectedConclusion: null };
    if (state.answerFormat === 'HELL') {
      const conclusionField = root.querySelector('[name="ld-conclusion"]');
      const reasoningField = root.querySelector('[name="ld-reasoning"]');
      return {
        conclusion: conclusionField ? conclusionField.value : (state.lastResponse?.conclusion || ''),
        reasoning: reasoningField ? reasoningField.value : (state.lastResponse?.reasoning || '')
      };
    }
    const reasoningField = root.querySelector('[name="ld-standard-reasoning"]');
    return {
      conclusion: Number.isInteger(state.selectedConclusion) ? (caseInfo[state.caseId]?.conclusionOptions[state.selectedConclusion] || '') : (state.lastResponse?.conclusion || ''),
      reasoning: reasoningField ? reasoningField.value : (state.standardReasoning ?? state.lastResponse?.reasoning ?? ''),
      selectedConclusion: state.selectedConclusion ?? state.lastResponse?.selectedConclusion ?? null
    };
  }

  function caseIntroduction() {
    const info = caseInfo[state.caseId];
    if (!info) return picker();
    root.innerHTML = '<section class="ld-shell ld-case-intro">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← All cases</button><span>CASE BRIEF · ' + esc(info.cefr) + '</span></div>' +
      '<div class="ld-case-intro-art ld-dossier" data-level="' + esc(info.cefr) + '" aria-hidden="true"><b>CASE FILE · ' + esc(info.cefr) + '</b><span>CB</span><i>' + esc(info.category) + '</i><em class="ld-dossier-stamp">OPEN</em></div>' +
      '<div class="ld-heading"><span class="ld-kicker">' + esc(info.category) + ' · ' + esc(info.cefr) + '</span><h2>' + esc(info.title) + '</h2><p>' + esc(info.subtitle) + '</p></div>' +
      '<div class="ld-case-brief"><span class="ld-kicker">YOUR INVESTIGATION</span><p>' + esc(info.focus) + '</p></div>' +
      '<ol class="ld-howto ld-howto-light"><li><b>1</b>Meet the people</li><li><b>2</b>Review the evidence</li><li><b>3</b>Build your conclusion</li></ol><div class="ld-case-intro-actions"><button type="button" class="ld-submit" data-ld-start-investigation>Start Investigation <span aria-hidden="true">→</span></button><p>Take your time. You can review everything you discover as the investigation unfolds.</p></div>' +
      '</section>';
    enhanceCaseboundTranslations();
  }

  function discoveredEvidenceForState(evidenceId) {
    return Boolean(state?.session?.discoveredEvidenceIds?.includes(evidenceId));
  }

  function investigation() {
    const previousScrollY = window.scrollY || 0;
    document.getElementById('ld-case-notebook')?.remove();
    document.querySelector('.ld-notebook-backdrop')?.remove();
    const info = caseInfo[state.caseId];
    const snapshot = fixtures.cases[state.caseId];
    const session = state.session;
    if (!session || session.status !== 'ACTIVE') return caseIntroduction();
    const evidenceItems = Array.isArray(snapshot.evidence) ? snapshot.evidence : [];
    const discovered = new Set(session.discoveredEvidenceIds || []);
    const nextEvidence = investigationModel.getAvailableEvidence(snapshot, session)[0] || null;
    const openedEvidence = evidenceItems.filter(item => discovered.has(item.evidenceId));
    const progress = evidenceItems.length ? Math.round(openedEvidence.length / evidenceItems.length * 100) : 100;
    const readiness = investigationModel.isConclusionReady(snapshot, session);
    const answers = readResponse();
    const case005Links = state.caseId === 'CASE-005' ? {
      statements:{'S-LINA':['E01','E02'],'S-OMAR':['E01'],'S-NORA':['E01']},
      evidence:{E01:['S-LINA','S-OMAR','S-NORA'],E02:['S-LINA'],E03:['S-LINA'],E04:['S-LINA']},
      evidenceLabels:{E01:'Review the three initial accounts',E02:'Return to Lina’s account',E03:'Return to Lina’s account',E04:'Return to Lina’s account'}
    } : null;
    const sourceButton = (label, action, value) => '<button type="button" class="ld-source-link" data-ld-source-' + action + '="' + esc(value) + '">' + esc(label) + ' →</button>';
    const evidenceCard = (item, i) => '<article class="ld-evidence" data-evidence-id="' + esc(item.evidenceId) + '"><span>' + esc(item.role) + ' · ' + esc(item.evidenceId || ('E' + String(i + 1).padStart(2, '0'))) + '</span><p>' + esc(item.summary) + '</p>' + (item.limitations?.length ? '<small>Limit: ' + esc(item.limitations.join(' ')) + '</small>' : '') + (case005Links?.evidence[item.evidenceId] ? sourceButton(case005Links.evidenceLabels[item.evidenceId], 'statement', case005Links.evidence[item.evidenceId][0]) : '') + '</article>';
    const notebookSections = investigationModel.getNotebookSections(snapshot, session);
    const notebookEntries = investigationModel.getNotebookEntries(snapshot, session);
    const notebook = notebookSections.length
      ? notebookSections.map(section => '<section class="ld-notebook-section"><h3>' + esc(section.title) + '</h3><p>' + esc(section.description) + '</p>' + section.entries.map(entry => {
          let sourceLink = '';
          if (case005Links && entry.type === 'STATEMENT') sourceLink = (case005Links.statements[entry.id] || []).filter(id => discovered.has(id)).map(id => sourceButton('Open related ' + id, 'evidence', id)).join('');
          if (case005Links && entry.type === 'EVIDENCE') sourceLink = sourceButton('Return to related statement', 'statement', case005Links.evidence[entry.id]?.[0] || 'S-LINA');
          if (entry.type === 'INTERVIEW') sourceLink = sourceButton('Return to interview', 'interview', entry.id);
          if (entry.type === 'STATEMENT') sourceLink += sourceButton('Open this account', 'statement', entry.id);
          return '<article class="ld-notebook-entry ld-notebook-entry-' + esc(entry.type.toLowerCase()) + '" id="ld-notebook-entry-' + esc(entry.id) + '"><strong>' + esc(entry.title) + '</strong><p>' + esc(entry.content) + '</p>' + sourceLink + '</article>';
        }).join('') + '</section>').join('')
      : '<p class="ld-notebook-empty">Your notebook is empty. Examine a record or speak with someone; discoveries will be organised here.</p>';
    const selectedDossier = state.selectedCharacterId ? investigationModel.getCharacterDossier(snapshot,session,state.selectedCharacterId) : null;
    const visibleStatements = (snapshot.statements || []).filter(statement =>
      (session.revealedStatementIds || []).includes(statement.statementId || statement.id)
    );
    const statements = '<section class="ld-workspace-section ld-briefing-section ld-panel-statements"><div class="ld-section-heading"><div><span class="ld-kicker">INITIAL ACCOUNTS</span><h3>What everyone said</h3><p>Read the available statements together before choosing whom to question. You can return to them throughout the investigation.</p></div></div>' +
      (visibleStatements.length ? '<div class="ld-statement-list">' + visibleStatements.map(statement => {
        const person = (snapshot.characters || []).find(item => (item.characterId || item.id) === (statement.characterId || statement.speakerId));
        const speaker = statement.name || statement.speaker || person?.name || 'Statement';
        const statementId = statement.statementId || statement.id;
        const relatedEvidence = case005Links?.statements[statementId] || [];
        const relatedLinks = relatedEvidence.filter(id => discovered.has(id)).map(id => sourceButton('Examine ' + id, 'evidence', id)).join('');
        const interviewLink = person ? sourceButton('Ask ' + speaker, 'interview', person.characterId || person.id) : '';
        return '<article class="ld-statement-card" id="ld-statement-' + esc(statementId) + '"><span class="ld-statement-speaker">' + esc(speaker) + (person?.role ? ' · ' + esc(person.role) : '') + '</span><p>' + esc(statement.text || statement.statement || '') + '</p><div class="ld-source-links">' + relatedLinks + interviewLink + '</div></article>';
      }).join('') + '</div>' : '<p class="ld-unlock-gate">Initial statements will appear here when they become available.</p>') +
      '</section>';
    const characters = Array.isArray(snapshot.characters) && snapshot.characters.length
      ? '<section class="ld-workspace-section ld-panel-people ld-contact-section"><div class="ld-section-heading"><div><span class="ld-kicker">PEOPLE</span><h3>Who would you like to speak with?</h3><p>Choose a person to open their conversation. Each person can answer one question in this interview.</p></div><span class="ld-contact-count">' + snapshot.characters.length + ' people</span></div><div class="ld-contact-list" aria-label="People available for interview">' + snapshot.characters.map(person => {
          const id = person.characterId || person.id;
          const selected = state.selectedCharacterId === id;
          const response = (session.interviewResponses || []).find(item => item.characterId === id);
          const completed = Boolean(response && response.questionIds && response.questionIds.length);
          const name = person.name || person.label || 'Person';
          const status = completed ? 'Interview complete' : selected ? 'Conversation open' : 'Available to question';
          return '<button type="button" class="ld-contact-row' + (selected ? ' is-selected' : '') + (completed ? ' is-complete' : '') + '" data-ld-select-character="' + esc(id) + '" aria-pressed="' + String(selected) + '"><span class="ld-contact-avatar" aria-hidden="true">' + esc(String(name).trim().charAt(0).toUpperCase()) + '</span><span class="ld-contact-copy"><strong>' + esc(name) + '</strong><span>' + esc(person.role || 'Person in this case') + '</span><small>' + status + '</small></span><span class="ld-contact-action" aria-hidden="true">' + (selected ? 'Viewing' : completed ? 'Review' : 'Talk') + ' <b>→</b></span></button>';
        }).join('') + '</div></section>' : '';
    const selectedInterviewSource = selectedDossier && Array.isArray(snapshot.interviews)
      ? snapshot.interviews.find(item => item.characterId === state.selectedCharacterId) : null;
    const selectedInitialStatement = selectedDossier
      ? visibleStatements.find(item => (item.characterId || item.speakerId) === state.selectedCharacterId) : null;
    const interviews = selectedDossier && selectedDossier.interview
      ? '<section class="ld-workspace-section ld-panel-people ld-conversation" id="ld-interview-section" aria-label="Conversation with ' + esc(selectedDossier.character.name || 'this person') + '">' +
        '<div class="ld-conversation-heading"><i class="ld-avatar" aria-hidden="true">' + esc(String(selectedDossier.character.name || '?').trim().charAt(0).toUpperCase()) + '</i><div><span class="ld-kicker">PERSON OF INTEREST</span><h3>' + esc(selectedDossier.character.name || 'Interview') + '</h3><p>' + esc(selectedDossier.character.role || 'Available for questions') + '</p></div></div>' +
        '<div class="ld-conversation-thread" aria-live="polite">' +
        (selectedInitialStatement ? '<div class="ld-chat-message ld-chat-person"><i class="ld-avatar" aria-hidden="true">' + esc(String(selectedDossier.character.name || '?').trim().charAt(0).toUpperCase()) + '</i><div class="ld-chat-content"><span>' + esc(selectedDossier.character.name || 'Statement') + ' · Initial statement</span><p class="ld-chat-bubble">' + esc(selectedInitialStatement.text || selectedInitialStatement.statement || '') + '</p></div></div>' : '') +
        selectedDossier.interview.answers.map(answer => {
          const question = selectedInterviewSource?.questions?.find(item => item.questionId === answer.questionId);
          return '<div class="ld-chat-message ld-chat-player"><div class="ld-chat-content"><span>You asked</span><p class="ld-chat-bubble">' + esc(question?.prompt || 'Follow-up question') + '</p></div><i class="ld-chat-player-avatar" aria-hidden="true">Y</i></div>' +
            '<div class="ld-chat-message ld-chat-person" id="ld-interview-' + esc(answer.questionId) + '"><i class="ld-avatar" aria-hidden="true">' + esc(String(selectedDossier.character.name || '?').trim().charAt(0).toUpperCase()) + '</i><div class="ld-chat-content"><span>' + esc(selectedDossier.character.name || 'Answer') + '</span><p class="ld-chat-bubble">' + esc(answer.answer) + '</p>' + sourceButton('Added to case notebook', 'notebook', state.selectedCharacterId + ':' + answer.questionId) + '</div></div>';
        }).join('') + '</div>' +
        (selectedDossier.interview.availableQuestions.length ? '<div class="ld-conversation-prompts"><span class="ld-kicker">ASK A QUESTION · ONE PER PERSON</span><div class="ld-interview-list">' + selectedDossier.interview.availableQuestions.map(question => '<button type="button" class="ld-interview-question" data-ld-ask-interview data-character-id="' + esc(state.selectedCharacterId) + '" data-question-id="' + esc(question.questionId) + '">' + esc(question.prompt) + '</button>').join('') + '</div></div>' : '<p class="ld-interview-used" role="status">You have asked this person a question. Their answer is saved in your case notebook.</p>') +
        '</section>' : '';
    const witnesses = Array.isArray(snapshot.witnesses) && snapshot.witnesses.length
      ? '<section class="ld-workspace-section ld-panel-people"><div class="ld-section-heading"><div><span class="ld-kicker">WITNESS LEAD</span><h3>Choose one witness</h3><p>Your choice adds that witness’s account to the notebook. Other evidence paths remain available.</p></div></div><div class="ld-witness-grid">' + snapshot.witnesses.map(witness => {
          const witnessId = witness.witnessId || witness.id;
          const selected = session.selectedWitnessId === witnessId;
          const locked = Boolean(session.selectedWitnessId) && !selected;
          return '<article class="ld-witness-card' + (selected ? ' is-selected' : '') + '"><strong>' + esc(witness.name || witness.label || 'Witness') + '</strong>' + (witness.description ? '<p>' + esc(witness.description) + '</p>' : '') + '<button type="button" class="ld-witness-select" data-ld-select-witness="' + esc(witnessId) + '"' + (locked ? ' disabled' : '') + '>' + (selected ? 'Selected' : locked ? 'Another witness selected' : 'Hear this witness') + '</button>' + (selected && (witness.statement || witness.account) ? '<p class="ld-witness-account">' + esc(witness.statement || witness.account) + '</p>' : '') + '</article>';
        }).join('') + '</div></section>' : '';
    const checksAvailable = state.trainingMode === 'GUIDED' && Array.isArray(info.questions) && info.questions.length;
    const questionMarkup = checksAvailable && state.showEvidenceChecks
      ? '<section class="ld-checkpoints"><div><h3>Evidence checks</h3><p>Optional practice to help you inspect the record. These checks do not block progress or affect the written assessment.</p></div>' + info.questions.map(q => '<article class="ld-question" data-ld-question="' + q.id + '"><strong>' + esc(q.prompt) + '</strong><div class="ld-question-options">' + q.options.map((option, i) => '<button type="button" data-ld-option="' + i + '">' + esc(option) + '</button>').join('') + '</div><p class="ld-question-feedback" aria-live="polite"></p></article>').join('') + '</section>' : '';
    const visibleHints = hints.map((hint, i) => {
      const used = state.hintsUsed.includes(hint.id);
      const available = i === 0 || state.hintsUsed.includes(hints[i - 1].id);
      return '<button type="button" class="ld-hint-button" data-ld-hint="' + hint.id + '"' + (used || !available ? ' disabled' : '') + '>' + (used ? '✓ ' : '') + hint.title + '</button>' +
        (used ? '<p class="ld-hint-copy">' + hint.text + '</p>' : '');
    }).join('');
    const canConclude = readiness.ready;
    const stepDone = [visibleStatements.length > 0, session.interviewResponses.length > 0 || Boolean(session.selectedWitnessId), !nextEvidence && evidenceItems.length > 0 && openedEvidence.length === evidenceItems.length, false];
    const stepNames = ['Read', 'Question', 'Examine', 'Conclude'];
    const stepActive = canConclude ? 3 : Math.max(0, stepDone.findIndex(done => !done));
    const stepsMarkup = '<ol class="ld-steps" aria-label="Investigation steps">' + stepNames.map((name, k) => '<li class="' + (stepDone[k] && k < stepActive ? 'is-done' : '') + (k === stepActive ? ' is-active' : '') + '"' + (k === stepActive ? ' aria-current="step"' : '') + '><b>' + (stepDone[k] && k < stepActive ? '✓' : k + 1) + '</b><span>' + name + '</span></li>').join('') + '</ol>' +
      '<p class="ld-next-step">' + (canConclude ? 'You have what you need. Build your conclusion below.' : nextEvidence ? 'Next: examine the new evidence.' : session.interviewResponses.length || session.selectedWitnessId ? 'Keep questioning to unlock the remaining evidence.' : 'Next: question someone or hear a witness.') + '</p>';
    const answerFields = state.answerFormat === 'HELL'
      ? '<section class="ld-answer-step"><div class="ld-answer-step-heading"><span>STEP 1</span><div><h4>State your conclusion</h4><p>What do you think happened?</p></div></div><label class="ld-answer-field">Your Conclusion<textarea name="ld-conclusion" rows="3" maxlength="1200" placeholder="What do you think happened?">' + esc(answers.conclusion) + '</textarea></label></section><section class="ld-answer-step"><div class="ld-answer-step-heading"><span>STEP 2</span><div><h4>Support your conclusion</h4><p>Connect your explanation to the case material, and identify what remains uncertain.</p></div></div><label class="ld-answer-field">Your Reasoning<textarea name="ld-reasoning" rows="4" maxlength="1800" placeholder="Which evidence supports your conclusion? What remains uncertain?">' + esc(answers.reasoning) + '</textarea></label></section>'
      : '<section class="ld-answer-step"><div class="ld-answer-step-heading"><span>STEP 1</span><div><h4>Explain your reasoning</h4><p>What do the records establish? Which details are only possible, and what cannot be proved?</p></div></div><label class="ld-answer-field">Your Reasoning<textarea name="ld-standard-reasoning" rows="5" maxlength="1800" ' + (state.standardReasoningSubmitted ? 'readonly aria-readonly="true"' : '') + ' placeholder="Explain what the evidence establishes, and what remains uncertain.">' + esc(answers.reasoning) + '</textarea></label>' + (state.standardReasoningSubmitted ? '<p class="ld-answer-step-status" role="status">Reasoning saved · choose the conclusion that best matches it.</p>' : '<p class="ld-answer-step-status">The conclusion choices unlock after you submit your reasoning.</p>') + '</section><section class="ld-conclusion-picker ld-answer-step" data-ld-conclusion-choices><div class="ld-answer-step-heading"><span>STEP 2</span><div><h4>Choose your conclusion</h4><p>Select the statement that is best supported by the evidence—not simply the most certain one.</p></div></div><p>' + (state.standardReasoningSubmitted ? 'Choose one conclusion.' : 'This step is locked until your reasoning is submitted.') + '</p><div class="ld-conclusion-options">' + (state.standardReasoningSubmitted ? info.conclusionOptions.map((option, i) => '<button type="button" data-ld-conclusion-option="' + i + '" aria-pressed="' + (answers.selectedConclusion === i) + '"' + (answers.selectedConclusion === i ? ' class="is-selected"' : '') + '>' + esc(option) + '</button>').join('') : info.conclusionOptions.map((option, i) => '<div class="ld-conclusion-locked" aria-label="Option ' + String.fromCharCode(65 + i) + ', locked"><span>' + String.fromCharCode(65 + i) + '</span><span>Locked until reasoning is submitted</span></div>').join('')) + '</div></section>';
    const answerPanel = canConclude
      ? '<form class="ld-answer-form" data-ld-answer-form><div class="ld-answer-heading"><h3>Build your conclusion</h3><span>' + (state.answerFormat === 'HELL' ? 'Two-part response' : 'Reasoning first · then choose a conclusion') + '</span></div>' + answerFields + (state.answerFormat === 'STANDARD' && !state.standardReasoningSubmitted ? '<button class="ld-submit" type="button" data-ld-submit-reasoning>Submit reasoning →</button>' : '<button class="ld-submit" type="submit">' + (state.answerFormat === 'STANDARD' ? 'Assess my answer →' : 'Assess my conclusion →') + '</button>') + '<p class="ld-form-note">You can review the feedback and try again. Earlier attempts are kept in this open investigation.</p></form>'
      : '<section class="ld-unlock-gate"><strong>Keep investigating before you conclude.</strong><p>' + (nextEvidence ? 'There is more case material to discover. Open the next item when you are ready; your conclusion will unlock when a fair investigation path is complete.' : 'A required information source is still available through the people or witness sections. Continue there to complete a fair investigation path.') + '</p></section>';
    root.innerHTML = '<section class="ld-shell ld-investigation-workspace">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← All cases</button><span>CASE · ' + esc(info.cefr) + '</span><span>' + esc(state.trainingMode) + ' · ' + esc(state.answerFormat) + '</span></div>' +
      '<header class="ld-workspace-header"><div><span class="ld-kicker">CASE FILE · ' + esc(info.cefr) + '</span><h2>' + esc(info.title) + '</h2><p>' + esc(info.subtitle) + '</p></div><button type="button" class="ld-notebook-trigger" data-ld-notebook-open aria-controls="ld-case-notebook" aria-expanded="false"><i class="ld-nb-icon" aria-hidden="true">▤</i>Case notebook <span>' + notebookEntries.length + '</span></button></header>' +
      '<nav class="ld-scene-progress" aria-label="Investigation stages">' + [['people','1','People'],['evidence','2','Evidence'],['conclusion','3','Conclusion']].map(([scene,number,label]) => '<button type="button" class="ld-scene-step' + (state.activeScene === scene ? ' is-active' : '') + (scene === 'conclusion' && !readiness.ready ? ' is-locked' : '') + '" data-ld-scene="' + scene + '"' + (scene === 'conclusion' && !readiness.ready ? ' aria-disabled="true"' : '') + (state.activeScene === scene ? ' aria-current="step"' : '') + '><b>' + number + '</b><span>' + label + '</span></button>').join('') + '</nav>' +
      '<div class="ld-layout" data-active-scene="' + esc(state.activeScene || 'people') + '"><aside class="ld-side">' + '<section class="ld-mission-panel" aria-label="Your investigation task"><span class="ld-kicker">YOUR TASK · KEEP THIS BRIEF IN VIEW</span><p>' + esc(info.focus) + '</p></section>' +
      '<section class="ld-progress-panel" aria-label="Investigation progress">' + stepsMarkup + '<div class="ld-progress-copy"><strong>Investigation activity</strong><span>' + progress + '% evidence reviewed · ' + session.interviewResponses.length + ' interviews · ' + (session.selectedWitnessId ? '1 witness' : 'no witness') + '</span></div><div class="ld-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' + evidenceItems.length + '" aria-valuenow="' + openedEvidence.length + '" aria-label="Evidence reviewed"><i style="width:' + progress + '%"></i></div></section>' +
      '</aside><div class="ld-main"><section class="ld-scene-panel" data-scene-panel="people" aria-label="People and interviews">' + statements + characters + interviews + witnesses + '</section>' +
      '<section class="ld-scene-panel" data-scene-panel="evidence" aria-label="Evidence board">' +
      '<section class="ld-workspace-section ld-evidence-board" id="ld-panel-evidence">' +
      '<header class="ld-evidence-board-heading"><div><span class="ld-kicker">CASE MATERIAL</span><h3>Evidence board</h3><p>Keep records, observations and people’s accounts separate. An account can guide your investigation without proving every detail.</p></div><span class="ld-evidence-board-count">' + openedEvidence.length + ' examined · ' + (evidenceItems.length - openedEvidence.length) + ' undiscovered</span></header>' +
      '<div class="ld-evidence-board-grid">' +
      '<section class="ld-evidence-lane ld-evidence-records" aria-labelledby="ld-records-title"><div class="ld-evidence-lane-heading"><span class="ld-evidence-lane-mark" aria-hidden="true">▤</span><div><h4 id="ld-records-title">Records &amp; objects</h4><p>Material evidence you have examined</p></div></div>' +
      (openedEvidence.length ? openedEvidence.map((item,i) => '<article class="ld-evidence ld-evidence-card" data-evidence-id="' + esc(item.evidenceId) + '"><div class="ld-evidence-card-meta"><span>' + esc(item.role === 'OPTIONAL' ? 'OPTIONAL RECORD' : 'CASE EVIDENCE') + '</span><code>' + esc(item.evidenceId || ('E' + String(i + 1).padStart(2,'0'))) + '</code></div><h5>' + esc(item.title || item.evidenceId) + '</h5><p>' + esc(item.summary) + '</p>' + (item.scope ? '<div class="ld-evidence-scope"><strong>What it can tell you</strong><span>' + esc(item.scope) + '</span></div>' : '') + (item.limitations?.length ? '<div class="ld-evidence-limit"><strong>Evidence limit</strong><span>' + esc(item.limitations.join(' ')) + '</span></div>' : '') + '</article>').join('') : '<p class="ld-evidence-empty">No records examined yet. Start with the next available item.</p>') +
      (evidenceItems.length > openedEvidence.length ? '<p class="ld-evidence-undiscovered" role="status">' + (evidenceItems.length - openedEvidence.length) + ' more item' + (evidenceItems.length - openedEvidence.length === 1 ? '' : 's') + ' remain undiscovered. Their contents are hidden until you find and examine them.</p>' : '<p class="ld-discovery-complete">All case evidence has been examined.</p>') +
      '</section>' +
      '<section class="ld-evidence-lane ld-evidence-accounts" aria-labelledby="ld-accounts-title"><div class="ld-evidence-lane-heading"><span class="ld-evidence-lane-mark" aria-hidden="true">◌</span><div><h4 id="ld-accounts-title">People’s accounts</h4><p>Statements and information shared in conversation</p></div></div>' +
      '<div class="ld-evidence-source-group"><h5>Initial statements <span>' + visibleStatements.length + '</span></h5>' +
      (visibleStatements.length ? visibleStatements.map(statement => { const person=(snapshot.characters||[]).find(item=>(item.characterId||item.id)===(statement.characterId||statement.speakerId)); return '<article class="ld-account-card"><span class="ld-account-source">INITIAL STATEMENT · ' + esc(person?.name||statement.name||statement.speaker||'Statement') + '</span><p>' + esc(statement.text||statement.statement||'') + '</p></article>'; }).join('') : '<p class="ld-evidence-empty">No initial statements are available.</p>') +
      '</div><div class="ld-evidence-source-group"><h5>Interview notes <span>' + session.interviewResponses.reduce((count,item)=>count+(item.answers||[]).length,0) + '</span></h5>' +
      (session.interviewResponses.length ? session.interviewResponses.flatMap(response => (response.answers||[]).map(answer => { const interview=(snapshot.interviews||[]).find(item=>item.characterId===response.characterId); const question=interview?.questions?.find(item=>item.questionId===answer.questionId); const person=(snapshot.characters||[]).find(item=>(item.characterId||item.id)===response.characterId); return '<article class="ld-account-card ld-interview-note"><span class="ld-account-source">INTERVIEW · ' + esc(person?.name||response.characterId) + '</span>' + (question?.prompt ? '<strong class="ld-interview-prompt">' + esc(question.prompt) + '</strong>' : '') + '<p>' + esc(answer.answer) + '</p><small>Recorded from this person’s answer · ' + esc(answer.questionId) + '</small></article>'; })).join('') : '<p class="ld-evidence-empty">Interview findings will appear here after you speak with someone.</p>') +
      '</div>' +
      (session.selectedWitnessId ? (() => { const witness=(snapshot.witnesses||[]).find(item=>(item.witnessId||item.id)===session.selectedWitnessId); return witness ? '<div class="ld-evidence-source-group"><h5>Witness account <span>1</span></h5><article class="ld-account-card"><span class="ld-account-source">SELECTED WITNESS · ' + esc(witness.name||witness.label||'Witness') + '</span><p>' + esc(witness.statement||witness.account||witness.description||'') + '</p></article></div>' : ''; })() : '') +
      '</section></div></section>' +
      (nextEvidence ? '<article class="ld-next-evidence"><span class="ld-evidence-index">NEXT · ' + esc(nextEvidence.role) + '</span><h4>New evidence is available</h4><p>Its contents will be revealed when you choose to examine it.</p><button type="button" class="ld-submit" data-ld-open-next data-evidence-id="' + esc(nextEvidence.evidenceId) + '">Examine evidence →</button></article>' : (!canConclude ? '<p class="ld-unlock-gate">Continue with an available interview or witness to reveal the next part of the case.</p>' : '')) +
      (checksAvailable ? '<section class="ld-check-toggle"><div><strong>Quick evidence practice</strong><p>Optional questions about the material you have opened.</p></div><button type="button" class="ld-back" data-ld-toggle-checks aria-expanded="' + String(Boolean(state.showEvidenceChecks)) + '">' + (state.showEvidenceChecks ? 'Hide questions' : 'Practice') + '</button></section>' : '') +
      questionMarkup + '</section>' +
      '<section class="ld-scene-panel" data-scene-panel="conclusion" aria-label="Build your conclusion">' +
      (canConclude ? '<section class="ld-hints"><div><strong>Optional hints</strong><p>Use them in order. Hints do not reduce your academic score.</p></div><div class="ld-hint-actions">' + visibleHints + '</div></section>' + answerPanel : '') +
      '</section></div><footer class="ld-scene-actionbar"><p>' + (state.activeScene === 'people' ? 'Review the people and their accounts.' : state.activeScene === 'evidence' ? (canConclude ? 'The required investigation path is complete.' : 'Complete the required evidence before concluding.') : 'Review your reasoning before submitting.') + '</p><button type="button" class="ld-submit" data-ld-scene-next' + (state.activeScene === 'evidence' && !canConclude ? ' disabled' : '') + '>' + (state.activeScene === 'people' ? 'Continue to evidence →' : state.activeScene === 'evidence' ? 'Build conclusion →' : '← Review evidence') + '</button></footer></section>' +
      '<button type="button" class="ld-notebook-backdrop" data-ld-notebook-close aria-label="Close case notebook" hidden></button>' +
      '<aside class="ld-notebook-drawer" id="ld-case-notebook" role="dialog" aria-modal="true" aria-labelledby="ld-notebook-title" aria-hidden="true" hidden><div class="ld-notebook-header"><div><span class="ld-kicker">YOUR DISCOVERIES</span><h2 id="ld-notebook-title">Case notebook</h2><p>' + notebookEntries.length + ' discovered item' + (notebookEntries.length === 1 ? '' : 's') + '</p></div><button type="button" class="ld-notebook-close" data-ld-notebook-close aria-label="Close case notebook">×</button></div><div class="ld-notebook-content">' + notebook + '</div></aside>';
    const notebookBackdrop = root.querySelector('.ld-notebook-backdrop');
    if (previousScrollY) requestAnimationFrame(() => window.scrollTo({top:previousScrollY,behavior:'auto'}));
    const notebookDrawer = root.querySelector('#ld-case-notebook');
    if (notebookBackdrop && notebookDrawer) document.body.append(notebookBackdrop, notebookDrawer);
    enhanceCaseboundTranslations();
  }

  function resultView(result) {
    const evaluation = result.evaluation || {};
    const outcome = evaluation.primaryOutcome || 'UNSUPPORTED';
    const dims = evaluation.dimensionResults || [];
    const attempt = state.attempts.length;
    if (outcome === 'ACCEPTED' && !state.completedCaseIds.includes(state.caseId)) state.completedCaseIds.push(state.caseId);
    const score = Number.isFinite(evaluation.weightedScore) ? '<strong class="ld-score">' + evaluation.weightedScore + '/100</strong>' : '<strong class="ld-score">Not graded</strong>';
    const grade = evaluation.awardedGrade ? '<span class="ld-grade">Grade ' + esc(evaluation.awardedGrade) + '</span>' : '';
    const dimensionLabels = {CONCLUSION_ACCURACY:'Conclusion accuracy',EVIDENCE_REASONING:'Evidence and reasoning',CRITICAL_THINKING:'Critical thinking',LANGUAGE_CLARITY:'Clarity of expression'};
    const dimensionRows = dims.map(d => '<div class="ld-dimension"><span>' + esc(dimensionLabels[d.dimension] || d.dimension.replaceAll('_', ' ').toLowerCase()) + '</span><b>' + d.score + '%</b><div><i style="width:' + Math.max(0, Math.min(100, d.score)) + '%"></i></div></div>').join('');
    const caseSnapshot = fixtures.cases[state.caseId] || {};
    const concepts = new Map((caseSnapshot.concepts || []).map(item => [item.conceptId, item]));
    const discoveredIds = new Set(state.session?.discoveredEvidenceIds || []);
    const findings = (evaluation.claimDiagnostics || []).map(f => {
      const concept = concepts.get(f.conceptId);
      const evidenceTitles = (concept?.evidenceRefs || []).filter(id => discoveredIds.has(id)).map(id => caseSnapshot.evidence?.find(item => item.evidenceId === id)?.title || id);
      const stateLabels = {SUPPORTED:'Supported by the evidence',UNRESOLVED:'Not enough information to assess this point',UNSUPPORTED:'Not established by the evidence',OVERCLAIMED:'Goes beyond what the evidence establishes',CONTRADICTED:'Conflicts with the evidence'};
      return '<li><b>' + esc(concept?.predicate || 'A point in your explanation') + '</b><span>' + esc(stateLabels[f.state] || 'Needs a closer look') + '</span>' + (evidenceTitles.length ? '<small>Related records you examined: ' + evidenceTitles.map(esc).join(', ') + '</small>' : '') + '</li>';
    }).join('');
    const examinedEvidence = (caseSnapshot.evidence || []).filter(item => discoveredIds.has(item.evidenceId));
    const evidenceReview = examinedEvidence.length ? '<section class="ld-result-review"><h3>Records you examined</h3><p class="ld-review-intro">These are the case records you opened during this investigation.</p><ul>' + examinedEvidence.map(item => '<li><b>' + esc(item.title || item.evidenceId) + '</b><span>' + esc(item.summary) + '</span>' + (item.limitations?.length ? '<small>Limit: ' + esc(item.limitations.join(' ')) + '</small>' : '') + '</li>').join('') + '</ul></section>' : '';
    const feedbackItems = (result.feedback?.items || []).map(item => {
      const labels = {'assessment.feedback.supported':'You connected the main conclusion to the evidence.','assessment.feedback.clarify':'Make the person, event or reference in your answer more specific.','assessment.feedback.reviewEvidenceBoundary':'Separate what the records establish from what they only suggest.'};
      return '<li>' + esc(labels[item.resourceKey] || 'Review the evidence and the limits of each source.') + '</li>';
    }).join('');
    const attemptHistory = state.attempts.map((entry, i) => '<li><b>Attempt ' + (i + 1) + ':</b> ' + esc(outcomeLabel[entry.result.evaluation?.primaryOutcome] || 'Assessment result') + '</li>').join('');
    root.innerHTML = '<section class="ld-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← Case overview</button><span>ATTEMPT ' + attempt + '</span></div>' +
      '<div class="ld-result-head" data-outcome="' + esc(outcome) + '"><span class="ld-stamp">' + esc(outcomeStamp[outcome] || 'REVIEW') + '</span><span class="ld-kicker">ASSESSMENT FEEDBACK</span><h2>' + esc(outcomeLabel[outcome] || 'Assessment result') + '</h2><p>' + esc(outcomeText[outcome] || 'Review the evidence and try again.') + '</p><div class="ld-result-score"' + (Number.isFinite(evaluation.weightedScore) ? ' style="--p:' + Math.max(0, Math.min(100, evaluation.weightedScore)) + '"' : '') + '>' + score + grade + '</div></div>' +
      (feedbackItems ? '<section class="ld-result-review ld-result-feedback"><h3>What to take from this result</h3><ul>' + feedbackItems + '</ul></section>' : '') +
      (findings ? '<details class="ld-diagnostics ld-result-review"><summary>Review your reasoning</summary><ul>' + findings + '</ul></details>' : '') +
      evidenceReview +
      (dimensionRows ? '<details class="ld-diagnostics ld-result-review"><summary>Assessment breakdown</summary><div class="ld-dimensions">' + dimensionRows + '</div></details>' : '') +
      (state.attempts.length > 1 ? '<details class="ld-diagnostics"><summary>Previous attempts (' + (state.attempts.length - 1) + ')</summary><ul>' + attemptHistory.slice(0, attemptHistory.lastIndexOf('<li>')) + '</ul></details>' : '') +
      '<div class="ld-feedback-note"><strong>Keep in mind</strong><p>A missing detail is not automatically a contradiction. A strong inference can be reasonable without becoming proof; the limits of each record still matter.</p></div>' +
      '<div class="ld-result-actions"><button type="button" class="ld-submit" data-ld-retry>Revise and try again</button><button type="button" class="ld-back" data-ld-back>Choose another case</button></div>' +
      '</section>';
    enhanceCaseboundTranslations();
  }

  function submit() {
    const response = readResponse();
    const combined = 'Conclusion: ' + response.conclusion + '\nReasoning: ' + response.reasoning;
    if (state.answerFormat === 'STANDARD' && !state.standardReasoningSubmitted) {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = 'Submit your reasoning before choosing a conclusion.';
      return;
    }
    if (!response.conclusion.trim() || !response.reasoning.trim()) {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = state.answerFormat === 'HELL' ? 'Please complete both fields before submitting.' : 'Write your reasoning, then choose the conclusion that best matches it.';
      return;
    }
    if (state.answerFormat === 'STANDARD' && !Number.isInteger(response.selectedConclusion)) {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = 'Choose one conclusion after writing your reasoning.';
      return;
    }
    const context = fixtures.makeContext(state.caseId, state.trainingMode, state.answerFormat);
    context.attemptId = 'ld-' + state.caseId + '-' + (state.attempts.length + 1);
    context.responseId = context.attemptId + '-' + Date.now();
    const result = engine.evaluate({
      context,
      caseSnapshot: investigationModel.buildEvaluationSnapshot(fixtures.cases[state.caseId], state.session),
      response: combined,
      hintsUsed: [...state.hintsUsed]
    });
    if (result.status === 'CONFIGURATION_ERROR') {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = 'This case could not be assessed because its configuration is invalid. Your response has not been scored.';
      return;
    }
    state.lastResponse = response;
    state.attempts.push({ response, result });
    state.stage = 'result';
    resultView(result);
  }

  function mount(target, options = {}) {
    root = target;
    onExit = typeof options.onExit === 'function' ? options.onExit : () => {};
    state = {
      stage: 'picker',
      caseId: null,
      selectedLevel: null,
      selectedCharacterId: null,
      activePanel: 'statements',
      activeScene: 'people',
      trainingMode: 'GUIDED',
      answerFormat: 'STANDARD',
      hintsUsed: [],
      discoveredEvidence: [],
      session: null,
      showEvidenceChecks: false,
      attempts: [],
      completedCaseIds: [],
      selectedConclusion: null,
      standardReasoning: '',
      standardReasoningSubmitted: false,
      lastResponse: null
    };
    picker();
  }

  if (!window.__EPIPHANY_LANGUAGE_DETECTIVE_BOUND__) {
    document.addEventListener('input', event => {
      if (!root || !root.contains(event.target) || event.target.name !== 'ld-standard-reasoning' || !state) return;
      const choices = root.querySelector('[data-ld-conclusion-choices]');
      if (!choices) return;
      if (state.standardReasoningSubmitted) return;
      const hasReasoning = Boolean(event.target.value.trim());
      if (!hasReasoning) {
        state.selectedConclusion = null;
        choices.querySelectorAll('[data-ld-conclusion-option]').forEach(button => {
          button.classList.remove('is-selected');
          button.setAttribute('aria-pressed', 'false');
        });
      }
    });
    window.__EPIPHANY_LANGUAGE_DETECTIVE_BOUND__ = true;
    document.addEventListener('change', event => {
      const setting = event.target.closest('[data-ld-setting]');
      if (setting && state) {
        state[setting.dataset.ldSetting] = setting.value;
        if (state.stage === 'picker') picker();
        else if (state.stage === 'investigation') investigation();
      }
    });
    document.addEventListener('click', event => {
      if (!root || (!root.contains(event.target) && !event.target.closest('#ld-case-notebook, .ld-notebook-backdrop'))) return;
      const sceneButton = event.target.closest('[data-ld-scene]');
      if (sceneButton && state.stage === 'investigation') {
        const scene = sceneButton.dataset.ldScene;
        if (scene === 'conclusion' && !investigationModel.isConclusionReady(fixtures.cases[state.caseId], state.session).ready) return;
        if (['people','evidence','conclusion'].includes(scene)) {
          state.activeScene = scene;
          investigation();
          root.querySelector('[data-ld-scene="' + scene + '"]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-scene-next]') && state.stage === 'investigation') {
        if (state.activeScene === 'people') state.activeScene = 'evidence';
        else if (state.activeScene === 'evidence' && investigationModel.isConclusionReady(fixtures.cases[state.caseId], state.session).ready) state.activeScene = 'conclusion';
        else if (state.activeScene === 'conclusion') state.activeScene = 'evidence';
        investigation();
        return;
      }
      const sourceEvidence = event.target.closest('[data-ld-source-evidence]');
      const sourceStatement = event.target.closest('[data-ld-source-statement]');
      const sourceInterview = event.target.closest('[data-ld-source-interview]');
      const sourceNotebook = event.target.closest('[data-ld-source-notebook]');
      if (sourceEvidence || sourceStatement || sourceInterview || sourceNotebook) {
        const closeNotebook = () => {
          const drawer = document.getElementById('ld-case-notebook');
          const backdrop = document.querySelector('.ld-notebook-backdrop');
          if (drawer) { drawer.hidden = true; drawer.setAttribute('aria-hidden','true'); }
          if (backdrop) backdrop.hidden = true;
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded','false');
        };
        if (sourceEvidence) {
          const id = sourceEvidence.dataset.ldSourceEvidence;
          if (!discoveredEvidenceForState(id)) return;
          state.activeScene = 'evidence';
          closeNotebook();
          investigation();
          requestAnimationFrame(() => root.querySelector('[data-evidence-id="' + id + '"]')?.scrollIntoView({block:'center',behavior:'auto'}));
        } else if (sourceStatement) {
          const id = sourceStatement.dataset.ldSourceStatement;
          state.activeScene = 'people';
          closeNotebook();
          investigation();
          requestAnimationFrame(() => root.querySelector('#ld-statement-' + id)?.scrollIntoView({block:'center',behavior:'auto'}));
        } else if (sourceInterview) {
          const id = sourceInterview.dataset.ldSourceInterview;
          state.selectedCharacterId = id.includes(':') ? id.split(':')[0] : id;
          state.activeScene = 'people';
          closeNotebook();
          investigation();
          const questionId = id.includes(':') ? id.split(':').slice(1).join(':') : '';
          requestAnimationFrame(() => {
            const target = questionId ? root.querySelector('#ld-interview-' + questionId) : root.querySelector('#ld-interview-section') || root.querySelector('[data-ld-select-character="' + state.selectedCharacterId + '"]');
            target?.scrollIntoView({block:'center',behavior:'auto'});
          });
        } else {
          const id = sourceNotebook.dataset.ldSourceNotebook;
          closeNotebook();
          root.querySelector('[data-ld-notebook-open]')?.click();
          requestAnimationFrame(() => document.getElementById('ld-notebook-entry-' + id)?.scrollIntoView({block:'center',behavior:'auto'}));
        }
        return;
      }
      const levelButton = event.target.closest('[data-ld-level-select]');
      if (levelButton) {
        state.selectedLevel = levelButton.dataset.ldLevelSelect;
        picker();
        return;
      }
      if (event.target.closest('[data-ld-level-back]')) {
        state.selectedLevel = null;
        picker();
        return;
      }
      const caseButton = event.target.closest('[data-ld-case]');
      if (caseButton) {
        state.caseId = caseButton.dataset.ldCase;
        state.activeScene = 'people';
        state.selectedCharacterId = null;
        state.stage = 'case-intro';
        state.hintsUsed = [];
        state.discoveredEvidence = [];
        const createdSession = investigationModel.createSession(fixtures.cases[state.caseId]);
        state.session = createdSession.ok ? createdSession.session : null;
        state.showEvidenceChecks = false;
        state.attempts = [];
        state.selectedConclusion = null;
        state.lastResponse = null;
        state.standardReasoning = '';
        state.standardReasoningSubmitted = false;
        caseIntroduction();
        return;
      }
      if (event.target.closest('[data-ld-open-next]')) {
        const snapshot = fixtures.cases[state.caseId];
        const next = investigationModel.getAvailableEvidence(snapshot, state.session)[0];
        if (next) {
          const discovered = investigationModel.discoverEvidence(snapshot, state.session, next.evidenceId);
          if (discovered.ok) {
            state.session = discovered.session;
            state.discoveredEvidence = [...state.session.discoveredEvidenceIds];
          }
        }
        state.activeScene = 'evidence';
        investigation();
        return;
      }
      const characterButton = event.target.closest('[data-ld-select-character]');
      if (characterButton) {
        state.selectedCharacterId = characterButton.dataset.ldSelectCharacter;
        state.activeScene = 'people';
        investigation();
        return;
      }
      const interviewButton = event.target.closest('[data-ld-ask-interview]');
      if (interviewButton) {
        const answer = investigationModel.askInterview(fixtures.cases[state.caseId], state.session, interviewButton.dataset.characterId, interviewButton.dataset.questionId);
        if (answer.ok) state.session = answer.session;
        state.activeScene = 'people';
        investigation();
        requestAnimationFrame(() => root.querySelector('#ld-interview-' + interviewButton.dataset.questionId)?.scrollIntoView({block:'nearest',behavior:'auto'}));
        return;
      }
      const witnessButton = event.target.closest('[data-ld-select-witness]');
      if (witnessButton) {
        const selected = investigationModel.selectWitness(fixtures.cases[state.caseId], state.session, witnessButton.dataset.ldSelectWitness);
        if (selected.ok) state.session = selected.session;
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-toggle-checks]')) {
        state.showEvidenceChecks = !state.showEvidenceChecks;
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-notebook-open]')) {
        const drawer = document.getElementById('ld-case-notebook');
        const backdrop = document.querySelector('.ld-notebook-backdrop');
        if (drawer && backdrop) {
          drawer.hidden = false; backdrop.hidden = false;
          drawer.setAttribute('aria-hidden', 'false');
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'true');
          drawer.querySelector('[data-ld-notebook-close]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-notebook-close]')) {
        const drawer = document.getElementById('ld-case-notebook');
        const backdrop = document.querySelector('.ld-notebook-backdrop');
        if (drawer && backdrop) {
          drawer.hidden = true; backdrop.hidden = true;
          drawer.setAttribute('aria-hidden', 'true');
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'false');
          root.querySelector('[data-ld-notebook-open]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-start-investigation]')) {
        const started = investigationModel.startSession(state.session);
        if (started.ok) {
          state.session = started.session;
          state.stage = 'investigation';
        }
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-exit]')) { document.getElementById('ld-case-notebook')?.remove(); document.querySelector('.ld-notebook-backdrop')?.remove(); onExit(); return; }
      if (event.target.closest('[data-ld-back]')) {
        document.getElementById('ld-case-notebook')?.remove();
        document.querySelector('.ld-notebook-backdrop')?.remove();
        state.stage = 'picker';
        state.caseId = null;
        picker();
        return;
      }
      const optionButton = event.target.closest('[data-ld-option]');
      if (optionButton) {
        const questionCard = optionButton.closest('[data-ld-question]');
        const question = caseInfo[state.caseId].questions.find(item => item.id === questionCard?.dataset.ldQuestion);
        if (question) {
          const selected = Number(optionButton.dataset.ldOption);
          const feedback = questionCard.querySelector('.ld-question-feedback');
          if (selected === question.answer) {
            feedback.className = 'ld-question-feedback is-correct';
            feedback.textContent = '✓ ' + question.explain;
            questionCard.querySelectorAll('[data-ld-option]').forEach(button => button.classList.toggle('is-selected', button === optionButton));
          } else {
            feedback.className = 'ld-question-feedback is-retry';
            feedback.textContent = 'Not quite. Recheck the record and try another option; this does not affect your assessment.';
            optionButton.classList.add('is-retry');
          }
        }
        return;
      }
      const submitReasoningButton = event.target.closest('[data-ld-submit-reasoning]');
      if (submitReasoningButton && state.answerFormat === 'STANDARD' && !state.standardReasoningSubmitted) {
        const field = root.querySelector('[name="ld-standard-reasoning"]');
        const reasoning = field?.value.trim() || '';
        const note = root.querySelector('.ld-form-note');
        if (!reasoning) {
          if (note) note.textContent = 'Write your reasoning before unlocking the conclusion choices.';
          field?.focus();
          return;
        }
        state.standardReasoning = field.value;
        state.standardReasoningSubmitted = true;
        state.selectedConclusion = null;
        investigation();
        root.querySelector('[data-ld-conclusion-choices]')?.scrollIntoView?.({block:'nearest',behavior:'smooth'});
        return;
      }
      const conclusionButton = event.target.closest('[data-ld-conclusion-option]');
      if (conclusionButton && state.answerFormat === 'STANDARD') {
        state.selectedConclusion = Number(conclusionButton.dataset.ldConclusionOption);
        root.querySelectorAll('[data-ld-conclusion-option]').forEach(button => {
          const selected = button === conclusionButton;
          button.classList.toggle('is-selected', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
        return;
      }
      const hintButton = event.target.closest('[data-ld-hint]');
      if (hintButton && !hintButton.disabled) {
        const answers = readResponse();
        state.hintsUsed.push(hintButton.dataset.ldHint);
        investigation();
        const fields = state.answerFormat === 'HELL'
          ? [['ld-conclusion', answers.conclusion], ['ld-reasoning', answers.reasoning]]
          : [['ld-standard-reasoning', answers.reasoning]];
        fields.forEach(([name, value]) => { const field = root.querySelector('[name="' + name + '"]'); if (field) field.value = value; });
        if (state.answerFormat === 'STANDARD' && answers.selectedConclusion !== null) {
          state.selectedConclusion = answers.selectedConclusion;
          const selected = root.querySelector('[data-ld-conclusion-option="' + answers.selectedConclusion + '"]');
          if (selected) { selected.classList.add('is-selected'); selected.setAttribute('aria-pressed', 'true'); }
        }
      }
      if (event.target.closest('[data-ld-retry]')) {
        state.stage = 'investigation';
        state.activeScene = 'conclusion';
        state.standardReasoningSubmitted = false;
        state.selectedConclusion = null;
        state.standardReasoning = state.lastResponse?.reasoning || '';
        investigation();
      }
    });
    document.addEventListener('submit', event => {
      if (!event.target.matches('[data-ld-answer-form]')) return;
      event.preventDefault();
      if (state && state.stage === 'investigation') submit();
    });
    document.addEventListener('keydown', event => {
      const tab = event.target.closest?.('[data-ld-panel]');
      if (tab && root?.contains(tab) && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
        const tabs = [...root.querySelectorAll('[data-ld-panel]')];
        const current = tabs.indexOf(tab);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        event.preventDefault();
        tabs[next]?.click();
        root.querySelector('[data-ld-panel="' + tabs[next]?.dataset.ldPanel + '"]')?.focus();
        return;
      }
      if (event.key !== 'Escape' || !root || !state) return;
      const drawer = document.getElementById('ld-case-notebook');
      if (!drawer || drawer.hidden) return;
      const backdrop = document.querySelector('.ld-notebook-backdrop');
      drawer.hidden = true;
      if (backdrop) backdrop.hidden = true;
      drawer.setAttribute('aria-hidden', 'true');
      root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'false');
      root.querySelector('[data-ld-notebook-open]')?.focus();
    });
  }

  window.EPIPHANY_LANGUAGE_DETECTIVE = { available: true, mount };
})();