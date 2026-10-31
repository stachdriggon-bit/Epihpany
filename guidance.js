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
      if (!raw) return { version:VERSION, activityCompleted:false, status:'not-started', step:0 };
      const value = JSON.parse(raw);
      if (!value || value.version !== VERSION) return { version:VERSION, activityCompleted:false, status:'not-started', step:0 };
      return {
        version:VERSION,
        activityCompleted:value.activityCompleted === true,
        status:['not-started','in-progress','skipped','completed'].includes(value.status) ? value.status : 'not-started',
        step:Number.isInteger(value.step) ? Math.max(0,Math.min(STEPS.length-1,value.step)) : 0
      };
    } catch (_) { return { version:VERSION, activityCompleted:false, status:'not-started', step:0 }; }
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
    overlay.querySelector('[data-guidance-intro]').textContent = state.step === 0 ? strings.intro : step[1];
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
  document.addEventListener('click', event => {
    const homeButton = event.target.closest('[data-view="home"], #logo');
    if (!homeButton) return;
    window.setTimeout(() => {
      if (state.activityCompleted && state.status === 'not-started' && activeHome()) start();
    }, 0);
  });
  window.EPIPHANY_GUIDANCE = {
    start: () => start({restart:true}),
    resume: () => start(),
    getState: () => ({...state})
  };
})();
