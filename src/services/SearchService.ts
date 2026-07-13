import SolrQueryBuilder from "../components/search/helper/SolrQueryBuilder";
import { findSolrAttribute } from "meta/helper/util";
import { 
  SearchResult, 
  deduplicateResults, 
  executeQueries, 
  fetchChatGptAnalysis, 
  fetchSuggestionsFromSolr, 
  processSolrResults 
} from "../components/search/helper/SearchUtils";
import { createLocalParser } from "../components/search/helper/LocalQuestionParser";

export class SearchService {
  private queryBuilder: SolrQueryBuilder;
  private localParser = createLocalParser();
  private enableLocalFallback: boolean;
  constructor(schema: any, enableLocalFallback: boolean = true) {
    this.queryBuilder = new SolrQueryBuilder();
    this.queryBuilder.setSchema(schema);
    this.enableLocalFallback = enableLocalFallback;
  }

  async fetchNoResultThemeRecommendations(limit: number = 3): Promise<string[]> {
    const schema = this.queryBuilder.getSchema();
    if (!schema || !Array.isArray((schema as any).fields)) {
      return [];
    }
    const subjectField = findSolrAttribute("subject", schema);
    this.queryBuilder.facetQuery("subject", limit, 1);
    const { facetFields } = await this.queryBuilder.fetchResult(undefined, true);
    const facetValues = facetFields?.[subjectField];
    if (!Array.isArray(facetValues)) {
      return [];
    }
    const themes = [];
    for (let i = 0; i < facetValues.length; i += 2) {
      const theme = facetValues[i];
      const count = Number(facetValues[i + 1]);
      if (typeof theme === "string" && theme.trim() !== "" && count > 0) {
        themes.push(theme);
      }
    }
    return themes;
  }

  async performChatGptSearch(
    question: string,
    filterQueries: Array<any>
  ): Promise<SearchResult> {
    try {
      const analysis = await fetchChatGptAnalysis(question);
      if (!analysis.suggestedQueries || analysis.suggestedQueries.length === 0) {
        return {
          searchResults: [],
          relatedResults: [],
          suggestions: [],
          originalQuery: question,
          usedQuery: "",
          usedSpellCheck: false,
          analysis,
        };
      }      
      const combinedResults = await executeQueries(
        analysis.suggestedQueries,
        this.queryBuilder
      );
      let uniqueResults = deduplicateResults(combinedResults);
      let relatedResults = [];
      return {
        searchResults: uniqueResults,
        relatedResults,
        suggestions: [],
        originalQuery: question,
        usedQuery: analysis.suggestedQueries.join(", "),
        usedSpellCheck: false,
        analysis,
      };
          } catch (error) {
        if (this.enableLocalFallback) {
          console.warn("AI search failed, falling back to local parser:", error.message);
          return this.performLocalFallbackSearch(question, filterQueries, error.message);
        }
        if (error.message.includes("ChatGPT search failed")) {
          throw error;
        } else if (error.message.includes("Failed to get search strategy")) {
          throw new Error(`AI search service error: ${error.message}. Please try switching to keyword search using the toggle above the search box.`);
        } else {
          throw new Error(`AI search failed: ${error.message}. Please try switching to keyword search using the toggle above the search box.`);
        }
      }
  }

  private async performLocalFallbackSearch(
    question: string, 
    filterQueries: Array<any>,
    originalError: string
  ): Promise<SearchResult> {
    try {
      const parsed = this.localParser.parseQuestion(question);
      const queries = this.localParser.generateSolrQueries(parsed);
      const combinedResults = await executeQueries(queries, this.queryBuilder);
      const uniqueResults = deduplicateResults(combinedResults);
      const getErrorContext = (error: string) => {
        if (error.includes('Failed to get search strategy') || error.includes('500')) {
          return 'The ChatGPT API service experienced a server error or became temporarily unavailable.';
        } else if (error.includes('Network') || error.includes('fetch')) {
          return 'A network connectivity issue prevented reaching the AI service.';
        } else if (error.includes('ChatGPT search failed')) {
          return 'The OpenAI ChatGPT API returned an error response.';
        } else {
          return 'The AI search service encountered an unexpected error.';
        }
      };
      const fallbackAnalysis = {
        thoughts: `<b>AI Search Issue:</b> ${getErrorContext(originalError)}. Therefore using local semantic processing. <br/><br/>Our system analyzed your question using custom linguistic processing with SDOH-specific domain knowledge. The process included stemming, morphological analysis, and semantic expansion from our curated health equity database to extract meaningful search terms. 
        <b>If you are seeing unexpected results, please switch to Keyword Search mode.</b><br/><br/><b>Extracted keywords:</b> <b>${parsed.keywords.join('</b>, <b>')}</b>.`,
        keyTerms: parsed.keywords.map(keyword => ({
          term: keyword,
          score: 70,
          reason: `Extracted from question by local parser`
        })),
        suggestedQueries: queries
      };
      return {
        searchResults: uniqueResults,
        relatedResults: [],
        suggestions: [],
        originalQuery: question,
        usedQuery: `Local parsing: ${parsed.keywords.join(', ')}`,
        usedSpellCheck: false,
        analysis: fallbackAnalysis,
      };
    } catch (error) {
      throw new Error(`Local fallback search failed: ${error.message}. Please try switching to keyword search using the toggle above the search box.`);
    }
  }

  async fetchSearchWithRelated(
    query: string,
    filterQueries: Array<any>,
    sortBy?: string,
    sortOrder?: string,
    skipCache: boolean = false,
    isAiSearch: boolean = false,
    bypassSpellCheck: boolean = false
  ): Promise<SearchResult> {
    this.queryBuilder.combineQueries(query, filterQueries);
    const { results: searchResults, spellCheckSuggestion, yearBounds: initialYearBounds } =
      await this.queryBuilder.fetchResult(undefined, skipCache || bypassSpellCheck);
    let finalResults = searchResults;
    let yearBounds = initialYearBounds || null;
    let usedQuery = query;
    let usedSpellCheck = false;
    if (
      !bypassSpellCheck &&
      (!searchResults || searchResults.length === 0) &&
      spellCheckSuggestion &&
      spellCheckSuggestion !== query
    ) {
      this.queryBuilder.combineQueries(
        spellCheckSuggestion,
        filterQueries
      );
      const { results: spellCheckResults, yearBounds: spellCheckYearBounds } =
        await this.queryBuilder.fetchResult(undefined, skipCache);
      if (spellCheckResults && spellCheckResults.length > 0) {
        finalResults = spellCheckResults;
        yearBounds = spellCheckYearBounds || yearBounds;
        usedQuery = spellCheckSuggestion;
        usedSpellCheck = true;
      }
    }
    finalResults = processSolrResults(finalResults);
    return {
      searchResults: finalResults,
      relatedResults: [],
      suggestions: [], // Always return empty suggestions to prevent related results fetching
      originalQuery: query,
      usedQuery,
      usedSpellCheck,
      yearBounds,
    };
  }

  async getSearchSuggestions(term: string): Promise<string[]> {
    return fetchSuggestionsFromSolr(term, this.queryBuilder);
  }
} 
