'use strict';
const { validateEvaluationRequest, validateModuleEnvelope } = require('./language-detective-assessment-schemas');
const { SEMANTIC_OPERATORS } = require('./language-detective-cefr-patterns');
const VERSION='0.1.0';
const DIMENSION_WEIGHTS={CONCLUSION_ACCURACY:35,EVIDENCE_REASONING:40,CRITICAL_THINKING:25};
const LEVELS={100:'EXCELLENT',75:'STRONG',50:'DEVELOPING',25:'LIMITED',0:'NO_CREDIT'};
const dims=Object.keys(DIMENSION_WEIGHTS);

function envelope(ctx,name,status,data,diagnostics=[]){
 const out={caseId:ctx.caseId,caseVersion:ctx.caseVersion,evaluatorVersion:ctx.evaluatorVersion,responseId:ctx.responseId,moduleName:name,moduleVersion:VERSION,status,data,diagnostics};
 const errors=validateModuleEnvelope(out); if(errors.length) throw new Error('Invalid '+name+' envelope'); return out;
}
function operators(text){
 const lower=text.toLowerCase(), out={};
 for(const [key,terms] of Object.entries(SEMANTIC_OPERATORS)) out[key]=terms.filter(term=>lower.includes(term));
 return out;
}
function normalizeText(value){
 const originalText=String(value??'');
 const normalizedText=originalText.normalize('NFKC').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[‐‑‒–—]/g,'-').replace(/\s+/g,' ').trim();
 const parts=normalizedText.split(/(?<=[.!?;])\s+|\s+(?=but\b|however\b|although\b|whereas\b|because\b|therefore\b)/i).filter(Boolean);
 let cursor=0;
 const clauses=parts.map((text,i)=>{const start=normalizedText.indexOf(text,cursor);cursor=start+text.length;return {clauseId:'clause-'+(i+1),text,sourceSpan:[start,cursor],operators:operators(text)};});
 const detectedLanguage=/[\u0600-\u06ff]/.test(normalizedText)?(/[a-z]/i.test(normalizedText)?'MIXED':'ar'):(/[a-z]/i.test(normalizedText)?'en':'UNKNOWN');
 return {originalText,normalizedText,clauses,detectedLanguage};
}
function polarity(text){return /\b(not|never|no|neither|cannot|can't|doesn't|didn't|wasn't|weren't|without|failed to)\b/i.test(text)?'NEGATED':'AFFIRMED';}
function modality(text){
 if(/\b(definitely|certainly|undoubtedly|proved|must have)\b/i.test(text))return 'CERTAIN';
 if(/\b(probably|likely|presumably)\b/i.test(text))return 'PROBABLE';
 if(/\b(may|might|could|possible|possibly|perhaps|plausible|plausibly|conceivably)\b/i.test(text))return 'POSSIBLE';
 if(/\b(unclear|unknown|unresolved|cannot determine|cannot establish|not established)\b/i.test(text))return 'UNCERTAIN';
 return 'UNKNOWN';
}
function TextNormalizer(request){
 const data=normalizeText(request.response),ok=data.detectedLanguage==='en';
 return envelope(request.context,'TextNormalizer',ok?'OK':'UNSUPPORTED_INPUT',data,ok?[]:[{code:'LANGUAGE_NOT_SUPPORTED',severity:'BLOCKING',messageKey:'assessment.englishResponseRequired',propositionIds:[],evidenceRefs:[],criterionIds:[]}]);
}
function SemanticMatcher(normalized,snapshot,ctx){
 const text=normalized.data.normalizedText, clauses=normalized.data.clauses, propositions=[],conceptMatches=[],used=new Set();
 for(const concept of snapshot.concepts){
  let matched=null,matchedId=null;
  for(const p of concept.patterns||[]){try{const re=new RegExp(p.source,'i');const m=text.match(re);if(m){matched=m[0];matchedId=p.patternId;break;}}catch{}}
  if(!matched) for(const v of concept.acceptedVariants||[]) if(text.toLowerCase().includes(v.toLowerCase())){matched=v;matchedId='variant:'+v;break;}
  if(!matched)continue;
  const clause=clauses.find(c=>c.text.toLowerCase().includes(matched.toLowerCase()))||clauses[0];
  const p={propositionId:'p-'+concept.conceptId,conceptId:concept.conceptId,predicate:concept.predicate||concept.conceptId,polarity:sourcePattern?.semanticPolarity||concept.semanticPolarity||polarity(matched),modality:modality(matched),source:sourcePattern?.attribution||concept.attribution||{kind:'LEARNER_ASSERTION'},epistemicStatus:concept.epistemicStatus||'INFERENCE',clauseId:clause?.clauseId||'clause-1',evidenceRefs:[...(concept.evidenceRefs||[])],matchedText:matched};
  propositions.push(p);conceptMatches.push({conceptId:concept.conceptId,matchPath:concept.compositional?'COMPOSITIONAL':'DIRECT',clauseIds:[p.clauseId],propositionIds:[p.propositionId],matchedVariantId:matchedId,confidenceClass:'RULE_EXACT'});used.add(p.clauseId);
 }
 const unmatchedClauseIds=clauses.filter(c=>!used.has(c.clauseId)).map(c=>c.clauseId);
 const ambiguityGroups=[];
 if(/\b(they|he|she|it)\b/i.test(text)&&/\b(two|both|either)\b/i.test(text))ambiguityGroups.push({clauseIds:clauses.map(c=>c.clauseId),alternativeInterpretations:['multiple possible antecedents'],materialDifference:'Pronoun reference may change the actor.'});
 const data={propositions,conceptMatches,unmatchedClauseIds,ambiguityGroups};
 return envelope(ctx,'SemanticMatcher',ambiguityGroups.length?'NEEDS_CLARIFICATION':propositions.length?(unmatchedClauseIds.length?'PARTIAL':'OK'):'UNSUPPORTED_INPUT',data);
}
function EvidenceReasoner(interpreted,snapshot,ctx){
 const propositionAssessments=interpreted.data.propositions.map(p=>{
  const findings=p.evidenceRefs.map(evidenceId=>{const e=snapshot.evidence.find(x=>x.evidenceId===evidenceId);return {evidenceId,relation:e?.relation||'LEAVES_UNRESOLVED',applicableScope:e?.scope||'case-authored scope',limitation:(e?.limitations||[]).join('; ')};});
  let supportState=findings.some(x=>x.relation==='SUPPORTS')?'SUPPORTED':findings.some(x=>x.relation==='CONSISTENT_WITH')?'CONSISTENT_NOT_PROVEN':findings.some(x=>x.relation==='CONTRADICTS')?'CONTRADICTED':findings.length?'UNRESOLVED':'NO_AUTHORED_RELATION';
  const concept=snapshot.concepts.find(x=>x.conceptId===p.conceptId);
  if(concept?.expectedPolarity && p.polarity!==concept.expectedPolarity && supportState==='SUPPORTED')supportState='CONTRADICTED';
  return {propositionId:p.propositionId,conceptId:p.conceptId,evidenceFindings:findings,supportState};
 });
 const missingEssentialEvidenceRefs=snapshot.evidence.filter(e=>e.role==='ESSENTIAL'&&!propositionAssessments.some(p=>p.evidenceFindings.some(f=>f.evidenceId===e.evidenceId&&f.relation==='SUPPORTS'))).map(e=>e.evidenceId);
 return envelope(ctx,'EvidenceReasoner','OK',{propositionAssessments,missingEssentialEvidenceRefs,invalidInferenceFlags:[]});
}
function ClaimValidator(interpreted,evidence,snapshot,ctx){
 const findings=interpreted.data.propositions.map(p=>{
  const assessment=evidence.data.propositionAssessments.find(x=>x.propositionId===p.propositionId),concept=snapshot.concepts.find(x=>x.conceptId===p.conceptId);
  let state=assessment?.supportState==='SUPPORTED'?'SUPPORTED':assessment?.supportState==='CONSISTENT_NOT_PROVEN'?(p.modality==='POSSIBLE'||p.modality==='UNCERTAIN'?'SUPPORTED':'OVERCLAIMED'):assessment?.supportState==='CONTRADICTED'?'CONTRADICTED':assessment?.supportState==='NO_AUTHORED_RELATION'?'UNSUPPORTED':'UNRESOLVED';
  if(concept?.expectedModality==='POSSIBLE'&&p.modality==='CERTAIN')state='OVERCLAIMED';
  return {propositionId:p.propositionId,conceptId:p.conceptId,state,materiality:concept?.materiality||'CENTRAL',affectedCriterionIds:concept?.criterionIds||[],diagnosticCodes:state==='SUPPORTED'?[]:['CLAIM_'+state],rationaleKey:concept?.rationaleKey||'assessment.claim.'+state.toLowerCase()};
 });
 const materialContradictions=findings.filter(x=>x.state==='CONTRADICTED'&&x.materiality!=='PERIPHERAL');
 const unsupportedMaterialClaims=findings.filter(x=>['UNSUPPORTED','OVERCLAIMED'].includes(x.state)&&x.materiality!=='PERIPHERAL');
 return envelope(ctx,'ClaimValidator',findings.some(x=>x.state==='UNRESOLVED')?'PARTIAL':'OK',{findings,materialContradictions,unsupportedMaterialClaims,clarificationRequired:false});
}
function EvaluationResolver(interpreted,claims,snapshot,ctx,hintsUsed=[]){
 const props=new Map(interpreted.data.propositions.map(p=>[p.conceptId,p]));
 const criterionResults=snapshot.criteria.map(c=>{
  const ids=c.conceptIds||[],found=ids.filter(id=>{const p=props.get(id);if(!p)return false;const f=claims.data.findings.find(x=>x.conceptId===id);return !f||!['UNSUPPORTED','OVERCLAIMED','CONTRADICTED'].includes(f.state);});
  const pct=ids.length?Math.round(found.length/ids.length*4)*25:0;
  return {criterionId:c.criterionId,dimension:c.dimension,weight:c.weight,level:LEVELS[pct],percentage:pct,rationaleKeys:[]};
 });
 const dimensionResults=dims.map(d=>{const rows=criterionResults.filter(c=>c.dimension===d),total=rows.reduce((s,c)=>s+c.weight,0);return {dimension:d,score:total?Math.round(rows.reduce((s,c)=>s+c.percentage*c.weight,0)/total):0};});
 const weightedScore=Math.round(dimensionResults.reduce((s,d)=>s+d.score*DIMENSION_WEIGHTS[d.dimension],0)/100);
 const clarification=interpreted.status==='NEEDS_CLARIFICATION';
 const contradiction=claims.data.materialContradictions.length>0,unsupported=claims.data.unsupportedMaterialClaims.length>0;
 const hasClaims=interpreted.data.propositions.length>0,allCore=criterionResults.length>0&&criterionResults.every(c=>c.percentage>=75);
 const primaryOutcome=clarification?'NEEDS_CLARIFICATION':contradiction?'CONTRADICTION':unsupported?(hasClaims?'PARTIAL':'UNSUPPORTED'):allCore?'ACCEPTED':hasClaims?'PARTIAL':'UNSUPPORTED';
 const assessable=!clarification&&primaryOutcome!=='UNSUPPORTED'&&primaryOutcome!=='CONTRADICTION';
 const sGate=weightedScore>=96&&dimensionResults.every(d=>d.score>=90)&&!contradiction&&!unsupported;
 const bands=[[96,'S'],[90,'A+'],[80,'A'],[70,'B'],[60,'C'],[40,'D'],[0,'F']];
 let awardedGrade=assessable?bands.find(([n])=>weightedScore>=n)[1]:undefined;
 if(awardedGrade==='S'&&!sGate)awardedGrade='A+';
 if(awardedGrade==='S'&&ctx.trainingMode==='GUIDED')awardedGrade='A+';
 const independence=hintsUsed.includes('REASONING')?'ASSISTED':hintsUsed.some(x=>['DIRECTION','CONNECTION'].includes(x))?'MODERATE':'HIGH';
 return envelope(ctx,'EvaluationResolver',clarification?'NEEDS_CLARIFICATION':'OK',{primaryOutcome,criterionResults,dimensionResults,weightedScore:assessable?weightedScore:undefined,awardedGrade,clarificationRequired:clarification,claimDiagnostics:claims.data.findings,independence,gradeGateReasons:[...(!sGate?['S_GATE_NOT_MET']:[]),...(ctx.trainingMode==='GUIDED'?['GUIDED_GRADE_CAP']:[])]});
}
function FeedbackBuilder(resolved,ctx){
 const outcome=resolved.data.primaryOutcome,key=outcome==='ACCEPTED'?'assessment.feedback.supported':outcome==='NEEDS_CLARIFICATION'?'assessment.feedback.clarify':'assessment.feedback.reviewEvidenceBoundary';
 return envelope(ctx,'FeedbackBuilder','OK',{items:[{type:outcome==='ACCEPTED'?'WHAT_YOU_GOT':outcome==='NEEDS_CLARIFICATION'?'NEXT_STEP':'WHAT_TO_REVISIT',resourceKey:key,evidenceRefs:[],criterionIds:[]}],availableLocales:['en','ar'],clarificationPromptKey:outcome==='NEEDS_CLARIFICATION'?key:undefined});
}
function evaluate(request){
 const errors=validateEvaluationRequest(request);if(errors.length)return {status:'CONFIGURATION_ERROR',errors};
 const ctx=request.context,snapshot=request.caseSnapshot,normal=TextNormalizer(request);
 if(normal.status!=='OK')return {status:normal.status,modules:[normal],diagnostics:normal.diagnostics};
 const interpreted=SemanticMatcher(normal,snapshot,ctx),evidence=EvidenceReasoner(interpreted,snapshot,ctx),claims=ClaimValidator(interpreted,evidence,snapshot,ctx);
 const evaluation=EvaluationResolver(interpreted,claims,snapshot,ctx,request.hintsUsed),feedback=FeedbackBuilder(evaluation,ctx);
 const modules=[normal,interpreted,evidence,claims,evaluation,feedback];
 for(const module of modules)if(validateModuleEnvelope(module).length)return {status:'CONFIGURATION_ERROR',errors:[{code:'INVALID_MODULE_ENVELOPE',module:module.moduleName}]};
 return {status:evaluation.status,context:{...ctx},modules,normalized:normal.data,interpreted:interpreted.data,evidence:evidence.data,claims:claims.data,evaluation:evaluation.data,feedback:feedback.data};
}
module.exports={VERSION,DIMENSION_WEIGHTS,normalizeText,TextNormalizer,SemanticMatcher,EvidenceReasoner,ClaimValidator,EvaluationResolver,FeedbackBuilder,evaluate};
