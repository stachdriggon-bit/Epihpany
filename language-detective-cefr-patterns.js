'use strict';

// CEFR describes the language forms the evaluator is prepared to recognize and
// the feedback register to use. It never raises or lowers semantic correctness.
const CEFR_GRAMMAR_CATALOG = Object.freeze({
  A1: {
    clauses: ['simple subject + verb + object','be + adjective / noun','there is / there are','basic present and past statements'],
    links: ['and','but','because'],
    time: ['now','today','yesterday','at + clock time','before','after'],
    negation: ['not','do not / does not','did not','no'],
    modality: ['can','cannot','maybe'],
    attribution: ['said','saw','told'],
    reference: ['repeated noun phrases','simple he / she / it / they with one clear antecedent'],
    feedbackRegister: 'short, concrete sentences'
  },
  A2: {
    clauses: ['simple and coordinated clauses','common present, past, and future forms','basic passive recognition','comparatives and quantifiers'],
    links: ['and','but','because','so','when','then','before','after'],
    time: ['at / around + time','from ... to ...','later','earlier','already','still'],
    negation: ['not','never','no longer','did not','was not'],
    modality: ['may','might','could','probably','maybe','I think'],
    attribution: ['according to','X said that','X saw / heard'],
    reference: ['pronouns with a single clear antecedent','simple substitution and ellipsis'],
    feedbackRegister: 'plain explanations with one reasoning step'
  },
  B1: {
    clauses: ['subordination','reported speech','common passive constructions','relative clauses','conditionals 0 and 1'],
    links: ['although','however','therefore','while','unless','since','as a result'],
    time: ['by the time','during','meanwhile','until','within'],
    negation: ['hardly','neither ... nor','not necessarily','failed to'],
    modality: ['may have','might have','could have','seems to','is likely to'],
    attribution: ['reported that','claimed that','according to the record'],
    reference: ['cross-clause pronouns when antecedent is unique','basic discourse reference'],
    feedbackRegister: 'clear explanations distinguishing fact and inference'
  },
  B2: {
    clauses: ['multi-clause argument structures','passive and causative forms','conditionals 2 and 3','reduced relative clauses'],
    links: ['nevertheless','whereas','despite','consequently','provided that','in contrast'],
    time: ['prior to','subsequent to','throughout','by then'],
    negation: ['not until','far from','cannot be ruled out','does not establish'],
    modality: ['must have','cannot have','would appear to','presumably','conceivably'],
    attribution: ['the report indicates','the witness maintained','the available record suggests'],
    reference: ['multi-sentence reference where antecedent remains unambiguous'],
    feedbackRegister: 'nuanced explanations of evidential strength'
  },
  C1: {
    clauses: ['embedded clauses','fronted concessive clauses','complex nominalisation','inversion in formal registers'],
    links: ['notwithstanding','insofar as','even if','to the extent that','thereby'],
    time: ['retrospectively','contemporaneously','subsequent to the interval'],
    negation: ['by no means','not so much ... as','without necessarily'],
    modality: ['tentatively','plausibly','cannot be excluded','is not demonstrable'],
    attribution: ['the analyst qualified the conclusion','the note reflects an impression rather than a finding'],
    reference: ['long-distance reference only when uniquely resolvable'],
    feedbackRegister: 'precise analytical feedback'
  },
  C2: {
    clauses: ['dense but interpretable multi-clause structures','subtle scope and information-structure contrasts','elliptical formal constructions'],
    links: ['albeit','inasmuch as','conversely','notwithstanding that','lest'],
    time: ['retrospective temporal anchoring','overlapping intervals and sequence contrasts'],
    negation: ['under no circumstances','is not tantamount to','does not ipso facto entail'],
    modality: ['epistemically underdetermined','is merely conjectural','remains indeterminate'],
    attribution: ['the inference is attributable to the report author, not the underlying record'],
    reference: ['complex reference resolved only with explicit discourse evidence'],
    feedbackRegister: 'concise, high-precision analytical feedback'
  }
});

const CEFR_ORDER = Object.freeze(['A1','A2','B1','B2','C1','C2']);
const SEMANTIC_OPERATORS = Object.freeze({
  negation: ['not','never','no','neither','without','cannot','failed to','does not'],
  modality: ['may','might','could','possibly','probably','likely','must','definitely','certainly','cannot be ruled out'],
  attribution: ['according to','said','reported','claimed','observed','the record shows','the report indicates'],
  causality: ['because','therefore','caused','resulted in','due to','as a result'],
  contrast: ['but','although','however','whereas','nevertheless','despite'],
  uncertainty: ['unknown','unidentified','unclear','unresolved','not established','cannot determine']
});

