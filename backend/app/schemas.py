from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# ── Estudiante ──────────────────────────────────────────────────────────────

class EstudianteBase(BaseModel):
    nombre: str
    apellido: str
    edad: Optional[int] = None
    sexo: Optional[str] = None
    distrito_residencia: Optional[str] = None
    estado_civil: Optional[str] = None
    carga_familiar: Optional[int] = None
    situacion_economica: Optional[str] = None
    tipo_negocio: Optional[str] = None
    actividad_comercial: Optional[str] = None
    inversion: Optional[float] = None
    experiencia_previa: Optional[str] = None
    horas_unidad: Optional[float] = None


class EstudianteCreate(EstudianteBase):
    pass


class EstudianteUpdate(EstudianteBase):
    nombre: Optional[str] = None
    apellido: Optional[str] = None


class EstudianteOut(EstudianteBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class EstudianteResumen(BaseModel):
    id: int
    nombre: str
    apellido: str
    promedio_general: Optional[float] = None
    total_evaluados: int = 0

    model_config = {"from_attributes": True}


# ── Indicador ────────────────────────────────────────────────────────────────

class IndicadorOut(BaseModel):
    id: int
    codigo: str
    modulo: Optional[str]
    unidad_didactica: Optional[str]
    clase_titulo: str
    clase_numero: Optional[int]
    modalidad: Optional[str]
    tipo: str
    tipo_nombre: str
    descripcion: str
    codigo_corto: str

    model_config = {"from_attributes": True}


# ── Calificación ─────────────────────────────────────────────────────────────

class CalificacionBase(BaseModel):
    nota: Optional[float] = Field(None, ge=0, le=20)
    observacion: Optional[str] = None


class CalificacionCreate(CalificacionBase):
    estudiante_id: int
    indicador_id: int


class CalificacionUpdate(CalificacionBase):
    pass


class CalificacionOut(CalificacionBase):
    id: int
    estudiante_id: int
    indicador_id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Grilla (matrícula completa de un estudiante) ──────────────────────────────

class GrillaItem(BaseModel):
    indicador_id: int
    codigo_corto: str
    clase_titulo: str
    tipo: str
    descripcion: str
    nota: Optional[float] = None
    observacion: Optional[str] = None
    calificacion_id: Optional[int] = None


class BulkCalificacionItem(BaseModel):
    indicador_id: int
    nota: Optional[float] = Field(None, ge=0, le=20)
    observacion: Optional[str] = None


class BulkCalificacionCreate(BaseModel):
    estudiante_id: int
    calificaciones: list[BulkCalificacionItem]


# ── Stats ─────────────────────────────────────────────────────────────────────

class PromedioTipo(BaseModel):
    tipo: str
    tipo_nombre: str
    promedio: Optional[float]
    evaluados: int
    total: int


class EstudianteStats(BaseModel):
    estudiante_id: int
    nombre_completo: str
    promedio_general: Optional[float]
    por_tipo: list[PromedioTipo]
    total_indicadores: int
    evaluados: int
