from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import math

from database import engine, Base, get_db
import models
from seed import seed_db

app = FastAPI(title="SwasthyaSetu AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_db()

@app.get("/")
def root():
    return {"message": "SwasthyaSetu AI API is running"}

# --- Pydantic Schemas ---
class MedicineSchema(BaseModel):
    id: int
    name: str
    category: str
    class Config:
        orm_mode = True

class InventorySchema(BaseModel):
    id: int
    medicine: MedicineSchema
    current_stock: int
    daily_consumption_avg: float
    reorder_level: int
    incoming_supply: int
    days_of_stock: float
    risk_level: str
    class Config:
        orm_mode = True

class PHCSchema(BaseModel):
    id: int
    name: str
    district_id: int
    lat: float
    lng: float
    population_served: int
    total_beds: int
    occupied_beds: int
    doctors_total: int
    doctors_present: int
    nurses_total: int
    nurses_present: int
    pharmacists_total: int
    pharmacists_present: int
    inventory: List[InventorySchema] = []
    class Config:
        orm_mode = True

# --- Helper Functions ---
def calculate_risk(current_stock, avg_consumption, reorder_level):
    if avg_consumption == 0:
        return "LOW", 999
    days = current_stock / avg_consumption
    if days <= 3:
        return "CRITICAL", days
    elif days <= 7:
        return "HIGH", days
    elif current_stock < reorder_level:
        return "MEDIUM", days
    return "LOW", days

# --- Endpoints ---
@app.get("/api/dashboard")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    phcs = db.query(models.PHC).all()
    inventory = db.query(models.Inventory).all()
    
    total_phcs = len(phcs)
    total_beds = sum(p.total_beds for p in phcs)
    occupied_beds = sum(p.occupied_beds for p in phcs)
    available_beds = total_beds - occupied_beds
    
    total_staff = sum(p.doctors_total + p.nurses_total + p.pharmacists_total for p in phcs)
    present_staff = sum(p.doctors_present + p.nurses_present + p.pharmacists_present for p in phcs)
    attendance_pct = (present_staff / total_staff * 100) if total_staff > 0 else 0
    
    at_risk_phcs = set()
    meds_below_threshold = 0
    
    for inv in inventory:
        risk, _ = calculate_risk(inv.current_stock, inv.daily_consumption_avg, inv.reorder_level)
        if risk in ["CRITICAL", "HIGH"]:
            at_risk_phcs.add(inv.phc_id)
        if inv.current_stock < inv.reorder_level:
            meds_below_threshold += 1
            
    return {
        "total_phcs": total_phcs,
        "phcs_at_risk": len(at_risk_phcs),
        "medicines_below_threshold": meds_below_threshold,
        "available_beds": available_beds,
        "staff_attendance_pct": round(attendance_pct, 1),
        "pending_transfers": 12 # Mock value for now
    }

@app.get("/api/phcs", response_model=List[dict])
def get_phcs(db: Session = Depends(get_db)):
    phcs = db.query(models.PHC).all()
    res = []
    for p in phcs:
        p_dict = {k: v for k, v in p.__dict__.items() if not k.startswith('_sa_')}
        
        # Calculate overall risk score
        invs = db.query(models.Inventory).filter(models.Inventory.phc_id == p.id).all()
        max_risk = "LOW"
        risk_val = 0
        for inv in invs:
            risk, _ = calculate_risk(inv.current_stock, inv.daily_consumption_avg, inv.reorder_level)
            if risk == "CRITICAL":
                max_risk = "CRITICAL"
                risk_val = 3
            elif risk == "HIGH" and risk_val < 2:
                max_risk = "HIGH"
                risk_val = 2
            elif risk == "MEDIUM" and risk_val < 1:
                max_risk = "MEDIUM"
                risk_val = 1
        
        p_dict['status'] = "Healthy" if max_risk == "LOW" else ("Warning" if max_risk in ["MEDIUM", "HIGH"] else "Critical")
        res.append(p_dict)
    return res

@app.get("/api/phcs/{phc_id}")
def get_phc_details(phc_id: int, db: Session = Depends(get_db)):
    phc = db.query(models.PHC).filter(models.PHC.id == phc_id).first()
    if not phc:
        raise HTTPException(status_code=404, detail="PHC not found")
        
    invs = db.query(models.Inventory).filter(models.Inventory.phc_id == phc_id).all()
    inv_res = []
    for inv in invs:
        med = db.query(models.Medicine).filter(models.Medicine.id == inv.medicine_id).first()
        risk, days = calculate_risk(inv.current_stock, inv.daily_consumption_avg, inv.reorder_level)
        inv_res.append({
            "medicine_name": med.name,
            "category": med.category,
            "current_stock": inv.current_stock,
            "daily_consumption_avg": round(inv.daily_consumption_avg, 1),
            "reorder_level": inv.reorder_level,
            "days_remaining": round(days, 1),
            "risk_level": risk
        })
        
    phc_dict = {k: v for k, v in phc.__dict__.items() if not k.startswith('_sa_')}
    phc_dict['inventory'] = inv_res
    return phc_dict

@app.get("/api/redistribution/recommendations")
def get_redistribution_recommendations(db: Session = Depends(get_db)):
    # Find all critical inventories
    all_invs = db.query(models.Inventory).all()
    recommendations = []
    
    for inv in all_invs:
        risk, _ = calculate_risk(inv.current_stock, inv.daily_consumption_avg, inv.reorder_level)
        if risk in ["CRITICAL", "HIGH"]:
            recipient_phc = db.query(models.PHC).filter(models.PHC.id == inv.phc_id).first()
            med = db.query(models.Medicine).filter(models.Medicine.id == inv.medicine_id).first()
            
            # Find donors
            donors = db.query(models.Inventory).filter(
                models.Inventory.medicine_id == inv.medicine_id,
                models.Inventory.phc_id != inv.phc_id
            ).all()
            
            best_donor = None
            best_score = -9999
            transfer_qty = 0
            
            for d in donors:
                d_risk, _ = calculate_risk(d.current_stock, d.daily_consumption_avg, d.reorder_level)
                if d_risk == "LOW": # Only take from LOW risk
                    surplus = d.current_stock - d.reorder_level
                    if surplus > 0:
                        donor_phc = db.query(models.PHC).filter(models.PHC.id == d.phc_id).first()
                        
                        # Calculate distance approx (euclidean for prototype)
                        dist = math.sqrt((donor_phc.lat - recipient_phc.lat)**2 + (donor_phc.lng - recipient_phc.lng)**2) * 111 # rough km
                        
                        score = surplus - (dist * 2) # Arbitrary scoring logic
                        if score > best_score:
                            best_score = score
                            best_donor = donor_phc
                            transfer_qty = min(surplus, inv.reorder_level - inv.current_stock)
            
            if best_donor and transfer_qty > 0:
                dist = math.sqrt((best_donor.lat - recipient_phc.lat)**2 + (best_donor.lng - recipient_phc.lng)**2) * 111
                recommendations.append({
                    "medicine_id": med.id,
                    "medicine_name": med.name,
                    "recipient_id": recipient_phc.id,
                    "recipient_name": recipient_phc.name,
                    "donor_id": best_donor.id,
                    "donor_name": best_donor.name,
                    "quantity": int(transfer_qty),
                    "distance_km": round(dist, 1)
                })
                
    return recommendations

from ai_service import generate_emergency_alerts

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    phcs = db.query(models.PHC).all()
    
    # Gather a brief summary of the network to send to AI
    total_phcs = len(phcs)
    critical_stock = 0
    low_staff = 0
    full_beds = 0
    
    for phc in phcs:
        if (phc.occupied_beds / phc.total_beds) > 0.85:
            full_beds += 1
        
        staff_pct = (phc.doctors_present + phc.nurses_present + phc.pharmacists_present) / (phc.doctors_total + phc.nurses_total + phc.pharmacists_total)
        if staff_pct < 0.75:
            low_staff += 1
            
        invs = db.query(models.Inventory).filter(models.Inventory.phc_id == phc.id).all()
        for inv in invs:
            if inv.current_stock < inv.reorder_level:
                critical_stock += 1
                
    context = f"Total PHCs: {total_phcs}. Facilities with low staff: {low_staff}. Facilities with full beds: {full_beds}. Items below reorder level: {critical_stock}."
    
    alerts = generate_emergency_alerts(context)
    return alerts

@app.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)):
    phcs = db.query(models.PHC).all()
    res = []
    for phc in phcs:
        invs = db.query(models.Inventory).filter(models.Inventory.phc_id == phc.id).all()
        inv_list = []
        for inv in invs:
            med = db.query(models.Medicine).filter(models.Medicine.id == inv.medicine_id).first()
            risk, days = calculate_risk(inv.current_stock, inv.daily_consumption_avg, inv.reorder_level)
            inv_list.append({
                "medicine_id": med.id,
                "medicine_name": med.name,
                "category": med.category,
                "current_stock": inv.current_stock,
                "daily_consumption_avg": round(inv.daily_consumption_avg, 1),
                "reorder_level": inv.reorder_level,
                "days_remaining": round(days, 1),
                "risk_level": risk
            })
        if inv_list:
            res.append({
                "phc_id": phc.id,
                "phc_name": phc.name,
                "district_id": phc.district_id,
                "inventory": inv_list
            })
    return res

