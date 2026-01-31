import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyzeGovData } from '../services/geminiService';
import { getGovAlerts, getCropDistribution, getYieldData } from '../services/mockDataService';
import { AlertTriangle, FileText, CheckCircle, BarChart3, Loader2 } from 'lucide-react';

const COLORS = ['#059669', '#0891b2', '#f59e0b', '#8b5cf6'];

const GovDashboard: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const alerts = getGovAlerts();
  const distributionData = getCropDistribution();
  const yieldData = getYieldData();

  useEffect(() => {
    const fetchAnalysis = async () => {
      // Simulate reading data then sending to Gemini
      const analysis = await analyzeGovData(alerts, { distribution: distributionData, yields: yieldData });
      setSummary(analysis);
      setLoading(false);
    };
    fetchAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">National Agriculture Dashboard</h2>
          <p className="text-slate-600">Real-time monitoring and AI-driven policy intervention systems.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
        <h3 className="text-indigo-900 font-bold text-lg mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Executive AI Summary
        </h3>
        {loading ? (
           <div className="flex items-center gap-2 text-indigo-700">
             <Loader2 className="w-4 h-4 animate-spin" /> Generating policy brief...
           </div>
        ) : (
          <div className="prose prose-indigo text-indigo-800 leading-relaxed max-w-none">
             {summary.split('\n').map((line, i) => (
                <p key={i} className="mb-1">{line}</p>
             ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Active Alerts
            </h3>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                  alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                  'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                       alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>{alert.severity}</span>
                    <span className="text-xs text-slate-500">{alert.date}</span>
                  </div>
                  <p className="font-medium text-slate-800 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">Region: {alert.region}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" /> Intervention Status
            </h3>
            <div className="space-y-4">
                <div className="space-y-1">
                   <div className="flex justify-between text-sm">
                      <span>Fertilizer Distribution</span>
                      <span className="font-bold">78%</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[78%]"></div>
                   </div>
                </div>
                <div className="space-y-1">
                   <div className="flex justify-between text-sm">
                      <span>Loan Disbursement</span>
                      <span className="font-bold">45%</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[45%]"></div>
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <BarChart3 className="w-4 h-4" /> Regional Yield (Tons)
                </h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yieldData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="region" axisLine={false} tickLine={false} />
                         <YAxis axisLine={false} tickLine={false} />
                         <Tooltip cursor={{fill: '#f1f5f9'}} />
                         <Bar dataKey="yield" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <BarChart3 className="w-4 h-4" /> Crop Distribution
                </h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={distributionData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           fill="#8884d8"
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {distributionData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip />
                         <Legend />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-800 mb-2">Detailed Report</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                          <tr>
                              <th className="px-6 py-3">District</th>
                              <th className="px-6 py-3">Soil Health Index</th>
                              <th className="px-6 py-3">Primary Crop</th>
                              <th className="px-6 py-3">Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr className="bg-white border-b hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">North District</td>
                              <td className="px-6 py-4 text-green-600 font-bold">8.5</td>
                              <td className="px-6 py-4">Wheat</td>
                              <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Optimal</span></td>
                          </tr>
                          <tr className="bg-white border-b hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">East Basin</td>
                              <td className="px-6 py-4 text-yellow-600 font-bold">6.2</td>
                              <td className="px-6 py-4">Rice</td>
                              <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Attention Needed</span></td>
                          </tr>
                          <tr className="bg-white border-b hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">South Highlands</td>
                              <td className="px-6 py-4 text-green-600 font-bold">9.1</td>
                              <td className="px-6 py-4">Coffee</td>
                              <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Optimal</span></td>
                          </tr>
                      </tbody>
                  </table>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GovDashboard;