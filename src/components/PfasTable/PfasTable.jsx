import { Files } from "lucide-react";
import CaseTable from "../CaseTable/CaseTable";
import "./PfasTable.css";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "pwsid", label: "PWSID" },
  { key: "caseNumber", label: "Case number" },
  { key: "dateFiled", label: "Date filed" },
  { key: "filer", label: "Filer" },
  { key: "dropboxUploaded", label: "Dropbox uploaded", checkbox: true },
  { key: "filed", label: "Filed", checkbox: true }
];

function PfasTable({ records, loading, error }) {
  return (
    <CaseTable
      id="pfas"
      title="PFAS"
      description="Filed case records"
      icon={Files}
      columns={COLUMNS}
      records={records}
      loading={loading}
      error={error}
    />
  );
}

export default PfasTable;
