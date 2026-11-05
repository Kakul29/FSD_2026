import { n, ICatalogEntry } from './catalogHelpers';

// Additional everyday Indian supermarket & kirana products, grouped by aisle.
// Nutrition values are per 100 g / 100 ml, based on typical published pack labels.
// Codes use the GS1 "200" in-store prefix range: 2000100 + 6-digit sequence.

function item(
  seq: number,
  name: string,
  brand: string,
  category: string,
  categories: string[],
  servingSize: string,
  ingredientsText: string,
  allergensTags: string[],
  nutrients: ReturnType<typeof n>,
  extra: { tracesTags?: string[]; regions?: string[] } = {}
): ICatalogEntry {
  return {
    barcode: `2000100${String(1000 + seq).padStart(6, '0')}`,
    name,
    brand,
    category,
    categories,
    servingSize,
    ingredientsText,
    allergensTags,
    tracesTags: extra.tracesTags,
    regions: extra.regions || ['IN'],
    originRegion: 'IN',
    nutrients,
  };
}

const CEREAL = 'Breakfast Cereals & Mixes';
const BISCUITS = 'Biscuits & Cookies';
const CHIPS = 'Chips & Crisps';
const NAMKEEN = 'Savoury Snacks & Namkeen';
const NOODLES = 'Instant Noodles';
const SWEETS = 'Chocolates & Sweets';
const DAIRY = 'Dairy & Milks';
const DRINKS = 'Soft Drinks & Juices';
const SPREADS = 'Spreads & Sauces';
const BREAD = 'Bread & Bakery';
const STAPLES = 'Staples & Grains';
const READY = 'Ready Meals';
const BARS = 'Snack Bars';

const GULF_AND_DIASPORA = ['IN', 'AE', 'SG', 'GB', 'US', 'CA', 'AU'];

