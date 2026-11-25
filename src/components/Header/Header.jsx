import { useState } from "react";
import { BadgeCheck, ClipboardList, Droplet, History, Link2, Mail, TrendingUp, UsersRound } from "lucide-react";
import "./Header.css";

const numberFormat = new Intl.NumberFormat("en-US");
const SMA_STAGES = [
  ["Filed", "smaFiled"],
  ["Assigned", "smaCaseAssignmentToYgr"],
  ["Summons", "smaFiledSummons"],
  ["Confirmed", "smaConfirmationIssued"],
  ["Emailed", "smaEmailSummons"]
];
const PFAS_METRICS = [
  ["PACER filings", "pfasFiled"],
  ["Dropbox uploads", "pfasDropboxUploads"],
  ["Pending documents", "pfasPendingDocuments"]
];

function formatValue(value) {
  if (value == null || value === "") return "—";
  return typeof value === "number" ? numberFormat.format(value) : value;
}

function countValue(value) {
  if (value == null || value === "") return null;
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : null;
}

function CampaignCard({ title, description, value, icon: Icon }) {
  return (
    <article className="pacer-card campaign-card">
      <span className="campaign-icon"><Icon aria-hidden="true" /></span>
      <div className="campaign-name">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="campaign-count">
        <strong>{formatValue(value)}</strong>
        <span>filed cases</span>
      </div>
    </article>
  );
}

function PanelHeading({ title, icon: Icon, status, children }) {
  return (
    <div className="pacer-panel-heading">
      <h2><Icon aria-hidden="true" />{title}</h2>
      {status && <span className="campaign-status" data-status={status}>{status}</span>}
      {children}
    </div>
  );
}

function MetricRow({ label, value, icon: Icon, className }) {
  return (
    <div className="metric-row">
      <dt>
        {Icon ? <Icon className={className} aria-hidden="true" /> : <span aria-hidden="true" />}
        {label}
      </dt>
      <dd>{formatValue(value)}</dd>
    </div>
  );
}

