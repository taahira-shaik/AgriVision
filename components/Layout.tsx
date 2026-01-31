import React from 'react';
import { AppRoute } from '../types';
import { LayoutDashboard, Sprout, TrendingUp, MessageSquareText, Menu, X } from 'lucide-react';

interface LayoutProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentRoute, onNavigate, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { route: AppRoute.HOME, label: 'Overview', icon: LayoutDashboard },
    { route: AppRoute.CROP_RECOMMEND, label: 'Crop Recommendation', icon: Sprout },
    { route: AppRoute.PRICE_PREDICT, label: 'Price Prediction', icon: TrendingUp },
    { route: AppRoute.ADVISORY, label: 'Farmer Advisory', icon: MessageSquareText },
    { route: AppRoute.GOV_DASHBOARD, label: 'Gov Analytics', icon: LayoutDashboard },
  ];

  const handleNav = (route: AppRoute) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-green-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sprout className="w-6 h-6" /> AgriVision AI
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-green-400">
            <Sprout className="w-8 h-8" /> AgriVision
          </h1>
          <p className="text-xs text-slate-400 mt-1">AI-Powered Agriculture</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentRoute === item.route 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500"></div>
            <div>
              <p className="text-sm font-medium">Demo User</p>
              <p className="text-xs text-slate-400">Full Stack Engineer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;