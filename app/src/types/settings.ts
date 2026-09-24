import { WasteMethod, MarginBasis, RoundingMethod } from './pricing';

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  city?: string;
  rating?: number;
  vatNumber?: string;
}

export interface Currency {
  code: string;
  nameAr: string;
  rateToSar: number; // 1 USD = 3.75 SAR -> rate is 3.75
  symbol: string;
}

export interface AppSettings {
  companyName: string;
  logoUrl?: string;
  vatNumber: string;
  commercialRegister: string;
  phone: string;
  address: string;
  reportPreparerName: string;
  defaultVatRate: number; // 0.15
  targetProfitMargin: number; // 0.22 = 22%
  excellentThreshold: number; // 0.25 = 25%
  goodThreshold: number; // 0.15 = 15%
  wasteMethod: WasteMethod; // 'yield' | 'markup'
  marginBasis: MarginBasis; // 'gross' | 'net'
  costDisplayMethod: 'net' | 'gross';
  roundingMethod: RoundingMethod;
  purchaseVatReviewActive: boolean;
  suppliers: Supplier[];
  currencies: Currency[];
  activeCurrencyCode: string; // 'SAR'
}
