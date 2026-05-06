from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/calificaciones", tags=["Calificaciones"])


@router.get("/estudiante/{estudiante_id}", response_model=list[schemas.GrillaItem])
def grilla_estudiante(estudiante_id: int, db: Session = Depends(get_db)):
    """Devuelve TODOS los indicadores con la nota del estudiante (null si no evaluado)."""
    est = db.query(models.Estudiante).filter(models.Estudiante.id == estudiante_id).first()
    if not est:
        raise HTTPException(404, "Estudiante no encontrado")

    indicadores = db.query(models.Indicador).order_by(models.Indicador.id).all()
    calif_map = {
        c.indicador_id: c
        for c in db.query(models.Calificacion)
        .filter(models.Calificacion.estudiante_id == estudiante_id)
        .all()
    }

    return [
        schemas.GrillaItem(
            indicador_id=ind.id,
            codigo_corto=ind.codigo_corto,
            clase_titulo=ind.clase_titulo,
            tipo=ind.tipo,
            descripcion=ind.descripcion,
            nota=calif_map[ind.id].nota if ind.id in calif_map else None,
            observacion=calif_map[ind.id].observacion if ind.id in calif_map else None,
            calificacion_id=calif_map[ind.id].id if ind.id in calif_map else None,
        )
        for ind in indicadores
    ]


@router.post("/bulk", status_code=200)
def guardar_bulk(data: schemas.BulkCalificacionCreate, db: Session = Depends(get_db)):
    """Guarda o actualiza múltiples calificaciones de un estudiante de una sola vez."""
    est = db.query(models.Estudiante).filter(models.Estudiante.id == data.estudiante_id).first()
    if not est:
        raise HTTPException(404, "Estudiante no encontrado")

    for item in data.calificaciones:
        existing = (
            db.query(models.Calificacion)
            .filter(
                models.Calificacion.estudiante_id == data.estudiante_id,
                models.Calificacion.indicador_id == item.indicador_id
            )
            .first()
        )
        if existing:
            existing.nota = item.nota
            existing.observacion = item.observacion
        else:
            db.add(models.Calificacion(
                estudiante_id=data.estudiante_id,
                indicador_id=item.indicador_id,
                nota=item.nota,
                observacion=item.observacion
            ))

    db.commit()
    return {"detail": f"{len(data.calificaciones)} calificaciones guardadas"}


@router.put("/{id}", response_model=schemas.CalificacionOut)
def actualizar_calificacion(id: int, data: schemas.CalificacionUpdate, db: Session = Depends(get_db)):
    c = db.query(models.Calificacion).filter(models.Calificacion.id == id).first()
    if not c:
        raise HTTPException(404, "Calificación no encontrada")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.get("/reporte/clase/{clase_numero}")
def reporte_clase(clase_numero: int, db: Session = Depends(get_db)):
    """Promedio de cada estudiante en una clase específica."""
    indicadores = (
        db.query(models.Indicador)
        .filter(models.Indicador.clase_numero == clase_numero)
        .all()
    )
    if not indicadores:
        raise HTTPException(404, "Clase no encontrada")

    ind_ids = [i.id for i in indicadores]
    estudiantes = db.query(models.Estudiante).order_by(models.Estudiante.apellido).all()

    resultado = []
    for est in estudiantes:
        califs = (
            db.query(models.Calificacion)
            .filter(
                models.Calificacion.estudiante_id == est.id,
                models.Calificacion.indicador_id.in_(ind_ids),
                models.Calificacion.nota.isnot(None)
            )
            .all()
        )
        notas = [c.nota for c in califs]
        resultado.append({
            "estudiante_id": est.id,
            "nombre": f"{est.apellido}, {est.nombre}",
            "promedio": round(sum(notas) / len(notas), 2) if notas else None,
            "evaluados": len(notas),
            "total": len(ind_ids)
        })

    return {
        "clase_numero": clase_numero,
        "clase_titulo": indicadores[0].clase_titulo,
        "estudiantes": resultado
    }
