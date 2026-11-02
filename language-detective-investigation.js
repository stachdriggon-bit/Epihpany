/* CASEBOUND — flexible investigation session model */
(() => {
  'use strict';

  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const list = value => Array.isArray(value) ? value : [];
  const idOf = (item, primary, fallback) => item?.[primary] || item?.[fallback] || '';
  const clone = value => JSON.parse(JSON.stringify(value));

  function validateInvestigation(snapshot) {
    const errors = [];
    if (!isObject(snapshot)) return [{path:'$',code:'TYPE',message:'Expected a case snapshot.'}];
    const collections = ['evidence','characters','statements','interviews','witnesses'];
    for (const key of collections) {
      if (snapshot[key] !== undefined && !Array.isArray(snapshot[key])) {
        errors.push({path:key,code:'ARRAY',message:key+' must be an array when provided.'});
      }
    }
    const uniqueIds = (items, primary, fallback, path) => {
      const ids = list(items).map(item => idOf(item,primary,fallback));
      if (ids.some(id => !id) || new Set(ids).size !== ids.length) {
        errors.push({path,code:'UNIQUE_IDS',message:path+' must contain unique non-empty IDs.'});
      }
      return new Set(ids);
    };
    const evidenceIds = uniqueIds(snapshot.evidence,'evidenceId','id','evidence');
    const characterIds = uniqueIds(snapshot.characters,'characterId','id','characters');
    const statementIds = uniqueIds(snapshot.statements,'statementId','id','statements');
    const witnessIds = uniqueIds(snapshot.witnesses,'witnessId','id','witnesses');
    const interviewIds = new Set();
    const informationIds = new Set();
    for (const [i, interview] of list(snapshot.interviews).entries()) {
      const characterId = interview.characterId || interview.character || '';
      if (!characterIds.has(characterId)) errors.push({path:'interviews['+i+'].characterId',code:'UNKNOWN_CHARACTER',message:'Interview must reference a registered character.'});
      const questions = list(interview.questions);
      if (!questions.length) errors.push({path:'interviews['+i+'].questions',code:'EMPTY_QUESTIONS',message:'An interview must contain at least one question.'});
      if (interview.maxQuestionsPerAttempt !== undefined && interview.maxQuestionsPerAttempt !== 1) {
        errors.push({path:'interviews['+i+'].maxQuestionsPerAttempt',code:'ONE_QUESTION_PER_CHARACTER',message:'Each character allows exactly one interview question per investigation.'});
      }
      const questionIds = questions.map(q => q.questionId || q.id || '');
      if (questionIds.some(id => !id) || new Set(questionIds).size !== questionIds.length) {
        errors.push({path:'interviews['+i+'].questions',code:'UNIQUE_QUESTION_IDS',message:'Interview question IDs must be unique and non-empty.'});
      }
      for (const [j, question] of questions.entries()) {
        if (typeof question.prompt !== 'string' || !question.prompt.trim()) errors.push({path:'interviews['+i+'].questions['+j+'].prompt',code:'REQUIRED',message:'Question prompt is required.'});
        if (typeof question.answer !== 'string' || !question.answer.trim()) errors.push({path:'interviews['+i+'].questions['+j+'].answer',code:'REQUIRED',message:'Interview answer is required.'});
        if (question.informationId) informationIds.add(question.informationId);
        for (const evidenceId of list(question.evidenceIds)) if (!evidenceIds.has(evidenceId)) errors.push({path:'interviews['+i+'].questions['+j+'].evidenceIds',code:'UNKNOWN_EVIDENCE',message:'Interview references unknown evidence: '+evidenceId});
      }
      const interviewId = interview.interviewId || characterId;
      if (interviewIds.has(interviewId)) errors.push({path:'interviews['+i+']',code:'DUPLICATE_INTERVIEW',message:'Interview IDs must be unique.'});
      interviewIds.add(interviewId);
    }
    for (const [i, statement] of list(snapshot.statements).entries()) {
      const speakerId = statement.characterId || statement.speakerId;
      if (speakerId && !characterIds.has(speakerId)) errors.push({path:'statements['+i+'].characterId',code:'UNKNOWN_CHARACTER',message:'Statement references an unknown character.'});
    }
    for (const [i, witness] of list(snapshot.witnesses).entries()) {
      const characterId = witness.characterId;
      if (characterId && !characterIds.has(characterId)) errors.push({path:'witnesses['+i+'].characterId',code:'UNKNOWN_CHARACTER',message:'Witness references an unknown character.'});
    }
    for (const [i, concept] of list(snapshot.concepts).entries()) {
      for (const evidenceId of list(concept.evidenceRefs)) if (!evidenceIds.has(evidenceId)) errors.push({path:'concepts['+i+'].evidenceRefs',code:'UNKNOWN_EVIDENCE',message:'Concept references unknown evidence: '+evidenceId});
      for (const informationId of list(concept.informationRefs)) if (!informationIds.has(informationId)) errors.push({path:'concepts['+i+'].informationRefs',code:'UNKNOWN_INFORMATION',message:'Concept references information that no interview can reveal: '+informationId});
      for (const witnessId of list(concept.witnessRefs)) if (!witnessIds.has(witnessId)) errors.push({path:'concepts['+i+'].witnessRefs',code:'UNKNOWN_WITNESS',message:'Concept references unknown witness: '+witnessId});
    }
    for (const [i, item] of list(snapshot.evidence).entries()) {
      const unlock = item.unlock || {};
      for (const evidenceId of list(unlock.requiresEvidenceIds)) if (!evidenceIds.has(evidenceId)) errors.push({path:'evidence['+i+'].unlock.requiresEvidenceIds',code:'UNKNOWN_EVIDENCE',message:'Unlock rule references unknown evidence: '+evidenceId});
      if (unlock.requiresInterview) {
        const requirement = unlock.requiresInterview;
        const interview = list(snapshot.interviews).find(entry => (entry.characterId || entry.character) === requirement.characterId);
        if (!interview || !list(interview.questions).some(q => (q.questionId || q.id) === requirement.questionId)) {
          errors.push({path:'evidence['+i+'].unlock.requiresInterview',code:'UNKNOWN_INTERVIEW',message:'Unlock rule references an unknown interview question.'});
        }
      }
      if (unlock.requiresWitness && !list(snapshot.witnesses).length) errors.push({path:'evidence['+i+'].unlock.requiresWitness',code:'WITNESS_REQUIRED',message:'Evidence requires a witness but this case has no witnesses.'});
      if (unlock.requiresWitnessId && !witnessIds.has(unlock.requiresWitnessId)) errors.push({path:'evidence['+i+'].unlock.requiresWitnessId',code:'UNKNOWN_WITNESS',message:'Unlock rule references an unknown witness.'});
    }
    const paths = snapshot.investigation?.conclusionPaths;
    if (paths !== undefined && (!Array.isArray(paths) || !paths.length)) errors.push({path:'investigation.conclusionPaths',code:'PATHS',message:'conclusionPaths must be a non-empty array when provided.'});
    for (const [i, path] of list(paths).entries()) {
      for (const evidenceId of list(path.evidenceIds)) if (!evidenceIds.has(evidenceId)) errors.push({path:'investigation.conclusionPaths['+i+'].evidenceIds',code:'UNKNOWN_EVIDENCE',message:'Conclusion path references unknown evidence: '+evidenceId});
      for (const requirement of list(path.interviews)) {
        const interview = list(snapshot.interviews).find(entry => (entry.characterId || entry.character) === requirement.characterId);
        if (!interview || !list(interview.questions).some(q => (q.questionId || q.id) === requirement.questionId)) errors.push({path:'investigation.conclusionPaths['+i+'].interviews',code:'UNKNOWN_INTERVIEW',message:'Conclusion path references an unknown interview question.'});
      }
      for (const witnessId of list(path.witnessIds)) if (!witnessIds.has(witnessId)) errors.push({path:'investigation.conclusionPaths['+i+'].witnessIds',code:'UNKNOWN_WITNESS',message:'Conclusion path references an unknown witness: '+witnessId});
    }
    return errors;
  }

  function createSession(snapshot) {
    const errors = validateInvestigation(snapshot);
    if (errors.length) return {ok:false,errors};
    const statements = list(snapshot.statements);
    return {ok:true,session:{
      caseId:snapshot.caseId,caseVersion:snapshot.caseVersion,status:'BRIEF',
      discoveredEvidenceIds:[],
      revealedStatementIds:statements.filter(item => item.availableAtStart !== false).map(item => idOf(item,'statementId','id')),
      interviewResponses:[],discoveredInformationIds:[],selectedWitnessId:null,activityLog:[]
    }};
  }

  function startSession(session) {
    if (!isObject(session) || session.status !== 'BRIEF') return {ok:false,error:'SESSION_NOT_AT_BRIEF'};
    return {ok:true,session:{...clone(session),status:'ACTIVE'}};
  }

  function interviewResponse(session, characterId) {
    return list(session?.interviewResponses).find(item => item.characterId === characterId);
  }

  function isEvidenceAvailable(snapshot, session, evidence) {
    if (session.status !== 'ACTIVE' || session.discoveredEvidenceIds.includes(evidence.evidenceId)) return false;
    if (evidence.availableAtStart === false && !evidence.unlock) return false;
    const unlock = evidence.unlock || {};
    if (!list(unlock.requiresEvidenceIds).every(id => session.discoveredEvidenceIds.includes(id))) return false;
    if (unlock.requiresInterview) {
      const response = interviewResponse(session, unlock.requiresInterview.characterId);
      if (!response || !response.questionIds.includes(unlock.requiresInterview.questionId)) return false;
    }
    if (unlock.requiresWitness && !session.selectedWitnessId) return false;
    if (unlock.requiresWitnessId && session.selectedWitnessId !== unlock.requiresWitnessId) return false;
    return true;
  }

  function getAvailableEvidence(snapshot, session) {
    return list(snapshot.evidence).filter(item => isEvidenceAvailable(snapshot,session,item));
  }

  function discoverEvidence(snapshot, session, evidenceId) {
    const evidence = list(snapshot.evidence).find(item => item.evidenceId === evidenceId);
    if (!evidence) return {ok:false,error:'UNKNOWN_EVIDENCE',session};
    if (!isEvidenceAvailable(snapshot,session,evidence)) return {ok:false,error:'EVIDENCE_NOT_AVAILABLE',session};
    const next = clone(session);
    next.discoveredEvidenceIds.push(evidenceId);
    next.activityLog.push({type:'EVIDENCE_DISCOVERED',id:evidenceId});
    return {ok:true,session:next,evidence:clone(evidence)};
  }

  function getAvailableInterviews(snapshot, session) {
    if (session.status !== 'ACTIVE') return [];
    return list(snapshot.interviews).filter(interview => {
      const characterId = interview.characterId || interview.character;
      const prior = interviewResponse(session,characterId);
      return !prior || prior.questionIds.length === 0;
    }).map(interview => {
      const characterId = interview.characterId || interview.character;
      const prior = interviewResponse(session,characterId);
      const asked = new Set(prior?.questionIds || []);
      return {...interview,characterId,questions:list(interview.questions).filter(q => !asked.has(q.questionId || q.id))};
    }).filter(interview => interview.questions.length);
  }

  function askInterview(snapshot, session, characterId, questionId) {
    const interview = list(snapshot.interviews).find(item => (item.characterId || item.character) === characterId);
    if (!interview) return {ok:false,error:'UNKNOWN_INTERVIEW',session};
    const question = list(interview.questions).find(item => (item.questionId || item.id) === questionId);
    if (!question) return {ok:false,error:'UNKNOWN_INTERVIEW_QUESTION',session};
    const available = getAvailableInterviews(snapshot,session).some(item => item.characterId === characterId && item.questions.some(q => (q.questionId || q.id) === questionId));
    if (!available) return {ok:false,error:'INTERVIEW_LIMIT_REACHED',session};
    const next = clone(session);
    let response = next.interviewResponses.find(item => item.characterId === characterId);
    if (!response) {
      response = {characterId,questionIds:[],answers:[]};
      next.interviewResponses.push(response);
    }
    response.questionIds.push(questionId);
    response.answers.push({questionId,answer:question.answer,informationId:question.informationId || null,evidenceIds:list(question.evidenceIds)});
    if (question.informationId && !next.discoveredInformationIds.includes(question.informationId)) next.discoveredInformationIds.push(question.informationId);
    next.activityLog.push({type:'INTERVIEW_ANSWER_REVEALED',characterId,questionId});
    return {ok:true,session:next,answer:question.answer,question:clone(question)};
  }

  function selectWitness(snapshot, session, witnessId) {
    if (session.status !== 'ACTIVE') return {ok:false,error:'SESSION_NOT_ACTIVE',session};
    const witness = list(snapshot.witnesses).find(item => (item.witnessId || item.id) === witnessId);
    if (!witness) return {ok:false,error:'UNKNOWN_WITNESS',session};
    if (session.selectedWitnessId) return {ok:false,error:'WITNESS_ALREADY_SELECTED',session};
    const next = clone(session);
    next.selectedWitnessId = witnessId;
    next.activityLog.push({type:'WITNESS_SELECTED',id:witnessId});
    return {ok:true,session:next,witness:clone(witness)};
  }

  function getCharacterDossier(snapshot, session, characterId) {
    const character = list(snapshot.characters).find(item => idOf(item,'characterId','id') === characterId);
    if (!character) return null;
    const statements = list(snapshot.statements).filter(statement =>
      (statement.characterId || statement.speakerId) === characterId &&
      list(session.revealedStatementIds).includes(idOf(statement,'statementId','id'))
    ).map(clone);
    const interview = list(snapshot.interviews).find(item => (item.characterId || item.character) === characterId);
    const available = getAvailableInterviews(snapshot,session).find(item => item.characterId === characterId);
    const response = interviewResponse(session,characterId);
    return {
      character:clone(character),
      statements,
      interview: interview ? {
        interviewId:interview.interviewId || characterId,
        availableQuestions:list(available?.questions).map(question => ({
          questionId:question.questionId || question.id,
          prompt:question.prompt
        })),
        answers:list(response?.answers).map(clone),
        maxQuestionsPerAttempt:1
      } : null
    };
  }

  function getNotebookSections(snapshot, session) {
    const entries = getNotebookEntries(snapshot,session);
    return [
      {id:'EVIDENCE',title:'Evidence',description:'Records and objects you examined.',entries:entries.filter(item=>item.type==='EVIDENCE')},
      {id:'STATEMENTS',title:'Statements',description:'Initial accounts from people in the case.',entries:entries.filter(item=>item.type==='STATEMENT')},
      {id:'INTERVIEWS',title:'Interviews',description:'Answers revealed when you asked a question.',entries:entries.filter(item=>item.type==='INTERVIEW')},
      {id:'WITNESSES',title:'Witnesses',description:'Witness accounts you chose to hear.',entries:entries.filter(item=>item.type==='WITNESS')}
    ].filter(section=>section.entries.length);
  }

  function getNotebookEntries(snapshot, session) {
    const entries = [];
    for (const statement of list(snapshot.statements)) {
      const id = idOf(statement,'statementId','id');
      if (session.revealedStatementIds.includes(id)) entries.push({type:'STATEMENT',id,title:statement.name || statement.speaker || 'Statement',content:statement.text || statement.statement || ''});
    }
    for (const evidence of list(snapshot.evidence)) {
      if (session.discoveredEvidenceIds.includes(evidence.evidenceId)) entries.push({type:'EVIDENCE',id:evidence.evidenceId,title:evidence.title || evidence.evidenceId,content:evidence.summary});
    }
    for (const response of list(session.interviewResponses)) {
      for (const answer of list(response.answers)) entries.push({type:'INTERVIEW',id:response.characterId+':'+answer.questionId,title:'Interview · '+response.characterId,content:answer.answer});
    }
    if (session.selectedWitnessId) {
      const witness = list(snapshot.witnesses).find(item => (item.witnessId || item.id) === session.selectedWitnessId);
      if (witness) entries.push({type:'WITNESS',id:session.selectedWitnessId,title:witness.name || witness.label || 'Witness',content:witness.statement || witness.account || witness.description || ''});
    }
    return entries.filter(entry => entry.content);
  }

  function getProgress(snapshot, session) {
    const evidence = list(snapshot.evidence);
    const discovered = session.discoveredEvidenceIds.length;
    const interviews = list(snapshot.interviews);
    const answered = session.interviewResponses.reduce((count,item) => count + item.questionIds.length,0);
    return {
      discoveredEvidence:discovered,totalEvidence:evidence.length,
      remainingAvailableEvidence:getAvailableEvidence(snapshot,session).length,
      interviewsAnswered:answered,totalInterviews:interviews.length,
      witnessSelected:Boolean(session.selectedWitnessId),
      activityCount:session.activityLog.length
    };
  }

  function isConclusionReady(snapshot, session) {
    if (session.status !== 'ACTIVE') return {ready:false,reason:'SESSION_NOT_ACTIVE'};
    const paths = snapshot.investigation?.conclusionPaths;
    if (Array.isArray(paths) && paths.length) {
      const satisfied = paths.some(path =>
        list(path.evidenceIds).every(id => session.discoveredEvidenceIds.includes(id)) &&
        list(path.interviews).every(req => {
          const response = interviewResponse(session,req.characterId);
          return Boolean(response?.questionIds.includes(req.questionId));
        }) &&
        (!list(path.witnessIds).length || list(path.witnessIds).includes(session.selectedWitnessId))
      );
      return {ready:satisfied,reason:satisfied?null:'INVESTIGATION_PATH_INCOMPLETE'};
    }
    const required = list(snapshot.evidence).filter(item => item.requiredForConclusion === true || (item.requiredForConclusion !== false && item.role !== 'OPTIONAL'));
    const missing = required.filter(item => !session.discoveredEvidenceIds.includes(item.evidenceId)).map(item => item.evidenceId);
    return {ready:missing.length===0,reason:missing.length?'REQUIRED_EVIDENCE_REMAINS':'',missingEvidenceIds:missing};
  }

  function buildEvaluationSnapshot(snapshot, session) {
    const discovered = new Set(session.discoveredEvidenceIds);
    const evidence = list(snapshot.evidence).filter(item => discovered.has(item.evidenceId));
    const information = new Set(session.discoveredInformationIds || []);
    const concepts = list(snapshot.concepts).filter(concept =>
      list(concept.evidenceRefs).every(id => discovered.has(id)) &&
      list(concept.informationRefs).every(id => information.has(id)) &&
      list(concept.witnessRefs).every(id => session.selectedWitnessId === id)
    ).map(concept => ({...clone(concept),evidenceRefs:list(concept.evidenceRefs).filter(id => discovered.has(id))}));
    const conceptIds = new Set(concepts.map(item => item.conceptId));
    const criteria = list(snapshot.criteria).map(criterion => ({
      ...clone(criterion),conceptIds:list(criterion.conceptIds).filter(id => conceptIds.has(id))
    })).filter(criterion => criterion.conceptIds.length);
    return {...clone(snapshot),evidence:clone(evidence),concepts,criteria};
  }

  const api = {validateInvestigation,createSession,startSession,getAvailableEvidence,discoverEvidence,getAvailableInterviews,askInterview,selectWitness,getCharacterDossier,getNotebookEntries,getNotebookSections,getProgress,isConclusionReady,buildEvaluationSnapshot};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (typeof window !== 'undefined') window.EPIPHANY_CASEBOUND_INVESTIGATION = api;
})();
