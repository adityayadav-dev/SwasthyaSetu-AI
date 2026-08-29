import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  TrendingUp, 
  Repeat, 
  Bed, 
  Users, 
  BrainCircuit, 
  Bell 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'PHC Network', path: '/network', icon: <Map size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Forecasting', path: '/forecasting', icon: <TrendingUp size={20} /> },
    { name: 'Redistribution', path: '/redistribution', icon: <Repeat size={20} /> },
    { name: 'Beds & Capacity', path: '/beds', icon: <Bed size={20} /> },
    { name: 'Staff Attendance', path: '/staff', icon: <Users size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-xl z-10 relative">
      <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
        <div className="bg-healthcare-500 p-2 rounded-lg">
          <BrainCircuit size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">SwasthyaSetu AI</h1>
          <p className="text-xs text-slate-400">Command Center</p>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-healthcare-600 text-white font-medium shadow-md shadow-healthcare-900/20' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
        Prototype v1.0
      </div>
    </div>
  );
};

const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-0">
      <div className="flex gap-4 items-center">
        <div className="text-sm font-medium text-slate-500">Location:</div>
        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-healthcare-500">
          <option>Maharashtra</option>
          <option>Karnataka</option>
          <option>Gujarat</option>
        </select>
        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-healthcare-500">
          <option>All Districts</option>
          <option>Pune</option>
          <option>Nagpur</option>
        </select>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-slate-500">System Live</span>
        </div>
        <Link to="/alerts" className="relative cursor-pointer">
          <Bell size={20} className="text-slate-400 hover:text-slate-600" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-healthcare-500 to-healthcare-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
          A
        </div>
      </div>
    </header>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
