from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# Public customer response on submitting order
class OrderCreateResponse(BaseModel):
    order_id: str
    status: str
    payment_status: str = "unpaid"
    customer_name: Optional[str] = None
    original_filename: str
    print_type: str
    paper_size: str
    copies: int
    page_count: int
    per_page_rate: float
    total_price: float
    created_at: datetime
    message: str

    class Config:
        from_attributes = True


# Public customer status track response
class OrderStatusResponse(BaseModel):
    order_id: str
    status: str
    payment_status: str = "unpaid"
    customer_name: Optional[str] = None
    original_filename: str
    print_type: str
    paper_size: str
    copies: int
    page_count: int
    total_price: float
    created_at: datetime
    estimated_waiting_message: str

    class Config:
        from_attributes = True


# Protected owner order view response
class OrderOwnerResponse(BaseModel):
    id: int
    order_id: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    original_filename: str
    stored_filename: str
    file_type: str
    file_size_bytes: int
    print_type: str
    paper_size: str
    copies: int
    page_count: int
    per_page_rate: float
    total_price: float
    status: str
    payment_status: str = "unpaid"
    notes: Optional[str] = None
    is_file_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderUpdateStatusRequest(BaseModel):
    status: Optional[str] = Field(None, pattern="^(new|ready|printed|cancelled)$")
    payment_status: Optional[str] = Field(None, pattern="^(unpaid|paid)$")
    notes: Optional[str] = None


# Owner Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)


# Shop Settings Schemas
class ShopSettingsSchema(BaseModel):
    shop_name: str
    shop_tagline: str
    rate_bw: float
    rate_color: float
    file_retention_hours: int


class DashboardStatsResponse(BaseModel):
    today_orders_count: int
    today_cash_collected: float
    today_cash_pending: float
    today_cash_sales: float
    pending_orders_count: int
    ready_orders_count: int
    printed_orders_count: int
    cancelled_orders_count: int
    total_orders_all_time: int