function FilingChart({ summary }) {
  const filed = countValue(summary.smaFiled);
  const values = SMA_STAGES.map(([, key]) => countValue(summary[key]));
  const ceiling = Math.max(125, Math.ceil(Math.max(...values) / 125) * 125);
  const step = ceiling / 5;
  const ticks = Array.from({ length: 6 }, (_, index) => ceiling - index * step);

  return (
    <figure className="filing-chart">
      <figcaption>
        <h3><TrendingUp aria-hidden="true" /> Filing Overview</h3>
        <span>% of filed cases</span>
      </figcaption>
      <div className="chart-grid">
        <div className="chart-axis" aria-hidden="true">
          {ticks.map((tick) => <span key={tick}>{numberFormat.format(tick)}</span>)}
        </div>
        <ol className="chart-columns">
          {SMA_STAGES.map(([label], index) => {
            const value = values[index];
            const percent = filed > 0 && value !== null ? Math.round(value / filed * 100) : null;
            return (
              <li key={label} className="chart-column">
                <strong>{formatValue(value)}</strong>
                <div className="chart-track" aria-hidden="true" data-empty={!value}>
                  <div className="chart-bar" style={{ height: `${(value ?? 0) / ceiling * 100}%` }} />
                </div>
                <span>{label}</span>
                <small>{percent === null ? "—" : `${percent}%`}</small>
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}

function SmaPanel({ summary, status }) {
  return (
    <section className="pacer-card monitoring-panel">
      <PanelHeading title="Social Media Addiction" icon={UsersRound} status={status} />
      <dl className="primary-metrics">
        <div><dt>Filed cases</dt><dd>{formatValue(summary.smaFiled)}</dd></div>
        <div><dt>Assigned to YGR</dt><dd>{formatValue(summary.smaCaseAssignmentToYgr)}</dd></div>
        <div><dt>Summons filed</dt><dd>{formatValue(summary.smaFiledSummons)}</dd></div>
      </dl>
      <dl className="sma-metric-list">
        <MetricRow label="Confirmation issued" value={summary.smaConfirmationIssued} icon={BadgeCheck} className="metric-confirmed" />
        <MetricRow label="Email summons to defendant group" value={summary.smaEmailSummons} icon={Mail} />
      </dl>
      <FilingChart summary={summary} />
    </section>
  );
}

function PfasPanel({ summary, status }) {
  const filed = countValue(summary.pfasFiled);
  const total = countValue(summary.totalPfasRecords);
  const hasProgress = filed !== null && total !== null;
  const remaining = hasProgress ? Math.max(0, total - filed) : null;

  return (
    <section className="pacer-card monitoring-panel">
      <PanelHeading title="Water Complaints" icon={Droplet} status={status} />
      <div className="pfas-feature">
        <div className="pfas-feature-count">
          <strong>{formatValue(summary.pfasFiled)}</strong>
          <span>Filed cases</span>
        </div>
        <div className="pfas-progress">
          <div className="pfas-progress-label">
            <span>Filed of total PFAS records</span>
            <strong>{formatValue(filed)} / {formatValue(total)}</strong>
          </div>
          <progress aria-label="PFAS cases filed" max={Math.max(1, total ?? 0)} value={hasProgress ? filed : 0} />
          {remaining !== null && (
            <span className="pfas-progress-note">
              {remaining === 1 ? "1 record" : `${formatValue(remaining)} records`} not yet filed
            </span>
          )}
        </div>
      </div>
      <section className="pfas-metrics">
        <h3><ClipboardList aria-hidden="true" /> Key Metrics</h3>
        <dl>
          {PFAS_METRICS.map(([label, key]) => <MetricRow key={key} label={label} value={summary[key]} />)}
          <MetricRow label="Not filled" value={remaining} />
        </dl>
      </section>
    </section>
  );
}

export function RecentActivity({ activities, pageSize, loading, error }) {
  const [firstRecord, setFirstRecord] = useState(0);
  const records = Array.isArray(activities) ? activities : [];
  const limit = pageSize ?? 3;
  const pageCount = Math.max(1, Math.ceil(records.length / limit));
  const page = Math.min(Math.floor(firstRecord / limit), pageCount - 1);
  const shownRecords = records.slice(page * limit, (page + 1) * limit);

  return (
    <section className="pacer-card recent-activity">
      <PanelHeading title={pageSize ? "Team activity" : "Recent Team Activity"} icon={History}>
        {!pageSize && <a className="view-all-link" href="#activity">View all</a>}
      </PanelHeading>
      {shownRecords.length > 0 ? (
        <ul className="activity-list">
          {shownRecords.map(({ id, date, description, user }, index) => (
            <li key={id ?? page * limit + index}>
              <span>{date}</span>
              <span>{description}</span>
              <span>{user || "—"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="activity-empty">
          <strong>{loading ? "Loading activity…" : error ? "Activity unavailable" : "No team activity yet"}</strong>
          {!loading && !error && <p>Uploads, filings and status changes from your team will appear here.</p>}
        </div>
      )}
      {pageSize && pageCount > 1 && (
        <nav className="table-pagination field-pagination" aria-label="Activity pagination">
          <button type="button" disabled={page === 0} onClick={() => setFirstRecord((page - 1) * limit)}>Previous</button>
          <span aria-live="polite">Page {page + 1} of {pageCount}</span>
          <button type="button" disabled={page === pageCount - 1} onClick={() => setFirstRecord((page + 1) * limit)}>Next</button>
        </nav>
      )}
    </section>
  );
}

function DropboxIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <path d="M12 3 24 11 12 19 0 11ZM36 3 48 11 36 19 24 11ZM12 20 24 28 12 36 0 28ZM36 20 48 28 36 36 24 28ZM12 38 24 30 36 38 24 46Z" />
    </svg>
  );
}

function QuickLinks({ links }) {
  const dropbox = links?.dropbox;
  return (
    <section className="pacer-card quick-links">
      <PanelHeading title="Quick Links" icon={Link2} />
      <div className="quick-link-list">
        <a href="#sma"><UsersRound aria-hidden="true" /> <strong>SMA dashboard</strong><small>Open tracker</small></a>
        <a href="#pfas"><Droplet aria-hidden="true" /> <strong>PFAS dashboard</strong><small>Open tracker</small></a>
        {dropbox ? (
          <a href={dropbox} target="_blank" rel="noopener noreferrer">
            <DropboxIcon /> <strong>Dropbox</strong><small>Filing documents</small>
          </a>
        ) : (
          <div className="quick-link-disabled"><DropboxIcon /> <strong>Dropbox</strong><small>Not connected</small></div>
        )}
      </div>
    </section>
  );
}

export default function Header({ summary, loading, error, activities, links }) {
  const values = loading || error ? {} : summary ?? {};
  const status = loading ? "Loading" : error ? "Unavailable" : "Active";

  return (
    <div className="pacer-home" aria-busy={loading}>
      <header className="pacer-card header-intro">
        <h1 tabIndex={-1}>PACER <span>Tracker</span></h1>
        <p>Case Filing and Document Monitoring</p>
      </header>
      <div className="campaign-grid">
        <CampaignCard title="SMA" description="Social Media Addiction" value={values.smaFiled} icon={UsersRound} />
        <CampaignCard title="PFAS" description="Water Complaints" value={values.pfasFiled} icon={Droplet} />
      </div>
      <div className="monitoring-grid">
        <SmaPanel summary={values} status={status} />
        <PfasPanel summary={values} status={status} />
      </div>
      <div className="bottom-grid">
        <RecentActivity activities={activities} loading={loading} error={error} />
        <QuickLinks links={links} />
      </div>
    </div>
  );
}
