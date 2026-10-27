import type { SkinParameter, QuestionnaireAnswers, Scan, TopConcern } from "@/types";

interface GenerateScanParams {
  customerId: string;
  customerName: string;
  questionnaire: QuestionnaireAnswers;
  parameters: SkinParameter[];
  thumbnails?: {
    front: string;
    left?: string;
    right?: string;
  };
  seed?: number;
}

// Simple deterministic pseudo-random number generator for seeded variation
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateScan({
  customerId,
  customerName,
  questionnaire,
  parameters,
  thumbnails,
  seed = Date.now(),
}: GenerateScanParams): Scan {
  const activeParams = parameters.filter((p) => p.status === "active");
  const parameterScores: Record<string, number> = {};

  // Default fallback thumbnails if not provided (SVG data / curated avatar)
  const finalThumbnails = thumbnails || {
    front: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    left: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    right: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  };

  const skinType = questionnaire.skinType || "combination";
  const concerns = questionnaire.skinConcerns || [];
  const age = questionnaire.ageRange || "23-32";
  const sun = questionnaire.sunExposure || "1 – 3 hours";
  const sleep = questionnaire.sleepHours || "7 – 8 hours";
  const water = questionnaire.waterIntake || "1.5 – 2.5 Liters";
  const stress = questionnaire.stressLevel || "Moderate";

  activeParams.forEach((param, idx) => {
    let score = 82; // Baseline healthy score

    const key = param.slug || param.aiKey;
    const rnd = (pseudoRandom(seed + idx * 17) - 0.5) * 6; // +/- 3 pts natural variation

    switch (key) {
      case "hydration":
        score = 80;
        if (skinType === "dry") score -= 22;
        if (skinType === "sensitive") score -= 12;
        if (water.includes("< 1.5")) score -= 10;
        if (concerns.includes("Dehydration")) score -= 15;
        break;

      case "oil_balance":
      case "sebum":
        score = 84;
        if (skinType === "oily") score -= 26; // High sebum = lower balance score
        if (skinType === "combination") score -= 14;
        if (concerns.includes("Enlarged Pores") || concerns.includes("Acne")) score -= 15;
        break;

      case "pigmentation":
        score = 85;
        if (sun.includes("3 – 5") || sun.includes("5+")) score -= 18;
        if (concerns.includes("Pigmentation")) score -= 24;
        if (age === "33-45" || age === "46+") score -= 10;
        break;

      case "fine_lines":
        score = 88;
        if (age === "33-45") score -= 16;
        if (age === "46+") score -= 28;
        if (sleep.includes("< 5") || sleep.includes("5 – 6")) score -= 12;
        if (stress.includes("High")) score -= 10;
        if (concerns.includes("Fine Lines")) score -= 15;
        break;

      case "redness_sensitivity":
        score = 86;
        if (skinType === "sensitive") score -= 32;
        if (concerns.includes("Redness")) score -= 22;
        if (stress.includes("High")) score -= 8;
        break;

      case "pore_visibility":
        score = 82;
        if (skinType === "oily") score -= 20;
        if (skinType === "combination") score -= 12;
        if (concerns.includes("Enlarged Pores")) score -= 22;
        break;

      case "texture":
        score = 84;
        if (questionnaire.currentRoutine === "none") score -= 16;
        if (concerns.includes("Dullness")) score -= 18;
        if (age === "46+") score -= 10;
        break;

      case "elasticity":
      case "barrier_health":
        score = 86;
        if (sleep.includes("< 5")) score -= 15;
        if (stress.includes("High")) score -= 12;
        if (age === "46+") score -= 20;
        break;

      default:
        score = 80;
    }

    // Clamp score between 28 and 98 with natural float jitter
    const finalScore = Math.max(28, Math.min(98, Math.round(score + rnd)));
    parameterScores[param.id] = finalScore;
  });

  // Calculate normalized weighted overall score
  const totalWeight = activeParams.reduce((acc, p) => acc + (p.weight || 1), 0);
  const weightedSum = activeParams.reduce((acc, p) => {
    const s = parameterScores[p.id] || 75;
    const w = p.weight || 1;
    return acc + s * w;
  }, 0);

  const overallScore = Math.round(weightedSum / (totalWeight || 1));

  // Determine Top 3 Concerns (parameters with lowest scores)
  const ranked = activeParams
    .map((p) => {
      const score = parameterScores[p.id] || 75;
      let band: "low" | "medium" | "high" = "medium";
      if (score < 60) band = "low";
      else if (score >= 80) band = "high";

      const interpretationText = p.interpretation ? p.interpretation[band] : "Within standard biological thresholds.";

      let focusTip = "Maintain consistent morning protection and evening hydration.";
      if (score < 60) {
        focusTip = "Priority intervention: Introduce high-affinity barrier actives and MD supervision.";
      } else if (score < 80) {
        focusTip = "Targeted optimization: Layer synergistic antioxidant and peptide concentrates.";
      }

      return {
        parameterId: p.id,
        name: p.name,
        score,
        rank: 0,
        interpretation: interpretationText,
        focusTip,
        icon: p.icon,
      };
    })
    .sort((a, b) => a.score - b.score);

  const topConcerns: TopConcern[] = ranked.slice(0, 3).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const scanId = `scan-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  return {
    id: scanId,
    customerId: customerId || "cust-1",
    customerName: customerName || "Radhika Singhania",
    createdAt: new Date().toISOString(),
    status: "completed",
    thumbnails: finalThumbnails,
    overallScore,
    qualityScore: Math.round(92 + (pseudoRandom(seed + 99) * 7)), // 92-99%
    parameterScores,
    topConcerns,
    versionMetadata: {
      analysisVersion: "sim-1.0",
      parametersVersion: "v1.2",
    },
    notes: "Multi-spectral AI diagnostic session with facial topology reconstruction.",
  };
}

/**
 * Shared helper to extract a parameter's score from scan.parameterScores
 * supporting lookup by param.id, slug, underscored slug, or aiKey.
 * Returns undefined if the score was not analysed in this scan.
 */
export function getParameterScore(
  scan: { parameterScores?: Record<string, number> } | null | undefined,
  param: SkinParameter
): number | undefined {
  if (!scan?.parameterScores) return undefined;
  const scores = scan.parameterScores;

  if (typeof scores[param.id] === "number" && !isNaN(scores[param.id])) {
    return scores[param.id];
  }
  if (param.slug && typeof scores[param.slug] === "number" && !isNaN(scores[param.slug])) {
    return scores[param.slug];
  }
  if (param.slug) {
    const underscored = param.slug.replace(/-/g, "_");
    if (typeof scores[underscored] === "number" && !isNaN(scores[underscored])) {
      return scores[underscored];
    }
    const hyphenated = param.slug.replace(/_/g, "-");
    if (typeof scores[hyphenated] === "number" && !isNaN(scores[hyphenated])) {
      return scores[hyphenated];
    }
  }
  if (param.aiKey && typeof scores[param.aiKey] === "number" && !isNaN(scores[param.aiKey])) {
    return scores[param.aiKey];
  }
  return undefined;
}

/**
 * Shared pure function to compute a scan's overall score dynamically
 * using live active parameters and their weights.
 * Normalizes weights across all analysed active parameters:
 * normalizedWeight = weight / totalAnalysedWeight
 * Multiplies each parameter score by its normalized weight and rounds to nearest integer.
 * Active parameters without a score in this scan are excluded from the average.
 */
export function computeOverallScore(
  scan: { parameterScores: Record<string, number> },
  parameters: SkinParameter[]
): number {
  const activeParams = (parameters || []).filter((p) => p.status === "active");
  if (activeParams.length === 0) return 80;

  // Filter only active parameters that were analysed in this scan
  const analysedPairs: Array<{ param: SkinParameter; score: number }> = [];
  for (const p of activeParams) {
    const score = getParameterScore(scan, p);
    if (typeof score === "number" && !isNaN(score)) {
      analysedPairs.push({ param: p, score });
    }
  }

  if (analysedPairs.length === 0) return 80;

  const totalAnalysedWeight = analysedPairs.reduce(
    (sum, item) => sum + (item.param.weight || 0.1),
    0
  );
  if (totalAnalysedWeight <= 0) return 80;

  const weightedSum = analysedPairs.reduce((acc, item) => {
    const normalizedWeight = (item.param.weight || 0.1) / totalAnalysedWeight;
    return acc + item.score * normalizedWeight;
  }, 0);

  return Math.round(weightedSum);
}

/**
 * Recomputes a scan's overall score and top concerns dynamically against any set of parameters.
 * Uses computeOverallScore as the single source of truth for overallScore.
 * If a parameter is disabled or not analysed, it is cleanly omitted from calculation.
 */
export function recomputeScanWithParameters(
  scan: Scan,
  parameters: SkinParameter[]
): {
  overallScore: number;
  topConcerns: TopConcern[];
  activeScores: Record<string, number>;
  activeParameters: SkinParameter[];
  unanalysedParameters: SkinParameter[];
} {
  const activeParams = parameters.filter((p) => p.status === "active");
  const overallScore = computeOverallScore(scan, parameters);

  const activeScores: Record<string, number> = {};
  const analysedParams: Array<{ param: SkinParameter; score: number }> = [];
  const unanalysedParameters: SkinParameter[] = [];

  activeParams.forEach((p) => {
    const score = getParameterScore(scan, p);
    if (typeof score === "number" && !isNaN(score)) {
      activeScores[p.id] = score;
      analysedParams.push({ param: p, score });
    } else {
      unanalysedParameters.push(p);
    }
  });

  const ranked = analysedParams
    .map(({ param: p, score }) => {
      let band: "low" | "medium" | "high" = "medium";
      if (score < 60) band = "low";
      else if (score >= 80) band = "high";

      const interpretationText = p.interpretation
        ? p.interpretation[band]
        : "Within standard biological thresholds.";

      let focusTip = "Maintain consistent morning protection and evening hydration.";
      if (score < 60) {
        focusTip = "Priority intervention: Introduce high-affinity barrier actives and MD supervision.";
      } else if (score < 80) {
        focusTip = "Targeted optimization: Layer synergistic antioxidant and peptide concentrates.";
      }

      return {
        parameterId: p.id,
        name: p.name,
        score,
        rank: 0,
        interpretation: interpretationText,
        focusTip,
        icon: p.icon,
      };
    })
    .sort((a, b) => a.score - b.score);

  const topConcerns: TopConcern[] = ranked.slice(0, 3).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  return {
    overallScore,
    topConcerns,
    activeScores,
    activeParameters: activeParams,
    unanalysedParameters,
  };
}
