(() => {
'use strict';

const ENUMS = Object.freeze({
  cefr: ['A1','A2','B1','B2','C1','C2'],
  trainingMode: ['GUIDED','STEADY','CHALLENGE'],
  answerFormat: ['STANDARD','HELL'],
  polarity: ['AFFIRMED','NEGATED','UNKNOWN'],
  modality: ['CERTAIN','PROBABLE','POSSIBLE','UNCERTAIN','UNKNOWN'],
  epistemicStatus: ['ESTABLISHED_FACT','REPORTED_OBSERVATION','INFERENCE','HYPOTHESIS','UNKNOWN_NOT_ESTABLISHED','OPINION_IMPRESSION'],
  primaryOutcome: ['ACCEPTED','PARTIAL','NEEDS_CLARIFICATION','UNSUPPORTED','CONTRADICTION'],
  moduleStatus: ['OK','PARTIAL','NEEDS_CLARIFICATION','UNSUPPORTED_INPUT','CONFIGURATION_ERROR']
});

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const unique = values => new Set(values).size === values.length;
const issue = (path, code, message) => ({ path, code, message });

function validateEvaluationContext(value) {
  const errors = [];
  if (!isObject(value)) return [issue('$','TYPE','Expected an object.')];
  for (const key of ['caseId','caseVersion','evaluatorVersion','schemaVersion','attemptId','responseId']) {
    if (!nonEmpty(value[key])) errors.push(issue(key,'REQUIRED',`${key} must be a non-empty string.`));
  }
  if (!ENUMS.cefr.includes(value.cefr)) errors.push(issue('cefr','ENUM','Unsupported CEFR level.'));
  if (!ENUMS.trainingMode.includes(value.trainingMode)) errors.push(issue('trainingMode','ENUM','Unsupported training mode.'));
  if (!ENUMS.answerFormat.includes(value.answerFormat)) errors.push(issue('answerFormat','ENUM','Unsupported answer format.'));
  if (!['en','ar'].includes(value.locale)) errors.push(issue('locale','ENUM','Locale must be en or ar.'));
  return errors;
}

function validateProposition(value, path = 'proposition') {
  const errors = [];
  if (!isObject(value)) return [issue(path,'TYPE','Expected an object.')];
  for (const key of ['propositionId','predicate','clauseId']) if (!nonEmpty(value[key])) errors.push(issue(`${path}.${key}`,'REQUIRED',`${key} is required.`));
  for (const [key, allowed] of [['polarity',ENUMS.polarity],['modality',ENUMS.modality],['epistemicStatus',ENUMS.epistemicStatus]]) {
    if (!allowed.includes(value[key])) errors.push(issue(`${path}.${key}`,'ENUM',`Invalid ${key}.`));
  }
  if (!isObject(value.source) || !['LEARNER_ASSERTION','ATTRIBUTED_SOURCE','CASE_RECORD','UNRESOLVED_ATTRIBUTION'].includes(value.source.kind)) errors.push(issue(`${path}.source`,'SOURCE','Invalid claim source.'));
  if (value.source?.kind === 'ATTRIBUTED_SOURCE' && !nonEmpty(value.source.sourceId)) errors.push(issue(`${path}.source.sourceId`,'REQUIRED','Attributed source requires sourceId.'));
  if (value.source?.kind === 'CASE_RECORD' && !nonEmpty(value.source.recordId)) errors.push(issue(`${path}.source.recordId`,'REQUIRED','Case record source requires recordId.'));
  if (!Array.isArray(value.evidenceRefs) || value.evidenceRefs.some(x => !nonEmpty(x)) || !unique(value.evidenceRefs || [])) errors.push(issue(`${path}.evidenceRefs`,'ARRAY','evidenceRefs must be unique non-empty strings.'));
  return errors;
}

function validateCaseSnapshot(value) {
  const errors = [];
  if (!isObject(value)) return [issue('$','TYPE','Expected a case object.')];
  for (const key of ['caseId','caseVersion','schemaVersion']) if (!nonEmpty(value[key])) errors.push(issue(key,'REQUIRED',`${key} is required.`));
  for (const key of ['concepts','evidence','criteria','feedbackResources']) if (!Array.isArray(value[key])) errors.push(issue(key,'ARRAY',`${key} must be an array.`));
  const checkIds = (items, key) => {
    if (!Array.isArray(items)) return;
    const ids = items.map(x => x && x[key]);
    if (ids.some(x => !nonEmpty(x)) || !unique(ids)) errors.push(issue(key,'UNIQUE_IDS',`${key} values must be present and unique.`));
  };
  checkIds(value.concepts,'conceptId');
  checkIds(value.evidence,'evidenceId');
  checkIds(value.criteria,'criterionId');
  const evidenceIds = new Set((value.evidence || []).map(x => x.evidenceId));
  for (const [i, concept] of (value.concepts || []).entries()) {
    if (!Array.isArray(concept.acceptedVariants) || !Array.isArray(concept.patterns) || !Array.isArray(concept.evidenceRefs)) errors.push(issue(`concepts[${i}]`,'CONCEPT_SHAPE','Concept needs acceptedVariants, patterns, and evidenceRefs arrays.'));
    for (const ref of concept.evidenceRefs || []) if (!evidenceIds.has(ref)) errors.push(issue(`concepts[${i}].evidenceRefs`,'UNKNOWN_EVIDENCE',`Unknown evidence reference: ${ref}`));
    for (const pattern of concept.patterns || []) {
      if (!nonEmpty(pattern.source) || !nonEmpty(pattern.patternId)) errors.push(issue(`concepts[${i}].patterns`,'PATTERN_SHAPE','Patterns need patternId and source.'));
      else { try { new RegExp(pattern.source,'i'); } catch { errors.push(issue(`concepts[${i}].patterns`,'INVALID_PATTERN',`Invalid regular expression: ${pattern.patternId}`)); } }
      if (pattern.semanticPolarity && !ENUMS.polarity.includes(pattern.semanticPolarity)) errors.push(issue(`concepts[${i}].patterns`,'POLARITY','Invalid semanticPolarity.'));
      if (pattern.attribution && (!isObject(pattern.attribution) || !['ATTRIBUTED_SOURCE','CASE_RECORD','LEARNER_ASSERTION','UNRESOLVED_ATTRIBUTION'].includes(pattern.attribution.kind))) errors.push(issue(`concepts[${i}].patterns`,'ATTRIBUTION','Invalid pattern attribution.'));
    }
    for (const pattern of concept.excludePatterns || []) { try { new RegExp(pattern,'i'); } catch { errors.push(issue(`concepts[${i}].excludePatterns`,'INVALID_PATTERN','Invalid exclusion regular expression.')); } }
    if (concept.expectedModality && !ENUMS.modality.includes(concept.expectedModality)) errors.push(issue(`concepts[${i}].expectedModality`,'MODALITY','Invalid expected modality.'));
    if (concept.expectedPolarity && !ENUMS.polarity.includes(concept.expectedPolarity)) errors.push(issue(`concepts[${i}].expectedPolarity`,'POLARITY','Invalid expected polarity.'));
  }
  for (const [i, evidence] of (value.evidence || []).entries()) {
    if (!['ESSENTIAL','OPTIONAL','CONTEXTUAL','DISCONFIRMING'].includes(evidence.role)) errors.push(issue(`evidence[${i}].role`,'ENUM','Invalid evidence role.'));
    if (!nonEmpty(evidence.summary) || !Array.isArray(evidence.limitations)) errors.push(issue(`evidence[${i}]`,'EVIDENCE_SHAPE','Evidence needs summary and limitations.'));
    if (!['SUPPORTS','CONTRADICTS','CONSISTENT_WITH','WEAKENS','CONTEXTUALIZES','DOES_NOT_ESTABLISH','LEAVES_UNRESOLVED'].includes(evidence.relation)) errors.push(issue(`evidence[${i}].relation`,'ENUM','Invalid evidence relation.'));
  }
  const conceptIds = new Set((value.concepts || []).map(x => x.conceptId));
  for (const [i, criterion] of (value.criteria || []).entries()) {
    if (!['CONCLUSION_ACCURACY','EVIDENCE_REASONING','CRITICAL_THINKING'].includes(criterion.dimension)) errors.push(issue(`criteria[${i}].dimension`,'ENUM','Invalid criterion dimension.'));
    if (!Number.isFinite(criterion.weight) || criterion.weight <= 0) errors.push(issue(`criteria[${i}].weight`,'WEIGHT','Criterion weight must be positive.'));
    if (!Array.isArray(criterion.conceptIds) || criterion.conceptIds.some(id => !conceptIds.has(id))) errors.push(issue(`criteria[${i}].conceptIds`,'UNKNOWN_CONCEPT','Criterion concept references must resolve.'));
  }
  return errors;
}

function validateModuleEnvelope(value) {
  const errors = [];
  if (!isObject(value)) return [issue('$','TYPE','Expected an envelope.')];
  for (const key of ['caseId','caseVersion','evaluatorVersion','responseId','moduleName','moduleVersion']) if (!nonEmpty(value[key])) errors.push(issue(key,'REQUIRED',`${key} is required.`));
  if (!ENUMS.moduleStatus.includes(value.status)) errors.push(issue('status','ENUM','Invalid module status.'));
  if (!Object.prototype.hasOwnProperty.call(value,'data')) errors.push(issue('data','REQUIRED','data property is required.'));
  if (!Array.isArray(value.diagnostics)) errors.push(issue('diagnostics','ARRAY','diagnostics must be an array.'));
  return errors;
}

function validateEvaluationRequest(value) {
  const errors = [];
  if (!isObject(value)) return [issue('$','TYPE','Expected a request object.')];
  errors.push(...validateEvaluationContext(value.context).map(e => ({...e,path:`context.${e.path}`})));
  errors.push(...validateCaseSnapshot(value.caseSnapshot).map(e => ({...e,path:`caseSnapshot.${e.path}`})));
  if (!nonEmpty(value.response)) errors.push(issue('response','REQUIRED','response must be a non-empty string.'));
  if (!Array.isArray(value.hintsUsed) || value.hintsUsed.some(x => !['DIRECTION','CONNECTION','REASONING'].includes(x))) errors.push(issue('hintsUsed','ENUM_ARRAY','hintsUsed must contain valid hint levels.'));
  if (value.context && value.caseSnapshot && (value.context.caseId !== value.caseSnapshot.caseId || value.context.caseVersion !== value.caseSnapshot.caseVersion)) errors.push(issue('caseSnapshot','VERSION_MISMATCH','Context and case snapshot must identify the same case version.'));
  return errors;
}

const LanguageDetectiveSchemas = { ENUMS, validateEvaluationContext, validateProposition, validateCaseSnapshot, validateModuleEnvelope, validateEvaluationRequest };
if (typeof module !== 'undefined' && module.exports) module.exports = LanguageDetectiveSchemas;
else if (typeof window !== 'undefined') window.EPIPHANY_LANGUAGE_DETECTIVE_SCHEMAS = LanguageDetectiveSchemas;

})();
