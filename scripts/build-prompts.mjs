import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markdownDir = path.join(root, "config", "prompt", "markdown");
const generatedDir = path.join(root, "config", "prompt", "generated");
const outputFile = path.join(generatedDir, "prompt_bundle.js");

const readMarkdown = async (fileName) =>
  readFile(path.join(markdownDir, fileName), "utf8");

const prompts = {
  baseSearchSystem: await readMarkdown("search-system.md"),
  modes: {
    off: await readMarkdown("mode-off.md"),
    deterministic: await readMarkdown("mode-deterministic.md"),
    prompt: await readMarkdown("mode-prompt.md"),
  },
  nonLatinInstruction: await readMarkdown("non-latin-instruction.md"),
};

const output = `export const promptMarkdown = ${JSON.stringify(prompts, null, 2)};

export function composeSearchPrompt(mode = "off", options = {}) {
  const normalizedMode = Object.prototype.hasOwnProperty.call(promptMarkdown.modes, mode)
    ? mode
    : "off";
  const chunks = [
    promptMarkdown.baseSearchSystem,
    promptMarkdown.modes[normalizedMode],
  ];
  if (normalizedMode === "prompt" && options.ontologyContext) {
    chunks.push("<herop_sdoh_ontology_context>");
    chunks.push(options.ontologyContext);
    chunks.push("</herop_sdoh_ontology_context>");
  }
  if (options.usesNonLatinScript) {
    chunks.push(promptMarkdown.nonLatinInstruction);
  }
  return chunks.filter(Boolean).join("\\n\\n").trim();
}
`;

await mkdir(generatedDir, { recursive: true });
await writeFile(outputFile, output);
