/* Reviewed Sound Maze question content. Source review batches are retained in /sound-maze-content/*.draft.json. */
(function attachSoundMazeContent(root) {
  'use strict';
  const bank = {
  "status": "reviewed_for_integration",
  "version": 3,
  "pronunciation_reference": "General American",
  "levels": {
    "A1": {
      "guided": [
        {
          "id": "SM-A1-G-001",
          "axis": "short_vowel_contrasts",
          "target": "cat",
          "options": [
            "cat",
            "cut",
            "kit",
            "cot"
          ],
          "answer": "cat",
          "explain": "Cat has /æ/. Cut has /ʌ/, kit has /ɪ/, and cot has /ɑ/ in General American."
        },
        {
          "id": "SM-A1-G-002",
          "axis": "short_vowel_contrasts",
          "target": "pen",
          "options": [
            "pan",
            "pen",
            "pin",
            "pun"
          ],
          "answer": "pen",
          "explain": "Pen has the short /ɛ/ sound. Pan has /æ/, pin has /ɪ/, and pun has /ʌ/."
        },
        {
          "id": "SM-A1-G-003",
          "axis": "short_vowel_contrasts",
          "target": "sit",
          "options": [
            "sat",
            "set",
            "sit",
            "suit"
          ],
          "answer": "sit",
          "explain": "Sit has the short /ɪ/ sound. Sat has /æ/, set has /ɛ/, and suit has a different vowel sound."
        },
        {
          "id": "SM-A1-G-004",
          "axis": "initial_consonant_sounds",
          "target": "fan",
          "options": [
            "van",
            "fan",
            "man",
            "pan"
          ],
          "answer": "fan",
          "explain": "Fan begins with /f/, made without vocal-cord vibration. Van begins with /v/, while man and pan begin with /m/ and /p/."
        },
        {
          "id": "SM-A1-G-005",
          "axis": "initial_consonant_sounds",
          "target": "ten",
          "options": [
            "den",
            "then",
            "ten",
            "hen"
          ],
          "answer": "ten",
          "explain": "Ten begins with /t/. Den begins with /d/, then begins with /ð/, and hen begins with /h/."
        },
        {
          "id": "SM-A1-G-006",
          "axis": "initial_consonant_sounds",
          "target": "wet",
          "options": [
            "vet",
            "wet",
            "let",
            "net"
          ],
          "answer": "wet",
          "explain": "Wet begins with /w/. Vet begins with /v/, let with /l/, and net with /n/."
        },
        {
          "id": "SM-A1-G-007",
          "axis": "final_consonant_sounds",
          "target": "bag",
          "options": [
            "back",
            "bat",
            "bad",
            "bag"
          ],
          "answer": "bag",
          "explain": "Bag ends with /g/. Back ends with /k/, bat with /t/, and bad with /d/."
        },
        {
          "id": "SM-A1-G-008",
          "axis": "final_consonant_sounds",
          "target": "cap",
          "options": [
            "cab",
            "cat",
            "cap",
            "can"
          ],
          "answer": "cap",
          "explain": "Cap ends with the unvoiced /p/ sound. Cab ends with /b/, cat with /t/, and can with /n/."
        },
        {
          "id": "SM-A1-G-009",
          "axis": "final_consonant_sounds",
          "target": "bus",
          "options": [
            "buzz",
            "but",
            "bus",
            "bun"
          ],
          "answer": "bus",
          "explain": "Bus ends with /s/. Buzz ends with /z/, but with /t/, and bun with /n/."
        },
        {
          "id": "SM-A1-G-010",
          "axis": "basic_spelling_patterns",
          "target": "cake",
          "options": [
            "cake",
            "cook",
            "back",
            "kick"
          ],
          "answer": "cake",
          "explain": "Cake has a final silent e, which makes the a say its name /eɪ/. The other words have short vowel sounds."
        },
        {
          "id": "SM-A1-G-011",
          "axis": "basic_spelling_patterns",
          "target": "bike",
          "options": [
            "back",
            "bike",
            "book",
            "buck"
          ],
          "answer": "bike",
          "explain": "Bike has the long /aɪ/ sound written with i and a final silent e. The other choices have short vowel sounds."
        },
        {
          "id": "SM-A1-G-012",
          "axis": "basic_spelling_patterns",
          "target": "home",
          "options": [
            "ham",
            "hum",
            "home",
            "hop"
          ],
          "answer": "home",
          "explain": "Home has the long /oʊ/ sound written with o and a final silent e. Ham, hum, and hop have short vowel sounds."
        }
      ],
      "steady": [
        {
          "id": "SM-A1-S-001",
          "axis": "short_vowel_contrasts",
          "target": "ship",
          "options": [
            "sheep",
            "ship",
            "shut",
            "shop"
          ],
          "answer": "ship",
          "explain": "Ship has /ɪ/. Sheep has /iː/, shut has /ʌ/, and shop has /ɑ/."
        },
        {
          "id": "SM-A1-S-002",
          "axis": "short_vowel_contrasts",
          "target": "bed",
          "options": [
            "bad",
            "bid",
            "bed",
            "bud"
          ],
          "answer": "bed",
          "explain": "Bed has the short /ɛ/ sound. Bad has /æ/, bid has /ɪ/, and bud has /ʌ/."
        },
        {
          "id": "SM-A1-S-003",
          "axis": "short_vowel_contrasts",
          "target": "cup",
          "options": [
            "cap",
            "cop",
            "cup",
            "coat"
          ],
          "answer": "cup",
          "explain": "Cup has /ʌ/. Cap has /æ/, cop has /ɑ/, and coat has /oʊ/."
        },
        {
          "id": "SM-A1-S-004",
          "axis": "initial_consonant_sounds",
          "target": "thin",
          "options": [
            "tin",
            "fin",
            "thin",
            "sin"
          ],
          "answer": "thin",
          "explain": "Thin begins with /θ/, the unvoiced th sound. Tin begins with /t/, fin with /f/, and sin with /s/."
        },
        {
          "id": "SM-A1-S-005",
          "axis": "initial_consonant_sounds",
          "target": "man",
          "options": [
            "can",
            "man",
            "pan",
            "van"
          ],
          "answer": "man",
          "explain": "Man begins with /m/. Can begins with /k/, pan with /p/, and van with /v/."
        },
        {
          "id": "SM-A1-S-006",
          "axis": "initial_consonant_sounds",
          "target": "goat",
          "options": [
            "coat",
            "goat",
            "boat",
            "note"
          ],
          "answer": "goat",
          "explain": "Goat begins with the voiced /g/ sound. Coat begins with /k/, boat with /b/, and note with /n/."
        },
        {
          "id": "SM-A1-S-007",
          "axis": "final_consonant_sounds",
          "target": "leaf",
          "options": [
            "leave",
            "leak",
            "leaf",
            "lean"
          ],
          "answer": "leaf",
          "explain": "Leaf ends with the unvoiced /f/ sound. Leave ends with /v/, leak with /k/, and lean with /n/."
        },
        {
          "id": "SM-A1-S-008",
          "axis": "final_consonant_sounds",
          "target": "pack",
          "options": [
            "pad",
            "pat",
            "pan",
            "pack"
          ],
          "answer": "pack",
          "explain": "Pack ends with /k/. Pad ends with /d/, pat with /t/, and pan with /n/."
        },
        {
          "id": "SM-A1-S-009",
          "axis": "final_consonant_sounds",
          "target": "rice",
          "options": [
            "ride",
            "ripe",
            "rise",
            "rice"
          ],
          "answer": "rice",
          "explain": "Rice ends with the unvoiced /s/ sound. Ride ends with /d/, ripe with /p/, and rise with the voiced /z/ sound."
        },
        {
          "id": "SM-A1-S-010",
          "axis": "basic_spelling_patterns",
          "target": "time",
          "options": [
            "team",
            "tub",
            "time",
            "tame"
          ],
          "answer": "time",
          "explain": "Time uses i followed by a consonant and a final silent e to spell the /aɪ/ sound. Team has /iː/, tub has /ʌ/, and tame has /eɪ/."
        },
        {
          "id": "SM-A1-S-011",
          "axis": "basic_spelling_patterns",
          "target": "snow",
          "options": [
            "now",
            "sun",
            "snow",
            "slow"
          ],
          "answer": "snow",
          "explain": "Snow uses ow to spell the /oʊ/ sound. Now has /aʊ/, sun has /ʌ/, and Slow uses the same /oʊ/ vowel sound with a different first consonant."
        },
        {
          "id": "SM-A1-S-012",
          "axis": "basic_spelling_patterns",
          "target": "light",
          "options": [
            "late",
            "let",
            "light",
            "lot"
          ],
          "answer": "light",
          "explain": "Light uses igh to spell the /aɪ/ sound. Late has /eɪ/, let has /ɛ/, and lot has /ɑ/."
        }
      ],
      "challenge": [
        {
          "id": "SM-A1-C-001",
          "axis": "short_vowel_contrasts",
          "target": "luck",
          "options": [
            "lock",
            "lick",
            "luck",
            "look"
          ],
          "answer": "luck",
          "explain": "Luck has the /ʌ/ vowel. Lock has /ɑ/, lick has /ɪ/, and look has /ʊ/ in General American pronunciation."
        },
        {
          "id": "SM-A1-C-002",
          "axis": "short_vowel_contrasts",
          "target": "full",
          "options": [
            "fool",
            "fill",
            "full",
            "fell"
          ],
          "answer": "full",
          "explain": "Full has the /ʊ/ vowel. Fool has /u/, fill has /ɪ/, and fell has /ɛ/."
        },
        {
          "id": "SM-A1-C-003",
          "axis": "short_vowel_contrasts",
          "target": "must",
          "options": [
            "mist",
            "mast",
            "most",
            "must"
          ],
          "answer": "must",
          "explain": "Must has the /ʌ/ vowel. Mist has /ɪ/, mast has /æ/, and most has /oʊ/."
        },
        {
          "id": "SM-A1-C-004",
          "axis": "initial_consonant_sounds",
          "target": "chair",
          "options": [
            "share",
            "dare",
            "chair",
            "care"
          ],
          "answer": "chair",
          "explain": "Chair begins with /tʃ/, the sound heard at the start of chair. Share begins with /ʃ/, dare with /d/, and care with /k/."
        },
        {
          "id": "SM-A1-C-005",
          "axis": "initial_consonant_sounds",
          "target": "jam",
          "options": [
            "yam",
            "sham",
            "ham",
            "jam"
          ],
          "answer": "jam",
          "explain": "Jam begins with /dʒ/. Yam begins with /j/, sham with /ʃ/, and ham with /h/."
        },
        {
          "id": "SM-A1-C-006",
          "axis": "initial_consonant_sounds",
          "target": "that",
          "options": [
            "vat",
            "tat",
            "sat",
            "that"
          ],
          "answer": "that",
          "explain": "That begins with the voiced /ð/ sound, written th. Vat begins with /v/, tat with /t/, and sat with /s/."
        },
        {
          "id": "SM-A1-C-007",
          "axis": "final_consonant_sounds",
          "target": "much",
          "options": [
            "mush",
            "must",
            "muck",
            "much"
          ],
          "answer": "much",
          "explain": "Much ends with /tʃ/. Mush ends with /ʃ/, must with /t/, and muck with /k/."
        },
        {
          "id": "SM-A1-C-008",
          "axis": "final_consonant_sounds",
          "target": "save",
          "options": [
            "safe",
            "same",
            "sale",
            "save"
          ],
          "answer": "save",
          "explain": "Save ends with the voiced /v/ sound. Safe ends with /f/, same with /m/, and sale with /l/."
        },
        {
          "id": "SM-A1-C-009",
          "axis": "final_consonant_sounds",
          "target": "badge",
          "options": [
            "batch",
            "bad",
            "bag",
            "badge"
          ],
          "answer": "badge",
          "explain": "Badge ends with /dʒ/, written ge. Batch ends with /tʃ/, bad with /d/, and bag with /g/."
        },
        {
          "id": "SM-A1-C-010",
          "axis": "basic_spelling_patterns",
          "target": "phone",
          "options": [
            "tone",
            "bone",
            "phone",
            "fine"
          ],
          "answer": "phone",
          "explain": "Phone begins with ph, which spells the /f/ sound. Tone begins with /t/, bone with /b/, and fine begins with /f/ but has a different vowel and ending."
        },
        {
          "id": "SM-A1-C-011",
          "axis": "basic_spelling_patterns",
          "target": "knock",
          "options": [
            "rock",
            "lock",
            "knock",
            "sock"
          ],
          "answer": "knock",
          "explain": "The k in knock is silent, so the word begins with /n/. Rock, lock, and sock begin with /r/, /l/, and /s/."
        },
        {
          "id": "SM-A1-C-012",
          "axis": "basic_spelling_patterns",
          "target": "wrist",
          "options": [
            "list",
            "rest",
            "wrist",
            "west"
          ],
          "answer": "wrist",
          "explain": "The w in wrist is silent, so the word begins with /r/. List begins with /l/, rest has /ɛ/ rather than /ɪ/, and west begins with /w/."
        }
      ]
    },
    "A2": {
      "guided": [
        {
          "id": "SM-A2-G-001",
          "axis": "short_vowel_contrasts",
          "target": "map",
          "options": [
            "map",
            "mop",
            "men",
            "mug"
          ],
          "answer": "map",
          "explain": "Map has /æ/. Mop has /ɑ/, men has /ɛ/, and mug has /ʌ/."
        },
        {
          "id": "SM-A2-G-002",
          "axis": "short_vowel_contrasts",
          "target": "neck",
          "options": [
            "nick",
            "neck",
            "knack",
            "nook"
          ],
          "answer": "neck",
          "explain": "Neck has the short /ɛ/ vowel. Nick has /ɪ/, knack has /æ/, and nook has /ʊ/."
        },
        {
          "id": "SM-A2-G-003",
          "axis": "short_vowel_contrasts",
          "target": "dust",
          "options": [
            "desk",
            "dish",
            "dust",
            "dote"
          ],
          "answer": "dust",
          "explain": "Dust has /ʌ/. Desk has /ɛ/, dish has /ɪ/, and dote has /oʊ/."
        },
        {
          "id": "SM-A2-G-004",
          "axis": "initial_consonant_sounds",
          "target": "shop",
          "options": [
            "chop",
            "shop",
            "spot",
            "stop"
          ],
          "answer": "shop",
          "explain": "Shop begins with /ʃ/. Chop begins with /tʃ/, while spot and stop begin with /sp/ and /st/."
        },
        {
          "id": "SM-A2-G-005",
          "axis": "initial_consonant_sounds",
          "target": "zip",
          "options": [
            "sip",
            "zip",
            "dip",
            "lip"
          ],
          "answer": "zip",
          "explain": "Zip begins with voiced /z/. Sip begins with /s/, dip with /d/, and lip with /l/."
        },
        {
          "id": "SM-A2-G-006",
          "axis": "initial_consonant_sounds",
          "target": "vest",
          "options": [
            "west",
            "best",
            "vest",
            "test"
          ],
          "answer": "vest",
          "explain": "Vest begins with /v/, made with vocal-cord vibration. West begins with /w/, while best and test begin with /b/ and /t/."
        },
        {
          "id": "SM-A2-G-007",
          "axis": "final_consonant_sounds",
          "target": "peace",
          "options": [
            "peak",
            "peat",
            "peach",
            "peace"
          ],
          "answer": "peace",
          "explain": "Peace ends with /s/. Peak ends with /k/, peat with /t/, and peach with /tʃ/."
        },
        {
          "id": "SM-A2-G-008",
          "axis": "final_consonant_sounds",
          "target": "bath",
          "options": [
            "back",
            "bad",
            "bat",
            "bath"
          ],
          "answer": "bath",
          "explain": "Bath ends with the unvoiced th sound /θ/. Back ends with /k/, bad with /d/, and bat with /t/."
        },
        {
          "id": "SM-A2-G-009",
          "axis": "final_consonant_sounds",
          "target": "cage",
          "options": [
            "cake",
            "came",
            "cage",
            "case"
          ],
          "answer": "cage",
          "explain": "Cage ends with /dʒ/. Cake ends with /k/, came with /m/, and case with /s/."
        },
        {
          "id": "SM-A2-G-010",
          "axis": "basic_spelling_patterns",
          "target": "train",
          "options": [
            "train",
            "trail",
            "trait",
            "tray"
          ],
          "answer": "train",
          "explain": "Train uses ai to spell the /eɪ/ vowel followed by /n/. Trail ends in /l/, trait in /t/, and tray has no final consonant."
        },
        {
          "id": "SM-A2-G-011",
          "axis": "basic_spelling_patterns",
          "target": "cheese",
          "options": [
            "cheese",
            "cheek",
            "cheer",
            "chess"
          ],
          "answer": "cheese",
          "explain": "Cheese uses ee to spell the long /i/ sound. Cheek and cheer share that vowel but have different endings; chess has /ɛ/."
        },
        {
          "id": "SM-A2-G-012",
          "axis": "basic_spelling_patterns",
          "target": "thumb",
          "options": [
            "thumb",
            "thump",
            "thug",
            "hum"
          ],
          "answer": "thumb",
          "explain": "Thumb begins with th pronounced /θ/ and ends with a silent b. Thump has a pronounced /p/, thug has a different ending, and hum begins with /h/."
        }
      ],
      "steady": [
        {
          "id": "SM-A2-S-001",
          "axis": "short_vowel_contrasts",
          "target": "stamp",
          "options": [
            "stump",
            "step",
            "stamp",
            "stomp"
          ],
          "answer": "stamp",
          "explain": "Stamp has /æ/. Stump has /ʌ/, step has /ɛ/, and stomp has /ɑ/ in General American."
        },
        {
          "id": "SM-A2-S-002",
          "axis": "short_vowel_contrasts",
          "target": "fresh",
          "options": [
            "frizz",
            "fresh",
            "flash",
            "frost"
          ],
          "answer": "fresh",
          "explain": "Fresh has /ɛ/. Frizz has /ɪ/, flash has /æ/, and frost has /ɔ/."
        },
        {
          "id": "SM-A2-S-003",
          "axis": "short_vowel_contrasts",
          "target": "drum",
          "options": [
            "dream",
            "drum",
            "dram",
            "drown"
          ],
          "answer": "drum",
          "explain": "Drum has /ʌ/. Dream has /i/, while dram has /æ/; droom is not a standard spelling."
        },
        {
          "id": "SM-A2-S-004",
          "axis": "initial_consonant_sounds",
          "target": "jacket",
          "options": [
            "racket",
            "packet",
            "jacket",
            "bracket"
          ],
          "answer": "jacket",
          "explain": "Jacket begins with /dʒ/. Racket begins with /r/, packet with /p/, and bracket with /b/."
        },
        {
          "id": "SM-A2-S-005",
          "axis": "initial_consonant_sounds",
          "target": "three",
          "options": [
            "tree",
            "free",
            "three",
            "see"
          ],
          "answer": "three",
          "explain": "Three begins with unvoiced /θ/. Tree begins with /t/, free with /f/, and see with /s/."
        },
        {
          "id": "SM-A2-S-006",
          "axis": "initial_consonant_sounds",
          "target": "queen",
          "options": [
            "clean",
            "keen",
            "queen",
            "green"
          ],
          "answer": "queen",
          "explain": "Queen begins with /kw/. Clean begins with /kl/, keen with /k/, and green with /gr/."
        },
        {
          "id": "SM-A2-S-007",
          "axis": "final_consonant_sounds",
          "target": "cough",
          "options": [
            "cove",
            "coat",
            "cough",
            "code"
          ],
          "answer": "cough",
          "explain": "Cough ends with /f/. Cove ends with /v/, coat with /t/, and code with /d/."
        },
        {
          "id": "SM-A2-S-008",
          "axis": "final_consonant_sounds",
          "target": "bench",
          "options": [
            "bend",
            "bench",
            "belt",
            "best"
          ],
          "answer": "bench",
          "explain": "Bench ends with /tʃ/, written ch. Bend ends with /d/, belt with /t/, and best with /t/ plus /s/."
        },
        {
          "id": "SM-A2-S-009",
          "axis": "final_consonant_sounds",
          "target": "prize",
          "options": [
            "price",
            "pride",
            "prize",
            "prime"
          ],
          "answer": "prize",
          "explain": "Prize ends with voiced /z/. Price ends with /s/, pride with /d/, and prime with /m/."
        },
        {
          "id": "SM-A2-S-010",
          "axis": "basic_spelling_patterns",
          "target": "float",
          "options": [
            "flock",
            "float",
            "flout",
            "fleet"
          ],
          "answer": "float",
          "explain": "Float uses oa to spell /oʊ/. Flout has /aʊ/, fleet has /i/, and flote is not the standard spelling."
        },
        {
          "id": "SM-A2-S-011",
          "axis": "basic_spelling_patterns",
          "target": "bright",
          "options": [
            "bright",
            "bride",
            "brisk",
            "brought"
          ],
          "answer": "bright",
          "explain": "Bright uses igh to spell /aɪ/. Bride has /aɪ/ but ends in /d/, brisk has /ɪ/, and brought has /ɔ/."
        },
        {
          "id": "SM-A2-S-012",
          "axis": "basic_spelling_patterns",
          "target": "knight",
          "options": [
            "knight",
            "knot",
            "know",
            "knife"
          ],
          "answer": "knight",
          "explain": "Knight begins with a silent k and has the /aɪ/ sound. Knot, know, and knife also have a silent k but different vowel sounds and endings."
        }
      ],
      "challenge": [
        {
          "id": "SM-A2-C-001",
          "axis": "short_vowel_contrasts",
          "target": "plaid",
          "options": [
            "played",
            "plaid",
            "plead",
            "plied"
          ],
          "answer": "plaid",
          "explain": "Plaid has the /æ/ vowel. Played has /eɪ/, plead has /i/, and plied has /aɪ/."
        },
        {
          "id": "SM-A2-C-002",
          "axis": "short_vowel_contrasts",
          "target": "swept",
          "options": [
            "swapped",
            "swept",
            "swooped",
            "swiped"
          ],
          "answer": "swept",
          "explain": "Swept has /ɛ/. Swapped has /ɑ/, swooped has /uː/, and swiped has /aɪ/."
        },
        {
          "id": "SM-A2-C-003",
          "axis": "short_vowel_contrasts",
          "target": "rough",
          "options": [
            "rough",
            "roof",
            "row",
            "rag"
          ],
          "answer": "rough",
          "explain": "Rough has /ʌ/. Roof has /uː/, row has /oʊ/, and rag has /æ/."
        },
        {
          "id": "SM-A2-C-004",
          "axis": "initial_consonant_sounds",
          "target": "sugar",
          "options": [
            "supper",
            "sugar",
            "river",
            "finger"
          ],
          "answer": "sugar",
          "explain": "Sugar begins with /ʃ/. Supper begins with /s/, river with /r/, and finger with /f/."
        },
        {
          "id": "SM-A2-C-005",
          "axis": "initial_consonant_sounds",
          "target": "quick",
          "options": [
            "wick",
            "kick",
            "quick",
            "sick"
          ],
          "answer": "quick",
          "explain": "Quick begins with /kw/. Wick begins with /w/, while kick and sick begin with /k/ and /s/."
        },
        {
          "id": "SM-A2-C-006",
          "axis": "initial_consonant_sounds",
          "target": "thief",
          "options": [
            "chief",
            "thief",
            "sheaf",
            "leaf"
          ],
          "answer": "thief",
          "explain": "Thief begins with /θ/. Chief begins with /tʃ/, sheaf with /ʃ/, and leaf with /l/."
        },
        {
          "id": "SM-A2-C-007",
          "axis": "final_consonant_sounds",
          "target": "breath",
          "options": [
            "bread",
            "breed",
            "breath",
            "breathe"
          ],
          "answer": "breath",
          "explain": "Breath ends with unvoiced /θ/. Bread ends with /d/, breed with /d/, and breathe ends with voiced /ð/."
        },
        {
          "id": "SM-A2-C-008",
          "axis": "final_consonant_sounds",
          "target": "months",
          "options": [
            "month",
            "months",
            "monk",
            "moss"
          ],
          "answer": "months",
          "explain": "Months ends with the /θs/ cluster. Month ends with /θ/, monk with /ŋk/, and moss with /s/."
        },
        {
          "id": "SM-A2-C-009",
          "axis": "final_consonant_sounds",
          "target": "asked",
          "options": [
            "ask",
            "asks",
            "asked",
            "acting"
          ],
          "answer": "asked",
          "explain": "Asked ends with /t/ after the /s/ sound. Ask has no final /t/, asks ends with /s/, and acting ends with /ŋ/."
        },
        {
          "id": "SM-A2-C-010",
          "axis": "basic_spelling_patterns",
          "target": "enough",
          "options": [
            "enough",
            "tough",
            "though",
            "through"
          ],
          "answer": "enough",
          "explain": "Enough uses gh to spell the final /f/ sound. Tough ends with the same /f/ but has a different vowel; though and through have different vowel sounds and final sounds."
        },
        {
          "id": "SM-A2-C-011",
          "axis": "basic_spelling_patterns",
          "target": "island",
          "options": [
            "island",
            "isle",
            "islet",
            "islander"
          ],
          "answer": "island",
          "explain": "Island has a silent s and is pronounced /ˈaɪlənd/. Isle and islet are different words; Ireland has a different ending and stress pattern."
        },
        {
          "id": "SM-A2-C-012",
          "axis": "basic_spelling_patterns",
          "target": "knuckle",
          "options": [
            "knuckle",
            "nickel",
            "noble",
            "needle"
          ],
          "answer": "knuckle",
          "explain": "Knuckle begins with /n/ because the k is silent. Nickel also begins with /n/ but has /ɪ/ rather than /ʌ/; noble and needle have different vowel and syllable patterns."
        }
      ]
    },
    "B1": {
      "guided": [
        {
          "id": "SM-B1-G-001",
          "axis": "short_vowel_contrasts",
          "target": "settle",
          "options": [
            "saddle",
            "settle",
            "subtle",
            "title"
          ],
          "answer": "settle",
          "explain": "Settle has the stressed short /ɛ/ vowel. Saddle has /æ/, subtle has /ʌ/, and title has /aɪ/."
        },
        {
          "id": "SM-B1-G-002",
          "axis": "short_vowel_contrasts",
          "target": "public",
          "options": [
            "panic",
            "public",
            "picnic",
            "pocket"
          ],
          "answer": "public",
          "explain": "Public has the stressed /ʌ/ vowel. Panic has /æ/, picnic has /ɪ/, and pocket has /ɑ/."
        },
        {
          "id": "SM-B1-G-003",
          "axis": "short_vowel_contrasts",
          "target": "damage",
          "options": [
            "message",
            "muddle",
            "damage",
            "village"
          ],
          "answer": "damage",
          "explain": "Damage has /æ/ in its first syllable. Message has /ɛ/, muddle has /ʌ/, and village has /ɪ/."
        },
        {
          "id": "SM-B1-G-004",
          "axis": "initial_consonant_sounds",
          "target": "giant",
          "options": [
            "client",
            "giant",
            "quiet",
            "violent"
          ],
          "answer": "giant",
          "explain": "Giant begins with /dʒ/. Client begins with /kl/, quiet with /kw/, and violent with /v/."
        },
        {
          "id": "SM-B1-G-005",
          "axis": "initial_consonant_sounds",
          "target": "chemist",
          "options": [
            "chemist",
            "chest",
            "guest",
            "jest"
          ],
          "answer": "chemist",
          "explain": "Chemist begins with /k/, although ch is written. Chest begins with /tʃ/, guest with /g/, and jest with /dʒ/."
        },
        {
          "id": "SM-B1-G-006",
          "axis": "initial_consonant_sounds",
          "target": "psychology",
          "options": [
            "psychology",
            "biology",
            "technology",
            "phonology"
          ],
          "answer": "psychology",
          "explain": "Psychology begins with /s/ because the initial p is silent. Biology begins with /b/, technology with /t/, and phonology with /f/."
        },
        {
          "id": "SM-B1-G-007",
          "axis": "final_consonant_sounds",
          "target": "laughed",
          "options": [
            "loved",
            "laughed",
            "laughter",
            "loaded"
          ],
          "answer": "laughed",
          "explain": "Laughed ends with /t/: the -ed ending is pronounced /t/ after the voiceless /f/ sound. Loved ends with /d/, laughter has an extra syllable, and loaded ends with /ɪd/."
        },
        {
          "id": "SM-B1-G-008",
          "axis": "final_consonant_sounds",
          "target": "climbed",
          "options": [
            "climate",
            "climbed",
            "clamp",
            "climb"
          ],
          "answer": "climbed",
          "explain": "Climbed ends with /d/. Climate ends with /t/, clamp with /p/, and climb has no pronounced final /d/."
        },
        {
          "id": "SM-B1-G-009",
          "axis": "final_consonant_sounds",
          "target": "breathes",
          "options": [
            "breath",
            "breathes",
            "breeds",
            "breezes"
          ],
          "answer": "breathes",
          "explain": "Breathes ends with /ðz/. Breath ends with /θ/, breeds with /dz/, and breezes with /zɪz/."
        },
        {
          "id": "SM-B1-G-010",
          "axis": "basic_spelling_patterns",
          "target": "castle",
          "options": [
            "castle",
            "cattle",
            "cancel",
            "hassle"
          ],
          "answer": "castle",
          "explain": "Castle is spelled with a silent t: the word is pronounced /ˈkæsəl/. Cattle has a /t/ sound, cancel has /n/, and hassle begins with /h/."
        },
        {
          "id": "SM-B1-G-011",
          "axis": "basic_spelling_patterns",
          "target": "station",
          "options": [
            "station",
            "stating",
            "stature",
            "stagnant"
          ],
          "answer": "station",
          "explain": "Station uses -tion to spell the /ʃən/ ending. Stating ends with /tɪŋ/, stature with /tʃər/, and stagnant with /ɡnənt/."
        },
        {
          "id": "SM-B1-G-012",
          "axis": "basic_spelling_patterns",
          "target": "wrench",
          "options": [
            "wrench",
            "ranch",
            "branch",
            "trench"
          ],
          "answer": "wrench",
          "explain": "Wrench begins with /r/ because the written w is silent. Ranch begins with /r/ but has a different vowel and ending; branch and trench begin with /b/ and /t/."
        }
      ],
      "steady": [
        {
          "id": "SM-B1-S-001",
          "axis": "short_vowel_contrasts",
          "target": "velvet",
          "options": [
            "valid",
            "velvet",
            "village",
            "volume"
          ],
          "answer": "velvet",
          "explain": "Velvet has /ɛ/ in its first syllable. Valid has /æ/, village has /ɪ/, and volume has /ɑ/ in General American."
        },
        {
          "id": "SM-B1-S-002",
          "axis": "short_vowel_contrasts",
          "target": "seldom",
          "options": [
            "salmon",
            "seldom",
            "sullen",
            "solemn"
          ],
          "answer": "seldom",
          "explain": "Seldom has /ɛ/ in its first syllable. Salmon and solemn begin with /æ/ and /ɑ/ respectively in General American, while sullen has /ʌ/."
        },
        {
          "id": "SM-B1-S-003",
          "axis": "short_vowel_contrasts",
          "target": "flutter",
          "options": [
            "flatter",
            "flitter",
            "flutter",
            "fluent"
          ],
          "answer": "flutter",
          "explain": "Flutter has /ʌ/ in its first syllable. Flatter has /æ/, flitter has /ɪ/, and fluent has /uː/."
        },
        {
          "id": "SM-B1-S-004",
          "axis": "initial_consonant_sounds",
          "target": "genre",
          "options": [
            "gentry",
            "genre",
            "genuine",
            "general"
          ],
          "answer": "genre",
          "explain": "Genre begins with /ʒ/ in General American. Gentry and genuine begin with /dʒ/, while general begins with /dʒ/."
        },
        {
          "id": "SM-B1-S-005",
          "axis": "initial_consonant_sounds",
          "target": "wren",
          "options": [
            "tent",
            "wren",
            "when",
            "then"
          ],
          "answer": "wren",
          "explain": "Wren begins with /r/ because its written w is silent. Tent begins with /t/, when with /w/, and then with /ð/."
        },
        {
          "id": "SM-B1-S-006",
          "axis": "initial_consonant_sounds",
          "target": "xylophone",
          "options": [
            "sylvan",
            "xylophone",
            "pterodactyl",
            "pharmacy"
          ],
          "answer": "xylophone",
          "explain": "Xylophone begins with /z/, the sound of initial x in this word. Sylvan begins with /s/, pterodactyl with /t/ because p is silent, and pharmacy with /f/."
        },
        {
          "id": "SM-B1-S-007",
          "axis": "final_consonant_sounds",
          "target": "mixed",
          "options": [
            "mix",
            "mist",
            "midst",
            "mixed"
          ],
          "answer": "mixed",
          "explain": "Mixed ends with the consonant cluster /kst/. Mix ends with /ks/, mist with /st/, and midst with /dst/."
        },
        {
          "id": "SM-B1-S-008",
          "axis": "final_consonant_sounds",
          "target": "judged",
          "options": [
            "judge",
            "judged",
            "jugs",
            "jungle"
          ],
          "answer": "judged",
          "explain": "Judged ends with /dʒd/ in careful General American pronunciation. Judge ends with /dʒ/, jugs with /ɡz/, and jungle with /ɡəl/."
        },
        {
          "id": "SM-B1-S-009",
          "axis": "final_consonant_sounds",
          "target": "strength",
          "options": [
            "string",
            "strange",
            "strength",
            "stretch"
          ],
          "answer": "strength",
          "explain": "Strength ends with /ŋθ/. String ends with /ŋ/, strange with /ndʒ/, and stretch with /tʃ/."
        },
        {
          "id": "SM-B1-S-010",
          "axis": "basic_spelling_patterns",
          "target": "doubtful",
          "options": [
            "doubtful",
            "dutiful",
            "doughty",
            "dotted"
          ],
          "answer": "doubtful",
          "explain": "Doubtful is pronounced with the /daʊt/ sequence and a silent b in its spelling. Dutiful, doughty, and dotted have different vowel or consonant patterns."
        },
        {
          "id": "SM-B1-S-011",
          "axis": "basic_spelling_patterns",
          "target": "mission",
          "options": [
            "mission",
            "mansion",
            "motion",
            "mention"
          ],
          "answer": "mission",
          "explain": "Mission has the /ˈmɪʃən/ sound pattern. Mansion, motion, and mention have different stressed vowels and/or consonant sequences."
        },
        {
          "id": "SM-B1-S-012",
          "axis": "basic_spelling_patterns",
          "target": "foreign",
          "options": [
            "foreign",
            "forage",
            "forfeit",
            "fountain"
          ],
          "answer": "foreign",
          "explain": "Foreign is pronounced /ˈfɔrən/. Forage, forfeit, and fountain have different vowel and consonant sequences, so the spoken word identifies the spelling."
        }
      ],
      "challenge": [
        {
          "id": "SM-B1-C-001",
          "axis": "short_vowel_contrasts",
          "target": "fabric",
          "options": [
            "fabric",
            "fever",
            "funnel",
            "finish"
          ],
          "answer": "fabric",
          "explain": "Fabric has the stressed short /æ/ vowel. Fever has /i/, funnel has /ʌ/, and finish has /ɪ/."
        },
        {
          "id": "SM-B1-C-002",
          "axis": "short_vowel_contrasts",
          "target": "endeavor",
          "options": [
            "endeavor",
            "android",
            "endower",
            "under"
          ],
          "answer": "endeavor",
          "explain": "Endeavor begins with /ɪn/ in General American. Android begins with /æn/, endower with /ɛn/, and under with /ʌn/."
        },
        {
          "id": "SM-B1-C-003",
          "axis": "short_vowel_contrasts",
          "target": "compass",
          "options": [
            "compass",
            "campus",
            "composed",
            "compost"
          ],
          "answer": "compass",
          "explain": "Compass has /ʌ/ in its first syllable in General American. Campus has /æ/, composed has /oʊ/, and compost has /ɑ/."
        },
        {
          "id": "SM-B1-C-004",
          "axis": "initial_consonant_sounds",
          "target": "pseudonym",
          "options": [
            "pneumonia",
            "pseudonym",
            "pterodactyl",
            "pharmacy"
          ],
          "answer": "pseudonym",
          "explain": "Pseudonym begins with /s/ because the initial p is silent. Pneumonia begins with /n/, pterodactyl with /t/, and pharmacy with /f/."
        },
        {
          "id": "SM-B1-C-005",
          "axis": "initial_consonant_sounds",
          "target": "pneumonia",
          "options": [
            "pterodactyl",
            "pneumonia",
            "phenomenon",
            "pseudonym"
          ],
          "answer": "pneumonia",
          "explain": "Pneumonia begins with /n/ because its written p is silent. Pterodactyl begins with /t/, phenomenon with /f/, and pseudonym with /s/."
        },
        {
          "id": "SM-B1-C-006",
          "axis": "initial_consonant_sounds",
          "target": "wrinkle",
          "options": [
            "tickle",
            "wrinkle",
            "winkle",
            "nickel"
          ],
          "answer": "wrinkle",
          "explain": "Wrinkle begins with /r/ because its written w is silent. Tickle begins with /t/, winkle with /w/, and nickel with /n/."
        },
        {
          "id": "SM-B1-C-007",
          "axis": "final_consonant_sounds",
          "target": "sixths",
          "options": [
            "sixth",
            "sixths",
            "sixes",
            "sickles"
          ],
          "answer": "sixths",
          "explain": "Sixths ends with the cluster /ksθs/ in careful pronunciation. Sixth lacks the final /s/, sixes ends /ɪz/, and sickles ends /əlz/."
        },
        {
          "id": "SM-B1-C-008",
          "axis": "final_consonant_sounds",
          "target": "debt",
          "options": [
            "debt",
            "dead",
            "den",
            "desk"
          ],
          "answer": "debt",
          "explain": "Debt ends with /t/; the written b is silent. Dead ends with /d/, den with /n/, and desk with /sk/."
        },
        {
          "id": "SM-B1-C-009",
          "axis": "final_consonant_sounds",
          "target": "worlds",
          "options": [
            "word",
            "worlds",
            "works",
            "worse"
          ],
          "answer": "worlds",
          "explain": "Worlds ends with /ldz/. Word ends with /rd/, works with /rks/, and worse with /rs/."
        },
        {
          "id": "SM-B1-C-010",
          "axis": "basic_spelling_patterns",
          "target": "acquaintance",
          "options": [
            "acquaintance",
            "accomplishment",
            "accommodation",
            "acquiescence"
          ],
          "answer": "acquaintance",
          "explain": "Acquaintance is the spoken target. The other real words have clearly different syllable and vowel patterns; the answer is not a choice between alternative spellings of the same sound."
        },
        {
          "id": "SM-B1-C-011",
          "axis": "basic_spelling_patterns",
          "target": "conscience",
          "options": [
            "conscience",
            "conscious",
            "consequence",
            "consonance"
          ],
          "answer": "conscience",
          "explain": "Conscience is pronounced /ˈkɑnʃəns/. Conscious, consequence, and consonance have different endings and vowel/consonant sequences."
        },
        {
          "id": "SM-B1-C-012",
          "axis": "basic_spelling_patterns",
          "target": "queue",
          "options": [
            "cute",
            "queue",
            "quay",
            "quite"
          ],
          "answer": "queue",
          "explain": "Queue is spelled with five letters but pronounced like /kjuː/. Cute begins with the same /kj/ sequence but has a final /t/; quay is /kiː/, and quite is /kwaɪt/."
        }
      ]
    },
    "B2": {
      "guided": [
        {
          "id": "SM-B2-G-001",
          "axis": "short_vowel_contrasts",
          "target": "candid",
          "options": [
            "candid",
            "kinship",
            "kettle",
            "kudos"
          ],
          "answer": "candid",
          "explain": "Candid has /æ/ in its first syllable. Kinship has /ɪ/, kettle has /ɛ/, and kudos has /uː/."
        },
        {
          "id": "SM-B2-G-002",
          "axis": "short_vowel_contrasts",
          "target": "plummet",
          "options": [
            "plummet",
            "plumage",
            "plaid",
            "plight"
          ],
          "answer": "plummet",
          "explain": "Plummet has /ʌ/ in its first syllable. Plumage has /uː/, plaid has /æ/, and plight has /aɪ/."
        },
        {
          "id": "SM-B2-G-003",
          "axis": "short_vowel_contrasts",
          "target": "tenet",
          "options": [
            "tenet",
            "tinnitus",
            "tandem",
            "tonic"
          ],
          "answer": "tenet",
          "explain": "Tenet has /ɛ/ in its first syllable. Tinnitus has /ɪ/, tandem has /æ/, and tonic has /ɑ/."
        },
        {
          "id": "SM-B2-G-004",
          "axis": "initial_consonant_sounds",
          "target": "rhetoric",
          "options": [
            "rhetoric",
            "ethics",
            "lethargy",
            "method"
          ],
          "answer": "rhetoric",
          "explain": "Rhetoric begins with /r/; the written rh is pronounced /r/. Ethics begins with a vowel, lethargy with /l/, and method with /m/."
        },
        {
          "id": "SM-B2-G-005",
          "axis": "initial_consonant_sounds",
          "target": "chasm",
          "options": [
            "chasm",
            "sham",
            "champ",
            "ham"
          ],
          "answer": "chasm",
          "explain": "Chasm begins with /k/ although it is spelled ch. Sham begins with /ʃ/, champ with /tʃ/, and ham with /h/."
        },
        {
          "id": "SM-B2-G-006",
          "axis": "initial_consonant_sounds",
          "target": "gnarled",
          "options": [
            "gnarled",
            "garbled",
            "hardy",
            "marble"
          ],
          "answer": "gnarled",
          "explain": "Gnarled begins with /n/ because the written g is silent. Garbled begins with /g/, hardy with /h/, and marble with /m/."
        },
        {
          "id": "SM-B2-G-007",
          "axis": "final_consonant_sounds",
          "target": "drowned",
          "options": [
            "drown",
            "drowned",
            "drowsy",
            "drowning"
          ],
          "answer": "drowned",
          "explain": "Drowned ends with /nd/. Drown ends with /n/, drowsy with /zi/, and drowning with /ɪŋ/."
        },
        {
          "id": "SM-B2-G-008",
          "axis": "final_consonant_sounds",
          "target": "depth",
          "options": [
            "debt",
            "dense",
            "depth",
            "desk"
          ],
          "answer": "depth",
          "explain": "Depth ends with /θ/. Debt ends with /t/, dense with /s/, and desk with /sk/."
        },
        {
          "id": "SM-B2-G-009",
          "axis": "final_consonant_sounds",
          "target": "prompt",
          "options": [
            "prom",
            "pronged",
            "prompt",
            "promise"
          ],
          "answer": "prompt",
          "explain": "Prompt ends with /mpt/. Prom ends with /m/, pronged with /ŋdʒd/, and promise with /s/."
        },
        {
          "id": "SM-B2-G-010",
          "axis": "basic_spelling_patterns",
          "target": "maintenance",
          "options": [
            "maintain",
            "maintenance",
            "maintained",
            "mountain"
          ],
          "answer": "maintenance",
          "explain": "Maintenance is pronounced /ˈmeɪntənəns/. Maintain ends with /eɪn/, maintained ends with /eɪnd/, and mountain begins with /maʊn/."
        },
        {
          "id": "SM-B2-G-011",
          "axis": "basic_spelling_patterns",
          "target": "privilege",
          "options": [
            "privilege",
            "village",
            "pilgrimage",
            "percentage"
          ],
          "answer": "privilege",
          "explain": "Privilege is pronounced /ˈprɪvəlɪdʒ/. Village begins with /v/, pilgrimage has a different first syllable and stress pattern, and percentage begins with /pər/."
        },
        {
          "id": "SM-B2-G-012",
          "axis": "basic_spelling_patterns",
          "target": "rhythm",
          "options": [
            "rhythm",
            "ribbon",
            "ridden",
            "written"
          ],
          "answer": "rhythm",
          "explain": "Rhythm is pronounced /ˈrɪðəm/; y represents the vowel sound. Ribbon, ridden, and written have different medial consonants and vowel patterns."
        }
      ],
      "steady": [
        {
          "id": "SM-B2-S-001",
          "axis": "short_vowel_contrasts",
          "target": "frantic",
          "options": [
            "frantic",
            "frontier",
            "frenzy",
            "frosty"
          ],
          "answer": "frantic",
          "explain": "Frantic has /æ/ in its first stressed syllable. Frontier has /ʌ/ or /ɔ/ depending on pronunciation, frenzy has /ɛ/, and frosty has /ɑ/."
        },
        {
          "id": "SM-B2-S-002",
          "axis": "short_vowel_contrasts",
          "target": "subtle",
          "options": [
            "settle",
            "subtle",
            "saddle",
            "soothe"
          ],
          "answer": "subtle",
          "explain": "Subtle has /ʌ/ in its first syllable. Settle has /ɛ/, saddle has /æ/, and soothe has /uː/."
        },
        {
          "id": "SM-B2-S-003",
          "axis": "short_vowel_contrasts",
          "target": "reckless",
          "options": [
            "reckless",
            "racket",
            "rickety",
            "rocket"
          ],
          "answer": "reckless",
          "explain": "Reckless has /ɛ/ in its first syllable. Racket has /æ/, rickety has /ɪ/, and rocket has /ɑ/."
        },
        {
          "id": "SM-B2-S-004",
          "axis": "initial_consonant_sounds",
          "target": "mnemonic",
          "options": [
            "mnemonic",
            "magnetic",
            "genetic",
            "kinetic"
          ],
          "answer": "mnemonic",
          "explain": "Mnemonic begins with /n/ because the initial m is silent. Magnetic begins with /m/, genetic with /dʒ/, and kinetic with /k/."
        },
        {
          "id": "SM-B2-S-005",
          "axis": "initial_consonant_sounds",
          "target": "xenophobia",
          "options": [
            "xenophobia",
            "seniority",
            "phenomenon",
            "genocide"
          ],
          "answer": "xenophobia",
          "explain": "Xenophobia begins with /z/, the usual sound of initial x in this word. Seniority begins with /s/, phenomenon with /f/, and genocide with /dʒ/."
        },
        {
          "id": "SM-B2-S-006",
          "axis": "initial_consonant_sounds",
          "target": "psalm",
          "options": [
            "psalm",
            "palm",
            "qualm",
            "calm"
          ],
          "answer": "psalm",
          "explain": "Psalm begins with /s/ because the p is silent. Palm begins with /p/ in General American, qualm with /kw/, and calm with /k/."
        },
        {
          "id": "SM-B2-S-007",
          "axis": "final_consonant_sounds",
          "target": "promptly",
          "options": [
            "prompt",
            "prompts",
            "promptly",
            "prompter"
          ],
          "answer": "promptly",
          "explain": "Promptly ends with /tli/. Prompt ends with /t/, prompts with /ts/, and prompter with /tər/."
        },
        {
          "id": "SM-B2-S-008",
          "axis": "final_consonant_sounds",
          "target": "twelfth",
          "options": [
            "twelve",
            "twelfth",
            "twelfthly",
            "twelfths"
          ],
          "answer": "twelfth",
          "explain": "Twelfth ends with /lfθ/. Twelve ends with /lv/, and twelfths adds a final /s/; twelfthly is not a standard common word."
        },
        {
          "id": "SM-B2-S-009",
          "axis": "final_consonant_sounds",
          "target": "risked",
          "options": [
            "risks",
            "risky",
            "risked",
            "risen"
          ],
          "answer": "risked",
          "explain": "Risked ends with /t/ because -ed follows the voiceless /k/ sound. Risks ends with /s/, risky with /i/, and risen with /ən/."
        },
        {
          "id": "SM-B2-S-010",
          "axis": "basic_spelling_patterns",
          "target": "liaison",
          "options": [
            "liaison",
            "lesson",
            "lesion",
            "leisure"
          ],
          "answer": "liaison",
          "explain": "Liaison is pronounced /liˈeɪzɑn/. Lesson has /ɛ/, lesion has /iːʒ/, and leisure has /ɛʒ/ in General American."
        },
        {
          "id": "SM-B2-S-011",
          "axis": "basic_spelling_patterns",
          "target": "supersede",
          "options": [
            "supersede",
            "supervise",
            "superstition",
            "superior"
          ],
          "answer": "supersede",
          "explain": "Supersede is pronounced /ˌsuːpərˈsiːd/. Supervise ends with /aɪz/, superstition with /tʃən/, and superior with /ɪr/."
        },
        {
          "id": "SM-B2-S-012",
          "axis": "basic_spelling_patterns",
          "target": "occurrence",
          "options": [
            "occurrence",
            "occurred",
            "current",
            "currency"
          ],
          "answer": "occurrence",
          "explain": "Occurrence is pronounced /əˈkɜrəns/. Occurred ends with /d/, current has a different stress and ending, and currency ends with /si/."
        }
      ],
      "challenge": [
        {
          "id": "SM-B2-C-001",
          "axis": "short_vowel_contrasts",
          "target": "frivolous",
          "options": [
            "frivolous",
            "fabulous",
            "fervent",
            "frenzy"
          ],
          "answer": "frivolous",
          "explain": "Frivolous has /ɪ/ in its first stressed syllable. Fabulous has /æ/, fervent has /ɜr/, and frenzy has /ɛ/."
        },
        {
          "id": "SM-B2-C-002",
          "axis": "short_vowel_contrasts",
          "target": "quandary",
          "options": [
            "quandary",
            "quarry",
            "canary",
            "quiver"
          ],
          "answer": "quandary",
          "explain": "Quandary begins with /kwɑn/. Quarry, canary, and quiver have different vowel and consonant sequences; the distractors are real words rather than invented spellings."
        },
        {
          "id": "SM-B2-C-003",
          "axis": "short_vowel_contrasts",
          "target": "laconic",
          "options": [
            "laconic",
            "iconic",
            "sonic",
            "chronic"
          ],
          "answer": "laconic",
          "explain": "Laconic begins with /lə/. Iconic, sonic, and chronic have different initial sounds and syllable patterns."
        },
        {
          "id": "SM-B2-C-004",
          "axis": "initial_consonant_sounds",
          "target": "pterodactyl",
          "options": [
            "pterodactyl",
            "feather",
            "theory",
            "deter"
          ],
          "answer": "pterodactyl",
          "explain": "Pterodactyl begins with /t/ because the written p is silent. Feather begins with /f/, theory with /θ/, and deter with /d/."
        },
        {
          "id": "SM-B2-C-005",
          "axis": "initial_consonant_sounds",
          "target": "phlegm",
          "options": [
            "phlegm",
            "helm",
            "them",
            "realm"
          ],
          "answer": "phlegm",
          "explain": "Phlegm begins with /f/ because ph represents /f/. Helm begins with /h/, them with /ð/, and realm with /r/."
        },
        {
          "id": "SM-B2-C-006",
          "axis": "initial_consonant_sounds",
          "target": "gnostic",
          "options": [
            "gnostic",
            "magnetic",
            "genetic",
            "kinetic"
          ],
          "answer": "gnostic",
          "explain": "Gnostic begins with /n/ because the initial g is silent. Magnetic begins with /m/, genetic with /dʒ/, and kinetic with /k/."
        },
        {
          "id": "SM-B2-C-007",
          "axis": "final_consonant_sounds",
          "target": "lengths",
          "options": [
            "length",
            "lengths",
            "lenses",
            "lengthen"
          ],
          "answer": "lengths",
          "explain": "Lengths ends with /ŋθs/ in careful General American pronunciation. Length ends with /ŋθ/, lenses with /ɪz/, and lengthen with /ən/."
        },
        {
          "id": "SM-B2-C-008",
          "axis": "final_consonant_sounds",
          "target": "attempts",
          "options": [
            "attempt",
            "attempts",
            "attends",
            "attentive"
          ],
          "answer": "attempts",
          "explain": "Attempts ends with the consonant cluster /mpts/. Attempt ends with /mt/, attends with /ndz/, and attentive with /tɪv/."
        },
        {
          "id": "SM-B2-C-009",
          "axis": "final_consonant_sounds",
          "target": "glimpsed",
          "options": [
            "glimpse",
            "glimpsed",
            "glimpses",
            "glimmer"
          ],
          "answer": "glimpsed",
          "explain": "Glimpsed ends with /pst/: -ed is pronounced /t/ after the voiceless /s/ sound. Glimpse ends with /ps/, glimpses with /ɪz/, and glimmer with /ər/."
        },
        {
          "id": "SM-B2-C-010",
          "axis": "basic_spelling_patterns",
          "target": "yacht",
          "options": [
            "yacht",
            "yolk",
            "yawn",
            "yak"
          ],
          "answer": "yacht",
          "explain": "Yacht is pronounced /jɑt/; the ch is silent and the spelling is unusual. Yolk ends with /k/, yawn with /n/, and yak with /k/ after a different vowel."
        },
        {
          "id": "SM-B2-C-011",
          "axis": "basic_spelling_patterns",
          "target": "fuchsia",
          "options": [
            "fuchsia",
            "future",
            "fusion",
            "fugue"
          ],
          "answer": "fuchsia",
          "explain": "Fuchsia is pronounced /ˈfjuːʃə/. Future has /tʃər/, fusion has /ʒən/, and fugue ends with /ɡ/."
        },
        {
          "id": "SM-B2-C-012",
          "axis": "basic_spelling_patterns",
          "target": "connoisseur",
          "options": [
            "connoisseur",
            "conqueror",
            "conductor",
            "conservator"
          ],
          "answer": "connoisseur",
          "explain": "Connoisseur is pronounced /ˌkɑnəˈsɜr/. Conqueror, conductor, and conservator have different stressed syllables and endings."
        }
      ]
    },
    "C1": {
      "guided": [
        {
          "id": "SM-C1-G-001",
          "axis": "short_vowel_contrasts",
          "target": "muster",
          "options": [
            "master",
            "mister",
            "muster",
            "monster"
          ],
          "answer": "muster",
          "explain": "Muster has the short /ʌ/ vowel in its first syllable. Master has /æ/, mister has /ɪ/, and monster has /ɑ/."
        },
        {
          "id": "SM-C1-G-002",
          "axis": "short_vowel_contrasts",
          "target": "relish",
          "options": [
            "radish",
            "rubbish",
            "relish",
            "raven"
          ],
          "answer": "relish",
          "explain": "Relish begins with the short /ɛ/ vowel. Radish has /æ/, rubbish has /ʌ/, and raven has /eɪ/."
        },
        {
          "id": "SM-C1-G-003",
          "axis": "short_vowel_contrasts",
          "target": "cavern",
          "options": [
            "cavern",
            "coven",
            "civic",
            "caper"
          ],
          "answer": "cavern",
          "explain": "Cavern begins with /æ/. Coven begins with /ʌ/, civic with /ɪ/, and caper with /eɪ/."
        },
        {
          "id": "SM-C1-G-004",
          "axis": "initial_consonant_sounds",
          "target": "pneumatic",
          "options": [
            "pivotal",
            "pneumatic",
            "thematic",
            "dramatic"
          ],
          "answer": "pneumatic",
          "explain": "Pneumatic begins with /n/ because the written p is silent. Pivotal begins with /p/, thematic with /θ/, and dramatic with /d/."
        },
        {
          "id": "SM-C1-G-005",
          "axis": "initial_consonant_sounds",
          "target": "choreography",
          "options": [
            "shoreline",
            "choreography",
            "geography",
            "hologram"
          ],
          "answer": "choreography",
          "explain": "Choreography begins with /k/; ch represents /k/ in this word. Shoreline begins with /ʃ/, geography with /dʒ/, and hologram with /h/."
        },
        {
          "id": "SM-C1-G-006",
          "axis": "initial_consonant_sounds",
          "target": "gnawing",
          "options": [
            "gnawing",
            "growing",
            "rowing",
            "showing"
          ],
          "answer": "gnawing",
          "explain": "Gnawing begins with /n/ because the g is silent. Growing begins with /ɡr/, rowing with /r/, and showing with /ʃ/."
        },
        {
          "id": "SM-C1-G-007",
          "axis": "final_consonant_sounds",
          "target": "corps",
          "options": [
            "cord",
            "corpse",
            "corps",
            "course"
          ],
          "answer": "corps",
          "explain": "Corps is pronounced /kɔrz/ in General American, with final /z/. Cord ends in /d/, corpse in /ps/, and course in /s/."
        },
        {
          "id": "SM-C1-G-008",
          "axis": "final_consonant_sounds",
          "target": "lapsed",
          "options": [
            "lapse",
            "lapsed",
            "lapses",
            "latter"
          ],
          "answer": "lapsed",
          "explain": "Lapsed ends with /pst/: the -ed ending is /t/ after the voiceless /s/. Lapse ends with /ps/, lapses with /ɪz/, and latter with /ər/."
        },
        {
          "id": "SM-C1-G-009",
          "axis": "final_consonant_sounds",
          "target": "clenched",
          "options": [
            "clench",
            "clenched",
            "clenches",
            "clenching"
          ],
          "answer": "clenched",
          "explain": "Clenched ends with /tʃt/. Clench ends with /tʃ/, clenches with /ɪz/, and clenching with /ɪŋ/."
        },
        {
          "id": "SM-C1-G-010",
          "axis": "basic_spelling_patterns",
          "target": "accommodate",
          "options": [
            "accommodate",
            "accompany",
            "accumulate",
            "activate"
          ],
          "answer": "accommodate",
          "explain": "Accommodate is pronounced /əˈkɑmədeɪt/ and has a double c and double m. The alternatives have different vowel and consonant sequences."
        },
        {
          "id": "SM-C1-G-011",
          "axis": "basic_spelling_patterns",
          "target": "camouflage",
          "options": [
            "carriage",
            "collage",
            "camouflage",
            "courage"
          ],
          "answer": "camouflage",
          "explain": "Camouflage ends with /ɑʒ/ in General American. Carriage and courage end with /ɪdʒ/, while collage has a different stress and vowel pattern."
        },
        {
          "id": "SM-C1-G-012",
          "axis": "basic_spelling_patterns",
          "target": "rendezvous",
          "options": [
            "rendezvous",
            "renovate",
            "reverence",
            "remainder"
          ],
          "answer": "rendezvous",
          "explain": "Rendezvous is pronounced /ˈrɑndəˌvuː/, with the final letters representing /vuː/. The alternatives have different syllable patterns and endings."
        }
      ],
      "steady": [
        {
          "id": "SM-C1-S-001",
          "axis": "short_vowel_contrasts",
          "target": "stagnant",
          "options": [
            "stagnant",
            "statement",
            "stinging",
            "stunning"
          ],
          "answer": "stagnant",
          "explain": "Stagnant has /æ/ in its stressed first syllable. Statement has /eɪ/, stinging has /ɪ/, and stunning has /ʌ/."
        },
        {
          "id": "SM-C1-S-002",
          "axis": "short_vowel_contrasts",
          "target": "cumbersome",
          "options": [
            "cosmic",
            "cumbersome",
            "cement",
            "cavern"
          ],
          "answer": "cumbersome",
          "explain": "Cumbersome begins with /ʌ/. Customary also begins with /ʌ/, while cosmetic begins with /ɑ/ and cement with /ɪ/."
        },
        {
          "id": "SM-C1-S-003",
          "axis": "short_vowel_contrasts",
          "target": "diligence",
          "options": [
            "diligence",
            "delegate",
            "dalliance",
            "dollop"
          ],
          "answer": "diligence",
          "explain": "Diligence begins with /ɪ/ in its first syllable. Delegate begins with /ɛ/, dalliance with /æ/, and dollop with /ɑ/."
        },
        {
          "id": "SM-C1-S-004",
          "axis": "initial_consonant_sounds",
          "target": "ptarmigan",
          "options": [
            "pivotal",
            "ptarmigan",
            "theoretical",
            "gnawing"
          ],
          "answer": "ptarmigan",
          "explain": "Ptarmigan begins with /t/ because the initial p is silent. Pivotal begins with /p/, theoretical with /θ/, and gnawing with /n/."
        },
        {
          "id": "SM-C1-S-005",
          "axis": "initial_consonant_sounds",
          "target": "zither",
          "options": [
            "zither",
            "famine",
            "theory",
            "harmony"
          ],
          "answer": "zither",
          "explain": "Zither begins with /z/. Famine begins with /f/, theory with /θ/, and harmony with /h/."
        },
        {
          "id": "SM-C1-S-006",
          "axis": "initial_consonant_sounds",
          "target": "hierarchy",
          "options": [
            "hierarchy",
            "irony",
            "rhetoric",
            "eulogy"
          ],
          "answer": "hierarchy",
          "explain": "Hierarchy begins with /h/ in careful General American pronunciation. Irony begins with a vowel, rhetoric with /r/, and eulogy with /j/."
        },
        {
          "id": "SM-C1-S-007",
          "axis": "final_consonant_sounds",
          "target": "drought",
          "options": [
            "drown",
            "drought",
            "drowsy",
            "drowned"
          ],
          "answer": "drought",
          "explain": "Drought ends with /t/. Drown ends with /n/, drowsy with /zi/, and drowned with /nd/."
        },
        {
          "id": "SM-C1-S-008",
          "axis": "final_consonant_sounds",
          "target": "scratched",
          "options": [
            "scratch",
            "scratched",
            "scratches",
            "scratching"
          ],
          "answer": "scratched",
          "explain": "Scratched ends with /tʃt/. Scratch ends with /tʃ/, scratches with /ɪz/, and scratching with /ɪŋ/."
        },
        {
          "id": "SM-C1-S-009",
          "axis": "final_consonant_sounds",
          "target": "risks",
          "options": [
            "risk",
            "risks",
            "risky",
            "risen"
          ],
          "answer": "risks",
          "explain": "Risks ends with /sks/. Risk ends with /sk/, risky with /i/, and risen with /ən/."
        },
        {
          "id": "SM-C1-S-010",
          "axis": "basic_spelling_patterns",
          "target": "supersession",
          "options": [
            "supervision",
            "supersession",
            "superstition",
            "superficial"
          ],
          "answer": "supersession",
          "explain": "Supersession is pronounced /ˌsuːpərˈsɛʃən/. The alternatives have different stressed vowels or consonant sequences."
        },
        {
          "id": "SM-C1-S-011",
          "axis": "basic_spelling_patterns",
          "target": "belligerent",
          "options": [
            "belligerent",
            "benevolent",
            "bilingual",
            "beneficial"
          ],
          "answer": "belligerent",
          "explain": "Belligerent has a soft g pronounced /dʒ/ and a distinctive /ˈbɛlɪdʒərənt/ sequence. The other choices differ in their medial consonants and vowel patterns."
        },
        {
          "id": "SM-C1-S-012",
          "axis": "basic_spelling_patterns",
          "target": "miscellaneous",
          "options": [
            "meticulous",
            "miscellaneous",
            "millennium",
            "misleading"
          ],
          "answer": "miscellaneous",
          "explain": "Miscellaneous is pronounced /ˌmɪsəˈleɪniəs/. The alternatives have different syllable counts, stress, and vowel sequences."
        }
      ],
      "challenge": [
        {
          "id": "SM-C1-C-001",
          "axis": "short_vowel_contrasts",
          "target": "myriad",
          "options": [
            "married",
            "myriad",
            "merriment",
            "moraine"
          ],
          "answer": "myriad",
          "explain": "Myriad begins with /mɪr/ in General American. Married begins with /mær/, merriment with /mɛ/, and moraine with /mə/."
        },
        {
          "id": "SM-C1-C-002",
          "axis": "short_vowel_contrasts",
          "target": "quintessential",
          "options": [
            "questionable",
            "quintessential",
            "quarantine",
            "quiescent"
          ],
          "answer": "quintessential",
          "explain": "Quintessential begins with /kwɪn/. Questionable begins with /kwɛs/, quarantine with /kwɔr/ or /kwɑr/, and quiescent with /kwaɪ/."
        },
        {
          "id": "SM-C1-C-003",
          "axis": "short_vowel_contrasts",
          "target": "vigilant",
          "options": [
            "valiant",
            "vigilant",
            "vagrant",
            "voluble"
          ],
          "answer": "vigilant",
          "explain": "Vigilant begins with /vɪ/. Valiant begins with /væ/, vagrant with /veɪ/, and voluble with /vɑ/."
        },
        {
          "id": "SM-C1-C-004",
          "axis": "initial_consonant_sounds",
          "target": "psoriasis",
          "options": [
            "psoriasis",
            "zoology",
            "theory",
            "fiscal"
          ],
          "answer": "psoriasis",
          "explain": "Psoriasis begins with /s/ because the initial p is silent. Zoology begins with /z/, theory with /θ/, and fiscal with /f/."
        },
        {
          "id": "SM-C1-C-005",
          "axis": "initial_consonant_sounds",
          "target": "pteranodon",
          "options": [
            "pteranodon",
            "pivotal",
            "theory",
            "gnawing"
          ],
          "answer": "pteranodon",
          "explain": "Pteranodon begins with /t/ because its initial p is silent. Pivotal begins with /p/, theory with /θ/, and gnawing with /n/."
        },
        {
          "id": "SM-C1-C-006",
          "axis": "initial_consonant_sounds",
          "target": "chthonic",
          "options": [
            "chthonic",
            "kinetic",
            "shallow",
            "gnawing"
          ],
          "answer": "chthonic",
          "explain": "Chthonic begins with /θ/; the initial ch is silent and the th supplies the first sound. Kinetic begins with /k/, shallow with /ʃ/, and gnawing with /n/."
        },
        {
          "id": "SM-C1-C-007",
          "axis": "final_consonant_sounds",
          "target": "asks",
          "options": [
            "ask",
            "asks",
            "asked",
            "asking"
          ],
          "answer": "asks",
          "explain": "Asks ends with /sks/. Ask ends with /sk/, asked with /skt/, and asking with /skɪŋ/."
        },
        {
          "id": "SM-C1-C-008",
          "axis": "final_consonant_sounds",
          "target": "twelfths",
          "options": [
            "twelfth",
            "twelfths",
            "twelve",
            "twelfthly"
          ],
          "answer": "twelfths",
          "explain": "Twelfths ends with /lfθs/, adding /s/ to the final cluster in twelfth. Twelve ends with /lv/, and twelfthly adds a syllable."
        },
        {
          "id": "SM-C1-C-009",
          "axis": "final_consonant_sounds",
          "target": "crisps",
          "options": [
            "crisp",
            "crisps",
            "crisis",
            "crisped"
          ],
          "answer": "crisps",
          "explain": "Crisps ends with /s/ after /sp/, producing /sps/. Crisp lacks the final /s/, crisis ends with /sɪs/, and crisped ends with /pt/."
        },
        {
          "id": "SM-C1-C-010",
          "axis": "basic_spelling_patterns",
          "target": "hors d'oeuvre",
          "options": [
            "hors d'oeuvre",
            "horsepower",
            "hospitable",
            "honorary"
          ],
          "answer": "hors d'oeuvre",
          "explain": "Hors d'oeuvre is pronounced /ɔr ˈdɜrv/ in General American; its written French sequence is highly irregular. The other choices have different syllable and consonant patterns."
        },
        {
          "id": "SM-C1-C-011",
          "axis": "basic_spelling_patterns",
          "target": "onomatopoeia",
          "options": [
            "onomatopoeia",
            "onomastic",
            "onomatology",
            "onomatopoeic"
          ],
          "answer": "onomatopoeia",
          "explain": "Onomatopoeia is pronounced /ˌɑnəˌmætəˈpiːə/. Onomatopoeic has a related but different ending; onomastic and onomatology have different stress and vowel sequences."
        },
        {
          "id": "SM-C1-C-012",
          "axis": "basic_spelling_patterns",
          "target": "ecclesiastical",
          "options": [
            "ecclesiastical",
            "eclectic",
            "eccentric",
            "ecumenical"
          ],
          "answer": "ecclesiastical",
          "explain": "Ecclesiastical is pronounced /ɪˌkliːziˈæstɪkəl/. The alternatives differ in their stressed syllables and vowel-consonant sequences."
        }
      ]
    },
    "C2": {
      "guided": [
        {
          "id": "SM-C2-G-001",
          "axis": "short_vowel_contrasts",
          "target": "abject",
          "options": [
            "abject",
            "object",
            "eject",
            "subject"
          ],
          "answer": "abject",
          "explain": "Abject begins with /æ/. Eject begins with /iː/; object and subject have different first-syllable vowel qualities and stress."
        },
        {
          "id": "SM-C2-G-002",
          "axis": "short_vowel_contrasts",
          "target": "quell",
          "options": [
            "quell",
            "quill",
            "quail",
            "qualm"
          ],
          "answer": "quell",
          "explain": "Quell has /ɛ/. Quill has /ɪ/, quail has /eɪ/, and qualm has /ɑ/."
        },
        {
          "id": "SM-C2-G-003",
          "axis": "short_vowel_contrasts",
          "target": "sullen",
          "options": [
            "salon",
            "sullen",
            "silken",
            "solemn"
          ],
          "answer": "sullen",
          "explain": "Sullen begins with /ʌ/. Salon begins with /ə/, silken with /ɪ/, and solemn with /ɑ/."
        },
        {
          "id": "SM-C2-G-004",
          "axis": "initial_consonant_sounds",
          "target": "rhapsody",
          "options": [
            "rhapsody",
            "lapse",
            "haps",
            "dapper"
          ],
          "answer": "rhapsody",
          "explain": "Rhapsody begins with /r/; its written rh represents /r/. Lapse begins with /l/, haps with /h/, and dapper with /d/."
        },
        {
          "id": "SM-C2-G-005",
          "axis": "initial_consonant_sounds",
          "target": "chrysalis",
          "options": [
            "chrysalis",
            "shrewd",
            "gregarious",
            "syringe"
          ],
          "answer": "chrysalis",
          "explain": "Chrysalis begins with /k/ because ch represents /k/. Shrewd begins with /ʃ/, gregarious with /g/, and syringe with /s/."
        },
        {
          "id": "SM-C2-G-006",
          "axis": "initial_consonant_sounds",
          "target": "wrangle",
          "options": [
            "wrangle",
            "wangle",
            "jangle",
            "mangle"
          ],
          "answer": "wrangle",
          "explain": "Wrangle begins with /r/ because its written w is silent. Wangle begins with /w/, jangle with /dʒ/, and mangle with /m/."
        },
        {
          "id": "SM-C2-G-007",
          "axis": "final_consonant_sounds",
          "target": "bursts",
          "options": [
            "burst",
            "bursts",
            "bust",
            "bursary"
          ],
          "answer": "bursts",
          "explain": "Bursts ends with /sts/. Burst and bust end with /st/, while bursary ends with a vowel sequence."
        },
        {
          "id": "SM-C2-G-008",
          "axis": "final_consonant_sounds",
          "target": "waltzed",
          "options": [
            "waltz",
            "waltzed",
            "waltzes",
            "waltzing"
          ],
          "answer": "waltzed",
          "explain": "Waltzed ends with /tst/. Waltz ends with /ts/, waltzes with /ɪz/, and waltzing with /ɪŋ/."
        },
        {
          "id": "SM-C2-G-009",
          "axis": "final_consonant_sounds",
          "target": "throbs",
          "options": [
            "throb",
            "throbs",
            "throbbed",
            "throbbing"
          ],
          "answer": "throbs",
          "explain": "Throbs ends with /bz/. Throb ends with /b/, throbbing with /bɪŋ/, and throbbed ends with /bd/."
        },
        {
          "id": "SM-C2-G-010",
          "axis": "basic_spelling_patterns",
          "target": "colonel",
          "options": [
            "colonel",
            "colonial",
            "colonnade",
            "colossal"
          ],
          "answer": "colonel",
          "explain": "Colonel is pronounced /ˈkɜrnəl/, an irregular spelling. The alternatives have different syllable patterns."
        },
        {
          "id": "SM-C2-G-011",
          "axis": "basic_spelling_patterns",
          "target": "segue",
          "options": [
            "segue",
            "sequel",
            "sequin",
            "sequester"
          ],
          "answer": "segue",
          "explain": "Segue is pronounced /ˈsɛɡweɪ/. Sequel ends with /əl/, sequin with /ɪn/, and sequester with /ɛstər/."
        },
        {
          "id": "SM-C2-G-012",
          "axis": "basic_spelling_patterns",
          "target": "indict",
          "options": [
            "indict",
            "indicate",
            "indigent",
            "indelible"
          ],
          "answer": "indict",
          "explain": "Indict is pronounced /ɪnˈdaɪt/; c is silent. The alternatives have different stress and vowel sequences."
        }
      ],
      "steady": [
        {
          "id": "SM-C2-S-001",
          "axis": "short_vowel_contrasts",
          "target": "fathom",
          "options": [
            "fathom",
            "feather",
            "father",
            "further"
          ],
          "answer": "fathom",
          "explain": "Fathom begins with /æ/. Feather begins with /ɛ/, father with /ɑ/, and further with /ɜr/."
        },
        {
          "id": "SM-C2-S-002",
          "axis": "short_vowel_contrasts",
          "target": "livid",
          "options": [
            "leaven",
            "livid",
            "lavish",
            "lovely"
          ],
          "answer": "livid",
          "explain": "Livid begins with /ɪ/. Leaven begins with /ɛ/, lavish with /æ/, and lovely with /ʌ/."
        },
        {
          "id": "SM-C2-S-003",
          "axis": "short_vowel_contrasts",
          "target": "placid",
          "options": [
            "placid",
            "pleasure",
            "plunder",
            "plume"
          ],
          "answer": "placid",
          "explain": "Placid has /æ/ in its first syllable. Pleasure has /ɛ/, plunder has /ʌ/, and plume has /uː/."
        },
        {
          "id": "SM-C2-S-004",
          "axis": "initial_consonant_sounds",
          "target": "psalter",
          "options": [
            "psalter",
            "shelter",
            "poultry",
            "halter"
          ],
          "answer": "psalter",
          "explain": "Psalter begins with /s/ because its written p is silent. Shelter begins with /ʃ/, poultry with /p/, and halter with /h/."
        },
        {
          "id": "SM-C2-S-005",
          "axis": "initial_consonant_sounds",
          "target": "xylitol",
          "options": [
            "xylitol",
            "serene",
            "arena",
            "haughty"
          ],
          "answer": "xylitol",
          "explain": "Xylitol begins with /z/, although it is written with x. Serene begins with /s/, arena with a vowel sound, and haughty with /h/."
        },
        {
          "id": "SM-C2-S-006",
          "axis": "initial_consonant_sounds",
          "target": "knoll",
          "options": [
            "knoll",
            "coal",
            "droll",
            "mole"
          ],
          "answer": "knoll",
          "explain": "Knoll begins with /n/ because k is silent. Coal begins with /k/, droll with /d/, and mole with /m/."
        },
        {
          "id": "SM-C2-S-007",
          "axis": "final_consonant_sounds",
          "target": "quaffed",
          "options": [
            "quaff",
            "quaffed",
            "quaffs",
            "quaffing"
          ],
          "answer": "quaffed",
          "explain": "Quaffed ends with /ft/. Quaff ends with /f/, quaffs with /fs/, and quaffing with /fɪŋ/."
        },
        {
          "id": "SM-C2-S-008",
          "axis": "final_consonant_sounds",
          "target": "dwelled",
          "options": [
            "dwell",
            "dwelled",
            "dwells",
            "dwelling"
          ],
          "answer": "dwelled",
          "explain": "Dwelled ends with /ld/. Dwell ends with /l/, dwells with /lz/, and dwelling with /lɪŋ/."
        },
        {
          "id": "SM-C2-S-009",
          "axis": "final_consonant_sounds",
          "target": "clasped",
          "options": [
            "clasp",
            "clasped",
            "clasps",
            "clasping"
          ],
          "answer": "clasped",
          "explain": "Clasped ends with /pst/. Clasp ends with /sp/, clasps with /sps/, and clasping with /spɪŋ/."
        },
        {
          "id": "SM-C2-S-010",
          "axis": "basic_spelling_patterns",
          "target": "echelon",
          "options": [
            "echelon",
            "etching",
            "echoing",
            "election"
          ],
          "answer": "echelon",
          "explain": "Echelon is pronounced /ˈɛʃəlɑn/. Etching begins with /ɛtʃ/, echoing with /ɛk/, and election has a different medial sequence."
        },
        {
          "id": "SM-C2-S-011",
          "axis": "basic_spelling_patterns",
          "target": "faux",
          "options": [
            "faux",
            "fax",
            "fox",
            "fall"
          ],
          "answer": "faux",
          "explain": "Faux is pronounced /foʊ/; x is silent. Fax, fox, and fall have different vowel and ending sounds."
        },
        {
          "id": "SM-C2-S-012",
          "axis": "basic_spelling_patterns",
          "target": "subpoena",
          "options": [
            "subpoena",
            "subpoenas",
            "subpoenaed",
            "supernova"
          ],
          "answer": "subpoena",
          "explain": "Subpoena is pronounced /səˈpiːnə/. Subpoenas and subpoenaed have audible final additions; supernova has a different syllable and stress pattern."
        }
      ],
      "challenge": [
        {
          "id": "SM-C2-C-001",
          "axis": "short_vowel_contrasts",
          "target": "squalid",
          "options": [
            "squalid",
            "squint",
            "squelch",
            "squirm"
          ],
          "answer": "squalid",
          "explain": "Squalid has /ɑ/ in its first syllable. Squint has /ɪ/, squelch has /ɛ/, and squirm has /ɜr/."
        },
        {
          "id": "SM-C2-C-002",
          "axis": "short_vowel_contrasts",
          "target": "quixotic",
          "options": [
            "quixotic",
            "quiescent",
            "quench",
            "quorum"
          ],
          "answer": "quixotic",
          "explain": "Quixotic begins with /kwɪ/. Quiescent begins with /kwiː/, quench with /kwɛ/, and quorum with /kwɔ/."
        },
        {
          "id": "SM-C2-C-003",
          "axis": "short_vowel_contrasts",
          "target": "vexation",
          "options": [
            "vexation",
            "vacation",
            "vocation",
            "vivacious"
          ],
          "answer": "vexation",
          "explain": "Vexation begins with /vɛ/. Vacation begins with /veɪ/, vocation with /voʊ/, and vivacious with /vɪ/."
        },
        {
          "id": "SM-C2-C-004",
          "axis": "initial_consonant_sounds",
          "target": "gnomic",
          "options": [
            "gnomic",
            "comic",
            "gibberish",
            "homing"
          ],
          "answer": "gnomic",
          "explain": "Gnomic begins with /n/ because its written g is silent. Comic begins with /k/, gibberish with /dʒ/, and homing with /h/."
        },
        {
          "id": "SM-C2-C-005",
          "axis": "initial_consonant_sounds",
          "target": "rhinoceros",
          "options": [
            "rhinoceros",
            "linoleum",
            "hilarious",
            "villainous"
          ],
          "answer": "rhinoceros",
          "explain": "Rhinoceros begins with /r/; h in rh is silent. Linoleum begins with /l/, hilarious with /h/, and villainous with /v/."
        },
        {
          "id": "SM-C2-C-006",
          "axis": "initial_consonant_sounds",
          "target": "xenial",
          "options": [
            "xenial",
            "sarcasm",
            "charisma",
            "harbor"
          ],
          "answer": "xenial",
          "explain": "Xenial begins with /z/, although it is written with x. Sarcasm begins with /s/, charisma with /k/, and harbor with /h/."
        },
        {
          "id": "SM-C2-C-007",
          "axis": "final_consonant_sounds",
          "target": "thrusts",
          "options": [
            "thrust",
            "thrusts",
            "trussed",
            "thrusting"
          ],
          "answer": "thrusts",
          "explain": "Thrusts ends with the /sts/ cluster. Thrust and trussed end with /st/, while thrusting has a different final syllable."
        },
        {
          "id": "SM-C2-C-008",
          "axis": "final_consonant_sounds",
          "target": "strengths",
          "options": [
            "strength",
            "strengths",
            "strengthen",
            "strenuous"
          ],
          "answer": "strengths",
          "explain": "Strengths ends with /ŋθs/. Strength ends with /ŋθ/, strengthen adds a syllable, and strenuous has a different ending."
        },
        {
          "id": "SM-C2-C-009",
          "axis": "final_consonant_sounds",
          "target": "crunched",
          "options": [
            "crunch",
            "crunched",
            "crunches",
            "crunching"
          ],
          "answer": "crunched",
          "explain": "Crunched ends with /tʃt/. Crunch ends with /tʃ/, crunches with /ɪz/, and crunching with /ɪŋ/."
        },
        {
          "id": "SM-C2-C-010",
          "axis": "basic_spelling_patterns",
          "target": "bourgeois",
          "options": [
            "bourgeois",
            "bountiful",
            "buoyant",
            "boundary"
          ],
          "answer": "bourgeois",
          "explain": "Bourgeois is pronounced /ˌbʊrˈʒwɑ/ in General American, with an irregular French-derived spelling. The alternatives have distinct vowel and consonant sequences."
        },
        {
          "id": "SM-C2-C-011",
          "axis": "basic_spelling_patterns",
          "target": "phlegmatic",
          "options": [
            "phlegmatic",
            "pragmatic",
            "enigmatic",
            "dogmatic"
          ],
          "answer": "phlegmatic",
          "explain": "Phlegmatic is pronounced /flɛɡˈmætɪk/, with ph representing /f/. The alternatives begin with different consonants and have distinct first-syllable sounds."
        },
        {
          "id": "SM-C2-C-012",
          "axis": "basic_spelling_patterns",
          "target": "indictment",
          "options": [
            "indictment",
            "increment",
            "indigence",
            "indecent"
          ],
          "answer": "indictment",
          "explain": "Indictment is pronounced /ɪnˈdaɪtmənt/; c is silent. The alternatives have different stressed vowels and consonant sequences."
        }
      ]
    }
  }
};
  if (root) {
    root.EPIPHANY_SOUND_MAZE_BANK = bank;
    if (typeof root.EPIPHANY_FLUENTIA_REGISTER_SOURCES === 'function') {
      root.EPIPHANY_FLUENTIA_REGISTER_SOURCES({soundMazeBank: bank});
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = bank;
})(typeof window !== 'undefined' ? window : null);
