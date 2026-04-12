from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx

from app.core.config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    FRONTEND_URL,
)
from app.core.database import get_db
from app.core.security import create_token
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL  = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/login")
def google_login():
    params = (
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{params}")


@router.get("/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # 1. code → access_token
        token_res = await client.post(GOOGLE_TOKEN_URL, data={
            "code":          code,
            "client_id":     GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri":  GOOGLE_REDIRECT_URI,
            "grant_type":    "authorization_code",
        })
        token_data = token_res.json()

        # 2. access_token → 유저 정보
        user_res = await client.get(
            GOOGLE_USER_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        google_user = user_res.json()

    # 3. DB upsert
    user = db.query(User).filter(User.email == google_user["email"]).first()
    if not user:
        user = User(
            email=google_user["email"],
            name=google_user.get("name"),
            picture=google_user.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. JWT 발급 → 프론트로 리다이렉트
    token = create_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={token}")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id":      str(current_user.id),
        "email":   current_user.email,
        "name":    current_user.name,
        "picture": current_user.picture,
        "plan":    current_user.plan,
    }
