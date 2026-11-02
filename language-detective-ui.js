/* EPIPHANY — The Language Detective UI bridge */
(() => {
  'use strict';
  const fixtures = window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES;
  const engine = window.EPIPHANY_LANGUAGE_DETECTIVE_ENGINE;
  if (!fixtures || !engine || typeof engine.evaluate !== 'function') {
    window.EPIPHANY_LANGUAGE_DETECTIVE = { available: false };
    return;
  }

  const caseInfo = Object.fromEntries(Object.entries(fixtures.cases).map(([id, item]) => [id, item.presentation]));
  const CEFR_ORDER = ['A1','A2','B1','B2','C1','C2'];
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

      '<label>Training mode<select data-ld-setting="trainingMode">' + [['GUIDED','Guided'],['STEADY','Steady'],['CHALLENGE','Challenge']].map(x => '<option value="' + x[0] + '"' + (state.trainingMode === x[0] ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></label>' +
      '<label>Answer format<select data-ld-setting="answerFormat">' + [['STANDARD','Standard'],['HELL','Hell Mode']].map(x => '<option value="' + x[0] + '"' + (state.answerFormat === x[0] ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></label>' +
      '</div>';
  }

  const CEFR_LEVELS = {
    A1: { title: 'A1 · Beginner', note: 'Short, direct clues and everyday situations.' },
    A2: { title: 'A2 · Elementary', note: 'Simple timelines and clear links between events.' },
    B1: { title: 'B1 · Intermediate', note: 'More detail, reported accounts and careful comparisons.' },
    B2: { title: 'B2 · Upper intermediate', note: 'More layered evidence and competing interpretations.' },
    C1: { title: 'C1 · Advanced', note: 'Subtle evidence boundaries and competing explanations.' },
    C2: { title: 'C2 · Proficient', note: 'Highly nuanced reasoning across complex sources.' }
  };

  function picker() {
    const levelCards = CEFR_ORDER.map(level => {
      const meta = CEFR_LEVELS[level];
      const count = Object.keys(caseInfo).filter(id => caseInfo[id].cefr === level).length;
      return '<button type="button" class="ld-level-card" data-ld-level-select="' + level + '">' +
        '<span class="ld-level-card-top"><strong>' + level + '</strong><span>' + count + (count === 1 ? ' case' : ' cases') + '</span></span>' +
        '<b>' + meta.title.slice(5) + '</b><span>' + meta.note + '</span>' +
        '<em>' + (count ? 'View investigations →' : 'Coming soon') + '</em></button>';
    }).join('');
    const selectedLevel = state.selectedLevel;
    const selectedMeta = selectedLevel ? CEFR_LEVELS[selectedLevel] : null;
    const caseCards = selectedLevel ? Object.keys(caseInfo)
      .filter(id => caseInfo[id].cefr === selectedLevel)
      .map(id => {
        const item = caseInfo[id];
        return '<button type="button" class="ld-case-card" data-ld-case="' + id + '">' +
          '<span class="ld-case-meta">' + esc(item.category) + '</span><strong>' + esc(item.title) + '</strong><span>' + esc(item.subtitle) + '</span>' +
          '<em>Open investigation →</em></button>';
      }).join('') : '';
    const content = selectedLevel
      ? '<div class="ld-level-case-view"><div class="ld-level-view-heading"><button type="button" class="ld-back" data-ld-level-back>← All levels</button><div><span class="ld-kicker">' + selectedLevel + '</span><h3>' + selectedMeta.title + '</h3><p>' + selectedMeta.note + '</p></div></div>' +
        (caseCards ? '<div class="ld-case-grid">' + caseCards + '</div>' : '<p class="ld-level-empty">There are no investigations at this level yet. New cases will appear here.</p>') +
        '</div>'
      : '<div class="ld-level-selection"><div class="ld-level-selection-heading"><h3>Choose your English level</h3><p>Each level has its own investigations, characters and challenges.</p></div><div class="ld-level-grid">' + levelCards + '</div></div>';
    root.innerHTML = '<section class="ld-shell ld-casebound-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-exit>← Home</button><span>CASE FILES</span></div>' +
      '<div class="ld-heading"><span class="ld-kicker">CASEBOUND · EVERY CLUE HAS A STORY</span><h2>CASEBOUND</h2><p>Investigate cases, examine evidence and discover what really happened.</p></div>' +
      settingsMarkup() + content +
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
      reasoning: reasoningField ? reasoningField.value : (state.standardReasoning ?? state.lastResponse?.reasoning ?? ''),
      selectedConclusion: state.selectedConclusion ?? state.lastResponse?.selectedConclusion ?? null
    };
  }

  function caseIntroduction() {
    const info = caseInfo[state.caseId];
    if (!info) return picker();
    root.innerHTML = '<section class="ld-shell ld-case-intro">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← All cases</button><span>CASE BRIEF · ' + esc(info.cefr) + '</span></div>' +
      '<div class="ld-case-intro-art" aria-hidden="true"><span>CB</span><i>CASE FILE</i></div>' +
      '<div class="ld-heading"><span class="ld-kicker">' + esc(info.category) + ' · ' + esc(info.cefr) + '</span><h2>' + esc(info.title) + '</h2><p>' + esc(info.subtitle) + '</p></div>' +
      '<div class="ld-case-brief"><span class="ld-kicker">YOUR INVESTIGATION</span><p>' + esc(info.focus) + '</p></div>' +
      '<div class="ld-case-intro-actions"><button type="button" class="ld-submit" data-ld-start-investigation>Start Investigation <span aria-hidden="true">→</span></button><p>Take your time. You can review everything you discover as the investigation unfolds.</p></div>' +
      '</section>';
  }

  function investigation() {
    const info = caseInfo[state.caseId];
    const snapshot = fixtures.cases[state.caseId];
    const evidenceItems = Array.isArray(snapshot.evidence) ? snapshot.evidence : [];
    const discovered = new Set(state.discoveredEvidence || []);
    const nextEvidence = evidenceItems.find(item => !discovered.has(item.evidenceId));
    const openedEvidence = evidenceItems.filter(item => discovered.has(item.evidenceId));
    const progress = evidenceItems.length ? Math.round(openedEvidence.length / evidenceItems.length * 100) : 100;
    const answers = readResponse();
    const evidenceCard = (item, i) => '<article class="ld-evidence" data-evidence-id="' + esc(item.evidenceId) + '"><span>' + esc(item.role) + ' · ' + esc(item.evidenceId || ('E' + String(i + 1).padStart(2, '0'))) + '</span><p>' + esc(item.summary) + '</p>' + (item.limitations?.length ? '<small>Limit: ' + esc(item.limitations.join(' ')) + '</small>' : '') + '</article>';
    const notebook = openedEvidence.length
      ? openedEvidence.map((item, i) => evidenceCard(item, i)).join('')
      : '<p class="ld-notebook-empty">Your notebook is empty. Open evidence as you investigate; discovered items will appear here.</p>';
    const characters = Array.isArray(snapshot.characters) && snapshot.characters.length
      ? '<section class="ld-workspace-section"><div class="ld-section-heading"><div><span class="ld-kicker">PEOPLE</span><h3>People in this case</h3></div></div><div class="ld-character-grid">' + snapshot.characters.map(person => '<article class="ld-character-card"><strong>' + esc(person.name || person.label || 'Person') + '</strong>' + (person.role ? '<span>' + esc(person.role) + '</span>' : '') + (person.statement ? '<p>' + esc(person.statement) + '</p>' : '') + '</article>').join('') + '</div></section>' : '';
    const statements = Array.isArray(snapshot.statements) && snapshot.statements.length
      ? '<section class="ld-workspace-section"><div class="ld-section-heading"><div><span class="ld-kicker">INITIAL ACCOUNTS</span><h3>What people say</h3></div></div><div class="ld-statement-list">' + snapshot.statements.map(statement => '<article class="ld-statement-card"><strong>' + esc(statement.name || statement.speaker || 'Statement') + '</strong><p>' + esc(statement.text || statement.statement || '') + '</p></article>').join('') + '</div></section>' : '';
    const interviews = Array.isArray(snapshot.interviews) && snapshot.interviews.length
      ? '<section class="ld-workspace-section"><div class="ld-section-heading"><div><span class="ld-kicker">FOLLOW-UP</span><h3>Interviews</h3></div></div><div class="ld-interview-list">' + snapshot.interviews.map(interview => '<article class="ld-interview-card"><strong>' + esc(interview.name || interview.character || 'Interview') + '</strong>' + (Array.isArray(interview.questions) ? interview.questions.map(question => '<p>' + esc(question.prompt || question.question || '') + '</p>').join('') : '') + '</article>').join('') + '</div></section>' : '';
    const witnesses = Array.isArray(snapshot.witnesses) && snapshot.witnesses.length
      ? '<section class="ld-workspace-section"><div class="ld-section-heading"><div><span class="ld-kicker">WITNESS LEAD</span><h3>Choose a witness</h3></div></div><div class="ld-witness-grid">' + snapshot.witnesses.map(witness => '<article class="ld-witness-card"><strong>' + esc(witness.name || witness.label || 'Witness') + '</strong>' + (witness.description ? '<p>' + esc(witness.description) + '</p>' : '') + '</article>').join('') + '</div></section>' : '';
    const checksAvailable = state.trainingMode === 'GUIDED' && Array.isArray(info.questions) && info.questions.length;
    const questionMarkup = checksAvailable && state.showEvidenceChecks
      ? '<section class="ld-checkpoints"><div><h3>Evidence checks</h3><p>Optional practice to help you inspect the record. These checks do not block progress or affect the written assessment.</p></div>' + info.questions.map(q => '<article class="ld-question" data-ld-question="' + q.id + '"><strong>' + esc(q.prompt) + '</strong><div class="ld-question-options">' + q.options.map((option, i) => '<button type="button" data-ld-option="' + i + '">' + esc(option) + '</button>').join('') + '</div><p class="ld-question-feedback" aria-live="polite"></p></article>').join('') + '</section>' : '';
    const visibleHints = hints.map((hint, i) => {
      const used = state.hintsUsed.includes(hint.id);
      const available = i === 0 || state.hintsUsed.includes(hints[i - 1].id);
      return '<button type="button" class="ld-hint-button" data-ld-hint="' + hint.id + '"' + (used || !available ? ' disabled' : '') + '>' + (used ? '✓ ' : '') + hint.title + '</button>' +
        (used ? '<p class="ld-hint-copy">' + hint.text + '</p>' : '');
    }).join('');
    const canConclude = !nextEvidence;
    const answerFields = state.answerFormat === 'HELL'
      ? '<label class="ld-answer-field">Your Conclusion<textarea name="ld-conclusion" rows="3" maxlength="1200" placeholder="What do you think happened?">' + esc(answers.conclusion) + '</textarea></label><label class="ld-answer-field">Your Reasoning<textarea name="ld-reasoning" rows="4" maxlength="1800" placeholder="Which evidence supports your conclusion? What remains uncertain?">' + esc(answers.reasoning) + '</textarea></label>'
      : '<label class="ld-answer-field">Your Reasoning<textarea name="ld-standard-reasoning" rows="5" maxlength="1800" ' + (state.standardReasoningSubmitted ? 'readonly aria-readonly="true"' : '') + ' placeholder="Explain what the evidence establishes, and what remains uncertain.">' + esc(answers.reasoning) + '</textarea></label><section class="ld-conclusion-picker" data-ld-conclusion-choices><h4>Conclusion choices · ' + info.conclusionOptions.length + ' options</h4><p>' + (state.standardReasoningSubmitted ? 'Now choose the conclusion that best matches your reasoning.' : 'Write your reasoning first. The choices are locked until you submit it.') + '</p><div class="ld-conclusion-options">' + (state.standardReasoningSubmitted ? info.conclusionOptions.map((option, i) => '<button type="button" data-ld-conclusion-option="' + i + '" aria-pressed="' + (answers.selectedConclusion === i) + '"' + (answers.selectedConclusion === i ? ' class="is-selected"' : '') + '>' + esc(option) + '</button>').join('') : info.conclusionOptions.map((option, i) => '<div class="ld-conclusion-locked" aria-label="Option ' + String.fromCharCode(65 + i) + ', locked"><span>' + String.fromCharCode(65 + i) + '</span><span>Locked until reasoning is submitted</span></div>').join('')) + '</div></section>';
    const answerPanel = canConclude
      ? '<form class="ld-answer-form" data-ld-answer-form><div class="ld-answer-heading"><h3>Build your conclusion</h3><span>' + (state.answerFormat === 'HELL' ? 'Two-part response' : 'Reasoning first · then choose a conclusion') + '</span></div>' + answerFields + (state.answerFormat === 'STANDARD' && !state.standardReasoningSubmitted ? '<button class="ld-submit" type="button" data-ld-submit-reasoning>Submit reasoning →</button>' : '<button class="ld-submit" type="submit">' + (state.answerFormat === 'STANDARD' ? 'Assess my answer →' : 'Assess my conclusion →') + '</button>') + '<p class="ld-form-note">You can review the feedback and try again. Earlier attempts are kept in this open investigation.</p></form>'
      : '<section class="ld-unlock-gate"><strong>Keep investigating before you conclude.</strong><p>There is more case material to discover. Open the next item when you are ready; your conclusion will unlock when all available evidence has been reviewed.</p></section>';
    root.innerHTML = '<section class="ld-shell ld-investigation-workspace">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← All cases</button><span>CASE · ' + esc(info.cefr) + '</span><span>' + esc(state.trainingMode) + ' · ' + esc(state.answerFormat) + '</span></div>' +
      '<header class="ld-workspace-header"><div><span class="ld-kicker">INVESTIGATION WORKSPACE</span><h2>' + esc(info.title) + '</h2><p>' + esc(info.subtitle) + '</p></div><button type="button" class="ld-notebook-trigger" data-ld-notebook-open aria-controls="ld-case-notebook" aria-expanded="false">Case notebook <span>' + openedEvidence.length + '</span></button></header>' +
      '<section class="ld-progress-panel" aria-label="Investigation progress"><div class="ld-progress-copy"><strong>Evidence reviewed</strong><span>' + openedEvidence.length + ' of ' + evidenceItems.length + '</span></div><div class="ld-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' + evidenceItems.length + '" aria-valuenow="' + openedEvidence.length + '" aria-label="Evidence reviewed"><i style="width:' + progress + '%"></i></div></section>' +
      statements + characters + interviews + witnesses +
      '<section class="ld-workspace-section ld-discovery-section"><div class="ld-section-heading"><div><span class="ld-kicker">DISCOVERY</span><h3>Evidence</h3><p>Open each item to add it to your case notebook.</p></div></div>' +
      (nextEvidence ? '<article class="ld-next-evidence"><span class="ld-evidence-index">NEXT · ' + esc(nextEvidence.role) + '</span><h4>New evidence is available</h4><p>Its contents will be revealed when you choose to examine it.</p><button type="button" class="ld-submit" data-ld-open-next>Examine evidence →</button></article>' : '<p class="ld-discovery-complete">All available evidence has been reviewed. You can now prepare your conclusion.</p>') +
      '<div class="ld-evidence-grid">' + openedEvidence.map((item, i) => evidenceCard(item, i)).join('') + '</div></section>' +
      (checksAvailable ? '<section class="ld-check-toggle"><div><strong>Guided evidence checks</strong><p>Optional practice. You can skip this and continue the investigation.</p></div><button type="button" class="ld-back" data-ld-toggle-checks aria-expanded="' + String(Boolean(state.showEvidenceChecks)) + '">' + (state.showEvidenceChecks ? 'Hide checks' : 'Open checks') + '</button></section>' : '') +
      questionMarkup +
      (canConclude ? '<section class="ld-hints"><div><strong>Optional hints</strong><p>Use them in order. Hints do not reduce your academic score.</p></div><div class="ld-hint-actions">' + visibleHints + '</div></section>' + answerPanel : '') +
      '</section>' +
      '<button type="button" class="ld-notebook-backdrop" data-ld-notebook-close aria-label="Close case notebook" hidden></button>' +
      '<aside class="ld-notebook-drawer" id="ld-case-notebook" role="dialog" aria-modal="true" aria-labelledby="ld-notebook-title" aria-hidden="true" hidden><div class="ld-notebook-header"><div><span class="ld-kicker">YOUR DISCOVERIES</span><h2 id="ld-notebook-title">Case notebook</h2><p>' + openedEvidence.length + ' discovered item' + (openedEvidence.length === 1 ? '' : 's') + '</p></div><button type="button" class="ld-notebook-close" data-ld-notebook-close aria-label="Close case notebook">×</button></div><div class="ld-notebook-content">' + notebook + '</div></aside>';
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
    if (state.answerFormat === 'STANDARD' && !state.standardReasoningSubmitted) {
      const note = root.querySelector('.ld-form-note');
      if (note) note.textContent = 'Submit your reasoning before choosing a conclusion.';
      return;
    }
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
      selectedLevel: null,
      trainingMode: 'GUIDED',
      answerFormat: 'STANDARD',
      hintsUsed: [],
      discoveredEvidence: [],
      showEvidenceChecks: false,
      attempts: [],
      selectedConclusion: null,
      standardReasoning: '',
      standardReasoningSubmitted: false,
      lastResponse: null
    };
    picker();
  }

  if (!window.__EPIPHANY_LANGUAGE_DETECTIVE_BOUND__) {
    document.addEventListener('input', event => {
      if (!root || !root.contains(event.target) || event.target.name !== 'ld-standard-reasoning' || !state) return;
      const choices = root.querySelector('[data-ld-conclusion-choices]');
      if (!choices) return;
      if (state.standardReasoningSubmitted) return;
      const hasReasoning = Boolean(event.target.value.trim());
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
      const levelButton = event.target.closest('[data-ld-level-select]');
      if (levelButton) {
        state.selectedLevel = levelButton.dataset.ldLevelSelect;
        picker();
        return;
      }
      if (event.target.closest('[data-ld-level-back]')) {
        state.selectedLevel = null;
        picker();
        return;
      }
      const caseButton = event.target.closest('[data-ld-case]');
      if (caseButton) {
        state.caseId = caseButton.dataset.ldCase;
        state.stage = 'case-intro';
        state.hintsUsed = [];
        state.discoveredEvidence = [];
        state.showEvidenceChecks = false;
        state.attempts = [];
        state.selectedConclusion = null;
        state.lastResponse = null;
        state.standardReasoning = '';
        state.standardReasoningSubmitted = false;
        caseIntroduction();
        return;
      }
      if (event.target.closest('[data-ld-open-next]')) {
        const snapshot = fixtures.cases[state.caseId];
        const next = (snapshot.evidence || []).find(item => !(state.discoveredEvidence || []).includes(item.evidenceId));
        if (next) state.discoveredEvidence.push(next.evidenceId);
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-toggle-checks]')) {
        state.showEvidenceChecks = !state.showEvidenceChecks;
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-notebook-open]')) {
        const drawer = root.querySelector('#ld-case-notebook');
        const backdrop = root.querySelector('[data-ld-notebook-close].ld-notebook-backdrop, .ld-notebook-backdrop');
        if (drawer && backdrop) {
          drawer.hidden = false; backdrop.hidden = false;
          drawer.setAttribute('aria-hidden', 'false');
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'true');
          drawer.querySelector('[data-ld-notebook-close]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-notebook-close]')) {
        const drawer = root.querySelector('#ld-case-notebook');
        const backdrop = root.querySelector('.ld-notebook-backdrop');
        if (drawer && backdrop) {
          drawer.hidden = true; backdrop.hidden = true;
          drawer.setAttribute('aria-hidden', 'true');
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'false');
          root.querySelector('[data-ld-notebook-open]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-start-investigation]')) {
        state.stage = 'investigation';
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
      const submitReasoningButton = event.target.closest('[data-ld-submit-reasoning]');
      if (submitReasoningButton && state.answerFormat === 'STANDARD' && !state.standardReasoningSubmitted) {
        const field = root.querySelector('[name="ld-standard-reasoning"]');
        const reasoning = field?.value.trim() || '';
        const note = root.querySelector('.ld-form-note');
        if (!reasoning) {
          if (note) note.textContent = 'Write your reasoning before unlocking the conclusion choices.';
          field?.focus();
          return;
        }
        state.standardReasoning = field.value;
        state.standardReasoningSubmitted = true;
        state.selectedConclusion = null;
        investigation();
        root.querySelector('[data-ld-conclusion-choices]')?.scrollIntoView?.({block:'nearest',behavior:'smooth'});
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
        state.standardReasoningSubmitted = false;
        state.selectedConclusion = null;
        state.standardReasoning = state.lastResponse?.reasoning || '';
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