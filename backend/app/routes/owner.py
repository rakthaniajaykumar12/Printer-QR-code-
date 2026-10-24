from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Order, OwnerUser
from app.schemas import OrderOwnerResponse, OrderUpdateStatusRequest, DashboardStatsResponse
from app.auth import get_current_owner
from app.services.storage import get_file_path, cleanup_expired_files

router = APIRouter(prefix="/api/owner", tags=["Owner Dashboard"])


@router.get("/orders", response_model=List[OrderOwnerResponse])
def get_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Retrieve orders for the owner dashboard. Newest orders appear first."""
    query = db.query(Order)

    # Filter by status if provided (and not 'all')
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Order.status == status_filter.lower())

    # Search filter (by Order ID, Customer Name, or Phone)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Order.order_id.ilike(term)) |
            (Order.customer_name.ilike(term)) |
            (Order.customer_phone.ilike(term))
        )

    # Newest orders first
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return orders


@router.get("/orders/{order_id}", response_model=OrderOwnerResponse)
def get_order_detail(
    order_id: str,
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Get single order details for owner."""
    order = db.query(Order).filter(Order.order_id == order_id.upper()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/orders/{order_id}/download")
def download_order_file(
    order_id: str,
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Secure download endpoint. Only authenticated owner can download customer files."""
    order = db.query(Order).filter(Order.order_id == order_id.upper()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    file_path = get_file_path(order.stored_filename)

    # Clean filename for browser download
    clean_filename = order.original_filename.replace('"', "").replace("'", "")
    
    # Media type mapping
    media_types = {
        "pdf": "application/pdf",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png"
    }
    media_type = media_types.get(order.file_type.lower(), "application/octet-stream")

    return FileResponse(
        path=file_path,
        filename=clean_filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{clean_filename}"'
        }
    )


@router.patch("/orders/{order_id}/status", response_model=OrderOwnerResponse)
def update_order_status(
    order_id: str,
    body: OrderUpdateStatusRequest,
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Update order print status ('new', 'ready', 'printed', 'cancelled') or payment status ('unpaid', 'paid')."""
    order = db.query(Order).filter(Order.order_id == order_id.upper()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if body.status is not None:
        order.status = body.status
    if body.payment_status is not None:
        order.payment_status = body.payment_status
    if body.notes is not None:
        order.notes = body.notes

    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


@router.delete("/orders/{order_id}")
def delete_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Delete an order and its uploaded file completely."""
    order = db.query(Order).filter(Order.order_id == order_id.upper()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Attempt to delete file from disk
    try:
        file_path = get_file_path(order.stored_filename)
        if file_path.exists():
            file_path.unlink()
    except Exception:
        pass

    db.delete(order)
    db.commit()
    return {"message": f"Order {order_id} deleted successfully"}


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Provide summary statistics for today's sales and order queue."""
    now_utc = datetime.now(timezone.utc)
    # Start of today (UTC)
    today_start = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)

    # Orders created today
    today_orders = db.query(Order).filter(Order.created_at >= today_start).all()
    today_orders_count = len(today_orders)

    # Cash tracking separated from print status
    today_cash_collected = sum(
        o.total_price for o in today_orders if getattr(o, "payment_status", "unpaid") == "paid" and o.status != "cancelled"
    )
    today_cash_pending = sum(
        o.total_price for o in today_orders if getattr(o, "payment_status", "unpaid") == "unpaid" and o.status != "cancelled"
    )
    today_cash_sales = today_cash_collected + today_cash_pending

    # Status counts across active orders
    pending_count = db.query(Order).filter(Order.status == "new").count()
    ready_count = db.query(Order).filter(Order.status == "ready").count()
    printed_count = db.query(Order).filter(Order.status == "printed").count()
    cancelled_count = db.query(Order).filter(Order.status == "cancelled").count()
    total_all_time = db.query(Order).count()

    return DashboardStatsResponse(
        today_orders_count=today_orders_count,
        today_cash_collected=round(today_cash_collected, 2),
        today_cash_pending=round(today_cash_pending, 2),
        today_cash_sales=round(today_cash_sales, 2),
        pending_orders_count=pending_count,
        ready_orders_count=ready_count,
        printed_orders_count=printed_count,
        cancelled_orders_count=cancelled_count,
        total_orders_all_time=total_all_time
    )


@router.post("/cleanup-files")
def trigger_file_cleanup(
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Manually invoke cleanup of old uploaded files according to retention policy."""
    cleaned = cleanup_expired_files(db)
    return {"message": f"Cleaned up {cleaned} expired customer files."}
