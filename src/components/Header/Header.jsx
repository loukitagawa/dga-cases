import {
  BadgeCheck,
  FileCheck,
  FileText,
  Files,
  Mail,
  UserRoundCheck,
  UsersRound,
  Droplet,
  ClipboardList,
  Database,
  Activity
} from "lucide-react";

import "./Header.css";

const countFormatter = new Intl.NumberFormat("en-US");

const updateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const updateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short"
});

function formatCount(value, unavailable) {
  if (unavailable || value === null || value === undefined) {
    return "—";
  }

  return typeof value === "number"
    ? countFormatter.format(value)
    : value;
}

/* =========================================
   DECORATIVE SUMMARY GRAPH
========================================= */

function DecorativeBars() {
  const bars = [12, 19, 28, 38, 46, 57, 69, 83, 100];

  return (
    <div className="pacer-decorative-bars" aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          style={{
            "--bar-height": `${height}%`,
            "--bar-opacity": 0.2 + index * 0.1
          }}
        />
      ))}
    </div>
  );
}

/* =========================================
   CAMPAIGN SUMMARY CARD
========================================= */

function CampaignCard({
  title,
  description,
  value,
  icon: Icon,
  unavailable
}) {
  return (
    <article className="pacer-campaign-card">
      <div className="pacer-campaign-content">
        <div className="pacer-campaign-icon">
          <Icon size={38} strokeWidth={2.2} />
        </div>

        <div className="pacer-campaign-details">
          <h2>{title}</h2>

          <p className="pacer-campaign-description">
            {description}
          </p>

          <strong className="pacer-campaign-value">
            {formatCount(value, unavailable)}
          </strong>

          <span className="pacer-campaign-label">
            Filed Cases
          </span>
        </div>
      </div>

      <DecorativeBars />
    </article>
  );
}

/* =========================================
   CAMPAIGN STATUS
========================================= */

function CampaignStatus({ unavailable }) {
  return (
    <span
      className={`pacer-campaign-status ${
        unavailable ? "is-unavailable" : ""
      }`}
    >
      <span className="pacer-status-dot" />

      {unavailable || "Active"}
    </span>
  );
}

/* =========================================
   METRIC ROW
========================================= */

