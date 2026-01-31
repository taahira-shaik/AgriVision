import { CommodityPrice, GovAlert } from "../types";

export const getMockCommodityPrices = (commodity: string): CommodityPrice[] => {
  // Realistic base prices per Metric Ton in INR (₹)
  // Rice: ~30-40k, Wheat: ~22-28k, Corn: ~20-25k
  const pricingConfig: Record<string, { base: number; volatility: number; trend: number }> = {
    'Rice': { base: 34000, volatility: 1500, trend: 800 },
    'Wheat': { base: 24500, volatility: 900, trend: -400 },
    'Corn': { base: 22000, volatility: 800, trend: 300 },
    'Barley': { base: 21000, volatility: 700, trend: 250 },
  };

  const { base, volatility, trend } = pricingConfig[commodity] || pricingConfig['Rice'];
  const data: CommodityPrice[] = [];
  const today = new Date();

  // Past 6 months (Historical)
  for (let i = 6; i > 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    // Add some random walk for history
    const seasonalShift = Math.sin(i * 0.5) * 800; // Seasonal variance
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      price: Math.round(base + seasonalShift + (Math.random() * volatility - volatility / 2)),
      predicted: false
    });
  }

  // Current
  data.push({
    date: 'Current',
    price: base,
    predicted: false
  });

  // Future 3 months (AI Forecast)
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today);
    d.setMonth(d.getMonth() + i);
    // Predicted trend + small uncertainty margin
    const uncertainty = i * 300;
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      price: Math.round(base + (i * trend) + (Math.random() * uncertainty - uncertainty / 2)),
      predicted: true
    });
  }

  return data;
};

export const getGovAlerts = (): GovAlert[] => [
  { id: '1', severity: 'critical', region: 'Northern Valley', message: 'Locust swarm detected moving southeast.', date: '2023-10-24' },
  { id: '2', severity: 'high', region: 'Eastern Plains', message: 'Drought warning: Water levels at 40%.', date: '2023-10-23' },
  { id: '3', severity: 'medium', region: 'West Coast', message: 'Fertilizer subsidy utilization below target.', date: '2023-10-20' },
];

export const getCropDistribution = () => [
  { name: 'Rice', value: 400 },
  { name: 'Wheat', value: 300 },
  { name: 'Corn', value: 300 },
  { name: 'Barley', value: 200 },
];

export const getYieldData = () => [
  { region: 'North', yield: 4000 },
  { region: 'South', yield: 3000 },
  { region: 'East', yield: 2000 },
  { region: 'West', yield: 2780 },
];