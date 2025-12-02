import { SolrObject } from "meta/interface/SolrObject";

interface ScoreFilterConfig {
  dropThreshold: number;
  minimumScore: number;
}

export const scoreConfig: ScoreFilterConfig = {
  dropThreshold: 1.5,
  minimumScore: 1,
};

export function adaptiveScoreFilter(docs: SolrObject[]): SolrObject[] {
  return docs;
}

export function getScoreExplanation(
  q: string,
  spellcheck: string,
  currentQuery: string,
  score: number,
  avgScore: number,
  maxScore: number
): string {
  if (!q || q === "*" || currentQuery === "*") return;
  const cleanTerm = q.replace(/,/g, '"').replace(/"/g, " ");
  if (!spellcheck) {
    if (score >= avgScore) {
      return `<b>Good match</b> for <b>${cleanTerm}</b>: this dataset contains relevant information in key fields like title and description.`;
    }
    return `<b>Related match</b> for <b>${cleanTerm}</b>: this dataset may contain useful context or indirect references.`;
  } else {
    return `<b>Synonym match</b> for <b>${
      q.split("~")[0]
      }</b>: this dataset may contain a possible related term found in this result.`;
  }
}
