from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum
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
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    # Perfil del Estudiante
    edad = Column(Integer, nullable=True)
    sexo = Column(String(20), nullable=True)
    distrito_residencia = Column(String(100), nullable=True)
    estado_civil = Column(String(50), nullable=True)
    carga_familiar = Column(Integer, nullable=True)          # número de dependientes
    situacion_economica = Column(String(50), nullable=True)  # baja/media/alta
    # Perfil de Emprendimiento
    tipo_negocio = Column(String(100), nullable=True)
    actividad_comercial = Column(String(100), nullable=True)
    inversion = Column(Float, nullable=True)
    # Rendimiento Académico y Seguimiento
    experiencia_previa = Column(String(200), nullable=True)
    horas_unidad = Column(Float, nullable=True)
    # Meta
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    calificaciones = relationship("Calificacion", back_populates="estudiante", cascade="all, delete-orphan")


class Indicador(Base):
    __tablename__ = "indicadores"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True)      # IND-001
    modulo = Column(String(200), nullable=True)
    unidad_didactica = Column(String(200), nullable=True)
    unidad_competencia = Column(Text, nullable=True)
    capacidad = Column(Text, nullable=True)
    clase_titulo = Column(String(200), nullable=False)
    clase_numero = Column(Integer, nullable=True)              # número de clase dentro del módulo
    modalidad = Column(String(100), nullable=True)
    tipo = Column(String(1), nullable=False)                  # C / P / A
    tipo_nombre = Column(String(30), nullable=False)
    descripcion = Column(Text, nullable=False)
    codigo_corto = Column(String(30), unique=True, index=True)

    calificaciones = relationship("Calificacion", back_populates="indicador")


class Calificacion(Base):
    __tablename__ = "calificaciones"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"), nullable=False)
    indicador_id = Column(Integer, ForeignKey("indicadores.id"), nullable=False)
    nota = Column(Float, nullable=True)                       # 0-20, None = no evaluado
    observacion = Column(Text, nullable=True)
    fecha_evaluacion = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    estudiante = relationship("Estudiante", back_populates="calificaciones")
    indicador = relationship("Indicador", back_populates="calificaciones")
