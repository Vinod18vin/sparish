import {
  ArrowLeft,
  LogOut,
  Wifi,
  WifiOff,
  FlaskConical,
  Layers,
  CloudFog,
  Thermometer,
} from "lucide-react";

import sparishLogo from "../assets/sparish-logo.png";
import { getDeviceById } from "../data/mockDevices";
import { evaluateOverall } from "../data/thresholds";
import { useLiveReadings } from "../hooks/useLiveReadings";
import ParameterCard from "./ParameterCard";
import SafetyGauge from "./SafetyGauge";


function DeviceDetailPage({ deviceId, onBack, onLogout }) {

  const device = getDeviceById(deviceId);

  const { history, latest, connected } = useLiveReadings();

  const overallStatus = evaluateOverall(latest);

  const isSafe = overallStatus === "safe";

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

            <p className="sub-eyebrow">DEVICE</p>

            <h1>{device.name}</h1>

            <div className="device-detail-meta">

              <span className="device-item-id">{device.id}</span>

              <span
                className={`status-pill status-pill-${
                  connected ? "online" : "offline"
                }`}
              >
                {connected ? (
                  <Wifi size={13} />
                ) : (
                  <WifiOff size={13} />
                )}
                {connected ? "Online" : "Offline"}
              </span>

            </div>

          </div>

        </header>


        {/* Safety meter */}

        <SafetyGauge isSafe={isSafe} />


        {/* Parameter cards */}

        <div className="parameter-grid">

          <ParameterCard
            paramKey="ph"
            icon={<FlaskConical size={20} />}
            series={history.ph}
            value={latest.ph}
          />

          <ParameterCard
            paramKey="tds"
            icon={<Layers size={20} />}
            series={history.tds}
            value={latest.tds}
          />

          <ParameterCard
            paramKey="turbidity"
            icon={<CloudFog size={20} />}
            series={history.turbidity}
            value={latest.turbidity}
          />

          <ParameterCard
            paramKey="temperature"
            icon={<Thermometer size={20} />}
            series={history.temperature}
            value={latest.temperature}
          />

        </div>

      </main>

    </div>
  );
}

export default DeviceDetailPage;