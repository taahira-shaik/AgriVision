// Domain Models

export interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropRecommendation {
  crop: string;
  confidence: number;
  reasoning: string;
  requiredFertilizer: string;
  estimatedYield: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface CommodityPrice {
  date: string;
  price: number;
  predicted: boolean;
}

export interface GovAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  message: string;
  date: string;
}

export enum AppRoute {
  HOME = 'HOME',
  CROP_RECOMMEND = 'CROP_RECOMMEND',
  PRICE_PREDICT = 'PRICE_PREDICT',
  ADVISORY = 'ADVISORY',
  GOV_DASHBOARD = 'GOV_DASHBOARD',
}