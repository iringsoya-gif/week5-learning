def main():
    print("Hello from backend!")


if __name__ == "__main__":
    main()

@app.on_event("startup")
def startup():
    create_tables()