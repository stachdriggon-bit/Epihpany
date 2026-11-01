/* EPIPHANY THINK LAB — reasoning-first English challenges */
(() => {
  'use strict';
  const root = document.getElementById('think-lab-content');
  if (!root) return;
  const rounds = {
    odd: [
      {prompt:'Which word does not belong?', why:'Find the shared category.', words:['violin','piano','drums','carrot'], answer:3, explain:'Violin, piano and drums are musical instruments. A carrot is a vegetable.'},
      {prompt:'Which word does not belong?', why:'Think about movement.', words:['walk','stroll','wander','whisper'], answer:3, explain:'Walk, stroll and wander describe ways of moving. Whisper describes speaking quietly.'},
      {prompt:'Which word does not belong?', why:'Look for the relationship.', words:['tiny','small','enormous','little'], answer:2, explain:'Tiny, small and little mean nearly the same thing. Enormous means very large.'}
    ],
    translator: [
      {ar:'أنا جائع جدًا.', prompt:'Choose the most natural English sentence.', options:['I have a big hunger.','I’m very hungry.','I am hunger very.'], answer:1, explain:'“I’m very hungry” is the natural everyday expression. Word-for-word translation often sounds unnatural.'},
      {ar:'هل يمكنك مساعدتي؟', prompt:'Choose the most natural English sentence.', options:['Can you help me?','You can helping me?','Can you to help me?'], answer:0, explain:'Use “Can you + base verb” to make this polite, natural request.'},
      {ar:'لم أره منذ يومين.', prompt:'Choose the most natural English sentence.', options:['I didn’t see him since two days.','I haven’t seen him for two days.','I not saw him two days.'], answer:1, explain:'“I haven’t seen him for two days” connects a past event to the present. “For” gives the duration.'}
    ],
    detective: [
      {title:'The missing umbrella', clues:['The pavement outside is wet.','Sam’s coat is dry.','A dripping umbrella is beside the door.'], question:'What is the most likely explanation?', options:['Sam came in with an umbrella.','Sam went swimming.','The umbrella is brand new.'], answer:0, explain:'The wet pavement and dripping umbrella support the first explanation. It is the best-supported conclusion, not absolute proof.'},
      {title:'The untouched lunch', clues:['Maya’s lunch is still in her bag.','She says she is starving.','The lunch break ended ten minutes ago.'], question:'What most likely happened?', options:['She forgot to bring food.','She did not get a chance to eat.','She already ate her lunch.'], answer:1, explain:'Her lunch is still in the bag and she is hungry, so she probably did not get a chance to eat.'},
      {title:'The quiet library', clues:['A sign says “Study in progress”.','Everyone is speaking softly.','A phone starts ringing loudly.'], question:'What should happen next?', options:['Turn the volume up.','Ignore the sign.','Silence the phone.'], answer:2, explain:'The clues show that quiet is expected, so silencing the phone best fits the situation.'}
    ]
  };

  // The Bold Translator: reviewed CEFR bank. Each question has one intended answer,
  // a non-revealing hint, and feedback for every option.

  const translatorQuestion = (ar, options, answer, hint, optionExplanations) => ({
    ar, options, answer, hint, optionExplanations
  });
  const translatorBanks = {
    A1: {
      guided: [
        {ar:'صباح الخير.',options:['Good morning.','Good early.','Morning good.'],answer:0,hint:'Think of the greeting used before lunchtime.',optionExplanations:['Correct: this is the standard morning greeting.','“Good early” is not the usual English greeting.','The word order is unnatural; English uses “Good morning”.']},
        {ar:'شكراً جزيلاً.',options:['Many thank.','Thank you very much.','Very thanks you.'],answer:1,hint:'Choose the complete expression of gratitude.',optionExplanations:['“Many” does not work this way with “thank”.','Correct: a natural way to express strong gratitude.','The word order and form are incorrect.']},
        {ar:'أين محطة الحافلات؟',options:['Where is the bus station?','Where the bus station is?','Where bus station?'],answer:0,hint:'Use the question order for asking about a place.',optionExplanations:['Correct: “Where” + “is” + the place.','This order is used in some indirect questions, not a direct question.','The sentence is missing the verb and article.']},
        {ar:'اسمي سارة.',options:['I name Sarah.','My name is Sarah.','I am name Sarah.'],answer:1,hint:'Use the common phrase for introducing your name.',optionExplanations:['English needs a possessive phrase here.','Correct: the natural way to state your name.','“Am” cannot be followed by “name” in this structure.']},
        {ar:'أنا من الجزائر.',options:['I am from Algeria.','I from Algeria am.','I am at Algeria.'],answer:0,hint:'Which preposition tells someone your country of origin?',optionExplanations:['Correct: “from” expresses origin.','The word order is incorrect.','“At” does not express where you are from.']},
        {ar:'هذا قلمي.',options:['This is my pen.','This my pen is.','This is me pen.'],answer:0,hint:'Choose the possessive word that means “belonging to me”.',optionExplanations:['Correct: “my” shows possession.','The sentence has the wrong word order.','“Me” is an object pronoun, not a possessive determiner.']},
        {ar:'لدي أخ واحد.',options:['I have one brother.','I has one brother.','I am have a brother.'],answer:0,hint:'Check the verb used with “I”.',optionExplanations:['Correct: “I have” is the right form.','“Has” goes with he, she or it.','Do not use “am” before “have” here.']},
        {ar:'هي طالبة.',options:['She are a student.','She is a student.','She be student.'],answer:1,hint:'Choose the correct form of “be” for “she”.',optionExplanations:['“Are” does not agree with “she”.','Correct: “she is” and the article “a”.','This is not a standard present-tense sentence.']},
        {ar:'أحب القهوة.',options:['I like coffee.','I likes coffee.','I liking coffee.'],answer:0,hint:'Use the present simple with “I”.',optionExplanations:['Correct: the base verb follows “I”.','The -s ending is not used with “I”.','The -ing form needs a different verb structure.']},
        {ar:'كم الساعة؟',options:['How many time is it?','What time is it?','Which hour it is?'],answer:1,hint:'Think of the fixed everyday question about the time.',optionExplanations:['“Time” is uncountable in this question.','Correct: the standard question.','The word order is not a natural direct question.']},
        {ar:'أريد كوباً من الماء، من فضلك.',options:['I want a glass of water, please.','I am wanting glass water, please.','I like a water glass, please.'],answer:0,hint:'Choose the simple, polite request with “want”.',optionExplanations:['Correct: a natural request; “a glass of water” is the usual phrase.','The continuous form is unnatural here and the article is missing.','This means you like a glass designed for water, not that you want water.']},
        {ar:'أين الحمّام؟',options:['Where bathroom?','Where is the bathroom?','Where does the bathroom?'],answer:1,hint:'A place question needs the verb “is” here.',optionExplanations:['The question is missing a verb and article.','Correct: the natural way to ask.','“Does” cannot be used with “the bathroom” as the subject in this structure.']}
      ],
      steady: [
        {ar:'أشعر بالتعب، لذلك سأذهب إلى الفراش مبكراً.',options:['I feel tired, so I will go to bed early.','I feel tiring, because I go bed early.','I am tired, so I going to bed lately.'],answer:0,hint:'Find the option that links the reason to the result naturally.',optionExplanations:['Correct: “feel tired” describes the feeling and “so” introduces the result.','“Tiring” describes something that causes tiredness; “go bed” is missing “to”.','“I going” needs an auxiliary, and “lately” does not mean “early”.']},
        {ar:'ليس لدينا ما يكفي من الوقت.',options:["We don't have enough time.","We aren't have enough time.","We don't have many time."],answer:0,hint:'Think about how English expresses a sufficient amount of an uncountable noun.',optionExplanations:['Correct: “enough time” is natural.','The verb “have” does not take “aren’t” in this structure.','“Time” is uncountable here, so use “much” or “enough”, not “many”.']},
        {ar:'ماذا تريد أن تأكل؟',options:['What do you want to eat?','What you want eating?','What are you want to eat?'],answer:0,hint:'Build a present-simple question, then complete “want … eat”.',optionExplanations:['Correct: “do” forms the question and “want to eat” is the right pattern.','The question auxiliary is missing and the verb pattern is wrong.','Do not combine “are” and “want” this way.']},
        {ar:'فاتتني الحافلة هذا الصباح.',options:['I missed the bus this morning.','I lost the bus this morning.','I forgot the bus this morning.'],answer:0,hint:'Choose the verb used when you arrive too late for transport.',optionExplanations:['Correct: “missed the bus” means it left before you could catch it.','“Lost the bus” suggests you cannot find the bus.','“Forgot the bus” does not express failing to catch it.']},
        {ar:'أمي تطبخ العشاء الآن.',options:['My mother cooks dinner now.','My mother is cooking dinner now.','My mother cooking dinner now.'],answer:1,hint:'The word “now” points to an action happening at this moment.',optionExplanations:['Possible for a habit, but not the clearest choice for an action happening now.','Correct: present continuous describes an action in progress.','The sentence is missing the auxiliary “is”.']},
        {ar:'هناك تفاحتان على الطاولة.',options:['There is two apples on the table.','There are two apples on the table.','It are two apples in the table.'],answer:1,hint:'Make the verb agree with the plural noun “two apples”.',optionExplanations:['“Is” is singular; the noun phrase is plural.','Correct: use “there are” with plural nouns.','“It are” is incorrect, and “in the table” changes the meaning.']},
        {ar:'هو لا يشرب الشاي.',options:["He doesn't drink tea.","He don't drinks tea.","He isn't drink tea."],answer:0,hint:'Use the correct negative form for “he” in the present simple.',optionExplanations:['Correct: “doesn’t” is followed by the base verb.','“Don’t” does not agree with “he”, and the verb should not take -s after “does”.','“Isn’t” cannot directly form this present-simple negative.']},
        {ar:'نحن نذهب إلى المدرسة بالحافلة.',options:['We go to school by bus.','We go at school with bus.','We goes to school by the bus.'],answer:0,hint:'Recall the common expression for travelling using public transport.',optionExplanations:['Correct: “go to school by bus” is natural.','Use “to school” and “by bus” in this meaning.','“We” takes “go”, not “goes”; the article is not normally used here.']},
        {ar:'هل تحب الموسيقى؟',options:['Do you like music?','Are you like music?','Does you likes music?'],answer:0,hint:'Form a present-simple yes/no question with “you”.',optionExplanations:['Correct: use “do” + subject + base verb.','“Are” is not used before “like” in this structure.','“Does” does not agree with “you”, and “likes” should be the base form.']},
        {ar:'أين يعمل والدك؟',options:['Where your father work?','Where does your father work?','Where is your father works?'],answer:1,hint:'The subject is “your father”; choose its question auxiliary.',optionExplanations:['The auxiliary is missing.','Correct: “does” forms the question and “work” stays in the base form.','Do not combine “is” with “works” this way.']},
        {ar:'الجو بارد اليوم.',options:['The weather is cold today.','The weather cold is today.','The weather has cold today.'],answer:0,hint:'Use “be” to describe the weather.',optionExplanations:['Correct: “is cold” is the natural description.','The word order is incorrect.','“Has cold” does not describe the weather in English.']},
        {ar:'من فضلك، افتح النافذة.',options:['Please open the window.','Please opening the window.','Please you open window.'],answer:0,hint:'A polite instruction can begin with “please” and the base verb.',optionExplanations:['Correct: this is a natural polite imperative.','The -ing form cannot stand alone as the instruction.','The subject is unnecessary in this imperative and “the” is missing.']},
        {ar:'ذهبت إلى السوق مع صديقي أمس.',options:['I go to the market with my friend yesterday.','I went to the market with my friend yesterday.','I was go to market with my friend yesterday.'],answer:1,hint:'The word “yesterday” tells you which tense is needed.',optionExplanations:['“Go” is present tense, but the action happened yesterday.','Correct: “went” is the past form of “go”.','“Was go” is not a correct past-tense structure.']},
        {ar:'هذا المطعم قريب من منزلي.',options:['This restaurant is near my house.','This restaurant near is my house.','This restaurant is nearly my house.'],answer:0,hint:'Choose the preposition that expresses physical distance.',optionExplanations:['Correct: “near my house” expresses location.','The word order is incorrect.','“Nearly” means almost, not close to a place.']},
        {ar:'أحتاج إلى بعض المساعدة.',options:['I need some help.','I need any helps.','I am need some help.'],answer:0,hint:'Choose the natural expression with an uncountable noun.',optionExplanations:['Correct: “some help” is natural.','“Help” is uncountable here and does not take plural -s.','Do not put “am” before the main verb “need”.']}
      ],
      challenge: [
        {ar:'إذا كان الجو مشمساً، سنلعب في الخارج.',options:['If it is sunny, we will play outside.','If it will sunny, we play outside.','If it sunny, we will playing outside.'],answer:0,hint:'Look at the verb forms in a real future condition.',optionExplanations:['Correct: present simple in the if-clause, “will” in the result.','“Will sunny” is missing “be”; the clause structure is incorrect.','The if-clause is missing “is”, and “will” needs the base verb.']},
        {ar:'لم أذهب إلى المدرسة أمس لأنني كنت مريضاً.',options:["I didn't go to school yesterday because I was sick.","I didn't went to school yesterday because I am sick.","I wasn't go to school yesterday because I sick."],answer:0,hint:'Keep both parts in the past and check the verb after “didn’t”.',optionExplanations:['Correct: “didn’t” takes the base verb, and “was” describes the past state.','After “didn’t” use “go”, not “went”; “am” should be “was”.','“Wasn’t go” is not a correct negative past form, and “I sick” needs “was”.']},
        {ar:'هذا الكتاب أغلى من ذلك الكتاب.',options:['This book is more expensive than that one.','This book is most expensive than that book.','This book is expensive more that one.'],answer:0,hint:'You are comparing two things, not identifying the most expensive one.',optionExplanations:['Correct: “more expensive than” makes a comparison; “that one” avoids repetition.','“Most expensive” is a superlative and does not take “than” here.','The order should be “more expensive than”.']},
        {ar:'إذا أمطرت غداً، فسنبقى في المنزل.',options:['If it rains tomorrow, we will stay at home.','If it will rain tomorrow, we stay at home.','If it raining tomorrow, we will staying home.'],answer:0,hint:'In this real future condition, the if-clause uses a present form.',optionExplanations:['Correct: “rains” follows “if”; “will stay” gives the result.','The if-clause normally does not use “will” here.','The if-clause needs a finite verb, and “will” takes the base verb “stay”.']},
        {ar:'أختي أطول مني.',options:['My sister is taller than me.','My sister is more tall that me.','My sister taller than I.'],answer:0,hint:'Use the short adjective form for a simple comparison.',optionExplanations:['Correct: “taller than” is the standard comparative form.','Use “taller”, not “more tall”, and “than”, not “that”.','The sentence is missing “is”.']},
        {ar:'لم يكن هناك أحد في المنزل عندما وصلت.',options:['There was nobody at home when I arrived.','There were nobody at home when I arrive.','There is nobody home when I arrived.'],answer:0,hint:'Keep the description and the arrival in the past.',optionExplanations:['Correct: “there was nobody” and “arrived” are both past forms.','“Nobody” is singular in this construction, and “arrive” should be past.','“Is” changes the time to the present.']},
        {ar:'كم عدد إخوتك؟',options:['How much brothers do you have?','How many brothers do you have?','How many brother you have?'],answer:1,hint:'Brothers are countable; choose the question phrase for countable nouns.',optionExplanations:['Use “how many” with countable plural nouns.','Correct: “how many” + plural noun + “do you have”.','The noun needs plural -s and the auxiliary “do” is missing.']},
        {ar:'لماذا أنت متأخر؟',options:['Why are you late?','Why you are late?','Why do you late?'],answer:0,hint:'This question describes a state with the verb “be”.',optionExplanations:['Correct: the verb “are” comes before “you” in a direct question.','The word order is used in an indirect question, not this direct question.','“Late” is an adjective; “do” cannot be used this way.']},
        {ar:'أحب القراءة قبل النوم.',options:['I enjoy reading before bed.','I enjoy to read before sleep.','I am enjoy reading before the bed.'],answer:0,hint:'Which verb is naturally followed by an -ing form?',optionExplanations:['Correct: “enjoy” is followed by a gerund, and “before bed” is natural.','“Enjoy” is not normally followed by “to read”.','“Am” is unnecessary before “enjoy”, and “before bed” needs no article.']},
        {ar:'هل سبق لك زيارة لندن؟',options:['Have you ever visited London?','Did you ever have visited London?','Have you ever visit London?'],answer:0,hint:'The question asks about life experience up to now.',optionExplanations:['Correct: present perfect + ever + past participle.','The auxiliaries are incorrectly combined.','After “have” use the past participle “visited”.']},
        {ar:'هي تستطيع التحدث بالإنجليزية قليلاً.',options:['She can speak English a little.','She can speaks English a little.','She cans speak English little.'],answer:0,hint:'Check the verb form that follows “can”.',optionExplanations:['Correct: a modal verb is followed by the base form “speak”.','Do not add -s after “can”.','Modal verbs do not take -s; “a little” is the natural quantity phrase here.']},
        {ar:'كان الجو ممطراً عندما غادرنا.',options:['It was raining when we left.','It is raining when we left.','It was rain when we leave.'],answer:0,hint:'One action was in progress when another past action happened.',optionExplanations:['Correct: past continuous for the ongoing weather and past simple for “left”.','“Is raining” is present, but “left” is past.','Use “raining” after “was”, and “left” for the past action.']},
        {ar:'لا أستطيع العثور على مفاتيحي.',options:["I can't find my keys.","I don't can find my keys.","I can't finding my keys."],answer:0,hint:'Use the modal verb for inability and check the form of the next verb.',optionExplanations:['Correct: “can’t” is followed by the base verb “find”.','Do not use “do” with “can”.','After “can’t”, use “find”, not “finding”.']},
        {ar:'هذا هو اليوم الأكثر حرارة في السنة.',options:['This is the hottest day of the year.','This is the hotter day in the year.','This is most hot day of year.'],answer:0,hint:'The sentence identifies one day as number one in a whole group.',optionExplanations:['Correct: “the hottest” is the superlative form.','“Hotter” compares two things, not one with the whole year.','The superlative needs “the” and the form “hottest”.']},
        {ar:'يجب أن ننظف غرفتنا قبل وصول الضيوف.',options:['We must clean our room before the guests arrive.','We must to clean our room before the guests arrives.','We should cleaning our room before guests arrived.'],answer:0,hint:'A modal verb is followed by a base verb; check the time of the arrival.',optionExplanations:['Correct: “must clean” and present simple after “before” for a future event.','Do not use “to” after “must”; “guests” takes “arrive”.','“Should” needs a base verb, and the time reference is inconsistent.']}
      ]
    },
    A2: {
      guided: [
        translatorQuestion('ذهبت إلى السوق أمس.', ['I go to the market yesterday.','I went to the market yesterday.','I was go to the market yesterday.'], 1, 'The time expression points to a completed past event.', ['The present form does not match “yesterday”.','Correct: “went” is the past form of “go”.','“Was go” is not a correct past verb form.']),
        translatorQuestion('هي تشاهد التلفاز الآن.', ['She is watching TV now.','She watches TV now.','She watching TV now.'], 0, 'Look for an action happening at this moment.', ['Correct: use “is” plus the -ing form for an action happening now.','Present simple usually describes habits, not an action happening now.','The sentence needs the auxiliary “is”.']),
        translatorQuestion('يوجد بعض التفاح على الطاولة.', ['There are some apples on the table.','There is some apples on the table.','It is some apples on the table.'], 0, 'The noun is plural, so check the verb after “there”.', ['Correct: plural “apples” takes “there are”.','“There is” is used with a singular noun or an uncountable noun.','“It is” does not introduce the existence of items this way.']),
        translatorQuestion('أخي أطول مني.', ['My brother is more tall than me.','My brother is taller than me.','My brother taller that me.'], 1, 'Use the short adjective form for a comparison.', ['Short adjectives usually take “-er”, not “more”.','Correct: “taller than” is the comparative form.','The sentence is missing “is” and uses the wrong comparison word.']),
        translatorQuestion('هل سبق لك زيارة لندن؟', ['Did you ever visit London?','Have you ever visited London?','Are you ever visit London?'], 1, 'Ask about life experience without naming a finished time.', ['This can occur in some contexts, but the present perfect is the usual form for general life experience.','Correct: “Have you ever + past participle” asks about experience.','The verb pattern after “are” is incorrect.']),
        translatorQuestion('يجب عليك أن ترتدي معطفاً.', ['You should wear a coat.','You should to wear a coat.','You should wearing a coat.'], 0, 'A modal verb is followed directly by the base form.', ['Correct: “should” is followed by “wear”.','Do not add “to” after “should”.','Use the base verb, not the -ing form, after “should”.']),
        translatorQuestion('ليس لدينا حليب كافٍ.', ['We don’t have enough milk.','We don’t have milk enough.','We haven’t enough milks.'], 0, 'Place the quantity word before the noun.', ['Correct: “enough” comes before the noun “milk”.','The usual position of “enough” with a noun is before it.','“Milk” is normally uncountable here, and the sentence form is unnatural.']),
        translatorQuestion('سأزور جدتي في عطلة نهاية الأسبوع.', ['I visit my grandmother this weekend.','I’m going to visit my grandmother this weekend.','I going visit my grandmother this weekend.'], 1, 'Choose the common structure for a planned future intention.', ['Present simple is not the clearest form for this personal plan.','Correct: “be going to” expresses a plan or intention.','The sentence needs “am” and “to” in this structure.']),
        translatorQuestion('هي تعمل في مستشفى.', ['She work in a hospital.','She works in a hospital.','She is work in a hospital.'], 1, 'With “he”, “she” or “it” in the present simple, check the verb ending.', ['The present simple verb needs an -s with “she”.','Correct: “works” agrees with “she”.','Do not put “is” before the base verb in this sentence.']),
        translatorQuestion('هل تناولت فطورك؟', ['Did you have breakfast?','Do you had breakfast?','Were you have breakfast?'], 0, 'Ask about a completed event earlier today using a past question.', ['Correct: “Did” is followed by the base form “have”.','After “do”, use the base form, not “had”; the past question needs “did”.','This auxiliary and verb pattern is incorrect.']),
        translatorQuestion('أحتاج إلى بعض المعلومات.', ['I need some information.','I need an information.','I need many information.'], 0, 'The noun is uncountable in English.', ['Correct: “information” is uncountable and can follow “some”.','Do not use “a” with uncountable “information”.','Use “much” or “a lot of”, not “many”, with this noun.']),
        translatorQuestion('كان هذا المطعم أرخص من الآخر.', ['This restaurant was cheaper than the other one.','This restaurant was more cheap than the other one.','This restaurant cheaper that the other one.'], 0, 'Use the comparative form of a short adjective.', ['Correct: “cheaper than” compares the two restaurants.','The short adjective “cheap” normally takes “-er”.','The sentence needs “was” and the comparison word “than”.'])
      ],
      steady: [
        translatorQuestion('لم يشترِ أي خبز.', ['He didn’t bought any bread.','He didn’t buy any bread.','He doesn’t bought any bread.'], 1, 'After “didn’t”, use the base form of the main verb.', ['The past form “bought” is not used after “didn’t”.','Correct: “didn’t” carries the past tense, so use “buy”.','“Doesn’t” is present tense and cannot pair with “bought”.']),
        translatorQuestion('كم مرة تذهب إلى النادي؟', ['How often do you go to the gym?','How many do you go to the gym?','How much often you go to the gym?'], 0, 'Choose the question phrase used for frequency.', ['Correct: “How often” asks about frequency.','“How many” asks about a number of countable items.','The word order and phrase are incorrect.']),
        translatorQuestion('هذا الفيلم أقل إثارة من الكتاب.', ['This film is less exciting than the book.','This film is least exciting than the book.','This film is not exciting that the book.'], 0, 'The sentence compares two things in a negative direction.', ['Correct: “less + adjective + than” makes this comparison.','“Least” is a superlative, not a comparison between two items.','“Not ... that” is not the correct comparative structure.']),
        translatorQuestion('كانوا يلعبون عندما بدأ المطر.', ['They played when it was starting to rain.','They were playing when it started to rain.','They are playing when it starts to rain.'], 1, 'One longer past action was interrupted by a shorter event.', ['The sentence does not clearly show the ongoing action interrupted by another event.','Correct: past continuous for the ongoing action and past simple for the interruption.','The present tenses do not match the past time reference.']),
        translatorQuestion('لا يوجد الكثير من السكر في القهوة.', ['There isn’t much sugar in the coffee.','There aren’t many sugar in the coffee.','There isn’t many sugar in the coffee.'], 0, '“Sugar” is uncountable in this sentence.', ['Correct: use “much” with an uncountable noun.','“Sugar” is not plural countable here.','“Many” is used with plural countable nouns, not “sugar”.']),
        translatorQuestion('هل يمكنك إخباري أين تقع المحطة؟', ['Can you tell me where is the station?','Can you tell me where the station is?','Can you tell me where does the station be?'], 1, 'An embedded question uses statement word order.', ['Direct-question order is not used inside this indirect question.','Correct: subject comes before the verb in the embedded question.','This verb pattern is not grammatical.']),
        translatorQuestion('عليّ أن أنهي واجبي قبل العشاء.', ['I have to finish my homework before dinner.','I have finish my homework before dinner.','I must to finish my homework before dinner.'], 0, 'Choose the structure that expresses obligation correctly.', ['Correct: “have to” is followed by the base verb.','The infinitive marker is missing after “have”.','Do not use “to” after the modal “must”.']),
        translatorQuestion('لم نكن في المنزل عندما اتصلت.', ['We didn’t at home when you called.','We weren’t at home when you called.','We wasn’t at home when you called.'], 1, 'Use the past form of “be” with “we”.', ['“Didn’t” needs a main verb; “at home” is not one.','Correct: “we” takes “were”, and its negative is “weren’t”.','“Wasn’t” does not agree with “we”.']),
        translatorQuestion('هذه الحقيبة لي.', ['This bag is my.','This bag is mine.','This bag is me.'], 1, 'After “is”, use the possessive form that stands alone.', ['“My” must come before a noun.','Correct: “mine” is a possessive pronoun.','“Me” is an object pronoun, not a possessive form.']),
        translatorQuestion('كان الطقس بارداً جداً أمس.', ['The weather was very cold yesterday.','The weather were very cold yesterday.','The weather is very cold yesterday.'], 0, 'The subject is singular and the time is in the past.', ['Correct: singular “weather” takes “was”.','“Weather” is singular, so “were” does not agree.','The present form does not match “yesterday”.']),
        translatorQuestion('أفضّل المشي على ركوب الحافلة.', ['I prefer walking to taking the bus.','I prefer walk than take the bus.','I am prefer walking than the bus.'], 0, 'The pattern is “prefer + -ing + to + -ing”.', ['Correct: both activities use -ing, joined by “to”.','The verb forms and comparison pattern are incorrect.','“Prefer” is a main verb and does not take “am”; the pattern is also wrong.']),
        translatorQuestion('هناك عدد قليل من المقاعد المتاحة.', ['There is a few seats available.','There are a few seats available.','There are little seats available.'], 1, '“Seats” is plural and “a few” is used with countable nouns.', ['Plural “seats” needs “there are”.','Correct: “a few” refers to a small number of countable things.','“Little” is used with uncountable nouns.']),
        translatorQuestion('إذا هطلت الأمطار، سنبقى في المنزل.', ['If it will rain, we stay at home.','If it rains, we will stay at home.','If it rain, we will staying at home.'], 1, 'In a real future condition, use present simple after “if”.', ['Do not normally use “will” in the if-clause of this first conditional.','Correct: present simple in the condition and “will” in the result.','The verb agreement and future verb form are incorrect.']),
        translatorQuestion('لقد فقدت مفاتيحي ولا أستطيع الدخول.', ['I lost my keys and I can’t get in.','I have lost my keys and I can’t get in.','I have lose my keys and I can’t get in.'], 1, 'The past event has a result that matters now.', ['This is possible with a finished past-time context, but the present result favours present perfect here.','Correct: “have lost” connects the past event to the present problem.','The past participle of “lose” is “lost”.']),
        translatorQuestion('هذا المطعم مزدحم أكثر من المعتاد.', ['This restaurant is more crowded than usual.','This restaurant is crowdeder than usual.','This restaurant is the most crowded than usual.'], 0, 'Use “more” with this longer adjective.', ['Correct: “more crowded than” is the natural comparative form.','“Crowdeder” is not a standard form.','A superlative does not take “than” in this comparison.'])
      ],
      challenge: [
        translatorQuestion('كنت أقرأ عندما انقطعت الكهرباء.', ['I read when the electricity was going off.','I was reading when the power went out.','I have read when the power went out.'], 1, 'Keep the background action and the sudden event in different past forms.', ['The sequence does not express the ongoing background action naturally.','Correct: past continuous for reading, past simple for the interruption.','Present perfect is not used with this finished past event.']),
        translatorQuestion('لم أعد أعمل في ذلك المتجر.', ['I don’t work in that shop anymore.','I didn’t work in that shop already.','I am not work in that shop no more.'], 0, 'Choose the natural way to say a situation has changed.', ['Correct: “not ... anymore” expresses that something is no longer true.','“Already” does not express this meaning here.','The verb form and negative expression are incorrect.']),
        translatorQuestion('منذ متى وأنت تتعلم الإنجليزية؟', ['How long do you learn English?','How long have you been learning English?','Since when are you learning English?'], 1, 'The activity began in the past and continues now.', ['Present simple does not express the continuing duration as naturally.','Correct: present perfect continuous asks about an activity continuing until now.','This is not the natural question structure in this context.']),
        translatorQuestion('كان ينبغي أن تخبرني بالحقيقة.', ['You should told me the truth.','You should have told me the truth.','You should had tell me the truth.'], 1, 'This expresses regret or criticism about a past action.', ['After “should” for a past regret, use “have” plus a past participle.','Correct: “should have told” refers to an action that ought to have happened.','The verb sequence after “should” is incorrect.']),
        translatorQuestion('لم يكن عليهم الانتظار طويلاً.', ['They didn’t have to wait long.','They mustn’t wait long.','They hadn’t to wait long.'], 0, 'The sentence means there was no obligation to wait.', ['Correct: “didn’t have to” expresses lack of necessity in the past.','“Mustn’t” expresses prohibition, not absence of past necessity.','This is not the usual negative past form of “have to”.']),
        translatorQuestion('إذا كنت مكاني، فستعتذر.', ['If I were you, I would apologise.','If I was you, I will apologise.','If I am you, I would apologised.'], 0, 'This is advice using an unreal or hypothetical situation.', ['Correct: “If I were you” pairs with “would” for advice.','The conditional forms do not match.','The hypothetical clause and verb forms are incorrect.']),
        translatorQuestion('الكتاب الذي اشتريته أمس ممتع.', ['The book who I bought yesterday is interesting.','The book which I bought yesterday is interesting.','The book where I bought yesterday is interesting.'], 1, 'Use a relative pronoun for a thing, not a person or place.', ['“Who” refers to people, not the book.','Correct: “which” can introduce a relative clause about a thing.','“Where” refers to a place, not the object bought.']),
        translatorQuestion('لا أمانع في مساعدتك.', ['I don’t mind to help you.','I don’t mind helping you.','I’m not mind helping you.'], 1, 'The verb “mind” is followed by a gerund.', ['“Mind” is followed by -ing, not the infinitive with “to”.','Correct: “mind helping” uses the gerund form.','“Mind” is a main verb and does not take “am”.']),
        translatorQuestion('كان من الصعب العثور على العنوان.', ['It was difficult finding the address.','It was difficult to find the address.','It difficult was to finding the address.'], 1, 'After “difficult”, the infinitive is a natural structure.', ['This can occur in some contexts, but the infinitive is the clearest standard choice here.','Correct: “It was difficult to find...” is the standard pattern.','The word order and verb form are incorrect.']),
        translatorQuestion('وصلنا متأخرين بسبب ازدحام المرور.', ['We arrived late because the traffic.','We arrived late because of the traffic.','We arrived lately because traffic was.'], 1, 'Choose the phrase followed directly by a noun phrase.', ['“Because” introduces a clause, not just the noun phrase “the traffic”.','Correct: “because of” is followed by a noun phrase.','“Lately” means recently, and the second clause is incomplete.']),
        translatorQuestion('لم يكن القطار قد غادر عندما وصلنا.', ['The train didn’t leave when we arrived.','The train hadn’t left when we arrived.','The train hasn’t left when we arrived.'], 1, 'One past event happened before another past event.', ['This does not clearly show that the train was still there at our arrival.','Correct: past perfect marks the earlier event relative to our arrival.','Present perfect does not fit the finished past reference.']),
        translatorQuestion('أخبرني أن أنتظر هنا.', ['He told me wait here.','He told me to wait here.','He said me to wait here.'], 1, 'After “tell” with a person, use an object and an infinitive.', ['“Tell” needs “me” followed by “to wait”.','Correct: “told me to wait” is the reported instruction pattern.','“Say” does not take an indirect object in this structure.']),
        translatorQuestion('كلما تدربت أكثر، تحسنت أكثر.', ['The more you practise, the better you get.','More you practise, better you get.','The most you practise, the best you get.'], 0, 'This paired structure links two changing situations.', ['Correct: “the more..., the better...” expresses linked changes.','Both parts need “the” in this comparative structure.','Superlatives are not used in this paired comparison.']),
        translatorQuestion('لم أكن معتاداً على الاستيقاظ مبكراً.', ['I didn’t use to wake up early.','I wasn’t used to wake up early.','I wasn’t used to waking up early.'], 2, 'After “be used to”, use a noun or an -ing form.', ['This means the habit did not exist in the past; it is not the same as lacking familiarity.','“Wasn’t used to” needs a noun or gerund after “to”.','Correct: “used to” here means accustomed to, followed by “waking”.']),
        translatorQuestion('كان بإمكانها أن تأتي، لكنها لم تفعل.', ['She could have come, but she didn’t.','She could came, but she didn’t.','She can have come, but she didn’t.'], 0, 'Use the modal perfect to describe an unrealised past possibility.', ['Correct: “could have + past participle” describes a past possibility that did not happen.','The past participle is needed after “could have”.','The present modal does not match the unrealised past situation.'])
      ]
    }

    B1: {
      guided: [
        translatorQuestion('لم أرَ ليلى منذ أن غادرت الجامعة.', ['I didn’t see Layla since she left university.','I haven’t seen Layla since she left university.','I don’t see Layla since she has left university.'], 1, 'The sentence connects a past starting point with the situation now.', ['Past simple alone does not express the continuing period up to now here.','Correct: present perfect describes the period from her departure until now.','The tense combination is not natural for this meaning.']),
        translatorQuestion('كنت أعمل عندما اتصل بي أخي.', ['I worked when my brother was calling me.','I was working when my brother called me.','I have worked when my brother called me.'], 1, 'One action was already in progress when another happened.', ['This does not clearly show the ongoing background action.','Correct: past continuous for the ongoing action and past simple for the interruption.','Present perfect does not fit this finished past-time event.']),
        translatorQuestion('إذا درست بانتظام، ستتحسن لغتك.', ['If you will study regularly, your English improves.','If you study regularly, your English will improve.','If you studied regularly, your English will improved.'], 1, 'This describes a realistic future result of a possible action.', ['The if-clause normally uses present simple in this conditional.','Correct: present simple in the if-clause and will in the result clause.','The verb forms do not match a first conditional.']),
        translatorQuestion('لو كان لدي وقت أكثر، لتعلمت العزف على البيانو.', ['If I have more time, I would learn to play the piano.','If I had more time, I would learn to play the piano.','If I had more time, I will learned to play the piano.'], 1, 'The situation is imaginary or unlikely at present.', ['Present simple does not form this unreal present condition.','Correct: past simple in the if-clause pairs with would + base verb.','The result clause has the wrong modal and verb form.']),
        translatorQuestion('يُنظَّف هذا المكتب كل مساء.', ['This office is cleaned every evening.','This office cleans every evening.','This office is cleaning every evening.'], 0, 'Focus on the action and the object receiving it, not the person doing it.', ['Correct: present simple passive uses is + past participle.','This makes the office perform the cleaning.','The continuous form does not express the regular passive action.']),
        translatorQuestion('رغم أنه كان متعباً، أكمل التقرير.', ['Although he was tired, he finished the report.','Despite he was tired, he finished the report.','However he was tired, he finished the report.'], 0, 'Choose the conjunction that can introduce a complete clause.', ['Correct: although is followed by a subject and verb clause.','Despite is normally followed by a noun or -ing form, not a full clause directly.','However does not work as a subordinating conjunction in this structure.']),
        translatorQuestion('أفضّل العمل من المنزل على الذهاب إلى المكتب.', ['I prefer work from home than going to the office.','I prefer working from home to going to the office.','I am preferring working from home than go to the office.'], 1, 'Remember the pattern used to compare two preferred activities.', ['The verb forms and comparison pattern are incorrect.','Correct: prefer + -ing + to + -ing.','Prefer is not normally used in the continuous here, and the second verb form is wrong.']),
        translatorQuestion('لم أعتد على الاستيقاظ مبكراً.', ['I didn’t use to waking up early.','I am not used to wake up early.','I am not used to waking up early.'], 2, 'Here, “be used to” means being accustomed to something.', ['“Used to” for past habits takes the base verb, but this sentence means being accustomed.','After “be used to”, use a noun or an -ing form.','Correct: “waking” follows “be used to”.']),
        translatorQuestion('هل يمكنك إخباري متى يبدأ الاجتماع؟', ['Can you tell me when does the meeting start?','Can you tell me when the meeting starts?','Can you tell me when starts the meeting?'], 1, 'An indirect question uses statement word order after the question word.', ['Direct-question inversion is not used inside this embedded question.','Correct: subject before verb in the indirect question.','The subject and verb order is unnatural.']),
        translatorQuestion('كان ينبغي أن تتصل بي أمس.', ['You should call me yesterday.','You should have called me yesterday.','You should had called me yesterday.'], 1, 'This expresses criticism or regret about a past action.', ['The base modal form does not refer clearly to an unfulfilled past expectation.','Correct: should have + past participle refers to what was advisable in the past.','After should, use have, not had, in the modal perfect.']),
        translatorQuestion('وصلنا متأخرين بسبب ازدحام المرور.', ['We arrived late because the traffic.','We arrived late because of the traffic.','We arrived lately due to the traffic was heavy.'], 1, 'Choose the expression followed by a noun phrase.', ['Because introduces a clause, not just “the traffic”.','Correct: because of is followed by a noun phrase.','Lately means recently, and the clause structure is incorrect.']),
        translatorQuestion('هذه هي المرأة التي ساعدتني في المقابلة.', ['This is the woman which helped me at the interview.','This is the woman who helped me at the interview.','This is the woman where helped me at the interview.'], 1, 'Choose the relative pronoun used for a person.', ['Which is normally used for things, not people.','Correct: who introduces a relative clause referring to a person.','Where refers to a place, not a person.'])
      ],
      steady: [
        translatorQuestion('منذ متى وأنت تعمل في هذه الشركة؟', ['How long do you work for this company?','How long have you been working for this company?','How long are you working for this company?'], 1, 'The activity began in the past and is still continuing.', ['Present simple does not express the duration up to now as naturally.','Correct: present perfect continuous asks about an ongoing activity and its duration.','Present continuous alone does not naturally express the whole period since the past.']),
        translatorQuestion('تم بناء الجسر عام 1998.', ['The bridge built in 1998.','The bridge was built in 1998.','The bridge has build in 1998.'], 1, 'The sentence describes a completed past action received by the bridge.', ['The passive auxiliary is missing.','Correct: past simple passive uses was + past participle.','The participle is wrong, and a finished year normally takes past simple.']),
        translatorQuestion('لم يكن القطار قد غادر عندما وصلنا إلى المحطة.', ['The train didn’t leave when we arrived at the station.','The train hadn’t left when we arrived at the station.','The train hasn’t left when we arrived at the station.'], 1, 'One past event had not happened before another past event.', ['This does not clearly mark the earlier time relationship.','Correct: past perfect shows the train’s departure had not happened before our arrival.','Present perfect does not fit the finished past reference.']),
        translatorQuestion('إذا كنت مكاني، فستطلب توضيحاً.', ['If I am you, I will ask for clarification.','If I were you, I would ask for clarification.','If I was you, I would asked for clarification.'], 1, 'This is a hypothetical way of giving advice.', ['The present form does not express the hypothetical situation.','Correct: “If I were you” pairs with would + base verb for advice.','The result verb should be the base form after would.']),
        translatorQuestion('لا أمانع في الانتظار قليلاً.', ['I don’t mind to wait a little.','I don’t mind waiting a little.','I’m not mind waiting a little.'], 1, 'The verb “mind” is followed by a particular verb form.', ['Mind is followed by an -ing form, not to + infinitive.','Correct: “mind waiting” uses the gerund.','Mind is a main verb and does not take “am” here.']),
        translatorQuestion('لم أتمكن من حضور الحفل لأنني كنت مريضاً.', ['I couldn’t attend the party because I was ill.','I mustn’t attend the party because I was ill.','I couldn’t to attend the party because I was ill.'], 0, 'Choose the modal that expresses lack of ability or possibility in the past.', ['Correct: couldn’t + base verb expresses inability or impossibility.','Mustn’t expresses prohibition, not inability in this context.','A modal is followed directly by the base verb without “to”.']),
        translatorQuestion('قالت إنها ستتصل بي في اليوم التالي.', ['She said she will call me the next day.','She said she would call me the next day.','She told that she would call me the next day.'], 1, 'Reported speech often moves the future form one step back after a past reporting verb.', ['Will is possible in some contexts, but would is the expected backshift here.','Correct: will changes to would in this reported statement.','Tell normally needs an object, such as “told me”.']),
        translatorQuestion('على الرغم من المطر، استمرت المباراة.', ['Despite the rain, the match continued.','Although the rain, the match continued.','In spite the rain, the match continued.'], 0, 'Choose the expression that can be followed directly by a noun phrase.', ['Correct: despite is followed directly by a noun phrase.','Although needs a clause with a subject and verb.','The expression is “in spite of the rain”.']),
        translatorQuestion('هذا هو الكتاب الذي أخبرتك عنه.', ['This is the book who I told you about.','This is the book which I told you about.','This is the book where I told you about.'], 1, 'The relative pronoun refers to a thing.', ['Who refers to people.','Correct: which can refer to the book in a relative clause.','Where refers to a place.']),
        translatorQuestion('يجب إنجاز العمل قبل يوم الجمعة.', ['The work must finish before Friday.','The work must be finished before Friday.','The work must be finishing before Friday.'], 1, 'The work receives the action, so use a passive form after the modal.', ['This says the work itself performs the finishing.','Correct: modal + be + past participle forms the passive.','The -ing form is not the required passive structure.']),
        translatorQuestion('لم أعد أتناول القهوة مساءً.', ['I don’t drink coffee in the evening anymore.','I didn’t drink coffee already in the evening.','I am not used to drink coffee no more.'], 0, 'Choose the natural expression for a habit that has stopped.', ['Correct: not … anymore means the situation is no longer true.','Already does not express a changed habit here.','The structure after “used to” is wrong, and “no more” is awkward here.']),
        translatorQuestion('أخبرني أن أرسل الملف قبل الظهر.', ['He told me send the file before noon.','He told me to send the file before noon.','He said me to send the file before noon.'], 1, 'After “tell” with a person, use an object followed by an infinitive.', ['Tell needs “me” followed by “to send”.','Correct: told + object + to-infinitive reports an instruction.','Say does not take an indirect object in this structure.']),
        translatorQuestion('كلما تدربت أكثر، أصبحت أكثر ثقة.', ['The more you practise, the more confident you become.','More you practise, more confident you become.','The most you practise, the most confident you become.'], 0, 'This paired comparative structure links two changing situations.', ['Correct: use “the more …, the more …”.','Both parts need “the” in this structure.','Superlatives do not express this linked comparison.']),
        translatorQuestion('من الأفضل أن تتحقق من المعلومات قبل نشرها.', ['You had better check the information before publishing it.','You had better to check the information before publish it.','You better checking the information before you publish.'], 0, 'The expression “had better” is followed directly by a base verb.', ['Correct: had better + base verb gives strong advice.','Do not add “to” after had better; publishing is also in the wrong form.','The expression and verb pattern are incomplete.']),
        translatorQuestion('كان من المفترض أن نلتقي عند المدخل.', ['We were supposed meet at the entrance.','We were supposed to meet at the entrance.','We supposed to met at the entrance.'], 1, 'Use the fixed expression for an expected arrangement.', ['The infinitive marker “to” is missing.','Correct: be supposed to + base verb expresses an expectation or arrangement.','The auxiliary and verb form are missing or incorrect.'])
      ],
      challenge: [
        translatorQuestion('لو أخبرتني مبكراً، لاستطعت مساعدتك.', ['If you told me earlier, I could help you.','If you had told me earlier, I could have helped you.','If you would tell me earlier, I had helped you.'], 1, 'The condition and result are both unreal past events.', ['This mixes forms and does not clearly express the unreal past condition.','Correct: past perfect in the if-clause and could have + past participle in the result.','Would is not normally used in the if-clause this way, and the result form is wrong.']),
        translatorQuestion('لم تكن هذه المشكلة لتحدث لو اتبعنا التعليمات.', ['This problem wouldn’t happen if we followed the instructions.','This problem wouldn’t have happened if we had followed the instructions.','This problem hadn’t happened if we would follow the instructions.'], 1, 'The speaker imagines a different outcome in the past.', ['This is a present or general hypothetical pattern, not an unreal past one.','Correct: would have + past participle pairs with if + past perfect.','The conditional forms are incorrectly combined.']),
        translatorQuestion('كان من الممكن أن نفوت الرحلة بسبب التأخير.', ['We might miss the flight because of the delay.','We might have missed the flight because of the delay.','We might had missed the flight because of the delay.'], 1, 'The possibility refers to a past event that fortunately did not happen.', ['This suggests a present or future possibility.','Correct: might have + past participle describes a past possibility.','After might, use have, not had, in the modal perfect.']),
        translatorQuestion('لم يكن عليها أن تدفع؛ فالدخول كان مجانياً.', ['She mustn’t pay; entry was free.','She didn’t have to pay; entry was free.','She shouldn’t have to paid; entry was free.'], 1, 'The meaning is that payment was unnecessary, not forbidden.', ['Mustn’t means it was prohibited, which is a different meaning.','Correct: didn’t have to expresses lack of necessity in the past.','The modal pattern and verb form are incorrect.']),
        translatorQuestion('كل الوثائق يجب أن تُوقَّع قبل إرسال الطلب.', ['All the documents must sign before the application is sent.','All the documents must be signed before the application is sent.','All the documents must have signed before the application is sent.'], 1, 'The documents receive the action; use a passive form after the modal.', ['The documents cannot perform the signing in this meaning.','Correct: must be + past participle forms the passive.','Must have signed would make the documents the agents of the action.']),
        translatorQuestion('لم أكن أتوقع أن يكون الطريق بهذا الازدحام.', ['I didn’t expect the road to be this busy.','I wasn’t expecting the road being this busy.','I didn’t expected the road to be this busy.'], 0, 'Choose the natural pattern after “expect” and check the past negative.', ['Correct: expect + object + to-infinitive is natural here.','The -ing clause is not the usual pattern in this sentence.','After didn’t, use the base form “expect”.']),
        translatorQuestion('أخبروني أنهم لم يتخذوا قراراً بعد.', ['They told me they hadn’t made a decision yet.','They told me they haven’t make a decision yet.','They said me they didn’t made a decision yet.'], 0, 'The decision had not happened by the time of the past report.', ['Correct: past perfect marks the action not completed by the reporting time.','The participle after have is wrong.','Say does not take “me” directly here, and didn’t takes the base verb.']),
        translatorQuestion('إذا لم تكن متأكداً، فمن الأفضل أن تسأل.', ['Unless you are sure, you should ask.','If you aren’t sure, you should ask.','Unless you aren’t sure, you should ask.'], 1, 'Choose the clearest equivalent of the intended negative condition.', ['Unless means “if not”, so this reverses the intended meaning.','Correct: if + negative clause expresses the condition clearly.','The double negative changes the intended meaning.']),
        translatorQuestion('لم يكن معتاداً على التحدث أمام الجمهور.', ['He didn’t use to speaking in public.','He wasn’t used to speaking in public.','He wasn’t used to speak in public.'], 1, 'The sentence describes what felt unfamiliar to him, not simply a past habit.', ['“Didn’t use to” describes a past habit that did not exist; it is a different meaning.','Correct: be used to + -ing means be accustomed to an activity.','After “be used to”, use a noun or an -ing form.']),
        translatorQuestion('لم يكن بإمكانهم إكمال المشروع دون مساعدتنا.', ['They couldn’t finish the project without our help.','They couldn’t have finish the project without our help.','They weren’t able finishing the project without our help.'], 0, 'Use the past form of ability followed by the base verb.', ['Correct: couldn’t + base verb expresses lack of ability or possibility.','The modal perfect requires a past participle after have.','The structure is “be able to + base verb”, not an -ing form.']),
        translatorQuestion('كان ينبغي ألا تخبره بالسر.', ['You shouldn’t tell him the secret.','You shouldn’t have told him the secret.','You should haven’t told him the secret.'], 1, 'This is criticism about something that already happened.', ['This gives present or general advice rather than criticism of a past action.','Correct: shouldn’t have + past participle expresses that the past action was a mistake.','The negative belongs after should: shouldn’t have told.']),
        translatorQuestion('لم أكن أعرف أن المتحف يُغلق يوم الاثنين.', ['I didn’t know the museum closed on Mondays.','I didn’t know the museum was closing on Mondays.','I haven’t known the museum closes on Mondays.'], 0, 'The sentence reports a past lack of knowledge about a regular schedule.', ['Correct: past simple reports the earlier lack of knowledge; past simple can also state the regular schedule.','Past continuous does not express the regular opening schedule naturally.','Present perfect is not the natural choice with this past reporting context.']),
        translatorQuestion('على الرغم من أن الخطة بدت بسيطة، فقد استغرقت وقتاً أطول مما توقعنا.', ['Although the plan seemed simple, it took longer than we expected.','Despite the plan seemed simple, it took longer than we expected.','Although seeming simple, but the plan took longer than we expected.'], 0, 'Use a clause after although, and avoid adding a second contrast marker.', ['Correct: although introduces a full clause and the contrast is complete.','Despite needs a noun or -ing form, not a full clause directly.','Although and but should not be used together this way.']),
        translatorQuestion('هذا هو السبب الذي جعلني أغيّر رأيي.', ['This is the reason which made me change my mind.','This is the reason why made me change my mind.','This is the reason where I changed my mind.'], 0, 'Choose a relative structure that can refer to a reason and has a complete clause.', ['Correct: which refers to “the reason” and is the subject of “made”.','Why cannot be followed by this incomplete clause structure.','Where refers to a place, not a reason.']),
        translatorQuestion('لم يعتدوا على العمل معاً، لذلك احتاجوا إلى بعض الوقت.', ['They weren’t used to work together, so they needed some time.','They weren’t used to working together, so they needed some time.','They didn’t used to working together, so they needed some time.'], 1, 'The meaning is lack of familiarity with an activity.', ['After “be used to”, use an -ing form.','Correct: “weren’t used to working” describes something unfamiliar to them.','After didn’t, use “use”; this form also confuses the two meanings of used to.'])
      ]
    }
  };

  let selectedTranslatorCEFR = 'adaptive';
  let mode = null, index = 0, score = 0, locked = false, clueCount = 0, oddHintStep = 0, ladderPath = [], ladderWordNote = null, ladderMistakeRecorded = false, roundMistakes = 0, activePool = null, activeDifficulty = null, forgePlaced = [], scramblePlaced = [], connectionSelected = [], chainStepIndex = 0, chainPath = [];

  rounds.forge = [
    {prompt:'Forge the word from the letter tiles.',clue:'A small animal often kept as a pet.',letters:'TAC',answerWord:'cat',explain:'CAT uses all three letters and matches the clue.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A place where you borrow books.',letters:'YBRRALI',answerWord:'library',explain:'A LIBRARY is a place to borrow books, read, or study.'},
    {prompt:'Forge the word from the letter tiles.',clue:'The opposite of noisy.',letters:'TEQUI',answerWord:'quiet',explain:'QUIET means making little or no noise.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A person whose job is to help students learn.',letters:'CEHTARE',answerWord:'teacher',explain:'A TEACHER helps people learn.'},
    {prompt:'Forge the word from the letter tiles.',clue:'Move through the air.',letters:'YFL',answerWord:'fly',explain:'To FLY is to move through the air.'},
    {prompt:'Forge the word from the letter tiles.',clue:'Feeling pleased or content.',letters:'PYHAP',answerWord:'happy',explain:'HAPPY describes a feeling of pleasure or contentment.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A large grey animal with a trunk.',letters:'PHEALENT',answerWord:'elephant',explain:'An ELEPHANT is a large mammal with a trunk.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A bright object in the night sky.',letters:'TARS',answerWord:'star',explain:'A STAR is a luminous object in space.'},
    {prompt:'Forge the word from the letter tiles.',clue:'The planet we live on.',letters:'HRAET',answerWord:'earth',explain:'EARTH is the planet on which we live.'},
    {prompt:'Forge the word from the letter tiles.',clue:'The time when the sun goes down.',letters:'TUNSES',answerWord:'sunset',explain:'SUNSET is the time when the sun disappears below the horizon.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A person who writes books or stories.',letters:'RUTHOA',answerWord:'author',explain:'An AUTHOR writes books, articles, or other texts.'},
    {prompt:'Forge the word from the letter tiles.',clue:'To pay attention to a sound.',letters:'TENSIL',answerWord:'listen',explain:'To LISTEN is to give attention to sounds.'},
    {prompt:'Forge the word from the letter tiles.',clue:'The opposite of arrive.',letters:'VEALE',answerWord:'leave',explain:'LEAVE means to go away from a place; it is the opposite of arrive in this context.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A place where plants and flowers grow.',letters:'DGNARE',answerWord:'garden',explain:'A GARDEN is an area where plants and flowers are grown.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A journey by air.',letters:'GHILTF',answerWord:'flight',explain:'A FLIGHT is a journey made by aircraft.'},
    {prompt:'Forge the word from the letter tiles.',clue:'The meal eaten in the morning.',letters:'KAFSRETAB',answerWord:'breakfast',explain:'BREAKFAST is the first meal of the day.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A place where you can see many kinds of animals.',letters:'OZO',answerWord:'zoo',explain:'A ZOO is a place where animals are kept for people to observe.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A device used to take photographs.',letters:'AMREAC',answerWord:'camera',explain:'A CAMERA captures photographs or video.'},
    {prompt:'Forge the word from the letter tiles.',clue:'A person who designs or builds machines and systems.',letters:'NIGENEER',answerWord:'engineer',explain:'An ENGINEER designs, builds, or maintains systems and structures.'},
    {prompt:'Forge the word from the letter tiles.',clue:'To make something better.',letters:'RIPVOME',answerWord:'improve',explain:'To IMPROVE is to make something better.'}
  ];
  rounds.connections = [
    {prompt:'Which category connects these four words?',words:['rose','tulip','daisy','lily'],options:['Flowers','Tools','Weather'],answer:0,explain:'Rose, tulip, daisy and lily are all flowers.'},
    {prompt:'Which category connects these four words?',words:['eagle','sparrow','robin','owl'],options:['Fish','Birds','Mammals'],answer:1,explain:'Eagle, sparrow, robin and owl are all birds.'},
    {prompt:'Which category connects these four words?',words:['shirt','jacket','socks','scarf'],options:['Things you wear','Tableware','Furniture'],answer:0,explain:'All four are items of clothing.'},
    {prompt:'Which category connects these four words?',words:['minute','hour','second','day'],options:['Seasons','Units or periods of time','Directions'],answer:1,explain:'Each word names a unit or period of time.'},
    {prompt:'Which category connects these four words?',words:['whisper','shout','murmur','scream'],options:['Ways of speaking','Ways of moving','Ways of cooking'],answer:0,explain:'All four describe ways of speaking.'},
    {prompt:'Which category connects these four words?',words:['tiny','small','little','minute'],options:['Very large','Very loud','Small in size'],answer:2,explain:'All four can describe something small; “minute” here is pronounced my-NOOT.'},
    {prompt:'Which category connects these four words?',words:['hammer','screwdriver','wrench','pliers'],options:['Garden plants','Hand tools','Musical instruments'],answer:1,explain:'These are all common hand tools.'},
    {prompt:'Which category connects these four words?',words:['copper','iron','silver','gold'],options:['Metals','Fabrics','Grains'],answer:0,explain:'Copper, iron, silver and gold are metals.'},
    {prompt:'Which category connects these four words?',words:['January','March','July','October'],options:['Months','Continents','Languages'],answer:0,explain:'Each is a month of the year.'},
    {prompt:'Which category connects these four words?',words:['triangle','square','circle','rectangle'],options:['Kitchen appliances','Geometric shapes','Body parts'],answer:1,explain:'These are all geometric shapes.'},
    {prompt:'Which category connects these four words?',words:['whale','dolphin','seal','otter'],options:['Aquatic or semi-aquatic mammals','Birds of prey','Reptiles'],answer:0,explain:'These animals are mammals associated with water.'},
    {prompt:'Which category connects these four words?',words:['boil','fry','bake','grill'],options:['Cooking methods','Weather conditions','Ways to travel'],answer:0,explain:'Boil, fry, bake and grill are ways to cook food.'},
    {prompt:'Which category connects these four words?',words:['honest','truthful','sincere','candid'],options:['Ways to disagree','Similar meanings about truthfulness','Words for speed'],answer:1,explain:'These words all relate to being truthful or genuine.'},
    {prompt:'Which category connects these four words?',words:['north','south','east','west'],options:['Compass directions','Musical notes','Months'],answer:0,explain:'North, south, east and west are the four cardinal directions.'},
    {prompt:'Which category connects these four words?',words:['oak','maple','pine','birch'],options:['Trees','Flowers','Insects'],answer:0,explain:'Oak, maple, pine and birch are types of trees.'},
    {prompt:'Which category connects these four words?',words:['thermometer','barometer','hygrometer','anemometer'],options:['Weather instruments','Kitchen utensils','Sports equipment'],answer:0,explain:'These instruments measure temperature, air pressure, humidity or wind.'},
    {prompt:'Which category connects these four words?',words:['novel','poem','play','short story'],options:['Literary forms','Building materials','Computer parts'],answer:0,explain:'A novel, poem, play and short story are forms of literature.'},
    {prompt:'Which category connects these four words?',words:['ankle','elbow','knee','wrist'],options:['Joints in the body','Types of fruit','Clothing fasteners'],answer:0,explain:'Each word names a joint in the human body.'},
    {prompt:'Which category connects these four words?',words:['generous','kind','considerate','thoughtful'],options:['Positive qualities','Cooking verbs','Weather words'],answer:0,explain:'These words describe positive qualities in how people treat others.'},
    {prompt:'Which category connects these four words?',words:['evaporate','condense','freeze','melt'],options:['Changes of state','Ways of listening','Ways to write'],answer:0,explain:'These words describe changes of state in matter.'}
  ];
  rounds.scramble = [
    {prompt:'Build the sentence in the correct order.',words:['usually','coffee','I','morning','drink','the','in'],options:['Usually coffee I drink in the morning.','I usually drink coffee in the morning.','I drink usually in the coffee morning.'],answer:1,explain:'The natural order is subject + adverb of frequency + verb + object + time phrase.'},
    {prompt:'Build the sentence in the correct order.',words:['already','has','she','finished','work','her'],options:['She has already finished her work.','Already she finished has her work.','She already has finish her work.'],answer:0,explain:'In the present perfect, “already” commonly appears between has and the past participle.'},
    {prompt:'Build the sentence in the correct order.',words:['you','could','me','help','please'],options:['You could me help please.','Could you help me, please?','Could help you me please?'],answer:1,explain:'“Could you help me, please?” is a natural, polite request.'},
    {prompt:'Build the sentence in the correct order.',words:['because','stayed','it','home','raining','was','we'],options:['Because raining it was we stayed home.','We stayed home because it was raining.','We because it was raining stayed home.'],answer:1,explain:'The main clause is followed by “because” and the reason.'},
    {prompt:'Build the sentence in the correct order.',words:['never','such','I','seen','have','a','view','beautiful'],options:['I have never seen such a beautiful view.','I never have such seen a beautiful view.','Never I seen have a beautiful such view.'],answer:0,explain:'“Never” goes between have and the past participle in this sentence.'},
    {prompt:'Build the sentence in the correct order.',words:['if','we','had','left','earlier','we','would','arrived','have','on','time'],options:['If we had left earlier, we would have arrived on time.','If we would have left earlier, we had arrived on time.','We would arrived on time if had left earlier.'],answer:0,explain:'This is a third conditional: If + past perfect, would have + past participle.'},
    {prompt:'Build the sentence in the correct order.',words:['often','walks','to','school','Mina'],options:['Mina walks often school to.','Mina often walks to school.','Often to school walks Mina.'],answer:1,explain:'A frequency adverb usually comes before the main verb: “Mina often walks…”'},
    {prompt:'Build the sentence in the correct order.',words:['they','have','already','eaten','lunch'],options:['They have already eaten lunch.','They already have eat lunch.','Already eaten they have lunch.'],answer:0,explain:'Use have + past participle; “already” commonly comes after have.'},
    {prompt:'Build the sentence in the correct order.',words:['if','rains','we','will','stay','inside','it'],options:['If rains it, we inside stay will.','We will stay inside if it rains.','If it will rain, we stay inside.'],answer:1,explain:'For a real future possibility, use present simple in the if-clause and “will” in the main clause.'},
    {prompt:'Build the sentence in the correct order.',words:['the','movie','was','more','interesting','than','I','expected'],options:['The movie was more interesting than I expected.','The movie more was interesting I than expected.','More interesting than expected I was the movie.'],answer:0,explain:'Use “more + adjective + than” to compare things.'},
    {prompt:'Build the sentence in the correct order.',words:['she','has','been','learning','English','for','two','years'],options:['She has been learning English for two years.','She is learning English since two years.','She has learning been English for two years.'],answer:0,explain:'The present perfect continuous describes an activity continuing over a period up to now.'},
    {prompt:'Build the sentence in the correct order.',words:['despite','being','tired','he','finished','the','report'],options:['Despite he was tired, finished the report.','Despite being tired, he finished the report.','Despite tired being, he the report finished.'],answer:1,explain:'“Despite” can be followed by a noun or an -ing form: “Despite being tired…”'},
    {prompt:'Build the sentence in the correct order.',words:['not','only','did','she','apologize','but','she','also','fixed','the','mistake'],options:['Not only she apologized, but also fixed the mistake.','Not only did she apologize, but she also fixed the mistake.','Not only did apologize she, but fixed she also the mistake.'],answer:1,explain:'When “not only” begins the clause, auxiliary inversion is used: “Not only did she…”'},
    {prompt:'Build the sentence in the correct order.',words:['the','proposal','would','have','worked','if','we','had','tested','it'],options:['The proposal would have worked if we had tested it.','The proposal would worked have if we tested had it.','If we would have tested it, the proposal had worked.'],answer:0,explain:'This is a third conditional: would have + past participle, with if + past perfect.'},
    {prompt:'Build the sentence in the correct order.',words:['what','makes','the','evidence','particularly','compelling'],options:['What makes the evidence particularly compelling?','What the evidence makes particularly compelling?','What makes particularly the compelling evidence?'],answer:0,explain:'In a direct question, “what” is followed by the verb “makes” and its object.'},
    {prompt:'Build the sentence in the correct order.',words:['rarely','have','I','encountered','such','a','thoughtful','argument'],options:['Rarely I have encountered such a thoughtful argument.','Rarely have I encountered such a thoughtful argument.','Rarely encountered I have such a thoughtful argument.'],answer:1,explain:'A negative or restrictive adverb at the beginning triggers subject–auxiliary inversion.'},
    {prompt:'Build the sentence in the correct order.',words:['the','results','suggest','that','further','research','is','needed'],options:['The results suggest that further research is needed.','The results that suggest further research needed is.','Suggest the results that is needed further research.'],answer:0,explain:'The sentence uses “suggest that” followed by a complete clause.'},
    {prompt:'Build the sentence in the correct order.',words:['had','I','known','about','the','delay','I','would','have','left','later'],options:['Had I known about the delay, I would have left later.','Had I knew about the delay, I would left have later.','I had known the delay about, would have I left later.'],answer:0,explain:'“Had I known…” is an inverted third conditional, equivalent to “If I had known…”'},
    {prompt:'Build the sentence in the correct order.',words:['the','more','you','practice','the','more','confident','you','become'],options:['The more you practice, the more confident you become.','More you practice, more confident become you.','The more practice you, the more you become confident.'],answer:0,explain:'The correlative pattern is “the more…, the more…”'},
    {prompt:'Build the sentence in the correct order.',words:['although','the','deadline','was','tight','the','team','delivered','excellent','work'],options:['Although the deadline was tight, the team delivered excellent work.','Although was the deadline tight, the team excellent delivered work.','The deadline although was tight, delivered the team work excellent.'],answer:0,explain:'An “although” clause can introduce a contrast before the main clause.'}
  ];
  rounds.chain = [
    {prompt:'Continue the word association chain: RAIN → ?',options:['umbrella','desert','pillow'],answer:0,explain:'An umbrella is commonly used to stay dry in the rain.'},
    {prompt:'Continue the word association chain: BOOK → ?',options:['oven','library','helmet'],answer:1,explain:'A library is a place associated with books.'},
    {prompt:'Continue the word association chain: CHEF → ?',options:['airport','kitchen','forest'],answer:1,explain:'A chef usually works in a kitchen.'},
    {prompt:'Continue the word association chain: SCHOOL → ?',options:['student','pilot','painter'],answer:0,explain:'Students attend school to learn.'},
    {prompt:'Continue the word association chain: DOCTOR → ?',options:['stadium','hospital','bakery'],answer:1,explain:'Doctors often work in hospitals.'},
    {prompt:'Continue the word association chain: MUSIC → ?',options:['passport','instrument','blanket'],answer:1,explain:'Music can be played on a musical instrument.'},
    {prompt:'Continue the word association chain: BEE → ?',options:['honey','snow','metal'],answer:0,explain:'Bees produce honey.'},
    {prompt:'Continue the word association chain: CAMERA → ?',options:['photograph','sandwich','thunder'],answer:0,explain:'A camera is used to take photographs.'},
    {prompt:'Continue the word association chain: WINTER → ?',options:['scarf','cactus','sunburn'],answer:0,explain:'A scarf is commonly worn to keep warm in winter.'},
    {prompt:'Continue the word association chain: KEY → ?',options:['lock','cloud','pencil'],answer:0,explain:'A key is used to open or secure a lock.'},
    {prompt:'Continue the word association chain: GARDEN → ?',options:['flower','engine','ticket'],answer:0,explain:'Flowers commonly grow in a garden.'},
    {prompt:'Continue the word association chain: AIRPORT → ?',options:['luggage','saucepan','pillowcase'],answer:0,explain:'Travellers commonly bring luggage to an airport.'},
    {prompt:'Continue the word association chain: PAINTER → ?',options:['brush','stethoscope','compass'],answer:0,explain:'A painter uses a brush.'},
    {prompt:'Continue the word association chain: OCEAN → ?',options:['wave','brick','ladder'],answer:0,explain:'Waves are a familiar feature of the ocean.'},
    {prompt:'Continue the word association chain: CLOCK → ?',options:['time','flour','forest'],answer:0,explain:'A clock measures or displays time.'},
    {prompt:'Continue the word association chain: LIBRARY → ?',options:['borrow','bake','whistle'],answer:0,explain:'People often borrow books from a library.'},
    {prompt:'Continue the word association chain: FIRE → ?',options:['smoke','snowflake','pillow'],answer:0,explain:'Smoke is commonly produced by fire.'},
    {prompt:'Continue the word association chain: SEED → ?',options:['plant','helmet','receipt'],answer:0,explain:'A seed can grow into a plant.'},
    {prompt:'Continue the word association chain: BREAD → ?',options:['bakery','garage','pharmacy'],answer:0,explain:'Bread is commonly made and sold at a bakery.'},
    {prompt:'Continue the word association chain: THUNDER → ?',options:['lightning','footprint','whisper'],answer:0,explain:'Thunder and lightning are often associated during storms.'}
  ];

  rounds.wordladder = [
    {start:'cat',goal:'dog',path:['cot','dot','dog'],hint:'Change exactly one letter at each step. Every step must be a real English word.',explain:'cat → cot → dot → dog changes one letter at each step, and every step forms a real word.'},
    {start:'cold',goal:'warm',path:['cord','card','ward','warm'],hint:'Change one letter per move. Keep every intermediate word meaningful.',explain:'cold → cord → card → ward → warm changes one letter at a time and makes valid words.'},
    {start:'head',goal:'tail',path:['heal','teal','tell','tall','tail'],hint:'A longer ladder: make one valid one-letter change per move.',explain:'head → heal → teal → tell → tall → tail is a valid ladder with one letter changed each time.'},
    {start:'fall',goal:'melt',path:['ball','bell','belt','melt'],hint:'Try changing the first letter, then look for a word that differs by one letter.',explain:'fall → ball → bell → belt → melt changes exactly one letter at each step.'},
    {start:'make',goal:'time',path:['take','tame','time'],hint:'The middle word may change a vowel or consonant—only one letter each time.',explain:'make → take → tame → time is a valid one-letter ladder.'},
    {start:'sand',goal:'sent',path:['band','bend','bent','sent'],hint:'Small spelling changes can create a completely different word.',explain:'sand → band → bend → bent → sent changes one letter per move.'},
    {start:'ring',goal:'milk',path:['sing','sink','silk','milk'],hint:'Listen to the word as you change one letter at a time.',explain:'ring → sing → sink → silk → milk is a valid ladder.'},
    {start:'hate',goal:'five',path:['have','hive','five'],hint:'Look for a familiar word that shares three of the four letters.',explain:'hate → have → hive → five changes exactly one letter each time.'},
    {start:'cast',goal:'coat',path:['cost','coat'],hint:'A single vowel change may be enough to make the next word.',explain:'cast → cost → coat changes one letter at each step.'},
    {start:'bark',goal:'care',path:['dark','dare','care'],hint:'You can change a consonant at the start or at the end.',explain:'bark → dark → dare → care is a valid one-letter ladder.'},
    {start:'wind',goal:'like',path:['wine','line','lime','like'],hint:'Keep checking that each new word differs from the previous one by just one letter.',explain:'wind → wine → line → lime → like changes one letter per move.'},
    {start:'late',goal:'gate',path:['date','dare','care','came','game','gate'],hint:'This one takes several steps. Focus only on the next move, not the whole route.',explain:'late → date → dare → care → came → game → gate changes one letter at every step.'},
    {start:'book',goal:'tail',path:['cook','cool','pool','poll','pall','pail','tail'],hint:'A longer challenge: solve one small step at a time. Every intermediate word is part of the puzzle.',explain:'book → cook → cool → pool → poll → pall → pail → tail is a valid ladder.'},
    {start:'pane',goal:'pine',path:['pine'],hint:'Can you spot the one-letter change immediately?',explain:'pane → pine changes just one letter: A becomes I.'},
    {start:'cold',goal:'cord',path:['cord'],hint:'Sometimes the shortest ladder is just one move.',explain:'cold → cord changes one letter: L becomes R.'},
    {start:'game',goal:'gate',path:['gate'],hint:'Compare the final letters carefully.',explain:'game → gate changes one letter: M becomes T.'}
  ];
  rounds.maze = [
    {target:'bridge',options:['bridge','fridge','bright','breeze'],explain:'Bridge is the word you heard. Listen for the opening consonant cluster /br/ and the ending /dʒ/.'},
    {target:'market',options:['marble','market','magnet','marker'],explain:'Market has the /k/ sound in the middle and ends with /ɪt/.'},
    {target:'window',options:['widow','winter','window','winner'],explain:'Window has two syllables: WIN-dow. Listen for the /d/ sound in the middle.'}
  ];

  const guidedRounds = {
    odd:[
      {prompt:'Which word does not belong?',why:'Start by finding the shared group.',words:['apple','pear','banana','chair'],answer:3,explain:'Apple, pear and banana are fruits. A chair is furniture.'},
      {prompt:'Which word does not belong?',why:'Look for things used at school.',words:['pencil','notebook','eraser','sandwich'],answer:3,explain:'A pencil, notebook and eraser are school supplies. A sandwich is food.'},
      {prompt:'Which word does not belong?',why:'Find the shared meaning.',words:['happy','glad','joyful','angry'],answer:3,explain:'Happy, glad and joyful have similar positive meanings. Angry is different.'}
    ],
    translator:[
      {ar:'صباح الخير.',prompt:'Choose the natural English greeting.',options:['Good morning.','Good early.','Morning good.'],answer:0,explain:'“Good morning” is the usual English greeting in the morning.'},
      {ar:'شكرا جزيلا.',prompt:'Choose the natural English expression.',options:['Many thank.','Thank you very much.','Very thanks you.'],answer:1,explain:'“Thank you very much” is a natural way to express strong gratitude.'},
      {ar:'أين محطة الحافلات؟',prompt:'Choose the natural English question.',options:['Where is the bus station?','Where the bus station is?','Where bus station?'],answer:0,explain:'Use “Where is…?” for a direct question about a place.'}
    ],
    detective:[
      {title:'The open window',clues:['A window is open.','A curtain is moving in the breeze.','The room feels cool.'],question:'Which explanation best fits the clues?',options:['Cool air is entering the room.','Someone baked a cake.','The lights are broken.'],answer:0,explain:'The open window and moving curtain support the idea that cool air is entering.'},
      {title:'The empty bottle',clues:['The bottle is empty.','A wet glass is beside it.','There is water on the table.'],question:'What most likely happened?',options:['Someone poured a drink.','The bottle is full.','The table was painted.'],answer:0,explain:'The wet glass and water on the table suggest someone poured a drink.'},
      {title:'Ready for rain',clues:['Dark clouds cover the sky.','People are opening umbrellas.','The wind is getting stronger.'],question:'What are people probably expecting?',options:['A sunny picnic.','Rain or a storm.','Snow indoors.'],answer:1,explain:'Dark clouds, umbrellas and stronger wind suggest rain may be coming.'}
    ],
    maze:[
      {target:'book',options:['book','boot','look','back'],explain:'Book ends with /k/. Listen for the final consonant.'},
      {target:'ship',options:['sheep','ship','shop','chip'],explain:'Ship has the short /ɪ/ vowel, unlike sheep with /iː/.'},
      {target:'light',options:['late','right','light','let'],explain:'Light begins with /l/ and ends with the /t/ sound.'}
    ]
  };
  const challengeRounds = {
    odd:[
      {prompt:'Which word does not belong?',why:'Use the precise relationship, not a superficial similarity.',words:['ambiguous','unclear','equivocal','unambiguous'],answer:3,explain:'Ambiguous, unclear and equivocal describe uncertainty or more than one meaning. Unambiguous means clear.'},
      {prompt:'Which word does not belong?',why:'Distinguish a cause from its result.',words:['drought','aridity','dehydration','flood'],answer:3,explain:'Drought, aridity and dehydration involve a lack of water. A flood is an excess of water.'},
      {prompt:'Which word does not belong?',why:'Notice the grammatical role.',words:['reluctantly','carefully','silently','reluctant'],answer:3,explain:'Reluctantly, carefully and silently are adverbs. Reluctant is an adjective.'}
    ],
    translator:[
      {ar:'لو كنت أعلم، لأخبرتك.',prompt:'Choose the accurate English sentence.',options:['If I knew, I will tell you.','If I had known, I would have told you.','If I have known, I told you.'],answer:1,explain:'This describes an unreal past condition: “If I had known, I would have told you.”'},
      {ar:'رغم أنه كان متعبًا، واصل العمل.',prompt:'Choose the most natural English sentence.',options:['Despite he was tired, he continued working.','Although he was tired, he continued working.','Despite of tired, he continued work.'],answer:1,explain:'“Although” is followed by a clause. “Despite” is followed by a noun or -ing form.'},
      {ar:'كان من المفترض أن تصل الآن.',prompt:'Choose the accurate English sentence.',options:['You were supposed to arrive by now.','You supposed arrive now.','You are suppose to arrived now.'],answer:0,explain:'“Were supposed to” expresses an expectation or arrangement that should have happened.'}
    ],
    detective:[
      {title:'The delayed train',clues:['The platform display changed from “On time” to “Delayed”.','An announcement mentions a signal problem ahead.','No train has arrived on this platform yet.'],question:'Which conclusion is best supported?',options:['The train is delayed, likely because of a signalling issue.','The railway has closed permanently.','The train has already passed without stopping.'],answer:0,explain:'The changed display and announcement support a delay linked to signalling. The other claims go beyond the evidence.'},
      {title:'The contradictory report',clues:['A report says the lab was empty at 8:00.','An access log records a staff entry at 7:55.','The report was written from a camera feed that was offline until 8:10.'],question:'What is the strongest inference?',options:['The report may not reliably establish who was in the lab at 8:00.','The access log must be fake.','The lab was definitely empty.'],answer:0,explain:'Because the camera feed was offline, the report cannot reliably verify occupancy at 8:00.'},
      {title:'The missing data',clues:['Three measurements rise together.','A sensor warning appears before the final measurement.','The final value is far outside the normal range.'],question:'What should an investigator do first?',options:['Accept the last value without checking.','Check sensor status and verify the measurement.','Delete all earlier measurements.'],answer:1,explain:'The warning and outlier call for validation before drawing a conclusion.'}
    ],
    maze:[
      {target:'thought',options:['taught','though','thought','through'],explain:'Thought ends with /t/. Replay and compare the full vowel and final sound.'},
      {target:'sheet',options:['seat','sheet','cheat','ship'],explain:'Sheet starts with /ʃ/ (“sh”) and has a long /iː/ vowel.'},
      {target:'world',options:['word','worry','world','would'],explain:'World contains the /ɜːr/ or /ɝ/ vowel and ends with /ld/.'}
    ]
  };
  // Curated common English words. A generated puzzle is only shown if graph search finds a valid route.
  const ladderWordBank = new Set(`
cat bat bet bed bad bag bog dog cot dot hot pot top mop map cap cop cup cut
cold cord card ward warm word worm form farm harm hard bard bald bold ball fall fell feel feet meet meat heat head heal teal tell tall tail
belt bell care dare date late gate game came same sale pale pail pall poll pole pool cool cook book boot boat coat cost cast
sand band bend bent sent send tend tent test best vest west went want pant part cart case cash dash dish fish wish wash goat
ring sing sink silk milk mild wild will wall walk talk tale tame time lime line wine wind mind mine fine fire five hive have hate
make take lake like tide ride side site bite bike hike hide wide wife wise rise rice nice nine pine pane pain pair fair fail call calm palm
bark dark core hand land lane data duty melt`
    .trim().split(/\s+/));
  function ladderDiffersByOne(a, b) {
    return a.length === b.length && a !== b && [...a].filter((ch, i) => ch !== b[i]).length === 1;
  }
  function findLadderPath(start, goal, blocked = new Set()) {
    if (start === goal) return [start];
    const queue = [[start]], visited = new Set([start]);
    while (queue.length) {
      const path = queue.shift(), last = path[path.length - 1];
      for (const candidate of ladderWordBank) {
        if (visited.has(candidate) || (blocked.has(candidate) && candidate !== goal) || !ladderDiffersByOne(last, candidate)) continue;
        const next = [...path, candidate];
        if (candidate === goal) return next;
        visited.add(candidate);
        queue.push(next);
      }
    }
    return null;
  }
  function generateWordLadders(level, count = 12) {
    const minSteps = level === 'challenge' ? 3 : 1;
    const maxSteps = level === 'guided' ? 3 : level === 'challenge' ? 7 : 5;
    const candidates = [], words = [...ladderWordBank];

    // Run one BFS per start word, then reuse its shortest paths for every goal.
    // The old nested start/goal loop ran a fresh BFS for each pair and froze the UI.
    for (const start of words) {
      const queue = [start];
      const previous = new Map([[start, null]]);
      const distance = new Map([[start, 0]]);

      while (queue.length) {
        const current = queue.shift();
        for (const candidate of words) {
          if (previous.has(candidate) || !ladderDiffersByOne(current, candidate)) continue;
          previous.set(candidate, current);
          distance.set(candidate, distance.get(current) + 1);
          queue.push(candidate);
        }
      }

      for (const goal of words) {
        if (start === goal || start.length !== goal.length || !distance.has(goal)) continue;
        const steps = distance.get(goal);
        if (steps < minSteps || steps > maxSteps) continue;

        const path = [];
        for (let word = goal; word !== null; word = previous.get(word)) path.push(word);
        path.reverse();
        candidates.push({
          start, goal, path: path.slice(1),
          hint: 'Change one letter at a time. Use real words and keep a route open to the goal.',
          explain: path.join(' → ') + ' is one valid route. Each move changes exactly one letter.'
        });
      }
    }

    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const chosen = [], pairs = new Set();
    for (const item of candidates) {
      const key = item.start + ':' + item.goal;
      if (pairs.has(key)) continue;
      chosen.push(item);
      pairs.add(key);
      if (chosen.length >= count) break;
    }
    return chosen.length >= Math.min(6, count) ? chosen : [...rounds.wordladder];
  }
  function getRoundPool(id, selectedLevel) {
    const level = selectedLevel || difficultyForMode(id).level;
    if (id === 'odd' && window.EPIPHANY_ODD_ONE_OUT_BANK) {
      const bridge = window.EpiphanyThinkLab;
      const cefr = bridge && typeof bridge.getCEFRLevel === 'function' ? bridge.getCEFRLevel() : 'A1';
      const trainingMode = ['guided','steady','challenge'].includes(level) ? level : 'steady';
      const selected = window.EPIPHANY_ODD_ONE_OUT_BANK.selectRound(cefr, trainingMode);
      const relationshipLabels = {
        'category':'Category','function':'Function','synonyms-antonyms':'Synonyms & antonyms',
        'part-whole':'Part & whole','word-class':'Word class','cause-effect':'Cause & effect',
        'contextual-meaning':'Contextual meaning','collocations':'Collocations',
        'register-tone':'Register & tone','connotation':'Connotation'
      };
      return selected.questions.map(item => ({
        ...item,
        cefrLevel:selected.level,
        trainingMode,
        relationshipLabel:relationshipLabels[item.relationship] || item.relationship,
        why:trainingMode === 'guided'
          ? 'Choose the word that does not fit the shared relationship.'
          : trainingMode === 'challenge'
            ? 'Look for the most precise relationship, not a superficial similarity. ' + item.context
            : item.context
      }));
    }
    if (id === 'translator') {
      const bridge = window.EpiphanyThinkLab;
      const adaptiveLevel = bridge && typeof bridge.getCEFRLevel === 'function' ? bridge.getCEFRLevel() : 'A1';
      const requestedLevel = selectedTranslatorCEFR === 'adaptive' ? adaptiveLevel : selectedTranslatorCEFR;
      const chosenLevel = translatorBanks[requestedLevel] ? requestedLevel : 'A1';
      const bank = translatorBanks[chosenLevel];
      const selectedMode = ['guided','steady','challenge'].includes(level) ? level : 'steady';
      const roundSize = {guided:8,steady:10,challenge:12}[selectedMode] || 10;
      const questions = bank[selectedMode].slice().sort(() => Math.random() - 0.5);
      return questions.slice(0,roundSize).map(item => ({...item, cefrLevel:chosenLevel, trainingMode:selectedMode}));
    }
    if (level === 'guided' && guidedRounds[id]) return guidedRounds[id];
    if (level === 'challenge' && challengeRounds[id]) return challengeRounds[id];
    if (id === 'wordladder') return generateWordLadders(level, 12);
    if (['forge','connections','scramble','chain'].includes(id)) return rounds[id];
    return rounds[id];
  }

  function oddRelationshipHint(relationship) {
    const hints = {
      'category':'Check whether three items belong to one clear group.',
      'function':'Ask what the items are used for; the outsider has a different purpose.',
      'synonyms-antonyms':'Compare the meanings and notice which words share a close meaning or contrast.',
      'part-whole':'Look for three components that can belong to one larger whole.',
      'word-class':'Compare grammatical roles, not just topic or meaning.',
      'cause-effect':'Look for a cause and its likely effects.',
      'contextual-meaning':'Use the situation to compare the intended sense of each word.',
      'collocations':'Test which words form natural, established combinations.',
      'register-tone':'Compare formality and emotional tone.',
      'connotation':'Notice positive, neutral or negative associations.'
    };
    return hints[relationship] || 'Compare the relationship shared by three of the words.';
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const games = [
    {id:'odd',num:'01',icon:'◈',name:'Odd One Out',tag:'PATTERN RECOGNITION',desc:'Spot the outsider, then explain the relationship that connects the others.',time:'2–3 min'},
    {id:'detective',num:'02',icon:'⌕',name:'The Language Detective',tag:'INVESTIGATION & REASONING',desc:'Study case evidence, compare accounts and write a conclusion that stays within what the facts support.',time:'5–10 min'},
    {id:'translator',num:'03',icon:'⇄',name:'The Bold Translator',tag:'NATURAL ENGLISH',desc:'Choose the sentence a real speaker would use—not a word-for-word translation.',time:'2–3 min'},
    {id:'wordladder',num:'04',icon:'↗',name:'Word Ladder',tag:'SPELLING & LOGIC',desc:'Transform one word into another, changing just one letter per step.',time:'3–5 min'},
    {id:'maze',num:'05',icon:'⌁',name:'The Sound Maze',tag:'LISTENING & PRONUNCIATION',desc:'Listen to the target word and find the matching word to move through the maze.',time:'2–3 min'},
    {id:'connections',num:'06',icon:'▦',name:'Word Connections',tag:'CATEGORIES & PATTERNS',desc:'Find the category that connects a group of four words.',time:'2–3 min'},
    {id:'scramble',num:'07',icon:'↔',name:'Sentence Scramble',tag:'SENTENCE BUILDING',desc:'Study mixed-up words and identify the natural English sentence.',time:'2–4 min'},
    {id:'forge',num:'08',icon:'✳',name:'Word Forge',tag:'SPELLING & VOCABULARY',desc:'Use a letter set and a clue to identify the word.',time:'2–3 min'},
    {id:'chain',num:'09',icon:'⤳',name:'Chain Reaction',tag:'WORD ASSOCIATION',desc:'Continue a chain by choosing the strongest word association.',time:'2–3 min'}
  ];
  function insightsMarkup() {
    const data = window.EpiphanyThinkLab && typeof window.EpiphanyThinkLab.getInsights === 'function'
      ? window.EpiphanyThinkLab.getInsights() : null;
    const skills = data && Array.isArray(data.skills) ? data.skills : [
      {id:'vocabulary',label:'Vocabulary',attempts:0,accuracy:null},
      {id:'grammar',label:'Grammar',attempts:0,accuracy:null},
      {id:'listening',label:'Listening',attempts:0,accuracy:null},
      {id:'conversation',label:'Natural expression',attempts:0,accuracy:null},
      {id:'reading',label:'Reading & inference',attempts:0,accuracy:null},
      {id:'spelling',label:'Spelling & word logic',attempts:0,accuracy:null}
    ];
    const focus = data && data.focus ? data.focus : {id:'vocabulary',label:'Vocabulary',game:'odd',hint:'Start with a short pattern challenge to establish your baseline.',attempts:0,accuracy:null,reason:'Your first challenges will establish a starting point.'};
    const measured = skills.filter(x=>x.attempts>0).length;
    const total = data ? data.totalAttempts : 0;
    const correct = data ? data.totalCorrect : 0;
    const bar = skills.map(skill => {
      const value = skill.accuracy === null ? 0 : skill.accuracy;
      const stateLabel = skill.attempts === 0 ? 'Not tested' : skill.accuracy + '% · ' + skill.attempts + ' answers';
      return '<div class="tl-skill-row"><div class="tl-skill-label"><span>'+esc(skill.label)+'</span><b>'+(skill.accuracy===null?'—':skill.accuracy+'%')+'</b></div><div class="tl-skill-track" role="img" aria-label="'+esc(skill.label)+': '+esc(stateLabel)+'"><span style="width:'+value+'%"></span></div><small>'+esc(stateLabel)+'</small></div>';
    }).join('');
    return '<section class="tl-mastery" aria-labelledby="tl-mastery-title"><div class="tl-section-heading"><div><span class="tl-eyebrow">YOUR LEARNING SIGNALS</span><h3 id="tl-mastery-title">Skill map</h3><p>Accuracy is based on your recorded answers—not a guess about your overall English level.</p></div><div class="tl-mastery-count"><b>'+total+'</b><span>answers tracked</span></div></div><div class="tl-mastery-grid"><div class="tl-skill-list">'+bar+'</div><aside class="tl-recommendation"><span class="tl-recommendation-mark">↗</span><span class="tl-case-tag">YOUR NEXT CHALLENGE</span><h4>'+esc(focus.label)+'</h4><p>'+esc(focus.hint)+'</p><div class="tl-recommendation-stat">'+(focus.attempts ? (focus.accuracy+'% accuracy · '+focus.attempts+' answers') : 'Baseline not measured yet')+'</div><p class="tl-recommendation-reason">'+esc(focus.reason)+'</p><button type="button" class="tl-next" data-think-recommended="'+esc(focus.game)+'">Train this skill ↗</button></aside></div><p class="tl-mastery-foot">'+(total ? 'So far: '+correct+' correct out of '+total+'. Keep practising to make the map more reliable.' : 'Your map will fill in as you answer challenges. Skills without data are marked “Not tested”.')+'</p></section>';
  }
  function landing() {
    mode = null;
    root.innerHTML = '<div class="tl-mission"><div><span class="tl-eyebrow"><i></i> THINKING MODE · ENGLISH INSIDE</span><h2>Don’t just play.<br><em>Figure it out.</em></h2><p>Every challenge is a small case to solve. Notice patterns, connect evidence and discover why one answer fits better than another.</p><div class="tl-mission-meta"><span>⌁ Logic</span><span>◉ Context</span><span>⇄ Expression</span></div></div><div class="tl-orbit" aria-hidden="true"><span class="tl-orbit-core">EP<span>·</span></span><i class="tl-node tl-node-a">?</i><i class="tl-node tl-node-b">A≠B</i><i class="tl-node tl-node-c">∴</i><i class="tl-link tl-link-a"></i><i class="tl-link tl-link-b"></i></div></div>'+insightsMarkup()+'<div class="tl-daily"><div><span class="tl-eyebrow">YOUR FIRST CASE</span><h3>Three ways to think in English</h3><p>Choose a challenge. You’ll get feedback that explains the reasoning, not just a green tick.</p></div><span class="tl-case-stamp">CASE FILE<br><b>001—003</b></span></div><div class="tl-cases">'+games.map(g=>'<button type="button" class="tl-case" data-think-game="'+g.id+'"><span class="tl-case-top"><span class="tl-case-number">'+g.num+' / CASE</span><span class="tl-case-icon">'+g.icon+'</span></span><span class="tl-case-tag">'+g.tag+'</span><strong>'+g.name+'</strong><span class="tl-case-desc">'+g.desc+'</span><span class="tl-case-bottom"><span>'+g.time+'</span><b>Open case ↗</b></span></button>').join('')+'</div><p class="tl-footer-note"><span>✳</span> No guessing blindly. Every answer comes with a reason.</p>';
  }
  // Register each game against the shared adaptive policy. New games should add
  // one entry here; difficulty thresholds, confidence and hint calibration remain central.
  const gameSkills = {odd:'vocabulary', detective:'reading', translator:'conversation', maze:'listening', wordladder:'spelling', forge:'spelling', connections:'vocabulary', scramble:'grammar', chain:'vocabulary'};
  Object.keys(gameSkills).forEach(id => {
    if (window.EpiphanyThinkLab && typeof window.EpiphanyThinkLab.registerGame === 'function') {
      window.EpiphanyThinkLab.registerGame(id, gameSkills[id]);
    }
  });
  function difficultyForMode(id) {
    const skill = gameSkills[id] || 'vocabulary';
    if (window.EpiphanyThinkLab && typeof window.EpiphanyThinkLab.getGameDifficulty === 'function') {
      return window.EpiphanyThinkLab.getGameDifficulty(id, skill);
    }
    return window.EpiphanyThinkLab && typeof window.EpiphanyThinkLab.getDifficulty === 'function'
      ? window.EpiphanyThinkLab.getDifficulty(skill) : {level:'guided',hintLevel:1,attempts:0,accuracy:null,confidence:'low'};
  }
  function adaptiveHint(id) {
    const level = difficultyForMode(id).hintLevel;
    if (level <= 0) return '';
    const hints = {
      odd: level >= 2 ? 'Hint: compare the role or meaning of each word, not just how it looks.' : 'Hint: group the words that share the closest relationship.',
      translator: level >= 2 ? 'Hint: English often uses a common phrase rather than copying each Arabic word directly.' : 'Hint: look for a natural sentence pattern and the correct verb form.',
      detective: level >= 2 ? 'Hint: choose the explanation supported by the most clues, not simply one that could be true.' : 'Hint: connect at least two clues before deciding.',
      maze: level >= 2 ? 'Hint: listen for both the first sound and the ending; replay the word slowly.' : 'Hint: compare the sounds at the beginning and end.',
      wordladder: level >= 2 ? 'Hint: compare your current word with the next step; exactly one letter must change.' : 'Hint: change one letter and check whether the result is a real word.',
      forge: level >= 2 ? 'Hint: use the letter set and clue together; do not add extra letters.' : 'Hint: say the letters aloud and match them to the clue.',
      connections: level >= 2 ? 'Hint: look for the most precise shared category.' : 'Hint: think about what all four words have in common.',
      scramble: level >= 2 ? 'Hint: find the subject and verb first, then check word order.' : 'Hint: start with who or what the sentence is about.',
      chain: level >= 2 ? 'Hint: choose the most direct association, not merely a related topic.' : 'Hint: what word naturally comes to mind next?'
    };
    return hints[id] || '';
  }
  const ladderMeanings = {
    cat:'A small domesticated animal often kept as a pet.',
    cot:'A small bed, often used for a baby or for camping.',
    dot:'A very small round mark or spot.',
    dog:'A common domesticated animal often kept as a pet.',
    cold:'Having a low temperature; not warm.',
    cord:'A long, thin piece of string, rope, or insulated wire.',
    card:'A piece of thick paper used for writing, identification, or playing games.',
    ward:'A section of a hospital, or a person under another person’s legal care.',
    warm:'Having a comfortably high temperature; not cold.',
    head:'The part of the body that contains the brain, eyes, ears, nose, and mouth.',
    heal:'To become healthy again, or to make an injury or illness better.',
    teal:'A blue-green colour.',
    tell:'To give information to someone using words.',
    tall:'Having greater than average height.',
    tail:'The part that extends from the back of an animal’s body.',
    fall:'To drop down or move towards the ground.',
    ball:'A round object used in many games and sports.',
    bell:'A hollow metal object that makes a ringing sound when struck.',
    belt:'A strip worn around the waist, or a band that transfers motion in machinery.',
    melt:'To become liquid because of heat.',
    make:'To create, build, or produce something.',
    take:'To get or carry something with you.',
    tame:'Not wild; trained to live with or be handled by people.',
    time:'What we measure in seconds, minutes, and hours.',
    sand:'Loose grains of rock often found on beaches and in deserts.',
    band:'A group of musicians, or a narrow strip of material.',
    bend:'To curve or cause something to curve.',
    bent:'Curved rather than straight; also the past tense of bend.',
    sent:'Past tense of send; caused something to go to someone or somewhere.',
    ring:'A circular piece of jewellery, or the sound of a bell.',
    sing:'To make musical sounds with the voice.',
    sink:'To go down below the surface of water or another liquid.',
    silk:'A fine, soft thread or fabric produced by silkworms.',
    milk:'A white liquid produced by mammals to feed their young.',
    hate:'To strongly dislike someone or something.',
    have:'To own, hold, or experience something.',
    hive:'A structure where bees live.',
    five:'The number after four and before six.',
    cast:'To throw something, or a group of actors in a production.',
    cost:'The amount of money needed to buy or do something.',
    coat:'An outer piece of clothing worn for warmth or protection.',
    bark:'The outer covering of a tree; also the sound a dog makes.',
    dark:'Having little or no light.',
    dare:'To be brave enough to do something, or to challenge someone.',
    care:'The act of looking after someone or something; attention or concern.',
    wind:'Moving air; pronounced differently from the verb meaning to twist.',
    wine:'An alcoholic drink made from fermented grapes.',
    line:'A long, narrow mark or a row of people or things.',
    lime:'A small green citrus fruit, or a substance used in building.',
    like:'To enjoy or find something pleasant.',
    late:'After the expected or usual time.',
    date:'A particular day on a calendar; also a social meeting.',
    came:'Past tense of come.',
    game:'An activity played for fun, competition, or practice.',
    gate:'A movable barrier used to close an entrance.',
    book:'A set of written or printed pages bound together.',
    cook:'To prepare food using heat.',
    cool:'Slightly cold; also informal for stylish or impressive.',
    pool:'A small area of still water, or a game played with cue sticks.',
    poll:'A survey that collects people’s opinions or votes.',
    pall:'A cloth spread over a coffin; less commonly, something that casts a gloomy feeling.',
    pail:'A bucket, usually with a handle.',
    pane:'A single sheet or section of glass in a window.',
    pine:'An evergreen tree with needle-like leaves.',
    bat:'A small flying mammal, or a shaped piece of wood used in sports.',
    bet:'To risk money or something valuable on the result of an event.',
    bed:'A piece of furniture used for sleeping.',
    bad:'Not good; unpleasant or of poor quality.',
    bag:'A container made of flexible material, used to carry things.',
    bog:'Wet, soft ground made of decaying plants.',
    hot:'Having a high temperature.',
    pot:'A deep container used for cooking or holding plants.',
    top:'The highest part of something.',
    mop:'A tool with absorbent strands used to clean floors.',
    map:'A drawing that shows places and where they are.',
    cap:'A soft or hard covering worn on the head.',
    cop:'An informal word for a police officer.',
    cup:'A small container used for drinking.',
    cut:'To divide or open something with a sharp tool.',
    word:'A single unit of language with meaning.',
    worm:'A small, long-bodied animal with no legs.',
    form:'The shape or structure of something; also a document to fill in.',
    farm:'Land used to grow crops or raise animals.',
    harm:'Physical injury or damage.',
    hard:'Firm, difficult, or requiring a lot of effort.',
    bard:'A poet, especially one who writes or sings about heroic stories.',
    bald:'Having little or no hair on the head.',
    bold:'Confident and willing to take risks; easy to notice.',
    fell:'Past tense of fall; moved down to the ground.',
    feel:'To experience an emotion or physical sensation.',
    feet:'The plural of foot, the body part used for standing and walking.',
    meet:'To come together with someone.',
    meat:'The flesh of an animal used as food.',
    heat:'High temperature or the energy that makes something warmer.',
    goat:'A farm animal with horns that can climb well.',
    best:'Better than all others; the highest quality.',
    vest:'A sleeveless piece of clothing worn on the upper body.',
    west:'The direction where the sun sets.',
    went:'Past tense of go; travelled to a place.',
    want:'To wish to have or do something.',
    pant:'To breathe quickly and heavily, often after exercise.',
    part:'A piece or section of a larger thing.',
    cart:'A vehicle with wheels used to carry goods.',
    case:'An instance or situation; also a container for an item.',
    cash:'Money in coins or notes.',
    dash:'To move quickly, or a short horizontal mark.',
    dish:'A plate or container for food; also food prepared in a particular way.',
    fish:'An animal that lives in water and breathes through gills.',
    wish:'To want something to happen or be true.',
    wash:'To clean with water and usually soap.',
    send:'To cause something to go to a person or place.',
    tend:'To regularly care for or look after something.',
    tent:'A portable shelter made of fabric.',
    test:'A way to check knowledge, quality, or performance.',
    mild:'Not strong, severe, or intense.',
    wild:'Living or growing naturally, not controlled by people.',
    will:'Used to talk about the future; also the ability to choose.',
    wall:'A vertical structure that divides or surrounds an area.',
    walk:'To move on foot at a regular pace.',
    talk:'To say words in order to communicate.',
    tale:'A story, often about events or adventures.',
    lake:'A large area of water surrounded by land.',
    tide:'The regular rise and fall of sea levels.',
    ride:'To travel on or in a bicycle, horse, or vehicle.',
    side:'One of the surfaces or edges of something; also a position.',
    site:'A place where something is located or built.',
    bite:'To cut or grip with the teeth.',
    bike:'A bicycle; a vehicle with two wheels powered by pedals.',
    hike:'A long walk, especially in the countryside or hills.',
    hide:'To put something where it cannot easily be seen.',
    wide:'Measuring a large distance from one side to the other.',
    wife:'A married woman in relation to her spouse.',
    wise:'Showing good judgement based on knowledge and experience.',
    rise:'To move upward or increase.',
    rice:'Small grains used as food, from a cereal plant.',
    nice:'Pleasant, kind, or enjoyable.',
    nine:'The number after eight and before ten.',
    pain:'A physical feeling of suffering or discomfort.',
    pair:'Two things that belong together or are used together.',
    fair:'Treating people equally; also an event with stalls and entertainment.',
    fail:'To not succeed in doing something.',
    call:'To speak to someone by phone or shout to get attention.',
    calm:'Peaceful and not showing strong emotion.',
    core:'The central or most important part of something.',
    hand:'The body part at the end of the arm, used for holding things.',
    land:'The solid surface of the Earth; also to arrive on the ground.',
    lane:'A narrow road or a marked strip for traffic.',
    same:'Identical; not different.',
    mind:'The part of a person that thinks, remembers, and feels.',
    mine:'Belonging to me; also a place where minerals are dug from the ground.',
    fine:'Good or satisfactory; also a small amount of money paid as a penalty.',
    fire:'Heat and light produced when something burns.',
    palm:'The inner surface of the hand between the wrist and fingers.',
    data:'Facts or information collected for reference or analysis.',
    duty:'Something a person is expected or required to do.',
    boot:'A sturdy shoe that covers the foot and often the ankle.',
    boat:'A small vessel used for travelling on water.',
    sale:'An event or period when goods are sold, often at reduced prices.',
    pale:'Light in colour, or having less colour than usual.',
    pole:'A long, straight, cylindrical piece of material.'
  };
  function nextLadderWord(item, path) {
    const current = path[path.length - 1] || item.start;
    const route = findLadderPath(current, item.goal, new Set(path.slice(0, -1)));
    return route && route.length > 1 ? route[1] : null;
  }
  function forgeBoard(item) {
    const chars=[...item.letters];
    return '<div class="tl-forge-board"><div class="tl-forge-slots" aria-label="Word answer slots">'+forgePlaced.map((tile,i)=>'<button type="button" class="tl-puzzle-slot '+(tile===null?'is-empty':'is-filled')+'" data-forge-slot="'+i+'" draggable="'+(tile!==null)+'" aria-label="Letter slot '+(i+1)+'">'+(tile===null?'':esc(chars[tile]))+'</button>').join('')+'</div><div class="tl-forge-letters" aria-label="Available letter tiles">'+chars.map((ch,i)=>'<button type="button" class="tl-letter-tile" data-forge-tile="'+i+'" draggable="'+(!forgePlaced.includes(i))+'" '+(forgePlaced.includes(i)||locked?'disabled':'')+'>'+esc(ch)+'</button>').join('')+'</div><p class="tl-puzzle-help">Drag a letter into a slot, or tap a letter and then a slot. Tap a placed letter to return it.</p></div>';
  }
  function scrambleBoard(item) {
    return '<div class="tl-scramble-board"><div class="tl-scramble-slots" aria-label="Sentence word slots">'+scramblePlaced.map((tile,i)=>'<button type="button" class="tl-puzzle-slot tl-word-slot '+(tile===null?'is-empty':'is-filled')+'" data-scramble-slot="'+i+'" draggable="'+(tile!==null)+'" aria-label="Word position '+(i+1)+'">'+(tile===null?'':esc(item.words[tile]))+'</button>').join('')+'</div><div class="tl-scramble-bank" aria-label="Available word tiles">'+item.words.map((word,i)=>'<button type="button" class="tl-word-chip" data-scramble-tile="'+i+'" draggable="'+(!scramblePlaced.includes(i))+'" '+(scramblePlaced.includes(i)||locked?'disabled':'')+'>'+esc(word)+'</button>').join('')+'</div><p class="tl-puzzle-help">Drag words into position, or tap a word and then a slot. Tap a placed word to return it.</p></div>';
  }
  function refreshPuzzleBoard(kind) {
    const board=root.querySelector(kind==='forge'?'.tl-forge-board':'.tl-scramble-board');
    const pool=activePool||getRoundPool(mode),item=pool[index%pool.length];
    if(board)board.outerHTML=kind==='forge'?forgeBoard(item):scrambleBoard(item);
  }
  function placePuzzleTile(kind,tileIndex,slotIndex) {
    const placed=kind==='forge'?forgePlaced:scramblePlaced;
    if(locked||placed.includes(tileIndex)||slotIndex<0||slotIndex>=placed.length)return;
    if(placed[slotIndex]!==null)return;
    const empty=placed.indexOf(null);
    placed[empty===-1?slotIndex:slotIndex]=tileIndex;
    refreshPuzzleBoard(kind);
  }
  function renderGame() {
    const pool = activePool || getRoundPool(mode);
    const item = pool[index % pool.length];
    const difficulty = activeDifficulty || difficultyForMode(mode);
    const roundTarget = {guided:8,steady:10,challenge:12}[difficulty.level] || 10;
    const roundNote = mode === 'odd' && pool.length < roundTarget
      ? '<p class="tl-game-instruction">This round is shorter than the '+roundTarget+'-question target because only '+pool.length+' distinct questions are currently available at this level.</p>'
      : '';
    locked = false;
    if(mode==='wordladder'&&!ladderPath.length)ladderPath=[item.start];
    let intro = '';
    if (mode === 'odd') intro = '<div class="tl-word-options">'+item.words.map((w,i)=>'<button type="button" class="tl-option tl-word-option" data-think-answer="'+i+'"><span class="tl-option-index">0'+(i+1)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>'+(difficulty.level === 'guided' ? '<div class="tl-odd-hint"><button type="button" class="tl-secondary" data-odd-hint>Reveal a hint</button><p class="tl-game-instruction" data-odd-hint-text hidden></p></div>' : '');
    if (mode === 'translator') intro = '<div class="tl-translation-prompt" lang="ar" dir="rtl">'+esc(item.ar)+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div><div class="tl-odd-hint"><button type="button" class="tl-secondary" data-translator-hint>Reveal a hint</button><p class="tl-game-instruction" data-translator-hint-text hidden></p></div>';
    if (mode === 'wordladder') {
      const path = ladderPath.length ? ladderPath : [item.start];
      const currentWord = path[path.length - 1] || item.start;
      const nextWord = nextLadderWord(item, path);
      const nextMeaning = nextWord ? ladderMeanings[nextWord] : null;
      const changedAt = nextWord ? [...currentWord].findIndex((letter, i) => letter !== nextWord[i]) : -1;
      const letterPosition = changedAt === 0 ? 'first' : changedAt === currentWord.length - 1 ? 'last' : changedAt === 1 ? 'second' : changedAt === 2 ? 'third' : changedAt >= 0 ? 'fourth' : '';
      const activeHint = path[path.length - 1] !== item.goal && nextWord
        ? (nextMeaning
          ? 'Next-step hint: change the ' + letterPosition + ' letter to make a word meaning “' + nextMeaning + '”.'
          : 'Next-step hint: change the ' + letterPosition + ' letter. The new word must be real and keep a route to the goal.')
        : item.hint;
      intro = '<div class="tl-ladder-targets"><div><span>START</span><strong>'+esc(item.start)+'</strong></div><span class="tl-ladder-arrow">→</span><div><span>GOAL</span><strong>'+esc(item.goal)+'</strong></div></div><p class="tl-ladder-hint">'+esc(activeHint)+'</p><div class="tl-ladder-path">'+path.map((w,i)=>'<span class="tl-ladder-word '+(i===path.length-1?'is-current':'')+'">'+esc(w)+'</span>').join('<span class="tl-ladder-step">↓</span>')+'</div>'+(ladderWordNote?'<aside class="tl-ladder-meaning" aria-live="polite"><strong>'+esc(ladderWordNote.word)+'</strong><p>'+esc(ladderWordNote.meaning||'No definition is available for this word yet.')+'</p></aside>':'')+(path[path.length-1]===item.goal?'<p class="tl-ladder-success">Ladder complete! Every move is valid.</p>':'<form class="tl-ladder-form" data-think-ladder-form><label for="tl-ladder-input">Next word</label><div><input id="tl-ladder-input" name="ladder-word" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the next word" required><button class="tl-next" type="submit">Make move →</button></div><small>Use a word from the game’s word bank. Change one letter and keep a route open to the goal.</small></form>');
    }
    if (mode === 'forge') { forgePlaced=Array(item.answerWord.length).fill(null); intro='<div class="tl-word-clue"><span>WORD CLUE</span><p>'+esc(item.clue)+'</p></div>'+forgeBoard(item)+'<button class="tl-next" type="button" data-forge-check>Check word →</button><button class="tl-secondary" type="button" data-forge-reset>Reset tiles</button>'; }
    if (mode === 'connections') { connectionSelected=[]; const tiles=connectionTiles(item); intro='<p class="tl-connection-count" aria-live="polite">Select the four words that belong together.</p><div class="tl-connection-grid tl-connection-board">'+tiles.map((w,i)=>'<button type="button" class="tl-connection-word" data-connection-tile="'+i+'" aria-pressed="false">'+esc(w)+'</button>').join('')+'</div><div class="tl-connection-controls"><span data-connection-count>0 / 4 selected</span><button class="tl-next" type="button" data-connection-check>Check group →</button><button class="tl-secondary" type="button" data-connection-reset>Clear selection</button></div>'; }
    if (mode === 'scramble') { scramblePlaced=Array(item.words.length).fill(null); intro=scrambleBoard(item)+'<button class="tl-next" type="button" data-scramble-check>Check sentence →</button><button class="tl-secondary" type="button" data-scramble-reset>Reset words</button>'; }
    if (mode === 'chain') { const steps=chainSteps(item),step=steps[chainStepIndex]; const path=[(item.prompt.match(/chain: ([A-Z]+) →/)||[])[1]||'WORD',...chainPath]; intro='<div class="tl-chain-path">'+path.map((w,i)=>'<span class="tl-chain-link">'+esc(w)+'</span>').join('<span class="tl-ladder-step"> → </span>')+'<span class="tl-ladder-step"> → ?</span></div><p class="tl-connection-count">LINK '+(chainStepIndex+1)+' OF '+steps.length+' · Connect “'+esc(step.from)+'” to the strongest next word.</p><div class="tl-answer-options">'+step.options.map((w,i)=>'<button type="button" class="tl-option" data-chain-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>'; }
    if (mode === 'maze') intro = '<div class="tl-maze-target"><span class="tl-maze-sound">♫</span><div><span>LISTEN FOR THIS WORD</span><strong>Find the matching word</strong></div><button type="button" class="tl-secondary" data-think-speak>▶ Play word</button></div><div class="tl-maze-path"><span class="tl-maze-start">START</span><span>···</span><span class="tl-maze-finish">EXIT</span></div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'detective') intro = '<div class="tl-clue-list">'+item.clues.slice(0,Math.min(item.clues.length,clueCount+1+(difficulty.hintLevel>=2?1:0))).map((c,i)=>'<div class="tl-clue"><span>CLUE 0'+(i+1)+'</span><p>'+esc(c)+'</p></div>').join('')+'</div><div class="tl-reveal-row">'+(clueCount<item.clues.length-1?'<button class="tl-secondary" type="button" data-think-clue>Reveal next clue +</button>':'<span class="tl-all-clues">All evidence revealed</span>')+'</div><h3 class="tl-question">'+item.question+'</h3><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← All cases</button><span class="tl-eyebrow">CASE '+String(index+1).padStart(2,'0')+' / '+pool.length+'</span><span class="tl-score">SOLVED <b>'+score+'</b></span></div><div class="tl-game-card"><div class="tl-game-kicker">'+(mode==='odd'?'PATTERN ANALYSIS · '+esc(item.cefrLevel || 'A1'):mode==='detective'?'EVIDENCE BOARD':mode==='translator'?'NATURAL EXPRESSION · '+esc(item.cefrLevel || 'A1'):mode==='wordladder'?'WORD TRANSFORMATION':mode==='forge'?'WORD FORGE':mode==='connections'?'WORD CONNECTIONS':mode==='scramble'?'SENTENCE BUILDING':mode==='chain'?'WORD ASSOCIATION':'LISTENING MAZE')+'</div><div class="tl-level-tag">'+(difficulty.level==='challenge'?'CHALLENGE':difficulty.level==='steady'?'STEADY':'GUIDED')+'</div><h2>'+esc(mode==='detective'?item.title:mode==='wordladder'?'Transform the word':mode==='maze'?'Find the sound path':item.prompt)+'</h2><p class="tl-game-instruction">'+esc(mode==='odd'?item.why:mode==='translator'?'Read the Arabic sentence, then choose the natural English equivalent.':mode==='wordladder'?'Build a chain of real words. Only one letter may change in each move.':mode==='maze'?'Listen carefully, replay the word if needed, then choose the matching spelling.':mode==='forge'?'Use the available letters and clue to build the word yourself.':mode==='connections'?'Select the four tiles that share the category; distractors are mixed into the board.':mode==='scramble'?'Build a natural English sentence from the mixed-up word bank.':mode==='chain'?'Build a three-link association chain. Each choice becomes the starting point for the next link.':'Reveal the clues and select the conclusion they support.')+'</p>'+intro+roundNote+'<div class="tl-feedback" id="tl-feedback" aria-live="polite" hidden></div><div class="tl-game-actions"><span>ROUND '+(index+1)+' OF '+pool.length+'</span><button class="tl-next" type="button" data-think-next hidden>Next round →</button></div></div>';
  }
  function chainSteps(item) {
    const start=(item.prompt.match(/chain: ([A-Z]+) →/)||[])[1]||'WORD';
    const first=item.options[item.answer];
    const links={
      umbrella:[['raincoat',['raincoat','sandwich','hammer'],'A raincoat is another way to stay dry in wet weather.'],['waterproof',['waterproof','sleepy','wooden'],'Raincoats are designed to be waterproof.']],
      library:[['bookshelf',['bookshelf','frying pan','steering wheel'],'Books are commonly stored on bookshelves.'],['reading',['reading','swimming','baking'],'Libraries are strongly associated with reading.']],
      kitchen:[['recipe',['recipe','passport','ladder'],'Recipes guide people through preparing food.'],['ingredients',['ingredients','footprints','headphones'],'A recipe lists the ingredients needed for a dish.']],
      student:[['notebook',['notebook','wrench','pillow'],'Students often use notebooks to take notes.'],['notes',['notes','clouds','coins'],'Notes help students review what they learn.']],
      hospital:[['nurse',['nurse','cashier','pilot'],'Nurses care for patients in hospitals.'],['patient',['patient','customer','passenger'],'A nurse provides care to a patient.']],
      instrument:[['melody',['melody','receipt','ladder'],'Musical instruments can play a melody.'],['song',['song','storm','engine'],'A melody can form part of a song.']],
      honey:[['sweet',['sweet','metallic','silent'],'Honey is known for its sweet taste.'],['sugar',['sugar','stone','paper'],'Sugar is another familiar sweetener.']],
      photograph:[['album',['album','toolbox','kettle'],'Photographs are often collected in an album.'],['memories',['memories','traffic','weather'],'Photographs often help people preserve memories.']],
      scarf:[['wool',['wool','glass','sand'],'Many scarves are made from wool.'],['sheep',['sheep','shark','eagle'],'Wool commonly comes from sheep.']],
      lock:[['door',['door','cloud','spoon'],'Locks are often fitted to doors.'],['key',['key','blanket','candle'],'A key can operate a lock on a door.']],
      flower:[['petal',['petal','engine','ticket'],'A flower is made up of petals and other parts.'],['garden',['garden','garage','airport'],'Flowers are commonly grown in gardens.']],
      luggage:[['suitcase',['suitcase','teapot','pencil'],'A suitcase is a common type of luggage.'],['travel',['travel','whisper','freeze'],'People take luggage when they travel.']],
      brush:[['paint',['paint','bread','rain'],'Painters use brushes to apply paint.'],['color',['color','silence','distance'],'Paint adds color to a surface.']],
      wave:[['beach',['beach','library','factory'],'Waves often reach the beach.'],['sand',['sand','wool','smoke'],'Many beaches have sand.']],
      time:[['clock',['clock','ladle','feather'],'A clock displays the time.'],['alarm',['alarm','recipe','saddle'],'An alarm clock can signal a set time.']],
      borrow:[['return',['return','melt','whistle'],'Borrowed library books are normally returned.'],['library',['library','desert','kitchen'],'Libraries lend books for people to borrow.']],
      smoke:[['fire',['fire','ice','fabric'],'Smoke is commonly associated with fire.'],['heat',['heat','feather','music'],'Fire produces heat as well as smoke.']],
      plant:[['soil',['soil','glass','music'],'Plants often grow in soil.'],['garden',['garden','airport','kitchen'],'Many plants are grown in gardens.']],
      bakery:[['bread',['bread','helmet','cloud'],'Bread is commonly made or sold at a bakery.'],['butter',['butter','steel','cotton'],'Butter is a common food eaten with bread.']],
      lightning:[['storm',['storm','blanket','library'],'Lightning is associated with thunderstorms.'],['rain',['rain','sandwich','keyboard'],'Storms often bring rain.']]
    };
    const extra=links[first]||[['related word',['related word','pillow','engine'],'Think about a familiar connection.'],['next link',['next link','window','spoon'],'Follow the association one step further.']];
    return [{from:start,options:item.options,answer:item.answer,explain:item.explain},...extra.map(([word,options,explain])=>({from:chainPath.length?chainPath[chainPath.length-1]:first,options,answer:options.indexOf(word),explain}))];
  }
  function connectionTiles(item) {
    const target = new Set(item.words.map(w => w.toLowerCase()));
    const distractors = [];
    rounds.connections.forEach(round => {
      if (round === item) return;
      round.words.forEach(word => {
        const key = word.toLowerCase();
        if (!target.has(key) && !distractors.some(w => w.toLowerCase() === key)) distractors.push(word);
      });
    });
    for (let i=distractors.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [distractors[i],distractors[j]]=[distractors[j],distractors[i]]; }
    const tiles = item.words.concat(distractors.slice(0,12));
    for (let i=tiles.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [tiles[i],tiles[j]]=[tiles[j],tiles[i]]; }
    return tiles;
  }
  function speakTarget() { const pool=activePool || getRoundPool('maze');const item=pool[index%pool.length]; if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){const fb=root.querySelector('#tl-feedback');if(fb){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Speech playback is not available in this browser.';}return;} window.speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(item.target); utterance.lang='en-US'; utterance.rate=.82; window.speechSynthesis.speak(utterance); }
  function showDetectiveLoadError(error) {
    if (window.console && typeof window.console.error === 'function') {
      window.console.error('[EPIPHANY] Language Detective initialization failed:', error);
    }
    root.innerHTML = '<div class="tl-game-card"><p>The investigation could not start. One of its modules may have failed to load.</p><button type="button" class="tl-next" data-think-detective-retry>Try again</button><button type="button" class="tl-back" data-think-back>Back to Think Lab</button></div>';
  }
  function showTranslatorLevelPicker() {
    mode = 'translator';
    activePool = null;
    activeDifficulty = difficultyForMode('translator');
    const levels = ['A1','A2','B1','B2','C1','C2'];
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← All cases</button><span class="tl-eyebrow">THE BOLD TRANSLATOR</span></div><div class="tl-game-card"><div class="tl-game-kicker">CHOOSE YOUR PRACTICE LEVEL</div><h2>Where would you like to practise?</h2><p class="tl-game-instruction">Adaptive follows your current learning level. A1 and A2 are available for practice. If your adaptive level does not have a bank yet, the game temporarily uses A1 content. Manual practice does not change your adaptive level.</p><div class="tl-answer-options"><button type="button" class="tl-option" data-translator-level="adaptive"><strong>Adaptive · Recommended</strong><span>Use my current EPIPHANY level</span></button>'+levels.map(level => '<button type="button" class="tl-option" data-translator-level="'+level+'" '+(translatorBanks[level] ? '' : 'disabled')+'><strong>'+level+'</strong><span>'+(translatorBanks[level] ? 'Available' : 'Coming soon')+'</span></button>').join('')+'</div></div>';
  }
  function start(id) {
    if(id==='translator'){selectedTranslatorCEFR='adaptive';showTranslatorLevelPicker();return;}
    mode=id; index=0; score=0; chainStepIndex=0; chainPath=[]; clueCount=0; roundMistakes=0; ladderPath=[]; ladderWordNote=null; ladderMistakeRecorded=false; activeDifficulty=difficultyForMode(id); oddHintStep=0;
    if(id==='detective'){
      activePool=null;
      const open=()=>{
        if(mode!=='detective')return;
        const detective=window.EPIPHANY_LANGUAGE_DETECTIVE;
        if(!detective||detective.available!==true||typeof detective.mount!=='function') {
          throw new Error('Language Detective UI bridge is unavailable after loading its dependencies.');
        }
        detective.mount(root,{onExit:()=>{mode=null;activePool=null;activeDifficulty=null;landing();}});
      };
      if(window.EPIPHANY_LANGUAGE_DETECTIVE&&window.EPIPHANY_LANGUAGE_DETECTIVE.available===true){
        try { open(); } catch(error) { showDetectiveLoadError(error); }
      } else {
        root.innerHTML='<div class="tl-game-card"><p>Preparing the investigation…</p></div>';
        if(typeof window.EPIPHANY_LAZY_LOAD!=='function'||typeof window.EPIPHANY_LAZY_STYLE!=='function'){
          showDetectiveLoadError(new Error('Lazy feature loading is unavailable.'));
          return;
        }
        Promise.all([window.EPIPHANY_LAZY_LOAD('languageDetective'),window.EPIPHANY_LAZY_STYLE('languageDetective')])
          .then(open)
          .catch(showDetectiveLoadError);
      }
      return;
    }
    activePool=getRoundPool(id,activeDifficulty.level); renderGame(); if(id==='maze') speakTarget();
  }
  root.addEventListener('submit', e => {
    const form=e.target.closest('[data-think-ladder-form]');
    if(!form||mode!=='wordladder')return;
    e.preventDefault();if(locked)return;
    const pool=activePool||getRoundPool('wordladder'),item=pool[index%pool.length],input=form.querySelector('input'),word=input.value.trim().toLowerCase(),previous=ladderPath[ladderPath.length-1];
    ladderWordNote={word,meaning:ladderMeanings[word]||null};
    const differs=ladderDiffersByOne(previous,word),alreadyUsed=ladderPath.includes(word);
    const route=findLadderPath(word,item.goal,new Set([...ladderPath,word]));
    const allowed=ladderWordBank.has(word)&&differs&&!alreadyUsed&&!!route;
    if(!allowed){roundMistakes++;const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-wrong';const reason=!differs?'Change exactly one letter from “'+esc(previous)+'”.':!ladderWordBank.has(word)?'That word is not in this game’s curated word bank yet. Try another common English word.':alreadyUsed?'You have already used that word. Choose a new step.':'That move closes off the route to the goal. Try a word that keeps a valid path open.';fb.innerHTML='<strong>Not quite—check the move.</strong><p>'+reason+'</p>'+(ladderWordNote.meaning?'<p><strong>'+esc(word)+':</strong> '+esc(ladderWordNote.meaning)+'</p>':'')+(roundMistakes>=2?'<p>'+esc(adaptiveHint('wordladder'))+'</p>':'')+(roundMistakes>=3&&nextLadderWord(item,ladderPath)&&ladderMeanings[nextLadderWord(item,ladderPath)]?'<aside class="tl-ladder-meaning tl-ladder-next-hint" role="note"><strong>Meaning hint for the next word</strong><p>'+esc(ladderMeanings[nextLadderWord(item,ladderPath)])+'</p></aside>':'');if(!ladderMistakeRecorded&&window.EpiphanyThinkLab){window.EpiphanyThinkLab.recordResult('spelling','word-ladder',false,false);ladderMistakeRecorded=true;}input.select();return;}
    ladderPath.push(word);
    if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('spelling','word-ladder',true,word===item.goal&&index===(activePool||getRoundPool('wordladder')).length-1);
    if(word===item.goal){score++;locked=true;roundMistakes=0;renderGame();const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Ladder complete!</strong><p>'+esc(item.explain)+'</p>';const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;}
    else{renderGame();const input2=root.querySelector('#tl-ladder-input');if(input2)input2.focus();}
  });
  root.addEventListener('dragstart', e => {
    const tile=e.target.closest('[data-forge-tile],[data-scramble-tile],[data-forge-slot],[data-scramble-slot]');
    if(!tile||locked)return;
    const kind=tile.hasAttribute('data-forge-tile')||tile.hasAttribute('data-forge-slot')?'forge':'scramble';
    let tileIndex;
    if(tile.hasAttribute('data-forge-tile'))tileIndex=Number(tile.dataset.forgeTile);
    else if(tile.hasAttribute('data-scramble-tile'))tileIndex=Number(tile.dataset.scrambleTile);
    else {const placed=kind==='forge'?forgePlaced:scramblePlaced;tileIndex=placed[Number(tile.getAttribute(kind==='forge'?'data-forge-slot':'data-scramble-slot'))];}
    if(tileIndex===null||tileIndex===undefined)return;
    e.dataTransfer.setData('text/plain',kind+':'+tileIndex);
    e.dataTransfer.effectAllowed='move';
  });
  root.addEventListener('dragover', e => {if(e.target.closest('[data-forge-slot],[data-scramble-slot],[data-forge-tile],[data-scramble-tile]'))e.preventDefault();});
  root.addEventListener('drop', e => {
    const target=e.target.closest('[data-forge-slot],[data-scramble-slot],[data-forge-tile],[data-scramble-tile]');
    if(!target||locked)return;
    const raw=e.dataTransfer.getData('text/plain'),parts=raw.split(':');
    if(parts.length!==2)return;
    e.preventDefault();const kind=parts[0],tileIndex=Number(parts[1]),placed=kind==='forge'?forgePlaced:scramblePlaced;
    if(kind==='forge'&&!target.hasAttribute('data-forge-slot')&&!target.hasAttribute('data-forge-tile'))return;
    if(kind==='scramble'&&!target.hasAttribute('data-scramble-slot')&&!target.hasAttribute('data-scramble-tile'))return;
    const current=placed.indexOf(tileIndex);
    if(target.hasAttribute(kind==='forge'?'data-forge-tile':'data-scramble-tile')){
      const targetIndex=Number(target.getAttribute(kind==='forge'?'data-forge-tile':'data-scramble-tile'));
      if(current>=0&&targetIndex!==tileIndex){const other=placed.indexOf(targetIndex);if(other>=0){placed[other]=tileIndex;placed[current]=targetIndex;}else{placed[current]=null;const empty=placed.indexOf(null);if(empty>=0)placed[empty]=tileIndex;}}
      else if(current<0){const empty=placed.indexOf(null);if(empty>=0)placed[empty]=tileIndex;}
    }else{
      const slot=Number(target.getAttribute(kind==='forge'?'data-forge-slot':'data-scramble-slot'));
      if(current>=0)placed[current]=null;
      if(placed[slot]!==null){if(current>=0)placed[current]=placed[slot];else return;}
      placed[slot]=tileIndex;
    }
    refreshPuzzleBoard(kind);
  });
  root.addEventListener('click', e => {
    const connectionTile=e.target.closest('[data-connection-tile]');
    if(connectionTile&&mode==='connections'&&!locked){
      const tileIndex=Number(connectionTile.dataset.connectionTile),at=connectionSelected.indexOf(tileIndex);
      if(at>=0)connectionSelected.splice(at,1);else if(connectionSelected.length<4)connectionSelected.push(tileIndex);
      root.querySelectorAll('[data-connection-tile]').forEach(btn=>{const selected=connectionSelected.includes(Number(btn.dataset.connectionTile));btn.classList.toggle('is-selected',selected);btn.setAttribute('aria-pressed',String(selected));});
      const count=root.querySelector('[data-connection-count]');if(count)count.textContent=connectionSelected.length+' / 4 selected';
      return;
    }
    if(e.target.closest('[data-connection-reset]')&&mode==='connections'&&!locked){
      connectionSelected=[];root.querySelectorAll('[data-connection-tile]').forEach(btn=>{btn.classList.remove('is-selected');btn.setAttribute('aria-pressed','false');});
      const count=root.querySelector('[data-connection-count]');if(count)count.textContent='0 / 4 selected';return;
    }
    if(e.target.closest('[data-connection-check]')&&mode==='connections'&&!locked){
      const fb=root.querySelector('#tl-feedback'),pool=activePool||getRoundPool('connections'),item=pool[index%pool.length];
      if(connectionSelected.length!==4){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Select exactly four words before checking.';return;}
      const tiles=[...root.querySelectorAll('[data-connection-tile]')],chosen=connectionSelected.map(i=>tiles.find(btn=>Number(btn.dataset.connectionTile)===i)?.textContent.trim().toLowerCase());
      const correct=item.words.every(w=>chosen.includes(w.toLowerCase()));
      if(!correct){roundMistakes++;fb.hidden=false;fb.className='tl-feedback is-wrong';fb.innerHTML='<strong>Not this group yet.</strong><p>Look for four words that share one clear category or relationship. You can change your selection and try again.</p>'+(roundMistakes>=2?'<p>'+esc(adaptiveHint('connections'))+'</p>':'');return;}
      locked=true;score++;root.querySelectorAll('[data-connection-tile],[data-connection-check],[data-connection-reset]').forEach(el=>el.disabled=true);
      if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('vocabulary','connections',true,index===pool.length-1);
      fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Group found!</strong><p>'+esc(item.explain)+'</p>';
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;return;
    }
    const forgeTile=e.target.closest('[data-forge-tile]');
    const forgeSlot=e.target.closest('[data-forge-slot]');
    const scrambleTile=e.target.closest('[data-scramble-tile]');
    const scrambleSlot=e.target.closest('[data-scramble-slot]');
    if(forgeTile&&!locked){const i=Number(forgeTile.dataset.forgeTile);if(!forgePlaced.includes(i)){const slot=forgePlaced.indexOf(null);if(slot>=0){forgePlaced[slot]=i;refreshPuzzleBoard('forge');}}return;}
    if(forgeSlot&&!locked){const slot=Number(forgeSlot.dataset.forgeSlot);forgePlaced[slot]=null;refreshPuzzleBoard('forge');return;}
    if(scrambleTile&&!locked){const i=Number(scrambleTile.dataset.scrambleTile);if(!scramblePlaced.includes(i)){const slot=scramblePlaced.indexOf(null);if(slot>=0){scramblePlaced[slot]=i;refreshPuzzleBoard('scramble');}}return;}
    if(scrambleSlot&&!locked){const slot=Number(scrambleSlot.dataset.scrambleSlot);scramblePlaced[slot]=null;refreshPuzzleBoard('scramble');return;}
    if(e.target.closest('[data-forge-reset]')){forgePlaced=Array(forgePlaced.length).fill(null);refreshPuzzleBoard('forge');return;}
    if(e.target.closest('[data-scramble-reset]')){scramblePlaced=Array(scramblePlaced.length).fill(null);refreshPuzzleBoard('scramble');return;}
    if(e.target.closest('[data-forge-check]')){
      if(locked)return;
      const pool=activePool||getRoundPool('forge'),item=pool[index%pool.length],answer=forgePlaced.every(x=>x!==null)?forgePlaced.map(i=>[...item.letters][i]).join('').toLowerCase():'',fb=root.querySelector('#tl-feedback');
      if(answer!==item.answerWord){roundMistakes++;fb.hidden=false;fb.className='tl-feedback is-wrong';fb.innerHTML='<strong>Not forged yet—try again.</strong><p>Use each letter tile once and check the clue. You can move letters between slots.</p>';return;}
      score++;locked=true;if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('spelling','word-forge',true,index===pool.length-1);
      root.querySelectorAll('[data-forge-tile],[data-forge-slot],[data-forge-check],[data-forge-reset]').forEach(el=>el.disabled=true);
      fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Word forged!</strong><p><b>'+esc(item.answerWord.toUpperCase())+'</b> — '+esc(item.explain)+'</p>';const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;return;
    }
    if(e.target.closest('[data-scramble-check]')){
      if(locked)return;
      const pool=activePool||getRoundPool('scramble'),item=pool[index%pool.length],fb=root.querySelector('#tl-feedback');
      const attempt=scramblePlaced.every(x=>x!==null)?scramblePlaced.map(i=>item.words[i]).join(' ').toLowerCase().replace(/[.,!?;:]/g,'').trim():'';
      const target=item.options[item.answer].toLowerCase().replace(/[.,!?;:]/g,'').trim();
      if(attempt!==target){roundMistakes++;fb.hidden=false;fb.className='tl-feedback is-wrong';fb.innerHTML='<strong>Not quite—rearrange the word tiles.</strong><p>Check the subject and verb first, then place adverbs and time phrases where they sound natural.</p>';return;}
      score++;locked=true;if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('grammar','sentence-scramble',true,index===pool.length-1);
      root.querySelectorAll('[data-scramble-tile],[data-scramble-slot],[data-scramble-check],[data-scramble-reset]').forEach(el=>el.disabled=true);
      fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Sentence built!</strong><p>'+esc(item.options[item.answer])+' — '+esc(item.explain)+'</p>';const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;return;
    }

    const recommended=e.target.closest('[data-think-recommended]'); if(recommended){start(recommended.dataset.thinkRecommended);return;}
    if(e.target.closest('[data-think-detective-retry]')){start('detective');return;}
    const translatorLevel=e.target.closest('[data-translator-level]');
    if(translatorLevel){selectedTranslatorCEFR=translatorLevel.dataset.translatorLevel;mode='translator';index=0;score=0;roundMistakes=0;activeDifficulty=difficultyForMode('translator');activePool=getRoundPool('translator',activeDifficulty.level);renderGame();return;}
    const launch=e.target.closest('[data-think-game]'); if(launch){start(launch.dataset.thinkGame);return;}
    if(e.target.closest('[data-think-back]')){if(window.speechSynthesis)window.speechSynthesis.cancel();landing();return;}
    if(e.target.closest('[data-translator-hint]')&&mode==='translator'&&!locked){const pool=activePool||getRoundPool('translator'),item=pool[index%pool.length],hint=root.querySelector('[data-translator-hint-text]'),button=root.querySelector('[data-translator-hint]');if(hint){hint.hidden=false;hint.textContent=item.hint;}if(button){button.disabled=true;button.textContent='Hint revealed';}return;}
    if(e.target.closest('[data-think-clue]')){clueCount=Math.min((activePool || getRoundPool('detective'))[index%(activePool || getRoundPool('detective')).length].clues.length-1,clueCount+1);renderGame();return;}
    if(e.target.closest('[data-think-next]')){if(window.speechSynthesis)window.speechSynthesis.cancel();index++;oddHintStep=0;chainStepIndex=0;chainPath=[];connectionSelected=[];clueCount=0;roundMistakes=0;ladderPath=[];ladderWordNote=null;ladderMistakeRecorded=false;if(index>=(activePool || getRoundPool(mode)).length){const finished=mode;const totalRounds=(activePool || getRoundPool(finished)).length;root.innerHTML='<div class="tl-finish"><span class="tl-finish-mark">∴</span><span class="tl-eyebrow">CASE FILE CLOSED</span><h2>Good thinking.</h2><p>You solved <b>'+score+' of '+totalRounds+'</b> challenges. The goal is not only to get it right—it’s to understand why.</p><button type="button" class="tl-next" data-think-restart>Try another case ↗</button><button type="button" class="tl-back" data-think-back>Back to Think Lab</button></div>';mode=null;activePool=null;activeDifficulty=null;}else renderGame();return;}
    if(e.target.closest('[data-think-restart]')){landing();return;}
    if(e.target.closest('[data-think-speak]')){speakTarget();return;}
    const chainAnswer=e.target.closest('[data-chain-answer]');
    if(chainAnswer&&mode==='chain'&&!locked){
      const pool=activePool||getRoundPool('chain'),item=pool[index%pool.length],steps=chainSteps(item),step=steps[chainStepIndex],chosen=Number(chainAnswer.dataset.chainAnswer);
      if(chosen!==step.answer){roundMistakes++;const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-wrong';fb.innerHTML='<strong>That link is possible, but not the strongest fit.</strong><p>Try a word that connects more directly to “'+esc(step.from)+'”.</p>'+(roundMistakes>=2?'<p>'+esc(adaptiveHint('chain'))+'</p>':'');return;}
      chainPath.push(step.options[chosen]);roundMistakes=0;
      if(chainStepIndex<steps.length-1){chainStepIndex++;renderGame();return;}
      locked=true;score++;if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('vocabulary','chain',true,index===pool.length-1);
      const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Chain complete!</strong><p>'+esc(step.explain)+'</p>';
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;return;
    }
    if(e.target.closest('[data-odd-hint]') && mode === 'odd' && !locked) {
      const pool=activePool||getRoundPool('odd'),item=pool[index%pool.length];
      oddHintStep=Math.min(2,oddHintStep+1);
      const text=root.querySelector('[data-odd-hint-text]');
      if(text){
        const hint=oddHintStep===1?item.hint:oddRelationshipHint(item.relationship);
        text.hidden=false;
        text.textContent=(oddHintStep===1?'Hint 1: ':'Hint 2: ')+hint;
      }
      const button=root.querySelector('[data-odd-hint]');
      if(button){button.textContent=oddHintStep>=2?'Hints revealed':'Reveal another hint';button.disabled=oddHintStep>=2;}
      return;
    }
    const answer=e.target.closest('[data-think-answer]'); if(!answer||locked||!mode)return;
    const pool=activePool || getRoundPool(mode),item=pool[index%pool.length];
    if(mode==='wordladder')return;
    locked=true;const chosen=Number(answer.dataset.thinkAnswer),correct=mode==='maze'?item.options[chosen]===item.target:chosen===item.answer;if(correct)score++;else roundMistakes++;
    if(window.EpiphanyThinkLab){const skill=mode==='maze'?'listening':mode==='translator'?'conversation':mode==='detective'?'reading':mode==='wordladder'||mode==='forge'?'spelling':mode==='scramble'?'grammar':'vocabulary';window.EpiphanyThinkLab.recordResult(skill,mode,correct,index===(activePool || getRoundPool(mode)).length-1);}
    root.querySelectorAll('[data-think-answer]').forEach(b=>{b.disabled=true;const n=Number(b.dataset.thinkAnswer);const isRight=mode==='maze'?item.options[n]===item.target:n===item.answer;if(isRight)b.classList.add('is-correct');if(n===chosen&&!correct)b.classList.add('is-wrong');});
    if(mode==='translator'){
      const details = item.optionExplanations.map((reason,i)=>'<li><strong>'+(i===item.answer?'Correct answer':'Option '+String.fromCharCode(65+i))+':</strong> '+esc(reason)+'</li>').join('');
      const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback '+(correct?'is-correct':'is-wrong');
      fb.innerHTML='<strong>'+(correct?'✓ Natural translation!':'↗ Let’s compare the options.')+'</strong><p>'+esc(item.options[item.answer])+'</p><p><strong>Hint:</strong> '+esc(item.hint)+'</p><ul>'+details+'</ul>';
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;
      return;
    }
    const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback '+(correct?'is-correct':'is-wrong');fb.innerHTML='<strong>'+(correct?(mode==='maze'?'✓ Path cleared!':'✓ Well reasoned.'):'↗ Look at the clues again.')+'</strong><p>'+esc(item.explain)+'</p>'+(mode==='odd'&&item.relationshipLabel?'<p><strong>Relationship:</strong> '+esc(item.relationshipLabel)+'</p>':'')+(!correct&&mode==='odd'&&difficulty.level==='guided'&&!oddHintStep?'<p>'+esc(item.hint)+'</p>':!correct&&adaptiveHint(mode)?'<p>'+esc(adaptiveHint(mode))+'</p>':'')+(mode==='maze'?'<p class="tl-heard-word">Target word: <b>'+esc(item.target)+'</b></p>':'');
    const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;
  });
  landing();
})();