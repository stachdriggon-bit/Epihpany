/* EPIPHANY WORD FORGE — approved 72-challenge bank */
(() => {
  'use strict';
  const MODES = Object.freeze(['guided', 'steady', 'challenge']);
  const PROMPT = 'Forge the word from the letter tiles.';
  const DATA = {
    guided: [
      {id:'WF-G-001',clue:'A fruit that is often red or green and grows on a tree.',letters:'PPLAE',answerWord:'apple',explain:'An apple is a common fruit that grows on an apple tree.',skill:'Food vocabulary'},
      {id:'WF-G-002',clue:'A structure built over a river or road so people can cross it.',letters:'DRIBGE',answerWord:'bridge',explain:'A bridge connects two sides across an obstacle.',skill:'Places and structures'},
      {id:'WF-G-003',clue:'A stick of wax with a wick that gives light when lit.',letters:'DNCALE',answerWord:'candle',explain:'A candle produces light as its wax burns.',skill:'Everyday objects'},
      {id:'WF-G-004',clue:'A medical professional trained to diagnose illnesses and prescribe treatment.',letters:'TOCDRO',answerWord:'doctor',explain:'A doctor examines patients, diagnoses illnesses, and recommends treatment.',skill:'People and jobs'},
      {id:'WF-G-005',clue:'People who are related to one another, such as parents and children.',letters:'MAFILY',answerWord:'family',explain:'A family is a group of related people.',skill:'People and relationships'},
      {id:'WF-G-006',clue:'An area where people grow flowers, vegetables, or other plants.',letters:'DRGAEN',answerWord:'garden',explain:'A garden is an area used for growing plants.',skill:'Nature and places'},
      {id:'WF-G-007',clue:'A piece of land completely surrounded by water.',letters:'ANISLD',answerWord:'island',explain:'An island has water all around it.',skill:'Geography'},
      {id:'WF-G-008',clue:'A light outer garment, usually with sleeves and a front opening, worn over other clothes.',letters:'KAJCET',answerWord:'jacket',explain:'A jacket is an outer layer of clothing.',skill:'Clothing'},
      {id:'WF-G-009',clue:'The room in a home where food is prepared and cooked.',letters:'HCTIKEN',answerWord:'kitchen',explain:'A kitchen is used for preparing meals.',skill:'Home vocabulary'},
      {id:'WF-G-010',clue:'A place where people can borrow books to read or study.',letters:'RARIBLY',answerWord:'library',explain:'A library lends books and provides places to read or study.',skill:'Places and learning'},
      {id:'WF-G-011',clue:'A place, often with several stalls, where sellers offer food and other goods.',letters:'KETRAM',answerWord:'market',explain:'A market is a place where people buy and sell goods.',skill:'Shopping vocabulary'},
      {id:'WF-G-012',clue:'To pay attention to sounds so that you can hear and understand them.',letters:'TSILEN',answerWord:'listen',explain:'To listen means to give attention to what you hear.',skill:'Communication verbs'},
      {id:'WF-G-013',clue:'A common writing tool with a graphite core, often sharpened at one end.',letters:'CIPENL',answerWord:'pencil',explain:'A pencil is used for writing or drawing and can usually be erased.',skill:'School objects'},
      {id:'WF-G-014',clue:'A large celestial body that travels around a star.',letters:'TAPLNE',answerWord:'planet',explain:'A planet orbits a star; Earth is one example.',skill:'Science vocabulary'},
      {id:'WF-G-015',clue:'A small sewn space in clothing used for carrying things.',letters:'TOPCKE',answerWord:'pocket',explain:'A pocket is attached to clothing or a bag for holding small items.',skill:'Clothing and objects'},
      {id:'WF-G-016',clue:'A small animal often kept as a pet, with long ears and strong back legs for jumping.',letters:'BATRIB',answerWord:'rabbit',explain:'Rabbits are known for their long ears and powerful hind legs.',skill:'Animals'},
      {id:'WF-G-017',clue:'An institution where children attend lessons with teachers, usually from an early age.',letters:'HOCSOL',answerWord:'school',explain:'A school is a place where pupils receive education.',skill:'Education'},
      {id:'WF-G-018',clue:'Feeling pleased and cheerful because something good has happened.',letters:'PHYAP',answerWord:'happy',explain:'Happy describes a positive feeling of pleasure or joy.',skill:'Feelings and adjectives'},
      {id:'WF-G-019',clue:'An opening in a wall, usually with glass, that lets light into a room.',letters:'DOWINW',answerWord:'window',explain:'A window lets light into a room and allows people to look outside.',skill:'Home vocabulary'},
      {id:'WF-G-020',clue:'A bright colour often associated with sunshine and ripe bananas.',letters:'WLOYEL',answerWord:'yellow',explain:'Yellow is a bright colour commonly associated with sunshine.',skill:'Colours'},
      {id:'WF-G-021',clue:'A container for liquids with a narrow neck and usually a cap.',letters:'TOBLET',answerWord:'bottle',explain:'A bottle stores liquids and usually has a narrow neck.',skill:'Everyday objects'},
      {id:'WF-G-022',clue:'A large natural area of land densely covered with trees.',letters:'ROFEST',answerWord:'forest',explain:'A forest is a large area where trees form the main vegetation.',skill:'Nature'},
      {id:'WF-G-023',clue:'To take something or someone from one place to another.',letters:'RYACR',answerWord:'carry',explain:'To carry means to hold and move something from one place to another.',skill:'Practical verbs'},
      {id:'WF-G-024',clue:'To go on a trip to another place, often for pleasure or work.',letters:'VARTEL',answerWord:'travel',explain:'Travel means going from one place to another, usually over some distance.',skill:'Common verbs'}
    ],
    steady: [
      {id:'WF-S-001',clue:'A heavy device lowered into water to stop a boat from drifting away.',letters:'CHARON',answerWord:'anchor',explain:'An anchor holds a boat in position by gripping the bottom.',skill:'Transport and sailing'},
      {id:'WF-S-002',clue:'A thick piece of cloth used to keep a person warm or cover a bed.',letters:'KTABLEN',answerWord:'blanket',explain:'A blanket provides warmth and can be placed over a bed or around a person.',skill:'Home and comfort'},
      {id:'WF-S-003',clue:'An instrument with a magnetic needle that points north and helps people find directions.',letters:'SPOCMAS',answerWord:'compass',explain:'A compass uses a magnetic needle to indicate direction.',skill:'Navigation'},
      {id:'WF-S-004',clue:'A region that receives very little rain and often has little plant life.',letters:'TSERED',answerWord:'desert',explain:'Deserts receive very little precipitation; not all deserts are hot.',skill:'Geography and climate'},
      {id:'WF-S-005',clue:'The process of collecting crops when they are ready.',letters:'VTRAHES',answerWord:'harvest',explain:'A harvest is the process or result of collecting mature crops.',skill:'Farming'},
      {id:'WF-S-006',clue:'A trip from one place to another, especially a long one.',letters:'ROJUNEY',answerWord:'journey',explain:'A journey is a trip, often involving considerable distance.',skill:'Travel vocabulary'},
      {id:'WF-S-007',clue:'A portable light, often protected by glass or a case, used outdoors or during power cuts.',letters:'NTARLEN',answerWord:'lantern',explain:'A lantern protects a light source and makes it easier to carry.',skill:'Everyday objects'},
      {id:'WF-S-008',clue:'To find the size, length, weight, or amount of something.',letters:'SARMEUE',answerWord:'measure',explain:'To measure is to determine dimensions or quantity.',skill:'Practical verbs'},
      {id:'WF-S-009',clue:'Worried or uneasy about something that may happen.',letters:'VORUSEN',answerWord:'nervous',explain:'Nervous describes worry, anxiety, or unease.',skill:'Feelings'},
      {id:'WF-S-010',clue:'To watch something carefully in order to notice details.',letters:'VSOBERE',answerWord:'observe',explain:'To observe is to pay close attention to something.',skill:'Thinking skills'},
      {id:'WF-S-011',clue:'Able to wait calmly without becoming annoyed.',letters:'TEPNIAT',answerWord:'patient',explain:'A patient person can wait calmly; the same word can also mean someone receiving medical care.',skill:'Personality and multiple meanings'},
      {id:'WF-S-012',clue:'How good or bad something is; the standard of something.',letters:'TYAQUIL',answerWord:'quality',explain:'Quality describes the standard of something or how good it is.',skill:'Abstract nouns'},
      {id:'WF-S-013',clue:'To save someone from a dangerous situation.',letters:'CUERSE',answerWord:'rescue',explain:'To rescue someone is to bring them out of danger.',skill:'Action verbs'},
      {id:'WF-S-014',clue:'A place that protects people from bad weather or danger.',letters:'TEHRLES',answerWord:'shelter',explain:'A shelter provides protection or a safe place.',skill:'Safety and places'},
      {id:'WF-S-015',clue:'Vehicles moving along roads, or the movement of vehicles on roads.',letters:'FICTRAF',answerWord:'traffic',explain:'Traffic commonly refers to vehicles travelling along roads.',skill:'Transport'},
      {id:'WF-S-016',clue:'Not common or expected; different from what is normal.',letters:'SUANULU',answerWord:'unusual',explain:'Unusual describes something uncommon or unexpected.',skill:'Descriptive adjectives'},
      {id:'WF-S-017',clue:'A small community of homes in the countryside, usually smaller than a town.',letters:'LAGVELI',answerWord:'village',explain:'A village is a small settlement, usually smaller than a town.',skill:'Communities'},
      {id:'WF-S-018',clue:'To speak so quietly that your voice is difficult for people farther away to hear.',letters:'PEHWSRI',answerWord:'whisper',explain:'To whisper is to speak in a very low voice.',skill:'Communication verbs'},
      {id:'WF-S-019',clue:'A condition in which something stays steady because its parts or weight are evenly distributed.',letters:'CALANBE',answerWord:'balance',explain:'Balance can describe physical stability or a fair distribution.',skill:'Abstract nouns'},
      {id:'WF-S-020',clue:'Eager to learn or find out more about something.',letters:'OUCIRUS',answerWord:'curious',explain:'A curious person is eager to discover or understand things.',skill:'Personality adjectives'},
      {id:'WF-S-021',clue:'To take or bring something to a person or place.',letters:'VEDLIRE',answerWord:'deliver',explain:'To deliver is to bring or transport something to its destination.',skill:'Practical verbs'},
      {id:'WF-S-022',clue:'To keep someone or something safe from harm or damage.',letters:'TORCTEP',answerWord:'protect',explain:'To protect is to defend against danger or harm.',skill:'Safety verbs'},
      {id:'WF-S-023',clue:'To think carefully about an experience or idea.',letters:'FECLRTE',answerWord:'reflect',explain:'To reflect is to think deeply or carefully about an experience or idea.',skill:'Thinking skills'},
      {id:'WF-S-024',clue:'The outside or upper layer of an object or material.',letters:'FACERUS',answerWord:'surface',explain:'A surface is the outermost part of an object or material.',skill:'Science and description'}
    ],
    challenge: [
      {id:'WF-C-001',clue:'Existing in large quantities; more than enough for a particular need.',letters:'NTADUBAN',answerWord:'abundant',explain:'Abundant describes something available in large amounts.',skill:'Advanced descriptive vocabulary'},
      {id:'WF-C-002',clue:'Careful to avoid possible danger, mistakes, or unnecessary risks.',letters:'SUTIOACU',answerWord:'cautious',explain:'A cautious person considers risks before acting.',skill:'Decision-making vocabulary'},
      {id:'WF-C-003',clue:'Easily damaged or requiring careful handling because of its fragile nature.',letters:'CATELIDE',answerWord:'delicate',explain:'Delicate describes something fragile, sensitive, or easily damaged.',skill:'Precise adjectives'},
      {id:'WF-C-004',clue:'Extremely large in size, amount, or degree.',letters:'MOUSENRO',answerWord:'enormous',explain:'Enormous means very large, often beyond the ordinary scale.',skill:'Degree and intensity'},
      {id:'WF-C-005',clue:'Occurring many times within a particular period.',letters:'QUENFRET',answerWord:'frequent',explain:'Frequent describes something that happens repeatedly or often.',skill:'Time and frequency'},
      {id:'WF-C-006',clue:'Willing to give money, help, time, or resources freely.',letters:'ROUSENEG',answerWord:'generous',explain:'Generous describes someone who gives freely or willingly.',skill:'Character and values'},
      {id:'WF-C-007',clue:'To pause before doing something because you feel uncertain.',letters:'TAEHISTE',answerWord:'hesitate',explain:'To hesitate is to delay action because of doubt or uncertainty.',skill:'Nuanced verbs'},
      {id:'WF-C-008',clue:'To establish who someone is or what something is, using clues or evidence.',letters:'FYIDENTI',answerWord:'identify',explain:'To identify is to establish the identity or nature of someone or something.',skill:'Reasoning verbs'},
      {id:'WF-C-009',clue:'Very beautiful, impressive, or grand in appearance or quality.',letters:'CENTIFGANIM',answerWord:'magnificent',explain:'Magnificent describes something exceptionally impressive or beautiful.',skill:'Evaluative adjectives'},
      {id:'WF-C-010',clue:'To discuss terms with another person or group in order to reach an agreement.',letters:'TENOGATIE',answerWord:'negotiate',explain:'To negotiate is to communicate with others to reach an agreement.',skill:'Social and professional verbs'},
      {id:'WF-C-011',clue:'Unusual or unexpected, sometimes in a way that seems strange.',letters:'CULIAREP',answerWord:'peculiar',explain:'Peculiar describes something noticeably unusual or strange.',skill:'Nuanced adjectives'},
      {id:'WF-C-012',clue:'Unwilling to do something, often because of doubt or lack of confidence.',letters:'TANLERUCT',answerWord:'reluctant',explain:'Reluctant describes someone who is not willing or eager to act.',skill:'Attitudes and feelings'},
      {id:'WF-C-013',clue:'Important enough to be noticed or to have a meaningful effect.',letters:'FICANTGINSI',answerWord:'significant',explain:'Significant means important, meaningful, or large enough to matter.',skill:'Academic vocabulary'},
      {id:'WF-C-014',clue:'Lasting for only a limited period of time and not intended to be permanent.',letters:'RAMPORETY',answerWord:'temporary',explain:'Temporary describes something that exists or lasts for a limited time.',skill:'Time and change'},
      {id:'WF-C-015',clue:'To change something greatly in form, appearance, or character.',letters:'FOMRANSTR',answerWord:'transform',explain:'To transform is to make a marked change in form or nature.',skill:'Change verbs'},
      {id:'WF-C-016',clue:'Worth a lot, or useful enough to be important.',letters:'LUABVALE',answerWord:'valuable',explain:'Valuable can refer to high monetary worth or great usefulness.',skill:'Evaluation vocabulary'},
      {id:'WF-C-017',clue:'Correct and free from errors, especially in details or measurements.',letters:'CURATCAE',answerWord:'accurate',explain:'Accurate means correct and precise.',skill:'Precision vocabulary'},
      {id:'WF-C-018',clue:'Producing a good or helpful result; having a positive effect.',letters:'FICANEBILE',answerWord:'beneficial',explain:'Beneficial describes something that produces an advantage or improvement.',skill:'Cause and effect'},
      {id:'WF-C-019',clue:'A result or effect that follows from an action or situation.',letters:'ECNEUQESNOC',answerWord:'consequence',explain:'A consequence is something that follows from an action or event.',skill:'Cause and effect'},
      {id:'WF-C-020',clue:'To reach a decision or establish something after considering facts or evidence.',letters:'MINERETED',answerWord:'determine',explain:'To determine is to establish something through reasoning or investigation.',skill:'Reasoning verbs'},
      {id:'WF-C-021',clue:'Achieving results without wasting time, energy, or resources.',letters:'FICIENTFE',answerWord:'efficient',explain:'Efficient describes a process that achieves results with little waste.',skill:'Work and process vocabulary'},
      {id:'WF-C-022',clue:'Absolutely necessary; so important that something cannot be done without it.',letters:'TIALESSEN',answerWord:'essential',explain:'Essential means necessary or fundamental.',skill:'Priority and importance'},
      {id:'WF-C-023',clue:'The power to affect how someone or something develops, behaves, or is decided.',letters:'CENUFLIEN',answerWord:'influence',explain:'Influence is the ability to affect people, events, or decisions.',skill:'Abstract nouns'},
      {id:'WF-C-024',clue:'To continue to have or keep something at the same level or condition.',letters:'NIATNIAM',answerWord:'maintain',explain:'To maintain is to keep something in good condition or at a particular level.',skill:'Sustaining and managing'}
    ]
  };

  function normalized(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z]/g, '').split('').sort().join('');
  }
  function validateBank() {
    const errors = [];
    const ids = new Set();
    let totalChallenges = 0;
    MODES.forEach(mode => {
      const rounds = DATA[mode];
      if (!Array.isArray(rounds) || rounds.length !== 24) {
        errors.push(mode + ' must contain exactly 24 challenges');
        return;
      }
      rounds.forEach((item, index) => {
        totalChallenges++;
        if (!item.id || !item.id.startsWith('WF-' + mode[0].toUpperCase() + '-')) errors.push(mode + ' challenge ' + (index + 1) + ' has an invalid ID');
        if (ids.has(item.id)) errors.push('Duplicate challenge ID: ' + item.id);
        ids.add(item.id);
        if (!item.clue || !item.explain || !item.skill) errors.push(item.id + ' is missing clue, explanation, or skill');
        if (!/^[A-Z]+$/.test(item.letters)) errors.push(item.id + ' letters must contain uppercase A–Z only');
        if (!/^[a-z]+$/.test(item.answerWord)) errors.push(item.id + ' answerWord must be lowercase A–Z only');
        if (normalized(item.letters) !== normalized(item.answerWord)) errors.push(item.id + ' letters do not match answerWord');
        if (item.letters === item.answerWord.toUpperCase()) errors.push(item.id + ' letters must be shuffled rather than shown in answer order');
      });
    });
    if (totalChallenges !== 72) errors.push('The bank must contain exactly 72 challenges');
    return { valid: errors.length === 0, totalChallenges, errors };
  }
  function getRounds(mode) {
    if (!MODES.includes(mode)) return [];
    return DATA[mode].map(item => ({ ...item, prompt: PROMPT }));
  }
  function selectRound(mode, random = Math.random) {
    const rounds = getRounds(mode);
    for (let i = rounds.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [rounds[i], rounds[j]] = [rounds[j], rounds[i]];
    }
    return rounds;
  }
  window.EPIPHANY_WORD_FORGE_BANK = Object.freeze({
    schemaVersion: 1,
    gameId: 'word-forge',
    modes: MODES,
    getRounds,
    selectRound,
    validateBank
  });
})();
