import type {
  Product,
  Scan,
  QuestionnaireAnswers,
  SkinParameter,
  Seller,
  InventoryItem,
  Offer,
  ProductRecommendation,
  GroupedRecommendations,
  RecommendationMatchReason,
  RecommendationParameterFit,
  RecommendationRule,
  PlatformSettings,
} from "@/types";
import { COMMERCE_CONFIG } from "@/config/commerce";

export interface RecommendationEngineInput {
  scan: Scan | null;
  questionnaire?: QuestionnaireAnswers | null;
  parameters: SkinParameter[];
  products: Product[];
  sellers: Seller[];
  inventory: InventoryItem[];
  rules?: RecommendationRule[];
  platformSettings?: PlatformSettings;
}

/**
 * Pure, deterministic, explainable, and SELLER-INDEPENDENT Recommendation Engine.
 * Dynamic: reads parameters, active status and weights at runtime from store.
 */
export function generateRecommendations(
  input: RecommendationEngineInput
): GroupedRecommendations {
  const { scan, questionnaire, parameters, products, sellers, inventory } = input;

  // 1. Create seller lookups (Approved sellers only)
  const approvedSellersMap = new Map<string, Seller>();
  sellers.forEach((s) => {
    if (s.status === "approved" && !s.isPaused) {
      approvedSellersMap.set(s.id, s);
    }
  });

  // 2. Group inventory offers by productId
  const offersByProduct = new Map<string, Offer[]>();
  inventory.forEach((inv) => {
    if (inv.status === "inactive") return;
    const seller = approvedSellersMap.get(inv.sellerId);
    if (!seller) return;

    const availableStock = Math.max(0, inv.stock - (inv.reserved || 0));
    const offer: Offer = {
      id: inv.id,
      sellerId: seller.id,
      company: seller.company,
      legalName: seller.legalName,
      rating: seller.rating,
      deliveryDays: seller.deliveryDays,
      price: inv.price,
      mrp: inv.mrp,
      stock: inv.stock,
      reserved: inv.reserved || 0,
      availableStock,
      state: seller.state,
      city: seller.city,
    };

    const existing = offersByProduct.get(inv.productId) || [];
    existing.push(offer);
    offersByProduct.set(inv.productId, existing);
  });

  // Sort offers per product to select Best Offer
  offersByProduct.forEach((offers) => {
    offers.sort((a, b) => {
      // In-stock first
      if (a.availableStock > 0 && b.availableStock <= 0) return -1;
      if (b.availableStock > 0 && a.availableStock <= 0) return 1;
      // Lowest price
      if (a.price !== b.price) return a.price - b.price;
      // Highest rating
      if (b.rating !== a.rating) return b.rating - a.rating;
      // Fastest delivery
      return a.deliveryDays - b.deliveryDays;
    });

    if (offers.length > 0) {
      offers[0].isBestOffer = true;
    }
  });

  // 3. Active parameters from store (joined with weights)
  const activeParams = parameters.filter((p) => p.status === "active");
  const totalWeight = activeParams.reduce((acc, p) => acc + (p.weight || 1), 0) || 1;

  // Customer answers
  const userSkinType = questionnaire?.skinType?.toLowerCase() || "";
  const userConcerns = questionnaire?.skinConcerns || [];
  const userAllergies = questionnaire?.allergies || [];
  const isPregnantOrNursing =
    questionnaire?.pregnantOrNursing === "pregnant" ||
    questionnaire?.pregnantOrNursing === "nursing" ||
    questionnaire?.pregnantOrNursing === "yes";

  // Parameter score map from latest scan
  const paramScoreMap = scan?.parameterScores || {};

  // Find lowest scoring parameters (greatest need)
  const sortedNeeds = activeParams
    .map((p) => {
      const score = paramScoreMap[p.id] ?? 80;
      return { param: p, score, deficit: 100 - score };
    })
    .sort((a, b) => b.deficit - a.deficit);

  const lowestParam = sortedNeeds.length > 0 ? sortedNeeds[0] : null;

  // Process all products
  const scoredRecommendations: ProductRecommendation[] = [];
  const excludedProducts: ProductRecommendation[] = [];

  for (const product of products) {
    if (product.status !== "active") continue;

    const offers = offersByProduct.get(product.id) || [];
    const bestOffer = offers.length > 0 ? offers[0] : null;
    const inStock = offers.some((o) => o.availableStock > 0);

    // Stage 1: Hard exclusions
    let isExcluded = false;
    let exclusionReason = "";

    // A. Pregnancy / Nursing Safety Check
    if (isPregnantOrNursing) {
      const pNameLower = product.name.toLowerCase();
      const pDescLower = product.description.toLowerCase();
      const contraLower = (product.contraindications || []).map((c) => c.toLowerCase());
      const hasRetinoid =
        pNameLower.includes("retin") ||
        pDescLower.includes("retinol") ||
        pDescLower.includes("retinal") ||
        contraLower.some((c) => c.includes("pregnancy") || c.includes("nursing") || c.includes("retin"));

      if (hasRetinoid) {
        isExcluded = true;
        exclusionReason = "Contraindicated for pregnancy / nursing (contains active retinoid/retinal)";
      }
    }

    // B. Allergy & Sensitivity Check
    if (!isExcluded && userAllergies.length > 0 && !userAllergies.includes("none")) {
      for (const allergy of userAllergies) {
        const allergenLower = allergy.toLowerCase();
        const conflict =
          product.name.toLowerCase().includes(allergenLower) ||
          product.description.toLowerCase().includes(allergenLower) ||
          (product.contraindications || []).some((c) => c.toLowerCase().includes(allergenLower));

        if (conflict) {
          isExcluded = true;
          exclusionReason = `Contains or conflicts with noted sensitivity: ${allergy}`;
          break;
        }
      }
    }

    // Parameter breakdown computation
    const reasons: RecommendationMatchReason[] = [];
    const breakdown: RecommendationParameterFit[] = [];
    let weightedBenefitSum = 0;
    let maxPossibleScore = 0;

    for (const p of activeParams) {
      const userScore = paramScoreMap[p.id] ?? 80;
      const need = (100 - userScore) / 100; // 0 (perfect) to 1 (high need)
      const weight = p.weight || 1;

      // Product benefit from targetParameters (-1 to 3)
      // Check both p.slug (e.g. "hydration") and p.id
      const benefitLevel =
        product.targetParameters[p.slug] ??
        product.targetParameters[p.id] ??
        product.targetParameters[p.slug.replace("-", "_")] ??
        0;

      let impactLevel: RecommendationParameterFit["impactLevel"] = "neutral";
      let impactLabel = "Neutral fit";

      if (benefitLevel >= 2) {
        impactLevel = "strong_fit";
        impactLabel = `+++ High positive action for ${p.name}`;
      } else if (benefitLevel === 1) {
        impactLevel = "moderate_fit";
        impactLabel = `+ Supports ${p.name}`;
      } else if (benefitLevel < 0) {
        impactLevel = "caution";
        impactLabel = `- May aggravate ${p.name}`;
      }

      breakdown.push({
        parameterId: p.id,
        parameterSlug: p.slug,
        parameterName: p.name,
        userScore,
        productBenefit: benefitLevel,
        impactLevel,
        label: impactLabel,
      });

      // Positive levels add match, negative subtracts
      weightedBenefitSum += benefitLevel * need * weight;
      maxPossibleScore += 3 * 1.0 * weight; // Maximum theoretical benefit
    }

    // Skin type bonus
    let skinTypeMatch = false;
    if (userSkinType && product.suitableSkinTypes) {
      const match = product.suitableSkinTypes.some((st) => {
        const stLower = st.toLowerCase();
        return stLower === "all" || stLower.includes(userSkinType) || userSkinType.includes(stLower);
      });
      if (match) {
        skinTypeMatch = true;
        reasons.push({
          code: "SKIN_TYPE",
          label: `Suits ${userSkinType} skin`,
          type: "positive",
        });
      }
    }

    // Concern tag match
    let concernMatchCount = 0;
    if (userConcerns.length > 0 && product.concernTags) {
      userConcerns.forEach((uc) => {
        const ucLower = uc.toLowerCase();
        if (product.concernTags.some((ct) => ct.toLowerCase().includes(ucLower) || ucLower.includes(ct.toLowerCase()))) {
          concernMatchCount++;
        }
      });
      if (concernMatchCount > 0) {
        reasons.push({
          code: "CONCERN_FIT",
          label: `Targets ${concernMatchCount} of your concerns`,
          type: "positive",
        });
      }
    }

    // Specific reason for lowest diagnostic score
    if (lowestParam) {
      const targetLowest =
        product.targetParameters[lowestParam.param.slug] ??
        product.targetParameters[lowestParam.param.id] ??
        product.targetParameters[lowestParam.param.slug.replace("-", "_")] ??
        0;

      if (targetLowest >= 2) {
        reasons.unshift({
          code: "PRIMARY_TARGET",
          label: `Targets ${lowestParam.param.name}, your lowest score (${lowestParam.score}/100)`,
          type: "positive",
        });
      }
    }

    // Check for negative contraindication flags
    breakdown.forEach((b) => {
      if (b.productBenefit < 0) {
        reasons.push({
          code: `CAUTION_${b.parameterSlug}`,
          label: `Caution: may worsen ${b.parameterName}`,
          type: "caution",
        });
      }
    });

    if (reasons.length === 0) {
      reasons.push({
        code: "CLINICAL_FORMULA",
        label: "Clinical biocompatible formula",
        type: "positive",
      });
    }

    // Calculate normalized match score (0 - 100)
    // Base 50 points + weighted benefits + skin type & concern bonuses
    let rawScore = 55;
    if (maxPossibleScore > 0) {
      const benefitRatio = weightedBenefitSum / maxPossibleScore;
      rawScore += benefitRatio * 35;
    }
    if (skinTypeMatch) rawScore += 4;
    if (concernMatchCount > 0) rawScore += Math.min(6, concernMatchCount * 3);

    // Dynamic Recommendation Rules Evaluation
    const activeRules = input.rules || [];
    for (const rule of activeRules) {
      if (rule.status !== "active") continue;

      if (rule.conditionType === "parameter_score_below" && rule.targetParameterId) {
        const targetScore = paramScoreMap[rule.targetParameterId] ?? 80;
        if (targetScore < (rule.threshold || 60)) {
          const targetParam = activeParams.find((p) => p.id === rule.targetParameterId);
          const slug = targetParam?.slug || "";
          const benefit =
            product.targetParameters[slug] ??
            product.targetParameters[rule.targetParameterId] ??
            0;

          if (benefit > 0 && rule.actionType === "boost_mapped_products") {
            const boost = rule.boostPercent || 15;
            rawScore += boost;
            reasons.push({
              code: `RULE_BOOST_${rule.id}`,
              label: `Active Rule: +${boost}% priority for ${targetParam?.name || "Target Parameter"}`,
              type: "positive",
            });
          }
        }
      } else if (rule.conditionType === "pregnancy_safe" && isPregnantOrNursing) {
        if (rule.actionType === "exclude_ingredients" && rule.targetIngredientIds) {
          const hasContra = (product.ingredients || []).some((ing) =>
            rule.targetIngredientIds?.includes(ing)
          );
          if (hasContra) {
            isExcluded = true;
            exclusionReason = `Clinical Safety Rule: Excluded under ${rule.name}`;
          }
        }
      }
    }

    // Honest capping: normalized, capped between 40 and maxRecommendationScoreCap (default 98)
    const maxCap = input.platformSettings?.maxRecommendationScoreCap || COMMERCE_CONFIG.maxRecommendedMatchScore || 98;
    const matchScore = Math.min(
      maxCap,
      Math.max(42, Math.round(rawScore))
    );

    const recommendationItem: ProductRecommendation = {
      productId: product.id,
      product,
      matchScore,
      reasons,
      parameterBreakdown: breakdown,
      bestOffer,
      allOffers: offers,
      isSponsored: Boolean(product.sponsored),
      inStock,
      exclusionReason: isExcluded ? exclusionReason : undefined,
    };

    if (isExcluded) {
      excludedProducts.push(recommendationItem);
    } else {
      scoredRecommendations.push(recommendationItem);
    }
  }

  // Stage 2: Commerce Ranking (Organic Sorting)
  // Match score first, in-stock tiebreaker, best offer rating/price tiebreaker
  scoredRecommendations.sort((a, b) => {
    // In-stock prioritized over out of stock
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;

    // Organic Match score
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }

    // Tiebreaker: best offer price or rating
    const aPrice = a.bestOffer?.price || 999999;
    const bPrice = b.bestOffer?.price || 999999;
    return aPrice - bPrice;
  });

  // Grouped Recommendations

  // 1. Top Picks (Top 8 highest scoring in-stock products)
  const topPicks = scoredRecommendations.slice(0, 8);

  // 2. Build your routine (Cleanser, Serum, Moisturizer, Sunscreen, Treatment)
  const routine: GroupedRecommendations["routine"] = {};
  const steps: Array<keyof GroupedRecommendations["routine"]> = [
    "cleanser",
    "serum",
    "moisturizer",
    "sunscreen",
    "treatment",
  ];

  steps.forEach((stepKey) => {
    const stepLabel = stepKey.charAt(0).toUpperCase() + stepKey.slice(1);
    const candidate = scoredRecommendations.find(
      (rec) => rec.product.routineStep?.toLowerCase() === stepKey && rec.inStock
    ) || scoredRecommendations.find((rec) => rec.product.routineStep?.toLowerCase() === stepKey);

    if (candidate) {
      routine[stepKey] = candidate;
    }
  });

  // 3. Targets your top concerns (Grouped by customer's scan top concerns)
  const concernTargets: GroupedRecommendations["concernTargets"] = [];
  const topScanConcerns = scan?.topConcerns || [];

  topScanConcerns.forEach((concern) => {
    const matchingProducts = scoredRecommendations
      .filter((rec) => {
        const fit = rec.parameterBreakdown.find((b) => b.parameterId === concern.parameterId);
        return fit && fit.productBenefit >= 2;
      })
      .slice(0, 4);

    if (matchingProducts.length > 0) {
      concernTargets.push({
        concernName: concern.name,
        parameterId: concern.parameterId,
        userScore: concern.score,
        products: matchingProducts,
      });
    }
  });

  // If no scan concerns yet, fall back to lowest active parameters
  if (concernTargets.length === 0 && lowestParam) {
    const matchingProducts = scoredRecommendations
      .filter((rec) => {
        const fit = rec.parameterBreakdown.find((b) => b.parameterId === lowestParam.param.id);
        return fit && fit.productBenefit >= 2;
      })
      .slice(0, 4);

    if (matchingProducts.length > 0) {
      concernTargets.push({
        concernName: lowestParam.param.name,
        parameterId: lowestParam.param.id,
        userScore: lowestParam.score,
        products: matchingProducts,
      });
    }
  }

  return {
    topPicks,
    routine,
    concernTargets,
    avoidForYou: excludedProducts,
  };
}
