import {
  BadgeCheck,
  FileCheck,
  FileText,
  Files,
  Mail,
  UserRoundCheck
} from "lucide-react";

import "./Header.css";

const PFAS_METRIC = {
  key: "pfasFiled",
  label: "Filed Cases",
  icon: Files
};

const SMA_METRICS = [
  { key: "smaFiled", label: "Filed Cases", icon: FileText },
  { key: "smaCaseAssignmentToYgr", label: "Case Assignment to YGR", icon: UserRoundCheck },
  { key: "smaFiledSummons", label: "Filed Summons", icon: FileCheck },
  { key: "smaConfirmationIssued", label: "Confirmation Issued", icon: BadgeCheck },
  { key: "smaEmailSummons", label: "Email Summons to Defendant Group", icon: Mail }
];

const countFormatter = new Intl.NumberFormat("en-US");

function StatCard({ metric, value, unavailable }) {
  const Icon = metric.icon;
  const count = value ?? 0;

  return (
    <div className="header-stat-card">
      <span className="header-stat-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <dl className="header-stat-details">
        <dt className="header-stat-label">{metric.label}</dt>
        <dd className="header-stat-value">
          {unavailable ? (
            <>
              <span aria-hidden="true">{"\u2014"}</span>
              <span className="header-stat-status">{unavailable}</span>
            </>
          ) : typeof count === "number" ? (
            countFormatter.format(count)
          ) : (
            count
          )}
        </dd>
      </dl>
    </div>
  );
}

function Header({ summary, loading, error }) {
  const unavailable = loading ? "Loading" : error ? "Unavailable" : "";
  const connectionState = loading ? "loading" : error ? "error" : "connected";

  return (
    <header className="app-header">
      <div className="header-intro">
        <div>
          <h1 tabIndex={-1}>PACER Tracker</h1>
          <p>Monitor PFAS and SMA case filings, summons, and Dropbox uploads.</p>
        </div>
      </div>

      <div className="header-stats" aria-busy={loading}>
        <section
          className="header-stat-group header-stat-group-pfas"
          aria-labelledby="header-pfas-title"
        >
          <h2 className="header-stat-heading" id="header-pfas-title">PFAS</h2>
          <StatCard
            metric={PFAS_METRIC}
            value={summary?.[PFAS_METRIC.key]}
            unavailable={unavailable}
          />
        </section>

        <section className="header-stat-group" aria-labelledby="header-sma-title">
          <h2 className="header-stat-heading" id="header-sma-title">SMA Case Summary</h2>
          <div className="header-stat-grid">
            {SMA_METRICS.map((metric) => (
              <StatCard
                key={metric.key}
                metric={metric}
                value={summary?.[metric.key]}
                unavailable={unavailable}
              />
            ))}
          </div>
        </section>
      </div>
    </header>
  );
}

export default Header;
