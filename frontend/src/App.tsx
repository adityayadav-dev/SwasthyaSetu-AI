import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Network } from './pages/Network';
import { Redistribution } from './pages/Redistribution';
import { Inventory } from './pages/Inventory';
import { Forecasting } from './pages/Forecasting';
import { Beds } from './pages/Beds';
import { Staff } from './pages/Staff';
import { Alerts } from './pages/Alerts';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/network" element={<Network />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/redistribution" element={<Redistribution />} />
        <Route path="/beds" element={<Beds />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/alerts" element={<Alerts />} />
      </Routes>
    </Layout>
  );
}

export default App;
