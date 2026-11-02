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
    'CASE-001': { title: 'The Missing Package', level: 'A2', subtitle: 'A delivery disappears before its recipient arrives.', focus: 'Your task: identify what the witness actually saw, then separate that from what remains unknown about the person.', conclusionOptions: ['Nora took the package after she arrived.', 'An unidentified resident in a green jacket picked up the package; the resident’s identity remains unknown.', 'Adam collected the package while the driver was there.'], details: ['10:05 — The delivery record says the package was placed at reception; no recipient was recorded.', '10:00–10:15 — Adam was away and did not see the delivery.', '10:12 — Sara saw a resident wearing a green jacket take the package after the driver left it on the table. She did not see the resident’s face.', '10:20 — Nora arrived and the package was no longer there.', 'The optional label names Nora and Apartment 2B; it does not identify who picked up the package.'], questions: [{id:'q1',prompt:'What did Sara directly observe?',options:['She recognized the resident’s face.','A resident in a green jacket picked up the package.','Adam collected the package.'],answer:1,explain:'Sara saw the pickup and the green jacket, but not the resident’s face.'},{id:'q2',prompt:'What can the evidence establish about the picker’s identity?',options:['The picker was Nora.','The picker was Adam.','The picker was not identified.'],answer:2,explain:'The witness did not see the resident’s face, so identity remains unknown.'}] },
    'CASE-002': { title: 'Conflicting Accounts', level: 'B1–B2', subtitle: 'An envelope vanishes, then appears in another room.', focus: 'Your task: explain where the envelope was found and decide what the timeline and access record can—and cannot—prove about who moved it.', conclusionOptions: ['The envelope was found in Room B, but the card log does not identify who used the card.', 'Lena definitely moved the envelope into Room B because her card opened the room.', 'Omar took the envelope after seeing Nadia near the exit.'], details: ['3:05 — Nadia placed the envelope of workshop recordings at library reception.', '3:20 — Omar saw a large envelope on the desk. Later, he saw Nadia carrying papers near the exit and assumed they were the envelope, but he did not identify them.', 'About 3:25 — Lena said she moved a group of papers to Room B; she was unsure whether she checked every sheet.', '3:22–3:41 — A card opened Room B and the room was later closed. The log does not establish who physically used the card or what was carried inside.', '3:45 — Nadia returned and found the envelope missing.', '4:10 — The envelope was found closed in Room B, with papers inside.'], questions: [{id:'q1',prompt:'What does the Room B card record establish?',options:['A card opened Room B; the physical user is not identified.','Lena personally entered Room B.','The envelope was carried into Room B.'],answer:0,explain:'The log records card use, not the identity of the person holding it or what they carried.'},{id:'q2',prompt:'What did Omar actually identify?',options:['He identified the papers Nadia carried as the envelope.','He saw a large envelope earlier, then later saw Nadia with papers he did not identify.','He saw Lena take the envelope.'],answer:1,explain:'Omar made an assumption about the papers; he did not identify them as the envelope.'}] },
    'CASE-003': { title: 'The Uncertain Evidence', level: 'C1–C2', subtitle: 'An observatory receiver records an unusual signal.', focus: 'Your task: separate the recorded anomaly from its possible explanations. Decide whether the evidence identifies a cause or leaves competing hypotheses open.', conclusionOptions: ['An external event definitely caused the signal increase.', 'A temporary fault in R-4 is confirmed by the maintenance record.', 'R-4 recorded an unusual increase, but its cause remains unresolved; an external source or receiver fault is still possible.'], details: ['14 October, 21:43–21:47 — Receiver R-4 recorded an unusual signal-strength increase. The recovered recording is incomplete.', 'Analyst One: an external source is possible, but its identity cannot be established and equipment fault cannot be ruled out.', 'Analyst Two: a temporary R-4 fault is possible, but there is no diagnostic result proving it.', 'Maintenance records show unstable readings in September and a connection check before R-4 returned to service. There was no maintenance or diagnostic test on the night of 14 October.', 'R-7 did not record the increase, but its direction and sensitivity differed, so it is not a direct control.', 'A preliminary report suggested an external event before the original recording was recovered; it is not independent confirmation.', 'A technician’s note from two days earlier expresses concern that the problem may have returned; it is an impression, not a diagnosis.'], questions: [{id:'q1',prompt:'What is directly established by the recovered record?',options:['An external event caused the signal.','R-4 recorded an unusual increase, but the recording is incomplete.','R-7 confirmed the same increase.'],answer:1,explain:'The unusual R-4 reading is observed; the source and cause remain unresolved.'},{id:'q2',prompt:'Why is R-7 not a direct control?',options:['Its direction and sensitivity differed from R-4.','It was maintained on the same settings.','It recorded the increase clearly.'],answer:0,explain:'Different direction and sensitivity prevent a direct comparison.'}] }
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
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-exit>← Think Lab</button><span>THREE CASE FILES</span></div>' +
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
    if (!root || state?.stage === 'result') return state?.lastResponse || { conclusion: '', reasoning: '', selectedConclusion: null };
    if (state.answerFormat === 'HELL') {
      const conclusionField = root.querySelector('[name="ld-conclusion"]');
      const reasoningField = root.querySelector('[name="ld-reasoning"]');
      return {
        conclusion: conclusionField ? conclusionField.value : (state.lastResponse?.conclusion || ''),
        reasoning: reasoningField ? reasoningField.value : (state.lastResponse?.reasoning || '')
      };
    }
    const reasoningField = root.querySelector('[name="ld-standard-reasoning"]');
    return {
      conclusion: Number.isInteger(state.selectedConclusion) ? (caseInfo[state.caseId]?.conclusionOptions[state.selectedConclusion] || '') : (state.lastResponse?.conclusion || ''),
      reasoning: reasoningField ? reasoningField.value : (state.lastResponse?.reasoning || ''),
      selectedConclusion: state.selectedConclusion ?? state.lastResponse?.selectedConclusion ?? null
    };
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
    const questionMarkup = '<section class="ld-checkpoints"><div><h3>Evidence checks</h3><p>These short questions help you inspect the record. Mistakes do not block progress or affect the written assessment; you can retry them.</p></div>' + info.questions.map(q => '<article class="ld-question" data-ld-question="' + q.id + '"><strong>' + esc(q.prompt) + '</strong><div class="ld-question-options">' + q.options.map((option, i) => '<button type="button" data-ld-option="' + i + '">' + esc(option) + '</button>').join('') + '</div><p class="ld-question-feedback" aria-live="polite"></p></article>').join('') + '</section>';
    const answerFields = state.answerFormat === 'HELL'
      ? '<label class="ld-answer-field">Your Conclusion<textarea name="ld-conclusion" rows="3" maxlength="1200" placeholder="What do you think happened?">' + esc(answers.conclusion) + '</textarea></label><label class="ld-answer-field">Your Reasoning<textarea name="ld-reasoning" rows="4" maxlength="1800" placeholder="Which evidence supports your conclusion? What remains uncertain?">' + esc(answers.reasoning) + '</textarea></label>'
      : '<label class="ld-answer-field">Your Reasoning<textarea name="ld-standard-reasoning" rows="5" maxlength="1800" placeholder="Explain what the strongest evidence establishes, and what remains uncertain.">' + esc(answers.reasoning) + '</textarea></label><section class="ld-conclusion-picker" data-ld-conclusion-choices' + (answers.reasoning.trim() ? '' : ' hidden') + '><h4>Choose the conclusion best supported by your reasoning</h4><p>Your choice and reasoning will be assessed together.</p><div class="ld-conclusion-options">' + info.conclusionOptions.map((option, i) => '<button type="button" data-ld-conclusion-option="' + i + '" aria-pressed="' + (answers.selectedConclusion === i) + '"' + (answers.selectedConclusion === i ? ' class="is-selected"' : '') + '>' + esc(option) + '</button>').join('') + '</div></section>';
    root.innerHTML = '<section class="ld-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← All cases</button><span>CASE · ' + info.level + '</span><span>' + esc(state.trainingMode) + ' · ' + esc(state.answerFormat) + '</span></div>' +
      '<div class="ld-heading"><span class="ld-kicker">INVESTIGATION IN PROGRESS</span><h2>' + info.title + '</h2><p>' + info.subtitle + '</p><p class="ld-focus">' + info.focus + '</p></div>' +
      '<section class="ld-timeline"><h3>Case record</h3><ol>' + info.details.map(line => '<li>' + esc(line) + '</li>').join('') + '</ol></section>' +
      '<div class="ld-evidence-grid">' + evidence + '</div>' + questionMarkup +
      '<section class="ld-hints"><div><strong>Optional hints</strong><p>Use them in order. Hints do not reduce your academic score.</p></div><div class="ld-hint-actions">' + visibleHints + '</div></section>' +
      '<form class="ld-answer-form" data-ld-answer-form><div class="ld-answer-heading"><h3>Build your conclusion</h3><span>' + (state.answerFormat === 'HELL' ? 'Two-part response' : 'Reasoning first · then choose a conclusion') + '</span></div>' +
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
    const attemptHistory = state.attempts.map((entry, i) => '<li><b>Attempt ' + (i + 1) + ':</b> ' + esc(outcomeLabel[entry.result.evaluation?.primaryOutcome] || 'Assessment result') + '</li>').join('');
    root.innerHTML = '<section class="ld-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← Case overview</button><span>ATTEMPT ' + attempt + '</span></div>' +
      '<div class="ld-result-head"><span class="ld-kicker">ASSESSMENT FEEDBACK</span><h2>' + esc(outcomeLabel[outcome] || 'Assessment result') + '</h2><p>' + esc(outcomeText[outcome] || 'Review the evidence and try again.') + '</p><div class="ld-result-score">' + score + grade + '</div></div>' +
      (dimensionRows ? '<section class="ld-dimensions"><h3>What the assessment considered</h3>' + dimensionRows + '</section>' : '') +
      (findings ? '<details class="ld-diagnostics"><summary>Claim-by-claim review</summary><ul>' + findings + '</ul></details>' : '') +
      (state.attempts.length > 1 ? '<details class="ld-diagnostics"><summary>Previous attempts (' + (state.attempts.length - 1) + ')</summary><ul>' + attemptHistory.slice(0, attemptHistory.lastIndexOf('<li>')) + '</ul></details>' : '') +
      '<div class="ld-feedback-note"><strong>Remember</strong><p>A missing detail is not automatically a contradiction. The assessment distinguishes an incomplete answer from a claim that the evidence does not support.</p></div>' +
      '<div class="ld-result-actions"><button type="button" class="ld-submit" data-ld-retry>Revise and try again</button><button type="button" class="ld-back" data-ld-back>Choose another case</button></div>' +
      '</section>';
  }

  function submit() {
    const response = readResponse();
    const combined = 'Conclusion: ' + response.conclusion + '\nReasoning: ' + response.reasoning;
    if (!response.conclusion.trim() || !response.reasoning.trim()) {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = state.answerFormat === 'HELL' ? 'Please complete both fields before submitting.' : 'Write your reasoning, then choose the conclusion that best matches it.';
      return;
    }
    if (state.answerFormat === 'STANDARD' && !Number.isInteger(response.selectedConclusion)) {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = 'Choose one conclusion after writing your reasoning.';
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
    state.lastResponse = response;
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
      attempts: [],
      selectedConclusion: null,
      lastResponse: null
    };
    picker();
  }

  if (!window.__EPIPHANY_LANGUAGE_DETECTIVE_BOUND__) {
    document.addEventListener('input', event => {
      if (!root || !root.contains(event.target) || event.target.name !== 'ld-standard-reasoning' || !state) return;
      const choices = root.querySelector('[data-ld-conclusion-choices]');
      if (!choices) return;
      const hasReasoning = Boolean(event.target.value.trim());
      choices.hidden = !hasReasoning;
      if (!hasReasoning) {
        state.selectedConclusion = null;
        choices.querySelectorAll('[data-ld-conclusion-option]').forEach(button => {
          button.classList.remove('is-selected');
          button.setAttribute('aria-pressed', 'false');
        });
      }
    });
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
        state.selectedConclusion = null;
        state.lastResponse = null;
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-exit]')) { onExit(); return; }
      if (event.target.closest('[data-ld-back]')) {
        state.stage = 'picker';
        state.caseId = null;
        picker();
        return;
      }
      const optionButton = event.target.closest('[data-ld-option]');
      if (optionButton) {
        const questionCard = optionButton.closest('[data-ld-question]');
        const question = caseInfo[state.caseId].questions.find(item => item.id === questionCard?.dataset.ldQuestion);
        if (question) {
          const selected = Number(optionButton.dataset.ldOption);
          const feedback = questionCard.querySelector('.ld-question-feedback');
          if (selected === question.answer) {
            feedback.className = 'ld-question-feedback is-correct';
            feedback.textContent = '✓ ' + question.explain;
            questionCard.querySelectorAll('[data-ld-option]').forEach(button => button.classList.toggle('is-selected', button === optionButton));
          } else {
            feedback.className = 'ld-question-feedback is-retry';
            feedback.textContent = 'Not quite. Recheck the record and try another option; this does not affect your assessment.';
            optionButton.classList.add('is-retry');
          }
        }
        return;
      }
      const conclusionButton = event.target.closest('[data-ld-conclusion-option]');
      if (conclusionButton && state.answerFormat === 'STANDARD') {
        state.selectedConclusion = Number(conclusionButton.dataset.ldConclusionOption);
        root.querySelectorAll('[data-ld-conclusion-option]').forEach(button => {
          const selected = button === conclusionButton;
          button.classList.toggle('is-selected', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
        return;
      }
      const hintButton = event.target.closest('[data-ld-hint]');
      if (hintButton && !hintButton.disabled) {
        const answers = readResponse();
        state.hintsUsed.push(hintButton.dataset.ldHint);
        investigation();
        const fields = state.answerFormat === 'HELL'
          ? [['ld-conclusion', answers.conclusion], ['ld-reasoning', answers.reasoning]]
          : [['ld-standard-reasoning', answers.reasoning]];
        fields.forEach(([name, value]) => { const field = root.querySelector('[name="' + name + '"]'); if (field) field.value = value; });
        if (state.answerFormat === 'STANDARD' && answers.selectedConclusion !== null) {
          state.selectedConclusion = answers.selectedConclusion;
          const selected = root.querySelector('[data-ld-conclusion-option="' + answers.selectedConclusion + '"]');
          if (selected) { selected.classList.add('is-selected'); selected.setAttribute('aria-pressed', 'true'); }
        }
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