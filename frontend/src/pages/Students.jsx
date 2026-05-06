import { useState, useEffect } from "react";
import { estudiantesAPI } from "../api/client";

const EMPTY = {
  nombre: "", apellido: "", edad: "", sexo: "", distrito_residencia: "",
  estado_civil: "", carga_familiar: "", situacion_economica: "",
  tipo_negocio: "", actividad_comercial: "", inversion: "",
  experiencia_previa: "", horas_unidad: "",
};

const SEXOS = ["Femenino", "Masculino", "Otro"];
const ESTADOS = ["Soltero/a", "Casado/a", "Conviviente", "Divorciado/a", "Viudo/a"];
const SITUACIONES = ["Baja", "Media", "Alta"];

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
    setForm({ ...e, edad: e.edad ?? "", carga_familiar: e.carga_familiar ?? "", inversion: e.inversion ?? "", horas_unidad: e.horas_unidad ?? "" });
    setEditId(e.id); setShowForm(true);
  };

  const handleSave = async () => {
    const payload = { ...form };
    ["edad","carga_familiar"].forEach(k => { payload[k] = payload[k] !== "" ? parseInt(payload[k]) : null; });
    ["inversion","horas_unidad"].forEach(k => { payload[k] = payload[k] !== "" ? parseFloat(payload[k]) : null; });
    if (editId) {
      await estudiantesAPI.actualizar(editId, payload);
    } else {
      await estudiantesAPI.crear(payload);
    }
    setShowForm(false); fetchAll();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este estudiante y todas sus calificaciones?")) return;
    await estudiantesAPI.eliminar(id);
    fetchAll();
  };

  const filtered = estudiantes.filter(e =>
    `${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Estudiantes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{estudiantes.length} registrados</p>
        </div>
        <button onClick={openNew} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition">
          + Nuevo estudiante
        </button>
      </div>

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre o apellido…"
        className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      {/* Table */}
      {loading ? (
        <p className="text-slate-400 text-sm">Cargando…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                {["Apellido","Nombre","Edad","Sexo","Distrito","Sit. Económica","Negocio","Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{e.apellido}</td>
                  <td className="px-4 py-3 text-slate-600">{e.nombre}</td>
                  <td className="px-4 py-3 text-slate-500">{e.edad ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{e.sexo ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{e.distrito_residencia ?? "—"}</td>
                  <td className="px-4 py-3">
                    {e.situacion_economica && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        e.situacion_economica === "Alta" ? "bg-green-100 text-green-700" :
                        e.situacion_economica === "Media" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{e.situacion_economica}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{e.tipo_negocio ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(e)} className="text-teal-600 hover:underline text-xs">Editar</button>
                      <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No hay estudiantes registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">{editId ? "Editar estudiante" : "Nuevo estudiante"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Datos básicos */}
              <section>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos básicos</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre *" value={form.nombre} onChange={v => setForm({...form, nombre:v})} />
                  <Field label="Apellido *" value={form.apellido} onChange={v => setForm({...form, apellido:v})} />
                  <Field label="Edad" type="number" value={form.edad} onChange={v => setForm({...form, edad:v})} />
                  <SelectField label="Sexo" value={form.sexo} options={SEXOS} onChange={v => setForm({...form, sexo:v})} />
                  <Field label="Distrito de residencia" value={form.distrito_residencia} onChange={v => setForm({...form, distrito_residencia:v})} />
                  <SelectField label="Estado civil" value={form.estado_civil} options={ESTADOS} onChange={v => setForm({...form, estado_civil:v})} />
                  <Field label="Carga familiar (N° dependientes)" type="number" value={form.carga_familiar} onChange={v => setForm({...form, carga_familiar:v})} />
                  <SelectField label="Situación económica" value={form.situacion_economica} options={SITUACIONES} onChange={v => setForm({...form, situacion_economica:v})} />
                </div>
              </section>
              {/* Emprendimiento */}
              <section>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Perfil de emprendimiento</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo de negocio" value={form.tipo_negocio} onChange={v => setForm({...form, tipo_negocio:v})} />
                  <Field label="Actividad comercial" value={form.actividad_comercial} onChange={v => setForm({...form, actividad_comercial:v})} />
                  <Field label="Inversión (S/.)" type="number" value={form.inversion} onChange={v => setForm({...form, inversion:v})} />
                </div>
              </section>
              {/* Académico */}
              <section>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Rendimiento y seguimiento</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Experiencia previa" value={form.experiencia_previa} onChange={v => setForm({...form, experiencia_previa:v})} />
                  <Field label="Horas de unidad" type="number" value={form.horas_unidad} onChange={v => setForm({...form, horas_unidad:v})} />
                </div>
              </section>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} disabled={!form.nombre || !form.apellido}
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-40">
                {editId ? "Guardar cambios" : "Crear estudiante"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
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
