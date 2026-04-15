from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_tables
from app.api.routes import auth, payment  # chapters 제거!

app = FastAPI(title="Week5 Learning API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/api/v1/auth",    tags=["인증"])
app.include_router(payment.router, prefix="/api/v1/payment", tags=["결제"])

@app.on_event("startup")
def startup():
    create_tables()

@app.get("/")
def root():
    return {"status": "ok"}