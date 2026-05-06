# CETPRO — Sistema de Inteligencia Educativa

**Fase 1:** Gestión de calificaciones por indicador + perfiles de estudiantes.

## Stack
- **Backend:** Python 3.11 + FastAPI + SQLAlchemy + PostgreSQL (o SQLite para dev)
- **Frontend:** React 18 + Vite + Tailwind CSS + Recharts
- **Deploy:** Railway / Render / Vercel (free tier)

## Correr en local (sin Docker)

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed_data.py        # carga los 336 indicadores
uvicorn app.main:app --reload
# API en http://localhost:8000
# Docs en http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App en http://localhost:5173
```

## Correr con Docker
```bash
docker compose up --build
```

## Variables de entorno (backend)
```
DATABASE_URL=postgresql://user:pass@host/db   # default: SQLite local
```

## Estructura del proyecto
```
cetpro/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # SQLAlchemy engine
│   │   ├── models.py        # Estudiante, Indicador, Calificacion
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── students.py  # CRUD estudiantes + stats
│   │       ├── indicators.py
│   │       └── grades.py    # grilla + bulk save + reportes
│   ├── seed_data.py         # 336 indicadores precargados
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx          # Router + Sidebar
│       ├── api/client.js    # Axios wrappers
│       └── pages/
│           ├── Dashboard.jsx    # KPIs + charts
│           ├── Students.jsx     # CRUD con modal
│           └── GradeEntry.jsx   # Grilla de notas
└── docker-compose.yml
```

## API Endpoints principales
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /estudiantes/ | Listar todos |
| POST | /estudiantes/ | Crear |
| GET | /estudiantes/{id}/stats | Promedios por tipo |
| GET | /calificaciones/estudiante/{id} | Grilla completa |
| POST | /calificaciones/bulk | Guardar múltiples notas |
| GET | /calificaciones/reporte/clase/{n} | Reporte por clase |
| GET | /indicadores/clases | Listar clases |

## Roadmap
- [ ] Fase 2: Indicadores contextuales (social, empresarial, asistencia)
- [ ] Fase 3: ML — predicción de ausentismo y riesgo de abandono
- [ ] Fase 4: Dashboard analítico avanzado (Plotly/Streamlit)
