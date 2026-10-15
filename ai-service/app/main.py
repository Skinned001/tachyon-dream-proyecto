from fastapi import FastAPI

app = FastAPI(title="Chief Journal AI Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/checklists")
def get_checklists() -> list[str]:
    return ["quality", "plagiarism", "similarity"]
