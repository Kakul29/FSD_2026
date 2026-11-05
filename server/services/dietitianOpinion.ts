import { GoogleGenAI } from '@google/genai';
import { IUserProfile } from '../models/User';
import { IFormattedProduct } from './openFoodFacts';

export interface IDietitianOpinion {
  verdict: 'everyday' | 'occasional' | 'rarely' | 'avoid';
  verdictLabel: string;
  summary: string;
  portionAdvice: string;
  pairingTips: string[];
  watchOuts: string[];
  goodFor: string[];
  source: 'ai' | 'rule_based';
  disclaimer: string;
}

const VERDICT_LABELS: Record<IDietitianOpinion['verdict'], string> = {
  everyday: 'Good for Everyday',
  occasional: 'Enjoy a Few Times a Week',
  rarely: 'Occasional Treat Only',
  avoid: 'Not Recommended for You',
};

const DISCLAIMER =
  'This is automated, general nutrition guidance modelled on how a dietitian would read the label. It is not a consultation with a registered dietitian and is not medical advice. For medical conditions, pregnancy or medication interactions, speak to a registered dietitian or your doctor.';

// Practical serving and pairing suggestions per catalog aisle
const CATEGORY_TIPS: Record<string, string[]> = {
  'Instant Noodles': [
    'Add a cup of chopped vegetables (peas, carrot, spinach) to bulk up fibre.',
    'Add protein such as an egg, paneer cubes or sprouts to make it a balanced meal.',
    'Use only half the tastemaker/seasoning sachet to cut sodium nearly in half.',
  ],
  'Biscuits & Cookies': [
    'Stick to 2–3 biscuits rather than eating from the pack.',
    'Pair with a handful of nuts or a fruit so the snack keeps you full longer.',
    'Choose with unsweetened tea or milk instead of sugary drinks.',
  ],
  'Chips & Crisps': [
    'Serve a small bowl instead of eating straight from the packet.',
    'Pair with raw veggies, hummus or curd dip to add fibre and protein.',
    'Drink water alongside — salty snacks are easy to over-eat.',
  ],
  'Nachos & Tortilla Chips': [
    'Portion into a small bowl (about 30 g).',
    'Pair with fresh salsa, beans or curd dip instead of cheese sauce.',
  ],
  'Savoury Snacks & Namkeen': [
    'Keep to a small katori (about 30 g) per sitting.',
    'Mix with roasted chana, puffed rice or chopped cucumber-onion to lighten it.',
    'Avoid pairing with sugary chai — choose plain tea or buttermilk.',
  ],
  'Breakfast Cereals & Mixes': [
    'Serve with milk, curd or Greek yogurt for protein.',
    'Top with fresh fruit and a few nuts or seeds instead of extra sugar.',
    'Measure the portion — cereal bowls are often 2–3 servings.',
  ],
  'Chocolates & Sweets': [
    'Have a small portion after a meal rather than on an empty stomach.',
    'Pick darker chocolate (70%+) or fruit for everyday sweet cravings.',
  ],
  'Dairy & Milks': [
    'A good way to add protein and calcium — pair with fruit or whole grains.',
    'Choose unsweetened versions where possible and add your own fruit.',
  ],
  'Soft Drinks & Juices': [
    'Swap for water, nimbu pani without sugar, buttermilk or coconut water most days.',
    'If you have it, choose a small size and drink it with a meal.',
  ],
  'Spreads & Sauces': [
    'Use a thin layer or a measured teaspoon — spreads are energy-dense.',
    'Pair with whole grain bread, fruit or vegetables rather than refined snacks.',
  ],
  'Bread & Bakery': [
    'Choose 100% whole wheat or multigrain loaves where the first ingredient is whole grain.',
    'Add protein (egg, paneer, peanut butter, dal) and vegetables to make it a meal.',
  ],
  'Staples & Grains': [
    'Balance your plate: half vegetables, a quarter grains, a quarter protein.',
    'Combine cereals with pulses (e.g. rice + dal) for complete protein.',
  ],
  'Ready Meals': [
    'Add a side salad or sautéed vegetables to boost fibre.',
    'Pair with whole wheat roti or brown rice rather than refined sides.',
    'Ready meals can be salty — skip extra salt and pickles with them.',
  ],
  'Snack Bars': [
    'Treat it as a snack, not a meal replacement.',
    'Check the sugar per bar — under 8 g is a good target.',
  ],
  'Canned & Preserved': [
    'Rinse canned beans or vegetables to reduce added salt.',
    'Pair with fresh vegetables and whole grains.',
  ],
};

const DEFAULT_TIPS = [
  'Balance it with fresh vegetables or fruit and a source of protein.',
  'Stick to the stated serving size.',
];

