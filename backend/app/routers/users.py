from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.deps_auth import get_current_user
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if updates.username and updates.username != current_user.username:
        existing = (
            db.query(User)
            .filter(User.username == updates.username, User.id != current_user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400, detail="Username already taken")
        current_user.username = updates.username

    if updates.email and updates.email != current_user.email:
        existing = (
            db.query(User)
            .filter(User.email == updates.email, User.id != current_user.id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = updates.email

    db.commit()
    db.refresh(current_user)
    return current_user
