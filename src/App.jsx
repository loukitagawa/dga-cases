import { useEffect, useRef, useSyncExternalStore } from "react";
import Header from "./components/Header/Header";
import PfasTable from "./components/PfasTable/PfasTable";
import SmaTable from "./components/SmaTable/SmaTable";
import Sidebar from "./components/Sidebar/Sidebar";
import usePacerData from "./hooks/usePacerData";

import "./App.css";

function subscribeToPage(onChange) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getPage() {
  const hash = window.location.hash.slice(1);
  return hash === "pfas" || hash === "sma" ? hash : "home";
}

function App() {
  const { data, loading, error } = usePacerData();
  const page = useSyncExternalStore(subscribeToPage, getPage);
  const mainRef = useRef(null);
  const previousPage = useRef(page);
  const title = page === "home" ? "PACER Tracker" : page.toUpperCase();

  useEffect(() => {
    document.title = page === "home" ? "DGA PACER Tracker" : `${title} | DGA PACER Tracker`;

    if (previousPage.current !== page) {
      window.scrollTo(0, 0);
      mainRef.current?.querySelector("h1")?.focus({ preventScroll: true });
      previousPage.current = page;
    }
  }, [page, title]);

  return (
    <div className="app-shell">
      <Sidebar page={page} />
      <main className="dashboard" ref={mainRef} aria-label={title}>
        {page === "home" && (
          <Header
            summary={data.summary}
            lastUpdated={data.lastUpdated}
            loading={loading}
            error={error}
          />
        )}
        {error && (
          <div className="api-error" role="alert">
            {error}
          </div>
        )}
        {page === "pfas" && <PfasTable records={data.pfas} loading={loading} error={error} />}
        {page === "sma" && <SmaTable records={data.sma} loading={loading} error={error} />}
      </main>
    </div>
  );
}

export default App;
