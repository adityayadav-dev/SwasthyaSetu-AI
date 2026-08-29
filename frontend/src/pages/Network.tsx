import { useEffect, useState } from 'react';
import { fetchPHCs } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Activity } from 'lucide-react';

// Fix Leaflet icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const Network = () => {
  const [phcs, setPhcs] = useState<any[]>([]);

  useEffect(() => {
    fetchPHCs().then(setPhcs);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'Critical') return 'bg-red-500';
    if (status === 'Warning') return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const getStatusDot = (status: string) => {
    // Basic custom div icon for colored markers
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${getStatusColor(status)}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  if (!phcs.length) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">PHC Network</h2>
        <p className="text-slate-500 mt-1">Geographic distribution of Primary Health Centres</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden relative">
        <MapContainer center={[19.0, 75.0]} zoom={6} className="h-full w-full">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          {phcs.map(phc => (
            <Marker key={phc.id} position={[phc.lat, phc.lng]} icon={getStatusDot(phc.status)}>
              <Popup className="rounded-xl">
                <div className="p-1">
                  <h3 className="font-bold text-slate-800">{phc.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">Population: {phc.population_served.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${getStatusColor(phc.status)}`}>
                      {phc.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-400 font-medium">Beds</div>
                      <div className="font-bold text-slate-700">{phc.total_beds - phc.occupied_beds} available</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <div className="text-slate-400 font-medium">Staff</div>
                      <div className="font-bold text-slate-700">{phc.doctors_present}/{phc.doctors_total} Doctors</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <div className="absolute bottom-6 left-6 z-[400] bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <h4 className="font-bold text-sm text-slate-700 mb-3">Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Healthy</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Warning (Low Stock)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Critical (Shortage &lt; 3 days)</div>

          </div>
        </div>
      </div>
    </div>
  );
};
