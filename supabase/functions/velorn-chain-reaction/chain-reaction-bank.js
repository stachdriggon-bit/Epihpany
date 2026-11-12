/* EPIPHANY Chain Reaction — approved, mode-specific content bank. */
(() => {
  'use strict';
  const MODES = Object.freeze(['guided','steady','challenge']);
  const DATA = {
  "guided": [
    {
      "id": "CR-G-001",
      "title": "The Busy Bee",
      "start": "BEE",
      "links": [
        {
          "from": "BEE",
          "to": "HONEY",
          "options": [
            "HONEY",
            "MILK",
            "BREAD"
          ],
          "explanation": "Bees produce honey."
        },
        {
          "from": "HONEY",
          "to": "JAR",
          "options": [
            "BOX",
            "JAR",
            "PLATE"
          ],
          "explanation": "Honey is usually stored in a jar."
        },
        {
          "from": "JAR",
          "to": "LID",
          "options": [
            "LID",
            "HANDLE",
            "WHEEL"
          ],
          "explanation": "A jar has a lid."
        }
      ]
    },
    {
      "id": "CR-G-002",
      "title": "A Rainy Day",
      "start": "RAIN",
      "links": [
        {
          "from": "RAIN",
          "to": "UMBRELLA",
          "options": [
            "UMBRELLA",
            "LADDER",
            "BLANKET"
          ],
          "explanation": "We use an umbrella for protection from rain."
        },
        {
          "from": "UMBRELLA",
          "to": "HANDLE",
          "options": [
            "WINDOW",
            "HANDLE",
            "BUTTON"
          ],
          "explanation": "An umbrella has a handle that we hold."
        },
        {
          "from": "HANDLE",
          "to": "GRIP",
          "options": [
            "GRIP",
            "SHADOW",
            "NOISE"
          ],
          "explanation": "The handle helps us grip the umbrella firmly."
        }
      ]
    },
    {
      "id": "CR-G-003",
      "title": "Breakfast Time",
      "start": "BREAD",
      "links": [
        {
          "from": "BREAD",
          "to": "TOASTER",
          "options": [
            "TOASTER",
            "FREEZER",
            "SHOWER"
          ],
          "explanation": "We put bread in a toaster to toast it."
        },
        {
          "from": "TOASTER",
          "to": "ELECTRICITY",
          "options": [
            "WATER",
            "ELECTRICITY",
            "WIND"
          ],
          "explanation": "A toaster works using electricity."
        },
        {
          "from": "ELECTRICITY",
          "to": "SOCKET",
          "options": [
            "SOCKET",
            "BOTTLE",
            "MIRROR"
          ],
          "explanation": "A toaster's plug connects to an electrical socket."
        }
      ]
    },
    {
      "id": "CR-G-004",
      "title": "From Book to Tree",
      "start": "BOOK",
      "links": [
        {
          "from": "BOOK",
          "to": "PAGE",
          "options": [
            "PAGE",
            "SPOON",
            "SHOE"
          ],
          "explanation": "A book is made up of pages."
        },
        {
          "from": "PAGE",
          "to": "PAPER",
          "options": [
            "GLASS",
            "PAPER",
            "METAL"
          ],
          "explanation": "Book pages are usually made of paper."
        },
        {
          "from": "PAPER",
          "to": "TREE",
          "options": [
            "TREE",
            "CLOUD",
            "RIVER"
          ],
          "explanation": "Much paper is made from tree fibres."
        }
      ]
    },
    {
      "id": "CR-G-005",
      "title": "River Crossing",
      "start": "FISH",
      "links": [
        {
          "from": "FISH",
          "to": "WATER",
          "options": [
            "WATER",
            "SAND",
            "SMOKE"
          ],
          "explanation": "Fish live in water."
        },
        {
          "from": "WATER",
          "to": "RIVER",
          "options": [
            "MOUNTAIN",
            "RIVER",
            "DESERT"
          ],
          "explanation": "A river is a natural flow of water."
        },
        {
          "from": "RIVER",
          "to": "BRIDGE",
          "options": [
            "BRIDGE",
            "TUNNEL",
            "STAIR"
          ],
          "explanation": "A bridge is used to cross a river."
        }
      ]
    },
    {
      "id": "CR-G-006",
      "title": "Telling the Time",
      "start": "CLOCK",
      "links": [
        {
          "from": "CLOCK",
          "to": "TIME",
          "options": [
            "TIME",
            "WEATHER",
            "MUSIC"
          ],
          "explanation": "A clock tells us the time."
        },
        {
          "from": "TIME",
          "to": "HOUR",
          "options": [
            "MONTH",
            "HOUR",
            "YEAR"
          ],
          "explanation": "Time is measured in hours."
        },
        {
          "from": "HOUR",
          "to": "MINUTE",
          "options": [
            "MINUTE",
            "SEASON",
            "CENTURY"
          ],
          "explanation": "One hour consists of sixty minutes."
        }
      ]
    },
    {
      "id": "CR-G-007",
      "title": "Open the Door",
      "start": "KEY",
      "links": [
        {
          "from": "KEY",
          "to": "LOCK",
          "options": [
            "LOCK",
            "WINDOW",
            "CURTAIN"
          ],
          "explanation": "A key is used to open a lock."
        },
        {
          "from": "LOCK",
          "to": "DOOR",
          "options": [
            "ROOF",
            "DOOR",
            "FLOOR"
          ],
          "explanation": "A lock is used to secure a door."
        },
        {
          "from": "DOOR",
          "to": "HANDLE",
          "options": [
            "HANDLE",
            "PILLOW",
            "SPOON"
          ],
          "explanation": "A door has a handle used to open and close it."
        }
      ]
    },
    {
      "id": "CR-G-008",
      "title": "Life on the Farm",
      "start": "MILK",
      "links": [
        {
          "from": "MILK",
          "to": "COW",
          "options": [
            "COW",
            "HORSE",
            "DUCK"
          ],
          "explanation": "Milk often comes from cows."
        },
        {
          "from": "COW",
          "to": "FARM",
          "options": [
            "SCHOOL",
            "FARM",
            "SHOP"
          ],
          "explanation": "Cows are raised on farms."
        },
        {
          "from": "FARM",
          "to": "TRACTOR",
          "options": [
            "TRACTOR",
            "AIRPLANE",
            "BOAT"
          ],
          "explanation": "A tractor is used for farm work."
        }
      ]
    },
    {
      "id": "CR-G-009",
      "title": "Getting Dressed",
      "start": "SHOE",
      "links": [
        {
          "from": "SHOE",
          "to": "FOOT",
          "options": [
            "FOOT",
            "HAND",
            "HEAD"
          ],
          "explanation": "A shoe is worn on the foot."
        },
        {
          "from": "FOOT",
          "to": "SOCK",
          "options": [
            "HAT",
            "SOCK",
            "GLOVE"
          ],
          "explanation": "A sock covers the foot."
        },
        {
          "from": "SOCK",
          "to": "WOOL",
          "options": [
            "WOOL",
            "WOOD",
            "STONE"
          ],
          "explanation": "Some socks are made of wool."
        }
      ]
    },
    {
      "id": "CR-G-010",
      "title": "In the Kitchen",
      "start": "CHEF",
      "links": [
        {
          "from": "CHEF",
          "to": "KITCHEN",
          "options": [
            "GARDEN",
            "KITCHEN",
            "GARAGE"
          ],
          "explanation": "A chef works in a kitchen."
        },
        {
          "from": "KITCHEN",
          "to": "OVEN",
          "options": [
            "OVEN",
            "SINK",
            "FRIDGE"
          ],
          "explanation": "An oven is a kitchen appliance."
        },
        {
          "from": "OVEN",
          "to": "CAKE",
          "options": [
            "CAKE",
            "SALAD",
            "JUICE"
          ],
          "explanation": "A cake can be baked in an oven."
        }
      ]
    },
    {
      "id": "CR-G-011",
      "title": "Getting Better",
      "start": "DOCTOR",
      "links": [
        {
          "from": "DOCTOR",
          "to": "HOSPITAL",
          "options": [
            "HOSPITAL",
            "STATION",
            "MUSEUM"
          ],
          "explanation": "Many doctors work in hospitals."
        },
        {
          "from": "HOSPITAL",
          "to": "NURSE",
          "options": [
            "PILOT",
            "NURSE",
            "FARMER"
          ],
          "explanation": "A nurse works in a hospital with the medical team."
        },
        {
          "from": "NURSE",
          "to": "PATIENT",
          "options": [
            "PATIENT",
            "CUSTOMER",
            "DRIVER"
          ],
          "explanation": "A nurse cares for patients."
        }
      ]
    },
    {
      "id": "CR-G-012",
      "title": "Learning Together",
      "start": "SCHOOL",
      "links": [
        {
          "from": "SCHOOL",
          "to": "TEACHER",
          "options": [
            "TEACHER",
            "ATHLETE",
            "SINGER"
          ],
          "explanation": "A teacher works at a school."
        },
        {
          "from": "TEACHER",
          "to": "LESSON",
          "options": [
            "HOLIDAY",
            "LESSON",
            "JOURNEY"
          ],
          "explanation": "A teacher gives lessons."
        },
        {
          "from": "LESSON",
          "to": "HOMEWORK",
          "options": [
            "HOMEWORK",
            "LUGGAGE",
            "TICKET"
          ],
          "explanation": "A teacher may give homework after a lesson."
        }
      ]
    },
    {
      "id": "CR-G-013",
      "title": "A Photograph",
      "start": "CAMERA",
      "links": [
        {
          "from": "CAMERA",
          "to": "PHOTO",
          "options": [
            "PHOTO",
            "MAP",
            "LETTER"
          ],
          "explanation": "A camera takes photos."
        },
        {
          "from": "PHOTO",
          "to": "FRAME",
          "options": [
            "FRAME",
            "BOTTLE",
            "KEY"
          ],
          "explanation": "A photo can be placed inside a frame."
        },
        {
          "from": "FRAME",
          "to": "WALL",
          "options": [
            "WALL",
            "POCKET",
            "RIVER"
          ],
          "explanation": "A photo frame can be hung on a wall."
        }
      ]
    },
    {
      "id": "CR-G-014",
      "title": "In the Garden",
      "start": "GARDEN",
      "links": [
        {
          "from": "GARDEN",
          "to": "FLOWER",
          "options": [
            "FLOWER",
            "CLOUD",
            "ENGINE"
          ],
          "explanation": "Flowers grow in gardens."
        },
        {
          "from": "FLOWER",
          "to": "NECTAR",
          "options": [
            "ROOT",
            "NECTAR",
            "BRANCH"
          ],
          "explanation": "Many flowers produce nectar."
        },
        {
          "from": "NECTAR",
          "to": "BEE",
          "options": [
            "BEE",
            "WOLF",
            "FROG"
          ],
          "explanation": "Bees collect nectar from flowers."
        }
      ]
    },
    {
      "id": "CR-G-015",
      "title": "Flying High",
      "start": "AIRPLANE",
      "links": [
        {
          "from": "AIRPLANE",
          "to": "PILOT",
          "options": [
            "PILOT",
            "CHEF",
            "FARMER"
          ],
          "explanation": "A pilot flies an airplane."
        },
        {
          "from": "PILOT",
          "to": "COCKPIT",
          "options": [
            "CABIN",
            "COCKPIT",
            "HANGAR"
          ],
          "explanation": "A pilot works from the cockpit."
        },
        {
          "from": "COCKPIT",
          "to": "CONTROL",
          "options": [
            "CONTROL",
            "BREAKFAST",
            "LUGGAGE"
          ],
          "explanation": "The cockpit contains the airplane's controls."
        }
      ]
    },
    {
      "id": "CR-G-016",
      "title": "Railway Journey",
      "start": "TRAIN",
      "links": [
        {
          "from": "TRAIN",
          "to": "TRACK",
          "options": [
            "TRACK",
            "BEACH",
            "ROOF"
          ],
          "explanation": "A train travels on railway tracks."
        },
        {
          "from": "TRACK",
          "to": "RAIL",
          "options": [
            "RAIL",
            "ROPE",
            "PIPE"
          ],
          "explanation": "A railway track is made of rails."
        },
        {
          "from": "RAIL",
          "to": "STEEL",
          "options": [
            "STEEL",
            "COTTON",
            "PAPER"
          ],
          "explanation": "Railway rails are usually made of steel."
        }
      ]
    },
    {
      "id": "CR-G-017",
      "title": "A Phone Call",
      "start": "PHONE",
      "links": [
        {
          "from": "PHONE",
          "to": "CALL",
          "options": [
            "CALL",
            "DRAWING",
            "MEAL"
          ],
          "explanation": "A phone is used to make calls."
        },
        {
          "from": "CALL",
          "to": "NUMBER",
          "options": [
            "COLOUR",
            "NUMBER",
            "SEASON"
          ],
          "explanation": "We use a phone number to call someone."
        },
        {
          "from": "NUMBER",
          "to": "DIGIT",
          "options": [
            "DIGIT",
            "POCKET",
            "PILLOW"
          ],
          "explanation": "A phone number is made up of individual digits."
        }
      ]
    },
    {
      "id": "CR-G-018",
      "title": "Winter Fun",
      "start": "WINTER",
      "links": [
        {
          "from": "WINTER",
          "to": "SNOW",
          "options": [
            "SNOW",
            "DUST",
            "STEAM"
          ],
          "explanation": "Snow falls in some places during winter."
        },
        {
          "from": "SNOW",
          "to": "SNOWMAN",
          "options": [
            "SNOWMAN",
            "SANDCASTLE",
            "KITE"
          ],
          "explanation": "A snowman can be made from snow."
        },
        {
          "from": "SNOWMAN",
          "to": "CARROT",
          "options": [
            "CARROT",
            "POTATO",
            "ONION"
          ],
          "explanation": "A carrot is sometimes used to make a snowman's nose."
        }
      ]
    },
    {
      "id": "CR-G-019",
      "title": "Across the Desert",
      "start": "BEACH",
      "links": [
        {
          "from": "BEACH",
          "to": "SAND",
          "options": [
            "SAND",
            "GRASS",
            "ICE"
          ],
          "explanation": "A sandy beach is covered with sand."
        },
        {
          "from": "SAND",
          "to": "DUNE",
          "options": [
            "FOREST",
            "DUNE",
            "ISLAND"
          ],
          "explanation": "A dune is a natural hill or mound of sand."
        },
        {
          "from": "DUNE",
          "to": "DESERT",
          "options": [
            "DESERT",
            "OCEAN",
            "GARDEN"
          ],
          "explanation": "Sand dunes are found in many deserts."
        }
      ]
    },
    {
      "id": "CR-G-020",
      "title": "The Power of Music",
      "start": "MUSIC",
      "links": [
        {
          "from": "MUSIC",
          "to": "SONG",
          "options": [
            "SONG",
            "PAINTING",
            "RECIPE"
          ],
          "explanation": "A song is a form of music."
        },
        {
          "from": "SONG",
          "to": "LYRICS",
          "options": [
            "LYRICS",
            "NUMBERS",
            "MAPS"
          ],
          "explanation": "A song usually contains lyrics."
        },
        {
          "from": "LYRICS",
          "to": "RHYME",
          "options": [
            "RHYME",
            "ENGINE",
            "LADDER"
          ],
          "explanation": "Song lyrics sometimes use rhyme at the ends of lines."
        }
      ]
    },
    {
      "id": "CR-G-021",
      "title": "A Fireplace",
      "start": "FIRE",
      "links": [
        {
          "from": "FIRE",
          "to": "SMOKE",
          "options": [
            "SMOKE",
            "WATER",
            "SOIL"
          ],
          "explanation": "Fire produces smoke when materials burn."
        },
        {
          "from": "SMOKE",
          "to": "CHIMNEY",
          "options": [
            "CHIMNEY",
            "WINDOW",
            "BALCONY"
          ],
          "explanation": "A chimney allows smoke to leave a building."
        },
        {
          "from": "CHIMNEY",
          "to": "ROOF",
          "options": [
            "ROOF",
            "BASEMENT",
            "GATE"
          ],
          "explanation": "A chimney usually passes through the roof or extends above it."
        }
      ]
    },
    {
      "id": "CR-G-022",
      "title": "Birthday Surprise",
      "start": "BIRTHDAY",
      "links": [
        {
          "from": "BIRTHDAY",
          "to": "CAKE",
          "options": [
            "CAKE",
            "SOUP",
            "SANDWICH"
          ],
          "explanation": "Cake is a common food at birthday celebrations."
        },
        {
          "from": "CAKE",
          "to": "CANDLE",
          "options": [
            "CANDLE",
            "PLATE",
            "FORK"
          ],
          "explanation": "Candles are often placed on a birthday cake."
        },
        {
          "from": "CANDLE",
          "to": "FLAME",
          "options": [
            "FLAME",
            "SHADOW",
            "DROP"
          ],
          "explanation": "A candle's wick produces a flame when it burns."
        }
      ]
    },
    {
      "id": "CR-G-023",
      "title": "Two Wheels",
      "start": "BICYCLE",
      "links": [
        {
          "from": "BICYCLE",
          "to": "WHEEL",
          "options": [
            "WHEEL",
            "WING",
            "ENGINE"
          ],
          "explanation": "A bicycle has two wheels."
        },
        {
          "from": "WHEEL",
          "to": "TYRE",
          "options": [
            "TYRE",
            "CHAIN",
            "SEAT"
          ],
          "explanation": "A wheel has a rubber tyre."
        },
        {
          "from": "TYRE",
          "to": "RUBBER",
          "options": [
            "RUBBER",
            "GLASS",
            "WOOL"
          ],
          "explanation": "Bicycle tyres are usually made of rubber."
        }
      ]
    },
    {
      "id": "CR-G-024",
      "title": "Making Art",
      "start": "PAINT",
      "links": [
        {
          "from": "PAINT",
          "to": "BRUSH",
          "options": [
            "BRUSH",
            "HAMMER",
            "SPOON"
          ],
          "explanation": "We use a brush to apply paint."
        },
        {
          "from": "BRUSH",
          "to": "ARTIST",
          "options": [
            "ARTIST",
            "DOCTOR",
            "PILOT"
          ],
          "explanation": "An artist uses a brush for painting."
        },
        {
          "from": "ARTIST",
          "to": "CANVAS",
          "options": [
            "CANVAS",
            "PILLOW",
            "MIRROR"
          ],
          "explanation": "An artist can paint on a canvas."
        }
      ]
    }
  ],
  "steady": [
    {
      "id": "CR-S-001",
      "title": "The Ship's Journey",
      "start": "SHIP",
      "links": [
        {
          "from": "SHIP",
          "to": "ANCHOR",
          "options": [
            "ANCHOR",
            "SAIL",
            "COMPASS"
          ],
          "explanation": "An anchor is used to hold a ship in place."
        },
        {
          "from": "ANCHOR",
          "to": "SEABED",
          "options": [
            "SURFACE",
            "SEABED",
            "HORIZON"
          ],
          "explanation": "An anchor reaches the seabed when it is lowered."
        },
        {
          "from": "SEABED",
          "to": "SHELL",
          "options": [
            "SHELL",
            "FEATHER",
            "BRANCH"
          ],
          "explanation": "Some shell-bearing marine animals live on the seabed."
        }
      ]
    },
    {
      "id": "CR-S-002",
      "title": "A Scientific Discovery",
      "start": "EXPERIMENT",
      "links": [
        {
          "from": "EXPERIMENT",
          "to": "HYPOTHESIS",
          "options": [
            "HYPOTHESIS",
            "CONCLUSION",
            "INVENTION"
          ],
          "explanation": "A scientist often begins an experiment with a hypothesis to test."
        },
        {
          "from": "HYPOTHESIS",
          "to": "EVIDENCE",
          "options": [
            "EVIDENCE",
            "OPINION",
            "RUMOUR"
          ],
          "explanation": "Experiment results provide evidence that can be used to test a hypothesis."
        },
        {
          "from": "EVIDENCE",
          "to": "CONCLUSION",
          "options": [
            "CONCLUSION",
            "QUESTION",
            "PREDICTION"
          ],
          "explanation": "A researcher draws a conclusion based on the evidence."
        }
      ]
    },
    {
      "id": "CR-S-003",
      "title": "The Photographer's Eye",
      "start": "CAMERA",
      "links": [
        {
          "from": "CAMERA",
          "to": "LENS",
          "options": [
            "LENS",
            "SCREEN",
            "BATTERY"
          ],
          "explanation": "Light passes through a camera lens to form an image."
        },
        {
          "from": "LENS",
          "to": "FOCUS",
          "options": [
            "FOCUS",
            "ZOOM",
            "FLASH"
          ],
          "explanation": "Adjusting the focus helps make the subject clear."
        },
        {
          "from": "FOCUS",
          "to": "SHARPNESS",
          "options": [
            "SHARPNESS",
            "BRIGHTNESS",
            "DISTANCE"
          ],
          "explanation": "Accurate focus affects the sharpness and clarity of an image."
        }
      ]
    },
    {
      "id": "CR-S-004",
      "title": "The Ancient Message",
      "start": "ARCHAEOLOGIST",
      "links": [
        {
          "from": "ARCHAEOLOGIST",
          "to": "ARTIFACT",
          "options": [
            "ARTIFACT",
            "BLUEPRINT",
            "MACHINE"
          ],
          "explanation": "An archaeologist studies objects left by earlier civilizations."
        },
        {
          "from": "ARTIFACT",
          "to": "INSCRIPTION",
          "options": [
            "INSCRIPTION",
            "SCULPTURE",
            "MOSAIC"
          ],
          "explanation": "An artifact may carry an inscription written on its surface."
        },
        {
          "from": "INSCRIPTION",
          "to": "TRANSLATION",
          "options": [
            "TRANSLATION",
            "RESTORATION",
            "EXCAVATION"
          ],
          "explanation": "A researcher may need to translate an inscription to understand its words."
        }
      ]
    },
    {
      "id": "CR-S-005",
      "title": "Weather Warning",
      "start": "STORM",
      "links": [
        {
          "from": "STORM",
          "to": "PRESSURE",
          "options": [
            "PRESSURE",
            "TEMPERATURE",
            "HUMIDITY"
          ],
          "explanation": "Storm systems are often associated with changing air pressure."
        },
        {
          "from": "PRESSURE",
          "to": "BAROMETER",
          "options": [
            "THERMOMETER",
            "BAROMETER",
            "ANEMOMETER"
          ],
          "explanation": "A barometer measures atmospheric pressure."
        },
        {
          "from": "BAROMETER",
          "to": "READING",
          "options": [
            "READING",
            "FORECAST",
            "WARNING"
          ],
          "explanation": "A barometer provides a pressure reading that meteorologists can use when preparing forecasts."
        }
      ]
    },
    {
      "id": "CR-S-006",
      "title": "The Theatre Production",
      "start": "THEATRE",
      "links": [
        {
          "from": "THEATRE",
          "to": "SCRIPT",
          "options": [
            "SCRIPT",
            "POSTER",
            "TICKET"
          ],
          "explanation": "Actors rely on a written script to perform their roles."
        },
        {
          "from": "SCRIPT",
          "to": "DIALOGUE",
          "options": [
            "DIALOGUE",
            "MONOLOGUE",
            "NARRATION"
          ],
          "explanation": "Much of a play's script consists of dialogue between characters."
        },
        {
          "from": "DIALOGUE",
          "to": "REHEARSAL",
          "options": [
            "REHEARSAL",
            "PREMIERE",
            "APPLAUSE"
          ],
          "explanation": "Actors practise their dialogue during rehearsals before a performance."
        }
      ]
    },
    {
      "id": "CR-S-007",
      "title": "A Growing Business",
      "start": "STARTUP",
      "links": [
        {
          "from": "STARTUP",
          "to": "INVESTMENT",
          "options": [
            "INVESTMENT",
            "REVENUE",
            "EXPENSE"
          ],
          "explanation": "Startups often need investment to fund their growth."
        },
        {
          "from": "INVESTMENT",
          "to": "CAPITAL",
          "options": [
            "CAPITAL",
            "PROFIT",
            "DEBT"
          ],
          "explanation": "Investment provides capital that a company can use in its activities."
        },
        {
          "from": "CAPITAL",
          "to": "EXPANSION",
          "options": [
            "EXPANSION",
            "BANKRUPTCY",
            "REDUCTION"
          ],
          "explanation": "A company can use capital to finance expansion."
        }
      ]
    },
    {
      "id": "CR-S-008",
      "title": "The Mountain Rescue",
      "start": "MOUNTAIN",
      "links": [
        {
          "from": "MOUNTAIN",
          "to": "ALTITUDE",
          "options": [
            "ALTITUDE",
            "LATITUDE",
            "LONGITUDE"
          ],
          "explanation": "Mountains are associated with high elevations above sea level."
        },
        {
          "from": "ALTITUDE",
          "to": "OXYGEN",
          "options": [
            "OXYGEN",
            "NITROGEN",
            "CARBON"
          ],
          "explanation": "The available oxygen pressure for breathing decreases as altitude increases."
        },
        {
          "from": "OXYGEN",
          "to": "BREATHING",
          "options": [
            "BREATHING",
            "HEARING",
            "DIGESTION"
          ],
          "explanation": "Oxygen availability affects the body's ability to breathe normally."
        }
      ]
    },
    {
      "id": "CR-S-009",
      "title": "The Legal Case",
      "start": "COURT",
      "links": [
        {
          "from": "COURT",
          "to": "WITNESS",
          "options": [
            "WITNESS",
            "JUDGE",
            "LAWYER"
          ],
          "explanation": "A court may call a witness to provide information about a case."
        },
        {
          "from": "WITNESS",
          "to": "TESTIMONY",
          "options": [
            "TESTIMONY",
            "VERDICT",
            "SENTENCE"
          ],
          "explanation": "A witness gives testimony in court."
        },
        {
          "from": "TESTIMONY",
          "to": "CREDIBILITY",
          "options": [
            "CREDIBILITY",
            "AUTHORITY",
            "POPULARITY"
          ],
          "explanation": "The credibility of testimony is considered when assessing how reliable it is."
        }
      ]
    },
    {
      "id": "CR-S-010",
      "title": "The Printing Workshop",
      "start": "PRINTING",
      "links": [
        {
          "from": "PRINTING",
          "to": "INK",
          "options": [
            "INK",
            "GLUE",
            "WAX"
          ],
          "explanation": "Printing uses ink to transfer text and images onto paper."
        },
        {
          "from": "INK",
          "to": "CARTRIDGE",
          "options": [
            "CARTRIDGE",
            "TONER",
            "DRUM"
          ],
          "explanation": "Some printers contain an ink cartridge."
        },
        {
          "from": "CARTRIDGE",
          "to": "NOZZLE",
          "options": [
            "NOZZLE",
            "SENSOR",
            "SWITCH"
          ],
          "explanation": "Tiny nozzles release ink droplets in inkjet printers."
        }
      ]
    },
    {
      "id": "CR-S-011",
      "title": "The Orchestra",
      "start": "ORCHESTRA",
      "links": [
        {
          "from": "ORCHESTRA",
          "to": "CONDUCTOR",
          "options": [
            "CONDUCTOR",
            "COMPOSER",
            "SOLOIST"
          ],
          "explanation": "An orchestra conductor leads the musicians' performance."
        },
        {
          "from": "CONDUCTOR",
          "to": "BATON",
          "options": [
            "BATON",
            "VIOLIN",
            "SCORE"
          ],
          "explanation": "A conductor uses a baton to guide timing and entrances."
        },
        {
          "from": "BATON",
          "to": "TEMPO",
          "options": [
            "TEMPO",
            "MELODY",
            "HARMONY"
          ],
          "explanation": "The conductor's gestures help control the speed of the music."
        }
      ]
    },
    {
      "id": "CR-S-012",
      "title": "The Greenhouse",
      "start": "GREENHOUSE",
      "links": [
        {
          "from": "GREENHOUSE",
          "to": "PHOTOSYNTHESIS",
          "options": [
            "PHOTOSYNTHESIS",
            "RESPIRATION",
            "GERMINATION"
          ],
          "explanation": "Plants carry out photosynthesis in a greenhouse just as they do in other growing environments."
        },
        {
          "from": "PHOTOSYNTHESIS",
          "to": "CHLOROPHYLL",
          "options": [
            "CHLOROPHYLL",
            "CELLULOSE",
            "GLUCOSE"
          ],
          "explanation": "Chlorophyll absorbs the light needed for photosynthesis."
        },
        {
          "from": "CHLOROPHYLL",
          "to": "PIGMENT",
          "options": [
            "PIGMENT",
            "ENZYME",
            "MINERAL"
          ],
          "explanation": "Chlorophyll is a pigment that gives leaves their green colour."
        }
      ]
    },
    {
      "id": "CR-S-013",
      "title": "The Digital Network",
      "start": "INTERNET",
      "links": [
        {
          "from": "INTERNET",
          "to": "SERVER",
          "options": [
            "SERVER",
            "BROWSER",
            "ROUTER"
          ],
          "explanation": "Servers host websites and services that we access through the internet."
        },
        {
          "from": "SERVER",
          "to": "DATABASE",
          "options": [
            "DATABASE",
            "INTERFACE",
            "PASSWORD"
          ],
          "explanation": "A server can store and retrieve data from a database."
        },
        {
          "from": "DATABASE",
          "to": "QUERY",
          "options": [
            "QUERY",
            "BACKUP",
            "DOWNLOAD"
          ],
          "explanation": "A user or application sends a query to a database to request specific information."
        }
      ]
    },
    {
      "id": "CR-S-014",
      "title": "The Medical Laboratory",
      "start": "LABORATORY",
      "links": [
        {
          "from": "LABORATORY",
          "to": "SPECIMEN",
          "options": [
            "SPECIMEN",
            "PRESCRIPTION",
            "SYMPTOM"
          ],
          "explanation": "A laboratory examines specimens collected from patients."
        },
        {
          "from": "SPECIMEN",
          "to": "MICROSCOPE",
          "options": [
            "MICROSCOPE",
            "STETHOSCOPE",
            "SCANNER"
          ],
          "explanation": "A specialist uses a microscope to examine tiny details in a specimen."
        },
        {
          "from": "MICROSCOPE",
          "to": "MAGNIFICATION",
          "options": [
            "MAGNIFICATION",
            "TEMPERATURE",
            "PRESSURE"
          ],
          "explanation": "Magnification makes details visible that cannot be seen with the unaided eye."
        }
      ]
    },
    {
      "id": "CR-S-015",
      "title": "The Film Industry",
      "start": "FILM",
      "links": [
        {
          "from": "FILM",
          "to": "DIRECTOR",
          "options": [
            "DIRECTOR",
            "PRODUCER",
            "EDITOR"
          ],
          "explanation": "The director guides the creative work during film production."
        },
        {
          "from": "DIRECTOR",
          "to": "STORYBOARD",
          "options": [
            "STORYBOARD",
            "SOUNDTRACK",
            "SUBTITLE"
          ],
          "explanation": "A director uses a storyboard to plan shots visually."
        },
        {
          "from": "STORYBOARD",
          "to": "SEQUENCE",
          "options": [
            "SEQUENCE",
            "CHARACTER",
            "LOCATION"
          ],
          "explanation": "A storyboard arranges shots in a visual sequence."
        }
      ]
    },
    {
      "id": "CR-S-016",
      "title": "The Banking System",
      "start": "BANK",
      "links": [
        {
          "from": "BANK",
          "to": "INTEREST",
          "options": [
            "INTEREST",
            "BALANCE",
            "TRANSFER"
          ],
          "explanation": "A bank may charge interest on loans or pay it on certain deposits."
        },
        {
          "from": "INTEREST",
          "to": "LOAN",
          "options": [
            "LOAN",
            "ACCOUNT",
            "CHEQUE"
          ],
          "explanation": "Interest is commonly charged on money borrowed as a loan."
        },
        {
          "from": "LOAN",
          "to": "REPAYMENT",
          "options": [
            "REPAYMENT",
            "WITHDRAWAL",
            "DEPOSIT"
          ],
          "explanation": "A borrower makes repayments to return the money borrowed."
        }
      ]
    },
    {
      "id": "CR-S-017",
      "title": "The Space Mission",
      "start": "SATELLITE",
      "links": [
        {
          "from": "SATELLITE",
          "to": "ORBIT",
          "options": [
            "ORBIT",
            "ATMOSPHERE",
            "GALAXY"
          ],
          "explanation": "A satellite travels around a celestial body in an orbit."
        },
        {
          "from": "ORBIT",
          "to": "PLANET",
          "options": [
            "PLANET",
            "COMET",
            "ASTEROID"
          ],
          "explanation": "Many satellites orbit a planet."
        },
        {
          "from": "PLANET",
          "to": "MASS",
          "options": [
            "MASS",
            "VELOCITY",
            "VOLUME"
          ],
          "explanation": "A planet has mass, which contributes to its gravitational pull."
        }
      ]
    },
    {
      "id": "CR-S-018",
      "title": "The Fashion Studio",
      "start": "FABRIC",
      "links": [
        {
          "from": "FABRIC",
          "to": "TEXTURE",
          "options": [
            "TEXTURE",
            "PATTERN",
            "COLOUR"
          ],
          "explanation": "Texture describes the nature of a fabric's surface when touched."
        },
        {
          "from": "TEXTURE",
          "to": "WEAVE",
          "options": [
            "WEAVE",
            "DYE",
            "PRINT"
          ],
          "explanation": "The way threads are woven affects the fabric's texture."
        },
        {
          "from": "WEAVE",
          "to": "LOOM",
          "options": [
            "LOOM",
            "NEEDLE",
            "SCISSORS"
          ],
          "explanation": "A loom is used to weave threads into fabric."
        }
      ]
    },
    {
      "id": "CR-S-019",
      "title": "The Library Archive",
      "start": "LIBRARY",
      "links": [
        {
          "from": "LIBRARY",
          "to": "CATALOGUE",
          "options": [
            "CATALOGUE",
            "SHELF",
            "COUNTER"
          ],
          "explanation": "A library catalogue helps organize and locate library resources."
        },
        {
          "from": "CATALOGUE",
          "to": "CLASSIFICATION",
          "options": [
            "CLASSIFICATION",
            "CIRCULATION",
            "RESTORATION"
          ],
          "explanation": "A catalogue's organization may classify books by subject or other features."
        },
        {
          "from": "CLASSIFICATION",
          "to": "CATEGORY",
          "options": [
            "CATEGORY",
            "EDITION",
            "AUTHOR"
          ],
          "explanation": "A category groups materials that share a subject or type."
        }
      ]
    },
    {
      "id": "CR-S-020",
      "title": "The Ocean Research",
      "start": "OCEAN",
      "links": [
        {
          "from": "OCEAN",
          "to": "CURRENT",
          "options": [
            "CURRENT",
            "WAVE",
            "TIDE"
          ],
          "explanation": "Ocean water moves in currents."
        },
        {
          "from": "CURRENT",
          "to": "DIRECTION",
          "options": [
            "DIRECTION",
            "DEPTH",
            "SALINITY"
          ],
          "explanation": "Ocean currents are described partly by the direction in which they flow."
        },
        {
          "from": "DIRECTION",
          "to": "COMPASS",
          "options": [
            "COMPASS",
            "THERMOMETER",
            "BAROMETER"
          ],
          "explanation": "A compass can be used to determine directions during sea navigation."
        }
      ]
    },
    {
      "id": "CR-S-021",
      "title": "The Construction Project",
      "start": "ARCHITECT",
      "links": [
        {
          "from": "ARCHITECT",
          "to": "BLUEPRINT",
          "options": [
            "BLUEPRINT",
            "BRICK",
            "HAMMER"
          ],
          "explanation": "An architect uses plans to show a building's design."
        },
        {
          "from": "BLUEPRINT",
          "to": "DIMENSION",
          "options": [
            "DIMENSION",
            "MATERIAL",
            "FOUNDATION"
          ],
          "explanation": "A plan specifies the dimensions of parts of a building."
        },
        {
          "from": "DIMENSION",
          "to": "SCALE",
          "options": [
            "SCALE",
            "WEIGHT",
            "HEIGHT"
          ],
          "explanation": "An architectural drawing uses a scale to represent real dimensions proportionally."
        }
      ]
    },
    {
      "id": "CR-S-022",
      "title": "The Language Classroom",
      "start": "LANGUAGE",
      "links": [
        {
          "from": "LANGUAGE",
          "to": "GRAMMAR",
          "options": [
            "GRAMMAR",
            "ACCENT",
            "VOCABULARY"
          ],
          "explanation": "Grammar organizes how sentences are formed in a language."
        },
        {
          "from": "GRAMMAR",
          "to": "RULE",
          "options": [
            "RULE",
            "EXAMPLE",
            "EXCEPTION"
          ],
          "explanation": "Grammar consists of rules that guide how language is used."
        },
        {
          "from": "RULE",
          "to": "SENTENCE",
          "options": [
            "SENTENCE",
            "PARAGRAPH",
            "DICTIONARY"
          ],
          "explanation": "Grammar rules help us form well-structured sentences."
        }
      ]
    },
    {
      "id": "CR-S-023",
      "title": "The Energy Station",
      "start": "ELECTRICITY",
      "links": [
        {
          "from": "ELECTRICITY",
          "to": "GENERATOR",
          "options": [
            "GENERATOR",
            "TRANSFORMER",
            "BATTERY"
          ],
          "explanation": "A generator converts other forms of energy into electrical energy."
        },
        {
          "from": "GENERATOR",
          "to": "TURBINE",
          "options": [
            "TURBINE",
            "CABLE",
            "SWITCH"
          ],
          "explanation": "Steam, water, or wind can turn a turbine connected to a generator."
        },
        {
          "from": "TURBINE",
          "to": "ROTATION",
          "options": [
            "ROTATION",
            "COMBUSTION",
            "CONDUCTION"
          ],
          "explanation": "The turbine's rotation drives the generator in many power stations."
        }
      ]
    },
    {
      "id": "CR-S-024",
      "title": "The Human Memory",
      "start": "MEMORY",
      "links": [
        {
          "from": "MEMORY",
          "to": "ENCODING",
          "options": [
            "ENCODING",
            "RECALL",
            "FORGETTING"
          ],
          "explanation": "Encoding is the process of turning experiences or information into a form that memory can store."
        },
        {
          "from": "ENCODING",
          "to": "INFORMATION",
          "options": [
            "INFORMATION",
            "EMOTION",
            "MOVEMENT"
          ],
          "explanation": "During encoding, the brain processes information so it can be retained."
        },
        {
          "from": "INFORMATION",
          "to": "STORAGE",
          "options": [
            "STORAGE",
            "ATTENTION",
            "REACTION"
          ],
          "explanation": "Storage refers to keeping encoded information in memory over time."
        }
      ]
    }
  ],
  "challenge": [
    {
      "id": "CR-C-001",
      "title": "The Life of a Seed",
      "start": "SEED",
      "links": [
        {
          "from": "SEED",
          "to": "GERMINATION",
          "options": [
            "GERMINATION",
            "POLLINATION",
            "HARVEST"
          ],
          "explanation": "A seed begins to grow when the conditions for germination are suitable."
        },
        {
          "from": "GERMINATION",
          "to": "RADICLE",
          "options": [
            "RADICLE",
            "PETAL",
            "FRUIT"
          ],
          "explanation": "The radicle is the first part of the embryo to emerge during germination."
        },
        {
          "from": "RADICLE",
          "to": "ROOT",
          "options": [
            "ROOT",
            "STEM",
            "LEAF"
          ],
          "explanation": "The radicle develops into the plant's primary root."
        }
      ]
    },
    {
      "id": "CR-C-002",
      "title": "Shaping the Landscape",
      "start": "GLACIER",
      "links": [
        {
          "from": "GLACIER",
          "to": "EROSION",
          "options": [
            "EROSION",
            "EVAPORATION",
            "CONDENSATION"
          ],
          "explanation": "Moving glacier ice wears away rock and reshapes the land."
        },
        {
          "from": "EROSION",
          "to": "SEDIMENT",
          "options": [
            "SEDIMENT",
            "GRANITE",
            "CRYSTAL"
          ],
          "explanation": "Erosion produces fragments of rock and material that can be transported as sediment."
        },
        {
          "from": "SEDIMENT",
          "to": "DELTA",
          "options": [
            "DELTA",
            "CAVERN",
            "CRATER"
          ],
          "explanation": "Sediment deposited by a river can gradually build a delta where it enters a larger body of water."
        }
      ]
    },
    {
      "id": "CR-C-003",
      "title": "From Draft to Publication",
      "start": "MANUSCRIPT",
      "links": [
        {
          "from": "MANUSCRIPT",
          "to": "EDITOR",
          "options": [
            "EDITOR",
            "READER",
            "PRINTER"
          ],
          "explanation": "An editor reviews a manuscript and helps prepare it for publication."
        },
        {
          "from": "EDITOR",
          "to": "PROOFREADING",
          "options": [
            "PROOFREADING",
            "TRANSLATION",
            "BINDING"
          ],
          "explanation": "After editing, proofreading checks the text for remaining errors."
        },
        {
          "from": "PROOFREADING",
          "to": "TYPO",
          "options": [
            "TYPO",
            "CHAPTER",
            "PREFACE"
          ],
          "explanation": "Proofreading aims to catch typographical errors before publication."
        }
      ]
    },
    {
      "id": "CR-C-004",
      "title": "Inside a Volcano",
      "start": "VOLCANO",
      "links": [
        {
          "from": "VOLCANO",
          "to": "MAGMA",
          "options": [
            "MAGMA",
            "ASH",
            "CRUST"
          ],
          "explanation": "Magma is molten rock beneath the Earth's surface."
        },
        {
          "from": "MAGMA",
          "to": "LAVA",
          "options": [
            "LAVA",
            "MINERAL",
            "FOSSIL"
          ],
          "explanation": "Magma that reaches the surface is called lava."
        },
        {
          "from": "LAVA",
          "to": "BASALT",
          "options": [
            "BASALT",
            "MARBLE",
            "LIMESTONE"
          ],
          "explanation": "Basalt commonly forms when lava cools and solidifies."
        }
      ]
    },
    {
      "id": "CR-C-005",
      "title": "The Body's Defence",
      "start": "VACCINE",
      "links": [
        {
          "from": "VACCINE",
          "to": "IMMUNITY",
          "options": [
            "IMMUNITY",
            "INFECTION",
            "INFLAMMATION"
          ],
          "explanation": "Vaccination trains the immune system to recognize a target and develop protection."
        },
        {
          "from": "IMMUNITY",
          "to": "ANTIBODY",
          "options": [
            "ANTIBODY",
            "HORMONE",
            "ENZYME"
          ],
          "explanation": "The immune system can produce antibodies that recognize specific targets."
        },
        {
          "from": "ANTIBODY",
          "to": "ANTIGEN",
          "options": [
            "ANTIGEN",
            "TISSUE",
            "PLASMA"
          ],
          "explanation": "An antigen is the substance or structure that an antibody can specifically recognize."
        }
      ]
    },
    {
      "id": "CR-C-006",
      "title": "Understanding Sound",
      "start": "SOUND",
      "links": [
        {
          "from": "SOUND",
          "to": "VIBRATION",
          "options": [
            "VIBRATION",
            "REFLECTION",
            "ABSORPTION"
          ],
          "explanation": "Sound is produced by vibrations that travel through a medium."
        },
        {
          "from": "VIBRATION",
          "to": "FREQUENCY",
          "options": [
            "FREQUENCY",
            "AMPLITUDE",
            "VELOCITY"
          ],
          "explanation": "Frequency describes how many vibrations occur each second."
        },
        {
          "from": "FREQUENCY",
          "to": "PITCH",
          "options": [
            "PITCH",
            "ECHO",
            "VOLUME"
          ],
          "explanation": "The frequency of a sound wave is closely related to the pitch we hear."
        }
      ]
    },
    {
      "id": "CR-C-007",
      "title": "Looking Through a Telescope",
      "start": "REFRACTING TELESCOPE",
      "links": [
        {
          "from": "REFRACTING TELESCOPE",
          "to": "LENS",
          "options": [
            "LENS",
            "MIRROR",
            "TRIPOD"
          ],
          "explanation": "A refracting telescope uses lenses to gather and focus light."
        },
        {
          "from": "LENS",
          "to": "FOCAL LENGTH",
          "options": [
            "FOCAL LENGTH",
            "DIAMETER",
            "THICKNESS"
          ],
          "explanation": "The focal length describes the distance over which a lens brings light to focus."
        },
        {
          "from": "FOCAL LENGTH",
          "to": "MAGNIFICATION",
          "options": [
            "MAGNIFICATION",
            "REFLECTION",
            "TRANSPARENCY"
          ],
          "explanation": "A telescope's magnification depends on the relationship between its objective and eyepiece focal lengths."
        }
      ]
    },
    {
      "id": "CR-C-008",
      "title": "Managing a Drought",
      "start": "DROUGHT",
      "links": [
        {
          "from": "DROUGHT",
          "to": "RESERVOIR",
          "options": [
            "RESERVOIR",
            "WATERFALL",
            "ESTUARY"
          ],
          "explanation": "A reservoir stores water that can be used during periods of low rainfall."
        },
        {
          "from": "RESERVOIR",
          "to": "DAM",
          "options": [
            "DAM",
            "CANAL",
            "AQUEDUCT"
          ],
          "explanation": "A dam can hold back water to create or maintain a reservoir."
        },
        {
          "from": "DAM",
          "to": "SPILLWAY",
          "options": [
            "SPILLWAY",
            "TURBINE",
            "FILTER"
          ],
          "explanation": "A spillway safely releases excess water from a dam."
        }
      ]
    },
    {
      "id": "CR-C-009",
      "title": "From Code to Execution",
      "start": "SOURCE CODE",
      "links": [
        {
          "from": "SOURCE CODE",
          "to": "COMPILER",
          "options": [
            "COMPILER",
            "BROWSER",
            "KEYBOARD"
          ],
          "explanation": "A compiler translates source code into another form that a computer can process."
        },
        {
          "from": "COMPILER",
          "to": "BYTECODE",
          "options": [
            "BYTECODE",
            "PIXEL",
            "DATABASE"
          ],
          "explanation": "Some compilers produce an intermediate instruction format called bytecode."
        },
        {
          "from": "BYTECODE",
          "to": "VIRTUAL MACHINE",
          "options": [
            "VIRTUAL MACHINE",
            "OPERATING SYSTEM",
            "ROUTER"
          ],
          "explanation": "A virtual machine can execute bytecode in a managed runtime environment."
        }
      ]
    },
    {
      "id": "CR-C-010",
      "title": "The Journey of Pollen",
      "start": "POLLINATION",
      "links": [
        {
          "from": "POLLINATION",
          "to": "STIGMA",
          "options": [
            "STIGMA",
            "PETAL",
            "SEPAL"
          ],
          "explanation": "In flowering plants, pollen commonly lands on the stigma during pollination."
        },
        {
          "from": "STIGMA",
          "to": "POLLEN TUBE",
          "options": [
            "POLLEN TUBE",
            "ROOT HAIR",
            "LEAF VEIN"
          ],
          "explanation": "After compatible pollen germinates, it can grow a pollen tube through the style."
        },
        {
          "from": "POLLEN TUBE",
          "to": "OVULE",
          "options": [
            "OVULE",
            "ANTHER",
            "FILAMENT"
          ],
          "explanation": "The pollen tube carries the male gametes toward the ovule, where fertilization can occur."
        }
      ]
    },
    {
      "id": "CR-C-011",
      "title": "Measuring a Population",
      "start": "CENSUS",
      "links": [
        {
          "from": "CENSUS",
          "to": "POPULATION",
          "options": [
            "POPULATION",
            "TERRITORY",
            "ECONOMY"
          ],
          "explanation": "A census counts and collects information about the people in a defined area."
        },
        {
          "from": "POPULATION",
          "to": "DENSITY",
          "options": [
            "DENSITY",
            "DIVERSITY",
            "MOBILITY"
          ],
          "explanation": "Population density relates the number of people to the area they occupy."
        },
        {
          "from": "DENSITY",
          "to": "URBAN PLANNING",
          "options": [
            "URBAN PLANNING",
            "ISOLATION",
            "IRRIGATION"
          ],
          "explanation": "Population density data helps planners decide how cities should allocate housing, transport, and public services."
        }
      ]
    },
    {
      "id": "CR-C-012",
      "title": "A Contract in Action",
      "start": "CONTRACT",
      "links": [
        {
          "from": "CONTRACT",
          "to": "CLAUSE",
          "options": [
            "CLAUSE",
            "SIGNATURE",
            "WITNESS"
          ],
          "explanation": "A contract is made up of provisions or clauses that set out its terms."
        },
        {
          "from": "CLAUSE",
          "to": "OBLIGATION",
          "options": [
            "OBLIGATION",
            "PERMISSION",
            "SUGGESTION"
          ],
          "explanation": "A clause may establish a duty that one or more parties must fulfil."
        },
        {
          "from": "OBLIGATION",
          "to": "PERFORMANCE",
          "options": [
            "PERFORMANCE",
            "NEGOTIATION",
            "TERMINATION"
          ],
          "explanation": "Contractual performance means carrying out the obligations agreed upon."
        }
      ]
    },
    {
      "id": "CR-C-013",
      "title": "The Science of Fermentation",
      "start": "FERMENTATION",
      "links": [
        {
          "from": "FERMENTATION",
          "to": "YEAST",
          "options": [
            "YEAST",
            "OXYGEN",
            "STARCH"
          ],
          "explanation": "Yeast is a microorganism commonly used to ferment sugars."
        },
        {
          "from": "YEAST",
          "to": "ETHANOL",
          "options": [
            "ETHANOL",
            "GLUCOSE",
            "PROTEIN"
          ],
          "explanation": "In alcoholic fermentation, yeast converts sugars into ethanol and carbon dioxide."
        },
        {
          "from": "ETHANOL",
          "to": "DISTILLATION",
          "options": [
            "DISTILLATION",
            "FILTRATION",
            "CRYSTALLIZATION"
          ],
          "explanation": "Distillation can separate and concentrate ethanol from a fermented mixture."
        }
      ]
    },
    {
      "id": "CR-C-014",
      "title": "Life in an Ecosystem",
      "start": "ECOSYSTEM",
      "links": [
        {
          "from": "ECOSYSTEM",
          "to": "NICHE",
          "options": [
            "NICHE",
            "CLIMATE",
            "CONTINENT"
          ],
          "explanation": "An ecological niche describes the role of a species and how it interacts with its environment."
        },
        {
          "from": "NICHE",
          "to": "COMPETITION",
          "options": [
            "COMPETITION",
            "MIGRATION",
            "MUTATION"
          ],
          "explanation": "Species may compete when their niches overlap and they require the same limited resources."
        },
        {
          "from": "COMPETITION",
          "to": "ADAPTATION",
          "options": [
            "ADAPTATION",
            "EXTINCTION",
            "HIBERNATION"
          ],
          "explanation": "Adaptations can help organisms survive and reproduce under particular environmental conditions."
        }
      ]
    },
    {
      "id": "CR-C-015",
      "title": "Protecting a Secret",
      "start": "ENCRYPTION",
      "links": [
        {
          "from": "ENCRYPTION",
          "to": "CIPHER",
          "options": [
            "CIPHER",
            "PASSWORD",
            "FIREWALL"
          ],
          "explanation": "A cipher is a method or algorithm used to transform readable information into encrypted form."
        },
        {
          "from": "CIPHER",
          "to": "KEY",
          "options": [
            "KEY",
            "MESSAGE",
            "SERVER"
          ],
          "explanation": "An encryption key controls the transformation performed by a cipher."
        },
        {
          "from": "KEY",
          "to": "DECRYPTION",
          "options": [
            "DECRYPTION",
            "COMPRESSION",
            "DUPLICATION"
          ],
          "explanation": "Decryption uses the appropriate key and method to recover readable information."
        }
      ]
    },
    {
      "id": "CR-C-016",
      "title": "From Fibre to Fabric",
      "start": "TEXTILE",
      "links": [
        {
          "from": "TEXTILE",
          "to": "FIBRE",
          "options": [
            "FIBRE",
            "BUTTON",
            "PATTERN"
          ],
          "explanation": "Textiles are made from fibres, which can be natural or synthetic."
        },
        {
          "from": "FIBRE",
          "to": "SPINNING",
          "options": [
            "SPINNING",
            "DYEING",
            "PRINTING"
          ],
          "explanation": "Spinning twists fibres together to produce yarn."
        },
        {
          "from": "SPINNING",
          "to": "YARN",
          "options": [
            "YARN",
            "NEEDLE",
            "LOOM"
          ],
          "explanation": "Yarn is the continuous strand produced by spinning and used to make fabric."
        }
      ]
    },
    {
      "id": "CR-C-017",
      "title": "Recording an Earthquake",
      "start": "EARTHQUAKE",
      "links": [
        {
          "from": "EARTHQUAKE",
          "to": "SEISMOGRAPH",
          "options": [
            "SEISMOGRAPH",
            "THERMOMETER",
            "BAROMETER"
          ],
          "explanation": "A seismograph records ground motion caused by seismic waves."
        },
        {
          "from": "SEISMOGRAPH",
          "to": "SEISMOGRAM",
          "options": [
            "SEISMOGRAM",
            "MAP",
            "TIMELINE"
          ],
          "explanation": "The recorded trace produced by a seismograph is called a seismogram."
        },
        {
          "from": "SEISMOGRAM",
          "to": "MAGNITUDE",
          "options": [
            "MAGNITUDE",
            "ALTITUDE",
            "LATITUDE"
          ],
          "explanation": "Scientists use seismic recordings to help determine an earthquake's magnitude."
        }
      ]
    },
    {
      "id": "CR-C-018",
      "title": "The Architecture of a Coral Reef",
      "start": "CORAL REEF",
      "links": [
        {
          "from": "CORAL REEF",
          "to": "POLYP",
          "options": [
            "POLYP",
            "PLANKTON",
            "MOLLUSK"
          ],
          "explanation": "Reef-building corals are colonies of tiny animals called polyps."
        },
        {
          "from": "POLYP",
          "to": "COLONY",
          "options": [
            "COLONY",
            "SHELL",
            "SKELETON"
          ],
          "explanation": "Many coral polyps live together and form a colony."
        },
        {
          "from": "COLONY",
          "to": "CALCIUM CARBONATE",
          "options": [
            "CALCIUM CARBONATE",
            "CARTILAGE",
            "CELLULOSE"
          ],
          "explanation": "Coral colonies build their hard structures by depositing calcium carbonate."
        }
      ]
    },
    {
      "id": "CR-C-019",
      "title": "Reaching an Agreement",
      "start": "NEGOTIATION",
      "links": [
        {
          "from": "NEGOTIATION",
          "to": "COMPROMISE",
          "options": [
            "COMPROMISE",
            "COMPETITION",
            "DEBATE"
          ],
          "explanation": "Negotiating parties may reach an agreement by making concessions."
        },
        {
          "from": "COMPROMISE",
          "to": "CONCESSION",
          "options": [
            "CONCESSION",
            "DEMAND",
            "OBJECTION"
          ],
          "explanation": "A compromise often involves each side giving up something it initially wanted."
        },
        {
          "from": "CONCESSION",
          "to": "RECIPROCITY",
          "options": [
            "RECIPROCITY",
            "AUTHORITY",
            "SECRECY"
          ],
          "explanation": "Reciprocity describes a mutual exchange in which concessions or benefits are returned by the other side."
        }
      ]
    },
    {
      "id": "CR-C-020",
      "title": "Reading the Light of Stars",
      "start": "ASTRONOMY",
      "links": [
        {
          "from": "ASTRONOMY",
          "to": "SPECTRUM",
          "options": [
            "SPECTRUM",
            "ORBIT",
            "CONSTELLATION"
          ],
          "explanation": "Astronomers analyse the spectrum of light received from stars and other celestial objects."
        },
        {
          "from": "SPECTRUM",
          "to": "WAVELENGTH",
          "options": [
            "WAVELENGTH",
            "BRIGHTNESS",
            "DISTANCE"
          ],
          "explanation": "A spectrum separates light according to its wavelengths."
        },
        {
          "from": "WAVELENGTH",
          "to": "REDSHIFT",
          "options": [
            "REDSHIFT",
            "ECLIPSE",
            "REFLECTION"
          ],
          "explanation": "A shift toward longer wavelengths can indicate that an astronomical object is moving away from the observer."
        }
      ]
    },
    {
      "id": "CR-C-021",
      "title": "Understanding Insurance",
      "start": "INSURANCE",
      "links": [
        {
          "from": "INSURANCE",
          "to": "PREMIUM",
          "options": [
            "PREMIUM",
            "DIVIDEND",
            "SALARY"
          ],
          "explanation": "A premium is the amount paid to maintain an insurance policy."
        },
        {
          "from": "PREMIUM",
          "to": "CLAIM",
          "options": [
            "CLAIM",
            "CONTRACT",
            "RECEIPT"
          ],
          "explanation": "A policyholder submits a claim when requesting coverage for a loss or event."
        },
        {
          "from": "CLAIM",
          "to": "INDEMNITY",
          "options": [
            "INDEMNITY",
            "INVESTMENT",
            "INTEREST"
          ],
          "explanation": "Indemnity is the principle of compensating an insured party for a covered loss, subject to the policy's terms."
        }
      ]
    },
    {
      "id": "CR-C-022",
      "title": "The Language of Literature",
      "start": "METAPHOR",
      "links": [
        {
          "from": "METAPHOR",
          "to": "FIGURATIVE LANGUAGE",
          "options": [
            "FIGURATIVE LANGUAGE",
            "GRAMMAR",
            "PUNCTUATION"
          ],
          "explanation": "A metaphor is a form of figurative language that describes one thing in terms of another."
        },
        {
          "from": "FIGURATIVE LANGUAGE",
          "to": "IMAGERY",
          "options": [
            "IMAGERY",
            "SYNTAX",
            "RHYTHM"
          ],
          "explanation": "Metaphors can create imagery by helping readers picture or sense an idea."
        },
        {
          "from": "IMAGERY",
          "to": "SYMBOLISM",
          "options": [
            "SYMBOLISM",
            "NARRATION",
            "ALLITERATION"
          ],
          "explanation": "Imagery can contribute to symbolism when an image represents a deeper idea or meaning."
        }
      ]
    },
    {
      "id": "CR-C-023",
      "title": "Preserving Historical Evidence",
      "start": "ARCHIVE",
      "links": [
        {
          "from": "ARCHIVE",
          "to": "CONSERVATION",
          "options": [
            "CONSERVATION",
            "EXCAVATION",
            "RECONSTRUCTION"
          ],
          "explanation": "Archives preserve documents and records through conservation practices."
        },
        {
          "from": "CONSERVATION",
          "to": "HUMIDITY",
          "options": [
            "ACIDITY",
            "HUMIDITY",
            "SALINITY"
          ],
          "explanation": "Humidity levels must be controlled because excessive moisture can damage many archival materials."
        },
        {
          "from": "HUMIDITY",
          "to": "MOLD",
          "options": [
            "MOLD",
            "STATIC",
            "DUST"
          ],
          "explanation": "Excessive humidity in archival storage can encourage mold growth and damage documents."
        }
      ]
    },
    {
      "id": "CR-C-024",
      "title": "The Logic of a Scientific Study",
      "start": "HYPOTHESIS",
      "links": [
        {
          "from": "HYPOTHESIS",
          "to": "PREDICTION",
          "options": [
            "PREDICTION",
            "OBSERVATION",
            "MEASUREMENT"
          ],
          "explanation": "A hypothesis can be used to derive a prediction that can be tested."
        },
        {
          "from": "PREDICTION",
          "to": "EXPERIMENT",
          "options": [
            "EXPERIMENT",
            "THEORY",
            "OPINION"
          ],
          "explanation": "An experiment tests a prediction under controlled or systematically observed conditions."
        },
        {
          "from": "EXPERIMENT",
          "to": "REPRODUCIBILITY",
          "options": [
            "REPRODUCIBILITY",
            "SPECULATION",
            "GENERALIZATION"
          ],
          "explanation": "Reproducibility means that other researchers can obtain consistent results when repeating the study under the same conditions."
        }
      ]
    }
  ]
};

  function validateBank() {
    const errors = [];
    const ids = new Set();
    let totalChallenges = 0;
    let totalLinks = 0;
    MODES.forEach(mode => {
      const rounds = DATA[mode];
      if (!Array.isArray(rounds) || rounds.length !== 24) {
        errors.push(mode + ' must contain exactly 24 challenges');
        return;
      }
      rounds.forEach((item, index) => {
        totalChallenges++;
        const prefix = 'CR-' + mode[0].toUpperCase() + '-';
        if (typeof item.id !== 'string' || !item.id.startsWith(prefix)) errors.push(mode + ' challenge ' + (index + 1) + ' has an invalid ID');
        if (ids.has(item.id)) errors.push('Duplicate challenge ID: ' + item.id);
        ids.add(item.id);
        if (!item.title || !item.start || !Array.isArray(item.links) || item.links.length !== 3) errors.push(item.id + ' needs a title, start, and exactly three links');
        let previous = item.start;
        (item.links || []).forEach((link, linkIndex) => {
          totalLinks++;
          if (link.from !== previous) errors.push(item.id + ' link ' + (linkIndex + 1) + ' breaks chain continuity');
          if (!link.to || !link.explanation || !link.explanation.trim()) errors.push(item.id + ' link ' + (linkIndex + 1) + ' is incomplete');
          if (!Array.isArray(link.options) || link.options.length !== 3) errors.push(item.id + ' link ' + (linkIndex + 1) + ' must have exactly three options');
          else {
            if (new Set(link.options).size !== 3) errors.push(item.id + ' link ' + (linkIndex + 1) + ' options must be unique');
            if (link.options.filter(option => option === link.to).length !== 1) errors.push(item.id + ' link ' + (linkIndex + 1) + ' must contain its answer exactly once');
          }
          previous = link.to;
        });
      });
    });
    if (totalChallenges !== 72) errors.push('The bank must contain exactly 72 challenges');
    if (totalLinks !== 216) errors.push('The bank must contain exactly 216 links');
    return { valid: errors.length === 0, totalChallenges, totalLinks, errors };
  }

  function getRounds(mode) {
    if (!MODES.includes(mode)) return [];
    return DATA[mode].map(item => ({
      ...item,
      links: item.links.map(link => ({ ...link, options: link.options.slice() }))
    }));
  }

  function selectRound(mode, random = Math.random) {
    const rounds = getRounds(mode);
    for (let i = rounds.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [rounds[i], rounds[j]] = [rounds[j], rounds[i]];
    }
    return rounds.map(item => ({
      ...item,
      links: item.links.map(link => {
        const options = link.options.slice();
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        return { ...link, options, answer: options.indexOf(link.to) };
      })
    }));
  }

  window.EPIPHANY_CHAIN_REACTION_BANK = Object.freeze({
    schemaVersion: 1,
    gameId: 'chain-reaction',
    modes: MODES,
    getRounds,
    selectRound,
    validateBank
  });
})();
