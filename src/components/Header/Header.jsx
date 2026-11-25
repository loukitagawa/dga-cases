import {
  useState,
  useEffect,
  useRef
} from "react";

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

const numberFormat = new Intl.NumberFormat("en-US");

const ACTIVITY_ROTATION_INTERVAL = 5000;

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
// REDUCED MOTION PREFERENCE
// ==========================================

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  );

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleChange = event => {
      setReduced(event.matches);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  return reduced;
}

// ==========================================
// ANIMATED NUMBER COUNTER
// ==========================================

function AnimatedNumber({
  value,
  duration = 1200,
  className = ""
}) {
  const target = countValue(value);

  const [displayValue, setDisplayValue] =
    useState(0);

  const currentValue = useRef(0);

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (target === null) return;

    if (reducedMotion) {
      currentValue.current = target;
      setDisplayValue(target);
      return;
    }

    const startValue = currentValue.current;

    if (startValue === target) {
      setDisplayValue(target);
      return;
    }

    let animationFrame;

    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const easing =
        1 - Math.pow(1 - progress, 3);

      const nextValue = Math.round(
        startValue +
        (target - startValue) * easing
      );

      currentValue.current = nextValue;

      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(animate);
      }
    }

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, reducedMotion]);

  return (
    <span
      className={`animated-number ${className}`}
      aria-label={
        target === null
          ? "Unavailable"
          : formatValue(target)
      }
    >
      {target === null
        ? "—"
        : formatValue(displayValue)}
    </span>
  );
}

// ==========================================
// LIVE STATUS INDICATOR
// ==========================================

function LiveStatus({ status }) {
  return (
    <div
      className="tv-live-status"
      data-status={status}
    >
      <span className="tv-live-dot" />

      <span>
        {status === "Active"
          ? "Live Monitoring"
          : status === "Loading"
          ? "Connecting"
          : "Connection unavailable"}
      </span>
    </div>
  );
}

// ==========================================
// LIVE CLOCK
// ==========================================

