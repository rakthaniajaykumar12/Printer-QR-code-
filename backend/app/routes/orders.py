from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Order, ShopSetting
from app.schemas import OrderCreateResponse, OrderStatusResponse
from app.services.storage import validate_file, save_uploaded_file
from app.utils.helpers import generate_unique_order_id, inspect_pdf_pages
from app.config import settings

router = APIRouter(prefix="/api/orders", tags=["Customer Orders"])


def get_current_rates(db: Session) -> tuple[float, float]:
    """Retrieve current per-page rates for B&W and Color from settings table, or defaults."""
    bw_setting = db.query(ShopSetting).filter(ShopSetting.key == "rate_bw").first()
    color_setting = db.query(ShopSetting).filter(ShopSetting.key == "rate_color").first()

    rate_bw = float(bw_setting.value) if bw_setting else settings.RATE_BW_PER_PAGE
    rate_color = float(color_setting.value) if color_setting else settings.RATE_COLOR_PER_PAGE
    return rate_bw, rate_color


@router.post("", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
async def submit_print_order(
    file: UploadFile = File(...),
    customer_name: Optional[str] = Form(None),
    customer_phone: Optional[str] = Form(None),
    print_type: str = Form("bw"),  # 'bw' or 'color'
    paper_size: str = Form("A4"),  # 'A4', 'A5', 'Legal'
    copies: int = Form(1),
    page_count: Optional[int] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Customer submits a document or photo for printing."""
    # 1. Validation
    if print_type not in ["bw", "color"]:
        raise HTTPException(status_code=400, detail="Invalid print type. Choose 'bw' or 'color'.")

    valid_paper_sizes = ["A4", "A5", "Legal", "Letter", "4x6 Photo"]
    if paper_size not in valid_paper_sizes:
        paper_size = "A4"

    if copies < 1 or copies > 100:
        raise HTTPException(status_code=400, detail="Number of copies must be between 1 and 100.")

    # 2. File Validation & Saving
    ext = validate_file(file)
    stored_filename, content, file_size = await save_uploaded_file(file, ext)

    # 3. Determine Page Count
    detected_pages = 1
    if ext == "pdf":
        detected_pages = inspect_pdf_pages(content)

    final_pages = page_count if (page_count is not None and page_count > 0) else detected_pages

    # 4. Calculate Rate & Total
    rate_bw, rate_color = get_current_rates(db)
    selected_rate = rate_color if print_type == "color" else rate_bw
    total_price = round(final_pages * copies * selected_rate, 2)

    # 5. Unique Order ID & DB Record
    order_id = generate_unique_order_id(db)

    order = Order(
        order_id=order_id,
        customer_name=customer_name.strip() if customer_name else None,
        customer_phone=customer_phone.strip() if customer_phone else None,
        original_filename=file.filename or f"print_job.{ext}",
        stored_filename=stored_filename,
        file_type=ext,
        file_size_bytes=file_size,
        print_type=print_type,
        paper_size=paper_size,
        copies=copies,
        page_count=final_pages,
        per_page_rate=selected_rate,
        total_price=total_price,
        status="new",
        notes=notes.strip() if notes else None
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return OrderCreateResponse(
        order_id=order.order_id,
        status=order.status,
        payment_status=order.payment_status,
        customer_name=order.customer_name,
        original_filename=order.original_filename,
        print_type=order.print_type,
        paper_size=order.paper_size,
        copies=order.copies,
        page_count=order.page_count,
        per_page_rate=order.per_page_rate,
        total_price=order.total_price,
        created_at=order.created_at,
        message="Order received! Please show this Order ID at the shop counter. Pay cash upon collection."
    )


@router.get("/{order_id}/status", response_model=OrderStatusResponse)
def check_order_status(order_id: str, db: Session = Depends(get_db)):
    """Customer looks up status of their print order using the Order ID."""
    clean_id = order_id.strip().upper()
    order = db.query(Order).filter(Order.order_id == clean_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{clean_id}' not found. Please verify the ID."
        )

    # Status-specific friendly messages
    messages = {
        "new": "Order submitted! The shop owner has received your file in the print queue.",
        "ready": "Preparing to print! Your job is next in line at the Epson L3250.",
        "printed": "Printing completed! Please collect your printout at the shop counter and pay cash.",
        "cancelled": "This order has been cancelled. Please visit the counter if you have questions."
    }

    return OrderStatusResponse(
        order_id=order.order_id,
        status=order.status,
        payment_status=order.payment_status,
        customer_name=order.customer_name,
        original_filename=order.original_filename,
        print_type=order.print_type,
        paper_size=order.paper_size,
        copies=order.copies,
        page_count=order.page_count,
        total_price=order.total_price,
        created_at=order.created_at,
        estimated_waiting_message=messages.get(order.status, "Processing order.")
    )


@router.get("/current-rates")
def get_public_rates(db: Session = Depends(get_db)):
    """Public endpoint to fetch current rates so customer calculator is always accurate."""
    rate_bw, rate_color = get_current_rates(db)
    
    shop_name_setting = db.query(ShopSetting).filter(ShopSetting.key == "shop_name").first()
    shop_tagline_setting = db.query(ShopSetting).filter(ShopSetting.key == "shop_tagline").first()

    return {
        "rate_bw": rate_bw,
        "rate_color": rate_color,
        "shop_name": shop_name_setting.value if shop_name_setting else settings.SHOP_NAME,
        "shop_tagline": shop_tagline_setting.value if shop_tagline_setting else settings.SHOP_TAGLINE,
        "max_file_size_mb": settings.MAX_FILE_SIZE_MB
    }
