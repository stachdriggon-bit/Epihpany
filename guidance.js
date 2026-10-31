/* EPIPHANY progressive guidance — lightweight, resumable first-visit tour. */
(() => {
  'use strict';
  const STORAGE_KEY = 'epiphany-guidance-v1';
  const VERSION = 1;
  const STEPS = [
    { en: ['Home', 'Your starting point. Return here whenever you want a clear next step.'], ar: ['الرئيسية', 'نقطة انطلاقك. عُد إلى هنا متى أردت معرفة الخطوة التالية.'] },
    { en: ['Learn', 'Build your English through Stories, Words, Life Skills and personal tools.'], ar: ['تعلّم', 'طوّر لغتك عبر القصص والمفردات والمهارات الحياتية وأدواتك الشخصية.'] },
    { en: ['Play', 'Practise with quick games and thoughtful language challenges.'], ar: ['العب', 'تدرّب من خلال الألعاب السريعة وتحديات اللغة والتفكير.'] },
    { en: ['Collect', 'Discover cards and keep the ones you have collected.'], ar: ['اجمع', 'اكتشف البطاقات واحتفظ بما تجمعه منها.'] },
    { en: ['Discover', 'Explore the World, Codex and the mysteries of The Resonance.'], ar: ['اكتشف', 'استكشف العالم وسجلات Codex وألغاز The Resonance.'] },
    { en: ['Me', 'Follow your progress, celebrate trophies and manage your profile.'], ar: ['مساحتي', 'تابع تقدمك واحتفل بإنجازاتك وأدر ملفك الشخصي.'] }
  ];
  const copy = {
    en: { kicker:'A QUICK TOUR', intro:'A few pointers to help you find your way around. You can explore freely at any time.', back:'Back', next:'Next', done:'Finish tour', skip:'Skip tour', close:'Close tour', count:(n)=>'Step '+n+' of '+STEPS.length },
    ar: { kicker:'جولة سريعة', intro:'إرشادات بسيطة تساعدك على اكتشاف التطبيق. يمكنك الاستكشاف بحرية في أي وقت.', back:'السابق', next:'التالي', done:'إنهاء الجولة', skip:'تخطي الجولة', close:'إغلاق الجولة', count:(n)=>'الخطوة '+n+' من '+STEPS.length }
  };
  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version:VERSION, activityCompleted:false, status:'not-started', step:0, tipsSeen:[] };
      const value = JSON.parse(raw);
      if (!value || value.version !== VERSION) return { version:VERSION, activityCompleted:false, status:'not-started', step:0, tipsSeen:[] };
      return {
        version:VERSION,
        activityCompleted:value.activityCompleted === true,
        status:['not-started','in-progress','skipped','completed'].includes(value.status) ? value.status : 'not-started',
        step:Number.isInteger(value.step) ? Math.max(0,Math.min(STEPS.length-1,value.step)) : 0,
        tipsSeen:Array.isArray(value.tipsSeen) ? value.tipsSeen.filter(item => typeof item === 'string') : []
      };
    } catch (_) { return { version:VERSION, activityCompleted:false, status:'not-started', step:0, tipsSeen:[] }; }
  }
  let state = readState();
  let overlay = null;
  let returnFocus = null;
  let language = 'en';
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function helpLanguage() {
    try { return localStorage.getItem('epiphany-help-language-choice') === 'ar' ? 'ar' : 'en'; } catch (_) { return 'en'; }
  }
  function activeHome() {
    const home = document.getElementById('home-view');
    return !!home && home.classList.contains('is-active');
  }
  function build() {
    if (overlay) return;
    overlay = document.createElement('section');
    overlay.className = 'guidance-overlay';
    overlay.id = 'epiphany-guidance';
    overlay.hidden = true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','guidance-title');
    overlay.innerHTML = '<div class="guidance-backdrop" data-guidance-close></div><div class="guidance-card" dir="auto"><button class="guidance-close" type="button" data-guidance-close aria-label="Close tour">×</button><p class="guidance-kicker" data-guidance-kicker></p><p class="guidance-count" data-guidance-count></p><h2 id="guidance-title" tabindex="-1"></h2><p class="guidance-intro" data-guidance-intro></p><div class="guidance-progress" aria-hidden="true"><span></span></div><div class="guidance-actions"><button type="button" class="guidance-skip" data-guidance-skip></button><div><button type="button" class="guidance-back" data-guidance-back></button><button type="button" class="guidance-next" data-guidance-next></button></div></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', event => {
      if (event.target.closest('[data-guidance-close]')) close('skipped');
      if (event.target.closest('[data-guidance-skip]')) close('skipped');
      if (event.target.closest('[data-guidance-back]')) move(-1);
      if (event.target.closest('[data-guidance-next]')) move(1);
    });
    document.addEventListener('keydown', onKeydown);
  }
  function render() {
    if (!overlay) return;
    const ar = language === 'ar', strings = copy[language], step = STEPS[state.step][language];
    overlay.dir = ar ? 'rtl' : 'ltr';
    overlay.querySelector('.guidance-kicker').textContent = strings.kicker;
    overlay.querySelector('.guidance-count').textContent = strings.count(state.step+1);
    overlay.querySelector('#guidance-title').textContent = step[0];
    overlay.querySelector('[data-guidance-intro]').textContent = state.step === 0 ? step[1] + ' ' + strings.intro : step[1];
    overlay.querySelector('.guidance-progress span').style.width = ((state.step+1)/STEPS.length*100)+'%';
    overlay.querySelector('[data-guidance-back]').textContent = strings.back;
    overlay.querySelector('[data-guidance-back]').hidden = state.step === 0;
    overlay.querySelector('[data-guidance-next]').textContent = state.step === STEPS.length-1 ? strings.done : strings.next;
    overlay.querySelector('[data-guidance-skip]').textContent = strings.skip;
    overlay.querySelector('.guidance-close').setAttribute('aria-label',strings.close);
  }
  function start(options) {
    options = options || {};
    if (state.status === 'completed' && !options.restart) return false;
    language = helpLanguage();
    build();
    returnFocus = document.activeElement;
    state.status = 'in-progress';
    if (options.restart) state.step = 0;
    persist();
    render();
    overlay.hidden = false;
    document.body.classList.add('guidance-open');
    overlay.querySelector('#guidance-title').focus({preventScroll:true});
    return true;
  }
  function close(status) {
    if (!overlay || overlay.hidden) return;
    state.status = status === 'completed' ? 'completed' : 'skipped';
    persist();
    overlay.hidden = true;
    document.body.classList.remove('guidance-open');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll:true});
  }
  function move(delta) {
    state.step = Math.max(0,Math.min(STEPS.length-1,state.step+delta));
    if (state.step === STEPS.length-1 && delta > 0) { close('completed'); return; }
    persist(); render();
    overlay.querySelector('#guidance-title').focus({preventScroll:true});
  }
  function onKeydown(event) {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close('skipped'); return; }
    if (event.key === 'Tab') {
      const controls = Array.from(overlay.querySelectorAll('button:not([hidden])'));
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  document.addEventListener('epiphany:activity-completed', () => {
    state.activityCompleted = true;
    persist();
  });
  function maybeStartAfterReturn() {
    window.setTimeout(() => {
      const game = document.getElementById('game');
      const gameIsClosed = !game || game.hidden;
      if (state.activityCompleted && state.status === 'not-started' && activeHome() && gameIsClosed) start();
    }, 0);
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-view="home"], #logo, #game-close')) maybeStartAfterReturn();
  });

  const CONTEXT_TIPS = {
    stories: { en:['A gentle starting point','Try a short story first. Your choices shape the path, and you can revisit stories later.'], ar:['بداية هادئة','ابدأ بقصة قصيرة. اختياراتك تؤثر في مسارها، ويمكنك العودة إلى القصص لاحقًا.'] },
    words: { en:['Your word vault','Words you save appear here. Review the ones that are due whenever you have a moment.'], ar:['خزنة مفرداتك','تظهر هنا الكلمات التي تحفظها. راجع الكلمات المستحقة عندما يتوفر لديك بعض الوقت.'] },
    lifeskills: { en:['English for everyday life','Practise useful language for real situations, one scenario at a time.'], ar:['الإنجليزية للحياة اليومية','تدرّب على لغة مفيدة لمواقف واقعية، سيناريو واحدًا في كل مرة.'] },
    mytools: { en:['Your personal toolkit','Save words and notes you meet outside the app. The context will help you remember them.'], ar:['أدواتك الشخصية','احفظ الكلمات والملاحظات التي تصادفها خارج التطبيق؛ فالسياق يساعدك على تذكرها.'] },
    arcade: { en:['Choose your kind of practice','Pick a short game by skill. You can explore freely without following a fixed order.'], ar:['اختر طريقة التدريب','اختر لعبة قصيرة حسب المهارة. يمكنك الاستكشاف بحرية دون ترتيب إلزامي.'] },
    thinklab: { en:['Think it through','Take your time: observe clues, connect ideas, and explain your reasoning.'], ar:['فكّر بهدوء','خذ وقتك في ملاحظة الأدلة وربط الأفكار وتوضيح طريقة تفكيرك.'] },
    summon: { en:['Discover a new card','Card Portal is where you discover cards. Your collected cards are kept in Collection.'], ar:['اكتشف بطاقة جديدة','هنا تكتشف البطاقات، أما البطاقات التي تجمعها فتجدها في قسم Collection.'] },
    collection: { en:['Your collection','Open a card to explore its details and the connections around it.'], ar:['مجموعتك','افتح أي بطاقة لاستكشاف تفاصيلها والروابط المرتبطة بها.'] },
    chronicle: { en:['Explore the Codex','Start with a place or event, then follow connected records. Some dates are intentionally uncertain.'], ar:['استكشف Codex','ابدأ بمكان أو حدث، ثم تتبّع السجلات المرتبطة به. بعض التواريخ غير مؤكدة عمدًا.'] },
    progress: { en:['Read your progress gently','Look for patterns over time. Use these insights as a guide, not a score to chase.'], ar:['تابع تقدمك بهدوء','لاحظ الأنماط مع مرور الوقت، واستخدم المؤشرات كدليل لا كرقم عليك مطاردته.'] },
    trophies: { en:['Milestones, not perfection','Trophies celebrate effort and meaningful steps, not flawless answers.'], ar:['محطات لا مثالية','تحتفي الكؤوس بالجهد والخطوات المهمة، لا بالإجابات الخالية من الأخطاء.'] },
    profile: { en:['Your learning space','Manage your profile and choose how you want to share it from here.'], ar:['مساحتك التعليمية','أدر ملفك الشخصي واختر طريقة مشاركته من هذا القسم.'] },
    resonance: { en:['Follow the clues','The Resonance is a story-led investigation. Read carefully and use each clue to decide what to explore next.'], ar:['تتبّع الأدلة','The Resonance تحقيق قصصي. اقرأ بعناية واستخدم كل دليل لتحديد ما ستستكشفه بعد ذلك.'] }
  };
  function showContextTip(viewName) {
    document.querySelectorAll('.guidance-context-tip').forEach(node => node.remove());
    const tip = CONTEXT_TIPS[viewName];
    if (!tip || state.tipsSeen.includes(viewName)) return;
    const view = document.getElementById(viewName + '-view');
    if (!view || !view.classList.contains('is-active')) return;
    const host = viewName === 'resonance' ? view : (view.querySelector('.page') || view);
    const anchor = viewName === 'resonance' ? null : host.querySelector('.intro, .tl-page-heading, .res-intro');
    const language = helpLanguage();
    const content = tip[language] || tip.en;
    const aside = document.createElement('aside');
    aside.className = 'guidance-context-tip';
    aside.setAttribute('role','note');
    aside.setAttribute('aria-label', language === 'ar' ? 'إرشاد سريع' : 'Quick tip');
    aside.dir = language === 'ar' ? 'rtl' : 'ltr';
    const copy = document.createElement('div');
    const label = document.createElement('span');
    label.className = 'guidance-context-label';
    label.textContent = language === 'ar' ? 'إرشاد سريع' : 'A QUICK TIP';
    const heading = document.createElement('strong');
    heading.textContent = content[0];
    const body = document.createElement('p');
    body.textContent = content[1];
    copy.append(label, heading, body);
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'guidance-context-dismiss';
    dismiss.textContent = '×';
    dismiss.setAttribute('aria-label', language === 'ar' ? 'إغلاق الإرشاد' : 'Dismiss tip');
    dismiss.addEventListener('click', () => aside.remove());
    aside.append(copy, dismiss);
    if (anchor && anchor.parentNode) anchor.insertAdjacentElement('afterend', aside);
    else if (viewName === 'resonance' && host.querySelector('.res-shell')) host.insertBefore(aside, host.querySelector('.res-shell'));
    else host.prepend(aside);
    state.tipsSeen.push(viewName);
    persist();
  }
  document.addEventListener('epiphany:view-changed', event => {
    if (event.detail && typeof event.detail.view === 'string') showContextTip(event.detail.view);
  });

  window.EPIPHANY_GUIDANCE = {
    start: () => start({restart:true}),
    resume: () => start(),
    getState: () => ({...state})
  };
})();
