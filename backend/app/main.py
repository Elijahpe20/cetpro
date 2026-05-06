from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import students, indicators, grades

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CETPRO — Sistema de Inteligencia Educativa",
    description="Gestión de calificaciones por indicador y perfil de estudiantes",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(indicators.router)
app.include_router(grades.router)


@app.get("/")
def root():
    return {"status": "ok", "app": "CETPRO Sistema de Inteligencia Educativa v1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
