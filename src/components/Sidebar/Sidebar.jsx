import { useEffect, useState } from "react";
import { ClipboardList, Droplet, House, Maximize, Minimize, PanelLeftClose, PanelLeftOpen, Scale, UsersRound } from "lucide-react";
import "./Sidebar.css";

const PAGES = [
  { id: "home", label: "Home", icon: House },
  { id: "sma", label: "SMA", icon: UsersRound },
  { id: "pfas", label: "PFAS", icon: Droplet },
  { id: "activity", label: "Activity logs", icon: ClipboardList }
];

export default function Sidebar({ page }) {
  const [minimized, setMinimized] = useState(true);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [fullscreenError, setFullscreenError] = useState("");
  const ToggleIcon = minimized ? PanelLeftOpen : PanelLeftClose;
  const toggleLabel = minimized ? "Expand sidebar" : "Minimize sidebar";
  const FullscreenIcon = fullscreen ? Minimize : Maximize;
  const fullscreenLabel = fullscreen ? "Exit full screen" : "Full screen";
  const fullscreenAvailable = document.fullscreenEnabled || fullscreen;

  useEffect(() => {
    function syncFullscreen() {
      setFullscreen(Boolean(document.fullscreenElement));
      setFullscreenError("");
    }

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  async function toggleFullscreen() {
    setFullscreenError("");
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setFullscreenError("Full screen is unavailable in this window.");
    }
  }

  return (
    <aside className="app-sidebar" aria-label="David Grossman & Associates" data-minimized={minimized}>
      <div className="sidebar-brand">
        <Scale aria-hidden="true" />
        <span>David Grossman &amp; Associates</span>
      </div>
      <nav id="sidebar-nav" className="sidebar-nav" aria-label="Main navigation">
        {PAGES.map(({ id, label, icon: Icon }) => (
          <a key={id} href={`#${id}`} aria-label={label} aria-current={page === id ? "page" : undefined} title={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-actions">
        {fullscreenAvailable && (
          <button type="button" className="sidebar-toggle fullscreen-toggle" aria-label={fullscreenLabel}
            title={fullscreenLabel} onClick={toggleFullscreen}>
            <FullscreenIcon aria-hidden="true" />
            <span>{fullscreenLabel}</span>
          </button>
        )}
        {fullscreenError && <p className="sidebar-status" role="status">{fullscreenError}</p>}
        <button
          type="button"
          className="sidebar-toggle sidebar-collapse"
          aria-label={toggleLabel}
          aria-expanded={!minimized}
          aria-controls="sidebar-nav"
          onClick={() => setMinimized(!minimized)}
          title={toggleLabel}
        >
          <ToggleIcon aria-hidden="true" />
          <span>{minimized ? "Expand" : "Minimize"}</span>
        </button>
      </div>
    </aside>
  );
}
