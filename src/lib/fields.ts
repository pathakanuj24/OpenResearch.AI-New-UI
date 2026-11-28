/** Field identity: each academic field gets a token hue + a cover pattern. The name is always shown with it. */
export type FieldKey = "ai" | "cs" | "eng" | "math" | "econ" | "bio" | "earth" | "hist" | "phys" | "law" | "psy" | "none";

// Order matters: the first rule that matches wins (AI before CS; biology before CS so bioinformatics stays bio).
const RULES: [FieldKey, RegExp][] = [
  ["ai", /\bai\b|artificial intel|machine learn|deep learn|neural net|language model|\bllms?\b|\bnlp\b|natural language|computer vision|reinforcement learn|generative/i],
  ["econ", /econ|financ|business|trade|labou?r|market|account|management|commerce/i],
  ["bio", /bio|medic|clinic|health|genet|immun|neuro(?!.*psych)|ecolog|pharm|cell|molec|nurs|epidem|agric|zoolog|botan/i],
  ["cs", /comput|informat|software|data science|cyber|algorithm|database|network|programming|\bhci\b|human.computer/i],
  ["earth", /earth|climat|geo|ocean|atmos|environ|hydro|meteor|soil|planet/i],
  ["hist", /hist|humanit|literat|philos|art|classic|archae|religio|linguist|music|cultur|anthrop/i],
  ["math", /math|statist|probab|algebra|geometr|topolog|calculus|combinator|number theory|logic/i],
  ["eng", /engineer|mechan|electr|civil|aerospace|aeronaut|material|robot|manufactur|control system|signal process/i],
  ["phys", /phys|astro|chem|quantum|optic|nuclear|particle|thermo/i],
  ["law", /law|legal|polit|govern|public policy|jurispr|international relations|criminol/i],
  ["psy", /psych|cognit|behavio|social|sociol|educat|communic/i],
];

export function fieldKey(field?: string | null): FieldKey {
  if (!field) return "none";
  for (const [key, re] of RULES) if (re.test(field)) return key;
  return "none";
}

export const fieldVar = (k: FieldKey) => `var(--f-${k})`;

export const FIELD_LABEL: Record<FieldKey, string> = {
  ai: "AI Engineering", cs: "Computer Science", eng: "Engineering", math: "Mathematics",
  econ: "Economics", bio: "Biology", earth: "Earth science", hist: "History",
  phys: "Physics", law: "Law", psy: "Psychology", none: "Other",
};

/** Deterministic 0..1 generator from a string, for stable generated covers. */
export function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