@app.get("/api/medicines")
def get_medicines(db: Session = Depends(get_db)):
    meds = db.query(models.Medicine).all()
    return [{"id": m.id, "name": m.name, "category": m.category} for m in meds]

@app.get("/api/forecast/{phc_id}/{medicine_id}")
def get_forecast(phc_id: int, medicine_id: int, db: Session = Depends(get_db)):
    history = db.query(models.HistoricalConsumption).filter(
        models.HistoricalConsumption.phc_id == phc_id,
        models.HistoricalConsumption.medicine_id == medicine_id
    ).order_by(models.HistoricalConsumption.date).all()
    
    data = []
    if history:
        for idx, h in enumerate(history[-30:]): # Last 30 days
            data.append({
                "day": f"Day {idx + 1}",
                "actual": h.quantity_consumed,
                "forecast": None,
                "trend": h.quantity_consumed
            })
            
        # generate 14 days of forecast
        last_qty = history[-1].quantity_consumed
        for i in range(14):
            val = last_qty * (1 + (i * 0.015)) # basic 1.5% daily increasing trend
            data.append({
                "day": f"Day {30 + i + 1}",
                "actual": None,
                "forecast": round(val, 1),
                "trend": round(val, 1)
            })
    return data

from simulation import simulate_step
@app.post("/api/demo/step")
def run_simulation_step():
    return simulate_step()
