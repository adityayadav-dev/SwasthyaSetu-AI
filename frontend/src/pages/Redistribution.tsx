import { useEffect, useState } from 'react';
import { fetchRecommendations } from '../services/api';
import { ArrowRight, Truck, Clock, ShieldCheck, MapPin, Check, X } from 'lucide-react';

export const Redistribution = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [approvedIds, setApprovedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchRecommendations().then(setRecommendations);
  }, []);

  const handleApprove = (index: number) => {
    setApprovedIds([...approvedIds, index]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Redistribution Engine</h2>
        <p className="text-slate-500 mt-1">AI-optimized inventory transfers between facilities</p>
      </div>

      <div className="grid gap-4">
        {!recommendations.length ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center shadow-sm">
            <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-700">No Critical Shortages Detected</h3>
            <p className="text-slate-500 mt-1">The network is currently balanced. No redistribution required.</p>
          </div>
        ) : (
          recommendations.map((rec, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
              
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-3">
                  <Truck size={14} /> RECOMMENDED TRANSFER
                </div>
                
                <h3 className="text-lg font-bold text-slate-800">{rec.quantity} units of {rec.medicine_name}</h3>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">From Donor</p>
                    <p className="font-bold text-slate-700 text-sm">{rec.donor_name}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> Surplus available</p>
                  </div>
                  
                  <div className="text-slate-300">
                    <ArrowRight size={24} />
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex-1">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">To Recipient</p>
                    <p className="font-bold text-slate-700 text-sm">{rec.recipient_name}</p>
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><Clock size={12}/> Critical shortage</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                <div className="mb-4 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Distance:</span> <span className="font-bold">{rec.distance_km} km</span></div>
                  <div className="flex justify-between"><span>Est. Time:</span> <span className="font-bold">{Math.round(rec.distance_km * 1.5)} mins</span></div>
                  <div className="flex justify-between"><span>Risk reduced:</span> <span className="font-bold text-emerald-600">CRITICAL → LOW</span></div>
                </div>
                <div className="mt-2 flex gap-3">
                  {approvedIds.includes(i) ? (
                    <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-bold py-2.5 rounded-xl border border-emerald-100 cursor-default">
                      <Check size={18} /> Transfer Initiated
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleApprove(i)}
                        className="flex-1 bg-healthcare-600 hover:bg-healthcare-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm shadow-healthcare-200"
                      >
                        Approve Transfer
                      </button>
                      <button 
                        onClick={() => handleApprove(i)} 
                        className="px-4 text-slate-500 font-medium hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};
