import { useState } from "react";

import {
  BadgeCheck,
  ClipboardList,
  Droplet,
  History,
  Mail,
  TrendingUp,
  UsersRound,
  SquareCheck,
  Square,
  Clock3,
  RefreshCw
} from "lucide-react";

import useTeamActivity from "../../hooks/useTeamActivity";

import "./Header.css";

// ==========================================
// CONFIGURATION
// ==========================================

const numberFormat =
  new Intl.NumberFormat("en-US");

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

// ==========================================
// HELPERS
// ==========================================

function formatValue(value) {
  if (value == null || value === "") {
    return "—";
  }

  return typeof value === "number"
    ? numberFormat.format(value)
    : value;
}

function countValue(value) {
  if (value == null || value === "") {
    return null;
  }

  const count = Number(value);

  return Number.isFinite(count) && count >= 0
    ? count
    : null;
}

// ==========================================
// CAMPAIGN CARD
// ==========================================

function CampaignCard({
  title,
  description,
  value,
  icon: Icon
}) {
  return (
    <article className="pacer-card campaign-card">

      <span className="campaign-icon">
        <Icon aria-hidden="true" />
      </span>

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

// ==========================================
// PANEL HEADING
// ==========================================

function PanelHeading({
  title,
  icon: Icon,
  status,
  children
}) {
  return (
    <div className="pacer-panel-heading">

      <h2>
        <Icon aria-hidden="true" />
        {title}
      </h2>

      {status && (
        <span
          className="campaign-status"
          data-status={status}
        >
          {status}
        </span>
      )}

      {children}

    </div>
  );
}

// ==========================================
// METRIC ROW
// ==========================================

function MetricRow({
  label,
  value,
  icon: Icon,
  className
}) {
  return (
    <div className="metric-row">

      <dt>
        {Icon ? (
          <Icon
            className={className}
            aria-hidden="true"
          />
        ) : (
          <span aria-hidden="true" />
        )}

        {label}
      </dt>

      <dd>{formatValue(value)}</dd>

    </div>
  );
}

// ==========================================
// SMA FILING CHART
// ==========================================

function FilingChart({ summary }) {
  const filed = countValue(
    summary.smaFiled
  );

  const values = SMA_STAGES.map(
    ([, key]) => countValue(summary[key])
  );

  const ceiling = Math.max(
    125,
    Math.ceil(
      Math.max(...values) / 125
    ) * 125
  );

  const step = ceiling / 5;

  const ticks = Array.from(
    { length: 6 },
    (_, index) =>
      ceiling - index * step
  );

  return (
    <figure className="filing-chart">

      <figcaption>

        <h3>
          <TrendingUp aria-hidden="true" />
          Filing Overview
        </h3>

        <span>% of filed cases</span>

      </figcaption>

      <div className="chart-grid">

        <div
          className="chart-axis"
          aria-hidden="true"
        >
          {ticks.map(tick => (
            <span key={tick}>
              {numberFormat.format(tick)}
            </span>
          ))}
        </div>

        <ol className="chart-columns">

          {SMA_STAGES.map(([label], index) => {
            const value = values[index];

            const percent =
              filed > 0 && value !== null
                ? Math.round(
                    value / filed * 100
                  )
                : null;

            return (
              <li
                key={label}
                className="chart-column"
              >

                <strong>
                  {formatValue(value)}
                </strong>

                <div
                  className="chart-track"
                  aria-hidden="true"
                  data-empty={!value}
                >
                  <div
                    className="chart-bar"
                    style={{
                      height: `${
                        (value ?? 0) /
                        ceiling *
                        100
                      }%`
                    }}
                  />
                </div>

                <span>{label}</span>

                <small>
                  {percent === null
                    ? "—"
                    : `${percent}%`}
                </small>

              </li>
            );
          })}

        </ol>

      </div>

    </figure>
  );
}

// ==========================================
// SMA PANEL
// ==========================================

function SmaPanel({ summary, status }) {
  return (
    <section className="pacer-card monitoring-panel">

      <PanelHeading
        title="Social Media Addiction"
        icon={UsersRound}
        status={status}
      />

      <dl className="primary-metrics">

        <div>
          <dt>Filed cases</dt>
          <dd>
            {formatValue(summary.smaFiled)}
          </dd>
        </div>

        <div>
          <dt>Assigned to YGR</dt>
          <dd>
            {formatValue(
              summary.smaCaseAssignmentToYgr
            )}
          </dd>
        </div>

        <div>
          <dt>Summons filed</dt>
          <dd>
            {formatValue(
              summary.smaFiledSummons
            )}
          </dd>
        </div>

      </dl>

      <dl className="sma-metric-list">

        <MetricRow
          label="Confirmation issued"
          value={summary.smaConfirmationIssued}
          icon={BadgeCheck}
          className="metric-confirmed"
        />

        <MetricRow
          label="Email summons to defendant group"
          value={summary.smaEmailSummons}
          icon={Mail}
        />

      </dl>

      <FilingChart summary={summary} />

    </section>
  );
}

// ==========================================
// PFAS PANEL
// ==========================================

function PfasPanel({ summary, status }) {
  const filed = countValue(
    summary.pfasFiled
  );

  const total = countValue(
    summary.totalPfasRecords
  );

  const hasProgress =
    filed !== null &&
    total !== null;

  const remaining = hasProgress
    ? Math.max(0, total - filed)
    : null;

  return (
    <section className="pacer-card monitoring-panel">

      <PanelHeading
        title="Water Complaints"
        icon={Droplet}
        status={status}
      />

      <div className="pfas-feature">

        <div className="pfas-feature-count">

          <strong>
            {formatValue(summary.pfasFiled)}
          </strong>

          <span>Filed cases</span>

        </div>

        <div className="pfas-progress">

          <div className="pfas-progress-label">

            <span>
              Filed of total PFAS records
            </span>

            <strong>
              {formatValue(filed)}
              {" / "}
              {formatValue(total)}
            </strong>

          </div>

          <progress
            aria-label="PFAS cases filed"
            max={Math.max(1, total ?? 0)}
            value={hasProgress ? filed : 0}
          />

          {remaining !== null && (
            <span className="pfas-progress-note">

              {remaining === 1
                ? "1 record"
                : `${formatValue(remaining)} records`}

              {" "}not yet filed

            </span>
          )}

        </div>

      </div>

      <section className="pfas-metrics">

        <h3>
          <ClipboardList aria-hidden="true" />
          Key Metrics
        </h3>

        <dl>

          {PFAS_METRICS.map(([label, key]) => (
            <MetricRow
              key={key}
              label={label}
              value={summary[key]}
            />
          ))}

          <MetricRow
            label="Not filed"
            value={remaining}
          />

        </dl>

      </section>

    </section>
  );
}

// ==========================================
// RECENT TEAM ACTIVITY
// ==========================================

export function RecentActivity({
  pageSize
}) {
  const {
    activities,
    loading,
    error
  } = useTeamActivity();

  const [firstRecord, setFirstRecord] =
    useState(0);

  const records = Array.isArray(activities)
    ? activities
    : [];

  const limit = Math.max(
    1,
    pageSize ?? 3
  );

  const pageCount = Math.max(
    1,
    Math.ceil(records.length / limit)
  );

  const page = Math.min(
    Math.floor(firstRecord / limit),
    pageCount - 1
  );

  const shownRecords = records.slice(
    page * limit,
    (page + 1) * limit
  );

  return (
    <section className="pacer-card recent-activity">

      <PanelHeading
        title={
          pageSize
            ? "Team Activity"
            : "Recent Team Activity"
        }
        icon={History}
      >

        {!pageSize && (
          <a
            className="view-all-link"
            href="#activity"
          >
            View all
          </a>
        )}

      </PanelHeading>

      {shownRecords.length > 0 ? (

        <ul className="team-activity-list">

          {shownRecords.map((activity, index) => {
            const checked =
              activity.action === "Checked";

            return (
              <li
                key={activity.id ?? index}
                className="team-activity-item"
              >

                {/* CHECKBOX ICON */}

                <div
                  className={`checkbox-activity-icon ${
                    checked
                      ? "is-checked"
                      : "is-unchecked"
                  }`}
                >

                  {checked ? (
                    <SquareCheck aria-hidden="true" />
                  ) : (
                    <Square aria-hidden="true" />
                  )}

                </div>

                {/* ACTIVITY INFORMATION */}

                <div className="team-activity-content">

                  {/* RECORD NAME */}

                  <strong
                    className="team-activity-title"
                    title={activity.recordName}
                  >
                    {activity.recordName ||
                      "Unnamed record"}
                  </strong>

                  {/* CATEGORY AND CHECKBOX FIELD */}

                  <span className="team-activity-field">

                    <span className="activity-category">
                      {activity.sheet}
                    </span>

                    <span
                      className="activity-field-name"
                      title={activity.field}
                    >
                      {activity.field}
                    </span>

                  </span>

                  {/* CHECKBOX STATUS */}

                  <span className="team-activity-description">

                    <span
                      className={
                        checked
                          ? "activity-checked-text"
                          : "activity-unchecked-text"
                      }
                    >
                      {activity.action}
                    </span>

                    {" · Cell "}
                    {activity.cell}

                  </span>

                </div>

                {/* ACTIVITY TIMESTAMP */}

                <div className="team-activity-date">

                  <Clock3 aria-hidden="true" />

                  <span>{activity.date}</span>

                </div>

              </li>
            );
          })}

        </ul>

      ) : (

        <div className="activity-empty">

          <History aria-hidden="true" />

          <strong>

            {loading
              ? "Loading activity..."
              : error
              ? "Activity unavailable"
              : "No recent activity"}

          </strong>

          {!loading && !error && (
            <p>
              Checkbox updates will appear here.
            </p>
          )}

          {error && (
            <p>{String(error)}</p>
          )}

        </div>

      )}

      {/* PAGINATION */}

      {pageSize && pageCount > 1 && (

        <nav
          className="table-pagination field-pagination"
          aria-label="Activity pagination"
        >

          <button
            type="button"
            disabled={page === 0}
            onClick={() =>
              setFirstRecord(
                (page - 1) * limit
              )
            }
          >
            Previous
          </button>

          <span aria-live="polite">
            Page {page + 1} of {pageCount}
          </span>

          <button
            type="button"
            disabled={page === pageCount - 1}
            onClick={() =>
              setFirstRecord(
                (page + 1) * limit
              )
            }
          >
            Next
          </button>

        </nav>

      )}

      {/* REFRESH STATUS */}

      <div className="team-activity-footer">

        <RefreshCw
          aria-hidden="true"
          className={
            loading ? "activity-spinning" : ""
          }
        />

        <span>

          {error
            ? "Activity connection unavailable"
            : loading
            ? "Connecting..."
            : "Automatic refresh every 15 seconds"}

        </span>

      </div>

    </section>
  );
}

// ==========================================
// MAIN HEADER
// ==========================================

export default function Header({
  summary,
  loading,
  error
}) {
  const values =
    loading || error
      ? {}
      : summary ?? {};

  const status = loading
    ? "Loading"
    : error
    ? "Unavailable"
    : "Active";

  return (
    <div
      className="pacer-home"
      aria-busy={loading}
    >

      {/* HEADER BANNER */}

      <header className="pacer-card header-intro">

        <h1 tabIndex={-1}>
          PACER <span>Tracker</span>
        </h1>

        <p>
          Case Filing and Document Monitoring
        </p>

      </header>

      {/* CAMPAIGN CARDS */}

      <div className="campaign-grid">

        <CampaignCard
          title="SMA"
          description="Social Media Addiction"
          value={values.smaFiled}
          icon={UsersRound}
        />

        <CampaignCard
          title="PFAS"
          description="Water Complaints"
          value={values.pfasFiled}
          icon={Droplet}
        />

      </div>

      {/* MONITORING PANELS */}

      <div className="monitoring-grid">

        <SmaPanel
          summary={values}
          status={status}
        />

        <PfasPanel
          summary={values}
          status={status}
        />

      </div>

      <RecentActivity />

    </div>
  );
}
