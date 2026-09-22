import { useState } from "react";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LoaderCircle,
  Activity,
  History,
  Download,
  MapPin,
  GitBranch,
  Mail,
  FileText,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Droplets,
  CheckCircle2,
  Gauge,
  Wifi,
} from "lucide-react";

import sparishLogo from "./assets/sparish-logo.png";
import DevicesPage from "./components/DevicesPage";
import DeviceDetailPage from "./components/DeviceDetailPage";
import DeviceHistoryPage from "./components/DeviceHistoryPage";
import DeviceDownloadPage from "./components/DeviceDownloadPage";
import DeviceLocationPage from "./components/DeviceLocationPage";

import "./App.css";


function App() {

  /* =====================================================
     LOGIN STATE
  ===================================================== */

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [error, setError] = useState("");

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);


  /* =====================================================
     VIEW / NAVIGATION STATE
     "home" -> dashboard, "devices" -> devices list,
     "device" -> single device detail,
     "history-devices" -> devices list (for history),
     "device-history" -> single device's logged readings,
     "download-devices" -> devices list (for download),
     "device-download" -> single device's PDF download page,
     "location-devices" -> devices list (for location),
     "device-location" -> single device's GPS location page
  ===================================================== */

  const [view, setView] = useState("home");
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView("home");
    setSelectedDeviceId(null);
  };

  const openDevices = (event) => {
    if (event) event.preventDefault();
    setMenuOpen(false);
    setView("devices");
  };

  const openDevice = (id) => {
    setSelectedDeviceId(id);
    setView("device");
  };

  const openHistoryDevices = (event) => {
    if (event) event.preventDefault();
    setMenuOpen(false);
    setView("history-devices");
  };

  const openDeviceHistory = (id) => {
    setSelectedDeviceId(id);
    setView("device-history");
  };

  const openDownloadDevices = (event) => {
    if (event) event.preventDefault();
    setMenuOpen(false);
    setView("download-devices");
  };

  const openDeviceDownload = (id) => {
    setSelectedDeviceId(id);
    setView("device-download");
  };

  const openLocationDevices = (event) => {
    if (event) event.preventDefault();
    setMenuOpen(false);
    setView("location-devices");
  };

  const openDeviceLocation = (id) => {
    setSelectedDeviceId(id);
    setView("device-location");
  };


  /* =====================================================
     MOBILE MENU
  ===================================================== */

  const [menuOpen, setMenuOpen] = useState(false);


  /* =====================================================
     LOGIN FUNCTION
  ===================================================== */

  const handleLogin = (event) => {

    event.preventDefault();

    setError("");
    setUsernameError(false);
    setPasswordError(false);


    const enteredUsername = username.trim();
    const enteredPassword = password.trim();


    /* Username */

    if (!enteredUsername) {

      setUsernameError(true);
      setError("Please enter your username.");

      return;
    }


    /* Password */

    if (!enteredPassword) {

      setPasswordError(true);
      setError("Please enter your password.");

      return;
    }


    /* Credentials */

    if (
      enteredUsername !== "admin" ||
      enteredPassword !== "123"
    ) {

      setError("Invalid username or password.");

      if (enteredUsername !== "admin") {
        setUsernameError(true);
      }

      if (enteredPassword !== "123") {
        setPasswordError(true);
      }

      return;
    }


    /* Correct credentials */

    setIsLoading(true);

    setTimeout(() => {

      setIsLoading(false);

      setIsLoggedIn(true);

    }, 700);
  };


  /* =====================================================
     DEVICES / DEVICE DETAIL SCREENS
  ===================================================== */

  if (isLoggedIn && view === "devices") {

    return (
      <DevicesPage
        onBack={() => setView("home")}
        onSelectDevice={openDevice}
        onLogout={handleLogout}
      />
    );
  }

  if (isLoggedIn && view === "device") {

    return (
      <DeviceDetailPage
        deviceId={selectedDeviceId}
        onBack={() => setView("devices")}
        onLogout={handleLogout}
      />
    );
  }

  if (isLoggedIn && view === "history-devices") {

    return (
      <DevicesPage
        onBack={() => setView("home")}
        onSelectDevice={openDeviceHistory}
        onLogout={handleLogout}
        eyebrow="HISTORY"
        title="Device History"
        description="Select a device to view its previous readings."
      />
    );
  }

  if (isLoggedIn && view === "device-history") {

    return (
      <DeviceHistoryPage
        deviceId={selectedDeviceId}
        onBack={() => setView("history-devices")}
        onLogout={handleLogout}
      />
    );
  }

  if (isLoggedIn && view === "download-devices") {

    return (
      <DevicesPage
        onBack={() => setView("home")}
        onSelectDevice={openDeviceDownload}
        onLogout={handleLogout}
        eyebrow="DOWNLOAD DATA"
        title="Download Data"
        description="Select a device to download its readings as a PDF."
      />
    );
  }

  if (isLoggedIn && view === "device-download") {

    return (
      <DeviceDownloadPage
        deviceId={selectedDeviceId}
        onBack={() => setView("download-devices")}
        onLogout={handleLogout}
      />
    );
  }

  if (isLoggedIn && view === "location-devices") {

    return (
      <DevicesPage
        onBack={() => setView("home")}
        onSelectDevice={openDeviceLocation}
        onLogout={handleLogout}
        eyebrow="DEVICE LOCATION"
        title="Device Location"
        description="Select a device to view its location."
      />
    );
  }

  if (isLoggedIn && view === "device-location") {

    return (
      <DeviceLocationPage
        deviceId={selectedDeviceId}
        onBack={() => setView("location-devices")}
        onLogout={handleLogout}
      />
    );
  }


  /* =====================================================
     HOME SCREEN
  ===================================================== */

  if (isLoggedIn) {

    return (
      <div className="home-page">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <nav className="home-navbar">

          <div className="navbar-inner">

            {/* Brand */}

            <a
              href="#top"
              className="home-brand"
              onClick={() => setMenuOpen(false)}
            >

              <img
                src={sparishLogo}
                alt="Sparish"
                className="brand-logo brand-logo-sm"
              />

            </a>


            {/* Desktop Navigation */}

            <div className="desktop-nav">

              <a href="#current-status" onClick={openDevices}>
                <Activity size={16} />
                Current Status
              </a>

              <a href="#history" onClick={openHistoryDevices}>
                <History size={16} />
                History
              </a>

              <a href="#download" onClick={openDownloadDevices}>
                <Download size={16} />
                Download Data
              </a>

              <a href="#location" onClick={openLocationDevices}>
                <MapPin size={16} />
                Device Location
              </a>

            </div>


            {/* Logout */}

            <button
              className="logout-button"
              onClick={handleLogout}
            >

              <LogOut size={16} />

              <span>
                Logout
              </span>

            </button>


            {/* Mobile Menu */}

            <button
              className="mobile-menu-button"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              aria-label="Toggle navigation"
            >

              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}

            </button>

          </div>


          {/* Mobile Navigation */}

          {menuOpen && (

            <div className="mobile-nav">

              <a
                href="#current-status"
                onClick={openDevices}
              >
                <Activity size={18} />
                Current Status
              </a>

              <a
                href="#history"
                onClick={openHistoryDevices}
              >
                <History size={18} />
                History
              </a>

              <a
                href="#download"
                onClick={openDownloadDevices}
              >
                <Download size={18} />
                Download Data
              </a>

              <a
                href="#location"
                onClick={openLocationDevices}
              >
                <MapPin size={18} />
                Device Location
              </a>

              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          )}

        </nav>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main
          className="home-main"
          id="top"
        >

          {/* Hero */}

          <section className="home-hero">

            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              LIVE MONITORING &middot; UNIT SP-014
            </div>

            <div className="tick-rule hero-tick" />

            <div className="hero-icon">
              <Droplets size={30} />
            </div>


            <div className="online-badge">

              <CheckCircle2 size={15} />

              System Online

            </div>


            <h1>
              Welcome back to your
              <span>
                Real-Time Water Quality System
              </span>
            </h1>

          </section>


          {/* =================================================
              FEATURE CARDS
          ================================================= */}

          <section className="feature-section">

            <div className="feature-grid">


              {/* Current Status */}

              <a
                href="#current-status"
                className="feature-card"
                onClick={openDevices}
              >

                <div className="card-top">

                  <div className="card-icon">
                    <Activity size={22} />
                  </div>

                  <span className="card-tag">REAL-TIME</span>

                </div>

                <div className="card-content">

                  <h2>
                    Current Status
                  </h2>

                  <p>
                    View real-time water quality
                    parameters and system status.
                  </p>

                </div>

                <div className="card-arrow">
                  <ArrowRight size={18} />
                </div>

              </a>


              {/* History */}

              <a
                href="#history"
                className="feature-card"
                onClick={openHistoryDevices}
              >

                <div className="card-top">

                  <div className="card-icon">
                    <History size={22} />
                  </div>

                  <span className="card-tag">ARCHIVE</span>

                </div>

                <div className="card-content">

                  <h2>
                    History
                  </h2>

                  <p>
                    Review previous readings and
                    analyze historical water data.
                  </p>

                </div>

                <div className="card-arrow">
                  <ArrowRight size={18} />
                </div>

              </a>


              {/* Download */}

              <a
                href="#download"
                className="feature-card"
                onClick={openDownloadDevices}
              >

                <div className="card-top">

                  <div className="card-icon">
                    <Download size={22} />
                  </div>

                  <span className="card-tag">EXPORT</span>

                </div>

                <div className="card-content">

                  <h2>
                    Download Data
                  </h2>

                  <p>
                    Export your water quality
                    records for further analysis.
                  </p>

                </div>

                <div className="card-arrow">
                  <ArrowRight size={18} />
                </div>

              </a>


              {/* Location */}

              <a
                href="#location"
                className="feature-card"
                onClick={openLocationDevices}
              >

                <div className="card-top">

                  <div className="card-icon">
                    <MapPin size={22} />
                  </div>

                  <span className="card-tag">GEO</span>

                </div>

                <div className="card-content">

                  <h2>
                    Device Location
                  </h2>

                  <p>
                    View the location and details
                    of your water quality device.
                  </p>

                </div>

                <div className="card-arrow">
                  <ArrowRight size={18} />
                </div>

              </a>


            </div>

          </section>


          {/* =================================================
              INFORMATION STRIP
          ================================================= */}

          <section className="info-strip">

            <div className="info-strip-inner">

              <div className="info-item">

                <Gauge size={19} />

                <div>
                  <strong>
                    Smart Water Monitoring
                  </strong>

                  <span>
                    Real-time data at your fingertips
                  </span>
                </div>

              </div>


              <div className="info-divider" />


              <div className="info-item">

                <Wifi size={19} />

                <div>
                  <strong>
                    System Ready
                  </strong>

                  <span>
                    Monitoring system is active
                  </span>
                </div>

              </div>

            </div>

          </section>

        </main>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="home-footer">

          <div className="tick-rule footer-tick" />

          <div className="footer-inner">


            {/* Footer Brand */}

            <div className="footer-brand">

              <div className="footer-logo">

                <img
                  src={sparishLogo}
                  alt="Sparish"
                  className="brand-logo brand-logo-sm"
                />

              </div>

              <p>
                Smart Real-Time Water Quality System
              </p>

              <small>
                Monitor. Analyze. Understand.
              </small>

            </div>


            {/* Quick Links */}

            <div className="footer-column">

              <h3>
                Quick Links
              </h3>

              <a href="#current-status" onClick={openDevices}>
                Current Status
              </a>

              <a href="#history" onClick={openHistoryDevices}>
                History
              </a>

              <a href="#download" onClick={openDownloadDevices}>
                Download Data
              </a>

              <a href="#location" onClick={openLocationDevices}>
                Device Location
              </a>

            </div>


            {/* Contact */}

            <div className="footer-column">

              <h3>
                Connect
              </h3>

              <a href="#contact">
                <Mail size={15} />
                Contact
              </a>

              <a href="#github">
                <GitBranch size={15} />
                GitHub
              </a>

              <a href="#documentation">
                <FileText size={15} />
                Documentation
              </a>

            </div>


          </div>


          <div className="footer-bottom">

            <span>
              &copy; 2026 Sparish. All rights reserved.
            </span>

            <span>
              Smart Water Monitoring Platform
            </span>

          </div>

        </footer>

      </div>
    );
  }


  /* =====================================================
     LOGIN SCREEN
  ===================================================== */

  return (
    <div className="login-page">

      {/* =================================================
          BRAND PANEL (left, desktop only)
      ================================================= */}

      <aside className="login-panel-brand">

        <div className="panel-brand-top">

          <div className="panel-logo-chip">

            <img
              src={sparishLogo}
              alt="Sparish"
              className="brand-logo brand-logo-lg"
            />

          </div>

        </div>

        <div className="panel-copy">

          <p className="panel-eyebrow">
            WATER QUALITY MONITORING
          </p>

          <h2>
            Instrumentation you can trust,
            readings you can act on.
          </h2>

          <p className="panel-sub">
            Sign in to track live sensor data, review
            historical trends and manage every
            connected device from a single console.
          </p>

        </div>

        <div className="tick-rule panel-tick" />

        <div className="panel-readouts">

          <div className="readout">
            <span className="readout-label">pH LEVEL</span>
            <span className="readout-value">7.2</span>
          </div>

          <div className="readout">
            <span className="readout-label">TURBIDITY</span>
            <span className="readout-value">1.4 <em>NTU</em></span>
          </div>

          <div className="readout">
            <span className="readout-label">TDS</span>
            <span className="readout-value">312 <em>ppm</em></span>
          </div>

        </div>

        <div className="panel-footnote">

          <span className="footnote-dot" />
          Device SP-014 &middot; last sync 2 min ago

        </div>

      </aside>


      {/* =================================================
          FORM PANEL (right)
      ================================================= */}

      <main className="login-panel-form">

        <div className="login-form-inner">

          {/* Mobile-only brand */}

          <div className="mobile-brand">

            <img
              src={sparishLogo}
              alt="Sparish"
              className="brand-logo brand-logo-sm"
            />

          </div>


          <section className="welcome-section">

            <h2>
              Welcome back
            </h2>

            <p>
              Login to continue to your dashboard
            </p>

          </section>


          <form onSubmit={handleLogin}>


            {/* Username */}

            <div className="input-group">

              <label htmlFor="username">
                Username
              </label>

              <div
                className={`input-wrapper ${
                  usernameError
                    ? "input-error"
                    : ""
                }`}
              >

                <User
                  className="input-icon"
                  size={19}
                  strokeWidth={2}
                />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {

                    setUsername(event.target.value);

                    setUsernameError(false);

                    setError("");

                  }}
                  placeholder="Enter your username"
                  autoComplete="username"
                />

              </div>

            </div>


            {/* Password */}

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div
                className={`input-wrapper ${
                  passwordError
                    ? "input-error"
                    : ""
                }`}
              >

                <Lock
                  className="input-icon"
                  size={19}
                  strokeWidth={2}
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {

                    setPassword(event.target.value);

                    setPasswordError(false);

                    setError("");

                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>


            {/* Forgot Password */}

            <div className="forgot-password">

              <button type="button">
                Forgot password?
              </button>

            </div>


            {/* Error */}

            {error && (

              <div className="login-error">

                <AlertCircle size={17} />

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* Login */}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >

              {isLoading ? (

                <>
                  <LoaderCircle
                    className="loading-icon"
                    size={19}
                  />

                  Logging in...
                </>

              ) : (

                <>
                  Login
                  <ArrowRight size={17} />
                </>

              )}

            </button>

          </form>


          {/* Divider */}

          <div className="divider">

            <span></span>

            <p>
              or continue with
            </p>

            <span></span>

          </div>


          {/* Social */}

          <div className="social-login">

            <button
              type="button"
              className="social-button"
            >

              <span className="google-icon">
                G
              </span>

              Google

            </button>


            <button
              type="button"
              className="social-button"
            >

              <span className="facebook-icon">
                f
              </span>

              Facebook

            </button>

          </div>


          {/* Create account */}

          <div className="create-account">

            <p>
              Don&apos;t have an account?
            </p>

            <button type="button">
              Create account
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default App;