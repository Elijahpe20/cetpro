import { useState, useEffect } from "react";
import { estudiantesAPI, calificacionesAPI, indicadoresAPI } from "../api/client";

const TIPO_COLOR = {
  C: "bg-blue-100 text-blue-700",
  P: "bg-emerald-100 text-emerald-700",
  A: "bg-violet-100 text-violet-700",
};
const TIPO_LABEL = { C: "Conceptual", P: "Procedimental", A: "Actitudinal" };

function notaColor(nota) {
  if (nota === null || nota === undefined) return "bg-slate-100 text-slate-400";
  if (nota >= 18) return "bg-green-100 text-green-700";
  if (nota >= 14) return "bg-teal-100 text-teal-700";
  if (nota >= 11) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export default function GradeEntry() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [clases, setClases] = useState([]);
  const [selectedEst, setSelectedEst] = useState(null);
  const [selectedClase, setSelectedClase] = useState(null);
  const [grilla, setGrilla] = useState([]);
  const [localNotas, setLocalNotas] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    estudiantesAPI.listar().then(r => setEstudiantes(r.data));
    indicadoresAPI.clases().then(r => setClases(r.data));
  }, []);

  useEffect(() => {
    if (selectedEst) {
      calificacionesAPI.grilla(selectedEst).then(r => {
        setGrilla(r.data);
        const init = {};
        r.data.forEach(item => { init[item.indicador_id] = item.nota ?? ""; });
        setLocalNotas(init);
      });
    }
  }, [selectedEst]);

  // Filter grilla by selected clase
  const grillaFiltrada = selectedClase
    ? grilla.filter(g => {
        const clase = clases.find(c => c.clase_numero === selectedClase);
        return clase && g.clase_titulo === clase.clase_titulo;
      })
    : grilla;

  // Group by clase
  const grouped = grillaFiltrada.reduce((acc, item) => {
    if (!acc[item.clase_titulo]) acc[item.clase_titulo] = [];
    acc[item.clase_titulo].push(item);
    return acc;
  }, {});

  const handleNota = (indId, val) => {
    if (val === "") { setLocalNotas(p => ({...p, [indId]: ""})); return; }
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0 && n <= 20) setLocalNotas(p => ({...p, [indId]: n}));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const calificaciones = Object.entries(localNotas).map(([indId, nota]) => ({
        indicador_id: parseInt(indId),
        nota: nota === "" ? null : parseFloat(nota),
      }));
      await calificacionesAPI.guardarBulk({ estudiante_id: selectedEst, calificaciones });
      setSavedMsg("✅ Guardado");
      setTimeout(() => setSavedMsg(""), 2500);
    } finally { setSaving(false); }
  };

  const promedioLocal = () => {
    const vals = Object.values(localNotas).filter(v => v !== "" && v !== null);
    if (!vals.length) return null;
    return (vals.reduce((s, v) => s + parseFloat(v), 0) / vals.length).toFixed(1);
  };

  const est = estudiantes.find(e => e.id === selectedEst);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Registro de Calificaciones</h2>
        <p className="text-slate-500 text-sm mt-0.5">Selecciona estudiante y clase para ingresar notas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-52">
          <label className="block text-xs text-slate-500 mb-1">Estudiante</label>
          <select value={selectedEst ?? ""} onChange={e => { setSelectedEst(parseInt(e.target.value) || null); setSelectedClase(null); }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400">
            <option value="">— Seleccionar —</option>
            {estudiantes.map(e => <option key={e.id} value={e.id}>{e.apellido}, {e.nombre}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-52">
          <label className="block text-xs text-slate-500 mb-1">Filtrar por clase</label>
          <select value={selectedClase ?? ""} onChange={e => setSelectedClase(parseInt(e.target.value) || null)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400">
            <option value="">Todas las clases</option>
            {clases.map(c => <option key={c.clase_numero} value={c.clase_numero}>Clase {c.clase_numero} — {c.clase_titulo}</option>)}
          </select>
        </div>
        {selectedEst && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Promedio actual</p>
              <p className={`text-2xl font-bold ${parseFloat(promedioLocal()) >= 14 ? "text-teal-600" : "text-red-500"}`}>
                {promedioLocal() ?? "—"}
              </p>
            </div>
            <button onClick={handleGuardar} disabled={saving}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition">
              {saving ? "Guardando…" : "Guardar"}
            </button>
            {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
          </div>
        )}
      </div>

      {/* Grilla */}
      {!selectedEst ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-3">👩‍🎓</p>
          <p>Selecciona un estudiante para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([claseT, items]) => (
            <div key={claseT} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-800 px-4 py-2.5 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">{claseT}</h3>
                <span className="text-xs text-slate-400">{items.filter(i => localNotas[i.indicador_id] !== "").length}/{items.length} evaluados</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2 text-left w-24">Código</th>
                    <th className="px-4 py-2 text-left w-20">Tipo</th>
                    <th className="px-4 py-2 text-left">Indicador</th>
                    <th className="px-4 py-2 text-center w-28">Nota (0–20)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map(item => (
                    <tr key={item.indicador_id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{item.codigo_corto}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLOR[item.tipo]}`}>
                          {TIPO_LABEL[item.tipo]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 leading-snug">{item.descripcion}</td>
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="number" min="0" max="20" step="0.5"
                          value={localNotas[item.indicador_id] ?? ""}
                          onChange={e => handleNota(item.indicador_id, e.target.value)}
                          className={`w-16 text-center border rounded-lg px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 ${notaColor(localNotas[item.indicador_id] === "" ? null : localNotas[item.indicador_id])}`}
                          placeholder="—"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
