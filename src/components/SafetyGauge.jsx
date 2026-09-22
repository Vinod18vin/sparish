// Two-zone semicircle gauge — real green/red, a checkmark/X icon and
// label baked into each zone, and a tapered needle that swings
// between them. All the icon/label positions are placed exactly on
// the colored band's centerline radius, so they stay inside the
// colored ring instead of drifting into the white inner hole.
function SafetyGauge({ isSafe }) {

  const needleRotation = isSafe ? -45 : 45;

  return (
    <div className="safety-gauge">

      <svg viewBox="0 0 600 340" className="safety-gauge-svg">

        {/* Title */}
        <text x="300" y="28" textAnchor="middle" className="safety-gauge-title">
          WATER SAFETY FOR DRINKING
        </text>

        {/* Outer thin border arc */}
        <path
          d="M 38 310 A 262 262 0 0 1 562 310"
          fill="none"
          className="safety-gauge-border"
          strokeWidth="3"
        />

        {/* Safe (green) zone — left quarter */}
        <path
          d="M 100 310 A 200 200 0 0 1 300 110"
          fill="none"
          className="safety-gauge-zone-safe"
          strokeWidth="110"
        />

        {/* Danger (red) zone — right quarter */}
        <path
          d="M 300 110 A 200 200 0 0 1 500 310"
          fill="none"
          className="safety-gauge-zone-danger"
          strokeWidth="110"
        />

        {/* Safe icon: circle + checkmark */}
        <g>
          <circle cx="159" cy="169" r="24" className="safety-gauge-icon-ring" />
          <polyline
            points="150,170 157,177 170,161"
            className="safety-gauge-icon-mark"
          />
        </g>

        {/* Danger icon: circle + X */}
        <g>
          <circle cx="441" cy="169" r="24" className="safety-gauge-icon-ring" />
          <line x1="433" y1="161" x2="449" y2="177" className="safety-gauge-icon-mark" />
          <line x1="449" y1="161" x2="433" y2="177" className="safety-gauge-icon-mark" />
        </g>

        {/* Safe zone labels */}
        <text x="159" y="214" textAnchor="middle" className="safety-gauge-zone-label">
          SAFE
        </text>
        <line x1="124" y1="224" x2="194" y2="224" className="safety-gauge-zone-underline" />
        <text x="159" y="241" textAnchor="middle" className="safety-gauge-zone-sub">
          FOR DRINKING
        </text>

        {/* Danger zone labels */}
        <text x="441" y="214" textAnchor="middle" className="safety-gauge-zone-label">
          DANGER
        </text>
        <line x1="396" y1="224" x2="486" y2="224" className="safety-gauge-zone-underline" />
        <text x="441" y="241" textAnchor="middle" className="safety-gauge-zone-sub">
          NOT SAFE
        </text>

        {/* Needle */}
        <g
          className="safety-gauge-needle"
          style={{
            transform: `rotate(${needleRotation}deg)`,
            transformOrigin: "300px 310px",
          }}
        >
          <polygon
            points="290,280 310,280 300,160"
            className="safety-gauge-needle-shape"
          />
        </g>

        {/* Center hub */}
        <circle cx="300" cy="310" r="18" className="safety-gauge-hub" />
        <circle cx="300" cy="310" r="4" className="safety-gauge-hub-dot" />

      </svg>

      <div
        className={`safety-gauge-verdict safety-gauge-verdict-${
          isSafe ? "safe" : "unsafe"
        }`}
      >

        <strong>
          {isSafe ? "Water Safe" : "Water Unsafe"}
        </strong>

        <span>
          {isSafe
            ? "All parameters are within the reference range."
            : "One or more parameters are outside the reference range."}
        </span>

      </div>

    </div>
  );
}

export default SafetyGauge;