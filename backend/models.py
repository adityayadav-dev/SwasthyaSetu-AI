from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class State(Base):
    __tablename__ = "states"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    districts = relationship("District", back_populates="state")

class District(Base):
    __tablename__ = "districts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    state_id = Column(Integer, ForeignKey("states.id"))
    state = relationship("State", back_populates="districts")
    phcs = relationship("PHC", back_populates="district")

class PHC(Base):
    __tablename__ = "phcs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"))
    lat = Column(Float)
    lng = Column(Float)
    population_served = Column(Integer)
    
    # Bed capacity
    total_beds = Column(Integer, default=0)
    occupied_beds = Column(Integer, default=0)
    
    # Staffing
    doctors_total = Column(Integer, default=0)
    doctors_present = Column(Integer, default=0)
    nurses_total = Column(Integer, default=0)
    nurses_present = Column(Integer, default=0)
    pharmacists_total = Column(Integer, default=0)
    pharmacists_present = Column(Integer, default=0)
    
    district = relationship("District", back_populates="phcs")
    inventory = relationship("Inventory", back_populates="phc")

class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)
    
class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    phc_id = Column(Integer, ForeignKey("phcs.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    
    current_stock = Column(Integer, default=0)
    daily_consumption_avg = Column(Float, default=0.0)
    reorder_level = Column(Integer, default=0)
    incoming_supply = Column(Integer, default=0)
    
    phc = relationship("PHC", back_populates="inventory")
    medicine = relationship("Medicine")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    phc_id = Column(Integer, ForeignKey("phcs.id"), nullable=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=True)
    severity = Column(String) # CRITICAL, HIGH, MEDIUM, LOW
    message = Column(String)
    reason = Column(String)
    recommended_action = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

class HistoricalConsumption(Base):
    __tablename__ = "historical_consumption"
    id = Column(Integer, primary_key=True, index=True)
    phc_id = Column(Integer, ForeignKey("phcs.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    date = Column(DateTime)
    quantity_consumed = Column(Integer)
