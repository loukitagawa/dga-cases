import { ClipboardList, Files, House } from "lucide-react";
import logo from "../../assets/logo.jpg";
import "./Sidebar.css";

const PAGES = [
  { id: "home", label: "Home", icon: House },
  { id: "pfas", label: "PFAS", icon: Files },
  { id: "sma", label: "SMA", icon: ClipboardList }
];

function Sidebar({ page }) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="" width={46} height={46} />
        <span>David Grossman &amp; Associates</span>
      </div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {PAGES.map(({ id, label, icon: Icon }) => (
          <a key={id} href={`#${id}`} aria-current={page === id ? "page" : undefined}>
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
