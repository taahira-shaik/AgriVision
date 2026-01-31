import React, { useState } from 'react';
import Layout from './components/Layout';
import CropRecommender from './components/CropRecommender';
import PricePredictor from './components/PricePredictor';
import FarmerAdvisory from './components/FarmerAdvisory';
import GovDashboard from './components/GovDashboard';
import { AppRoute } from './types';
import { Sprout, TrendingUp, Users, ShieldAlert } from 'lucide-react';

function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.CROP_RECOMMEND:
        return <CropRecommender />;
      case AppRoute.PRICE_PREDICT:
        return <PricePredictor />;
      case AppRoute.ADVISORY:
        return <FarmerAdvisory />;
      case AppRoute.GOV_DASHBOARD:
        return <GovDashboard />;
      case AppRoute.HOME:
      default:
        return <HomeDashboard onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <Layout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {renderContent()}
    </Layout>
  );
}

const HomeDashboard = ({ onNavigate }: { onNavigate: (route: AppRoute) => void }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-800 p-8 text-white shadow-xl">
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to AgriVision AI</h1>
        <p className="text-lg text-green-100 mb-6">
          Empowering agriculture with next-generation Artificial Intelligence. 
          Optimize yields, predict prices, and access expert advice instantly.
        </p>
        <button 
          onClick={() => onNavigate(AppRoute.CROP_RECOMMEND)}
          className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition-colors shadow-lg"
        >
          Get Started
        </button>
      </div>
      <Sprout className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-10 rotate-12" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FeatureCard 
        icon={<Sprout className="w-8 h-8 text-green-600" />}
        title="Smart Recommendations"
        description="Analyze soil health and get tailored crop advice."
        onClick={() => onNavigate(AppRoute.CROP_RECOMMEND)}
      />
      <FeatureCard 
        icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
        title="Market Predictions"
        description="Forecast commodity prices with ML models."
        onClick={() => onNavigate(AppRoute.PRICE_PREDICT)}
      />
      <FeatureCard 
        icon={<Users className="w-8 h-8 text-purple-600" />}
        title="Farmer Advisory"
        description="24/7 multilingual chat support for farmers."
        onClick={() => onNavigate(AppRoute.ADVISORY)}
      />
      <FeatureCard 
        icon={<ShieldAlert className="w-8 h-8 text-orange-600" />}
        title="Gov Analytics"
        description="Real-time alerts and macro-economic data."
        onClick={() => onNavigate(AppRoute.GOV_DASHBOARD)}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">System Status</h3>
        <div className="space-y-4">
          <StatusItem label="Gemini AI API" status="Operational" color="bg-green-500" />
          <StatusItem label="Weather Satellites" status="Connected" color="bg-green-500" />
          <StatusItem label="Market Data Feed" status="Synced (1m ago)" color="bg-green-500" />
          <StatusItem label="Soil Sensors" status="98% Active" color="bg-blue-500" />
        </div>
      </div>
      
      <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          Live Insights
        </h3>
        <div className="space-y-4 text-sm text-slate-300">
          <p>• Heavy rainfall expected in Northern region over next 48h.</p>
          <p>• Wheat prices showing bullish trend (+2.4% today).</p>
          <p>• New pest alert: Fall Armyworm detected in Sector 4.</p>
        </div>
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-green-200 transition-all cursor-pointer group"
  >
    <div className="mb-4 bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-500">{description}</p>
  </div>
);

const StatusItem = ({ label, status, color }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-600">{label}</span>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-sm font-medium text-slate-800">{status}</span>
    </div>
  </div>
);

export default App;