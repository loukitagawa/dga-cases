import './PfasTable.css'

function PfasTable() {
  return (
    <section className="case-table-card pfas-table-card" aria-labelledby="pfas-heading">
      <div className="case-table-heading">
        <div className="case-table-title">
          <span className="case-table-symbol">PF</span>
          <div>
            <h2 id="pfas-heading">PFAS</h2>
            <p>Filed case records</p>
          </div>
        </div>
        <span className="table-record-label">Awaiting records</span>
      </div>
      <div className="table-scroll">
        <table className="case-table" aria-label="PFAS filed cases">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Case number</th>
              <th scope="col">Date filed</th>
              <th scope="col">Filer</th>
              <th scope="col">Drop box uploaded</th>
            </tr>
          </thead>
          <tbody>
            <tr className="placeholder-row">
              <td>--</td>
              <td>--</td>
              <td>--</td>
              <td>--</td>
              <td>--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default PfasTable
