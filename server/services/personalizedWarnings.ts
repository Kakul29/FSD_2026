import { IUserProfile } from '../models/User';

export interface IPersonalizedAlert {
  type: 'danger' | 'warning' | 'positive' | 'info';
  title: string;
  description: string;
  guidelineStandard: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Removes marketing claims like "No added sugar", "Zero MSG", "Free from palm oil" so they
// are not mistaken for actual ingredients
function stripNegativeClaims(text: string): string {
  return text.replace(/\b(no|zero|without|free from|free of)\b[^,.;()]*/gi, ' ');
}

function findTerms(text: string, terms: string[]): string[] {
  return terms.filter((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i').test(text));
}

// Matches additive codes written as "INS 621", "E621", "E 150d", "INS-211"
function findAdditiveCodes(text: string, codes: string[]): string[] {
  return codes
    .filter((code) => new RegExp(`\\b(?:ins|e)\\s?-?\\s?${escapeRegExp(code)}(?![0-9])`, 'i').test(text))
    .map((code) => `INS ${code}`);
}

interface IDietRule {
  id: string;
  label: string;
  // Returns matched offending terms; empty array means compliant
  check: (ctx: { text: string; allergensTags: string[]; carbs: number | null }) => string[];
  severity: 'danger' | 'warning';
  title: string;
  guidelineStandard: string;
}

const MEAT_TERMS = [
  'beef', 'pork', 'chicken', 'mutton', 'lamb', 'turkey', 'bacon', 'ham', 'lard', 'gelatin', 'gelatine',
  'animal fat', 'tallow', 'beef extract', 'chicken fat', 'bone broth',
];
const DAIRY_TERMS = [
  'milk', 'dairy', 'whey', 'butter', 'butterfat', 'ghee', 'cheese', 'paneer', 'cream', 'curd', 'casein',
  'caseinate', 'lactose', 'yogurt', 'yoghurt', 'khoa', 'mawa', 'milk solids', 'milkfat', 'milk fat',
];
const GLUTEN_TERMS = [
  'wheat', 'gluten', 'barley', 'rye', 'malt', 'maida', 'atta', 'semolina', 'spelt', 'triticale', 'durum',
  'khorasan', 'kamut', 'farina', 'suji', 'rawa',
];
const SHELLFISH_TERMS = ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'oyster', 'mussel', 'squid', 'octopus', 'crustacean'];
const ALCOHOL_TERMS = ['alcohol', 'ethanol', 'wine', 'rum', 'beer', 'brandy', 'whisky', 'whiskey', 'liqueur', 'sake', 'mirin', 'vodka'];

const findDairy = ({ text, allergensTags }: { text: string; allergensTags: string[] }) => {
  const found = findTerms(text, DAIRY_TERMS);
  if (found.length === 0 && allergensTags.some((t) => t.includes('milk'))) found.push('declared milk allergen');
  return found;
};

const DIET_RULES: IDietRule[] = [
  {
    id: 'eggetarian',
    label: 'Eggetarian',
    check: ({ text }) => findTerms(text, [...MEAT_TERMS, 'fish', 'fish oil', 'shrimp', 'prawn', 'carmine', 'cochineal']),
    severity: 'danger',
    title: 'Meat or Fish Detected (Eggetarian Diet)',
    guidelineStandard: 'Eggetarian Dietary Practice',
  },
  {
    id: 'pescatarian',
    label: 'Pescatarian',
    check: ({ text }) => findTerms(text, MEAT_TERMS),
    severity: 'danger',
    title: 'Meat Ingredient Detected (Pescatarian Diet)',
    guidelineStandard: 'Pescatarian Dietary Practice',
  },
  {
    id: 'lactose-free',
    label: 'Lactose-Free',
    check: findDairy,
    severity: 'warning',
    title: 'Lactose / Dairy Detected',
    guidelineStandard: 'Lactose Intolerance Dietary Guidance',
  },
  {
    id: 'dairy_free',
    label: 'Dairy-Free',
    check: findDairy,
    severity: 'danger',
    title: 'Dairy Ingredient Detected',
    guidelineStandard: 'Dairy-Free Dietary Standard',
  },
  {
    id: 'gluten_free',
    label: 'Gluten-Free',
    check: ({ text, allergensTags }) => {
      const found = findTerms(text, GLUTEN_TERMS);
      if (found.length === 0 && allergensTags.some((t) => t.includes('gluten'))) found.push('declared gluten allergen');
      return found;
    },
    severity: 'danger',
    title: 'Gluten Source Detected',
    guidelineStandard: 'Codex Gluten-Free Standard (<20 ppm)',
  },
  {
    id: 'halal',
    label: 'Halal',
    check: ({ text }) =>
      findTerms(text, ['pork', 'lard', 'bacon', 'ham', 'gelatin', 'gelatine', 'carmine', 'cochineal', ...ALCOHOL_TERMS]),
    severity: 'danger',
    title: 'Potentially Non-Halal Ingredient',
    guidelineStandard: 'Halal Dietary Guidance (verify certification mark on pack)',
  },
  {
    id: 'kosher',
    label: 'Kosher',
    check: ({ text }) =>
      findTerms(text, ['pork', 'lard', 'bacon', 'ham', 'gelatin', 'gelatine', 'carmine', 'cochineal', ...SHELLFISH_TERMS]),
    severity: 'danger',
    title: 'Potentially Non-Kosher Ingredient',
    guidelineStandard: 'Kashrut Dietary Guidance (verify hechsher on pack)',
  },
  {
    id: 'no_onion_garlic',
    label: 'No Onion & Garlic (Satvik)',
    check: ({ text }) =>
      findTerms(text, ['onion', 'garlic', 'shallot', 'shallots', 'leek', 'chive', 'chives', 'pyaz', 'lahsun']),
    severity: 'warning',
    title: 'Onion / Garlic Detected',
    guidelineStandard: 'Satvik Dietary Practice',
  },
  {
    id: 'keto',
    label: 'Keto / Low-Carb',
    check: ({ carbs }) => (carbs !== null && carbs > 10 ? [`${carbs}g carbohydrates per 100g`] : []),
    severity: 'warning',
    title: 'High Carbohydrate for Keto / Low-Carb',
    guidelineStandard: 'Ketogenic Diet Guidance (<10g net carbs per 100g)',
  },
  {
    id: 'low_fodmap',
    label: 'Low-FODMAP',
    check: ({ text }) =>
      findTerms(text, [
        'onion', 'garlic', 'honey', 'inulin', 'chicory root', 'high fructose corn syrup', 'fructose',
        'sorbitol', 'mannitol', 'xylitol', 'apple juice', 'wheat',
      ]),
    severity: 'warning',
    title: 'High-FODMAP Ingredient Detected',
    guidelineStandard: 'Monash University Low-FODMAP Guidance',
  },
  {
    id: 'paleo',
    label: 'Paleo',
    check: ({ text }) =>
      findTerms(text, [
        'wheat', 'rice', 'corn', 'maize', 'oats', 'barley', 'rye', 'soy', 'soya', 'peanuts', 'beans',
        'lentils', 'dal', 'chickpeas', 'milk', 'sugar', 'canola oil', 'soybean oil',
      ]),
    severity: 'warning',
    title: 'Non-Paleo Ingredient Detected',
    guidelineStandard: 'Paleo Dietary Practice',
  },
  {
    id: 'no_added_sugar',
    label: 'No Added Sugar',
    check: ({ text }) =>
      findTerms(text, [
        'sugar', 'cane sugar', 'brown sugar', 'glucose syrup', 'glucose-fructose syrup', 'high fructose corn syrup',
        'corn syrup', 'dextrose', 'invert sugar', 'jaggery', 'molasses', 'sucrose', 'honey', 'brown rice syrup',
        'sugar beet syrup',
      ]),
    severity: 'warning',
    title: 'Added Sugars Detected',
    guidelineStandard: 'WHO Free Sugars Guideline',
  },
  {
    id: 'no_artificial_sweeteners',
    label: 'No Artificial Sweeteners',
    check: ({ text }) => [
      ...findTerms(text, ['aspartame', 'sucralose', 'acesulfame', 'saccharin', 'cyclamate', 'neotame', 'advantame']),
      ...findAdditiveCodes(text, ['950', '951', '952', '954', '955', '961', '962']),
    ],
    severity: 'warning',
    title: 'Artificial Sweetener Detected',
    guidelineStandard: 'Codex GSFA Sweetener Classes',
  },
  {
    id: 'no_artificial_colours',
    label: 'No Artificial Colours',
    check: ({ text }) => [
      ...findTerms(text, [
        'tartrazine', 'sunset yellow', 'allura red', 'carmoisine', 'ponceau', 'brilliant blue', 'erythrosine',
        'red 40', 'yellow 5', 'yellow 6', 'blue 1', 'caramel colour', 'caramel color', 'artificial color',
        'artificial colour',
      ]),
      ...findAdditiveCodes(text, ['102', '104', '110', '122', '124', '127', '129', '132', '133', '142', '150c', '150d', '151', '155']),
    ],
    severity: 'warning',
    title: 'Synthetic Colour Detected',
    guidelineStandard: 'EFSA / Southampton Colours Advisory',
  },
  {
    id: 'no_msg',
    label: 'No MSG / Flavour Enhancers',
    check: ({ text }) => [
      ...findTerms(text, [
        'monosodium glutamate', 'msg', 'flavour enhancer', 'flavour enhancers', 'flavor enhancer',
        'disodium inosinate', 'disodium guanylate', 'amino acids',
      ]),
      ...findAdditiveCodes(text, ['621', '627', '631', '635']),
    ],
    severity: 'warning',
    title: 'Flavour Enhancer (MSG Family) Detected',
    guidelineStandard: 'Codex GSFA Flavour Enhancers (INS 620–640)',
  },
  {
    id: 'no_palm_oil',
    label: 'No Palm Oil',
    check: ({ text }) => findTerms(text, ['palm oil', 'palmolein', 'palm olein', 'palm fat', 'palm kernel oil', 'palm']),
    severity: 'warning',
    title: 'Palm Oil Detected',
    guidelineStandard: 'Ingredient Preference',
  },
  {
    id: 'no_preservatives',
    label: 'No Preservatives',
    check: ({ text }) => [
      ...findTerms(text, [
        'preservative', 'preservatives', 'sodium benzoate', 'potassium sorbate', 'calcium propionate',
        'sodium metabisulphite', 'bht', 'bha', 'tbhq',
      ]),
      ...findAdditiveCodes(text, ['200', '202', '210', '211', '220', '223', '224', '282', '319', '320', '321']),
    ],
    severity: 'warning',
    title: 'Preservative Detected',
    guidelineStandard: 'Codex GSFA Preservative Class',
  },
  {
    id: 'caffeine_free',
    label: 'Caffeine-Free',
    check: ({ text }) => findTerms(text, ['caffeine', 'coffee', 'guarana', 'green tea', 'black tea', 'yerba mate', 'kola nut']),
    severity: 'warning',
    title: 'Caffeine Source Detected',
    guidelineStandard: 'Caffeine Intake Guidance',
  },
  {
    id: 'alcohol_free',
    label: 'Alcohol-Free',
    check: ({ text }) => findTerms(text, ALCOHOL_TERMS),
    severity: 'danger',
    title: 'Alcohol Ingredient Detected',
    guidelineStandard: 'Ingredient Preference',
  },
];

const BUILT_IN_CONDITIONS = ['diabetes', 'high_blood_pressure', 'high_cholesterol'];

interface ICustomConditionRule {
  pattern: RegExp;
  label: string;
  severity: 'danger' | 'warning';
  guidelineStandard: string;
  check: (ctx: {
    text: string;
    sugar: number | null;
    sodiumMg: number | null;
    saturatedFat: number | null;
    protein: number | null;
    fibre: number | null;
    novaGroup: number | null;
  }) => string[];
}

const PHOSPHATE_TERMS = ['phosphoric acid', 'phosphate', 'phosphates', 'polyphosphate'];
const REFINED_FLOUR_TERMS = ['maida', 'refined wheat flour', 'enriched flour', 'bleached flour'];

// Keyword-matched guidance for common health considerations users type in themselves
const CUSTOM_CONDITION_RULES: ICustomConditionRule[] = [
  {
    pattern: /pcos|pcod|polycystic|insulin resist/i,
    label: 'PCOS / Insulin Resistance',
    severity: 'warning',
    guidelineStandard: 'Low-GI Dietary Guidance for PCOS',
    check: ({ text, sugar, fibre }) => [
      ...(sugar !== null && sugar > 10 ? [`${sugar}g sugar per 100g (aim for under 10g)`] : []),
      ...findTerms(text, REFINED_FLOUR_TERMS).slice(0, 1).map((t) => `refined flour (${t})`),
      ...(fibre !== null && fibre < 3 ? [`low fibre (${fibre}g per 100g)`] : []),
    ],
  },
  {
    pattern: /kidney|renal|ckd|dialysis/i,
    label: 'Kidney Health',
    severity: 'danger',
    guidelineStandard: 'Renal Diet Guidance (limit sodium, phosphate additives, excess protein)',
    check: ({ text, sodiumMg, protein }) => [
      ...(sodiumMg !== null && sodiumMg > 400 ? [`${Math.round(sodiumMg)}mg sodium per 100g`] : []),
      ...(protein !== null && protein > 20 ? [`high protein (${protein}g per 100g)`] : []),
      ...findTerms(text, PHOSPHATE_TERMS).map((t) => `phosphate additive (${t})`),
      ...findAdditiveCodes(text, ['338', '339', '340', '341', '450', '451', '452']).map((c) => `phosphate additive (${c})`),
      ...findTerms(text, ['potassium chloride']).map((t) => `potassium salt (${t})`),
    ],
  },
  {
    pattern: /pregnan|expecting|breastfeed|lactating|nursing/i,
    label: 'Pregnancy & Breastfeeding',
    severity: 'warning',
    guidelineStandard: 'WHO Antenatal Nutrition Guidance (limit caffeine <200mg/day, avoid alcohol)',
    check: ({ text }) => [
      ...findTerms(text, ['caffeine', 'coffee', 'guarana', 'green tea']).map((t) => `caffeine source (${t})`),
      ...findTerms(text, ALCOHOL_TERMS).map((t) => `alcohol (${t})`),
      ...findTerms(text, ['saccharin', 'raw milk', 'unpasteurised', 'unpasteurized']),
    ],
  },
  {
    pattern: /gout|uric acid/i,
    label: 'Gout / High Uric Acid',
    severity: 'warning',
    guidelineStandard: 'Gout Dietary Guidance (limit fructose, yeast extract, alcohol)',
    check: ({ text, sugar }) => [
      ...findTerms(text, ['high fructose corn syrup', 'glucose-fructose syrup', 'fructose', 'yeast extract', ...ALCOHOL_TERMS]),
      ...(findTerms(text, ['carbonated water']).length > 0 && sugar !== null && sugar > 5 ? ['sugar-sweetened soft drink'] : []),
    ],
  },
  {
    pattern: /fatty liver|nafld|masld|liver/i,
    label: 'Liver Health',
    severity: 'warning',
    guidelineStandard: 'NAFLD Dietary Guidance (limit added sugar, fructose, saturated fat)',
    check: ({ text, sugar, saturatedFat }) => [
      ...(sugar !== null && sugar > 10 ? [`${sugar}g sugar per 100g`] : []),
      ...(saturatedFat !== null && saturatedFat > 5 ? [`${saturatedFat}g saturated fat per 100g`] : []),
      ...findTerms(text, ['high fructose corn syrup', 'glucose-fructose syrup', 'fructose', ...ALCOHOL_TERMS]),
    ],
  },
  {
    pattern: /\bibs\b|irritable bowel|bloating/i,
    label: 'IBS / Gut Sensitivity',
    severity: 'warning',
    guidelineStandard: 'Monash University Low-FODMAP Guidance',
    check: ({ text }) =>
      findTerms(text, ['onion', 'garlic', 'honey', 'inulin', 'chicory root', 'high fructose corn syrup', 'sorbitol', 'mannitol', 'xylitol', 'wheat']),
  },
  {
    pattern: /celiac|coeliac|gluten intoleran|gluten sensitiv/i,
    label: 'Celiac Disease',
    severity: 'danger',
    guidelineStandard: 'Codex Gluten-Free Standard (<20 ppm)',
    check: ({ text }) => findTerms(text, ['oats', ...GLUTEN_TERMS]),
  },
  {
    pattern: /\bheart\b|cardiac|cardio|stroke/i,
    label: 'Heart Health',
    severity: 'warning',
    guidelineStandard: 'WHO Cardiovascular Dietary Guidance (limit sodium, saturated & trans fat)',
    check: ({ text, sodiumMg, saturatedFat }) => [
      ...(sodiumMg !== null && sodiumMg > 400 ? [`${Math.round(sodiumMg)}mg sodium per 100g`] : []),
      ...(saturatedFat !== null && saturatedFat > 5 ? [`${saturatedFat}g saturated fat per 100g`] : []),
      ...findTerms(text, ['hydrogenated', 'vanaspati', 'partially hydrogenated']).map((t) => `trans fat source (${t})`),
    ],
  },
  {
    pattern: /acid reflux|\bgerd\b|acidity|heartburn|gastritis|ulcer/i,
    label: 'Acidity / Reflux',
    severity: 'warning',
    guidelineStandard: 'GERD Dietary Guidance (limit caffeine, carbonation, chilli, high fat)',
    check: ({ text, saturatedFat }) => [
      ...findTerms(text, ['caffeine', 'coffee', 'carbonated water', 'chilli', 'red chilli', 'chilli powder', 'peri peri', 'vinegar']),
      ...(saturatedFat !== null && saturatedFat > 10 ? [`high saturated fat (${saturatedFat}g per 100g)`] : []),
    ],
  },
  {
    pattern: /thyroid|hypothyroid|hashimoto/i,
    label: 'Thyroid Health',
    severity: 'warning',
    guidelineStandard: 'General Thyroid Dietary Guidance (take medication apart from soy & high-fibre foods)',
    check: ({ text, novaGroup }) => [
      ...findTerms(text, ['soy', 'soya', 'soybeans', 'soy protein isolate']).map((t) => `${t} (may affect medication absorption if eaten close to your dose)`),
      ...(novaGroup === 4 ? ['ultra-processed (NOVA 4)'] : []),
    ],
  },
  {
    pattern: /an(a)?emi|low iron|iron deficien/i,
    label: 'Anaemia / Low Iron',
    severity: 'warning',
    guidelineStandard: 'ICMR-NIN Iron Guidance (tea/coffee reduce iron absorption)',
    check: ({ text }) =>
      findTerms(text, ['tea', 'black tea', 'green tea', 'coffee']).map((t) => `${t} (drink apart from iron-rich meals)`),
  },
  {
    pattern: /lactose/i,
    label: 'Lactose Intolerance',
    severity: 'warning',
    guidelineStandard: 'Lactose Intolerance Dietary Guidance',
    check: ({ text }) => findTerms(text, DAIRY_TERMS),
  },
];

export function evaluatePersonalizedWarnings(
  profile: IUserProfile,
  nutrients: Record<string, any>,
  ingredientsText: string = '',
  novaGroup?: number | null,
  allergensTags: string[] = [],
  authority: string = 'FSSAI'
): {
  alerts: IPersonalizedAlert[];
  assessmentComplete: boolean;
  medicalDisclaimer: string;
} {
  const alerts: IPersonalizedAlert[] = [];
  const medicalDisclaimer =
    `Medical & General Food Notice: LabelLens provides generalized nutritional comparison based on recognized dietary guidance and ${authority} packaging guidelines. It is not medical advice, diagnosis, or personalized treatment. Consult a licensed healthcare professional for dietary management of clinical conditions.`;

  const get100g = (key: string): number | null => {
    const val = nutrients[key] ?? nutrients[`${key}_100g`] ?? nutrients[`${key}_value`];
    if (val !== undefined && val !== null && !isNaN(Number(val))) {
      return Number(val);
    }
    return null;
  };

  const calories = get100g('energy-kcal') ?? (get100g('energy') ? Math.round(get100g('energy')! / 4.184) : null);
  const sugar = get100g('sugars');
  const sodium = get100g('sodium') ?? (get100g('salt') ? Math.round((get100g('salt')! / 2.5) * 1000) / 1000 : null);
  const saturatedFat = get100g('saturated-fat');
  const protein = get100g('proteins');
  const fibre = get100g('fiber');
  const carbs = get100g('carbohydrates');

  const goals = profile.goals || [];
  const healthConditions = profile.healthConditions || [];
  const dietaryPreferences = profile.dietaryPreferences || [];

  // 1. Dietary Preference Checks (Vegetarian, Vegan, Jain)
  const lowerIng = ingredientsText.toLowerCase();

  if (dietaryPreferences.includes('vegetarian') || dietaryPreferences.includes('vegan') || dietaryPreferences.includes('jain')) {
    // Non-veg indicators
    const nonVegTerms = [
      'gelatin', 'gelatine', 'carmine', 'cochineal', 'ins 120', 'rennet', 'animal fat', 'beef', 'pork', 'chicken',
      'fish', 'fish oil', 'lard', 'bone char', 'mutton', 'lamb', 'bacon', 'ham', 'shrimp', 'prawn', 'sardines',
      'anchovy', 'tuna',
    ];
    const matchedNonVeg = findTerms(stripNegativeClaims(lowerIng), nonVegTerms);
    if (matchedNonVeg.length > 0) {
      alerts.push({
        type: 'danger',
        title: 'Non-Vegetarian Ingredient Detected',
        description: `Contains '${matchedNonVeg.join(', ')}' which is animal-derived.`,
        guidelineStandard: 'FSSAI Brown/Red Non-Veg Labelling Standard',
      });
    }

    if (dietaryPreferences.includes('vegan')) {
      const dairyEggs = ['milk', 'dairy', 'whey', 'butter', 'ghee', 'cheese', 'paneer', 'egg', 'honey', 'casein', 'lactose'];
      const matchedDairy = dairyEggs.filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(lowerIng));
      if (matchedDairy.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Animal By-Product for Vegan Diet',
          description: `Contains dairy/animal derivatives: ${matchedDairy.slice(0, 3).join(', ')}.`,
          guidelineStandard: 'Vegan Dietary Standard',
        });
      }
    }

