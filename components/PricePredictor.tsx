import React, { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { getMockCommodityPrices } from '../services/mockDataService';
import { getMarketOutlook } from '../services/geminiService';
import { TrendingUp, AlertTriangle, Calendar, Info, Globe, Loader2, Sparkles } from 'lucide-react';

const PricePredictor: React.FC = () => {
  const [selectedCommodity, setSelectedCommodity] = useState('Rice');
  const [outlook, setOutlook] = useState<string>('');
  const [isOutlookLoading, setIsOutlookLoading] = useState(false);
  
  const data = useMemo(() => getMockCommodityPrices(selectedCommodity), [selectedCommodity]);
  
  useEffect(() => {
    const fetchOutlook = async () => {
      setIsOutlookLoading(true);
      const res = await getMarketOutlook(selectedCommodity);
      setOutlook(res || '');
      setIsOutlookLoading(false);
    };
    fetchOutlook();
  }, [selectedCommodity]);

  const currentPrice = data.find(d => d.date === 'Current')?.price || 0;
  const nextMonthPrice = data[data.length - 3].price; // 1st prediction
  const isRising = nextMonthPrice > currentPrice;

  // Calculate proper Y-axis scale based on data range
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const yDomain = [Math.floor(minPrice * 0.95), Math.ceil(maxPrice * 1.05)];

  const commoditySpecs: Record<string, { origin: string; cycle: string; risk: string }> = {
    'Rice': { origin: 'India/SEA', cycle: '120-150 Days', risk: 'Monsoon Dependency' },
    'Wheat': { origin: 'Northern Plains', cycle: '100-120 Days', risk: 'Heat Stress' },
    'Corn': { origin: 'Deccan Plateau', cycle: '90-110 Days', risk: 'Pest Attacks' },
    'Barley': { origin: 'Arid Zones', cycle: '80-100 Days', risk: 'Drought' },
  };

  const specs = commoditySpecs[selectedCommodity];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Market Analytics Hub</h2>
            <p className="text-slate-500 text-sm">Real-time commodity forecasting & AI strategic outlook.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <select 
              value={selectedCommodity} 
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 appearance-none shadow-sm transition-all hover:border-blue-300"
            >
              <option value="Rice">Rice (Premium)</option>
              <option value="Wheat">Wheat (Standard)</option>
              <option value="Corn">Corn (Industrial)</option>
              <option value="Barley">Barley (Malt)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Info size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Price Dynamics: {selectedCommodity}</h3>
              <p className="text-xs text-slate-500">Unit: INR (₹) per Metric Ton</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-orange-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Forecast</span>
              </div>
            </div>
          </div>

          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  domain={yDomain} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                  tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 min-w-[140px]">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.date}</p>
                          <p className="text-lg font-black text-slate-900">₹{item.price.toLocaleString()}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.predicted ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.predicted ? 'AI PREDICTION' : 'MARKET DATA'}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="price" stroke="none" fillOpacity={1} fill="url(#colorPrice)" />
                <ReferenceLine x="Current" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#94a3b8', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.predicted) return <circle cx={cx} cy={cy} r={5} fill="#f97316" stroke="#fff" strokeWidth={2} />;
                    if (payload.date === 'Current') return <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="#fff" strokeWidth={3} />;
                    return <circle cx={cx} cy={cy} r={3} fill="#3b82f6" stroke="none" />;
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info & Insights Panel */}
        <div className="space-y-6">
          {/* Market Insight AI Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden min-h-[160px]">
            <Sparkles className="absolute -top-2 -right-2 w-20 h-20 opacity-10" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 opacity-80">
              <Sparkles size={14} /> AI Market Outlook
            </h4>
            {isOutlookLoading ? (
              <div className="flex items-center gap-3 animate-pulse py-4">
                <Loader2 className="animate-spin" size={18} />
                <p className="text-sm font-medium">Analyzing global feeds...</p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed font-medium">
                {outlook}
              </p>
            )}
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className={`p-5 rounded-2xl border transition-all ${isRising ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`p-1.5 rounded-lg ${isRising ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  <TrendingUp size={16} />
                </span>
                <span className={`text-[10px] font-bold uppercase ${isRising ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isRising ? '+ Bullish' : '- Bearish'}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-800">₹{currentPrice.toLocaleString()}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Projected {isRising ? 'increase' : 'decrease'} of {Math.abs(((nextMonthPrice - currentPrice) / currentPrice) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                <Globe size={14} /> Regional Metrics
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Major Origin</span>
                  <span className="text-xs font-bold text-slate-800">{specs.origin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Growth Cycle</span>
                  <span className="text-xs font-bold text-slate-800">{specs.cycle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Primary Risk</span>
                  <span className="text-xs font-bold text-rose-600">{specs.risk}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-tighter">
                <Calendar size={14} /> Sell Strategy
              </div>
              <p className="text-sm font-black text-slate-800">
                {isRising ? 'Hold Inventory' : 'Immediate Liquidation'}
              </p>
              <p className="text-[10px] text-amber-700 mt-1 font-medium italic">
                {isRising 
                  ? 'Wait for the projected post-monsoon peak.' 
                  : 'Oversupply risk detected. Sell now.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePredictor;