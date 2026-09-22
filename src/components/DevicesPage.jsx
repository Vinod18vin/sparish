import { useState } from "react";

import {
  ArrowLeft,
  Search,
  Wifi,
  WifiOff,
  MapPin,
  ChevronRight,
  LogOut,
} from "lucide-react";

import sparishLogo from "../assets/sparish-logo.png";
import { DEVICES } from "../data/mockDevices";
import { useDeviceConnection } from "../hooks/useDeviceConnection";


function DevicesPage({
  onBack,
  onSelectDevice,
  onLogout,
  eyebrow = "CURRENT STATUS",
  title = "Devices",
  description = "Select a device to view its live parameters.",
}) {

  const [query, setQuery] = useState("");

  // There's currently one real ESP32 behind all listed devices, so its
  // live connection status is used for the status pill below instead
  // of each device's static mock "status" field. If you ever wire up
  // more than one real device with its own address, this would need
  // to become per-device instead of one shared check.
  const isOnline = useDeviceConnection();

  const filteredDevices = DEVICES.filter((device) => {

    const search = query.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      device.name.toLowerCase().includes(search) ||
      device.id.toLowerCase().includes(search) ||
      device.location.toLowerCase().includes(search)
    );
  });

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
            Back to Dashboard
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

        <header className="sub-header">

          <p className="sub-eyebrow">{eyebrow}</p>

          <h1>{title}</h1>

          <p className="sub-description">
            {description}
          </p>

        </header>


        {/* Search */}

        <div className="device-search">

          <Search size={18} className="device-search-icon" />

          <input
            type="text"
            placeholder="Search by name, ID or location"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

        </div>


        {/* Device list */}

        <div className="device-list">

          {filteredDevices.length === 0 && (

            <div className="device-list-empty">
              No devices match &ldquo;{query}&rdquo;.
            </div>

          )}

          {filteredDevices.map((device) => (

            <button
              key={device.id}
              className="device-list-item"
              onClick={() => onSelectDevice(device.id)}
            >

              <div className="device-item-icon">
                {isOnline ? (
                  <Wifi size={22} />
                ) : (
                  <WifiOff size={22} />
                )}
              </div>

              <div className="device-item-info">

                <div className="device-item-name-row">
                  <h3>{device.name}</h3>

                  <span
                    className={`status-pill status-pill-${
                      isOnline ? "online" : "offline"
                    }`}
                  >
                    <span className="status-pill-dot" />
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="device-item-meta">

                  <span className="device-item-id">{device.id}</span>

                  <span className="device-item-location">
                    <MapPin size={13} />
                    {device.location}
                  </span>

                </div>

              </div>

              <ChevronRight size={19} className="device-item-arrow" />

            </button>

          ))}

        </div>

      </main>

    </div>
  );
}

export default DevicesPage;