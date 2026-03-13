import { useState } from "react";
import { MESSI_WP, CURRENT_LOGO, SPACEJUMP_LOGO, TICKING_LOGO, EVENTIFY_LOGO, RESUME_PDF } from "./assets";

const PROJECTS = [
  { name: "Current", logo: CURRENT_LOGO, url: "https://www.figma.com/proto/X2aLrgd5gJgeOqUe0Zev0g/Current-Mobile-Application?page-id=&node-id=1-2&p=f&viewport=-2275%2C-77%2C0.19&t=F5TYSki11zTSpKgF-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A2" },
  { name: "Space Jump", logo: SPACEJUMP_LOGO, url: "https://www.figma.com/proto/lzrqO3p3AxxkgrYxlnSuVO/Space-Jump-Game-UX-Case-study?page-id=0%3A1&node-id=1-2&viewport=347%2C134%2C0.02&t=vMeVJw7gFuThXKjO-1&scaling=min-zoom&content-scaling=fixed" },
  { name: "Ticking", logo: TICKING_LOGO, url: "https://www.figma.com/proto/XZ8kBuNApBlz6LXvmpZvaP/Ticking-Application-Case-study?page-id=0%3A1&node-id=1-2&starting-point-node-id=1%3A2&t=gKvZHegi4MRg5dX3-1" },
  { name: "Eventify", logo: EVENTIFY_LOGO, url: "https://www.figma.com/proto/vLXe2NKquLXGL0rg0BcE2E/Untitled?page-id=0%3A1&node-id=1-2&t=1NbFxGoCSnZCgCBF-1" },
];

type View = "desktop" | "projects" | "resume" | "casestudy";

export default function MonitorDesktop({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("desktop");
  const [caseStudyUrl, setCaseStudyUrl] = useState("");

  const openCaseStudy = (url: string) => {
    setCaseStudyUrl(url);
    setView("casestudy");
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div style={{
        width: "min(92vw, 1100px)",
        height: "min(88vh, 720px)",
        borderRadius: "12px",
        boxShadow: "0 0 80px rgba(0,180,255,0.2), 0 0 0 2px #222",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#000",
      }}>

        {/* Title bar */}
        <div style={{
          height: "32px",
          background: "rgba(20,20,20,0.98)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          borderBottom: "1px solid #2a2a2a",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {view !== "desktop" && (
              <button
                onClick={() => view === "casestudy" ? setView("projects") : setView("desktop")}
                style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "12px", padding: "2px 8px", borderRadius: 4 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#333")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                ← Back
              </button>
            )}
            <span style={{ color: "#555", fontSize: "11px", fontFamily: "Segoe UI, sans-serif" }}>
              {view === "desktop" && "Desktop"}
              {view === "projects" && "📁 Projects"}
              {view === "resume" && "📄 Resume — Sundar Ram"}
              {view === "casestudy" && "🎨 Case Study"}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f56", border: "none", cursor: "pointer", fontSize: 9, color: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#800")}
            onMouseLeave={e => (e.currentTarget.style.color = "transparent")}
          >✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

          {/* DESKTOP */}
          {view === "desktop" && (
            <div style={{
              width: "100%", height: "100%",
              backgroundImage: `url(${MESSI_WP})`,
              backgroundSize: "cover", backgroundPosition: "center top",
              position: "relative",
            }}>
              <div style={{ position: "absolute", top: 20, right: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                <DesktopIcon label="Projects" icon="📁" onClick={() => setView("projects")} />
                <DesktopIcon label="Resume" icon="📄" onClick={() => setView("resume")} />
              </div>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "38px",
                background: "rgba(8,8,8,0.88)", backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", padding: "0 14px", gap: 10,
                borderTop: "1px solid #2a2a2a",
              }}>
                <span style={{ fontSize: 16 }}>⊞</span>
                <div style={{
                  height: "24px", background: "rgba(255,255,255,0.07)", borderRadius: 3,
                  width: 180, display: "flex", alignItems: "center", padding: "0 8px",
                }}>
                  <span style={{ fontSize: 10, color: "#666", fontFamily: "Segoe UI, sans-serif" }}>🔍 Search</span>
                </div>
                <div style={{ marginLeft: "auto", color: "#666", fontSize: "10px", fontFamily: "Segoe UI, sans-serif" }}>
                  22:54 &nbsp; 13-03-2026
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {view === "projects" && (
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(135deg, #0d0d1a 0%, #111827 100%)",
              padding: "28px 36px", overflowY: "auto",
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, margin: 0, fontFamily: "Segoe UI, sans-serif" }}>
                  My Projects
                </h2>
                <p style={{ color: "#444", fontSize: "11px", margin: "4px 0 0", fontFamily: "Segoe UI, sans-serif" }}>
                  Click a folder to view case study
                </p>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "20px",
              }}>
                {PROJECTS.map(p => (
                  <ProjectFolder key={p.name} name={p.name} logo={p.logo} onClick={() => openCaseStudy(p.url)} />
                ))}
              </div>
            </div>
          )}

          {/* RESUME */}
          {view === "resume" && (
            <div style={{ width: "100%", height: "100%", background: "#1a1a1a" }}>
              <iframe
                src={`${RESUME_PDF}#view=FitH`}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Resume"
              />
            </div>
          )}

          {/* CASE STUDY */}
          {view === "casestudy" && (
            <div style={{ width: "100%", height: "100%", background: "#111" }}>
              <iframe
                src={caseStudyUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Case Study"
                allow="fullscreen"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DesktopIcon({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        cursor: "pointer", padding: "8px 12px", borderRadius: 6,
        background: hovered ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
        transition: "background 0.15s",
        minWidth: 70, userSelect: "none",
      }}
    >
      <span style={{ fontSize: "34px", lineHeight: 1 }}>{icon}</span>
      <span style={{
        color: "#fff", fontSize: "11px", textAlign: "center",
        textShadow: "0 1px 5px rgba(0,0,0,1)",
        fontFamily: "Segoe UI, sans-serif", fontWeight: 500,
      }}>{label}</span>
    </div>
  );
}

function ProjectFolder({ name, logo, onClick }: { name: string; logo: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        cursor: "pointer", padding: "18px 14px", borderRadius: 12,
        background: hovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)"}`,
        transition: "all 0.15s", userSelect: "none",
      }}
    >
      <div style={{
        width: 68, height: 68, borderRadius: 14, overflow: "hidden",
        background: "#1a1a1a",
        boxShadow: hovered ? "0 6px 24px rgba(100,150,255,0.35)" : "0 2px 10px rgba(0,0,0,0.6)",
        transition: "box-shadow 0.15s",
      }}>
        <img src={logo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <span style={{
        color: hovered ? "#fff" : "#bbb", fontSize: "12px", fontWeight: 500,
        textAlign: "center", fontFamily: "Segoe UI, sans-serif",
        transition: "color 0.15s",
      }}>{name}</span>
      <span style={{ color: "#444", fontSize: "10px", fontFamily: "Segoe UI, sans-serif" }}>View Case Study →</span>
    </div>
  );
}