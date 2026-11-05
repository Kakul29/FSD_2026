// Shared helpers for the curated product catalog files.

// n(kcal, sugars g, sodium mg, saturated fat g, total fat g, protein g, fibre g, carbs g, NOVA group)
export function n(
  kcal: number,
  sugars: number,
  sodiumMg: number,
  satFat: number,
  fat: number,
  protein: number,
  fiber: number,
  carbs: number,
  nova: number
) {
  return {
    'energy-kcal': kcal,
    sugars,
    sodium: sodiumMg / 1000,
    salt: Math.round(sodiumMg * 0.25) / 100,
    'saturated-fat': satFat,
    'total-fat': fat,
    proteins: protein,
    fiber,
    carbohydrates: carbs,
    nova_group: nova,
  };
}

export interface ICatalogEntry {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  categories: string[];
  servingSize: string;
  ingredientsText: string;
  allergensTags: string[];
  tracesTags?: string[];
  regions: string[];
  originRegion: string;
  nutrients: ReturnType<typeof n>;
}

export function toCatalogRecord(entries: ICatalogEntry[]): Record<string, any> {
  return Object.fromEntries(
    entries.map((e) => [
      e.barcode,
      {
        ...e,
        tracesTags: e.tracesTags || [],
        isIndianBrand: e.originRegion === 'IN',
        availableInIndia: e.regions.includes('IN'),
      },
    ])
  );
}
