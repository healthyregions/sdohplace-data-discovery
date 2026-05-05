import {
  HERO_LAB_ONTOLOGY_NAME,
  HERO_SDOH_ONTOLOGY,
} from "./ontology_context.js";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function conceptMatchTerms(concept) {
  return unique([
    concept.label,
    concept.label.replace(/-/g, " "),
    ...(concept.ontologyAliases || []),
    ...(concept.triggers || []),
  ]);
}

function phraseMatches(text, term) {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) {
    return false;
  }
  return new RegExp(`(^|\\s)${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(text);
}

function phraseSpecificity(normalizedTerm) {
  const words = normalizedTerm.split(" ").filter(Boolean).length;
  return Math.min(words * 2 + Math.floor(normalizedTerm.length / 8), 8);
}

function scoreConcept(text, concept) {
  const terms = conceptMatchTerms(concept);
  let score = 0;
  let matchedText = "";
  let matchedLength = 0;
  terms.forEach((term) => {
    if (!phraseMatches(text, term)) {
      return;
    }
    const normalizedLabel = normalizeText(concept.label);
    const normalizedTerm = normalizeText(term);
    const isOntologyTerm = normalizedTerm === normalizedLabel || (concept.ontologyAliases || []).map(normalizeText).includes(normalizedTerm);
    const termScore = (isOntologyTerm ? 100 : 100) + phraseSpecificity(normalizedTerm);
    if (termScore > score || (termScore === score && normalizedTerm.length > matchedLength)) {
      score = termScore;
      matchedText = term;
      matchedLength = normalizedTerm.length;
    }
  });
  return { score, matchedText, matchedLength };
}

function buildSolrQuery(concept) {
  const query = concept.label.replace(/-/g, " ");
  return `select?q=${encodeURIComponent(query)}&fq=(gbl_suppressed_b:false)&rows=1000`;
}

function formatPath(path) {
  return path.map((term) => `<i>${term}</i>`).join(" &gt; ");
}

function conceptByLabel(label) {
  return HERO_SDOH_ONTOLOGY.find((concept) => concept.label === label);
}

function conceptByTerm(term) {
  const normalizedTerm = normalizeText(term);
  return HERO_SDOH_ONTOLOGY.find((concept) =>
    conceptMatchTerms(concept).some((matchTerm) => normalizeText(matchTerm) === normalizedTerm)
  );
}

function childConcepts(parentLabel) {
  return HERO_SDOH_ONTOLOGY.filter((concept) => {
    const parentIndex = concept.path.indexOf(parentLabel);
    return parentIndex > -1 && concept.path.length === parentIndex + 2;
  });
}

function searchConceptsFromPrimaryMatch(primaryMatch) {
  const topConcept = conceptByLabel(primaryMatch.path[0]);
  const branchLabel = primaryMatch.path[1] || primaryMatch.term;
  const branchConcept = conceptByLabel(branchLabel);
  const branchChildren = childConcepts(branchLabel);
  return unique([topConcept, branchConcept, ...branchChildren]).filter(Boolean);
}

function searchConceptsFromMatch(match) {
  return searchConceptsFromPrimaryMatch(match);
}

function ancestorConcepts(concept) {
  return concept.path
    .slice(0, -1)
    .map((label) => conceptByLabel(label))
    .filter(Boolean);
}

function promptExpansionForConcept(concept) {
  return unique([
    ...ancestorConcepts(concept),
    concept,
    ...childConcepts(concept.label),
  ]).filter(Boolean);
}

function ontologyConceptsFromKeyTerms(keyTerms = []) {
  return keyTerms
    .map((item) => (typeof item === "string" ? item : item?.term))
    .filter(Boolean)
    .map((term) => conceptByTerm(term))
    .filter(Boolean);
}

function comprehensiveOntologyConcepts(question, keyTerms = []) {
  const questionMatches = findOntologyMatches(question, 10);
  const questionConcepts = questionMatches
    .map((match) => conceptByLabel(match.term))
    .filter(Boolean);
  const keyTermConcepts = ontologyConceptsFromKeyTerms(keyTerms);
  const seedConcepts = unique([...questionConcepts, ...keyTermConcepts]);
  const expandedConcepts = seedConcepts.flatMap((concept) => promptExpansionForConcept(concept));
  return unique(expandedConcepts).filter(Boolean);
}

function formatChainList(concepts) {
  return concepts
    .map((concept) => `&bull; ${formatPath(concept.path)}`)
    .join("<br/>");
}

function relationshipToPrimary(concept, primaryMatch) {
  if (!primaryMatch) {
    return "selected ontology term";
  }
  if (concept.label === primaryMatch.term) {
    return "direct match";
  }
  if (primaryMatch.path.includes(concept.label)) {
    return "parent";
  }
  if (
    concept.path.length > primaryMatch.path.length &&
    primaryMatch.path.every((term, index) => concept.path[index] === term)
  ) {
    return "child";
  }
  if (concept.path[0] === primaryMatch.path[0]) {
    if (concept.path.length === 2) {
      return `sibling under ${concept.path[0]}`;
    }
    return `separate branch under ${concept.path[0]}`;
  }
  return "separate ontology branch";
}

export function buildPromptOntologyTrace(question, keyTerms = []) {
  const keyTermConcepts = ontologyConceptsFromKeyTerms(keyTerms);
  const matchedQuestionConcepts = findOntologyMatches(question, 3)
    .map((match) => conceptByLabel(match.term));
  const concepts = unique([...matchedQuestionConcepts, ...keyTermConcepts]).filter(Boolean);
  if (concepts.length === 0) {
    return "";
  }
  const primaryMatch = findOntologyMatches(question, 1)[0] || null;
  const chainRows = concepts.map(
    (concept) =>
      `&bull; <i>${concept.label}</i>: ${relationshipToPrimary(concept, primaryMatch)}, ${formatPath(concept.path)}`
  );
  return `<br/><b>Ontology chains for matched and prompt-selected terms:</b><br/>${chainRows.join("<br/>")}<br/>`;
}

export function applyPromptOntologySearchTerms(question, analysis) {
  const ontologyConcepts = comprehensiveOntologyConcepts(question, analysis.keyTerms);
  if (ontologyConcepts.length === 0) {
    return analysis;
  }
  const searchedTerms = ontologyConcepts.map((concept) => `<i>${concept.label}</i>`).join(", ");
  return {
    ...analysis,
    promptGeneratedKeyTerms: analysis.keyTerms || [],
    thoughts:
      `After prompt-side ontology matching, the app replaced the general five-term LLM list with ${ontologyConcepts.length} matched terms from ${HERO_LAB_ONTOLOGY_NAME}. ` +
      `The search uses ontology-derived terms only: ${searchedTerms}. ` +
      `<b>If you didn't see the expected results, please try our term search instead.</b>`,
    keyTerms: ontologyConcepts.map((concept, index) => ({
      term: concept.label,
      score: Math.max(100 - index, 70),
      reason: `Selected from ${HERO_LAB_ONTOLOGY_NAME} OWL path: ${formatPath(concept.path)}`,
    })),
    suggestedQueries: ontologyConcepts.map((concept) => buildSolrQuery(concept)),
  };
}

