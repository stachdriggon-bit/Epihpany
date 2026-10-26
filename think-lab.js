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
  let mode = null, index = 0, score = 0, locked = false, clueCount = 0, ladderPath = [], ladderWordNote = null, ladderMistakeRecorded = false, roundMistakes = 0, activePool = null, activeDifficulty = null;

  rounds.forge = [
    {prompt:'Which word can you forge from these letters?',clue:'A small animal often kept as a pet.',letters:'T A C',options:['act','cat','tac'],answer:1,explain:'CAT uses all three letters and matches the clue.'},
    {prompt:'Which word can you forge from these letters?',clue:'A place where you borrow books.',letters:'Y B R R A L I',options:['library','railway','bright'],answer:0,explain:'LIBRARY is where people borrow books or read and study.'},
    {prompt:'Which word can you forge from these letters?',clue:'The opposite of noisy.',letters:'T E Q U I',options:['quite','quiet','quote'],answer:1,explain:'QUIET means making little or no noise.'},
    {prompt:'Which word can you forge from these letters?',clue:'A person whose job is to help students learn.',letters:'C E H T A R E',options:['teacher','cheater','reached'],answer:0,explain:'A TEACHER helps people learn.'},
    {prompt:'Which word can you forge from these letters?',clue:'Move through the air.',letters:'Y F L',options:['fly','fry','lay'],answer:0,explain:'FLY means to move through the air.'},
    {prompt:'Which word can you forge from these letters?',clue:'Feeling pleased or content.',letters:'P Y H A P',options:['puppy','happy','hobby'],answer:1,explain:'HAPPY describes a feeling of pleasure or contentment.'}
  ];
  rounds.connections = [
    {prompt:'Which category connects these four words?',words:['rose','tulip','daisy','lily'],options:['Flowers','Tools','Weather'],answer:0,explain:'Rose, tulip, daisy and lily are all flowers.'},
    {prompt:'Which category connects these four words?',words:['eagle','sparrow','robin','owl'],options:['Fish','Birds','Mammals'],answer:1,explain:'Eagle, sparrow, robin and owl are all birds.'},
    {prompt:'Which category connects these four words?',words:['shirt','jacket','socks','scarf'],options:['Things you wear','Tableware','Furniture'],answer:0,explain:'A shirt, jacket, socks and scarf are all items of clothing.'},
    {prompt:'Which category connects these four words?',words:['minute','hour','second','day'],options:['Seasons','Units or periods of time','Directions'],answer:1,explain:'Minute, hour, second and day are all units or periods of time.'},
    {prompt:'Which category connects these four words?',words:['whisper','shout','murmur','scream'],options:['Ways of speaking','Ways of moving','Ways of cooking'],answer:0,explain:'Whisper, shout, murmur and scream describe ways of speaking.'},
    {prompt:'Which category connects these four words?',words:['tiny','small','little','minute'],options:['Very large','Very loud','Small in size'],answer:2,explain:'Tiny, small, little and minute can all mean small in size.'}
  ];
  rounds.scramble = [
    {prompt:'Choose the correctly ordered sentence.',words:['usually','coffee','I','morning','drink','the','in'],options:['Usually coffee I drink in the morning.','I usually drink coffee in the morning.','I drink usually in the coffee morning.'],answer:1,explain:'The natural order is subject + adverb of frequency + verb + object + time phrase.'},
    {prompt:'Choose the correctly ordered sentence.',words:['already','has','she','finished','work','her'],options:['She has already finished her work.','Already she finished has her work.','She already has finish her work.'],answer:0,explain:'In the present perfect, “already” commonly appears between has and the past participle.'},
    {prompt:'Choose the correctly ordered sentence.',words:['you','could','me','help','please'],options:['You could me help please.','Could you help me, please?','Could help you me please?'],answer:1,explain:'“Could you help me, please?” is a natural, polite request.'},
    {prompt:'Choose the correctly ordered sentence.',words:['because','stayed','it','home','raining','was','we'],options:['Because raining it was we stayed home.','We stayed home because it was raining.','We because it was raining stayed home.'],answer:1,explain:'The main clause is followed by “because” and the reason.'},
    {prompt:'Choose the correctly ordered sentence.',words:['never','such','I','seen','have','a','view','beautiful'],options:['I have never seen such a beautiful view.','I never have such seen a beautiful view.','Never I seen have a beautiful such view.'],answer:0,explain:'“Never” goes between have and the past participle in this sentence.'},
    {prompt:'Choose the correctly ordered sentence.',words:['if','had','left','earlier','we','would','arrived','have','on','time'],options:['If we had left earlier, we would have arrived on time.','If we would have left earlier, we had arrived on time.','We would arrived on time if had left earlier.'],answer:0,explain:'This is a third conditional: If + past perfect, would have + past participle.'}
  ];
  rounds.chain = [
    {prompt:'Continue the word association chain: RAIN → ?',options:['umbrella','desert','pillow'],answer:0,explain:'An umbrella is commonly used to stay dry in the rain.'},
    {prompt:'Continue the word association chain: BOOK → ?',options:['oven','library','helmet'],answer:1,explain:'A library is a place associated with books.'},
    {prompt:'Continue the word association chain: CHEF → ?',options:['airport','kitchen','forest'],answer:1,explain:'A chef usually works in a kitchen.'},
    {prompt:'Continue the word association chain: SCHOOL → ?',options:['student','pilot','painter'],answer:0,explain:'Students attend school to learn.'},
    {prompt:'Continue the word association chain: DOCTOR → ?',options:['stadium','hospital','bakery'],answer:1,explain:'Doctors often work in hospitals.'},
    {prompt:'Continue the word association chain: MUSIC → ?',options:['passport','instrument','blanket'],answer:1,explain:'Music can be played on a musical instrument.'}
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
bark dark core hand land lane data duty`
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
    for (const start of words) for (const goal of words) {
      if (start.length !== goal.length || start === goal) continue;
      const path = findLadderPath(start, goal);
      if (!path) continue;
      const steps = path.length - 1;
      if (steps < minSteps || steps > maxSteps) continue;
      candidates.push({start,goal,path:path.slice(1),hint:'Change one letter at a time. Use real words and keep a route open to the goal.',explain:path.join(' → ')+' is one valid route. Each move changes exactly one letter.'});
    }
    for (let i=candidates.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [candidates[i],candidates[j]]=[candidates[j],candidates[i]]; }
    const chosen=[],pairs=new Set();
    for (const item of candidates) { const key=item.start+':'+item.goal; if(pairs.has(key))continue; chosen.push(item); pairs.add(key); if(chosen.length>=count)break; }
    return chosen.length >= Math.min(6,count) ? chosen : [...rounds.wordladder];
  }
  function getRoundPool(id, selectedLevel) {
    const level = selectedLevel || difficultyForMode(id).level;
    if (level === 'guided' && guidedRounds[id]) return guidedRounds[id];
    if (level === 'challenge' && challengeRounds[id]) return challengeRounds[id];
    if (id === 'wordladder') return generateWordLadders(level, 12);
    if (['forge','connections','scramble','chain'].includes(id)) return rounds[id];
    return rounds[id];
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const games = [
    {id:'odd',num:'01',icon:'◈',name:'Odd One Out',tag:'PATTERN RECOGNITION',desc:'Spot the outsider, then explain the relationship that connects the others.',time:'2–3 min'},
    {id:'detective',num:'02',icon:'⌕',name:'The Language Detective',tag:'CLUES & INFERENCE',desc:'Read the evidence, connect the clues and choose the best-supported conclusion.',time:'3–4 min'},
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
  function renderGame() {
    const pool = activePool || getRoundPool(mode);
    const item = pool[index % pool.length];
    const difficulty = activeDifficulty || difficultyForMode(mode);
    locked = false;
    if(mode==='wordladder'&&!ladderPath.length)ladderPath=[item.start];
    let intro = '';
    if (mode === 'odd') intro = '<div class="tl-word-options">'+item.words.map((w,i)=>'<button type="button" class="tl-option tl-word-option" data-think-answer="'+i+'"><span class="tl-option-index">0'+(i+1)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'translator') intro = '<div class="tl-translation-prompt" lang="ar" dir="rtl">'+esc(item.ar)+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'wordladder') {
      const path = ladderPath.length ? ladderPath : [item.start];
      intro = '<div class="tl-ladder-targets"><div><span>START</span><strong>'+esc(item.start)+'</strong></div><span class="tl-ladder-arrow">→</span><div><span>GOAL</span><strong>'+esc(item.goal)+'</strong></div></div><p class="tl-ladder-hint">'+esc(item.hint)+'</p><div class="tl-ladder-path">'+path.map((w,i)=>'<span class="tl-ladder-word '+(i===path.length-1?'is-current':'')+'">'+esc(w)+'</span>').join('<span class="tl-ladder-step">↓</span>')+'</div>'+(ladderWordNote?'<aside class="tl-ladder-meaning" aria-live="polite"><strong>'+esc(ladderWordNote.word)+'</strong><p>'+esc(ladderWordNote.meaning||'No definition is available for this word yet.')+'</p></aside>':'')+(path[path.length-1]===item.goal?'<p class="tl-ladder-success">Ladder complete! Every move is valid.</p>':'<form class="tl-ladder-form" data-think-ladder-form><label for="tl-ladder-input">Next word</label><div><input id="tl-ladder-input" name="ladder-word" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the next word" required><button class="tl-next" type="submit">Make move →</button></div><small>Use a word from the game’s word bank. Change one letter and keep a route open to the goal.</small></form>');
    }
    if (mode === 'forge') intro='<div class="tl-word-clue"><span>WORD CLUE</span><p>'+esc(item.clue)+'</p></div><div class="tl-forge-letters">'+[...item.letters].map(ch=>'<span>'+esc(ch)+'</span>').join('')+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'connections') intro='<div class="tl-connection-grid">'+item.words.map(w=>'<span class="tl-connection-word">'+esc(w)+'</span>').join('')+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'scramble') intro='<div class="tl-scramble-bank">'+item.words.map(w=>'<span class="tl-word-chip">'+esc(w)+'</span>').join('')+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'chain') intro='<div class="tl-chain-path">'+esc(item.prompt.replace('Continue the word association chain: ',''))+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'maze') intro = '<div class="tl-maze-target"><span class="tl-maze-sound">♫</span><div><span>LISTEN FOR THIS WORD</span><strong>Find the matching word</strong></div><button type="button" class="tl-secondary" data-think-speak>▶ Play word</button></div><div class="tl-maze-path"><span class="tl-maze-start">START</span><span>···</span><span class="tl-maze-finish">EXIT</span></div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'detective') intro = '<div class="tl-clue-list">'+item.clues.slice(0,Math.min(item.clues.length,clueCount+1+(difficulty.hintLevel>=2?1:0))).map((c,i)=>'<div class="tl-clue"><span>CLUE 0'+(i+1)+'</span><p>'+esc(c)+'</p></div>').join('')+'</div><div class="tl-reveal-row">'+(clueCount<item.clues.length-1?'<button class="tl-secondary" type="button" data-think-clue>Reveal next clue +</button>':'<span class="tl-all-clues">All evidence revealed</span>')+'</div><h3 class="tl-question">'+item.question+'</h3><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← All cases</button><span class="tl-eyebrow">CASE '+String(index+1).padStart(2,'0')+' / '+pool.length+'</span><span class="tl-score">SOLVED <b>'+score+'</b></span></div><div class="tl-game-card"><div class="tl-game-kicker">'+(mode==='odd'?'PATTERN ANALYSIS':mode==='detective'?'EVIDENCE BOARD':mode==='translator'?'NATURAL EXPRESSION':mode==='wordladder'?'WORD TRANSFORMATION':mode==='forge'?'WORD FORGE':mode==='connections'?'WORD CONNECTIONS':mode==='scramble'?'SENTENCE BUILDING':mode==='chain'?'WORD ASSOCIATION':'LISTENING MAZE')+'</div><div class="tl-level-tag">'+(difficulty.level==='challenge'?'CHALLENGE':difficulty.level==='steady'?'STEADY':'GUIDED')+'</div><h2>'+esc(mode==='detective'?item.title:mode==='wordladder'?'Transform the word':mode==='maze'?'Find the sound path':item.prompt)+'</h2><p class="tl-game-instruction">'+esc(mode==='odd'?item.why:mode==='translator'?'Read the Arabic sentence, then choose the natural English equivalent.':mode==='wordladder'?'Build a chain of real words. Only one letter may change in each move.':mode==='maze'?'Listen carefully, replay the word if needed, then choose the matching spelling.':mode==='forge'?'Use the available letters and the clue to identify the word.':mode==='connections'?'Find the category that best describes all four words.':mode==='scramble'?'Choose the sentence with natural English word order.':mode==='chain'?'Choose the word most directly associated with the starting word.':'Reveal the clues and select the conclusion they support.')+'</p>'+intro+'<div class="tl-feedback" id="tl-feedback" aria-live="polite" hidden></div><div class="tl-game-actions"><span>ROUND '+(index+1)+' OF '+pool.length+'</span><button class="tl-next" type="button" data-think-next hidden>Next round →</button></div></div>';
  }
  function speakTarget() { const pool=activePool || getRoundPool('maze');const item=pool[index%pool.length]; if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){const fb=root.querySelector('#tl-feedback');if(fb){fb.hidden=false;fb.className='tl-feedback is-wrong';fb.textContent='Speech playback is not available in this browser.';}return;} window.speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(item.target); utterance.lang='en-US'; utterance.rate=.82; window.speechSynthesis.speak(utterance); }
  function start(id) { mode=id; index=0; score=0; clueCount=0; roundMistakes=0; ladderPath=[]; ladderWordNote=null; ladderMistakeRecorded=false; activeDifficulty=difficultyForMode(id); activePool=getRoundPool(id,activeDifficulty.level); renderGame(); if(id==='maze') speakTarget(); }
  root.addEventListener('submit', e => {
    const form=e.target.closest('[data-think-ladder-form]');if(!form||mode!=='wordladder')return;e.preventDefault();if(locked)return;
    const pool=activePool || getRoundPool('wordladder'),item=pool[index%pool.length],input=form.querySelector('input'),word=input.value.trim().toLowerCase(),previous=ladderPath[ladderPath.length-1];
    ladderWordNote={word,meaning:ladderMeanings[word]||null};
    const differs=ladderDiffersByOne(previous,word),alreadyUsed=ladderPath.includes(word);
    const route=findLadderPath(word,item.goal,new Set([...ladderPath,word]));
    const allowed=ladderWordBank.has(word)&&differs&&!alreadyUsed&&!!route;
    if(!allowed){roundMistakes++;const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-wrong';const reason=!differs?'Change exactly one letter from “'+esc(previous)+'”.':!ladderWordBank.has(word)?'That word is not in this game’s curated word bank yet. Try another common English word.':alreadyUsed?'You have already used that word. Choose a new step.':'That move closes off the route to the goal. Try a word that keeps a valid path open.';fb.innerHTML='<strong>Not quite—check the move.</strong><p>'+reason+'</p>'+(ladderWordNote.meaning?'<p><strong>'+esc(word)+':</strong> '+esc(ladderWordNote.meaning)+'</p>':'')+(roundMistakes>=2?'<p>'+esc(adaptiveHint('wordladder'))+'</p>':'')+(roundMistakes>=3&&ladderMeanings[item.goal]?'<aside class="tl-ladder-meaning tl-ladder-goal-hint" role="note"><strong>Meaning hint for the goal word “'+esc(item.goal)+'”</strong><p>'+esc(ladderMeanings[item.goal])+'</p></aside>':'');if(!ladderMistakeRecorded&&window.EpiphanyThinkLab){window.EpiphanyThinkLab.recordResult('spelling','word-ladder',false,false);ladderMistakeRecorded=true;}input.select();return;}
    ladderPath.push(word);
    if(window.EpiphanyThinkLab)window.EpiphanyThinkLab.recordResult('spelling','word-ladder',true,word===item.goal&&index===(activePool || getRoundPool('wordladder')).length-1);
    if(word===item.goal){score++;locked=true;roundMistakes=0;renderGame();const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback is-correct';fb.innerHTML='<strong>✓ Ladder complete!</strong><p>'+esc(item.explain)+'</p>';const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;}
    else{renderGame();const input2=root.querySelector('#tl-ladder-input');if(input2)input2.focus();}
  });
  root.addEventListener('click', e => {
    const recommended=e.target.closest('[data-think-recommended]'); if(recommended){start(recommended.dataset.thinkRecommended);return;}
    const launch=e.target.closest('[data-think-game]'); if(launch){start(launch.dataset.thinkGame);return;}
    if(e.target.closest('[data-think-back]')){if(window.speechSynthesis)window.speechSynthesis.cancel();landing();return;}
    if(e.target.closest('[data-think-clue]')){clueCount=Math.min((activePool || getRoundPool('detective'))[index%(activePool || getRoundPool('detective')).length].clues.length-1,clueCount+1);renderGame();return;}
    if(e.target.closest('[data-think-next]')){if(window.speechSynthesis)window.speechSynthesis.cancel();index++;clueCount=0;roundMistakes=0;ladderPath=[];ladderWordNote=null;ladderMistakeRecorded=false;if(index>=(activePool || getRoundPool(mode)).length){const finished=mode;const totalRounds=(activePool || getRoundPool(finished)).length;root.innerHTML='<div class="tl-finish"><span class="tl-finish-mark">∴</span><span class="tl-eyebrow">CASE FILE CLOSED</span><h2>Good thinking.</h2><p>You solved <b>'+score+' of '+totalRounds+'</b> challenges. The goal is not only to get it right—it’s to understand why.</p><button type="button" class="tl-next" data-think-restart>Try another case ↗</button><button type="button" class="tl-back" data-think-back>Back to Think Lab</button></div>';mode=null;activePool=null;activeDifficulty=null;}else renderGame();return;}
    if(e.target.closest('[data-think-restart]')){landing();return;}
    if(e.target.closest('[data-think-speak]')){speakTarget();return;}
    const answer=e.target.closest('[data-think-answer]'); if(!answer||locked||!mode)return;
    const pool=activePool || getRoundPool(mode),item=pool[index%pool.length];
    if(mode==='wordladder')return;
    locked=true;const chosen=Number(answer.dataset.thinkAnswer),correct=mode==='maze'?item.options[chosen]===item.target:chosen===item.answer;if(correct)score++;else roundMistakes++;
    if(window.EpiphanyThinkLab){const skill=mode==='maze'?'listening':mode==='translator'?'conversation':mode==='detective'?'reading':mode==='wordladder'||mode==='forge'?'spelling':mode==='scramble'?'grammar':'vocabulary';window.EpiphanyThinkLab.recordResult(skill,mode,correct,index===(activePool || getRoundPool(mode)).length-1);}
    root.querySelectorAll('[data-think-answer]').forEach(b=>{b.disabled=true;const n=Number(b.dataset.thinkAnswer);const isRight=mode==='maze'?item.options[n]===item.target:n===item.answer;if(isRight)b.classList.add('is-correct');if(n===chosen&&!correct)b.classList.add('is-wrong');});
    const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback '+(correct?'is-correct':'is-wrong');fb.innerHTML='<strong>'+(correct?(mode==='maze'?'✓ Path cleared!':'✓ Well reasoned.'):'↗ Look at the clues again.')+'</strong><p>'+esc(item.explain)+'</p>'+(!correct&&adaptiveHint(mode)?'<p>'+esc(adaptiveHint(mode))+'</p>':'')+(mode==='maze'?'<p class="tl-heard-word">Target word: <b>'+esc(item.target)+'</b></p>':'');
    const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;
  });
  landing();
})();