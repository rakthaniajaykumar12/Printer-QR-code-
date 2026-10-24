from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ShopSetting, OwnerUser
from app.schemas import ShopSettingsSchema
from app.auth import get_current_owner
from app.config import settings
from app.services.qr import generate_shop_qr_image

router = APIRouter(prefix="/api/owner/settings", tags=["Owner Settings & QR"])


def get_setting_val(db: Session, key: str, default: str) -> str:
    item = db.query(ShopSetting).filter(ShopSetting.key == key).first()
    return item.value if item else default


def set_setting_val(db: Session, key: str, value: str):
    item = db.query(ShopSetting).filter(ShopSetting.key == key).first()
    if item:
        item.value = value
    else:
        item = ShopSetting(key=key, value=value)
        db.add(item)


@router.get("", response_model=ShopSettingsSchema)
def get_shop_settings(
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Fetch current shop configuration."""
    return ShopSettingsSchema(
        shop_name=get_setting_val(db, "shop_name", settings.SHOP_NAME),
        shop_tagline=get_setting_val(db, "shop_tagline", settings.SHOP_TAGLINE),
        rate_bw=float(get_setting_val(db, "rate_bw", str(settings.RATE_BW_PER_PAGE))),
        rate_color=float(get_setting_val(db, "rate_color", str(settings.RATE_COLOR_PER_PAGE))),
        file_retention_hours=int(get_setting_val(db, "file_retention_hours", str(settings.FILE_RETENTION_HOURS)))
    )


@router.put("", response_model=ShopSettingsSchema)
def update_shop_settings(
    data: ShopSettingsSchema,
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Update per-page rates and shop parameters."""
    if data.rate_bw <= 0 or data.rate_color <= 0:
        raise HTTPException(status_code=400, detail="Rates must be positive numbers")

    set_setting_val(db, "shop_name", data.shop_name.strip())
    set_setting_val(db, "shop_tagline", data.shop_tagline.strip())
    set_setting_val(db, "rate_bw", str(data.rate_bw))
    set_setting_val(db, "rate_color", str(data.rate_color))
    set_setting_val(db, "file_retention_hours", str(max(1, data.file_retention_hours)))

    db.commit()

    return data


@router.get("/qr-code")
def get_shop_qr_code(
    url: str = Query(None, description="Target customer website URL to encode into QR code"),
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Generate and return a downloadable branded shop QR code image for printing & placing at the counter."""
    target_url = url if url else settings.FRONTEND_URL
    shop_name = get_setting_val(db, "shop_name", settings.SHOP_NAME)

    qr_io = generate_shop_qr_image(portal_url=target_url, shop_name=shop_name)

    return Response(
        content=qr_io.getvalue(),
        media_type="image/png",
        headers={
            "Content-Disposition": f'attachment; filename="SmartXerox_Shop_QR.png"'
        }
    )