export function findOntologyMatches(question, limit = 5) {
  const normalizedQuestion = normalizeText(question);
  if (!normalizedQuestion) {
    return [];
  }
  return HERO_SDOH_ONTOLOGY.map((concept) => {
    const { score, matchedText, matchedLength } = scoreConcept(normalizedQuestion, concept);
    return {
      id: concept.id,
      term: concept.label,
      score,
      reason: matchedText
        ? `Matched by ${HERO_LAB_ONTOLOGY_NAME}: ${formatPath(concept.path)}`
        : "",
      path: concept.path,
      matchedText,
      matchedLength,
    };
  })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || b.matchedLength - a.matchedLength || b.path.length - a.path.length || a.term.localeCompare(b.term))
    .slice(0, limit);
}

export function buildOntologyAnalysis(question, limit = 5) {
  const ontologyMatches = findOntologyMatches(question, limit);
  if (ontologyMatches.length === 0) {
    return null;
  }
  const primaryMatch = ontologyMatches[0];
  const searchConcepts = searchConceptsFromPrimaryMatch(primaryMatch);
  const searchedTerms = searchConcepts.map((concept) => `<i>${concept.label}</i>`).join(", ");
  const branchLabel = primaryMatch.path[1] || primaryMatch.term;
  const chainList = formatChainList(searchConcepts);
  const thoughts =
    `<b>Ontology strategy:</b> Deterministic matcher. The app matched the question in code against HeroP Lab's Suggested SDOH Ontology before calling the LLM; because a strict ontology match was found, the LLM did not create or choose ontology terms.<br/>` +
    `Using <b>${HERO_LAB_ONTOLOGY_NAME}</b>, I normalized the question text and matched it only against approved ontology labels, aliases, and curated trigger phrases; the highest-scoring direct concept is <i>${primaryMatch.term}</i> on the path ${formatPath(primaryMatch.path)}. ` +
    `Following the OWL subclass chain, the search uses the top branch, the corresponding branch concept, and direct child concepts under <i>${branchLabel}</i>: ${searchedTerms}; concepts outside that branch are not added. ` +
    `<br/><b>Full ontology chains searched:</b><br/>${chainList} ` +
    `<br/><b>If you didn't see the expected results, please try our term search instead.</b>`;
  return {
    thoughts,
    keyTerms: searchConcepts.map((concept, index) => ({
      term: concept.label,
      score: index === 0 ? 100 : Math.max(95 - index, 70),
      reason: `Selected from ${HERO_LAB_ONTOLOGY_NAME} OWL path: ${formatPath(concept.path)}`,
    })),
    suggestedQueries: searchConcepts.map((concept) => buildSolrQuery(concept)),
    bbox: "",
    ontologyMatches,
    ontologySource: HERO_LAB_ONTOLOGY_NAME,
    ontologySourceFile: "config/prompt/food_ontology.owl",
  };
}
