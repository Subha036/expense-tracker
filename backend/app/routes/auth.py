from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, User as UserSchema
from ..utils.jwt import verify_token, create_access_token

router = APIRouter(tags=["authentication"])
security = HTTPBearer()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    username = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserSchema, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(400, "Username already exists")

    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(400, "Email already exists")

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserSchema)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate monthly_budget max 5000
    if user_update.monthly_budget is not None and user_update.monthly_budget > 5000:
        raise HTTPException(status_code=400, detail="Monthly budget cannot exceed $5000")

    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/notifications")
def get_notifications_setting(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"email_notifications_enabled": current_user.email_notifications_enabled}


@router.put("/notifications")
def update_notifications_setting(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enabled = data.get("enabled", False)
    current_user.email_notifications_enabled = enabled
    db.commit()
    return {"email_notifications_enabled": current_user.email_notifications_enabled}
