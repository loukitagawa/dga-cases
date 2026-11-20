import Header from './components/Header/Header.jsx'
import PfasTable from './components/PfasTable/PfasTable.jsx'
import SmaTable from './components/SmaTable/SmaTable.jsx'
import './style.css'

function App() {
  return (
    <main className="dashboard">
      <Header />
      <div className="page-intro">
        <div>
          <p className="eyebrow">CASE MANAGEMENT</p>
          <h1>Filed cases</h1>
          <p className="page-description">
            Case records will appear here when the backend is connected.
          </p>
        </div>
        <span className="status-pill demo-status"><i /> Backend pending</span>
      </div>
      <div className="case-tables">
        <PfasTable />
        <SmaTable />
      </div>
      <footer className="dashboard-footer">Filing case tracker</footer>
    </main>
  )
}

export default App
