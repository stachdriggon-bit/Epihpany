/* EPIPHANY THINK LAB — Codebreaker fixed cryptogram bank. */
(() => {
  'use strict';
  const source = {"easy":[{"id":"cb-easy-01","title":"Signal 01","cipher":"OHHJS","answer":"APPLE","known":[{"cipher":"O","plain":"A"},{"cipher":"H","plain":"P"}]},{"id":"cb-easy-02","title":"Signal 02","cipher":"ULSLU","answer":"LEVEL","known":[{"cipher":"U","plain":"L"},{"cipher":"L","plain":"E"}]},{"id":"cb-easy-03","title":"Signal 03","cipher":"AROOH","answer":"HAPPY","known":[{"cipher":"A","plain":"H"},{"cipher":"O","plain":"P"}]},{"id":"cb-easy-04","title":"Signal 04","cipher":"CFSSL","answer":"GREEN","known":[{"cipher":"C","plain":"G"},{"cipher":"S","plain":"E"}]},{"id":"cb-easy-05","title":"Signal 05","cipher":"ROZZC","answer":"SHEEP","known":[{"cipher":"R","plain":"S"},{"cipher":"Z","plain":"E"}]},{"id":"cb-easy-06","title":"Signal 06","cipher":"YPGGJ","answer":"SLEEP","known":[{"cipher":"Y","plain":"S"},{"cipher":"G","plain":"E"}]},{"id":"cb-easy-07","title":"Signal 07","cipher":"FKHWW","answer":"STILL","known":[{"cipher":"F","plain":"S"},{"cipher":"W","plain":"L"}]},{"id":"cb-easy-08","title":"Signal 08","cipher":"KAHHQ","answer":"CARRY","known":[{"cipher":"K","plain":"C"},{"cipher":"H","plain":"R"}]},{"id":"cb-easy-09","title":"Signal 09","cipher":"RKHTT","answer":"CLASS","known":[{"cipher":"R","plain":"C"},{"cipher":"T","plain":"S"}]},{"id":"cb-easy-10","title":"Signal 10","cipher":"SVOAA","answer":"GRASS","known":[{"cipher":"S","plain":"G"},{"cipher":"A","plain":"S"}]},{"id":"cb-easy-11","title":"Signal 11","cipher":"AYNNK","answer":"BLOOD","known":[{"cipher":"A","plain":"B"},{"cipher":"N","plain":"O"}]},{"id":"cb-easy-12","title":"Signal 12","cipher":"ADDAS","answer":"TEETH","known":[{"cipher":"A","plain":"T"},{"cipher":"D","plain":"E"}]}],"medium":[{"id":"cb-medium-01","title":"Signal 01","cipher":"ORFV WZKVU SIJH","answer":"KIND WORDS HELP","known":[{"cipher":"O","plain":"K"},{"cipher":"R","plain":"I"},{"cipher":"V","plain":"D"}]},{"id":"cb-medium-02","title":"Signal 02","cipher":"EZUTR HI DSLRP","answer":"LEARN BY DOING","known":[{"cipher":"E","plain":"L"},{"cipher":"Z","plain":"E"},{"cipher":"U","plain":"A"}]},{"id":"cb-medium-03","title":"Signal 03","cipher":"HDFI XCZL HUPI","answer":"TAKE YOUR TIME","known":[{"cipher":"H","plain":"T"},{"cipher":"D","plain":"A"},{"cipher":"F","plain":"K"}]},{"id":"cb-medium-04","title":"Signal 04","cipher":"PHAGG POUTP IRMKO","answer":"SMALL STEPS COUNT","known":[{"cipher":"P","plain":"S"},{"cipher":"H","plain":"M"},{"cipher":"A","plain":"A"}]},{"id":"cb-medium-05","title":"Signal 05","cipher":"JQAZ QEQJG ZAG","answer":"READ EVERY DAY","known":[{"cipher":"J","plain":"R"},{"cipher":"Q","plain":"E"},{"cipher":"A","plain":"A"}]},{"id":"cb-medium-06","title":"Signal 06","cipher":"LFB XGGI NOSFATGCF","answer":"ASK GOOD QUESTIONS","known":[{"cipher":"L","plain":"A"},{"cipher":"F","plain":"S"},{"cipher":"B","plain":"K"}]},{"id":"cb-medium-07","title":"Signal 07","cipher":"IEEU CK HUEK JTKQ","answer":"KEEP AN OPEN MIND","known":[{"cipher":"I","plain":"K"},{"cipher":"E","plain":"E"},{"cipher":"U","plain":"P"}]},{"id":"cb-medium-08","title":"Signal 08","cipher":"BNUZSYZG DUXGL BNACNGLL","answer":"PRACTICE MAKES PROGRESS","known":[{"cipher":"B","plain":"P"},{"cipher":"N","plain":"R"},{"cipher":"U","plain":"A"}]},{"id":"cb-medium-09","title":"Signal 09","cipher":"LWYHX GWYA BUO ZFUG","answer":"SHARE WHAT YOU KNOW","known":[{"cipher":"L","plain":"S"},{"cipher":"W","plain":"H"},{"cipher":"Y","plain":"A"}]},{"id":"cb-medium-10","title":"Signal 10","cipher":"LYYW KYV NJO BLQO","answer":"LOOK FOR THE CLUE","known":[{"cipher":"L","plain":"L"},{"cipher":"Y","plain":"O"},{"cipher":"W","plain":"K"}]},{"id":"cb-medium-11","title":"Signal 11","cipher":"KLSY FJJK OJ HFJN","answer":"MAKE ROOM TO GROW","known":[{"cipher":"K","plain":"M"},{"cipher":"L","plain":"A"},{"cipher":"S","plain":"K"}]},{"id":"cb-medium-12","title":"Signal 12","cipher":"GYWXT ARF BNVEX BWVXDPT","answer":"WORDS CAN BUILD BRIDGES","known":[{"cipher":"G","plain":"W"},{"cipher":"Y","plain":"O"},{"cipher":"W","plain":"R"}]}],"hard":[{"id":"cb-hard-01","title":"Signal 01","cipher":"O APYOV MPOQ LOJYK TOVI DHVJ YOKGYV","answer":"A CLEAR PLAN MAKES HARD WORK EASIER","known":[{"cipher":"O","plain":"A"},{"cipher":"P","plain":"L"}]},{"id":"cb-hard-02","title":"Signal 02","cipher":"LNEIMTIFH MXODT AMMET FM DOZ IAOCT","answer":"CURIOSITY OPENS DOORS TO NEW IDEAS","known":[{"cipher":"L","plain":"C"},{"cipher":"N","plain":"U"}]},{"id":"cb-hard-03","title":"Signal 03","cipher":"KEEV PSBMRCRDB CEMSHR WFIM EMFRDB LSBB","answer":"GOOD LISTENERS NOTICE WHAT OTHERS MISS","known":[{"cipher":"K","plain":"G"},{"cipher":"E","plain":"O"}]},{"id":"cb-hard-04","title":"Signal 04","cipher":"S LTHHLQ JSHTQGNQ NSG NXSGOQ HXQ UEHNUZQ","answer":"A LITTLE PATIENCE CAN CHANGE THE OUTCOME","known":[{"cipher":"S","plain":"A"},{"cipher":"L","plain":"L"}]},{"id":"cb-hard-05","title":"Signal 05","cipher":"LMV GVYL AWVYLODJY DNLVJ RVHI LD GVLLVU HJYEVUY","answer":"THE BEST QUESTIONS OFTEN LEAD TO BETTER ANSWERS","known":[{"cipher":"L","plain":"T"},{"cipher":"M","plain":"H"}]},{"id":"cb-hard-06","title":"Signal 06","cipher":"KVJMQOQH J KJQHIJHV ZJNVY ZOWV JQA LDIMJHV","answer":"LEARNING A LANGUAGE TAKES TIME AND COURAGE","known":[{"cipher":"K","plain":"L"},{"cipher":"V","plain":"E"}]},{"id":"cb-hard-07","title":"Signal 07","cipher":"YMVSPI HSSOGQFC YSTLP LSMLTS WNLXMJS","answer":"HONEST FEEDBACK HELPS PEOPLE IMPROVE","known":[{"cipher":"Y","plain":"H"},{"cipher":"M","plain":"O"}]},{"id":"cb-hard-08","title":"Signal 08","cipher":"E KIXLHV ISEQ KREXSK CLIR BLXO EHG NXSGPI","answer":"A STRONG TEAM SHARES BOTH WORK AND CREDIT","known":[{"cipher":"E","plain":"A"},{"cipher":"K","plain":"S"}]},{"id":"cb-hard-09","title":"Signal 09","cipher":"IXSFF OZPSBFI YST KZCZSF S GBHHZK IPQKR","answer":"SMALL DETAILS CAN REVEAL A BIGGER STORY","known":[{"cipher":"I","plain":"S"},{"cipher":"X","plain":"M"}]},{"id":"cb-hard-10","title":"Signal 10","cipher":"XPNQD GFZAJF SAB CPAALF SABJ QFWX LXFH","answer":"THINK BEFORE YOU CHOOSE YOUR NEXT STEP","known":[{"cipher":"X","plain":"T"},{"cipher":"P","plain":"H"}]},{"id":"cb-hard-11","title":"Signal 11","cipher":"OEOQI KXRYSDO MSA VGGOQ S TROGTP PORRVA","answer":"EVERY MISTAKE CAN OFFER A USEFUL LESSON","known":[{"cipher":"O","plain":"E"},{"cipher":"E","plain":"V"}]},{"id":"cb-hard-12","title":"Signal 12","cipher":"OXKYHQYU HPXGL PGYUXHKQG KYHQBG QGHB ZKCQH","answer":"PRACTICE TURNS UNCERTAIN ACTION INTO HABIT","known":[{"cipher":"O","plain":"P"},{"cipher":"X","plain":"R"}]}],"expert":[{"id":"cb-expert-01","title":"Signal 01","cipher":"NSF HLIN QIFVQJ URIBLTFORFI LVNFP CFYRP ZRNS W IRHAJF GQFINRLP","answer":"THE MOST USEFUL DISCOVERIES OFTEN BEGIN WITH A SIMPLE QUESTION","known":[{"cipher":"N","plain":"T"}]},{"id":"cb-expert-02","title":"Signal 02","cipher":"ANPT KSEGH SUP JTECPSU GNP AZHPHG ENMZEP ZH GM WPPO ZTQPHGZVSGZTV","answer":"WHEN FACTS ARE UNCLEAR THE WISEST CHOICE IS TO KEEP INVESTIGATING","known":[{"cipher":"G","plain":"T"}]},{"id":"cb-expert-03","title":"Signal 03","cipher":"K LAHHDZDGO MXAGO XH VADF IKG ZDVDKY FWKO BXUZ HAZCO ANMZDCCAXG NACCDL","answer":"A DIFFERENT POINT OF VIEW CAN REVEAL WHAT YOUR FIRST IMPRESSION MISSED","known":[{"cipher":"D","plain":"E"}]},{"id":"cb-expert-04","title":"Signal 04","cipher":"MKXYKSBB ZSVXDSB DSWJAJYNQL IPSJ UXQ VWJ SCMLWAJ IPWT UXQ PWRS LSWKJSH","answer":"PROGRESS BECOMES MEANINGFUL WHEN YOU CAN EXPLAIN WHAT YOU HAVE LEARNED","known":[{"cipher":"W","plain":"A"}]},{"id":"cb-expert-05","title":"Signal 05","cipher":"PRRB IRCCNMLIQALRM BYGYMBZ QZ CNIT RM WLZAYMLMP QZ LA BRYZ RM ZGYQVLMP","answer":"GOOD COMMUNICATION DEPENDS AS MUCH ON LISTENING AS IT DOES ON SPEAKING","known":[{"cipher":"R","plain":"O"}]},{"id":"cb-expert-06","title":"Signal 06","cipher":"OZQ CNOOQDM LA QNALQD OU AQQ VZQM KUB AOUC DBAZLMS OUVNDF NM NMAVQD","answer":"THE PATTERN IS EASIER TO SEE WHEN YOU STOP RUSHING TOWARD AN ANSWER","known":[{"cipher":"O","plain":"T"}]},{"id":"cb-expert-07","title":"Signal 07","cipher":"KONJACTNKT ZSORH RGTN YSTYUSUEAON XTTEH EGT KOLSUZT EO ESW UZUAN","answer":"CONFIDENCE GROWS WHEN PREPARATION MEETS THE COURAGE TO TRY AGAIN","known":[{"cipher":"S","plain":"R"}]},{"id":"cb-expert-08","title":"Signal 08","cipher":"K WKCUTRO CUKAUC OLLZI DUHLJA YJAYMYARKO VLCAI NL RJAUCINKJA NPU VPLOU FUIIKSU","answer":"A CAREFUL READER LOOKS BEYOND INDIVIDUAL WORDS TO UNDERSTAND THE WHOLE MESSAGE","known":[{"cipher":"K","plain":"A"}]},{"id":"cb-expert-09","title":"Signal 09","cipher":"XAZGSQR O VAHLZFE LTAJZFH AMDFQ TFBUSTFX JTFOCSQR SD SQDA XHOZZFT BUFXDSAQX","answer":"SOLVING A COMPLEX PROBLEM OFTEN REQUIRES BREAKING IT INTO SMALLER QUESTIONS","known":[{"cipher":"X","plain":"S"}]},{"id":"cb-expert-10","title":"Signal 10","cipher":"HVS CHEGBLSCH TGBTNPCXGB XC HVS GBS HVKH IXHC HVS SJXASBTS ZXHVGPH XLBGEXBL AGPQH","answer":"THE STRONGEST CONCLUSION IS THE ONE THAT FITS THE EVIDENCE WITHOUT IGNORING DOUBT","known":[{"cipher":"G","plain":"O"}]},{"id":"cb-expert-11","title":"Signal 11","cipher":"FDH AOEIZJRIUT ZDEONDY JYDGJR HKDF TOJ NDDQ LQ LF NIFT BLGGDUDFQ EOFQDXQY","answer":"NEW VOCABULARY BECOMES USEFUL WHEN YOU MEET IT IN MANY DIFFERENT CONTEXTS","known":[{"cipher":"F","plain":"N"}]},{"id":"cb-expert-12","title":"Signal 12","cipher":"WHGFDHWSFM ZQTUWVUX HXMZN BCGOMXYDX JXUGLX NGLXWHVCD EGF UTC FNX OVWH XTNX","answer":"THOUGHTFUL PRACTICE HELPS KNOWLEDGE BECOME SOMETHING YOU CAN USE WITH EASE","known":[{"cipher":"W","plain":"T"}]}]};
  const LEVELS = Object.freeze({
    easy:Object.freeze({label:'Easy',count:12,minLetters:5,maxLetters:5,knownLetters:2}),
    medium:Object.freeze({label:'Medium',count:12,minLetters:10,maxLetters:24,knownLetters:3}),
    hard:Object.freeze({label:'Hard',count:12,minLetters:25,maxLetters:44,knownLetters:2}),
    expert:Object.freeze({label:'Expert',count:12,minLetters:45,maxLetters:80,knownLetters:1})
  });
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function validatePuzzle(puzzle, level) {
    const errors = [], config = LEVELS[level];
    if (!config || !puzzle || typeof puzzle !== 'object') return {valid:false,errors:['Puzzle or level is invalid.']};
    const answer = typeof puzzle.answer === 'string' ? puzzle.answer : '';
    const cipher = typeof puzzle.cipher === 'string' ? puzzle.cipher : '';
    const answerLetters = answer.replace(/[^A-Z]/g,'');
    const cipherLetters = cipher.replace(/[^A-Z]/g,'');
    if (!answer || answer !== answer.toUpperCase() || !/^[A-Z]+(?:[ .,'!?-][A-Z]+)*[.!?]?$/.test(answer)) errors.push('Answer must be uppercase English words with supported spacing and punctuation.');
    if (!cipher || cipher !== cipher.toUpperCase() || cipher.length !== answer.length || !/^[A-Z]+(?:[ .,'!?-][A-Z]+)*[.!?]?$/.test(cipher)) errors.push('Cipher must preserve the answer length, spaces, and punctuation.');
    if (answerLetters.length < config.minLetters || answerLetters.length > config.maxLetters) errors.push('Answer length is outside the configured level range.');
    const forward = new Map(), reverse = new Map();
    if (answerLetters.length === cipherLetters.length) {
      for (let i=0;i<answer.length;i++) {
        const plain=answer[i], coded=cipher[i];
        if (!/[A-Z]/.test(plain)) { if (plain !== coded) errors.push('Cipher must preserve spaces and punctuation.'); continue; }
        if (forward.has(plain) && forward.get(plain)!==coded) errors.push('A plaintext letter must always use the same cipher letter.');
        if (reverse.has(coded) && reverse.get(coded)!==plain) errors.push('Cipher substitution must be one-to-one.');
        forward.set(plain,coded); reverse.set(coded,plain);
      }
    }
    const known = Array.isArray(puzzle.known) ? puzzle.known : [];
    if (known.length !== config.knownLetters) errors.push('Puzzle has the wrong number of starter key letters.');
    const knownCipher = new Set(), knownPlain = new Set();
    for (const pair of known) {
      if (!pair || !LETTERS.includes(pair.cipher) || !LETTERS.includes(pair.plain)) { errors.push('Starter key contains an invalid letter pair.'); continue; }
      if (knownCipher.has(pair.cipher) || knownPlain.has(pair.plain)) errors.push('Starter key letters must be unique.');
      knownCipher.add(pair.cipher); knownPlain.add(pair.plain);
      if (reverse.get(pair.cipher)!==pair.plain) errors.push('Starter key does not match the encoded message.');
    }
    if (knownCipher.size >= reverse.size) errors.push('Every puzzle must leave at least one letter for the player to decode.');
    if (!String(puzzle.id||'').trim()) errors.push('Puzzle needs a stable id.');
    if (Object.prototype.hasOwnProperty.call(puzzle,'clue')) errors.push('Semantic clues must not be stored in the player-facing puzzle bank.');
    if (level === 'easy') {
      const frequencies = new Map();
      for (const letter of answerLetters) frequencies.set(letter, (frequencies.get(letter) || 0) + 1);
      const repeated = new Set([...frequencies].filter(([,count]) => count > 1).map(([letter]) => letter));
      if (!repeated.size) errors.push('Easy words must include a visible repeated-letter pattern.');
      if (!known.some(pair => repeated.has(pair.plain))) errors.push('Easy starter key must expose at least one letter from a repeated-letter group.');
    }
    if (level === 'expert' && known.length === 1) {
      const occurrences = answerLetters.split(known[0].plain).length - 1;
      if (occurrences < 4 || occurrences > 8) errors.push('Expert starter letter should appear 4–8 times to keep the opening balanced.');
    }
    return {valid:errors.length===0,errors};
  }
  function validateBank(bank=source) {
    const errors=[],counts={};
    for (const [level,config] of Object.entries(LEVELS)) {
      const list=bank && Array.isArray(bank[level]) ? bank[level] : [];
      counts[level]=list.length;
      if (list.length!==config.count) errors.push(level+' must contain exactly '+config.count+' puzzles.');
      const ids=new Set(),answers=new Set();
      list.forEach((puzzle,index)=>{
        if (!puzzle || typeof puzzle!=='object') { errors.push(level+' puzzle '+(index+1)+' is not a valid record.'); return; }
        if (ids.has(puzzle.id)) errors.push(level+' has duplicate puzzle id '+puzzle.id+'.');
        ids.add(puzzle.id);
        if (answers.has(puzzle.answer)) errors.push(level+' has duplicate solution '+puzzle.answer+'.');
        answers.add(puzzle.answer);
        validatePuzzle(puzzle,level).errors.forEach(error=>errors.push(level+' puzzle '+(index+1)+': '+error));
      });
    }
    return {valid:errors.length===0,counts,errors};
  }
  function analyzePuzzle(puzzle) {
    const words = String(puzzle?.cipher || '').split(/[^A-Z]+/).filter(Boolean);
    const locations = new Map();
    const repeatedWords = [];
    words.forEach((word, wordIndex) => {
      const positions = new Map();
      [...word].forEach((letter, index) => {
        positions.set(letter, [...(positions.get(letter) || []), index + 1]);
        if (!locations.has(letter)) locations.set(letter, new Set());
        locations.get(letter).add(wordIndex + 1);
      });
      const repeated = [...positions.entries()].filter(([, places]) => places.length > 1);
      if (repeated.length) repeatedWords.push({ wordIndex: wordIndex + 1, pattern: [...word].map((letter, index, all) => all.indexOf(letter) + 1), repeated });
    });
    const crossWordLetters = [...locations.entries()]
      .filter(([, wordIndexes]) => wordIndexes.size > 1)
      .map(([letter, wordIndexes]) => ({ letter, words: [...wordIndexes] }));
    const answerLetters = String(puzzle?.answer || '').replace(/[^A-Z]/g, '');
    const known = Array.isArray(puzzle?.known) ? puzzle.known : [];
    return {
      wordCount: words.length,
      distinctCipherLetters: new Set(String(puzzle?.cipher || '').replace(/[^A-Z]/g, '')).size,
      repeatedWords,
      crossWordLetters,
      starterOccurrences: known.map(pair => ({ ...pair, occurrences: answerLetters.split(pair.plain).length - 1 })),
      unresolvedDistinctLetters: Math.max(0, new Set(String(puzzle?.cipher || '').replace(/[^A-Z]/g, '')).size - known.length)
    };
  }
  function qualityReport(bank=source) {
    const report = {};
    for (const [level, list] of Object.entries(bank || {})) {
      report[level] = (Array.isArray(list) ? list : []).map(puzzle => ({ id: puzzle.id, ...analyzePuzzle(puzzle), validation: validatePuzzle(puzzle, level) }));
    }
    return report;
  }
  const puzzles=Object.freeze(Object.fromEntries(Object.entries(source).map(([level,list])=>[level,Object.freeze(list.map(p=>Object.freeze({...p,known:Object.freeze(p.known.map(pair=>Object.freeze({...pair})))})))])));
  window.EPIPHANY_CODEBREAKER_BANK=Object.freeze({version:'codebreaker-bank-v1',levels:LEVELS,puzzles,validatePuzzle,validateBank,analyzePuzzle,qualityReport,letters:LETTERS});
})();