function MetricRow({
  icon: Icon,
  label,
  value,
  unavailable,
  success = false
}) {
  return (
    <div className="pacer-metric-row">
      <div className="pacer-metric-label">
        <span
          className={`pacer-metric-icon ${
            success ? "is-success" : ""
          }`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </span>

        <span>{label}</span>
      </div>

      <strong className="pacer-metric-value">
        {formatCount(value, unavailable)}
      </strong>
    </div>
  );
}

/* =========================================
   SMA PRIMARY METRIC
========================================= */

function PrimaryMetric({ label, value, unavailable }) {
  return (
    <div className="pacer-primary-metric">
      <strong>
        {formatCount(value, unavailable)}
      </strong>

      <span>{label}</span>
    </div>
  );
}

/* =========================================
   MAIN HEADER
========================================= */

function Header({ summary, lastUpdated, loading, error }) {
  const unavailable = loading
    ? "Loading"
    : error
    ? "Unavailable"
    : "";

  const connectionState = loading
    ? "loading"
    : error
    ? "error"
    : "connected";

  const updateDate = lastUpdated
    ? new Date(lastUpdated)
    : null;

  const hasUpdateDate =
    updateDate &&
    Number.isFinite(updateDate.getTime());

  return (
    <header className="app-header pacer-header">
      {/* =====================================
          DASHBOARD INTRO
      ====================================== */}

      <div className="header-intro">
        <div className="header-title">
          <h1 tabIndex={-1}>
            PACER <span>Tracker</span>
          </h1>

          <p>
            Case Filing &amp; Document Monitoring Dashboard
          </p>

          <div className="pacer-title-line" />
        </div>

         
      </div>

      {/* =====================================
          TOP CAMPAIGN CARDS
      ====================================== */}

      <div
        className="pacer-dashboard-content"
        aria-busy={loading}
      >
        <div className="pacer-campaign-grid">
          <CampaignCard
            title="SMA"
            description="Social Media Addiction"
            value={summary?.smaFiled}
            icon={UsersRound}
            unavailable={unavailable}
          />

          <CampaignCard
            title="PFAS"
            description="Water Complaints"
            value={summary?.pfasFiled}
            icon={Droplet}
            unavailable={unavailable}
          />
        </div>

        {/* =====================================
            CAMPAIGN DETAIL PANELS
        ====================================== */}

        <div className="pacer-detail-grid">
          {/* SMA PANEL */}

          <section
            className="pacer-panel pacer-sma-panel"
            aria-labelledby="pacer-sma-title"
          >
            <div className="pacer-panel-heading">
              <div className="pacer-panel-title">
                <UsersRound size={28} />

                <h2 id="pacer-sma-title">
                  SMA – Social Media Addiction
                </h2>
              </div>

              <CampaignStatus
                unavailable={unavailable}
              />
            </div>

            <div className="pacer-panel-body">
              <div className="pacer-primary-metrics">
                <PrimaryMetric
                  label="Filed Cases"
                  value={summary?.smaFiled}
                  unavailable={unavailable}
                />

                <PrimaryMetric
                  label="Assigned to YGR"
                  value={summary?.smaCaseAssignmentToYgr}
                  unavailable={unavailable}
                />

                <PrimaryMetric
                  label="Filed Summons"
                  value={summary?.smaFiledSummons}
                  unavailable={unavailable}
                />
              </div>

              <div className="pacer-metric-list">
                <MetricRow
                  icon={BadgeCheck}
                  label="Confirmation Issued"
                  value={summary?.smaConfirmationIssued}
                  unavailable={unavailable}
                  success
                />

                <MetricRow
                  icon={Mail}
                  label="Email Summons to Defendant Group"
                  value={summary?.smaEmailSummons}
                  unavailable={unavailable}
                />
              </div>

              {/* LIVE METRIC COMPARISON */}

              <div className="pacer-chart-section">
                <div className="pacer-section-title">
                  <Activity size={23} />

                  <h3>Filing Overview</h3>
                </div>

                <div className="pacer-filing-chart">
                  {[
                    {
                      label: "Filed",
                      value: summary?.smaFiled
                    },
                    {
                      label: "Assigned",
                      value: summary?.smaCaseAssignmentToYgr
                    },
                    {
                      label: "Summons",
                      value: summary?.smaFiledSummons
                    },
                    {
                      label: "Confirmed",
                      value: summary?.smaConfirmationIssued
                    },
                    {
                      label: "Emailed",
                      value: summary?.smaEmailSummons
                    }
                  ].map((item) => {
                    const maxValue = Math.max(
                      Number(summary?.smaFiled) || 0,
                      Number(summary?.smaCaseAssignmentToYgr) || 0,
                      Number(summary?.smaFiledSummons) || 0,
                      Number(summary?.smaConfirmationIssued) || 0,
                      Number(summary?.smaEmailSummons) || 0,
                      1
                    );

                    const height =
                      ((Number(item.value) || 0) / maxValue) *
                      100;

                    return (
                      <div
                        className="pacer-chart-column"
                        key={item.label}
                      >
                        <div className="pacer-chart-track">
                          <div
                            className="pacer-chart-bar"
                            style={{
                              height: unavailable
                                ? "0%"
                                : `${Math.max(0, height)}%`
                            }}
                          >
                            <span className="pacer-chart-value">
                              {formatCount(
                                item.value,
                                unavailable
                              )}
                            </span>
                          </div>
                        </div>

                        <span className="pacer-chart-label">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* PFAS PANEL */}

          <section
            className="pacer-panel pacer-pfas-panel"
            aria-labelledby="pacer-pfas-title"
          >
            <div className="pacer-panel-heading">
              <div className="pacer-panel-title">
                <Droplet size={28} />

                <h2 id="pacer-pfas-title">
                  PFAS – Water Complaints
                </h2>
              </div>

              <CampaignStatus
                unavailable={unavailable}
              />
            </div>

            <div className="pacer-panel-body">
              <div className="pacer-pfas-feature">
                <div className="pacer-pfas-count">
                  <strong>
                    {formatCount(
                      summary?.pfasFiled,
                      unavailable
                    )}
                  </strong>

                  <span>Filed Cases</span>
                </div>

                {/* DECORATIVE WATER RIPPLE */}

                <div
                  className="pacer-water-art"
                  aria-hidden="true"
                >
                  <Droplet
                    className="pacer-water-drop"
                    size={58}
                    strokeWidth={1.6}
                  />

                  <div className="pacer-ripple ripple-one" />
                  <div className="pacer-ripple ripple-two" />
                  <div className="pacer-ripple ripple-three" />
                  <div className="pacer-ripple ripple-four" />
                </div>
              </div>

              <div className="pacer-section-title">
                <ClipboardList size={24} />

                <h3>Key Metrics</h3>
              </div>

              <div className="pacer-metric-list">
                <MetricRow
                  icon={Files}
                  label="Filed Cases"
                  value={summary?.pfasFiled}
                  unavailable={unavailable}
                />

                <MetricRow
                  icon={Database}
                  label="Total PFAS Records"
                  value={summary?.totalPfasRecords}
                  unavailable={unavailable}
                />

                <MetricRow
                  icon={FileText}
                  label="Remaining Unfiled Records"
                  value={
                    typeof summary?.totalPfasRecords === "number" &&
                    typeof summary?.pfasFiled === "number"
                      ? Math.max(
                          0,
                          summary.totalPfasRecords -
                            summary.pfasFiled
                        )
                      : null
                  }
                  unavailable={unavailable}
                />

                <div className="pacer-metric-row">
                  <div className="pacer-metric-label">
                    <span className="pacer-metric-icon">
                      <FileCheck size={20} />
                    </span>

                    <span>Data Connection</span>
                  </div>

                  <strong
                    className={`pacer-data-status ${
                      unavailable ? "is-unavailable" : ""
                    }`}
                  >
                    {unavailable || "Connected"}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </header>
  );
}

export default Header;