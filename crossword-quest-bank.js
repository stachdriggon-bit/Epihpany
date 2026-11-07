/* EPIPHANY — Crossword Quest reviewed puzzle bank and validator. */
(() => {
  'use strict';

  const LEVELS = Object.freeze({
    easy: Object.freeze({ label: 'Easy', size: 7, count: 24 }),
    medium: Object.freeze({ label: 'Medium', size: 7, count: 24 }),
    hard: Object.freeze({ label: 'Hard', size: 9, count: 24 }),
    expert: Object.freeze({ label: 'Expert', size: 11, count: 24 })
  });

  // Curated starter lexicon for Easy. Candidate answers only: they become
  // playable content only after being placed in a valid reviewed crossword grid.
  const easyLexicon = Object.freeze([
    { theme: 'Everyday life and home', words: [['BED','A piece of furniture used for sleeping'],['DOOR','A hinged or sliding entrance to a room'],['LAMP','An object that gives light'],['TABLE','Furniture with a flat top for meals or work'],['CHAIR','A seat for one person, usually with a back'],['ROOM','A space inside a building'],['FLOOR','The surface you walk on indoors'],['WALL','A vertical part of a room or building'],['SHELF','A flat surface used to hold books or objects'],['SINK','A bowl with a water tap, often in a kitchen'],['BATH','A place where you wash your body'],['PILLOW','A soft support for your head in bed'],['BLANKET','A warm covering used on a bed'],['WINDOW','An opening in a wall with glass to let in light'],['KITCHEN','A room where meals are prepared'],['MIRROR','A surface that shows your reflection'],['DRAWER','A sliding box in a desk or cupboard'],['GARDEN','An area where flowers or vegetables are grown']] },
    { theme: 'Food and cooking', words: [['APPLE','A round fruit that may be red, green, or yellow'],['BREAD','A baked food often made from flour'],['CHEESE','A food made from milk'],['EGG','A food with a shell, often laid by a hen'],['RICE','Small grains cooked as food'],['SOUP','A food made with liquid and other ingredients'],['SALAD','A dish often made with raw vegetables'],['LEMON','A yellow citrus fruit with a sour taste'],['GRAPE','A small round fruit that grows in bunches'],['HONEY','A sweet food made by bees'],['MILK','A white drink produced by cows and other mammals'],['BUTTER','A soft yellow food made from cream'],['ORANGE','A round citrus fruit with thick skin'],['BANANA','A long curved fruit with yellow skin'],['TOMATO','A soft red fruit often used as a vegetable'],['POTATO','A round vegetable that grows underground'],['ONION','A vegetable with layers that can make you cry'],['SUGAR','A sweet substance added to food and drinks']] },
    { theme: 'Nature and animals', words: [['TREE','A tall plant with a trunk and branches'],['FLOWER','The colorful part of a plant that may produce seeds'],['RIVER','A natural stream of flowing water'],['CLOUD','A white or grey mass seen in the sky'],['RAIN','Water that falls from clouds'],['HORSE','A large animal that people can ride'],['TIGER','A large wild cat with dark stripes'],['RABBIT','A small animal with long ears'],['SHEEP','A farm animal raised for wool'],['WHALE','A very large animal that lives in the sea'],['BIRD','An animal with feathers and wings'],['FROG','A small animal that can jump and often lives near water'],['SNAKE','A long animal with no legs'],['MONKEY','An animal that climbs trees and has a long tail'],['FOREST','A large area covered with trees'],['STONE','A small piece of rock'],['GRASS','A short green plant that covers the ground'],['INSECT','A small animal with six legs']] },
    { theme: 'Travel and places', words: [['TRAIN','Connected vehicles that run on rails'],['PLANE','An aircraft with wings'],['HOTEL','A place where travelers pay to stay'],['BEACH','An area beside the sea, often covered with sand'],['ROAD','A route for cars and other vehicles'],['TICKET','A document that lets you travel or enter an event'],['MAP','A drawing that shows where places are'],['TOWN','A place where people live, smaller than a city'],['CITY','A large and busy place where many people live'],['PARK','A public green space for walking or play'],['BUS','A large road vehicle that carries many passengers'],['CAR','A road vehicle with an engine, usually for a few people'],['SHIP','A large boat that travels on the sea'],['DRIVE','To control a car or other road vehicle'],['BRIDGE','A structure built over a river or road'],['STATION','A place where trains or buses stop'],['AIRPORT','A place where passengers catch planes'],['VILLAGE','A small group of houses in the countryside']] },
    { theme: 'Work and study', words: [['BOOK','Pages with writing or pictures, joined together'],['CLASS','A lesson or a group of students learning together'],['DESK','A table used for writing or working'],['PAPER','Thin material used for writing or printing'],['PENCIL','A tool for writing that can be erased'],['LESSON','A period of learning about a subject'],['TEACHER','A person whose job is to help others learn'],['STUDENT','A person who is learning at a school or college'],['SCHOOL','A place where children or young people learn'],['JOB','Work that a person does regularly to earn money'],['TASK','A piece of work that needs to be done'],['TEST','A set of questions used to check what someone knows'],['WRITE','To form words with a pen or keyboard'],['ERASER','An object used to remove pencil marks'],['OFFICE','A place where people do desk-based work'],['MANAGER','A person who organizes a team or workplace'],['COURSE','A series of lessons about a subject'],['BOARD','A flat surface used for writing or displaying information']] },
    { theme: 'Science and technology', words: [['PHONE','A device used to call or message people'],['SCREEN','The flat surface on a device that shows images or text'],['MOUSE','A small device used to control a computer pointer'],['ROBOT','A machine that can perform tasks automatically'],['PLANET','A large round object that travels around a star'],['ENERGY','The power needed to make things work or move'],['METAL','A hard material such as iron or gold'],['MAGNET','An object that attracts certain metals'],['CAMERA','A device used to take photographs'],['SIGNAL','A sound, light, or message that carries information'],['DATA','Facts or information used for study or computing'],['CODE','A set of rules or symbols used by a computer'],['LASER','A narrow, powerful beam of light'],['ENGINE','A machine that uses energy to produce movement'],['BATTERY','A device that stores energy for electrical use'],['DIGITAL','Using electronic signals rather than physical forms'],['SENSOR','A device that detects changes such as heat or movement'],['CABLE','A thick wire used to carry power or information']] },
    { theme: 'Arts and culture', words: [['MUSIC','Sounds arranged to create rhythm or melody'],['DANCE','Moving the body in time with music'],['POEM','A piece of writing often arranged in lines'],['STORY','A description of events, real or imagined'],['PAINT','Colored liquid used to make pictures'],['ARTIST','A person who creates art'],['DRAMA','A story written to be performed by actors'],['STAGE','A raised area where performers appear'],['COLOR','A quality such as red, blue, or green'],['MOVIE','A story shown as moving pictures'],['SINGER','A person who uses their voice to perform songs'],['GUITAR','A musical instrument with strings'],['ACTOR','A person who performs a role in a play or film'],['PAINTER','An artist who creates pictures with paint'],['COMEDY','A play or film intended to make people laugh'],['NOVEL','A long written story'],['SCENE','A part of a play, film, or story'],['POETRY','Writing that often uses rhythm and imagery']] },
    { theme: 'Language and expressions', words: [['WORD','A unit of language with meaning'],['NAME','A word used to identify a person or thing'],['SOUND','Something that can be heard'],['SPEAK','To say words aloud'],['LISTEN','To pay attention to what you can hear'],['LETTER','A written character such as A or B'],['PHRASE','A small group of words that work together'],['HELLO','A common word used when greeting someone'],['QUIET','Making little or no noise'],['ANSWER','A response to a question'],['READ','To look at and understand written words'],['TALK','To speak with someone'],['MEAN','To have a particular meaning'],['GRAMMAR','The rules used to form sentences in a language'],['SPELL','To say or write the letters of a word in order'],['MEANING','The idea that a word or phrase expresses'],['VERB','A word that describes an action or state'],['NOUN','A word used to name a person, place, thing, or idea']] }
  ].map(group => Object.freeze({ theme: group.theme, words: Object.freeze(group.words.map(([answer, clue]) => Object.freeze({ answer, clue }))) })));

  // Puzzle records are added only after their grids, entries, crossings and clues
  // have been reviewed. Keep this bank separate from the game engine.
  const puzzles = { easy: [], medium: [], hard: [], expert: [] };

  function validatePuzzle(puzzle, expectedSize) {
    const errors = [];
    if (!puzzle || typeof puzzle !== 'object') return { valid: false, errors: ['Puzzle record is missing.'] };
    const size = Number(puzzle.size);
    if (!Number.isInteger(size) || size < 3 || size !== expectedSize) errors.push('Grid size does not match its level.');
    const layout = Array.isArray(puzzle.layout) ? puzzle.layout : [];
    const solution = Array.isArray(puzzle.solution) ? puzzle.solution : [];
    if (layout.length !== size || solution.length !== size) errors.push('Grid rows do not match the declared size.');
    for (let row = 0; row < size; row++) {
      if (typeof layout[row] !== 'string' || layout[row].length !== size || !/^[#.]+$/.test(layout[row] || '')) {
        errors.push('Layout row ' + (row + 1) + ' must contain exactly ' + size + ' cells using # and . only.');
      }
      if (typeof solution[row] !== 'string' || solution[row].length !== size || !/^[A-Z#]+$/.test(solution[row] || '')) {
        errors.push('Solution row ' + (row + 1) + ' must contain exactly ' + size + ' cells using A–Z and # only.');
      }
    }
    if (errors.length) return { valid: false, errors };

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const open = layout[row][col] === '.';
        if (open !== (solution[row][col] !== '#')) errors.push('Layout and solution disagree at row ' + (row + 1) + ', column ' + (col + 1) + '.');
      }
    }

    const expected = [];
    const numbers = Array.from({ length: size }, () => Array(size).fill(0));
    let nextNumber = 1;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (layout[row][col] !== '.') continue;
        const across = col === 0 || layout[row][col - 1] === '#';
        const down = row === 0 || layout[row - 1][col] === '#';
        if (!across && !down) continue;
        numbers[row][col] = nextNumber;
        if (across) expected.push({ number: nextNumber, direction: 'across', row, col });
        if (down) expected.push({ number: nextNumber, direction: 'down', row, col });
        nextNumber++;
      }
    }

    const entries = Array.isArray(puzzle.entries) ? puzzle.entries : [];
    const expectedByKey = new Map(expected.map(entry => [entry.number + ':' + entry.direction, entry]));
    const actualKeys = new Set();
    for (const entry of entries) {
      if (!entry || !['across', 'down'].includes(entry.direction)) {
        errors.push('Every entry must have an across or down direction.');
        continue;
      }
      const key = entry.number + ':' + entry.direction;
      if (!Number.isInteger(entry.number) || entry.number < 1) errors.push('Entry numbers must be positive integers.');
      if (actualKeys.has(key)) errors.push('Duplicate entry ' + key + '.');
      actualKeys.add(key);
      const expectedEntry = expectedByKey.get(key);
      if (!expectedEntry || expectedEntry.row !== entry.row || expectedEntry.col !== entry.col) errors.push('Entry ' + key + ' does not match its numbered start cell.');
      if (!String(entry.clue || '').trim()) errors.push('Entry ' + key + ' has no clue.');
      if (!Number.isInteger(entry.row) || !Number.isInteger(entry.col) || entry.row < 0 || entry.col < 0 || entry.row >= size || entry.col >= size) {
        errors.push('Entry ' + key + ' has an invalid starting cell.');
        continue;
      }
      const cells = [...String(entry.answer || '').toUpperCase()];
      if (cells.length < 3) errors.push('Entry ' + key + ' must be at least three letters long.');
      if (!cells.length || cells.some(letter => !/^[A-Z]$/.test(letter))) errors.push('Entry ' + key + ' must contain English letters only.');
      let runLength = 0;
      while (entry.row + (entry.direction === 'down' ? runLength : 0) < size &&
        entry.col + (entry.direction === 'across' ? runLength : 0) < size &&
        layout[entry.row + (entry.direction === 'down' ? runLength : 0)][entry.col + (entry.direction === 'across' ? runLength : 0)] === '.') runLength++;
      if (cells.length !== runLength) errors.push('Entry ' + key + ' must cover its complete uninterrupted answer slot.');
      for (let i = 0; i < cells.length; i++) {
        const row = entry.row + (entry.direction === 'down' ? i : 0);
        const col = entry.col + (entry.direction === 'across' ? i : 0);
        if (row >= size || col >= size || layout[row][col] !== '.') {
          errors.push('Entry ' + key + ' extends outside its open cells.');
          break;
        }
        if (!/^[A-Z]$/.test(cells[i]) || solution[row][col] !== cells[i]) {
          errors.push('Entry ' + key + ' does not match the solution at row ' + (row + 1) + ', column ' + (col + 1) + '.');
        }
      }
    }

    const normalizedClues = entries.map(entry => String(entry && entry.clue || '').trim().toLocaleLowerCase());
    if (new Set(normalizedClues).size !== normalizedClues.length) errors.push('Clues must be distinct within a puzzle.');

    const expectedKeys = new Set(expected.map(entry => entry.number + ':' + entry.direction));
    for (const key of expectedKeys) if (!actualKeys.has(key)) errors.push('Missing numbered entry ' + key + '.');
    for (const key of actualKeys) if (!expectedKeys.has(key)) errors.push('Unexpected numbered entry ' + key + '.');

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (layout[row][col] !== '.') continue;
        const across = entries.some(entry => entry.direction === 'across' && row === entry.row && col >= entry.col && col < entry.col + String(entry.answer || '').length);
        const down = entries.some(entry => entry.direction === 'down' && col === entry.col && row >= entry.row && row < entry.row + String(entry.answer || '').length);
        if (!across || !down) errors.push('Open cell at row ' + (row + 1) + ', column ' + (col + 1) + ' must belong to both an across and a down entry.');
      }
    }

    const openCells = [];
    for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) if (layout[row][col] === '.') openCells.push(row + ',' + col);
    if (openCells.length) {
      const visited = new Set([openCells[0]]);
      const queue = [openCells[0]];
      while (queue.length) {
        const [row, col] = queue.shift().split(',').map(Number);
        for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const nr = row + dr, nc = col + dc, key = nr + ',' + nc;
          if (nr >= 0 && nc >= 0 && nr < size && nc < size && layout[nr][nc] === '.' && !visited.has(key)) {
            visited.add(key);
            queue.push(key);
          }
        }
      }
      if (visited.size !== openCells.length) errors.push('All open cells must form one connected crossword grid.');
    }

    return { valid: errors.length === 0, errors };
  }

  function validateBank(source = puzzles) {
    const errors = [];
    const counts = {};
    for (const [level, config] of Object.entries(LEVELS)) {
      const list = source && Array.isArray(source[level]) ? source[level] : [];
      counts[level] = list.length;
      if (list.length !== config.count) errors.push(config.label + ' must contain exactly ' + config.count + ' puzzles; found ' + list.length + '.');
      const ids = new Set();
      list.forEach((puzzle, index) => {
        if (!puzzle || !String(puzzle.id || '').trim()) errors.push(config.label + ' puzzle ' + (index + 1) + ' has no stable id.');
        else if (ids.has(puzzle.id)) errors.push(config.label + ' contains duplicate puzzle id ' + puzzle.id + '.');
        else ids.add(puzzle.id);
        const result = validatePuzzle(puzzle, config.size);
        result.errors.forEach(error => errors.push(config.label + ' puzzle ' + (index + 1) + ': ' + error));
      });
    }
    return { valid: errors.length === 0, complete: errors.length === 0, counts, errors };
  }

  window.EPIPHANY_CROSSWORD_QUEST_BANK = Object.freeze({
    levels: LEVELS,
    easyLexicon,
    puzzles: Object.freeze(puzzles),
    validatePuzzle,
    validateBank
  });
})();
