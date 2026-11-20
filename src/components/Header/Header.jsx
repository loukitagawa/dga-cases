import logo from '../../assets/logo.jpg'
import './Header.css'

function Header() {
  return (
    <header className="app-header">
      <div className="header-overview">
        <div className="header-brand">
          <img className="header-logo" src={logo} alt="David Grossman & Associates logo" />
          <div>
            <p className="header-name">David Grossman &amp; Associates</p>
            <p className="header-caption">DGA case workspace</p>
          </div>
        </div>
        <section className="summary-panel" aria-label="PFAS filed cases summary">
          <div className="summary-panel-heading">
            <span className="summary-code">PFAS</span>
            <span>Filed Cases</span>
          </div>
          <strong className="summary-value">--</strong>
        </section>
        <section className="summary-panel sma-summary" aria-label="SMA case summary">
          <div className="summary-panel-heading">
            <span className="summary-code">SMA</span>
            <span>Case Summary</span>
          </div>
          <div className="summary-metrics">
            <div>
              <span>Filed Cases</span>
              <strong>--</strong>
            </div>
            <div>
              <span>Email Summons</span>
              <strong>--</strong>
            </div>
          </div>
        </section>
      </div>
    </header>
  )
}

export default Header
