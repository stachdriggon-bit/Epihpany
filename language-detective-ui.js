/* EPIPHANY — The Language Detective UI bridge */
(() => {
  'use strict';
  const fixtures = window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES;
  const engine = window.EPIPHANY_LANGUAGE_DETECTIVE_ENGINE;
  if (!fixtures || !engine || typeof engine.evaluate !== 'function') {
    window.EPIPHANY_LANGUAGE_DETECTIVE = { available: false };
    return;
  }

  const caseInfo = {
    'CASE-001': { title: 'The Missing Package', level: 'A2', subtitle: 'A delivery disappears before its recipient arrives.', focus: 'Separate what the witness saw from what nobody could identify.' },
    'CASE-002': { title: 'Conflicting Accounts', level: 'B1–B2', subtitle: 'An envelope vanishes, then appears in another room.', focus: 'Compare the timeline, reported actions and access records.' },
    'CASE-003': { title: 'The Uncertain Evidence', level: 'C1–C2', subtitle: 'An observatory receiver records an unusual signal.', focus: 'Distinguish an observed anomaly from competing explanations.' }
  };
  const hints = [
    { id: 'DIRECTION', title: 'Direction', text: 'Start with what the records directly establish. Separate observations from assumptions.' },
    { id: 'CONNECTION', title: 'Connection', text: 'Compare the timeline and sources. Access, opportunity and a reported action are not automatically proof that one person acted.' },
    { id: 'REASONING', title: 'Reasoning', text: 'State what is established, what remains possible, and what the evidence cannot establish.' }
  ];
  let root = null;
  let onExit = () => {};
  let state = null;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const outcomeLabel = {
    ACCEPTED: 'Conclusion supported',
    PARTIAL: 'Partly supported',
    NEEDS_CLARIFICATION: 'Needs clarification',
    UNSUPPORTED: 'Unsupported conclusion',
    CONTRADICTION: 'Conflicts with the evidence'
  };
  const outcomeText = {
    ACCEPTED: 'Your main conclusion and reasoning fit the available evidence.',
    PARTIAL: 'You have identified part of the picture. Review the missing link or evidence boundary below.',
    NEEDS_CLARIFICATION: 'The meaning or reference is not clear enough to assess fairly. Clarify who or what you mean, then try again.',
    UNSUPPORTED: 'A central claim goes beyond what the case evidence establishes. This does not mean every part of your answer is wrong.',
    CONTRADICTION: 'A central claim conflicts with the case record. Revisit the relevant evidence before drawing that conclusion.'
  };

  function settingsMarkup() {
    return '<div class="ld-settings">' +
      '<label>English level<select data-ld-setting="cefr">' + ['A1','A2','B1','B2','C1','C2'].map(x => '<option value="' + x + '"' + (state.cefr === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label>' +
      '<label>Training mode<select data-ld-setting="trainingMode">' + [['GUIDED','Guided'],['STEADY','Steady'],['CHALLENGE','Challenge']].map(x => '<option value="' + x[0] + '"' + (state.trainingMode === x[0] ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></label>' +
      '<label>Answer format<select data-ld-setting="answerFormat">' + [['STANDARD','Standard'],['HELL','Hell Mode']].map(x => '<option value="' + x[0] + '"' + (state.answerFormat === x[0] ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></label>' +
      '</div>';
  }

  function picker() {
    root.innerHTML = '<section class="ld-shell">' +
      '<div class="ld-heading"><span class="ld-kicker">THINK LAB · INVESTIGATION</span><h2>The Language Detective</h2><p>Read the evidence, test possible explanations and write a conclusion. The goal is careful reasoning—not guessing the hidden answer.</p></div>' +
      settingsMarkup() +
      '<div class="ld-case-grid">' + Object.keys(caseInfo).map(id => {
        const item = caseInfo[id];
        return '<button type="button" class="ld-case-card" data-ld-case="' + id + '">' +
          '<span class="ld-case-meta">CASE FILE · ' + item.level + '</span><strong>' + item.title + '</strong><span>' + item.subtitle + '</span><em>Open investigation →</em></button>';
      }).join('') + '</div>' +
      '<p class="ld-note">Guided, Steady and Challenge change the level of support. Standard and Hell Mode change how you submit your conclusion; neither mode changes the evidence or rewards unsupported certainty.</p>' +
      '</section>';
  }

  function readResponse() {
    if (!root) return { conclusion: '', reasoning: '' };
    if (state.answerFormat === 'HELL') {
      return {
        conclusion: root.querySelector('[name="ld-conclusion"]')?.value || '',
        reasoning: root.querySelector('[name="ld-reasoning"]')?.value || ''
      };
    }
    return { conclusion: root.querySelector('[name="ld-standard"]')?.value || '', reasoning: '' };
  }

  function investigation() {
    const info = caseInfo[state.caseId];
    const snapshot = fixtures.cases[state.caseId];
    const answers = readResponse();
    const evidence = snapshot.evidence.map((item, i) => '<article class="ld-evidence"><span>' + esc(item.role) + ' · E' + String(i + 1).padStart(2, '0') + '</span><p>' + esc(item.summary) + '</p>' + (item.limitations.length ? '<small>Limit: ' + esc(item.limitations.join(' ')) + '</small>' : '') + '</article>').join('');
    const visibleHints = hints.map((hint, i) => {
      const used = state.hintsUsed.includes(hint.id);
      const available = i === 0 || state.hintsUsed.includes(hints[i - 1].id);
      return '<button type="button" class="ld-hint-button" data-ld-hint="' + hint.id + '"' + (used || !available ? ' disabled' : '') + '>' + (used ? '✓ ' : '') + hint.title + '</button>' +
        (used ? '<p class="ld-hint-copy">' + hint.text + '</p>' : '');
    }).join('');
    const answerFields = state.answerFormat === 'HELL'
      ? '<label class="ld-answer-field">Your Conclusion<textarea name="ld-conclusion" rows="3" maxlength="1200" placeholder="What do you think happened?">' + esc(answers.conclusion) + '</textarea></label><label class="ld-answer-field">Your Reasoning<textarea name="ld-reasoning" rows="4" maxlength="1800" placeholder="Which evidence supports your conclusion? What remains uncertain?">' + esc(answers.reasoning) + '</textarea></label>'
      : '<label class="ld-answer-field">Your Conclusion & Reasoning<textarea name="ld-standard" rows="6" maxlength="2400" placeholder="Explain what you think happened and support it with details from the evidence.">' + esc(answers.conclusion) + '</textarea></label>';
    root.innerHTML = '<section class="ld-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← All cases</button><span>CASE · ' + info.level + '</span><span>' + esc(state.trainingMode) + ' · ' + esc(state.answerFormat) + '</span></div>' +
      '<div class="ld-heading"><span class="ld-kicker">INVESTIGATION IN PROGRESS</span><h2>' + info.title + '</h2><p>' + info.subtitle + '</p><p class="ld-focus">' + info.focus + '</p></div>' +
      '<div class="ld-evidence-grid">' + evidence + '</div>' +
      '<section class="ld-hints"><div><strong>Optional hints</strong><p>Use them in order. Hints do not reduce your academic score.</p></div><div class="ld-hint-actions">' + visibleHints + '</div></section>' +
      '<form class="ld-answer-form" data-ld-answer-form><div class="ld-answer-heading"><h3>Build your conclusion</h3><span>' + (state.answerFormat === 'HELL' ? 'Two-part response' : 'One written response') + '</span></div>' +
      answerFields + '<button class="ld-submit" type="submit">Assess my conclusion →</button><p class="ld-form-note">You can review the feedback and try again. Earlier attempts are kept in this open investigation.</p></form>' +
      '</section>';
  }

  function resultView(result) {
    const evaluation = result.evaluation || {};
    const outcome = evaluation.primaryOutcome || 'UNSUPPORTED';
    const dims = evaluation.dimensionResults || [];
    const attempt = state.attempts.length;
    const score = Number.isFinite(evaluation.weightedScore) ? '<strong class="ld-score">' + evaluation.weightedScore + '/100</strong>' : '<strong class="ld-score">Not graded</strong>';
    const grade = evaluation.awardedGrade ? '<span class="ld-grade">Grade ' + esc(evaluation.awardedGrade) + '</span>' : '';
    const dimensionRows = dims.map(d => '<div class="ld-dimension"><span>' + esc(d.dimension.replaceAll('_', ' ').toLowerCase()) + '</span><b>' + d.score + '%</b><div><i style="width:' + Math.max(0, Math.min(100, d.score)) + '%"></i></div></div>').join('');
    const findings = (evaluation.claimDiagnostics || []).map(f => '<li><b>' + esc(f.conceptId.replaceAll('_', ' ').toLowerCase()) + ':</b> ' + esc(f.state) + '</li>').join('');
    root.innerHTML = '<section class="ld-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← Case overview</button><span>ATTEMPT ' + attempt + '</span></div>' +
      '<div class="ld-result-head"><span class="ld-kicker">ASSESSMENT FEEDBACK</span><h2>' + esc(outcomeLabel[outcome] || 'Assessment result') + '</h2><p>' + esc(outcomeText[outcome] || 'Review the evidence and try again.') + '</p><div class="ld-result-score">' + score + grade + '</div></div>' +
      (dimensionRows ? '<section class="ld-dimensions"><h3>What the assessment considered</h3>' + dimensionRows + '</section>' : '') +
      (findings ? '<details class="ld-diagnostics"><summary>Claim-by-claim review</summary><ul>' + findings + '</ul></details>' : '') +
      '<div class="ld-feedback-note"><strong>Remember</strong><p>A missing detail is not automatically a contradiction. The assessment distinguishes an incomplete answer from a claim that the evidence does not support.</p></div>' +
      '<div class="ld-result-actions"><button type="button" class="ld-submit" data-ld-retry>Revise and try again</button><button type="button" class="ld-back" data-ld-back>Choose another case</button></div>' +
      '</section>';
  }

  function submit() {
    const response = readResponse();
    const combined = state.answerFormat === 'HELL'
      ? 'Conclusion: ' + response.conclusion + '\nReasoning: ' + response.reasoning
      : response.conclusion;
    if (!response.conclusion.trim() || (state.answerFormat === 'HELL' && !response.reasoning.trim())) {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = 'Please complete ' + (state.answerFormat === 'HELL' ? 'both fields' : 'your response') + ' before submitting.';
      return;
    }
    const context = fixtures.makeContext(state.caseId, state.trainingMode, state.answerFormat);
    context.cefr = state.cefr;
    context.attemptId = 'ld-' + state.caseId + '-' + (state.attempts.length + 1);
    context.responseId = context.attemptId + '-' + Date.now();
    const result = engine.evaluate({
      context,
      caseSnapshot: fixtures.cases[state.caseId],
      response: combined,
      hintsUsed: [...state.hintsUsed]
    });
    if (result.status === 'CONFIGURATION_ERROR') {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = 'This case could not be assessed because its configuration is invalid. Your response has not been scored.';
      return;
    }
    state.attempts.push({ response, result });
    state.stage = 'result';
    resultView(result);
  }

  function mount(target, options = {}) {
    root = target;
    onExit = typeof options.onExit === 'function' ? options.onExit : () => {};
    state = {
      stage: 'picker',
      caseId: null,
      cefr: 'B1',
      trainingMode: 'GUIDED',
      answerFormat: 'STANDARD',
      hintsUsed: [],
      attempts: []
    };
    picker();
  }

  if (!window.__EPIPHANY_LANGUAGE_DETECTIVE_BOUND__) {
    window.__EPIPHANY_LANGUAGE_DETECTIVE_BOUND__ = true;
    document.addEventListener('change', event => {
      const setting = event.target.closest('[data-ld-setting]');
      if (setting && state) {
        state[setting.dataset.ldSetting] = setting.value;
        if (state.stage === 'picker') picker();
        else if (state.stage === 'investigation') investigation();
      }
    });
    document.addEventListener('click', event => {
      if (!root || !root.contains(event.target)) return;
      const caseButton = event.target.closest('[data-ld-case]');
      if (caseButton) {
        state.caseId = caseButton.dataset.ldCase;
        state.stage = 'investigation';
        state.hintsUsed = [];
        state.attempts = [];
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-back]')) {
        state.stage = 'picker';
        state.caseId = null;
        picker();
        return;
      }
      const hintButton = event.target.closest('[data-ld-hint]');
      if (hintButton && !hintButton.disabled) {
        const answers = readResponse();
        state.hintsUsed.push(hintButton.dataset.ldHint);
        investigation();
        const fields = state.answerFormat === 'HELL'
          ? [['ld-conclusion', answers.conclusion], ['ld-reasoning', answers.reasoning]]
          : [['ld-standard', answers.conclusion]];
        fields.forEach(([name, value]) => { const field = root.querySelector('[name="' + name + '"]'); if (field) field.value = value; });
      }
      if (event.target.closest('[data-ld-retry]')) {
        state.stage = 'investigation';
        investigation();
      }
    });
    document.addEventListener('submit', event => {
      if (!event.target.matches('[data-ld-answer-form]')) return;
      event.preventDefault();
      if (state && state.stage === 'investigation') submit();
    });
  }

  window.EPIPHANY_LANGUAGE_DETECTIVE = { available: true, mount };
})();