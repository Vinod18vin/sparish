// Reference ranges shown on each parameter card, and used to decide
// whether an individual reading is safe or unsafe.
//
// These are kept in sync with the ESP32 firmware's own safety logic
// (see readSensors() in the .ino file).
export const THRESHOLDS = {
  ph: {
    label: "pH Level",
    unit: "",
    min: 6.5,
    max: 8.5,
  },
  tds: {
    label: "TDS",
    unit: "ppm",
    min: 0,
    max: 300, // matches the ESP32's tdsSafe range
  },
  turbidity: {
    label: "Turbidity",
    unit: "NTU",
    min: 0,
    max: 5,
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    min: 20,
    max: 35, // matches the ESP32's tempSafe range
  },
};

// Per-parameter safe/unsafe check — used by each ParameterCard to
// color itself and show its own "Safe"/"Unsafe" pill.
export function evaluateParam(paramKey, value) {
  const threshold = THRESHOLDS[paramKey];

  if (!threshold || value === undefined || value === null) {
    return "unsafe";
  }

  return value >= threshold.min && value <= threshold.max
    ? "safe"
    : "unsafe";
}

// Overall device status shown in the big banner at the top of the
// device detail page.
//
// This intentionally mirrors the ESP32 firmware's decision logic:
// only pH, TDS and temperature count toward the overall verdict.
// Turbidity still gets its own card and its own Safe/Unsafe pill
// above, but — same as on the firmware and LCD — it does NOT affect
// whether the water is declared "safe" overall.
export function evaluateOverall(latest) {
  const phSafe = evaluateParam("ph", latest.ph) === "safe";
  const tdsSafe = evaluateParam("tds", latest.tds) === "safe";
  const tempSafe = evaluateParam("temperature", latest.temperature) === "safe";

  return phSafe && tdsSafe && tempSafe ? "safe" : "unsafe";
}