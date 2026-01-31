import React, { useState } from 'react';
import { getCropRecommendation, getSoilAnalysis } from '../services/geminiService';
import { SoilData, CropRecommendation } from '../types';
import { Leaf, Droplets, Thermometer, FlaskConical, CloudRain, Loader2, MapPin, Search, Navigation, AlertCircle } from 'lucide-react';

const CropRecommender: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'precision' | 'regional'>('precision');
  
  // Precision Mode State
  const [loading, setLoading] = useState(false);
  const [precisionError, setPrecisionError] = useState<string | null>(null);
  const [result, setResult] = useState<CropRecommendation | null>(null);
  const [formData, setFormData] = useState<SoilData>({
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 20,
    humidity: 82,
    ph: 6.5,
    rainfall: 202
  });

  // Regional Mode State
  const [locationQuery, setLocationQuery] = useState('');
  const [regionalLoading, setRegionalLoading] = useState(false);
  const [regionalResult, setRegionalResult] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handlePrecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setPrecisionError(null);
    try {
      const recommendation = await getCropRecommendation(formData);
      setResult(recommendation);
    } catch (err: any) {
      setPrecisionError(err.message || "Failed to get recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    
    setRegionalLoading(true);
    setRegionalResult(null);
    try {
      const analysis = await getSoilAnalysis(locationQuery);
      setRegionalResult(analysis || "No analysis available.");
    } catch (err: any) {
      setRegionalResult("**ERROR:** " + (err.message || "Failed to analyze location."));
    } finally {
      setRegionalLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationQuery(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.error(error);
          alert("Unable to retrieve location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const formatRegionalText = (text: string) => {
    if (text.includes("SERVICE ERROR") || text.includes("QUOTA_EXCEEDED")) {
        return (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-xl flex items-start gap-4">
                <AlertCircle className="text-rose-500 shrink-0 mt-1" />
                <div>
                    <h3 className="text-rose-900 font-bold mb-1">Service Throttled</h3>
                    <p className="text-rose-700 text-sm">{text.replace("**SERVICE ERROR:**", "").trim()}</p>
                </div>
            </div>
        )
    }

    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**') && trimmed.includes(':')) {
        const [title, content] = trimmed.split(':');
        const cleanTitle = title.replace(/\*\*/g, '');
        const isHighPriority = content?.toLowerCase().includes('high');
        
        return (
          <div key={i} className="mb-2 pl-4 border-l-2 border-slate-100">
            <span className="font-bold text-slate-800 text-sm">{cleanTitle}: </span>
            <span className={`${isHighPriority ? 'text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded' : 'text-slate-700'}`}>
              {content?.replace(/\*\*/g, '')}
            </span>
          </div>
        );
      }

      if (trimmed.startsWith('**')) {
        return <h4 key={i} className="font-bold text-blue-800 mt-8 mb-4 uppercase text-sm tracking-wider border-b-2 border-blue-100 pb-2 w-full">{trimmed.replace(/\*\*/g, '')}</h4>;
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return (
             <div key={i} className="flex gap-2 mb-1 ml-4">
               <span className="text-blue-500 font-bold">•</span>
               <span className="text-slate-700 text-sm leading-relaxed">{trimmed.replace(/^[-*]\s*/, '').replace(/\*\*/g, '')}</span>
             </div>
          )
      }

      if (trimmed === '') return <div key={i} className="h-1"></div>;
      
      return <p key={i} className="text-slate-600 leading-relaxed mb-2 text-sm">{trimmed.replace(/\*\*/g, '')}</p>;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Agricultural Decision Support System</h2>
        <p className="text-slate-600">Integrated workflow for soil analysis, crop recommendation, government schemes, and price prediction.</p>
        
        <div className="flex gap-4 mt-6 border-b border-slate-100">
          <button
            onClick={() => { setActiveTab('precision'); setPrecisionError(null); }}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'precision' 
                ? 'border-green-600 text-green-700' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Precision Lab (Sensors)
          </button>
          <button
            onClick={() => setActiveTab('regional')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'regional' 
                ? 'border-green-600 text-green-700' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Regional Decision System
          </button>
        </div>
      </div>

      {activeTab === 'precision' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          {/* Input Form */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-fit">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="text-green-600" /> Soil & Environment Data
            </h3>
            <form onSubmit={handlePrecisionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nitrogen (N)" name="nitrogen" value={formData.nitrogen} onChange={handleInputChange} icon={<Leaf size={16} />} />
                <InputField label="Phosphorus (P)" name="phosphorus" value={formData.phosphorus} onChange={handleInputChange} icon={<Leaf size={16} />} />
                <InputField label="Potassium (K)" name="potassium" value={formData.potassium} onChange={handleInputChange} icon={<Leaf size={16} />} />
                <InputField label="pH Level" name="ph" value={formData.ph} step={0.1} onChange={handleInputChange} icon={<FlaskConical size={16} />} />
              </div>
              
              <div className="border-t border-slate-100 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Temp (°C)" name="temperature" value={formData.temperature} onChange={handleInputChange} icon={<Thermometer size={16} />} />
                  <InputField label="Humidity (%)" name="humidity" value={formData.humidity} onChange={handleInputChange} icon={<Droplets size={16} />} />
                  <InputField label="Rain (mm)" name="rainfall" value={formData.rainfall} onChange={handleInputChange} icon={<CloudRain size={16} />} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Analyze & Recommend'}
              </button>
            </form>
          </div>

          {/* Precision Results */}
          <div className="space-y-6">
            {loading && (
              <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400 min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                <p>Analyzing soil composition...</p>
                <p className="text-sm">Running ML inference via Gemini...</p>
              </div>
            )}

            {precisionError && (
               <div className="h-full bg-rose-50 rounded-xl border border-rose-200 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                  <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                  <h3 className="font-bold text-rose-900 mb-2">Analysis Failed</h3>
                  <p className="text-rose-700 text-sm mb-4">{precisionError}</p>
                  <button onClick={handlePrecisionSubmit} className="text-rose-800 font-bold underline hover:text-rose-900">Try Again</button>
               </div>
            )}

            {!loading && !result && !precisionError && (
              <div className="h-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-12 text-slate-500 min-h-[400px]">
                <SproutIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>Enter soil parameters to see recommendations</p>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-xl shadow-xl border border-green-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-green-100 text-sm uppercase tracking-wide font-semibold">Recommended Crop</p>
                      <h3 className="text-4xl font-bold mt-1">{result.crop}</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-sm font-medium">Confidence</p>
                      <p className="text-xl font-bold">{(result.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Reasoning</h4>
                    <p className="text-slate-700 leading-relaxed">{result.reasoning}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h5 className="flex items-center gap-2 font-semibold text-blue-800 mb-1">
                        <FlaskConical className="w-4 h-4" /> Fertilizer Plan
                      </h5>
                      <p className="text-sm text-blue-700">{result.requiredFertilizer}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <h5 className="flex items-center gap-2 font-semibold text-amber-800 mb-1">
                        <TrendingUpIcon className="w-4 h-4" /> Expected Yield
                      </h5>
                      <p className="text-sm text-amber-700">{result.estimatedYield}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <MapPin className="text-blue-600" /> Decision Support System Input
            </h3>
            
            <form onSubmit={handleRegionalSubmit} className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Enter Village, District, State or GPS coordinates..." 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
              <button 
                type="button"
                onClick={handleGetLocation}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Navigation size={18} /> Locate Me
              </button>
              <button 
                type="submit" 
                disabled={regionalLoading || !locationQuery}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              >
                {regionalLoading ? <Loader2 className="animate-spin" /> : 'Generate DSS Report'}
              </button>
            </form>

            {regionalResult && (
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 animate-in slide-in-from-bottom-2 shadow-inner">
                <div className="prose prose-slate max-w-none">
                  {formatRegionalText(regionalResult)}
                </div>
              </div>
            )}
            
            {!regionalResult && !regionalLoading && (
              <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Enter a location to initiate the decision support workflow.</p>
                <div className="flex justify-center gap-4 mt-3 text-xs text-slate-400">
                   <span>1. Location</span>
                   <span>→</span>
                   <span>2. Soil</span>
                   <span>→</span>
                   <span>3. Crops</span>
                   <span>→</span>
                   <span>4. Gov Schemes</span>
                   <span>→</span>
                   <span>5. Prices</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon, step = 1 }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
      {icon} {label}
    </label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      step={step}
      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
    />
  </div>
);

// Helper Icons
const SproutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.2.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1.7-1.3 2.9-3.3 3-5.2-3.9-1.3-6.3-1-6.2 2.6z"/></svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

export default CropRecommender;