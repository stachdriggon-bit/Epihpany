/* EPIPHANY WORD FORGE — approved 72-challenge bank */
(() => {
  'use strict';
  const MODES = Object.freeze(['guided', 'steady', 'challenge']);
  const PROMPT = 'Forge the word from the letter tiles.';
  const DATA = {
    guided: [
      {id:'WF-G-001',clue:'A fruit that is often red or green and grows on a tree.',letters:'PPLAE'},
      {id:'WF-G-002',clue:'A structure built over a river or road so people can cross it.',letters:'DRIBGE'},
      {id:'WF-G-003',clue:'A stick of wax with a wick that gives light when lit.',letters:'DNCALE'},
      {id:'WF-G-004',clue:'A medical professional trained to diagnose illnesses and prescribe treatment.',letters:'TOCDRO'},
      {id:'WF-G-005',clue:'People who are related to one another, such as parents and children.',letters:'MAFILY'},
      {id:'WF-G-006',clue:'An area where people grow flowers, vegetables, or other plants.',letters:'DRGAEN'},
      {id:'WF-G-007',clue:'A piece of land completely surrounded by water.',letters:'ANISLD'},
      {id:'WF-G-008',clue:'A light outer garment, usually with sleeves and a front opening, worn over other clothes.',letters:'KAJCET'},
      {id:'WF-G-009',clue:'The room in a home where food is prepared and cooked.',letters:'HCTIKEN'},
      {id:'WF-G-010',clue:'A place where people can borrow books to read or study.',letters:'RARIBLY'},
      {id:'WF-G-011',clue:'A place, often with several stalls, where sellers offer food and other goods.',letters:'KETRAM'},
      {id:'WF-G-012',clue:'To pay attention to sounds so that you can hear and understand them.',letters:'TSILEN'},
      {id:'WF-G-013',clue:'A common writing tool with a graphite core, often sharpened at one end.',letters:'CIPENL'},
      {id:'WF-G-014',clue:'A large celestial body that travels around a star.',letters:'TAPLNE'},
      {id:'WF-G-015',clue:'A small sewn space in clothing used for carrying things.',letters:'TOPCKE'},
      {id:'WF-G-016',clue:'A small animal often kept as a pet, with long ears and strong back legs for jumping.',letters:'BATRIB'},
      {id:'WF-G-017',clue:'An institution where children attend lessons with teachers, usually from an early age.',letters:'HOCSOL'},
      {id:'WF-G-018',clue:'Feeling pleased and cheerful because something good has happened.',letters:'PHYAP'},
      {id:'WF-G-019',clue:'An opening in a wall, usually with glass, that lets light into a room.',letters:'DOWINW'},
      {id:'WF-G-020',clue:'A bright colour often associated with sunshine and ripe bananas.',letters:'WLOYEL'},
      {id:'WF-G-021',clue:'A container for liquids with a narrow neck and usually a cap.',letters:'TOBLET'},
      {id:'WF-G-022',clue:'A large natural area of land densely covered with trees.',letters:'ROFEST'},
      {id:'WF-G-023',clue:'To take something or someone from one place to another.',letters:'RYACR'},
      {id:'WF-G-024',clue:'To go on a trip to another place, often for pleasure or work.',letters:'VARTEL'}
    ],
    steady: [
      {id:'WF-S-001',clue:'A heavy device lowered into water to stop a boat from drifting away.',letters:'CHARON'},
      {id:'WF-S-002',clue:'A thick piece of cloth used to keep a person warm or cover a bed.',letters:'KTABLEN'},
      {id:'WF-S-003',clue:'An instrument with a magnetic needle that points north and helps people find directions.',letters:'SPOCMAS'},
      {id:'WF-S-004',clue:'A region that receives very little rain and often has little plant life.',letters:'TSERED'},
      {id:'WF-S-005',clue:'The process of collecting crops when they are ready.',letters:'VTRAHES'},
      {id:'WF-S-006',clue:'A trip from one place to another, especially a long one.',letters:'ROJUNEY'},
      {id:'WF-S-007',clue:'A portable light, often protected by glass or a case, used outdoors or during power cuts.',letters:'NTARLEN'},
      {id:'WF-S-008',clue:'To find the size, length, weight, or amount of something.',letters:'SARMEUE'},
      {id:'WF-S-009',clue:'Worried or uneasy about something that may happen.',letters:'VORUSEN'},
      {id:'WF-S-010',clue:'To watch something carefully in order to notice details.',letters:'VSOBERE'},
      {id:'WF-S-011',clue:'Able to wait calmly without becoming annoyed.',letters:'TEPNIAT'},
      {id:'WF-S-012',clue:'How good or bad something is; the standard of something.',letters:'TYAQUIL'},
      {id:'WF-S-013',clue:'To save someone from a dangerous situation.',letters:'CUERSE'},
      {id:'WF-S-014',clue:'A place that protects people from bad weather or danger.',letters:'TEHRLES'},
      {id:'WF-S-015',clue:'Vehicles moving along roads, or the movement of vehicles on roads.',letters:'FICTRAF'},
      {id:'WF-S-016',clue:'Not common or expected; different from what is normal.',letters:'SUANULU'},
      {id:'WF-S-017',clue:'A small community of homes in the countryside, usually smaller than a town.',letters:'LAGVELI'},
      {id:'WF-S-018',clue:'To speak so quietly that your voice is difficult for people farther away to hear.',letters:'PEHWSRI'},
      {id:'WF-S-019',clue:'A condition in which something stays steady because its parts or weight are evenly distributed.',letters:'CALANBE'},
      {id:'WF-S-020',clue:'Eager to learn or find out more about something.',letters:'OUCIRUS'},
      {id:'WF-S-021',clue:'To take or bring something to a person or place.',letters:'VEDLIRE'},
      {id:'WF-S-022',clue:'To keep someone or something safe from harm or damage.',letters:'TORCTEP'},
      {id:'WF-S-023',clue:'To think carefully about an experience or idea.',letters:'FECLRTE'},
      {id:'WF-S-024',clue:'The outside or upper layer of an object or material.',letters:'FACERUS'}
    ],
    challenge: [
      {id:'WF-C-001',clue:'Existing in large quantities; more than enough for a particular need.',letters:'NTADUBAN'},
      {id:'WF-C-002',clue:'Careful to avoid possible danger, mistakes, or unnecessary risks.',letters:'SUTIOACU'},
      {id:'WF-C-003',clue:'Easily damaged or requiring careful handling because of its fragile nature.',letters:'CATELIDE'},
      {id:'WF-C-004',clue:'Extremely large in size, amount, or degree.',letters:'MOUSENRO'},
      {id:'WF-C-005',clue:'Occurring many times within a particular period.',letters:'QUENFRET'},
      {id:'WF-C-006',clue:'Willing to give money, help, time, or resources freely.',letters:'ROUSENEG'},
      {id:'WF-C-007',clue:'To pause before doing something because you feel uncertain.',letters:'TAEHISTE'},
      {id:'WF-C-008',clue:'To establish who someone is or what something is, using clues or evidence.',letters:'FYIDENTI'},
      {id:'WF-C-009',clue:'Very beautiful, impressive, or grand in appearance or quality.',letters:'CENTIFGANIM'},
      {id:'WF-C-010',clue:'To discuss terms with another person or group in order to reach an agreement.',letters:'TENOGATIE'},
      {id:'WF-C-011',clue:'Unusual or unexpected, sometimes in a way that seems strange.',letters:'CULIAREP'},
      {id:'WF-C-012',clue:'Unwilling to do something, often because of doubt or lack of confidence.',letters:'TANLERUCT'},
      {id:'WF-C-013',clue:'Important enough to be noticed or to have a meaningful effect.',letters:'FICANTGINSI'},
      {id:'WF-C-014',clue:'Lasting for only a limited period of time and not intended to be permanent.',letters:'RAMPORETY'},
      {id:'WF-C-015',clue:'To change something greatly in form, appearance, or character.',letters:'FOMRANSTR'},
      {id:'WF-C-016',clue:'Worth a lot, or useful enough to be important.',letters:'LUABVALE'},
      {id:'WF-C-017',clue:'Correct and free from errors, especially in details or measurements.',letters:'CURATCAE'},
      {id:'WF-C-018',clue:'Producing a good or helpful result; having a positive effect.',letters:'FICANEBILE'},
      {id:'WF-C-019',clue:'A result or effect that follows from an action or situation.',letters:'ECNEUQESNOC'},
      {id:'WF-C-020',clue:'To reach a decision or establish something after considering facts or evidence.',letters:'MINERETED'},
      {id:'WF-C-021',clue:'Achieving results without wasting time, energy, or resources.',letters:'FICIENTFE'},
      {id:'WF-C-022',clue:'Absolutely necessary; so important that something cannot be done without it.',letters:'TIALESSEN'},
      {id:'WF-C-023',clue:'The power to affect how someone or something develops, behaves, or is decided.',letters:'CENUFLIEN'},
      {id:'WF-C-024',clue:'To continue to have or keep something at the same level or condition.',letters:'NIATNIAM'}
    ]
  };

  function normalized(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z]/g, '').split('').sort().join('');
  }
  function validateBank() {
    const errors = [], ids = new Set();
    let totalChallenges = 0;
    MODES.forEach(mode => {
      const rounds = DATA[mode];
      if (!Array.isArray(rounds) || rounds.length !== 24) { errors.push(mode + ' must contain 24 prompts'); return; }
      rounds.forEach((item, index) => {
        totalChallenges++;
        if (!item.id || !item.id.startsWith('WF-' + mode[0].toUpperCase() + '-')) errors.push(mode + ' challenge ' + (index + 1) + ' has an invalid ID');
        if (ids.has(item.id)) errors.push('Duplicate challenge ID: ' + item.id);
        ids.add(item.id);
        if (!item.clue || !/^[A-Z]+$/.test(item.letters) || Object.keys(item).length !== 3) errors.push(item.id + ' has invalid public prompt data');
      });
    });
    if (totalChallenges !== 72) errors.push('The public bank must contain exactly 72 prompts');
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
