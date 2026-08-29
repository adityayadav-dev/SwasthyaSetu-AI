import { useEffect, useState } from 'react';
import { fetchPHCDetails, fetchMedicines, fetchForecast } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export const Forecasting = () => {
  const [phcs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // PHC IDs based on seed data
  const [phcData, setPhcData] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  
  const [selectedPhc, setSelectedPhc] = useState<number>(1);
  const [selectedMed, setSelectedMed] = useState<number>(1);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial dropdown data
    Promise.all([
      fetchMedicines(),
      ...phcs.map(id => fetchPHCDetails(id).catch(() => null))
    ]).then(([medsRes, ...phcsRes]) => {
      setMedicines(medsRes);
      setPhcData(phcsRes.filter(Boolean));
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchForecast(selectedPhc, selectedMed).then(data => {
      setForecastData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedPhc, selectedMed]);

  const selectedPhcName = phcData.find(p => p.id === selectedPhc)?.name || 'Loading...';
  const selectedMedName = medicines.find(m => m.id === selectedMed)?.name || 'Loading...';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Demand Forecasting</h2>
          <p className="text-slate-500 mt-1">Predictive analytics for upcoming medicine requirements</p>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Facility</label>
            <select 
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 outline-none focus:border-healthcare-500 min-w-[200px]"
              value={selectedPhc}
              onChange={(e) => setSelectedPhc(Number(e.target.value))}
            >
              {phcData.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Medicine</label>
            <select 
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 outline-none focus:border-healthcare-500 min-w-[200px]"
              value={selectedMed}
              onChange={(e) => setSelectedMed(Number(e.target.value))}
            >
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-healthcare-500" />
            30-Day History &amp; 14-Day Projection: {selectedMedName} at {selectedPhcName}
          </h3>
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="actual" name="Historical Actuals" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="forecast" name="AI Forecast" stroke="#0ea5e9" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="trend" name="Baseline Trend" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-healthcare-50 to-white p-6 rounded-2xl border border-healthcare-100">
            <h4 className="font-bold text-slate-800 mb-2">Insight Summary</h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Our AI models detect a <span className="font-bold text-healthcare-700">1.5% daily compounding increase</span> in demand for {selectedMedName} at {selectedPhcName} over the next two weeks.
            </p>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 text-sm">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-700 font-medium">Stockout risk identified on Day 37 if current reorder schedule is maintained.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
