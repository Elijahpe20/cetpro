from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from typing import Optional

router = APIRouter(prefix="/indicadores", tags=["Indicadores"])


@router.get("/", response_model=list[schemas.IndicadorOut])
def listar_indicadores(
    modulo: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    clase_numero: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(models.Indicador)
    if modulo:
        q = q.filter(models.Indicador.modulo.ilike(f"%{modulo}%"))
    if tipo:
        q = q.filter(models.Indicador.tipo == tipo.upper())
    if clase_numero:
        q = q.filter(models.Indicador.clase_numero == clase_numero)
    return q.order_by(models.Indicador.id).all()


@router.get("/modulos", response_model=list[str])
def listar_modulos(db: Session = Depends(get_db)):
    rows = db.query(models.Indicador.modulo).distinct().all()
    return [r[0] for r in rows if r[0]]


@router.get("/clases")
def listar_clases(modulo: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(
        models.Indicador.clase_numero,
        models.Indicador.clase_titulo,
        models.Indicador.modulo
    ).distinct()
    if modulo:
        q = q.filter(models.Indicador.modulo.ilike(f"%{modulo}%"))
    rows = q.order_by(models.Indicador.clase_numero).all()
    return [{"clase_numero": r[0], "clase_titulo": r[1], "modulo": r[2]} for r in rows]
