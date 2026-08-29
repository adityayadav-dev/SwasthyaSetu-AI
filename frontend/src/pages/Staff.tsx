import { useEffect, useState } from 'react';
import { fetchPHCDetails } from '../services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const Staff = () => {
  const [phcs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // Mock list
  const [phcData, setPhcData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all(phcs.map(id => fetchPHCDetails(id).catch(() => null)))
      .then(res => setPhcData(res.filter(Boolean)));
  }, []);

  if (!phcData.length) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Staff Attendance</h2>
        <p className="text-slate-500 mt-1">Monitor medical staff availability and identify shortages</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Facility</th>
              <th className="px-6 py-4 text-center">Doctors</th>
              <th className="px-6 py-4 text-center">Nurses</th>
              <th className="px-6 py-4 text-center">Pharmacists</th>
              <th className="px-6 py-4 text-center">Attendance %</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {phcData.map(phc => {
              const total = phc.doctors_total + phc.nurses_total + phc.pharmacists_total;
              const present = phc.doctors_present + phc.nurses_present + phc.pharmacists_present;
              const pct = total > 0 ? Math.round((present / total) * 100) : 0;
              const isShortage = pct < 75;
              
              return (
                <tr key={phc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{phc.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={phc.doctors_present < phc.doctors_total ? "text-orange-600 font-bold" : ""}>
                      {phc.doctors_present}
                    </span> / {phc.doctors_total}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={phc.nurses_present < phc.nurses_total ? "text-orange-600 font-bold" : ""}>
                      {phc.nurses_present}
                    </span> / {phc.nurses_total}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={phc.pharmacists_present < phc.pharmacists_total ? "text-orange-600 font-bold" : ""}>
                      {phc.pharmacists_present}
                    </span> / {phc.pharmacists_total}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    <span className={isShortage ? 'text-red-600' : 'text-emerald-600'}>{pct}%</span>
                  </td>
                  <td className="px-6 py-4">
                    {isShortage ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                        <AlertCircle size={12} /> Critical Shortage
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <CheckCircle2 size={12} /> Adequate Staff
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
