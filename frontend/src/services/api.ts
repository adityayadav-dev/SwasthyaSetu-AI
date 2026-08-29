const API_BASE = 'http://localhost:8000/api';

export const fetchDashboard = async () => {
  const res = await fetch(`${API_BASE}/dashboard`);
  return res.json();
};

export const fetchPHCs = async () => {
  const res = await fetch(`${API_BASE}/phcs`);
  return res.json();
};

export const fetchPHCDetails = async (id: number) => {
  const res = await fetch(`${API_BASE}/phcs/${id}`);
  return res.json();
};

export const fetchInventory = async () => {
  const res = await fetch(`${API_BASE}/inventory`);
  return res.json();
};

export const fetchMedicines = async () => {
  const res = await fetch(`${API_BASE}/medicines`);
  return res.json();
};

export const fetchForecast = async (phcId: number, medicineId: number) => {
  const res = await fetch(`${API_BASE}/forecast/${phcId}/${medicineId}`);
  return res.json();
};

export const fetchRecommendations = async () => {
  const res = await fetch(`${API_BASE}/redistribution/recommendations`);
  return res.json();
};

export const fetchAlerts = async () => {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
};

export const runSimulationStep = async () => {
  const res = await fetch(`${API_BASE}/demo/step`, { method: 'POST' });
  return res.json();
};
