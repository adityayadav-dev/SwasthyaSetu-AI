import random
from datetime import datetime, timedelta
from database import engine, Base, SessionLocal
from models import State, District, PHC, Medicine, Inventory, HistoricalConsumption

def seed_db():
    print("Seeding database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(State).first():
        print("Database already seeded.")
        return

    states_data = [
        {"name": "Maharashtra", "districts": ["Pune", "Nagpur", "Nashik"]},
        {"name": "Karnataka", "districts": ["Bangalore Urban", "Mysore", "Belagavi"]},
        {"name": "Gujarat", "districts": ["Ahmedabad", "Surat", "Vadodara"]},
    ]

    medicines_data = [
        {"name": "Paracetamol 500mg", "category": "Analgesic"},
        {"name": "ORS Sachets", "category": "Fluids"},
        {"name": "Amoxicillin 250mg", "category": "Antibiotic"},
        {"name": "Azithromycin 500mg", "category": "Antibiotic"},
        {"name": "Insulin Regular", "category": "Anti-diabetic"},
        {"name": "IV Fluids (RL)", "category": "Fluids"},
        {"name": "Artemether-Lumefantrine", "category": "Anti-malarial"},
        {"name": "Amlodipine 5mg", "category": "Anti-hypertensive"}
    ]

    medicines = []
    for med in medicines_data:
        m = Medicine(name=med["name"], category=med["category"])
        db.add(m)
        medicines.append(m)
    db.commit()

    for s_data in states_data:
        state = State(name=s_data["name"])
        db.add(state)
        db.commit()

        for d_name in s_data["districts"]:
            district = District(name=d_name, state_id=state.id)
            db.add(district)
            db.commit()

            # Create 3-5 PHCs per district
            for i in range(random.randint(3, 5)):
                lat_base = 18.5204 if state.name == "Maharashtra" else (12.9716 if state.name == "Karnataka" else 23.0225)
                lng_base = 73.8567 if state.name == "Maharashtra" else (77.5946 if state.name == "Karnataka" else 72.5714)
                
                # add some random offset
                lat = lat_base + random.uniform(-1.0, 1.0)
                lng = lng_base + random.uniform(-1.0, 1.0)

                total_beds = random.choice([10, 20, 30, 50])
                phc = PHC(
                    name=f"PHC {district.name} - {random.randint(1, 100)}",
                    district_id=district.id,
                    lat=lat,
                    lng=lng,
                    population_served=random.randint(15000, 50000),
                    total_beds=total_beds,
                    occupied_beds=int(total_beds * random.uniform(0.5, 0.95)),
                    doctors_total=random.randint(2, 5),
                    nurses_total=random.randint(4, 10),
                    pharmacists_total=random.randint(1, 3)
                )
                phc.doctors_present = int(phc.doctors_total * random.uniform(0.7, 1.0))
                phc.nurses_present = int(phc.nurses_total * random.uniform(0.7, 1.0))
                phc.pharmacists_present = int(phc.pharmacists_total * random.uniform(0.7, 1.0))
                
                db.add(phc)
                db.commit()

                # Add inventory for this PHC
                for med in medicines:
                    avg_consumption = random.uniform(20.0, 150.0)
                    # Simulate some being low stock
                    is_low = random.random() < 0.1
                    stock = int(avg_consumption * random.uniform(2.0, 5.0)) if is_low else int(avg_consumption * random.uniform(15.0, 30.0))
                    
                    inv = Inventory(
                        phc_id=phc.id,
                        medicine_id=med.id,
                        current_stock=stock,
                        daily_consumption_avg=avg_consumption,
                        reorder_level=int(avg_consumption * 7.0),
                        incoming_supply=int(avg_consumption * 10) if random.random() < 0.2 else 0
                    )
                    db.add(inv)
                    
                    # Generate 30 days of historical data
                    end_date = datetime.utcnow()
                    for d in range(30):
                        date = end_date - timedelta(days=30-d)
                        base_qty = avg_consumption
                        # Add some noise
                        qty = max(0, int(base_qty + random.uniform(-0.2*base_qty, 0.2*base_qty)))
                        hist = HistoricalConsumption(
                            phc_id=phc.id,
                            medicine_id=med.id,
                            date=date,
                            quantity_consumed=qty
                        )
                        db.add(hist)

                db.commit()

    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    seed_db()
