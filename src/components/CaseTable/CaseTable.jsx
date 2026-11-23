import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const PAGE_SIZES = [10, 25, 50, 100];
const MAX_VISIBLE_PAGES = 5;
const countFormatter = new Intl.NumberFormat("en-US");

function RecordStatus({ complete }) {
  return (
    <span className={complete ? "record-status is-complete" : "record-status is-pending"}>
      {complete && <Check size={13} aria-hidden="true" />}
      {complete ? "Completed" : "Pending"}
    </span>
  );
}

function CaseTable({ id, title, description, icon: Icon, columns, records = [], loading, error }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZES[0]);

  const totalRecords = records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - MAX_VISIBLE_PAGES + 1));
  const visiblePages = Array.from(
    { length: Math.min(MAX_VISIBLE_PAGES, totalPages) },
    (_, index) => firstPage + index
  );
  const totalLabel = countFormatter.format(totalRecords);
  const rowsLabelId = id + "-rows-per-page";
  const titleId = id + "-title";

  return (
    <section className={`case-table-card ${id}-table-card`} aria-labelledby={titleId}>
      <div className="case-table-heading">
        <div className="case-table-title">
          <span className="case-table-symbol">
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <h1 id={titleId} tabIndex={-1}>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        <span className="table-record-label">
          {loading ? "Loading" : error ? "Unavailable" : `${totalLabel} ${totalRecords === 1 ? "record" : "records"}`}
        </span>
      </div>

      {totalRecords > 0 ? (
        <>
          <div className="table-scroll" tabIndex={0} role="region" aria-label={`${title} case table`}>
            <table className="case-table" aria-labelledby={titleId}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} scope="col">{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.slice(startIndex, endIndex).map((record, index) => (
                  <tr key={record.rowNumber ?? startIndex + index}>
                    {columns.map((column) => (
                      <td key={column.key} className={column.key === "caseNumber" ? "case-number" : undefined}>
                        {column.checkbox ? (
                          <RecordStatus complete={record[column.key]} />
                        ) : (
                          record[column.key] || "\u2014"
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-pagination">
            <span aria-live="polite">
              {countFormatter.format(startIndex + 1)}&ndash;{countFormatter.format(endIndex)} of {totalLabel} records
            </span>
            <nav className="pagination-controls" aria-label={`${title} pagination`}>
              <button type="button" onClick={() => setCurrentPage(page - 1)} disabled={page === 1}>
                Previous
              </button>
              <div className="pagination-pages">
                {visiblePages.map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={page === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setCurrentPage(page + 1)} disabled={page === totalPages}>
                Next
              </button>
            </nav>

            <div className="table-page-size">
              <label htmlFor={rowsLabelId}>Rows per page</label>
              <div className="table-page-size-control">
                <select
                  id={rowsLabelId}
                  value={rowsPerPage}
                  onChange={(event) => {
                    setRowsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="table-empty" role="status">
          {loading ? `Loading ${title} records\u2026` : error ? `${title} records are unavailable.` : `No ${title} records found.`}
        </p>
      )}
    </section>
  );
}

export default CaseTable;
