from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_tables
from app.api.routes import auth, payment

app = FastAPI(title="Week5 Learning API")

# ── CORS 설정 ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://week5-learning.vercel.app",
    ],
    allow_origin_regex="https://week5-learning-.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 라우터 등록 ──
app.include_router(auth.router,    prefix="/api/v1/auth",    tags=["인증"])
app.include_router(payment.router, prefix="/api/v1/payment", tags=["결제"])

# ── 시작 시 DB 테이블 생성 ──
@app.on_event("startup")
def startup():
    create_tables()

# ── 헬스체크 ──
@app.get("/")
def root():
    return {"status": "ok"}