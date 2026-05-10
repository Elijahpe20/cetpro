import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Students from "./pages/Students";
import GradeEntry from "./pages/GradeEntry";
import Dashboard from "./pages/Dashboard";

// 0 = Intro   1 = Bienvenida   2 = App principal

const nav = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/estudiantes", label: "Estudiantes", icon: "👥" },
  { to: "/calificaciones", label: "Calificaciones", icon: "📝" },
];

// ── Intro ──────────────────────────────────────────────────────────────────
function Intro({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="intro-screen">
      <div className="intro-content">
        <div className="intro-logo">SUKEI</div>
        <div className="intro-tagline">Sistema de Inteligencia Educativa</div>
        <div className="intro-bar"><div className="intro-bar-fill" /></div>
      </div>
    </div>
  );
}

// ── Bienvenida ─────────────────────────────────────────────────────────────
function Welcome({ onEnter }) {
  return (
    <div className="welcome-screen">
      {/* Columna izquierda: título */}
      <div className="welcome-left">
        <div className="welcome-year-badge">2026</div>
        <h1 className="welcome-title">
          Sistema de<br />Inteligencia<br />Educativa
        </h1>
      </div>

      {/* Columna derecha: foto + nav + marca */}
      <div className="welcome-right">
        <div className="welcome-avatar-wrap">
          <img
            src="/assets/foto_perfil.jpg"
            alt="Susana Roque"
            className="welcome-avatar"
            onError={e => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="welcome-avatar-fallback" style={{ display: "none" }}>SR</div>
        </div>

        <div className="welcome-nav">
          {nav.map((n) => (
            <button key={n.to} className="welcome-btn" onClick={() => onEnter(n.to)}>
              <span className="welcome-btn-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        <div className="welcome-brand">
          <span className="welcome-brand-name">SUKEI</span>
          <span className="welcome-brand-sub">by Susana Roque</span>
        </div>
      </div>
    </div>
  );
}

// ── App principal ──────────────────────────────────────────────────────────
function MainApp({ initialPath }) {
  return (
    <BrowserRouter>
      <InitialNavigator path={initialPath} />
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="sidebar-title">
              Sistema de<br />Inteligencia<br />Educativa<br />2026
            </span>
          </div>

          <nav className="sidebar-nav">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " sidebar-link--active" : ""}`
                }
              >
                <span>{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <span className="sidebar-brand-mark">SUKEI</span>
            <span className="sidebar-brand-sub-small">by Susana Roque</span>
            <span className="sidebar-version">Fase 1 · v1.0.0</span>
          </div>
        </aside>

        <main className="main-content">
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

function InitialNavigator({ path }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done && path !== "/") {
      window.history.replaceState(null, "", path);
      setDone(true);
    }
  }, [path, done]);
  return null;
}

export default function App() {
  const [phase, setPhase] = useState(0);
  const [startPath, setStartPath] = useState("/");

  const handleEnter = (path) => {
    setStartPath(path);
    setPhase(2);
  };

  if (phase === 0) return <Intro onDone={() => setPhase(1)} />;
  if (phase === 1) return <Welcome onEnter={handleEnter} />;
  return <MainApp initialPath={startPath} />;
}
