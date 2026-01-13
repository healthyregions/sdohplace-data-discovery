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
      return `<b>Good match</b>: this dataset contains relevant information in key fields like title and description for the term <b>${cleanTerm}</b>.`;
    }
    return `<b>Broad match</b>: this dataset may contain useful context or indirect references for the term <b>${cleanTerm}</b>.`;
  } else {
    return `<b>Synonym match</b>: this dataset may contain a possible related term found in this result for the term <b>${
      q.split("~")[0]
      }</b>.`;
  }
}
