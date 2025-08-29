# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(username: str, email: str, password: str, db: Session = Depends(get_db)):
    # check if user already exists
    existing_user = (
        db.query(User)
        .filter((User.username == username) | (User.email == email))
        .first()
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already taken")

    # create user
    hashed_password = hash_password(password)
    new_user = User(username=username, email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # generate JWT (log them in immediately)
    access_token = create_access_token({"sub": str(new_user.id)})

    return {
        "message": "User created successfully",
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # NOTE: OAuth2PasswordRequestForm provides fields:
    #   - username  (we'll use this as "email")
    #   - password
    #   - scope(s)  (ignored for now)
    email = form_data.username
    password = form_data.password

    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT token (subject = user.id)
    access_token = create_access_token({"sub": str(user.id)})

    return {"access_token": access_token, "token_type": "bearer"}
