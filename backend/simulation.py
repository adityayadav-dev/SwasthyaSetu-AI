from database import SessionLocal
from models import Inventory, PHC
import random

def simulate_step():
    """
    Simulates a step of time passing:
    - Randomly decrements some inventory (consumption)
    - Occasionally updates staff attendance
    - Updates bed occupancy
    """
    db = SessionLocal()
    try:
        # Simulate inventory consumption
        inventories = db.query(Inventory).all()
        for inv in inventories:
            # Consumption logic: consume around average daily / 24 to simulate an hour passing, 
            # but for demo purposes let's just drop it by 5-10% of daily avg so it's noticeable.
            drop = int(inv.daily_consumption_avg * random.uniform(0.1, 0.3))
            if inv.current_stock > 0:
                inv.current_stock = max(0, inv.current_stock - drop)
                
        # Simulate bed and staff changes for a few random PHCs
        phcs = db.query(PHC).all()
        for phc in random.sample(phcs, min(5, len(phcs))):
            # Bed changes
            change = random.randint(-2, 3)
            phc.occupied_beds = max(0, min(phc.total_beds, phc.occupied_beds + change))
            
            # Staff changes (rare)
            if random.random() < 0.2:
                phc.doctors_present = max(0, min(phc.doctors_total, phc.doctors_present + random.randint(-1, 1)))
                
        db.commit()
        return {"status": "success", "message": "Simulation step executed."}
    finally:
        db.close()