function getCefrProfile(level) {
  return CEFR_GRAMMAR_CATALOG[level] || null;
}

function validatePatternLevel(pattern) {
  if (!pattern || !CEFR_ORDER.includes(pattern.cefr)) return { valid: false, reason: 'INVALID_CEFR' };
  if (typeof pattern.source !== 'string' || !pattern.source.trim()) return { valid: false, reason: 'EMPTY_PATTERN' };
  if (!pattern.patternId || typeof pattern.patternId !== 'string') return { valid: false, reason: 'MISSING_PATTERN_ID' };
  return { valid: true, level: pattern.cefr };
}

const CEFR_CONSTRUCTION_PATTERNS = Object.freeze({
  A1: [
    { id:'simple-active', pattern:'\\b([a-z]+) (saw|took|moved|put|found) ([a-z]+)\\b', meaning:'simple active event' },
    { id:'simple-negative', pattern:'\\b(did not|does not|is not|was not) [a-z]+\\b', meaning:'basic negation' },
    { id:'simple-be-unknown', pattern:'\\b(is|are|was|were) (unknown|unclear|missing|unidentified)\\b', meaning:'simple state description' }
  ],
  A2: [
    { id:'past-event-time', pattern:'\\b(yesterday|later|earlier|at \\d{1,2}:\\d{2})\\b', meaning:'past event and time anchor' },
    { id:'because-clause', pattern:'\\bbecause\\s+[^.!?]+', meaning:'basic causal clause; causality still needs evidence' },
    { id:'possibility-may', pattern:'\\b(may|might|could)\\s+(have\\s+)?[a-z]+\\b', meaning:'possibility or tentative claim' }
  ],
  B1: [
    { id:'reported-speech', pattern:'\\b(said|reported|claimed|stated)\\s+(that\\s+)?', meaning:'attributed proposition' },
    { id:'passive-event', pattern:'\\b(was|were|is|are)\\s+[a-z]+ed\\b', meaning:'passive event; actor may be omitted' },
    { id:'concessive-clause', pattern:'\\b(although|even though|while)\\s+[^.!?]+', meaning:'concession or contrast' }
  ],
  B2: [
    { id:'modal-perfect', pattern:'\\b(may|might|could|must|cannot)\\s+have\\s+[a-z]+ed?\\b', meaning:'modal perfect and epistemic strength' },
    { id:'qualified-inference', pattern:'\\b(seems|appears|is likely|is unlikely)\\s+to\\b', meaning:'qualified inference' },
    { id:'contrastive-link', pattern:'\\b(nevertheless|whereas|despite|consequently)\\b', meaning:'argument relation' }
  ],
  C1: [
    { id:'impersonal-reporting', pattern:'\\b(it is (possible|plausible|unlikely|unclear) that)\\b', meaning:'impersonal epistemic stance' },
    { id:'hedged-evidence', pattern:'\\b(cannot be ruled out|does not establish|is not demonstrable)\\b', meaning:'evidence limitation' },
    { id:'attribution-boundary', pattern:'\\b(the (report|record|analyst|witness) (indicates|suggests|states|qualified))\\b', meaning:'source attribution' }
  ],
  C2: [
    { id:'epistemic-underdetermination', pattern:'\\b(remains epistemically (underdetermined|indeterminate))\\b', meaning:'high-precision uncertainty' },
    { id:'non-entailment', pattern:'\\b(is not tantamount to|does not ipso facto entail)\\b', meaning:'logical non-entailment' },
    { id:'concessive-inversion', pattern:'\\b(be that as it may|notwithstanding that|albeit)\\b', meaning:'advanced concession' }
  ]
});

const LanguageDetectiveCefr = { CEFR_GRAMMAR_CATALOG, CEFR_CONSTRUCTION_PATTERNS, CEFR_ORDER, SEMANTIC_OPERATORS, getCefrProfile, validatePatternLevel };
if (typeof module !== 'undefined' && module.exports) module.exports = LanguageDetectiveCefr;
else if (typeof window !== 'undefined') window.EPIPHANY_LANGUAGE_DETECTIVE_CEFR = LanguageDetectiveCefr;
