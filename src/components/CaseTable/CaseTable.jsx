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

function CaseTable({ id, title, description, icon: Icon, columns, records = [], loading, error, viewport }) {
  const [firstRecord, setFirstRecord] = useState(0);
  const [firstField, setFirstField] = useState(0);
  const [rowLimit, setRowLimit] = useState(PAGE_SIZES[0]);

  const fieldsPerPage = Math.max(1, Math.floor(viewport.width / 136) - 1);
  const fieldPageCount = Math.ceil((columns.length - 1) / fieldsPerPage);
  const fieldPage = Math.min(Math.floor(firstField / fieldsPerPage), fieldPageCount - 1);
  const fieldOffset = fieldPage * fieldsPerPage;
  const visibleColumns = [columns[0], ...columns.slice(fieldOffset + 1, fieldOffset + 1 + fieldsPerPage)];
  const footerSpace = viewport.width < 540 ? 235 : 175;
  const rowCapacity = Math.min(100, Math.max(1, Math.floor((viewport.height - footerSpace) / 55)));
  const rowsPerPage = Math.min(rowLimit, rowCapacity);
  const availableSizes = [...new Set([...PAGE_SIZES.filter((size) => size <= rowCapacity), rowCapacity])];

  const totalRecords = records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const page = Math.min(Math.floor(firstRecord / rowsPerPage) + 1, totalPages);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
  const pageRecords = records.slice(startIndex, endIndex);
  const placeholderCount = rowsPerPage - pageRecords.length;
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - MAX_VISIBLE_PAGES + 1));
  const visiblePages = Array.from(
    { length: Math.min(MAX_VISIBLE_PAGES, totalPages) },
    (_, index) => firstPage + index
  );
  const totalLabel = countFormatter.format(totalRecords);
  const rowsLabelId = id + "-rows-per-page";
  const titleId = id + "-title";

  function goToPage(nextPage) {
    setFirstRecord((nextPage - 1) * rowsPerPage);
  }

  return (
    <section className={`pacer-card case-table-card ${id}-table-card`} aria-labelledby={titleId}>
      <div className="case-table-heading header-intro tv-header-intro">
        <div className="case-table-title tv-header-copy">
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
        <div className="tv-banner-line" aria-hidden="true" />
      </div>

      {totalRecords > 0 ? (
        <>
          <table className="case-table" aria-labelledby={titleId}>
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.key} scope="col">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((record, index) => (
                <tr key={record.rowNumber ?? startIndex + index}>
                  {visibleColumns.map((column) => (
                    <td key={column.key} className={column.key === "caseNumber" ? "case-number" : undefined}>
                      {column.checkbox ? (
                        <RecordStatus complete={record[column.key]} />
                      ) : (
                        <span className="case-table-cell-value" title={record[column.key] || undefined}>
                          {record[column.key] || "\u2014"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {Array.from({ length: placeholderCount }, (_, index) => (
                <tr key={`placeholder-${page}-${index}`} className="case-table-placeholder" aria-hidden="true">
                  {visibleColumns.map((column) => <td key={column.key} />)}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-pagination">
            <span aria-live="polite">
              {countFormatter.format(startIndex + 1)}&ndash;{countFormatter.format(endIndex)} of {totalLabel} records
            </span>
            <nav className="pagination-controls" aria-label={`${title} pagination`}>
              <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}>
                Previous
              </button>
              <div className="pagination-pages">
                {visiblePages.map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={page === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
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
                    setRowLimit(Number(event.target.value));
                    setFirstRecord(0);
                  }}
                >
                  {[...new Set([...availableSizes, rowsPerPage])].sort((a, b) => a - b).map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </div>
            </div>
          </div>
          {fieldPageCount > 1 && (
            <nav className="table-pagination field-pagination" aria-label={`${title} field groups`}>
              <button type="button" disabled={fieldPage === 0} onClick={() => setFirstField(fieldOffset - fieldsPerPage)}>Previous fields</button>
              <span aria-live="polite">Fields {fieldPage + 1} of {fieldPageCount}</span>
              <button type="button" disabled={fieldPage === fieldPageCount - 1} onClick={() => setFirstField(fieldOffset + fieldsPerPage)}>Next fields</button>
            </nav>
          )}
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
