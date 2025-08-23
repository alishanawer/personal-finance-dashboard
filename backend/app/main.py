from fastapi import FastAPI

app = FastAPI(title="Personal Finance API", version="0.1.0")


@app.get("/")
def test():
    return {"status": "ok"}
