from fastapi import HTTPException, Header, Depends
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.core.database import get_db
from app.models.user import User


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "로그인이 필요합니다")

    payload = decode_token(authorization.replace("Bearer ", ""))
    if not payload:
        raise HTTPException(401, "유효하지 않은 토큰입니다")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(404, "유저를 찾을 수 없습니다")
    return user


def require_paid(current_user: User = Depends(get_current_user)) -> User:
    if current_user.plan != "paid":
        raise HTTPException(
            403,
            detail={
                "message": "이 콘텐츠는 결제 후 이용 가능합니다",
                "redirect": "/pricing",
            },
        )
    return current_user
