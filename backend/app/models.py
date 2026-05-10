from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum


class TipoIndicador(str, enum.Enum):
    C = "C"
    P = "P"
    A = "A"


class Estudiante(Base):
    __tablename__ = "estudiantes"

    id = Column(Integer, primary_key=True, index=True)

    # ── Perfil Básico ──────────────────────────────────────────────────────
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dni = Column(String(8), nullable=True, unique=True)
    fecha_nacimiento = Column(String(10), nullable=True)      # YYYY-MM-DD
    sexo = Column(String(20), nullable=True)
    telefono = Column(String(15), nullable=True)
    distrito_residencia = Column(String(100), nullable=True)
    estado_civil = Column(String(50), nullable=True)
    carga_familiar = Column(Integer, nullable=True)
    situacion_economica = Column(String(50), nullable=True)   # Baja/Media/Alta

    # ── Perfil Académico ───────────────────────────────────────────────────
    modalidad_ingreso = Column(String(50), nullable=True)     # Primera vez/Reingreso/Traslado
    nivel_educativo = Column(String(50), nullable=True)

    # ── Perfil de Emprendimiento ───────────────────────────────────────────
    tiene_negocio = Column(String(2), nullable=True)          # Sí/No
    rubro_emprendimiento = Column(String(100), nullable=True)
    objetivo_termino = Column(String(100), nullable=True)
    capital_inicial = Column(String(50), nullable=True)       # rango en texto
    anios_experiencia = Column(String(30), nullable=True)

    # ── Meta ───────────────────────────────────────────────────────────────
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    calificaciones = relationship("Calificacion", back_populates="estudiante", cascade="all, delete-orphan")


class Indicador(Base):
    __tablename__ = "indicadores"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True)
    modulo = Column(String(200), nullable=True)
    unidad_didactica = Column(String(200), nullable=True)
    unidad_competencia = Column(Text, nullable=True)
    capacidad = Column(Text, nullable=True)
    clase_titulo = Column(String(200), nullable=False)
    clase_numero = Column(Integer, nullable=True)
    modalidad = Column(String(100), nullable=True)
    tipo = Column(String(1), nullable=False)
    tipo_nombre = Column(String(30), nullable=False)
    descripcion = Column(Text, nullable=False)
    codigo_corto = Column(String(30), unique=True, index=True)

    calificaciones = relationship("Calificacion", back_populates="indicador")


class Calificacion(Base):
    __tablename__ = "calificaciones"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"), nullable=False)
    indicador_id = Column(Integer, ForeignKey("indicadores.id"), nullable=False)
    nota = Column(Float, nullable=True)
    observacion = Column(Text, nullable=True)
    fecha_evaluacion = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    estudiante = relationship("Estudiante", back_populates="calificaciones")
    indicador = relationship("Indicador", back_populates="calificaciones")