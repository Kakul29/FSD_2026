// Shared region definitions used by both the React frontend and the Express backend.
// `offCountry` is the Open Food Facts country tag used to filter live search results.

export interface IRegion {
  code: string;
  name: string;
  flag: string;
  offCountry: string | null;
  authority: string;
  cravings: string[];
}

export const DEFAULT_REGION = 'IN';

export const REGIONS: IRegion[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    offCountry: 'en:india',
    authority: 'FSSAI',
    cravings: ['Maggi', 'biscuits', 'cereal', 'chips', 'namkeen', 'chocolate', 'curd', 'juice', 'bread', 'dal', 'protein bar', 'millet noodles'],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    offCountry: 'en:united-states',
    authority: 'FDA',
    cravings: ['cereal', 'chips', 'peanut butter', 'soda', 'granola bar', 'mac and cheese', 'cookies'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    offCountry: 'en:united-kingdom',
    authority: 'FSA',
    cravings: ['crisps', 'beans', 'biscuits', 'chocolate', 'cereal', 'squash', 'oats'],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    offCountry: 'en:canada',
    authority: 'Health Canada',
    cravings: ['cereal', 'chips', 'cookies', 'mac and cheese', 'granola bar', 'yogurt'],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    offCountry: 'en:australia',
    authority: 'FSANZ',
    cravings: ['Vegemite', 'Weet-Bix', 'chips', 'biscuits', 'chocolate', 'yoghurt'],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    offCountry: 'en:united-arab-emirates',
    authority: 'UAE MOCCAE / ESMA',
    cravings: ['labneh', 'hummus', 'dates', 'chips', 'juice', 'noodles'],
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    offCountry: 'en:singapore',
    authority: 'SFA',
    cravings: ['instant noodles', 'Milo', 'biscuits', 'soy milk', 'chips', 'bread'],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    offCountry: 'en:germany',
    authority: 'EFSA / BVL',
    cravings: ['muesli', 'chocolate', 'chips', 'quark', 'bread', 'gummies'],
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    offCountry: 'en:france',
    authority: 'EFSA / ANSES',
    cravings: ['biscuits', 'yaourt', 'chocolat', 'chips', 'céréales', 'compote'],
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    offCountry: 'en:japan',
    authority: 'CAA / MHLW',
    cravings: ['cup noodle', 'Pocky', 'chips', 'green tea', 'senbei', 'curry'],
  },
  {
    code: 'ALL',
    name: 'All Regions (Global)',
    flag: '🌍',
    offCountry: null,
    authority: 'Codex Alimentarius',
    cravings: ['chocolate', 'chips', 'cereal', 'noodles', 'biscuits', 'yogurt', 'soda'],
  },
];

export function getRegion(code?: string | null): IRegion {
  return REGIONS.find((r) => r.code === code) || REGIONS.find((r) => r.code === DEFAULT_REGION)!;
}
