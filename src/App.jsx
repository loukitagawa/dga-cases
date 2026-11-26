import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Header, { RecentActivity } from "./components/Header/Header";
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
  return hash === "pfas" || hash === "sma" || hash === "activity" ? hash : "home";
}

function App() {
  const { data, loading, error } = usePacerData();
  const page = useSyncExternalStore(subscribeToPage, getPage);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const previousPage = useRef(page);
  const title = page === "home" ? "PACER Tracker" : page === "activity" ? "Activity Logs" : page.toUpperCase();

  const fitPage = useCallback(() => {
    const frame = viewportRef.current;
    const content = contentRef.current;
    const { clientWidth: width, clientHeight: height } = frame;
    content.style.removeProperty("--page-fit-width");
    content.style.removeProperty("--page-fit-height");

    const naturalWidth = content.scrollWidth;
    const scale = Math.min(1, width / Math.max(1, naturalWidth), height / Math.max(1, content.scrollHeight));
    // Make room horizontally before scaling a home dashboard that's too tall.
    const canWiden = ["home", "pfas", "sma"].includes(frame.parentElement.dataset.page) &&
      naturalWidth <= width;
    if (canWiden && scale > 0 && scale < 1) {
      content.style.setProperty("--page-fit-width", `${width / scale}px`);
      content.style.setProperty("--page-fit-height", `${height / scale}px`);
    }
    content.style.setProperty("--page-scale", scale);
    setViewport((previous) => previous.width === width && previous.height === height ? previous : { width, height });
  }, []);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(fitPage);
    observer.observe(viewportRef.current);
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [fitPage]);

  useLayoutEffect(fitPage, [fitPage, page, data, loading, error, viewport]);

  useEffect(() => {
    document.title = page === "home" ? "DGA PACER Tracker" : `${title} | DGA PACER Tracker`;

    if (previousPage.current !== page) {
      contentRef.current?.querySelector("h1")?.focus({ preventScroll: true });
      previousPage.current = page;
    }
  }, [page, title]);

  return (
    <div className="app-shell">
      <Sidebar page={page} />
      <main className="dashboard" data-page={page} aria-label={title}>
        <div className="dashboard-viewport" ref={viewportRef}>
          <div className="dashboard-page" ref={contentRef}>
            {page === "home" && (
              <Header summary={data.summary} loading={loading} error={error} />
            )}
            {error && <div className="api-error" role="alert">{error}</div>}
            {page === "pfas" && <PfasTable records={data.pfas} loading={loading} error={error} viewport={viewport} />}
            {page === "sma" && <SmaTable records={data.sma} loading={loading} error={error} viewport={viewport} />}
            {page === "activity" && (
              <div className="activity-page">
                <h1 tabIndex={-1}>Activity Logs</h1>
                <RecentActivity pageSize={Math.max(1, Math.floor((viewport.height - 145) / 50))} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
