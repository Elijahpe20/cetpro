import { useState, useEffect } from "react";
import { estudiantesAPI } from "../api/client";

const EMPTY = {
  nombre: "", apellido: "", dni: "", fecha_nacimiento: "", sexo: "",
  telefono: "", distrito_residencia: "", estado_civil: "",
  carga_familiar: "", situacion_economica: "",
  modalidad_ingreso: "", nivel_educativo: "",
  tiene_negocio: "", rubro_emprendimiento: "", objetivo_termino: "",
  capital_inicial: "", anios_experiencia: "",
};

const SEXOS = ["Femenino", "Masculino", "Otro"];
const ESTADOS = ["Soltero/a", "Casado/a", "Conviviente", "Divorciado/a", "Viudo/a"];
const SITUACIONES = [
  "Ingresos menores a S/. 1,000",
  "Ingresos entre S/. 1,000 - 2,000",
  "Ingresos entre S/. 2,001 - 4,000",
  "Ingresos mayores a S/. 4,000",
  "Prefiero no indicar",
];
const DISTRITOS = [
  "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo",
  "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia",
  "Jesús María", "La Molina", "La Victoria", "Lima (Cercado)", "Lince",
  "Los Olivos", "Lurigancho", "Lurín", "Magdalena del Mar", "Miraflores",
  "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa",
  "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro",
  "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis",
  "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar",
  "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador",
  "Villa María del Triunfo",
  // Callao
  "Callao", "Bellavista", "Carmen de La Legua", "La Perla", "La Punta",
  "Mi Perú", "Ventanilla",
];
const MODALIDADES = ["Primera vez", "Reingreso", "Traslado"];
const NIVELES = ["Primaria", "Secundaria incompleta", "Secundaria completa", "Superior"];
const TIENE_NEGOCIO = ["Sí", "No"];
const RUBROS = [
  "Confección de ropa en general",
  "Disfraces y vestimenta especial",
  "Uniformes escolares / corporativos",
  "Bordados y acabados",
  "Venta de telas e insumos",
  "Comercio de ropa (reventa)",
  "Aún no definido",
];
const OBJETIVOS = [
  "Crear mi propio negocio",
  "Fortalecer negocio existente",
  "Conseguir empleo dependiente",
  "Mejorar mis habilidades personales",
];
const CAPITALES = [
  "Sin capital",
  "S/. 500 - 1,000",
  "S/. 1,001 - 3,000",
  "S/. 3,001 - 5,000",
  "S/. 5,001 - 10,000",
  "S/. 10,001 - 20,000",
  "Más de S/. 20,000",
];
const EXPERIENCIA = [
  "Sin experiencia",
  "1 - 2 años",
  "3 - 5 años",
  "Más de 5 años",
];

