import { ClipboardList } from "lucide-react";
import CaseTable from "../CaseTable/CaseTable";
import "./SmaTable.css";

const COLUMNS = [
  { key: "fullName", label: "Full Name" },
  { key: "plaintiff", label: "Plaintiff" },
  { key: "caseNumber", label: "Case number" },
  { key: "filer", label: "Filer" },
  {
    key: "shortFormComplaint",
    label: "Short Form Complaint (Dropbox)",
    checkbox: true
  },
  {
    key: "civilCoverSheet",
    label: "Civil Cover Sheet (Dropbox)",
    checkbox: true
  },
  {
    key: "ecf",
    label: "ECF (Dropbox)",
    checkbox: true
  },
  {
    key: "summons",
    label: "Summons (Dropbox)",
    checkbox: true
  },
  {
    key: "filed",
    label: "Filed",
    checkbox: true
  },
  { key: "dateFiled", label: "Date filed" },
  {
    key: "caseAssignmentToYgr",
    label: "Case Assignment to YGR",
    checkbox: true
  },
  {
    key: "filedSummons",
    label: "Filed Summons",
    checkbox: true
  },
  {
    key: "confirmationIssued",
    label: "Confirmation Issued",
    checkbox: true
  },
  {
    key: "emailSummonsToDefendantGroup",
    label: "Email Summons to Defendant Group",
    checkbox: true
  }
];

function SmaTable({ records, loading, error }) {
  return (
    <CaseTable
      id="sma"
      title="SMA"
      description="Case records and filing checklist"
      icon={ClipboardList}
      columns={COLUMNS}
      records={records}
      loading={loading}
      error={error}
    />
  );
}

export default SmaTable;
