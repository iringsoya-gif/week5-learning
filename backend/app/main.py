from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import FRONTEND_URL
from app.core.database import Base, engine
from app.api.routes import auth, payment, chapters


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Week5 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/v1/auth",     tags=["인증"])
app.include_router(payment.router,  prefix="/api/v1/payment",  tags=["결제"])
app.include_router(chapters.router, prefix="/api/v1/chapters", tags=["챕터"])


@app.get("/")
def root():
    return {"status": "ok"}
