from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import OwnerUser
from app.schemas import LoginRequest, TokenResponse, ChangePasswordRequest
from app.auth import verify_password, hash_password, create_access_token, get_current_owner

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate owner and return JWT bearer token."""
    user = db.query(OwnerUser).filter(OwnerUser.username == creds.username.strip()).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(data={"sub": user.username})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        username=user.username
    )


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_owner: OwnerUser = Depends(get_current_owner)
):
    """Change the owner's password securely."""
    if not verify_password(data.old_password, current_owner.password_hash):
        raise HTTPException(status_code=400, detail="Current password does not match")

    current_owner.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}


@router.get("/me")
def get_current_user_info(current_owner: OwnerUser = Depends(get_current_owner)):
    """Check if current token is valid."""
    return {"username": current_owner.username, "authenticated": True}