export default function Students() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await estudiantesAPI.listar();
      setEstudiantes(data);
    } finally { setLoading(false); }
  };

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (e) => {
    setForm({ ...EMPTY, ...e, carga_familiar: e.carga_familiar ?? "" });
    setEditId(e.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = { ...form };
    payload.carga_familiar = payload.carga_familiar !== "" ? parseInt(payload.carga_familiar) : null;
    if (editId) {
      await estudiantesAPI.actualizar(editId, payload);
    } else {
      await estudiantesAPI.crear(payload);
    }
    setShowForm(false);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta estudiante y todas sus calificaciones?")) return;
    await estudiantesAPI.eliminar(id);
    fetchAll();
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const filtered = estudiantes.filter(e =>
    `${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Estudiantes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{estudiantes.length} registradas</p>
        </div>
        <button onClick={openNew}
          className="bg-teal-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
          + Nueva
        </button>
      </div>

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre o apellido…"
        className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      {/* Table — scroll horizontal en tablet */}
      {loading ? (
        <p className="text-slate-400 text-sm">Cargando…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                {["Apellido", "Nombre", "DNI", "Distrito", "Sit. Económica", "Negocio", "Rubro", "Acciones"].map(h => (
                  <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-3 font-medium text-slate-800 whitespace-nowrap">{e.apellido}</td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{e.nombre}</td>
                  <td className="px-3 py-3 text-slate-500">{e.dni ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{e.distrito_residencia ?? "—"}</td>
                  <td className="px-3 py-3">
                    {e.situacion_economica && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 whitespace-nowrap">
                        {e.situacion_economica}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {e.tiene_negocio && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        e.tiene_negocio === "Sí" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                      }`}>{e.tiene_negocio}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-slate-500 max-w-[160px] truncate">{e.rubro_emprendimiento ?? "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(e)} className="text-teal-600 hover:underline text-xs">Editar</button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No hay estudiantes registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            {/* Header sticky */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-slate-800">{editId ? "Editar estudiante" : "Nueva estudiante"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-6">

              {/* ── Perfil Básico ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">👤</span>
                  <h4 className="text-xs font-bold text-teal-700 uppercase tracking-widest">Perfil Básico</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Nombre *" value={form.nombre} onChange={v => set("nombre", v)} />
                  <Field label="Apellido *" value={form.apellido} onChange={v => set("apellido", v)} />
                  <Field label="DNI" value={form.dni} onChange={v => set("dni", v)} maxLength={8} />
                  <Field label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={v => set("fecha_nacimiento", v)} />
                  <SelectField label="Sexo" value={form.sexo} options={SEXOS} onChange={v => set("sexo", v)} />
                  <Field label="Teléfono" value={form.telefono} onChange={v => set("telefono", v)} />
                  <SelectField label="Distrito de residencia" value={form.distrito_residencia} options={DISTRITOS} onChange={v => set("distrito_residencia", v)} />
                  <SelectField label="Estado civil" value={form.estado_civil} options={ESTADOS} onChange={v => set("estado_civil", v)} />
                  <Field label="Carga familiar (N° dependientes)" type="number" value={form.carga_familiar} onChange={v => set("carga_familiar", v)} />
                  <SelectField label="Situación económica" value={form.situacion_economica} options={SITUACIONES} onChange={v => set("situacion_economica", v)} />
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* ── Perfil Académico ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🎓</span>
                  <h4 className="text-xs font-bold text-teal-700 uppercase tracking-widest">Perfil Académico</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SelectField label="Modalidad de ingreso" value={form.modalidad_ingreso} options={MODALIDADES} onChange={v => set("modalidad_ingreso", v)} />
                  <SelectField label="Nivel educativo" value={form.nivel_educativo} options={NIVELES} onChange={v => set("nivel_educativo", v)} />
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* ── Perfil de Emprendimiento ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">💼</span>
                  <h4 className="text-xs font-bold text-teal-700 uppercase tracking-widest">Perfil de Emprendimiento</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SelectField label="¿Tiene negocio activo?" value={form.tiene_negocio} options={TIENE_NEGOCIO} onChange={v => set("tiene_negocio", v)} />
                  <SelectField label="Rubro de emprendimiento" value={form.rubro_emprendimiento} options={RUBROS} onChange={v => set("rubro_emprendimiento", v)} />
                  <SelectField label="Objetivo al terminar el curso" value={form.objetivo_termino} options={OBJETIVOS} onChange={v => set("objetivo_termino", v)} />
                  <SelectField label="Capital inicial" value={form.capital_inicial} options={CAPITALES} onChange={v => set("capital_inicial", v)} />
                  <SelectField label="Años de experiencia en el rubro" value={form.anios_experiencia} options={EXPERIENCIA} onChange={v => set("anios_experiencia", v)} />
                </div>
              </section>

            </div>

            {/* Footer sticky */}
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!form.nombre || !form.apellido}
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-40 transition">
                {editId ? "Guardar cambios" : "Crear estudiante"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", maxLength }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">
        <option value="">— Seleccionar —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
