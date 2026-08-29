import { useEffect, useState } from 'react';
import { fetchInventory } from '../services/api';
import { Box, AlertCircle } from 'lucide-react';

export const Inventory = () => {
  const [inventoryData, setInventoryData] = useState<any[]>([]);

  useEffect(() => {
    fetchInventory().then(setInventoryData);
  }, []);

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  if (!inventoryData.length) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Medicine Inventory</h2>
        <p className="text-slate-500 mt-1">Real-time stock levels and risk predictions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Facility</th>
                <th className="px-6 py-4">Medicine</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Current Stock</th>
                <th className="px-6 py-4 text-right">Daily Avg</th>
                <th className="px-6 py-4 text-right">Days Remaining</th>
                <th className="px-6 py-4 text-center">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryData.map(phc => phc.inventory?.map((inv: any, i: number) => (
                <tr key={`${phc.phc_id}-${i}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{phc.phc_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Box size={16} className="text-slate-400" />
                      {inv.medicine_name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">{inv.category}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {inv.current_stock.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {inv.daily_consumption_avg.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${inv.days_remaining < 7 ? 'text-red-600' : 'text-slate-700'}`}>
                      {inv.days_remaining.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold border ${getRiskStyle(inv.risk_level)}`}>
                      {inv.risk_level === 'CRITICAL' && <AlertCircle size={12} className="mr-1" />}
                      {inv.risk_level}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