function get100g(nutrients: Record<string, any>, key: string): number | null {
  const val = nutrients[key] ?? nutrients[`${key}_100g`];
  return val !== undefined && val !== null && !isNaN(Number(val)) ? Number(val) : null;
}

function parseServingGrams(servingSize: string): number | null {
  const match = servingSize.match(/(\d+(?:\.\d+)?)\s*(g|ml)\b/i);
  return match ? Number(match[1]) : null;
}

export function buildRuleBasedOpinion(product: IFormattedProduct, profile?: IUserProfile): IDietitianOpinion {
  const { nutritionAnalysis, allergenAnalysis, personalizedWarnings, nutrients } = product;
  const score = nutritionAnalysis.healthScore;
  const nova = nutritionAnalysis.novaGroup;
  const alerts = personalizedWarnings?.alerts || [];

  const sugar = get100g(nutrients, 'sugars');
  const sodiumRaw = get100g(nutrients, 'sodium') ?? (get100g(nutrients, 'salt') !== null ? get100g(nutrients, 'salt')! / 2.5 : null);
  const sodiumMg = sodiumRaw !== null ? (sodiumRaw > 15 ? sodiumRaw : sodiumRaw * 1000) : null;
  const protein = get100g(nutrients, 'proteins');
  const fibre = get100g(nutrients, 'fiber');
  const satFat = get100g(nutrients, 'saturated-fat');

  // Verdict: allergens and dietary-rule conflicts (alerts without a metric) mean avoid;
  // otherwise base it on the health score, then step down for personal nutrient conflicts
  const levels: IDietitianOpinion['verdict'][] = ['everyday', 'occasional', 'rarely'];
  let verdict: IDietitianOpinion['verdict'];
  const conflictsWithProfile =
    allergenAnalysis?.status === 'RED' || alerts.some((a) => a.type === 'danger' && !a.metric);

  if (conflictsWithProfile) {
    verdict = 'avoid';
  } else {
    let level = score >= 70 && (nova === null || nova <= 3) ? 0 : score >= 50 ? 1 : 2;
    if (alerts.some((a) => a.type === 'danger' && a.metric)) level = Math.min(2, level + 1);
    verdict = levels[level];
  }

  // Summary
  const strengths = nutritionAnalysis.positiveAttributes.slice(0, 2);
  const concerns = nutritionAnalysis.potentialConcerns.slice(0, 2);
  const summaryParts = [`${product.name} scores ${score}/100.`];
  if (strengths.length > 0) summaryParts.push(`On the plus side: ${strengths.join(', ').toLowerCase()}.`);
  if (concerns.length > 0) summaryParts.push(`The main drawbacks are ${concerns.join(' and ').toLowerCase()}.`);
  if (verdict === 'avoid') {
    summaryParts.push('Based on your profile, I would skip this one and pick one of the alternatives below.');
  } else if (verdict === 'everyday') {
    summaryParts.push('This can fit comfortably into a regular, balanced diet.');
  } else if (verdict === 'occasional') {
    summaryParts.push('Fine in moderation, but it should not be a daily staple.');
  } else {
    summaryParts.push('Best kept as an occasional treat rather than a regular part of your week.');
  }

  // Portion advice with per-serving numbers when the serving size is known
  const servingGrams = parseServingGrams(product.servingSize);
  let portionAdvice = `Stick to one serving (${product.servingSize}).`;
  if (servingGrams) {
    const perServing: string[] = [];
    if (sugar !== null && sugar > 0) {
      const sugarServing = Math.round((sugar * servingGrams) / 10) / 10;
      perServing.push(`${sugarServing} g sugar (≈ ${Math.max(0.5, Math.round(sugarServing / 2) / 2)} tsp)`);
    }
    if (sodiumMg !== null && sodiumMg > 0) perServing.push(`${Math.round((sodiumMg * servingGrams) / 100)} mg sodium`);
    if (protein !== null && protein > 0) perServing.push(`${Math.round((protein * servingGrams) / 10) / 10} g protein`);
    if (perServing.length > 0) portionAdvice += ` One serving gives about ${perServing.join(', ')}.`;
  }
  if (verdict === 'rarely' || verdict === 'occasional') {
    portionAdvice += verdict === 'rarely' ? ' Limit to once a week or less.' : ' Two to three times a week is a sensible limit.';
  }

  // Watch-outs from allergens, personal alerts, and nutrient concerns
  const watchOuts: string[] = [];
  for (const match of allergenAnalysis?.matches || []) {
    watchOuts.push(`Contains your declared allergen: ${match.allergen} (${match.matchedTerm}).`);
  }
  for (const alert of alerts.filter((a) => a.type === 'danger' || a.type === 'warning').slice(0, 5)) {
    watchOuts.push(`${alert.title} — ${alert.description}`);
  }
  if (watchOuts.length === 0) {
    if (sodiumMg !== null && sodiumMg > 600) watchOuts.push(`High sodium (${Math.round(sodiumMg)} mg per 100 g).`);
    if (sugar !== null && sugar > 22.5) watchOuts.push(`High sugar (${sugar} g per 100 g).`);
    if (satFat !== null && satFat > 5) watchOuts.push(`High saturated fat (${satFat} g per 100 g).`);
    if (nova === 4) watchOuts.push('Ultra-processed (NOVA 4) — contains industrial additives.');
  }

  // Good-for highlights
  const goodFor: string[] = [];
  if (protein !== null && protein >= 10) goodFor.push('A useful protein source for satiety and muscle repair.');
  if (fibre !== null && fibre >= 6) goodFor.push('High in fibre — supports digestion and keeps you full.');
  if (sugar !== null && sugar <= 5 && sodiumMg !== null && sodiumMg <= 120) goodFor.push('Low in both sugar and salt.');
  if (nova === 1) goodFor.push('Whole, minimally processed food.');

  const customConditions = (profile?.healthConditions || []).filter(
    (c) => !['diabetes', 'high_blood_pressure', 'high_cholesterol'].includes(c)
  );
  const pairingTips = [...(CATEGORY_TIPS[product.category] || DEFAULT_TIPS)];
  if (customConditions.length > 0) {
    pairingTips.push(`Because you listed ${customConditions.join(', ')}, check portion sizes with your own dietitian or doctor.`);
  }

  return {
    verdict,
    verdictLabel: VERDICT_LABELS[verdict],
    summary: summaryParts.join(' '),
    portionAdvice,
    pairingTips,
    watchOuts,
    goodFor,
    source: 'rule_based',
    disclaimer: DISCLAIMER,
  };
}

