import {
  ArrowLeft,
  LogOut,
  MapPin,
  ExternalLink,
  Satellite,
} from "lucide-react";

import sparishLogo from "../assets/sparish-logo.png";
import { getDeviceById } from "../data/mockDevices";
import { useLiveReadings } from "../hooks/useLiveReadings";


function DeviceLocationPage({ deviceId, onBack, onLogout }) {

  const device = getDeviceById(deviceId);

  const { latest, connected } = useLiveReadings();

  const { lat, lng, gpsValid } = latest;

  const hasFix = gpsValid && lat !== null && lng !== null;

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

  const mapsLink = hasFix
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : null;

  const embedSrc = hasFix
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`
    : null;

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

            <p className="sub-eyebrow">DEVICE LOCATION</p>

            <h1>{device.name}</h1>

            <div className="device-detail-meta">
              <span className="device-item-id">{device.id}</span>
            </div>

          </div>

        </header>


        {/* Status / fix state */}

        {!connected && (

          <div className="location-status-note location-status-offline">
            <Satellite size={17} />
            Device is offline &mdash; showing the last known location, if any.
          </div>

        )}

        {connected && !hasFix && (

          <div className="location-status-note location-status-waiting">
            <Satellite size={17} />
            Waiting for a GPS fix. This can take a few minutes outdoors with
            a clear view of the sky.
          </div>

        )}


        {/* Map + link */}

        {hasFix ? (

          <div className="location-panel">

            <div className="location-map-wrap">
              <iframe
                title="Device location"
                src={embedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="location-details">

              <div className="location-coords">
                <MapPin size={17} />
                <span>
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </span>
              </div>

              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="location-maps-link"
              >
                Open in Google Maps
                <ExternalLink size={15} />
              </a>

            </div>

          </div>

        ) : (

          <div className="device-list-empty">
            No location available yet for this device.
          </div>

        )}

      </main>

    </div>
  );
}

export default DeviceLocationPage;