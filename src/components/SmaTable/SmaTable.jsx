import './SmaTable.css'

function SmaTable() {
  return (
    <section className="case-table-card sma-table-card" aria-labelledby="sma-heading">
      <div className="case-table-heading">
        <div className="case-table-title">
          <span className="case-table-symbol">SM</span>
          <div>
            <h2 id="sma-heading">SMA</h2>
            <p>Filed case records</p>
          </div>
        </div>
        <span className="table-record-label">Awaiting records</span>
      </div>
      <div className="table-scroll">
        <table className="case-table" aria-label="SMA filed cases">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Case number</th>
              <th scope="col">Date filed</th>
              <th scope="col">Filer</th>
              <th scope="col">Email</th>
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
              <td>--</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SmaTable
