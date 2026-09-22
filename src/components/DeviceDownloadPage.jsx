import { useState } from "react";

import {
  ArrowLeft,
  LogOut,
  Download,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const PRESET_COUNTS = [10, 20];

function DeviceDownloadPage({ deviceId, onBack, onLogout }) {

  const device = getDeviceById(deviceId);

  // Newest reading first, already sorted by the hook.
  const { entries } = useReadingsLog();

  const [count, setCount] = useState(10);

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

  const maxAvailable = entries.length;

  const safeCount = maxAvailable === 0
    ? 0
    : Math.min(Math.max(count, 1), maxAvailable);

  const selected = entries.slice(0, safeCount);

  const handleCountChange = (event) => {
    const value = Number(event.target.value);
    setCount(Number.isNaN(value) ? 1 : value);
  };

  const handleDownload = () => {

    if (selected.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Sparish Water Quality Report", 14, 18);

    doc.setFontSize(11);
    doc.text(`Device: ${device.name} (${device.id})`, 14, 27);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);
    doc.text(`Showing last ${selected.length} reading(s)`, 14, 39);

    const rows = selected.map((entry) => {

      const status = evaluateOverall(entry);

      return [
        formatDate(entry.timestamp),
        formatTime(entry.timestamp),
        entry.ph,
        entry.tds,
        entry.turbidity,
        entry.temperature,
        status === "safe" ? "Safe" : "Unsafe",
      ];
    });

    autoTable(doc, {
      startY: 46,
      head: [[
        "Date",
        "Time",
        "pH",
        `TDS (${THRESHOLDS.tds.unit})`,
        `Turbidity (${THRESHOLDS.turbidity.unit})`,
        `Temp (${THRESHOLDS.temperature.unit})`,
        "Status",
      ]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [24, 104, 199] },
    });

    const safeName = device.name.replace(/\s+/g, "_");
    doc.save(`${safeName}_last${selected.length}_readings.pdf`);
  };

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

            <p className="sub-eyebrow">DOWNLOAD DATA</p>

            <h1>{device.name}</h1>

            <div className="device-detail-meta">
              <span className="device-item-id">{device.id}</span>
            </div>

          </div>

        </header>


        {/* Download controls */}

        <div className="download-panel">

          <p className="download-count-label">
            Number of most recent readings to include
          </p>

          <div className="download-count-row">

            <div className="download-count-presets">

              {PRESET_COUNTS.map((preset) => (

                <button
                  key={preset}
                  type="button"
                  className={`download-preset-button ${
                    count === preset ? "download-preset-button-active" : ""
                  }`}
                  onClick={() => setCount(preset)}
                >
                  Last {preset}
                </button>

              ))}

            </div>

            <input
              type="number"
              min={1}
              max={maxAvailable || 1}
              value={count}
              onChange={handleCountChange}
              className="download-count-input"
            />

          </div>

          <p className="download-availability-note">
            {maxAvailable === 0
              ? "No readings logged yet — visit Current Status for this device first, then come back here."
              : `${maxAvailable} reading(s) available. This will download the ${safeCount} most recent.`}
          </p>

          <button
            type="button"
            className="download-pdf-button"
            onClick={handleDownload}
            disabled={selected.length === 0}
          >
            <Download size={17} />
            Download PDF
          </button>

        </div>

      </main>

    </div>
  );
}

export default DeviceDownloadPage;