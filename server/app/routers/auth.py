from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserLogin, UserResponse
from ..utils.security import verify_password, create_access_token
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    credentials: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()

    # Create JWT token
    token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role}
    )

    # Set httpOnly cookie
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24  # 24 hours
    )

    return {"user": UserResponse.model_validate(user)}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="token")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user)):
    return {"user": UserResponse.model_validate(current_user)}
