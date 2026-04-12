from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import httpx
import hmac
import hashlib
import json

from app.core.database import get_db
from app.core.config import (
    POLAR_ACCESS_TOKEN,
    POLAR_PRODUCT_ID,
    POLAR_WEBHOOK_SECRET,
    FRONTEND_URL,
)
from app.api.deps import get_current_user
from app.models.user import User
from app.models.payment import Payment

router = APIRouter()

POLAR_API_URL = "https://api.polar.sh/v1"


@router.post("/checkout")
async def create_checkout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.plan == "paid":
        raise HTTPException(400, "이미 결제하셨습니다")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{POLAR_API_URL}/checkouts/",
            headers={
                "Authorization": f"Bearer {POLAR_ACCESS_TOKEN}",
                "Content-Type":  "application/json",
            },
            json={
                "product_id":     POLAR_PRODUCT_ID,
                "success_url":    f"{FRONTEND_URL}/payment/success",
                "cancel_url":     f"{FRONTEND_URL}/payment/cancel",
                "customer_email": current_user.email,
                "metadata":       {"user_id": str(current_user.id)},
            },
        )

    checkout_data = response.json()
    if response.status_code != 201:
        raise HTTPException(500, f"Polar 결제 생성 실패: {checkout_data}")

    return {"checkout_url": checkout_data["url"]}


@router.post("/webhook")
async def polar_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()

    signature = request.headers.get("webhook-signature", "")
    if not signature:
        raise HTTPException(400, "서명 헤더가 없습니다")

    expected_sig = hmac.new(
        POLAR_WEBHOOK_SECRET.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(f"sha256={expected_sig}", signature):
        raise HTTPException(400, "서명 검증 실패 — 위조된 요청")

    event      = json.loads(body)
    event_type = event.get("type")
    event_data = event.get("data", {})

    print(f"📨 Polar Webhook 수신: {event_type}")

    if event_type in ["order.paid", "subscription.active"]:
        customer_email   = (event_data.get("customer", {}).get("email") or
                            event_data.get("billing_address", {}).get("email"))
        polar_order_id   = event_data.get("id")
        polar_product_id = event_data.get("product_id")
        amount           = event_data.get("amount")
        currency         = event_data.get("currency", "USD")

        user = db.query(User).filter(User.email == customer_email).first()
        if not user:
            user_id = event_data.get("metadata", {}).get("user_id")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()

        if user:
            user.plan = "paid"
            user.polar_customer_id = event_data.get("customer", {}).get("id")
            db.add(Payment(
                user_id=user.id,
                polar_order_id=polar_order_id,
                polar_product_id=polar_product_id,
                amount=amount,
                currency=currency,
                status="paid",
            ))
            db.commit()
            print(f"✅ 결제 완료: {user.email} → plan=paid")
        else:
            print(f"⚠️ 유저를 찾을 수 없음: {customer_email}")

    elif event_type == "order.refunded":
        polar_order_id = event_data.get("id")
        payment = db.query(Payment).filter(Payment.polar_order_id == polar_order_id).first()
        if payment:
            payment.status = "refunded"
            user = db.query(User).filter(User.id == payment.user_id).first()
            if user:
                user.plan = "refunded"
            db.commit()
            print(f"🔄 환불 처리 완료: order {polar_order_id}")

    return {"status": "ok"}


@router.get("/status")
def get_payment_status(current_user: User = Depends(get_current_user)):
    return {
        "plan":    current_user.plan,
        "is_paid": current_user.plan == "paid",
    }
