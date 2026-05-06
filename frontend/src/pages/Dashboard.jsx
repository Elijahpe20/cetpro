import { useState, useEffect } from "react";
import { estudiantesAPI, calificacionesAPI } from "../api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Dashboard() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: ests } = await estudiantesAPI.listar();
        setEstudiantes(ests);
        const statsAll = await Promise.all(
          ests.map(e => estudiantesAPI.stats(e.id).then(r => r.data).catch(() => null))
        );
        setStats(statsAll.filter(Boolean));
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const promGlobal = stats.length
    ? stats.filter(s => s.promedio_general).reduce((sum, s) => sum + s.promedio_general, 0) / stats.filter(s => s.promedio_general).length
    : null;

  const chartData = stats
    .filter(s => s.promedio_general)
    .sort((a, b) => b.promedio_general - a.promedio_general)
    .map(s => ({ name: s.nombre_completo.split(" ")[0], prom: parseFloat(s.promedio_general.toFixed(1)) }));

  const totalEval = stats.reduce((sum, s) => sum + s.evaluados, 0);
  const totalInd = stats[0]?.total_indicadores ?? 336;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-0.5">Resumen general del aula</p>
      </div>

      {loading ? (
        <p className="text-slate-400">Cargando…</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Estudiantes", value: estudiantes.length, icon: "👥", color: "teal" },
              { label: "Promedio general", value: promGlobal ? promGlobal.toFixed(1) : "—", icon: "📊", color: "blue" },
              { label: "Evaluaciones ingresadas", value: totalEval.toLocaleString(), icon: "✅", color: "green" },
              { label: "Total indicadores", value: totalInd, icon: "📋", color: "purple" },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <p className="text-2xl mb-1">{k.icon}</p>
                <p className="text-2xl font-bold text-slate-800">{k.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Promedio por estudiante</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => [`${v}/20`, "Promedio"]} />
                  <Bar dataKey="prom" radius={[4,4,0,0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.prom >= 14 ? "#0d9488" : entry.prom >= 11 ? "#f59e0b" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Estado por estudiante</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  {["Estudiante","Promedio","Conceptual","Procedimental","Actitudinal","Evaluados/Total"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.map(s => (
                  <tr key={s.estudiante_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.nombre_completo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        !s.promedio_general ? "bg-slate-100 text-slate-400" :
                        s.promedio_general >= 14 ? "bg-green-100 text-green-700" :
                        s.promedio_general >= 11 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {s.promedio_general ? `${s.promedio_general}/20` : "Sin notas"}
                      </span>
                    </td>
                    {s.por_tipo.map(t => (
                      <td key={t.tipo} className="px-4 py-3 text-slate-500 text-xs">
                        {t.promedio ? `${t.promedio}` : "—"}
                        <span className="text-slate-300 ml-1">({t.evaluados}/{t.total})</span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
                          <div className="bg-teal-500 h-1.5 rounded-full" style={{width: `${(s.evaluados/s.total_indicadores)*100}%`}} />
                        </div>
                        {s.evaluados}/{s.total_indicadores}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
