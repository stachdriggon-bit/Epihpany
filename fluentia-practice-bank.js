/* Fluentia speaking and dictation samples, a focused Fluentia content bank. */
(() => {
  'use strict';
  const samples = [
    {level:'A1', text:'I would like a glass of water, please.'},
    {level:'A1', text:'Could you help me find the train station?'},
    {level:'A2', text:'I usually practise English for ten minutes every day.'},
    {level:'A2', text:'The weather was sunny, so we walked to the park.'},
    {level:'B1', text:'Although I was nervous, I introduced myself to the group.'},
    {level:'B1', text:'I have been learning English because I want to travel.'},
    {level:'B2', text:'If I had more time, I would listen to a different accent each week.'},
    {level:'B2', text:'The most useful way to improve is to practise a little and often.'}
  ];
  if (typeof window !== 'undefined' && typeof window.EPIPHANY_FLUENTIA_REGISTER_SOURCES === 'function') {
    window.EPIPHANY_FLUENTIA_REGISTER_SOURCES({
      practiceSamples: samples.map((item, index) => ({
        ...item, id: 'PL-' + item.level + '-' + String(index + 1).padStart(2, '0')
      }))
    });
  }
})();
