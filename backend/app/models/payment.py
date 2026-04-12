from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    polar_order_id   = Column(String, unique=True)
    polar_product_id = Column(String)
    amount           = Column(Integer)
    currency         = Column(String, default="USD")
    status           = Column(String, default="pending")  # pending | paid | refunded
    created_at       = Column(DateTime, default=datetime.utcnow)
