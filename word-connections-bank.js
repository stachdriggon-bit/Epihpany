/* EPIPHANY THINK LAB — Word Connections reviewed bank */
(() => {
  'use strict';
  const makeRound = (mode, number, words, explain) => ({id:mode+'-'+String(number).padStart(2,'0'),prompt:'Which category connects these four words?',words,explain});
  const MODES = {
    guided: [
      makeRound('guided',1,['apple','banana','orange','grape'],'All four are familiar types of fruit, usually eaten fresh.'),
      makeRound('guided',2,['bus','train','taxi','bicycle'],'All four are means of transport used to travel from place to place.'),
      makeRound('guided',3,['bedroom','kitchen','bathroom','living room'],'All four are rooms designed for different uses inside a home.'),
      makeRound('guided',4,['monday','tuesday','wednesday','friday'],'All four are names of days of the week.'),
      makeRound('guided',5,['red','blue','green','yellow'],'All four are common colour names.'),
      makeRound('guided',6,['spoon','fork','knife','plate'],'All four are items of tableware used when serving or eating food.'),
      makeRound('guided',7,['doctor','teacher','pilot','chef'],'All four are professions that require specific skills.'),
      makeRound('guided',8,['winter','summer','spring','autumn'],'All four are the seasons of the year.'),
      makeRound('guided',9,['eye','ear','nose','mouth'],'All four are parts of the face with sensory or other important functions.'),
      makeRound('guided',10,['pencil','ruler','eraser','notebook'],'All four are common school supplies used for learning and writing.'),
      makeRound('guided',11,['rain','snow','wind','fog'],'All four are weather phenomena found in nature.'),
      makeRound('guided',12,['lion','tiger','elephant','giraffe'],'All four are wild animals.'),
      makeRound('guided',13,['cow','sheep','goat','horse'],'All four are domesticated animals commonly raised on farms.'),
      makeRound('guided',14,['piano','guitar','violin','drum'],'All four are musical instruments.'),
      makeRound('guided',15,['water','milk','juice','tea'],'All four are drinks.'),
      makeRound('guided',16,['triangle','square','circle','rectangle'],'All four are two-dimensional geometric shapes.'),
      makeRound('guided',17,['shoes','socks','hat','jacket'],'All four are clothing items or accessories worn on the body.'),
      makeRound('guided',18,['carrot','potato','onion','cucumber'],'All four are vegetables commonly used in cooking.'),
      makeRound('guided',19,['hand','foot','arm','leg'],'All four are parts of the upper or lower limbs of the human body.'),
      makeRound('guided',20,['chair','table','bed','sofa'],'All four are pieces of furniture commonly found in a home.'),
      makeRound('guided',21,['fridge','oven','toaster','kettle'],'All four are household appliances commonly used in a kitchen.'),
      makeRound('guided',22,['ant','bee','butterfly','beetle'],'All four are insects.'),
      makeRound('guided',23,['football','tennis','basketball','volleyball'],'All four are sports with established rules and ways of playing.'),
      makeRound('guided',24,['january','march','may','july'],'All four are months in the Gregorian calendar.')
    ],
    steady: [
      makeRound('steady',1,['whisper','murmur','mutter','mumble'],'All four describe ways of speaking quietly, though clarity and delivery differ.'),
      makeRound('steady',2,['glance','stare','gaze','peek'],'All four are verbs for looking, with differences in duration and manner.'),
      makeRound('steady',3,['fragile','delicate','brittle','breakable'],'All four describe things that can be broken or damaged easily.'),
      makeRound('steady',4,['repair','mend','restore','fix'],'All four are verbs for repairing something or returning it to better condition.'),
      makeRound('steady',5,['persuade','convince','coax','sway'],'All four are verbs about influencing another person’s opinion or decision.'),
      makeRound('steady',6,['chilly','cool','frosty','icy'],'All four describe cold conditions or sensations, with different degrees or associations.'),
      makeRound('steady',7,['expand','enlarge','extend','widen'],'All four are verbs for increasing size, area, or extent.'),
      makeRound('steady',8,['purchase','acquire','obtain','procure'],'All four are verbs for getting or gaining something, though the method may differ.'),
      makeRound('steady',9,['accurate','precise','exact','correct'],'All four describe correctness or closeness to the right detail or standard.'),
      makeRound('steady',10,['sprint','jog','stroll','wander'],'All four describe ways of moving on foot, at different speeds or for different purposes.'),
      makeRound('steady',11,['ancient','antique','archaic','age-old'],'All four relate to great age or things belonging to a much earlier time.'),
      makeRound('steady',12,['compliment','praise','commend','applaud'],'All four are verbs for expressing approval or admiration.'),
      makeRound('steady',13,['delay','postpone','defer','adjourn'],'All four are verbs for moving an event or activity to a later time.'),
      makeRound('steady',14,['assist','aid','help','support'],'All four are verbs meaning to provide help or support.'),
      makeRound('steady',15,['decrease','diminish','lessen','reduce'],'All four are verbs for making an amount or degree smaller.'),
      makeRound('steady',16,['swift','rapid','quick','speedy'],'All four are adjectives describing speed or a short time taken.'),
      makeRound('steady',17,['silent','quiet','hushed','noiseless'],'All four describe an absence or very low level of sound.'),
      makeRound('steady',18,['cautious','careful','wary','vigilant'],'All four describe alertness and care taken to avoid danger or mistakes.'),
      makeRound('steady',19,['predict','forecast','anticipate','foresee'],'All four are verbs for expecting or estimating something before it happens.'),
      makeRound('steady',20,['reject','refuse','decline','dismiss'],'All four are verbs for not accepting a request, offer, or proposal.'),
      makeRound('steady',21,['gather','collect','assemble','accumulate'],'All four are verbs for bringing things together or building up a group.'),
      makeRound('steady',22,['glimmer','gleam','shimmer','sparkle'],'All four describe light appearing or shining, in different ways or degrees.'),
      makeRound('steady',23,['admire','appreciate','esteem','respect'],'All four are verbs for valuing someone or something and showing regard.'),
      makeRound('steady',24,['exhausted','weary','drained','fatigued'],'All four describe a state of severe tiredness or lack of energy.')
    ],
    challenge: [
      makeRound('challenge',1,['ambiguous','equivocal','obscure','cryptic'],'All four describe language or meaning that is unclear or difficult to interpret.'),
      makeRound('challenge',2,['mitigate','alleviate','relieve','abate'],'All four are verbs for reducing the severity of a problem, pain, or harmful effect.'),
      makeRound('challenge',3,['meticulous','scrupulous','painstaking','thorough'],'All four describe work done with great care and attention to detail.'),
      makeRound('challenge',4,['antiquated','outdated','obsolete','outmoded'],'All four describe things that are old-fashioned or no longer current or useful.'),
      makeRound('challenge',5,['resilient','hardy','robust','durable'],'All four describe the ability to withstand strain, damage, or difficult conditions.'),
      makeRound('challenge',6,['reluctant','loath','averse','disinclined'],'All four describe unwillingness or a strong lack of desire to do something.'),
      makeRound('challenge',7,['infer','deduce','surmise','conjecture'],'All four are verbs for forming a conclusion from information or clues.'),
      makeRound('challenge',8,['concise','succinct','terse','laconic'],'All four describe expression that uses few words.'),
      makeRound('challenge',9,['scrutinize','inspect','examine','investigate'],'All four are verbs for looking into something carefully to understand or assess it.'),
      makeRound('challenge',10,['exacerbate','aggravate','compound','worsen'],'All four are verbs for making an already bad situation more severe.'),
      makeRound('challenge',11,['impartial','unbiased','unprejudiced','even-handed'],'All four describe judging or treating people without favouring one side.'),
      makeRound('challenge',12,['ephemeral','transient','fleeting','momentary'],'All four describe something that lasts for only a short time.'),
      makeRound('challenge',13,['ubiquitous','pervasive','omnipresent','widespread'],'All four describe something found or spread across many places or areas.'),
      makeRound('challenge',14,['pragmatic','practical','realistic','utilitarian'],'All four relate to practical thinking and attention to usefulness or application.'),
      makeRound('challenge',15,['candid','frank','forthright','plainspoken'],'All four describe speaking honestly, clearly, and directly.'),
      makeRound('challenge',16,['arduous','strenuous','laborious','demanding'],'All four describe work or tasks that require considerable effort.'),
      makeRound('challenge',17,['contemplate','ponder','deliberate','mull'],'All four are verbs for thinking carefully about a subject or decision.'),
      makeRound('challenge',18,['concur','agree','assent','consent'],'All four are verbs expressing agreement or acceptance.'),
      makeRound('challenge',19,['substantiate','corroborate','validate','verify'],'All four are verbs for confirming a claim or supporting it with evidence.'),
      makeRound('challenge',20,['relinquish','surrender','yield','cede'],'All four are verbs for giving something up or handing it over.'),
      makeRound('challenge',21,['novel','innovative','original','inventive'],'All four describe ideas or work that show newness or creativity.'),
      makeRound('challenge',22,['frugal','thrifty','economical','sparing'],'All four describe careful use of money or resources and avoidance of waste.'),
      makeRound('challenge',23,['diligent','assiduous','industrious','conscientious'],'All four describe someone who works hard, consistently, and carefully.'),
      makeRound('challenge',24,['benevolent','charitable','altruistic','philanthropic'],'All four describe kindness and concern for helping others or their well-being.')
    ]
  };
  const normalize = word => String(word || '').trim().toLocaleLowerCase('en');
  const shuffle = (items, random) => {
    const result = items.slice();
    for (let i=result.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
    return result;
  };
  const getRounds = mode => (MODES[mode] || []).map(round => ({...round,words:round.words.slice()}));
  const selectRound = (mode, random=Math.random) => shuffle(getRounds(mode),random);
  function findCompleteGroups(board,mode) {
    const visible=new Set((board||[]).map(normalize));
    return (MODES[mode]||[]).filter(round=>round.words.every(word=>visible.has(normalize(word))));
  }
  function createBoard(item,mode,random=Math.random) {
    const groups=MODES[mode]||[];
    if(!item||!groups.some(round=>round.id===item.id)) throw new Error('Unknown Word Connections round.');
    const candidates=shuffle(groups.filter(round=>round.id!==item.id),random);
    const used=new Set(item.words.map(normalize)),distractors=[];
    for(const group of candidates) {
      const available=shuffle(group.words.filter(word=>!used.has(normalize(word))),random);
      if(available.length<2) continue;
      available.slice(0,2).forEach(word=>{used.add(normalize(word));distractors.push(word);});
      if(distractors.length===12) break;
    }
    if(distractors.length!==12) throw new Error('Could not build a complete Word Connections board.');
    const board=shuffle(item.words.concat(distractors),random);
    const complete=findCompleteGroups(board,mode);
    if(complete.length!==1||complete[0].id!==item.id) throw new Error('Word Connections board contains an ambiguous alternative group.');
    return board;
  }
  function matchGroup(words,mode) {
    if(!Array.isArray(words)||words.length!==4) return null;
    const selected=new Set(words.map(normalize));
    if(selected.size!==4) return null;
    return (MODES[mode]||[]).find(round=>round.words.every(word=>selected.has(normalize(word))))||null;
  }
  function validateBank() {
    const errors=[];
    for(const mode of ['guided','steady','challenge']) {
      const rounds=MODES[mode]||[];
      if(rounds.length!==24) errors.push(mode+': expected 24 rounds, found '+rounds.length);
      const ids=new Set(),words=new Set();
      for(const round of rounds) {
        if(ids.has(round.id)) errors.push(mode+': duplicate round id '+round.id);
        ids.add(round.id);
        if(!Array.isArray(round.words)||round.words.length!==4) { errors.push(round.id+': expected exactly four words'); continue; }
        const local=new Set(round.words.map(normalize));
        if(local.size!==4||local.has('')) errors.push(round.id+': words must be four unique non-empty values');
        if(!String(round.explain||'').trim()) errors.push(round.id+': missing explanation');
        for(const word of local) { if(words.has(word)) errors.push(mode+': repeated target word "'+word+'"'); words.add(word); }
      }
    }
    return {valid:errors.length===0,errors};
  }
  window.EPIPHANY_WORD_CONNECTIONS_BANK=Object.freeze({modes:Object.freeze(['guided','steady','challenge']),getRounds,selectRound,createBoard,findCompleteGroups,matchGroup,validateBank});
})();