    if (dietaryPreferences.includes('jain')) {
      const matchedEggHoney = findTerms(lowerIng, ['egg', 'eggs', 'egg white', 'egg yolk', 'honey']);
      if (matchedEggHoney.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Egg / Honey Detected (Jain Diet)',
          description: `Contains ${matchedEggHoney.join(', ')}.`,
          guidelineStandard: 'Jain Dietary Practice (Ahinsa)',
        });
      }
    }

    if (dietaryPreferences.includes('jain')) {
      const rootVeg = ['onion', 'garlic', 'potato', 'ginger', 'carrot', 'radish', 'pyaz', 'lahsun', 'aloo', 'beetroot', 'turnip'];
      const matchedRoot = rootVeg.filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(lowerIng));
      if (matchedRoot.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Root Vegetables Detected (Jain Diet)',
          description: `Contains root vegetable or powder: ${matchedRoot.slice(0, 3).join(', ')}.`,
          guidelineStandard: 'Jain Dietary Practice (Ahinsa)',
        });
      }
    }
  }

  // 1b. Extended dietary restrictions (religious, lifestyle and ingredient-avoidance diets)
  const hasIngredients = lowerIng.trim().length >= 10;
  const claimFreeText = stripNegativeClaims(lowerIng);
  const satisfiedRules: string[] = [];

  for (const rule of DIET_RULES) {
    if (!dietaryPreferences.includes(rule.id)) continue;
    // Keto works from nutrition data; every other rule needs the ingredient list
    if (rule.id === 'keto' ? carbs === null : !hasIngredients) continue;

    const matched = Array.from(new Set(rule.check({ text: claimFreeText, allergensTags, carbs })));
    if (matched.length > 0) {
      alerts.push({
        type: rule.severity,
        title: rule.title,
        description: `Conflicts with your ${rule.label} preference: ${matched.slice(0, 4).join(', ')}.`,
        guidelineStandard: rule.guidelineStandard,
      });
    } else {
      satisfiedRules.push(rule.label);
    }
  }

  if (satisfiedRules.length > 0) {
    alerts.push({
      type: 'positive',
      title: 'Fits Your Dietary Restrictions',
      description: `No conflicting ingredients found for: ${satisfiedRules.join(', ')}.`,
      guidelineStandard: 'Ingredient List Screening (verify pack certification marks)',
    });
  }
  if (!hasIngredients && DIET_RULES.some((r) => r.id !== 'keto' && dietaryPreferences.includes(r.id))) {
    alerts.push({
      type: 'info',
      title: 'Ingredient List Unavailable',
      description: 'Cannot verify your dietary restrictions because this product has no ingredient list on record.',
      guidelineStandard: `${authority} Mandatory Ingredient Declaration`,
    });
  }

  // 2. Reduce Sugar Goal & Diabetes Condition
  const wantsReduceSugar = goals.includes('reduce_sugar') || healthConditions.includes('diabetes');
  if (wantsReduceSugar) {
    if (sugar === null) {
      alerts.push({
        type: 'info',
        title: 'Sugar Data Incomplete',
        description: 'Product label does not state sugar per 100g. Cannot verify your sugar-reduction target.',
        guidelineStandard: 'FSSAI Mandatory Nutrition Declaration',
      });
    } else if (sugar > 15) {
      alerts.push({
        type: 'danger',
        title: 'High Sugar Alert',
        description: `${sugar}g sugar per 100g conflicts with your goal to reduce sugar intake. FSSAI recommends keeping added sugars minimal.`,
        guidelineStandard: 'WHO & FSSAI Guidelines (>10g/100g is elevated)',
        metric: 'Sugar',
        value: sugar,
        threshold: 10,
      });
    } else if (sugar <= 5) {
      alerts.push({
        type: 'positive',
        title: 'Low Sugar Match',
        description: `Only ${sugar}g sugar per 100g. Fits your sugar-conscious goals nicely.`,
        guidelineStandard: 'FSSAI Low-Sugar Definition (<5g/100g)',
        metric: 'Sugar',
        value: sugar,
        threshold: 5,
      });
    }
  }

  // 3. Reduce Sodium Goal & High Blood Pressure Condition
  const wantsReduceSodium = goals.includes('reduce_sodium') || healthConditions.includes('high_blood_pressure');
  if (wantsReduceSodium) {
    if (sodium === null) {
      alerts.push({
        type: 'info',
        title: 'Sodium Content Missing',
        description: 'Sodium/Salt per 100g is not listed on this product label.',
        guidelineStandard: 'FSSAI Guidelines',
      });
    } else {
      const sodiumMg = sodium > 15 ? sodium : sodium * 1000;
      if (sodiumMg > 500) {
        alerts.push({
          type: 'danger',
          title: 'High Sodium Alert',
          description: `${Math.round(sodiumMg)}mg sodium per 100g exceeds recommended limits for blood pressure management.`,
          guidelineStandard: 'ICMR-NIN India / FSSAI (>400mg sodium per 100g is high)',
          metric: 'Sodium',
          value: Math.round(sodiumMg),
          threshold: 400,
        });
      } else if (sodiumMg < 120) {
        alerts.push({
          type: 'positive',
          title: 'Low Sodium Choice',
          description: `Only ${Math.round(sodiumMg)}mg sodium per 100g, supporting heart and blood pressure goals.`,
          guidelineStandard: 'FSSAI Low Sodium (<120mg/100g)',
          metric: 'Sodium',
          value: Math.round(sodiumMg),
          threshold: 120,
        });
      }
    }
  }

  // 4. High Cholesterol & Saturated Fat
  const caresCholesterol = healthConditions.includes('high_cholesterol') || goals.includes('less_processed');
  if (caresCholesterol && saturatedFat !== null) {
    if (saturatedFat > 6) {
      alerts.push({
        type: 'warning',
        title: 'Elevated Saturated Fat',
        description: `${saturatedFat}g saturated fat per 100g. Consider moderating portion size for cholesterol health.`,
        guidelineStandard: 'ICMR-NIN Recommended Fat Limits (<5g/100g)',
        metric: 'Saturated Fat',
        value: saturatedFat,
        threshold: 5,
      });
    }
  }

  // 4b. Custom health considerations typed in by the user (e.g. "PCOS", "kidney disease")
  const customConditions = healthConditions.filter((c) => !BUILT_IN_CONDITIONS.includes(c));
  for (const condition of customConditions) {
    const rule = CUSTOM_CONDITION_RULES.find((r) => r.pattern.test(condition));
    if (!rule) {
      alerts.push({
        type: 'info',
        title: `Health Consideration Noted: ${condition}`,
        description: `LabelLens cannot automatically screen for "${condition}". See the Dietitian's Opinion for tailored guidance and confirm with your doctor.`,
        guidelineStandard: 'Custom Health Profile Entry',
      });
      continue;
    }
    const findings = rule.check({
      text: stripNegativeClaims(lowerIng),
      sugar,
      sodiumMg: sodium !== null ? (sodium > 15 ? sodium : sodium * 1000) : null,
      saturatedFat,
      protein,
      fibre,
      novaGroup: novaGroup ?? null,
    });
    if (findings.length > 0) {
      alerts.push({
        type: rule.severity,
        title: `${rule.label}: Ingredients to Watch`,
        description: `For your "${condition}" consideration: ${findings.slice(0, 4).join('; ')}.`,
        guidelineStandard: rule.guidelineStandard,
      });
    } else if (hasIngredients) {
      alerts.push({
        type: 'positive',
        title: `${rule.label}: No Major Red Flags`,
        description: `No common concern ingredients or nutrient levels found for "${condition}".`,
        guidelineStandard: rule.guidelineStandard,
      });
    }
  }

  // 5. Increase Protein Goal
  if (goals.includes('increase_protein')) {
    if (protein !== null) {
      if (protein >= 10) {
        alerts.push({
          type: 'positive',
          title: 'High Protein Goal Match',
          description: `Provides ${protein}g protein per 100g, making this a strong contributor to your daily protein requirement.`,
          guidelineStandard: 'FSSAI Rich in Protein Standard (>=12% energy or >=10g/100g)',
          metric: 'Protein',
          value: protein,
          threshold: 10,
        });
      } else if (protein < 3) {
        alerts.push({
          type: 'info',
          title: 'Low Protein Content',
          description: `Only ${protein}g protein per 100g. This item will not meaningfully contribute to your protein goal.`,
          guidelineStandard: 'General Macronutrient Distribution',
          metric: 'Protein',
          value: protein,
          threshold: 10,
        });
      }
    }
  }

  // 6. Increase Fibre Goal
  if (goals.includes('increase_fibre')) {
    if (fibre !== null) {
      if (fibre >= 6) {
        alerts.push({
          type: 'positive',
          title: 'High Fibre Goal Match',
          description: `Contains ${fibre}g dietary fibre per 100g, promoting healthy digestion and prolonged satiety.`,
          guidelineStandard: 'FSSAI High in Fibre Standard (>=6g/100g)',
          metric: 'Fibre',
          value: fibre,
          threshold: 6,
        });
      } else if (fibre < 2) {
        alerts.push({
          type: 'info',
          title: 'Low Fibre Content',
          description: `Provides only ${fibre}g fibre per 100g.`,
          guidelineStandard: 'FSSAI Dietary Guidelines',
          metric: 'Fibre',
          value: fibre,
          threshold: 3,
        });
      }
    }
  }

  // 7. Less Processed Goal
  if (goals.includes('less_processed') && novaGroup) {
    if (novaGroup === 4) {
      alerts.push({
        type: 'warning',
        title: 'Ultra-Processed Formulation (NOVA 4)',
        description: 'Contains industrial formulations and additives that conflict with your goal of eating less processed whole foods.',
        guidelineStandard: 'NOVA Food Processing Classification',
      });
    } else if (novaGroup === 1) {
      alerts.push({
        type: 'positive',
        title: 'Whole & Minimally Processed Food (NOVA 1)',
        description: 'Matches your goal of choosing unrefined, clean, minimally processed food products.',
        guidelineStandard: 'NOVA Group 1 Definition',
      });
    }
  }

  // Outside India, cite the user's local food authority instead of FSSAI / ICMR-NIN
  if (authority !== 'FSSAI') {
    const localize = (text: string) =>
      text
        .replace(/FSSAI Brown\/Red Non-Veg Labelling Standard/g, 'Vegetarian Dietary Standard')
        .replace(/ICMR-NIN India \/ FSSAI/g, `WHO / ${authority}`)
        .replace(/ICMR-NIN/g, 'WHO')
        .replace(/FSSAI/g, authority);
    for (const alert of alerts) {
      alert.title = localize(alert.title);
      alert.description = localize(alert.description);
      alert.guidelineStandard = localize(alert.guidelineStandard);
    }
  }

  const assessmentComplete = sugar !== null && sodium !== null && saturatedFat !== null && protein !== null;

  return {
    alerts,
    assessmentComplete,
    medicalDisclaimer,
  };
}
