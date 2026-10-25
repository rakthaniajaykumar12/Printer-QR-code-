from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(32), unique=True, index=True, nullable=False)

    # Customer Info
    customer_name = Column(String(100), nullable=True)
    customer_phone = Column(String(20), nullable=True)

    # File details
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)

    # Print preferences
    print_type = Column(String(20), nullable=False, default="bw")
    paper_size = Column(String(20), nullable=False, default="A4")
    copies = Column(Integer, nullable=False, default=1)
    page_count = Column(Integer, nullable=False, default=1)
    per_page_rate = Column(Float, nullable=False, default=2.0)
    total_price = Column(Float, nullable=False, default=2.0)

    # Order lifecycle
    status = Column(String(30), nullable=False, default="new", index=True)
    payment_status = Column(String(30), nullable=False, default="unpaid", index=True)
    notes = Column(Text, nullable=True)

    # Retention & audit
    is_file_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class ShopSetting(Base):
    __tablename__ = "shop_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)


class OwnerUser(Base):
    __tablename__ = "owner_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Security question answers (store hashes, not plain answers)
    security_color_hash = Column(String(255), nullable=True)
    security_animal_hash = Column(String(255), nullable=True)
    security_person_hash = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
