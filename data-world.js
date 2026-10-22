/* Tiny top-down village: 20 columns × 14 rows; each character is one 32px logical tile. */
const WORLD_DATA = {
  tileSize: 32,
  width: 20,
  height: 14,
  start: {x:2,y:2},
  map: [
    "GGGGGGGGGGGGGGGGGGGG",
    "GGTTGGGGGGHHHGGGGTTG",
    "GGTTGGGGGGHHHGGGGTTG",
    "GGGGGGGGGGGGGGGGGGGG",
    "GGGGGGRRRRRRRRGGGGGG",
    "GGGGGGRGGGGGGRGGGGGG",
    "GGGGGGRGGWWGGRGGGGGG",
    "GGGGGGRBBBBBGRGGGGGG",
    "GGGGGGRGGWWGGRGGGGGG",
    "GGGGGGRGGGGGGRGGGGGG",
    "GGGGGGRRRRRRRRGGGGGG",
    "GGGGGGGGGGGGGGGGGGGG",
    "GGTTGGGGGGGGGGGGTTGG",
    "GGTTGGGGGGGGGGGGTTGG"
  ],
  objects: [
    {id:"tree-north",name:"tree",x:2,y:1,emoji:"🌳",solid:true},
    {id:"tree-west",name:"tree",x:2,y:12,emoji:"🌳",solid:true},
    {id:"tree-east",name:"tree",x:17,y:12,emoji:"🌳",solid:true},
    {id:"red-house",name:"red house",x:10,y:2,emoji:"🏠",color:"red",solid:true},
    {id:"blue-house",name:"blue house",x:15,y:2,emoji:"🏡",color:"blue",solid:true},
    {id:"bridge",name:"bridge",x:9,y:7,emoji:"🌉",solid:false},
    {id:"river",name:"river",x:9,y:6,emoji:"🌊",solid:true},
    {id:"baker",name:"baker",x:13,y:10,emoji:"🧑‍🍳",solid:false,person:true},
    {id:"door",name:"door",x:10,y:3,emoji:"🚪",solid:false},
    {id:"key",name:"key",x:4,y:9,emoji:"🔑",solid:false,pickup:true},
    {id:"basket",name:"basket",x:16,y:9,emoji:"🧺",solid:false,pickup:true},
    {id:"north-tree",name:"tree",x:16,y:1,emoji:"🌳",solid:true}
  ],
  tasks: [
    {id:"world-a1-tree",level:"A1",instruction:"Go to the tree.",ar:"اذهب إلى الشجرة.",check:{type:"near",object:"tree-north"},hint:"Find the tree near the top-left corner.",words:[["tree","a tall plant with a trunk and branches","A1"],["near","close to something","A1"]]},
    {id:"world-a1-house",level:"A1",instruction:"Go to the red house.",ar:"اذهب إلى البيت الأحمر.",check:{type:"near",object:"red-house"},hint:"Walk along the path and stop next to the red house.",words:[["red","the colour of ripe tomatoes","A1"],["house","a building where people live","A1"]]},
    {id:"world-a1-baker",level:"A1",instruction:"Go to the baker.",ar:"اذهب إلى الخبّاز.",check:{type:"near",object:"baker"},hint:"The baker is near the bottom-right path.",words:[["baker","a person who makes bread and cakes","A1"],["go","move to another place","A1"]]},
    {id:"world-a2-under",level:"A2",instruction:"Go under the bridge.",ar:"اذهب إلى أسفل الجسر.",check:{type:"under",object:"bridge"},hint:"Stand on the path directly below the bridge.",words:[["under","below something","A2"],["bridge","a structure built over water or a road","A2"]]},
    {id:"world-a2-between",level:"A2",instruction:"Stand between the two trees.",ar:"قف بين الشجرتين.",check:{type:"between",objects:["tree-west","tree-east"]},hint:"Stand halfway between the trees at the bottom of the village.",words:[["between","in the space separating two things","A2"],["stand","be upright on your feet","A1"]]},
    {id:"world-a2-behind",level:"A2",instruction:"Walk behind the red house.",ar:"امشِ خلف البيت الأحمر.",check:{type:"behind",object:"red-house"},hint:"Go to the tile directly below the red house.",words:[["behind","at the back of something","A2"],["walk","move on foot","A1"]]},
    {id:"world-a2-pickup",level:"A2",instruction:"Pick up the key.",ar:"التقط المفتاح.",check:{type:"pickup",object:"key"},hint:"Find the small key on the grass near the left side.",words:[["pick up","lift something from a surface","A2"],["key","a small object used to open a lock","A1"]]},
    {id:"world-a2-door",level:"A2",instruction:"Pick up the key, then go to the door.",ar:"التقط المفتاح، ثم اذهب إلى الباب.",check:{type:"sequence",steps:[{type:"pickup",object:"key"},{type:"near",object:"door"}]},hint:"First collect the key, then walk to the red house door.",words:[["then","after that","A1"],["door","a way to enter or leave a building","A1"]]},
    {id:"world-a2-basket",level:"A2",instruction:"Pick up the basket and give it to the baker.",ar:"التقط السلة وأعطها للخبّاز.",check:{type:"sequence",steps:[{type:"pickup",object:"basket"},{type:"give",item:"basket",person:"baker"}]},hint:"Collect the basket on the right, then stand next to the baker and press Space.",words:[["basket","a container used to carry things","A2"],["give","hand something to someone","A1"]]},
    {id:"world-a2-on",level:"A2",instruction:"Stand on the bridge.",ar:"قف على الجسر.",check:{type:"on",object:"bridge"},hint:"The bridge crosses the river in the middle. Step onto its wooden tiles.",words:[["on","touching or supported by a surface","A1"],["river","a natural stream of flowing water","A1"]]}
  ]
};