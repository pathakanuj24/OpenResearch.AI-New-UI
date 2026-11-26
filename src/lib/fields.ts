/** Field identity: each academic field gets a token hue + a cover pattern. The name is always shown with it. */
export type FieldKey = "econ" | "bio" | "earth" | "hist" | "phys" | "law" | "psy" | "none";

const RULES: [FieldKey, RegExp][] = [
  ["econ", /econ|financ|business|trade|labou?r|market|account|management|commerce/i],
  ["bio", /bio|medic|clinic|health|genet|immun|neuro(?!.*psych)|ecolog|pharm|cell|molec|nurs|epidem|agric|zoolog|botan/i],
  ["earth", /earth|climat|geo|ocean|atmos|environ|hydro|meteor|soil|planet/i],
  ["hist", /hist|humanit|literat|philos|art|classic|archae|religio|linguist|music|cultur|anthrop/i],
  ["phys", /phys|math|astro|chem|engineer|comput|stat|material|quantum|electr|mechan|informat/i],
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
