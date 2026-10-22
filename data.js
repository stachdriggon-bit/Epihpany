const LEVELS = [
  {id:'A1',name:'Newcomer',title:'First Steps',desc:'Meet everyday words, build simple sentences, and start saying what you mean.',theme:'Your first discoveries',xp:0},
  {id:'A2',name:'Explorer',title:'Everyday Explorer',desc:'Talk about your life, make plans, and handle familiar everyday situations.',theme:'The everyday world',xp:180},
  {id:'B1',name:'Wayfinder',title:'Independent Wayfinder',desc:'Tell stories, explain opinions, and navigate travel, study, and work.',theme:'Stories & possibilities',xp:520},
  {id:'B2',name:'Trailblazer',title:'Confident Trailblazer',desc:'Follow complex ideas, debate thoughtfully, and express yourself with nuance.',theme:'Ideas in motion',xp:1100},
  {id:'C1',name:'Wordsmith',title:'Fluent Wordsmith',desc:'Use flexible language, read between the lines, and communicate precisely.',theme:'Beyond the obvious',xp:2100},
  {id:'C2',name:'Virtuoso',title:'Language Virtuoso',desc:'Handle subtle meaning, sophisticated texts, and demanding real-world tasks.',theme:'Mastery without borders',xp:3600}
];
const GAMES = {
  vocabulary:{title:'Word collector',category:'VOCABULARY',xp:30,desc:'Choose the meaning that fits best.',questions:[
    {q:'What does “borrow” mean?',sub:'Choose the closest meaning.',answers:['To give something away','To take something for a while and return it','To buy something new','To lose something'],correct:1,explain:'Borrow means to take and use something that belongs to someone else, then give it back.',word:['borrow','to use something and return it']},
    {q:'She was absolutely delighted.',sub:'What does “delighted” mean?',answers:['Very pleased and happy','A little confused','Extremely tired','Quite worried'],correct:0,explain:'Delighted means very happy or pleased. It is stronger than simply “glad”.',word:['delighted','very pleased and happy']},
    {q:'Which word means “happening often”?',sub:'Choose the best word.',answers:['Rare','Frequent','Unlikely','Brief'],correct:1,explain:'Frequent describes something that happens often.',word:['frequent','happening often']},
    {q:'“I need to figure it out.” What does it mean?',sub:'Understand the expression.',answers:['Draw a picture','Find an answer or understand something','Forget about it','Explain it loudly'],correct:1,explain:'To figure something out is to understand or solve it.',word:['figure out','to understand or solve something']},
    {q:'Choose the best word: The instructions were so ___ that nobody was confused.',sub:'Complete the sentence.',answers:['vague','clear','scarce','reluctant'],correct:1,explain:'Clear means easy to understand, which fits the second half of the sentence.',word:['clear','easy to understand']}
  ]},
  grammar:{title:'Sentence shaper',category:'GRAMMAR',xp:40,desc:'Find the sentence that works.',questions:[
    {q:'She ___ to school every day.',sub:'Choose the correct form.',answers:['go','goes','going','gone'],correct:1,explain:'With he, she, or it in the present simple, most verbs take -s: she goes.',word:null},
    {q:'They ___ dinner when I arrived.',sub:'Choose the best tense.',answers:['have','were having','are having','had have'],correct:1,explain:'The past continuous describes an action in progress when another past event happened.',word:null},
    {q:'If I ___ more time, I would learn Italian.',sub:'Complete the second conditional.',answers:['have','will have','had','would have'],correct:2,explain:'The second conditional uses if + past simple, then would + base verb for an unreal or imagined situation.',word:null},
    {q:'Neither of the answers ___ correct.',sub:'Choose the standard form.',answers:['are','were','is','be'],correct:2,explain:'In formal standard English, neither is generally treated as singular here: neither is correct.',word:null},
    {q:'By next June, she ___ her degree.',sub:'Choose the future perfect.',answers:['will finish','will have finished','has finished','finishes'],correct:1,explain:'The future perfect (will have + past participle) describes something completed before a future point.',word:null}
  ]},
  story:{title:'Lost in London',category:'REAL LIFE',xp:50,desc:'Make choices to keep the conversation moving.',questions:[
    {q:'You need to find the train station. What do you ask?',sub:'A stranger is walking past.',answers:['Where train station?','Could you tell me how to get to the train station?','You tell station now.','How I am station?'],correct:1,explain:'“Could you tell me how to get to…?” is a polite, natural way to ask for directions.',word:['Could you tell me how to get to…?','a polite way to ask for directions']},
    {q:'The person says, “It’s just around the corner.” What do they mean?',sub:'Understand the direction.',answers:['It is very far away','It is nearby, after turning at the next corner','It is upstairs','It is closed today'],correct:1,explain:'“Just around the corner” usually means very close by.',word:['around the corner','very nearby']},
    {q:'You did not hear the directions clearly. You say…',sub:'Keep the conversation friendly.',answers:['Say it again!','What?','Sorry, would you mind repeating that?','You are wrong.'],correct:2,explain:'“Would you mind repeating that?” is polite and natural when you need someone to say something again.',word:['Would you mind repeating that?','a polite request for repetition']},
    {q:'The person helps you. What is a natural response?',sub:'Choose a friendly reply.',answers:['I appreciate your help, thank you.','I am appreciating you help.','Thanks for your helps.','I thank you much.'],correct:0,explain:'“I appreciate your help” is a natural way to express gratitude.',word:null},
    {q:'You are almost there. You hear, “You can’t miss it.” This means…',sub:'Understand the expression.',answers:['You must not go there','It is easy to see or find','You have lost your ticket','It is already closed'],correct:1,explain:'“You can’t miss it” means the place is easy to spot or find.',word:['You can’t miss it','it is easy to see or find']}
  ]},
  listening:{title:'Meaning detective',category:'COMPREHENSION',xp:35,desc:'Read a short message and catch the important detail.',questions:[
    {q:'Message: “The meeting has been pushed back to half past three.” When is it now?',sub:'Read carefully.',answers:['3:00','3:15','3:30','4:30'],correct:2,explain:'Half past three means 3:30. “Pushed back” means the meeting was delayed to a later time.',word:['pushed back','delayed until a later time']},
    {q:'“Although it was raining, we decided to go hiking.” What happened?',sub:'Notice the contrast.',answers:['They stayed home because of rain','They went hiking despite the rain','The rain stopped before they left','They planned to go another day'],correct:1,explain:'Although introduces a contrast: it was raining, but they went hiking anyway.',word:['although','used to introduce a contrast']},
    {q:'A notice says: “No later than Friday.” What is the deadline?',sub:'Interpret the phrase.',answers:['After Friday','Any time next week','Friday at the latest','Only before Monday'],correct:2,explain:'“No later than Friday” means Friday is the latest acceptable time.',word:['no later than','by the stated time at the latest']},
    {q:'“I’d rather you didn’t mention it.” The speaker is asking you to…',sub:'Understand the intention.',answers:['Tell everyone','Avoid talking about it','Write it down','Explain it again'],correct:1,explain:'“I’d rather you didn’t…” expresses a preference that someone not do something.',word:null},
    {q:'“The proposal was rejected on the grounds that it was too costly.” Why was it rejected?',sub:'Find the reason.',answers:['It was too complicated','It was too expensive','It arrived too late','It was incomplete'],correct:1,explain:'“On the grounds that” introduces the reason. Costly means expensive.',word:['on the grounds that','for the reason that']}
  ]},
  spelling:{title:'Word detective',category:'SPELLING',xp:30,desc:'Spot the correctly written word.',questions:[
    {q:'Which spelling is correct?',sub:'Choose carefully.',answers:['Definately','Definitely','Definitly','Definetely'],correct:1,explain:'Definitely is spelled d-e-f-i-n-i-t-e-l-y. A useful trick: it contains “finite”.',word:['definitely','without doubt']},
    {q:'Choose the correct word.',sub:'Something that can be trusted is…',answers:['reliable','relyable','reliabel','relyible'],correct:0,explain:'Reliable is the correct spelling, formed from rely + -able.',word:['reliable','able to be trusted']},
    {q:'Which is the correct form?',sub:'A strong feeling of certainty.',answers:['Confidance','Confidence','Confidense','Confidance'],correct:1,explain:'Confidence is spelled with -ence at the end.',word:['confidence','belief in yourself or something']},
    {q:'Choose the correct spelling.',sub:'To make something better.',answers:['Improve','Impruve','Improvve','Improv'],correct:0,explain:'Improve is spelled i-m-p-r-o-v-e.',word:['improve','to make or become better']},
    {q:'Which word is correct?',sub:'A difficult situation or problem.',answers:['Challange','Challenge','Chalenge','Challeng'],correct:1,explain:'Challenge has one “l” in the middle after “a” and ends in -enge.',word:['challenge','a difficult task or situation']}
  ]},
  advanced:{title:'Nuance navigator',category:'ADVANCED ENGLISH',xp:55,desc:'Choose the most precise and natural expression.',questions:[
    {q:'“Her explanation was plausible, but not entirely convincing.” This means it was…',sub:'Read for nuance.',answers:['Obviously false','Seemingly reasonable, but not fully persuasive','Completely proven','Impossible to understand'],correct:1,explain:'Plausible means apparently reasonable or believable. It does not necessarily mean proven.',word:['plausible','seemingly reasonable or believable']},
    {q:'Choose the best connector: “The evidence was limited; ___, the conclusion was tentative.”',sub:'Show a logical result.',answers:['nevertheless','consequently','whereas','meanwhile'],correct:1,explain:'Consequently signals a result: because the evidence was limited, the conclusion was tentative.',word:['consequently','as a result']},
    {q:'“He was reluctant to endorse the proposal.” He was…',sub:'Infer the attitude.',answers:['Eager to support it','Hesitant or unwilling to support it','Unable to understand it','Certain to reject it publicly'],correct:1,explain:'Reluctant means unwilling or hesitant. It suggests hesitation, not necessarily outright refusal.',word:['reluctant','hesitant or unwilling']},
    {q:'Which phrase most clearly signals a concession?',sub:'Choose the most precise transition.',answers:['In addition','For instance','Admittedly','As a result'],correct:2,explain:'Admittedly acknowledges a point or limitation before introducing a contrasting or qualifying claim.',word:['admittedly','used to acknowledge a point or limitation']},
    {q:'“The findings are inconclusive.” This means the findings…',sub:'Choose the exact meaning.',answers:['Prove the hypothesis','Do not lead to a definite conclusion','Are irrelevant','Have been disproved'],correct:1,explain:'Inconclusive evidence does not settle the question either way.',word:['inconclusive','not leading to a definite conclusion']}
  ]}
};
const AR_EXPLANATIONS = {
 vocabulary:[
  'تعني borrow أن تستعمل شيئًا يملكه شخص آخر ثم تعيده إليه.',
  'تعني delighted الشعور بسعادة كبيرة أو رضا شديد.',
  'تُستخدم frequent لوصف شيء يحدث كثيرًا أو بصورة متكررة.',
  'تعني figure out أن تفهم شيئًا أو تجد حلًا لمشكلة.',
  'تعني clear أن الشيء سهل الفهم؛ وهذا يناسب الجملة لأن التعليمات لم تُسبب أي ارتباك.'
 ],
 grammar:[
  'مع الضمائر he وshe وit نضيف غالبًا s إلى الفعل في المضارع البسيط: she goes.',
  'نستخدم الماضي المستمر لحدث كان جاريًا عندما وقع حدث آخر في الماضي.',
  'الشرط الثاني: if + الماضي البسيط، ثم would + الفعل الأساسي للتحدث عن حالة افتراضية.',
  'في الإنجليزية القياسية الرسمية تُعامل neither غالبًا كمفرد في هذا التركيب، لذا نستخدم is.',
  'يتكوّن المستقبل التام من will have + التصريف الثالث، ويصف حدثًا سيكتمل قبل وقت مستقبلي.'
 ],
 story:[
  'صيغة Could you tell me how to get to…? طريقة مهذبة وطبيعية للسؤال عن الاتجاهات.',
  'التعبير around the corner يعني عادةً أن المكان قريب جدًا، بعد الزاوية أو المنعطف.',
  'Would you mind repeating that? طلب مهذب من شخص أن يعيد كلامه.',
  'عبارة I appreciate your help طريقة طبيعية للتعبير عن الامتنان والمساعدة.',
  'التعبير You can’t miss it يعني أن المكان واضح وسهل العثور عليه.'
 ],
 listening:[
  'Half past three تعني الثالثة والنصف، أي 3:30. وpushed back تعني تأجيل الموعد إلى وقت لاحق.',
  'Although تُظهر التباين: كان المطر يهطل، ومع ذلك قرروا الذهاب في نزهة.',
  'No later than Friday تعني أن يوم الجمعة هو آخر موعد مسموح به.',
  'I’d rather you didn’t… تعبّر عن تفضيل المتحدث ألّا يقوم الشخص بفعل شيء.',
  'التعبير on the grounds that يقدّم السبب؛ وcostly تعني مكلفًا أو باهظ الثمن.'
 ],
 spelling:[
  'التهجئة الصحيحة هي definitely. تذكّر أنها تحتوي على كلمة finite ضمن ترتيب حروفها.',
  'التهجئة الصحيحة reliable، ومعناها جدير بالثقة أو يمكن الاعتماد عليه.',
  'تُكتب confidence بالنهاية -ence، وتعني الثقة أو الإيمان بالقدرة.',
  'الفعل الصحيح هو improve، ومعناه يجعل الشيء أفضل أو يصبح أفضل.',
  'التهجئة الصحيحة challenge، وتعني تحديًا أو مهمة صعبة.'
 ],
 advanced:[
  'Plausible تعني معقولًا أو قابلًا للتصديق ظاهريًا، لكنها لا تعني بالضرورة أنه مثبت أو مقنع تمامًا.',
  'Consequently تدل على النتيجة: لأن الأدلة محدودة، فالاستنتاج مؤقت أو غير نهائي.',
  'Reluctant تعني مترددًا أو غير راغب؛ ولا تعني بالضرورة الرفض التام.',
  'Admittedly تُستخدم للاعتراف بنقطة أو قيد قبل إضافة توضيح أو فكرة موازنة.',
  'Inconclusive تعني أن النتائج لا تسمح بالوصول إلى استنتاج نهائي.'
 ]
};
