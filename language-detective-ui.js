/* EPIPHANY — The Language Detective UI bridge */
(() => {
  'use strict';
  const fixtures = window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES;
  const engine = window.EPIPHANY_LANGUAGE_DETECTIVE_ENGINE;
  const investigationModel = window.EPIPHANY_CASEBOUND_INVESTIGATION;
  if (!fixtures || !engine || !investigationModel || typeof engine.evaluate !== 'function') {
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

  function segmented(name, label, options) {
    return '<fieldset class="ld-segment"><legend>' + label + '</legend><div class="ld-segment-options">' + options.map(o =>
      '<label class="ld-segment-option' + (state[name] === o[0] ? ' is-on' : '') + '"><input type="radio" name="ld-' + name + '" value="' + o[0] + '" data-ld-setting="' + name + '"' + (state[name] === o[0] ? ' checked' : '') + '><strong>' + o[1] + '</strong><small>' + o[2] + '</small></label>'
    ).join('') + '</div></fieldset>';
  }

  function settingsMarkup() {
    const answerOptions = [['STANDARD','Standard','Reason, then choose']];
    if (state.completedCaseIds.length) answerOptions.push(['HELL','Hell Mode','Write it all']);
    return '<details class="ld-settings-disclosure"><summary><span aria-hidden="true">⚙</span> Settings</summary><div class="ld-settings">' +
      segmented('trainingMode', 'Support level', [['GUIDED','Guided','Hints + practice'],['STEADY','Steady','Balanced'],['CHALLENGE','Challenge','Least help']]) +
      segmented('answerFormat', 'Answer style', answerOptions) +
      '</div></details>';
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
      const rank = CEFR_ORDER.indexOf(level) + 1;
      return '<button type="button" class="ld-level-card' + (count ? '' : ' is-empty') + '" data-level="' + level + '" data-ld-level-select="' + level + '">' +
        '<span class="ld-level-card-top"><strong>' + level + '</strong><span>' + count + (count === 1 ? ' case' : ' cases') + '</span></span>' +
        '<span class="ld-level-dots" aria-hidden="true">' + CEFR_ORDER.map((_, k) => '<i' + (k < rank ? ' class="on"' : '') + '></i>').join('') + '</span>' +
        '<b>' + meta.title.slice(5) + '</b><span>' + meta.note + '</span>' +
        '<em>' + (count ? 'View investigations →' : 'Coming soon') + '</em></button>';
    }).join('');
    const selectedLevel = state.selectedLevel;
    const selectedMeta = selectedLevel ? CEFR_LEVELS[selectedLevel] : null;
    const caseCards = selectedLevel ? Object.keys(caseInfo)
      .filter(id => caseInfo[id].cefr === selectedLevel)
      .map((id, n) => {
        const item = caseInfo[id];
        return '<button type="button" class="ld-case-card" data-level="' + esc(item.cefr) + '" data-ld-case="' + id + '">' +
          '<span class="ld-case-tab">CASE ' + String(n + 1).padStart(2, '0') + ' · ' + esc(item.cefr) + '</span>' +
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
      '<div class="ld-heading ld-hero"><span class="ld-kicker">CASEBOUND · EVERY CLUE HAS A STORY</span><h2>CASEBOUND</h2><p class="ld-hero-line">Read the clues. Prove what happened.</p><p>Investigate cases, examine evidence and discover what really happened.</p><ol class="ld-howto"><li><b>1</b>Read the statements</li><li><b>2</b>Question people</li><li><b>3</b>Examine evidence</li><li><b>4</b>Build your conclusion</li></ol></div>' +
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
      '<div class="ld-case-intro-art ld-dossier" data-level="' + esc(info.cefr) + '" aria-hidden="true"><b>CASE FILE · ' + esc(info.cefr) + '</b><span>CB</span><i>' + esc(info.category) + '</i><em class="ld-dossier-stamp">OPEN</em></div>' +
      '<div class="ld-heading"><span class="ld-kicker">' + esc(info.category) + ' · ' + esc(info.cefr) + '</span><h2>' + esc(info.title) + '</h2><p>' + esc(info.subtitle) + '</p></div>' +
      '<div class="ld-case-brief"><span class="ld-kicker">YOUR INVESTIGATION</span><p>' + esc(info.focus) + '</p></div>' +
      '<ol class="ld-howto ld-howto-light"><li><b>1</b>Meet the people</li><li><b>2</b>Review the evidence</li><li><b>3</b>Build your conclusion</li></ol><div class="ld-case-intro-actions"><button type="button" class="ld-submit" data-ld-start-investigation>Start Investigation <span aria-hidden="true">→</span></button><p>Take your time. You can review everything you discover as the investigation unfolds.</p></div>' +
      '</section>';
  }

  function discoveredEvidenceForState(evidenceId) {
    return Boolean(state?.session?.discoveredEvidenceIds?.includes(evidenceId));
  }

  function investigation() {
    const previousScrollY = window.scrollY || 0;
    document.getElementById('ld-case-notebook')?.remove();
    document.querySelector('.ld-notebook-backdrop')?.remove();
    const info = caseInfo[state.caseId];
    const snapshot = fixtures.cases[state.caseId];
    const session = state.session;
    if (!session || session.status !== 'ACTIVE') return caseIntroduction();
    const evidenceItems = Array.isArray(snapshot.evidence) ? snapshot.evidence : [];
    const discovered = new Set(session.discoveredEvidenceIds || []);
    const nextEvidence = investigationModel.getAvailableEvidence(snapshot, session)[0] || null;
    const openedEvidence = evidenceItems.filter(item => discovered.has(item.evidenceId));
    const progress = evidenceItems.length ? Math.round(openedEvidence.length / evidenceItems.length * 100) : 100;
    const readiness = investigationModel.isConclusionReady(snapshot, session);
    const answers = readResponse();
    const case005Links = state.caseId === 'CASE-005' ? {
      statements:{'S-LINA':['E01','E02'],'S-OMAR':['E01'],'S-NORA':['E01']},
      evidence:{E01:['S-LINA','S-OMAR','S-NORA'],E02:['S-LINA'],E03:['S-LINA'],E04:['S-LINA']},
      evidenceLabels:{E01:'Review the three initial accounts',E02:'Return to Lina’s account',E03:'Return to Lina’s account',E04:'Return to Lina’s account'}
    } : null;
    const sourceButton = (label, action, value) => '<button type="button" class="ld-source-link" data-ld-source-' + action + '="' + esc(value) + '">' + esc(label) + ' →</button>';
    const evidenceCard = (item, i) => '<article class="ld-evidence" data-evidence-id="' + esc(item.evidenceId) + '"><span>' + esc(item.role) + ' · ' + esc(item.evidenceId || ('E' + String(i + 1).padStart(2, '0'))) + '</span><p>' + esc(item.summary) + '</p>' + (item.limitations?.length ? '<small>Limit: ' + esc(item.limitations.join(' ')) + '</small>' : '') + (case005Links?.evidence[item.evidenceId] ? sourceButton(case005Links.evidenceLabels[item.evidenceId], 'statement', case005Links.evidence[item.evidenceId][0]) : '') + '</article>';
    const notebookSections = investigationModel.getNotebookSections(snapshot, session);
    const notebookEntries = investigationModel.getNotebookEntries(snapshot, session);
    const notebook = notebookSections.length
      ? notebookSections.map(section => '<section class="ld-notebook-section"><h3>' + esc(section.title) + '</h3><p>' + esc(section.description) + '</p>' + section.entries.map(entry => {
          let sourceLink = '';
          if (case005Links && entry.type === 'STATEMENT') sourceLink = (case005Links.statements[entry.id] || []).filter(id => discovered.has(id)).map(id => sourceButton('Open related ' + id, 'evidence', id)).join('');
          if (case005Links && entry.type === 'EVIDENCE') sourceLink = sourceButton('Return to related statement', 'statement', case005Links.evidence[entry.id]?.[0] || 'S-LINA');
          if (entry.type === 'INTERVIEW') sourceLink = sourceButton('Return to interview', 'interview', entry.id);
          if (entry.type === 'STATEMENT') sourceLink += sourceButton('Open this account', 'statement', entry.id);
          return '<article class="ld-notebook-entry ld-notebook-entry-' + esc(entry.type.toLowerCase()) + '" id="ld-notebook-entry-' + esc(entry.id) + '"><strong>' + esc(entry.title) + '</strong><p>' + esc(entry.content) + '</p>' + sourceLink + '</article>';
        }).join('') + '</section>').join('')
      : '<p class="ld-notebook-empty">Your notebook is empty. Examine a record or speak with someone; discoveries will be organised here.</p>';
    const selectedDossier = state.selectedCharacterId ? investigationModel.getCharacterDossier(snapshot,session,state.selectedCharacterId) : null;
    const visibleStatements = (snapshot.statements || []).filter(statement =>
      (session.revealedStatementIds || []).includes(statement.statementId || statement.id)
    );
    const statements = '<section class="ld-workspace-section ld-briefing-section ld-panel-statements"><div class="ld-section-heading"><div><span class="ld-kicker">INITIAL ACCOUNTS</span><h3>What everyone said</h3><p>Read the available statements together before choosing whom to question. You can return to them throughout the investigation.</p></div></div>' +
      (visibleStatements.length ? '<div class="ld-statement-list">' + visibleStatements.map(statement => {
        const person = (snapshot.characters || []).find(item => (item.characterId || item.id) === (statement.characterId || statement.speakerId));
        const speaker = statement.name || statement.speaker || person?.name || 'Statement';
        const statementId = statement.statementId || statement.id;
        const relatedEvidence = case005Links?.statements[statementId] || [];
        const relatedLinks = relatedEvidence.filter(id => discovered.has(id)).map(id => sourceButton('Examine ' + id, 'evidence', id)).join('');
        const interviewLink = person ? sourceButton('Ask ' + speaker, 'interview', person.characterId || person.id) : '';
        return '<article class="ld-statement-card" id="ld-statement-' + esc(statementId) + '"><span class="ld-statement-speaker">' + esc(speaker) + (person?.role ? ' · ' + esc(person.role) : '') + '</span><p>' + esc(statement.text || statement.statement || '') + '</p><div class="ld-source-links">' + relatedLinks + interviewLink + '</div></article>';
      }).join('') + '</div>' : '<p class="ld-unlock-gate">Initial statements will appear here when they become available.</p>') +
      '</section>';
    const characters = Array.isArray(snapshot.characters) && snapshot.characters.length
      ? '<section class="ld-workspace-section ld-panel-people ld-contact-section"><div class="ld-section-heading"><div><span class="ld-kicker">PEOPLE</span><h3>Who would you like to speak with?</h3><p>Choose a person to open their conversation. Each person can answer one question in this interview.</p></div><span class="ld-contact-count">' + snapshot.characters.length + ' people</span></div><div class="ld-contact-list" aria-label="People available for interview">' + snapshot.characters.map(person => {
          const id = person.characterId || person.id;
          const selected = state.selectedCharacterId === id;
          const response = (session.interviewResponses || []).find(item => item.characterId === id);
          const completed = Boolean(response && response.questionIds && response.questionIds.length);
          const name = person.name || person.label || 'Person';
          const status = completed ? 'Interview complete' : selected ? 'Conversation open' : 'Available to question';
          return '<button type="button" class="ld-contact-row' + (selected ? ' is-selected' : '') + (completed ? ' is-complete' : '') + '" data-ld-select-character="' + esc(id) + '" aria-pressed="' + String(selected) + '"><span class="ld-contact-avatar" aria-hidden="true">' + esc(String(name).trim().charAt(0).toUpperCase()) + '</span><span class="ld-contact-copy"><strong>' + esc(name) + '</strong><span>' + esc(person.role || 'Person in this case') + '</span><small>' + status + '</small></span><span class="ld-contact-action" aria-hidden="true">' + (selected ? 'Viewing' : completed ? 'Review' : 'Talk') + ' <b>→</b></span></button>';
        }).join('') + '</div></section>' : '';
    const selectedInterviewSource = selectedDossier && Array.isArray(snapshot.interviews)
      ? snapshot.interviews.find(item => item.characterId === state.selectedCharacterId) : null;
    const selectedInitialStatement = selectedDossier
      ? visibleStatements.find(item => (item.characterId || item.speakerId) === state.selectedCharacterId) : null;
    const interviews = selectedDossier && selectedDossier.interview
      ? '<section class="ld-workspace-section ld-panel-people ld-conversation" id="ld-interview-section" aria-label="Conversation with ' + esc(selectedDossier.character.name || 'this person') + '">' +
        '<div class="ld-conversation-heading"><i class="ld-avatar" aria-hidden="true">' + esc(String(selectedDossier.character.name || '?').trim().charAt(0).toUpperCase()) + '</i><div><span class="ld-kicker">PERSON OF INTEREST</span><h3>' + esc(selectedDossier.character.name || 'Interview') + '</h3><p>' + esc(selectedDossier.character.role || 'Available for questions') + '</p></div></div>' +
        '<div class="ld-conversation-thread" aria-live="polite">' +
        (selectedInitialStatement ? '<div class="ld-chat-message ld-chat-person"><i class="ld-avatar" aria-hidden="true">' + esc(String(selectedDossier.character.name || '?').trim().charAt(0).toUpperCase()) + '</i><div class="ld-chat-content"><span>' + esc(selectedDossier.character.name || 'Statement') + ' · Initial statement</span><p class="ld-chat-bubble">' + esc(selectedInitialStatement.text || selectedInitialStatement.statement || '') + '</p></div></div>' : '') +
        selectedDossier.interview.answers.map(answer => {
          const question = selectedInterviewSource?.questions?.find(item => item.questionId === answer.questionId);
          return '<div class="ld-chat-message ld-chat-player"><div class="ld-chat-content"><span>You asked</span><p class="ld-chat-bubble">' + esc(question?.prompt || 'Follow-up question') + '</p></div><i class="ld-chat-player-avatar" aria-hidden="true">Y</i></div>' +
            '<div class="ld-chat-message ld-chat-person" id="ld-interview-' + esc(answer.questionId) + '"><i class="ld-avatar" aria-hidden="true">' + esc(String(selectedDossier.character.name || '?').trim().charAt(0).toUpperCase()) + '</i><div class="ld-chat-content"><span>' + esc(selectedDossier.character.name || 'Answer') + '</span><p class="ld-chat-bubble">' + esc(answer.answer) + '</p>' + sourceButton('Added to case notebook', 'notebook', state.selectedCharacterId + ':' + answer.questionId) + '</div></div>';
        }).join('') + '</div>' +
        (selectedDossier.interview.availableQuestions.length ? '<div class="ld-conversation-prompts"><span class="ld-kicker">ASK A QUESTION · ONE PER PERSON</span><div class="ld-interview-list">' + selectedDossier.interview.availableQuestions.map(question => '<button type="button" class="ld-interview-question" data-ld-ask-interview data-character-id="' + esc(state.selectedCharacterId) + '" data-question-id="' + esc(question.questionId) + '">' + esc(question.prompt) + '</button>').join('') + '</div></div>' : '<p class="ld-interview-used" role="status">You have asked this person a question. Their answer is saved in your case notebook.</p>') +
        '</section>' : '';
    const witnesses = Array.isArray(snapshot.witnesses) && snapshot.witnesses.length
      ? '<section class="ld-workspace-section ld-panel-people"><div class="ld-section-heading"><div><span class="ld-kicker">WITNESS LEAD</span><h3>Choose one witness</h3><p>Your choice adds that witness’s account to the notebook. Other evidence paths remain available.</p></div></div><div class="ld-witness-grid">' + snapshot.witnesses.map(witness => {
          const witnessId = witness.witnessId || witness.id;
          const selected = session.selectedWitnessId === witnessId;
          const locked = Boolean(session.selectedWitnessId) && !selected;
          return '<article class="ld-witness-card' + (selected ? ' is-selected' : '') + '"><strong>' + esc(witness.name || witness.label || 'Witness') + '</strong>' + (witness.description ? '<p>' + esc(witness.description) + '</p>' : '') + '<button type="button" class="ld-witness-select" data-ld-select-witness="' + esc(witnessId) + '"' + (locked ? ' disabled' : '') + '>' + (selected ? 'Selected' : locked ? 'Another witness selected' : 'Hear this witness') + '</button>' + (selected && (witness.statement || witness.account) ? '<p class="ld-witness-account">' + esc(witness.statement || witness.account) + '</p>' : '') + '</article>';
        }).join('') + '</div></section>' : '';
    const checksAvailable = state.trainingMode === 'GUIDED' && Array.isArray(info.questions) && info.questions.length;
    const questionMarkup = checksAvailable && state.showEvidenceChecks
      ? '<section class="ld-checkpoints"><div><h3>Evidence checks</h3><p>Optional practice to help you inspect the record. These checks do not block progress or affect the written assessment.</p></div>' + info.questions.map(q => '<article class="ld-question" data-ld-question="' + q.id + '"><strong>' + esc(q.prompt) + '</strong><div class="ld-question-options">' + q.options.map((option, i) => '<button type="button" data-ld-option="' + i + '">' + esc(option) + '</button>').join('') + '</div><p class="ld-question-feedback" aria-live="polite"></p></article>').join('') + '</section>' : '';
    const visibleHints = hints.map((hint, i) => {
      const used = state.hintsUsed.includes(hint.id);
      const available = i === 0 || state.hintsUsed.includes(hints[i - 1].id);
      return '<button type="button" class="ld-hint-button" data-ld-hint="' + hint.id + '"' + (used || !available ? ' disabled' : '') + '>' + (used ? '✓ ' : '') + hint.title + '</button>' +
        (used ? '<p class="ld-hint-copy">' + hint.text + '</p>' : '');
    }).join('');
    const canConclude = readiness.ready;
    const stepDone = [visibleStatements.length > 0, session.interviewResponses.length > 0 || Boolean(session.selectedWitnessId), !nextEvidence && evidenceItems.length > 0 && openedEvidence.length === evidenceItems.length, false];
    const stepNames = ['Read', 'Question', 'Examine', 'Conclude'];
    const stepActive = canConclude ? 3 : Math.max(0, stepDone.findIndex(done => !done));
    const stepsMarkup = '<ol class="ld-steps" aria-label="Investigation steps">' + stepNames.map((name, k) => '<li class="' + (stepDone[k] && k < stepActive ? 'is-done' : '') + (k === stepActive ? ' is-active' : '') + '"' + (k === stepActive ? ' aria-current="step"' : '') + '><b>' + (stepDone[k] && k < stepActive ? '✓' : k + 1) + '</b><span>' + name + '</span></li>').join('') + '</ol>' +
      '<p class="ld-next-step">' + (canConclude ? 'You have what you need. Build your conclusion below.' : nextEvidence ? 'Next: examine the new evidence.' : session.interviewResponses.length || session.selectedWitnessId ? 'Keep questioning to unlock the remaining evidence.' : 'Next: question someone or hear a witness.') + '</p>';
    const answerFields = state.answerFormat === 'HELL'
      ? '<section class="ld-answer-step"><div class="ld-answer-step-heading"><span>STEP 1</span><div><h4>State your conclusion</h4><p>What do you think happened?</p></div></div><label class="ld-answer-field">Your Conclusion<textarea name="ld-conclusion" rows="3" maxlength="1200" placeholder="What do you think happened?">' + esc(answers.conclusion) + '</textarea></label></section><section class="ld-answer-step"><div class="ld-answer-step-heading"><span>STEP 2</span><div><h4>Support your conclusion</h4><p>Connect your explanation to the case material, and identify what remains uncertain.</p></div></div><label class="ld-answer-field">Your Reasoning<textarea name="ld-reasoning" rows="4" maxlength="1800" placeholder="Which evidence supports your conclusion? What remains uncertain?">' + esc(answers.reasoning) + '</textarea></label></section>'
      : '<section class="ld-answer-step"><div class="ld-answer-step-heading"><span>STEP 1</span><div><h4>Explain your reasoning</h4><p>What do the records establish? Which details are only possible, and what cannot be proved?</p></div></div><label class="ld-answer-field">Your Reasoning<textarea name="ld-standard-reasoning" rows="5" maxlength="1800" ' + (state.standardReasoningSubmitted ? 'readonly aria-readonly="true"' : '') + ' placeholder="Explain what the evidence establishes, and what remains uncertain.">' + esc(answers.reasoning) + '</textarea></label>' + (state.standardReasoningSubmitted ? '<p class="ld-answer-step-status" role="status">Reasoning saved · choose the conclusion that best matches it.</p>' : '<p class="ld-answer-step-status">The conclusion choices unlock after you submit your reasoning.</p>') + '</section><section class="ld-conclusion-picker ld-answer-step" data-ld-conclusion-choices><div class="ld-answer-step-heading"><span>STEP 2</span><div><h4>Choose your conclusion</h4><p>Select the statement that is best supported by the evidence—not simply the most certain one.</p></div></div><p>' + (state.standardReasoningSubmitted ? 'Choose one conclusion.' : 'This step is locked until your reasoning is submitted.') + '</p><div class="ld-conclusion-options">' + (state.standardReasoningSubmitted ? info.conclusionOptions.map((option, i) => '<button type="button" data-ld-conclusion-option="' + i + '" aria-pressed="' + (answers.selectedConclusion === i) + '"' + (answers.selectedConclusion === i ? ' class="is-selected"' : '') + '>' + esc(option) + '</button>').join('') : info.conclusionOptions.map((option, i) => '<div class="ld-conclusion-locked" aria-label="Option ' + String.fromCharCode(65 + i) + ', locked"><span>' + String.fromCharCode(65 + i) + '</span><span>Locked until reasoning is submitted</span></div>').join('')) + '</div></section>';
    const answerPanel = canConclude
      ? '<form class="ld-answer-form" data-ld-answer-form><div class="ld-answer-heading"><h3>Build your conclusion</h3><span>' + (state.answerFormat === 'HELL' ? 'Two-part response' : 'Reasoning first · then choose a conclusion') + '</span></div>' + answerFields + (state.answerFormat === 'STANDARD' && !state.standardReasoningSubmitted ? '<button class="ld-submit" type="button" data-ld-submit-reasoning>Submit reasoning →</button>' : '<button class="ld-submit" type="submit">' + (state.answerFormat === 'STANDARD' ? 'Assess my answer →' : 'Assess my conclusion →') + '</button>') + '<p class="ld-form-note">You can review the feedback and try again. Earlier attempts are kept in this open investigation.</p></form>'
      : '<section class="ld-unlock-gate"><strong>Keep investigating before you conclude.</strong><p>' + (nextEvidence ? 'There is more case material to discover. Open the next item when you are ready; your conclusion will unlock when a fair investigation path is complete.' : 'A required information source is still available through the people or witness sections. Continue there to complete a fair investigation path.') + '</p></section>';
    root.innerHTML = '<section class="ld-shell ld-investigation-workspace">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← All cases</button><span>CASE · ' + esc(info.cefr) + '</span><span>' + esc(state.trainingMode) + ' · ' + esc(state.answerFormat) + '</span></div>' +
      '<header class="ld-workspace-header"><div><span class="ld-kicker">CASE FILE · ' + esc(info.cefr) + '</span><h2>' + esc(info.title) + '</h2><p>' + esc(info.subtitle) + '</p></div><button type="button" class="ld-notebook-trigger" data-ld-notebook-open aria-controls="ld-case-notebook" aria-expanded="false"><i class="ld-nb-icon" aria-hidden="true">▤</i>Case notebook <span>' + notebookEntries.length + '</span></button></header>' +
      '<nav class="ld-scene-progress" aria-label="Investigation stages">' + [['people','1','People'],['evidence','2','Evidence'],['conclusion','3','Conclusion']].map(([scene,number,label]) => '<button type="button" class="ld-scene-step' + (state.activeScene === scene ? ' is-active' : '') + (scene === 'conclusion' && !readiness.ready ? ' is-locked' : '') + '" data-ld-scene="' + scene + '"' + (scene === 'conclusion' && !readiness.ready ? ' aria-disabled="true"' : '') + (state.activeScene === scene ? ' aria-current="step"' : '') + '><b>' + number + '</b><span>' + label + '</span></button>').join('') + '</nav>' +
      '<div class="ld-layout" data-active-scene="' + esc(state.activeScene || 'people') + '"><aside class="ld-side">' + '<section class="ld-mission-panel" aria-label="Your investigation task"><span class="ld-kicker">YOUR TASK · KEEP THIS BRIEF IN VIEW</span><p>' + esc(info.focus) + '</p></section>' +
      '<section class="ld-progress-panel" aria-label="Investigation progress">' + stepsMarkup + '<div class="ld-progress-copy"><strong>Investigation activity</strong><span>' + progress + '% evidence reviewed · ' + session.interviewResponses.length + ' interviews · ' + (session.selectedWitnessId ? '1 witness' : 'no witness') + '</span></div><div class="ld-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="' + evidenceItems.length + '" aria-valuenow="' + openedEvidence.length + '" aria-label="Evidence reviewed"><i style="width:' + progress + '%"></i></div></section>' +
      '</aside><div class="ld-main"><section class="ld-scene-panel" data-scene-panel="people" aria-label="People and interviews">' + statements + characters + interviews + witnesses + '</section>' +
      '<section class="ld-scene-panel" data-scene-panel="evidence" aria-label="Evidence board">' +
      '<section class="ld-workspace-section ld-evidence-board" id="ld-panel-evidence">' +
      '<header class="ld-evidence-board-heading"><div><span class="ld-kicker">CASE MATERIAL</span><h3>Evidence board</h3><p>Keep records, observations and people’s accounts separate. An account can guide your investigation without proving every detail.</p></div><span class="ld-evidence-board-count">' + openedEvidence.length + ' examined · ' + (evidenceItems.length - openedEvidence.length) + ' undiscovered</span></header>' +
      '<div class="ld-evidence-board-grid">' +
      '<section class="ld-evidence-lane ld-evidence-records" aria-labelledby="ld-records-title"><div class="ld-evidence-lane-heading"><span class="ld-evidence-lane-mark" aria-hidden="true">▤</span><div><h4 id="ld-records-title">Records &amp; objects</h4><p>Material evidence you have examined</p></div></div>' +
      (openedEvidence.length ? openedEvidence.map((item,i) => '<article class="ld-evidence ld-evidence-card" data-evidence-id="' + esc(item.evidenceId) + '"><div class="ld-evidence-card-meta"><span>' + esc(item.role === 'OPTIONAL' ? 'OPTIONAL RECORD' : 'CASE EVIDENCE') + '</span><code>' + esc(item.evidenceId || ('E' + String(i + 1).padStart(2,'0'))) + '</code></div><h5>' + esc(item.title || item.evidenceId) + '</h5><p>' + esc(item.summary) + '</p>' + (item.scope ? '<div class="ld-evidence-scope"><strong>What it can tell you</strong><span>' + esc(item.scope) + '</span></div>' : '') + (item.limitations?.length ? '<div class="ld-evidence-limit"><strong>Evidence limit</strong><span>' + esc(item.limitations.join(' ')) + '</span></div>' : '') + '</article>').join('') : '<p class="ld-evidence-empty">No records examined yet. Start with the next available item.</p>') +
      (evidenceItems.length > openedEvidence.length ? '<p class="ld-evidence-undiscovered" role="status">' + (evidenceItems.length - openedEvidence.length) + ' more item' + (evidenceItems.length - openedEvidence.length === 1 ? '' : 's') + ' remain undiscovered. Their contents are hidden until you find and examine them.</p>' : '<p class="ld-discovery-complete">All case evidence has been examined.</p>') +
      '</section>' +
      '<section class="ld-evidence-lane ld-evidence-accounts" aria-labelledby="ld-accounts-title"><div class="ld-evidence-lane-heading"><span class="ld-evidence-lane-mark" aria-hidden="true">◌</span><div><h4 id="ld-accounts-title">People’s accounts</h4><p>Statements and information shared in conversation</p></div></div>' +
      '<div class="ld-evidence-source-group"><h5>Initial statements <span>' + visibleStatements.length + '</span></h5>' +
      (visibleStatements.length ? visibleStatements.map(statement => { const person=(snapshot.characters||[]).find(item=>(item.characterId||item.id)===(statement.characterId||statement.speakerId)); return '<article class="ld-account-card"><span class="ld-account-source">INITIAL STATEMENT · ' + esc(person?.name||statement.name||statement.speaker||'Statement') + '</span><p>' + esc(statement.text||statement.statement||'') + '</p></article>'; }).join('') : '<p class="ld-evidence-empty">No initial statements are available.</p>') +
      '</div><div class="ld-evidence-source-group"><h5>Interview notes <span>' + session.interviewResponses.reduce((count,item)=>count+(item.answers||[]).length,0) + '</span></h5>' +
      (session.interviewResponses.length ? session.interviewResponses.flatMap(response => (response.answers||[]).map(answer => { const interview=(snapshot.interviews||[]).find(item=>item.characterId===response.characterId); const question=interview?.questions?.find(item=>item.questionId===answer.questionId); const person=(snapshot.characters||[]).find(item=>(item.characterId||item.id)===response.characterId); return '<article class="ld-account-card ld-interview-note"><span class="ld-account-source">INTERVIEW · ' + esc(person?.name||response.characterId) + '</span>' + (question?.prompt ? '<strong class="ld-interview-prompt">' + esc(question.prompt) + '</strong>' : '') + '<p>' + esc(answer.answer) + '</p><small>Recorded from this person’s answer · ' + esc(answer.questionId) + '</small></article>'; })).join('') : '<p class="ld-evidence-empty">Interview findings will appear here after you speak with someone.</p>') +
      '</div>' +
      (session.selectedWitnessId ? (() => { const witness=(snapshot.witnesses||[]).find(item=>(item.witnessId||item.id)===session.selectedWitnessId); return witness ? '<div class="ld-evidence-source-group"><h5>Witness account <span>1</span></h5><article class="ld-account-card"><span class="ld-account-source">SELECTED WITNESS · ' + esc(witness.name||witness.label||'Witness') + '</span><p>' + esc(witness.statement||witness.account||witness.description||'') + '</p></article></div>' : ''; })() : '') +
      '</section></div></section>' +
      (nextEvidence ? '<article class="ld-next-evidence"><span class="ld-evidence-index">NEXT · ' + esc(nextEvidence.role) + '</span><h4>New evidence is available</h4><p>Its contents will be revealed when you choose to examine it.</p><button type="button" class="ld-submit" data-ld-open-next data-evidence-id="' + esc(nextEvidence.evidenceId) + '">Examine evidence →</button></article>' : (!canConclude ? '<p class="ld-unlock-gate">Continue with an available interview or witness to reveal the next part of the case.</p>' : '')) +
      (checksAvailable ? '<section class="ld-check-toggle"><div><strong>Quick evidence practice</strong><p>Optional questions about the material you have opened.</p></div><button type="button" class="ld-back" data-ld-toggle-checks aria-expanded="' + String(Boolean(state.showEvidenceChecks)) + '">' + (state.showEvidenceChecks ? 'Hide questions' : 'Practice') + '</button></section>' : '') +
      questionMarkup + '</section>' +
      '<section class="ld-scene-panel" data-scene-panel="conclusion" aria-label="Build your conclusion">' +
      (canConclude ? '<section class="ld-hints"><div><strong>Optional hints</strong><p>Use them in order. Hints do not reduce your academic score.</p></div><div class="ld-hint-actions">' + visibleHints + '</div></section>' + answerPanel : '') +
      '</section></div><footer class="ld-scene-actionbar"><p>' + (state.activeScene === 'people' ? 'Review the people and their accounts.' : state.activeScene === 'evidence' ? (canConclude ? 'The required investigation path is complete.' : 'Complete the required evidence before concluding.') : 'Review your reasoning before submitting.') + '</p><button type="button" class="ld-submit" data-ld-scene-next' + (state.activeScene === 'evidence' && !canConclude ? ' disabled' : '') + '>' + (state.activeScene === 'people' ? 'Continue to evidence →' : state.activeScene === 'evidence' ? 'Build conclusion →' : '← Review evidence') + '</button></footer></section>' +
      '<button type="button" class="ld-notebook-backdrop" data-ld-notebook-close aria-label="Close case notebook" hidden></button>' +
      '<aside class="ld-notebook-drawer" id="ld-case-notebook" role="dialog" aria-modal="true" aria-labelledby="ld-notebook-title" aria-hidden="true" hidden><div class="ld-notebook-header"><div><span class="ld-kicker">YOUR DISCOVERIES</span><h2 id="ld-notebook-title">Case notebook</h2><p>' + notebookEntries.length + ' discovered item' + (notebookEntries.length === 1 ? '' : 's') + '</p></div><button type="button" class="ld-notebook-close" data-ld-notebook-close aria-label="Close case notebook">×</button></div><div class="ld-notebook-content">' + notebook + '</div></aside>';
    const notebookBackdrop = root.querySelector('.ld-notebook-backdrop');
    if (previousScrollY) requestAnimationFrame(() => window.scrollTo({top:previousScrollY,behavior:'auto'}));
    const notebookDrawer = root.querySelector('#ld-case-notebook');
    if (notebookBackdrop && notebookDrawer) document.body.append(notebookBackdrop, notebookDrawer);
  }

  function resultView(result) {
    const evaluation = result.evaluation || {};
    const outcome = evaluation.primaryOutcome || 'UNSUPPORTED';
    const dims = evaluation.dimensionResults || [];
    const attempt = state.attempts.length;
    if (outcome === 'ACCEPTED' && !state.completedCaseIds.includes(state.caseId)) state.completedCaseIds.push(state.caseId);
    const score = Number.isFinite(evaluation.weightedScore) ? '<strong class="ld-score">' + evaluation.weightedScore + '/100</strong>' : '<strong class="ld-score">Not graded</strong>';
    const grade = evaluation.awardedGrade ? '<span class="ld-grade">Grade ' + esc(evaluation.awardedGrade) + '</span>' : '';
    const dimensionRows = dims.map(d => '<div class="ld-dimension"><span>' + esc(d.dimension.replaceAll('_', ' ').toLowerCase()) + '</span><b>' + d.score + '%</b><div><i style="width:' + Math.max(0, Math.min(100, d.score)) + '%"></i></div></div>').join('');
    const findings = (evaluation.claimDiagnostics || []).map(f => '<li><b>' + esc(f.conceptId.replaceAll('_', ' ').toLowerCase()) + ':</b> ' + esc(f.state) + '</li>').join('');
    const attemptHistory = state.attempts.map((entry, i) => '<li><b>Attempt ' + (i + 1) + ':</b> ' + esc(outcomeLabel[entry.result.evaluation?.primaryOutcome] || 'Assessment result') + '</li>').join('');
    root.innerHTML = '<section class="ld-shell">' +
      '<div class="ld-toolbar"><button type="button" class="ld-back" data-ld-back>← Case overview</button><span>ATTEMPT ' + attempt + '</span></div>' +
      '<div class="ld-result-head" data-outcome="' + esc(outcome) + '"><span class="ld-stamp">' + esc(outcome === 'ACCEPTED' ? 'SOLVED' : outcome === 'PARTIAL' ? 'CLOSE' : 'REOPENED') + '</span><span class="ld-kicker">ASSESSMENT FEEDBACK</span><h2>' + esc(outcomeLabel[outcome] || 'Assessment result') + '</h2><p>' + esc(outcomeText[outcome] || 'Review the evidence and try again.') + '</p><div class="ld-result-score"' + (Number.isFinite(evaluation.weightedScore) ? ' style="--p:' + Math.max(0, Math.min(100, evaluation.weightedScore)) + '"' : '') + '>' + score + grade + '</div></div>' +
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
      caseSnapshot: investigationModel.buildEvaluationSnapshot(fixtures.cases[state.caseId], state.session),
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
      selectedCharacterId: null,
      activePanel: 'statements',
      activeScene: 'people',
      trainingMode: 'GUIDED',
      answerFormat: 'STANDARD',
      hintsUsed: [],
      discoveredEvidence: [],
      session: null,
      showEvidenceChecks: false,
      attempts: [],
      completedCaseIds: [],
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
      if (!root || (!root.contains(event.target) && !event.target.closest('#ld-case-notebook, .ld-notebook-backdrop'))) return;
      const sceneButton = event.target.closest('[data-ld-scene]');
      if (sceneButton && state.stage === 'investigation') {
        const scene = sceneButton.dataset.ldScene;
        if (scene === 'conclusion' && !investigationModel.isConclusionReady(fixtures.cases[state.caseId], state.session).ready) return;
        if (['people','evidence','conclusion'].includes(scene)) {
          state.activeScene = scene;
          investigation();
          root.querySelector('[data-ld-scene="' + scene + '"]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-scene-next]') && state.stage === 'investigation') {
        if (state.activeScene === 'people') state.activeScene = 'evidence';
        else if (state.activeScene === 'evidence' && investigationModel.isConclusionReady(fixtures.cases[state.caseId], state.session).ready) state.activeScene = 'conclusion';
        else if (state.activeScene === 'conclusion') state.activeScene = 'evidence';
        investigation();
        return;
      }
      const sourceEvidence = event.target.closest('[data-ld-source-evidence]');
      const sourceStatement = event.target.closest('[data-ld-source-statement]');
      const sourceInterview = event.target.closest('[data-ld-source-interview]');
      const sourceNotebook = event.target.closest('[data-ld-source-notebook]');
      if (sourceEvidence || sourceStatement || sourceInterview || sourceNotebook) {
        const closeNotebook = () => {
          const drawer = document.getElementById('ld-case-notebook');
          const backdrop = document.querySelector('.ld-notebook-backdrop');
          if (drawer) { drawer.hidden = true; drawer.setAttribute('aria-hidden','true'); }
          if (backdrop) backdrop.hidden = true;
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded','false');
        };
        if (sourceEvidence) {
          const id = sourceEvidence.dataset.ldSourceEvidence;
          if (!discoveredEvidenceForState(id)) return;
          state.activeScene = 'evidence';
          closeNotebook();
          investigation();
          requestAnimationFrame(() => root.querySelector('[data-evidence-id="' + id + '"]')?.scrollIntoView({block:'center',behavior:'auto'}));
        } else if (sourceStatement) {
          const id = sourceStatement.dataset.ldSourceStatement;
          state.activeScene = 'people';
          closeNotebook();
          investigation();
          requestAnimationFrame(() => root.querySelector('#ld-statement-' + id)?.scrollIntoView({block:'center',behavior:'auto'}));
        } else if (sourceInterview) {
          const id = sourceInterview.dataset.ldSourceInterview;
          state.selectedCharacterId = id.includes(':') ? id.split(':')[0] : id;
          state.activeScene = 'people';
          closeNotebook();
          investigation();
          const questionId = id.includes(':') ? id.split(':').slice(1).join(':') : '';
          requestAnimationFrame(() => {
            const target = questionId ? root.querySelector('#ld-interview-' + questionId) : root.querySelector('#ld-interview-section') || root.querySelector('[data-ld-select-character="' + state.selectedCharacterId + '"]');
            target?.scrollIntoView({block:'center',behavior:'auto'});
          });
        } else {
          const id = sourceNotebook.dataset.ldSourceNotebook;
          closeNotebook();
          root.querySelector('[data-ld-notebook-open]')?.click();
          requestAnimationFrame(() => document.getElementById('ld-notebook-entry-' + id)?.scrollIntoView({block:'center',behavior:'auto'}));
        }
        return;
      }
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
        state.activeScene = 'people';
        state.selectedCharacterId = null;
        state.stage = 'case-intro';
        state.hintsUsed = [];
        state.discoveredEvidence = [];
        const createdSession = investigationModel.createSession(fixtures.cases[state.caseId]);
        state.session = createdSession.ok ? createdSession.session : null;
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
        const next = investigationModel.getAvailableEvidence(snapshot, state.session)[0];
        if (next) {
          const discovered = investigationModel.discoverEvidence(snapshot, state.session, next.evidenceId);
          if (discovered.ok) {
            state.session = discovered.session;
            state.discoveredEvidence = [...state.session.discoveredEvidenceIds];
          }
        }
        state.activeScene = 'evidence';
        investigation();
        return;
      }
      const characterButton = event.target.closest('[data-ld-select-character]');
      if (characterButton) {
        state.selectedCharacterId = characterButton.dataset.ldSelectCharacter;
        state.activeScene = 'people';
        investigation();
        return;
      }
      const interviewButton = event.target.closest('[data-ld-ask-interview]');
      if (interviewButton) {
        const answer = investigationModel.askInterview(fixtures.cases[state.caseId], state.session, interviewButton.dataset.characterId, interviewButton.dataset.questionId);
        if (answer.ok) state.session = answer.session;
        state.activeScene = 'people';
        investigation();
        requestAnimationFrame(() => root.querySelector('#ld-interview-' + interviewButton.dataset.questionId)?.scrollIntoView({block:'nearest',behavior:'auto'}));
        return;
      }
      const witnessButton = event.target.closest('[data-ld-select-witness]');
      if (witnessButton) {
        const selected = investigationModel.selectWitness(fixtures.cases[state.caseId], state.session, witnessButton.dataset.ldSelectWitness);
        if (selected.ok) state.session = selected.session;
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-toggle-checks]')) {
        state.showEvidenceChecks = !state.showEvidenceChecks;
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-notebook-open]')) {
        const drawer = document.getElementById('ld-case-notebook');
        const backdrop = document.querySelector('.ld-notebook-backdrop');
        if (drawer && backdrop) {
          drawer.hidden = false; backdrop.hidden = false;
          drawer.setAttribute('aria-hidden', 'false');
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'true');
          drawer.querySelector('[data-ld-notebook-close]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-notebook-close]')) {
        const drawer = document.getElementById('ld-case-notebook');
        const backdrop = document.querySelector('.ld-notebook-backdrop');
        if (drawer && backdrop) {
          drawer.hidden = true; backdrop.hidden = true;
          drawer.setAttribute('aria-hidden', 'true');
          root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'false');
          root.querySelector('[data-ld-notebook-open]')?.focus();
        }
        return;
      }
      if (event.target.closest('[data-ld-start-investigation]')) {
        const started = investigationModel.startSession(state.session);
        if (started.ok) {
          state.session = started.session;
          state.stage = 'investigation';
        }
        investigation();
        return;
      }
      if (event.target.closest('[data-ld-exit]')) { document.getElementById('ld-case-notebook')?.remove(); document.querySelector('.ld-notebook-backdrop')?.remove(); onExit(); return; }
      if (event.target.closest('[data-ld-back]')) {
        document.getElementById('ld-case-notebook')?.remove();
        document.querySelector('.ld-notebook-backdrop')?.remove();
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
        state.activeScene = 'conclusion';
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
    document.addEventListener('keydown', event => {
      const tab = event.target.closest?.('[data-ld-panel]');
      if (tab && root?.contains(tab) && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
        const tabs = [...root.querySelectorAll('[data-ld-panel]')];
        const current = tabs.indexOf(tab);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        event.preventDefault();
        tabs[next]?.click();
        root.querySelector('[data-ld-panel="' + tabs[next]?.dataset.ldPanel + '"]')?.focus();
        return;
      }
      if (event.key !== 'Escape' || !root || !state) return;
      const drawer = document.getElementById('ld-case-notebook');
      if (!drawer || drawer.hidden) return;
      const backdrop = document.querySelector('.ld-notebook-backdrop');
      drawer.hidden = true;
      if (backdrop) backdrop.hidden = true;
      drawer.setAttribute('aria-hidden', 'true');
      root.querySelector('[data-ld-notebook-open]')?.setAttribute('aria-expanded', 'false');
      root.querySelector('[data-ld-notebook-open]')?.focus();
    });
  }

  window.EPIPHANY_LANGUAGE_DETECTIVE = { available: true, mount };
})();