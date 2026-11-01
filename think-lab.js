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
    },

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
    },
    B2: {
    guided: [
      translatorQuestion("لم أكن لأصل في الوقت المحدد لولا مساعدتك.", ["I wouldn't have arrived on time if you hadn't helped me.","I wouldn't arrive on time unless you didn't help me.","I hadn't arrived on time if you wouldn't help me."], 0, "The sentence describes a past result that depended on a different past situation.", ["Correct: this mixed conditional links a past condition to a past result using the third conditional pattern.","The negative forms make the condition contradictory and change the intended meaning.","The auxiliaries are in the wrong clauses; “would” does not normally go in this if-clause."]),
      translatorQuestion("من المتوقع أن تنخفض الأسعار خلال الأشهر المقبلة.", ["Prices are expected to fall over the coming months.","Prices expect to fall during the next months.","It is expecting prices fall in the coming months."], 0, "Look for the impersonal passive structure used to report expectations.", ["Correct: “are expected to” is a natural passive reporting structure.","Prices do not perform the act of expecting; the passive form is needed.","The structure is ungrammatical; use “it is expected that” or “prices are expected to”."]),
      translatorQuestion("كان من المفترض أن تكون قد أرسلت التقرير بالفعل.", ["You should have sent the report by now.","You must send the report by now yesterday.","You should send the report already."], 0, "This expresses an expectation about an action that should already have happened.", ["Correct: “should have” + past participle refers to an expected past action.","The time reference and verb forms conflict.","This describes a present or future recommendation, not an uncompleted past expectation."]),
      translatorQuestion("لم أعتد على الاستيقاظ مبكراً، لكنني بدأت أفعل ذلك.", ["I didn't use to wake up early, but I've started doing it.","I wasn't used to wake up early, but I started do it.","I didn't used to waking up early, but I start doing it."], 0, "Distinguish a past habit from being familiar with an activity.", ["Correct: “didn't use to” describes a past habit; “started doing” is natural.","“Be used to” takes a noun or -ing form, and “started” needs an -ing form or infinitive.","After “didn't”, use “use”; the second clause also needs a consistent tense."]),
      translatorQuestion("كلما قرأت أكثر، أصبحت أكثر وعياً بالفروق الدقيقة.", ["The more I read, the more aware I became of the nuances.","More I read, more aware I became for the nuances.","The most I read, I became more aware about nuances."], 0, "This is a paired comparative structure.", ["Correct: “the more…, the more…” expresses linked change; “aware of” is the right collocation.","Both instances of “the” are missing, and “aware for” is incorrect.","The superlative “most” does not fit this paired comparison."]),
      translatorQuestion("لم يكن القرار سهلاً، ومع ذلك كان ضرورياً.", ["Difficult as the decision was, it was necessary.","Although difficult the decision was, it was necessary.","Despite the decision was difficult, it was necessary."], 0, "Choose a concessive structure that can place an adjective before the subject and verb.", ["Correct: adjective + “as” + subject + verb is a formal concessive pattern.","This word order is not grammatical; use “although the decision was difficult”.","“Despite” is followed by a noun or -ing form, not a full clause."]),
      translatorQuestion("يبدو أنهم أساؤوا فهم ما قلته.", ["They seem to have misunderstood what I said.","They seem that they misunderstood what I said.","They are seeming to misunderstand what I had said."], 0, "The misunderstanding happened before the present impression.", ["Correct: “seem to have” + past participle marks an earlier action.","Use “seem to” before a verb, not “seem that” in this construction.","“Seem” is not normally used in the continuous here, and the time relationship is awkward."]),
      translatorQuestion("كان ينبغي ألا نستخف بتحذيره.", ["We shouldn't have dismissed his warning.","We shouldn't dismissed his warning.","We mustn't have dismissing his warning."], 0, "This is criticism or regret about a past action.", ["Correct: “shouldn't have” + past participle expresses that a past action was a mistake.","The auxiliary “have” is missing.","The modal and verb forms do not create the intended past criticism."]),
      translatorQuestion("لا أمانع تأجيل الاجتماع ما دام الجميع موافقاً.", ["I don't mind the meeting being postponed as long as everyone agrees.","I don't mind to postpone the meeting provided everyone agreeing.","I don't mind the meeting postponed as long everyone agrees."], 0, "After “mind”, use an -ing form; the condition needs a complete clause.", ["Correct: “mind” takes an -ing form, and “as long as” introduces a condition.","“Mind” is not followed by “to” here, and “everyone agreeing” is not a finite clause.","The passive -ing form and “as long as” structure are incomplete."]),
      translatorQuestion("لم تكن المشكلة في التكلفة بقدر ما كانت في ضيق الوقت.", ["The problem was less the cost than the lack of time.","The problem was fewer the cost than the time shortage.","The problem wasn't cost as much the lack of time."], 0, "Look for a balanced comparison between two explanations.", ["Correct: “less A than B” contrasts the relative importance of two things.","“Fewer” is used with countable plural nouns, not “the cost”.","The comparison needs “not so much A as B” or “less A than B”."]),
      translatorQuestion("يُقال إن المبنى صُمم على يد مهندس محلي.", ["The building is said to have been designed by a local architect.","The building says to be designed from a local architect.","It is said the building designed by a local architect."], 0, "Report a past design using a passive infinitive after a reporting verb.", ["Correct: “is said to have been designed” reports an earlier passive action.","The building cannot “say”; “from” is also the wrong preposition for the agent.","The clause is missing the correct passive verb structure."]),
      translatorQuestion("مهما بدا الأمر معقداً، فلا تتسرع في الحكم.", ["However complicated it may seem, don't rush to judge.","Whatever complicated it seems, don't rush judging.","Although it may complicated, don't rush to judging."], 0, "Use a concessive adverbial meaning “no matter how”.", ["Correct: “however” + adjective + subject + verb expresses concession.","“Whatever” does not modify an adjective this way; “rush judging” is not the right pattern.","The adjective needs “be”, and “rush to judge” is the natural phrase."])
    ],
    steady: [
      translatorQuestion("لو كنت قد انتبهت إلى التفاصيل، لما ارتكبت ذلك الخطأ.", ["If I had paid attention to the details, I wouldn't have made that mistake.","If I would pay attention to the details, I hadn't made that mistake.","Had I paid attention to the details, I wouldn't make that mistake yesterday."], 0, "Both the condition and the result refer to an unreal past situation.", ["Correct: third conditional uses past perfect in the if-clause and “would have” in the result.","The verb forms do not match a past unreal condition.","Inversion is possible, but the result needs “wouldn't have made” for a past consequence."]),
      translatorQuestion("لم يكن ليقبل العرض حتى لو ضاعفوا راتبه.", ["He wouldn't have accepted the offer even if they had doubled his salary.","He wouldn't accept the offer even if they would double his salary.","He hadn't accepted the offer even if they doubled his salary."], 0, "The sentence imagines a different past and its past consequence.", ["Correct: “wouldn't have accepted” pairs with “if they had doubled”.","“Would” is generally avoided in this if-clause, and the time reference is inconsistent.","The main clause needs a conditional modal to express the unreal result."]),
      translatorQuestion("ما إن غادرنا حتى بدأ المطر يهطل بغزارة.", ["Hardly had we left when it began to rain heavily.","Hardly we had left than it began raining heavily.","No sooner we left when the rain had begun heavily."], 0, "A formal structure with “hardly” uses inversion and is commonly followed by “when”.", ["Correct: “Hardly had + subject + past participle … when” is the standard pattern.","Inversion is required after fronted “hardly”; use “when”, not “than”.","“No sooner” pairs with “than” and also requires inversion in this structure."]),
      translatorQuestion("كان من الممكن تجنب الحادث لو تمت صيانة السيارة.", ["The accident could have been avoided if the car had been maintained.","The accident could be avoided if the car would have maintained.","The accident could have avoided if the car was maintaining."], 0, "The result is passive and refers to an unreal past condition.", ["Correct: “could have been avoided” is past passive; “had been maintained” is past perfect passive.","The passive forms are incomplete and “would have” is misplaced in the if-clause.","The result is missing “been”, and the condition has the wrong form."]),
      translatorQuestion("أفضّل أن تبقي هذه المعلومات سرية في الوقت الحالي.", ["I'd rather you kept this information confidential for the time being.","I'd rather you keep this information confidential yesterday.","I'd prefer you to keeping this information confidential for now."], 0, "After “I'd rather” + another subject, a past form can express a present preference.", ["Correct: past simple after “I'd rather” expresses a preference about someone else's present or future action.","“Yesterday” conflicts with the present preference, and the base form is less suitable here.","“Prefer” takes “you to keep” or “your keeping”, not “you to keeping”."]),
      translatorQuestion("ليس الأمر أنني أعارض الفكرة، بل أنني أشكك في توقيتها.", ["It's not that I object to the idea, but that I question its timing.","It's not because I object the idea, but I question about its timing.","Not that I am objecting for the idea, but its timing I doubt."], 0, "This is a parallel contrast; check the prepositions after “object” and “question”.", ["Correct: “not that … but that …” creates a balanced contrast; “object to” is the right pattern.","“Object” requires “to”; “question about” is not the natural verb pattern here.","“Object to” is needed, and the sentence lacks a balanced structure."]),
      translatorQuestion("كان واضحاً من نبرة صوته أنه لم يكن مقتنعاً.", ["It was clear from his tone that he wasn't convinced.","It cleared by his tone that he didn't convinced.","His tone made clear that he wasn't convince."], 0, "Use an impersonal clause and the passive adjective “convinced”.", ["Correct: “It was clear … that …” is natural; “convinced” describes his state.","The construction is ungrammatical; “convinced” is an adjective or past participle.","“Wasn't” needs “convinced”, not “convince”."]),
      translatorQuestion("كلما طال النقاش، قلّت احتمالية التوصل إلى اتفاق.", ["The longer the discussion went on, the less likely we were to reach an agreement.","The longest the discussion continued, the least likely we reached agreement.","The more long the discussion went on, the less possibility to agree."], 0, "Use the comparative correlative pattern and the adjective “likely”.", ["Correct: “the longer …, the less likely …” expresses linked changes naturally.","Superlatives do not fit the paired comparison, and the clause structure is faulty.","“Longer” is the comparative form; “less likely to reach” is the natural structure."]),
      translatorQuestion("لم يقتصر تأثير القرار على الموظفين فحسب، بل امتد إلى العملاء أيضاً.", ["The decision affected not only the employees but also the customers.","The decision not only affected employees but also was extended to customers too.","Not only the decision affected employees, it extended customers also."], 0, "Keep the two parts of “not only … but also” grammatically parallel.", ["Correct: both noun phrases are parallel objects of “affected”.","The structure shifts awkwardly between active and passive and is not parallel.","Fronted “not only” requires inversion; the second clause is also missing “to”."]),
      translatorQuestion("أشك في أن تكون هذه الأرقام دقيقة تماماً.", ["I doubt whether these figures are entirely accurate.","I doubt that whether these figures are accurately.","I am doubting if these figures entirely accuracy."], 0, "Choose a clause after “doubt” and an adjective to describe the figures.", ["Correct: “doubt whether” is natural, and “accurate” is the adjective.","Do not combine “that” and “whether” in this way; “accurately” is an adverb.","“Doubt” is not normally continuous here, and “accuracy” is a noun."]),
      translatorQuestion("من غير المرجح أن يكونوا قد لاحظوا التغيير.", ["They are unlikely to have noticed the change.","They are unlikely that they noticed the change.","They unlikely to have been noticing the change."], 0, "The noticing happened before the present assessment of likelihood.", ["Correct: “unlikely to have” + past participle refers to a possible earlier event.","“Unlikely” is followed by an infinitive in this construction, not “that” directly.","The sentence is missing “are”, and the perfect continuous is unnecessary."]),
      translatorQuestion("بغض النظر عن مدى جودة الخطة، فإن تنفيذها هو التحدي الحقيقي.", ["However good the plan may be, implementing it is the real challenge.","Despite how good the plan may be, to implement it are the real challenge.","No matter the plan is good, its implementing are the real challenge."], 0, "Use a concessive clause and a gerund phrase as the subject.", ["Correct: “however good … may be” is concessive; “implementing it” is a singular subject.","“Despite” needs a noun or -ing form, and the subject-verb agreement is wrong.","The clause is ungrammatical; “no matter how good” would work, and the gerund subject takes “is”."]),
      translatorQuestion("كان من الأفضل لو ناقشنا الأمر قبل اتخاذ القرار.", ["We would have been better off discussing the matter before making the decision.","We would be better discussing the matter before we had made the decision.","We had better off to discuss the matter before deciding."], 0, "The expression “be better off” can describe a wiser past choice.", ["Correct: “would have been better off” + -ing expresses a better alternative in the past.","The tense sequence is inconsistent and “better off” is missing “have been”.","“Had better” is a different structure and cannot be followed by “off”."]),
      translatorQuestion("لم يكد المدير يبدأ حديثه حتى انقطع التيار الكهربائي.", ["Barely had the manager begun speaking when the power went out.","Barely the manager had begun his speech than the power had gone out.","The manager barely began speaking when the power has gone out."], 0, "A fronted negative-like adverb triggers inversion; pair it with “when”.", ["Correct: “Barely had + subject + past participle … when” is the formal inverted pattern.","Inversion is missing, and “barely” pairs with “when”, not “than”.","The sequence of past events needs past perfect for the earlier action and past simple for the later one."]),
      translatorQuestion("لا يمكن استبعاد احتمال أن تكون النتائج قد تأثرت بعوامل خارجية.", ["The possibility that the results were influenced by external factors cannot be ruled out.","The possibility of the results influenced from external factors cannot rule out.","It cannot be ruled the results have influenced by external factors."], 0, "Use a noun clause after “possibility” and a passive phrasal verb.", ["Correct: “possibility that …” introduces a clause; “cannot be ruled out” is passive.","“Influenced” needs a passive construction and the phrase “ruled out” needs an object.","The passive infinitive structure is incomplete; the results are the affected entity."]),
    ],
    challenge: [
      translatorQuestion("لو لم يكن قد تدخل في ذلك الوقت، لكان الخلاف قد تصاعد.", ["Had he not intervened at the time, the dispute might have escalated.","If he wouldn't intervene at the time, the dispute might escalated.","Hadn't he intervened at the time, the dispute would escalate."], 0, "This is an inverted third conditional with a possible past result.", ["Correct: “Had he not intervened” is the inverted form of “If he had not intervened”; “might have escalated” is a past possibility.","“Wouldn't” is misplaced in the condition, and the result needs “have”.","The inversion is incorrect: do not contract “had not” as “hadn't” before the subject in this pattern; the result tense is wrong."]),
      translatorQuestion("لا ينبغي تفسير صمته على أنه موافقة.", ["His silence should not be taken as agreement.","His silence should not take as agreement.","His silence should not have been taking for agreement."], 0, "The subject receives the action, so consider a passive modal structure.", ["Correct: modal + be + past participle forms the passive; “taken as” is the right phrase.","The active form would mean the silence performs the action.","The perfect continuous passive does not fit this general warning."]),
      translatorQuestion("ما كان ليخطر ببالي أن النتيجة ستثير كل هذا الجدل.", ["It would never have occurred to me that the outcome would cause so much controversy.","It never occurred me that the outcome will have caused such controversy.","Never it would occur to me the outcome caused so much controversial."], 0, "Use the fixed expression “occur to someone” and maintain the past viewpoint.", ["Correct: “would have occurred to me” expresses an unreal past expectation; “would cause” keeps the future-in-the-past viewpoint.","“Occur” requires “to”; “will have caused” does not match the past viewpoint.","The adverbial fronting requires inversion, and “controversial” is an adjective, not a noun."]),
      translatorQuestion("مهما كانت الأدلة مقنعة، ينبغي فحصها بعناية.", ["Convincing as the evidence may be, it should be examined carefully.","Despite convincing the evidence may be, it should examine carefully.","However the evidence is convincing, it should have examining carefully."], 0, "This formal concessive pattern places an adjective or participle before “as”.", ["Correct: “Convincing as … may be” expresses concession; “should be examined” is passive.","“Despite” cannot introduce this full clause, and the passive is missing.","“However convincing” is possible, but the clause order and passive verb are incorrect."]),
      translatorQuestion("يُعتقد أن الشركة كانت تخفي الخسائر لسنوات.", ["The company is believed to have been concealing the losses for years.","The company believes to conceal the losses since years.","It is believed the company to be concealed the losses for years."], 0, "The concealment began before the current belief and continued over a period.", ["Correct: “is believed to have been concealing” is a reporting passive with a perfect continuous infinitive.","This makes the company the believer and “since years” is incorrect.","The reporting structure and infinitive form are ungrammatical."]),
      translatorQuestion("ليس فقط تجاهلوا التحذيرات، بل تصرفوا كما لو أن الخطر غير موجود.", ["Not only did they ignore the warnings, but they also acted as if the danger did not exist.","Not only they ignored the warnings, but acted like the danger doesn't existed.","They not only did ignored the warnings, they acted as the danger wasn't exist."], 0, "When “not only” begins the clause, use subject-auxiliary inversion.", ["Correct: “Not only did they ignore …” uses inversion; “as if” + past form expresses an unreal situation.","Inversion is missing; “doesn't existed” is incorrect.","After “did”, use the base verb “ignore”; “as if” needs “didn't exist” or “did not exist”."]),
      translatorQuestion("لو كنت مكانك، لما اعتبرت هذا العرض أمراً مضموناً.", ["If I were you, I wouldn't take this offer for granted.","If I was you, I wouldn't have taken this offer as granted.","Were I you, I won't consider this offer guaranteed."], 0, "This is advice about a present or future situation; use a fixed idiom.", ["Correct: “If I were you” is the conventional hypothetical advice form; “take for granted” is idiomatic.","The perfect result suggests a past situation, and “as granted” is not the idiom.","“Were I you” is possible formal inversion, but “I won't” does not match the hypothetical condition."]),
      translatorQuestion("كلما كان المصدر موثوقاً، قلّت الحاجة إلى التحقق من كل تفصيل.", ["The more reliable the source, the less need there is to verify every detail.","More reliable the source, less need to verify every details.","The most reliable the source, the fewer need there is verifying each detail."], 0, "This is a shortened comparative-correlative construction.", ["Correct: “the more …, the less …” is a natural reduced structure; “need” is uncountable here.","Both instances of “the” are missing, and “every” takes a singular noun.","Superlative forms do not fit; “need” is uncountable and takes “less”, not “fewer”."]),
      translatorQuestion("لم يكن التقرير ليُقبل لو لم تكن البيانات قد جرى التحقق منها.", ["The report would not have been accepted had the data not been verified.","The report would not be accepted if the data wouldn't verify.","The report had not accepted unless the data were verifying."], 0, "Use an inverted third conditional with a passive result and passive condition.", ["Correct: “would not have been accepted” and “had the data not been verified” are both past passive conditional forms.","The result shifts to the present, and the if-clause uses an incorrect active form.","The report needs a passive verb; the condition should describe completed verification."]),
      translatorQuestion("لم يكن الاعتراض على ما اقترحته بقدر ما كان على الطريقة التي عُرض بها.", ["The objection was not so much to what you proposed as to the way it was presented.","The objection wasn't much what you proposed than how it presented.","The objection was not so many to your proposal as the way presenting it."], 0, "Use the correlative phrase “not so much … as …” and preserve the passive in the second part.", ["Correct: “not so much to A as to B” contrasts the targets of the objection; “was presented” is passive.","The structure requires “not so much … as …”, and the passive verb is incomplete.","“Many” is for countable nouns; the parallel prepositions and passive clause are missing."]),
      translatorQuestion("كان من الممكن أن تكون النتائج مختلفة تماماً لو أُخذت الملاحظات في الحسبان.", ["The results might have been quite different had the feedback been taken into account.","The results might be quite different if the feedback would take into account.","The results could have quite differed had the feedback taken account."], 0, "The sentence describes an unreal past and uses a fixed phrase meaning “considered”.", ["Correct: “might have been” gives the past result; “had … been taken into account” is inverted past perfect passive.","“Would” is misplaced in the condition, and the passive phrase is incomplete.","“Quite different” is the natural adjective phrase; “taken into account” needs “been” in the passive."]),
      translatorQuestion("ما إن أُعلنت النتائج حتى بدأت الشكوك تحوم حول نزاهة العملية.", ["No sooner had the results been announced than doubts began to surround the integrity of the process.","No sooner the results were announced when doubts had surrounded the process integrity.","As soon as had the results announced, doubts began surrounding integrity."], 0, "“No sooner” takes inversion and is paired with “than”; the announcement is passive.", ["Correct: “No sooner had … been announced than …” is the formal inverted sequence.","Inversion is missing, and “no sooner” pairs with “than”, not “when”.","The auxiliary and passive participle are missing; “as soon as” does not use this inversion."]),
      translatorQuestion("أخشى أن يكون قد فات الأوان لتدارك الضرر.", ["I'm afraid it may be too late to undo the damage.","I fear that it must be too late for undoing the damage.","I'm afraid it might have too late to reverse the damage."], 0, "Choose a modal for present possibility and a natural infinitive after “too late”.", ["Correct: “may be” expresses present possibility; “too late to undo” is idiomatic.","“Must” is stronger than the intended uncertainty, and “for undoing” is less natural in this structure.","“Might have too late” is missing “been”; the modal form is incorrect."]),
      translatorQuestion("ما كان ينبغي أن يُترك الأمر للصدفة في المقام الأول.", ["The matter should never have been left to chance in the first place.","The matter should never be left by chance at first place.","The matter shouldn't have left to the chance in first place."], 0, "This is criticism of a past decision; the subject receives the action.", ["Correct: “should have been left” is a past passive modal; “leave to chance” is the idiom.","The past criticism needs “should have been”; “by chance” changes the meaning.","The passive auxiliary “been” is missing, and “chance” takes no article in this idiom."]),
      translatorQuestion("بدا وكأنهم كانوا يتجنبون الإجابة عن السؤال منذ البداية.", ["It seemed as though they had been avoiding the question from the outset.","It seemed as though they are avoiding the question since the beginning.","They seemed that they have avoided answering from outset."], 0, "The avoidance was already in progress before the past moment when it seemed so.", ["Correct: “had been avoiding” marks an ongoing earlier action; “from the outset” is natural.","The present continuous conflicts with the past viewpoint; “since” needs a suitable perfect form.","Use “seemed as though” rather than “seemed that” here; the phrase needs “the outset”."])
    ]
    },

    C1: {
      guided: [
        translatorQuestion('لم يكن اعتراضها على الفكرة نفسها، بل على توقيت طرحها.', ['Her objection was not to the idea itself, but to the timing of its proposal.', 'Her objection was not to the idea itself, but to the fact that it had been proposed.', 'She objected to the idea itself, rather than to the timing of its proposal.'], 0, 'Preserve the contrast between the proposal and the moment it was raised.', ['Correct: “not … itself, but …” makes the distinction precise; “the timing of its proposal” is suitably formal.', 'This is grammatical, but shifts the objection from the timing to the act of proposing the idea.', 'This reverses the contrast: the idea itself, rather than its timing, becomes the object of objection.']),
        translatorQuestion('قال المدير إن النتائج مشجعة، لكنه أضاف أن الوقت ما زال مبكراً للحكم.', ['The manager said the results were encouraging, but added that the timing of the announcement was premature.', 'The manager described the results as promising, but said they were not yet ready to be published.', 'The manager called the results promising, while adding that it was still too early to draw conclusions.'], 2, 'Look for a natural collocation meaning to make a considered judgement.', ['This shifts the concern from judging the results to the timing of the announcement.', 'This changes the point from insufficient time to assess the results to delaying their publication.', 'Correct: “promising” and “too early to draw conclusions” are natural, precise choices.']),
        translatorQuestion('لم يرفض الاقتراح صراحةً، لكنه لم يبدِ حماساً له أيضاً.', ['He did not explicitly reject the proposal, but he made it clear that he would not support it.', 'He considered the proposal carefully and eventually decided to reject it.', 'He did not explicitly reject the proposal, but neither did he show much enthusiasm for it.'], 2, 'The Arabic describes a restrained response rather than a direct refusal.', ['This turns a restrained response into a clear refusal to support the proposal.', 'This says that he eventually rejected it, which is more definite than the Arabic.', 'Correct: the response neither explicitly rejects the proposal nor shows much enthusiasm for it.']),
        translatorQuestion('كان من الأفضل أن نتحقق من الأرقام قبل تعميم النتيجة.', ['We would have been better off checking the figures before generalising the finding.', 'It would be better if we checked the numbers before making the result general.', 'We should better verify the digits before circulating the conclusion.'], 0, 'Choose the idiomatic way to express a preferable past course of action.', ['Correct: “would have been better off + -ing” is natural; “generalising the finding” fits the context.', 'The conditional form is awkward, and “make the result general” is not idiomatic.', '“Should better” is incorrect; “digits” means individual numerals, not data figures.']),
        translatorQuestion('لا يعني غياب الدليل أن العكس صحيح بالضرورة.', ['The absence of evidence makes the opposite explanation more likely.', 'The absence of evidence does not necessarily mean that the opposite is true.', 'The lack of conclusive evidence is itself evidence that the contrary is true.'], 1, 'Retain the careful logical qualification rather than making an absolute claim.', ['This introduces a likelihood claim that the Arabic does not make; absence of evidence alone does not establish probability.', 'Correct: “does not necessarily mean” preserves the logical caution without asserting the opposite.', 'This treats absence of evidence as positive evidence for the contrary, reversing the careful qualification.']),
        translatorQuestion('لم يكن النجاح وليد الصدفة وحدها؛ فقد تطلّب تخطيطاً دقيقاً.', ['The success was not a coincidence; it was the result of a plan that happened to work.', 'Success was largely accidental, although the team had planned for some possible outcomes.', 'The success was not purely a matter of chance; it required careful planning.'], 2, 'Find the natural collocation for describing something attributable to chance.', ['This is grammatical but suggests a plan that merely happened to work; it does not convey the deliberate, careful planning in the Arabic.', 'This makes the success largely accidental, weakening the stated role of planning.', 'Correct: “not purely a matter of chance” and “required careful planning” preserve the contrast.']),
        translatorQuestion('قد يبدو الاقتراح جذاباً على الورق، لكن تنفيذه مسألة أخرى.', ['The proposal may look appealing on paper, but putting it into practice is another matter.', 'The proposal can seem attractive in papers, but its execution is a different question.', 'The suggestion might be nice theoretically, but doing it is other matter.'], 0, 'The speaker contrasts an attractive idea with the practical reality of carrying it out.', ['Correct: “appealing on paper”, “putting it into practice” and “another matter” are idiomatic.', '“In papers” is not the idiom; “a different question” does not convey the same contrast as naturally.', '“Nice theoretically” is too informal and “another matter” needs an article.']),
        translatorQuestion('لم يكن تعليقها قاسياً بقدر ما كان صريحاً على نحو غير معتاد.', ['Her comment was not especially harsh, although it was unusually direct.', 'Her comment was not so much harsh as unusually candid.', 'Her comment was harsh precisely because it was unusually candid.'], 1, 'Use a balanced contrast that corrects the first impression without denying it completely.', ['This is close in meaning, but it does not preserve the corrective contrast expressed by “not so much … as …”.', 'Correct: “not so much A as B” shifts the emphasis towards the more accurate description.', 'This reverses the relationship by claiming that candour itself made the comment harsh.']),
        translatorQuestion('لم تكن النتائج حاسمة، لكنها عززت الشكوك القائمة.', ['The findings were inconclusive and left the existing doubts unresolved.', 'The findings were decisive and confirmed the doubts that had previously been raised.', 'The findings were inconclusive, but they lent weight to existing doubts.'], 2, 'Choose the collocation meaning to make an argument or suspicion more credible.', ['This says the findings left the doubts unresolved, but omits the idea that they strengthened them.', 'This contradicts the statement that the results were not decisive.', 'Correct: “inconclusive” and “lend weight to” express limited findings that nevertheless strengthen existing doubts.']),
        translatorQuestion('أعاد الفريق صياغة التوصية لتفادي أي إيحاء بأنها إلزامية.', ['The team reworded the recommendation to avoid any implication that it was mandatory.', 'The team changed the recommendation words to avoid suggesting it had an obligation.', 'The team reformulated the advice so it would not hint that it must be followed.'], 0, 'The concern is about the impression created by the wording, not the recommendation itself.', ['Correct: “reworded” and “any implication that it was mandatory” are accurate and natural.', '“Recommendation words” is awkward; “had an obligation” changes the focus.', '“Advice” is less formal, and “it must be followed” makes the obligation more explicit than the original nuance.']),
        translatorQuestion('لم يكن رده رفضاً قاطعاً، بل ترك الباب مفتوحاً أمام مزيد من النقاش.', ['His answer was not a complete refusal, but it opened the door for more talking.', 'His response was not an outright rejection; rather, it left the door open for further discussion.', 'He did not refuse finally, instead he kept the door opened to discuss more.'], 1, 'Find the established idiom for preserving the possibility of future discussion.', ['“Complete refusal” and “more talking” are less precise and less suitable for this register.', 'Correct: “outright rejection” and “leave the door open” express the nuance naturally.', '“Refuse finally” and “door opened” are unidiomatic; “instead” needs a clearer structure.']),
        translatorQuestion('من الإنصاف القول إن المقارنة مفيدة، وإن كانت لا تخلو من عيوب.', ['For fairness, the comparison is beneficial, even if it does not lack defects.', 'It is fair saying the comparison helps, although it has some bad points.', 'To be fair, the comparison is useful, though it is not without its flaws.'], 2, 'The speaker offers a balanced assessment rather than unqualified praise.', ['“Does not lack defects” is an awkward double negative; “for fairness” is unnatural.', '“It is fair saying” is ungrammatical and “bad points” is too informal.', 'Correct: “To be fair” and “not without its flaws” are measured, idiomatic expressions.']),
      ],
      steady: [
        translatorQuestion('قالت زميلتي: «ربما يجدر بنا إعادة النظر في الافتراض الذي ننطلق منه».', ['My colleague suggested that we might want to revisit the assumption we were working from.', 'My colleague insisted that we revisit the assumption underlying our approach.', 'My colleague instructed us to reassess the premise on which our approach rested.'], 0, 'This is a tactful suggestion, not a firm instruction; preserve its measured tone.', ['Correct: “might want to revisit” is appropriately tentative, and “working from” is natural in discussion.', '“Insisted” turns a tentative suggestion into a firm demand.', '“Instructed” makes the remark an explicit directive rather than a tactful suggestion.']),
        translatorQuestion('لم تتناول الدراسة هذه المسألة مباشرةً، وإن كانت نتائجها تلمّح إليها.', ['The study examined the issue in detail, although its findings remain inconclusive.', 'The study did not address the issue directly, although its findings point towards it.', 'The study did not address the issue directly, but its findings rule it out.'], 1, 'Distinguish between explicitly addressing a topic and indirectly indicating it.', ['This says the study examined the issue in detail, contradicting the statement that it did not address it directly.', 'Correct: “address an issue” and “findings point towards” are precise academic collocations.', 'This reverses the implication: the findings suggest the issue rather than eliminate it.']),
        translatorQuestion('كان رده مهذباً ظاهرياً، لكن نبرته أوحت بأنه غير مقتنع.', ['His reply was polite apparently, but his voice proved he did not believe.', 'He answered with politeness outside, although his tone showed disbelief.', 'His response was courteous on the surface, but his tone suggested that he was unconvinced.'], 2, 'The contrast concerns outward manner and the impression conveyed by tone.', ['“Apparently” does not fit the intended position; “proved” is too strong for an inference.', '“Politeness outside” is not idiomatic, and “disbelief” is stronger than lack of conviction.', 'Correct: “courteous on the surface” and “suggested that he was unconvinced” preserve the nuance without overstating it.']),
        translatorQuestion('إذا أخذنا تكاليف الصيانة في الحسبان، فلن يبدو الخيار الأرخص اقتصادياً بالضرورة.', ['Once maintenance costs are factored in, the cheaper option may not necessarily be the more economical one.', 'Once maintenance costs are included, the cheaper option is necessarily the more economical choice.', 'Even after maintenance costs are included, the cheaper option remains the more economical choice.'], 0, 'The sentence distinguishes a lower initial price from overall value after costs are included.', ['Correct: “factor in” and “the more economical one” express the distinction naturally.', 'This reverses the qualification by assuming that the lower-priced option must be more economical once costs are included.', 'This removes the uncertainty and asserts that the cheaper option remains better value even after the additional costs are considered.']),
        translatorQuestion('لم يكن غريباً أن يتردد المستثمرون في ظل هذه الظروف.', ['It was not strange that investors hesitated in the shadow of these conditions.', 'It was hardly surprising that investors should be hesitant under the circumstances.', 'Investors being hesitant was not an unusual thing with these situations.'], 1, 'Choose a restrained evaluative phrase and a natural way to refer to the prevailing conditions.', ['This is grammatical but suggests a figurative or threatening influence, rather than simply referring to the prevailing circumstances.', 'Correct: “hardly surprising”, “should be hesitant” and “under the circumstances” are idiomatic.', 'This makes the hesitation sound like an unusual personal trait, rather than a response to the circumstances.']),
        translatorQuestion('أقرّ الباحث بوجود قيود في العينة، من دون أن يقلّل ذلك من أهمية النتائج.', ['The researcher admitted there were sample restrictions, but this did not reduce the important results.', 'The researcher confessed the limits in the sample without making the results less important.', 'The researcher acknowledged the limitations of the sample without thereby diminishing the significance of the findings.'], 2, 'Preserve the academic register and the idea that acknowledging a limitation does not invalidate the findings.', ['“Admitted” can imply fault; “important results” does not capture “significance”.', '“Confessed” is inappropriate in neutral academic reporting; “limits in the sample” is less natural.', 'Correct: “acknowledged the limitations”, “thereby diminishing” and “significance of the findings” are precise academic phrasing.']),
        translatorQuestion('قالت: «لا أستبعد أن يكون هناك تفسير آخر، لكن الأدلة الحالية لا تدعمه».', ['“I wouldn’t rule out another explanation, but the current evidence does not support it.”', '“I would favour another explanation, although the current evidence does not support it.”', '“I cannot rule out another explanation, and the current evidence gives it some support.”'], 0, 'The speaker remains open-minded while clearly stating what the available evidence supports.', ['Correct: “wouldn’t rule out” is a measured expression of possibility; “evidence does not support” is standard.', 'This changes openness to a possibility into a preference for it, which the Arabic does not express.', 'This says the evidence offers some support, directly contradicting the stated lack of support.']),
        translatorQuestion('لم تكن المشكلة في نقص الموارد فحسب، بل في غياب التنسيق بين الفرق.', ['The problem was not only the shortage of resources, but the teams did not coordinate.', 'The problem lay not merely in a lack of resources, but in the absence of coordination between the teams.', 'The issue was lying not just in fewer resources, but in no coordination among teams.'], 1, 'Keep the two causes grammatically parallel and choose a formal way to locate the problem.', ['The second half changes grammatical structure and loses the parallelism.', 'Correct: “lay not merely in … but in …” creates a balanced, formal contrast.', '“Was lying” is not the right construction here; “fewer” is used with countable nouns.']),
        translatorQuestion('كان بإمكانهم تجنب الالتباس لو أوضحوا المصطلح منذ البداية.', ['They could avoid the confusion if they explained the term since the beginning.', 'They had the ability to prevent misunderstanding if the term was clear at first.', 'They could have avoided the ambiguity had they clarified the term from the outset.'], 2, 'This is a criticism of an unrealised past possibility; notice the shortened conditional.', ['The verb forms mix present and past; “since the beginning” is not natural here.', 'The sentence changes the action into a state and loses the conditional relationship.', 'Correct: “could have avoided” plus inverted “had they clarified” expresses the unrealised past.']),
        translatorQuestion('لم يبدُ أن أحداً يعترض على الخطة، وهو ما لا يعني بالضرورة موافقة الجميع.', ['No one appeared to object to the plan, which is not necessarily to say that everyone agreed.', 'No one objected to the plan, so the group was evidently in agreement.', 'No one appeared to object to the plan, which suggests that everyone was broadly in favour.'], 0, 'Preserve the distinction between the absence of an objection and positive agreement.', ['Correct: “appear to object” and “not necessarily to say” make the logical distinction clear.', 'This treats the absence of objections as proof of agreement, which the Arabic explicitly cautions against.', 'This draws a positive conclusion about support from silence, again going beyond what the Arabic warrants.']),
        translatorQuestion('كان حديثه مقتضباً إلى حد جعل الحاضرين يتساءلون عمّا إذا كان منزعجاً.', ['His talk was short to a degree that the attendees questioned if he was upset.', 'He was so terse that those present began to wonder whether he was annoyed.', 'He spoke briefly enough for the present people to ask if he had annoyance.'], 1, 'Choose the adjective that suggests unusually few words, not simply a short duration.', ['“Short to a degree” is awkward; “attendees” is possible but less natural in this context.', 'Correct: “terse” captures brevity that may seem abrupt; the rest is natural and appropriately cautious.', '“Present people” and “had annoyance” are not idiomatic.']),
        translatorQuestion('لم يكن القرار مثالياً، لكنه كان قابلاً للدفاع عنه في ضوء المعلومات المتاحة آنذاك.', ['The decision was far from ideal, but it was justified by everything we know now.', 'The decision was far from ideal, but it would be defensible if the information available at the time were different.', 'The decision was far from ideal, but it was defensible in light of the information available at the time.'], 2, 'Use a natural evaluative phrase and the collocation that introduces the evidence considered.', ['This uses present-day knowledge as the basis for justification, rather than the information available when the decision was made.', 'This makes the decision defensible only under different hypothetical information, not the information actually available then.', 'Correct: “far from ideal”, “defensible” and “in light of” are natural choices; “available at the time” preserves the historical limit.']),
        translatorQuestion('أثار التقرير تساؤلات أكثر مما قدّم إجابات.', ['The report raised more questions than it answered.', 'The report answered more questions than it raised.', 'The report raised questions that it went on to resolve.'], 0, 'Look for the concise idiomatic contrast between generating questions and resolving them.', ['Correct: “raise questions” and “answer questions” form a natural parallel expression.', 'This reverses the comparison, suggesting that the report provided more answers than questions.', 'This changes the report from prompting questions to resolving them, reversing the original emphasis.']),
        translatorQuestion('لم يكن المقصود التقليل من إنجاز الفريق، وإنما وضعه في سياقه الصحيح.', ['The intention was to downplay the team’s achievement while presenting it in a more favourable context.', 'The intention was not to downplay the team’s achievement, but to put it into its proper context.', 'The intention was not to question the team’s achievement, but to use it as the standard for judging other teams.'], 1, 'This is a clarification of intent; choose the idiom for unfairly minimising an achievement.', ['This reverses the intent: it explicitly says the achievement should be minimised.', 'Correct: “downplay” and “put it into its proper context” are concise and precise.', 'This changes contextualising the achievement into using it as a benchmark for other teams.']),
        translatorQuestion('رغم وجاهة الاعتراض، فإنه لا يعالج جوهر المشكلة.', ['Although the objection is valid, it does not treat the heart from the problem.', 'Despite the objection being logical, it does not solve the centrality of the issue.', 'Valid though the objection may be, it does not address the crux of the problem.'], 2, 'Notice the concessive inversion and the established expression for the central point.', ['“Heart from the problem” is a literal translation; “address” is more suitable than “treat” here.', '“Centrality” is an abstract noun and does not mean the central point; “logical” is not the same as valid.', 'Correct: “Valid though … may be” is a formal concessive structure; “the crux of the problem” is idiomatic.']),
      ],
      challenge: [
        translatorQuestion('في اجتماع المراجعة، قال أحدهم: «لست مقتنعاً بأننا نعالج السبب، لا العرض فحسب».', ['“I’m not convinced we’re addressing the cause rather than merely treating the symptoms.”', '“I doubt we’re resolving the immediate problem instead of examining what gave rise to it.”', '“I’m not convinced we’re treating the symptoms rather than addressing the underlying cause.”'], 0, 'The speaker questions whether the response tackles the root cause or merely manages its visible effects.', ['Correct: “address the cause” and “treat the symptoms” are established collocations; “rather than merely” sharpens the contrast.', 'This shifts the focus to resolving the immediate problem and examining its origins, rather than contrasting root causes with symptoms.', 'This reverses the contrast: it suggests that treating symptoms, not addressing the cause, is what is happening.']),
        translatorQuestion('حين سُئلت المتحدثة عن التأخير، أجابت: «كانت هناك اعتبارات لم يكن من الممكن تجاهلها».', ['Asked about the delay, the speaker cited practical constraints that had made postponement unavoidable.', 'Asked about the delay, the speaker alluded to considerations that could not be disregarded.', 'Asked about the delay, the speaker insisted that circumstances had left no room for an earlier decision.'], 1, 'The reply is deliberately non-specific; choose a verb that signals indirect reference rather than a full explanation or firm justification.', ['This supplies a specific explanation and presents the delay as unavoidable, neither of which is stated.', 'Correct: “alluded to” conveys an indirect reference, while “considerations” and “disregarded” fit the formal register.', 'This turns a guarded reference into a categorical claim that no alternative was possible.']),
        translatorQuestion('قال المحرر إن المقال «يثير نقطة تستحق النقاش»، من دون أن يؤيد حجته صراحةً.', ['The editor said the article “makes a persuasive case”, without explicitly endorsing its conclusion.', 'The editor said the article “raises a point worth discussing”, thereby giving its central argument qualified support.', 'The editor said the article “raises a point worth discussing”, without explicitly endorsing its argument.'], 2, 'A point may merit discussion without the speaker accepting the argument built around it.', ['“Makes a persuasive case” goes beyond acknowledging that a point deserves discussion and implies that the argument is convincing.', 'The added phrase “thereby giving … qualified support” introduces an endorsement that the Arabic explicitly withholds.', 'Correct: “raises a point worth discussing” and “endorse an argument” preserve the distinction between acknowledging an issue and supporting a case.']),
        translatorQuestion('في رسالة إلى عميل متذمر، أي صياغة تعترف بالإزعاج من دون الإقرار بمسؤولية لم تُحسم بعد؟', ['We appreciate the disruption this has caused and are looking into the circumstances.', 'We accept responsibility for the disruption and will establish which part of the process failed.', 'We regret that you have chosen to raise this issue before the investigation is complete.'], 0, 'The best response acknowledges the customer’s experience while remaining neutral about unresolved responsibility.', ['Correct: it acknowledges the impact and commits to investigating without prejudging responsibility.', 'It explicitly accepts responsibility before the facts have been established.', 'It sounds defensive and criticises the customer rather than acknowledging the disruption.']),
        translatorQuestion('خلال النقاش، قال الباحث: «هذا تفسير ممكن، وإن لم يكن التفسير الوحيد الذي تنسجم معه البيانات».', ['“That is the most likely interpretation, although the data can also be read in other ways.”', '“That is a plausible interpretation, albeit not the only one consistent with the data.”', '“That is a possible interpretation, but the data rules out the other explanations.”'], 1, 'The speaker grants plausibility while qualifying exclusivity; preserve the precise relationship between the interpretation and the data.', ['“Most likely” strengthens “possible” into a comparative judgement about probability.', 'Correct: “plausible”, “albeit” and “consistent with the data” convey the qualified claim.', 'This says the data excludes alternatives, which is the opposite of the qualification in the original.']),
        translatorQuestion('لم يكن صمته دليلاً على الموافقة؛ وربما كان، على العكس، علامة على تحفظه.', ['His silence could reasonably be taken as tacit agreement, even if he had not said so.', 'His silence was not necessarily evidence of agreement; it may simply have reflected his reluctance to comment.', 'His silence was not necessarily a sign of agreement; if anything, it may have indicated reservations.'], 2, 'The sentence first rejects a confident inference, then cautiously suggests a possible alternative explanation.', ['This treats silence as tacit agreement, directly contradicting the opening clause.', 'This preserves uncertainty but substitutes reluctance to comment for the more specific possibility of reservations.', 'Correct: “not necessarily”, “if anything” and “indicated reservations” preserve the measured inference.']),
        translatorQuestion('قالت المديرة: «لا أريد أن أستبق نتائج التحقيق، لكن المؤشرات الأولية لا تدعو إلى الاطمئنان».', ['“I do not wish to pre-empt the findings of the investigation, but the initial indications are hardly reassuring.”', '“I would rather not speculate before the investigation is complete, although the early signs are broadly encouraging.”', '“I will reserve judgement until the investigation reports back; the initial indications are inconclusive.”'], 0, 'Retain both the formal restraint about the investigation and the understated negative assessment of the initial indications.', ['Correct: “pre-empt the findings” and “hardly reassuring” are precise, measured expressions.', 'This reverses the assessment: “broadly encouraging” is positive, not worrying.', 'This removes the negative assessment and replaces it with a neutral claim that the evidence is inconclusive.']),
        translatorQuestion('في مراجعة الخطة، اقترح الفريق تأجيل الإطلاق، لا لأن المنتج غير جاهز، بل لأن الدعم لم يُختبر بما يكفي.', ['The team proposed delaying the launch because the product itself still required further development, rather than because of any support-related concerns.', 'The team proposed postponing the launch, not because the product was unready, but because support had not been tested sufficiently.', 'The team proposed postponing the launch because the support team had not received enough training, although the product was ready.'], 1, 'The sentence corrects a likely assumption and gives a different reason; preserve the contrast between product readiness and support testing.', ['This makes product readiness the reason for the delay, reversing the original distinction.', 'Correct: “not because … but because …” clearly distinguishes the actual reason.', 'This changes the issue from testing the support provision to training the support team.']),
        translatorQuestion('ردّ المستشار على الانتقاد بقوله: «قد يكون هذا صحيحاً من حيث المبدأ، لكن الصورة على أرض الواقع أكثر تعقيداً».', ['“That may be valid as a general principle, but the practical implications are considerably more straightforward.”', '“The theory may be sound, but applying it would be a mistake in the circumstances.”', '“That may be true in principle, but the picture on the ground is more complicated.”'], 2, 'The reply concedes an abstract point before qualifying it with practical realities; it does not dismiss the principle outright.', ['“More straightforward” reverses the claim that practical reality is more complex.', 'This moves from acknowledging complexity to rejecting the application as a mistake.', 'Correct: “true in principle” and “on the ground” naturally contrast theory with practice.']),
        translatorQuestion('في تقرير رسمي، أي صياغة تنقل أن النتائج «تتوافق مع الفرضية، لكنها لا تثبتها»؟', ['The findings are consistent with the hypothesis, but do not establish it.', 'The findings lend substantial support to the hypothesis, although they fall short of conclusive proof.', 'The findings verify the hypothesis, even if further evidence would strengthen the case.'], 0, 'Distinguish evidence that is compatible with a claim from evidence that demonstrates or strongly supports it.', ['Correct: “consistent with” and “establish” make the evidential distinction accurately.', '“Lend substantial support” makes a stronger claim than mere compatibility.', '“Verify” states that the hypothesis has been established, contradicting the qualification.']),
        translatorQuestion('قالت المراجِعة: «ليس لديّ اعتراض على النتيجة بحد ذاتها؛ ما يقلقني هو المسار الذي قاد إليها».', ['“I question the finding itself; the process that produced it is a separate matter.”', '“I have no objection to the finding as such; what concerns me is the process that led to it.”', '“The finding is acceptable in principle, provided that the process behind it can be justified.”'], 1, 'The concern is about methodology, not the conclusion; choose language suitable for a formal review.', ['This explicitly questions the finding itself, reversing the distinction in the original.', 'Correct: “as such”, “what concerns me” and “the process that led to it” are precise and formal.', 'This makes acceptance conditional on justifying the process, rather than stating that the process itself is the concern.']),
        translatorQuestion('عندما سُئل إن كان سيعيد القرار، قال: «مع الاستفادة مما نعرفه الآن، ربما كنت سأتصرف على نحو مختلف».', ['“With the benefit of hindsight, I can see that the decision was wrong.”', '“Now that the facts are clear, I would certainly make a different decision.”', '“With the benefit of hindsight, I might have acted differently.”'], 2, 'This is a conventional retrospective qualification, not a firm admission that the decision was wrong or that a different choice was certain.', ['This turns a tentative reflection into a definite admission that the decision was wrong.', '“Would certainly” expresses confidence, whereas the original remains tentative.', 'Correct: “with the benefit of hindsight” and “might have acted” are natural and appropriately tentative.']),
        translatorQuestion('في نقاش حاد، قال أحد الأعضاء: «مع احترامي، أعتقد أننا نخلط بين ما هو قابل للقياس وما هو مهم فعلاً».', ['“With respect, I think we are conflating what is measurable with what actually matters.”', '“Respectfully, I think we are prioritising what can be measured over what actually matters.”', '“With respect, I think our measurements are failing to capture everything that matters.”'], 0, 'The speaker disagrees firmly but uses a conventional softener; identify the precise verb for treating two distinct things as though they were equivalent.', ['Correct: “with respect” softens the disagreement; “conflating” precisely means treating distinct things as one.', 'This changes the claim from confusing two concepts to giving one priority over the other.', 'This criticises the limits of measurement, rather than the tendency to confuse measurability with importance.']),
        translatorQuestion('لم يقدّم المتحدث اعتذاراً مباشراً؛ بل أعرب عن أسفه لما «قد يكون فُهم على نحو خاطئ».', ['The speaker apologised for having expressed the point poorly and acknowledged the resulting misunderstanding.', 'The speaker stopped short of a direct apology, expressing regret instead for what “may have been misunderstood”.', 'The speaker apologised to the audience for misunderstanding what he had intended to say.'], 1, 'The wording is deliberately indirect and distances the speaker from accepting that the statement itself was wrong.', ['This makes the apology explicit and accepts that the speaker expressed the point poorly, neither of which the Arabic wording does.', 'Correct: “stopped short of” signals that the speaker did not go as far as apologising; “may have been misunderstood” preserves the distancing.', 'This apologises directly and attributes the misunderstanding to the audience.']),
        translatorQuestion('في نهاية المفاوضات، وصف الطرفان الاتفاق بأنه «خطوة عملية إلى الأمام»، مع الإقرار بأن الخلافات الجوهرية لم تُحل.', ['At the end of the negotiations, both sides hailed the agreement as a breakthrough, while noting that a few technical details remained.', 'At the end of the negotiations, both sides described the agreement as “a pragmatic step forward”, while acknowledging that fundamental differences remained unresolved.', 'At the end of the negotiations, both sides called the agreement “a final settlement”, despite recognising that some disagreements persisted.'], 1, 'The description is cautiously positive, not celebratory or conclusive; preserve the distinction between progress and unresolved core differences.', ['“Hailed” and “breakthrough” overstate the positive assessment, while “a few technical details” understates the unresolved issues.', 'Correct: “a pragmatic step forward”, “acknowledging” and “fundamental differences remained unresolved” retain the measured tone.', '“Final settlement” falsely suggests that the dispute has been resolved, contradicting the final clause.']),
      ]
    },
    C2: {
      guided: [
        translatorQuestion('لم يكن اعتذارها اعترافاً بالمسؤولية بقدر ما كان محاولة لاحتواء الموقف.', ['Her apology amounted to an admission of responsibility and an attempt to contain the situation.', 'Her apology was less an admission of responsibility than an attempt to defuse the situation.', 'Her apology was neither responsible nor an attempt to settle the situation.'], 1, 'Preserve the distinction between accepting blame and calming an escalating situation.', ['This makes the apology an admission of responsibility, which the Arabic carefully distinguishes from its purpose.', 'Correct: “less … than …” captures the contrast, while “defuse the situation” is idiomatic.', 'This misreads the contrast and uses “responsible” in the wrong sense.']),
        translatorQuestion('لا يخلو هذا التفسير من وجاهة، لكنه يفترض ما يسعى إلى إثباته.', ['The interpretation has some merit, but it assumes what it sets out to prove.', 'The interpretation is entirely unfounded because it proves its own assumptions.', 'The interpretation may be persuasive, provided its assumptions are first proved.'], 0, 'Identify the concise name for an argument that takes its conclusion for granted.', ['Correct: “has some merit” is measured praise; “assumes what it sets out to prove” describes circular reasoning.', 'This dismisses the interpretation outright, whereas the Arabic concedes that it has some merit.', 'This changes the criticism into a condition for accepting the interpretation.']),
        translatorQuestion('كان صمته قابلاً للتأويل، ولا سيما في ضوء ما قيل قبله.', ['His silence was unmistakable, particularly given what had been said beforehand.', 'His silence could be interpreted in several ways, especially in light of what had been said earlier.', 'His silence was an interpretation of the remarks that preceded it.'], 1, 'The wording leaves the meaning open rather than assigning one definite motive.', ['“Unmistakable” removes the ambiguity; the Arabic says the silence can be interpreted.', 'Correct: “could be interpreted” preserves ambiguity and “in light of” links it to the preceding remarks.', 'This reverses the relationship: the silence is being interpreted, not interpreting earlier remarks.']),
        translatorQuestion('لم يبدد التوضيح الالتباس بقدر ما نقل موضعه إلى نقطة أخرى.', ['The clarification eliminated the confusion and settled the remaining point.', 'The clarification did not merely shift the emphasis; it resolved the underlying ambiguity.', 'The clarification did less to dispel the confusion than to relocate it elsewhere.'], 2, 'The clarification changes where the uncertainty lies; it does not remove it.', ['This claims the confusion was eliminated, the opposite of the stated outcome.', 'This says the underlying ambiguity was resolved, which overstates the effect.', 'Correct: “less to … than to …” captures the shift, and “relocate it” is concise and precise.']),
        translatorQuestion('ينبغي ألا نخلط بين ما يمكن استنتاجه وما نرغب في أن يكون صحيحاً.', ['We should not conflate what can be inferred with what we would like to be true.', 'We should distinguish what we want to infer from what is demonstrably false.', 'We must not confuse our preferred conclusion with what can be proved beyond doubt.'], 0, 'Keep the contrast between evidence-based inference and personal preference without strengthening either side.', ['Correct: “conflate A with B” is the precise collocation and preserves the distinction.', 'This changes the second category into something demonstrably false, which the Arabic does not say.', '“Proved beyond doubt” is much stronger than “can be inferred”.']),
        translatorQuestion('لم يكن تحفظه اعتراضاً على المبدأ، وإنما على اتساع نطاق تطبيقه.', ['His reservation concerned the principle itself, rather than the breadth of its application.', 'His reservation was not about the principle as such, but about the breadth of its application.', 'He objected to applying the principle broadly because he rejected it in principle.'], 1, 'The reservation targets the scope of implementation, not the underlying principle.', ['This reverses the contrast and makes the principle itself the concern.', 'Correct: “not … as such, but …” draws the distinction cleanly and “breadth of its application” is precise.', 'This invents a rejection of the principle and contradicts the Arabic.']),
        translatorQuestion('قد يكون الاستنتاج صحيحاً، لكن الطريق الذي قاد إليه لا يخلو من قفزات منطقية.', ['The conclusion may be correct, although the reasoning leading to it contains no logical gaps.', 'The conclusion is necessarily false because the argument is incomplete.', 'The conclusion may be right, but the reasoning behind it involves a few logical leaps.'], 2, 'Do not confuse a possible conclusion with the soundness of the reasoning used to reach it.', ['This removes the criticism by claiming there are no logical gaps.', 'This treats flawed reasoning as proof that the conclusion itself is false.', 'Correct: “may be right” preserves the qualification, while “logical leaps” conveys unsupported steps.']),
        translatorQuestion('لم يكن الخلاف حول الوقائع بقدر ما كان حول الإطار الذي وُضعت فيه.', ['The disagreement was less about the facts themselves than about the framework in which they were presented.', 'The disagreement concerned the facts, which had been framed in a less controversial way.', 'The parties agreed on the framework but disputed whether the facts were accurate.'], 0, 'The dispute concerns interpretation and framing, not necessarily the factual record.', ['Correct: “less about … than about …” preserves the focus on framing rather than the facts.', 'This says the facts were presented less controversially, not that the framework was disputed.', 'This reverses the two points of disagreement.']),
        translatorQuestion('كان في عبارته ما يوحي بأنه يقرّ بالنتيجة من حيث المبدأ، ويتحفظ على تبعاتها.', ['His wording made it clear that he rejected both the conclusion and its implications.', 'There was something in his phrasing to suggest that he accepted the conclusion in principle while having reservations about its implications.', 'His phrasing suggested that he accepted the implications but remained unsure of the conclusion.'], 1, 'Distinguish accepting a proposition in principle from accepting everything that follows from it.', ['This turns a qualified acceptance into outright rejection.', 'Correct: “accepted … in principle” and “reservations about its implications” preserve the subtle distinction.', 'This reverses the relationship between the conclusion and its consequences.']),
        translatorQuestion('ليس المقصود أن نغض الطرف عن التناقض، بل أن نحدد مدى تأثيره في الحجة.', ['The point is to overlook the contradiction so that the argument remains persuasive.', 'The point is to determine whether the argument contains any contradiction at all.', 'The point is not to gloss over the contradiction, but to establish how far it undermines the argument.'], 2, 'The speaker calls for assessing the consequence of the contradiction, not ignoring it.', ['This directly contradicts the instruction not to overlook the contradiction.', 'This changes the task from evaluating its impact to checking whether it exists.', 'Correct: “not … but …” preserves the contrast; “how far it undermines” expresses degree of impact.']),
        translatorQuestion('كان حديثه متماسكاً ظاهرياً، غير أن مقدماته لم تكن على القدر نفسه من الصلابة.', ['His argument was coherent on the surface, although its premises were not equally robust.', 'His argument was incoherent throughout because its premises were weak.', 'His premises were robust, even if the overall argument appeared coherent.'], 0, 'The criticism is qualified: the structure seems coherent, but its foundations are weaker.', ['Correct: “coherent on the surface” and “premises … robust” distinguish apparent structure from underlying support.', 'This makes the criticism absolute and discards the concession about apparent coherence.', 'This reverses the assessment of the premises.']),
        translatorQuestion('لم يكن غياب الاعتراض دليلاً على الإجماع، بل ربما كان انعكاساً لاختلال موازين النقاش.', ['The lack of objections confirmed consensus, despite an uneven discussion.', 'The absence of objections was not evidence of consensus; it may instead have reflected an imbalance in the discussion.', 'The absence of consensus led participants to avoid objecting during the discussion.'], 1, 'Do not treat silence as agreement; retain the tentative alternative explanation.', ['This wrongly treats the absence of objections as confirmation of consensus.', 'Correct: “not evidence of” and “may instead have reflected” preserve the logical caution.', 'This invents a causal sequence that the Arabic does not establish.'])
      ],
      steady: [
        translatorQuestion('لو لم تكن الشروط قد تغيرت في اللحظة الأخيرة، لما بدا الاتفاق هشاً إلى هذا الحد.', ['Had the terms not changed at the last minute, the agreement would not have appeared so fragile.', 'If the terms would not have changed at the last minute, the agreement had seemed less fragile.', 'Were the terms not to change at the last minute, the agreement would have appeared less fragile.'], 0, 'This is an unreal past condition with inversion; keep both the timing and the counterfactual result.', ['Correct: inverted “Had … not” expresses the unreal past condition and “would not have appeared” gives its result.', 'The conditional clause uses an incorrect “would have” construction and shifts the tense.', '“Were … not to change” points to a hypothetical future, not a change that already occurred.']),
        translatorQuestion('لم يكن التقرير مضللاً بقدر ما كان انتقائياً في عرضه للبيانات.', ['The report was not misleading, since it presented all the available data.', 'The report was less misleading than selective, but its presentation was comprehensive.', 'The report was not so much misleading as selective in the way it presented the data.'], 2, 'The criticism is about selective presentation rather than necessarily false information.', ['This denies the criticism and claims the report was comprehensive.', 'This weakens the contrast and still incorrectly calls the presentation comprehensive.', 'Correct: “not so much … as …” shifts the diagnosis from misleading to selective.']),
        translatorQuestion('ما إن نُشرت المراسلات حتى تبيّن أن الرواية الرسمية لم تكن كاملة.', ['No sooner had the correspondence been published than it became clear that the official account was incomplete.', 'As soon as the correspondence was published, the official account became entirely false.', 'The correspondence was published only after the official account had been completed.'], 0, 'Use the inverted “no sooner … than” structure and avoid turning “incomplete” into “false”.', ['Correct: “No sooner had … than …” is the appropriate inversion; “incomplete” preserves the measured claim.', 'This exaggerates incompleteness into total falsity.', 'This invents a sequence and changes the meaning of “complete”.']),
        translatorQuestion('كان من شأن الاعتراف بهذا الاستثناء أن يقوّض القاعدة التي بُني عليها الاستدلال.', ['Acknowledging the exception would have strengthened the rule on which the reasoning was based.', 'To acknowledge the exception would be to undermine the rule on which the argument rested.', 'The exception was acknowledged because it provided the basis for the argument.'], 1, 'The sentence describes a consequence of conceding an exception, not an action that actually occurred.', ['This reverses the consequence: the exception would undermine, not strengthen, the rule.', 'Correct: “would be to undermine” and “the argument rested” convey the hypothetical consequence naturally.', 'This says the exception was acknowledged and made foundational, neither of which is stated.']),
        translatorQuestion('ليس من قبيل المصادفة أن تتكرر هذه الثغرة في كل مرحلة من مراحل التنفيذ.', ['It is hardly coincidental that this flaw recurs at every stage of implementation.', 'It is not a coincidence that this flaw happened once during implementation.', 'This flaw recurs at every stage, although the pattern is probably accidental.'], 0, 'Retain the implication that the recurring pattern is unlikely to be accidental.', ['Correct: “hardly coincidental” conveys the implied significance of a repeated pattern.', 'This reduces a recurring flaw to a single occurrence.', 'This adds the opposite interpretation by calling the pattern probably accidental.']),
        translatorQuestion('كان اعتراضها وجيهاً من حيث المبدأ، وإن شابته مبالغة في تقدير العواقب.', ['Her objection was fundamentally flawed because she exaggerated the consequences.', 'Her objection was sound in principle, notwithstanding some exaggeration in her assessment of the consequences.', 'Her objection was justified precisely because the consequences were as severe as she predicted.'], 1, 'Preserve both the concession that the objection has merit and the qualification about exaggeration.', ['This dismisses the objection entirely, losing the concession.', 'Correct: “sound in principle” grants its merit, while “notwithstanding” introduces the qualification.', 'This removes the qualification and treats the predicted consequences as established fact.']),
        translatorQuestion('ما كان ينبغي أن يُفهم تحفظه على أنه تراجع عن موقفه السابق.', ['His reservation should have been understood as a complete reversal of his earlier position.', 'His reservation was unrelated to the position he had previously taken.', 'His reservation should not have been construed as a retreat from his earlier position.'], 2, 'Choose the formal verb for interpreting something in a particular way.', ['This reverses the intended meaning and makes the reservation a complete reversal.', 'This removes the relationship between the reservation and the earlier position.', 'Correct: “construed as” is a precise formal equivalent of “understood as”, and “retreat from” preserves the nuance.']),
        translatorQuestion('كلما ازداد التدقيق في التفاصيل، اتضح أن المسألة أقل بساطة مما بدت عليه أول الأمر.', ['The more closely the details were scrutinised, the clearer it became that the issue was less straightforward than it had initially seemed.', 'The more details were scrutinised, the simpler the issue became than it first appeared.', 'As scrutiny increased, the issue proved to be exactly as straightforward as it had seemed.'], 0, 'Keep the correlative “the more … the …” structure and the gradual revision of an initial impression.', ['Correct: the correlative structure is natural, and “less straightforward than it had initially seemed” preserves the shift.', 'This reverses the direction of the finding and uses an awkward comparison.', 'This contradicts the conclusion that the issue was more complex than it first appeared.']),
        translatorQuestion('لا يستتبع التسليم بصحة الملاحظة قبول التأويل الذي أُقيم عليها.', ['Accepting the observation necessarily entails accepting the interpretation built upon it.', 'Conceding that the observation is valid does not entail accepting the interpretation placed upon it.', 'The interpretation is valid only if the observation itself is rejected.'], 1, 'The sentence separates accepting an observation from accepting an interpretation drawn from it.', ['This asserts the logical entailment that the Arabic explicitly rejects.', 'Correct: “does not entail” is the precise logical phrase; “placed upon it” captures the interpretation.', 'This invents a dependency in the opposite direction.']),
        translatorQuestion('بدا التعديل تجميلياً في البداية، لكنه مسّ جوهر الآلية لا مظهرها فحسب.', ['The amendment initially appeared cosmetic, but it affected the substance of the mechanism, not merely its appearance.', 'The amendment was cosmetic in effect because it changed the mechanism’s appearance alone.', 'The amendment initially altered the mechanism’s substance, although its appearance remained unchanged.'], 0, 'Distinguish the initial impression from the actual depth of the change.', ['Correct: “appeared cosmetic” marks the first impression; “substance … not merely … appearance” states the real effect.', 'This treats the initial impression as the final effect and omits the substantive change.', 'This reverses the sequence and changes the contrast.']),
        translatorQuestion('ما بدا تنازلاً محدوداً في حينه أرسى سابقة يصعب التراجع عنها لاحقاً.', ['What seemed a minor concession at the time established a precedent that would be difficult to reverse later.', 'The limited concession was later reversed, preventing it from becoming a precedent.', 'What seemed a precedent at the time was eventually reduced to a minor concession.'], 0, 'The sentence contrasts how the concession seemed then with the lasting precedent it created.', ['Correct: “seemed … at the time” contrasts with “established a precedent” and “difficult to reverse”.', 'This invents a reversal and contradicts the stated lasting effect.', 'This reverses the direction of the change in perception.']),
        translatorQuestion('لم يكن ثمة ما يسوّغ الانتقال من احتمال معقول إلى حكم جازم.', ['There was no justification for moving from a plausible possibility to a categorical judgement.', 'A plausible possibility was sufficient grounds for reaching a categorical judgement.', 'The categorical judgement made the original possibility more plausible.'], 0, 'The issue is an unjustified leap from qualified possibility to certainty.', ['Correct: “no justification for moving from” and “categorical judgement” preserve the epistemic distinction.', 'This asserts precisely the inference the Arabic warns against.', 'This reverses the logical relationship and adds an unsupported claim.']),
        translatorQuestion('لم يأتِ الرد على الاعتراض، بل اكتفى بإعادة صياغة الادعاء موضع النزاع.', ['The reply addressed the objection by refining the disputed claim.', 'The reply did not address the objection; it merely restated the very claim in dispute.', 'The objection was withdrawn after the claim had been reformulated.'], 1, 'Distinguish answering a challenge from simply repeating the proposition being challenged.', ['This says the objection was answered, which is the opposite of the Arabic.', 'Correct: “did not address … merely restated” captures the failure to engage with the objection.', 'This invents a withdrawal of the objection.']),
        translatorQuestion('إن صحّ هذا التأويل، فلا يعني ذلك أنه التأويل الوحيد الممكن.', ['If this interpretation is correct, it does not follow that it is the only possible one.', 'If this interpretation is correct, it must be the only possible one.', 'Since several interpretations are possible, this one cannot be correct.'], 0, 'The conditional grants a possibility without claiming exclusivity.', ['Correct: “it does not follow that” expresses the logical limit precisely.', 'This draws an unwarranted exclusive conclusion.', 'This wrongly treats the existence of alternatives as disproof of this interpretation.']),
        translatorQuestion('ما لم نضع هذا التباين في سياقه التاريخي، فقد نقرأه بوصفه تناقضاً لا اختلافاً في المصطلحات.', ['Unless we place this discrepancy in its historical context, we may mistake a terminological difference for a contradiction.', 'If we place the discrepancy in its historical context, it will prove that the terminology is contradictory.', 'The historical context is irrelevant because the discrepancy is purely terminological.'], 0, 'The context may change how the apparent inconsistency should be classified.', ['Correct: “mistake A for B” captures the risk of misclassification; “historical context” and “terminological difference” are precise.', 'This asserts a contradiction rather than warning against misreading one.', 'This dismisses the context, which the Arabic says is necessary.'])
      ],
      challenge: [
        translatorQuestion('لم يكن الخلاف على ما إذا كانت الأرقام صحيحة، بل على ما إذا كانت ذات صلة بالسؤال المطروح أصلاً.', ['The dispute was not over the accuracy of the figures, but over whether they were relevant to the question in the first place.', 'The figures were disputed because they were inaccurate and irrelevant to the question.', 'The dispute concerned the question itself, not the accuracy or relevance of the figures.'], 0, 'Separate factual accuracy from relevance; the sentence questions the latter, not necessarily the former.', ['Correct: “not … but …” keeps accuracy distinct from relevance and “in the first place” is natural.', 'This asserts that the figures were inaccurate, which the Arabic does not claim.', 'This removes the distinction and changes the object of the dispute.']),
        translatorQuestion('لو كان المقصود مجرد تسجيل الوقائع، لما احتاج التقرير إلى هذا القدر من الانتقاء في ترتيبها.', ['If the report had merely recorded the facts, it would have presented them in chronological order without interpretation.', 'Were the report merely to record the facts, it would not need such selectivity in arranging them.', 'Had the report merely been a record of the facts, it would not have required this degree of selectivity in the way they were arranged.'], 2, 'This counterfactual concerns the report’s purpose; the polished structure should preserve the past hypothetical.', ['This is close, but “select and arrange them so carefully” can suggest care rather than selective framing.', 'This shifts to a hypothetical present/future and loses the past counterfactual force.', 'Correct: “Had … been” is a past counterfactual inversion; “this degree of selectivity” preserves the critical implication.']),
        translatorQuestion('ما إن أُزيل القيد حتى اتضح أن الاستثناء كان هو القاعدة عملياً.', ['Only after the restriction was removed did it become clear that the exception had, in practice, been the rule.', 'Once the restriction was removed, the exception became the rule for the first time.', 'The restriction was removed because the rule had always been an exception in theory.'], 0, 'Preserve the delayed realisation and the distinction between formal labels and practical reality.', ['Correct: “Only after … did it become clear” uses inversion and “in practice” captures the contrast with the formal designation.', 'This says the exception became the rule only after removal, rather than revealing that it had functioned that way already.', 'This invents a reason for removing the restriction and changes the relationship.']),
        translatorQuestion('ليس في ذلك ما ينفي احتمال وجود دوافع أخرى، لكنه لا ينهض دليلاً عليها.', ['This rules out any possibility of other motives, although it does not prove the stated one.', 'This does not preclude the possibility of other motives, but it does not constitute evidence for them.', 'This establishes that other motives existed, even if their precise nature remains unclear.'], 1, 'Keep possibility separate from evidential support: something may remain possible without being evidenced.', ['This says other motives are impossible, which is the opposite of the first clause.', 'Correct: “does not preclude” preserves possibility, while “does not constitute evidence” limits what can be claimed.', 'This turns a possibility into an established fact.']),
        translatorQuestion('كان يمكن تفادي سوء الفهم، لولا أن العبارة صيغت على نحو يحتمل قراءتين متعارضتين.', ['The misunderstanding could have been avoided, had the wording not been open to two conflicting readings.', 'The misunderstanding was unavoidable because the wording had two similar meanings.', 'The wording could have been misunderstood, unless two conflicting readings had been avoided.'], 0, 'Use the counterfactual “had it not been for” logic without reversing the cause.', ['Correct: “could have been avoided, had … not been” expresses the unrealised alternative and “conflicting readings” is precise.', 'This makes the misunderstanding unavoidable and weakens “conflicting” to “similar”.', 'This reverses the conditional relationship and produces an illogical clause.']),
        translatorQuestion('لم يطعن المراجع في النتيجة ذاتها، وإنما في مدى ما تسمح به البيانات من تعميم.', ['The reviewer challenged the finding itself, arguing that the data were too limited.', 'The reviewer accepted the generalisation but disputed the underlying data.', 'The reviewer did not challenge the finding itself, but rather the extent to which the data warranted generalisation.'], 2, 'The criticism concerns the permissible reach of the conclusion, not the finding as such.', ['This says the finding itself was challenged, contradicting the Arabic.', 'This reverses the focus and says the generalisation was accepted.', 'Correct: “not … but rather …” and “the extent to which … warranted” express the precise methodological reservation.']),
        translatorQuestion('كان من السهل قراءة العبارة بوصفها تراجعاً، لولا أن السياق الأوسع يشير إلى العكس.', ['The statement could easily have been read as a retreat, were it not for the wider context pointing the other way.', 'The wider context made the statement an unmistakable retreat.', 'The statement was difficult to interpret because the wider context was absent.'], 0, 'This is an unreal condition: the wider context prevents one plausible reading from prevailing.', ['Correct: “were it not for” is the appropriate counterfactual frame and “pointing the other way” is natural.', 'This reverses the contextual implication.', 'This invents an absence of context.']),
        translatorQuestion('لا تكمن المفارقة في أن التوقعات لم تتحقق، بل في أن تحققها كان سيُعدّ إخفاقاً.', ['The paradox is that expectations were not met, although meeting them would have counted as a failure.', 'The paradox lies not in the expectations going unmet, but in their being met having counted as a failure.', 'The paradox is that the failure to meet expectations was itself considered a success.'], 1, 'The surprising point is the reversal of the usual evaluation: fulfilment, not failure to fulfil, would be failure.', ['This is understandable but does not preserve the balanced structure as precisely.', 'Correct: “not in … but in …” keeps the paradoxical contrast and the perfect gerund marks the hypothetical fulfilment.', 'This changes the paradox into a different claim about failure being called success.']),
        translatorQuestion('بصرف النظر عن صحة الفرضية، فإن الاستدلال لا يثبتها؛ فهو يفترضها ضمناً.', ['Regardless of whether the hypothesis is true, the reasoning does not establish it; it tacitly presupposes it.', 'The reasoning proves the hypothesis by making its truth explicit.', 'The hypothesis is false because the reasoning does not mention it directly.'], 0, 'The flaw is circularity: the argument relies on the very claim it purports to establish.', ['Correct: “regardless of whether” separates truth from proof; “tacitly presupposes” captures the circular reasoning.', 'This claims the reasoning proves the hypothesis, the opposite of the criticism.', 'This confuses not mentioning something explicitly with presupposing it and wrongly concludes falsity.']),
        translatorQuestion('لم يكن التعديل طفيفاً كما أوحى عرضه، إذ غيّر معيار الأهلية بأكمله.', ['The amendment was as minor as its presentation suggested, despite changing the eligibility criterion.', 'The amendment was not as minor as its presentation implied; it altered the eligibility criterion in its entirety.', 'The amendment changed how eligibility was presented, but left the criterion itself intact.'], 1, 'The sentence corrects a misleading impression and identifies the substantive change.', ['This says the amendment was minor, contradicting the correction that follows.', 'Correct: “not as minor as … implied” revises the impression, while “in its entirety” conveys the scale of the change.', 'This says only the presentation changed, not the criterion itself.']),
        translatorQuestion('ما لم نميز بين غياب الدليل والدليل على الغياب، سنظل نبالغ في ما تتيحه النتائج.', ['Unless we distinguish between an absence of evidence and evidence of absence, we will continue to overstate what the findings warrant.', 'If we distinguish the two kinds of evidence, the findings will necessarily prove the absence.', 'We should treat an absence of evidence as evidence that something is absent.'], 0, 'This is a methodological distinction about the strength of conclusions, not a claim about what is absent.', ['Correct: the established contrast is preserved, and “what the findings warrant” limits the strength of inference.', 'This claims the distinction itself proves absence, which it does not.', 'This collapses the distinction the Arabic explicitly asks us to make.']),
        translatorQuestion('إن صحّ أن الصمت كان مقصوداً، فلا يلزم من ذلك أن الرسالة التي تلقاها الآخرون كانت هي المقصودة.', ['If the silence was deliberate, the message others received must have been the intended one.', 'Even if the silence was deliberate, it does not follow that the message others took from it was the one intended.', 'The message others received proves that the silence was deliberate.'], 1, 'Separate the intention behind an act from the interpretation made by its audience.', ['This assumes that the audience’s interpretation matches the speaker’s intention.', 'Correct: “even if” grants the possibility, while “it does not follow” rejects the unsupported inference about intention.', 'This reverses the evidential direction and treats interpretation as proof of intent.']),
        translatorQuestion('ما بدا في البداية تناقضاً قد يتضح، عند التدقيق، أنه اختلاف في مستوى التحليل.', ['What initially appeared to be a contradiction may, on closer inspection, turn out to be a difference in the level of analysis.', 'What initially appeared to be a difference in analytical level is, on closer inspection, a contradiction.', 'The contradiction disappears because the analysis was not sufficiently detailed.'], 0, 'Retain the tentative reclassification: apparent contradiction may arise from comparing different analytical levels.', ['Correct: “may … turn out to be” preserves the tentative shift; “on closer inspection” is idiomatic.', 'This reverses the direction of the reclassification.', 'This asserts a cause and resolution not stated in the Arabic.']),
        translatorQuestion('لم يكن السؤال عمّا إذا كانت السياسة قد حققت أثراً، بل عمّا إذا كان الأثر المنسوب إليها سيقع على أي حال.', ['The question was whether the policy had any effect, rather than whether the effect would have occurred anyway.', 'The policy had an effect, although it would not have occurred without intervention.', 'The question was not whether the policy had an effect, but whether the attributed effect would have occurred anyway.'], 2, 'The issue is causal attribution: did the policy produce the outcome, or would it have happened regardless?', ['This changes the question and assumes the policy had an effect.', 'This asserts a causal dependency that the Arabic leaves open.', 'Correct: “not whether … but whether …” preserves the distinction and “attributed effect” signals the causal claim under examination.']),
        translatorQuestion('لو أُخذت هذه الملاحظة على محمل الجد، لاقتضت مراجعة الإطار كله، لا إضافة استثناء آخر إليه.', ['Taking this observation seriously would call for revisiting the entire framework, not adding yet another exception to it.', 'If the observation were taken seriously, another exception would be sufficient to preserve the framework unchanged.', 'The framework was revised because the observation was dismissed as insignificant.'], 0, 'The implication is structural revision rather than another patch to the existing framework.', ['Correct: “would call for” expresses the consequence; the contrast rejects adding another exception.', 'This proposes the very patch the Arabic says would be insufficient.', 'This invents a dismissal and a completed revision.'])
      ]
    }
  };

  // Keep C2 answer positions evenly distributed without changing the intended answers.
  const c2Questions = ['guided','steady','challenge'].flatMap(mode => translatorBanks.C2[mode]);
  // Keep the bank balanced without exposing a repeating answer-position pattern.
  const c2AnswerPositions = [
    2,2,1,1,2,0,2,0,1,2,2,0,0,1,
    1,1,2,0,2,2,0,0,1,0,2,1,1,2,
    1,2,2,0,0,1,1,1,2,0,0,1,0,0
  ];
  c2Questions.forEach((question, index) => {
    const target = c2AnswerPositions[index];
    if (question.answer === target) return;
    const current = question.answer;
    [question.options[current], question.options[target]] = [question.options[target], question.options[current]];
    [question.optionExplanations[current], question.optionExplanations[target]] = [question.optionExplanations[target], question.optionExplanations[current]];
    question.answer = target;
  });

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
  function assignTranslatorAnswerPositions(questions) {
    const count = questions.length;
    const base = Math.floor(count / 3);
    const remaining = [base, base, base];
    const remainder = count % 3;
    const positionOrder = [0, 1, 2];
    for (let i = positionOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positionOrder[i], positionOrder[j]] = [positionOrder[j], positionOrder[i]];
    }
    for (let i = 0; i < remainder; i++) remaining[positionOrder[i]]++;

    const answerPositions = [];
    let previous = -1;
    while (answerPositions.length < count) {
      const available = [0, 1, 2].filter(position => remaining[position] > 0 && position !== previous);
      const highestRemaining = Math.max(...available.map(position => remaining[position]));
      const best = available.filter(position => remaining[position] === highestRemaining);
      const chosen = best[Math.floor(Math.random() * best.length)];
      answerPositions.push(chosen);
      remaining[chosen]--;
      previous = chosen;
    }

    return questions.map((item, index) => {
      const correctIndex = item.answer;
      const correctOption = item.options[correctIndex];
      const correctExplanation = item.optionExplanations[correctIndex];
      const distractors = item.options
        .map((option, optionIndex) => ({ option, explanation: item.optionExplanations[optionIndex] }))
        .filter((_, optionIndex) => optionIndex !== correctIndex);
      for (let i = distractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
      }

      const answer = answerPositions[index];
      const options = [];
      const optionExplanations = [];
      let distractorIndex = 0;
      for (let position = 0; position < 3; position++) {
        if (position === answer) {
          options.push(correctOption);
          optionExplanations.push(correctExplanation);
        } else {
          options.push(distractors[distractorIndex].option);
          optionExplanations.push(distractors[distractorIndex].explanation);
          distractorIndex++;
        }
      }
      return { ...item, options, optionExplanations, answer };
    });
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
        prompt:'Which word does not belong?',
        cefrLevel:selected.level,
        trainingMode,
        relationshipLabel:relationshipLabels[item.relationship] || item.relationship,
        why:trainingMode === 'guided'
          ? 'Find the one word that does not share the relationship held by the other three.'
          : trainingMode === 'challenge'
            ? 'Identify the precise link shared by three words; avoid broad or superficial similarities. Context: ' + item.context
            : 'Compare the four words in this context: ' + item.context
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
      const questions = bank[selectedMode].slice();
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      const adaptiveFallback = selectedTranslatorCEFR === 'adaptive' && requestedLevel !== chosenLevel;
      const round = questions.slice(0,roundSize).map(item => ({
        ...item,
        cefrLevel:chosenLevel,
        trainingMode:selectedMode,
        adaptiveFallback,
        requestedCEFRLevel:requestedLevel
      }));
      return assignTranslatorAnswerPositions(round);
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
      : mode === 'translator' && item.adaptiveFallback
        ? '<p class="tl-game-instruction tl-translator-fallback" role="status">Your current level is '+esc(item.requestedCEFRLevel)+'. A '+esc(item.requestedCEFRLevel)+' question bank is not available yet, so this round uses '+esc(item.cefrLevel)+' practice for now.</p>'
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
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← All cases</button><span class="tl-eyebrow">THE BOLD TRANSLATOR</span></div><div class="tl-game-card"><div class="tl-game-kicker">CHOOSE YOUR PRACTICE LEVEL</div><h2>Where would you like to practise?</h2><p class="tl-game-instruction">Adaptive follows your current learning level. A1, A2, B1, B2, C1 and C2 are available for practice. If your adaptive level does not have a bank yet, the game temporarily uses A1 content. Manual practice does not change your adaptive level.</p><div class="tl-answer-options"><button type="button" class="tl-option" data-translator-level="adaptive"><strong>Adaptive · Recommended</strong><span>Use my current EPIPHANY level</span></button>'+levels.map(level => '<button type="button" class="tl-option" data-translator-level="'+level+'" '+(translatorBanks[level] ? '' : 'disabled')+'><strong>'+level+'</strong><span>'+(translatorBanks[level] ? 'Available' : 'Coming soon')+'</span></button>').join('')+'</div></div>';
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
    if(window.EpiphanyThinkLab){const skill=mode==='maze'?'listening':mode==='translator'?'conversation':mode==='detective'?'reading':mode==='wordladder'||mode==='forge'?'spelling':mode==='scramble'?'grammar':'vocabulary';window.EpiphanyThinkLab.recordResult(skill,mode,correct,index===(activePool || getRoundPool(mode)).length-1,{trackAdaptive:mode !== 'translator' || selectedTranslatorCEFR === 'adaptive'});}
    root.querySelectorAll('[data-think-answer]').forEach(b=>{b.disabled=true;const n=Number(b.dataset.thinkAnswer);const isRight=mode==='maze'?item.options[n]===item.target:n===item.answer;if(isRight)b.classList.add('is-correct');if(n===chosen&&!correct)b.classList.add('is-wrong');});
    if(mode==='translator'){
      const details = item.optionExplanations.map((reason,i)=>'<li><strong>'+(i===item.answer?'Correct answer':'Option '+String.fromCharCode(65+i))+':</strong> '+esc(reason)+'</li>').join('');
      const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback '+(correct?'is-correct':'is-wrong');
      fb.innerHTML='<strong>'+(correct?'✓ Natural translation!':'↗ Let’s compare the options.')+'</strong><p>'+esc(item.options[item.answer])+'</p><p><strong>Hint:</strong> '+esc(item.hint)+'</p><ul>'+details+'</ul>';
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;
      return;
    }
    const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback '+(correct?'is-correct':'is-wrong');fb.innerHTML='<strong>'+(correct?(mode==='maze'?'✓ Path cleared!':'✓ Well reasoned.'):'↗ Look at the clues again.')+'</strong><p>'+esc(item.explain)+'</p>'+(mode==='odd'&&item.relationshipLabel?'<p><strong>Relationship:</strong> '+esc(item.relationshipLabel)+'</p>':'')+(!correct&&mode==='odd'&&activeDifficulty&&activeDifficulty.level==='guided'&&!oddHintStep?'<p>'+esc(item.hint)+'</p>':!correct&&adaptiveHint(mode)?'<p>'+esc(adaptiveHint(mode))+'</p>':'')+(mode==='maze'?'<p class="tl-heard-word">Target word: <b>'+esc(item.target)+'</b></p>':'');
    const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;
  });
  landing();
})();