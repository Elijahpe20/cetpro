import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Students from "./pages/Students";
import GradeEntry from "./pages/GradeEntry";
import Dashboard from "./pages/Dashboard";

const nav = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/estudiantes", label: "Estudiantes", icon: "👥" },
  { to: "/calificaciones", label: "Calificaciones", icon: "📝" },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="px-6 py-5 border-b border-slate-700">
            <h1 className="text-lg font-bold text-teal-400 leading-tight">CETPRO</h1>
            <p className="text-xs text-slate-400 mt-0.5">Sistema de Inteligencia Educativa</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-teal-600 text-white font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <span>{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-6 py-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">Fase 1 · v1.0.0</p>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estudiantes" element={<Students />} />
            <Route path="/calificaciones" element={<GradeEntry />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
