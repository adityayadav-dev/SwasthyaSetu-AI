import { useEffect, useState } from 'react';
import { fetchPHCDetails } from '../services/api';
import { BedDouble, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const Beds = () => {
  const [phcs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // Mock list
  const [phcData, setPhcData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all(phcs.map(id => fetchPHCDetails(id).catch(() => null)))
      .then(res => setPhcData(res.filter(Boolean)));
  }, []);

  if (!phcData.length) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Beds &amp; Capacity</h2>
          <p className="text-slate-500 mt-1">Real-time bed availability across the network</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {phcData.map(phc => {
          const occupancy = Math.round((phc.occupied_beds / phc.total_beds) * 100) || 0;
          const isCritical = occupancy > 90;
          const isWarning = occupancy > 75 && occupancy <= 90;
          const isSurplus = occupancy < 50;

          return (
            <div key={phc.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${isCritical ? 'border-red-200 shadow-red-50' : 'border-slate-100'} flex flex-col hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-800">{phc.name}</h3>
                <BedDouble size={20} className={isCritical ? 'text-red-500' : 'text-slate-400'} />
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <div className="text-4xl font-bold text-slate-700">{phc.total_beds - phc.occupied_beds}</div>
                <div className="text-slate-500 font-medium">available of {phc.total_beds}</div>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : (isWarning ? 'bg-orange-500' : 'bg-emerald-500')}`} style={{width: `${occupancy}%`}}></div>
              </div>
              
              <div className="flex justify-between items-center text-sm font-bold mt-auto pt-4 border-t border-slate-50">
                <span className="text-slate-500">{occupancy}% Occupied</span>
                {isCritical ? (
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md"><AlertTriangle size={14} /> Need More Beds</span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md"><AlertCircle size={14} /> Nearing Capacity</span>
                ) : isSurplus ? (
                  <span className="flex items-center gap-1 text-healthcare-600 bg-healthcare-50 px-2 py-1 rounded-md"><CheckCircle2 size={14} /> Surplus Available</span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle2 size={14} /> Normal</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
