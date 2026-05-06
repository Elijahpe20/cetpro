from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/estudiantes", tags=["Estudiantes"])


@router.get("/", response_model=list[schemas.EstudianteOut])
def listar_estudiantes(db: Session = Depends(get_db)):
    return db.query(models.Estudiante).order_by(models.Estudiante.apellido).all()


@router.post("/", response_model=schemas.EstudianteOut, status_code=201)
def crear_estudiante(data: schemas.EstudianteCreate, db: Session = Depends(get_db)):
    est = models.Estudiante(**data.model_dump())
    db.add(est)
    db.commit()
    db.refresh(est)
    return est


@router.get("/{id}", response_model=schemas.EstudianteOut)
def obtener_estudiante(id: int, db: Session = Depends(get_db)):
    est = db.query(models.Estudiante).filter(models.Estudiante.id == id).first()
    if not est:
        raise HTTPException(404, "Estudiante no encontrado")
    return est


@router.put("/{id}", response_model=schemas.EstudianteOut)
def actualizar_estudiante(id: int, data: schemas.EstudianteUpdate, db: Session = Depends(get_db)):
    est = db.query(models.Estudiante).filter(models.Estudiante.id == id).first()
    if not est:
        raise HTTPException(404, "Estudiante no encontrado")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(est, k, v)
    db.commit()
    db.refresh(est)
    return est


@router.delete("/{id}", status_code=204)
def eliminar_estudiante(id: int, db: Session = Depends(get_db)):
    est = db.query(models.Estudiante).filter(models.Estudiante.id == id).first()
    if not est:
        raise HTTPException(404, "Estudiante no encontrado")
    db.delete(est)
    db.commit()


@router.get("/{id}/stats", response_model=schemas.EstudianteStats)
def stats_estudiante(id: int, db: Session = Depends(get_db)):
    est = db.query(models.Estudiante).filter(models.Estudiante.id == id).first()
    if not est:
        raise HTTPException(404, "Estudiante no encontrado")

    total_ind = db.query(models.Indicador).count()
    califs = (
        db.query(models.Calificacion)
        .filter(models.Calificacion.estudiante_id == id, models.Calificacion.nota.isnot(None))
        .all()
    )

    evaluados = len(califs)
    promedio_general = round(sum(c.nota for c in califs) / evaluados, 2) if evaluados else None

    por_tipo = []
    for tipo, nombre in [("C", "Conceptual"), ("P", "Procedimental"), ("A", "Actitudinal")]:
        total_tipo = db.query(models.Indicador).filter(models.Indicador.tipo == tipo).count()
        notas_tipo = [c.nota for c in califs if c.indicador.tipo == tipo]
        por_tipo.append(schemas.PromedioTipo(
            tipo=tipo,
            tipo_nombre=nombre,
            promedio=round(sum(notas_tipo) / len(notas_tipo), 2) if notas_tipo else None,
            evaluados=len(notas_tipo),
            total=total_tipo
        ))

    return schemas.EstudianteStats(
        estudiante_id=id,
        nombre_completo=f"{est.nombre} {est.apellido}",
        promedio_general=promedio_general,
        por_tipo=por_tipo,
        total_indicadores=total_ind,
        evaluados=evaluados
    )
