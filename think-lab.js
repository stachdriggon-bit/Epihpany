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
        {ar:'أين اشتريت هذا القميص؟',options:['Where did you buy this shirt?','Where you bought this shirt?','Where did you bought this shirt?'],answer:0,hint:'Use “did” to form a past-simple question, then keep the main verb in its base form.',optionExplanations:['Correct: “did” carries the past tense, so “buy” stays in the base form.','The question auxiliary “did” is missing.','After “did”, use the base form “buy”, not the past form “bought”.']},
        {ar:'لم أذهب إلى المدرسة أمس لأنني كنت مريضاً.',options:["I didn't go to school yesterday because I was sick.","I didn't went to school yesterday because I am sick.","I wasn't go to school yesterday because I sick."],answer:0,hint:'Keep both parts in the past and check the verb after “didn’t”.',optionExplanations:['Correct: “didn’t” takes the base verb, and “was” describes the past state.','After “didn’t” use “go”, not “went”; “am” should be “was”.','“Wasn’t go” is not a correct negative past form, and “I sick” needs “was”.']},
        {ar:'هذا الكتاب أغلى من ذلك الكتاب.',options:['This book is more expensive than that one.','This book is most expensive than that book.','This book is expensive more that one.'],answer:0,hint:'You are comparing two things, not identifying the most expensive one.',optionExplanations:['Correct: “more expensive than” makes a comparison; “that one” avoids repetition.','“Most expensive” is a superlative and does not take “than” here.','The order should be “more expensive than”.']},
        {ar:'أخي يلعب كرة القدم بعد المدرسة.',options:['My brother play football after school.','My brother plays football after school.','My brother is play football after school.'],answer:1,hint:'Check the verb ending with a singular third-person subject.',optionExplanations:['With “my brother”, the present simple verb needs -s.','Correct: “plays” agrees with the singular subject “my brother”.','The present simple does not use “is” before the base verb.']},
        {ar:'أختي أطول مني.',options:['My sister is taller than me.','My sister is more tall that me.','My sister taller than I.'],answer:0,hint:'Use the short adjective form for a simple comparison.',optionExplanations:['Correct: “taller than” is the standard comparative form.','Use “taller”, not “more tall”, and “than”, not “that”.','The sentence is missing “is”.']},
        {ar:'لم يكن هناك أحد في المنزل عندما وصلت.',options:['There was nobody at home when I arrived.','There were nobody at home when I arrive.','There is nobody home when I arrived.'],answer:0,hint:'Keep the description and the arrival in the past.',optionExplanations:['Correct: “there was nobody” and “arrived” are both past forms.','“Nobody” is singular in this construction, and “arrive” should be past.','“Is” changes the time to the present.']},
        {ar:'كم عدد إخوتك؟',options:['How much brothers do you have?','How many brothers do you have?','How many brother you have?'],answer:1,hint:'Brothers are countable; choose the question phrase for countable nouns.',optionExplanations:['Use “how many” with countable plural nouns.','Correct: “how many” + plural noun + “do you have”.','The noun needs plural -s and the auxiliary “do” is missing.']},
        {ar:'لماذا أنت متأخر؟',options:['Why are you late?','Why you are late?','Why do you late?'],answer:0,hint:'This question describes a state with the verb “be”.',optionExplanations:['Correct: the verb “are” comes before “you” in a direct question.','The word order is used in an indirect question, not this direct question.','“Late” is an adjective; “do” cannot be used this way.']},
        {ar:'أحب القراءة قبل النوم.',options:['I like reading before bed.','I like read before sleep.','I am like reading before bed.'],answer:0,hint:'Choose the natural verb pattern for an activity you enjoy.',optionExplanations:['Correct: “like” can be followed by the -ing form “reading”.','“Like” is followed by -ing or an infinitive, not the bare verb here.','“Like” is a main verb and does not take “am” before it.']},
        {ar:'زرت لندن العام الماضي.',options:['I visit London last year.','I visited London last year.','I have visited London last year.'],answer:1,hint:'The time expression refers to a finished period in the past.',optionExplanations:['The present form does not match “last year”.','Correct: use the past simple for a completed event at a finished past time.','Present perfect is not used with the finished time expression “last year”.']},
        {ar:'هي تستطيع التحدث بالإنجليزية قليلاً.',options:['She can speak a little English.','She can speaks English a little.','She cans speak English little.'],answer:0,hint:'Check the verb form after “can” and the natural position of “a little”.',optionExplanations:['Correct: “can” is followed by the base verb “speak”; “a little English” naturally describes limited ability.','Do not add -s after “can”.','Modal verbs do not take -s; use “a little English” to describe limited ability.']},
        {ar:'الأطفال يلعبون في الحديقة الآن.',options:['The children play in the garden now.','The children are playing in the garden now.','The children playing in the garden now.'],answer:1,hint:'Choose the form for an action happening at this moment.',optionExplanations:['The present simple does not express the ongoing action as clearly here.','Correct: “are playing” describes an action happening now.','The sentence needs the auxiliary “are” before the -ing form.']},
        {ar:'لا أستطيع العثور على مفاتيحي.',options:["I can't find my keys.","I don't can find my keys.","I can't finding my keys."],answer:0,hint:'Use the modal verb for inability and check the form of the next verb.',optionExplanations:['Correct: “can’t” is followed by the base verb “find”.','Do not use “do” with “can”.','After “can’t”, use “find”, not “finding”.']},
        {ar:'هذا هو اليوم الأكثر حرارة في السنة.',options:['This is the hottest day of the year.','This is the hotter day in the year.','This is most hot day of year.'],answer:0,hint:'The sentence identifies one day as number one in a whole group.',optionExplanations:['Correct: “the hottest” is the superlative form.','“Hotter” compares two things, not one with the whole year.','The superlative needs “the” and the form “hottest”.']},
        {ar:'لننظف غرفتنا الآن.',options:["Let’s clean our room now.","Let’s cleaning our room now.","Let’s to clean our room now."],answer:0,hint:'Choose the correct form for making a suggestion with “let’s”.',optionExplanations:['Correct: “let’s” is followed by the base verb “clean”.','After “let’s”, use the base verb, not the -ing form.','Do not add “to” after “let’s”.']}
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
        translatorQuestion('لقد تناولت الغداء للتو.', ['I just have lunch.','I have just had lunch.','I have just eat lunch.'], 1, 'The action is complete and very recent; choose the present perfect with “just”.', ['“Just” does not make the present simple “have lunch” a present-perfect form.','Correct: “have” + past participle “had” with “just” describes a very recent completed action.','After “have”, use the past participle “had”, not “eat”.']),
        translatorQuestion('ينبغي أن تخبرني بالحقيقة.', ['You should tell me the truth.','You should to tell me the truth.','You should telling me the truth.'], 0, 'This is advice about what someone ought to do now.', ['Correct: “should” is followed by the base verb “tell”.','Do not use “to” after the modal “should”.','After “should”, use the base verb, not the -ing form.']),
        translatorQuestion('لم يكن عليهم الانتظار طويلاً.', ['They didn’t have to wait long.','They mustn’t wait long.','They hadn’t to wait long.'], 0, 'The sentence means there was no obligation to wait.', ['Correct: “didn’t have to” expresses lack of necessity in the past.','“Mustn’t” expresses prohibition, not absence of past necessity.','This is not the usual negative past form of “have to”.']),
        translatorQuestion('إذا سخّنت الماء إلى 100 درجة مئوية، فإنه يغلي.', ['If you heat water to 100°C, it boils.','If you will heat water to 100°C, it boils.','If you heat water to 100°C, it will boiled.'], 0, 'This describes a general scientific fact, not a one-time future possibility.', ['Correct: the zero conditional uses the present simple in both clauses for a general fact.','Do not normally use “will” in the if-clause of this zero conditional.','The general result needs the present simple “boils”; “will boiled” is not grammatical.']),
        translatorQuestion('أعطتني أختي هذا الكتاب أمس.', ['My sister give me this book yesterday.','My sister gave me this book yesterday.','My sister has given me this book yesterday.'], 1, 'The time expression refers to a completed event in the past.', ['The present form does not match “yesterday”.','Correct: “gave” is the past simple form of “give”.','Present perfect is not used with the finished time expression “yesterday”.']),
        translatorQuestion('لا أمانع في مساعدتك.', ['I don’t mind to help you.','I don’t mind helping you.','I’m not mind helping you.'], 1, 'The verb “mind” is followed by a gerund.', ['“Mind” is followed by -ing, not the infinitive with “to”.','Correct: “mind helping” uses the gerund form.','“Mind” is a main verb and does not take “am”.']),
        translatorQuestion('كان من الصعب العثور على العنوان.', ['It was difficult finding the address.','It was difficult to find the address.','It difficult was to finding the address.'], 1, 'After “difficult”, the infinitive is a natural structure.', ['This can occur in some contexts, but the infinitive is the clearest standard choice here.','Correct: “It was difficult to find...” is the standard pattern.','The word order and verb form are incorrect.']),
        translatorQuestion('وصلنا متأخرين بسبب ازدحام المرور.', ['We arrived late because the traffic.','We arrived late because of the traffic.','We arrived lately because traffic was.'], 1, 'Choose the phrase followed directly by a noun phrase.', ['“Because” introduces a clause, not just the noun phrase “the traffic”.','Correct: “because of” is followed by a noun phrase.','“Lately” means recently, and the second clause is incomplete.']),
        translatorQuestion('اضطررنا إلى الانتظار لأن القطار كان متأخراً.', ['We had to wait because the train was late.','We must wait because the train was late.','We had wait because the train was late.'], 0, 'The sentence describes a necessity in the past.', ['Correct: “had to” is the past form of “have to” for a past necessity.','“Must” does not express this past necessity; use “had to”.','“Had to” needs “to” before the base verb “wait”.']),
        translatorQuestion('لا تنسَ إحضار جواز سفرك.', ['Don’t forget bringing your passport.','Don’t forget to bring your passport.','Not forget to bring your passport.'], 1, 'Choose the infinitive pattern used for something you must remember to do.', ['“Forget” takes “to bring” when referring to a task that must be done.','Correct: “don’t forget to bring” is the natural reminder.','The sentence needs the auxiliary “don’t” before the base verb.']),
        translatorQuestion('هذه الحقيبة أخف من حقيبتي القديمة.', ['This bag is lighter than my old one.','This bag is more light than my old one.','This bag is the lightest than my old one.'], 0, 'Use the comparative form to compare two bags.', ['Correct: “lighter than” is the comparative form of “light”.','Use “lighter”, not “more light”, for this short adjective.','A superlative does not take “than” in this comparison.']),
        translatorQuestion('لم أكن أستيقظ مبكراً في الماضي.', ['I didn’t use to wake up early.','I didn’t used to wake up early.','I wasn’t use to wake up early.'], 0, 'Use “used to” to describe a past habit that was not true.', ['Correct: after “didn’t”, use the base form “use to”.','After “didn’t”, do not add -ed to “use”.','The negative past-habit form is “didn’t use to”, not “wasn’t use to”.']),
        translatorQuestion('كان بإمكانها السباحة عندما كانت صغيرة.', ['She can swim when she was young.','She could swim when she was young.','She could swam when she was young.'], 1, 'Use the past form of “can” for ability in the past.', ['“Can” is present; the sentence refers to her childhood.','Correct: “could swim” describes past ability.','After “could”, use the base verb “swim”, not “swam”.'])
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
        translatorQuestion('لو كنت مكانك، لطلبت توضيحاً.', ['If I am you, I will ask for clarification.','If I were you, I would ask for clarification.','If I was you, I would asked for clarification.'], 1, 'This is a hypothetical way of giving advice.', ['The present form does not express the hypothetical situation.','Correct: “If I were you” pairs with would + base verb for advice.','The result verb should be the base form after would.']),
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
      translatorQuestion("لم أكن لأصل في الوقت المحدد لولا مساعدتك.", ["I wouldn't have arrived on time if you hadn't helped me.","I wouldn't arrive on time unless you didn't help me.","I hadn't arrived on time if you wouldn't help me."], 0, "The sentence describes a past result that depended on a different past situation.", ["Correct: this is a third conditional: the past perfect condition (“if you hadn’t helped”) leads to an unreal past result (“wouldn’t have arrived”).","The negative forms make the condition contradictory and change the intended meaning.","The auxiliaries are in the wrong clauses; “would” does not normally go in this if-clause."]),
      translatorQuestion("من المتوقع أن تنخفض الأسعار خلال الأشهر المقبلة.", ["Prices are expected to fall over the coming months.","Prices expect to fall during the next months.","It is expecting prices fall in the coming months."], 0, "Look for the impersonal passive structure used to report expectations.", ["Correct: “are expected to” is a natural passive reporting structure.","Prices do not perform the act of expecting; the passive form is needed.","The structure is ungrammatical; use “it is expected that” or “prices are expected to”."]),
      translatorQuestion("كان من المفترض أن تكون قد أرسلت التقرير بالفعل.", ["You should have sent the report by now.","You must send the report by now yesterday.","You should send the report already."], 0, "This expresses an expectation about an action that should already have happened.", ["Correct: “should have” + past participle refers to an expected past action.","The time reference and verb forms conflict.","This describes a present or future recommendation, not an uncompleted past expectation."]),
      translatorQuestion("لم أعتد على الاستيقاظ مبكراً، لكنني بدأت أفعل ذلك.", ["I didn't use to wake up early, but I've started doing it.","I wasn't used to wake up early, but I started do it.","I didn't used to waking up early, but I start doing it."], 0, "Distinguish a past habit from being familiar with an activity.", ["Correct: “didn't use to” describes a past habit; “started doing” is natural.","“Be used to” takes a noun or -ing form, and “started” needs an -ing form or infinitive.","After “didn't”, use “use”; the second clause also needs a consistent tense."]),
      translatorQuestion("كلما قرأت أكثر، أصبحت أكثر وعياً بالفروق الدقيقة.", ["The more I read, the more aware I became of the nuances.","More I read, more aware I became for the nuances.","The most I read, I became more aware about nuances."], 0, "This is a paired comparative structure.", ["Correct: “the more…, the more…” expresses linked change; “aware of” is the right collocation.","Both instances of “the” are missing, and “aware for” is incorrect.","The superlative “most” does not fit this paired comparison."]),
      translatorQuestion("لم يكن القرار سهلاً، ومع ذلك كان ضرورياً.", ["Difficult as the decision was, it was necessary.","Although difficult the decision was, it was necessary.","Despite the decision was difficult, it was necessary."], 0, "Choose a concessive structure that can place an adjective before the subject and verb.", ["Correct: adjective + “as” + subject + verb is a formal concessive pattern.","This word order is not grammatical; use “although the decision was difficult”.","“Despite” is followed by a noun or -ing form, not a full clause."]),
      translatorQuestion("يبدو أنهم أساؤوا فهم ما قلته.", ["They seem to have misunderstood what I said.","They seem that they misunderstood what I said.","They are seeming to misunderstand what I had said."], 0, "The misunderstanding happened before the present impression.", ["Correct: “seem to have” + past participle marks an earlier action.","Use “seem to” before a verb, not “seem that” in this construction.","“Seem” is not normally used in the continuous here, and the time relationship is awkward."]),
      translatorQuestion("كان ينبغي ألا نستخف بتحذيره.", ["We shouldn't have dismissed his warning.","We shouldn't dismissed his warning.","We mustn't have dismissing his warning."], 0, "This is criticism or regret about a past action.", ["Correct: “shouldn't have” + past participle expresses that a past action was a mistake.","The auxiliary “have” is missing.","The modal and verb forms do not create the intended past criticism."]),
      translatorQuestion("لا أمانع تأجيل الاجتماع ما دام الجميع موافقاً.", ["I don't mind the meeting being postponed as long as everyone agrees.","I don't mind to postpone the meeting provided everyone agreeing.","I don't mind the meeting postponed as long everyone agrees."], 0, "After “mind”, use an -ing form; the condition needs a complete clause.", ["Correct: “mind” takes an -ing form, and “as long as” introduces a condition.","“Mind” is not followed by “to” here, and “everyone agreeing” is not a finite clause.","The passive -ing form and “as long as” structure are incomplete."]),
      translatorQuestion("لم تكن المشكلة في التكلفة بقدر ما كانت في ضيق الوقت.", ["The problem was less the cost than the lack of time.","The problem was fewer the cost than the time shortage.","The problem wasn't cost as much the lack of time."], 0, "Look for a balanced comparison between two explanations.", ["Correct: “less A than B” contrasts the relative importance of two things.","“Fewer” is used with countable plural nouns, not “the cost”.","The comparison needs “not so much A as B” or “less A than B”."]),
      translatorQuestion("يُقال إن المبنى صُمم على يد مهندس محلي.", ["The building is said to have been designed by a local engineer.","The building says to be designed from a local engineer.","It is said the building designed by a local engineer."], 0, "Report a past design using a passive infinitive after a reporting verb.", ["Correct: “is said to have been designed” reports an earlier passive action.","The building cannot “say”; “from” is also the wrong preposition for the agent.","The clause is missing the correct passive verb structure."]),
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
        translatorQuestion('لم يكن تعليقها قاسياً بقدر ما كان صريحاً على نحو غير معتاد.', ['Her comment was unusually harsh, despite being expressed with considerable tact.', 'Her comment was not so much harsh as unusually candid.', 'Her comment was harsh precisely because it was unusually candid.'], 1, 'Use a balanced contrast that corrects the first impression without denying it completely.', ['This reverses the nuance: it describes the comment as unusually harsh and tactful, rather than correcting an impression of harshness towards unusual candour.', 'Correct: “not so much A as B” shifts the emphasis towards the more accurate description.', 'This reverses the relationship by claiming that candour itself made the comment harsh.']),
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
        translatorQuestion('لم يكن صمته دليلاً على الموافقة؛ وربما كان، على العكس، علامة على تحفظه.', ['His silence could reasonably be taken as tacit agreement, even if he had not said so.', 'His silence was not necessarily evidence of agreement; it may simply have reflected his lack of information about the matter.', 'His silence was not necessarily a sign of agreement; if anything, it may have indicated reservations.'], 2, 'The sentence first rejects a confident inference, then cautiously suggests a possible alternative explanation.', ['This treats silence as tacit agreement, directly contradicting the opening clause.', 'This offers a different possible explanation—lack of information—rather than the reservations suggested by the Arabic.', 'Correct: “not necessarily”, “if anything” and “indicated reservations” preserve the measured inference.']),
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
        translatorQuestion('لم يكن اعتذارها اعترافاً بالمسؤولية بقدر ما كان محاولة لاحتواء الموقف.', ['Her apology amounted to an admission of responsibility and an attempt to contain the situation.', 'Her apology was less an admission of responsibility than an attempt to contain the situation.', 'Her apology was neither responsible nor an attempt to settle the situation.'], 1, 'Preserve the distinction between accepting blame and managing the situation.', ['This makes the apology an admission of responsibility, which the Arabic carefully distinguishes from its purpose.', 'Correct: “less … than …” captures the contrast, while “contain the situation” preserves the idea of managing or limiting its impact.', 'This misreads the contrast and uses “responsible” in the wrong sense.']),
        translatorQuestion('لا يخلو هذا التفسير من وجاهة، لكنه يفترض ما يسعى إلى إثباته.', ['The interpretation has some merit, but it assumes what it sets out to prove.', 'The interpretation is entirely unfounded because it proves its own assumptions.', 'The interpretation may be persuasive, provided its assumptions are first proved.'], 0, 'Identify the concise name for an argument that takes its conclusion for granted.', ['Correct: “has some merit” is measured praise; “assumes what it sets out to prove” describes circular reasoning.', 'This dismisses the interpretation outright, whereas the Arabic concedes that it has some merit.', 'This changes the criticism into a condition for accepting the interpretation.']),
        translatorQuestion('كان صمته قابلاً للتأويل، ولا سيما في ضوء ما قيل قبله.', ['His silence was unmistakable, particularly given what had been said beforehand.', 'His silence could be interpreted in several ways, especially in light of what had been said earlier.', 'His silence was an interpretation of the remarks that preceded it.'], 1, 'The wording leaves the meaning open rather than assigning one definite motive.', ['“Unmistakable” removes the ambiguity; the Arabic says the silence can be interpreted.', 'Correct: “could be interpreted” preserves ambiguity and “in light of” links it to the preceding remarks.', 'This reverses the relationship: the silence is being interpreted, not interpreting earlier remarks.']),
        translatorQuestion('لم يبدد التوضيح الالتباس بقدر ما نقل موضعه إلى نقطة أخرى.', ['The clarification eliminated the confusion and settled the remaining point.', 'The clarification did not merely shift the emphasis; it resolved the underlying ambiguity.', 'The clarification did less to dispel the confusion than to relocate it elsewhere.'], 2, 'The clarification changes where the uncertainty lies; it does not remove it.', ['This claims the confusion was eliminated, the opposite of the stated outcome.', 'This says the underlying ambiguity was resolved, which overstates the effect.', 'Correct: “less to … than to …” captures the shift, and “relocate it” is concise and precise.']),
        translatorQuestion('ينبغي ألا نخلط بين ما يمكن استنتاجه وما نرغب في أن يكون صحيحاً.', ['We should not conflate what can be inferred with what we would like to be true.', 'We should distinguish what we want to infer from what is demonstrably false.', 'We must not confuse our preferred conclusion with what can be proved beyond doubt.'], 0, 'Keep the contrast between evidence-based inference and personal preference without strengthening either side.', ['Correct: “conflate A with B” is the precise collocation and preserves the distinction.', 'This changes the second category into something demonstrably false, which the Arabic does not say.', '“Proved beyond doubt” is much stronger than “can be inferred”.']),
        translatorQuestion('لم يكن تحفظه اعتراضاً على المبدأ، وإنما على اتساع نطاق تطبيقه.', ['His reservation concerned the principle itself, rather than the breadth of its application.', 'His reservation was not about the principle as such, but about the breadth of its application.', 'He objected to applying the principle broadly because he rejected it in principle.'], 1, 'The reservation targets the scope of implementation, not the underlying principle.', ['This reverses the contrast and makes the principle itself the concern.', 'Correct: “not … as such, but …” draws the distinction cleanly and “breadth of its application” is precise.', 'This invents a rejection of the principle and contradicts the Arabic.']),
        translatorQuestion('قد يكون الاستنتاج صحيحاً، لكن الطريق الذي قاد إليه لا يخلو من قفزات منطقية.', ['The conclusion may be correct, although the reasoning leading to it contains no logical gaps.', 'The conclusion is necessarily false because the argument is incomplete.', 'The conclusion may be right, but the reasoning behind it involves a few logical leaps.'], 2, 'Do not confuse a possible conclusion with the soundness of the reasoning used to reach it.', ['This removes the criticism by claiming there are no logical gaps.', 'This treats flawed reasoning as proof that the conclusion itself is false.', 'Correct: “may be right” preserves the qualification, while “logical leaps” conveys unsupported steps.']),
        translatorQuestion('لم يكن الخلاف حول الوقائع بقدر ما كان حول الإطار الذي وُضعت فيه.', ['The disagreement was less about the facts themselves than about the framework in which they were presented.', 'The disagreement concerned the facts, which had been framed in a less controversial way.', 'The parties agreed on the framework but disputed whether the facts were accurate.'], 0, 'The dispute concerns interpretation and framing, not necessarily the factual record.', ['Correct: “less about … than about …” preserves the focus on framing rather than the facts.', 'This says the facts were presented less controversially, not that the framework was disputed.', 'This reverses the two points of disagreement.']),
        translatorQuestion('كان في عبارته ما يوحي بأنه يقرّ بالنتيجة من حيث المبدأ، ويتحفظ على تبعاتها.', ['His wording made it clear that he rejected both the conclusion and its implications.', 'There was something in his phrasing to suggest that he accepted the conclusion in principle while having reservations about its implications.', 'His phrasing suggested that he accepted the implications but remained unsure of the conclusion.'], 1, 'Distinguish accepting a proposition in principle from accepting everything that follows from it.', ['This turns a qualified acceptance into outright rejection.', 'Correct: “accepted … in principle” and “reservations about its implications” preserve the subtle distinction.', 'This reverses the relationship between the conclusion and its consequences.']),
        translatorQuestion('ليس المقصود أن نغض الطرف عن التناقض، بل أن نحدد مدى تأثيره في الحجة.', ['The point is to overlook the contradiction so that the argument remains persuasive.', 'The point is to determine whether the argument contains any contradiction at all.', 'The point is not to gloss over the contradiction, but to assess the extent to which it affects the argument.'], 2, 'The speaker calls for assessing the consequence of the contradiction, not ignoring it.', ['This directly contradicts the instruction not to overlook the contradiction.', 'This changes the task from evaluating its impact to checking whether it exists.', 'Correct: “not … but …” preserves the contrast; “assess the extent to which it affects” matches the Arabic without assuming the contradiction necessarily undermines the argument.']),
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
        translatorQuestion('لا تكمن المفارقة في أن التوقعات لم تتحقق، بل في أن تحققها كان سيُعدّ إخفاقاً.', ['The paradox is that expectations were met, although failing to meet them would have counted as a failure.', 'The paradox lies not in the expectations going unmet, but in their being met having counted as a failure.', 'The paradox is that the failure to meet expectations was itself considered a success.'], 1, 'The surprising point is the reversal of the usual evaluation: fulfilment, not failure to fulfil, would be failure.', ['This shifts the paradox to the opposite situation: it says expectations were met and that failing to meet them would have counted as a failure.', 'Correct: “not in … but in …” keeps the paradoxical contrast and the perfect gerund marks the hypothetical fulfilment.', 'This changes the paradox into a different claim about failure being called success.']),
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
  let selectedMazeCEFR = null;
  let selectedTrainingMode = null;

  const THINK_LAB_CEFR_LEVELS = ['A1','A2','B1','B2','C1','C2'];
  function currentThinkLabCEFR() {
    const bridge = window.EpiphanyThinkLab;
    const level = bridge && typeof bridge.getCEFRLevel === 'function' ? bridge.getCEFRLevel() : 'A1';
    return THINK_LAB_CEFR_LEVELS.includes(level) ? level : 'A1';
  }
  function hasThinkLabDeveloperAccess() {
    return !!(window.EpiphanyAuth && typeof window.EpiphanyAuth.isDeveloper === 'function' && window.EpiphanyAuth.isDeveloper());
  }
  function availableThinkLabCEFRLevels() {
    if (hasThinkLabDeveloperAccess()) return THINK_LAB_CEFR_LEVELS.slice();
    return THINK_LAB_CEFR_LEVELS.slice(0, THINK_LAB_CEFR_LEVELS.indexOf(currentThinkLabCEFR()) + 1);
  }
  function canChooseThinkLabCEFR(level) {
    return THINK_LAB_CEFR_LEVELS.includes(level) && (hasThinkLabDeveloperAccess() || availableThinkLabCEFRLevels().includes(level));
  }
  let mode = null, index = 0, score = 0, locked = false, clueCount = 0, oddHintStep = 0, ladderPath = [], ladderWordNote = null, ladderMistakeRecorded = false, roundMistakes = 0, activePool = null, activeDifficulty = null, forgePlaced = [], scramblePlaced = [], connectionSelected = [], chainStepIndex = 0, chainPath = [], chainExplanations = [];

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
    {start:'book',goal:'tail',path:['cook','cool','pool','poll','pole','pale','tale','tall','tail'],hint:'A longer challenge: solve one small step at a time. Every intermediate word is part of the puzzle.',explain:'book → cook → cool → pool → poll → pole → pale → tale → tall → tail is a valid ladder.'},
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
cat bat bet bed bad bag bog dog cot dot hot pot top mop map cap cop cup cut cold cord card ward warm word worm form farm harm hard yard bald bold ball fall fell feel feet meet meat heat head heal teal tell tall tail belt bell care dare date late gate game came same sale pale pail pull poll pole pool cool cook book boot boat coat cost cast sand band bend bent sent send tend tent test best vest west went want pant part cart case cash dash dish fish wish wash goat ring sing sink silk milk mild wild will wall walk talk tale tame time lime line wine wind mind mine fine fire five hive have hate make take lake like tide ride side site bite bike hike hide wide wife wise rise rice nice nine pine pane pain pair fair fail call calm palm bark dark core hand land lane data melt beat cake cane hall live well bake cave cell fame fate felt hire lend life name nest rate rent rest wing bill cage cape file fill find firm full gave mail meal mile paid park past pile save seat sell
    `.trim().split(/\s+/));
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
  const LADDER_RECENT_HISTORY_KEY = 'epiphany-word-ladder-recent-v1';
  function getRecentLadderPairs() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LADDER_RECENT_HISTORY_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(key => typeof key === 'string') : [];
    } catch (_) {
      return [];
    }
  }
  function rememberLadderPairs(items) {
    try {
      const recent = getRecentLadderPairs();
      const added = items.map(item => [item.start, item.goal].sort().join(':'));
      window.localStorage.setItem(LADDER_RECENT_HISTORY_KEY, JSON.stringify([...recent, ...added].slice(-60)));
    } catch (_) {
      // Private browsing or storage restrictions should never prevent a round from starting.
    }
  }
  function generateWordLadders(level, count = 12) {
    // Keep route-length bands distinct: support changes by mode, and so does puzzle complexity.
    const minSteps = level === 'challenge' ? 5 : level === 'steady' ? 3 : 1;
    const maxSteps = level === 'guided' ? 2 : level === 'steady' ? 4 : 7;
    const candidates = [], words = [...ladderWordBank];

    // Run one BFS per start word, then reuse its shortest paths for every goal.
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

    // Treat a ladder and its reverse as the same puzzle; avoid the last 60 across sessions.
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const recent = new Set(getRecentLadderPairs());
    const fresh = candidates.filter(item => !recent.has([item.start, item.goal].sort().join(':')));
    const chosen = [], selectedPairs = new Set();
    for (const item of fresh) {
      const key = [item.start, item.goal].sort().join(':');
      if (selectedPairs.has(key)) continue;
      chosen.push(item);
      selectedPairs.add(key);
      if (chosen.length >= count) break;
    }
    if (chosen.length < Math.min(6, count)) {
      // If storage contains stale or excessive history, fall back to a fresh randomized pool.
      chosen.splice(0, chosen.length, ...candidates.slice(0, count));
    }
    rememberLadderPairs(chosen);
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
    if (id === 'maze') {
      const tools = window.EPIPHANY_SOUND_MAZE_TOOLS;
      const bank = window.EPIPHANY_SOUND_MAZE_BANK;
      const trainingMode = ['guided','steady','challenge'].includes(level) ? level : 'steady';
      if (!tools || !bank) return [];
      return tools.selectRound(bank, selectedMazeCEFR || 'A1', trainingMode).questions;
    }
    if (id === 'odd') return []; // No browser-side bank or offline fallback.
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
    if (id === 'scramble') return []; // Sentence Scramble questions and answer keys are issued only by the trusted server validator.
    if (id === 'chain') return []; // Chain Reaction questions are issued only by the trusted server validator.
    if (id === 'forge') {
      const bank = window.EPIPHANY_WORD_FORGE_BANK;
      const trainingMode = ['guided','steady','challenge'].includes(level) ? level : 'steady';
      return [];
    }
    if (id === 'connections') {
      const bank = window.EPIPHANY_WORD_CONNECTIONS_BANK;
      const trainingMode = ['guided','steady','challenge'].includes(level) ? level : 'steady';
      return bank ? bank.selectRound(trainingMode) : [];
    }
    if (level === 'guided' && guidedRounds[id]) return guidedRounds[id];
    if (level === 'challenge' && challengeRounds[id]) return challengeRounds[id];
    if (id === 'wordladder') return generateWordLadders(level, 12);
    if (id === 'connections') return rounds[id];
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
    {id:'translator',num:'02',icon:'⇄',name:'The Bold Translator',tag:'NATURAL ENGLISH',desc:'Choose the sentence a real speaker would use—not a word-for-word translation.',time:'2–3 min'},
    {id:'wordladder',num:'03',icon:'↗',name:'Word Ladder',tag:'SPELLING & LOGIC',desc:'Transform one word into another, changing just one letter per step.',time:'3–5 min'},
    {id:'maze',num:'04',icon:'⌁',name:'The Sound Maze',tag:'LISTENING & PRONUNCIATION',desc:'Listen to the target word and find the matching word to move through the maze.',time:'2–3 min'},
    {id:'connections',num:'05',icon:'▦',name:'Word Connections',tag:'CATEGORIES & PATTERNS',desc:'Find the category that connects a group of four words.',time:'5–7 min'},
    {id:'scramble',num:'06',icon:'↔',name:'Sentence Scramble',tag:'SENTENCE BUILDING',desc:'Study mixed-up words and build a natural English sentence.',time:'5–8 min'},
    {id:'forge',num:'07',icon:'✳',name:'Word Forge',tag:'SPELLING & VOCABULARY',desc:'Use a letter set and a clue to identify the word.',time:'2–3 min'},
    {id:'chain',num:'08',icon:'⤳',name:'Chain Reaction',tag:'WORD ASSOCIATION',desc:'Continue a chain by choosing the strongest word association.',time:'2–3 min'},
    {id:'wordhunt',num:'09',icon:'⌕',name:'Word Hunt',tag:'HIDDEN WORD SEARCH',desc:'Find themed English words in a letter grid as the search directions grow more challenging.',time:'At your own pace'},
    {id:'codebreaker',num:'10',icon:'⌘',name:'Codebreaker',tag:'CIPHER & DEDUCTION',desc:'Decode encrypted messages by discovering the letter-substitution key.',time:'At your own pace'},
    {id:'lettergrid',num:'11',icon:'⌗',name:'Letter Path',tag:'STRAIGHT-LINE WORD SEARCH',desc:'Find hidden words running across, down, or diagonally through a crowded letter grid.',time:'At your own pace'}
  ];
  const INTERNAL_SESSION_BANK_VERSION = 'think-lab-rounds-20261109-v1';
  let restoringInternalSession = false;
  let validatorSessionId = null;
  let validatorClientForSession = null;
  let validatorFunctionName = null;
  let validatorGuestToken = null;
  let dailyChallengeActive = null;
  function localDayKey(date = new Date()) {
    return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
  }
  function seededDailyRandom(seed) {
    let value = seed >>> 0;
    return function () {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function availableDailyGameIds(level) {
    const ids = [];
    ids.push('odd'); // Server-validated for guests and signed-in players.
    if (translatorBanks[level]?.steady?.length) ids.push('translator');
    if (window.EPIPHANY_SOUND_MAZE_BANK?.levels?.[level]?.steady?.length && window.EPIPHANY_SOUND_MAZE_TOOLS) ids.push('maze');
    if (ladderWordBank && ladderWordBank.size) ids.push('wordladder');
    if (window.EPIPHANY_WORD_CONNECTIONS_BANK && typeof window.EPIPHANY_WORD_CONNECTIONS_BANK.selectRound === 'function') ids.push('connections');
    if (window.navigator?.onLine !== false) ids.push('scramble');
    if (window.navigator?.onLine !== false) ids.push('chain'); // The question bank and answer key are held by the shared server validator.
    return ids;
  }
  function todayDailyChallenge() {
    const progression = window.EPIPHANY_THINK_LAB_PROGRESSION;
    if (!progression || typeof progression.selectDailyChallenge !== 'function') return null;
    const date = localDayKey(), saved = window.EpiphanyThinkLab?.getDailyChallenge?.(date);
    if (saved) return saved;
    const level = currentThinkLabCEFR();
    return progression.selectDailyChallenge({date,level,availableGameIds:availableDailyGameIds(level)});
  }
  function dailyChallengeMarkup() {
    const selection = todayDailyChallenge();
    if (!selection) return '<div class="tl-daily-challenge"><div><span class="tl-eyebrow">TODAY IN THINK LAB</span><strong>Daily challenge</strong><p>The approved challenge for your current level is not available yet.</p></div></div>';
    const game = games.find(item => item.id === selection.gameId), completed = selection.status === 'completed', active = selection.status === 'active';
    return '<div class="tl-daily-challenge"><div class="tl-daily-challenge-copy"><span class="tl-eyebrow">DAILY · '+esc(selection.level)+'</span><strong>Daily challenge</strong><p>'+(completed?'Completed for today. A new challenge arrives tomorrow.':active?'Your challenge is saved. Continue where you left off.':'One focused challenge from an approved Think Lab game.')+'</p><small>'+(game?esc(game.name):'Think Lab')+'</small></div><button type="button" class="tl-next" data-think-daily '+(completed?'disabled':'')+'>'+(completed?'✓ Completed':active?'Continue challenge ↗':'Start daily challenge ↗')+'</button></div>';
  }
  function beginDailyChallenge() {
    const selection = todayDailyChallenge();
    if (!selection || selection.status === 'completed') return false;
    const bridge = window.EpiphanyThinkLab, saved = bridge?.startDailyChallenge?.(selection);
    if (!saved || saved.status === 'completed') { landing(); return false; }
    dailyChallengeActive = saved;
    if (saved.gameId === 'maze') { selectedMazeCEFR=saved.level; preparedMazeCEFR=null; activePool=null; }
    if (saved.gameId === 'translator') selectedTranslatorCEFR=saved.level;
    if (saved.snapshot && resumeInternalGame(saved.gameId,saved)) return true;
    beginGame(saved.gameId,'steady',{daily:true});
    return true;
  }
  function saveInternalProgress(position = index) {
    const bridge = window.EpiphanyThinkLab, registry = window.EPIPHANY_THINK_LAB_PROGRESSION;
    const definition = registry && registry.getGame ? registry.getGame(mode) : null;
    if (validatorSessionId || restoringInternalSession || !bridge || !definition || definition.adapter !== 'think-lab' || !Array.isArray(activePool) || !activePool.length) return false;
    const nextItem=position>index?activePool[position]:null;
    const payload = {
      pool:activePool, score,
      roundMistakes:nextItem?0:roundMistakes, clueCount:nextItem?0:clueCount, oddHintStep:nextItem?0:oddHintStep,
      ladderPath:nextItem?[]:ladderPath.slice(), ladderWordNote:nextItem?null:ladderWordNote,
      ladderMistakeRecorded:nextItem?false:ladderMistakeRecorded,
      forgePlaced:nextItem&&mode==='forge'?Array((nextItem.letters||'').length).fill(null):forgePlaced.slice(),
      scramblePlaced:nextItem&&mode==='scramble'?Array((nextItem.words||[]).length).fill(null):scramblePlaced.slice(),
      connectionWords:mode==='connections'&&!nextItem?[...root.querySelectorAll?.('[data-connection-tile]')||[]].filter(button=>connectionSelected.includes(Number(button.dataset.connectionTile))).map(button=>button.textContent.trim()):[],
      chainStepIndex:nextItem?0:chainStepIndex, chainPath:nextItem?[]:chainPath.slice(),
      cefrLevel:mode==='maze'?selectedMazeCEFR:mode==='translator'?selectedTranslatorCEFR:null
    };
    const snapshot = {bankVersion:INTERNAL_SESSION_BANK_VERSION,level:selectedTrainingMode,trainingMode:selectedTrainingMode,position,payload};
    const result = dailyChallengeActive && dailyChallengeActive.gameId === mode
      ? bridge.saveDailyChallengeSnapshot?.(dailyChallengeActive.date,mode,snapshot)
      : bridge.saveGameSnapshot?.(mode,snapshot);
    return !!(result && result.saved);
  }
  function internalResumeMarkup() {
    const bridge=window.EpiphanyThinkLab,registry=window.EPIPHANY_THINK_LAB_PROGRESSION;
    if(!bridge?.getGameHistory||!bridge?.getGameSnapshot||!registry?.getGame)return '';
    const history=bridge.getGameHistory(),recent=Array.isArray(history.recentGames)?history.recentGames:[];
    const cards=[];
    for(const id of recent){
      const definition=registry.getGame(id);
      if(!definition||definition.adapter!=='think-lab')continue;
      const snapshot=bridge.getGameSnapshot(id,{bankVersion:INTERNAL_SESSION_BANK_VERSION});
      if(!snapshot||!snapshot.payload||!Array.isArray(snapshot.payload.pool))continue;
      cards.push('<div class="tl-game-card tl-resume-card"><div class="tl-game-kicker">SAVED SESSION</div><p>Continue '+esc(definition.name)+' · '+esc(snapshot.trainingMode.toUpperCase())+' · Round '+Math.min(snapshot.position+1,snapshot.payload.pool.length)+' of '+snapshot.payload.pool.length+'</p><button type="button" class="tl-next" data-think-resume="'+esc(id)+'">Resume session ↗</button></div>');
    }
    return cards.length?'<section class="tl-resume-sessions" aria-label="Saved Think Lab sessions">'+cards.join('')+'</section>':'';
  }
  function resumeInternalGame(id, dailyRecord = null) {
    const bridge=window.EpiphanyThinkLab,registry=window.EPIPHANY_THINK_LAB_PROGRESSION;
    const definition=registry?.getGame?.(id);
    const savedDaily = dailyRecord || null;
    const dailySnapshot = savedDaily && savedDaily.status === 'active' && savedDaily.gameId === id ? savedDaily.snapshot : null;
    const snapshot = dailySnapshot || bridge?.getGameSnapshot?.(id,{bankVersion:INTERNAL_SESSION_BANK_VERSION});
    dailyChallengeActive = dailySnapshot ? savedDaily : null;
    const p=snapshot?.payload;
    if(!definition||definition.adapter!=='think-lab'||!snapshot||!p||!Array.isArray(p.pool)||!p.pool.length||p.pool.length>24||
       !['guided','steady','challenge'].includes(snapshot.trainingMode)||snapshot.level!==snapshot.trainingMode||
       !Number.isInteger(snapshot.position)||snapshot.position<0||snapshot.position>p.pool.length||
       !Number.isInteger(p.score)||p.score<0||p.score>p.pool.length||p.pool.some(item=>!item||typeof item!=='object'||Array.isArray(item)))return false;
    if(id==='maze'&&(!THINK_LAB_CEFR_LEVELS.includes(p.cefrLevel)||!canChooseThinkLabCEFR(p.cefrLevel)))return false;
    if(id==='translator'&&p.cefrLevel!=='adaptive'&&(!THINK_LAB_CEFR_LEVELS.includes(p.cefrLevel)||!canChooseThinkLabCEFR(p.cefrLevel)))return false;
    const current=p.pool[snapshot.position]||p.pool[p.pool.length-1];
    if(id==='wordladder'&&(!current||typeof current.start!=='string'||typeof current.goal!=='string'||!Array.isArray(p.ladderPath)||p.ladderPath.some(word=>typeof word!=='string')))return false;
    if(id==='chain'&&(!current||!Array.isArray(current.links)||!Number.isInteger(p.chainStepIndex)||p.chainStepIndex<0||p.chainStepIndex>=current.links.length))return false;
    if(id==='forge'&&(!Array.isArray(p.forgePlaced)||p.forgePlaced.length!==(current.letters||'').length||p.forgePlaced.some(value=>value!==null&&(!Number.isInteger(value)||value<0||value>=String(current.letters||'').length))))return false;
    if(id==='scramble'&&(!Array.isArray(p.scramblePlaced)||p.scramblePlaced.length!==(current.words||[]).length||p.scramblePlaced.some(value=>value!==null&&(!Number.isInteger(value)||value<0||value>=current.words.length))))return false;
    mode=id;pickerGameId=id;pickerStage='game';selectedTrainingMode=snapshot.trainingMode;activePool=p.pool;
    index=snapshot.position;score=p.score;roundMistakes=Math.max(0,Number(p.roundMistakes)||0);clueCount=Math.max(0,Number(p.clueCount)||0);
    oddHintStep=Math.max(0,Math.min(2,Number(p.oddHintStep)||0));ladderPath=Array.isArray(p.ladderPath)?p.ladderPath.slice():[];
    ladderWordNote=p.ladderWordNote&&typeof p.ladderWordNote==='object'?p.ladderWordNote:null;
    ladderMistakeRecorded=!!p.ladderMistakeRecorded;forgePlaced=Array.isArray(p.forgePlaced)?p.forgePlaced.slice():[];
    scramblePlaced=Array.isArray(p.scramblePlaced)?p.scramblePlaced.slice():[];
    connectionSelected=[];chainStepIndex=Math.max(0,Number(p.chainStepIndex)||0);chainPath=Array.isArray(p.chainPath)?p.chainPath.slice():[];
    selectedMazeCEFR=id==='maze'?p.cefrLevel:null;selectedTranslatorCEFR=id==='translator'?(p.cefrLevel||'adaptive'):'adaptive';
    const hintLevel=selectedTrainingMode==='guided'?2:selectedTrainingMode==='steady'?1:0;
    activeDifficulty=Object.assign({},difficultyForMode(id),{level:selectedTrainingMode,hintLevel});locked=false;
    bridge.recordGameStart?.(id,{level:id==='maze'?selectedMazeCEFR:id==='translator'?selectedTranslatorCEFR:selectedTrainingMode,trainingMode:selectedTrainingMode});
    if(index>=activePool.length){
      root.innerHTML='<div class="tl-finish"><span class="tl-finish-mark">∴</span><span class="tl-eyebrow">CASE FILE CLOSED</span><h2>Good thinking.</h2><p>You solved <b>'+score+' of '+activePool.length+'</b> challenges. Your saved session is complete.</p><button type="button" class="tl-next" data-think-restart>Try another case ↗</button><button type="button" class="tl-back" data-think-home>Back to Think Lab</button></div>';
      if(dailyChallengeActive&&dailyChallengeActive.gameId===id){const result=bridge.completeDailyChallenge?.(dailyChallengeActive.date,id);if(result?.completed)dailyChallengeActive=null;}else bridge.clearGameSnapshot?.(id);
      bridge.recordGameCompletion?.(id,'session');
      mode=null;activePool=null;activeDifficulty=null;pickerStage='landing';pickerGameId=null;return true;
    }
    restoringInternalSession=true;renderGame();restoringInternalSession=false;
    if(id==='forge'){forgePlaced=p.forgePlaced.slice();refreshPuzzleBoard('forge');}
    if(id==='scramble'){scramblePlaced=p.scramblePlaced.slice();refreshPuzzleBoard('scramble');}
    if(id==='connections'&&Array.isArray(p.connectionWords)){
      const tiles=[...root.querySelectorAll('[data-connection-tile]')];
      connectionSelected=p.connectionWords.map(word=>tiles.findIndex(button=>button.textContent.trim()===word)).filter(value=>value>=0);
      tiles.forEach(button=>{const selected=connectionSelected.includes(Number(button.dataset.connectionTile));button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));});
      const count=root.querySelector('[data-connection-count]');if(count)count.textContent=connectionSelected.length+' / 4 selected';
    }
    saveInternalProgress(index);return true;
  }
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
    const recommendation = data && data.recommendation ? data.recommendation : focus;
    const measured = skills.filter(x=>x.attempts>0).length;
    const total = data ? data.totalAttempts : 0;
    const correct = data ? data.totalCorrect : 0;
    const bar = skills.map(skill => {
      const value = skill.accuracy === null ? 0 : skill.accuracy;
      const stateLabel = skill.attempts === 0 ? 'Not tested' : skill.accuracy + '% · ' + skill.attempts + ' answers';
      return '<div class="tl-skill-row"><div class="tl-skill-label"><span>'+esc(skill.label)+'</span><b>'+(skill.accuracy===null?'—':skill.accuracy+'%')+'</b></div><div class="tl-skill-track" role="img" aria-label="'+esc(skill.label)+': '+esc(stateLabel)+'"><span style="width:'+value+'%"></span></div><small>'+esc(stateLabel)+'</small></div>';
    }).join('');
    return '<section class="tl-mastery" aria-labelledby="tl-mastery-title"><div class="tl-section-heading"><div><span class="tl-eyebrow">YOUR LEARNING SIGNALS</span><h3 id="tl-mastery-title">Skill map</h3><p>Accuracy is based on your recorded answers—not a guess about your overall English level.</p></div><div class="tl-mastery-count"><b>'+total+'</b><span>answers tracked</span></div></div><div class="tl-mastery-grid"><div class="tl-skill-list">'+bar+'</div><aside class="tl-recommendation"><span class="tl-recommendation-mark">↗</span><span class="tl-case-tag">YOUR NEXT CHALLENGE</span><h4>'+esc(recommendation.title || recommendation.label)+'</h4><p>'+esc(recommendation.hint)+'</p><div class="tl-recommendation-stat">'+(recommendation.attempts ? (recommendation.accuracy+'% accuracy · '+recommendation.attempts+' answers') : 'Building your practice history')+'</div><p class="tl-recommendation-reason">'+esc(recommendation.reason)+'</p>'+(recommendation.game ? '<button type="button" class="tl-next" data-think-recommended="'+esc(recommendation.game)+'">Play this game ↗</button>' : '<p class="tl-recommendation-reason">No eligible game is available yet.</p>')+'</aside></div><p class="tl-mastery-foot">'+(total ? 'So far: '+correct+' correct out of '+total+'. Keep practising to make the map more reliable.' : 'Your map will fill in as you answer challenges. Skills without data are marked “Not tested”.')+'</p></section>';
  }
  function landing() {
    mode = null;
    const resumeMarkup = internalResumeMarkup();
    root.innerHTML = '<div class="tl-mission"><div><span class="tl-eyebrow"><i></i> THINKING MODE · ENGLISH INSIDE</span><h2>Don’t just play.<br><em>Figure it out.</em></h2><p>Every challenge is a small case to solve. Notice patterns, connect evidence and discover why one answer fits better than another.</p><div class="tl-mission-meta"><span>⌁ Logic</span><span>◉ Context</span><span>⇄ Expression</span></div></div><div class="tl-orbit" aria-hidden="true"><span class="tl-orbit-core">EP<span>·</span></span><i class="tl-node tl-node-a">?</i><i class="tl-node tl-node-b">A≠B</i><i class="tl-node tl-node-c">∴</i><i class="tl-link tl-link-a"></i><i class="tl-link tl-link-b"></i></div></div>'+insightsMarkup()+'<div class="tl-daily"><div><span class="tl-eyebrow">EXPLORE THINK LAB</span><h3>11 challenges. One sharper mind.</h3><p>Choose from eleven distinct games covering vocabulary, listening, spelling, language patterns and deduction. Every challenge explains the reasoning behind the answer.</p></div>'+dailyChallengeMarkup()+'<span class="tl-case-stamp">THINK LAB<br><b>11 GAMES</b></span></div>'+resumeMarkup+'<div class="tl-cases">'+games.map(g=>'<button type="button" class="tl-case" data-think-game="'+g.id+'"><span class="tl-case-top"><span class="tl-case-number">'+g.num+' / CASE</span><span class="tl-case-icon">'+g.icon+'</span></span><span class="tl-case-tag">'+g.tag+'</span><strong>'+g.name+'</strong><span class="tl-case-desc">'+g.desc+'</span><span class="tl-case-bottom"><span>'+g.time+'</span><b>Open case ↗</b></span></button>').join('')+'</div><p class="tl-footer-note"><span>✳</span> No guessing blindly. Every answer comes with a reason.</p>';
  }
  // Register each game against the shared adaptive policy. New games should add
  // one entry here; difficulty thresholds, confidence and hint calibration remain central.
  const progressionRegistry = window.EPIPHANY_THINK_LAB_PROGRESSION;
  if (!progressionRegistry || typeof progressionRegistry.getRegistry !== 'function') throw new Error('Think Lab progression registry is unavailable.');
  const gameSkills = progressionRegistry.getRegistry().reduce((result, game) => { result[game.id] = game.skill; return result; }, {});
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
    const level = id === mode && activeDifficulty ? activeDifficulty.hintLevel : difficultyForMode(id).hintLevel;
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
    pull:'To move something towards yourself, usually by using your hands.',
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
    yard:'An area of land next to or around a building; also a unit of length.',
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

    boot:'A sturdy shoe that covers the foot and often the ankle.',
    boat:'A small vessel used for travelling on water.',
    sale:'An event or period when goods are sold, often at reduced prices.',
    pale:'Light in colour, or having less colour than usual.',
    pole:'A long, straight, cylindrical piece of material.',
    beat:'To hit something, or to defeat someone in a game or competition.',
    cake:'A sweet baked food, usually made with flour, eggs, and sugar.',
    cane:'A long, thin stick used for support when walking.',
    hall:'A large room or passage inside a building.',
    live:'To have your home in a place, or to be alive.',
    well:'In a good or healthy way; also a deep hole that provides water.',
    bake:'To cook food using dry heat in an oven.',
    cave:'A large natural hole in the side of a hill or underground.',
    cell:'The smallest basic unit of a living thing; also a small room in a prison.',
    fame:'The state of being known by many people.',
    fate:'The things that will happen to someone, especially when seen as unavoidable.',
    felt:'Experienced an emotion or physical sensation; the past tense of feel.',
    hire:'To pay someone to work for you, or to employ them.',
    lend:'To give something to someone for a period of time, expecting it back.',
    life:'The period between being born and dying; the condition of being alive.',
    name:'The word used to identify a person, place, or thing.',
    nest:'A place built by a bird or other animal to lay eggs or keep its young.',
    rate:'A measurement, amount, or level; also to judge the quality of something.',
    rent:'Money paid regularly to use a home, room, or other property.',
    rest:'A period of relaxation or sleep after activity.',
    wing:'One of the parts a bird or insect uses to fly.',
    bill:'A statement showing how much money you owe; also a proposed law.',
    cage:'A structure made of bars or wire used to keep an animal inside.',
    cape:'A sleeveless piece of clothing that hangs from the shoulders.',
    file:'A collection of information stored on a computer; also a folder for papers.',
    fill:'To make something full by putting something into it.',
    find:'To discover something or locate something you were looking for.',
    firm:'A business or company; also solid and not easily moved.',
    full:'Containing as much as possible; having no space left.',
    gave:'Past tense of give; transferred something to another person.',
    mail:'Letters and parcels sent or delivered by a postal service.',
    meal:'The food eaten at one time, such as breakfast, lunch, or dinner.',
    mile:'A unit of distance equal to about 1.6 kilometres.',
    paid:'Past tense of pay; gave money in exchange for something.',
    park:'A public green area where people can walk, relax, or play.',
    past:'The time before now; also gone by or finished.',
    pile:'A number of things placed on top of one another.',
    save:'To keep something for later, or to rescue someone from danger.',
    seat:'A place or object designed for someone to sit on.',
    sell:'To give something to someone in exchange for money.',
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
    if(board)board.outerHTML=kind==='forge'?forgeBoard(item):scrambleBoard(item);saveInternalProgress(index);
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
    const roundTarget = mode === 'maze' ? 12 : (mode === 'forge' || mode === 'connections' || mode === 'scramble' || mode === 'chain') ? 24 : ({guided:8,steady:10,challenge:12}[difficulty.level] || 10);
    const roundNote = mode === 'odd' && pool.length < roundTarget
      ? '<p class="tl-game-instruction">This round is shorter than the '+roundTarget+'-question target because only '+pool.length+' distinct questions are currently available at this level.</p>'
      : (mode === 'forge' || mode === 'connections' || mode === 'scramble' || mode === 'chain') && pool.length < roundTarget &&
        !(dailyChallengeActive && dailyChallengeActive.gameId === mode)
        ? '<p class="tl-game-instruction">This round is shorter than the 24-challenge target because the selected reviewed bank has fewer questions available.</p>'
        : mode === 'translator' && item.adaptiveFallback
        ? '<p class="tl-game-instruction tl-translator-fallback" role="status">Your current level is '+esc(item.requestedCEFRLevel)+'. A '+esc(item.requestedCEFRLevel)+' question bank is not available yet, so this round uses '+esc(item.cefrLevel)+' practice for now.</p>'
        : '';
    locked = false;
    if(mode==='wordladder'&&!ladderPath.length)ladderPath=[item.start];
    let intro = '';
    if (mode === 'odd') intro = '<div class="tl-word-options">'+item.words.map((w,i)=>'<button type="button" class="tl-option tl-word-option" data-think-answer="'+i+'"><span class="tl-option-index">0'+(i+1)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>'+(difficulty.level === 'guided' ? '<div class="tl-odd-hint"><button type="button" class="tl-secondary" data-odd-hint>Reveal a hint</button><p class="tl-game-instruction" data-odd-hint-text hidden></p></div>' : '');
    if (mode === 'translator') intro = '<div class="tl-translation-prompt" lang="ar" dir="rtl">'+esc(item.ar)+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>'+(difficulty.level !== 'challenge' ? '<div class="tl-odd-hint"><button type="button" class="tl-secondary" data-translator-hint>Reveal a hint</button><p class="tl-game-instruction" data-translator-hint-text hidden></p></div>' : '');
    if (mode === 'wordladder') {
      const path = ladderPath.length ? ladderPath : [item.start];
      const currentWord = path[path.length - 1] || item.start;
      const nextWord = nextLadderWord(item, path);
      const nextMeaning = nextWord ? ladderMeanings[nextWord] : null;
      const changedAt = nextWord ? [...currentWord].findIndex((letter, i) => letter !== nextWord[i]) : -1;
      const letterPosition = changedAt === 0 ? 'first' : changedAt === currentWord.length - 1 ? 'last' : changedAt === 1 ? 'second' : changedAt === 2 ? 'third' : changedAt >= 0 ? 'fourth' : '';
      const activeHint = difficulty.level === 'guided' && path[path.length - 1] !== item.goal && nextWord
        ? (nextMeaning
          ? 'Next-step hint: change the ' + letterPosition + ' letter to make a word meaning “' + nextMeaning + '”.'
          : 'Next-step hint: change the ' + letterPosition + ' letter. The new word must be real and keep a route to the goal.')
        : difficulty.level === 'challenge'
          ? 'Challenge: plan your own route to the goal. Every move must change exactly one letter.'
          : item.hint;
      intro = '<div class="tl-ladder-targets"><div><span>START</span><strong>'+esc(item.start)+'</strong></div><span class="tl-ladder-arrow">→</span><div><span>GOAL</span><strong>'+esc(item.goal)+'</strong></div></div><p class="tl-ladder-hint">'+esc(activeHint)+'</p><div class="tl-ladder-path">'+path.map((w,i)=>'<span class="tl-ladder-word '+(i===path.length-1?'is-current':'')+'">'+esc(w)+'</span>').join('<span class="tl-ladder-step">↓</span>')+'</div>'+(ladderWordNote?'<aside class="tl-ladder-meaning" aria-live="polite"><strong>'+esc(ladderWordNote.word)+'</strong><p>'+esc(ladderWordNote.meaning||'No definition is available for this word yet.')+'</p></aside>':'')+(path[path.length-1]===item.goal?'<p class="tl-ladder-success">Ladder complete! Every move is valid.</p>':'<form class="tl-ladder-form" data-think-ladder-form><label for="tl-ladder-input">Next word</label><div><input id="tl-ladder-input" name="ladder-word" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the next word" required><button class="tl-next" type="submit">Make move →</button></div><small>Use a word from the game’s word bank. Change one letter and keep a route open to the goal.</small></form>');
    }
    if (mode === 'forge') { forgePlaced=Array(item.letters.length).fill(null); intro='<div class="tl-word-clue"><span>WORD CLUE</span><p>'+esc(item.clue)+'</p></div>'+forgeBoard(item)+'<button class="tl-next" type="button" data-forge-check>Check word →</button><button class="tl-secondary" type="button" data-forge-reset>Reset tiles</button>'; }
    if (mode === 'connections') { connectionSelected=[]; const tiles=connectionTiles(item); intro='<p class="tl-connection-count" aria-live="polite">Select the four words that belong together.</p><div class="tl-connection-grid tl-connection-board">'+tiles.map((w,i)=>'<button type="button" class="tl-connection-word" data-connection-tile="'+i+'" aria-pressed="false">'+esc(w)+'</button>').join('')+'</div><div class="tl-connection-controls"><span data-connection-count>0 / 4 selected</span><button class="tl-next" type="button" data-connection-check>Check group →</button><button class="tl-secondary" type="button" data-connection-reset>Clear selection</button></div>'; }
    if (mode === 'scramble') { scramblePlaced=Array(item.words.length).fill(null); intro=scrambleBoard(item)+'<button class="tl-next" type="button" data-scramble-check>Check sentence →</button><button class="tl-secondary" type="button" data-scramble-reset>Reset words</button>'; }
    if (mode === 'chain') { const steps=item.links,step=steps[chainStepIndex],path=[item.start,...chainPath]; intro='<div class="tl-chain-path">'+path.map(w=>'<span class="tl-chain-link">'+esc(w)+'</span>').join('<span class="tl-ladder-step"> → </span>')+'<span class="tl-ladder-step"> → ?</span></div><p class="tl-connection-count">LINK '+(chainStepIndex+1)+' OF '+steps.length+' · Connect “'+esc(step.from)+'” to the strongest next word.</p><div class="tl-answer-options">'+step.options.map((w,i)=>'<button type="button" class="tl-option" data-chain-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>'; }
    if (mode === 'maze') intro = '<div class="tl-maze-target"><span class="tl-maze-sound">♫</span><div><span>LISTEN FOR THIS WORD</span><strong>Find the matching word</strong></div><button type="button" class="tl-secondary" data-think-speak>▶ Play word</button></div><div class="tl-maze-path"><span class="tl-maze-start">START</span><span>···</span><span class="tl-maze-finish">EXIT</span></div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'detective') {
      const visibleClueCount = difficulty.level === 'challenge' ? item.clues.length : Math.min(item.clues.length,clueCount+1+(difficulty.hintLevel>=2?1:0));
      intro = '<div class="tl-clue-list">'+item.clues.slice(0,visibleClueCount).map((c,i)=>'<div class="tl-clue"><span>CLUE 0'+(i+1)+'</span><p>'+esc(c)+'</p></div>').join('')+'</div>'+(difficulty.level === 'challenge' ? '<p class="tl-game-instruction">Challenge mode: weigh all the evidence and choose the conclusion it supports.</p>' : '<div class="tl-reveal-row">'+(clueCount<item.clues.length-1?'<button class="tl-secondary" type="button" data-think-clue>Reveal next clue +</button>':'<span class="tl-all-clues">All evidence revealed</span>')+'</div>')+'<h3 class="tl-question">'+item.question+'</h3><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    }
    if (difficulty.level === 'guided' && ['maze','forge','connections','scramble','chain'].includes(mode)) {
      intro += '<div class="tl-odd-hint tl-guided-support"><button type="button" class="tl-secondary" data-training-hint>Reveal a hint</button><p class="tl-game-instruction" data-training-hint-text hidden></p></div>';
    }
    root.innerHTML = '<div class="tl-game-head"><div class="tl-game-nav"><button class="tl-back" type="button" data-think-back>← Choose difficulty</button><button class="tl-back tl-home-back" type="button" data-think-home>Think Lab home</button></div><span class="tl-eyebrow">CASE '+String(index+1).padStart(2,'0')+' / '+pool.length+'</span><span class="tl-score">SOLVED <b>'+score+'</b></span></div><div class="tl-game-card"><div class="tl-game-kicker">'+(mode==='odd'?'PATTERN ANALYSIS · '+esc(item.cefrLevel || 'A1'):mode==='detective'?'EVIDENCE BOARD':mode==='translator'?'NATURAL EXPRESSION · '+esc(item.cefrLevel || 'A1'):mode==='wordladder'?'WORD TRANSFORMATION':mode==='forge'?'WORD FORGE':mode==='connections'?'WORD CONNECTIONS':mode==='scramble'?'SENTENCE BUILDING':mode==='chain'?'WORD ASSOCIATION':'LISTENING MAZE · '+esc(selectedMazeCEFR || 'A1'))+'</div><div class="tl-level-tag">'+(difficulty.level==='challenge'?'CHALLENGE':difficulty.level==='steady'?'STEADY':'GUIDED')+'</div><h2>'+esc(mode==='detective'||mode==='chain'?item.title:mode==='wordladder'?'Transform the word':mode==='maze'?'Find the sound path':item.prompt)+'</h2><p class="tl-game-instruction">'+esc(mode==='odd'?item.why:mode==='translator'?'Read the Arabic sentence, then choose the natural English equivalent.':mode==='wordladder'?'Build a chain of real words. Only one letter may change in each move.':mode==='maze'?'Listen carefully, replay the word if needed, then choose the matching spelling.':mode==='forge'?'Use the available letters and clue to build the word yourself.':mode==='connections'?'Find the four words that form one precise shared group. The remaining tiles are carefully selected distractors.':mode==='scramble'?'Build a natural English sentence from the mixed-up word bank.':mode==='chain'?'Build a three-link association chain. Each choice becomes the starting point for the next link.':'Reveal the clues and select the conclusion they support.')+'</p>'+intro+roundNote+'<div class="tl-feedback" id="tl-feedback" aria-live="polite" hidden></div><div class="tl-game-actions"><span>ROUND '+(index+1)+' OF '+pool.length+'</span><button class="tl-next" type="button" data-think-next hidden>Next round →</button></div></div>';
    saveInternalProgress(index);
    if (mode === 'maze' && index + 1 < pool.length) {
      const nextTarget = pool[index + 1].target;
      window.EpiphanySpeech?.prefetch?.(nextTarget, {rate:0.82});
    }
  }
  function connectionTiles(item) {
    const bank = window.EPIPHANY_WORD_CONNECTIONS_BANK;
    return bank ? bank.createBoard(item, selectedTrainingMode) : item.words.slice();
  }
  function speakTarget() { const pool=activePool || getRoundPool('maze');const item=pool[index%pool.length];const speech=window.EpiphanySpeech;if(!speech||typeof speech.speak!=='function'){const fb=root.querySelector('#tl-feedback');if(fb){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='George voice is not ready. Please try again.';}return;}speech.speak(item.target,{rate:.82,onError:()=>{const fb=root.querySelector('#tl-feedback');if(fb){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='George voice is temporarily unavailable. Please try again.';}}}); }
  let pickerGameId = null;
  let pickerStage = 'landing';
  let preparedMazeCEFR = null;

  function showTrainingModePicker(id) {
    pickerGameId = id;
    pickerStage = 'mode';
    mode = null;
    activePool = null;
    preparedMazeCEFR = null;
    const game = games.find(item => item.id === id);
    const title = game ? game.name : 'Think Lab';
    const modes = [
      {id:'guided',name:'Guided',tag:'MORE SUPPORT',description:'Helpful hints and clearer stepping stones while you learn the pattern.'},
      {id:'steady',name:'Steady',tag:'BALANCED PRACTICE',description:'A balanced round with room to think independently.'},
      {id:'challenge',name:'Challenge',tag:'LESS SUPPORT',description:'Fewer hints and more demanding reasoning.'}
    ];
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← All cases</button><span class="tl-eyebrow">CHOOSE YOUR APPROACH</span></div><div class="tl-game-card tl-mode-picker"><div class="tl-game-kicker">'+esc(title.toUpperCase())+' · TRAINING MODE</div><h2>How would you like to play?</h2><p class="tl-game-instruction">Choose the amount of guidance you want. Some games also use different question sets for each mode; others adapt their hints and support. Your English level is kept separate from this choice.</p><div class="tl-mode-grid">'+modes.map(item => '<button type="button" class="tl-mode-choice" data-think-training-mode="'+item.id+'" data-think-training-game="'+id+'"><span class="tl-mode-tag">'+item.tag+'</span><strong>'+item.name+'</strong><span>'+item.description+'</span><b>Choose '+item.name+' →</b></button>').join('')+'</div></div>';
  }
  function showMazeLevelPicker() {
    pickerGameId = 'maze';
    pickerStage = 'level';
    mode = null;
    const bridge = window.EpiphanyThinkLab;
    const savedLevel = bridge && typeof bridge.getSoundMazeCEFR === 'function' ? bridge.getSoundMazeCEFR() : null;
    const currentLevel = currentThinkLabCEFR();
    selectedMazeCEFR = canChooseThinkLabCEFR(savedLevel) ? savedLevel : currentLevel;
    activePool = getRoundPool('maze', selectedTrainingMode);
    preparedMazeCEFR = selectedMazeCEFR;
    if (activePool[0]?.target) window.EpiphanySpeech?.prefetch?.(activePool[0].target, {rate:0.82});
    const available = new Set(availableThinkLabCEFRLevels());
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← Choose training mode</button><span class="tl-eyebrow">THE SOUND MAZE</span></div><div class="tl-game-card"><div class="tl-game-kicker">CHOOSE YOUR ENGLISH LEVEL</div><h2>Which level would you like to practise?</h2><p class="tl-game-instruction">Choose from the CEFR levels you have unlocked. Higher levels open as you progress and pass your level checks. This choice stays separate from Guided, Steady or Challenge.</p><div class="tl-answer-options">'+THINK_LAB_CEFR_LEVELS.map(level => { const unlocked = available.has(level); return '<button type="button" class="tl-option" data-sound-maze-level="'+level+'" '+(unlocked?'':'disabled aria-disabled="true"')+' aria-pressed="'+(selectedMazeCEFR===level?'true':'false')+'"><strong>'+level+'</strong><span>'+(unlocked?(selectedMazeCEFR===level?'Selected':'Choose this level'):'🔒 Locked · progress to unlock')+'</span></button>'; }).join('')+'</div></div>';
  }
  function showMazeBankUnavailable() {
    pickerStage = 'level';
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← Back</button><span class="tl-eyebrow">THE SOUND MAZE · '+esc(selectedMazeCEFR)+'</span></div><div class="tl-game-card"><div class="tl-game-kicker">QUESTION BANK NOT READY</div><h2>Your level is saved.</h2><p class="tl-game-instruction">The approved '+esc(selectedMazeCEFR)+' question bank has not been connected to the game yet. The temporary sample questions are intentionally hidden so they are not mistaken for the approved content.</p></div>';
  }
  function showTranslatorLevelPicker() {
    pickerGameId = 'translator';
    pickerStage = 'level';
    mode = 'translator';
    activePool = null;
    const available = new Set(availableThinkLabCEFRLevels());
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← Choose difficulty</button><span class="tl-eyebrow">THE BOLD TRANSLATOR</span></div><div class="tl-game-card"><div class="tl-game-kicker">CHOOSE YOUR ENGLISH LEVEL</div><h2>Which level would you like to practise?</h2><p class="tl-game-instruction">Adaptive follows your current EPIPHANY level. You can also revisit levels you have unlocked. This choice does not change your learning level. Higher levels open through your learning progress and level checks.</p><div class="tl-answer-options"><button type="button" class="tl-option" data-translator-level="adaptive"><strong>Adaptive · Recommended</strong><span>Use my current EPIPHANY level</span></button>'+THINK_LAB_CEFR_LEVELS.map(level => { const unlocked = available.has(level); const bankReady = !!translatorBanks[level]; return '<button type="button" class="tl-option" data-translator-level="'+level+'" '+(!unlocked || !bankReady?'disabled aria-disabled="true"':'')+'><strong>'+level+'</strong><span>'+(!unlocked?'🔒 Locked · progress to unlock':bankReady?'Available':'Coming soon')+'</span></button>'; }).join('')+'</div></div>';
  }
  async function beginGame(id, trainingMode, options = {}) {
    if (id === 'maze' && !canChooseThinkLabCEFR(selectedMazeCEFR)) {
      selectedMazeCEFR = currentThinkLabCEFR();
      activePool = null;
      preparedMazeCEFR = null;
      showMazeLevelPicker();
      return;
    }
    if (id === 'translator' && selectedTranslatorCEFR !== 'adaptive' && !canChooseThinkLabCEFR(selectedTranslatorCEFR)) {
      selectedTranslatorCEFR = 'adaptive';
      showTranslatorLevelPicker();
      return;
    }
    pickerGameId = id;
    pickerStage = 'game';
    selectedTrainingMode = ['guided','steady','challenge'].includes(trainingMode) ? trainingMode : 'steady';
    mode=id; index=0; score=0; chainStepIndex=0; chainPath=[]; chainExplanations=[]; clueCount=0; roundMistakes=0; ladderPath=[]; ladderWordNote=null; ladderMistakeRecorded=false; oddHintStep=0;
    const hintLevel = selectedTrainingMode === 'guided' ? 2 : selectedTrainingMode === 'steady' ? 1 : 0;
    activeDifficulty = Object.assign({}, difficultyForMode(id), {level:selectedTrainingMode,hintLevel});
    const preparedMazePool = id === 'maze' && preparedMazeCEFR === selectedMazeCEFR && activePool && activePool.length ? activePool : null;
    const previousRandom = Math.random;
    if (options.daily === true && dailyChallengeActive) Math.random = seededDailyRandom(dailyChallengeActive.seed);
    try { activePool = id === 'odd' || id === 'chain' || id === 'scramble' ? [] : preparedMazePool || getRoundPool(id,selectedTrainingMode); }
    finally { Math.random = previousRandom; }
    validatorSessionId = null;
    validatorClientForSession = null;
    validatorFunctionName = null;
    validatorGuestToken = null;
    if (id === 'odd') {
      await (window.EpiphanyAuth?.whenReady?.() || Promise.resolve());
      const signedIn = window.EpiphanyAuth?.isSignedIn?.() === true;
      const validatorClient = signedIn ? window.EpiphanyAuth?.getValidatorClient?.() : window.EpiphanyAuth?.getGuestValidatorClient?.();
      const functionName = 'velorn-think-lab-validator';
      const level = window.EpiphanyThinkLab?.getCEFRLevel?.() || 'A1';
      if (!validatorClient) {
        mode = null; activePool = null;
        root.innerHTML = '<div class="tl-game-card"><h2>Secure challenge unavailable</h2><p class="tl-game-instruction">An internet connection is required to prepare this verified challenge. Please try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
        return;
      }
      const {data,error} = await validatorClient.functions.invoke(functionName,{body:{action:'start',gameId:'odd_one_out',level,trainingMode:selectedTrainingMode}});
      const guestTokenValid = signedIn || (typeof data?.guestToken === 'string' && /^[0-9a-f]{64}$/.test(data.guestToken));
      if (error || !data?.sessionId || !Array.isArray(data.questions) || !data.questions.length || !guestTokenValid) {
        console.error('Trusted Odd One Out session could not start:',error?.message||data?.error||'invalid response');
        mode=null;activePool=null;
        root.innerHTML='<div class="tl-game-card"><h2>Secure challenge unavailable</h2><p class="tl-game-instruction">We could not prepare a verified challenge. Your attempt has not started. Please check your connection and try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
        return;
      }
      validatorSessionId=data.sessionId; validatorClientForSession=validatorClient;
      validatorFunctionName=functionName; validatorGuestToken=signedIn?null:data.guestToken;
      const labels={category:'Category',function:'Function','synonyms-antonyms':'Synonyms & antonyms','part-whole':'Part & whole','word-class':'Word class','cause-effect':'Cause & effect','contextual-meaning':'Contextual meaning',collocations:'Collocations','register-tone':'Register & tone',connotation:'Connotation'};
      const completionKey='odd:'+data.level+':'+data.trainingMode+':'+data.questions.map(question=>question.id).sort().join('|');
      activePool=data.questions.map(question=>({...question,prompt:'Which word does not belong?',cefrLevel:data.level,trainingMode:data.trainingMode,
        rewardKey:'odd:'+data.level+':'+question.id,completionKey,
        why:selectedTrainingMode==='guided'?'Find the one word that does not share the relationship held by the other three.':
          selectedTrainingMode==='challenge'?'Identify the precise link shared by three words; avoid broad or superficial similarities. Context: '+(question.context||''):
          'Compare the four words in this context: '+(question.context||''),
        relationshipLabel:labels[question.relationship]||question.relationship}));
    }
    if (id === 'forge') {
      await (window.EpiphanyAuth?.whenReady?.() || Promise.resolve());
      const signedIn = window.EpiphanyAuth?.isSignedIn?.() === true;
      const validatorClient = signedIn ? window.EpiphanyAuth?.getValidatorClient?.() : window.EpiphanyAuth?.getGuestValidatorClient?.();
      if (!validatorClient) { mode=null;activePool=null;root.innerHTML='<div class="tl-game-card"><h2>Word Forge needs an internet connection</h2><p class="tl-game-instruction">We could not prepare a secure question session. Please reconnect and try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';return; }
      const {data,error}=await validatorClient.functions.invoke('velorn-think-lab-validator',{body:{action:'start',gameId:'word_forge',trainingMode:selectedTrainingMode}});
      const guestTokenValid=signedIn || (typeof data?.guestToken==='string' && /^[0-9a-f]{64}$/.test(data.guestToken));
      if(error || !data?.sessionId || !Array.isArray(data.questions) || data.questions.length!==24 || !guestTokenValid) {
        console.error('Trusted Word Forge session could not start:',error?.message||data?.error||'invalid response');mode=null;activePool=null;
        root.innerHTML='<div class="tl-game-card"><h2>Word Forge is unavailable</h2><p class="tl-game-instruction">The secure question session could not be created. Your attempt has not started. Please try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';return;
      }
      validatorSessionId=data.sessionId;validatorClientForSession=validatorClient;validatorFunctionName='velorn-think-lab-validator';validatorGuestToken=signedIn?null:data.guestToken;
      activePool=data.questions.map(question=>({...question,prompt:'Forge the word from the letter tiles.'}));
    }
    if (id === 'chain') {
      await (window.EpiphanyAuth?.whenReady?.() || Promise.resolve());
      const signedIn = window.EpiphanyAuth?.isSignedIn?.() === true;
      const validatorClient = signedIn ? window.EpiphanyAuth?.getValidatorClient?.() : window.EpiphanyAuth?.getGuestValidatorClient?.();
      const isDaily = options.daily === true && dailyChallengeActive?.gameId === 'chain';
      const functionName = 'velorn-think-lab-validator';
      if (!validatorClient) {
        mode = null; activePool = null;
        root.innerHTML = '<div class="tl-game-card"><h2>Chain Reaction needs an internet connection</h2><p class="tl-game-instruction">We could not prepare a secure challenge session. Please reconnect and try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
        return;
      }
      const startBody = { action:'start', gameId:'chain_reaction', trainingMode:selectedTrainingMode };
      if (isDaily) {
        if (!Number.isInteger(dailyChallengeActive.seed) || dailyChallengeActive.seed < 0 || dailyChallengeActive.seed > 0xffffffff) {
          mode = null; activePool = null;
          root.innerHTML = '<div class="tl-game-card"><h2>Daily challenge unavailable</h2><p class="tl-game-instruction">The saved daily challenge could not be verified. Please return to Think Lab.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
          return;
        }
        startBody.daily = true;
        startBody.dailySeed = dailyChallengeActive.seed;
      }
      const {data,error} = await validatorClient.functions.invoke(functionName,{body:startBody});
      const expectedCount = isDaily ? 1 : 24;
      const guestTokenValid = signedIn || (typeof data?.guestToken === 'string' && /^[0-9a-f]{64}$/.test(data.guestToken));
      const safeQuestions = Array.isArray(data?.questions) && data.questions.length === expectedCount &&
        data.questions.every(question => question && typeof question.title === 'string' &&
          typeof question.start === 'string' && Array.isArray(question.links) && question.links.length === 3 &&
          question.links.every(link => link && typeof link.from === 'string' &&
            Array.isArray(link.options) && link.options.length === 3 &&
            !Object.hasOwn(link,'to') && !Object.hasOwn(link,'answer') && !Object.hasOwn(link,'explanation')));
      if (error || !data?.sessionId || !safeQuestions || !guestTokenValid ||
          data.validatorVersion !== 'chain-reaction-72-20261112-v1' || data.trainingMode !== selectedTrainingMode || data.daily !== isDaily) {
        console.error('Trusted Chain Reaction session could not start:',error?.message||data?.error||'invalid response');
        mode = null; activePool = null;
        root.innerHTML = '<div class="tl-game-card"><h2>Chain Reaction is unavailable</h2><p class="tl-game-instruction">The secure challenge session could not be created. Your attempt has not started. Please try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
        return;
      }
      validatorSessionId = data.sessionId;
      validatorClientForSession = validatorClient;
      validatorFunctionName = functionName;
      validatorGuestToken = signedIn ? null : data.guestToken;
      activePool = data.questions.map(question => ({
        id:question.id,title:question.title,start:question.start,
        links:question.links.map(link => ({from:link.from,options:link.options.slice()})),
      }));
      chainStepIndex = 0;
      chainPath = [];
      chainExplanations = [];
    }
    if (id === 'scramble') {
      await (window.EpiphanyAuth?.whenReady?.() || Promise.resolve());
      const signedIn = window.EpiphanyAuth?.isSignedIn?.() === true;
      const validatorClient = signedIn ? window.EpiphanyAuth?.getValidatorClient?.() : window.EpiphanyAuth?.getGuestValidatorClient?.();
      const isDaily = options.daily === true && dailyChallengeActive?.gameId === 'scramble';
      const functionName = 'velorn-think-lab-validator';
      if (!validatorClient) {
        mode = null; activePool = null;
        root.innerHTML = '<div class="tl-game-card"><h2>Sentence Scramble needs an internet connection</h2><p class="tl-game-instruction">We could not prepare a secure sentence session. Please reconnect and try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
        return;
      }
      const startBody = { action:'start', gameId:'sentence_scramble', trainingMode:selectedTrainingMode };
      if (isDaily) {
        if (!Number.isInteger(dailyChallengeActive.seed) || dailyChallengeActive.seed < 0 || dailyChallengeActive.seed > 0xffffffff) {
          mode = null; activePool = null;
          root.innerHTML = '<div class="tl-game-card"><h2>Daily challenge unavailable</h2><p class="tl-game-instruction">The saved daily challenge could not be verified. Please return to Think Lab.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
          return;
        }
        startBody.daily = true;
        startBody.dailySeed = dailyChallengeActive.seed;
      }
      const {data,error} = await validatorClient.functions.invoke(functionName,{body:startBody});
      const expectedCount = isDaily ? 1 : 24;
      const guestTokenValid = signedIn || (typeof data?.guestToken === 'string' && /^[0-9a-f]{64}$/.test(data.guestToken));
      const safeQuestions = Array.isArray(data?.questions) && data.questions.length === expectedCount &&
        data.questions.every(question => question && Object.keys(question).sort().join('|') === 'id|prompt|words' &&
          typeof question.id === 'string' && /^SS-[GSC]-[0-9]{3}$/.test(question.id) &&
          question.prompt === 'Build the sentence in the correct order.' &&
          Array.isArray(question.words) && question.words.length >= 3 && question.words.length <= 24 &&
          question.words.every(word => typeof word === 'string' && word.length > 0 && word.length <= 40 && word.trim() === word && !word.includes(' ')));
      if (error || !data?.sessionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.sessionId) ||
          !safeQuestions || !guestTokenValid || data.validatorVersion !== 'sentence-scramble-72-20261112-v1' ||
          data.trainingMode !== selectedTrainingMode || data.daily !== isDaily) {
        console.error('Trusted Sentence Scramble session could not start:',error?.message||data?.error||'invalid response');
        mode = null; activePool = null;
        root.innerHTML = '<div class="tl-game-card"><h2>Sentence Scramble is unavailable</h2><p class="tl-game-instruction">The secure sentence session could not be created. Your attempt has not started. Please try again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
        return;
      }
      validatorSessionId = data.sessionId;
      validatorClientForSession = validatorClient;
      validatorFunctionName = functionName;
      validatorGuestToken = signedIn ? null : data.guestToken;
      activePool = data.questions.map(question => ({id:question.id,prompt:question.prompt,words:question.words.slice()}));
    }
    if (id === 'maze') preparedMazeCEFR = null;
    if (id === 'maze' && !activePool.length) {
      showMazeBankUnavailable();
      return;
    }
    if (id === 'scramble' && (!validatorSessionId || !Array.isArray(activePool) || !activePool.length ||
        !activePool.every(question => question && typeof question.id === 'string' && Array.isArray(question.words) && question.words.length >= 3))) {
      root.innerHTML = '<div class="tl-game-card"><div class="tl-game-kicker">SENTENCE SCRAMBLE</div><h2>SECURE SESSION NOT READY</h2><p class="tl-game-instruction">The trusted server did not issue a complete sentence challenge. No local or sample answers will be shown.</p><button type="button" class="tl-back" data-think-back>← Choose difficulty</button><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if (id === 'chain' && (!validatorSessionId || !Array.isArray(activePool) || !activePool.length ||
        !activePool.every(question => question && Array.isArray(question.links) && question.links.length === 3))) {
      root.innerHTML = '<div class="tl-game-card"><div class="tl-game-kicker">CHAIN REACTION</div><h2>SECURE SESSION NOT READY</h2><p class="tl-game-instruction">The trusted server did not issue a complete three-link challenge. No local or sample questions will be shown.</p><button type="button" class="tl-back" data-think-back>← Choose difficulty</button><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if (id === 'forge' && (!activePool.length || activePool.length !== 24 || !window.EPIPHANY_WORD_FORGE_BANK || typeof window.EPIPHANY_WORD_FORGE_BANK.validateBank !== 'function' || !window.EPIPHANY_WORD_FORGE_BANK.validateBank().valid)) {
      root.innerHTML = '<div class="tl-game-card"><div class="tl-game-kicker">WORD FORGE</div><h2>QUESTION BANK NOT READY</h2><p class="tl-game-instruction">The approved 72-challenge Word Forge bank could not be loaded completely. No sample questions will be shown.</p><button type="button" class="tl-back" data-think-back>← Choose difficulty</button><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if (id === 'connections' && (!activePool.length || !window.EPIPHANY_WORD_CONNECTIONS_BANK)) {
      root.innerHTML = '<div class="tl-game-card"><div class="tl-game-kicker">WORD CONNECTIONS</div><h2>QUESTION BANK NOT READY</h2><p class="tl-game-instruction">The reviewed Word Connections bank could not be loaded. No sample questions will be shown.</p><button type="button" class="tl-back" data-think-back>← Choose difficulty</button><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if (options.daily === true && id !== 'forge' && dailyChallengeActive && dailyChallengeActive.gameId === id) {
      if (!activePool.length) { dailyChallengeActive = null; root.innerHTML='<div class="tl-game-card"><h2>Daily challenge unavailable</h2><p class="tl-game-instruction">The approved question could not be prepared. Your daily attempt has not been used.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>'; return; }
      activePool = [activePool[0]];
    } else {
      window.EpiphanyThinkLab?.clearGameSnapshot?.(id);
    }
    if (window.EpiphanyThinkLab && typeof window.EpiphanyThinkLab.recordGameStart === 'function') {
      const selectedLevel = id === 'maze' ? selectedMazeCEFR : id === 'translator' ? selectedTranslatorCEFR : selectedTrainingMode;
      window.EpiphanyThinkLab.recordGameStart(id,{level:selectedLevel,trainingMode:selectedTrainingMode});
    }
    renderGame();
    if(id==='maze') speakTarget();
  }
  function start(id) {
    dailyChallengeActive = null;
    if (id === 'wordhunt') {
      if (window.EPIPHANY_WORD_HUNT && typeof window.EPIPHANY_WORD_HUNT.open === 'function') {
        window.EPIPHANY_WORD_HUNT.open();
      } else root.innerHTML = '<div class="tl-game-card"><h2>Word Hunt is loading</h2><p class="tl-game-instruction">Please return to Think Lab and open the game again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if (id === 'lettergrid') {
      if (window.EPIPHANY_LETTER_GRID && typeof window.EPIPHANY_LETTER_GRID.open === 'function') {
        window.EPIPHANY_LETTER_GRID.open();
      } else root.innerHTML = '<div class="tl-game-card"><h2>Letter Grid is loading</h2><p class="tl-game-instruction">Please return to Think Lab and open the game again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if (id === 'codebreaker') {
      if (window.EPIPHANY_CODEBREAKER && typeof window.EPIPHANY_CODEBREAKER.open === 'function') {
        window.EPIPHANY_CODEBREAKER.open();
      } else root.innerHTML = '<div class="tl-game-card"><h2>Codebreaker is loading</h2><p class="tl-game-instruction">Please return to Think Lab and open the game again.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if (id === 'crossword') {
      root.innerHTML = '<div class="tl-game-card"><div class="tl-game-kicker">CROSSWORD QUEST</div><h2>This game is paused.</h2><p class="tl-game-instruction">Its prototype and content work are being kept in the project, but the game is not currently available to play.</p><button type="button" class="tl-back" data-think-home>Think Lab home</button></div>';
      return;
    }
    if(id==='translator') selectedTranslatorCEFR='adaptive';
    showTrainingModePicker(id);
  }
  function guidedHint(id) {
    const hints = {
      maze:'Listen for the opening and ending sounds. Replay the word, then compare the options carefully.',
      forge:'Use the clue first, then test which available letters can build the word. Each tile is used once.',
      connections:'Look for the most precise shared category. Avoid choosing words that are merely related to the same topic.',
      scramble:'Find the subject and main verb first. Then arrange the remaining words into a natural English order.',
      chain:'Choose the closest natural association, not simply a word connected to the same broad topic.'
    };
    return hints[id] || 'Look for the clearest relationship and test each option against the full instruction.';
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
    if(!allowed){roundMistakes++;const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-wrong';const reason=!differs?'Change exactly one letter from “'+esc(previous)+'”.':!ladderWordBank.has(word)?'That word is not in this game’s curated word bank yet. Try another common English word.':alreadyUsed?'You have already used that word. Choose a new step.':'That move closes off the route to the goal. Try a word that keeps a valid path open.';fb.innerHTML='<strong>Not quite—check the move.</strong><p>'+reason+'</p>'+(ladderWordNote.meaning?'<p><strong>'+esc(word)+':</strong> '+esc(ladderWordNote.meaning)+'</p>':'')+(roundMistakes>=2?'<p>'+esc(adaptiveHint('wordladder'))+'</p>':'')+(roundMistakes>=3&&nextLadderWord(item,ladderPath)&&ladderMeanings[nextLadderWord(item,ladderPath)]?'<aside class="tl-ladder-meaning tl-ladder-next-hint" role="note"><strong>Meaning hint for the next word</strong><p>'+esc(ladderMeanings[nextLadderWord(item,ladderPath)])+'</p></aside>':'');if(!ladderMistakeRecorded&&window.EpiphanyThinkLab){window.EpiphanyThinkLab.recordResult('spelling','word-ladder',false,false);ladderMistakeRecorded=true;}input.select();saveInternalProgress(index);return;}
    ladderPath.push(word);
    if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('spelling','word-ladder',true,word===item.goal&&index===(activePool||getRoundPool('wordladder')).length-1);
    if(word===item.goal){score++;locked=true;roundMistakes=0;renderGame();const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Ladder complete!</strong><p>'+esc(item.explain)+'</p>';const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;saveInternalProgress(index+1);}
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
  root.addEventListener('click', async e => {
    const connectionTile=e.target.closest('[data-connection-tile]');
    if(connectionTile&&mode==='connections'&&!locked){
      const tileIndex=Number(connectionTile.dataset.connectionTile),at=connectionSelected.indexOf(tileIndex);
      if(at>=0)connectionSelected.splice(at,1);else if(connectionSelected.length<4)connectionSelected.push(tileIndex);
      root.querySelectorAll('[data-connection-tile]').forEach(btn=>{const selected=connectionSelected.includes(Number(btn.dataset.connectionTile));btn.classList.toggle('is-selected',selected);btn.setAttribute('aria-pressed',String(selected));});
      const count=root.querySelector('[data-connection-count]');if(count)count.textContent=connectionSelected.length+' / 4 selected';
      saveInternalProgress(index);return;
    }
    if(e.target.closest('[data-connection-reset]')&&mode==='connections'&&!locked){
      connectionSelected=[];root.querySelectorAll('[data-connection-tile]').forEach(btn=>{btn.classList.remove('is-selected');btn.setAttribute('aria-pressed','false');});
      const count=root.querySelector('[data-connection-count]');if(count)count.textContent='0 / 4 selected';saveInternalProgress(index);return;
    }
    if(e.target.closest('[data-connection-check]')&&mode==='connections'&&!locked){
      const fb=root.querySelector('#tl-feedback'),pool=activePool||getRoundPool('connections'),item=pool[index%pool.length];
      if(connectionSelected.length!==4){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Select exactly four words before checking.';return;}
      const tiles=[...root.querySelectorAll('[data-connection-tile]')],chosen=connectionSelected.map(i=>tiles.find(btn=>Number(btn.dataset.connectionTile)===i)?.textContent.trim().toLowerCase());
      const bank=window.EPIPHANY_WORD_CONNECTIONS_BANK;
      const matched=bank?bank.matchGroup(chosen,selectedTrainingMode):null;
      if(!matched){
        roundMistakes++;
        if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('vocabulary','connections',false,false);
        fb.hidden=false;fb.className='tl-feedback is-wrong';
        fb.innerHTML='<strong>Not this group yet.</strong><p>These four words do not form one of the reviewed groups. You can change your selection and try again.</p>'+(roundMistakes>=2?'<p>'+esc(adaptiveHint('connections'))+'</p>':'');
        saveInternalProgress(index);return;
      }
      locked=true;score++;root.querySelectorAll('[data-connection-tile],[data-connection-check],[data-connection-reset]').forEach(el=>el.disabled=true);
      if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('vocabulary','connections',true,index===pool.length-1);
      fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Group found!</strong><p>'+esc(matched.explain)+'</p>';
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;saveInternalProgress(index+1);return;
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
      const pool=activePool||getRoundPool('forge'),item=pool[index%pool.length],fb=root.querySelector('#tl-feedback');
      if(!forgePlaced.every(x=>x!==null)){
        fb.hidden=false;fb.className='tl-feedback is-wrong';
        fb.innerHTML='<strong>Complete the word first.</strong><p>Fill every letter slot before checking your answer. You can still move or return any tile.</p>';
        return;
      }
      const answer=forgePlaced.map(i=>[...item.letters][i]).join('').toLowerCase();
      if(!validatorSessionId||!validatorClientForSession||validatorFunctionName!=='velorn-think-lab-validator'||(!window.EpiphanyAuth?.isSignedIn?.()&&!validatorGuestToken)){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Your secure Word Forge session has expired. Return to Think Lab and start a new round.';return;}
      const answerBody={action:'answer',gameId:'word_forge',sessionId:validatorSessionId,questionIndex:index,answerWord:answer};if(validatorGuestToken)answerBody.guestToken=validatorGuestToken;
      const {data,error}=await validatorClientForSession.functions.invoke('velorn-think-lab-validator',{body:answerBody});
      const validProgress=!!data&&typeof data.correct==='boolean'&&typeof data.advance==='boolean'&&data.questionIndex===index&&
        Number.isInteger(data.nextIndex)&&Number.isInteger(data.correctCount)&&data.correctCount>=0&&data.correctCount<=pool.length&&
        Number.isInteger(data.attemptsRemaining)&&data.attemptsRemaining>=0&&data.attemptsRemaining<=2;
      if(error||!validProgress){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='We could not verify that word. Please check your connection and try again.';return;}
      if(!data.advance){
        if(data.nextIndex!==index||data.completed!==false){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='The secure session returned an inconsistent question state. Please restart Word Forge.';return;}
        roundMistakes++;fb.hidden=false;fb.className='tl-feedback is-wrong';fb.innerHTML='<strong>Not forged yet—try again.</strong><p>Check the clue and letter order. You have '+data.attemptsRemaining+' '+(data.attemptsRemaining===1?'attempt':'attempts')+' remaining.</p>'+(roundMistakes>=2&&activeDifficulty&&activeDifficulty.hintLevel>0?'<p>'+esc(adaptiveHint('forge'))+'</p>':'');return;
      }
      const finalQuestion=index===pool.length-1;
      if(data.nextIndex!==index+1||data.completed!==finalQuestion||
        ((data.correct||data.advance)&&(!data.correctAnswer||typeof data.explanation!=='string'||typeof data.skill!=='string'))){
        fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='The secure session did not confirm the expected progress. Please restart Word Forge.';return;
      }
      if(data.correct)score++;locked=true;root.querySelectorAll('[data-forge-tile],[data-forge-slot],[data-forge-check],[data-forge-reset]').forEach(el=>el.disabled=true);
      if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('spelling','word-forge',data.correct,index===pool.length-1);
      fb.hidden=false;fb.className='tl-feedback '+(data.correct?'is-correct':'is-wrong');fb.innerHTML='<strong>'+(data.correct?'✓ Word forged!':'↗ The word was revealed.')+'</strong><p><b>'+esc(String(data.correctAnswer||'').toUpperCase())+'</b> — '+esc(data.explanation||'')+'</p><p><strong>Skill:</strong> '+esc(data.skill||'Vocabulary')+'</p>';
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;saveInternalProgress(index+1);return;
    }
    if(e.target.closest('[data-scramble-check]')){
      if(locked)return;
      const pool=activePool||[],item=pool[index%pool.length],fb=root.querySelector('#tl-feedback');
      if(!item || !Array.isArray(scramblePlaced) || scramblePlaced.length!==item.words.length || !scramblePlaced.every(value=>Number.isInteger(value))){
        fb.hidden=false;fb.className='tl-feedback is-wrong';fb.innerHTML='<strong>Place every word tile first.</strong><p>Fill all the spaces before checking your sentence.</p>';return;
      }
      if(!validatorSessionId || !validatorClientForSession || validatorFunctionName!=='velorn-think-lab-validator' ||
          (!window.EpiphanyAuth?.isSignedIn?.() && !validatorGuestToken)){
        fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Your secure sentence session is unavailable. Please return to Think Lab and start again.';return;
      }
      const answerBody={action:'answer',gameId:'sentence_scramble',sessionId:validatorSessionId,questionIndex:index,tileOrder:scramblePlaced.slice()};
      if(validatorGuestToken)answerBody.guestToken=validatorGuestToken;
      const {data,error}=await validatorClientForSession.functions.invoke(validatorFunctionName,{body:answerBody});
      const correct=!!data && data.correct===true;
      const responseValid=!error && data && typeof data.correct==='boolean' && data.questionIndex===index &&
        data.nextIndex===(correct?index+1:index) && data.completed===(correct && index===pool.length-1) &&
        (correct
          ? typeof data.sentence==='string' && typeof data.explanation==='string' && typeof data.skill==='string'
          : !Object.hasOwn(data,'sentence') && !Object.hasOwn(data,'explanation') && !Object.hasOwn(data,'skill'));
      if(!responseValid){
        fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='We could not verify this arrangement. Please retry your answer.';return;
      }
      if(!correct){
        roundMistakes++;fb.hidden=false;fb.className='tl-feedback is-wrong';
        fb.innerHTML='<strong>Not quite—rearrange the word tiles.</strong><p>Check the subject and verb first, then place adverbs and time phrases where they sound natural.</p>'+(roundMistakes>=2?'<p>'+esc(adaptiveHint('scramble'))+'</p>':'');
        saveInternalProgress(index);return;
      }
      score++;locked=true;
      if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('grammar','sentence-scramble',true,index===pool.length-1);
      root.querySelectorAll('[data-scramble-tile],[data-scramble-slot],[data-scramble-check],[data-scramble-reset]').forEach(el=>el.disabled=true);
      fb.hidden=false;fb.className='tl-feedback is-correct';
      fb.innerHTML='<strong>✓ Sentence built!</strong><p>'+esc(data.sentence)+' — '+esc(data.explanation)+'</p>';
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;saveInternalProgress(index+1);return;
    }

    const daily=e.target.closest('[data-think-daily]');if(daily){beginDailyChallenge();return;}
    const resume=e.target.closest('[data-think-resume]');if(resume){if(!resumeInternalGame(resume.dataset.thinkResume))landing();return;}
    const recommended=e.target.closest('[data-think-recommended]'); if(recommended){start(recommended.dataset.thinkRecommended);return;}
    const trainingChoice=e.target.closest('[data-think-training-mode]');
    if(trainingChoice){
      selectedTrainingMode=trainingChoice.dataset.thinkTrainingMode;
      const gameId=trainingChoice.dataset.thinkTrainingGame;
      if(gameId==='translator') showTranslatorLevelPicker();
      else if(gameId==='maze') showMazeLevelPicker();
      else await beginGame(gameId,selectedTrainingMode);
      return;
    }
    const translatorLevel=e.target.closest('[data-translator-level]');
    if(translatorLevel){
      const requestedLevel=translatorLevel.dataset.translatorLevel;
      if(requestedLevel!=='adaptive'&&!canChooseThinkLabCEFR(requestedLevel))return;
      selectedTranslatorCEFR=requestedLevel;
      beginGame('translator',selectedTrainingMode);return;
    }
    const mazeLevel=e.target.closest('[data-sound-maze-level]');
    if(mazeLevel){
      if(!canChooseThinkLabCEFR(mazeLevel.dataset.soundMazeLevel))return;
      selectedMazeCEFR=mazeLevel.dataset.soundMazeLevel;
      if (preparedMazeCEFR !== selectedMazeCEFR) {
        activePool = getRoundPool('maze', selectedTrainingMode);
        preparedMazeCEFR = selectedMazeCEFR;
        if (activePool[0]?.target) window.EpiphanySpeech?.prefetch?.(activePool[0].target, {rate:0.82});
      }
      const bridge=window.EpiphanyThinkLab;
      if(bridge&&typeof bridge.setSoundMazeCEFR==='function')bridge.setSoundMazeCEFR(selectedMazeCEFR);
      const tools=window.EPIPHANY_SOUND_MAZE_TOOLS,bank=window.EPIPHANY_SOUND_MAZE_BANK;
      if(!tools||!bank||!tools.validateBank(bank).valid){showMazeBankUnavailable();return;}
      beginGame('maze',selectedTrainingMode);return;
    }
    const launch=e.target.closest('[data-think-game]'); if(launch){start(launch.dataset.thinkGame);return;}
    if(e.target.closest('[data-think-home]')){
      window.EpiphanySpeech?.stop?.();
      dailyChallengeActive=null;
      mode=null;activePool=null;activeDifficulty=null;pickerStage='landing';pickerGameId=null;
      landing();
      return;
    }
    if(e.target.closest('[data-think-back]')){
      window.EpiphanySpeech?.stop?.();
      if(dailyChallengeActive){dailyChallengeActive=null;mode=null;activePool=null;activeDifficulty=null;pickerStage='landing';pickerGameId=null;landing();return;}
      if(pickerStage==='game' && pickerGameId){
        if(pickerGameId==='translator')showTranslatorLevelPicker();
        else if(pickerGameId==='maze')showMazeLevelPicker();
        else showTrainingModePicker(pickerGameId);
        return;
      }
      if(pickerStage==='level' && (pickerGameId==='translator'||pickerGameId==='maze')){
        showTrainingModePicker(pickerGameId);
        return;
      }
      pickerStage='landing';
      pickerGameId=null;
      landing();
      return;
    }
    if(e.target.closest('[data-translator-hint]')&&mode==='translator'&&!locked){const pool=activePool||getRoundPool('translator'),item=pool[index%pool.length],hint=root.querySelector('[data-translator-hint-text]'),button=root.querySelector('[data-translator-hint]');if(hint){hint.hidden=false;hint.textContent=item.hint;}if(button){button.disabled=true;button.textContent='Hint revealed';}saveInternalProgress(index);return;}
    if(e.target.closest('[data-training-hint]')&&mode&&!locked){const hint=root.querySelector('[data-training-hint-text]'),button=root.querySelector('[data-training-hint]');if(hint){hint.hidden=false;hint.textContent=guidedHint(mode);}if(button){button.disabled=true;button.textContent='Hint revealed';}saveInternalProgress(index);return;}
    if(e.target.closest('[data-think-clue]')){clueCount=Math.min((activePool || getRoundPool('detective'))[index%(activePool || getRoundPool('detective')).length].clues.length-1,clueCount+1);renderGame();return;}
    if(e.target.closest('[data-think-next]')){window.EpiphanySpeech?.stop?.();index++;oddHintStep=0;chainStepIndex=0;chainPath=[];chainExplanations=[];connectionSelected=[];clueCount=0;roundMistakes=0;ladderPath=[];ladderWordNote=null;ladderMistakeRecorded=false;if(index>=(activePool || getRoundPool(mode)).length){const finished=mode;const totalRounds=(activePool || getRoundPool(finished)).length;const finishingDaily=dailyChallengeActive&&dailyChallengeActive.gameId===finished;
if(!finishingDaily)window.EpiphanyThinkLab?.clearGameSnapshot?.(finished);
window.EpiphanyThinkLab?.recordGameCompletion?.(finished,'session');
if(finishingDaily){const result=window.EpiphanyThinkLab?.completeDailyChallenge?.(dailyChallengeActive.date,finished);if(result?.completed)dailyChallengeActive=null;}
root.innerHTML='<div class="tl-finish"><span class="tl-finish-mark">∴</span><span class="tl-eyebrow">CASE FILE CLOSED</span><h2>Good thinking.</h2><p>You solved <b>'+score+' of '+totalRounds+'</b> challenges. The goal is not only to get it right—it’s to understand why.</p><button type="button" class="tl-next" data-think-restart>Try another case ↗</button><button type="button" class="tl-back" data-think-back>Back to Think Lab</button></div>';mode=null;activePool=null;activeDifficulty=null;pickerStage='landing';pickerGameId=null;}else renderGame();return;}
    if(e.target.closest('[data-think-restart]')){landing();return;}
    if(e.target.closest('[data-think-speak]')){speakTarget();return;}
    const chainAnswer=e.target.closest('[data-chain-answer]');
    if(chainAnswer&&mode==='chain'&&!locked){
      const pool=activePool||getRoundPool('chain'),item=pool[index%pool.length],steps=item.links,step=steps[chainStepIndex],chosen=Number(chainAnswer.dataset.chainAnswer);
      const fb=root.querySelector('#tl-feedback');
      if(!validatorSessionId||!validatorClientForSession||validatorFunctionName!=='velorn-think-lab-validator'||(!window.EpiphanyAuth?.isSignedIn?.()&&!validatorGuestToken)){
        fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Your secure Chain Reaction session is unavailable. Return to Think Lab and start again.';return;
      }
      const answerBody={action:'answer',gameId:'chain_reaction',sessionId:validatorSessionId,questionIndex:index,linkIndex:chainStepIndex,selectedIndex:chosen};
      if(validatorGuestToken)answerBody.guestToken=validatorGuestToken;
      const {data,error}=await validatorClientForSession.functions.invoke(validatorFunctionName,{body:answerBody});
      const validResponse=!!data&&typeof data.correct==='boolean'&&data.questionIndex===index&&
        data.linkIndex===chainStepIndex&&Number.isInteger(data.nextLinkIndex)&&
        Number.isInteger(data.nextIndex)&&typeof data.challengeCompleted==='boolean'&&typeof data.completed==='boolean';
      if(error||!validResponse){
        fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='We could not verify this link. Please check your connection and try again.';return;
      }
      if(!data.correct){
        if(data.nextLinkIndex!==chainStepIndex||data.nextIndex!==index||data.challengeCompleted||data.completed||data.nextWord!=null||data.explanation!=null){
          fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='The secure session returned an inconsistent link state. Please restart Chain Reaction.';return;
        }
        roundMistakes++;
        if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('vocabulary','chain',false,false);
        const hint=roundMistakes>=2?adaptiveHint('chain'):'';
        fb.hidden=false;fb.className='tl-feedback is-wrong';
        fb.innerHTML='<strong>That link is possible, but not the strongest fit.</strong><p>Try a word that connects more directly to “'+esc(step.from)+'”.</p>'+(hint?'<p>'+esc(hint)+'</p>':'');
        saveInternalProgress(index);return;
      }
      const finalLink=chainStepIndex===steps.length-1;
      const finalChallenge=index===pool.length-1;
      if(data.nextLinkIndex!==(finalLink?0:chainStepIndex+1)||
         data.nextIndex!==index+(finalLink?1:0)||
         data.challengeCompleted!==finalLink||
         data.completed!==(finalLink&&finalChallenge)||
         typeof data.nextWord!=='string'||typeof data.explanation!=='string'||!data.explanation){
        fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='The secure session did not confirm the expected link progression. Please restart Chain Reaction.';return;
      }
      chainPath.push(data.nextWord);
      chainExplanations.push(data.explanation);
      roundMistakes=0;
      if(!finalLink){
        const explanation='<p><strong>Link '+(chainStepIndex+1)+':</strong> '+esc(data.explanation)+'</p>';
        chainStepIndex++;
        renderGame();
        const updated=root.querySelector('#tl-feedback');
        if(updated){updated.hidden=false;updated.className='tl-feedback is-correct';updated.innerHTML='<strong>✓ Link connected.</strong>'+explanation;}
        saveInternalProgress(index);return;
      }
      locked=true;score++;
      const pathElement=root.querySelector('.tl-chain-path');
      if(pathElement)pathElement.innerHTML=[item.start,...chainPath].map(word=>'<span class="tl-chain-link">'+esc(word)+'</span>').join('<span class="tl-ladder-step"> → </span>');
      root.querySelectorAll('[data-chain-answer]').forEach(button=>button.disabled=true);
      if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('vocabulary','chain',true,index===pool.length-1);
      fb.hidden=false;fb.className='tl-feedback is-correct';
      fb.innerHTML='<strong>✓ Chain complete!</strong>'+steps.map((part,i)=>'<p><strong>Link '+(i+1)+':</strong> '+esc(part.from)+' → '+esc(chainPath[i])+'. '+esc(chainExplanations[i])+'</p>').join('');
      const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;saveInternalProgress(index+1);return;
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
      saveInternalProgress(index);return;
    }
    const answer=e.target.closest('[data-think-answer]'); if(!answer||locked||!mode)return;
    const pool=activePool || getRoundPool(mode),item=pool[index%pool.length];
    if(mode==='wordladder')return;
    locked=true;
    const chosen=Number(answer.dataset.thinkAnswer);
    let serverAnswerResult=null;
    if(mode==='odd'){
      if(!validatorSessionId||!validatorClientForSession||validatorFunctionName!=='velorn-think-lab-validator'||(!window.EpiphanyAuth?.isSignedIn?.()&&!validatorGuestToken)){
        locked=false;const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Your secure session is unavailable. Please return to Think Lab and start again.';return;
      }
      const answerBody={action:'answer',gameId:'odd_one_out',sessionId:validatorSessionId,questionIndex:index,selectedIndex:chosen};
      if(validatorGuestToken)answerBody.guestToken=validatorGuestToken;
      const {data,error}=await validatorClientForSession.functions.invoke(validatorFunctionName,{body:answerBody});
      if(error||!data||!Number.isInteger(data.correctIndex)||typeof data.correct!=='boolean'){
        locked=false;const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='We could not verify that answer. Please retry this question.';return;
      }
      serverAnswerResult=data.correct;item.answer=data.correctIndex;item.explain=data.explanation||'';item.hint=data.hint||item.hint;item.relationshipLabel=data.relationship||item.relationshipLabel;
    }
    const correct=mode==='odd'?serverAnswerResult:mode==='maze'?item.options[chosen]===item.target:chosen===item.answer;
    if(correct)score++;else roundMistakes++;
    if(window.EpiphanyThinkLab){const skill=mode==='maze'?'listening':mode==='translator'?'conversation':mode==='detective'?'reading':mode==='wordladder'||mode==='forge'?'spelling':mode==='scramble'?'grammar':'vocabulary';window.EpiphanyThinkLab.recordResult(skill,mode,correct,index===(activePool || getRoundPool(mode)).length-1,{trackAdaptive:mode !== 'translator' || selectedTranslatorCEFR === 'adaptive',rewardKey:mode==='odd'?item.rewardKey:undefined,completionKey:mode==='odd'&&index===(activePool || getRoundPool(mode)).length-1?item.completionKey:undefined});}
    saveInternalProgress(index+1);
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
  window.EPIPHANY_THINK_LAB_HOME = function () {
    window.EpiphanySpeech?.stop?.();
    mode = null; activePool = null; activeDifficulty = null; validatorSessionId = null; validatorClientForSession = null; validatorFunctionName = null; validatorGuestToken = null; chainExplanations = []; pickerStage = 'landing'; pickerGameId = null;
    landing();
  };
  landing();
})();