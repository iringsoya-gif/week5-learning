from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, require_paid
from app.models.user import User

router = APIRouter()


@router.get("/ch/{chapter_id}")
def get_chapter(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if chapter_id > 1:
        require_paid(current_user)

    return {"chapter_id": chapter_id, "content": "..."}
