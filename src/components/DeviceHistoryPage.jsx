import {
  ArrowLeft,
  LogOut,
  Trash2,
} from "lucide-react";

import sparishLogo from "../assets/sparish-logo.png";
import { getDeviceById } from "../data/mockDevices";
import { THRESHOLDS, evaluateOverall } from "../data/thresholds";
import { useReadingsLog } from "../hooks/useReadingsLog";


function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString();
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}

function DeviceHistoryPage({ deviceId, onBack, onLogout }) {

  const device = getDeviceById(deviceId);

  const { entries, clearLog } = useReadingsLog();

  if (!device) {

    return (
      <div className="sub-page">
        <main className="sub-main">
          <p>Device not found.</p>
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={17} />
            Back to Devices
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="sub-page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <nav className="sub-navbar">

        <div className="sub-navbar-inner">

          <button
            className="back-button"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Back to Devices
          </button>

          <img
            src={sparishLogo}
            alt="Sparish"
            className="brand-logo brand-logo-sm sub-navbar-logo"
          />

          <button
            className="logout-button"
            onClick={onLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

        </div>

      </nav>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="sub-main">

        <header className="sub-header device-detail-header">

          <div>

            <p className="sub-eyebrow">HISTORY</p>

            <h1>{device.name}</h1>

            <div className="device-detail-meta">
              <span className="device-item-id">{device.id}</span>
            </div>

          </div>

          {entries.length > 0 && (

            <button
              className="history-clear-button"
              onClick={clearLog}
            >
              <Trash2 size={15} />
              Clear history
            </button>

          )}

        </header>


        {/* Readings table */}

        {entries.length === 0 ? (

          <div className="device-list-empty">
            No readings logged yet. Readings are recorded automatically
            while the site is open and connected to the device &mdash;
            check back in a bit.
          </div>

        ) : (

          <div className="history-table-wrap">

            <table className="history-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>pH</th>
                  <th>TDS ({THRESHOLDS.tds.unit})</th>
                  <th>Turbidity ({THRESHOLDS.turbidity.unit})</th>
                  <th>Temp ({THRESHOLDS.temperature.unit})</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {entries.map((entry) => {

                  const status = evaluateOverall(entry);
                  const isSafe = status === "safe";

                  return (
                    <tr key={entry.timestamp}>
                      <td>{formatDate(entry.timestamp)}</td>
                      <td>{formatTime(entry.timestamp)}</td>
                      <td>{entry.ph}</td>
                      <td>{entry.tds}</td>
                      <td>{entry.turbidity}</td>
                      <td>{entry.temperature}</td>
                      <td>
                        <span
                          className={`param-status-pill param-status-${status}`}
                        >
                          {isSafe ? "Safe" : "Unsafe"}
                        </span>
                      </td>
                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </main>

    </div>
  );
}

export default DeviceHistoryPage;