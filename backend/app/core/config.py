import os
from dotenv import load_dotenv

load_dotenv(encoding="utf-8")

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")
SECRET_KEY           = os.getenv("SECRET_KEY", "changeme")
DATABASE_URL         = os.getenv("DATABASE_URL")

POLAR_ACCESS_TOKEN   = os.getenv("POLAR_ACCESS_TOKEN")
POLAR_PRODUCT_ID     = os.getenv("POLAR_PRODUCT_ID")
POLAR_WEBHOOK_SECRET = os.getenv("POLAR_WEBHOOK_SECRET")

ALGORITHM                  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7일