/**
 * Dietitian-style opinion: uses Gemini when configured (grounded on the rule-based assessment),
 * otherwise falls back to the rule-based opinion.
 */
export async function getDietitianOpinion(
  product: IFormattedProduct,
  profile?: IUserProfile
): Promise<IDietitianOpinion> {
  const baseline = buildRuleBasedOpinion(product, profile);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return baseline;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a registered dietitian reviewing a packaged food for a specific client. Be warm, practical and concise. Never diagnose. Respond ONLY with JSON matching:
{"verdict": "everyday" | "occasional" | "rarely" | "avoid", "summary": string (2-3 sentences, first person), "portionAdvice": string, "pairingTips": string[] (2-4), "watchOuts": string[] (0-5), "goodFor": string[] (0-3)}

Product: ${product.name} by ${product.brand} (${product.category}), sold in ${product.regionName}
Serving size: ${product.servingSize}
Health score: ${product.nutritionAnalysis.healthScore}/100, NOVA group: ${product.nutritionAnalysis.novaGroup ?? 'unknown'}
Nutrients per 100g: ${JSON.stringify(product.nutrients)}
Ingredients: ${product.ingredientsText || 'not listed'}

Client profile:
- Allergies: ${profile?.allergies?.join(', ') || 'none declared'}
- Dietary preferences: ${profile?.dietaryPreferences?.join(', ') || 'none'}
- Goals: ${profile?.goals?.join(', ') || 'none'}
- Health considerations: ${profile?.healthConditions?.join(', ') || 'none'}
- Allergen screening result: ${product.allergenAnalysis?.status || 'GREEN'}

Automated screening already found (respect these, especially allergens — if allergen status is RED the verdict must be "avoid"):
Verdict: ${baseline.verdict}
Watch-outs: ${baseline.watchOuts.join(' | ') || 'none'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    const verdict: IDietitianOpinion['verdict'] = ['everyday', 'occasional', 'rarely', 'avoid'].includes(parsed.verdict)
      ? parsed.verdict
      : baseline.verdict;
    const finalVerdict = product.allergenAnalysis?.status === 'RED' ? 'avoid' : verdict;
    const asList = (v: any, fallback: string[]) =>
      Array.isArray(v) ? v.filter((s) => typeof s === 'string').slice(0, 5) : fallback;

    return {
      verdict: finalVerdict,
      verdictLabel: VERDICT_LABELS[finalVerdict],
      summary: typeof parsed.summary === 'string' ? parsed.summary : baseline.summary,
      portionAdvice: typeof parsed.portionAdvice === 'string' ? parsed.portionAdvice : baseline.portionAdvice,
      pairingTips: asList(parsed.pairingTips, baseline.pairingTips),
      watchOuts: asList(parsed.watchOuts, baseline.watchOuts),
      goodFor: asList(parsed.goodFor, baseline.goodFor),
      source: 'ai',
      disclaimer: DISCLAIMER,
    };
  } catch (err: any) {
    console.warn('[Dietitian] AI opinion failed, using rule-based opinion:', err.message);
    return baseline;
  }
}
