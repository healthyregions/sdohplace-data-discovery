# Mode: Prompt-Side Ontology Context Injection

Use the provided HeroP Lab Suggested SDOH Ontology context as bounded grounding context.

First identify whether the user's question directly matches, specializes, or clearly aliases one or more ontology labels shown in the context.

When an ontology match exists:

- Generate `keyTerms` from exact ontology labels only.
- Prefer the most specific matching child concept.
- Include parent branch concepts when useful for query coverage.
- Include directly connected child concepts when they improve recall.
- Ignore the default five-term limit and include the ontology terms needed for the matched path and closely connected branch.
- Do not include non-ontology keywords in `keyTerms` or `suggestedQueries`.
- Do not create new ontology labels.
- Do not use ontology concepts that are not present in the context.
- In `thoughts`, state that prompt-side ontology context injection was used.
- In `thoughts`, state the matched ontology label or labels, the ontology chain or chains copied from the context, and the ontology terms used for search.
- Keep the decision trace concise and user-visible.

When no ontology match exists:

- State that no exact HeroP ontology match was found.
- Continue with the original general SDOH search behavior.
- Keep the output schema unchanged.

The ontology context is bounded by `<herop_sdoh_ontology_context>` and `</herop_sdoh_ontology_context>`. Treat only text inside those tags as ontology context.