export const INDIA_EXTRA_ENTRIES: ICatalogEntry[] = [
  // ==========================================
  // Breakfast cereals, oats & instant mixes
  // ==========================================
  item(1, 'Chocos Chocolate Wheat Scoops', "Kellogg's", CEREAL, ['Breakfast', 'Breakfast cereals', 'Cereal', 'Chocolate cereal', 'Kids cereal'], '30 g',
    'Whole wheat flour (52%), Sugar, Rice flour, Cocoa solids (5%), Corn grits, Malt extract, Iodised salt, Emulsifier (INS 322 from soya), Vitamins, Minerals, Added flavours (nature identical and artificial).',
    ['en:gluten', 'en:wheat', 'en:soybeans'], n(389, 29, 230, 0.9, 2.3, 8, 6, 84, 4), { tracesTags: ['en:milk'] }),
  item(2, 'Muesli Fruit, Nut & Seeds', "Kellogg's", CEREAL, ['Breakfast', 'Breakfast cereals', 'Cereal', 'Muesli'], '45 g',
    'Cereal flakes (wheat, rice, corn, oats 55%), Sugar, Raisins, Dried apple, Almonds (3%), Pumpkin seeds, Liquid glucose, Malt extract, Iodised salt, Vitamins, Minerals, Antioxidant (INS 320).',
    ['en:gluten', 'en:wheat', 'en:nuts'], n(385, 21, 200, 1.5, 6.5, 9, 7, 75, 4)),
  item(3, 'Special K Original', "Kellogg's", CEREAL, ['Breakfast', 'Breakfast cereals', 'Cereal', 'Rice flakes'], '30 g',
    'Rice (59%), Whole wheat (22%), Sugar, Wheat gluten, Defatted wheat germ, Iodised salt, Malt extract, Vitamins, Minerals.',
    ['en:gluten', 'en:wheat'], n(378, 13, 440, 0.4, 1.5, 9.8, 3, 80, 4)),
  item(4, 'White Oats', "Bagrry's", CEREAL, ['Breakfast', 'Oats', 'Porridge', 'Whole grains', 'Cereal'], '40 g',
    '100% Rolled oats.', ['en:gluten'], n(389, 1, 5, 1.2, 7.6, 13, 10, 66, 1)),
  item(5, 'Oats (Plain Rolled)', 'Saffola', CEREAL, ['Breakfast', 'Oats', 'Porridge', 'Whole grains', 'Cereal'], '40 g',
    '100% Whole grain rolled oats.', ['en:gluten'], n(382, 1, 4, 1.4, 7.5, 12.5, 10.5, 64, 1)),
  item(6, 'Dark Chocolate & Cranberry Muesli', 'Yoga Bar', CEREAL, ['Breakfast', 'Muesli', 'Cereal', 'Granola'], '50 g',
    'Rolled oats (40%), Dark chocolate chips (10%) (cocoa mass, sugar, cocoa butter, emulsifier soya lecithin), Dried cranberries (8%), Honey, Almonds, Seeds (pumpkin, sunflower, chia), Rice crispies, Cocoa powder, Cold pressed coconut oil.',
    ['en:gluten', 'en:nuts', 'en:soybeans'], n(418, 18, 60, 3.5, 12, 11, 9, 63, 3), { tracesTags: ['en:peanuts', 'en:milk'] }),
  item(7, 'Ragi Bites Choco Fills', 'Soulfull', CEREAL, ['Breakfast', 'Breakfast cereals', 'Cereal', 'Millet cereal', 'Kids cereal'], '30 g',
    'Multigrain flour (ragi 31%, rice, wheat, oats), Sugar, Choco filling (sugar, vegetable fat, cocoa solids 5%, milk solids, emulsifier INS 322), Iodised salt, Vitamins, Minerals.',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(400, 17, 150, 1.5, 4.5, 7.5, 6.5, 81, 4)),
  item(8, 'Rava Idli Instant Mix', 'MTR', CEREAL, ['Breakfast', 'Breakfast mix', 'Instant mix', 'Idli'], '50 g',
    'Semolina (rava) (60%), Rice flour, Curd powder, Edible vegetable oil, Iodised salt, Cashew, Bengal gram dal, Mustard, Green chilli, Curry leaves, Sodium bicarbonate, Citric acid.',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:nuts', 'en:mustard'], n(380, 1.5, 800, 1.5, 6, 10, 3, 70, 3), { regions: GULF_AND_DIASPORA }),
  item(9, 'Upma Breakfast Mix', 'MTR', CEREAL, ['Breakfast', 'Breakfast mix', 'Instant mix', 'Upma'], '60 g',
    'Semolina (rava) (70%), Edible vegetable oil (palmolein), Iodised salt, Bengal gram dal, Black gram dal, Cashew, Green chilli, Ginger, Mustard, Curry leaves, Sugar.',
    ['en:gluten', 'en:wheat', 'en:nuts', 'en:mustard'], n(430, 2, 900, 5.5, 13, 10, 3, 68, 3), { regions: GULF_AND_DIASPORA }),
  item(10, 'Instant Dosa Mix (Rice & Urad)', 'Gits', CEREAL, ['Breakfast', 'Breakfast mix', 'Instant mix', 'Dosa mix'], '50 g',
    'Rice flour (65%), Black gram flour (urad 25%), Iodised salt, Raising agent (INS 500(ii)), Fenugreek.',
    [], n(355, 0.8, 750, 0.3, 1.2, 10, 4, 76, 3)),
  item(11, 'High Protein Rolled Oats', 'Yoga Bar', CEREAL, ['Breakfast', 'Oats', 'Porridge', 'High protein', 'Cereal'], '50 g',
    'Rolled oats (75%), Whey protein concentrate (milk) (20%), Cocoa powder, Stevia.',
    ['en:gluten', 'en:milk'], n(389, 2, 60, 1.8, 7, 22, 8.5, 56, 4)),

  // ==========================================
  // Biscuits & cookies
  // ==========================================
  item(20, 'Monaco Classic Salted Crackers', 'Parle', BISCUITS, ['Biscuits', 'Crackers', 'Salted biscuits', 'Tea snacks'], '25 g',
    'Refined wheat flour (maida), Edible vegetable oil (palm), Sugar, Iodised salt, Invert sugar syrup, Yeast, Raising agents (INS 500(ii), INS 503(ii)), Malt extract, Emulsifier (INS 322 from soya), Dough conditioner (INS 223).',
    ['en:gluten', 'en:wheat', 'en:soybeans'], n(503, 6, 900, 10, 21, 8, 2, 70, 4), { tracesTags: ['en:milk', 'en:sulphites'] }),
  item(21, 'Krackjack Sweet & Salty Crackers', 'Parle', BISCUITS, ['Biscuits', 'Crackers', 'Tea snacks'], '25 g',
    'Refined wheat flour (maida), Edible vegetable oil (palm), Sugar, Invert sugar syrup, Iodised salt, Raising agents (INS 503(ii), INS 500(ii)), Yeast, Emulsifier (INS 322 from soya), Dough conditioner (INS 223).',
    ['en:gluten', 'en:wheat', 'en:soybeans'], n(487, 15, 600, 9.5, 19.5, 7, 1.5, 70, 4), { tracesTags: ['en:milk'] }),
  item(22, 'Hide & Seek Chocolate Chip Cookies', 'Parle', BISCUITS, ['Biscuits', 'Cookies', 'Chocolate chip cookies'], '25 g',
    'Refined wheat flour (maida), Sugar, Edible vegetable oil (palm), Chocolate chips (10%) (sugar, cocoa solids, cocoa butter, emulsifier INS 322), Invert sugar syrup, Cocoa solids, Milk solids, Raising agents (INS 503(ii), INS 500(ii)), Iodised salt, Emulsifier (INS 322 from soya), Artificial flavours (chocolate, vanilla).',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(497, 31, 250, 10.5, 21, 6, 2, 70, 4)),
  item(23, 'Bourbon Chocolate Cream Biscuits', 'Britannia', BISCUITS, ['Biscuits', 'Cream biscuits', 'Chocolate biscuits', 'Sandwich biscuits'], '25 g',
    'Refined wheat flour (maida), Sugar, Edible vegetable oil (palm), Cocoa solids (4%), Invert sugar syrup, Milk solids, Raising agents (INS 503(ii), INS 500(ii)), Iodised salt, Emulsifier (INS 322 from soya), Artificial flavours (chocolate, vanilla).',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(482, 33, 300, 9.5, 19.5, 5.5, 2, 71, 4)),
  item(24, '50-50 Sweet & Salty Biscuits', 'Britannia', BISCUITS, ['Biscuits', 'Crackers', 'Tea snacks'], '25 g',
    'Refined wheat flour (maida), Edible vegetable oil (palm), Sugar, Iodised salt, Invert sugar syrup, Milk solids, Raising agents (INS 503(ii), INS 500(ii)), Yeast, Emulsifiers (INS 322 from soya, INS 471), Dough conditioner (INS 223).',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(489, 13, 800, 10, 20, 7.5, 2, 69, 4)),
  item(25, 'NutriChoice Oats Essentials Biscuits', 'Britannia', BISCUITS, ['Biscuits', 'Oat biscuits', 'High fibre', 'Digestive biscuits'], '25 g',
    'Whole wheat flour (atta 30%), Rolled oats (20%), Refined wheat flour, Edible vegetable oil (palm), Sugar, Wheat bran, Invert sugar syrup, Milk solids, Raising agents (INS 503(ii), INS 500(ii)), Iodised salt, Emulsifier (INS 322 from soya).',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(470, 17, 350, 9, 20, 8, 6, 62, 4)),
  item(26, 'Dark Fantasy Choco Fills Cookies', 'Sunfeast (ITC)', BISCUITS, ['Biscuits', 'Cookies', 'Filled cookies', 'Chocolate biscuits'], '25 g',
    'Refined wheat flour (maida), Sugar, Choco filling (22%) (sugar, edible vegetable oil, cocoa solids, milk solids, emulsifier INS 322), Edible vegetable oil (palm), Invert sugar syrup, Cocoa solids, Liquid glucose, Raising agents (INS 503(ii), INS 500(ii)), Iodised salt, Emulsifiers (INS 322 from soya, INS 471), Artificial flavours (chocolate, vanilla).',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(501, 34, 200, 12, 24, 5.4, 2, 66, 4), { regions: ['IN', 'AE'] }),
  item(27, "Mom's Magic Cashew & Almond Cookies", 'Sunfeast (ITC)', BISCUITS, ['Biscuits', 'Cookies', 'Butter cookies', 'Tea snacks'], '25 g',
    'Refined wheat flour (maida), Sugar, Edible vegetable oil (palm), Cashew (4%), Almond (1%), Butter, Invert sugar syrup, Milk solids, Raising agents (INS 503(ii), INS 500(ii)), Iodised salt, Emulsifier (INS 471), Artificial flavours (butter, vanilla).',
    ['en:gluten', 'en:wheat', 'en:nuts', 'en:milk'], n(512, 24, 300, 12, 25, 7, 1.5, 64, 4)),
  item(28, 'Farmlite Digestive All Good (Whole Wheat & Oats)', 'Sunfeast (ITC)', BISCUITS, ['Biscuits', 'Digestive biscuits', 'High fibre', 'Oat biscuits'], '25 g',
    'Whole wheat flour (atta 38%), Oats (12%), Refined wheat flour, Edible vegetable oil (palm), Sugar, Wheat bran, Invert sugar syrup, Raising agents (INS 503(ii), INS 500(ii)), Iodised salt, Emulsifier (INS 322 from soya).',
    ['en:gluten', 'en:wheat', 'en:soybeans'], n(478, 12, 500, 10, 21, 8, 7, 62, 4), { tracesTags: ['en:milk'] }),
  item(29, 'Choco Chip Cookies', 'Unibic', BISCUITS, ['Biscuits', 'Cookies', 'Chocolate chip cookies'], '25 g',
    'Refined wheat flour (maida), Sugar, Edible vegetable oil (palm), Chocolate chips (14%), Invert sugar syrup, Milk solids, Butter, Raising agents (INS 500(ii), INS 503(ii)), Iodised salt, Emulsifier (INS 322 from soya), Artificial flavour (vanilla).',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(503, 30, 200, 12, 24, 5.8, 2, 66, 4)),
  item(30, 'Ragi Jaggery Cookies (No Maida)', 'Early Foods', BISCUITS, ['Biscuits', 'Cookies', 'Millet cookies', 'Healthy snacks'], '25 g',
    'Ragi flour (finger millet 45%), Whole wheat flour, Jaggery (20%), Butter, Cardamom, Baking powder.',
    ['en:gluten', 'en:wheat', 'en:milk'], n(470, 20, 150, 11, 20, 7, 6, 63, 3)),
  item(31, 'Choco Ragi Millet Cookies', 'Slurrp Farm', BISCUITS, ['Biscuits', 'Cookies', 'Millet cookies', 'Kids snacks'], '25 g',
    'Ragi flour (finger millet 30%), Whole wheat flour, Unrefined cane sugar, Butter, Cocoa powder (5%), Milk solids, Baking powder, Rock salt.',
    ['en:gluten', 'en:wheat', 'en:milk'], n(480, 22, 180, 11, 21, 7.5, 5, 64, 3)),
  item(32, 'Marie Lite Biscuits', 'Sunfeast (ITC)', BISCUITS, ['Biscuits', 'Marie biscuits', 'Tea snacks'], '25 g',
    'Refined wheat flour (maida), Sugar, Edible vegetable oil (palm), Invert sugar syrup, Milk solids, Raising agents (INS 503(ii), INS 500(ii)), Iodised salt, Emulsifier (INS 322 from soya), Dough conditioner (INS 223).',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:soybeans'], n(440, 21, 380, 5, 10.5, 8, 2, 78, 4)),
  item(33, 'Toastea Premium Bake Rusk', 'Britannia', BISCUITS, ['Biscuits', 'Rusk', 'Toast', 'Tea snacks'], '25 g',
    'Refined wheat flour (maida), Sugar, Edible vegetable oil (palm), Wheat gluten, Yeast, Milk solids, Iodised salt, Cardamom, Emulsifier (INS 471), Improver (INS 1100), Preservative (INS 282).',
    ['en:gluten', 'en:wheat', 'en:milk'], n(410, 18, 300, 3.5, 7.5, 11, 2, 74, 4)),

  // ==========================================
  // Chips, crisps & popcorn
  // ==========================================
  item(40, 'American Style Cream & Onion Chips', "Lay's", CHIPS, ['Chips', 'Crisps', 'Potato chips', 'Cream and onion'], '28 g',
    'Potato, Edible vegetable oil (palmolein, rice bran oil), Seasoning (milk solids, sugar, iodised salt, onion powder, cheese powder, herbs, flavour enhancers (INS 627, INS 631), acidity regulator (INS 330), anticaking agent (INS 551)).',
    ['en:milk'], n(544, 4.3, 700, 13, 33, 7, 3.5, 53, 4)),
  item(41, 'Spicy Treat Potato Chips', 'Uncle Chipps', CHIPS, ['Chips', 'Crisps', 'Potato chips', 'Spicy chips'], '28 g',
    'Potato, Edible vegetable oil (palmolein), Seasoning (spices and condiments, iodised salt, sugar, tomato powder, flavour enhancers (INS 627, INS 631), acidity regulator (INS 330)).',
    [], n(545, 2, 750, 15, 33, 6.5, 3, 54, 4)),
  item(42, 'Mad Angles Achaari Masti', 'Bingo (ITC)', CHIPS, ['Chips', 'Extruded snacks', 'Triangle chips', 'Masala chips'], '30 g',
    'Rice grits, Edible vegetable oil (palmolein), Corn grits, Gram flour, Seasoning (spices and condiments, iodised salt, sugar, dried mango powder, flavour enhancers (INS 627, INS 631), acidity regulators (INS 330, INS 296), anticaking agent (INS 551)).',
    [], n(520, 3, 900, 12, 27, 7, 3, 62, 4)),
  item(43, 'Tedhe Medhe Masala Tadka', 'Bingo (ITC)', NAMKEEN, ['Extruded snacks', 'Indian snacks', 'Savoury snacks', 'Masala snacks'], '30 g',
    'Gram flour (besan), Edible vegetable oil (palmolein), Rice meal, Corn meal, Spices and condiments, Iodised salt, Sugar, Flavour enhancers (INS 627, INS 631), Acidity regulator (INS 330).',
    [], n(540, 3, 850, 13, 31, 8, 3.5, 56, 4)),
  item(44, 'Multigrain Chips (Baked, Not Fried)', 'Too Yumm', CHIPS, ['Chips', 'Multigrain chips', 'Baked snacks'], '28 g',
    'Corn grits, Rice grits, Edible vegetable oil (palmolein), Ragi flour, Oats, Jowar flour, Seasoning (spices, iodised salt, sugar, tomato powder, flavour enhancers (INS 627, INS 631), acidity regulator (INS 330)).',
    [], n(456, 4, 700, 8, 18.5, 9, 5, 63, 4)),
  item(45, 'Simply Salted Potato Wafers', 'Balaji', CHIPS, ['Chips', 'Wafers', 'Potato chips', 'Salty snacks'], '30 g',
    'Potatoes, Edible vegetable oil (palmolein), Iodised salt.', [], n(545, 0.5, 500, 15, 35, 6, 3, 52, 3)),
  item(46, 'Roasted Makhana Peri Peri', 'Farmley', CHIPS, ['Roasted snacks', 'Makhana', 'Fox nuts', 'Healthy crisps'], '30 g',
    'Fox nuts (makhana) (85%), Rice bran oil, Peri peri seasoning (chilli, garlic, onion, rock salt, sugar, oregano, citric acid).',
    [], n(400, 3, 600, 3, 12, 9, 10, 63, 3)),
  item(47, 'Classic Salted Microwave Popcorn', 'Act II', CHIPS, ['Popcorn', 'Microwave popcorn', 'Salty snacks'], '35 g',
    'Popcorn kernels (75%), Edible vegetable oil (palm), Iodised salt, Butter flavour (nature identical flavouring substances), Colour (INS 160a(ii)).',
    [], n(480, 0.5, 650, 12, 25, 8, 10, 55, 4)),
  item(48, 'Classic Salted Potato Chips', "Lay's", CHIPS, ['Chips', 'Crisps', 'Potato chips', 'Salty snacks'], '28 g',
    'Potato, Edible vegetable oil (palmolein, rice bran oil), Iodised salt.', [], n(544, 0.5, 520, 13, 33.5, 6.9, 3.9, 53, 3)),

  // ==========================================
  // Namkeen & savoury Indian snacks
  // ==========================================
  item(55, 'Khatta Meetha Namkeen', "Haldiram's", NAMKEEN, ['Namkeen', 'Mixture', 'Indian snacks', 'Savoury snacks'], '30 g',
    'Gram pulse flour (besan), Edible vegetable oil (palmolein), Sugar, Peanuts, Rice flakes, Raisins, Iodised salt, Spices and condiments, Citric acid (INS 330).',
    ['en:peanuts'], n(520, 15, 650, 12, 30, 10, 4, 52, 4), { tracesTags: ['en:nuts', 'en:milk'], regions: GULF_AND_DIASPORA }),
  item(56, 'Navrattan Mix Namkeen', "Haldiram's", NAMKEEN, ['Namkeen', 'Mixture', 'Indian snacks', 'Savoury snacks'], '30 g',
    'Gram pulse flour (besan), Edible vegetable oil (palmolein), Peanuts, Lentils (moong, masoor), Cashew, Raisins, Iodised salt, Sugar, Spices and condiments, Citric acid (INS 330).',
    ['en:peanuts', 'en:nuts'], n(535, 6, 700, 13, 34, 13, 5, 44, 4), { regions: GULF_AND_DIASPORA }),
  item(57, 'Bikaneri Bhujia', 'Bikaji', NAMKEEN, ['Namkeen', 'Bhujia', 'Indian snacks', 'Savoury snacks'], '30 g',
    'Moth bean flour, Gram pulse flour, Edible vegetable oil (palmolein), Iodised salt, Black pepper, Spices and condiments, Black salt.',
    [], n(570, 2, 950, 15, 38, 14, 5, 42, 3), { regions: GULF_AND_DIASPORA }),
  item(58, 'Roasted Chana (Salted)', "Haldiram's", NAMKEEN, ['Roasted snacks', 'Chana', 'Chickpeas', 'Healthy snacks', 'High protein'], '30 g',
    'Roasted Bengal gram (chana) (97%), Iodised salt, Turmeric.', [], n(370, 2, 400, 1, 6, 22, 17, 58, 3)),
  item(59, 'Masala Peanuts', "Haldiram's", NAMKEEN, ['Namkeen', 'Peanuts', 'Coated peanuts', 'Savoury snacks'], '30 g',
    'Peanuts (60%), Gram pulse flour, Edible vegetable oil (palmolein), Iodised salt, Spices and condiments, Citric acid (INS 330).',
    ['en:peanuts'], n(540, 3, 800, 6, 35, 20, 6, 34, 4), { regions: GULF_AND_DIASPORA }),
  item(60, 'Plain Murmura (Puffed Rice)', 'Tata Sampann', NAMKEEN, ['Puffed rice', 'Murmura', 'Indian snacks', 'Light snacks'], '30 g',
    'Puffed rice, Iodised salt.', [], n(380, 0.2, 60, 0.1, 0.5, 7, 1.5, 86, 1)),

  // ==========================================
  // Instant noodles & pasta
  // ==========================================
  item(65, 'Atta Masala Noodles', 'Nestlé Maggi', NOODLES, ['Noodles', 'Instant noodles', 'Whole wheat noodles'], '72.5 g',
    'Noodles: Whole wheat flour (atta 57%), Refined wheat flour, Palm oil, Iodised salt, Wheat gluten, Thickeners (INS 508, INS 412), Acidity regulators (INS 501(i), INS 500(i)). Tastemaker: Mixed spices, Dehydrated vegetables (carrot, peas, beans), Sugar, Iodised salt, Hydrolysed groundnut protein, Flavour enhancer (INS 635), Thickener (INS 508).',
    ['en:gluten', 'en:wheat', 'en:peanuts'], n(360, 2.5, 1000, 4.5, 9.5, 9.5, 7, 61, 4), { tracesTags: ['en:milk', 'en:soybeans'] }),
  item(66, 'Schezwan Instant Noodles', "Ching's Secret", NOODLES, ['Noodles', 'Instant noodles', 'Schezwan noodles', 'Spicy noodles'], '60 g',
    'Noodles: Refined wheat flour (maida), Edible vegetable oil (palmolein), Iodised salt, Thickener (INS 412), Acidity regulator (INS 501(i)). Masala: Salt, Sugar, Red chilli, Garlic, Soya sauce powder, Flavour enhancers (INS 627, INS 631, INS 621), Spices, Acidity regulator (INS 330).',
    ['en:gluten', 'en:wheat', 'en:soybeans'], n(455, 4, 1300, 8.5, 18, 9, 2.5, 63, 4)),
  item(67, 'Top Ramen Curry Noodles', 'Nissin', NOODLES, ['Noodles', 'Instant noodles', 'Curry noodles'], '70 g',
    'Noodles: Refined wheat flour (maida), Edible vegetable oil (palmolein), Iodised salt, Wheat gluten, Thickener (INS 412), Acidity regulators (INS 500(i), INS 501(i)). Tastemaker: Spices and condiments, Iodised salt, Sugar, Hydrolysed vegetable protein, Flavour enhancers (INS 627, INS 631).',
    ['en:gluten', 'en:wheat', 'en:soybeans'], n(450, 3, 1100, 9, 18, 9, 2.5, 62, 4)),
  item(68, 'Wai Wai Veg Masala Noodles', 'Wai Wai', NOODLES, ['Noodles', 'Instant noodles', 'Ready to eat noodles'], '70 g',
    'Noodles: Refined wheat flour (maida), Edible vegetable oil (palm), Iodised salt, Mineral (INS 170(i)), Thickener (INS 412). Seasoning: Spices, Salt, Sugar, Dehydrated vegetables, Flavour enhancers (INS 627, INS 631).',
    ['en:gluten', 'en:wheat'], n(470, 3, 1050, 10, 21, 8.5, 2, 60, 4), { regions: ['IN', 'AE'] }),
  item(69, 'Veg Hakka Noodles (Non-Fried)', "Ching's Secret", NOODLES, ['Noodles', 'Hakka noodles', 'Dry noodles'], '75 g (dry)',
    'Refined wheat flour (maida), Water, Iodised salt, Wheat gluten.', ['en:gluten', 'en:wheat'], n(350, 1, 300, 0.3, 1.5, 11, 3, 74, 3)),
  item(70, 'Whole Wheat Penne Pasta', 'Borges', NOODLES, ['Pasta', 'Whole wheat pasta', 'Penne'], '80 g (dry)',
    'Whole durum wheat semolina, Water.', ['en:gluten', 'en:wheat'], n(348, 3, 8, 0.4, 2.5, 13, 8, 64, 1)),

  // ==========================================
  // Chocolates & Indian sweets
  // ==========================================
  item(75, '5 Star Chocolate Bar', 'Cadbury', SWEETS, ['Chocolates', 'Chocolate bars', 'Caramel', 'Confectionery'], '40 g',
    'Sugar, Liquid glucose, Milk solids (14%), Hydrogenated vegetable fat, Cocoa solids, Cocoa butter, Emulsifiers (INS 442, INS 471, INS 322), Iodised salt, Artificial flavours.',
    ['en:milk', 'en:soybeans'], n(461, 54, 200, 13, 19, 3.4, 0.5, 68, 4), { tracesTags: ['en:nuts', 'en:wheat'] }),
  item(76, 'Perk Chocolate Wafer', 'Cadbury', SWEETS, ['Chocolates', 'Chocolate wafer', 'Confectionery'], '13 g',
    'Sugar, Refined wheat flour, Hydrogenated vegetable fat, Milk solids, Cocoa solids, Cocoa butter, Emulsifiers (INS 442, INS 476), Raising agent (INS 500(ii)), Iodised salt, Artificial flavours.',
    ['en:milk', 'en:gluten', 'en:wheat'], n(525, 45, 120, 18, 27, 6, 1.5, 64, 4)),
  item(77, 'Munch Crunchy Wafer Bar', 'Nestlé', SWEETS, ['Chocolates', 'Chocolate wafer', 'Confectionery'], '10 g',
    'Sugar, Refined wheat flour, Hydrogenated vegetable fat, Milk solids, Cocoa solids, Emulsifiers (INS 322 from soya, INS 476), Raising agent (INS 500(ii)), Iodised salt, Artificial flavours.',
    ['en:milk', 'en:gluten', 'en:wheat', 'en:soybeans'], n(500, 45, 100, 17, 23, 6, 1, 67, 4)),
  item(78, 'Bournville Rich Cocoa 50% Dark', 'Cadbury', SWEETS, ['Chocolates', 'Dark chocolate', 'High cocoa'], '20 g',
    'Cocoa solids (50%), Sugar, Cocoa butter, Emulsifiers (INS 442, INS 476), Artificial flavours.',
    [], n(520, 38, 20, 19, 32, 6, 9, 50, 4), { tracesTags: ['en:milk', 'en:nuts'] }),
  item(79, 'Soan Papdi', "Haldiram's", SWEETS, ['Indian sweets', 'Mithai', 'Desserts', 'Confectionery'], '30 g',
    'Sugar, Gram flour (besan), Refined wheat flour, Edible vegetable fat (vanaspati), Ghee, Milk solids, Cardamom, Pistachio, Almond.',
    ['en:gluten', 'en:wheat', 'en:milk', 'en:nuts'], n(520, 45, 20, 15, 25, 5, 1, 68, 4), { regions: GULF_AND_DIASPORA }),
  item(80, 'Gulab Jamun (Tinned)', "Haldiram's", SWEETS, ['Indian sweets', 'Mithai', 'Desserts', 'Canned sweets'], '100 g (2 pieces)',
    'Sugar syrup (sugar, water), Milk solids (khoa), Refined wheat flour, Ghee, Cardamom, Raising agent (INS 500(ii)).',
    ['en:milk', 'en:gluten', 'en:wheat'], n(300, 50, 50, 3, 6, 3, 0.5, 60, 3), { regions: GULF_AND_DIASPORA }),
  item(81, 'Rasgulla (Tinned)', "Haldiram's", SWEETS, ['Indian sweets', 'Mithai', 'Desserts', 'Canned sweets'], '100 g (2 pieces)',
    'Sugar syrup (sugar, water), Chhena (cottage cheese from milk), Refined wheat flour, Rose water.',
    ['en:milk', 'en:gluten', 'en:wheat'], n(186, 40, 20, 1, 1.5, 4, 0, 41, 3), { regions: GULF_AND_DIASPORA }),
  item(82, 'Kachcha Aam Candy', 'Pass Pass Pulse', SWEETS, ['Candy', 'Hard candy', 'Confectionery'], '4 g (1 candy)',
    'Sugar, Liquid glucose, Raw mango pulp (2%), Iodised salt, Black salt, Spices, Acidity regulator (INS 330, INS 296), Colours (INS 102, INS 133), Added flavours (nature identical flavouring substances).',
    [], n(390, 80, 400, 0, 0, 0, 0, 97, 4)),
  item(83, 'Milk Chocolate', 'Amul', SWEETS, ['Chocolates', 'Milk chocolate', 'Confectionery'], '25 g',
    'Sugar, Milk solids (24%), Cocoa butter, Cocoa solids, Emulsifiers (INS 322 from soya, INS 476), Artificial flavour (vanillin).',
    ['en:milk', 'en:soybeans'], n(550, 52, 100, 20, 33, 7.5, 1.5, 55, 4)),

  // ==========================================
  // Dairy, curd & dairy drinks
  // ==========================================
  item(90, 'Gold Full Cream Milk', 'Amul', DAIRY, ['Dairy', 'Full cream milk', 'Milk', 'Beverages'], '200 ml',
    'Full cream milk. Pasteurised and homogenised.', ['en:milk'], n(88, 4.7, 45, 4, 6, 3.3, 0, 4.7, 1)),
  item(91, 'Mishti Doi (Sweet Curd)', 'Mother Dairy', DAIRY, ['Dairy', 'Curd', 'Sweet yogurt', 'Desserts'], '100 g',
    'Toned milk, Sugar, Milk solids, Active cultures.', ['en:milk'], n(140, 18, 50, 2.3, 3.5, 3.8, 0, 22, 3)),
  item(92, 'Classic Dahi (Curd)', 'Mother Dairy', DAIRY, ['Dairy', 'Curd', 'Dahi', 'Yogurt'], '100 g',
    'Pasteurised toned milk, Active cultures.', ['en:milk'], n(70, 4.8, 45, 2.1, 3.2, 3.4, 0, 4.8, 1)),
  item(93, 'Processed Cheese Slices', 'Amul', DAIRY, ['Dairy', 'Cheese', 'Processed cheese', 'Cheese slices'], '20 g (1 slice)',
    'Cheese, Milk solids, Emulsifiers (INS 331, INS 339), Common salt, Preservative (INS 200), Colour (INS 160b(ii)).',
    ['en:milk'], n(311, 1.6, 1200, 17, 25, 20, 0, 1.6, 4), { regions: ['IN', 'AE'] }),
  item(94, 'Kool Kesar Flavoured Milk', 'Amul', DAIRY, ['Dairy', 'Flavoured milk', 'Milk drinks', 'Beverages'], '180 ml',
    'Toned milk, Sugar, Milk solids, Stabiliser (INS 407), Saffron, Cardamom, Added flavours (nature identical), Colour (INS 110).',
    ['en:milk'], n(85, 11, 50, 1.5, 2.5, 3, 0, 13, 4)),
  item(95, 'Lassi (Sweet)', 'Amul', DAIRY, ['Dairy', 'Lassi', 'Yogurt drinks', 'Beverages'], '200 ml',
    'Toned milk, Sugar, Milk solids, Active cultures, Stabiliser (INS 440).', ['en:milk'], n(82, 11.5, 50, 1.4, 2.2, 2.8, 0, 13.5, 3)),
  item(96, 'Masti Spiced Buttermilk (Chaas)', 'Amul', DAIRY, ['Dairy', 'Buttermilk', 'Chaas', 'Beverages'], '200 ml',
    'Toned milk curd, Water, Iodised salt, Green chilli, Ginger, Coriander leaves, Curry leaves, Asafoetida.',
    ['en:milk'], n(15, 1.5, 220, 0.3, 0.5, 1, 0, 1.6, 3)),
  item(97, 'Pure Cow Ghee', 'Amul', DAIRY, ['Dairy', 'Ghee', 'Cooking fats'], '5 g (1 tsp)',
    'Milk fat (from cow milk).', ['en:milk'], n(897, 0, 0, 62, 99.7, 0, 0, 0, 2), { regions: ['IN', 'AE', 'SG', 'GB', 'US'] }),
  item(98, 'Plain Soya Milk', 'Sofit', DAIRY, ['Plant milk', 'Soy milk', 'Dairy alternatives', 'Beverages'], '200 ml',
    'Water, Soya bean solids (8%), Sugar, Calcium phosphate, Stabiliser (INS 418), Iodised salt, Vitamins, Added flavours (nature identical).',
    ['en:soybeans'], n(45, 3.8, 40, 0.3, 1.8, 3, 0.5, 4, 4)),
  item(99, 'High Protein Paneer', 'Milky Mist', DAIRY, ['Dairy', 'Paneer', 'Cottage cheese', 'High protein'], '50 g',
    'Pasteurised milk, Acidity regulator (citric acid).', ['en:milk'], n(265, 2, 25, 12, 19, 21, 0, 2, 1)),
  item(100, 'Low Fat Greek Yogurt (Blueberry)', 'Epigamia', DAIRY, ['Dairy', 'Yogurt', 'Greek yogurt', 'Flavoured yogurt'], '90 g',
    'Pasteurised double toned milk, Blueberry compote (blueberries, sugar, pectin), Sugar, Milk solids, Active cultures.',
    ['en:milk'], n(104, 11.5, 45, 1.3, 2, 6.5, 0.3, 14.5, 3)),

  // ==========================================
  // Soft drinks, juices & health drinks
  // ==========================================
  item(105, 'Aamras (Mango Drink)', 'Paper Boat', DRINKS, ['Beverages', 'Mango drink', 'Fruit drinks', 'Juice'], '200 ml',
    'Water, Mango pulp (25%), Sugar, Acidity regulator (INS 330).', [], n(66, 15, 10, 0, 0.1, 0.2, 0.3, 16, 3), { regions: ['IN', 'AE', 'US', 'GB'] }),
  item(106, 'Maaza Mango Drink', 'Maaza (Coca-Cola India)', DRINKS, ['Beverages', 'Mango drink', 'Fruit drinks', 'Juice'], '250 ml',
    'Water, Sugar, Mango pulp (19.7%), Acidity regulator (INS 330), Preservative (INS 211), Added flavours (natural and nature identical flavouring substances).',
    [], n(64, 15.5, 15, 0, 0, 0, 0, 16, 4), { regions: ['IN', 'AE'] }),
  item(107, 'Fruit Power Mixed Fruit Juice', 'Real (Dabur)', DRINKS, ['Beverages', 'Fruit juices', 'Mixed fruit juice', 'Juice'], '200 ml',
    'Water, Mixed fruit juice concentrates (apple, orange, pineapple, guava, mango, banana), Sugar, Acidity regulator (INS 330), Stabiliser (INS 440), Antioxidant (INS 300), Added flavours.',
    [], n(55, 13, 10, 0, 0, 0.2, 0.2, 13.5, 4)),
  item(108, 'Sprite Lime Soda', 'Sprite (Coca-Cola India)', DRINKS, ['Beverages', 'Soft drinks', 'Soda', 'Lemon lime soda'], '250 ml',
    'Carbonated water, Sugar, Acidity regulators (INS 330, INS 331), Preservative (INS 211), Added flavours (natural flavouring substances).',
    [], n(44, 11, 15, 0, 0, 0, 0, 11, 4)),
  item(109, 'Limca Lemon Soda', 'Limca (Coca-Cola India)', DRINKS, ['Beverages', 'Soft drinks', 'Soda', 'Lemon soda'], '250 ml',
    'Carbonated water, Sugar, Acidity regulators (INS 330, INS 331), Preservative (INS 211), Emulsifier (INS 414), Stabiliser (INS 445), Added flavours (natural flavouring substances).',
    [], n(45, 11.2, 15, 0, 0, 0, 0, 11.2, 4)),
  item(110, 'Activ Tender Coconut Water', 'Real (Dabur)', DRINKS, ['Beverages', 'Coconut water', 'Natural drinks'], '200 ml',
    '100% Tender coconut water.', [], n(19, 4.5, 25, 0, 0, 0.2, 0, 4.7, 1)),
  item(111, 'Classic Malt Health Drink', 'Horlicks', CEREAL, ['Beverages', 'Malted drinks', 'Health drinks', 'Breakfast drinks'], '27 g',
    'Malted barley (32%), Wheat flour (32%), Milk solids, Sugar, Minerals, Vitamins, Iodised salt.',
    ['en:gluten', 'en:wheat', 'en:milk'], n(377, 22, 300, 1, 2, 11, 3, 78, 4)),
  item(112, 'Glucon-D Original Instant Energy', 'Glucon-D', DRINKS, ['Beverages', 'Glucose powder', 'Energy drinks'], '25 g',
    'Glucose (dextrose monohydrate) (99.4%), Calcium phosphate, Vitamin D.', [], n(384, 99, 10, 0, 0, 0, 0, 99.4, 4)),
  item(113, 'Nimbu Pani (Lemon Drink)', 'Paper Boat', DRINKS, ['Beverages', 'Lemon drink', 'Traditional drinks'], '200 ml',
    'Water, Sugar, Lemon juice concentrate (5%), Black salt, Cumin, Rock salt, Acidity regulator (INS 330).',
    [], n(40, 9.5, 120, 0, 0, 0, 0, 10, 3)),
  item(114, 'Tata Tea Gold (Leaf Tea)', 'Tata Tea', DRINKS, ['Beverages', 'Tea', 'Leaf tea', 'Black tea'], '2 g',
    'Black tea leaves (CTC and long leaf blend).', [], n(0, 0, 0, 0, 0, 0, 0, 0, 1)),

  // ==========================================
  // Spreads, sauces, pickles & honey
  // ==========================================
  item(120, 'Fresh Tomato Ketchup', 'Kissan', SPREADS, ['Sauces', 'Ketchup', 'Condiments', 'Tomato sauce'], '15 g',
    'Tomato paste (28%), Sugar, Water, Iodised salt, Acidity regulator (INS 260), Thickener (INS 1422), Preservative (INS 211), Onion, Garlic, Spices.',
    [], n(125, 28, 900, 0, 0.1, 1.2, 0.5, 30, 4)),
  item(121, 'Hot & Sweet Tomato Chilli Sauce', 'Nestlé Maggi', SPREADS, ['Sauces', 'Chilli sauce', 'Condiments'], '15 g',
    'Water, Sugar, Tomato paste (18%), Iodised salt, Thickener (INS 1422), Chilli, Acidity regulator (INS 260), Garlic, Preservative (INS 211), Spices.',
    [], n(145, 32, 1100, 0, 0.1, 0.8, 0.5, 35, 4)),
  item(122, 'Veg Mayonnaise (Eggless)', 'Dr. Oetker FunFoods', SPREADS, ['Sauces', 'Mayonnaise', 'Eggless mayo', 'Spreads'], '15 g',
    'Edible vegetable oil (soyabean), Water, Milk solids, Sugar, Iodised salt, Acidity regulator (INS 260), Thickeners (INS 1422, INS 415), Emulsifier (INS 471), Preservative (INS 211), Mustard.',
    ['en:milk', 'en:soybeans', 'en:mustard'], n(340, 6, 700, 3.5, 33, 0.8, 0, 11, 4)),
  item(123, 'All Natural Peanut Butter (Crunchy, Unsweetened)', 'Pintola', SPREADS, ['Spreads', 'Peanut butter', 'Nut butters', 'Natural'], '32 g',
    '100% Roasted peanuts.', ['en:peanuts'], n(639, 4, 10, 8, 50, 30, 8, 18, 1)),
  item(124, 'Crunchy Peanut Butter', 'Sundrop', SPREADS, ['Spreads', 'Peanut butter', 'Nut butters'], '32 g',
    'Roasted peanuts (88%), Sugar, Hydrogenated vegetable oil, Iodised salt, Emulsifier (INS 471).',
    ['en:peanuts'], n(600, 11, 350, 9, 47, 24, 6, 22, 4)),
  item(125, 'Pure Honey', 'Dabur', SPREADS, ['Spreads', 'Honey', 'Sweeteners'], '20 g',
    '100% Honey.', [], n(320, 80, 10, 0, 0, 0.3, 0, 80, 2), { regions: ['IN', 'AE'] }),
  item(126, 'Mango Pickle (Aam ka Achaar)', "Mother's Recipe", SPREADS, ['Pickles', 'Achaar', 'Condiments'], '15 g',
    'Raw mango (55%), Mustard oil, Iodised salt, Red chilli powder, Mustard, Fenugreek, Turmeric, Fennel, Nigella, Asafoetida, Acidity regulator (INS 260).',
    ['en:mustard'], n(210, 2, 3500, 2.5, 18, 1, 2, 8, 3), { regions: GULF_AND_DIASPORA }),
  item(127, 'Mint Chutney', 'Dabur Hommade', SPREADS, ['Chutney', 'Condiments', 'Sauces'], '15 g',
    'Water, Mint leaves (20%), Coriander leaves, Sugar, Green chilli, Iodised salt, Lemon juice, Thickener (INS 415), Preservative (INS 211).',
    [], n(90, 15, 900, 0.1, 0.5, 1.5, 2, 18, 4)),
  item(128, 'Chocolate Spread', 'Hershey\'s', SPREADS, ['Spreads', 'Sweet spreads', 'Chocolate spread'], '15 g',
    'Sugar, Edible vegetable oil (palm), Cocoa solids (10%), Milk solids, Emulsifier (INS 322 from soya), Artificial flavour (vanillin).',
    ['en:milk', 'en:soybeans'], n(540, 56, 60, 10, 31, 4, 3, 60, 4)),

  // ==========================================
  // Bread & bakery
  // ==========================================
  item(135, '100% Whole Wheat Bread', 'Britannia', BREAD, ['Bread', 'Whole wheat bread', 'Brown bread', 'Bakery'], '50 g (2 slices)',
    'Whole wheat flour (atta) (68%), Water, Yeast, Sugar, Wheat gluten, Edible vegetable oil, Iodised salt, Preservative (INS 282), Emulsifier (INS 471), Improver (INS 1100).',
    ['en:gluten', 'en:wheat'], n(240, 4, 450, 0.8, 2.5, 9.5, 6, 44, 4), { tracesTags: ['en:milk', 'en:soybeans'] }),
  item(136, 'Brown Bread', 'Modern', BREAD, ['Bread', 'Brown bread', 'Sandwich bread', 'Bakery'], '50 g (2 slices)',
    'Refined wheat flour (maida), Whole wheat flour (atta 20%), Water, Sugar, Yeast, Edible vegetable oil, Iodised salt, Wheat gluten, Colour (INS 150a), Preservative (INS 282), Emulsifier (INS 471).',
    ['en:gluten', 'en:wheat'], n(245, 5, 480, 0.8, 2, 8.5, 3.5, 47, 4)),
  item(137, 'Multigrain Bread', 'Harvest Gold', BREAD, ['Bread', 'Multigrain bread', 'Whole grain bread', 'Bakery'], '50 g (2 slices)',
    'Refined wheat flour (maida), Water, Multigrain mix (12%) (oats, flax seeds, sunflower seeds, ragi, jowar), Whole wheat flour, Sugar, Yeast, Edible vegetable oil, Iodised salt, Wheat gluten, Preservative (INS 282), Emulsifier (INS 471).',
    ['en:gluten', 'en:wheat'], n(255, 4.5, 470, 1, 4, 9, 4.5, 45, 4)),
  item(138, 'Fruit Cake', 'Britannia', BREAD, ['Cakes', 'Fruit cake', 'Bakery', 'Desserts'], '30 g',
    'Refined wheat flour (maida), Sugar, Edible vegetable oil (palm), Tutti frutti (papaya, sugar, colours INS 102, INS 124), Egg, Raisins, Invert sugar syrup, Milk solids, Humectant (INS 422), Raising agents (INS 450(i), INS 500(ii)), Emulsifiers (INS 471, INS 475), Preservative (INS 202), Artificial flavours.',
    ['en:gluten', 'en:wheat', 'en:eggs', 'en:milk'], n(380, 33, 250, 8, 17, 5, 1, 53, 4)),
  item(139, 'Ladi Pav (Soft Buns)', 'Harvest Gold', BREAD, ['Bread', 'Pav', 'Buns', 'Bakery'], '40 g (1 pav)',
    'Refined wheat flour (maida), Water, Sugar, Yeast, Edible vegetable oil, Iodised salt, Milk solids, Preservative (INS 282), Emulsifier (INS 471).',
    ['en:gluten', 'en:wheat', 'en:milk'], n(270, 6, 430, 1.5, 4, 8, 2, 51, 4)),

  // ==========================================
  // Staples: atta, rice, dal & millets
  // ==========================================
  item(145, 'Classic Basmati Rice', 'India Gate', STAPLES, ['Rice', 'Basmati rice', 'Staples'], '60 g (dry)',
    '100% Aged basmati rice.', [], n(351, 0.1, 2, 0.2, 0.6, 8, 1, 79, 1), { regions: GULF_AND_DIASPORA }),
  item(146, 'Unpolished Moong Dal', 'Tata Sampann', STAPLES, ['Dal', 'Lentils', 'Pulses', 'Staples', 'High protein'], '50 g (dry)',
    'Unpolished split green gram (moong dal).', [], n(348, 2, 15, 0.3, 1.2, 24, 16, 59, 1)),
  item(147, 'Unpolished Chana Dal', 'Tata Sampann', STAPLES, ['Dal', 'Lentils', 'Pulses', 'Staples', 'High protein'], '50 g (dry)',
    'Unpolished split Bengal gram (chana dal).', [], n(360, 3, 30, 0.6, 5.6, 21, 12, 60, 1)),
  item(148, 'Besan (Gram Flour)', 'Fortune', STAPLES, ['Flour', 'Besan', 'Gram flour', 'Staples'], '50 g',
    '100% Bengal gram flour (besan).', [], n(387, 10.8, 60, 0.9, 6, 22, 11, 58, 1)),
  item(149, 'Organic Ragi Flour', '24 Mantra Organic', STAPLES, ['Flour', 'Ragi flour', 'Millet flour', 'Staples', 'Millets'], '50 g',
    '100% Organic finger millet (ragi) flour.', [], n(328, 0.6, 11, 0.3, 1.3, 7.3, 11.5, 72, 1)),
  item(150, 'White Quinoa', 'Organic Tattva', STAPLES, ['Quinoa', 'Grains', 'Staples', 'High protein'], '50 g (dry)',
    '100% Organic white quinoa.', [], n(368, 0, 5, 0.7, 6, 14, 7, 64, 1)),
  item(151, 'Multigrain Atta', 'Aashirvaad (ITC)', STAPLES, ['Atta', 'Multigrain flour', 'Flour', 'Staples'], '100 g',
    'Whole wheat flour (atta), Soya, Chana, Oats, Maize, Psyllium husk.', ['en:gluten', 'en:wheat', 'en:soybeans'], n(350, 1, 5, 0.5, 2.5, 12, 12, 68, 1)),
  item(152, 'Thick Poha (Flattened Rice)', 'Tata Sampann', STAPLES, ['Poha', 'Flattened rice', 'Breakfast', 'Staples'], '50 g (dry)',
    '100% Flattened rice (poha).', [], n(346, 0.5, 5, 0.3, 1.2, 6.6, 3.5, 77, 1)),
  item(153, 'Foxtail Millet (Kangni)', 'Organic Tattva', STAPLES, ['Millets', 'Foxtail millet', 'Grains', 'Staples'], '50 g (dry)',
    '100% Organic foxtail millet.', [], n(351, 1, 5, 0.6, 4, 12.3, 8, 63, 1)),

  // ==========================================
  // Ready meals & soups
  // ==========================================
  item(160, 'Ready to Eat Paneer Butter Masala', 'MTR', READY, ['Ready meals', 'Ready to eat', 'Curry', 'Paneer curry'], '150 g',
    'Water, Paneer (18%), Tomato paste, Butter, Cream, Cashew paste, Onion, Edible vegetable oil, Sugar, Iodised salt, Ginger, Garlic, Spices and condiments.',
    ['en:milk', 'en:nuts'], n(175, 3, 600, 7, 13, 6, 1.5, 8, 3), { regions: GULF_AND_DIASPORA }),
  item(161, 'Ready to Eat Chana Masala', "Haldiram's Minute Khana", READY, ['Ready meals', 'Ready to eat', 'Curry', 'Chickpeas'], '150 g',
    'Water, Chickpeas (30%), Tomato, Onion, Edible vegetable oil, Iodised salt, Ginger, Garlic, Spices and condiments.',
    [], n(130, 2, 500, 1.5, 6, 5, 4.5, 14, 3), { regions: GULF_AND_DIASPORA }),
  item(162, 'Ready to Eat Rajma Masala', 'MTR', READY, ['Ready meals', 'Ready to eat', 'Curry', 'Rajma'], '150 g',
    'Water, Kidney beans (rajma 28%), Tomato paste, Onion, Edible vegetable oil, Butter, Iodised salt, Ginger, Garlic, Spices and condiments, Sugar.',
    ['en:milk'], n(118, 2, 480, 1.5, 4.5, 5, 4, 13, 3), { regions: GULF_AND_DIASPORA }),
  item(163, 'Classic Thick Tomato Soup (Instant Mix)', 'Knorr', READY, ['Soups', 'Instant soup', 'Soup mix'], '13 g (1 serving)',
    'Sugar, Tomato powder (24%), Corn starch, Iodised salt, Maltodextrin, Edible vegetable fat (palm), Milk solids, Onion powder, Flavour enhancers (INS 627, INS 631), Spices, Acidity regulator (INS 330), Colour (INS 160c).',
    ['en:milk'], n(360, 30, 4500, 3, 6, 6, 3, 70, 4)),
  item(164, 'Idly & Dosa Batter', 'iD Fresh', READY, ['Batter', 'Idli batter', 'Dosa batter', 'Breakfast'], '100 g',
    'Rice, Black gram (urad dal), Water, Iodised salt, Fenugreek.', [], n(140, 0.5, 300, 0.1, 0.5, 4.5, 1.5, 29, 3), { regions: ['IN', 'AE', 'GB', 'US'] }),
  item(165, 'Instant Poha Cup', 'MTR', READY, ['Ready meals', 'Instant breakfast', 'Poha'], '80 g',
    'Flattened rice (poha 65%), Edible vegetable oil (palmolein), Peanuts, Sugar, Iodised salt, Dehydrated onion, Curry leaves, Mustard, Turmeric, Green chilli, Citric acid (INS 330).',
    ['en:peanuts', 'en:mustard'], n(410, 6, 750, 5, 13, 7, 3, 67, 4)),
  item(166, 'Frozen Aloo Tikki', 'McCain', READY, ['Frozen snacks', 'Aloo tikki', 'Frozen food'], '60 g (2 pieces)',
    'Potatoes (68%), Edible vegetable oil (palmolein), Peas, Bread crumbs (refined wheat flour, yeast, salt), Corn starch, Iodised salt, Spices, Green chilli, Coriander.',
    ['en:gluten', 'en:wheat'], n(190, 1.5, 450, 4, 8.5, 3, 2.5, 25, 4)),

  // ==========================================
  // Snack & protein bars
  // ==========================================
  item(170, 'Max Protein Daily Choco Almond Bar', 'RiteBite', BARS, ['Snack bars', 'Protein bars', 'Nut bars'], '50 g',
    'Soy protein crisps, Milk protein, Chocolate compound (sugar, vegetable fat, cocoa solids), Almonds (8%), Oligofructose, Liquid glucose, Sorbitol, Glycerol, Cocoa powder, Emulsifier (INS 322 from soya), Added flavours.',
    ['en:soybeans', 'en:milk', 'en:nuts'], n(400, 18, 200, 7, 15, 20, 12, 50, 4), { tracesTags: ['en:peanuts'] }),
  item(171, 'Peanut Butter Protein Bar', 'The Whole Truth', BARS, ['Snack bars', 'Protein bars', 'Date bars'], '52 g',
    'Dates, Peanuts (25%), Whey protein concentrate (milk), Cocoa powder, Rock salt.',
    ['en:peanuts', 'en:milk'], n(450, 22, 100, 4, 24, 23, 9, 37, 3)),
  item(172, 'Oats & Berry Breakfast Bar', 'Eat Anytime', BARS, ['Snack bars', 'Oat bars', 'Granola bar', 'Breakfast bars'], '38 g',
    'Rolled oats (35%), Dates, Honey, Mixed berries (cranberry, blueberry 10%), Almonds, Seeds (flax, pumpkin), Rice crispies, Coconut oil.',
    ['en:gluten', 'en:nuts'], n(410, 20, 40, 3, 11, 8.5, 7, 68, 3)),
  item(173, 'Choco Chip Granola Bar', 'Sunfeast (ITC)', BARS, ['Snack bars', 'Granola bar', 'Cereal bars'], '30 g',
    'Cereals (oats, rice crispies, corn flakes 45%), Liquid glucose, Sugar, Chocolate chips (8%), Edible vegetable oil (palm), Invert sugar syrup, Milk solids, Humectant (INS 422), Emulsifier (INS 322 from soya), Iodised salt, Added flavours.',
    ['en:gluten', 'en:milk', 'en:soybeans'], n(430, 30, 180, 6, 13, 6, 4, 72, 4)),
];