function LiveClock() {
  const [now, setNow] = useState(
    () => new Date()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString(
    "en-US",
    {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }
  );

  const date = now.toLocaleDateString(
    "en-US",
    {
      timeZone: "America/New_York",
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );

  return (
    <div className="tv-clock">

      <Clock3 aria-hidden="true" />

      <div className="tv-clock-content">

        <strong>{time}</strong>

        <span>{date} · ET</span>

      </div>

    </div>
  );
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
    <article className="pacer-card campaign-card tv-animated-card">

      <span className="campaign-icon">
        <Icon aria-hidden="true" />
      </span>

      <div className="campaign-name">

        <h2>{title}</h2>

        <p>{description}</p>

      </div>

      <div className="campaign-count">

        <strong>
          <AnimatedNumber value={value} />
        </strong>

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

          <span className="panel-status-dot" />

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

      <dd>
        <AnimatedNumber value={value} />
      </dd>

    </div>
  );
}

// ==========================================
// ANIMATED SMA FILING CHART
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

  const [chartReady, setChartReady] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChartReady(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <figure className="filing-chart tv-filing-chart">

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

            const barHeight = chartReady
              ? (value ?? 0) / ceiling * 100
              : 0;

            return (
              <li
                key={label}
                className="chart-column"
              >

                <strong>
                  <AnimatedNumber value={value} />
                </strong>

                <div
                  className="chart-track"
                  aria-hidden="true"
                  data-empty={!value}
                >

                  <div
                    className="chart-bar tv-chart-bar"
                    style={{
                      height: `${barHeight}%`,
                      transitionDelay: `${index * 80}ms`
                    }}
                  />

                </div>

                <span>{label}</span>

                <small>

                  {percent === null
                    ? "—"
                    : (
                      <>
                        <AnimatedNumber
                          value={percent}
                        />
                        %
                      </>
                    )}

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
    <section className="pacer-card monitoring-panel tv-monitoring-panel">

      <PanelHeading
        title="Social Media Addiction"
        icon={UsersRound}
        status={status}
      />

      <dl className="primary-metrics">

        <div>
          <dt>Filed cases</dt>

          <dd>
            <AnimatedNumber
              value={summary.smaFiled}
            />
          </dd>
        </div>

        <div>
          <dt>Assigned to YGR</dt>

          <dd>
            <AnimatedNumber
              value={
                summary.smaCaseAssignmentToYgr
              }
            />
          </dd>
        </div>

        <div>
          <dt>Summons filed</dt>

          <dd>
            <AnimatedNumber
              value={summary.smaFiledSummons}
            />
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
// ANIMATED PROGRESS BAR
// ==========================================

function AnimatedProgress({
  value,
  total
}) {
  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const percent =
    value !== null &&
    total !== null &&
    total > 0
      ? Math.min(
          100,
          Math.max(0, value / total * 100)
        )
      : 0;

  return (
    <div
      className="tv-progress-track"
      role="progressbar"
      aria-label="PFAS cases filed"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={
        value !== null && total !== null
          ? Math.round(percent)
          : undefined
      }
    >

      <div
        className="tv-progress-fill"
        style={{
          width: `${ready ? percent : 0}%`
        }}
      >

        <span className="tv-progress-shine" />

      </div>

    </div>
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

  const percent =
    hasProgress && total > 0
      ? Math.round(filed / total * 100)
      : null;

  return (
    <section className="pacer-card monitoring-panel tv-monitoring-panel">

      <PanelHeading
        title="Water Complaints"
        icon={Droplet}
        status={status}
      />

      <div className="pfas-feature">

        <div className="pfas-feature-count">

          <strong>
            <AnimatedNumber
              value={summary.pfasFiled}
            />
          </strong>

          <span>Filed cases</span>

        </div>

        <div className="pfas-progress">

          <div className="pfas-progress-label">

            <span>
              Filed of total PFAS records
            </span>

            <strong>
              <AnimatedNumber value={filed} />
              {" / "}
              <AnimatedNumber value={total} />
            </strong>

          </div>

          <AnimatedProgress
            value={filed}
            total={total}
          />

          <div className="tv-progress-details">

            {remaining !== null && (
              <span className="pfas-progress-note">

                <AnimatedNumber
                  value={remaining}
                />

                {remaining === 1
                  ? " record not yet filed"
                  : " records not yet filed"}

              </span>
            )}

            {percent !== null && (
              <strong className="tv-progress-percent">

                <AnimatedNumber
                  value={percent}
                />

                % completed

              </strong>
            )}

          </div>

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
// INDIVIDUAL ACTIVITY ITEM
// ==========================================

function ActivityItem({
  activity,
  index
}) {
  const checked =
    activity.action === "Checked";

  return (
    <li
      className="team-activity-item tv-activity-item"
      style={{
        animationDelay: `${index * 70}ms`
      }}
    >

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

      <div className="team-activity-content">

        <strong
          className="team-activity-title"
          title={activity.recordName}
        >
          {activity.recordName ||
            "Unnamed record"}
        </strong>

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

      <div className="team-activity-date">

        <Clock3 aria-hidden="true" />

        <span>{activity.date}</span>

      </div>

    </li>
  );
}

// ==========================================
// AUTOMATIC ACTIVITY ROTATION
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

  const [paused, setPaused] =
    useState(false);

  const reducedMotion = useReducedMotion();

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

  const latestActivityId =
    records[0]?.id ?? null;

  const previousLatestId = useRef(null);

  // Return to newest activities when
  // a new checkbox update is detected.

  useEffect(() => {
    if (
      latestActivityId !==
      previousLatestId.current
    ) {
      previousLatestId.current =
        latestActivityId;

      setFirstRecord(0);
    }
  }, [latestActivityId]);

  // Automatically rotate activity pages
  // on the TV dashboard.

  useEffect(() => {
    if (
      pageSize ||
      paused ||
      reducedMotion ||
      loading ||
      error ||
      pageCount <= 1
    ) {
      return;
    }

    const timer = setInterval(() => {
      setFirstRecord(previous => {
        const currentPage = Math.min(
          Math.floor(previous / limit),
          pageCount - 1
        );

        const nextPage =
          (currentPage + 1) % pageCount;

        return nextPage * limit;
      });
    }, ACTIVITY_ROTATION_INTERVAL);

    return () => clearInterval(timer);

  }, [
    pageSize,
    paused,
    reducedMotion,
    loading,
    error,
    pageCount,
    limit,
    latestActivityId
  ]);

  return (
    <section
      className="pacer-card recent-activity tv-recent-activity"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget
          )
        ) {
          setPaused(false);
        }
      }}
    >

      <PanelHeading
        title={
          pageSize
            ? "Team Activity"
            : "Recent Team Activity"
        }
        icon={History}
      >

        {!pageSize && (
          <div className="tv-activity-heading-actions">

            <span className="tv-activity-live">

              <span className="tv-live-dot" />

              Live

            </span>

            <a
              className="view-all-link"
              href="#activity"
            >
              View all
            </a>

          </div>
        )}

      </PanelHeading>

      {shownRecords.length > 0 ? (

        <ul
          className="team-activity-list tv-activity-list"
          key={`${page}-${latestActivityId}`}
        >

          {shownRecords.map((activity, index) => (
            <ActivityItem
              key={activity.id ?? index}
              activity={activity}
              index={index}
            />
          ))}

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

      {/* MANUAL PAGINATION FOR ACTIVITY PAGE */}

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

      {/* AUTOMATIC ROTATION INDICATOR */}

      {!pageSize && pageCount > 1 && (

        <div className="tv-activity-pagination">

          <span>
            Showing {page * limit + 1}–
            {Math.min(
              (page + 1) * limit,
              records.length
            )} of {records.length}
          </span>

          <div className="tv-pagination-track">

            <div
              className="tv-pagination-fill"
              key={`${page}-${latestActivityId}`}
              style={{
                animationDuration:
                  `${ACTIVITY_ROTATION_INTERVAL}ms`,
                animationPlayState:
                  paused || reducedMotion ||
                  loading || error
                    ? "paused"
                    : "running"
              }}
            />

          </div>

          <span>
            {page + 1} / {pageCount}
          </span>

        </div>

      )}

      {/* CONNECTION STATUS */}

      <div className="team-activity-footer">

        <RefreshCw
          aria-hidden="true"
          className={
            loading
              ? "activity-spinning"
              : !error
              ? "tv-refresh-icon"
              : ""
          }
        />

        <span>

          {error
            ? "Activity connection unavailable"
            : loading
            ? "Connecting..."
            : "Automatic refresh every 15 seconds"}

        </span>

        {!pageSize && (
          <span className="tv-auto-scroll-label">

            {paused || reducedMotion
              ? "Rotation paused"
              : pageCount > 1
              ? "Auto rotation"
              : "Latest activity"}

          </span>
        )}

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
      className="pacer-home tv-dashboard"
      aria-busy={loading}
    >

      {/* ANIMATED HEADER BANNER */}

      <header className="pacer-card header-intro tv-header-intro">

        <div className="tv-header-copy">

          <h1 tabIndex={-1}>
            PACER <span>Tracker</span>
          </h1>

          <p>
            Case Filing and Document Monitoring
          </p>

          <LiveStatus status={status} />

        </div>
 

        <div
          className="tv-banner-line"
          aria-hidden="true"
        />

      </header>

      {/* ANIMATED CAMPAIGN CARDS */}

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

      {/* ANIMATED MONITORING PANELS */}

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

      {/* AUTOMATIC ACTIVITY ROTATION */}

      <RecentActivity />

    </div>
  );
}