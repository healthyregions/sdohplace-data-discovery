# Mode: Deterministic

The application attempts deterministic ontology matching in code before the LLM is called.

If this prompt reaches the LLM, no strict deterministic ontology match was selected for direct return. In that fallback case:

- Use the general SDOH search prompt.
- Do not claim that an ontology match was found.
- Do not invent ontology paths, ontology chains, or ontology labels.
- Keep the output schema unchanged.

If the application returns deterministic ontology results before calling the LLM, those results are generated from approved ontology labels, aliases, trigger phrases, and subclass paths only.
