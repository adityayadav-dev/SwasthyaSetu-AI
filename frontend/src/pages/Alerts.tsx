import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { fetchAlerts } from '../services/api';

export const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts()
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Emergency Alerts</h2>
        <p className="text-slate-500 mt-1">Intelligent threat detection and system-wide notifications</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex justify-center items-center">
            <div className="absolute animate-ping w-12 h-12 rounded-full bg-healthcare-200 opacity-75"></div>
            <div className="relative w-8 h-8 rounded-full bg-healthcare-500 flex items-center justify-center text-white">
              <AlertCircle size={16} />
            </div>
          </div>
          <p className="text-slate-500 mt-6 font-medium animate-pulse">AI is analyzing network state...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 border shadow-sm flex items-start gap-4 ${
              alert.type === 'CRITICAL' ? 'border-red-200' : (alert.type === 'HIGH' ? 'border-orange-200' : 'border-slate-200')
            }`}>
              <div className={`p-3 rounded-full shrink-0 ${
                alert.type === 'CRITICAL' ? 'bg-red-100 text-red-600' : (alert.type === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600')
              }`}>
                {alert.type === 'CRITICAL' ? <AlertTriangle size={24} /> : <AlertCircle size={24} />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    alert.type === 'CRITICAL' ? 'bg-red-50 text-red-700' : (alert.type === 'HIGH' ? 'bg-orange-50 text-orange-700' : 'bg-yellow-50 text-yellow-700')
                  }`}>
                    {alert.type}
                  </span>
                  <span className="text-xs text-slate-400">{alert.time}</span>
                </div>
                <p className="font-medium text-slate-800">{alert.msg}</p>
                
                <div className="flex gap-3 mt-4">
                  <button className="text-sm font-medium text-healthcare-600 hover:text-healthcare-700 bg-healthcare-50 hover:bg-healthcare-100 px-3 py-1.5 rounded-lg transition-colors">
                    Take Action
                  </button>
                  <button className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
             <div className="p-10 text-center bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-medium">
               No critical alerts detected in the network.
             </div>
          )}
        </div>
      )}
    </div>
  );
};
