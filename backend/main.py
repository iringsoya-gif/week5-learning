def main():
    print("Hello from backend!")


if __name__ == "__main__":
    main()

@app.on_event("startup")
def startup():
    create_tables()

from app.api.routes import auth

app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["인증"]
)