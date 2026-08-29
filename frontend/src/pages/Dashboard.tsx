import { useEffect, useState } from 'react';
import { fetchDashboard, runSimulationStep } from '../services/api';
import { Activity, AlertTriangle, Box, Bed, Users, Repeat, Zap } from 'lucide-react';

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      const dashboard = await fetchDashboard();
      setData(dashboard);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    await runSimulationStep();
    await loadData();
    setSimulating(false);
  };

  if (!data) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div></div>;

  const kpis = [
    { label: 'Total PHCs', value: data.total_phcs, icon: <Activity />, color: 'bg-blue-50 text-blue-600' },
    { label: 'PHCs at Risk', value: data.phcs_at_risk, icon: <AlertTriangle />, color: 'bg-red-50 text-red-600' },
    { label: 'Low Meds', value: data.medicines_below_threshold, icon: <Box />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Available Beds', value: data.available_beds, icon: <Bed />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Staff Attendance', value: `${data.staff_attendance_pct}%`, icon: <Users />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Pending Transfers', value: data.pending_transfers, icon: <Repeat />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 mt-1">Real-time state health intelligence</p>
        </div>
        <button 
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center gap-2 bg-gradient-to-r from-healthcare-600 to-healthcare-500 hover:from-healthcare-700 hover:to-healthcare-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-healthcare-500/30 transition-all disabled:opacity-70"
        >
          <Zap size={18} className={simulating ? 'animate-pulse' : ''} />
          {simulating ? 'Simulating...' : 'Simulate Time Step'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-center items-center h-80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-healthcare-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
          <Activity size={48} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Network Health Story</h3>
          <p className="text-center text-slate-500 mt-2 max-w-md">
            <strong className="text-red-500">PROBLEM:</strong> {data.phcs_at_risk} PHCs are currently at risk.<br/><br/>
            <strong className="text-orange-500">REASON:</strong> {data.medicines_below_threshold} essential medicines have dropped below safety thresholds.<br/><br/>
            <strong className="text-emerald-500">ACTION:</strong> {data.pending_transfers} redistribution opportunities have been automatically identified.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">Healthy</span>
                <span className="text-emerald-600 font-bold">{data.total_phcs - data.phcs_at_risk}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${((data.total_phcs - data.phcs_at_risk)/data.total_phcs)*100}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">Warning / High</span>
                <span className="text-orange-600 font-bold">{Math.floor(data.phcs_at_risk * 0.7)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(Math.floor(data.phcs_at_risk * 0.7)/data.total_phcs)*100}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-600">Critical</span>
                <span className="text-red-600 font-bold">{Math.ceil(data.phcs_at_risk * 0.3)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: `${(Math.ceil(data.phcs_at_risk * 0.3)/data.total_phcs)*100}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
